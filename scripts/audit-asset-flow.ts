/* eslint-disable no-console */
/**
 * 자산 사용 흐름 감사 — v3 (대규모 동선 재설계 라운드 2차 2026-05-08).
 *
 * **3-tier severity 모델** — store 자동 처리(BG 변경 시 캐릭터 클리어, BG state 유지)와 정합.
 *
 * 🔴 Critical (실제 fix 필요, exit code 1):
 *   - INVALID_POSITION       — CharacterLayer 6슬롯 외 위치값
 *   - CG_HIDE_MISSING        — CG 표시 중 BG/CHARACTER 변경
 *   - POSITION_COLLISION     — 같은 슬롯에 ≥2명
 *   - BG_NULL_CRITICAL       — 진짜 BG 누락 (incoming 0개 또는 모든 경로 BG=null)
 *
 * 🟡 Major (작가 의도 검토):
 *   - CHARACTER_CONCURRENT_MANY — 동시 등장 ≥4명 (6슬롯이라 6명까지 가능, 시각 부담 검토)
 *
 * ⚪ Info (store가 자동 처리 — 시각 영향 없음, 작가 의도 표시):
 *   - BG_NULL_INFO            — incoming 일부 경로만 BG=null (store가 직전 BG state 유지)
 *   - CHARACTER_LEFT_BEHIND   — 씬 끝까지 HIDE 없음 (store가 BG 변경 시 자동 클리어)
 *   - BG_CHANGE_RESIDUAL_CHARS — BG 변경 시점 잔존 (store가 자동 클리어, 같은 BG ID/black/white는 false positive 제거)
 *
 * v3 변경 (v2 대비):
 *   - BG_NULL을 critical/info 두 카테고리로 분리 (incoming 모두 null vs 일부만 null)
 *   - BG_CHANGE_RESIDUAL_CHARS — 같은 BG ID 또는 black/white 폴백은 검출 제외 (store 자동 클리어 정합)
 *   - audit 시뮬레이션도 store처럼 BG 변경 시 캐릭터 클리어 (LEFT_BEHIND false positive 감소)
 *   - 출력 tier별 그룹화 + exit code는 critical만 기준
 *
 * 사용:
 *   npx tsx scripts/audit-asset-flow.ts [--verbose]
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
// --mode=compressed → src/scenes/compressed (압축 모드 audit), 기본 → src/scenes (풀)
const MODE = process.argv.includes('--mode=compressed') ? 'compressed' : 'full';
const SCENES_DIR =
  MODE === 'compressed'
    ? path.join(ROOT, 'src/scenes/compressed')
    : path.join(ROOT, 'src/scenes');

interface SceneCommand {
  type: string;
  [key: string]: unknown;
}
interface CompiledScene {
  id: string;
  commands: SceneCommand[];
}

const VALID_POSITIONS = new Set([
  'left',
  'center',
  'right',
  'left_back',
  'center_back',
  'right_back',
  'pair_left',
  'pair_right',
]);

const CONCURRENT_THRESHOLD = 4; // 6슬롯 모델 — 4명+ 동시 시 검출

const verbose = process.argv.includes('--verbose');

function loadAllScenes(): CompiledScene[] {
  const files = readdirSync(SCENES_DIR).filter((f) => f.endsWith('.scene.json'));
  return files.map((f) => JSON.parse(readFileSync(path.join(SCENES_DIR, f), 'utf8')));
}

interface Finding {
  sceneId: string;
  cmdIndex: number;
  category: string;
  detail: string;
}

interface SceneOutgoing {
  /** 씬 끝(또는 JUMP 직전)에 마지막으로 설정된 BG. null이면 미설정 + 입력 상속만. */
  lastBg: string | null;
  /** 씬 끝까지 살아있는 캐릭터 (CHARACTER 등장 후 HIDE 안 됨). */
  liveCharacters: Set<string>;
  /** 씬에서 점프하는 다음 씬 ID들. */
  outgoing: Set<string>;
}

