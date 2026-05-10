/**
 * 톤 매트릭스 sanity check — Step 2 검증 스크립트.
 *
 * 출력:
 *   1. 5×5 매트릭스 표 (낮 / H3 밤 보정)
 *   2. 5명 KEY 톤 빌드 시뮬 (각 히로인의 정답 톤 빌드)
 *   3. "정답이 오답" 자리 5개 예시 (CONVENTIONS §3.7 #6)
 *   4. H4 미니게임 통과/타임아웃 시뮬 (late_reply_count 누적)
 *   5. SOLO 빌드 시뮬 (모든 답 톤 미스매치)
 *
 * 실행 (PM 결정 필요):
 *   npx tsx scripts/verifyToneMatrix.ts        # tsx 추가 시
 *   npx vite-node scripts/verifyToneMatrix.ts  # vite 동봉 시
 *
 * 본 스크립트는 부수효과 없음 — console.log만. 빌드/배포 영향 없음.
 */

import {
  TONE_MATRIX,
  H3_NIGHT_DELTA,
  KEY_HEROINE_TONE,
  DESCRIPTOR_BONUS,
  H4_REPLY_SPEED,
  computeToneDeltas,
} from '../src/engine/toneMatrix';
import { HEROINE_IDS, TONE_TAGS } from '../src/engine/types';
import type { Choice, HeroineId, SceneTime, ToneTag } from '../src/engine/types';

const SECTION = (title: string) => {
  console.log('\n' + '='.repeat(72));
  console.log(' ' + title);
  console.log('='.repeat(72));
};

// ──────────────────────────────────────────────────────────────────
// 1. 5×5 매트릭스 표 출력
// ──────────────────────────────────────────────────────────────────
SECTION('1. 5×5 톤 매트릭스 (낮 기본)');

const HEADER = ['톤'.padEnd(20), ...HEROINE_IDS.map((h) => h.padStart(5))].join(' | ');
console.log(HEADER);
console.log('-'.repeat(HEADER.length));
for (const tone of TONE_TAGS) {
  const row = HEROINE_IDS.map((h) => {
    const v = TONE_MATRIX[h][tone];
    const marker = KEY_HEROINE_TONE[h] === tone ? '*' : ' ';
    return `${marker}${v >= 0 ? '+' : ''}${v}`.padStart(5);
  });
  console.log([tone.padEnd(20), ...row].join(' | '));
}
console.log('\n* = KEY 톤 (묘사 보너스 +5 가산 가능)');

SECTION('1b. H3 시간대 갭 (밤 보정)');
console.log('톤'.padEnd(20) + ' | ' + 'H3 낮'.padStart(8) + ' | ' + 'H3 밤'.padStart(8));
console.log('-'.repeat(50));
for (const tone of TONE_TAGS) {
  const day = TONE_MATRIX.H3[tone];
  const night = day + H3_NIGHT_DELTA[tone];
  console.log(
    tone.padEnd(20) +
      ' | ' +
      `${day >= 0 ? '+' : ''}${day}`.padStart(8) +
      ' | ' +
      `${night >= 0 ? '+' : ''}${night}`.padStart(8),
  );
}

// ──────────────────────────────────────────────────────────────────
// 2. 5명 KEY 톤 빌드 누적 시뮬
// ──────────────────────────────────────────────────────────────────
SECTION('2. KEY 톤만 골랐을 때 누적 (단일 히로인 빌드)');

interface ScoreRow {
  name: string;
  H1: number;
  H2: number;
  H3: number;
  H4: number;
  H5: number;
}

