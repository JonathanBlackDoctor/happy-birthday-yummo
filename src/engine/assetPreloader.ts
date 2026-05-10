/**
 * 자산 프리로더 — MASTER-PLAN §8.1 "이미지 프리로딩 큐 (다음 챕터 자산 백그라운드 로드)" 정합.
 *
 * 씬 진입 시 해당 씬의 commands에서 BG/CG/CHARACTER ID를 추출하여
 * 백그라운드로 `<img>` 객체에 src 할당 → 브라우저 HTTP 캐시에 적재.
 * 이후 BackgroundLayer / CGOverlay / CharacterLayer가 같은 URL을 마운트하면
 * 캐시 히트로 즉시 표시 (씬 전환 깜빡임 회피).
 *
 * - 단순 캐시: 동일 URL 재호출 시 noop
 * - decoding=async: 메인 스레드 블록 회피
 * - 자산 미존재 시 silent fail (onerror 핸들러 X — 컴포넌트 단에서 fallback)
 */

import { resolveSpriteName } from '@/data/spriteResolver';

interface SceneCommand {
  type: string;
  [key: string]: unknown;
}

// BackgroundLayer.tsx의 BG_ALIAS와 동기화 (현재 비어 있음)
const BG_ALIAS: Record<string, string> = {};

const cache = new Map<string, HTMLImageElement>();

function preloadImage(url: string): void {
  if (cache.has(url)) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  cache.set(url, img);
}

/**
 * 씬 commands를 스캔하여 BG/CG/CHARACTER 자산을 백그라운드 프리로드.
 * 동일 URL 중복 호출은 캐시 히트로 noop.
 */
export function preloadSceneAssets(commands: readonly SceneCommand[]): void {
  for (const cmd of commands) {
    if (cmd.type === 'BG' && typeof cmd.image === 'string' && cmd.image !== 'black' && cmd.image !== 'white') {
      const resolved = BG_ALIAS[cmd.image] ?? cmd.image;
      preloadImage(`/img/bg/${resolved}.webp`);
    } else if (cmd.type === 'CG' && typeof cmd.cgId === 'string') {
      preloadImage(`/img/cg/${cmd.cgId}.webp`);
    } else if (
      cmd.type === 'CHARACTER' &&
      typeof cmd.sprite === 'string' &&
      typeof cmd.id === 'string'
    ) {
      const fileName = resolveSpriteName(cmd.id, cmd.sprite);
      if (fileName) preloadImage(`/img/sprites/${fileName}.webp`);
    }
  }
}

/** 테스트 / 디버그용 — 캐시 크기 조회 */
export function preloadCacheSize(): number {
  return cache.size;
}
