/**
 * 엔딩 화면 — `pendingEnding` ID로 ENDING_CATALOG + ENDING_FLAVOR 조회 후 결정적 장면 + 명대사 + 통계 패널 표시.
 *
 * 시각 레이어 (z-index 오름차순):
 *   1. 결정적 장면 이미지 (CG 또는 BG, /img/cg|bg/{id}.webp) — REJECT/none은 미사용
 *   2. 스포트라이트 vignette (BG 케이스에만, radial-gradient)
 *   3. 어두운 보라 반투명 오버레이 (CG 0.78 / BG 0.62 / none 단색)
 *   4. 콘텐츠 (명대사 인용 + 제목 + 통계 패널 + 복귀 버튼)
 *
 * REJECT 분기:
 *   END_H4_REJECT는 RejectEnding이 8단계 시퀀스 자체 처리 (옵션 A, 2026-05-05).
 *   시퀀스 완료 후 EndingScreen 백업으로 전환되며, decisiveImage.type === 'none'으로
 *   결정적 이미지 없이 단순 어두운 배경 유지 (PM 결정 2026-05-09).
 *
 * (2026-05-09 endings-results-revamp 라운드 — PM 승인 plan 반영)
 */

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useMetaStore } from '@/stores/metaStore';
import { findEnding } from '@/data/endings';
import { ENDING_FLAVOR, resolveDecisiveImagePath } from '@/data/endingFlavor';
import { RejectEnding } from '@/ui/katalk/RejectEnding';
import { REJECT_ENDING_ID } from '@/engine/rejectLines';
import { confirmAndResetGame } from '@/ui/util/resetGame';
import { shareEndingResult } from '@/ui/util/shareEnding';
import { downloadEndingImage } from '@/ui/util/generateEndingImage';
import { EndingStatsPanel } from '@/ui/affection/EndingStatsPanel';
import { EndingStatsPanelAnimated } from '@/ui/affection/EndingStatsPanelAnimated';
import { EndingStatsPanelDefault } from '@/ui/affection/EndingStatsPanelDefault';
import { AffectionThermometer } from '@/ui/affection/AffectionThermometer';
import { computeEndingScore } from '@/engine/endingScore';
import { HEROINES } from '@/data/characters';
import {
  fetchRanking,
  isRankingEnabled,
  submitScore,
  type FetchOptions,
  type RankingEntry,
} from '@/engine/ranking';
import type { AffinityTargetId, GameFlags, HeroineId } from '@/engine/types';

const NPC_IDS_FOR_ENDING: ReadonlyArray<Exclude<AffinityTargetId, HeroineId>> = [
  'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk', 'mom', 'taeho',
];

const NPC_NAME_FOR_ENDING: Record<string, string> = {
  gyumin: '김규민',
  gyeongmin: '표경민',
  nathan: '조나단',
  wook: '정욱',
  junhyuk: '오준혁',
  mom: '엄마',
  taeho: '이태호 교수',
};

// 2026-05-10 후속 정정 #3 (사용자 신고 — "위아래로 멀리 떨어져 있음" 잔존, 근본 원인 해소):
// 핵심 발견 — `intensity='subtle'`일 때 AffectionThermometer는 SVG를 VIEW(60×280)으로 렌더링
// (line 108-109). 즉 사용된 display 크기는 460×100이 아니라 280×60.
// 이전 라운드들이 460 기준으로 wrapper size 잡아 outer 437px의 하단 171px가 빈 영역으로 누적되어
// 인물명·점수가 시각 SVG 바로 아래가 아닌 한참 멀리 떨어져 보였음.
// 해결: wrapper width/height를 60/280 기준으로 정정 + nameLabel SVG 내부 라벨 비활성(외부 표시).
const NPC_GRID_SCALE = 0.95;
const NPC_THERM_VIEW_W = 60;
const NPC_THERM_VIEW_H = 280;

