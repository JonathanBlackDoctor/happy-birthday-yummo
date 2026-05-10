/**
 * 챕터 전환 회상 그래픽 — 챕터 종료 시 prev_chapter_snapshot.values → 현재 flags 값으로
 * 인물별 호감도 변화량을 온도계 채움 애니메이션 + ±N delta 라벨로 가시화.
 *
 * (라운드 #10 → #11 업그레이드: 2026-05-09)
 *
 * 단계:
 *   - intro (0~1.0s): "Chapter N — 종료" 페이드인
 *   - summary (1.0~1.4s): 챕터 요약 한 단락 페이드인 (자동 합성, 온도계 동안 유지)
 *   - therm (2.0~ ): 인물 온도계 stagger 200ms × 변화 인물 수만큼 채움
 *   - delta (therm 끝~+0.4s): ±N 라벨 페이드인
 *   - press_reveal (recap 종료 + 1.0s): "Chapter N 시작하기" 버튼 컨테이너 페이드인 (disabled)
 *   - press_enable (recap 종료 + 2.0s): 버튼 활성화 + 포커스 이동
 *
 * fallback:
 *   prev_chapter_snapshot이 null (첫 부팅 후 첫 챕터 경계 — prologue→ch01 시점 등)이거나
 *   변화 인물 entries 비어 있으면 단순 모드 ("시작하기" 단일 버튼). 새 타이밍·라벨 미적용.
 *
 * 프롤로그 → ch01 경계는 단계 분리 없이 max(1000ms, recapDur) 락만 적용.
 *
 * z-index 360: ChapterFader(350) 위, AffectionToast(400) 아래.
 * E2E 환경(navigator.webdriver / ?scene= / ?flags=)에서는 startScene이 자동 통과해 마운트되지 않음.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore, chapterTitle } from '@/stores/gameStore';
import type { AffinityTargetId, ChapterAffinitySnapshot, GameFlags, HeroineId } from '@/engine/types';
import { HEROINES } from '@/data/characters';
import { AffectionThermometer } from './affection/AffectionThermometer';
import { confirmAndResetGame } from './util/resetGame';
import { createSpring } from './affection/spring';

// 시작 버튼 타이밍 (사용자 결정 2026-05-09 라운드 #11):
//  - 일반 챕터 경계: 회상 종료 후 +1000ms 버튼 표시(disabled) → +1000ms 추가 후 활성화(enabled).
//  - 프롤로그 → ch01 경계: max(1000ms, recapDur) (이전 의도 유지, 단계 분리 미적용).
const BUTTON_REVEAL_DELAY_MS = 1000;
const BUTTON_ENABLE_DELAY_MS = 2000;
const PROMPT_UNLOCK_PROLOGUE_MS = 1000;
const INTRO_END_MS = 1000;
const SUMMARY_FADE_MS = 400;
const SUMMARY_HOLD_BEFORE_THERM_MS = 1000;
const THERM_START_OFFSET = INTRO_END_MS + SUMMARY_HOLD_BEFORE_THERM_MS; // 2000ms
const THERM_STAGGER_MS = 200;
const FILL_DUR_MS = 900;
const DELTA_FADE_MS = 400;

const NPC_NAME: Record<string, string> = {
  gyumin: '김규민',
  gyeongmin: '표경민',
  nathan: '조나단',
  wook: '정욱',
  junhyuk: '오준혁',
  mom: '엄마',
  taeho: '이태호 교수',
};

function resolveDisplay(target: AffinityTargetId): { id: string; name: string } {
  if (target === 'H1' || target === 'H2' || target === 'H3' || target === 'H4' || target === 'H5') {
    const meta = HEROINES[target as HeroineId];
    return { id: meta.id, name: meta.name };
  }
  return { id: target, name: NPC_NAME[target] ?? target };
}

interface RecapEntry {
  target: AffinityTargetId;
  prev: number;
  current: number;
  delta: number;
}

/**
 * 회상 카드 후보 추출 — 사용자 결정 2026-05-09:
 *   1) 변화량 0인 인물은 표시하지 않는다 (인지 노이즈 제거).
 *   2) 등장하지 않은 H는 met_heroines로 거른다 (?표시는 메뉴 패널에서만).
 *   3) NPC는 등장 추적이 별도로 없으므로 "이번 챕터에 호감도가 변했다 == 등장했다"로 간주.
 *      = delta !== 0 인 NPC만 표시.
 */
