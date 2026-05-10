/**
 * shareEnding — Web Share API + 클립보드 폴백 분기 검증 (W5 메뉴 사이클 라운드 2026-05-09).
 *
 * vitest+jsdom 환경에선 navigator.share 미존재가 기본. 모킹으로 분기별 검증.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildShareText, shareEndingResult } from '@/ui/util/shareEnding';

const ORIGINAL_NAVIGATOR = globalThis.navigator;

function mockNavigator(overrides: Partial<Navigator>) {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: { ...ORIGINAL_NAVIGATOR, ...overrides },
  });
}

function restoreNavigator() {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: ORIGINAL_NAVIGATOR,
  });
}

describe('buildShareText', () => {
  it('엔딩 ID + 등급 + 점수 + URL이 한 텍스트로 합쳐짐', () => {
    const text = buildShareText({
      endingId: 'END_H1_TRUE',
      grade: 'S',
      finalScore: 612,
      url: 'https://example.com',
    });
    expect(text).toContain('성서로맨스');
    expect(text).toContain('세린'); // ENDING_CATALOG title
    expect(text).toContain('등급 S');
    expect(text).toContain('점수 612');
    expect(text).toContain('https://example.com');
  });

  it('알 수 없는 endingId는 ID 그대로 fallback', () => {
    const text = buildShareText({
      endingId: 'END_NONEXISTENT' as never,
      grade: 'D',
      finalScore: 0,
      url: '',
    });
    expect(text).toContain('END_NONEXISTENT');
  });
});

describe('shareEndingResult — 분기 우선순위', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  afterEach(() => {
    restoreNavigator();
    vi.restoreAllMocks();
  });

  it('navigator.share 가용 시 share 호출 + kind:shared', async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    mockNavigator({ share: shareSpy } as Partial<Navigator>);
    const result = await shareEndingResult({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 500,
      url: 'https://example.com',
    });
    expect(shareSpy).toHaveBeenCalledTimes(1);
    expect(result.kind).toBe('shared');
  });

  it('navigator.share AbortError → kind:cancelled (사용자 취소)', async () => {
    const err = new Error('User cancelled');
    err.name = 'AbortError';
    const shareSpy = vi.fn().mockRejectedValue(err);
    mockNavigator({ share: shareSpy } as Partial<Navigator>);
    const result = await shareEndingResult({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 500,
    });
    expect(result.kind).toBe('cancelled');
  });

  it('share 미가용 + clipboard 가용 → kind:copied', async () => {
    const writeSpy = vi.fn().mockResolvedValue(undefined);
    mockNavigator({
      clipboard: { writeText: writeSpy } as unknown as Clipboard,
    } as Partial<Navigator>);
    const result = await shareEndingResult({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 500,
      url: 'https://example.com',
    });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(result.kind).toBe('copied');
  });

  it('share 미가용 + clipboard 실패 → prompt 폴백 → kind:manual', async () => {
    const writeSpy = vi.fn().mockRejectedValue(new Error('denied'));
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
    mockNavigator({
      clipboard: { writeText: writeSpy } as unknown as Clipboard,
    } as Partial<Navigator>);
    const result = await shareEndingResult({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 500,
    });
    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(result.kind).toBe('manual');
  });
});