export function EndingScreen() {
  const endingId = useGameStore((s) => s.pendingEnding);
  const flags = useGameStore((s) => s.flags);
  const setSetting = useSettingsStore((s) => s.set);
  // 이스터에그 토글 — PauseMenu(ESC)의 "호감도" 라벨 클릭으로 ON/OFF.
  // OFF(기본)=새 시퀀스 애니메이션, ON=액체 애니메이션(이스터에그).
  const easterEgg = useSettingsStore((s) => s.animatedEndingPanel);
  // OS prefers-reduced-motion은 무시 (PM 결정 2026-05-10: 사용자가 시스템 설정을
  // 건드리지 않고도 기본 애니메이션을 볼 수 있어야 함). 게임 내 reduceMotion 토글만 따름.
  const reducedMotion = useSettingsStore((s) => s.reduceMotion);
  const [rejectComplete, setRejectComplete] = useState(false);
  // 조연 호감도 그리드 토글 — '타이틀로 돌아가기' 버튼 옆 작은 토글로 펼침/접기 (PM 결정 2026-05-10).
  const [showNpc, setShowNpc] = useState(false);
  // 공유 결과 토스트 (텍스트+URL 공유 후 사용자 피드백)
  const [shareToast, setShareToast] = useState<string | null>(null);
  // metaStore 자동 기록 — StrictMode 이중 호출 방지 ref. endingId 변동 시 새 기록 1회만.
  const recordedEndingRef = useRef<string | null>(null);
  const recordEnding = useMetaStore((s) => s.recordEnding);

  // 온라인 랭킹 — VITE_RANKING_API_URL 미설정 시 섹션 자체가 안 보임 (isRankingEnabled false).
  const rankingEnabled = isRankingEnabled();
  const [rankNickname, setRankNickname] = useState('');
  const [rankSubmitState, setRankSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [rankSubmitError, setRankSubmitError] = useState<string | null>(null);
  const [rankFilter, setRankFilter] = useState<'all' | 'heroine' | 'ending'>('all');
  const [rankEntries, setRankEntries] = useState<RankingEntry[]>([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [myRankRecord, setMyRankRecord] = useState<{ nickname: string; finalScore: number } | null>(null);

  // TRUE 카테고리 엔딩 도달 시 hasAchievedTrueEnding 기록 (영구) — ModeSelect 다음 진입 시
  // 자동재생 잠금해제 모달 트리거. category 비-TRUE는 무시. settings는 confirmAndResetGame 후에도 유지.
  useEffect(() => {
    if (!endingId) return;
    const m = findEnding(endingId);
    if (m?.category === 'TRUE') {
      setSetting('hasAchievedTrueEnding', true);
    }
  }, [endingId, setSetting]);

  // 엔딩 점수 자동저장 — metaStore.endingHistory에 push (W5 메뉴 사이클 라운드 2026-05-09).
  // unlocked_endings에도 push(중복 X). 갤러리·기록 화면이 바로 반영.
  useEffect(() => {
    if (!endingId) return;
    if (recordedEndingRef.current === endingId) return;
    recordedEndingRef.current = endingId;
    try {
      const score = computeEndingScore(flags, endingId);
      recordEnding({
        endingId,
        grade: score.grade,
        finalScore: score.finalScore,
        savedAt: new Date().toISOString(),
      });
    } catch (e) {
      // 점수 계산 실패는 토스트/콘솔만 — 엔딩 화면 자체는 그대로 노출.
      // eslint-disable-next-line no-console
      console.warn('[EndingScreen] recordEnding 실패:', e);
    }
  }, [endingId, flags, recordEnding]);

  // 온라인 랭킹 조회 — endingId / 필터 변경 시 자동 재조회. 미설정·실패는 빈 배열.
  useEffect(() => {
    if (!rankingEnabled || !endingId) return;
    const heroine = findEnding(endingId)?.heroine ?? null;
    let cancelled = false;
    setRankLoading(true);
    const opts: FetchOptions = { limit: 10 };
    if (rankFilter === 'heroine' && heroine) opts.heroine = heroine;
    else if (rankFilter === 'ending') opts.endingId = endingId;
    void fetchRanking(opts).then((list) => {
      if (cancelled) return;
      setRankEntries(list);
      setRankLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [rankingEnabled, endingId, rankFilter]);

  const handleSubmitRanking = async () => {
    if (!endingId) return;
    const trimmed = rankNickname.trim();
    if (trimmed.length === 0) return;
    if (rankSubmitState === 'submitting' || rankSubmitState === 'done') return;
    setRankSubmitState('submitting');
    setRankSubmitError(null);
    try {
      const score = computeEndingScore(flags, endingId);
      const finalScoreInt = Math.round(score.finalScore);
      const result = await submitScore({
        nickname: trimmed,
        endingId,
        finalScore: finalScoreInt,
        grade: score.grade,
      });
      if (result.ok) {
        setRankSubmitState('done');
        setMyRankRecord({ nickname: trimmed, finalScore: finalScoreInt });
        const heroine = findEnding(endingId)?.heroine ?? null;
        const opts: FetchOptions = { limit: 10 };
        if (rankFilter === 'heroine' && heroine) opts.heroine = heroine;
        else if (rankFilter === 'ending') opts.endingId = endingId;
        const list = await fetchRanking(opts);
        setRankEntries(list);
      } else {
        setRankSubmitState('error');
        setRankSubmitError(result.error ?? '등록 실패');
      }
    } catch (e) {
      setRankSubmitState('error');
      setRankSubmitError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleShare = async () => {
    if (!endingId) return;
    try {
      const score = computeEndingScore(flags, endingId);
      const result = await shareEndingResult({
        endingId,
        grade: score.grade,
        finalScore: score.finalScore,
      });
      if (result.kind === 'shared') setShareToast('공유했습니다.');
      else if (result.kind === 'copied') setShareToast('결과가 복사되었습니다.');
      else if (result.kind === 'manual') setShareToast('결과 복사창을 열었습니다.');
      else if (result.kind === 'cancelled') setShareToast(null);
      else setShareToast('공유 실패');
      if (result.kind !== 'cancelled') {
        window.setTimeout(() => setShareToast(null), 2400);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setShareToast(`공유 실패: ${msg}`);
      window.setTimeout(() => setShareToast(null), 2400);
    }
  };

  // 2026-05-10 PM: 엔딩 결과 이미지로 저장. Canvas2D로 1080×1080 카드 생성 후 항상 a[download]로 다운로드.
  // PM 정정: 이전 share sheet 분기 제거 (PC도 Windows Share UI 떠서 다운로드 옵션 없다는 신고).
  const handleSaveImage = async () => {
    if (!endingId) return;
    setShareToast('이미지 생성 중...');
    try {
      const score = computeEndingScore(flags, endingId);
      const result = await downloadEndingImage({
        endingId,
        grade: score.grade,
        finalScore: score.finalScore,
      });
      if (result.kind === 'downloaded') setShareToast('이미지를 저장했습니다.');
      else setShareToast(`이미지 저장 실패: ${result.message}`);
      window.setTimeout(() => setShareToast(null), 2400);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setShareToast(`이미지 저장 실패: ${msg}`);
      window.setTimeout(() => setShareToast(null), 2400);
    }
  };

  if (!endingId) return null;

  // 거절 엔딩은 RejectEnding이 8단계 시퀀스 자체 처리 (옵션 A)
  if (endingId === REJECT_ENDING_ID && !rejectComplete) {
    return <RejectEnding onComplete={() => setRejectComplete(true)} />;
  }

  const meta = findEnding(endingId);
  const flavor = ENDING_FLAVOR[endingId];
  const imagePath = resolveDecisiveImagePath(flavor);
  const imageType = flavor.decisiveImage.type;
  const useDecisive = imagePath !== null;
  const isCg = imageType === 'cg';
  const isBg = imageType === 'bg';

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: useDecisive ? '#000' : 'var(--color-dark-bg)',
        color: 'var(--color-dark-text)',
        zIndex: 'var(--z-modal)',
      }}
      data-testid="ending-screen"
      data-ending-id={endingId}
    >
      {/* 1. 결정적 장면 이미지 */}
      {useDecisive && (
        <img
          src={imagePath ?? ''}
          alt=""
          loading="eager"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // BG는 한 번 더 죽여 vignette + 오버레이가 잘 작동하도록
            filter: isBg ? 'saturate(0.85) brightness(0.7)' : 'saturate(1) brightness(0.88)',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* 2. 스포트라이트 vignette — BG 케이스에만 */}
      {useDecisive && isBg && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(31,24,34,0) 0%, rgba(31,24,34,0.35) 45%, rgba(31,24,34,0.85) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 2b. BG-only 엔딩에 윈너 히로인 스프라이트 합성 (vignette + 오버레이 사이) */}
      {useDecisive && isBg && flavor.sprite && (
        <img
          src={`/img/sprites/${flavor.sprite}.webp`}
          alt=""
          loading="eager"
          decoding="async"
          style={{
            position: 'absolute',
            bottom: 0,
            right: '6%',
            height: '88%',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'bottom right',
            filter: 'drop-shadow(0 0 24px rgba(0,0,0,0.6))',
            pointerEvents: 'none',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* 3. 어두운 보라 반투명 오버레이 — 텍스트 가독성 확보 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: useDecisive
            ? isCg
              ? 'rgba(31, 24, 34, 0.78)'
              : 'rgba(31, 24, 34, 0.62)'
            : 'transparent',
          pointerEvents: 'none',
        }}
      />

      {/* 4. 콘텐츠 */}
      <div className="absolute inset-0 flex flex-col items-center justify-start overflow-y-auto py-6">
        {flavor.quote && (
          <blockquote className="mt-2 mb-3 text-center max-w-[760px] px-6">
            <p
              className="text-xl md:text-2xl italic leading-relaxed"
              style={{
                color: 'rgba(255, 248, 252, 0.92)',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
              }}
            >
              「{flavor.quote}」
            </p>
            {flavor.quoteSpeaker && (
              <footer className="text-xs opacity-70 mt-1">— {flavor.quoteSpeaker}</footer>
            )}
          </blockquote>
        )}
        <div className="text-sm tracking-widest opacity-70 mb-1 mt-1">ENDING</div>
        <h1
          className="text-5xl font-bold mb-2"
          style={{ textShadow: useDecisive ? '0 2px 18px rgba(0,0,0,0.6)' : 'none' }}
        >
          {meta?.title ?? endingId}
        </h1>
        {meta?.subtitle && (
          <div
            className="text-2xl opacity-85 mb-3"
            style={{ textShadow: useDecisive ? '0 2px 12px rgba(0,0,0,0.6)' : 'none' }}
          >
            — {meta.subtitle} —
          </div>
        )}

        {reducedMotion ? (
          <EndingStatsPanel flags={flags} endingId={endingId} />
        ) : easterEgg ? (
          <EndingStatsPanelAnimated flags={flags} endingId={endingId} />
        ) : (
          <EndingStatsPanelDefault flags={flags} endingId={endingId} />
        )}

        <div className="mt-4 flex flex-row items-center gap-2 flex-wrap justify-center">
          <button
            type="button"
            className="px-6 py-3 rounded-lg"
            style={{
              background: 'var(--color-dark-accent)',
              color: 'var(--color-dark-bg)',
            }}
            onClick={confirmAndResetGame}
          >
            타이틀로 돌아가기
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            data-testid="ending-share-button"
            className="px-5 py-3 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.14)',
              color: 'rgba(255,248,252,0.96)',
              border: '1px solid rgba(255,255,255,0.28)',
            }}
          >
            결과 공유
          </button>
          <button
            type="button"
            onClick={() => void handleSaveImage()}
            data-testid="ending-save-image-button"
            className="px-5 py-3 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.14)',
              color: 'rgba(255,248,252,0.96)',
              border: '1px solid rgba(255,255,255,0.28)',
            }}
          >
            이미지 저장
          </button>
          <button
            type="button"
            onClick={() => setShowNpc((v) => !v)}
            aria-expanded={showNpc}
            data-testid="ending-npc-toggle"
            className="text-xs px-3 py-2 rounded-lg opacity-80 hover:opacity-100"
            style={{
              background: 'rgba(255,255,255,0.10)',
              color: 'rgba(255,248,252,0.95)',
              border: '1px solid rgba(255,255,255,0.22)',
            }}
          >
            조연 (7) {showNpc ? '▴' : '▾'}
          </button>
        </div>
        {shareToast && (
          <div
            role="status"
            data-testid="ending-share-toast"
            className="mt-2 px-4 py-1.5 rounded-md text-sm"
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: 'rgba(255,248,252,0.95)',
            }}
          >
            {shareToast}
          </div>
        )}
        {showNpc && (
          <div
            data-testid="ending-npc-panel"
            // 2026-05-10 PM 정정: overflow-x-auto는 CSS 스펙상 overflow-y도 auto로 강제 →
            // 패널이 collapse(height 0)되어 7명이 layout 밖으로 흘러나가 사실상 비노출됐음.
            // overflow 제어 제거 + flex-wrap으로 모바일은 자동 줄바꿈, PC(1280)는 7명 한 줄 유지.
            className="mt-3 flex flex-row flex-wrap items-end justify-center gap-3 px-2 py-2 max-w-[1280px]"
          >
            {NPC_IDS_FOR_ENDING.map((nid) => (
              <NpcThermItem key={nid} nid={nid} flags={flags} />
            ))}
          </div>
        )}
        {rankingEnabled && (
          <RankingSection
            heroineId={meta?.heroine ?? null}
            nickname={rankNickname}
            setNickname={setRankNickname}
            submitState={rankSubmitState}
            submitError={rankSubmitError}
            filter={rankFilter}
            setFilter={setRankFilter}
            entries={rankEntries}
            loading={rankLoading}
            myRecord={myRankRecord}
            onSubmit={() => void handleSubmitRanking()}
          />
        )}
      </div>
    </div>
  );
}

function NpcThermItem({
  nid,
  flags,
}: {
  nid: Exclude<AffinityTargetId, HeroineId>;
  flags: GameFlags;
}) {
  const value = flags[nid];
  return (
    <div className="flex flex-col items-center shrink-0">
      {/*
        2026-05-10 후속 정정 #3 (사용자 신고 — "위아래로 멀리 떨어져 있음" 잔존):
        AffectionThermometer SVG는 BULB_BOTTOM(y=262, viewBox 280) + 16에 nameLabel <text>를 그리고,
        그 사이/아래로 추가로 시각 흰 여백이 생긴다. 그 결과 bulb 시각 끝과 외부 점수 텍스트 사이가 30px+ 떨어져 보임.
        해결: nameLabel prop 비활성(undefined) → SVG 내부 인물명 미출력. 외부에서 인물명·점수를 한 줄로 묶어
        bulb 직하단에 음수 marginTop으로 끌어 올림 (히로인 패널처럼 외부 라벨 표시 + bulb 가까이).
      */}
      <div
        style={{
          width: NPC_THERM_VIEW_W * NPC_GRID_SCALE,
          height: NPC_THERM_VIEW_H * NPC_GRID_SCALE,
          overflow: 'visible',
        }}
      >
        <div
          style={{
            transform: `scale(${NPC_GRID_SCALE})`,
            transformOrigin: 'top center',
            width: NPC_THERM_VIEW_W,
            height: NPC_THERM_VIEW_H,
          }}
        >
          <AffectionThermometer
            value={value}
            heroineId={nid}
            intensity="subtle"
            phase="idle"
          />
        </div>
      </div>
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: 4,
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          color: 'rgba(255,248,252,0.95)',
        }}
      >
        <span className="text-xs font-semibold leading-tight">
          {NPC_NAME_FOR_ENDING[nid]}
        </span>
        <span
          className="text-sm font-bold leading-tight"
          style={{ fontVariantNumeric: 'tabular-nums', marginTop: 2 }}
        >
          {value}점
        </span>
      </div>
    </div>
  );
}

interface RankingSectionProps {
  heroineId: HeroineId | null;
  nickname: string;
  setNickname: (v: string) => void;
  submitState: 'idle' | 'submitting' | 'done' | 'error';
  submitError: string | null;
  filter: 'all' | 'heroine' | 'ending';
  setFilter: (v: 'all' | 'heroine' | 'ending') => void;
  entries: RankingEntry[];
  loading: boolean;
  myRecord: { nickname: string; finalScore: number } | null;
  onSubmit: () => void;
}

function RankingSection({
  heroineId,
  nickname,
  setNickname,
  submitState,
  submitError,
  filter,
  setFilter,
  entries,
  loading,
  myRecord,
  onSubmit,
}: RankingSectionProps) {
  const heroineLabel = heroineId ? HEROINES[heroineId].shortName ?? '히로인' : null;
  const filterButtons: Array<['all' | 'heroine' | 'ending', string]> = [
    ['all', '전체'],
    ...(heroineLabel ? ([['heroine', heroineLabel]] as Array<['heroine', string]>) : []),
    ['ending', '이 엔딩'],
  ];
  return (
    <div
      data-testid="ending-ranking-section"
      className="mt-6 w-full px-4"
      style={{ maxWidth: 720 }}
    >
      <div className="text-sm tracking-widest opacity-70 mb-2 text-center">ONLINE RANKING</div>

      <div className="flex flex-row items-center gap-2 justify-center flex-wrap mb-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) =>
            setNickname(e.target.value.replace(/[^ㄱ-ㆎ가-힣a-zA-Z0-9 ]/g, '').slice(0, 8))
          }
          maxLength={8}
          placeholder="닉네임 (최대 8자)"
          disabled={submitState === 'submitting' || submitState === 'done'}
          className="px-3 py-2 rounded-md text-sm"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.28)',
            color: 'rgba(255,248,252,0.96)',
            width: 200,
          }}
          data-testid="ending-ranking-nickname"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={
            nickname.trim().length === 0 ||
            submitState === 'submitting' ||
            submitState === 'done'
          }
          data-testid="ending-ranking-submit"
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{
            background:
              submitState === 'done'
                ? 'rgba(120,200,120,0.32)'
                : 'var(--color-dark-accent)',
            color: 'var(--color-dark-bg)',
            opacity:
              nickname.trim().length === 0 || submitState === 'submitting' ? 0.5 : 1,
            cursor:
              nickname.trim().length === 0 || submitState === 'submitting'
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {submitState === 'submitting'
            ? '등록 중...'
            : submitState === 'done'
            ? '등록 완료 ✓'
            : '랭킹 등록'}
        </button>
      </div>
      {submitState === 'error' && submitError && (
        <div
          className="text-xs text-center mb-2"
          style={{ color: '#ffb0b0' }}
          data-testid="ending-ranking-error"
        >
          등록 실패: {submitError}
        </div>
      )}

      <div className="flex flex-row items-center gap-1 justify-center mb-2 flex-wrap">
        {filterButtons.map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilter(mode)}
            className="px-3 py-1 rounded-md text-xs"
            style={{
              background:
                filter === mode
                  ? 'rgba(255,255,255,0.22)'
                  : 'rgba(255,255,255,0.08)',
              color: 'rgba(255,248,252,0.95)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="rounded-md overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.36)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
        data-testid="ending-ranking-list"
      >
        {loading ? (
          <div className="text-xs opacity-70 text-center py-4">로딩 중...</div>
        ) : entries.length === 0 ? (
          <div className="text-xs opacity-70 text-center py-4">
            아직 기록이 없어요. 첫 번째 등록자가 되어 보세요.
          </div>
        ) : (
          entries.map((entry, i) => {
            const isMine =
              myRecord !== null &&
              entry.nickname === myRecord.nickname &&
              entry.finalScore === myRecord.finalScore;
            const entryMeta = findEnding(entry.endingId);
            return (
              <div
                key={`${entry.timestamp}-${i}`}
                className="flex flex-row items-center gap-2 px-3 py-1.5 text-sm"
                style={{
                  background: isMine
                    ? 'rgba(255,220,140,0.22)'
                    : i % 2 === 0
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  className="w-7 text-right opacity-80"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {i + 1}.
                </span>
                <span className="w-20 truncate font-semibold">{entry.nickname}</span>
                <span className="flex-1 text-xs opacity-80 truncate">
                  {entryMeta?.title ?? entry.endingId}
                </span>
                <span
                  className="w-12 text-right font-bold"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {entry.finalScore}
                </span>
                <span className="w-6 text-right text-xs opacity-90">{entry.grade}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
