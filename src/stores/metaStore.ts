/**
 * 영구 메타 — STATE-SCHEMA.md §4 정합. localStorage key: `kmu-vn-meta`.
 *
 * "타이틀로 돌아가기" 시 절대 리셋 X — 갤러리 해금, 엔딩 점수 히스토리 등 전 세션 누적.
 *
 * (2026-05-09 W5 메뉴 사이클 라운드 신규 — 기존 UI는 GameFlags에 임시 unlocked_* 필드를
 *  optional cast로 읽고 있었으나 실제로 채워지는 코드 없음. 본 라운드에서 EndingScreen 마운트 시
 *  자동 기록 + Gallery 컴포넌트가 본 store를 직접 구독하는 흐름으로 정리.)
 *
 * 2026-05-10 후속 — 캐릭터 이미지 갤러리 라운드: `unlocked_sprites` 필드 + `unlockSprite` 액션 추가.
 *  CHARACTER 명령 적용 시 gameStore가 자동 push (중복 X). version 1→2 마이그레이션.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EndingId } from '@/engine/types';
import type { EndingGrade } from '@/engine/endingScore';

export interface EndingRecord {
  endingId: EndingId;
  grade: EndingGrade;
  finalScore: number;
  /** ISO 8601 — Date.now()가 아니라 new Date().toISOString() 권장 (직렬화 가독성). */
  savedAt: string;
}

export interface MetaData {
  version: 3;
  unlocked_endings: EndingId[];
  unlocked_cgs: string[];
  unlocked_bgms: string[];
  /** 인게임에서 [CHARACTER]로 등장한 적 있는 스프라이트 ID 목록 (2026-05-10 추가). */
  unlocked_sprites: string[];
  /**
   * 직전 TRUE 엔딩 보상 등으로 새로 해금됐지만 아직 SpriteGallery에서 한 번도 확인하지 않은 ID.
   * SpriteGallery에 NEW 뱃지 노출용. GalleryScreen 닫힐 때 비움. (2026-05-11 A+C 라운드)
   */
  newly_unlocked_sprites: string[];
  /** 엔딩 도달 누적 기록 — 같은 엔딩 재달성 시 push. EndingGallery / 통계 화면에서 사용. */
  endingHistory: EndingRecord[];
  total_play_count: number;
  has_cleared_once: boolean;
}

export const DEFAULT_META: MetaData = {
  version: 3,
  unlocked_endings: [],
  unlocked_cgs: [],
  unlocked_bgms: [],
  unlocked_sprites: [],
  newly_unlocked_sprites: [],
  endingHistory: [],
  total_play_count: 0,
  has_cleared_once: false,
};

interface MetaActions {
  /** 엔딩 도달 시 호출 — unlocked_endings에 push(중복 X) + endingHistory에 push(중복 OK). */
  recordEnding: (record: EndingRecord) => void;
  unlockCg: (id: string) => void;
  unlockBgm: (id: string) => void;
  unlockEnding: (id: EndingId) => void;
  /** [CHARACTER] 명령 적용 시 호출. gameStore.applyCommand에서 sprite ID와 함께 호출. */
  unlockSprite: (id: string) => void;
  /** TRUE 엔딩 보상 등 "새로 해금됐다"고 갤러리에 알릴 ID들을 큐에 push. (2026-05-11) */
  markSpritesAsNew: (ids: readonly string[]) => void;
  /** SpriteGallery에서 확인 완료 후 호출 — newly_unlocked_sprites 비움. GalleryScreen 닫힐 때 트리거. */
  markSpritesSeen: () => void;
  /** 테스트용 / 데이터 초기화 메뉴 — UI에서 confirm 후 호출. */
  resetMeta: () => void;
}

export const useMetaStore = create<MetaData & MetaActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_META,
      recordEnding: (record) => {
        const cur = get();
        set({
          unlocked_endings: cur.unlocked_endings.includes(record.endingId)
            ? cur.unlocked_endings
            : [...cur.unlocked_endings, record.endingId],
          endingHistory: [...cur.endingHistory, record],
          has_cleared_once: true,
        });
      },
      unlockCg: (id) => {
        const cur = get();
        if (cur.unlocked_cgs.includes(id)) return;
        set({ unlocked_cgs: [...cur.unlocked_cgs, id] });
      },
      unlockBgm: (id) => {
        const cur = get();
        if (cur.unlocked_bgms.includes(id)) return;
        set({ unlocked_bgms: [...cur.unlocked_bgms, id] });
      },
      unlockEnding: (id) => {
        const cur = get();
        if (cur.unlocked_endings.includes(id)) return;
        set({ unlocked_endings: [...cur.unlocked_endings, id] });
      },
      unlockSprite: (id) => {
        const cur = get();
        if (cur.unlocked_sprites.includes(id)) return;
        set({ unlocked_sprites: [...cur.unlocked_sprites, id] });
      },
      markSpritesAsNew: (ids) => {
        const cur = get();
        const fresh = ids.filter((id) => !cur.newly_unlocked_sprites.includes(id));
        if (fresh.length === 0) return;
        set({ newly_unlocked_sprites: [...cur.newly_unlocked_sprites, ...fresh] });
      },
      markSpritesSeen: () => {
        const cur = get();
        if (cur.newly_unlocked_sprites.length === 0) return;
        set({ newly_unlocked_sprites: [] });
      },
      resetMeta: () => set({ ...DEFAULT_META }),
    }),
    {
      name: 'kmu-vn-meta',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted, fromVersion) => {
        const base = (persisted ?? {}) as Partial<MetaData>;
        if (fromVersion < 1) {
          return {
            ...DEFAULT_META,
            ...base,
            version: 3,
            unlocked_sprites: [],
            newly_unlocked_sprites: [],
          } as MetaData;
        }
        if (fromVersion < 2) {
          // v1 → v2: unlocked_sprites 추가 (2026-05-10 캐릭터 이미지 갤러리 라운드).
          return {
            ...DEFAULT_META,
            ...base,
            version: 3,
            unlocked_sprites: [],
            newly_unlocked_sprites: [],
          } as MetaData;
        }
        if (fromVersion < 3) {
          // v2 → v3: newly_unlocked_sprites 추가 (2026-05-11 SpriteGallery NEW 뱃지 + EndingScreen 알림).
          return {
            ...DEFAULT_META,
            ...base,
            version: 3,
            newly_unlocked_sprites: [],
          } as MetaData;
        }
        return { ...DEFAULT_META, ...base } as MetaData;
      },
    },
  ),
);
