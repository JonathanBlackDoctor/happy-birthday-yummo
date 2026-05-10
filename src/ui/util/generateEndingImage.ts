/**
 * 엔딩 결과 이미지 생성 — 순수 Canvas2D, 의존성 0 (2026-05-10 W5 메뉴 사이클 후속).
 *
 * html2canvas dep 미사용 결정에 따라 게임 화면 그대로 캡처는 안 함.
 * 대신 깔끔한 1080×1080 카드 이미지를 프로그램적으로 그림 — Twitter/Instagram 정사각 호환.
 *
 * 레이어 (위에서 아래):
 *   1. 다크 그라데이션 배경 (#1F1822 → #2A1F2E)
 *   2. 게임 제목 (소형, 상단)
 *   3. 엔딩 제목 (대형, 중앙 위)
 *   4. subtitle (있을 시, 중간)
 *   5. 등급 도장 (대형 + 컬러)
 *   6. 점수 (대형 숫자)
 *   7. 명대사 (있을 시, 이탤릭)
 *   8. 날짜 (소형, 하단)
 */

import type { EndingId } from '@/engine/types';
import type { EndingGrade } from '@/engine/endingScore';
import { findEnding } from '@/data/endings';
import { ENDING_FLAVOR } from '@/data/endingFlavor';

const GAME_TITLE = '구연시: 본과 1학년의 봄';
const IMG_SIZE = 1080;

const GRADE_COLOR: Record<EndingGrade, string> = {
  S: '#FFD86B',
  A: '#FF9DC4',
  B: '#A8DADC',
  C: '#B8B8C8',
  D: '#8A8A98',
};

export interface EndingImageInput {
  endingId: EndingId;
  grade: EndingGrade;
  finalScore: number;
  /** 테스트 용도 — 미지정 시 현재 시각. */
  now?: Date;
}

/**
 * 1:1 정사각 엔딩 자산 fetch — 사전 생성된 `/img/ending-square/{id}.webp`.
 * 자산 누락 시 null 반환 (호출자는 그라데이션 폴백).
 */
async function fetchEndingSquare(endingId: EndingId): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `/img/ending-square/${endingId}.webp`;
  });
}

/**
 * Canvas2D로 1080×1080 카드 그림. Blob(image/png) 반환.
 *
 * 폰트는 Pretendard 기본. Canvas는 외부 폰트 로드를 자동 안 하므로 본 함수는
 * `document.fonts.ready` 대기 후 그린다 (이미 로드되어 있으면 즉시 진행).
 *
 * 2026-05-10 PM 정정: 사전 생성 자산(/img/ending-square/{id}.webp)을 배경에 깔고
 * 그 위에 반투명 어두운 보라 레이어로 가독성 확보 후 텍스트 합성. 자산 누락 시 그라데이션 폴백.
 */
