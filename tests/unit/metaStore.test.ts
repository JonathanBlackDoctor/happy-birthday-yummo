/**
 * metaStore — STATE-SCHEMA.md §4 MetaData 검증.
 *
 * jsdom 환경에서 zustand persist + localStorage 분리. 각 테스트마다 storage clear.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useMetaStore, DEFAULT_META, type EndingRecord } from '@/stores/metaStore';

function reset() {
  localStorage.clear();
  useMetaStore.setState({ ...DEFAULT_META });
}

function makeRecord(overrides: Partial<EndingRecord> = {}): EndingRecord {
  return {
    endingId: 'END_H1_TRUE',
    grade: 'A',
    finalScore: 520,
    savedAt: new Date('2026-05-10T01:00:00.000Z').toISOString(),
    ...overrides,
  };
}

describe('metaStore — recordEnding', () => {
  beforeEach(reset);

  it('첫 기록 시 unlocked_endings에 push + endingHistory에 push + has_cleared_once true', () => {
    const rec = makeRecord();
    useMetaStore.getState().recordEnding(rec);
    const s = useMetaStore.getState();
    expect(s.unlocked_endings).toEqual(['END_H1_TRUE']);
    expect(s.endingHistory).toHaveLength(1);
    expect(s.endingHistory[0]).toMatchObject({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 520,
    });
    expect(s.has_cleared_once).toBe(true);
  });

  it('같은 엔딩 재달성 시 unlocked_endings는 중복 X, endingHistory는 누적', () => {
    const a = makeRecord({ finalScore: 400 });
    const b = makeRecord({ finalScore: 600 });
    useMetaStore.getState().recordEnding(a);
    useMetaStore.getState().recordEnding(b);
    const s = useMetaStore.getState();
    expect(s.unlocked_endings).toEqual(['END_H1_TRUE']);
    expect(s.endingHistory).toHaveLength(2);
    expect(s.endingHistory[1].finalScore).toBe(600);
  });

  it('서로 다른 엔딩 → 둘 다 unlock', () => {
    useMetaStore.getState().recordEnding(makeRecord({ endingId: 'END_H1_TRUE' }));
    useMetaStore.getState().recordEnding(makeRecord({ endingId: 'END_H5_TRUE' }));
    const s = useMetaStore.getState();
    expect(s.unlocked_endings).toContain('END_H1_TRUE');
    expect(s.unlocked_endings).toContain('END_H5_TRUE');
    expect(s.unlocked_endings).toHaveLength(2);
  });
});

describe('metaStore — unlock 액션', () => {
  beforeEach(reset);

  it('unlockCg는 중복 push 방지', () => {
    const { unlockCg } = useMetaStore.getState();
    unlockCg('cg_serin_first_meet');
    unlockCg('cg_serin_first_meet');
    unlockCg('cg_hajeong_classroom');
    expect(useMetaStore.getState().unlocked_cgs).toEqual([
      'cg_serin_first_meet',
      'cg_hajeong_classroom',
    ]);
  });

  it('unlockBgm 중복 push 방지', () => {
    const { unlockBgm } = useMetaStore.getState();
    unlockBgm('bgm_main_theme');
    unlockBgm('bgm_main_theme');
    expect(useMetaStore.getState().unlocked_bgms).toEqual(['bgm_main_theme']);
  });

  it('unlockEnding 중복 push 방지', () => {
    const { unlockEnding } = useMetaStore.getState();
    unlockEnding('END_H2_HAPPY');
    unlockEnding('END_H2_HAPPY');
    expect(useMetaStore.getState().unlocked_endings).toEqual(['END_H2_HAPPY']);
  });
});

describe('metaStore — resetMeta', () => {
  beforeEach(reset);

  it('모든 누적 기록을 기본값으로 되돌림', () => {
    const { recordEnding, unlockCg, resetMeta } = useMetaStore.getState();
    recordEnding(makeRecord());
    unlockCg('cg_x');
    expect(useMetaStore.getState().unlocked_cgs.length).toBeGreaterThan(0);
    resetMeta();
    const s = useMetaStore.getState();
    expect(s.unlocked_endings).toEqual([]);
    expect(s.unlocked_cgs).toEqual([]);
    expect(s.unlocked_bgms).toEqual([]);
    expect(s.endingHistory).toEqual([]);
    expect(s.has_cleared_once).toBe(false);
  });
});

describe('metaStore — persist', () => {
  beforeEach(reset);

  it('localStorage에 kmu-vn-meta 키로 직렬화', () => {
    useMetaStore.getState().recordEnding(makeRecord());
    const raw = localStorage.getItem('kmu-vn-meta');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    // zustand persist는 { state, version } 래핑.
    expect(parsed.state.unlocked_endings).toContain('END_H1_TRUE');
    expect(parsed.version).toBe(3); // 2026-05-11 newly_unlocked_sprites 추가 v2→v3 bump
  });
});
