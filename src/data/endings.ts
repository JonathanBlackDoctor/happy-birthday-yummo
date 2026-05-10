/**
 * 16개 엔딩 카탈로그 — BRANCH-GRAPH.md §2 SSoT 미러.
 *
 * 분포:
 *   H1 차세린: TRUE / HAPPY / NORMAL / BAD (4)
 *   H2 윤하정: TRUE / HAPPY / NORMAL / BAD (4)
 *   H3 한설  : TRUE / HAPPY / NORMAL       (3, BAD 없음)
 *   H4 나서윤: TRUE / NORMAL / REJECT      (3, BAD 자리 REJECT 흡수)
 *   H5 장윤영: TRUE                         (1, 단일 엔딩)
 *   END_SOLO_SUMMER: 혼자 여름방학          (1, 16번째)
 */

import type { EndingId, HeroineId } from '@/engine/types';

export type EndingCategory = 'TRUE' | 'HAPPY' | 'NORMAL' | 'BAD' | 'REJECT' | 'SOLO';

export interface EndingMeta {
  id: EndingId;
  heroine: HeroineId | null;
  category: EndingCategory;
  title: string;
  subtitle?: string;
}

export const ENDING_CATALOG: readonly EndingMeta[] = [
  // 세린 (H1)
  { id: 'END_H1_TRUE', heroine: 'H1', category: 'TRUE', title: '세린 / TRUE', subtitle: '내과의 봄' },
  { id: 'END_H1_HAPPY', heroine: 'H1', category: 'HAPPY', title: '세린 / HAPPY' },
  { id: 'END_H1_NORMAL', heroine: 'H1', category: 'NORMAL', title: '세린 / NORMAL' },
  { id: 'END_H1_BAD', heroine: 'H1', category: 'BAD', title: '세린 / BAD' },
  // 하정 (H2)
  { id: 'END_H2_TRUE', heroine: 'H2', category: 'TRUE', title: '하정 / TRUE' },
  { id: 'END_H2_HAPPY', heroine: 'H2', category: 'HAPPY', title: '하정 / HAPPY' },
  { id: 'END_H2_NORMAL', heroine: 'H2', category: 'NORMAL', title: '하정 / NORMAL' },
  { id: 'END_H2_BAD', heroine: 'H2', category: 'BAD', title: '하정 / BAD' },
  // 한설 (H3)
  { id: 'END_H3_TRUE', heroine: 'H3', category: 'TRUE', title: '한설 / TRUE' },
  { id: 'END_H3_HAPPY', heroine: 'H3', category: 'HAPPY', title: '한설 / HAPPY' },
  { id: 'END_H3_NORMAL', heroine: 'H3', category: 'NORMAL', title: '한설 / NORMAL' },
  // 서윤 (H4)
  { id: 'END_H4_TRUE', heroine: 'H4', category: 'TRUE', title: '서윤 / TRUE', subtitle: '성서의 봄' },
  { id: 'END_H4_NORMAL', heroine: 'H4', category: 'NORMAL', title: '서윤 / NORMAL', subtitle: '느린 답장' },
  { id: 'END_H4_REJECT', heroine: 'H4', category: 'REJECT', title: '서윤 / REJECT', subtitle: '답장이 늦어서' },
  // 윤영 (H5)
  { id: 'END_H5_TRUE', heroine: 'H5', category: 'TRUE', title: '윤영 / TRUE' },
  // 단독
  { id: 'END_SOLO_SUMMER', heroine: null, category: 'SOLO', title: '혼자 여름방학 / SOLO' },
] as const;

export const ENDING_COUNT = ENDING_CATALOG.length; // 컴파일 타임 검증용
if (ENDING_COUNT !== 16) {
  // dev-only sanity (런타임 검증). 16 미달이면 BRANCH-GRAPH §2와 불일치
  console.warn(`[endings] expected 16, got ${ENDING_COUNT}`);
}

export function findEnding(id: EndingId): EndingMeta | undefined {
  return ENDING_CATALOG.find((e) => e.id === id);
}

/**
 * 엔딩 ID → 엔딩 씬 ID 매핑.
 * EVALUATE_BRANCH(즉시 종결 케이스)와 EVALUATE_TIER(챕터 6 끝)에서 사용.
 * 모든 키가 EndingId로 강제되어 16개 누락 시 컴파일 에러로 검출된다.
 */
export const ENDING_SCENE_MAP: Record<EndingId, string> = {
  END_H1_TRUE: 'ch06_h1_true',
  END_H1_HAPPY: 'ch06_h1_happy',
  END_H1_NORMAL: 'ch06_h1_normal',
  END_H1_BAD: 'ch06_h1_bad',
  END_H2_TRUE: 'ch06_h2_true',
  END_H2_HAPPY: 'ch06_h2_happy',
  END_H2_NORMAL: 'ch06_h2_normal',
  END_H2_BAD: 'ch06_h2_bad',
  END_H3_TRUE: 'ch06_h3_true',
  END_H3_HAPPY: 'ch06_h3_happy',
  END_H3_NORMAL: 'ch06_h3_normal',
  END_H4_TRUE: 'ch06_h4_true',
  END_H4_NORMAL: 'ch06_h4_normal',
  END_H4_REJECT: 'ch06_h4_reject',
  END_H5_TRUE: 'ch06_h5_true',
  END_SOLO_SUMMER: 'end_solo_summer_main',
};

/**
 * 챕터 5 끝 evaluateRoute가 winner를 결정한 뒤 진입할 챕터 6 시작 씬.
 * H1~H5 각 라우트의 첫 씬. 모든 HeroineId가 강제되어 누락 시 컴파일 에러.
 */
export const CHAPTER6_START_MAP: Record<HeroineId, string> = {
  H1: 'ch06_h1_01_festival_visit',
  H2: 'ch06_h2_01_festival_booth',
  H3: 'ch06_h3_01_festival_booth',
  H4: 'ch06_h4_01_open',
  H5: 'ch06_h5_01_festival_booth',
};
