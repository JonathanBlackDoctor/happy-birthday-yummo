// @refresh reset
/**
 * 엔딩 통계 패널 — 액체 채움 + 카운트업 + 도장 애니메이션 (Animated 버전).
 *
 * PM 결정 2026-05-09 (5단계 시퀀스):
 *   1. Winner 체온계 0 ↔ 박스 액체 차오름 + 라인 카운트업
 *   2. 라벨에 엔딩가중 등장 + 박스 액체 부풀음 (+ keyCount>0 시 핵심선택지 라인 추가)
 *   3. 그 외 히로인 4명 좌→우 sequential + 박스 추가 (SOLO 시 ×0.8 칩 + 박스 감소)
 *   4. 조연 7명 합 ×0.3 박스 추가 + 친목/히든 칩 (1000+점 overflow)
 *   5. 박스 안정화 후 SCORE 계기판 카운트업 + GRADE 도장
 *
 * 기존 EndingStatsPanel.tsx는 절대 수정 금지 — reduced-motion 폴백으로 그대로 위임.
 *
 * 토글: EndingScreen.tsx의 useAnimated 분기 (settingsStore 또는 URL ?animated=1).
 */
import { useEffect, useMemo, useState } from 'react';
import type { EndingId, GameFlags, HeroineId } from '@/engine/types';
import { HEROINE_IDS } from '@/engine/types';
import type { EndingCategory } from '@/data/endings';
import { HEROINES } from '@/data/characters';
import { AffectionThermometer } from './AffectionThermometer';
import { computeEndingScore, type EndingGrade, GRADE_CUTS } from '@/engine/endingScore';
import { EndingLiquidBox } from './EndingLiquidBox';
import { useEndingCountUp } from './useEndingCountUp';
import { useEndingPhaseMachine } from './useEndingPhaseMachine';
import { easeOutCubic } from './spring';

const GRADE_COLOR: Record<EndingGrade, string> = {
  S: '#FFD86B',
  A: '#FF6FA8',
  B: '#A685E2',
  C: '#7FAEC9',
  D: '#888',
};

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

/**
 * Animated 엔딩 통계 패널 — `?animated=1` 토글 시 EndingScreen이 직접 렌더.
 * reduced-motion 폴백은 EndingScreen 측 토글이 책임 (URL 미지정 = 정적 패널).
 */
export function EndingStatsPanelAnimated({
  flags,
  endingId,
}: {
  flags: GameFlags;
  endingId: EndingId;
}) {
  return <AnimatedPanel flags={flags} endingId={endingId} />;
}

