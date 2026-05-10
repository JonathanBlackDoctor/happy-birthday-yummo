/* eslint-disable no-console */
/**
 * 풀↔압축 무결성 검증 스크립트 v1.0 (2026-05-08).
 *
 * 입력: `src/scenes/*.scene.json` (풀) + `src/scenes/compressed/*.scene.json` (압축) + 두 모드의 `compiled-manifest.json`
 * 검증:
 *   1. 씬 ID 1:1 매핑 (풀에 있는 모든 씬 ID가 압축에도 존재, 그 반대도)
 *   2. 각 씬별 KAKAO 메시지 카운트 일치
 *   3. 각 씬별 CHOICE 카운트 일치 (단순 CHOICE + CHOICE_KAKAO)
 *   4. 각 씬별 CHOICE next 그래프 일치 (next 문자열 풀이 풀과 동일)
 *   5. 각 씬별 FLAG_INC / FLAG_SET / KEY_CHOICE / JUMP / ENDING 카운트 일치
 *   6. CG / VIDEO 트리거 ID 풀 일치
 *
 * 실패 시 exit 1 (CI fail).
 *
 * 사용:
 *   npm run validate:compressed
 *   또는 직접: tsx scripts/validate-compressed.ts
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const FULL_DIR = path.join(ROOT, 'src/scenes');
const COMP_DIR = path.join(ROOT, 'src/scenes/compressed');

interface SceneCommand {
  type: string;
  messages?: Array<unknown>;
  choices?: Array<{ next?: string; text?: string }>;
  next?: string;
  sceneId?: string;
  endingId?: string;
  key?: string;
  image?: string;
  src?: string;
  cgId?: string;
}
interface Scene {
  id: string;
  commands: SceneCommand[];
}

interface SceneCounts {
  total: number;
  NARR: number;
  MONO: number;
  DIAL: number;
  KAKAO: number;
  CHOICE: number;
  CHOICE_KAKAO: number;
  FLAG_INC: number;
  FLAG_SET: number;
  KEY_CHOICE: number;
  JUMP: number;
  ENDING: number;
  CG: number;
  VIDEO: number;
  choiceNexts: string[];
  cgIds: string[];
  videoSrcs: string[];
}

function countCommands(scene: Scene): SceneCounts {
  const c: SceneCounts = {
    total: scene.commands.length,
    NARR: 0, MONO: 0, DIAL: 0,
    KAKAO: 0, CHOICE: 0, CHOICE_KAKAO: 0,
    FLAG_INC: 0, FLAG_SET: 0, KEY_CHOICE: 0,
    JUMP: 0, ENDING: 0, CG: 0, VIDEO: 0,
    choiceNexts: [], cgIds: [], videoSrcs: [],
  };
  for (const cmd of scene.commands) {
    switch (cmd.type) {
      case 'NARRATION': c.NARR++; break;
      case 'MONOLOGUE': c.MONO++; break;
      case 'DIALOGUE': c.DIAL++; break;
      case 'KAKAO':
        c.KAKAO += (cmd.messages?.length ?? 0);
        break;
      case 'CHOICE':
        c.CHOICE++;
        for (const ch of cmd.choices ?? []) {
          if (ch.next) c.choiceNexts.push(ch.next);
        }
        break;
      case 'CHOICE_KAKAO':
        c.CHOICE_KAKAO++;
        for (const ch of cmd.choices ?? []) {
          if (ch.next) c.choiceNexts.push(ch.next);
        }
        break;
      case 'FLAG_INC': c.FLAG_INC++; break;
      case 'FLAG_SET': c.FLAG_SET++; break;
      case 'KEY_CHOICE': c.KEY_CHOICE++; break;
      case 'JUMP': c.JUMP++; break;
      case 'ENDING': c.ENDING++; break;
      case 'CG':
        c.CG++;
        if (cmd.cgId) c.cgIds.push(cmd.cgId);
        else if (cmd.image) c.cgIds.push(cmd.image);
        break;
      case 'VIDEO':
        c.VIDEO++;
        if (cmd.src) c.videoSrcs.push(cmd.src);
        break;
    }
  }
  c.choiceNexts.sort();
  c.cgIds.sort();
  c.videoSrcs.sort();
  return c;
}

function loadScenes(dir: string): Map<string, Scene> {
  const map = new Map<string, Scene>();
  if (!existsSync(dir)) {
    console.error(`✗ Scene directory not found: ${dir}`);
    process.exit(1);
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.scene.json'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    const scene = JSON.parse(readFileSync(filePath, 'utf-8')) as Scene;
    map.set(scene.id, scene);
  }
  return map;
}

const fullScenes = loadScenes(FULL_DIR);
const compScenes = loadScenes(COMP_DIR);

const errors: string[] = [];
const warnings: string[] = [];

// ─── 검증 1: 씬 ID 1:1 매핑 ─────────────────────────────────────
const fullIds = new Set(fullScenes.keys());
const compIds = new Set(compScenes.keys());

const missingInComp = [...fullIds].filter((id) => !compIds.has(id));
const extraInComp = [...compIds].filter((id) => !fullIds.has(id));

if (missingInComp.length > 0) {
  warnings.push(`압축본에 없는 풀 씬 ${missingInComp.length}개 (런타임 fallback으로 풀 자동 사용): ${missingInComp.slice(0, 5).join(', ')}${missingInComp.length > 5 ? '...' : ''}`);
}
if (extraInComp.length > 0) {
  errors.push(`풀에 없는 압축 씬 ${extraInComp.length}개 (오타 의심): ${extraInComp.join(', ')}`);
}

// ─── 검증 2~6: 양쪽에 다 있는 씬 비교 ───────────────────────────
const sharedIds = [...fullIds].filter((id) => compIds.has(id)).sort();

interface MismatchDetail {
  id: string;
  diffs: string[];
}
const mismatches: MismatchDetail[] = [];

const summary = {
  full: { total: 0, NARR: 0, MONO: 0, DIAL: 0, KAKAO: 0, CHOICE: 0, FLAG_INC: 0, JUMP: 0, ENDING: 0, CG: 0, VIDEO: 0 },
  comp: { total: 0, NARR: 0, MONO: 0, DIAL: 0, KAKAO: 0, CHOICE: 0, FLAG_INC: 0, JUMP: 0, ENDING: 0, CG: 0, VIDEO: 0 },
};

function eqArr(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

for (const id of sharedIds) {
  const fc = countCommands(fullScenes.get(id)!);
  const cc = countCommands(compScenes.get(id)!);

  for (const k of Object.keys(summary.full) as Array<keyof typeof summary.full>) {
    summary.full[k] += fc[k as keyof SceneCounts] as number;
    summary.comp[k] += cc[k as keyof SceneCounts] as number;
  }

  const diffs: string[] = [];
  if (fc.KAKAO !== cc.KAKAO) diffs.push(`KAKAO ${fc.KAKAO}→${cc.KAKAO}`);
  if (fc.CHOICE !== cc.CHOICE) diffs.push(`CHOICE ${fc.CHOICE}→${cc.CHOICE}`);
  if (fc.CHOICE_KAKAO !== cc.CHOICE_KAKAO) diffs.push(`CHOICE_KAKAO ${fc.CHOICE_KAKAO}→${cc.CHOICE_KAKAO}`);
  if (fc.FLAG_INC !== cc.FLAG_INC) diffs.push(`FLAG_INC ${fc.FLAG_INC}→${cc.FLAG_INC}`);
  if (fc.FLAG_SET !== cc.FLAG_SET) diffs.push(`FLAG_SET ${fc.FLAG_SET}→${cc.FLAG_SET}`);
  if (fc.KEY_CHOICE !== cc.KEY_CHOICE) diffs.push(`KEY_CHOICE ${fc.KEY_CHOICE}→${cc.KEY_CHOICE}`);
  if (fc.JUMP !== cc.JUMP) diffs.push(`JUMP ${fc.JUMP}→${cc.JUMP}`);
  if (fc.ENDING !== cc.ENDING) diffs.push(`ENDING ${fc.ENDING}→${cc.ENDING}`);
  if (fc.CG !== cc.CG) diffs.push(`CG ${fc.CG}→${cc.CG}`);
  if (fc.VIDEO !== cc.VIDEO) diffs.push(`VIDEO ${fc.VIDEO}→${cc.VIDEO}`);
  if (!eqArr(fc.choiceNexts, cc.choiceNexts)) {
    diffs.push(`choiceNexts mismatch: full=[${fc.choiceNexts.join(',')}] comp=[${cc.choiceNexts.join(',')}]`);
  }
  if (!eqArr(fc.cgIds, cc.cgIds)) {
    diffs.push(`cgIds mismatch: full=[${fc.cgIds.join(',')}] comp=[${cc.cgIds.join(',')}]`);
  }
  if (!eqArr(fc.videoSrcs, cc.videoSrcs)) {
    diffs.push(`videoSrcs mismatch: full=[${fc.videoSrcs.join(',')}] comp=[${cc.videoSrcs.join(',')}]`);
  }

  if (diffs.length > 0) {
    mismatches.push({ id, diffs });
    errors.push(`[${id}] ${diffs.join(' / ')}`);
  }
}

// ─── 결과 출력 ────────────────────────────────────────────────
console.log('━'.repeat(72));
console.log('  풀↔압축 무결성 검증 결과');
console.log('━'.repeat(72));
console.log(`풀 씬 수:     ${fullIds.size}`);
console.log(`압축 씬 수:   ${compIds.size}`);
console.log(`공통 씬:      ${sharedIds.length}`);
console.log(`풀 only:      ${missingInComp.length} (런타임 fallback OK)`);
console.log(`압축 only:    ${extraInComp.length} (오타 시 error)`);
console.log('');
console.log('합산 통계 (공통 씬 기준):');
console.log(`  ${'항목'.padEnd(12)} ${'풀'.padStart(7)} → ${'압축'.padStart(7)}  ${'변화'.padStart(7)}`);
for (const k of Object.keys(summary.full) as Array<keyof typeof summary.full>) {
  const f = summary.full[k];
  const c = summary.comp[k];
  const delta = f === 0 ? '—'.padStart(7) : `${(((c - f) / f) * 100).toFixed(0)}%`.padStart(7);
  const marker = (k === 'KAKAO' || k === 'CHOICE' || k === 'FLAG_INC' || k === 'JUMP' || k === 'ENDING' || k === 'CG' || k === 'VIDEO') && f === c ? ' ✓' : '';
  console.log(`  ${k.padEnd(12)} ${String(f).padStart(7)} → ${String(c).padStart(7)}  ${delta}${marker}`);
}
console.log('');

if (warnings.length > 0) {
  console.log('⚠ 경고:');
  for (const w of warnings) console.log(`  ${w}`);
  console.log('');
}

if (errors.length > 0) {
  console.log(`✗ 에러 ${errors.length}건:`);
  for (const e of errors.slice(0, 30)) console.log(`  ${e}`);
  if (errors.length > 30) console.log(`  ... +${errors.length - 30}건 더`);
  console.log('━'.repeat(72));
  process.exit(1);
}

console.log(`✓ 모든 검증 통과 (${sharedIds.length}개 씬, mismatch 0)`);
console.log('━'.repeat(72));
process.exit(0);
