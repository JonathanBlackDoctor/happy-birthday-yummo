/**
 * 카톡 메신저 모달 — UI-SPEC §6.
 *
 * - PC: 화면 중앙 폰창(최대 폭 480px). 모바일: 풀스크린.
 * - 메시지는 자동 흐름(800ms 간격) + 클릭/스페이스로 다음 메시지 즉시 등장(가속).
 * - 새 메시지 등장 시 스크롤 영역이 자동으로 끝까지 따라 내려감.
 * - 단톡(group) 모드: 헤더에 룸 이름·인원, 발신자별 아바타·이름·시각·안 읽은 수 표시.
 *
 * 2026-05-08 카톡 미니게임 재설계:
 * - 기존 KAKAO_TIMER+CHOICE_KAKAO 분리 구조 → 단일 KAKAO 명령에 choices 임베드.
 * - 메시지 자동 흐름 완료 후 인라인 선택지 + 호감도 디케이 동시 시작. 선택 클릭 시 디케이 정지.
 * - 마운트 직전 BGM ID 캡처, unmount 시 자동 복귀 (다음 BGM 명령으로 자연 페이드 보장).
 *
 * 2026-05-09 룰 명확화:
 * - cmd.affectionDecay가 박혀 있으면 ReplyTimer(3초)도 동시에 마운트.
 * - 타임아웃 = 즉시 패배. late_reply_count++ + pendingEnding='END_H4_REJECT' + runtimeMode='ending'으로
 *   곧장 RejectEnding 시퀀스 진입. 사용자 답변에 의존하지 않는 강제 종결 트리거.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { HEROINES } from '@/data/characters';
import type { HeroineId, SceneCommand } from '@/engine/types';
import { isHeroineId } from '@/data/characters';
import { KakaoMessage } from './KakaoMessage';
import { ReplyTimer } from './ReplyTimer';
import { audioManager } from '@/engine/audioManager';
import { deriveKakaoMeta } from '@/engine/kakaoMeta';
import { isSelfSender } from '@/data/kakaoProfiles';

/**
 * 카톡 메시지 자동 흐름 기본 지연. settingsStore.autoAdvanceDelay가 우선이지만
 * 폴백 값으로 사용 (자연스러운 톡톡 호흡).
 */
const PER_MESSAGE_DELAY_DEFAULT_MS = 800;
/** 카톡 클릭 가속 cooldown — gameStore.USER_ADVANCE_COOLDOWN_MS와 동일 톤. */
const KAKAO_ACCEL_COOLDOWN_MS = 600;

/** 머뭇거림 시퀀스 타이밍 (KAKAO.hesitate=true일 때) — 매 메시지 등장 직전 적용. */
const HESITATE_TYPING_1_MS = 1000;
const HESITATE_PAUSE_MS = 600;
const HESITATE_TYPING_2_MS = 1000;
type HesitatePhase = 'idle' | 'typing-1' | 'pause' | 'typing-2';

type KakaoCmd = Extract<SceneCommand, { type: 'KAKAO' }>;