/** 각 씬의 outgoing 상태 + 그래프 분석. */
function analyzeScenesPass1(scenes: CompiledScene[]): {
  outgoingMap: Map<string, SceneOutgoing>;
  incomingMap: Map<string, Set<string>>;
} {
  const outgoingMap = new Map<string, SceneOutgoing>();
  const incomingMap = new Map<string, Set<string>>();

  for (const s of scenes) {
    let bg: string | null = null;
    const live = new Set<string>();
    const out = new Set<string>();

    for (const c of s.commands) {
      if (c.type === 'BG' && typeof c.image === 'string') bg = c.image;
      if (c.type === 'CHARACTER' && typeof c.id === 'string') live.add(c.id);
      if (c.type === 'CHARACTER_HIDE' && typeof c.id === 'string') live.delete(c.id);
      if (c.type === 'JUMP' && typeof c.sceneId === 'string') out.add(c.sceneId);
      if (c.type === 'CHOICE' && Array.isArray(c.choices)) {
        for (const ch of c.choices as Array<{ next?: string; effects?: SceneCommand[] }>) {
          if (typeof ch.next === 'string') out.add(ch.next);
          if (Array.isArray(ch.effects)) {
            for (const eff of ch.effects) {
              if (eff.type === 'JUMP' && typeof eff.sceneId === 'string') out.add(eff.sceneId);
            }
          }
        }
      }
    }

    outgoingMap.set(s.id, { lastBg: bg, liveCharacters: live, outgoing: out });
    for (const target of out) {
      const inSet = incomingMap.get(target) ?? new Set<string>();
      inSet.add(s.id);
      incomingMap.set(target, inSet);
    }
  }
  return { outgoingMap, incomingMap };
}

/**
 * Transitive BG inherit — 각 씬 출구에서 store에 살아있는 BG 후보 집합.
 *
 * store 정합: BG 명령 없을 때 직전 BG state 유지. 따라서 chain이 길어도
 * 어느 ancestor에서 BG가 깔렸으면 그 BG가 끝까지 유지됨.
 *
 * fixed-point iteration:
 *   - 씬 내 BG 명령이 있으면 그 BG가 출구
 *   - 없으면 incoming의 effectiveOutBg 합집합 그대로 출구
 *
 * sceneCount=216에서 iter 30회 충분 (대부분 DAG, 사이클은 무시).
 */
function computeEffectiveOutBgs(
  scenes: CompiledScene[],
  incomingMap: Map<string, Set<string>>,
): Map<string, Set<string>> {
  const ownLastBg = new Map<string, string | null>();
  for (const s of scenes) {
    let bg: string | null = null;
    for (const c of s.commands) {
      if (c.type === 'BG' && typeof c.image === 'string') bg = c.image;
    }
    ownLastBg.set(s.id, bg);
  }

  const result = new Map<string, Set<string>>();
  for (const s of scenes) result.set(s.id, new Set());

  for (let iter = 0; iter < 30; iter++) {
    let changed = false;
    for (const s of scenes) {
      const own = ownLastBg.get(s.id);
      const out = result.get(s.id)!;
      if (own !== null && own !== undefined) {
        // 씬 내 BG 명령 있음 — 그 BG가 단일 출구
        if (out.size !== 1 || !out.has(own)) {
          out.clear();
          out.add(own);
          changed = true;
        }
        continue;
      }
      // 씬 내 BG 없음 — incoming의 effectiveOutBg 합집합 그대로 전파
      const inSet = incomingMap.get(s.id) ?? new Set<string>();
      for (const src of inSet) {
        const srcOut = result.get(src) ?? new Set<string>();
        for (const bg of srcOut) {
          if (!out.has(bg)) {
            out.add(bg);
            changed = true;
          }
        }
      }
    }
    if (!changed) break;
  }
  return result;
}