function simKeyBuild(target: HeroineId, count: number, time: SceneTime = 'day'): ScoreRow {
  const tone = KEY_HEROINE_TONE[target];
  const totals: Record<HeroineId, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 };
  if (!tone) {
    // H4: 미니게임 통과 빌드 (mature_serious 같이 일반 톤도 +1, mechanism으로 +1 가산)
    for (let i = 0; i < count; i++) {
      const choice: Pick<Choice, 'tone' | 'isKey' | 'mechanism' | 'replyTimeMs'> = {
        tone: 'direct_friendly', // H4 매트릭스 최고치 (+3)
        isKey: false,
        mechanism: 'h4_reply_speed',
        replyTimeMs: 5000, // 통과
      };
      const deltas = computeToneDeltas(choice, { toneTime: time });
      for (const h of HEROINE_IDS) totals[h] += deltas[h];
    }
  } else {
    for (let i = 0; i < count; i++) {
      const choice: Pick<Choice, 'tone' | 'isKey'> = { tone, isKey: true };
      const deltas = computeToneDeltas(choice, { toneTime: time });
      for (const h of HEROINE_IDS) totals[h] += deltas[h];
    }
  }
  return { name: `${target} ×${count}회 (${time})`, ...totals };
}

const rows: ScoreRow[] = [
  simKeyBuild('H1', 3),
  simKeyBuild('H2', 3),
  simKeyBuild('H3', 3, 'day'),
  simKeyBuild('H3', 3, 'night'),
  simKeyBuild('H4', 3),
  simKeyBuild('H5', 3),
];

console.log(['빌드'.padEnd(20), ...HEROINE_IDS.map((h) => h.padStart(6))].join(' | '));
console.log('-'.repeat(60));
for (const r of rows) {
  const cells = HEROINE_IDS.map((h) => `${r[h] >= 0 ? '+' : ''}${r[h]}`.padStart(6));
  console.log([r.name.padEnd(20), ...cells].join(' | '));
}
console.log('\n해석: 자기 KEY 톤 3회 골랐을 때 본인은 +45 (=3×15), 다른 히로인은 음수/낮은 값.');
console.log('     H4는 KEY 매핑 없음 → direct_friendly + 미니게임 통과로 시뮬.');

// ──────────────────────────────────────────────────────────────────
// 3. "정답이 오답" 자리 5개 예시 검증
// ──────────────────────────────────────────────────────────────────
SECTION('3. "정답이 오답"되는 자리 5개 (CONVENTIONS §3.7 #6)');

interface ExampleCase {
  text: string;
  tone: ToneTag;
  isKey: boolean;
  expectKey: HeroineId | null; // 누구의 KEY 자리인가
  time?: SceneTime;
}

const examples: ExampleCase[] = [
  {
    text: '선배님, 무리 마시고 천천히 하세요',
    tone: 'mature_serious',
    isKey: true,
    expectKey: 'H1',
  },
  {
    text: 'ㅋㅋㅋ 너 진짜 웃기다',
    tone: 'playful_casual',
    isKey: false,
    expectKey: null,
  },
  {
    text: '야 너 이번 시험 족보 알아?',
    tone: 'direct_friendly',
    isKey: true,
    expectKey: 'H2',
  },
  {
    text: '선배 오늘 진짜 멋있었어요!',
    tone: 'bright_forward',
    isKey: true,
    expectKey: 'H5',
  },
  {
    text: '괜찮으세요? 식사는 하셨어요? (낮)',
    tone: 'warm_supportive',
    isKey: true,
    expectKey: 'H3',
    time: 'day',
  },
];

console.log(
  ['선택지'.padEnd(40), '톤'.padEnd(18), ...HEROINE_IDS.map((h) => h.padStart(5))].join(' | '),
);
console.log('-'.repeat(110));
for (const e of examples) {
  const deltas = computeToneDeltas(
    { tone: e.tone, isKey: e.isKey },
    { toneTime: e.time ?? 'day' },
  );
  const cells = HEROINE_IDS.map((h) => {
    const v = deltas[h];
    const isKey = e.expectKey === h ? '*' : ' ';
    return `${isKey}${v >= 0 ? '+' : ''}${v}`.padStart(5);
  });
  const truncated = e.text.length > 40 ? e.text.slice(0, 37) + '...' : e.text.padEnd(40);
  console.log([truncated, e.tone.padEnd(18), ...cells].join(' | '));
}
console.log('\n* = 본 자리에서 KEY 통과 히로인. 같은 선택지가 5명에게 다른 점수.');

