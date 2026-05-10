/**
 * 엔딩 통계 패널 — EndingScreen에서 H 5명 호감도(메인 row) + NPC 토글 + 점수·등급 표시.
 *
 * (2026-05-09 endings-results-revamp 라운드 — PM 승인 plan 반영)
 *
 * 점수 공식 (PM 결정 2026-05-09 — 캡 해제 + 카테고리 배수 + 6종 보너스):
 *
 *   1) base       = heroineSum + winnerBonus(×1.0) + keyChoiceBonus(×5) + npcBonus(×0.3)
 *   2) tiered     = base × ENDING_MULTIPLIER[category]   (TRUE 2.0 / HAPPY 1.5 / NORMAL 1.0 / BAD 0.7 / REJECT 0.6 / SOLO 0.8)
 *   3) additive   = focus(+50) + pure(+20) + completion(+15) + friend(+25)  (조건 미달 시 0)
 *      - focus      : 윈너 호감도 - 2위 호감도 ≥ 40
 *      - pure       : NPC 7명 합 ≤ 200
 *      - completion : 모든 H ≥ 30
 *      - friend     : 친구 5명 중 4명 이상 ≥ 40
 *   4) raw        = tiered + additive
 *   5) multiplicativeFactor = (×5 if 엄마 max) × (×10 if 오준혁 max) — 히든 이스터에그
 *      - mom 또는 junhyuk이 H+NPC 12명 중 max(동률 max 포함)이면 발현
 *   6) finalScore = raw × multiplicativeFactor
 *
 * 등급 컷: 시뮬 스크립트(scripts/simulateEndingScores.ts)가 산출한 분포 기반 (D-2 단계에서 교체).
 *   1차안(임시): S≥1500, A≥1000, B≥600, C≥300, D<300.
 *
 * 표시: H 5명 메인 row(윈너 강조) + "친구·가족·교수 ▾" 토글 + 점수 카드(SCORE/GRADE/breakdown 가변).
 *       히든 보너스 발현 시 점수 카드 외곽 골드 강조 + 라벨 칩 노출.
 */

import type { EndingId, GameFlags } from '@/engine/types';
import { HEROINE_IDS } from '@/engine/types';
import type { EndingCategory } from '@/data/endings';
import { HEROINES } from '@/data/characters';
import { AffectionThermometer } from './AffectionThermometer';
import { computeEndingScore, type EndingGrade } from '@/engine/endingScore';

// computeEndingScore + EndingScore + EndingScoreBreakdown은 @/engine/endingScore SSoT
// (시뮬 스크립트와 공유). 본 파일은 표시 책임만.
export { computeEndingScore } from '@/engine/endingScore';
export type { EndingScore, EndingScoreBreakdown, EndingGrade } from '@/engine/endingScore';

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

// 사용자 결정 2026-05-09 v3: 좌측 온도계 + 우측 점수표 60:40 + 라벨 간격 축소.
// (조연 호감도 그리드는 EndingScreen으로 이동 — PM 결정 2026-05-10)
//   윈너 (Winner): scale 0.95 (강조)
//   다른 히로인: scale 0.78
const SCALE_WINNER = 0.95;
const SCALE_HEROINE = 0.78;
const THERM_DISPLAY_H = 460;

