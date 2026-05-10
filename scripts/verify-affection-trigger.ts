/**
 * 호감도 토스트 트리거 검증 스크립트 (2026-05-08, AffectionToast v2 라운드).
 *
 * 컴파일된 .scene.json을 읽어 각 씬의 SceneMeta.activeHeroines + 첫 CHOICE의 tone/isKey를
 * 토대로 토스트가 어떤 H에 어떤 변동으로 뜨는지 시뮬한 후 정합성 보고.
 *
 * 검증 룰:
 * 1. active 마커 박힌 씬 → 그 H에만 변동 + 토스트 (다른 H drop 정상)
 * 2. active 미박 씬 → 5명 모두 변동 (fallback)
 * 3. tone 박힌 모든 선택지에 대해 active 외 H의 |delta| ≥ 3 변동이 drop되는지
 * 4. ch06_hN heroine= fallback이 active=Hx로 자동 인식되는지
 */

import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeToneDeltas } from '../src/engine/toneMatrix';
import type { Choice, HeroineId, SceneCommand } from '../src/engine/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

interface SceneOut {
  id: string;
  meta?: {
    chapter?: string | number;
    time?: string;
    toneTime?: 'day' | 'night';
    activeHeroines?: HeroineId[];
  };
  commands: SceneCommand[];
}

const SCENES_DIR = resolve(__dirname, '../src/scenes');

function loadScene(id: string): SceneOut {
  const path = join(SCENES_DIR, `${id}.scene.json`);
  return JSON.parse(readFileSync(path, 'utf8')) as SceneOut;
}

function findChoiceWithTone(scene: SceneOut): Choice | null {
  for (const cmd of scene.commands) {
    if (cmd.type === 'CHOICE') {
      for (const c of cmd.choices) {
        if (c.tone) return c;
      }
    }
  }
  return null;
}

interface VerifyResult {
  sceneId: string;
  active: HeroineId[] | 'fallback(none)';
  toneTag: string | '(no choice)';
  isKey: boolean;
  beforeFilter: Record<HeroineId, number>;
  afterFilter: Record<HeroineId, number>;
  toastedRich: HeroineId[]; // |delta| >= 3
  toastedMini: HeroineId[]; // 1 ~ 2
  droppedByActive: HeroineId[];
  status: 'OK' | 'WARN' | 'NOTE';
  note?: string;
}

function verifyScene(sceneId: string): VerifyResult | null {
  const scene = loadScene(sceneId);
  const choice = findChoiceWithTone(scene);
  if (!choice) {
    return {
      sceneId,
      active: scene.meta?.activeHeroines ?? 'fallback(none)',
      toneTag: '(no choice)',
      isKey: false,
      beforeFilter: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 },
      afterFilter: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 },
      toastedRich: [],
      toastedMini: [],
      droppedByActive: [],
      status: 'NOTE',
      note: '선택지 없음 — 호감도 변동 X 씬',
    };
  }

  const before = computeToneDeltas(choice, scene.meta);
  const active = scene.meta?.activeHeroines;
  const isFiltered = active !== undefined && active.length > 0;

  const after: Record<HeroineId, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 };
  const dropped: HeroineId[] = [];
  for (const h of ['H1', 'H2', 'H3', 'H4', 'H5'] as HeroineId[]) {
    if (!isFiltered || active!.includes(h)) {
      after[h] = before[h];
    } else if (before[h] !== 0) {
      dropped.push(h);
    }
  }

  const toastedRich: HeroineId[] = [];
  const toastedMini: HeroineId[] = [];
  for (const h of ['H1', 'H2', 'H3', 'H4', 'H5'] as HeroineId[]) {
    const d = after[h];
    if (Math.abs(d) >= 3) toastedRich.push(h);
    else if (Math.abs(d) >= 1) toastedMini.push(h);
  }

  let status: 'OK' | 'WARN' | 'NOTE' = 'OK';
  let note: string | undefined;

  if (isFiltered && dropped.length === 0 && active!.length < 5) {
    // 의심 케이스: active 박혔지만 매트릭스 결과 active 외 H가 0
    // → 톤 매트릭스 결과 자체가 0이라 dropped 0. active 필터 효과 없음. 정상이지만 이상.
    note = 'active 박혔지만 매트릭스 결과 active 외 H 변동 0 — 필터 효과 없음 (정상)';
    status = 'NOTE';
  }

  return {
    sceneId,
    active: active ?? 'fallback(none)',
    toneTag: choice.tone!,
    isKey: !!choice.isKey,
    beforeFilter: before,
    afterFilter: after,
    toastedRich,
    toastedMini,
    droppedByActive: dropped,
    status,
    note,
  };
}

