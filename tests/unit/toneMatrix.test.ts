/**
 * 톤 매트릭스 검증 — CONVENTIONS.md §3.7 SSoT 정합.
 *
 * 5×5 베이스 매트릭스 + H3 night 보정 + H4 미니게임 + KEY 묘사 보너스 +
 * H4 대면 KEY 자리 (Step 4 PM 결정) 모두 검증.
 */

import { describe, it, expect } from 'vitest';
import {
  computeToneDeltas,
  toneToFlagIncs,
  toneToKeyChoice,
  TONE_MATRIX,
  H3_NIGHT_DELTA,
  DESCRIPTOR_BONUS,
  H4_REPLY_SPEED,
} from '@/engine/toneMatrix';
import type { Choice } from '@/engine/types';

describe('computeToneDeltas — 베이스 5×5 매트릭스', () => {
  it('mature_serious 톤은 5명에게 각각 다른 점수 (H1 KEY, H5 어색)', () => {
    const deltas = computeToneDeltas({ tone: 'mature_serious' });
    expect(deltas.H1).toBe(TONE_MATRIX.H1.mature_serious); // 10 (KEY)
    expect(deltas.H2).toBe(TONE_MATRIX.H2.mature_serious); // -1
    expect(deltas.H3).toBe(TONE_MATRIX.H3.mature_serious); // 5
    expect(deltas.H4).toBe(TONE_MATRIX.H4.mature_serious); // 1
    expect(deltas.H5).toBe(TONE_MATRIX.H5.mature_serious); // -2 (어색)
  });

  it('bright_forward 톤은 H5 KEY (10), H1 -1', () => {
    const deltas = computeToneDeltas({ tone: 'bright_forward' });
    expect(deltas.H5).toBe(10);
    expect(deltas.H1).toBe(-1);
  });

  it('tone 미박힌 선택지는 모두 0', () => {
    const deltas = computeToneDeltas({});
    expect(deltas).toEqual({ H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 });
  });
});

describe('computeToneDeltas — H3 시간대 갭 (night 보정)', () => {
  it('H3 night + warm_supportive (KEY 자리) → 일반 자리 보정 -5', () => {
    const day = computeToneDeltas({ tone: 'warm_supportive' });
    const night = computeToneDeltas({ tone: 'warm_supportive' }, { toneTime: 'night' });
    expect(day.H3).toBe(10);
    expect(night.H3).toBe(10 + H3_NIGHT_DELTA.warm_supportive); // 10 + (-5) = 5
  });

  it('H3 night + playful_casual → 풀어진 톤 환영 +4', () => {
    const day = computeToneDeltas({ tone: 'playful_casual' });
    const night = computeToneDeltas({ tone: 'playful_casual' }, { toneTime: 'night' });
    expect(night.H3 - day.H3).toBe(H3_NIGHT_DELTA.playful_casual); // +4
  });

  it('H3 외 다른 히로인은 night 보정 안 받음', () => {
    const day = computeToneDeltas({ tone: 'warm_supportive' });
    const night = computeToneDeltas({ tone: 'warm_supportive' }, { toneTime: 'night' });
    expect(day.H1).toBe(night.H1);
    expect(day.H4).toBe(night.H4);
  });
});

describe('computeToneDeltas — KEY 묘사 보너스', () => {
  it('H1 KEY 톤 (mature_serious) + isKey → +5 묘사 보너스 추가', () => {
    const noKey = computeToneDeltas({ tone: 'mature_serious' });
    const withKey = computeToneDeltas({ tone: 'mature_serious', isKey: true });
    expect(withKey.H1 - noKey.H1).toBe(DESCRIPTOR_BONUS); // +5
  });

  it('H2 KEY 톤 (direct_friendly) + isKey → +5 묘사 보너스 추가', () => {
    const withKey = computeToneDeltas({ tone: 'direct_friendly', isKey: true });
    expect(withKey.H2).toBe(TONE_MATRIX.H2.direct_friendly + DESCRIPTOR_BONUS);
  });

  it('isKey 라벨 박혀도 매칭 톤 아니면 묘사 보너스 X (H1에 bright_forward)', () => {
    const noBonus = computeToneDeltas({ tone: 'bright_forward', isKey: true });
    expect(noBonus.H1).toBe(TONE_MATRIX.H1.bright_forward); // -1, 보너스 없음
  });

  it('H3 KEY (warm_supportive) + isKey + night — Step 4: KEY 시간대 무관 묘사 보너스', () => {
    // 2026-04-30 PM 결정: H3 KEY 시간대 무관, 묘사 보너스 가산
    // night H3 warm_supportive 베이스: 10 + (-5) = 5
    // KEY 묘사 보너스 +5 → 10
    const night = computeToneDeltas(
      { tone: 'warm_supportive', isKey: true },
      { toneTime: 'night' },
    );
    expect(night.H3).toBe(10 + H3_NIGHT_DELTA.warm_supportive + DESCRIPTOR_BONUS);
  });
});

