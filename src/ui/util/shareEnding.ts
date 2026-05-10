/**
 * 엔딩 결과 공유 — 텍스트 + URL 방식 (PM 결정 2026-05-09).
 *
 * - 모바일: navigator.share (네이티브 share sheet)
 * - PC: navigator.clipboard.writeText (클립보드 복사)
 * - 폴백: prompt() — 사용자가 수동 복사
 *
 * 의존성 0 (html2canvas 등 미사용).
 */

import type { EndingId } from '@/engine/types';
import type { EndingGrade } from '@/engine/endingScore';
import { findEnding } from '@/data/endings';

const GAME_TITLE = '성서로맨스: 본과 1학년의 봄';

export type ShareResult =
  | { kind: 'shared' }
  | { kind: 'copied' }
  | { kind: 'manual'; text: string }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

export interface ShareInput {
  endingId: EndingId;
  grade: EndingGrade;
  finalScore: number;
  /** 폴백/테스트 시 주입 가능. 미지정 시 location.origin. */
  url?: string;
}

export function buildShareText(input: ShareInput): string {
  const meta = findEnding(input.endingId);
  const title = meta?.title ?? input.endingId;
  const url = input.url ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${GAME_TITLE} — ${title}\n등급 ${input.grade} · 점수 ${input.finalScore}\n${url}`.trim();
}

/**
 * 엔딩 결과 공유. 환경에 따라 navigator.share / clipboard / prompt 폴백 자동 선택.
 * 호출자는 ShareResult.kind로 토스트 분기.
 */
export async function shareEndingResult(input: ShareInput): Promise<ShareResult> {
  const text = buildShareText(input);
  const meta = findEnding(input.endingId);
  const url = input.url ?? (typeof window !== 'undefined' ? window.location.origin : '');

  // 1) Web Share API 우선 (모바일 + 일부 PC 브라우저)
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      await navigator.share({
        title: `${GAME_TITLE} — ${meta?.title ?? input.endingId}`,
        text,
        url,
      });
      return { kind: 'shared' };
    } catch (e) {
      // AbortError: 사용자가 share sheet 취소 — 토스트 미노출이 자연스러움
      if (e instanceof Error && e.name === 'AbortError') {
        return { kind: 'cancelled' };
      }
      // 그 외 에러는 클립보드로 폴백
    }
  }

  // 2) Clipboard API 폴백
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return { kind: 'copied' };
    } catch (e) {
      // 권한 거부 / iframe 격리 등 — 수동 폴백
      // eslint-disable-next-line no-console
      console.warn('[shareEnding] clipboard.writeText 실패:', e);
    }
  }

  // 3) 최종 폴백 — prompt()로 사용자 수동 복사
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    window.prompt('아래 내용을 복사하세요', text);
    return { kind: 'manual', text };
  }

  return { kind: 'error', message: '공유 가능한 채널이 없습니다.' };
}
