/**
 * Playwright E2E 설정 — W6에서 16개 엔딩 자동 플레이 테스트 활성화.
 *
 * 본 라운드(W4 Phase F)는 스켈레톤만. tests/e2e/ 디렉토리는 비어 있음 — 시나리오 풀 텍스트 + 자산 도착 후 작성.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // 2-단계 라우팅(2026-05-09 Ch5 엔딩 라우팅 복구) 이후 ch5_07 → Ch.6 본편 자동 traverse → EVALUATE_TIER → 엔딩
  // 흐름이 추가되어 30s → 120s. 자체 expectEnding 폴링은 90s로 내부 가드, playwright은 그보다 길게 잡아 여유.
  timeout: 120_000,
  // 단일 preview 서버 + zustand persist localStorage 공유로 인한 race 방지 — 순차 실행
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // 자산 통합 검증 라운드 후속 (2026-05-08): 로컬도 1회 retry — TRUE/NORMAL 엔딩의 video_true_*/모놀로그 시퀀스
  // 환경 부담 따라 flaky한 케이스 회복. CI는 그대로 2회 retry 유지.
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // W6 활성화 후보:
    // { name: 'mobile-portrait', use: { ...devices['iPhone 13'] } },
    // { name: 'mobile-landscape', use: { ...devices['iPhone 13 landscape'] } },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
