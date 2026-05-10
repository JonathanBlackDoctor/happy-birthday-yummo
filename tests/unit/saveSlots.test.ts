/**
 * 수동 저장 슬롯 6개 검증 — STATE-SCHEMA §1·§5·§6 정합.
 *
 * jsdom 환경의 localStorage 사용. 각 테스트마다 clear.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSlot,
  loadSlot,
  deleteSlot,
  listSlots,
  hasSlot,
  migrate,
  SaveSlotError,
  type SaveInput,
  type SlotIndex,
} from '@/engine/saveSlots';
import type { GameFlags, SaveSlot } from '@/engine/types';

function makeFlags(): GameFlags {
  return {
    H1: 50,
    H2: 30,
    H3: 10,
    H4: 5,
    H5: 0,
    late_reply_count: 0,
    last_increment_order: ['H1'],
    key_choices: { H1: ['ch6_h1_distance'], H2: [], H3: [], H4: [], H5: [] },
    current_chapter: 'ch06',
    current_scene_id: 'ch06_h1_open',
    visited_scenes: ['prologue_01_home', 'ch01_ot_first_day'],
    flag_anatomy_first_done: true,
    flag_dongsan_visit_done: true,
    flag_seoyoon_first_meet: false,
    flag_first_kakao_serin: true,
    mode: 'main',
  };
}

function makeInput(): SaveInput {
  return {
    flags: makeFlags(),
    history: [
      {
        speaker: '구윤모',
        text: '본과 1학년이라.',
        type: 'monologue',
        sceneId: 'prologue_01_home',
        timestamp: 1700000000000,
      },
    ],
    currentSceneId: 'ch06_h1_open',
    currentCommandIndex: 5,
    audio: { bgmTrack: 'bgm_daily', bgmTime: 12.5 },
    preview: {
      chapter: 'Ch.6',
      sceneTitle: '차세린 분기 시작',
      timeInGame: '2026-06-01 evening',
      excerpt: '본과 1학년이라.',
      activeHeroine: 'H1',
    },
    thumbnail: 'data:image/png;base64,placeholder',
  };
}

describe('saveSlot / loadSlot — 슬롯 직렬화·역직렬화', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('슬롯 1에 저장 후 로드 시 동일 데이터', () => {
    const input = makeInput();
    const saved = saveSlot(1, input);
    expect(saved.version).toBe(1);
    expect(saved.flags.H1).toBe(50);

    const loaded = loadSlot(1);
    expect(loaded).not.toBeNull();
    expect(loaded?.flags.H1).toBe(50);
    expect(loaded?.preview.activeHeroine).toBe('H1');
    expect(loaded?.history).toHaveLength(1);
    expect(loaded?.audio.bgmTrack).toBe('bgm_daily');
  });

  it('빈 슬롯 로드 시 null', () => {
    expect(loadSlot(3)).toBeNull();
  });

  it('history는 최근 50개로 자름 (슬롯 용량 보호)', () => {
    const input = makeInput();
    input.history = Array.from({ length: 100 }, (_, i) => ({
      speaker: '구윤모',
      text: `라인 ${i}`,
      type: 'dialogue' as const,
      sceneId: 'test',
      timestamp: i,
    }));
    saveSlot(1, input);
    const loaded = loadSlot(1)!;
    expect(loaded.history).toHaveLength(50);
    expect(loaded.history[0].text).toBe('라인 50');
  });

  it('savedAt은 ISO 8601 형식', () => {
    saveSlot(1, makeInput());
    const loaded = loadSlot(1)!;
    expect(loaded.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

describe('deleteSlot / hasSlot', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hasSlot은 저장 전 false, 후 true', () => {
    expect(hasSlot(2)).toBe(false);
    saveSlot(2, makeInput());
    expect(hasSlot(2)).toBe(true);
  });

  it('deleteSlot 후 hasSlot false', () => {
    saveSlot(4, makeInput());
    expect(hasSlot(4)).toBe(true);
    deleteSlot(4);
    expect(hasSlot(4)).toBe(false);
    expect(loadSlot(4)).toBeNull();
  });
});

describe('listSlots — 6슬롯 메타 일람', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('빈 상태에서 6슬롯 모두 null', () => {
    const list = listSlots();
    expect(list).toHaveLength(6);
    list.forEach(({ slot }) => expect(slot).toBeNull());
  });

  it('일부 슬롯에만 저장 시 나머지는 null', () => {
    saveSlot(1, makeInput());
    saveSlot(3, makeInput());
    const list = listSlots();
    expect(list[0].slot).not.toBeNull();
    expect(list[1].slot).toBeNull();
    expect(list[2].slot).not.toBeNull();
    expect(list[3].slot).toBeNull();
  });

  it('인덱스 1~6 정확 순서', () => {
    const list = listSlots();
    expect(list.map((x) => x.index)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('migrate — STATE-SCHEMA §5 버전 마이그레이션', () => {
  it('v1 데이터는 그대로', () => {
    const v1: SaveSlot = {
      version: 1,
      savedAt: '2026-06-01T20:00:00.000Z',
      preview: {
        chapter: 'Ch.6',
        sceneTitle: 'X',
        timeInGame: '',
        excerpt: '',
      },
      flags: makeFlags(),
      history: [],
      currentSceneId: 'x',
      currentCommandIndex: 0,
      audio: { bgmTrack: null, bgmTime: 0 },
    };
    expect(migrate(v1)).toEqual(v1);
  });

  it('version 필드 없는 v0 → v1로 마이그레이션 + 기본값 채움', () => {
    const v0 = {
      flags: makeFlags(),
      currentSceneId: 'old_scene',
    };
    const migrated = migrate(v0);
    expect(migrated.version).toBe(1);
    expect(migrated.currentSceneId).toBe('old_scene');
    expect(migrated.history).toEqual([]);
    expect(migrated.audio).toEqual({ bgmTrack: null, bgmTime: 0 });
  });

  it('알 수 없는 버전 → SaveSlotError', () => {
    expect(() => migrate({ version: 99, flags: makeFlags() })).toThrow(SaveSlotError);
  });

  it('null 또는 비객체 → SaveSlotError', () => {
    expect(() => migrate(null)).toThrow(SaveSlotError);
    expect(() => migrate('string')).toThrow(SaveSlotError);
  });
});

describe('saveSlot — 6슬롯 인덱스 모두 동작', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each<SlotIndex>([1, 2, 3, 4, 5, 6])('슬롯 %i 저장·로드', (index) => {
    saveSlot(index, makeInput());
    expect(hasSlot(index)).toBe(true);
    expect(loadSlot(index)).not.toBeNull();
  });

  it('서로 다른 슬롯에 저장 시 분리 보관', () => {
    const input1 = makeInput();
    input1.flags.H1 = 80;
    const input2 = makeInput();
    input2.flags.H1 = 20;

    saveSlot(1, input1);
    saveSlot(2, input2);

    expect(loadSlot(1)?.flags.H1).toBe(80);
    expect(loadSlot(2)?.flags.H1).toBe(20);
  });
});
