/**
 * 모든 컴파일된 .scene.json을 훑어 각 CHOICE 옵션이 몇 명 호감도를 변동시키는지 집계.
 * tone 박힌 선택지: 톤 매트릭스(H5 + NPC7 = 12 대상) → active 필터(H만) → non-zero 카운트.
 * tone 미박 선택지: 0명 (fallback은 런타임 랜덤이라 결정적 시뮬 불가, 통계에선 active 대상 수로 대체).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toneToFlagIncs } from '../src/engine/toneMatrix';
import type { Choice, HeroineId, AffinityTargetId, SceneCommand } from '../src/engine/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const SCENES_DIR = resolve(__dirname, '../src/scenes');

interface SceneOut {
  id: string;
  meta?: { activeHeroines?: AffinityTargetId[]; toneTime?: 'day' | 'night' };
  commands: SceneCommand[];
}

function isHeroine(k: string): k is HeroineId {
  return k === 'H1' || k === 'H2' || k === 'H3' || k === 'H4' || k === 'H5';
}

const allFiles = readdirSync(SCENES_DIR).filter((f) => f.endsWith('.scene.json'));

let totalChoices = 0;
let totalOptions = 0;
let optsWithTone = 0;
let optsWithoutTone = 0;
const distOption: Record<string, number> = { '0': 0, '1': 0, '2-3': 0, '4-5': 0, '6-7': 0, '8-10': 0, '11+': 0 };
const samples: Array<{ scene: string; tone: string; active: string; count: number; preview: string }> = [];

for (const fname of allFiles) {
  const path = join(SCENES_DIR, fname);
  const scene = JSON.parse(readFileSync(path, 'utf8')) as SceneOut;
  const active = scene.meta?.activeHeroines;
  const isFiltered = active !== undefined && active.length > 0;

  for (const cmd of scene.commands) {
    if (cmd.type !== 'CHOICE') continue;
    totalChoices++;
    for (const choice of cmd.choices) {
      totalOptions++;
      let count = 0;
      if (choice.tone) {
        optsWithTone++;
        const cmds = toneToFlagIncs(choice as Choice, scene.meta);
        const activeNpcSet = isFiltered ? new Set(active!.filter((t) => !isHeroine(t))) : null;
        let heroineCount = 0;
        let topNpcAbs = -1;
        for (const c of cmds) {
          if (c.type !== 'FLAG_INC') continue;
          if (c.key === 'late_reply_count') continue;
          if (c.delta === 0) continue;
          if (isHeroine(c.key)) {
            if (isFiltered && !active!.includes(c.key as HeroineId)) continue;
            heroineCount++;
          } else {
            // active에 NPC 명시되어 있으면 그 NPC만 후보
            if (activeNpcSet && activeNpcSet.size > 0 && !activeNpcSet.has(c.key)) continue;
            if (Math.abs(c.delta) > topNpcAbs) topNpcAbs = Math.abs(c.delta);
          }
        }
        // H 변동 ≥1 → NPC drop. H=0일 때만 NPC 1명.
        count = heroineCount + (heroineCount === 0 && topNpcAbs >= 0 ? 1 : 0);
      } else {
        optsWithoutTone++;
        // fallback: H 있으면 H 모두, H 없고 NPC만 → 1명. (사용자 룰)
        if (isFiltered) {
          const heroineCountFb = active!.filter((t) => isHeroine(t)).length;
          const hasNpc = active!.some((t) => !isHeroine(t));
          count = heroineCountFb > 0 ? heroineCountFb : hasNpc ? 1 : 0;
        }
      }

      let bucket = '0';
      if (count === 0) bucket = '0';
      else if (count === 1) bucket = '1';
      else if (count <= 3) bucket = '2-3';
      else if (count <= 5) bucket = '4-5';
      else if (count <= 7) bucket = '6-7';
      else if (count <= 10) bucket = '8-10';
      else bucket = '11+';
      distOption[bucket]++;

      if (count >= 6 && samples.length < 8) {
        samples.push({
          scene: scene.id,
          tone: choice.tone ?? '(none)',
          active: isFiltered ? active!.join('+') : 'fallback(all)',
          count,
          preview: choice.text.slice(0, 30),
        });
      }
    }
  }
}

console.log('# 호감도 변동 선택지 통계 (정식 + 압축 컴파일 결과)\n');
console.log(`총 .scene.json: ${allFiles.length}개`);
console.log(`총 CHOICE 블록: ${totalChoices}개`);
console.log(`총 선택지 옵션: ${totalOptions}개`);
console.log(`  - tone 박힌 옵션: ${optsWithTone}개 (톤 매트릭스 자동 — 다중 인물 변동)`);
console.log(`  - tone 미박 옵션: ${optsWithoutTone}개 (fallback 랜덤 — active 대상만)`);
console.log('');
console.log('## 한 옵션당 변동 인물 수 분포\n');
console.log('| 변동 인물 | 옵션 수 | 비율 |');
console.log('|---|---:|---:|');
for (const bucket of ['0', '1', '2-3', '4-5', '6-7', '8-10', '11+']) {
  const n = distOption[bucket];
  const pct = ((n / totalOptions) * 100).toFixed(1);
  console.log(`| ${bucket}명 | ${n} | ${pct}% |`);
}
console.log('');

const multiCount = totalOptions - distOption['0'] - distOption['1'];
const richCount = distOption['6-7'] + distOption['8-10'] + distOption['11+'];
console.log(`## 요약`);
console.log(`- **2명 이상 동시 변동 옵션**: ${multiCount}개 / ${totalOptions} (${((multiCount / totalOptions) * 100).toFixed(1)}%)`);
console.log(`- **6명 이상 풍성 동시 변동 옵션**: ${richCount}개 / ${totalOptions} (${((richCount / totalOptions) * 100).toFixed(1)}%)`);
console.log('');

console.log(`## 6+ 변동 옵션 샘플 (최대 8개)\n`);
console.log('| 씬 | 톤 | active | 변동수 | 선택지 |');
console.log('|---|---|---|---:|---|');
for (const s of samples) {
  console.log(`| \`${s.scene}\` | ${s.tone} | ${s.active} | ${s.count} | "${s.preview}..." |`);
}