function AnimatedPanel({ flags, endingId }: { flags: GameFlags; endingId: EndingId }) {
  const score = useMemo(() => computeEndingScore(flags, endingId), [flags, endingId]);
  const bd = score.breakdown;
  const winner = bd.winner;
  const gradeColor = GRADE_COLOR[score.grade];
  const winnerShortName = winner ? HEROINES[winner].shortName ?? HEROINES[winner].name : null;
  const categoryLabel = bd.category ? CATEGORY_LABEL[bd.category] : null;
  const hidden = score.hiddenBonusLabels.length > 0;

  // Derived values (단순화 5줄 매핑)
  const winnerAff = bd.winnerAff;
  const winnerLineValue = winnerAff * bd.categoryMultiplier; // L1 최종값
  const keyLineValue = bd.winnerKeyBonus * bd.categoryMultiplier; // L2 최종값
  const npcRawSum =
    flags.gyumin +
    flags.gyeongmin +
    flags.nathan +
    flags.wook +
    flags.junhyuk +
    flags.mom +
    flags.taeho;
  const npcBonus = npcRawSum * 0.3;

  const machine = useEndingPhaseMachine();
  const { phase, advance, skip, isDone } = machine;

  // === 체온계 값 state — 0~100 사이로 RAF가 내려가게 ===
  const [thermValues, setThermValues] = useState<Record<HeroineId, number>>(() => ({
    H1: flags.H1,
    H2: flags.H2,
    H3: flags.H3,
    H4: flags.H4,
    H5: flags.H5,
  }));

  // === 박스 누적 점수 (fillPct 계산 기준) ===
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const fillPct = Math.min(accumulatedScore / GRADE_CUTS.S, 1);
  const overflowActive = accumulatedScore > GRADE_CUTS.S + 5;

  // === Turbulence amplitude (평소 0.3, 부풀음 시 0.8) ===
  const [turbAmp, setTurbAmp] = useState(0.3);

  // === 라인 값 (counting target) ===
  const [l1Target, setL1Target] = useState(0); // Winner × 가중
  const [l2Target, setL2Target] = useState(0); // 핵심선택지 × 가중
  const [l3Target, setL3Target] = useState(0); // 그 외 히로인 누적
  const [l4Target, setL4Target] = useState(0); // 조연 보너스
  const [scoreTarget, setScoreTarget] = useState(0);

  const l1Display = useEndingCountUp(l1Target, { durationMs: 900 });
  const l2Display = useEndingCountUp(l2Target, { durationMs: 800 });
  const l3Display = useEndingCountUp(l3Target, { durationMs: 800 });
  const l4Display = useEndingCountUp(l4Target, { durationMs: 900 });
  const scoreDisplay = useEndingCountUp(scoreTarget, { durationMs: 1500 });

  // === Visibility flags (라인 + 칩) ===
  const [l1LabelWeighted, setL1LabelWeighted] = useState(false); // false = "Winner 호감도" only, true = "Winner 호감도 × 엔딩가중(×N)"
  const [l2Visible, setL2Visible] = useState(false);
  const [l3Visible, setL3Visible] = useState(false);
  const [l4Visible, setL4Visible] = useState(false);
  const [winnerBulbGlow, setWinnerBulbGlow] = useState(false);

  // 보정 칩들
  const [focusChipShown, setFocusChipShown] = useState(false);
  const [soloChipShown, setSoloChipShown] = useState(false);
  const [friendChipShown, setFriendChipShown] = useState(false);
  const [hiddenChipsShown, setHiddenChipsShown] = useState(false);

  // GRADE 도장 모션
  const [stampShown, setStampShown] = useState(false);
  const [stampSettled, setStampSettled] = useState(false);

  // === Skip handler — phase 6 직행 + 모든 최종 상태 즉시 설정 ===
  useEffect(() => {
    if (phase !== 6) return;
    // 모든 체온계 0
    setThermValues({ H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 });
    setAccumulatedScore(score.finalScore);
    setL1Target(winnerLineValue);
    setL2Target(keyLineValue);
    setL3Target(bd.hTotal - bd.perPerson[winner ?? 'H1'] * (winner ? 1 : 0)); // 그외 합 (SOLO ×0.8 적용 후)
    setL4Target(npcBonus * bd.friendBonusMultiplier); // 친목 미적용 단순 표기
    setScoreTarget(score.finalScore);
    setL1LabelWeighted(true);
    setL2Visible(bd.winnerKeyCount > 0);
    setL3Visible(true);
    setL4Visible(true);
    setFocusChipShown(bd.focusActive);
    setSoloChipShown(bd.soloPenaltyActive);
    setFriendChipShown(bd.friendBonusActive);
    setHiddenChipsShown(true);
    setStampShown(true);
    setStampSettled(true);
  }, [phase, score, winnerLineValue, keyLineValue, npcBonus, bd, winner]);

  // === Phase 1: Winner 호감도 ===
  useEffect(() => {
    if (phase !== 1 || !winner) {
      if (phase === 1 && !winner) {
        // SOLO 엔딩 — 윈너 없음 → Phase 1 건너뛰고 advance.
        const t = window.setTimeout(() => advance(), 200);
        return () => window.clearTimeout(t);
      }
      return;
    }
    const startVal = flags[winner];
    const startTs = performance.now();
    const dur = 1500;
    let raf = 0;
    let cancelled = false;

    setL1LabelWeighted(false);
    setL1Target(winnerAff); // 0 → winnerAff 카운트업

    const tick = (ts: number) => {
      if (cancelled) return;
      const t = Math.min(1, (ts - startTs) / dur);
      const eased = easeOutCubic(t);
      const v = startVal * (1 - eased);
      setThermValues((prev) => ({ ...prev, [winner]: v }));
      setAccumulatedScore(startVal * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const advTimer = window.setTimeout(() => advance(), dur + 600);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(advTimer);
    };
  }, [phase, winner, winnerAff, flags, advance]);

  // === Phase 2: 가중치 + 핵심선택지 ===
  useEffect(() => {
    if (phase !== 2) return;
    if (!winner) {
      const t = window.setTimeout(() => advance(), 100);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];

    // 라벨 변환 + L1 부풀음
    setL1LabelWeighted(true);
    setL1Target(winnerLineValue);
    setTurbAmp(0.75);

    // 박스 누적값 = winnerLineValue (가중 적용 후)
    setAccumulatedScore(winnerLineValue);

    timers.push(window.setTimeout(() => setTurbAmp(0.35), 1100));

    // focus 칩
    if (bd.focusActive) {
      timers.push(window.setTimeout(() => setFocusChipShown(true), 600));
    }

    // L2 (핵심선택지) 분기
    if (bd.winnerKeyCount > 0) {
      timers.push(
        window.setTimeout(() => {
          setL2Visible(true);
          setWinnerBulbGlow(true);
          setL2Target(keyLineValue);
          setAccumulatedScore(winnerLineValue + keyLineValue);
          setTurbAmp(0.7);
        }, 900),
      );
      timers.push(window.setTimeout(() => setWinnerBulbGlow(false), 1700));
      timers.push(window.setTimeout(() => setTurbAmp(0.35), 2000));
    }

    const dur = bd.winnerKeyCount > 0 ? 2400 : 1600;
    timers.push(window.setTimeout(() => advance(), dur));
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase, winner, winnerLineValue, keyLineValue, bd.focusActive, bd.winnerKeyCount, advance]);

  // === Phase 3: 그 외 히로인 4명 좌→우 ===
  useEffect(() => {
    if (phase !== 3) return;
    setL3Visible(true);

    const others = HEROINE_IDS.filter((h) => h !== winner);
    if (others.length === 0) {
      const t = window.setTimeout(() => advance(), 100);
      return () => window.clearTimeout(t);
    }

    const perDur = 700;
    const startTs = performance.now();
    let raf = 0;
    let cancelled = false;
    const startThermSnapshot: Record<HeroineId, number> = {
      H1: thermValues.H1,
      H2: thermValues.H2,
      H3: thermValues.H3,
      H4: thermValues.H4,
      H5: thermValues.H5,
    };
    const baseAcc = accumulatedScore;
    const totalDur = perDur * others.length;

    const tick = (ts: number) => {
      if (cancelled) return;
      const elapsed = ts - startTs;
      let cumulative = 0;
      const nextTherms: Record<HeroineId, number> = { ...startThermSnapshot };

      for (let i = 0; i < others.length; i++) {
        const hid = others[i];
        const localStart = i * perDur;
        const localEnd = localStart + perDur;
        const t = Math.max(0, Math.min(1, (elapsed - localStart) / perDur));
        const eased = easeOutCubic(t);
        nextTherms[hid] = startThermSnapshot[hid] * (1 - eased);
        cumulative += startThermSnapshot[hid] * eased;
        if (elapsed < localEnd) break;
      }

      setThermValues(nextTherms);
      setL3Target(cumulative);
      setAccumulatedScore(baseAcc + cumulative);

      if (elapsed < totalDur) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const finalize = window.setTimeout(() => {
      // SOLO 페널티: heroineSum × 0.8을 새 target으로
      if (bd.soloPenaltyActive) {
        setSoloChipShown(true);
        const heroineSumAfterPenalty = bd.heroineSum * bd.soloPenaltyMultiplier;
        const otherAfterPenalty = heroineSumAfterPenalty - (winner ? bd.perPerson[winner] : 0);
        setL3Target(otherAfterPenalty);
        setAccumulatedScore(
          (winner ? winnerLineValue + keyLineValue : 0) + heroineSumAfterPenalty - (winner ? bd.perPerson[winner] : 0),
        );
      }
    }, totalDur + 200);

    const advTimer = window.setTimeout(() => advance(), totalDur + (bd.soloPenaltyActive ? 1200 : 600));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(finalize);
      window.clearTimeout(advTimer);
    };
    // thermValues/accumulatedScore는 RAF 시작 시 1회 snapshot — deps 제외.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winner, bd.soloPenaltyActive, bd.heroineSum, bd.soloPenaltyMultiplier, advance]);

  // === Phase 4: 조연 보너스 ===
  useEffect(() => {
    if (phase !== 4) return;
    const timers: number[] = [];

    setL4Visible(true);
    setL4Target(npcBonus);
    setAccumulatedScore((prev) => prev + npcBonus);
    setTurbAmp(0.6);

    timers.push(window.setTimeout(() => setTurbAmp(0.3), 1100));

    if (bd.friendBonusActive) {
      timers.push(
        window.setTimeout(() => {
          setFriendChipShown(true);
          const bonusDelta = bd.friendSum - bd.friendSumRaw;
          setL4Target(npcBonus + bonusDelta);
          setAccumulatedScore((prev) => prev + bonusDelta);
          setTurbAmp(0.55);
        }, 800),
      );
      timers.push(window.setTimeout(() => setTurbAmp(0.3), 1500));
    }

    if (hidden) {
      timers.push(
        window.setTimeout(() => {
          setHiddenChipsShown(true);
          // 히든 발현분(엄마×5/준혁×10/교수×3 적용)을 finalScore까지 끌어올림.
          setAccumulatedScore(score.finalScore);
        }, bd.friendBonusActive ? 1600 : 1100),
      );
    }

    const advDelay = bd.friendBonusActive ? 2200 : hidden ? 2000 : 1500;
    timers.push(window.setTimeout(() => advance(), advDelay));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [
    phase,
    npcBonus,
    bd.friendBonusActive,
    bd.friendSum,
    bd.friendSumRaw,
    hidden,
    score.finalScore,
    advance,
  ]);

  // === Phase 5: SCORE + GRADE ===
  useEffect(() => {
    if (phase !== 5) return;
    const timers: number[] = [];

    setTurbAmp(0.2); // 안정화
    setAccumulatedScore(score.finalScore);

    timers.push(
      window.setTimeout(() => {
        setScoreTarget(score.finalScore);
      }, 400),
    );

    timers.push(
      window.setTimeout(() => {
        setStampShown(true);
      }, 1900),
    );

    timers.push(window.setTimeout(() => setStampSettled(true), 2400));

    timers.push(window.setTimeout(() => advance(), 2800));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase, score.finalScore, advance]);

  // 카드 클릭으로 advance
  const onCardClick = () => {
    if (!isDone) advance();
  };

  return (
    <div
      className="flex flex-row items-start justify-center gap-4 mt-2 px-4 w-full max-w-[1280px]"
      data-testid="ending-stats-panel-animated"
      data-anim-phase={phase}
      onClick={onCardClick}
      role="presentation"
    >
      {/* 좌측 60% — 체온계 영역 */}
      <div className="flex flex-col items-center gap-1 flex-[6] min-w-0">
        <div className="flex flex-row items-end justify-center gap-2 md:gap-3 flex-nowrap overflow-x-auto px-2 py-0.5">
          {HEROINE_IDS.map((hid) => {
            const meta = HEROINES[hid];
            const value = thermValues[hid];
            const isWinner = winner === hid;
            const scale = isWinner ? SCALE_WINNER : SCALE_HEROINE;
            const bulbGlowFilter =
              isWinner && winnerBulbGlow
                ? 'drop-shadow(0 0 22px rgba(230, 65, 120, 0.95)) drop-shadow(0 0 36px rgba(255, 216, 107, 0.85))'
                : isWinner
                  ? 'drop-shadow(0 0 22px rgba(230, 65, 120, 0.95))'
                  : 'none';
            return (
              <div
                key={hid}
                className="flex flex-col items-center shrink-0"
                style={{ filter: bulbGlowFilter, transition: 'filter 250ms ease-out' }}
              >
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    height: THERM_DISPLAY_H * scale,
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
                {isWinner && (
                  <span
                    className="text-[10px] font-bold mt-1"
                    style={{
                      color: '#FFB8D1',
                      textShadow: '0 0 8px rgba(255, 184, 209, 0.8)',
                    }}
                  >
                    ★ Winner
                  </span>
                )}
                <span
                  className="text-[10px]"
                  style={{
                    color: 'rgba(220,220,225,0.6)',
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: 2,
                  }}
                >
                  {Math.round(value)}점
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 40% — 점수 카드 (액체 박스 + 라인 + SCORE/GRADE) */}
      <div
        className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl flex-[4] min-w-0 self-start relative"
        style={{
          background: hidden && hiddenChipsShown ? 'rgba(255, 216, 107, 0.06)' : 'rgba(255,255,255,0.06)',
          border:
            hidden && hiddenChipsShown
              ? '2px solid #FFD86B'
              : '1px solid rgba(255,255,255,0.18)',
          boxShadow:
            overflowActive
              ? '0 0 38px rgba(255,216,107,0.65), inset 0 0 18px rgba(255,216,107,0.22)'
              : hidden && hiddenChipsShown
                ? '0 0 28px rgba(255,216,107,0.55), inset 0 0 18px rgba(255,216,107,0.18)'
                : 'none',
          overflow: 'visible',
          minHeight: 280,
        }}
      >
        {/* 액체 레이어 — 카드 배경 */}
        <EndingLiquidBox
          fillPct={fillPct}
          turbulenceAmp={turbAmp}
          overflowActive={overflowActive}
        />

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
            data-testid="ending-anim-skip"
          >
            ▶▶ 스킵
          </button>
        )}

        {/* SCORE + GRADE */}
        <div
          className="flex flex-row items-center gap-4 w-full justify-center pb-2 border-b border-white/15 relative"
          style={{ zIndex: 2 }}
        >
          <div className="flex flex-col items-center">
            <div className="text-[11px] tracking-widest opacity-60">SCORE</div>
            <div
              className="text-4xl font-black tabular-nums"
              style={{
                color: 'rgba(255, 245, 250, 0.95)',
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
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
              data-testid="ending-anim-grade"
            >
              {score.grade}
            </div>
          </div>
        </div>

        {/* 단순화 5줄 */}
        <div className="flex flex-col text-xs gap-1 opacity-95 w-full relative" style={{ zIndex: 2 }}>
          {/* L1: Winner 호감도 × 엔딩가중 */}
          {winner && winnerShortName && categoryLabel && phase >= 1 && (
            <Row
              label={
                l1LabelWeighted
                  ? `Winner ${winnerShortName} 호감도 × 엔딩가중(×${bd.categoryMultiplier} ${categoryLabel})`
                  : `Winner ${winnerShortName} 호감도`
              }
              value={Math.round(l1Display)}
              chips={
                focusChipShown
                  ? [{ text: `× 집중 ${bd.focusMultiplier}`, gold: true }]
                  : []
              }
            />
          )}

          {/* L2: 핵심선택지 × 엔딩가중 */}
          {l2Visible && categoryLabel && (
            <Row
              label={`핵심선택지(${bd.winnerKeyCount}개) × 엔딩가중(×${bd.categoryMultiplier} ${categoryLabel})`}
              value={Math.round(l2Display)}
            />
          )}

          {/* L3: 그 외 히로인 호감도 */}
          {l3Visible && (
            <Row
              label="그 외 히로인 호감도"
              value={Math.round(l3Display)}
              divider
              chips={
                soloChipShown
                  ? [{ text: `× SOLO ${bd.soloPenaltyMultiplier}`, gold: true }]
                  : []
              }
            />
          )}

          {/* L4: 조연 보너스 */}
          {l4Visible && (
            <Row
              label="조연 보너스 (×0.3)"
              value={Math.round(l4Display)}
              divider
              chips={[
                ...(friendChipShown ? [{ text: `× 친목 ${bd.friendBonusMultiplier}`, gold: true }] : []),
                ...(hiddenChipsShown && bd.bestSonActive
                  ? [{ text: '★ 최고의 아들 ×5', gold: true }]
                  : []),
                ...(hiddenChipsShown && bd.junhyukActive
                  ? [{ text: '★★ 오준혁과 CC ×10', gold: true }]
                  : []),
                ...(hiddenChipsShown && bd.taehoBestActive
                  ? [{ text: '★ 해부학교실 APPLY ×3', gold: true }]
                  : []),
              ]}
            />
          )}
        </div>

        {/* 진행 힌트 */}
        {!isDone && (
          <div
            className="text-[9px] tracking-widest opacity-50 mt-1 relative"
            style={{ zIndex: 2 }}
          >
            클릭 또는 SPACE/ENTER로 진행 · ESC로 스킵
          </div>
        )}
      </div>
    </div>
  );
}

interface RowChip {
  text: string;
  gold?: boolean;
}

function Row({
  label,
  value,
  divider,
  chips = [],
}: {
  label: string;
  value: number | string;
  divider?: boolean;
  chips?: RowChip[];
}) {
  return (
    <div
      className="flex justify-between items-center gap-2 flex-wrap"
      style={{
        borderTop: divider ? '1px solid rgba(255,255,255,0.18)' : 'none',
        paddingTop: divider ? 4 : 0,
      }}
    >
      <div className="flex items-center gap-1 flex-wrap min-w-0">
        <span className="opacity-75 truncate">{label}</span>
        {chips.map((c, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
            style={{
              background: c.gold ? '#FFD86B' : 'rgba(255,255,255,0.18)',
              color: c.gold ? '#3A2E3F' : '#fff',
              transition: 'opacity 250ms ease-out',
            }}
          >
            {c.text}
          </span>
        ))}
      </div>
      <span className="tabular-nums font-semibold">{value}</span>
    </div>
  );
}