describe('computeToneDeltas — H4 미니게임 (h4_reply_speed)', () => {
  it('H4 미니게임 통과 (15초 미만) → +1, isKey 시 +5 묘사 보너스 추가', () => {
    const passed = computeToneDeltas({
      tone: 'warm_supportive',
      mechanism: 'h4_reply_speed',
      replyTimeMs: 5_000, // 5초 통과
      isKey: true,
    });
    // H4 베이스 warm_supportive=1, 미니게임 통과 +1, KEY 묘사 +5
    expect(passed.H4).toBe(
      TONE_MATRIX.H4.warm_supportive + H4_REPLY_SPEED.passDelta + DESCRIPTOR_BONUS,
    );
  });

  it('H4 미니게임 타임아웃 (15초 이상) → -3', () => {
    const timeout = computeToneDeltas({
      tone: 'warm_supportive',
      mechanism: 'h4_reply_speed',
      replyTimeMs: 16_000, // 16초 = 타임아웃
    });
    expect(timeout.H4).toBe(
      TONE_MATRIX.H4.warm_supportive + H4_REPLY_SPEED.failDelta,
    );
  });

  it('H4 대면 KEY 자리 (mechanism h4_facing_key + isKey) → 묘사 +5 가산 (옵션 B 2026-05-05)', () => {
    // 옵션 B PM 결정: 명시 마커 'h4_facing_key'로 H3와 라우팅 분리.
    const facingKey = computeToneDeltas({
      tone: 'warm_supportive',
      isKey: true,
      mechanism: 'h4_facing_key',
    });
    expect(facingKey.H4).toBe(TONE_MATRIX.H4.warm_supportive + DESCRIPTOR_BONUS); // 1 + 5 = 6
  });

  it('warm_supportive + isKey + mechanism 없음 → H4 묘사 보너스 0 (마커 없으면 H3 KEY로만 라우팅)', () => {
    // 옵션 B 회귀 가드: 마커 없는 warm_supportive isKey는 H4에 묘사 보너스를 주지 않음.
    const noMarker = computeToneDeltas({
      tone: 'warm_supportive',
      isKey: true,
    });
    expect(noMarker.H4).toBe(TONE_MATRIX.H4.warm_supportive); // 베이스 1만, +5 가산 없음
    expect(noMarker.H3).toBe(TONE_MATRIX.H3.warm_supportive + DESCRIPTOR_BONUS); // 10 + 5 = 15
  });

  it('H4 미니게임은 H4에만 영향, 다른 4명은 베이스 매트릭스만', () => {
    const result = computeToneDeltas({
      tone: 'warm_supportive',
      mechanism: 'h4_reply_speed',
      replyTimeMs: 5_000,
    });
    expect(result.H1).toBe(TONE_MATRIX.H1.warm_supportive);
    expect(result.H2).toBe(TONE_MATRIX.H2.warm_supportive);
    expect(result.H3).toBe(TONE_MATRIX.H3.warm_supportive);
    expect(result.H5).toBe(TONE_MATRIX.H5.warm_supportive);
  });
});

describe('toneToFlagIncs — SceneCommand[] 변환', () => {
  it('non-zero delta만 FLAG_INC 명령 발행', () => {
    const cmds = toneToFlagIncs({ tone: 'mature_serious' });
    // H 5명: H1 +10, H2 -1, H3 +5, H4 +1, H5 -2 — 모두 non-zero (5)
    // NPC 7명 → non-zero 5개 (gyumin·nathan = 0): gyeongmin +3, wook +2, junhyuk +1, mom +3, taeho +3
    expect(cmds.length).toBe(10);
    cmds.forEach((c) => expect(c.type).toBe('FLAG_INC'));
  });

  it('H4 미니게임 타임아웃 시 late_reply_count +1 명령 자동 발행', () => {
    const cmds = toneToFlagIncs({
      tone: 'warm_supportive',
      mechanism: 'h4_reply_speed',
      replyTimeMs: 16_000,
    });
    const lateInc = cmds.find(
      (c) => c.type === 'FLAG_INC' && c.key === 'late_reply_count',
    );
    expect(lateInc).toBeDefined();
    expect(lateInc).toEqual({ type: 'FLAG_INC', key: 'late_reply_count', delta: 1 });
  });

  it('H4 미니게임 통과 시 late_reply_count 명령 없음', () => {
    const cmds = toneToFlagIncs({
      tone: 'warm_supportive',
      mechanism: 'h4_reply_speed',
      replyTimeMs: 5_000,
    });
    const lateInc = cmds.find(
      (c) => c.type === 'FLAG_INC' && c.key === 'late_reply_count',
    );
    expect(lateInc).toBeUndefined();
  });
});

