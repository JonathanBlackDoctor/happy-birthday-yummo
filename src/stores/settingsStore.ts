/**
 * 환경설정 — STATE-SCHEMA.md §3 정합. localStorage key: `kmu-vn-settings`.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StoryMode } from '@/engine/types';

export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';
/**
 * 'palJeongPot' (팔정팟 각색) — 친구 6명(정욱·표경민·오준혁·김규민·남희석·이문규) 분담 각색본.
 * 첫 부팅엔 잠금. metaStore.has_cleared_once === true 가 되면 ModeSelect에서 해금 카드로 노출.
 * scene 룩업은 manifest.ts Proxy가 palJeongPot/ → 없으면 full 로 자동 폴백 (출시 직후 빈 폴더 운영 안전).
 */
export type { StoryMode };

/**
 * UI-SPEC §8 폰트 크기 슬라이더 (2026-05-09 W5 메뉴 사이클 라운드).
 *
 * 2026-05-10 정정: 범위 12~22 → 14~30, 기본 16 → 26.
 * 2026-05-11 모바일 QA 정정: MIN 14 → 10. 작은 폰(<480px)에서 사용자가 더 줄일 수 있도록.
 *   기본값 26 유지 — App.tsx가 fontSize === FONT_SIZE_DEFAULT 시 inline 제거 → tokens.css 룰 위임
 *   (≤480px 14 / ≤768px 22 / 기본 26). 슬라이더로 변경 시만 그 값이 모든 viewport 우선.
 */
export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 30;
export const FONT_SIZE_DEFAULT = 26;

export interface Settings {
  version: 6;
  storyMode: StoryMode | null;
  bgmVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  textSpeed: TextSpeed;
  autoAdvanceDelay: number;
  textboxOpacity: number;
  skipUnseenText: boolean;
  reduceMotion: boolean;
  /** 자동재생 토글 — 텍스트 출력 완료 후 autoAdvanceDelay 뒤 자동 advance. AutoPlayButton에서 토글. */
  autoPlayEnabled: boolean;
  /** 자동재생 잠금해제 여부 — 트루 엔딩 1개 이상 달성 후 처음으로 ModeSelect 진입 시 해제. */
  autoPlayUnlocked: boolean;
  /** 트루 엔딩(category 'TRUE') 달성 누적 — 1개 이상이면 ModeSelect에서 잠금해제 모달 트리거. */
  hasAchievedTrueEnding: boolean;
  /**
   * 엔딩 점수 액체 애니메이션 패널 활성화 (이스터에그).
   * PauseMenu(ESC) → "호감도" 라벨 클릭으로 토글. 기본 false → 정적 패널.
   */
  animatedEndingPanel: boolean;
  /** 음소거 — MiniControls의 MuteToggle 전용 (SettingsScreen에선 노출 X, 2026-05-10 PM 정정). audioManager.setVolumes 동기화. */
  muted: boolean;
  /** 본문 폰트 크기 (px, 14~30). CSS var --font-size-text/--font-size-name로 동기화. */
  fontSize: number;
}

export const DEFAULT_SETTINGS: Settings = {
  version: 6,
  storyMode: null,
  bgmVolume: 0.7,
  sfxVolume: 0.8,
  voiceVolume: 1.0,
  textSpeed: 'normal',
  autoAdvanceDelay: 2000,
  textboxOpacity: 0.85,
  skipUnseenText: false,
  reduceMotion: false,
  autoPlayEnabled: false,
  autoPlayUnlocked: false,
  hasAchievedTrueEnding: false,
  animatedEndingPanel: false,
  muted: false,
  fontSize: FONT_SIZE_DEFAULT,
};

// 2026-05-09 PM 결정: 모든 단계 1.5배 가속 (slow 60→40, normal 30→20, fast 15→10, instant 0).
export const TEXT_SPEED_MS: Record<TextSpeed, number> = {
  slow: 40,
  normal: 20,
  fast: 10,
  instant: 0,
};

export const TEXT_SPEED_LABEL: Record<TextSpeed, string> = {
  slow: '느리게',
  normal: '보통',
  fast: '빠르게',
  instant: '즉시',
};

interface SettingsActions {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

export const useSettingsStore = create<Settings & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (key, value) => set({ [key]: value } as never),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'kmu-vn-settings',
      storage: createJSONStorage(() => localStorage),
      version: 6,
      migrate: (persisted, fromVersion) => {
        const base = (persisted ?? {}) as Partial<Settings>;
        if (fromVersion < 2) {
          return { ...DEFAULT_SETTINGS, ...base, version: 6, storyMode: null, fontSize: FONT_SIZE_DEFAULT } as Settings;
        }
        if (fromVersion < 3) {
          // v2 → v3: autoPlay 관련 필드 추가. 기존 사용자는 잠금 상태로 시작.
          return {
            ...DEFAULT_SETTINGS,
            ...base,
            version: 6,
            autoPlayEnabled: false,
            autoPlayUnlocked: false,
            hasAchievedTrueEnding: false,
            fontSize: FONT_SIZE_DEFAULT,
          } as Settings;
        }
        if (fromVersion < 4) {
          // v3 → v4: muted + fontSize 추가 (W5 메뉴 사이클 라운드 2026-05-09).
          return {
            ...DEFAULT_SETTINGS,
            ...base,
            version: 6,
            muted: false,
            fontSize: FONT_SIZE_DEFAULT,
          } as Settings;
        }
        if (fromVersion < 5) {
          // v4 → v5: fontSize 범위 12~22 → 14~30, 기본 16 → 26 이동 (2026-05-10 PM 정정).
          // 기존 v4에서 16 등 작은 값이 박혀있던 사용자가 글자가 작아지지 않도록 default(26)으로 강제 리셋.
          // 사용자가 슬라이더로 명시 변경한 값이 14~30 범위 안이라면 그대로 유지하는 게 자연스럽지만,
          // v4 도달 사용자 = 본 라운드 진입 직전 첫 미러 마이그레이션 받은 사용자라 fontSize=16(default)이 거의 전부 →
          // 일괄 26으로 리셋해 시각 회귀 방지. SettingsScreen 슬라이더로 다시 14~30 범위에서 자유 조정 가능.
          return {
            ...DEFAULT_SETTINGS,
            ...base,
            version: 6,
            fontSize: FONT_SIZE_DEFAULT,
          } as Settings;
        }
        if (fromVersion < 6) {
          // v5 → v6: StoryMode에 'palJeongPot' 추가 (팔정팟 각색본). 필드 변경 X — 타입만 확장.
          // 기존 storyMode 값 'full' / 'compressed' / null 모두 그대로 유효, 별도 강제 리셋 불요.
          return { ...DEFAULT_SETTINGS, ...base, version: 6 } as Settings;
        }
        return { ...DEFAULT_SETTINGS, ...base } as Settings;
      },
    },
  ),
);
