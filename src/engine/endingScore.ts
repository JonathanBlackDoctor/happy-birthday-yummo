/**
 * 엔딩 점수 산정 — 순수 로직 모듈 (인물별 곱셈 모델 v4).
 *
 * EndingStatsPanel + 시뮬 스크립트(scripts/simulateEndingScores.ts)가 본 모듈을 import.
 *
 * 점수 공식 (PM 결정 2026-05-10 v4 — 보너스 NPC 발동 조건 변경):
 *
 *   각 인물별 점수:
 *     히로인 윈너 : (호감도 + 윈너핵심선택지×10) × 엔딩가중배수 × 집중배수
 *                 엔딩가중: TRUE 2 / HAPPY 1.5 / NORMAL 1 / BAD 0.7 / REJECT 0.6
 *                 집중배수: 윈너 호감도 - 2위 호감도 ≥ 40 → ×1.2, else ×1
 *     히로인 비윈너: 호감도 (×1)
 *     조연 (친구 5 + 엄마 + 교수 = 7명) — 호감도에 ×0.3 가중치 먼저 적용한 뒤 곱셈 보너스:
 *       엄마    : 호감도 × 0.3 × (5  if  flags.mom     ≥ 100, else 1)  ← 최고의 아들
 *       오준혁  : 호감도 × 0.3 × (10 if  flags.junhyuk ≥ 100, else 1)  ← 오준혁과 CC (히든)
 *       교수    : 호감도 × 0.3 × (3  if  flags.taeho   ≥ 100, else 1)  ← 해부학교실 APPLY
 *       기타 친구 (gyumin, gyeongmin, nathan, wook): 호감도 × 0.3
 *
 *     ※ 옛 룰(2026-05-09 v3)은 "12명 중 max"였는데, 보너스 NPC들의 active 자리 부족으로
 *       발동이 사실상 불가능했던 문제를 해결. 신 룰은 "해당 NPC 호감도 ≥ 임계(100)" 단독 평가.
 *       임계 100은 NPC 매트릭스 +15 멀티플라이어 기준 약 3~4회 매치 픽 시 도달 가능.
 *
 *   친구 5명 합 (각자 ×0.3 + 오준혁 max if 발현 적용된 후) × 친목배수
 *     친목배수: 친구 5명 중 4명 이상 호감도 ≥ 40 → ×1.3, else ×1
 *
 *   SOLO 처리 (윈너 없음):
 *     히로인 5명 합 × 0.8 (SOLO 페널티 — 히로인 합에만 적용, 조연은 그대로)
 *
 *   finalScore = 히로인합(SOLO 적용) + 친구합(친목 적용) + 엄마 점수 + 교수 점수
 */

import type { AffinityTargetId, EndingId, GameFlags, HeroineId } from './types';
import { HEROINE_IDS } from './types';
import { findEnding } from '@/data/endings';
import type { EndingCategory } from '@/data/endings';

export type EndingGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface EndingScoreBreakdown {
  // 인물별 산출 점수 (모든 보너스 적용 후, 표시용)
  perPerson: Record<AffinityTargetId, number>;

  // 윈너 (H) 분해
  winner: HeroineId | null;
  winnerAff: number;
  winnerKeyCount: number;
  winnerKeyBonus: number;        // = winnerKeyCount × 10
  category: EndingCategory | null;
  categoryMultiplier: number;
  focusActive: boolean;
  focusMultiplier: number;        // 1.2 if focus, else 1

  // H 합산
  heroineSum: number;             // 5명 인물별 점수 합 (SOLO 페널티 미적용)
  soloPenaltyActive: boolean;
  soloPenaltyMultiplier: number;  // 0.8 if SOLO, else 1
  hTotal: number;                 // = heroineSum × soloPenaltyMultiplier

  // 친구 합산
  friendCountGe40: number;
  friendBonusActive: boolean;
  friendBonusMultiplier: number;  // 1.3 if friend bonus, else 1
  friendSumRaw: number;           // 친구 5명 점수 합(오준혁 max 보너스 포함된 후)
  friendSum: number;              // = friendSumRaw × friendBonusMultiplier

  // 단독 NPC
  bestSonActive: boolean;         // mom max
  taehoBestActive: boolean;       // taeho max
  junhyukActive: boolean;         // junhyuk max
}

export interface EndingScore {
  finalScore: number;
  grade: EndingGrade;
  breakdown: EndingScoreBreakdown;
  hiddenBonusLabels: string[];    // 시각 강조용 (★ 최고의 아들 / ★★ 오준혁과 CC / ★ 해부학교실 APPLY)
}