describe('toneToKeyChoice — KEY_CHOICE 명령 발행', () => {
  it('H1 KEY 톤 (mature_serious) + isKey → KEY_CHOICE H1 발행', () => {
    const cmd = toneToKeyChoice(
      { tone: 'mature_serious', isKey: true, descriptor: 'ch6_h1_test' } as Choice,
      'scene_x',
    );
    expect(cmd).toEqual({
      type: 'KEY_CHOICE',
      heroine: 'H1',
      choiceId: 'ch6_h1_test',
    });
  });

  it('H4 미니게임 통과 (replyTime < 15초) → KEY_CHOICE H4 발행 (isKey 무관)', () => {
    const cmd = toneToKeyChoice(
      {
        tone: 'warm_supportive',
        mechanism: 'h4_reply_speed',
        replyTimeMs: 8_000,
        descriptor: 'h4_reply_test',
      } as Choice,
      'scene_x',
    );
    expect(cmd).toEqual({
      type: 'KEY_CHOICE',
      heroine: 'H4',
      choiceId: 'h4_reply_test',
    });
  });

  it('H4 미니게임 타임아웃 → KEY_CHOICE 미발행', () => {
    const cmd = toneToKeyChoice(
      {
        tone: 'warm_supportive',
        mechanism: 'h4_reply_speed',
        replyTimeMs: 20_000,
      } as Choice,
      'scene_x',
    );
    expect(cmd).toBeNull();
  });

  it('H4 대면 KEY 자리 (mechanism h4_facing_key + isKey) → KEY_CHOICE H4', () => {
    // 옵션 B (2026-05-05 PM 결정) — 명시 마커로 H3와 라우팅 분리.
    const cmd = toneToKeyChoice(
      {
        tone: 'warm_supportive',
        isKey: true,
        mechanism: 'h4_facing_key',
        descriptor: 'ch6_h4_facing',
      } as Choice,
      'scene_x',
    );
    expect(cmd).toEqual({
      type: 'KEY_CHOICE',
      heroine: 'H4',
      choiceId: 'ch6_h4_facing',
    });
  });

  it('H4 대면 KEY 마커 + descriptor 누락 → choiceId fallback to sceneId', () => {
    const cmd = toneToKeyChoice(
      {
        tone: 'warm_supportive',
        isKey: true,
        mechanism: 'h4_facing_key',
      } as Choice,
      'scene_x',
    );
    expect(cmd).toEqual({
      type: 'KEY_CHOICE',
      heroine: 'H4',
      choiceId: 'scene_x',
    });
  });

  it('H3 KEY 자리 (warm_supportive + isKey, 마커 없음) → KEY_CHOICE H3 (정상 동작)', () => {
    // mechanism 없는 warm_supportive + isKey는 H3 KEY 자리로만 라우팅.
    const cmd = toneToKeyChoice(
      {
        tone: 'warm_supportive',
        isKey: true,
        descriptor: 'h3_meal_care',
      } as Choice,
      'scene_x',
    );
    expect(cmd).toEqual({
      type: 'KEY_CHOICE',
      heroine: 'H3',
      choiceId: 'h3_meal_care',
    });
  });

  it('h4_facing_key + isKey false → KEY_CHOICE 미발행', () => {
    const cmd = toneToKeyChoice(
      {
        tone: 'warm_supportive',
        isKey: false,
        mechanism: 'h4_facing_key',
      } as Choice,
      'scene_x',
    );
    expect(cmd).toBeNull();
  });

  it('isKey 라벨 없음 → KEY_CHOICE 미발행 (대면 자리)', () => {
    const cmd = toneToKeyChoice(
      { tone: 'mature_serious', isKey: false } as Choice,
      'scene_x',
    );
    expect(cmd).toBeNull();
  });
});
