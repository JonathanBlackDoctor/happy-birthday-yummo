/* eslint-disable no-console */
/**
 * 김규민(gyumin) 호감도 천장 시뮬 — Plan "120-drifting-pebble" 검증용.
 *
 * 본 라운드 변경:
 *   - ch01_05_cafe 옵션 B: coFire에 gyumin 추가 + effects(gyumin +30) 신설 (옛 -30 제거)
 *   - ch01_05_cafe 옵션 C: coFire에 gyumin 추가
 *   - prologue_03_studio 옵션 A: coFire:gyumin 추가
 *
 * 본 sim은 .scene.json 출력을 직접 읽어 톤 매트릭스 + coFire/1-NPC pick 룰을
 * gameStore.applyChoiceEffects와 동일하게 재현한다.
 *
 * 실행: npx tsx scripts/simulateGyuminCeiling.ts
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  NPC_TONE_MATRIX,
  NPC_GAIN_MULTIPLIER,
  TONE_MATRIX,
  KEY_HEROINE_TONE,
  DESCRIPTOR_BONUS,
} from '../src/engine/toneMatrix';
import type {
  AffinityTargetId,
  EndingId,
  HeroineId,
  NpcAffinityId,
  GameFlags,
  ToneTag,
} from '../src/engine/types';
import { HEROINE_IDS, NPC_AFFINITY_IDS } from '../src/engine/types';

type Scene = {
  id: string;
  commands: Array<Record<string, unknown>>;
  meta?: {
    activeHeroines?: AffinityTargetId[];
    coFireNpcs?: NpcAffinityId[];
  };
};

type Choice = {
  text: string;
  tone?: ToneTag;
  isKey?: boolean;
  coFireNpcs?: NpcAffinityId[];
  effects?: Array<{ type: string; key?: string; delta?: number }>;
  next?: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCENES_DIR = join(__dirname, '..', 'src', 'scenes');

function loadScene(id: string): Scene {
  const path = join(SCENES_DIR, `${id}.scene.json`);
  return JSON.parse(readFileSync(path, 'utf-8')) as Scene;
}

function findChoice(scene: Scene, text: string): Choice {
  for (const cmd of scene.commands) {
    if (cmd.type !== 'CHOICE') continue;
    const choices = cmd.choices as Choice[];
    const found = choices.find((c) => c.text === text);
    if (found) return found;
  }
  throw new Error(`Choice not found in ${scene.id}: "${text}"`);
}

function isHeroine(id: string): id is HeroineId {
  return (HEROINE_IDS as readonly string[]).includes(id);
}

/**
 * gameStore.applyChoiceEffects의 NPC 라우팅 규칙을 재현한다.
 * Heroine 가산은 시뮬 단순화를 위해 생략하고, 본 sim은 NPC 누적만 추적.
 */
function applyChoice(
  flags: Record<AffinityTargetId, number>,
  choice: Choice,
  meta: Scene['meta'],
): Record<AffinityTargetId, number> {
  const next = { ...flags };

  // 1) 명시 effects (tone과 무관하게 항상 적용)
  for (const eff of choice.effects ?? []) {
    if (eff.type === 'FLAG_INC' && eff.key && typeof eff.delta === 'number') {
      if (eff.key in next) {
        next[eff.key as AffinityTargetId] += eff.delta;
      }
    }
  }

  if (!choice.tone) return next;

  // 2) tone 매트릭스
  const tone = choice.tone;
  const active = meta?.activeHeroines;
  const isActiveFiltered = active !== undefined && active.length > 0;
  const coFireSet = new Set<string>(
    choice.coFireNpcs ?? meta?.coFireNpcs ?? [],
  );

  // 히로인 가산 (active 필터 통과만)
  let heroineApplied = 0;
  for (const h of HEROINE_IDS) {
    if (isActiveFiltered && !active!.includes(h)) continue;
    let delta = TONE_MATRIX[h][tone];
    if (choice.isKey && KEY_HEROINE_TONE[h] === tone) delta += DESCRIPTOR_BONUS;
    if (delta !== 0) {
      next[h] += delta;
      heroineApplied += 1;
    }
  }

  // NPC 가산 — coFire는 항상, 일반 NPC는 H 변동 0명일 때만 |delta| 최대 1명
  const hasExplicitCoFire =
    choice.coFireNpcs !== undefined || meta?.coFireNpcs !== undefined;
  const npcDeltas: Array<{ id: NpcAffinityId; delta: number }> = [];
  for (const npc of NPC_AFFINITY_IDS) {
    const d = NPC_TONE_MATRIX[npc][tone] * NPC_GAIN_MULTIPLIER;
    if (d !== 0) npcDeltas.push({ id: npc, delta: d });
  }
  // coFire 등록된 NPC는 무조건 적용
  for (const { id, delta } of npcDeltas) {
    if (coFireSet.has(id)) next[id] += delta;
  }
  // 1-NPC pick — H 가산 0 + 명시 coFire 없을 때만
  if (!hasExplicitCoFire && heroineApplied === 0) {
    const activeNpcSet = isActiveFiltered
      ? new Set(active!.filter((t) => !isHeroine(t as string)))
      : null;
    const candidates =
      activeNpcSet && activeNpcSet.size > 0
        ? npcDeltas.filter((c) => activeNpcSet.has(c.id))
        : npcDeltas;
    let picked: { id: NpcAffinityId; delta: number } | null = null;
    for (const c of candidates) {
      if (!picked || Math.abs(c.delta) > Math.abs(picked.delta)) picked = c;
    }
    if (picked) next[picked.id] += picked.delta;
  }

  return next;
}

