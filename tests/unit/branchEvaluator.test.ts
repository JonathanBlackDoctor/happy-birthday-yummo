/**
 * BRANCH-GRAPH §6.1 + route-H4 §"분기 평가" 알고리즘 검증.
 *
 * scriptInterpreter.evaluateBranch()가 SSoT 그대로 평가하는지 5+ 케이스로 가드.
 * Plan §Phase B 검증 5건 + 추가 보강 케이스.
 *
 * scriptInterpreter는 SCENE_MANIFEST 의존이 없는 evaluateBranch만 직접 호출.
 */

import { describe, it, expect } from 'vitest';
import { ScriptInterpreter } from '@/engine/scriptInterpreter';
import type { GameFlags, HeroineId } from '@/engine/types';

function flags(overrides: Partial<GameFlags> = {}): GameFlags {
  return {
    H1: 0,
    H2: 0,
    H3: 0,
    H4: 0,
    H5: 0,
    late_reply_count: 0,
    last_increment_order: [],
    key_choices: { H1: [], H2: [], H3: [], H4: [], H5: [] },
    current_chapter: 'ch06',
    current_scene_id: '',
    visited_scenes: [],
    flag_anatomy_first_done: true,
    flag_dongsan_visit_done: true,
    flag_seoyoon_first_meet: false,
    flag_first_kakao_serin: false,
    mode: 'main',
    ...overrides,
  };
}

function withKeys(heroine: HeroineId, count: number): Partial<GameFlags> {
  const list = Array.from({ length: count }, (_, i) => `key_${heroine}_${i}`);
  return {
    key_choices: { H1: [], H2: [], H3: [], H4: [], H5: [], [heroine]: list },
  };
}

describe('ScriptInterpreter.evaluateBranch — BRANCH-GRAPH §6.1 정합', () => {
  const interp = new ScriptInterpreter();

  // ─── F-1: H4 거절 트리거 우선 평가 ───────────────────────────

  it('late_reply_count >= 1 시 H4 1위 무관하게 즉시 END_H4_REJECT (2026-05-09 ≥2→≥1 강화)', () => {
    // H1 1위 + key>=3 + aff>=80 (TRUE 조건 충족)이라도 late >= 1이면 거절 우선
    const f = flags({
      H1: 95,
      H4: 10,
      late_reply_count: 1,
      ...withKeys('H1', 3),
    });
    expect(interp.evaluateBranch(f)).toBe('END_H4_REJECT');
  });

  it('late_reply_count == 2도 동일하게 END_H4_REJECT', () => {
    const f = flags({
      H1: 95,
      H4: 10,
      late_reply_count: 2,
      ...withKeys('H1', 3),
    });
    expect(interp.evaluateBranch(f)).toBe('END_H4_REJECT');
  });

  it('late_reply_count == 0 + H4 1위 + aff>=95 + key>=3 → END_H4_TRUE', () => {
    // 모닥불 +25 흡수: H4 트루 임계 70→95 (라우팅용 +50 인플레 상쇄, 티어 난이도 유지)
    const f = flags({ H4: 100, late_reply_count: 0, ...withKeys('H4', 3) });
    expect(interp.evaluateBranch(f)).toBe('END_H4_TRUE');
  });

  // ─── F-2: 모든 호감도 <30 → SOLO ──────────────────────────────

  it('모든 호감도 <30 → END_SOLO_SUMMER (16번째 엔딩)', () => {
    const f = flags({ H1: 25, H2: 28, H3: 10, H4: 5, H5: 29 });
    expect(interp.evaluateBranch(f)).toBe('END_SOLO_SUMMER');
  });

  // ─── H5 트루 단일 / fallback SOLO ─────────────────────────────

  it('H5 1위 + aff<120 또는 key<3 시 SOLO_SUMMER 폴백 (2026-05-09 endings-revamp 임계 상향 80→120)', () => {
    // H5는 TRUE만 존재 — 미달 시 SOLO 흡수 (BRANCH-GRAPH §2)
    const f = flags({ H5: 100, ...withKeys('H5', 2) });
    expect(interp.evaluateBranch(f)).toBe('END_SOLO_SUMMER');
  });

  it('H5 1위 + aff>=120 + key>=3 → END_H5_TRUE (인물별 임계 차별화)', () => {
    const f = flags({ H5: 125, ...withKeys('H5', 3) });
    expect(interp.evaluateBranch(f)).toBe('END_H5_TRUE');
  });

  // ─── H1·H2 4종 분기 (2026-05-09 endings-revamp 인물별 임계 차별화) ──

  it('H1 1위 + aff>=105 + key>=3 → END_H1_TRUE (임계 80→105)', () => {
    const f = flags({ H1: 108, ...withKeys('H1', 3) });
    expect(interp.evaluateBranch(f)).toBe('END_H1_TRUE');
  });

  it('H2 1위 + aff>=95 → END_H2_HAPPY (임계 70→95)', () => {
    const f = flags({ H2: 98, ...withKeys('H2', 2) });
    expect(interp.evaluateBranch(f)).toBe('END_H2_HAPPY');
  });

  it('H1 1위 + aff>=70 + key<3 → END_H1_NORMAL (임계 50→70)', () => {
    const f = flags({ H1: 75, ...withKeys('H1', 1) });
    expect(interp.evaluateBranch(f)).toBe('END_H1_NORMAL');
  });

  it('H1 1위 + aff<70 → END_H1_BAD (임계 50→70)', () => {
    const f = flags({ H1: 65 });
    expect(interp.evaluateBranch(f)).toBe('END_H1_BAD');
  });

  // ─── H3 BAD 없음 ──────────────────────────────────────────────

  it('H3 1위 + aff<75 (BAD 자리) → END_H3_NORMAL fallback', () => {
    // H3는 BAD 없음 — NORMAL로 폴백 (BRANCH-GRAPH §2)
    const f = flags({ H3: 50 });
    expect(interp.evaluateBranch(f)).toBe('END_H3_NORMAL');
  });

  it('H3 1위 + aff>=90 + key>=3 → END_H3_TRUE (임계 80→90)', () => {
    const f = flags({ H3: 95, ...withKeys('H3', 3) });
    expect(interp.evaluateBranch(f)).toBe('END_H3_TRUE');
  });

  // ─── H4 BAD 자리 흡수 ─────────────────────────────────────────

  it('H4 1위 + aff<70 (BAD 자리) → END_H4_REJECT 흡수 (모닥불 +25 흡수 임계 45→70)', () => {
    const f = flags({ H4: 40 });
    expect(interp.evaluateBranch(f)).toBe('END_H4_REJECT');
  });

  it('H4 1위 + 70<=aff<95 + late==0 → END_H4_NORMAL', () => {
    const f = flags({ H4: 80, late_reply_count: 0, ...withKeys('H4', 3) });
    expect(interp.evaluateBranch(f)).toBe('END_H4_NORMAL');
  });

  // ─── 동률 결정 (last_increment_order) ──────────────────────────

  it('동률 시 last_increment_order에서 마지막에 +값 받은 히로인이 1위', () => {
    // H1, H2 모두 110. 마지막에 H2가 +값 받았으면 H2 분기 → TRUE (110 ≥ 110 + KEY 3)
    const f = flags({
      H1: 110,
      H2: 110,
      last_increment_order: ['H1', 'H2'],
      ...withKeys('H2', 3),
    });
    expect(interp.evaluateBranch(f)).toBe('END_H2_TRUE');
  });
});