export const ENDING_MULTIPLIER: Record<EndingCategory, number> = {
  TRUE: 2.0,
  HAPPY: 1.5,
  NORMAL: 1.0,
  BAD: 0.7,
  REJECT: 0.6,
  SOLO: 1.0,  // 윈너 없음 → SOLO 페널티는 H 합에 따로 ×0.8 적용
};

const FRIEND_IDS: ReadonlyArray<Exclude<AffinityTargetId, HeroineId>> = [
  'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk',
];

/** 조연(친구 5 + 엄마 + 교수) 호감도에 적용하는 베이스 가중치 (PM 결정 2026-05-09 v3). */
export const SUPPORTING_WEIGHT = 0.3;

const NPC_BONUS_MULTIPLIER = {
  mom: 5,
  junhyuk: 10,
  taeho: 3,
} as const;

/**
 * 보너스 NPC 발동 임계 (2026-05-11 PM 결정 v5).
 * 해당 NPC 호감도가 이 값 이상이면 NPC_BONUS_MULTIPLIER 발동.
 *
 * 옛 룰 (v3, 2026-05-09): 12명 중 max → 사실상 발동 불가능
 * 옛 룰 (v4, 2026-05-10): NPC 자체 호감도 ≥ 100 단독 평가
 * 신 룰 (v5, 2026-05-11): per-NPC 이론상 최대 도달값으로 설정. "최선 플레이" 보상 룰.
 *
 * 도달성 출처 (NPC_GAIN_MULTIPLIER ×15 + coFire 적용 후 best-pick 합산):
 *   - mom 90:     prologue_01_home(warm +45 신설, 2026-05-11) + prologue_02_train(warm +45)
 *   - junhyuk 75: ch01_05_cafe(warm 옵션C +45) + ch02_02_cadaver_first(옵션A junhyuk-only +30)
 *   - taeho 75:   ch02_02_cadaver_first(옵션B taeho-only +30) + ch02_03_biochem_lab(mature +45)
 *
 * ⚠️ 시나리오 확장 시 본 표를 갱신해야 함 — 베스트 픽 합산이 임계와 정확히 일치해야 발동 가능.
 */
export const NPC_BONUS_THRESHOLD = {
  mom: 90,
  junhyuk: 75,
  taeho: 75,
} as const;

/**
 * 등급 컷 — 시뮬 스크립트(scripts/simulateEndingScores.ts) v3 분포 기반 + 50의 배수 정리.
 *
 * v3 시뮬 분포 (90 케이스, 조연 ×0.3 가중치 적용 후):
 *   TRUE   337– 657 (med 520)
 *   HAPPY  290– 508 (med 420)
 *   NORMAL 145– 387 (med 302)
 *   BAD    136– 323 (med 243)
 *   REJECT  90– 266 (med 194)
 *   SOLO    34– 173 (med 133)
 *
 * 컷 의도 (50의 배수 정리):
 *   S = TRUE 상위 절반 (≥550) — 조연 ×0.3 적용으로 컷 하향
 *   A = HAPPY 상위 절반 (≥400) — TRUE 대부분 A 이상
 *   B = NORMAL 상위 절반 (≥300) — NORMAL 절반 B 이상
 *   C = BAD/REJECT 상위 절반 (≥200) — 페널티 카테고리는 C가 평균
 *   D = SOLO 다수 (<200)
 *
 * 히든 발현(엄마×5/오준혁×10/교수×3) 시 조연 가중 ×0.3 결합으로
 *   엄마 max: 호감도 × 0.3 × 5 = ×1.5 실효 → 점수 +수십%
 *   오준혁 max: 호감도 × 0.3 × 10 = ×3 실효 → 점수 +수십%
 *   교수 max: 호감도 × 0.3 × 3 = ×0.9 실효 → 거의 영향 없음(이스터에그 톤)
 */
export const GRADE_CUTS: Readonly<Record<EndingGrade, number>> = {
  S: 550,
  A: 400,
  B: 300,
  C: 200,
  D: 0,
};