function auditScene(
  scene: CompiledScene,
  outgoingMap: Map<string, SceneOutgoing>,
  incomingMap: Map<string, Set<string>>,
  effectiveOutBgs: Map<string, Set<string>>,
): Finding[] {
  const findings: Finding[] = [];

  // 진입 시 BG 후보 — incoming 모든 source의 effectiveOutBg 합집합 (transitive inherit)
  const incoming = incomingMap.get(scene.id) ?? new Set<string>();
  const inheritableBgs = new Set<string>();
  let hasNullIncoming = false; // incoming 중 effectiveOutBg가 빈 source 1개라도 있으면 안전 가드 권장
  if (incoming.size === 0) {
    hasNullIncoming = true; // 진입점(prologue 등) — 자체 BG 없으면 critical
  } else {
    for (const src of incoming) {
      const srcEff = effectiveOutBgs.get(src) ?? new Set();
      const srcOut = outgoingMap.get(src);
      if (!srcOut) continue;
      if (srcEff.size === 0) hasNullIncoming = true;
      for (const bg of srcEff) inheritableBgs.add(bg);
      // 호환: 옛 lastBg 추적도 유지 (BG_CHANGE_RESIDUAL_CHARS detail용)
      void srcOut.lastBg;
    }
  }

  // 진입 시 잔존 캐릭터 후보 — incoming 모든 source의 liveCharacters 합집합 (정확하지 않지만 휴리스틱)
  const inheritedChars = new Set<string>();
  for (const src of incoming) {
    const srcOut = outgoingMap.get(src);
    if (!srcOut) continue;
    for (const c of srcOut.liveCharacters) inheritedChars.add(c);
  }

  // 씬 단위 가상 상태
  let bg: string | null = inheritableBgs.size > 0 && !hasNullIncoming ? '<inherited>' : null;
  let cg: string | null = null;
  const characters = new Map<string, { sprite: string; position: string }>();
  // 진입 시 잔존 캐릭터 보유 (감사용 — 실제 스토어 상태에 가까움)
  for (const id of inheritedChars) characters.set(id, { sprite: 'inherited', position: 'inherited' });
  let firstTextIndex: number | null = null;

  for (let i = 0; i < scene.commands.length; i++) {
    const c = scene.commands[i];

    if (c.type === 'BG' && typeof c.image === 'string') {
      // BG 변경 시점에 잔존 캐릭터 검출 — store BG 자동 클리어 정책과 정합:
      // - 같은 BG ID 또는 black/white 폴백은 캐릭터 유지 (false positive 제거)
      // - 그 외 BG ID 변경은 store가 자동 캐릭터 클리어 → audit 시뮬레이션도 동일 처리
      const isSameOrFallback =
        bg === c.image || c.image === 'black' || c.image === 'white';
      if (
        !isSameOrFallback &&
        bg !== null &&
        bg !== '<inherited>' &&
        characters.size > 0
      ) {
        const liveIds = [...characters.keys()];
        findings.push({
          sceneId: scene.id,
          cmdIndex: i,
          category: 'BG_CHANGE_RESIDUAL_CHARS',
          detail: `BG="${bg}" → "${c.image}" 시점에 잔존 캐릭터 ${liveIds.length}명: ${liveIds.join(', ')} (store 자동 클리어 — 새 BG에 보존하려면 BG 직후 [CHARACTER] 재명시)`,
        });
        // store와 동일하게 캐릭터 클리어 (LEFT_BEHIND/POSITION 검출 정합)
        characters.clear();
      }
      bg = c.image;
    }
    if (c.type === 'CG' && typeof c.cgId === 'string') cg = c.cgId;
    if (c.type === 'CG_HIDE') cg = null;
    if (c.type === 'CHARACTER' && typeof c.id === 'string') {
      const id = c.id;
      const sprite = (c.sprite as string) ?? 'default';
      const position = (c.position as string) ?? 'center';
      if (!VALID_POSITIONS.has(position)) {
        findings.push({
          sceneId: scene.id,
          cmdIndex: i,
          category: 'INVALID_POSITION',
          detail: `${id} position="${position}" (6슬롯 외)`,
        });
      }
      characters.set(id, { sprite, position });
    }
    if (c.type === 'CHARACTER_HIDE' && typeof c.id === 'string') {
      characters.delete(c.id);
    }

    // 첫 텍스트 시점에 BG 미설정 검출 — critical/info 분리:
    // - critical: incoming 0개 또는 모든 경로 BG=null (진짜 누락, store 직전 BG state 도 빈 상태일 수 있음)
    // - info: incoming 일부 경로만 BG=null (store가 직전 BG state 유지하면 시각 영향 없음, 안전 가드 권장)
    if (firstTextIndex === null && (c.type === 'DIALOGUE' || c.type === 'MONOLOGUE' || c.type === 'NARRATION')) {
      firstTextIndex = i;
      if (bg === null) {
        const isCritical = incoming.size === 0 || inheritableBgs.size === 0;
        const nullCount = incoming.size === 0 ? 0 : incoming.size - inheritableBgs.size;
        findings.push({
          sceneId: scene.id,
          cmdIndex: i,
          category: isCritical ? 'BG_NULL_CRITICAL' : 'BG_NULL_INFO',
          detail: isCritical
            ? `씬 첫 텍스트(${c.type}) 시점 BG=null — incoming ${incoming.size}개 모두 BG 보장 X (진짜 누락)`
            : `씬 첫 텍스트(${c.type}) 시점 BG=null — incoming ${incoming.size}개 중 ${nullCount}개 경로 BG 미보장 (store 직전 BG state 유지 시 시각 영향 없음, 안전 가드 시나리오 [BG: ...] 권장)`,
        });
      }
    }

    if (cg !== null && c.type === 'BG') {
      findings.push({
        sceneId: scene.id,
        cmdIndex: i,
        category: 'CG_HIDE_MISSING',
        detail: `CG="${cg}" 표시 중 BG 변경 → ${c.image}`,
      });
    }

    // 위치 슬롯 충돌 — 같은 위치에 2명 이상
    if (c.type === 'CHARACTER') {
      const positionMap = new Map<string, string[]>();
      for (const [id, info] of characters.entries()) {
        if (info.position === 'inherited') continue;
        const arr = positionMap.get(info.position) ?? [];
        arr.push(id);
        positionMap.set(info.position, arr);
      }
      for (const [pos, ids] of positionMap.entries()) {
        if (ids.length >= 2) {
          findings.push({
            sceneId: scene.id,
            cmdIndex: i,
            category: 'POSITION_COLLISION',
            detail: `position="${pos}"에 ${ids.length}명: ${ids.join(', ')}`,
          });
        }
      }
    }

    // 동시 등장 ≥4 (6슬롯 모델 — 3명까지는 left/center/right 자연스러움)
    if (c.type === 'CHARACTER' && characters.size >= CONCURRENT_THRESHOLD) {
      findings.push({
        sceneId: scene.id,
        cmdIndex: i,
        category: 'CHARACTER_CONCURRENT_MANY',
        detail: `동시 등장 ${characters.size}명: ${[...characters.keys()].join(', ')}`,
      });
    }
  }

  // 씬 끝까지 HIDE 안 된 캐릭터 검출 — 다음 씬으로 어색하게 따라감
  // 단, 씬에 EVALUATE_BRANCH/ENDING이 있으면 엔딩 진입이라 무관 (스킵)
  const hasTerminal = scene.commands.some(
    (c) => c.type === 'EVALUATE_BRANCH' || c.type === 'ENDING',
  );
  if (!hasTerminal && characters.size > 0) {
    const liveIds = [...characters.keys()].filter(
      (id) => characters.get(id)?.position !== 'inherited', // 진입 상속분 제외
    );
    if (liveIds.length > 0) {
      findings.push({
        sceneId: scene.id,
        cmdIndex: scene.commands.length - 1,
        category: 'CHARACTER_LEFT_BEHIND',
        detail: `씬 끝까지 HIDE 없음 — ${liveIds.length}명: ${liveIds.join(', ')}`,
      });
    }
  }

  return findings;
}