// ──────────────────────────────────────────────────────────────────
// 4. H4 미니게임 시뮬
// ──────────────────────────────────────────────────────────────────
SECTION('4. H4 답장 속도 미니게임');

console.log(`Threshold: ${H4_REPLY_SPEED.thresholdMs}ms (CONVENTIONS §3.7 #5)`);
console.log(`통과 가산: +${H4_REPLY_SPEED.passDelta}, 타임아웃: ${H4_REPLY_SPEED.failDelta} + late_reply_count++`);
console.log();

for (const ms of [3000, 14999, 15000, 30000]) {
  const choice: Pick<Choice, 'tone' | 'isKey' | 'mechanism' | 'replyTimeMs'> = {
    tone: 'direct_friendly',
    isKey: false,
    mechanism: 'h4_reply_speed',
    replyTimeMs: ms,
  };
  const deltas = computeToneDeltas(choice);
  const passed = ms < H4_REPLY_SPEED.thresholdMs;
  const lateInc = passed ? 0 : 1;
  console.log(
    `replyTimeMs=${String(ms).padStart(6)} | 통과=${passed ? '✓' : '✗'} | H4 delta=${deltas.H4 >= 0 ? '+' : ''}${deltas.H4} | late_reply++=${lateInc}`,
  );
}

// ──────────────────────────────────────────────────────────────────
// 5. SOLO 빌드 시뮬 (모든 답 톤 미스매치)
// ──────────────────────────────────────────────────────────────────
SECTION('5. SOLO 빌드 — 모든 답 H1·H5에 미스매치/정반대');

let soloTotals: Record<HeroineId, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 };
const soloChoices: Array<Pick<Choice, 'tone' | 'isKey'>> = [
  // H1에 가벼운 답 (-2), H5는 +5라 SOLO엔 H5 너무 빨리 30 도달함 → 5명 모두 깎으려면 톤 분산 필요
  { tone: 'mature_serious', isKey: false }, // H5 -2, H1 +10... H1 깎으려면 다른 톤
  { tone: 'playful_casual', isKey: false }, // H1 -2, H3 -1 (낮)
  { tone: 'bright_forward', isKey: false }, // H1 -1, H3 -1, H4 +1
  { tone: 'mature_serious', isKey: false }, // H5 -2, H2 -1
  { tone: 'playful_casual', isKey: false }, // H1 -2, H3 -1
];
for (const c of soloChoices) {
  const deltas = computeToneDeltas(c, { toneTime: 'day' });
  for (const h of HEROINE_IDS) soloTotals[h] += deltas[h];
}
console.log('SOLO 시뮬 (5턴, 톤 분산):');
console.log(HEROINE_IDS.map((h) => `${h}=${soloTotals[h] >= 0 ? '+' : ''}${soloTotals[h]}`).join(' / '));
console.log('\n메모: SOLO 트리거는 모든 호감도 <30. 시작 0에서 위 5턴은 일부 양수가 남는다 →');
console.log('      실제 SOLO 라우트는 챕터 전체에 톤 미스매치 + KEY 자리 미통과 누적이 필요.');

// ──────────────────────────────────────────────────────────────────
// 6. 매트릭스 자체 검증
// ──────────────────────────────────────────────────────────────────
SECTION('6. 자체 검증');

let pass = 0;
let fail = 0;