export function computeEndingScore(flags: GameFlags, endingId: EndingId): EndingScore {
  const meta = findEnding(endingId);
  const winner = meta?.heroine ?? null;
  const category = meta?.category ?? null;
  const isSolo = endingId === 'END_SOLO_SUMMER';

  // 보너스 NPC 발동 — 임계 평가 (v4, 2026-05-10).
  // 옛 v3은 "12명 중 max" 판정이었으나 NPC active 자리 부족으로 발동 불가능 → 단독 임계 평가로 변경.
  const bestSonActive = flags.mom >= NPC_BONUS_THRESHOLD.mom;
  const taehoBestActive = flags.taeho >= NPC_BONUS_THRESHOLD.taeho;
  const junhyukActive = flags.junhyuk >= NPC_BONUS_THRESHOLD.junhyuk;

  // 카테고리 배수 + 집중 보너스 (윈너에만)
  const categoryMultiplier = category ? ENDING_MULTIPLIER[category] : 1.0;
  const heroineSorted = [flags.H1, flags.H2, flags.H3, flags.H4, flags.H5].sort((a, b) => b - a);
  const focusActive = winner !== null && (heroineSorted[0] - heroineSorted[1] >= 40);
  const focusMultiplier = focusActive ? 1.2 : 1.0;

  // 인물별 점수 산출
  const perPerson: Record<AffinityTargetId, number> = {
    H1: 0, H2: 0, H3: 0, H4: 0, H5: 0,
    gyumin: 0, gyeongmin: 0, nathan: 0, wook: 0, junhyuk: 0, mom: 0, taeho: 0,
  };

  let winnerAff = 0;
  let winnerKeyCount = 0;
  let winnerKeyBonus = 0;

  // H 5명
  for (const h of HEROINE_IDS) {
    const aff = flags[h];
    if (h === winner) {
      winnerAff = aff;
      winnerKeyCount = flags.key_choices[h].length;
      winnerKeyBonus = winnerKeyCount * 10;
      perPerson[h] = (aff + winnerKeyBonus) * categoryMultiplier * focusMultiplier;
    } else {
      perPerson[h] = aff;
    }
  }

  // 조연 7명 — 호감도 × SUPPORTING_WEIGHT(0.3) 먼저 적용 후 단독 곱셈 보너스
  perPerson.mom = flags.mom * SUPPORTING_WEIGHT * (bestSonActive ? NPC_BONUS_MULTIPLIER.mom : 1);
  perPerson.junhyuk = flags.junhyuk * SUPPORTING_WEIGHT * (junhyukActive ? NPC_BONUS_MULTIPLIER.junhyuk : 1);
  perPerson.taeho = flags.taeho * SUPPORTING_WEIGHT * (taehoBestActive ? NPC_BONUS_MULTIPLIER.taeho : 1);
  perPerson.gyumin = flags.gyumin * SUPPORTING_WEIGHT;
  perPerson.gyeongmin = flags.gyeongmin * SUPPORTING_WEIGHT;
  perPerson.nathan = flags.nathan * SUPPORTING_WEIGHT;
  perPerson.wook = flags.wook * SUPPORTING_WEIGHT;

  // H 합 + SOLO 페널티
  const heroineSum = perPerson.H1 + perPerson.H2 + perPerson.H3 + perPerson.H4 + perPerson.H5;
  const soloPenaltyActive = isSolo;
  const soloPenaltyMultiplier = soloPenaltyActive ? 0.8 : 1.0;
  const hTotal = heroineSum * soloPenaltyMultiplier;

  // 친구 합 + 친목 보너스 (오준혁 max 보너스 이미 perPerson.junhyuk에 적용됨)
  const friendSumRaw = FRIEND_IDS.reduce((sum, id) => sum + perPerson[id], 0);
  const friendCountGe40 = FRIEND_IDS.filter((id) => flags[id] >= 40).length;
  const friendBonusActive = friendCountGe40 >= 4;
  const friendBonusMultiplier = friendBonusActive ? 1.3 : 1.0;
  const friendSum = friendSumRaw * friendBonusMultiplier;

  // 최종
  const finalScore = hTotal + friendSum + perPerson.mom + perPerson.taeho;

  // 등급
  const grade: EndingGrade =
    finalScore >= GRADE_CUTS.S ? 'S' :
    finalScore >= GRADE_CUTS.A ? 'A' :
    finalScore >= GRADE_CUTS.B ? 'B' :
    finalScore >= GRADE_CUTS.C ? 'C' : 'D';

  const hiddenBonusLabels: string[] = [];
  if (bestSonActive) hiddenBonusLabels.push('최고의 아들');
  if (taehoBestActive) hiddenBonusLabels.push('해부학교실 APPLY');
  if (junhyukActive) hiddenBonusLabels.push('오준혁과 CC');

  return {
    finalScore,
    grade,
    breakdown: {
      perPerson,
      winner,
      winnerAff,
      winnerKeyCount,
      winnerKeyBonus,
      category,
      categoryMultiplier,
      focusActive,
      focusMultiplier,
      heroineSum,
      soloPenaltyActive,
      soloPenaltyMultiplier,
      hTotal,
      friendCountGe40,
      friendBonusActive,
      friendBonusMultiplier,
      friendSumRaw,
      friendSum,
      bestSonActive,
      taehoBestActive,
      junhyukActive,
    },
    hiddenBonusLabels,
  };
}
