/**
 * Playwright E2E 헬퍼.
 *
 * 게임 진입 패턴:
 *   - querystring `?scene=<id>&flags=<encoded JSON>`로 임의 씬 + 호감도 직접 주입
 *   - App.tsx의 `applyTestFlagsFromUrl()`이 startScene 전에 호감도 주입 적용
 *   - window.__gameStore로 런타임 직접 조작 가능
 *
 * 16개 엔딩 도달 전략 (2-단계 라우팅, 2026-05-09 Ch5 엔딩 라우팅 복구 라운드 이후):
 *   ch05_07_close 씬 + flags 매트릭스
 *     → [EVALUATE_BRANCH] (1단계: REJECT/SOLO 즉시 종결 vs Ch.6 라우팅)
 *     → Ch.6 본편 자동 traverse (CHOICE 첫 번째 자동 선택, KAKAO 자동 처리)
 *     → [EVALUATE_TIER] (2단계: TRUE/HAPPY/NORMAL/BAD 결정)
 *     → 엔딩 씬 → ENDING 명령 → EndingScreen 표시
 *   data-testid="ending-screen" + data-ending-id="<id>"로 검증
 */

import type { Page } from '@playwright/test';

export type HeroineId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5';

export interface TestFlagOverrides {
  H1?: number;
  H2?: number;
  H3?: number;
  H4?: number;
  H5?: number;
  late_reply_count?: number;
  key_choices?: Partial<Record<HeroineId, string[]>>;
  last_increment_order?: HeroineId[];
}

/** 게임을 클린 상태로 시작 — localStorage 클리어 + querystring 주입 */
export async function gotoScene(
  page: Page,
  sceneId: string,
  flags?: TestFlagOverrides,
): Promise<void> {
  // 1. 빈 페이지로 가서 localStorage 클리어 (이전 자동저장 잔재 제거)
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });

  // 2. querystring 구성
  const params = new URLSearchParams({ scene: sceneId });
  if (flags) {
    params.set('flags', encodeURIComponent(JSON.stringify(flags)));
  }
  await page.goto(`/?${params.toString()}`);
}

/**
 * 자동 advance 루프 — 엔딩 도달까지 게임을 generic하게 traverse.
 *
 * 2-단계 라우팅(2026-05-09) 이후 ch5_07_close → EVALUATE_BRANCH → Ch.6 본편 → EVALUATE_TIER → 엔딩 흐름.
 * Ch.6 본편엔 CHOICE/KAKAO/CG/VIDEO가 박혀 있어 옛 단순 advance 루프는 'scene' 외 모드에서 즉시 종료됐음.
 * 본 함수는 모드별 자동 처리:
 *   - scene + CHOICE: 첫 번째 옵션 자동 선택 (분기는 임의, 엔딩 라우팅은 flags가 결정)
 *   - scene + 기타: advance()
 *   - kakao: KAKAO.choices 있으면 pickChoice(0), 없으면 closeKakao()
 *   - cg/video: 100ms 대기 후 재확인 (CG 1초 lock·VIDEO 7초 onEnded 자연 진행)
 *   - ending/idle: 종료
 * Hang 가드: 같은 (mode:scene:cmdIdx) snapshot 30회 연속 시 종료.
 */
export async function autoAdvanceUntilEnding(
  page: Page,
  maxIterations = 5000,
): Promise<void> {
  await page.evaluate(
    async (max) => {
      type Choice = { mechanism?: string };
      type SceneCommand = { type?: string; choices?: Choice[] };
      type StoreState = {
        advance: () => Promise<void>;
        pickChoice: (i: number) => Promise<void>;
        closeKakao: () => Promise<void>;
        confirmChapterAdvance: () => void;
        runtimeMode: string;
        currentSceneId: string;
        currentCommand: SceneCommand | null;
        currentCommandIndex: number;
        awaitingChapterAdvance: boolean;
      };
      const store = (window as unknown as {
        __gameStore?: { getState: () => StoreState };
      }).__gameStore;
      if (!store) return;
      // store 초기 진입 시 useEffect/startScene 비동기 작업 완료 대기
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      await new Promise((r) => setTimeout(r, 50));

      let stuckCount = 0;
      let lastSnapshot = '';

      for (let i = 0; i < max; i += 1) {
        const state = store.getState();

        // 종료 조건
        if (state.runtimeMode === 'ending') return;
        if (state.runtimeMode === 'idle') return;

        // 챕터 전환 회상 화면 — confirmChapterAdvance로 즉시 통과 (e2e는 시각 검증 비범위)
        if (state.awaitingChapterAdvance) {
          state.confirmChapterAdvance();
          await new Promise((r) => requestAnimationFrame(() => r(undefined)));
          continue;
        }

        // hang detection — 같은 상태 30회 연속이면 안전 종료
        const snapshot = `${state.runtimeMode}:${state.currentSceneId}:${state.currentCommandIndex}`;
        if (snapshot === lastSnapshot) {
          stuckCount += 1;
          if (stuckCount > 30) {
            // eslint-disable-next-line no-console
            console.warn('[e2e auto-advance] stuck snapshot:', snapshot);
            return;
          }
        } else {
          stuckCount = 0;
          lastSnapshot = snapshot;
        }

        const cmd = state.currentCommand;
        const cmdType = cmd?.type;

        if (state.runtimeMode === 'scene') {
          await state.advance();
        } else if (state.runtimeMode === 'choice') {
          // Ch.6 본편 분기는 임의 첫 옵션. 엔딩 라우팅은 flags가 결정하므로 분기 선택은 무관.
          await state.pickChoice(0);
        } else if (state.runtimeMode === 'kakao') {
          if (cmdType === 'KAKAO' && Array.isArray(cmd?.choices) && cmd!.choices!.length > 0) {
            // KAKAO.choices 첫 번째 자동 선택 (h4_reply_speed 미니게임 timer 우회)
            await state.pickChoice(0);
          } else {
            await state.closeKakao();
          }
        } else if (state.runtimeMode === 'cg') {
          // CGOverlay 1s lock 후 advance 호출 (사용자 클릭 시뮬레이션)
          await new Promise((r) => setTimeout(r, 1100));
          await state.advance();
        } else {
          // 알 수 없는 모드(video는 'scene' 안에서 처리되므로 도달 X) — 100ms 후 재확인
          await new Promise((r) => setTimeout(r, 100));
        }

        // React 렌더 사이클 + zustand setState 반영 대기
        await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      }
    },
    maxIterations,
  );
}

