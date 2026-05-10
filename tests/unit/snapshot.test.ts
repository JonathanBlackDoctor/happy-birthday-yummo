/**
 * gameStore takeSnapshot ↔ saveSlots ↔ applySnapshot 라운드트립 (W5 메뉴 사이클 라운드 2026-05-09).
 *
 * - takeSnapshot으로 SaveInput 생성 → saveSlot 직렬화 → loadSlot 역직렬화 → 동등성 검증.
 * - applySnapshot은 ScriptInterpreter.loadScene을 호출하므로 모킹 필요.
 *   본 테스트는 직렬화 부분만 검증 — applySnapshot의 interpreter seek는 별도 통합 테스트 영역.
 *
 * jsdom 환경의 localStorage 사용. 각 테스트마다 clear.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { saveSlot, loadSlot } from '@/engine/saveSlots';
import { useGameStore } from '@/stores/gameStore';

function resetStore() {
  localStorage.clear();
  useGameStore.getState().resetForNewGame();
}

describe('takeSnapshot → saveSlot → loadSlot 라운드트립', () => {
  beforeEach(resetStore);

  it('빈 상태에서 takeSnapshot 호출 시 SaveInput 형태 정합', () => {
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap).toMatchObject({
      flags: expect.any(Object),
      history: expect.any(Array),
      currentSceneId: '',
      currentCommandIndex: 0,
      audio: { bgmTrack: null, bgmTime: 0 },
      preview: expect.objectContaining({
        chapter: expect.any(String),
        excerpt: '',
      }),
      thumbnail: '',
    });
  });

  it('flags 변경 후 takeSnapshot → 저장/로드 시 flags 보존', () => {
    useGameStore.setState((s) => ({
      flags: { ...s.flags, H1: 75, H2: 40, late_reply_count: 1 },
      currentSceneId: 'ch06_h1_open',
      currentCommandIndex: 12,
    }));
    const snap = useGameStore.getState().takeSnapshot();
    saveSlot(1, snap);
    const loaded = loadSlot(1);
    expect(loaded).not.toBeNull();
    expect(loaded?.flags.H1).toBe(75);
    expect(loaded?.flags.H2).toBe(40);
    expect(loaded?.flags.late_reply_count).toBe(1);
    expect(loaded?.currentSceneId).toBe('ch06_h1_open');
    expect(loaded?.currentCommandIndex).toBe(12);
  });

  it('history 마지막 엔트리가 preview.excerpt에 들어감', () => {
    useGameStore.setState((s) => ({
      history: [
        {
          speaker: '구윤모',
          text: '본과 1학년이라.',
          type: 'monologue',
          sceneId: 'prologue_01_home',
          timestamp: 1700000000000,
        },
        {
          speaker: '차세린',
          text: '안녕, 윤모야.',
          type: 'dialogue',
          sceneId: 'ch01_ot_first_day',
          timestamp: 1700000001000,
        },
      ],
      currentSceneId: 'ch01_ot_first_day',
      flags: s.flags,
    }));
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap.preview.excerpt).toBe('안녕, 윤모야.');
  });

  it('met_heroines 마지막 항목이 preview.activeHeroine에 들어감', () => {
    useGameStore.setState((s) => ({
      flags: { ...s.flags, met_heroines: ['H1', 'H3', 'H4'] },
    }));
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap.preview.activeHeroine).toBe('H4');
  });

  it('met_heroines 비어있으면 last_increment_order 마지막 항목 사용', () => {
    useGameStore.setState((s) => ({
      flags: { ...s.flags, met_heroines: [], last_increment_order: ['H2', 'H5'] },
    }));
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap.preview.activeHeroine).toBe('H5');
  });

  it('chapterTitle이 preview.chapter에 정합', () => {
    useGameStore.setState((s) => ({
      currentSceneId: 'ch06_h1_true',
      flags: s.flags,
    }));
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap.preview.chapter).toBe('Chapter 6 — 차세린 분기');
  });

  it('audio.bgmTime은 항상 0 (PM 결정 — 트랙 처음부터 재생)', () => {
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap.audio.bgmTime).toBe(0);
  });

  it('thumbnail은 빈 문자열 (W5는 미생성)', () => {
    const snap = useGameStore.getState().takeSnapshot();
    expect(snap.thumbnail).toBe('');
  });
});

describe('UI 토글 액션 — setSaveLoadOpen / setSettingsOpen', () => {
  beforeEach(resetStore);

  it('setSaveLoadOpen 모드 토글 + null로 닫힘', () => {
    const { setSaveLoadOpen } = useGameStore.getState();
    setSaveLoadOpen('save');
    expect(useGameStore.getState().saveLoadMode).toBe('save');
    setSaveLoadOpen('load');
    expect(useGameStore.getState().saveLoadMode).toBe('load');
    setSaveLoadOpen(null);
    expect(useGameStore.getState().saveLoadMode).toBeNull();
  });

  it('setSettingsOpen 토글', () => {
    const { setSettingsOpen } = useGameStore.getState();
    setSettingsOpen(true);
    expect(useGameStore.getState().isSettingsOpen).toBe(true);
    setSettingsOpen(false);
    expect(useGameStore.getState().isSettingsOpen).toBe(false);
  });

  it('UI 토글은 partialize에서 제외 — persist에 저장 안 됨', () => {
    useGameStore.getState().setSaveLoadOpen('save');
    useGameStore.getState().setSettingsOpen(true);
    const persisted = localStorage.getItem('kmu-vn-autosave');
    if (persisted) {
      const parsed = JSON.parse(persisted);
      expect(parsed.state).not.toHaveProperty('saveLoadMode');
      expect(parsed.state).not.toHaveProperty('isSettingsOpen');
    }
  });
});