export function KakaoModal() {
  const cmd = useGameStore((s) => s.currentCommand);
  const currentSceneId = useGameStore((s) => s.currentSceneId);
  const closeKakao = useGameStore((s) => s.closeKakao);
  const pickChoice = useGameStore((s) => s.pickChoice);

  const isKakao = cmd?.type === 'KAKAO';
  const kakaoCmd = isKakao ? (cmd as KakaoCmd) : null;
  const hesitate = !!kakaoCmd?.hesitate;
  // 1:1 카톡(dm)은 안 읽음 1을 메시지 등장 후 0.4s 후 자동으로 사라지게(읽음 표현).
  // 명시적 unreadFadeMs가 박혀 있으면 그것 우선. 단톡(group)은 자동 적용 X(미독자 수가 의미 있음).
  const inferredMode: 'dm' | 'group' = kakaoCmd?.mode
    ?? ((kakaoCmd && new Set(kakaoCmd.messages.map((m) => m.sender)).size > 2) ? 'group' : 'dm');
  const unreadFadeMs = kakaoCmd?.unreadFadeMs ?? (inferredMode === 'dm' ? 400 : undefined);
  // 머뭇거림 시 첫 메시지부터 시퀀스 적용 → 0에서 시작. 일반 흐름은 첫 메시지 즉시 노출(1).
  const [revealed, setRevealed] = useState(hesitate ? 0 : 1);
  const [hesitatePhase, setHesitatePhase] = useState<HesitatePhase>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  // 카톡 진입 직전 BGM ID — unmount 시 복귀 (BGM 겹침/잔류 방지).
  const prevBgmIdRef = useRef<string | null>(null);

  const total = kakaoCmd?.messages.length ?? 0;
  const allShown = revealed >= total;
  const choices = kakaoCmd?.choices;
  const hasChoices = !!choices && choices.length > 0;
  const affectionDecay = kakaoCmd?.affectionDecay;
  // H4 미니게임 마커 — choices 중 하나라도 mechanism: 'h4_reply_speed'면 ReplyTimer 마운트.
  // (2026-05-09 affectionDecay 무력화 후 마운트 신호를 mechanism으로 분리.)
  const isReplySpeedGame = !!choices?.some((c) => c.mechanism === 'h4_reply_speed');
  // 선택지 임베드된 KAKAO도 메시지 흐름은 가속 가능 (사용자가 빨리 선택지 보고 답할 수 있게).
  // 머뭇거림 시퀀스(글로벌 hesitate 또는 메시지 단위 preTyping/prePause)가 박힌 KAKAO는 연출 지키기 위해 가속 비활성화.
  const hasAnyHesitateSequence = hesitate
    || !!kakaoCmd?.messages.some((m) => m.preTyping1 || m.prePause || m.preTyping2);
  const canAccelerate = !allShown && !hasAnyHesitateSequence;

  // BGM_KATALK + 이전 BGM 캡처/복귀
  useEffect(() => {
    prevBgmIdRef.current = audioManager.currentBgmId();
    audioManager.playBgm('bgm_katalk', { fade: 3, volume: 0.4 });
    return () => {
      const prev = prevBgmIdRef.current;
      if (prev && prev !== 'bgm_katalk') {
        audioManager.playBgm(prev, { fade: 2 });
      }
    };
  }, []);

  // 다음에 등장할 메시지의 머뭇거림 단계 ms 산출.
  // 메시지 단위 preTyping1/prePause/preTyping2가 우선, 미박이면 hesitate flag일 때 디폴트.
  const nextMsgSeq = useMemo(() => {
    if (!kakaoCmd || revealed >= total) return null;
    const m = kakaoCmd.messages[revealed];
    const t1 = m.preTyping1 ?? (hesitate ? HESITATE_TYPING_1_MS : 0);
    const tp = m.prePause ?? (hesitate ? HESITATE_PAUSE_MS : 0);
    const t2 = m.preTyping2 ?? (hesitate ? HESITATE_TYPING_2_MS : 0);
    return { t1, tp, t2, hasSequence: t1 > 0 || tp > 0 || t2 > 0 };
  }, [kakaoCmd, revealed, total, hesitate]);

  // KAKAO 명령 바뀌면 상태 리셋. 첫 메시지에 머뭇거림 단계가 있으면 0부터 시작.
  useEffect(() => {
    if (!kakaoCmd) return;
    const m0 = kakaoCmd.messages[0];
    const m0HasSeq = !!(m0 && (m0.preTyping1 || m0.prePause || m0.preTyping2)) || hesitate;
    setRevealed(m0HasSeq ? 0 : 1);
    setHesitatePhase('idle');
  }, [cmd, hesitate, kakaoCmd]);

  // 자동 흐름:
  //  - 시퀀스 없음: settingsStore.autoAdvanceDelay 또는 PER_MESSAGE_DELAY_DEFAULT_MS 후 메시지 +1.
  //  - 시퀀스 있음: 메시지별 (typing-1 → pause → typing-2) 단계, 0인 단계는 스킵.
  // 2026-05-10 PM 정정: 카톡도 사용자 자동진행 지연 설정을 따르게 함 (이전엔 800ms 하드코드).
  const autoAdvanceDelay = useSettingsStore((s) => s.autoAdvanceDelay);
  useEffect(() => {
    if (!isKakao || allShown || !nextMsgSeq) return;
    const { t1, tp, t2, hasSequence } = nextMsgSeq;

    if (!hasSequence) {
      const delay = autoAdvanceDelay > 0 ? autoAdvanceDelay : PER_MESSAGE_DELAY_DEFAULT_MS;
      const t = setTimeout(() => setRevealed((n) => Math.min(n + 1, total)), delay);
      return () => clearTimeout(t);
    }

    if (hesitatePhase === 'idle') {
      // 첫 단계 결정 — 0인 단계는 건너뛰고 다음 단계로
      if (t1 > 0) setHesitatePhase('typing-1');
      else if (tp > 0) setHesitatePhase('pause');
      else if (t2 > 0) setHesitatePhase('typing-2');
      else setRevealed((n) => Math.min(n + 1, total));
      return undefined;
    }
    if (hesitatePhase === 'typing-1') {
      const t = setTimeout(() => {
        if (tp > 0) setHesitatePhase('pause');
        else if (t2 > 0) setHesitatePhase('typing-2');
        else {
          setRevealed((n) => Math.min(n + 1, total));
          setHesitatePhase('idle');
        }
      }, t1);
      return () => clearTimeout(t);
    }
    if (hesitatePhase === 'pause') {
      const t = setTimeout(() => {
        if (t2 > 0) setHesitatePhase('typing-2');
        else {
          setRevealed((n) => Math.min(n + 1, total));
          setHesitatePhase('idle');
        }
      }, tp);
      return () => clearTimeout(t);
    }
    // typing-2
    const t = setTimeout(() => {
      setRevealed((n) => Math.min(n + 1, total));
      setHesitatePhase('idle');
    }, t2);
    return () => clearTimeout(t);
  }, [revealed, total, allShown, isKakao, hesitatePhase, nextMsgSeq, autoAdvanceDelay]);

  // 호감도 디케이: 메시지 자동 흐름 완료 + affectionDecay 박힌 경우 1초당 -perSecond.
  // applyCommand(FLAG_INC)는 currentCommand를 덮어 KakaoModal 자체가 cmd를 잃기 때문에
  // setState로 flags만 직접 업데이트(0~100 clamp). 토스트도 안 뜨게 의도적 우회.
  useEffect(() => {
    if (!allShown || !affectionDecay) return;
    const id = setInterval(() => {
      useGameStore.setState((s) => {
        const cur = s.flags[affectionDecay.target] ?? 0;
        const nextVal = Math.max(0, Math.min(100, cur - affectionDecay.perSecond));
        if (nextVal === cur) return s;
        return { flags: { ...s.flags, [affectionDecay.target]: nextVal } };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [allShown, affectionDecay]);

  // 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [revealed]);

  // 클릭/스페이스로 다음 메시지 즉시 호출 — 2026-05-10 PM 정정: cooldown(KAKAO_ACCEL_COOLDOWN_MS) 추가.
  // 이전엔 cooldown 없이 빠른 클릭/스페이스 연타로 모든 메시지가 즉시 노출되어 자연스러운 톡톡 호흡 깨짐.
  const lastAccelAtRef = useRef(0);
  const handleAccelerate = useCallback(() => {
    if (!canAccelerate) return;
    const now = performance.now();
    if (now - lastAccelAtRef.current < KAKAO_ACCEL_COOLDOWN_MS) return;
    lastAccelAtRef.current = now;
    setRevealed((n) => Math.min(n + 1, total));
  }, [canAccelerate, total]);

  // 자동재생 — settingsStore.autoAdvanceDelay 간격으로 메시지 가속. canAccelerate=false 시 자동 정지.
  // 닫기·선택지·H4 답장 타이머는 수동(자동 클릭 X). 일시정지 메뉴 열리면 정지.
  // 2026-05-10 PM 정정: 200ms 하드코드 → autoAdvanceDelay 사용 (사용자 자동진행 지연 설정과 동기).
  const autoPlayEnabled = useSettingsStore((s) => s.autoPlayEnabled);
  const isPauseMenuOpen = useGameStore((s) => s.isPauseMenuOpen);
  useEffect(() => {
    if (!autoPlayEnabled || !canAccelerate || isPauseMenuOpen) return undefined;
    const interval = autoAdvanceDelay > 0 ? autoAdvanceDelay : 200;
    const id = window.setInterval(() => {
      setRevealed((n) => Math.min(n + 1, total));
    }, interval);
    return () => clearInterval(id);
  }, [autoPlayEnabled, canAccelerate, total, isPauseMenuOpen, autoAdvanceDelay]);

  useEffect(() => {
    if (!canAccelerate) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleAccelerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canAccelerate, handleAccelerate]);

  const meta = useMemo(() => (kakaoCmd ? deriveKakaoMeta(kakaoCmd) : null), [kakaoCmd]);

  const headerInfo = useMemo(() => {
    if (!kakaoCmd || !meta) return { title: '카톡', subtitle: '' };
    if (meta.mode === 'group') {
      return {
        title: kakaoCmd.roomName ?? '단톡방',
        subtitle: `${meta.roomMembers}`,
      };
    }
    if (kakaoCmd.heroine && kakaoCmd.heroine in HEROINES) {
      return { title: HEROINES[kakaoCmd.heroine].name, subtitle: '' };
    }
    const firstNonSelf = kakaoCmd.messages.find((m) => !isSelfSender(m.sender));
    if (firstNonSelf && isHeroineId(firstNonSelf.sender)) {
      return { title: HEROINES[firstNonSelf.sender as HeroineId].name, subtitle: '' };
    }
    if (firstNonSelf) return { title: firstNonSelf.sender, subtitle: '' };
    return { title: '카톡', subtitle: '' };
  }, [kakaoCmd, meta]);

  // 타임아웃 = 즉시 패배. late_reply_count++ 후 ch06_h4_reject 씬으로 점프 →
  // 그 씬의 KAKAO 명령이 표준 KakaoModal(모바일 폰창)로 거절 4줄을 자연 흐름으로 표시,
  // 이어지는 ENDING 명령이 RejectEnding 후반부(fade-out → title → video → toast) 발동.
  // ReplyTimer 자체가 sfx_timer_out 재생하므로 여기선 중복 재생 X.
  const handleTimeout = useCallback(() => {
    useGameStore.setState((s) => ({
      flags: { ...s.flags, late_reply_count: s.flags.late_reply_count + 1 },
      currentCommand: null,
    }));
    void useGameStore.getState().startScene('ch06_h4_reject');
  }, []);

  if (!kakaoCmd || !meta) return null;

  const handleChoice = (idx: number) => {
    audioManager.playSfx('sfx_click');
    void pickChoice(idx);
  };

  // 그룹 헤더 표시 룰: 직전 메시지의 sender가 다르면 그룹 첫 메시지 → 헤더 표시
  // 시각 표시 룰: 다음 메시지 sender 또는 시각이 다르면 그룹 마지막 → 시각 표시
  const messageRows = kakaoCmd.messages.slice(0, revealed).map((m, idx) => {
    const prev = idx > 0 ? kakaoCmd.messages[idx - 1] : null;
    const next = idx + 1 < revealed ? kakaoCmd.messages[idx + 1] : null;
    const showSenderHeader = !prev || prev.sender !== m.sender;
    const showTime = !next || next.sender !== m.sender || meta.metas[idx].time !== meta.metas[idx + 1]?.time;
    return { m, idx, showSenderHeader, showTime };
  });

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)' }}
      onClick={canAccelerate ? handleAccelerate : undefined}
      role={canAccelerate ? 'button' : undefined}
      tabIndex={canAccelerate ? 0 : -1}
      aria-label={canAccelerate ? '클릭하여 다음 메시지' : undefined}
    >
      <div
        className="flex flex-col w-full h-full sm:w-[460px] sm:h-[760px] sm:max-h-[92vh] sm:rounded-2xl sm:shadow-2xl overflow-hidden"
        style={{ background: 'var(--kakao-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b border-text-light/20"
          onClick={canAccelerate ? handleAccelerate : undefined}
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate flex items-center gap-2">
              <span>{headerInfo.title}</span>
              {headerInfo.subtitle && (
                <span className="text-xs text-text-light font-normal">{headerInfo.subtitle}</span>
              )}
            </div>
          </div>
        </div>

        {/* 공지(고정 메시지) */}
        {kakaoCmd.pinnedNotice && (
          <div className="px-4 py-2 border-b border-text-light/10 bg-yellow-50 text-sm flex items-center gap-2">
            <span aria-hidden>📢</span>
            <span className="truncate">{kakaoCmd.pinnedNotice}</span>
          </div>
        )}

        {/* 메시지 영역 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
          {messageRows.map(({ m, idx, showSenderHeader, showTime }) => (
            <KakaoMessage
              key={idx}
              message={m}
              delayMs={0 /* 이미 revealed 인덱스로 등장 제어 */}
              showSenderHeader={meta.mode === 'group' ? showSenderHeader : !isSelfSender(m.sender) && showSenderHeader}
              time={meta.metas[idx]?.time}
              unreadCount={meta.metas[idx]?.unreadCount}
              unreadFadeMs={unreadFadeMs}
              showTime={showTime}
              isFirst={idx === 0}
              sceneId={currentSceneId}
            />
          ))}
          {/* 머뭇거림 typing 인디케이터 — 발신자 측 빈 버블로 깜박임 표현. 'pause' 단계는 표시 X(잠시 멈춤).
              버블 모양·폰트는 일반 메시지 버블과 동일(통일). 색만 typing-dot으로 옅게. */}
          {!allShown && nextMsgSeq?.hasSequence && (hesitatePhase === 'typing-1' || hesitatePhase === 'typing-2') && (
            <div className="flex justify-start mb-1 px-2" data-testid="kakao-typing-indicator">
              <div className="w-9 flex-shrink-0" />
              <div
                className="px-3 py-2 rounded-2xl"
                style={{
                  background: 'var(--kakao-bubble-other)',
                  color: 'var(--kakao-typing-dot)',
                  fontSize: 'var(--kakao-font-size)',
                  lineHeight: 1.4,
                }}
              >
                입력 중<span className="inline-block animate-pulse">...</span>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 — 메시지 자동 흐름 완료 + 임베드 choices가 있으면 인라인 선택지, 아니면 안내 + 닫기 버튼 */}
        <div className="border-t border-text-light/20 p-3">
          {/* 답장 타이머 — h4_reply_speed mechanism이 박힌 choices를 가진 카톡에서 메시지 자동 흐름 완료 시 마운트. 3초 타임아웃 = 즉시 REJECT. */}
          {allShown && hasChoices && isReplySpeedGame && (
            <div className="mb-3 flex justify-center" data-testid="kakao-reply-timer">
              <ReplyTimer onTimeout={handleTimeout} />
            </div>
          )}
          {allShown && hasChoices ? (
            <div className="flex flex-col gap-2">
              {choices!.map((c, idx) => (
                <button
                  key={`${c.text}-${idx}`}
                  type="button"
                  data-testid={`kakao-choice-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoice(idx);
                  }}
                  className="w-full px-4 py-3 text-left rounded-lg font-medium min-h-[44px] transition-colors"
                  style={{
                    background: 'var(--btn-bg)',
                    color: 'var(--btn-text)',
                  }}
                >
                  {c.text}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 justify-between">
              <div className="text-xs text-text-light">
                {allShown
                  ? '대화를 마칩니다'
                  : canAccelerate
                    ? '클릭/스페이스로 다음 메시지'
                    : '대화 진행 중...'}
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-accent text-text rounded-lg disabled:opacity-50 min-h-[44px] min-w-[44px]"
                disabled={!allShown}
                onClick={(e) => {
                  e.stopPropagation();
                  void closeKakao();
                }}
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
