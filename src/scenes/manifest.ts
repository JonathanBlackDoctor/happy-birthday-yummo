/**
 * 씬 ID → JSON 로더 매핑.
 *
 * W5 라운드 #2 (2026-05-06): vite `import.meta.glob`로 src/scenes/*.scene.json 자동 매핑.
 * compile-scene.ts 출력이 늘어나도 manifest.ts 수동 갱신 불필요.
 *
 * 2026-05-08: 풀/압축 스토리 모드 분기 추가. settingsStore.storyMode === 'compressed'면
 * `src/scenes/compressed/<id>.scene.json`을 우선 룩업, 없으면 풀로 자동 fallback.
 *
 * 2026-05-10: 'palJeongPot' (팔정팟 각색) 모드 추가. settingsStore.storyMode === 'palJeongPot'이면
 * `src/scenes/palJeongPot/<id>.scene.json`을 우선 룩업, 없으면 풀로 자동 fallback.
 * 출시 직후 폴더가 비어 있어도 풀 폴백으로 정상 플레이 — 팔정팟 멤버가 분량 채워 넣을 때마다 점진 교체.
 *
 * ENTRY_SCENE_ID: 일반 게임 시작은 `prologue_01_home`. dev/E2E에서 querystring `?scene=<id>`로 임의 시작 가능.
 */

import type { Scene } from '@/engine/types';
import { useSettingsStore } from '@/stores/settingsStore';

type SceneLoader = () => Promise<Scene>;

interface SceneModule {
  default: Scene;
}

// 빌드 시점 정적 매핑 — vite가 모든 .scene.json을 코드 분할로 동적 import 가능하게 변환.
const fullModules = import.meta.glob<SceneModule>('./*.scene.json');
const compressedModules = import.meta.glob<SceneModule>('./compressed/*.scene.json');
const palJeongPotModules = import.meta.glob<SceneModule>('./palJeongPot/*.scene.json');

function buildMap(
  modules: Record<string, () => Promise<SceneModule>>,
  prefix: string,
): Record<string, SceneLoader> {
  return Object.fromEntries(
    Object.entries(modules).map(([filePath, loader]) => {
      // './prologue_01_home.scene.json' → 'prologue_01_home'
      // './compressed/prologue_01_home.scene.json' → 'prologue_01_home'
      const id = filePath.replace(prefix, '').replace(/\.scene\.json$/, '');
      return [id, () => loader().then((m) => m.default)];
    }),
  );
}

export const SCENE_MANIFEST_FULL: Record<string, SceneLoader> = buildMap(fullModules, './');
export const SCENE_MANIFEST_COMPRESSED: Record<string, SceneLoader> = buildMap(
  compressedModules,
  './compressed/',
);
export const SCENE_MANIFEST_PAL_JEONG_POT: Record<string, SceneLoader> = buildMap(
  palJeongPotModules,
  './palJeongPot/',
);

/**
 * 런타임 storyMode에 따라 풀/압축/팔정팟을 자동 선택하는 Proxy.
 * 'compressed' 모드여도 압축본이 없는 씬은 풀로 fallback.
 * 'palJeongPot' 모드는 팔정팟 폴더 → 풀로 fallback (압축본은 건드리지 않음 — 각색본은 풀과 1:1 대응 의도).
 * scriptInterpreter.ts:27의 `SCENE_MANIFEST[sceneId]` 룩업이 그대로 동작.
 */
export const SCENE_MANIFEST = new Proxy({} as Record<string, SceneLoader>, {
  get(_t, key: string) {
    const mode = useSettingsStore.getState().storyMode ?? 'full';
    if (mode === 'palJeongPot' && SCENE_MANIFEST_PAL_JEONG_POT[key]) {
      return SCENE_MANIFEST_PAL_JEONG_POT[key];
    }
    if (mode === 'compressed' && SCENE_MANIFEST_COMPRESSED[key]) {
      return SCENE_MANIFEST_COMPRESSED[key];
    }
    return SCENE_MANIFEST_FULL[key];
  },
  has(_t, key: string) {
    return (
      key in SCENE_MANIFEST_FULL ||
      key in SCENE_MANIFEST_COMPRESSED ||
      key in SCENE_MANIFEST_PAL_JEONG_POT
    );
  },
  ownKeys() {
    return [
      ...new Set([
        ...Object.keys(SCENE_MANIFEST_FULL),
        ...Object.keys(SCENE_MANIFEST_COMPRESSED),
        ...Object.keys(SCENE_MANIFEST_PAL_JEONG_POT),
      ]),
    ];
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

/** 게임 진입 씬 — querystring `?scene=<id>` 우선, 없으면 prologue 첫 씬. */
export function resolveEntryScene(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('scene');
    if (
      override &&
      (SCENE_MANIFEST_FULL[override] ||
        SCENE_MANIFEST_COMPRESSED[override] ||
        SCENE_MANIFEST_PAL_JEONG_POT[override])
    ) {
      return override;
    }
  }
  return 'prologue_01_home';
}

export const ENTRY_SCENE_ID = 'prologue_01_home';
