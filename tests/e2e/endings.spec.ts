/**
 * 16개 엔딩 자동 도달 E2E 테스트 — QA-PLAN.md §1.1 SSoT.
 *
 * 진입 전략 (2026-05-09 2-단계 라우팅 + 2026-05-10 신 임계 갱신 후):
 *   - **TRUE 5건**: ch05_07_close + flags 주입 → EVALUATE_BRANCH(1단계) → Ch.6 본편 자동 traverse(NARR/MONO/DIAL/CHOICE/KAKAO/CG/VIDEO + INC 누적) → EVALUATE_TIER(2단계) → 엔딩 씬 → ENDING. 라우팅 검증.
 *   - **HAPPY/NORMAL/BAD 8건**: Ch.6 끝 evaluate 씬에 직접 진입 → EVALUATE_TIER(2단계) → 엔딩 씬 → ENDING. 임계 검증 (Ch.6 본편 INC 누적이 의도 티어를 밀어올리는 회귀 회피).
 *   - **REJECT/SOLO 2건**: ch05_07_close + flags 주입 → EVALUATE_BRANCH 즉시 종결 라우팅 → 엔딩 씬. 라우팅 검증.
 *
 * 임계: scriptInterpreter.determineEnding (2026-05-09 endings-results-revamp 라운드 PM 결정 신 임계).
 */

import { test } from '@playwright/test';
import { expectEnding, gotoEndingFromCh05, gotoEndingFromEvaluate } from './helpers';

// 호감도 + 키 선택 매트릭스 (BRANCH-GRAPH §6.1 + scriptInterpreter.determineEnding 정합)
const KEYS_3 = (h: 'H1' | 'H2' | 'H3' | 'H4' | 'H5') => ({
  [h]: [`${h.toLowerCase()}_k1`, `${h.toLowerCase()}_k2`, `${h.toLowerCase()}_k3`],
});
const KEYS_2 = (h: 'H1' | 'H2' | 'H3' | 'H4' | 'H5') => ({
  [h]: [`${h.toLowerCase()}_k1`, `${h.toLowerCase()}_k2`],
});

test.describe('H1 차세린 4종 엔딩', () => {
  test('END_H1_TRUE: H1≥105, keys≥3 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h1_04_evaluate', { H1: 110, key_choices: KEYS_3('H1') });
    await expectEnding(page, 'END_H1_TRUE');
  });

  test('END_H1_HAPPY: H1≥90 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h1_04_evaluate', { H1: 95, key_choices: KEYS_2('H1') });
    await expectEnding(page, 'END_H1_HAPPY');
  });

  test('END_H1_NORMAL: H1=70~89', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h1_04_evaluate', { H1: 80 });
    await expectEnding(page, 'END_H1_NORMAL');
  });

  test('END_H1_BAD: H1<70', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h1_04_evaluate', { H1: 50 });
    await expectEnding(page, 'END_H1_BAD');
  });
});

test.describe('H2 윤하정 4종 엔딩', () => {
  test('END_H2_TRUE: H2≥110, keys≥3 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h2_05_evaluate', { H2: 115, key_choices: KEYS_3('H2') });
    await expectEnding(page, 'END_H2_TRUE');
  });

  test('END_H2_HAPPY: H2≥95 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h2_05_evaluate', { H2: 100, key_choices: KEYS_2('H2') });
    await expectEnding(page, 'END_H2_HAPPY');
  });

  test('END_H2_NORMAL: H2=75~94', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h2_05_evaluate', { H2: 85 });
    await expectEnding(page, 'END_H2_NORMAL');
  });

  test('END_H2_BAD: H2<75', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h2_05_evaluate', { H2: 50 });
    await expectEnding(page, 'END_H2_BAD');
  });
});

test.describe('H3 한설 3종 엔딩 (BAD 없음 — NORMAL fallback)', () => {
  test('END_H3_TRUE: H3≥90, keys≥3 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h3_04_evaluate', { H3: 95, key_choices: KEYS_3('H3') });
    await expectEnding(page, 'END_H3_TRUE');
  });

  test('END_H3_HAPPY: H3≥75 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h3_04_evaluate', { H3: 80, key_choices: KEYS_2('H3') });
    await expectEnding(page, 'END_H3_HAPPY');
  });

  test('END_H3_NORMAL: H3<75 (BAD 자리도 NORMAL로 흡수)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h3_04_evaluate', { H3: 50 });
    await expectEnding(page, 'END_H3_NORMAL');
  });
});

test.describe('H4 나서윤 3종 엔딩 (BAD 자리는 REJECT가 흡수)', () => {
  test('END_H4_TRUE: H4≥95, keys≥3, late_reply=0', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h4_07_evaluate', {
      H4: 100,
      late_reply_count: 0,
      key_choices: KEYS_3('H4'),
    });
    await expectEnding(page, 'END_H4_TRUE');
  });

  test('END_H4_NORMAL: H4=70~94, late_reply<1', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h4_07_evaluate', {
      H4: 80,
      late_reply_count: 0,
    });
    await expectEnding(page, 'END_H4_NORMAL');
  });

  test('END_H4_REJECT: late_reply_count≥1 (호감도 무관 우선 평가)', async ({ page }) => {
    await gotoEndingFromCh05(page, {
      H4: 90, // 높아도 답장 지연이 우선
      late_reply_count: 2,
    });
    await expectEnding(page, 'END_H4_REJECT');
  });
});

test.describe('H5 장윤영 1종 엔딩 (TRUE만)', () => {
  test('END_H5_TRUE: H5≥120, keys≥3 (신 임계)', async ({ page }) => {
    await gotoEndingFromEvaluate(page, 'ch06_h5_06_evaluate', { H5: 125, key_choices: KEYS_3('H5') });
    await expectEnding(page, 'END_H5_TRUE');
  });
});

test.describe('단독 엔딩', () => {
  test('END_SOLO_SUMMER: 모든 호감도 <30', async ({ page }) => {
    await gotoEndingFromCh05(page, { H1: 25, H2: 25, H3: 25, H4: 25, H5: 25 });
    await expectEnding(page, 'END_SOLO_SUMMER');
  });
});