export function EndingStatsPanel({ flags, endingId }: { flags: GameFlags; endingId: EndingId }) {
  const score = computeEndingScore(flags, endingId);
  const winner = score.breakdown.winner;
  const gradeColor = GRADE_COLOR[score.grade];
  const hidden = score.hiddenBonusLabels.length > 0;
  const bd = score.breakdown;

  const winnerShortName = winner ? HEROINES[winner].shortName ?? HEROINES[winner].name : null;

  return (
    <div
      className="flex flex-row items-start justify-center gap-4 mt-2 px-4 w-full max-w-[1280px]"
      data-testid="ending-stats-panel"
    >
      {/* 좌측 60% — 온도계 영역 (히로인 메인 row + 조연 토글) */}
      <div className="flex flex-col items-center gap-1 flex-[6] min-w-0">
        {/* 히로인 5명 메인 row */}
        <div className="flex flex-row items-end justify-center gap-2 md:gap-3 flex-nowrap overflow-x-auto px-2 py-0.5">
          {HEROINE_IDS.map((hid) => {
            const meta = HEROINES[hid];
            const value = flags[hid];
            const isWinner = winner === hid;
            const scale = isWinner ? SCALE_WINNER : SCALE_HEROINE;
            return (
              <div
                key={hid}
                className="flex flex-col items-center shrink-0"
                style={{
                  filter: isWinner ? 'drop-shadow(0 0 22px rgba(230, 65, 120, 0.95))' : 'none',
                }}
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
                  <span className="text-[10px] font-bold mt-1" style={{ color: '#FFB8D1', textShadow: '0 0 8px rgba(255, 184, 209, 0.8)' }}>
                    ★ Winner
                  </span>
                )}
                <ValueLabel value={value} />
              </div>
            );
          })}
        </div>

        {/* 조연 더보기 토글은 EndingScreen으로 이동 (PM 결정 2026-05-10). */}
      </div>

      {/* 우측 40% — 점수 카드 (히든 발현 시 골드 강조) */}
      <div
        className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl flex-[4] min-w-0 self-start"
        style={{
          background: hidden ? 'rgba(255, 216, 107, 0.06)' : 'rgba(255,255,255,0.06)',
          border: hidden ? '2px solid #FFD86B' : '1px solid rgba(255,255,255,0.18)',
          boxShadow: hidden ? '0 0 28px rgba(255,216,107,0.55), inset 0 0 18px rgba(255,216,107,0.18)' : 'none',
        }}
      >
        {/* SCORE + GRADE 가로 (점수표 우측 폭 좁아 가로로 배치 유지) */}
        <div className="flex flex-row items-center gap-4 w-full justify-center pb-2 border-b border-white/15">
          <div className="flex flex-col items-center">
            <div className="text-[11px] tracking-widest opacity-60">SCORE</div>
            <div
              className="text-4xl font-black tabular-nums"
              style={{ color: 'rgba(255, 245, 250, 0.95)', fontVariantNumeric: 'tabular-nums' }}
            >
              {Math.round(score.finalScore)}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[11px] tracking-widest opacity-60">GRADE</div>
            <div
              className="text-5xl font-black leading-none"
              style={{
                color: gradeColor,
                textShadow: `0 0 18px ${gradeColor}aa, 0 2px 6px rgba(0,0,0,0.4)`,
              }}
            >
              {score.grade}
            </div>
          </div>
        </div>

        {hidden && (
          <div className="flex flex-row gap-1 flex-wrap justify-center">
            {score.hiddenBonusLabels.map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: '#FFD86B', color: '#3A2E3F' }}
              >
                ★ {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col text-xs gap-0.5 opacity-90 w-full">
          {/* 윈너 분해 */}
          {bd.winner && bd.category && winnerShortName && (
            <>
              <Row
                label={`Winner ${winnerShortName} (호감도 + 핵심선택지×10)`}
                value={`${bd.winnerAff} + ${bd.winnerKeyBonus}`}
              />
              <Row
                label={`× 엔딩 가중 (${CATEGORY_LABEL[bd.category]} ×${bd.categoryMultiplier})`}
                value={Math.round((bd.winnerAff + bd.winnerKeyBonus) * bd.categoryMultiplier * 10) / 10}
              />
              {bd.focusActive && (
                <Row label={`× 집중 (격차≥40, ×${bd.focusMultiplier})`} value={`+${Math.round(bd.perPerson[bd.winner] - (bd.winnerAff + bd.winnerKeyBonus) * bd.categoryMultiplier)}`} highlight />
              )}
              <Row
                label={`= Winner 점수`}
                value={Math.round(bd.perPerson[bd.winner])}
                divider
              />
            </>
          )}

          {/* 히로인 합 + SOLO 페널티 */}
          <Row label="히로인 합 (5명)" value={Math.round(bd.heroineSum)} />
          {bd.soloPenaltyActive && (
            <Row
              label={`× SOLO 페널티 (×${bd.soloPenaltyMultiplier})`}
              value={Math.round(bd.hTotal)}
              highlight
            />
          )}

          {/* 조연 — 친구합 + 친목 + 엄마/교수 (모두 ×0.3 적용된 후) */}
          <Row
            label="친구 합 (5, ×0.3)"
            value={Math.round(bd.friendSumRaw)}
            divider
          />
          {bd.friendBonusActive && (
            <Row label={`× 친목 (4명≥40, ×${bd.friendBonusMultiplier})`} value={Math.round(bd.friendSum)} highlight />
          )}

          <Row label="엄마 (×0.3)" value={Math.round(bd.perPerson.mom)} divider />
          <Row label="교수 (×0.3)" value={Math.round(bd.perPerson.taeho)} />

          {/* 히든 발현 라벨 */}
          {(bd.bestSonActive || bd.junhyukActive || bd.taehoBestActive) && (
            <div className="border-t border-white/20 pt-1 mt-0.5 flex flex-col gap-0.5">
              {bd.bestSonActive && <Row label="★ 최고의 아들 (엄마 max)" value="×5" highlight />}
              {bd.junhyukActive && <Row label="★★ 오준혁과 CC (오준혁 max)" value="×10" highlight />}
              {bd.taehoBestActive && <Row label="★ 해부학교실 APPLY (교수 max)" value="×3" highlight />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  divider,
  highlight,
}: {
  label: string;
  value: number | string;
  divider?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex justify-between gap-3"
      style={{
        borderTop: divider ? '1px solid rgba(255,255,255,0.18)' : 'none',
        paddingTop: divider ? 4 : 0,
        color: highlight ? '#FFD86B' : undefined,
        fontWeight: highlight ? 700 : undefined,
      }}
    >
      <span className="opacity-70">{label}</span>
      <span className="tabular-nums font-semibold">{value}</span>
    </div>
  );
}

function ValueLabel({ value }: { value: number }) {
  if (value > 100) {
    return (
      <span
        className="text-[10px]"
        style={{
          color: '#FFD86B',
          fontVariantNumeric: 'tabular-nums',
          marginTop: 2,
          fontWeight: 700,
          textShadow: '0 0 6px rgba(255,216,107,0.6)',
        }}
      >
        {value}점 (+{value - 100})
      </span>
    );
  }
  return (
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
  );
}