const expect = (label: string, ok: boolean, detail?: string) => {
  if (ok) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label}${detail ? ' — ' + detail : ''}`);
  }
};

// (a) 각 히로인 KEY 톤이 매트릭스 최고값인지
for (const h of HEROINE_IDS) {
  const keyTone = KEY_HEROINE_TONE[h];
  if (keyTone === null) {
    expect(`${h} KEY 매핑 = null (미니게임 메커니즘)`, h === 'H4');
    continue;
  }
  const row = TONE_MATRIX[h];
  const maxTone = (Object.keys(row) as ToneTag[]).reduce((a, b) =>
    row[a] >= row[b] ? a : b,
  );
  expect(
    `${h} KEY 톤 ${keyTone}이 매트릭스 최고값`,
    maxTone === keyTone,
    `현재 최고: ${maxTone} (${row[maxTone]})`,
  );
}

// (b) H4 보정 확인 — direct_friendly +5→+3, warm_supportive +3→+1
expect('H4 direct_friendly = +3 (보정 후)', TONE_MATRIX.H4.direct_friendly === 3);
expect('H4 warm_supportive = +1 (보정 후)', TONE_MATRIX.H4.warm_supportive === 1);

// (c) H1 ↔ H5 정반대 자리 확인
expect(
  'H1 mature_serious +10 KEY = H5 mature_serious -2 페널티',
  TONE_MATRIX.H1.mature_serious === 10 && TONE_MATRIX.H5.mature_serious === -2,
);
expect(
  'H5 bright_forward +10 KEY = H1 bright_forward -1',
  TONE_MATRIX.H5.bright_forward === 10 && TONE_MATRIX.H1.bright_forward === -1,
);

// (d) 묘사 보너스 정상 가산 확인
const h1KeyChoice: Pick<Choice, 'tone' | 'isKey'> = { tone: 'mature_serious', isKey: true };
const h1Deltas = computeToneDeltas(h1KeyChoice);
expect('H1 KEY 통과 시 +15 (10 베이스 + 5 묘사)', h1Deltas.H1 === 15);

const h1NonKey: Pick<Choice, 'tone' | 'isKey'> = { tone: 'mature_serious', isKey: false };
const h1NonKeyDeltas = computeToneDeltas(h1NonKey);
expect('H1 KEY 미라벨 시 +10 (묘사 보너스 없음)', h1NonKeyDeltas.H1 === 10);

// (e) H3 KEY 시간대 무관 (2026-04-30 Step 4 PM 결정) — 낮/밤 모두 묘사 보너스 +5
const h3DayKey: Pick<Choice, 'tone' | 'isKey'> = { tone: 'warm_supportive', isKey: true };
const h3Day = computeToneDeltas(h3DayKey, { toneTime: 'day' });
const h3Night = computeToneDeltas(h3DayKey, { toneTime: 'night' });
expect('H3 KEY 낮 +15 (10 + 5)', h3Day.H3 === 15);
expect('H3 KEY 밤 +10 (5 일반 매치 + 5 묘사 — 시간대 무관 변경)', h3Night.H3 === 10);

// (f) H4 대면 KEY 묘사 보너스 (2026-04-30 Step 4 PM 결정)
const h4FaceKey: Pick<Choice, 'tone' | 'isKey'> = { tone: 'warm_supportive', isKey: true };
const h4Face = computeToneDeltas(h4FaceKey);
expect(
  'H4 대면 KEY +6 (warm_supportive +1 보정 + 묘사 +5)',
  h4Face.H4 === 6,
);

// (g) H4 미니게임 통과 + KEY = +7 (warm_sup +1 + 미니 +1 + 묘사 +5)
const h4MiniKey: Pick<Choice, 'tone' | 'isKey' | 'mechanism' | 'replyTimeMs'> = {
  tone: 'warm_supportive',
  isKey: true,
  mechanism: 'h4_reply_speed',
  replyTimeMs: 5000,
};
const h4Mini = computeToneDeltas(h4MiniKey);
expect('H4 미니게임 통과 + KEY +7 (베이스 +1 + 미니 +1 + 묘사 +5)', h4Mini.H4 === 7);

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);

if (fail > 0) {
  console.error('\n❌ 매트릭스 검증 실패 — toneMatrix.ts 점검 필요');
  process.exit(1);
} else {
  console.log('\n✓ 모든 자체 검증 통과');
}
