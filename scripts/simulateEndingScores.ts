/* eslint-disable no-console */
/**
 * 엔딩 점수 분포 시뮬 (인물별 곱셈 모델 v2) — 새 등급 컷(S/A/B/C/D) 산정용.
 *
 * 케이스 매트릭스:
 *   - 5 winner × 6 카테고리(SOLO 포함) × 3 시나리오(optimal/neutral/pessimal) = 90
 *     단 H3는 BAD 없음, H4는 HAPPY/BAD 없음, H5는 TRUE만 — 실제 ENDING_CATALOG.length(16) 순회.
 *   - 추가 히든 변형: mom/junhyuk/taeho max 변형
 *
 * 입력 가정 (BRANCH-GRAPH §4 시뮬 + Ch.6 추가):
 *   Ch.1~5 누적: H1+113 / H2+117 / H3+98 / H4+93 / H5+125
 *   Ch.6 추가: TRUE +25 / HAPPY +20 / NORMAL +8 / BAD/REJECT 0
 *   비-winner H 호감도: optimal 35 / neutral 25 / pessimal 10
 *   KEY 카운트: TRUE 3 / HAPPY 2 / NORMAL 1 / BAD/REJECT 0
 *   late_reply_count: H4_REJECT만 1
 *   NPC 분포 3종:
 *     optimal — 친구 4명 ≥40 (max(NPC) ≤ winner H로 가드)
 *     neutral — 친구 합 ~150
 *     pessimal — NPC 거의 0
 *
 * 실행:
 *   npx tsx scripts/simulateEndingScores.ts
 */

import { computeEndingScore } from '../src/engine/endingScore';
import { ENDING_CATALOG } from '../src/data/endings';
import type { GameFlags, HeroineId } from '../src/engine/types';
import { HEROINE_IDS } from '../src/engine/types';
import type { EndingId, AffinityTargetId } from '../src/engine/types';

type Scenario = 'optimal' | 'neutral' | 'pessimal';

interface CaseSpec {
  winner: HeroineId;
  endingId: EndingId;
  scenario: Scenario;
  /** 히든 변형 — mom/junhyuk/taeho max 강제. undefined면 일반. */
  hidden?: 'mom' | 'junhyuk' | 'taeho';
}

const HEROINE_CH5_ACCUM: Record<HeroineId, number> = {
  H1: 113, H2: 117, H3: 98, H4: 93, H5: 125,
};

function ch6Add(endingId: EndingId): number {
  if (endingId.endsWith('_TRUE')) return 25;
  if (endingId.endsWith('_HAPPY')) return 20;
  if (endingId.endsWith('_NORMAL')) return 8;
  return 0;
}

function keyCount(endingId: EndingId): number {
  if (endingId.endsWith('_TRUE')) return 3;
  if (endingId.endsWith('_HAPPY')) return 2;
  if (endingId.endsWith('_NORMAL')) return 1;
  return 0;
}

