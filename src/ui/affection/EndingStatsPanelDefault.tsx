// @refresh reset
/**
 * 엔딩 통계 패널 — 기본 애니메이션 (이스터에그 OFF 시 기본 표시).
 *
 * (2026-05-09 endings-default-animation 라운드 — PM 결정 plan 반영)
 *
 * 구조: 위너 1컬럼(top-align, 단독) + 비-위너 4컬럼 + 점수창(items-center 그룹).
 *       NPC 토글/그리드는 위너 컬럼 아래 (SOLO 엔딩이면 비-위너 컬럼 아래).
 *
 * 시퀀스 (6단계):
 *   1. Winner 호감도 라인 등장+카운트업 → keybonus 라인 등장+카운트업 (sequential)
 *      위너 체온계: 분홍 glow 0→0.95 페이드인 + 1회 맥동
 *   2. 두 라인 동시 가중치 변환 (라벨에 ×N + 값 동시 카운트업)
 *      focus 발현 시 별도 라인 "× 집중 보너스 (×1.2)" 등장
 *   3. "그 외 히로인 호감도" 라인 등장+카운트업 (체온계 변동 없음)
 *      SOLO 발현 시 별도 라인 "× SOLO 페널티 (×0.8)" 등장 (음수 delta)
 *   4. "조연 보너스 (×0.3)" 라인 등장+카운트업
 *      friend 발현 시 "× 친목 보너스 (×1.3)" 라인
 *      hidden 발현 시 "★ 최고의 아들 / ★★ 오준혁과 CC / ★ 해부학교실 APPLY" 순차 라인
 *   5. SCORE 계기판 카운트업
 *   6. GRADE 도장 (translateY -40 → 0, scale 1.4 → 1, bounce-in)
 *
 * 점수 산정 로직은 endingScore.ts SSoT 그대로 — 본 패널은 표시 + 시퀀스만 책임.
 * 정적 폴백은 prefers-reduced-motion / settings.reduceMotion 둘 중 하나라도 true면
 * EndingScreen이 EndingStatsPanel(정적)로 분기.
 */
import { useEffect, useMemo, useState } from 'react';
import type { AffinityTargetId, EndingId, GameFlags, HeroineId } from '@/engine/types';
import { HEROINE_IDS } from '@/engine/types';
import type { EndingCategory } from '@/data/endings';
import { HEROINES } from '@/data/characters';
import { useSettingsStore } from '@/stores/settingsStore';
import { AffectionThermometer } from './AffectionThermometer';
import { computeEndingScore, type EndingGrade } from '@/engine/endingScore';
import { useEndingCountUp } from './useEndingCountUp';
import { useEndingPhaseMachine } from './useEndingPhaseMachine';

const GRADE_COLOR: Record<EndingGrade, string> = {
  S: '#FFD86B',
  A: '#FF6FA8',
  B: '#A685E2',
  C: '#7FAEC9',
  D: '#888',
};

const NPC_IDS: ReadonlyArray<Exclude<AffinityTargetId, HeroineId>> = [
  'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk', 'mom', 'taeho',
];

const CATEGORY_LABEL: Record<EndingCategory, string> = {
  TRUE: 'TRUE',
  HAPPY: 'HAPPY',
  NORMAL: 'NORMAL',
  BAD: 'BAD',
  REJECT: 'REJECT',
  SOLO: 'SOLO',
};

const SCALE_WINNER = 0.95;
const SCALE_HEROINE = 0.78;
const THERM_DISPLAY_H = 460;

