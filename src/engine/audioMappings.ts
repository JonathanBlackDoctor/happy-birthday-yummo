/**
 * 한글 SFX/BGM 큐 → 영문 ID 매핑.
 *
 * SSoT: `docs/assets/SFX-list.md` §2 + `docs/assets/BGM-list.md` §1.1.
 * 본 파일은 SSoT 미러 — Q3=(a) 수동 미러 방식.
 *
 * **W5 통합 라운드 검토 (변경 제안)**: Vite 플러그인이 빌드 시점에 .md를 자동 파싱하여
 * 본 매핑을 생성하는 방식으로 마이그레이션 검토 (현재는 .md 갱신 시 수동 반영).
 *
 * 미매핑 ID로 `koToEnSfx` / `koToEnBgm` 호출 시 throw → 빌드 검증 스크립트(W5 후속)가 잡음.
 */

/** SFX-list.md §2 매핑 테이블 14행 SSoT 미러 (P0 5종 + P1 7종 + P2/P3 placeholder 2행 제외) */
export interface SfxMapEntry {
  ko: string | null; // null = 시스템 SFX (한글 큐 없음)
  en: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export const SFX_MAP: readonly SfxMapEntry[] = [
  { ko: '카톡_알림', en: 'sfx_katalk_notify', priority: 'P0' },
  { ko: '카톡_전송', en: 'sfx_katalk_send', priority: 'P0' },
  { ko: null, en: 'sfx_click', priority: 'P0' },
  { ko: null, en: 'sfx_pageturn', priority: 'P0' },
  { ko: null, en: 'sfx_timer_out', priority: 'P0' },
  { ko: null, en: 'sfx_realize', priority: 'P0' },
  { ko: 'ktx_주행음', en: 'sfx_ktx_run', priority: 'P1' },
  // sfx_suitcase_wheels 제거 (2026-05-09 PM 결정 — 사용 안 함).
  { ko: '불_끄는_소리', en: 'sfx_light_off', priority: 'P1' },
  { ko: '발자국', en: 'sfx_footsteps', priority: 'P1' },
  { ko: '실습실_문_열림', en: 'sfx_lab_door_open', priority: 'P1' },
  { ko: '유리병_떨어짐', en: 'sfx_glass_drop', priority: 'P1' },
  { ko: '술집_왁자지껄', en: 'sfx_bar_ambient', priority: 'P1' },
  // 호감도 토스트 — AffectionToastStack이 묶음당 |delta| 최대값의 부호로 1회 재생.
  // 자산 미존재 시 audioManager.playSfx가 graceful warn으로 처리.
  { ko: null, en: 'sfx_affection_up', priority: 'P1' },
  { ko: null, en: 'sfx_affection_down', priority: 'P1' },
] as const;

/** BGM-list.md §1.1 매핑 테이블 SSoT 미러 (8트랙) */
export interface BgmMapEntry {
  ko: string;
  en: string;
}

export const BGM_MAP: readonly BgmMapEntry[] = [
  { ko: '메인_테마', en: 'bgm_main_theme' },
  { ko: '일상', en: 'bgm_daily' },
  { ko: '코믹', en: 'bgm_comic' },
  { ko: '긴장', en: 'bgm_tension' },
  { ko: '로맨틱', en: 'bgm_romantic' },
  { ko: '슬픔', en: 'bgm_sad' },
  { ko: '클라이맥스', en: 'bgm_climax' },
  { ko: '카톡', en: 'bgm_katalk' },
  // alias: 시나리오 표기 변형 (W5 후속 라운드 — PM이 별도 트랙 의도라면 BGM-list §1.1 갱신 필요)
  { ko: '잔잔', en: 'bgm_daily' }, // ch06_h1_serin.md 새벽 카페 — bgm_daily fallback
] as const;

const SFX_KO_INDEX: ReadonlyMap<string, string> = new Map(
  SFX_MAP.filter((e): e is SfxMapEntry & { ko: string } => e.ko !== null).map(
    (e) => [e.ko, e.en],
  ),
);

const SFX_EN_SET: ReadonlySet<string> = new Set(SFX_MAP.map((e) => e.en));

const BGM_KO_INDEX: ReadonlyMap<string, string> = new Map(
  BGM_MAP.map((e) => [e.ko, e.en]),
);

const BGM_EN_SET: ReadonlySet<string> = new Set(BGM_MAP.map((e) => e.en));

/** 한글 SFX 큐 → 영문 ID. 미매핑 시 throw. */
export function koToEnSfx(ko: string): string {
  const en = SFX_KO_INDEX.get(ko);
  if (!en) {
    throw new Error(
      `Unmapped SFX: "${ko}". Update docs/assets/SFX-list.md §2 + src/engine/audioMappings.ts.`,
    );
  }
  return en;
}

/** 한글 BGM 큐 → 영문 ID. 미매핑 시 throw. */
export function koToEnBgm(ko: string): string {
  const en = BGM_KO_INDEX.get(ko);
  if (!en) {
    throw new Error(
      `Unmapped BGM: "${ko}". Update docs/assets/BGM-list.md §1.1 + src/engine/audioMappings.ts.`,
    );
  }
  return en;
}

/** 영문 SFX ID 유효성 검사 (런타임 자산 검증용) */
export function isKnownSfx(en: string): boolean {
  return SFX_EN_SET.has(en);
}

export function isKnownBgm(en: string): boolean {
  return BGM_EN_SET.has(en);
}

/** 자산 경로 헬퍼 (placeholder 시기 — 실제 자산 W5 통합 시 `public/snd/` 이동) */
export function sfxPath(en: string): string {
  return `/snd/sfx/${en}.mp3`;
}

export function bgmPath(en: string): string {
  return `/snd/bgm/${en}.mp3`;
}