function buildFlags(spec: CaseSpec): GameFlags {
  const winnerVal = HEROINE_CH5_ACCUM[spec.winner] + ch6Add(spec.endingId);
  const otherH = spec.scenario === 'optimal' ? 35
              : spec.scenario === 'neutral' ? 25 : 10;

  const heroines: Record<HeroineId, number> = {
    H1: 0, H2: 0, H3: 0, H4: 0, H5: 0,
  };
  for (const h of HEROINE_IDS) {
    heroines[h] = h === spec.winner ? winnerVal : otherH;
  }

  // SOLO — 모든 H 낮게 (F-2 분기 시뮬)
  if (spec.endingId === 'END_SOLO_SUMMER') {
    for (const h of HEROINE_IDS) heroines[h] = spec.scenario === 'pessimal' ? 8 : 22;
  }

  const k = keyCount(spec.endingId);
  const keyChoices: Record<HeroineId, string[]> = {
    H1: [], H2: [], H3: [], H4: [], H5: [],
  };
  if (spec.endingId !== 'END_SOLO_SUMMER') {
    keyChoices[spec.winner] = Array.from({ length: k }, (_, i) => `${spec.winner.toLowerCase()}_k${i + 1}`);
  }

  // NPC 분포
  let npcs: Record<Exclude<AffinityTargetId, HeroineId>, number>;
  if (spec.scenario === 'optimal') {
    const cap = Math.min(50, winnerVal - 5);
    npcs = {
      gyumin: cap, gyeongmin: cap, nathan: Math.max(40, cap - 5), wook: Math.max(40, cap - 8),
      junhyuk: 25, mom: 5, taeho: 3,
    };
  } else if (spec.scenario === 'neutral') {
    npcs = { gyumin: 30, gyeongmin: 30, nathan: 25, wook: 25, junhyuk: 15, mom: 15, taeho: 10 };
  } else {
    npcs = { gyumin: 5, gyeongmin: 0, nathan: 0, wook: 0, junhyuk: 0, mom: 0, taeho: 0 };
  }

  // 히든 변형 — 해당 NPC를 모든 H/NPC 능가하는 max로 강제
  if (spec.hidden === 'mom') {
    npcs.mom = Math.max(winnerVal + 10, ...Object.values(heroines), ...Object.values(npcs)) + 5;
  }
  if (spec.hidden === 'junhyuk') {
    npcs.junhyuk = Math.max(winnerVal + 10, ...Object.values(heroines), ...Object.values(npcs)) + 5;
  }
  if (spec.hidden === 'taeho') {
    npcs.taeho = Math.max(winnerVal + 10, ...Object.values(heroines), ...Object.values(npcs)) + 5;
  }

  const flags: GameFlags = {
    ...heroines,
    ...npcs,
    late_reply_count: spec.endingId === 'END_H4_REJECT' ? 1 : 0,
    last_increment_order: [spec.winner],
    key_choices: keyChoices,
    current_chapter: 'ending',
    current_scene_id: 'sim',
    visited_scenes: [],
    met_heroines: [...HEROINE_IDS],
    chapter_start_snapshot: null,
    prev_chapter_snapshot: null,
    flag_anatomy_first_done: true,
    flag_dongsan_visit_done: true,
    flag_seoyoon_first_meet: true,
    flag_first_kakao_serin: true,
    mode: 'main',
  };
  return flags;
}

// ──────────────────────────────────────────────────────────────────
// 케이스 빌드
// ──────────────────────────────────────────────────────────────────
const cases: CaseSpec[] = [];
const SCENARIOS: Scenario[] = ['optimal', 'neutral', 'pessimal'];

for (const meta of ENDING_CATALOG) {
  if (meta.heroine === null) {
    for (const winner of HEROINE_IDS) {
      for (const scenario of SCENARIOS) {
        cases.push({ winner, endingId: meta.id, scenario });
      }
    }
  } else {
    for (const scenario of SCENARIOS) {
      cases.push({ winner: meta.heroine, endingId: meta.id, scenario });
    }
  }
}

// 히든 변형 — TRUE/NORMAL 케이스에 mom/junhyuk/taeho 추가
const hiddenCases: CaseSpec[] = [];
for (const meta of ENDING_CATALOG) {
  if (meta.heroine === null) continue;
  if (meta.category === 'TRUE' || meta.category === 'NORMAL') {
    hiddenCases.push({ winner: meta.heroine, endingId: meta.id, scenario: 'neutral', hidden: 'mom' });
    hiddenCases.push({ winner: meta.heroine, endingId: meta.id, scenario: 'neutral', hidden: 'junhyuk' });
    hiddenCases.push({ winner: meta.heroine, endingId: meta.id, scenario: 'neutral', hidden: 'taeho' });
  }
}