export function EndingStatsPanelDefault({
  flags,
  endingId,
}: {
  flags: GameFlags;
  endingId: EndingId;
}) {
  const score = useMemo(() => computeEndingScore(flags, endingId), [flags, endingId]);
  const bd = score.breakdown;
  const winner = bd.winner;
  const gradeColor = GRADE_COLOR[score.grade];
  const categoryLabel = bd.category ? CATEGORY_LABEL[bd.category] : null;
  const winnerKeyHasBonus = bd.winnerKeyCount > 0;

  // ===== 파생 값 =====
  const otherHeroinesRaw = HEROINE_IDS.reduce(
    (sum, h) => (h === winner ? sum : sum + flags[h]),
    0,
  );
  // SOLO 페널티 적용 시 heroineSum 전체에 ×0.8이 곱해지지만, UI에서는
  // "그 외 히로인 호감도" 라인에 raw, "× SOLO" 라인에 (hTotal - heroineSum)을 표시.
  // (winner perPerson에는 SOLO를 곱하지 않으므로, SOLO delta = heroineSum × -0.2)
  const soloLineDelta = bd.soloPenaltyActive ? bd.hTotal - bd.heroineSum : 0;
  // focus 발현 시 winner perPerson에 ×1.2가 추가로 곱해지므로,
  // "× 집중" 라인에 (perPerson[winner] - (winnerAff+keyBonus)×categoryMultiplier)을 표시.
  const winnerLineNoFocus =
    (bd.winnerAff + bd.winnerKeyBonus) * bd.categoryMultiplier;
  const focusLineDelta =
    bd.focusActive && winner !== null
      ? bd.perPerson[winner] - winnerLineNoFocus
      : 0;
  // 조연 base — npc 7명 × 0.3 (히든/친목 미적용)
  const npcBaseBonus = NPC_IDS.reduce((sum, id) => sum + flags[id], 0) * 0.3;
  // friend 친목 보너스 = friendSum - friendSumRaw (이미 hidden junhyuk×10 baked in)
  const friendBonusDelta = bd.friendBonusActive
    ? bd.friendSum - bd.friendSumRaw
    : 0;
  // 히든 보너스 별도 delta — perPerson에 baked in 된 곱셈에서 base(×0.3)만 빼면 추가분
  const momHiddenDelta = bd.bestSonActive
    ? bd.perPerson.mom - flags.mom * 0.3
    : 0;
  const junhyukHiddenDelta = bd.junhyukActive
    ? bd.perPerson.junhyuk - flags.junhyuk * 0.3
    : 0;
  const taehoHiddenDelta = bd.taehoBestActive
    ? bd.perPerson.taeho - flags.taeho * 0.3
    : 0;

  // ===== reduced-motion =====
  // OS prefers-reduced-motion은 무시 (PM 결정 2026-05-10). 게임 내 reduceMotion 토글만 따름.
  const reducedMotion = useSettingsStore((s) => s.reduceMotion);
  const machine = useEndingPhaseMachine({ reducedMotion });
  const { phase, advance, skip, isDone } = machine;

  // ===== 카운트업 타깃 =====
  const [winnerLineTarget, setWinnerLineTarget] = useState(0);
  const [keyLineTarget, setKeyLineTarget] = useState(0);
  const [focusLineTarget, setFocusLineTarget] = useState(0);
  const [othersLineTarget, setOthersLineTarget] = useState(0);
  const [soloLineTarget, setSoloLineTarget] = useState(0);
  const [npcLineTarget, setNpcLineTarget] = useState(0);
  const [friendLineTarget, setFriendLineTarget] = useState(0);
  const [momLineTarget, setMomLineTarget] = useState(0);
  const [junhyukLineTarget, setJunhyukLineTarget] = useState(0);
  const [taehoLineTarget, setTaehoLineTarget] = useState(0);
  const [scoreTarget, setScoreTarget] = useState(0);

  const winnerLineDisplay = useEndingCountUp(winnerLineTarget, { durationMs: 900, reducedMotion });
  const keyLineDisplay = useEndingCountUp(keyLineTarget, { durationMs: 600, reducedMotion });
  const focusLineDisplay = useEndingCountUp(focusLineTarget, { durationMs: 600, reducedMotion });
  const othersLineDisplay = useEndingCountUp(othersLineTarget, { durationMs: 900, reducedMotion });
  const soloLineDisplay = useEndingCountUp(soloLineTarget, { durationMs: 600, reducedMotion });
  const npcLineDisplay = useEndingCountUp(npcLineTarget, { durationMs: 900, reducedMotion });
  const friendLineDisplay = useEndingCountUp(friendLineTarget, { durationMs: 500, reducedMotion });
  const momLineDisplay = useEndingCountUp(momLineTarget, { durationMs: 500, reducedMotion });
  const junhyukLineDisplay = useEndingCountUp(junhyukLineTarget, { durationMs: 500, reducedMotion });
  const taehoLineDisplay = useEndingCountUp(taehoLineTarget, { durationMs: 500, reducedMotion });
  const scoreDisplay = useEndingCountUp(scoreTarget, { durationMs: 1500, reducedMotion });

  // ===== 라인 visibility =====
  const [winnerVisible, setWinnerVisible] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [winnerWeighted, setWinnerWeighted] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [othersVisible, setOthersVisible] = useState(false);
  const [soloVisible, setSoloVisible] = useState(false);
  const [npcVisible, setNpcVisible] = useState(false);
  const [friendVisible, setFriendVisible] = useState(false);
  const [momVisible, setMomVisible] = useState(false);
  const [junhyukVisible, setJunhyukVisible] = useState(false);
  const [taehoVisible, setTaehoVisible] = useState(false);

  // ===== 위너 네온 =====
  const [glowAlpha, setGlowAlpha] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);

  // ===== GRADE 도장 =====
  const [stampShown, setStampShown] = useState(false);
  const [stampSettled, setStampSettled] = useState(false);

  // NPC 토글은 EndingScreen 으로 이동 (PM 결정 2026-05-10).

  // ===== Phase 6 (skip / 자연 도달) — 모든 최종 상태 즉시 설정 =====
  useEffect(() => {
    if (phase !== 6) return;
    setWinnerVisible(winner !== null);
    setKeyVisible(winnerKeyHasBonus);
    setWinnerWeighted(true);
    setFocusVisible(bd.focusActive);
    setOthersVisible(true);
    setSoloVisible(bd.soloPenaltyActive);
    setNpcVisible(true);
    setFriendVisible(bd.friendBonusActive);
    setMomVisible(bd.bestSonActive);
    setJunhyukVisible(bd.junhyukActive);
    setTaehoVisible(bd.taehoBestActive);

    setWinnerLineTarget(winner !== null ? bd.winnerAff * bd.categoryMultiplier : 0);
    setKeyLineTarget(winnerKeyHasBonus ? bd.winnerKeyBonus * bd.categoryMultiplier : 0);
    setFocusLineTarget(focusLineDelta);
    setOthersLineTarget(otherHeroinesRaw);
    setSoloLineTarget(soloLineDelta);
    setNpcLineTarget(npcBaseBonus);
    setFriendLineTarget(friendBonusDelta);
    setMomLineTarget(momHiddenDelta);
    setJunhyukLineTarget(junhyukHiddenDelta);
    setTaehoLineTarget(taehoHiddenDelta);
    setScoreTarget(score.finalScore);

    setGlowAlpha(0.95);
    setPulseActive(false);
    setStampShown(true);
    setStampSettled(true);
  }, [
    phase,
    winner,
    winnerKeyHasBonus,
    bd.focusActive,
    bd.soloPenaltyActive,
    bd.friendBonusActive,
    bd.bestSonActive,
    bd.junhyukActive,
    bd.taehoBestActive,
    bd.winnerAff,
    bd.winnerKeyBonus,
    bd.categoryMultiplier,
    focusLineDelta,
    otherHeroinesRaw,
    soloLineDelta,
    npcBaseBonus,
    friendBonusDelta,
    momHiddenDelta,
    junhyukHiddenDelta,
    taehoHiddenDelta,
    score.finalScore,
  ]);

  // ===== Phase 1 — Winner 호감도 + keybonus (sequential) =====
  useEffect(() => {
    if (phase !== 1) return;
    if (winner === null) {
      // SOLO 엔딩 — Phase 1·2 건너뜀
      const t = window.setTimeout(() => advance(), 150);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];

    // 위너 글로우 페이드인 + 맥동
    setGlowAlpha(0.95);
    timers.push(window.setTimeout(() => setPulseActive(true), 600));
    timers.push(window.setTimeout(() => setPulseActive(false), 1000));

    // Winner 호감도 라인 등장 + 카운트업
    setWinnerVisible(true);
    setWinnerLineTarget(bd.winnerAff);

    // keybonus 순차 등장
    if (winnerKeyHasBonus) {
      timers.push(
        window.setTimeout(() => {
          setKeyVisible(true);
          setKeyLineTarget(bd.winnerKeyBonus);
        }, 1100),
      );
    }

    const advDelay = winnerKeyHasBonus ? 1900 : 1200;
    timers.push(window.setTimeout(() => advance(), advDelay));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase, winner, winnerKeyHasBonus, bd.winnerAff, bd.winnerKeyBonus, advance]);

  // ===== Phase 2 — 가중치 동시 변환 + (focus 시) 집중 라인 =====
  useEffect(() => {
    if (phase !== 2) return;
    if (winner === null) {
      const t = window.setTimeout(() => advance(), 100);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];

    setWinnerWeighted(true);
    setWinnerLineTarget(bd.winnerAff * bd.categoryMultiplier);
    if (winnerKeyHasBonus) {
      setKeyLineTarget(bd.winnerKeyBonus * bd.categoryMultiplier);
    }

    if (bd.focusActive) {
      timers.push(
        window.setTimeout(() => {
          setFocusVisible(true);
          setFocusLineTarget(focusLineDelta);
        }, 950),
      );
    }

    const advDelay = bd.focusActive ? 1700 : 1100;
    timers.push(window.setTimeout(() => advance(), advDelay));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [
    phase,
    winner,
    winnerKeyHasBonus,
    bd.winnerAff,
    bd.winnerKeyBonus,
    bd.categoryMultiplier,
    bd.focusActive,
    focusLineDelta,
    advance,
  ]);

  // ===== Phase 3 — 그 외 히로인 호감도 + (SOLO 시) 페널티 라인 =====
  useEffect(() => {
    if (phase !== 3) return;
    const timers: number[] = [];

    setOthersVisible(true);
    setOthersLineTarget(otherHeroinesRaw);

    if (bd.soloPenaltyActive) {
      timers.push(
        window.setTimeout(() => {
          setSoloVisible(true);
          setSoloLineTarget(soloLineDelta);
        }, 950),
      );
    }

    const advDelay = bd.soloPenaltyActive ? 1700 : 1100;
    timers.push(window.setTimeout(() => advance(), advDelay));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase, otherHeroinesRaw, bd.soloPenaltyActive, soloLineDelta, advance]);

  // ===== Phase 4 — 조연 보너스 + 친목 + hidden =====
  useEffect(() => {
    if (phase !== 4) return;
    const timers: number[] = [];

    setNpcVisible(true);
    setNpcLineTarget(npcBaseBonus);

    let cursor = 950;
    if (bd.friendBonusActive) {
      timers.push(
        window.setTimeout(() => {
          setFriendVisible(true);
          setFriendLineTarget(friendBonusDelta);
        }, cursor),
      );
      cursor += 600;
    }
    if (bd.bestSonActive) {
      timers.push(
        window.setTimeout(() => {
          setMomVisible(true);
          setMomLineTarget(momHiddenDelta);
        }, cursor),
      );
      cursor += 500;
    }
    if (bd.junhyukActive) {
      timers.push(
        window.setTimeout(() => {
          setJunhyukVisible(true);
          setJunhyukLineTarget(junhyukHiddenDelta);
        }, cursor),
      );
      cursor += 500;
    }
    if (bd.taehoBestActive) {
      timers.push(
        window.setTimeout(() => {
          setTaehoVisible(true);
          setTaehoLineTarget(taehoHiddenDelta);
        }, cursor),
      );
      cursor += 500;
    }

    timers.push(window.setTimeout(() => advance(), Math.max(cursor + 300, 1300)));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [
    phase,
    npcBaseBonus,
    bd.friendBonusActive,
    bd.bestSonActive,
    bd.junhyukActive,
    bd.taehoBestActive,
    friendBonusDelta,
    momHiddenDelta,
    junhyukHiddenDelta,
    taehoHiddenDelta,
    advance,
  ]);

  // ===== Phase 5 — SCORE 계기판 카운트업 =====
  // Phase 1~4의 모든 라인을 final 상태로 보강 (사용자가 빠르게 advance하면
  // setTimeout 체인이 cleanup 되어 hidden 보너스 라인 등이 누락되는 문제 방지).
  useEffect(() => {
    if (phase !== 5) return;
    if (winner !== null) {
      setWinnerVisible(true);
      setWinnerWeighted(true);
      setWinnerLineTarget(bd.winnerAff * bd.categoryMultiplier);
      if (winnerKeyHasBonus) {
        setKeyVisible(true);
        setKeyLineTarget(bd.winnerKeyBonus * bd.categoryMultiplier);
      }
      if (bd.focusActive) {
        setFocusVisible(true);
        setFocusLineTarget(focusLineDelta);
      }
    }
    setOthersVisible(true);
    setOthersLineTarget(otherHeroinesRaw);
    if (bd.soloPenaltyActive) {
      setSoloVisible(true);
      setSoloLineTarget(soloLineDelta);
    }
    setNpcVisible(true);
    setNpcLineTarget(npcBaseBonus);
    if (bd.friendBonusActive) {
      setFriendVisible(true);
      setFriendLineTarget(friendBonusDelta);
    }
    if (bd.bestSonActive) {
      setMomVisible(true);
      setMomLineTarget(momHiddenDelta);
    }
    if (bd.junhyukActive) {
      setJunhyukVisible(true);
      setJunhyukLineTarget(junhyukHiddenDelta);
    }
    if (bd.taehoBestActive) {
      setTaehoVisible(true);
      setTaehoLineTarget(taehoHiddenDelta);
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setScoreTarget(score.finalScore), 200));
    timers.push(window.setTimeout(() => advance(), 1900));
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [
    phase,
    winner,
    winnerKeyHasBonus,
    bd.winnerAff,
    bd.winnerKeyBonus,
    bd.categoryMultiplier,
    bd.focusActive,
    bd.soloPenaltyActive,
    bd.friendBonusActive,
    bd.bestSonActive,
    bd.junhyukActive,
    bd.taehoBestActive,
    focusLineDelta,
    otherHeroinesRaw,
    soloLineDelta,
    npcBaseBonus,
    friendBonusDelta,
    momHiddenDelta,
    junhyukHiddenDelta,
    taehoHiddenDelta,
    score.finalScore,
    advance,
  ]);

  // ===== Phase 6 진입 시 GRADE 도장 (skip 경로의 setStampShown과 idempotent) =====
  useEffect(() => {
    if (phase !== 6) return;
    const timers: number[] = [];
    setStampShown(true);
    timers.push(window.setTimeout(() => setStampSettled(true), 450));
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase]);

  // ===== 카드 클릭으로 advance =====
  const onCardClick = () => {
    if (!isDone) advance();
  };

  // ===== 라인 분리: 위너 vs 비-위너 =====
  const nonWinnerHeroines = winner === null ? HEROINE_IDS : HEROINE_IDS.filter((h) => h !== winner);

  return (
    <div
      className="flex flex-col items-center w-full max-w-[1280px] mt-2 px-4"
      data-testid="ending-stats-panel-default"
      data-anim-phase={phase}
    >
      {/* keyframes 인젝션 */}
      <style>{`
        @keyframes kmuFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 메인 row: 위너 단독 + (비-위너 + 점수창) */}
      <div
        className="flex flex-row items-start justify-center gap-4 w-full"
        onClick={onCardClick}
        role="presentation"
      >
        {/* 위너 단독 컬럼 — top align */}
        <div className="flex flex-col items-center" style={{ minWidth: winner ? undefined : 100 }}>
          {winner !== null && (
            <div className="flex flex-col items-center shrink-0">
              <div
                style={{
                  filter: `drop-shadow(0 0 ${pulseActive ? 30 : 22}px rgba(230,65,120,${
                    pulseActive ? Math.min(glowAlpha + 0.2, 1.15) : glowAlpha
                  }))`,
                  transition: 'filter 480ms ease-out',
                }}
              >
                <div
                  style={{
                    transform: `scale(${SCALE_WINNER})`,
                    transformOrigin: 'top center',
                    height: THERM_DISPLAY_H * SCALE_WINNER,
                  }}
                >
                  <AffectionThermometer
                    value={flags[winner]}
                    heroineId={HEROINES[winner].id}
                    nameLabel={HEROINES[winner].shortName ?? HEROINES[winner].name}
                    intensity="rich"
                    phase="idle"
                  />
                </div>
              </div>
              <span
                className="text-[10px] font-bold mt-1"
                style={{
                  color: '#FFB8D1',
                  textShadow: '0 0 8px rgba(255, 184, 209, 0.8)',
                }}
              >
                ★ Winner
              </span>
              <span
                className="text-[10px]"
                style={{
                  color: 'rgba(220,220,225,0.6)',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 2,
                }}
              >
                {flags[winner]}점
              </span>
            </div>
          )}
        </div>

        {/* 비-위너 4명 + 점수창 — items-center 그룹 */}
        <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
          <div className="flex flex-row items-end justify-center gap-2 flex-nowrap overflow-x-auto px-2 py-0.5">
            {nonWinnerHeroines.map((hid) => {
              const meta = HEROINES[hid];
              const value = flags[hid];
              return (
                <div key={hid} className="flex flex-col items-center shrink-0">
                  <div
                    style={{
                      transform: `scale(${SCALE_HEROINE})`,
                      transformOrigin: 'top center',
                      height: THERM_DISPLAY_H * SCALE_HEROINE,
                    }}
                  >
                    <AffectionThermometer
                      value={value}
                      heroineId={meta.id}
                      nameLabel={meta.shortName ?? meta.name}
                      intensity="rich"
                      phase="idle"
                    />
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      color: 'rgba(220,220,225,0.6)',
                      fontVariantNumeric: 'tabular-nums',
                      marginTop: 2,
                    }}
                  >
                    {value}점
                  </span>
                </div>
              );
            })}
          </div>

          {/* 점수창 카드 */}
          <div
            className="flex flex-col gap-2 px-4 py-3 rounded-2xl relative shrink-0"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.18)',
              minWidth: 320,
              minHeight: 280,
            }}
          >
            {/* 스킵 버튼 */}
            {!isDone && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  skip();
                }}
                className="absolute top-2 right-2 text-[10px] tracking-widest opacity-70 hover:opacity-100 px-2 py-1 rounded"
                style={{
                  background: 'rgba(0,0,0,0.45)',
                  color: 'rgba(255,255,255,0.92)',
                  zIndex: 5,
                }}
                data-testid="ending-default-skip"
              >
                ▶▶ 스킵
              </button>
            )}

            {/* SCORE + GRADE */}
            <div className="flex flex-row items-center gap-4 w-full justify-center pb-2 border-b border-white/15">
              <div className="flex flex-col items-center">
                <div className="text-[11px] tracking-widest opacity-60">SCORE</div>
                <div
                  className="text-4xl font-black tabular-nums"
                  style={{
                    color: 'rgba(255, 245, 250, 0.95)',
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                  data-testid="ending-default-score"
                >
                  {Math.round(scoreDisplay)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[11px] tracking-widest opacity-60">GRADE</div>
                <div
                  className="text-5xl font-black leading-none"
                  style={{
                    color: gradeColor,
                    textShadow: stampShown
                      ? `0 0 18px ${gradeColor}aa, 0 2px 6px rgba(0,0,0,0.4)`
                      : 'none',
                    opacity: stampShown ? 1 : 0,
                    transform: stampSettled
                      ? 'translateY(0) scale(1)'
                      : stampShown
                        ? 'translateY(0) scale(1.4)'
                        : 'translateY(-40px) scale(1.4)',
                    transition: stampSettled
                      ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out'
                      : 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease-out',
                  }}
                  data-testid="ending-default-grade"
                >
                  {score.grade}
                </div>
              </div>
            </div>

            {/* 라인들 */}
            <div className="flex flex-col text-xs gap-1 opacity-95 w-full">
              {/* L1: Winner 호감도 (+ Phase 2 시 ×N 라벨) */}
              {winnerVisible && winner !== null && (
                <Row
                  label={
                    winnerWeighted && categoryLabel
                      ? `Winner 호감도 ×${bd.categoryMultiplier}(${categoryLabel} 엔딩 가중)`
                      : 'Winner 호감도'
                  }
                  value={Math.round(winnerLineDisplay)}
                />
              )}
              {/* L2: keybonus */}
              {keyVisible && (
                <Row
                  label={
                    winnerWeighted && categoryLabel
                      ? `keybonus ×${bd.categoryMultiplier}(${categoryLabel} 엔딩 가중)`
                      : 'keybonus'
                  }
                  value={Math.round(keyLineDisplay)}
                />
              )}
              {/* L3: × 집중 보너스 (focus) */}
              {focusVisible && (
                <Row
                  label={`× 집중 보너스 (격차≥40, ×${bd.focusMultiplier})`}
                  value={`+${Math.round(focusLineDisplay)}`}
                  variant="bonus"
                />
              )}
              {/* L4: 그 외 히로인 호감도 */}
              {othersVisible && (
                <Row
                  label="그 외 히로인 호감도"
                  value={Math.round(othersLineDisplay)}
                  divider
                />
              )}
              {/* L5: × SOLO 페널티 */}
              {soloVisible && (
                <Row
                  label={`× SOLO 페널티 (×${bd.soloPenaltyMultiplier})`}
                  value={Math.round(soloLineDisplay)}
                  variant="penalty"
                />
              )}
              {/* L6: 조연 보너스 (×0.3) */}
              {npcVisible && (
                <Row
                  label="조연 보너스 (×0.3)"
                  value={Math.round(npcLineDisplay)}
                  divider
                />
              )}
              {/* L7: × 친목 보너스 */}
              {friendVisible && (
                <Row
                  label={`× 친목 보너스 (4명≥40, ×${bd.friendBonusMultiplier})`}
                  value={`+${Math.round(friendLineDisplay)}`}
                  variant="bonus"
                />
              )}
              {/* L8: 최고의 아들 (mom hidden) */}
              {momVisible && (
                <Row
                  label="★ 최고의 아들 (엄마×5)"
                  value={`+${Math.round(momLineDisplay)}`}
                  variant="bonus"
                />
              )}
              {/* L9: 오준혁과 CC (junhyuk hidden) */}
              {junhyukVisible && (
                <Row
                  label="★★ 오준혁과 CC (오준혁×10)"
                  value={`+${Math.round(junhyukLineDisplay)}`}
                  variant="bonus"
                />
              )}
              {/* L10: 해부학교실 APPLY (taeho hidden) */}
              {taehoVisible && (
                <Row
                  label="★ 해부학교실 APPLY (교수×3)"
                  value={`+${Math.round(taehoLineDisplay)}`}
                  variant="bonus"
                />
              )}
            </div>

            {/* 진행 힌트 */}
            {!isDone && (
              <div className="text-[9px] tracking-widest opacity-50 mt-1 text-center">
                클릭 또는 SPACE/ENTER로 진행 · ESC로 스킵
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  divider,
  variant = 'normal',
}: {
  label: string;
  value: number | string;
  divider?: boolean;
  variant?: 'normal' | 'bonus' | 'penalty';
}) {
  const color =
    variant === 'bonus'
      ? '#FFD86B'
      : variant === 'penalty'
        ? '#FF8B7A'
        : undefined;
  return (
    <div
      className="flex justify-between items-center gap-2"
      style={{
        borderTop: divider ? '1px solid rgba(255,255,255,0.18)' : 'none',
        paddingTop: divider ? 4 : 0,
        color,
        fontWeight: variant !== 'normal' ? 700 : undefined,
        animation: 'kmuFadeUp 240ms ease-out',
      }}
    >
      <span className={variant === 'normal' ? 'opacity-85' : undefined}>{label}</span>
      <span className="tabular-nums font-semibold">{value}</span>
    </div>
  );
}
