/**
 * applyChoiceEffects의 토스트 이벤트 합치기 — 같은 대상 FLAG_INC를 1건으로 묶는지 검증.
 *
 * 컨텍스트 (2026-05-11 라운드):
 *   ch01_05_cafe 옵션 B는 explicit `effects: gyumin +30` + 톤 매트릭스 routing(playful_casual,
 *   coFire:[gyumin, junhyuk])로 gyumin matrix(3×15=+45). 종전엔 토스트 카드 2개(+30, +45) 분리 표시
 *   → 합쳐서 +75 카드 1개로 표시되도록 applyChoiceEffects가 post-process로 묶음.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, applyChoiceEffects } from '@/stores/gameStore';
import type { Choice, SceneMeta } from '@/engine/types';

function reset() {
  localStorage.clear();
  useGameStore.getState().resetForNewGame();
}

describe('applyChoiceEffects — 같은 대상 이벤트 합치기', () => {
  beforeEach(reset);

  it('explicit effects(gyumin +30) + 톤(coFire gyumin playful → +45) → 1건 +75 이벤트', () => {
    const choice: Choice = {
      text: '야 첫날부터 뭔 소리야',
      tone: 'playful_casual',
      coFireNpcs: ['gyumin', 'junhyuk'],
      effects: [{ type: 'FLAG_INC', key: 'gyumin', delta: 30 }],
    };
    const sceneMeta: SceneMeta = {
      activeHeroines: ['gyumin', 'gyeongmin', 'nathan', 'junhyuk'],
    };

    const state = useGameStore.getState();
    const next = applyChoiceEffects(state, choice, sceneMeta);

    // flag 누적치는 합 (+75)
    expect(next.flags.gyumin).toBe(75);
    // junhyuk는 coFire로 tone routing 1건만 (playful matrix 2×15=+30)
    expect(next.flags.junhyuk).toBe(30);

    // affectionEvents — gyumin에 대해 1건만 존재해야 함
    const fresh = next.affectionEvents.filter(
      (e) => !state.affectionEvents.some((s) => s.id === e.id),
    );
    const gyuminEvents = fresh.filter((e) => e.heroine === 'gyumin');
    expect(gyuminEvents.length).toBe(1);
    expect(gyuminEvents[0].delta).toBe(75);
    expect(gyuminEvents[0].newValue).toBe(75);
    expect(gyuminEvents[0].prevValue).toBe(0);

    // junhyuk도 1건
    const junhyukEvents = fresh.filter((e) => e.heroine === 'junhyuk');
    expect(junhyukEvents.length).toBe(1);
    expect(junhyukEvents[0].delta).toBe(30);
  });

  it('단일 FLAG_INC만 있으면 이벤트도 단일 — 합치기 노옵', () => {
    const choice: Choice = {
      text: '내일 잘 해보자',
      tone: 'direct_friendly',
      coFireNpcs: ['gyumin'],
    };
    const sceneMeta: SceneMeta = {
      activeHeroines: ['gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk'],
    };

    const state = useGameStore.getState();
    const next = applyChoiceEffects(state, choice, sceneMeta);

    expect(next.flags.gyumin).toBe(45);
    const fresh = next.affectionEvents.filter(
      (e) => !state.affectionEvents.some((s) => s.id === e.id),
    );
    const gyuminEvents = fresh.filter((e) => e.heroine === 'gyumin');
    expect(gyuminEvents.length).toBe(1);
    expect(gyuminEvents[0].delta).toBe(45);
  });

  it('서로 다른 대상은 각각 1건 유지 (합치기는 대상 단위)', () => {
    const choice: Choice = {
      text: '...글쎄',
      tone: 'warm_supportive',
      coFireNpcs: ['gyumin', 'junhyuk'],
    };
    const sceneMeta: SceneMeta = {
      activeHeroines: ['gyumin', 'gyeongmin', 'nathan', 'junhyuk'],
    };

    const state = useGameStore.getState();
    const next = applyChoiceEffects(state, choice, sceneMeta);

    // gyumin warm 1×15=+15, junhyuk warm 3×15=+45
    expect(next.flags.gyumin).toBe(15);
    expect(next.flags.junhyuk).toBe(45);

    const fresh = next.affectionEvents.filter(
      (e) => !state.affectionEvents.some((s) => s.id === e.id),
    );
    const targets = fresh.map((e) => e.heroine).sort();
    expect(targets).toEqual(['gyumin', 'junhyuk']);
  });
});