// ──────────────────────────────────────────────────────────────────
// 통계 헬퍼
// ──────────────────────────────────────────────────────────────────
function pct(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

function fmtRow(label: string, vals: number[]): string {
  if (vals.length === 0) return label.padEnd(10) + ' │  (empty)';
  const min = Math.min(...vals);
  const p25 = pct(vals, 25);
  const med = pct(vals, 50);
  const p75 = pct(vals, 75);
  const max = Math.max(...vals);
  const fmt = (n: number) => Math.round(n).toString().padStart(6);
  return `${label.padEnd(10)} │ ${fmt(min)} │ ${fmt(p25)} │ ${fmt(med)} │ ${fmt(p75)} │ ${fmt(max)} │ n=${vals.length}`;
}

const SECTION = (t: string) => {
  console.log('\n' + '='.repeat(76));
  console.log(' ' + t);
  console.log('='.repeat(76));
};

// ──────────────────────────────────────────────────────────────────
// 1. 카테고리별 분포 (히든 제외)
// ──────────────────────────────────────────────────────────────────
SECTION('1. 카테고리별 finalScore 분포 (히든 제외, 인물별 곱셈 모델 v2)');
console.log('카테고리   │   min │   p25 │   med │   p75 │   max │ N');
console.log('-'.repeat(70));

const byCategory: Record<string, number[]> = {};
const allRegular: Array<{ spec: CaseSpec; finalScore: number; grade: string }> = [];

for (const spec of cases) {
  const flags = buildFlags(spec);
  const result = computeEndingScore(flags, spec.endingId);
  const cat = result.breakdown.category ?? 'NONE';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(result.finalScore);
  allRegular.push({ spec, finalScore: result.finalScore, grade: result.grade });
}

const CAT_ORDER = ['TRUE', 'HAPPY', 'NORMAL', 'BAD', 'REJECT', 'SOLO'];
for (const cat of CAT_ORDER) {
  if (byCategory[cat]) console.log(fmtRow(cat, byCategory[cat]));
}

// ──────────────────────────────────────────────────────────────────
// 2. 시나리오별 분포
// ──────────────────────────────────────────────────────────────────
SECTION('2. 시나리오별 finalScore 분포 (전체)');
console.log('시나리오   │   min │   p25 │   med │   p75 │   max │ N');
console.log('-'.repeat(70));
const byScenario: Record<string, number[]> = { optimal: [], neutral: [], pessimal: [] };
for (const item of allRegular) {
  byScenario[item.spec.scenario].push(item.finalScore);
}
for (const sc of ['optimal', 'neutral', 'pessimal'] as Scenario[]) {
  console.log(fmtRow(sc, byScenario[sc]));
}

// ──────────────────────────────────────────────────────────────────
// 3. 권장 등급 컷
// ──────────────────────────────────────────────────────────────────
SECTION('3. 권장 등급 컷 (S/A/B/C/D)');
const trueScores = byCategory['TRUE'] ?? [];
const happyScores = byCategory['HAPPY'] ?? [];
const normalScores = byCategory['NORMAL'] ?? [];
const badScores = byCategory['BAD'] ?? [];
const rejectScores = byCategory['REJECT'] ?? [];
const _soloScores = byCategory['SOLO'] ?? [];

const recS = Math.round(pct(trueScores, 50));
const recA = Math.round(Math.max(pct(happyScores, 50), pct(trueScores, 10)));
const recB = Math.round(pct(normalScores, 50));
const recC = Math.round(Math.max(pct(badScores, 50), pct(rejectScores, 50)));

console.log(`S ≥ ${recS}   (TRUE 상위 절반)`);
console.log(`A ≥ ${recA}   (TRUE 거의 전부, HAPPY 상위 절반)`);
console.log(`B ≥ ${recB}   (NORMAL 상위 절반)`);
console.log(`C ≥ ${recC}   (BAD/REJECT 상위 절반)`);
console.log(`D <  ${recC}`);

console.log('\n→ 적용 권장:');
console.log(`   GRADE_CUTS = { S: ${recS}, A: ${recA}, B: ${recB}, C: ${recC}, D: 0 }`);

SECTION('3b. 권장 컷 적용 시 카테고리별 등급 분포');

function gradeOf(score: number): string {
  if (score >= recS) return 'S';
  if (score >= recA) return 'A';
  if (score >= recB) return 'B';
  if (score >= recC) return 'C';
  return 'D';
}

console.log('카테고리   │ S │ A │ B │ C │ D');
console.log('-'.repeat(40));
for (const cat of CAT_ORDER) {
  const scores = byCategory[cat] ?? [];
  const counts = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const s of scores) counts[gradeOf(s) as keyof typeof counts]++;
  console.log(`${cat.padEnd(10)} │ ${counts.S} │ ${counts.A} │ ${counts.B} │ ${counts.C} │ ${counts.D}`);
}

// ──────────────────────────────────────────────────────────────────
// 4. 히든 발현 시 분포
// ──────────────────────────────────────────────────────────────────
SECTION('4. 히든 보너스 발현 시 finalScore (mom×5 / junhyuk×10 / taeho×3)');
console.log('히든          │   min │   p25 │   med │   p75 │   max │ N');
console.log('-'.repeat(70));

const hiddenByType: Record<string, number[]> = { mom: [], junhyuk: [], taeho: [] };
for (const spec of hiddenCases) {
  const flags = buildFlags(spec);
  const result = computeEndingScore(flags, spec.endingId);
  if (spec.hidden) {
    hiddenByType[spec.hidden].push(result.finalScore);
  }
}
for (const k of ['mom', 'junhyuk', 'taeho']) {
  console.log(fmtRow(k, hiddenByType[k]));
}

console.log('\n=== END ===');