function blankFlags(): Record<AffinityTargetId, number> {
  return {
    H1: 0, H2: 0, H3: 0, H4: 0, H5: 0,
    gyumin: 0, gyeongmin: 0, nathan: 0, wook: 0, junhyuk: 0, mom: 0, taeho: 0,
  };
}

/** sim용 Ch.1~5 누적 winner 호감도 (simulateEndingScores HEROINE_CH5_ACCUM 미러) */
const HEROINE_CH5_ACCUM: Record<HeroineId, number> = {
  H1: 113, H2: 117, H3: 98, H4: 93, H5: 125,
};

/** scriptInterpreter.evaluateRoute의 룰을 인라인 (Vite glob 의존성 회피) */
function evaluateRoute(
  flags: GameFlags,
):
  | { kind: 'ending'; endingId: EndingId }
  | { kind: 'chapter6'; winner: HeroineId } {
  if (flags.late_reply_count >= 1) return { kind: 'ending', endingId: 'END_H4_REJECT' };
  const maxH = Math.max(flags.H1, flags.H2, flags.H3, flags.H4, flags.H5);
  const maxNpc = Math.max(
    flags.gyumin, flags.gyeongmin, flags.nathan, flags.wook, flags.junhyuk,
    flags.mom, flags.taeho,
  );
  if (maxNpc > maxH) return { kind: 'ending', endingId: 'END_SOLO_SUMMER' };

  const scores = HEROINE_IDS.map((id) => ({ id, score: flags[id] }));
  const max = Math.max(...scores.map((s) => s.score));
  if (max < 30) return { kind: 'ending', endingId: 'END_SOLO_SUMMER' };
  const tied = scores.filter((s) => s.score === max).map((s) => s.id);
  return { kind: 'chapter6', winner: tied[0] };
}

function buildGameFlags(
  npcs: Record<AffinityTargetId, number>,
  winner: HeroineId | null,
  otherH: number,
): GameFlags {
  const f: GameFlags = {
    H1: 0, H2: 0, H3: 0, H4: 0, H5: 0,
    gyumin: npcs.gyumin, gyeongmin: npcs.gyeongmin, nathan: npcs.nathan,
    wook: npcs.wook, junhyuk: npcs.junhyuk, mom: npcs.mom, taeho: npcs.taeho,
    late_reply_count: 0,
    last_increment_order: [],
    key_choices: { H1: [], H2: [], H3: [], H4: [], H5: [] },
    current_chapter: 'ch05',
    current_scene_id: 'ch05_07_close_evaluate',
    visited_scenes: [],
    met_heroines: [],
    chapter_start_snapshot: null,
    prev_chapter_snapshot: null,
    flag_anatomy_first_done: false,
    flag_dongsan_visit_done: false,
    flag_seoyoon_first_meet: false,
    flag_first_kakao_serin: false,
    mode: 'main',
  };
  for (const h of HEROINE_IDS) {
    f[h] = winner === h ? HEROINE_CH5_ACCUM[h] : otherH;
  }
  return f;
}

