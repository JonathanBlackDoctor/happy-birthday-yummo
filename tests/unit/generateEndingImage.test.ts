/**
 * generateEndingImage — Canvas2D 기반 엔딩 결과 이미지 생성 (2026-05-10 W5 후속 라운드).
 *
 * jsdom 환경에서 Canvas API는 부분적 (HTMLCanvasElement.getContext가 null 반환할 수 있음).
 * 실제 이미지 픽셀 검증은 어렵고, 본 테스트는 함수 시그니처 + 분기 + downloadEndingImage 폴백만 검증.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { downloadEndingImage, generateEndingImage } from '@/ui/util/generateEndingImage';

describe('downloadEndingImage', () => {
  beforeEach(() => {
    // canvas.toBlob을 mock해 jsdom Canvas 미구현 회피
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      set fillStyle(_v) {},
      set strokeStyle(_v) {},
      set lineWidth(_v) {},
      set font(_v) {},
      set textAlign(_v) {},
    })) as never;
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb: (b: Blob | null) => void) => {
      cb(new Blob(['dummy'], { type: 'image/png' }));
    }) as never;

    // document.fonts.ready 즉시 resolve
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    // Image 로드는 즉시 onerror로 → fetchEndingSquare null 반환 → 그라데이션 폴백
    class FakeImage {
      onload?: () => void;
      onerror?: () => void;
      crossOrigin = '';
      set src(_v: string) {
        Promise.resolve().then(() => this.onerror?.());
      }
    }
    (globalThis as unknown as { Image: typeof Image }).Image = FakeImage as unknown as typeof Image;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generateEndingImage가 image/png Blob 반환', async () => {
    const blob = await generateEndingImage({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 567,
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('자산 fetch 실패해도 그라데이션 폴백으로 정상 반환 (no throw)', async () => {
    // Image FakeImage가 onerror 즉시 호출 → square=null → 그라데이션 분기 작동
    const blob = await generateEndingImage({
      endingId: 'END_H4_REJECT', // type=none이라 자산 자체 미존재 케이스
      grade: 'D',
      finalScore: 100,
    });
    expect(blob).toBeInstanceOf(Blob);
  });

  it('downloadEndingImage가 a[download] 트리거 + kind:downloaded 반환', async () => {
    // URL.createObjectURL/revokeObjectURL 모킹 (jsdom 미지원)
    if (!('createObjectURL' in URL)) {
      Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:fake') });
      Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    }

    const clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: clickSpy, writable: true });
      }
      return el;
    });

    const result = await downloadEndingImage({
      endingId: 'END_H1_TRUE',
      grade: 'A',
      finalScore: 567,
    });

    expect(result.kind).toBe('downloaded');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