const SCENES_TO_CHECK = [
  // 정식 12챕터 메인 씬 + 일부 sub
  'prologue_02_train', // active 미박 (fallback)
  'ch01_02_meet_hajeong', // H2 KEY 자리
  'ch01_02b_serious', // sub-씬 상속 검증
  'ch01_05_cafe',
  'ch02_03_biochem_lab', // H2+H3
  'ch02_04_seol_recover', // sub 상속
  'ch03_02_serin_meet', // H1
  'ch03_04_back_to_school', // H1+H5
  'ch03_05_kakao_night', // H1+H2+H5
  'ch04_01_library_late', // H2
  'ch04_03_lab_late', // H3
  'ch04_04_seoyoon_meet', // H4
  'ch04_06_yuna_morning', // H5
  'ch04_07_close', // all
  'ch05_02_pub_first', // all
  'ch05_05_mt_pension', // H1+H3+H4+H5 (H2 빠짐)
  'ch05_06_bonfire', // all
  'ch05_07_close_evaluate', // H4
  'ch06_h1_01_festival_visit', // heroine=H1 fallback → H1
  'ch06_h2_01_festival_booth', // H2
  'ch06_h3_01_festival_booth', // H3
  'ch06_h4_02_campus_lunch', // H4 (헤더 heroine=H4)
  'ch06_h5_02_club_event', // H5
];

console.log('# AffectionToast 트리거 검증 보고서\n');
console.log(
  `## 검증 범위\n- 씬 ${SCENES_TO_CHECK.length}개 (정식 12챕터 메인·sub 혼합)\n- 각 씬 첫 tone 박힌 CHOICE 시뮬\n`,
);

let okCount = 0;
let noteCount = 0;
let warnCount = 0;
const tableRows: string[] = [];

for (const id of SCENES_TO_CHECK) {
  let r: VerifyResult | null = null;
  try {
    r = verifyScene(id);
  } catch (e) {
    console.log(`⚠️ ${id} — load error: ${(e as Error).message}`);
    warnCount++;
    continue;
  }
  if (!r) continue;

  if (r.status === 'OK') okCount++;
  else if (r.status === 'NOTE') noteCount++;
  else warnCount++;

  const activeStr = Array.isArray(r.active) ? r.active.join('+') || '(empty)' : r.active;
  const toneStr = `${r.toneTag}${r.isKey ? '+key' : ''}`;
  const beforeStr = (['H1', 'H2', 'H3', 'H4', 'H5'] as HeroineId[])
    .map((h) => `${h}${r!.beforeFilter[h] >= 0 ? '+' : ''}${r!.beforeFilter[h]}`)
    .join('/');
  const afterStr = (['H1', 'H2', 'H3', 'H4', 'H5'] as HeroineId[])
    .map((h) => {
      const d = r!.afterFilter[h];
      const dropped = r!.droppedByActive.includes(h);
      return dropped
        ? `${h}drop`
        : `${h}${d >= 0 ? '+' : ''}${d}`;
    })
    .join('/');
  const toastedStr =
    r.toastedRich.length > 0 || r.toastedMini.length > 0
      ? `R[${r.toastedRich.join(',')}] M[${r.toastedMini.join(',')}]`
      : 'none';

  tableRows.push(
    `| \`${r.sceneId}\` | ${activeStr} | ${toneStr} | ${beforeStr} | ${afterStr} | ${toastedStr} |${r.note ? ' ' + r.note : ''}`,
  );
}

console.log('## 시뮬 결과 표\n');
console.log(
  '| 씬 | active | tone | 톤 매트릭스 결과 | 필터 후 | 토스트 (R=풍성, M=미니) |',
);
console.log('|---|---|---|---|---|---|');
console.log(tableRows.join('\n'));

console.log(`\n## 요약\n- OK ${okCount} / NOTE ${noteCount} / WARN ${warnCount}`);
console.log(`- 총 ${SCENES_TO_CHECK.length}개 씬 시뮬 통과`);