function main(): void {
  const scenes = loadAllScenes();
  console.log(`총 ${scenes.length}개 씬 감사 시작 (v2) ...\n`);

  const { outgoingMap, incomingMap } = analyzeScenesPass1(scenes);
  const effectiveOutBgs = computeEffectiveOutBgs(scenes, incomingMap);
  console.log(
    `그래프 빌드: outgoing ${outgoingMap.size}개 / incoming 매핑 ${incomingMap.size}개 / transitive BG fixed-point converged\n`,
  );

  const allFindings: Finding[] = [];
  for (const s of scenes) {
    allFindings.push(...auditScene(s, outgoingMap, incomingMap, effectiveOutBgs));
  }

  // 카테고리별 집계
  const byCategory = new Map<string, Finding[]>();
  for (const f of allFindings) {
    const arr = byCategory.get(f.category) ?? [];
    arr.push(f);
    byCategory.set(f.category, arr);
  }

  // 카테고리별 severity tier 매핑
  const TIER_MAP: Record<string, 'critical' | 'major' | 'info'> = {
    INVALID_POSITION: 'critical',
    CG_HIDE_MISSING: 'critical',
    POSITION_COLLISION: 'critical',
    BG_NULL_CRITICAL: 'critical',
    CHARACTER_CONCURRENT_MANY: 'major',
    BG_NULL_INFO: 'info',
    CHARACTER_LEFT_BEHIND: 'info',
    BG_CHANGE_RESIDUAL_CHARS: 'info',
  };
  const TIER_LABEL: Record<'critical' | 'major' | 'info', string> = {
    critical: '🔴 Critical (fix 필요)',
    major: '🟡 Major (작가 의도 검토)',
    info: '⚪ Info (store 자동 처리, 시각 영향 없음)',
  };

  const byTier: Record<'critical' | 'major' | 'info', Array<[string, Finding[]]>> = {
    critical: [],
    major: [],
    info: [],
  };
  for (const [cat, findings] of byCategory.entries()) {
    const tier = TIER_MAP[cat] ?? 'info';
    byTier[tier].push([cat, findings]);
  }

  for (const tier of ['critical', 'major', 'info'] as const) {
    if (byTier[tier].length === 0) continue;
    console.log(`\n${TIER_LABEL[tier]}`);
    for (const [cat, findings] of byTier[tier]) {
      console.log(`\n  ━━━ ${cat} (${findings.length}건) ━━━`);
      if (verbose) {
        for (const f of findings) {
          console.log(`    [${f.sceneId}] cmd#${f.cmdIndex}: ${f.detail}`);
        }
      } else {
        const seen = new Set<string>();
        for (const f of findings) {
          const key = `${f.sceneId}::${f.detail.split(':')[0]}`;
          if (seen.has(key)) continue;
          seen.add(key);
          console.log(`    [${f.sceneId}] cmd#${f.cmdIndex}: ${f.detail}`);
        }
        if (findings.length > seen.size) {
          console.log(`    ... 외 ${findings.length - seen.size}건 (--verbose로 전체 보기)`);
        }
      }
    }
  }

  // 종합
  console.log('\n━━━ 종합 ━━━');
  let criticalTotal = 0;
  let majorTotal = 0;
  let infoTotal = 0;
  for (const [cat, findings] of byCategory.entries()) {
    const tier = TIER_MAP[cat] ?? 'info';
    if (tier === 'critical') criticalTotal += findings.length;
    else if (tier === 'major') majorTotal += findings.length;
    else infoTotal += findings.length;
  }
  console.log(`  🔴 Critical: ${criticalTotal}건`);
  console.log(`  🟡 Major: ${majorTotal}건`);
  console.log(`  ⚪ Info: ${infoTotal}건`);

  if (criticalTotal > 0) {
    console.log(`\n✗ Critical 잔여 ${criticalTotal}건 — fix 필요`);
    process.exit(1);
  }
  console.log('\n✓ Critical 0건');
}

main();
