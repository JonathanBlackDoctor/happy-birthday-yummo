/**
 * 엔딩 결과 이미지용 1:1 정사각 배경 자산 생성 — 2026-05-10 PM 결정 라운드.
 *
 * 16개 엔딩 순회 (`ENDING_FLAVOR`) →
 *   - type 'cg': /img/cg/{id}.webp 1:1 center crop → /img/ending-square/{endingId}.webp (1080×1080)
 *   - type 'bg': /img/bg/{id}.webp 1:1 center crop + sprite가 있으면 BG 위로 합성
 *     · sprite 위치: 정사각 캔버스 가로 중앙(center), 하단 정렬, 88% 높이
 *   - type 'none': 단색 폴백 (어두운 보라) 1080×1080 생성
 *
 * 의존성 0 — ffmpeg CLI 호출 (사용자 환경에 ffmpeg 8.1+ 보유).
 *
 * 출력: public/img/ending-square/{endingId}.webp 16장.
 *   결과 이미지 합성(generateEndingImage.ts) + EndingGallery 썸네일에 활용.
 *
 * 사용:
 *   npm run generate:ending-square
 *
 * 자산 누락 시: 해당 엔딩만 스킵 + 경고 로그. 폴백 색 자산도 생성 X — generateEndingImage가 자체 폴백.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENDING_FLAVOR } from '../src/data/endingFlavor.ts';
import type { EndingId } from '../src/engine/types.ts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const PUBLIC_IMG = join(PROJECT_ROOT, 'public', 'img');
const OUT_DIR = join(PUBLIC_IMG, 'ending-square');
const OUTPUT_SIZE = 1080;
const SPRITE_HEIGHT_FRAC = 0.88; // EndingScreen.tsx height: 88% 미러

/** ffmpeg 호출 헬퍼. stderr는 그대로 전달 (verbose 검수). */
function ff(args: string[]): void {
  execFileSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'inherit'] });
}

interface Result {
  endingId: EndingId;
  status: 'ok' | 'skip-cg-missing' | 'skip-bg-missing' | 'skip-sprite-missing' | 'none';
  message?: string;
}

function generateOne(endingId: EndingId): Result {
  const flavor = ENDING_FLAVOR[endingId];
  const out = join(OUT_DIR, `${endingId}.webp`);
  const decisive = flavor.decisiveImage;

  if (decisive.type === 'none') {
    return { endingId, status: 'none', message: 'decisiveImage type=none → skip (런타임 폴백)' };
  }

  if (decisive.type === 'cg') {
    const cg = join(PUBLIC_IMG, 'cg', `${decisive.id}.webp`);
    if (!existsSync(cg)) return { endingId, status: 'skip-cg-missing', message: cg };
    // CG center crop 1:1 → resize to 1080×1080
    ff([
      '-y',
      '-i', cg,
      '-vf', `crop=min(iw\\,ih):min(iw\\,ih),scale=${OUTPUT_SIZE}:${OUTPUT_SIZE}:flags=lanczos`,
      '-q:v', '80',
      out,
    ]);
    return { endingId, status: 'ok' };
  }

  // type === 'bg' — BG center crop + 스프라이트 합성 (있으면)
  const bg = join(PUBLIC_IMG, 'bg', `${decisive.id}.webp`);
  if (!existsSync(bg)) return { endingId, status: 'skip-bg-missing', message: bg };

  if (!flavor.sprite) {
    // BG만 — 단순 center crop
    ff([
      '-y',
      '-i', bg,
      '-vf', `crop=min(iw\\,ih):min(iw\\,ih),scale=${OUTPUT_SIZE}:${OUTPUT_SIZE}:flags=lanczos`,
      '-q:v', '80',
      out,
    ]);
    return { endingId, status: 'ok' };
  }

  // BG + sprite 합성: BG 1:1 crop → 1080×1080. sprite는 height=88%, 우측 6% padding, 하단 정렬.
  // 2026-05-10 PM 정정: 가로 중앙 → 우측 (점수 텍스트 중앙 박혀 스프라이트 가림 회피, 메인 EndingScreen right: 6% 미러).
  const sprite = join(PUBLIC_IMG, 'sprites', `${flavor.sprite}.webp`);
  if (!existsSync(sprite)) return { endingId, status: 'skip-sprite-missing', message: sprite };

  const spriteH = Math.round(OUTPUT_SIZE * SPRITE_HEIGHT_FRAC);
  const rightPad = Math.round(OUTPUT_SIZE * 0.06);
  ff([
    '-y',
    '-i', bg,
    '-i', sprite,
    '-filter_complex',
      `[0:v]crop=min(iw\\,ih):min(iw\\,ih),scale=${OUTPUT_SIZE}:${OUTPUT_SIZE}:flags=lanczos[bg];` +
      `[1:v]scale=-1:${spriteH}:flags=lanczos[sp];` +
      `[bg][sp]overlay=W-w-${rightPad}:H-h`,
    '-q:v', '80',
    out,
  ]);
  return { endingId, status: 'ok' };
}

function main(): void {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
    console.log(`[mkdir] ${OUT_DIR}`);
  }

  const endingIds = Object.keys(ENDING_FLAVOR) as EndingId[];
  const results: Result[] = [];

  for (const id of endingIds) {
    process.stdout.write(`[${id}] `);
    try {
      const r = generateOne(id);
      results.push(r);
      if (r.status === 'ok') {
        const out = join(OUT_DIR, `${id}.webp`);
        const sz = statSync(out).size;
        console.log(`✓ ${(sz / 1024).toFixed(1)}KB`);
      } else if (r.status === 'none') {
        console.log(`⊘ ${r.message}`);
      } else {
        console.log(`✗ ${r.status} (${r.message})`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ endingId: id, status: 'skip-cg-missing', message: msg });
      console.log(`✗ exception: ${msg}`);
    }
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const none = results.filter((r) => r.status === 'none').length;
  const skipped = results.length - ok - none;
  console.log(`\n=== 결과 ===`);
  console.log(`성공: ${ok}/${results.length}, type=none: ${none}, 스킵: ${skipped}`);
  if (skipped > 0) {
    console.log(`\n스킵된 엔딩 (자산 누락):`);
    for (const r of results.filter((r) => r.status !== 'ok' && r.status !== 'none')) {
      console.log(`  - ${r.endingId}: ${r.status} (${r.message})`);
    }
  }
}

main();