function buildEntries(prev: ChapterAffinitySnapshot, flags: GameFlags): RecapEntry[] {
  const targets: AffinityTargetId[] = [
    'H1', 'H2', 'H3', 'H4', 'H5',
    'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk', 'mom', 'taeho',
  ];
  const met = new Set<HeroineId>(flags.met_heroines);
  const entries: RecapEntry[] = [];
  for (const t of targets) {
    const prevVal = prev.values[t] ?? 0;
    const curVal = flags[t] ?? 0;
    const delta = curVal - prevVal;
    if (delta === 0) continue;
    const isHeroine = t === 'H1' || t === 'H2' || t === 'H3' || t === 'H4' || t === 'H5';
    if (isHeroine && !met.has(t as HeroineId)) continue;
    entries.push({ target: t, prev: prevVal, current: curVal, delta });
  }
  return entries;
}

/**
 * 한국어 조사 자동 선택 — 마지막 글자의 받침(종성) 유무로 분기.
 *   hasJongseong('윤영') = true (영의 ㅇ) → '을' / '과' / '이었다'
 *   hasJongseong('세린') = true (린의 ㄴ) → '을' / '과' / '이었다'
 *   hasJongseong('서윤') = true → '을' (서울/하정 동일)
 *   hasJongseong('하정') = true → '을'
 * 한글 음절(0xAC00~0xD7A3) 외 문자는 받침 없는 것으로 간주(영문/숫자 등).
 */
function hasJongseong(word: string): boolean {
  if (!word) return false;
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return false;
  return (last - 0xac00) % 28 !== 0;
}
const josaEulReul = (w: string) => (hasJongseong(w) ? '을' : '를');
const josaGwaWa = (w: string) => (hasJongseong(w) ? '과' : '와');
const josaIeotda = (w: string) => (hasJongseong(w) ? '이었다' : '였다');

/**
 * 챕터 요약 텍스트 자동 합성 (2026-05-09 라운드 #11):
 *   met_heroines + entries(delta!=0) + last_increment_order + 직전 챕터 타이틀만으로
 *   3인칭 한 단락 2~4문장 합성. 추가 메타데이터 없음.
 *
 * 정렬:
 *   - 양수 entry는 delta 내림차순, 동률은 last_increment_order 등장 순서 우선.
 *   - 음수 entry는 delta 오름차순(가장 큰 음수가 앞).
 */
