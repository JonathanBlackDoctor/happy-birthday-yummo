/**
 * 거절 카톡 정확 텍스트 가드 — MASTER-PLAN.md §4.3 SSoT 변경 금지.
 *
 * H4 시트 §6 + route-H4 §END_H4_REJECT + ch06_h4_seoyoon.md Scene `ch06_h4_reject` 모두 동일.
 * 이 테스트가 깨지면 CI fail — 거절 카톡 텍스트가 임의로 변경된 것.
 */

import { describe, it, expect } from 'vitest';
import {
  REJECT_LINES,
  REJECT_STAGES,
  REJECT_STAGE_TIMING_MS,
  REJECT_MESSAGE_INTERVAL_MS,
  REJECT_ENDING_ID,
} from '@/engine/rejectLines';

describe('REJECT_LINES — MASTER-PLAN §4.3 변경 금지 텍스트', () => {
  it('정확히 4줄', () => {
    expect(REJECT_LINES).toHaveLength(4);
  });

  it('1줄: "답장이 너무 늦어서 미안해ㅠㅠ" 글자 단위 정확', () => {
    expect(REJECT_LINES[0]).toBe('답장이 너무 늦어서 미안해ㅠㅠ');
    expect(REJECT_LINES[0]).toContain('ㅠㅠ');
  });

  it('2줄: "그날 만나서 얘기하고 시간 잘 보냈는데" 글자 단위 정확', () => {
    expect(REJECT_LINES[1]).toBe('그날 만나서 얘기하고 시간 잘 보냈는데');
  });

  it('3줄: "더 진행하기엔 무리가 있을거 같아.." 점 두 개 정확', () => {
    expect(REJECT_LINES[2]).toBe('더 진행하기엔 무리가 있을거 같아..');
    expect(REJECT_LINES[2].endsWith('..')).toBe(true);
    expect(REJECT_LINES[2].endsWith('...')).toBe(false); // 점 3개 X
  });

  it('4줄: "좋은 인연 만나길 바랄게 🥺🥺" 🥺 두 개 정확', () => {
    expect(REJECT_LINES[3]).toBe('좋은 인연 만나길 바랄게 🥺🥺');
    const pleadingFaceMatches = REJECT_LINES[3].match(/🥺/g);
    expect(pleadingFaceMatches).toHaveLength(2);
  });

  it('전체 줄에서 다른 이모지/특수문자 누락 X', () => {
    // ㅠㅠ는 1줄에만, 🥺🥺는 4줄에만, .. 는 3줄에만
    expect(REJECT_LINES[0].match(/🥺/g)).toBeNull();
    expect(REJECT_LINES[3].match(/ㅠ/g)).toBeNull();
    expect(REJECT_LINES[1].match(/\.\./)).toBeNull();
  });
});

describe('REJECT_STAGES — H4 §6 8단계 정확 매핑', () => {
  it('정확히 8단계', () => {
    expect(REJECT_STAGES).toHaveLength(8);
  });

  it('단계 순서: fade-in → bgm → typing → pause → fade-out → title → video → toast', () => {
    expect(REJECT_STAGES).toEqual([
      'fade-in',
      'bgm',
      'typing',
      'pause',
      'fade-out',
      'title',
      'video',
      'toast',
    ]);
  });

  it('각 단계마다 timing 명세 존재', () => {
    REJECT_STAGES.forEach((stage) => {
      expect(REJECT_STAGE_TIMING_MS[stage]).toBeDefined();
      expect(typeof REJECT_STAGE_TIMING_MS[stage]).toBe('number');
    });
  });

  it('타이핑 1.5초, 정지 2초, 영상 5~7초 (상한 7초), 메시지 간격 0.8초', () => {
    expect(REJECT_STAGE_TIMING_MS.typing).toBe(1500);
    expect(REJECT_STAGE_TIMING_MS.pause).toBe(2000);
    expect(REJECT_STAGE_TIMING_MS.video).toBe(7000);
    expect(REJECT_MESSAGE_INTERVAL_MS).toBe(800);
  });
});

describe('REJECT_ENDING_ID — STATE-SCHEMA / BRANCH-GRAPH 정합', () => {
  it('END_H4_REJECT 정확', () => {
    expect(REJECT_ENDING_ID).toBe('END_H4_REJECT');
  });
});
