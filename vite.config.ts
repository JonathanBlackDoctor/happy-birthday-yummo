import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
  },
  // 2026-05-09: Windows + NTFS 한국어 경로에서 chokidar native watch가 변경을 놓치는
  // 케이스 발견 — 디스크에 새 코드 있어도 dev server가 옛 transform 캐시 유지. polling으로 강제.
  // 추가로 dev 응답에 no-store 헤더를 박아 브라우저가 옛 .scene.json·소스맵 등을 캐시하지 못하게 함.
  // (PM 결정 2026-05-09 후속: 매번 hard reload 안 해도 새 빌드가 즉시 반영되도록.)
  server: {
    watch: {
      usePolling: true,
      interval: 200,
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  },
  // npm run preview (4173) — dist/ 정적 서빙도 캐시 무력화. 매 build 후 reload만으로 새 빌드 반영.
  preview: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  },
});