function buildSummaryText(
  prev: ChapterAffinitySnapshot,
  flags: GameFlags,
  entries: RecapEntry[],
): string {
  const chapterLabel = chapterTitleFromPrefix(prev.chapter);
  const orderIdx = new Map<string, number>();
  flags.last_increment_order.forEach((id, i) => {
    if (!orderIdx.has(id)) orderIdx.set(id, i);
  });

  const positives = entries
    .filter((e) => e.delta > 0)
    .sort((a, b) => {
      if (b.delta !== a.delta) return b.delta - a.delta;
      const ai = orderIdx.get(a.target) ?? Number.MAX_SAFE_INTEGER;
      const bi = orderIdx.get(b.target) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  const negatives = entries
    .filter((e) => e.delta < 0)
    .sort((a, b) => a.delta - b.delta);

  const sentences: string[] = [];

  // 1. 챕터 타이틀 + 등장 히로인
  const metNames = flags.met_heroines.map((id) => HEROINES[id].name);
  if (metNames.length > 0) {
    const joined = metNames.join('·');
    sentences.push(`${chapterLabel}, 윤모는 ${joined}${josaEulReul(joined)} 만났다.`);
  } else {
    sentences.push(`${chapterLabel}, 윤모는 동기들과 또 한 번의 일상을 보냈다.`);
  }

  // 2. 가장 가까워진 대상
  if (positives.length > 0) {
    const top = positives[0];
    const name = resolveDisplay(top.target).name;
    sentences.push(`가장 가까워진 사람은 ${name}(+${top.delta})${josaIeotda(name)}.`);
  }

  // 3. 보조 +delta (2~3번째)
  if (positives.length >= 2) {
    const others = positives.slice(1, 3).map((e) => resolveDisplay(e.target).name);
    const joined = others.join('·');
    sentences.push(`${joined}${josaGwaWa(joined)}의 거리도 조금 좁혀졌다.`);
  }

  // 4. 가장 멀어진 대상
  if (negatives.length > 0) {
    const worst = negatives[0];
    const name = resolveDisplay(worst.target).name;
    sentences.push(`반면 ${name}${josaGwaWa(name)}는 살짝 어색해졌다(${worst.delta}).`);
  }

  return sentences.join(' ');
}

/**
 * sceneId → 챕터 prefix 로컬 추출 (gameStore의 비공개 chapterPrefix와 동일 로직 복제).
 * 단일 파일 변경 원칙 유지를 위해 import 대신 로컬화.
 */
function chapterPrefixLocal(sceneId: string): string {
  if (sceneId.startsWith('prologue')) return 'prologue';
  if (sceneId.startsWith('end_')) return 'end';
  const m = sceneId.match(/^(ch\d+)/);
  return m ? m[1] : sceneId;
}

/**
 * 다음 챕터 시작 버튼 라벨 — 회상 모드에서만 사용.
 * 'ch01'..'ch06' → 'Chapter 1 시작하기'..'Chapter 6 시작하기'
 * 'end'/'ending' → '에필로그 시작하기'
 * 'prologue' → '프롤로그 시작하기' (안전망)
 * 그 외 → '시작하기'
 */
function buttonLabelFor(nextSceneId: string): string {
  const prefix = chapterPrefixLocal(nextSceneId);
  if (prefix === 'prologue') return '프롤로그 시작하기';
  if (prefix === 'end' || prefix === 'ending') return '에필로그 시작하기';
  const m = prefix.match(/^ch0?(\d+)$/);
  if (m) return `Chapter ${parseInt(m[1], 10)} 시작하기`;
  return '시작하기';
}

export function ChapterTransitionRecap() {
  const awaiting = useGameStore((s) => s.awaitingChapterAdvance);
  const sceneId = useGameStore((s) => s.currentSceneId);
  const flags = useGameStore((s) => s.flags);
  const confirm = useGameStore((s) => s.confirmChapterAdvance);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [now, setNow] = useState(0);

  const prevSnap = flags.prev_chapter_snapshot;
  const entries = useMemo(
    () => (prevSnap ? buildEntries(prevSnap, flags) : []),
    [prevSnap, flags],
  );
  // hasRecap 조건 (2026-05-09 라운드 #12 정책 변경 — 프롤로그 차단 해제):
  //  - 직전 챕터 스냅샷이 있어야 함.
  //  - 프롤로그 → ch01 경계도 일반 챕터와 동일한 풀 회상으로 노출
  //    (PM 결정: 프롤로그 진행 중 호감도 변화 / 만난 히로인을 동일 시퀀스로 가시화).
  //  - 변동 인물 0명이어도 회상 표시 (요약 단락 + 인트로 + 빈 온도계 영역).
  //  - 첫 부팅(prevSceneId === '') 분기는 startScene에서 awaiting 자체 set 안 되므로 도달 안 함.
  const hasRecap = !!prevSnap;

  // 회상 가능 시 RAF 타이머 — 단계별 진행도 계산용.
  // setNow를 50ms 변화 임계로 throttle: useState updater가 동일 prev 반환 시 React가 re-render 스킵.
  // (매 프레임 setState로 인한 5.5초 × 60fps ≈ 330 렌더 부담 회피.)
  useEffect(() => {
    if (!awaiting || !hasRecap) {
      setNow(0);
      return undefined;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      setNow((prev) => (Math.abs(elapsed - prev) >= 50 ? elapsed : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [awaiting, hasRecap]);

  // 시작 버튼 타이밍 (라운드 #11):
  //  - 일반 챕터 경계 + 회상 있음: revealed = recapEnd + 1000ms, enabled = recapEnd + 2000ms.
  //  - prologue → ch01 경계: 단계 분리 없이 1000ms 락 후 동시 reveal+enable.
  //  - 회상 fallback (no-recap): 단계 분리 없음 (revealed == enabled, 컴포넌트 외 단순 모드 분기).
  useEffect(() => {
    if (!awaiting) {
      setRevealed(false);
      setEnabled(false);
      return undefined;
    }
    setRevealed(false);
    setEnabled(false);
    // recapDur — 시퀀스 종료 시점.
    //   entries.length === 0: 인트로 + 요약만 보여줌 → THERM_START_OFFSET(2000ms)에서 종료.
    //   entries.length > 0: 추가로 stagger × N + FILL + DELTA fade.
    const recapDur = !hasRecap
      ? 0
      : entries.length === 0
        ? THERM_START_OFFSET
        : THERM_START_OFFSET + entries.length * THERM_STAGGER_MS + FILL_DUR_MS + DELTA_FADE_MS;
    let revealDelay: number;
    let enableDelay: number;
    if (!hasRecap) {
      // fallback 단순 모드 (prologue → ch01 경계 포함): 짧은 락만 적용.
      revealDelay = PROMPT_UNLOCK_PROLOGUE_MS;
      enableDelay = PROMPT_UNLOCK_PROLOGUE_MS;
    } else {
      revealDelay = recapDur + BUTTON_REVEAL_DELAY_MS;
      enableDelay = recapDur + BUTTON_ENABLE_DELAY_MS;
    }
    const tReveal = window.setTimeout(() => setRevealed(true), revealDelay);
    const tEnable = window.setTimeout(() => setEnabled(true), enableDelay);
    return () => {
      clearTimeout(tReveal);
      clearTimeout(tEnable);
    };
  }, [awaiting, hasRecap, entries.length, prevSnap]);

  useEffect(() => {
    if (awaiting && enabled) buttonRef.current?.focus();
  }, [awaiting, enabled]);

  if (!awaiting) return null;

  const title = chapterTitle(sceneId);

  // fallback: 회상 데이터 없음 → 단순 챕터 시작 프롬프트
  if (!hasRecap) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-10"
        style={{ zIndex: 360 }}
        onClick={(e) => e.stopPropagation()}
        data-testid="chapter-start-prompt"
      >
        <div
          className="text-3xl md:text-5xl font-bold text-white text-center px-6 select-none"
          data-testid="chapter-start-title"
        >
          {title}
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => { if (enabled) confirm(); }}
          disabled={!enabled}
          className="px-10 py-4 bg-accent hover:bg-accent-hover text-text rounded-2xl text-xl md:text-2xl font-semibold transition-colors shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="chapter-start-button"
          aria-label="시작하기"
        >
          시작하기
        </button>
      </div>
    );
  }

  // 회상 모드
  const introOpacity = Math.min(1, now / 600);
  const introExit = Math.max(0, Math.min(1, (now - INTRO_END_MS - 200) / 400));
  const introVisible = introOpacity * (1 - introExit);

  const prevTitle = prevSnap ? chapterTitleFromPrefix(prevSnap.chapter) : '';
  const summaryText = prevSnap ? buildSummaryText(prevSnap, flags, entries) : '';
  const summaryOpacity = Math.max(0, Math.min(1, (now - INTRO_END_MS) / SUMMARY_FADE_MS));
  const buttonLabel = buttonLabelFor(sceneId);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 py-8"
      style={{ zIndex: 360, background: 'rgba(0, 0, 0, 0.0)' }}
      onClick={(e) => e.stopPropagation()}
      data-testid="chapter-transition-recap"
    >
      {/* 1단계: 직전 챕터 종료 라벨 */}
      <div
        style={{
          opacity: introVisible,
          transform: `translateY(${(1 - introVisible) * 12}px)`,
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
        className="text-2xl md:text-3xl font-bold text-white/85 tracking-widest text-center"
      >
        {prevTitle ? `${prevTitle} · 종료` : '챕터 종료'}
      </div>

      {/* 1.5단계: 챕터 요약 한 단락 (자동 합성, 인트로 페이드아웃 후 페이드인, 온도계 동안 유지) */}
      <p
        style={{
          opacity: summaryOpacity,
          transform: `translateY(${(1 - summaryOpacity) * 6}px)`,
          transition: 'opacity 250ms ease, transform 250ms ease',
          maxWidth: '720px',
        }}
        className="text-base md:text-lg leading-relaxed text-white/80 text-center px-4 select-none"
        data-testid="chapter-recap-summary"
      >
        {summaryText}
      </p>

      {/* 2~3단계: 인물 온도계 가로 정렬 + delta 라벨 */}
      <div className="flex flex-row flex-wrap items-end justify-center gap-2 md:gap-3 max-w-[1200px]">
        {entries.map((e, idx) => {
          const localStart = THERM_START_OFFSET + idx * THERM_STAGGER_MS;
          const localT = Math.max(0, now - localStart);
          const fillProgress = Math.min(1, localT / FILL_DUR_MS);
          const value = computeFillValue(e.prev, e.current, fillProgress, e.delta);
          const fillDone = fillProgress >= 1;
          const deltaOpacity = fillDone ? Math.min(1, (localT - FILL_DUR_MS) / DELTA_FADE_MS) : 0;
          const display = resolveDisplay(e.target);
          const sign = e.delta > 0 ? '+' : '';
          const deltaColor =
            e.delta > 0
              ? 'var(--toast-delta-up, #E64178)'
              : e.delta < 0
                ? 'var(--toast-delta-down, #8A6B7A)'
                : 'rgba(220,220,225,0.7)';

          return (
            <div key={e.target} className="flex flex-col items-center" style={{ minWidth: 96 }}>
              <div
                style={{
                  opacity: localT > 0 ? 1 : 0,
                  transform: `scale(${localT > 0 ? 0.65 : 0.55})`,
                  transformOrigin: 'top center',
                  height: 460 * 0.65,
                  transition: 'opacity 250ms ease, transform 250ms ease',
                }}
              >
                <AffectionThermometer
                  value={value}
                  heroineId={display.id}
                  nameLabel={display.name}
                  intensity={fillDone ? 'rich' : 'rich'}
                  phase={fillDone ? 'complete' : 'filling'}
                  pulsePhase={(localT / 1600) % 1}
                  flowPhase={(localT / 600) % 1}
                  completeAge={fillDone ? localT - FILL_DUR_MS : 0}
                  wobble={fillDone ? 0 : Math.sin(localT / 50) * Math.min(3, Math.abs(e.delta) / 4)}
                />
              </div>
              <span
                style={{
                  opacity: deltaOpacity,
                  color: deltaColor,
                  fontSize: 22,
                  fontWeight: 900,
                  textShadow: `0 0 10px ${deltaColor}88`,
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'opacity 300ms ease',
                }}
              >
                {e.delta === 0 ? '변화 없음' : `${sign}${e.delta}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4단계: 다음 챕터 제목 + 시작 버튼.
          revealed: 컨테이너 페이드인 (회상 종료 + 1초)
          enabled:  버튼 클릭 가능 + 포커스 이동 (회상 종료 + 2초) */}
      <div
        className="flex flex-col items-center gap-4 mt-4"
        style={{
          opacity: revealed ? 1 : 0,
          transition: 'opacity 400ms ease',
          pointerEvents: revealed ? 'auto' : 'none',
        }}
      >
        <div
          className="text-2xl md:text-4xl font-bold text-white text-center px-6 select-none"
          data-testid="chapter-start-title"
        >
          {title}
        </div>
        <div className="flex gap-3">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => { if (enabled) confirm(); }}
            disabled={!enabled}
            className="px-8 py-3 bg-accent hover:bg-accent-hover text-text rounded-2xl text-lg md:text-xl font-semibold transition-colors shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="chapter-start-button"
            aria-label={buttonLabel}
          >
            {buttonLabel}
          </button>
          <button
            type="button"
            onClick={confirmAndResetGame}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl text-base md:text-lg font-medium transition-colors"
            aria-label="타이틀로 돌아가기"
          >
            타이틀로
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * spring 흉내 — 마지막 1.0 부근에서 살짝 출렁이게 하는 가상 함수.
 * Recap에서는 카드별 spring 인스턴스 대신 progress-based 보간으로 충분.
 */
function computeFillValue(prev: number, current: number, p: number, delta: number): number {
  if (p <= 0) return prev;
  if (p >= 1) return current;
  // 큰 변화일수록 살짝 overshoot 흉내 — sin(p*PI) 기반의 보정.
  const a = Math.abs(delta);
  const overshoot = a >= 10 ? 0.08 : a >= 3 ? 0.04 : 0;
  const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
  const wave = Math.sin(p * Math.PI) * overshoot * Math.sign(delta);
  const base = prev + (current - prev) * eased;
  return base + (current - prev) * wave * (1 - p);
}
void createSpring; // 미사용이지만 향후 카드별 spring 도입 가능성 보존

function chapterTitleFromPrefix(prefix: string): string {
  if (prefix === 'prologue') return '프롤로그';
  if (prefix === 'ch01') return 'Chapter 1 — OT의 봄';
  if (prefix === 'ch02') return 'Chapter 2 — 카데바';
  if (prefix === 'ch03') return 'Chapter 3 — 동산';
  if (prefix === 'ch04') return 'Chapter 4 — 도서관';
  if (prefix === 'ch05') return 'Chapter 5 — 5월의 분기';
  if (prefix === 'ch06') return 'Chapter 6';
  if (prefix === 'end' || prefix === 'ending') return '에필로그';
  return prefix;
}