/** EndingScreen에 표시되는 endingId 검증 (data-ending-id 속성) — 자동 advance 후 polling.
 *
 * 2-단계 라우팅(2026-05-09) 이후 timeout 상향:
 *   - REJECT/SOLO: EVALUATE_BRANCH 즉시 종결 → 짧음
 *   - TRUE/HAPPY/NORMAL/BAD: Ch.6 본편 자동 traverse(NARR/MONO/DIAL/CHOICE/KAKAO/CG/VIDEO) 30~60초 +
 *     EVALUATE_TIER → 엔딩 씬 → VIDEO 7초 + EndingScreen 마운트
 *   - REJECT: 8단계 RejectEnding 시퀀스 합 ~17.5초
 */
export async function expectEnding(
  page: Page,
  endingId: string,
  timeoutMs = 90_000,
): Promise<void> {
  // 자동 advance로 EVALUATE_BRANCH → Ch.6 본편 → EVALUATE_TIER → ENDING 명령까지 traverse
  await autoAdvanceUntilEnding(page);

  // EndingScreen 또는 RejectEnding의 dom 등장 대기.
  // RejectEnding은 8단계 시퀀스 후 onComplete → EndingScreen 백업 라우팅 → data-testid="ending-screen" 출현.
  const finalTimeout = endingId === 'END_H4_REJECT' ? 30_000 : timeoutMs;
  await page
    .locator(`[data-testid="ending-screen"][data-ending-id="${endingId}"]`)
    .waitFor({ state: 'visible', timeout: finalTimeout });
}

/** 텍스트박스 자동 advance — DialogueBox 클릭으로 다음 명령 진행. */
export async function advanceDialogue(page: Page): Promise<void> {
  // DialogueBox는 화면 하단. 그냥 body 클릭으로 충분 (DialogueBox onAdvance 핸들러).
  await page.locator('body').click({ position: { x: 100, y: 100 } });
}

/** 선택지 인덱스로 클릭 (0-based). */
export async function clickChoice(page: Page, index: number): Promise<void> {
  await page.locator(`[data-testid="choice-${index}"]`).click();
}

/** ch05_07_close + flags 주입으로 16 엔딩 직접 도달용 헬퍼.
 *
 * EVALUATE_BRANCH 라우팅 검증용 (SOLO/REJECT 즉시 종결 + TRUE Ch.6 traverse 검증).
 * HAPPY/NORMAL/BAD는 Ch.6 본편 INC 누적이 임계를 밀어올려 의도보다 높은 티어로 빠지므로 사용 X.
 */
export async function gotoEndingFromCh05(
  page: Page,
  flags: TestFlagOverrides,
): Promise<void> {
  await gotoScene(page, 'ch05_07_close', flags);
}

/** Ch.6 끝 evaluate 씬 + flags 직접 주입 — EVALUATE_TIER 임계 검증용.
 *
 * Ch.6 본편 traverse를 우회하므로 INC 누적 영향 없음. 신 임계(scriptInterpreter.determineEnding 2026-05-09 갱신:
 * H1: TRUE≥105·HAPPY≥90·NORMAL≥70·BAD<70 / H2: TRUE≥110·HAPPY≥95·NORMAL≥75·BAD<75 / H3: TRUE≥90·HAPPY≥75·NORMAL<75 / H4: TRUE≥70+KEY3+late=0·NORMAL≥45·REJECT / H5: TRUE≥120+KEY3·SOLO 폴백)
 * 입력값으로 의도한 티어 직접 도달.
 */
export async function gotoEndingFromEvaluate(
  page: Page,
  evaluateSceneId: string,
  flags: TestFlagOverrides,
): Promise<void> {
  await gotoScene(page, evaluateSceneId, flags);
}
