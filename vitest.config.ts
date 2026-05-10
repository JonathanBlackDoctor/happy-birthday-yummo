/**
 * Vitest 설정 — Phase B 단위 테스트 + 후속 W4·W5·W6 통합.
 *
 * - jsdom 환경 (gameStore localStorage 의존, KakaoTimer 타이머 등)
 * - vite.config.ts와 동일한 alias (@/* → src/*)
 * - tests/unit, tests/e2e는 별도 (Playwright는 e2e/)
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**/*.ts', 'src/stores/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
});