function runCase(label: string, picks: Array<{ scene: string; text: string }>, opts: {
  winner: HeroineId | null;
  otherH: number;
  expect: 'SOLO' | 'chapter6';
  expectGyumin: { min: number; max: number };
}) {
  let flags = blankFlags();
  for (const pick of picks) {
    const scene = loadScene(pick.scene);
    const choice = findChoice(scene, pick.text);
    flags = applyChoice(flags, choice, scene.meta);
  }

  const game = buildGameFlags(flags, opts.winner, opts.otherH);
  const route = evaluateRoute(game);

  const gy = flags.gyumin;
  const maxH = Math.max(game.H1, game.H2, game.H3, game.H4, game.H5);
  const routeStr =
    route.kind === 'ending' ? route.endingId : `chapter6/${route.winner}`;

  const gyOk = gy >= opts.expectGyumin.min && gy <= opts.expectGyumin.max;
  const routeOk =
    opts.expect === 'SOLO'
      ? routeStr === 'END_SOLO_SUMMER'
      : routeStr.startsWith('chapter6/');

  console.log(`\n[${label}]`);
  console.log(`  picks: ${picks.map((p) => `${p.scene}:"${p.text}"`).join(' → ')}`);
  console.log(`  gyumin=${gy} (expected ${opts.expectGyumin.min}-${opts.expectGyumin.max}) ${gyOk ? '✓' : '✗'}`);
  console.log(`  maxH=${maxH}, winner_sim=${opts.winner ?? 'none'}`);
  console.log(`  route=${routeStr} (expected ${opts.expect}) ${routeOk ? '✓' : '✗'}`);

  return gyOk && routeOk;
}

console.log('=== gyumin ceiling sim (Plan 120-drifting-pebble) ===');

const r1 = runCase(
  'gyumin-focused (prologue A + cafe B)',
  [
    { scene: 'prologue_03_studio', text: '내일 잘 해보자' },
    { scene: 'ch01_05_cafe', text: '야 첫날부터 뭔 소리야' },
  ],
  {
    winner: null,
    otherH: 0,
    expect: 'SOLO',
    expectGyumin: { min: 115, max: 130 },
  },
);

const r2 = runCase(
  'gyumin-warm (prologue A + cafe C)',
  [
    { scene: 'prologue_03_studio', text: '내일 잘 해보자' },
    { scene: 'ch01_05_cafe', text: '...글쎄' },
  ],
  {
    winner: null,
    otherH: 0,
    expect: 'SOLO',
    expectGyumin: { min: 55, max: 65 },
  },
);

const r3 = runCase(
  'regression: gyumin-neutral (prologue B + cafe A), H2 winner',
  [
    { scene: 'prologue_03_studio', text: '일찍 자야겠다' },
    { scene: 'ch01_05_cafe', text: '그런 거 아냐. 같은 조원일 뿐' },
  ],
  {
    winner: 'H2',
    otherH: 25,
    expect: 'chapter6',
    expectGyumin: { min: 0, max: 0 },
  },
);

// 천장 충분성 검증 — sim 최대 H winner(H5 125)와 김규민 천장 비교.
// 김규민(+120)이 H5(125) 못 넘으므로 H5에 집중한 플레이는 SOLO 진입 X.
// 단 H1~H4는 winner 누적치가 113~117이라 김규민이 추월 → SOLO.
const r4 = runCase(
  'ceiling check vs H5 winner (sim 125): gyumin 120 < H5 → chapter6/H5',
  [
    { scene: 'prologue_03_studio', text: '내일 잘 해보자' },
    { scene: 'ch01_05_cafe', text: '야 첫날부터 뭔 소리야' },
  ],
  {
    winner: 'H5',
    otherH: 25,
    expect: 'chapter6',
    expectGyumin: { min: 115, max: 130 },
  },
);

const ok = r1 && r2 && r3 && r4;
console.log(`\n=== ${ok ? 'PASS' : 'FAIL'} ===`);
process.exit(ok ? 0 : 1);