export async function generateEndingImage(input: EndingImageInput): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('generateEndingImage는 브라우저 환경 전용');
  }
  // 폰트 준비 대기 (이미 로드되어 있으면 즉시 resolve)
  if ('fonts' in document && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore — 폴백 폰트로 진행
    }
  }

  // 1:1 자산 미리 fetch (병렬로 폰트 + 자산)
  const square = await fetchEndingSquare(input.endingId);

  const canvas = document.createElement('canvas');
  canvas.width = IMG_SIZE;
  canvas.height = IMG_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context 생성 실패');

  const meta = findEnding(input.endingId);
  const flavor = ENDING_FLAVOR[input.endingId];

  // ── 1) 배경 — 자산이 있으면 자산 + 반투명 레이어, 없으면 그라데이션 폴백
  if (square) {
    ctx.drawImage(square, 0, 0, IMG_SIZE, IMG_SIZE);
    // EndingScreen.tsx의 반투명 보라 오버레이(BG 케이스 0.62)와 동일 톤
    ctx.fillStyle = 'rgba(31, 24, 34, 0.62)';
    ctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, IMG_SIZE, IMG_SIZE);
    bgGrad.addColorStop(0, '#1F1822');
    bgGrad.addColorStop(0.5, '#2A1F2E');
    bgGrad.addColorStop(1, '#3A2E3F');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
  }

  // ── 2) 외곽 보더 + 살짝 깊이감
  ctx.strokeStyle = 'rgba(255, 184, 209, 0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, IMG_SIZE - 80, IMG_SIZE - 80);

  const fontFamily = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = 'center';

  // ── 3) 게임 제목 (상단)
  ctx.fillStyle = 'rgba(255, 184, 209, 0.85)';
  ctx.font = `500 30px ${fontFamily}`;
  ctx.fillText(GAME_TITLE, IMG_SIZE / 2, 130);

  // ── 4) ENDING 라벨
  ctx.fillStyle = 'rgba(216, 200, 220, 0.55)';
  ctx.font = `600 24px ${fontFamily}`;
  ctx.fillText('— ENDING —', IMG_SIZE / 2, 200);

  // ── 5) 엔딩 제목 (대형)
  ctx.fillStyle = '#FFF8FA';
  ctx.font = `700 88px ${fontFamily}`;
  const title = meta?.title ?? input.endingId;
  ctx.fillText(title, IMG_SIZE / 2, 320);

  // ── 6) 부제 (있을 시)
  if (meta?.subtitle) {
    ctx.fillStyle = 'rgba(216, 200, 220, 0.85)';
    ctx.font = `400 36px ${fontFamily}`;
    ctx.fillText(`— ${meta.subtitle} —`, IMG_SIZE / 2, 380);
  }

  // ── 7) 등급 도장 (큰 + 색)
  const gradeY = 540;
  ctx.fillStyle = GRADE_COLOR[input.grade];
  ctx.font = `900 220px ${fontFamily}`;
  ctx.fillText(input.grade, IMG_SIZE / 2, gradeY + 80);

  // 등급 라벨
  ctx.fillStyle = 'rgba(255, 248, 250, 0.7)';
  ctx.font = `500 24px ${fontFamily}`;
  ctx.fillText('GRADE', IMG_SIZE / 2, gradeY - 130);

  // ── 8) 점수
  ctx.fillStyle = 'rgba(255, 248, 250, 0.85)';
  ctx.font = `600 22px ${fontFamily}`;
  ctx.fillText('SCORE', IMG_SIZE / 2, 720);

  ctx.fillStyle = '#FFF8FA';
  ctx.font = `800 96px ${fontFamily}`;
  ctx.fillText(input.finalScore.toString(), IMG_SIZE / 2, 820);

  // ── 9) 명대사 (있을 시)
  if (flavor?.quote) {
    ctx.fillStyle = 'rgba(255, 248, 250, 0.78)';
    ctx.font = `italic 400 30px ${fontFamily}`;
    const quote = `「${flavor.quote}」`;
    const wrapped = wrapText(ctx, quote, IMG_SIZE - 200);
    let qy = 900;
    for (const line of wrapped.slice(0, 2)) {
      ctx.fillText(line, IMG_SIZE / 2, qy);
      qy += 38;
    }
  }

  // ── 10) 날짜 (하단)
  const date = (input.now ?? new Date()).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  ctx.fillStyle = 'rgba(216, 200, 220, 0.45)';
  ctx.font = `500 20px ${fontFamily}`;
  ctx.fillText(date, IMG_SIZE / 2, IMG_SIZE - 70);

  // ── Blob 반환
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob 실패'));
    }, 'image/png', 0.95);
  });
}

/**
 * 한글/영문 혼용 텍스트를 maxWidth로 줄바꿈. 단어 경계 무시(공백 기준)지만 한글은 글자 단위.
 * 결과는 라인 배열. 호출자가 vertical 배치.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const tokens = text.split(/(\s+)/);
  const lines: string[] = [];
  let cur = '';
  for (const tok of tokens) {
    const test = cur + tok;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur.trim());
      cur = tok.trimStart();
    } else {
      cur = test;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

/**
 * 엔딩 결과 이미지를 PNG로 다운로드. 항상 다운로드 (Web Share API share sheet 사용 X).
 *
 * 2026-05-10 PM 정정: 이전 버전은 navigator.canShare({files}) 가용 시 share sheet 우선이었으나,
 * PC Chrome에서도 Windows Share UI가 떠서 "다운로드 옵션이 없다"는 신고. 항상 a[download] 단순화.
 * 모바일도 다운로드 폴더에 저장됨(브라우저 표준). 별도 공유 후처리는 사용자가 갤러리/공유 앱에서 수행.
 */
export async function downloadEndingImage(input: EndingImageInput): Promise<
  | { kind: 'downloaded' }
  | { kind: 'error'; message: string }
> {
  try {
    if (typeof document === 'undefined') {
      return { kind: 'error', message: '다운로드 가능한 환경이 아닙니다' };
    }
    const blob = await generateEndingImage(input);
    const filename = `kmu-vn-ending-${input.endingId}-${Date.now()}.png`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 메모리 회수 — 클릭 후 잠시 대기
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { kind: 'downloaded' };
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * @deprecated 2026-05-10 PM 정정 — share sheet 분기 제거. `downloadEndingImage` 사용.
 * 호출처(EndingScreen)는 모두 downloadEndingImage로 마이그레이션됨.
 */
export const saveOrShareEndingImage = downloadEndingImage;
