/**
 * 호감도 단계 분류 — PauseMenu의 AffectionStatusPanel에서 별 1~5로 표시.
 *
 * 숨김 수치(0~100)를 5단계로 환산. 정확한 수치(67 등)는 노출하지 않음.
 * 40·60·80 경계는 STORY-BIBLE.md §6.3 노멀/해피/트루 분기점과 정합.
 */

export interface AffectionStage {
  /** 1~5. 별 채워진 개수. */
  stars: number;
  /** UI 라벨 — 별과 함께 또는 단독으로 표시. */
  label: string;
  /** 범위 바닥 (포함). */
  min: number;
  /** 범위 상한 (미포함, 단 100은 포함). */
  max: number;
}

const STAGES: readonly AffectionStage[] = [
  { stars: 1, label: '낯섦', min: 0, max: 20 },
  { stars: 2, label: '호기심', min: 20, max: 40 },
  { stars: 3, label: '호감', min: 40, max: 60 },
  { stars: 4, label: '따뜻함', min: 60, max: 80 },
  { stars: 5, label: '운명', min: 80, max: 101 },
] as const;

export function affectionStage(value: number): AffectionStage {
  const v = Math.max(0, Math.min(100, value));
  for (const s of STAGES) {
    if (v >= s.min && v < s.max) return s;
  }
  return STAGES[0];
}

export const ALL_AFFECTION_STAGES = STAGES;
