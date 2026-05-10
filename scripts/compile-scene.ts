/* eslint-disable no-console */
/**
 * 시나리오 .md → .scene.json 컴파일러 v0.2.
 *
 * 입력: `game-project/03-story/scenarios/*.md` (한 .md에 여러 Scene 가능, `# Scene: <id>` 헤더로 분리)
 * 출력: `game-project/src/scenes/<scene_id>.scene.json` (Scene[] 풀)
 *
 * SCENE-FORMAT.md §1.1·§1.2·§1.3 디렉티브 미러. 알 수 없는 디렉티브는 NARRATION으로 fallback (경고).
 *
 * v0.2 변경:
 * - SCENE_CUE 디렉티브 정식 등록 (메타 보존, UI 자동 advance — 디버그 빌드에서만 라벨 노출)
 *
 * v0.1 한계 (변경 제안에 추적):
 * - IF/ELSE/[/IF] 중첩 블록 미지원 (선형 점프만 처리, 시나리오에 등장 시 경고) — W5+ 이연 (PM 결정 2026-05-05)
 * - 톤 매트릭스 (CONVENTIONS §3.7 새 표기법 tone:/isKey:) 미구현 — 옛 표기법(FLAG_INC + KEY_CHOICE) 우선
 * - CHOICE_KAKAO는 일반 CHOICE로 fallback (UI 측 KAKAO 모달 안에서만 동작)
 *
 * 사용:
 *   npx tsx scripts/compile-scene.ts
 *   npx tsx scripts/compile-scene.ts --input=03-story/scenarios/prologue.md
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { isKnownBgm, isKnownSfx, koToEnBgm, koToEnSfx } from '../src/engine/audioMappings';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 모드 분기 (2026-05-08) ─────────────────────────────────────
// --mode=full (기본) → 03-story/scenarios/*.md → src/scenes/*.scene.json
// --mode=compressed → 03-story/scenarios/compressed/*.md → src/scenes/compressed/*.scene.json
type CompileMode = 'full' | 'compressed';
const cliArgs = process.argv.slice(2);
const modeArg = cliArgs.find((a) => a.startsWith('--mode='))?.split('=')[1] ?? 'full';
if (modeArg !== 'full' && modeArg !== 'compressed') {
  throw new Error(`--mode= must be 'full' or 'compressed' (got '${modeArg}')`);
}
const MODE: CompileMode = modeArg as CompileMode;

interface KakaoMessageOut {
  sender: string;
  text: string;
  delay?: number;
  typing?: boolean;
  /** 사진 메시지 — public 기준 경로(`/img/...`). text는 빈 문자열일 수 있음. */
  image?: string;
  /** 메시지 등장 전 머뭇거림 시퀀스 — 단계별 ms (0/undefined는 스킵). */
  preTyping1?: number;
  prePause?: number;
  preTyping2?: number;
}

interface ChoiceOut {
  text: string;
  next?: string;
  effects?: SceneCommandOut[];
  // 톤 매트릭스 신표기법 (CONVENTIONS §3.7) — gameStore가 런타임에 toneMatrix 룩업
  tone?: string;
  isKey?: boolean;
  descriptor?: string;
  mechanism?: string;
  /** 옵션별 co-fire NPC override (2026-05-11) — sceneMeta.coFireNpcs 무시. */
  coFireNpcs?: string[];
}

type SceneCommandOut =
  | { type: 'BG'; image: string; transition?: string; duration?: number }
  | { type: 'BGM'; track: string; volume?: number; fade?: number }
  | { type: 'BGM_STOP'; fade?: number }
  | { type: 'SFX'; sound: string; volume?: number; loop?: boolean }
  | { type: 'CHARACTER'; id: string; sprite: string; position: string; transition?: string }
  | { type: 'CHARACTER_HIDE'; id: string; transition?: string }
  | { type: 'DIALOGUE'; speaker: string; text: string }
  | { type: 'MONOLOGUE'; speaker: string; text: string; subtype?: string }
  | { type: 'NARRATION'; text: string }
  | { type: 'CHOICE'; choices: ChoiceOut[] }
  | { type: 'CG'; image: string; cgId: string; duration?: number }
  | { type: 'CG_HIDE' }
  | { type: 'VIDEO'; src: string }
  | {
      type: 'KAKAO';
      messages: KakaoMessageOut[];
      replyTimerEnabled?: boolean;
      timerSeconds?: number;
      choices?: ChoiceOut[];
      affectionDecay?: { target: string; perSecond: number };
      mode?: 'dm' | 'group';
      heroine?: string;
      roomName?: string;
      roomMembers?: number;
      pinnedNotice?: string;
      startHour?: number;
      startMinute?: number;
      hesitate?: boolean;
      unreadFadeMs?: number;
    }
  | { type: 'FLAG_SET'; key: string; value: unknown }
  | { type: 'FLAG_INC'; key: string; delta: number }
  | { type: 'KEY_CHOICE'; heroine: string; choiceId: string }
  | { type: 'JUMP'; sceneId: string }
  | { type: 'EVALUATE_BRANCH' }
  | { type: 'EVALUATE_TIER'; winner: string }
  | { type: 'ENDING'; endingId: string }
  | { type: 'SCENE_CUE'; label: string };

interface SceneOut {
  id: string;
  meta?: {
    chapter?: string | number;
    time?: string;
    toneTime?: 'day' | 'night';
    activeHeroines?: string[];
    coFireNpcs?: string[];
  };
  commands: SceneCommandOut[];
}

interface CompileStats {
  files: number;
  scenes: number;
  unknownDirectives: Set<string>;
  warnings: string[];
}

const ROOT = path.resolve(__dirname, '..');
const SCENARIO_DIRS =
  MODE === 'full'
    ? [path.join(ROOT, '03-story/scenarios')]
    : [path.join(ROOT, '03-story/scenarios/compressed')];
const OUT_DIR =
  MODE === 'full' ? path.join(ROOT, 'src/scenes') : path.join(ROOT, 'src/scenes/compressed');
const MANIFEST_OUT = path.join(OUT_DIR, 'compiled-manifest.json');

// ─── Tokenizer 정규식 ────────────────────────────────────────────

const RE_SCENE_HEADER = /^#\s*Scene:\s*([a-zA-Z0-9_]+)\s*$/;
const RE_HINT = /^#\s*Hint:\s*(.+)$/;
const RE_BG = /^\[BG:\s*([^\]]+?)(?:\s+(fade|cut))?\s*\]$/;
const RE_BGM = /^\[BGM:\s*([^\]]+?)(?:\s+(?:volume=([0-9.]+)|fade=([0-9.]+)))?(?:\s+(?:volume=([0-9.]+)|fade=([0-9.]+)))?\s*\]$/;
const RE_BGM_STOP = /^\[BGM_STOP(?:\s+fade=([0-9.]+))?\s*\]$/;
// 2026-05-09: loop 토큰 추가 — `[SFX: ktx_주행음 volume=0.6 loop]` 형식 인식 (ambient ambient).
const RE_SFX = /^\[SFX:\s*([^\]\s]+)((?:\s+(?:volume=[0-9.]+|loop))*)\s*\]$/;
const RE_CHARACTER = /^\[CHARACTER:\s*([^\]]+)\]$/;
const RE_CHARACTER_HIDE = /^\[CHARACTER_HIDE:\s*([^\]]+)\]$/;
const RE_CG = /^\[CG:\s*([^\]]+?)(?:\s+([a-zA-Z0-9_]+))?\s*\]$/;
const RE_CG_HIDE = /^\[CG_HIDE\]$/;
const RE_VIDEO = /^\[VIDEO:\s*([a-zA-Z0-9_]+)\s*\]$/;
const RE_DIALOGUE = /^\[([^\]]+?)\]\s*(\(.+?\))?\s*(.+)$/;
const RE_MONOLOGUE_SPEAKER = /^(.+)\s*모놀로그$/;
const RE_NARRATION = /^\[지문\]\s*(.+)$/;
const RE_CHOICE_OPEN = /^\[CHOICE\]$/;
const RE_CHOICE_KAKAO_OPEN = /^\[CHOICE_KAKAO\]$/;
const RE_CHOICE_CLOSE = /^\[\/(?:CHOICE|CHOICE_KAKAO)\]$/;
const RE_CHOICE_LINE = /^-\s*(.+)$/;
// KAKAO 블록 헤더: 옵션 0~N개 받음. 예: `[KAKAO mode=dm heroine=H4 unreadFadeMs=400]`
const RE_KAKAO_OPEN = /^\[KAKAO(?:\s+([^\]]+))?\]$/;
const RE_KAKAO_TIMER_OPEN = /^\[KAKAO_TIMER:\s*(\d+)\]$/;
const RE_KAKAO_CLOSE = /^\[\/(?:KAKAO|KAKAO_TIMER)\]$/;
// 메시지 라인: `- {speaker:이름, key:value, ...} 텍스트`. 텍스트는 빈 문자열 허용 (image-only 메시지).
const RE_KAKAO_LINE = /^-\s*\{speaker:([^,}]+)((?:,\s*[a-zA-Z0-9_]+:[^,}]+)*)\}\s*(.*)$/;
const RE_INC = /^\[INC:\s*([A-Z_a-z0-9]+)\s*([+\-]\d+)\s*\]$/;
const RE_FLAG = /^\[FLAG:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)\s*\]$/;
const RE_KEY = /^\[KEY:\s*(H[1-5])\s+([a-zA-Z0-9_]+)\s*\]$/;
const RE_JUMP = /^\[JUMP:\s*([a-zA-Z0-9_]+)\s*\]$/;
const RE_EVAL = /^\[EVALUATE_BRANCH\]$/;
const RE_EVAL_TIER = /^\[EVALUATE_TIER:\s*(H[1-5])\s*\]$/;
const RE_ENDING = /^\[ENDING:\s*([A-Z_0-9]+)\s*\]$/;
const RE_IF = /^\[IF:\s*.+\]$/;
const RE_ELSE = /^\[ELSE\]$/;
const RE_IF_END = /^\[\/IF\]$/;
const RE_SCENE_CUE = /^\[SCENE_CUE:\s*(.+)\]$/;

// ─── 파서 ─────────────────────────────────────────────────────────

function compileFile(filePath: string, stats: CompileStats): SceneOut[] {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const scenes: SceneOut[] = [];
  let current: SceneOut | null = null;
  // sub-씬(# Hint 미박)은 직전 메인 씬의 메타를 상속 — UI-SPEC §11.5 activeHeroines 자동 전파.
  let lastMainMeta: ReturnType<typeof parseHint> | null = null;
  let i = 0;
  let inCodeBlock = false;
  let frontmatterPassed = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // YAML frontmatter (--- ... ---)
    if (!frontmatterPassed) {
      if (trimmed === '---') {
        // 첫 번째 --- 만나면 frontmatter 시작
        i++;
        while (i < lines.length && lines[i].trim() !== '---') {
          i++;
        }
        i++; // 두 번째 --- 건너뜀
        frontmatterPassed = true;
        continue;
      }
      // frontmatter 없으면 패스
      frontmatterPassed = true;
    }

    // 코드 블록 ```...```
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      i++;
      continue;
    }
    if (inCodeBlock) {
      i++;
      continue;
    }

    // 빈 줄 / 주석 / >, --- (frontmatter 외 split)
    if (trimmed === '' || trimmed.startsWith('>') || trimmed === '---') {
      i++;
      continue;
    }

    // Scene 헤더
    const sceneMatch = trimmed.match(RE_SCENE_HEADER);
    if (sceneMatch) {
      if (current) scenes.push(current);
      current = { id: sceneMatch[1], commands: [] };
      // sub-씬(# Hint 미박)은 직전 메인 씬의 meta를 상속 — activeHeroines·toneTime 자동 전파.
      // sub-씬에 별도 # Hint가 박히면 그 줄에서 덮어씀.
      if (lastMainMeta) current.meta = { ...lastMainMeta };
      i++;
      continue;
    }

    // Hint 메타
    const hintMatch = trimmed.match(RE_HINT);
    if (hintMatch && current) {
      current.meta = parseHint(hintMatch[1]);
      lastMainMeta = current.meta;
      i++;
      continue;
    }

    // 본문 라인은 current 씬에 들어감. 헤더 없으면 마크다운 본문(작가 메모) 등 → skip
    if (!current) {
      i++;
      continue;
    }

    // 멀티라인 블록 처리: KAKAO, CHOICE, KAKAO_TIMER, IF
    const kakaoOpenMatch = trimmed.match(RE_KAKAO_OPEN);
    if (kakaoOpenMatch) {
      const blockOpts = kakaoOpenMatch[1] ? parseKVOptions(kakaoOpenMatch[1]) : {};
      const [blocks, nextI] = parseKakaoBlock(lines, i + 1, stats, undefined, blockOpts);
      current.commands.push(...blocks);
      i = nextI;
      continue;
    }

    const timerMatch = trimmed.match(RE_KAKAO_TIMER_OPEN);
    if (timerMatch) {
      const [blocks, nextI] = parseKakaoBlock(lines, i + 1, stats, parseInt(timerMatch[1], 10));
      current.commands.push(...blocks);
      i = nextI;
      continue;
    }

    if (RE_CHOICE_OPEN.test(trimmed) || RE_CHOICE_KAKAO_OPEN.test(trimmed)) {
      const [block, nextI] = parseChoiceBlock(lines, i + 1, stats);
      current.commands.push(block);
      i = nextI;
      continue;
    }

    if (RE_IF.test(trimmed)) {
      // v0.1: IF 분기는 무시하고 본문만 흘림. 파일 끝까지 [/IF] 찾아서 건너뜀
      // 실제 분기는 EVALUATE_BRANCH가 처리.
      stats.warnings.push(`[${current.id}] IF 블록 v0.1 미지원 — 무시: ${trimmed}`);
      i = skipIfBlock(lines, i);
      continue;
    }

    // 단일 라인 디렉티브
    const cmd = parseSingleDirective(trimmed, stats, current.id);
    if (cmd) {
      current.commands.push(cmd);
      i++;
      continue;
    }

    // 디렉티브 아닌 일반 텍스트 → 마크다운 본문(작가 메모 등) skip
    i++;
  }

  if (current) scenes.push(current);
  return scenes;
}

type ActiveTargetTok =
  | 'H1' | 'H2' | 'H3' | 'H4' | 'H5'
  | 'gyumin' | 'gyeongmin' | 'nathan' | 'wook' | 'junhyuk'
  | 'mom' | 'taeho';

const FRIEND_GROUP: ActiveTargetTok[] = ['gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk'];
const NPC_TOK_SET = new Set<string>([
  'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk', 'mom', 'taeho',
]);

function parseHint(s: string): {
  chapter?: string | number;
  time?: string;
  toneTime?: 'day' | 'night';
  activeHeroines?: ActiveTargetTok[];
  coFireNpcs?: ActiveTargetTok[];
} {
  const meta: {
    chapter?: string | number;
    time?: string;
    toneTime?: 'day' | 'night';
    activeHeroines?: ActiveTargetTok[];
    coFireNpcs?: ActiveTargetTok[];
  } = {};
  const chapterMatch = s.match(/chapter\s*=\s*(\d+|[a-zA-Z0-9_]+)/);
  if (chapterMatch) {
    const v = chapterMatch[1];
    meta.chapter = /^\d+$/.test(v) ? Number(v) : v;
  }
  const timeMatch = s.match(/time\s*=\s*"([^"]+)"/);
  if (timeMatch) meta.time = timeMatch[1];
  const toneTimeMatch = s.match(/toneTime\s*=\s*(day|night)/);
  if (toneTimeMatch) meta.toneTime = toneTimeMatch[1] as 'day' | 'night';
  // active=H1,H2 또는 active=H1+gyumin+mom 등 표기 모두 허용.
  // 'all' = 5 H + 친구 5 + mom + taeho. 'friend' 토큰은 5명 친구 자동 스프레드(작가 편의).
  const activeMatch = s.match(/active\s*=\s*([A-Za-z0-9_+,\s]+?)(?:[;,]\s*[a-zA-Z]+\s*=|$)/);
  if (activeMatch) {
    const raw = activeMatch[1].trim();
    if (raw === 'all') {
      meta.activeHeroines = [
        'H1', 'H2', 'H3', 'H4', 'H5',
        'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk',
        'mom', 'taeho',
      ];
    } else {
      const tokens = raw.split(/[,+\s]+/).map((x) => x.trim());
      const ids: ActiveTargetTok[] = [];
      for (const tok of tokens) {
        const upper = tok.toUpperCase();
        const lower = tok.toLowerCase();
        if (upper === 'H1' || upper === 'H2' || upper === 'H3' || upper === 'H4' || upper === 'H5') {
          ids.push(upper as ActiveTargetTok);
        } else if (lower === 'friend') {
          // 'friend' 단축어 → 5명 친구로 자동 확장
          ids.push(...FRIEND_GROUP);
        } else if (NPC_TOK_SET.has(lower)) {
          ids.push(lower as ActiveTargetTok);
        }
      }
      if (ids.length > 0) meta.activeHeroines = Array.from(new Set(ids));
    }
  }
  // heroine=H1 표기는 ch06 루트별 챕터에서 이미 박혀 있음 — active 미박 시 fallback으로 자동 적용.
  if (!meta.activeHeroines) {
    const heroineMatch = s.match(/heroine\s*=\s*(H[1-5])/);
    if (heroineMatch) {
      meta.activeHeroines = [heroineMatch[1] as ActiveTargetTok];
    }
  }
  // coFire=taeho+junhyuk — 씬 단위 co-fire NPC 목록 (2026-05-11 추가).
  // 1-NPC drop 룰 우회 — 명시 NPC는 H 변동과 함께 적용.
  const coFireMatch = s.match(/coFire\s*=\s*([A-Za-z0-9_+,\s]+?)(?:[;,]\s*[a-zA-Z]+\s*=|$)/);
  if (coFireMatch) {
    const raw = coFireMatch[1].trim();
    const tokens = raw.split(/[,+\s]+/).map((x) => x.trim().toLowerCase());
    const ids: ActiveTargetTok[] = [];
    for (const tok of tokens) {
      if (NPC_TOK_SET.has(tok)) ids.push(tok as ActiveTargetTok);
    }
    if (ids.length > 0) meta.coFireNpcs = Array.from(new Set(ids));
  }
  return meta;
}

function parseSingleDirective(
  trimmed: string,
  stats: CompileStats,
  sceneId: string,
): SceneCommandOut | null {
  let m: RegExpMatchArray | null;

  if ((m = trimmed.match(RE_BG))) {
    return { type: 'BG', image: slugAsset(m[1]), transition: m[2] };
  }
  if ((m = trimmed.match(RE_BGM))) {
    const fadeStr = m[3] ?? m[5];
    const volStr = m[2] ?? m[4];
    const out: SceneCommandOut = { type: 'BGM', track: normalizeBgmId(m[1]) };
    if (volStr) out.volume = Number(volStr);
    if (fadeStr) out.fade = Number(fadeStr);
    return out;
  }
  if ((m = trimmed.match(RE_BGM_STOP))) {
    const out: SceneCommandOut = { type: 'BGM_STOP' };
    if (m[1]) out.fade = Number(m[1]);
    return out;
  }
  if ((m = trimmed.match(RE_SFX))) {
    const out: SceneCommandOut = { type: 'SFX', sound: normalizeSfxId(m[1]) };
    // m[2]: 옵션 토큰 묶음 ("\s+volume=0.6\s+loop" 같은 string). 토큰별로 파싱.
    const optsRaw = (m[2] ?? '').trim();
    if (optsRaw) {
      for (const tok of optsRaw.split(/\s+/)) {
        if (tok === 'loop') {
          out.loop = true;
        } else if (tok.startsWith('volume=')) {
          out.volume = Number(tok.slice('volume='.length));
        }
      }
    }
    return out;
  }
  if ((m = trimmed.match(RE_CHARACTER))) {
    return parseCharacterDirective(m[1]);
  }
  if ((m = trimmed.match(RE_CHARACTER_HIDE))) {
    const parts = m[1].trim().split(/\s+/);
    return { type: 'CHARACTER_HIDE', id: parts[0], transition: parts[1] };
  }
  if ((m = trimmed.match(RE_CG))) {
    // m[1]: cg_id (예: cg_seoyoon_reject) / m[2]: 액션 토큰 (show/hide), 현재 컴파일러는 show 기본 가정 (CG_HIDE는 별도)
    const cgId = m[1].trim().split(/\s+/)[0];
    return { type: 'CG', image: cgId, cgId };
  }
  if (RE_CG_HIDE.test(trimmed)) {
    return { type: 'CG_HIDE' };
  }
  if ((m = trimmed.match(RE_VIDEO))) {
    return { type: 'VIDEO', src: m[1] };
  }
  if ((m = trimmed.match(RE_NARRATION))) {
    return { type: 'NARRATION', text: m[1].trim() };
  }
  if ((m = trimmed.match(RE_INC))) {
    return { type: 'FLAG_INC', key: m[1], delta: Number(m[2]) };
  }
  if ((m = trimmed.match(RE_FLAG))) {
    return { type: 'FLAG_SET', key: m[1], value: parseFlagValue(m[2]) };
  }
  if ((m = trimmed.match(RE_KEY))) {
    return { type: 'KEY_CHOICE', heroine: m[1], choiceId: m[2] };
  }
  if ((m = trimmed.match(RE_JUMP))) {
    return { type: 'JUMP', sceneId: m[1] };
  }
  if (RE_EVAL.test(trimmed)) {
    return { type: 'EVALUATE_BRANCH' };
  }
  if ((m = trimmed.match(RE_EVAL_TIER))) {
    // 챕터 6 끝 evaluate 씬: [EVALUATE_TIER: H1] → winner 기반 티어 결정 후 엔딩 씬으로 점프
    // (2026-05-09 ch5 EVALUATE_BRANCH 책임 분리, 2026-05-10 컴파일러 누락 처방)
    return { type: 'EVALUATE_TIER', winner: m[1] };
  }
  if ((m = trimmed.match(RE_ENDING))) {
    return { type: 'ENDING', endingId: m[1] };
  }
  if (RE_ELSE.test(trimmed) || RE_IF_END.test(trimmed)) {
    // v0.1 IF 블록 외부 파편은 무시
    return null;
  }
  if ((m = trimmed.match(RE_SCENE_CUE))) {
    // v0.2: SCENE_CUE 정식 등록 — 메타 보존(연출 단계 레이블), UI는 즉시 advance
    return { type: 'SCENE_CUE', label: m[1].trim() };
  }

  // 화자 라인 (대사 / 모놀로그)
  if ((m = trimmed.match(RE_DIALOGUE))) {
    const speakerRaw = m[1].trim();
    const text = m[3].trim();
    const monoMatch = speakerRaw.match(RE_MONOLOGUE_SPEAKER);
    if (monoMatch) {
      const speaker = monoMatch[1].trim();
      const subtype = parseMonologueSubtype(m[2]);
      const out: SceneCommandOut = { type: 'MONOLOGUE', speaker, text };
      if (subtype) out.subtype = subtype;
      return out;
    }
    // 일반 대사
    return { type: 'DIALOGUE', speaker: speakerRaw, text };
  }

  // 알 수 없는 디렉티브
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    stats.unknownDirectives.add(trimmed.split(':')[0] + ']');
    return null;
  }
  return null;
}

function parseCharacterDirective(args: string): SceneCommandOut {
  // ex: "윤모 center default fade" or "차세린 right warm fade"
  const parts = args.trim().split(/\s+/);
  return {
    type: 'CHARACTER',
    id: parts[0],
    sprite: parts[2] ?? 'default',
    position: parts[1] ?? 'center',
    transition: parts[3],
  };
}

function parseMonologueSubtype(emotion?: string): string | undefined {
  if (!emotion) return undefined;
  const e = emotion.toLowerCase();
  if (e.includes('망상 시작')) return 'perv_start';
  if (e.includes('자기자각')) return 'self_aware';
  if (e.includes('정상복귀')) return 'recover';
  return 'normal';
}

function parseFlagValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const num = Number(raw);
  if (!isNaN(num)) return num;
  return raw.replace(/^['"]|['"]$/g, '');
}

function slugAsset(raw: string): string {
  // "분당_본가_거실_밤 fade" 등에서 첫 토큰만
  return raw.trim().split(/\s+/)[0];
}

/**
 * BGM 큐 한글 → 영문 ID 정규화. 영문 ID로 들어오면 그대로.
 * 미매핑은 원본 그대로 반환 (validate-build.ts가 error로 잡음).
 */
function normalizeBgmId(raw: string): string {
  const slug = slugAsset(raw);
  if (isKnownBgm(slug)) return slug;
  try {
    return koToEnBgm(slug);
  } catch {
    return slug;
  }
}

function normalizeSfxId(raw: string): string {
  const slug = slugAsset(raw);
  if (isKnownSfx(slug)) return slug;
  try {
    return koToEnSfx(slug);
  } catch {
    return slug;
  }
}

/**
 * `[KAKAO mode=dm heroine=H4 unreadFadeMs=400]` 헤더 옵션과
 * `- {speaker:나서윤, image:/path, preTyping1:1000} 텍스트` 메시지 옵션을
 * key=value/key:value 페어 문자열에서 파싱.
 */
function parseKVOptions(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const kv of s.split(/[,\s]+/)) {
    const m = kv.match(/^([a-zA-Z0-9_]+)[:=]\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function applyKakaoBlockOptions(
  kakao: Extract<SceneCommandOut, { type: 'KAKAO' }>,
  opts: Record<string, string>,
): void {
  if (opts.mode === 'dm' || opts.mode === 'group') kakao.mode = opts.mode;
  if (opts.heroine) kakao.heroine = opts.heroine;
  if (opts.roomName) kakao.roomName = opts.roomName;
  if (opts.roomMembers) kakao.roomMembers = Number(opts.roomMembers);
  if (opts.pinnedNotice) kakao.pinnedNotice = opts.pinnedNotice;
  if (opts.startHour) kakao.startHour = Number(opts.startHour);
  if (opts.startMinute) kakao.startMinute = Number(opts.startMinute);
  if (opts.hesitate === 'true') kakao.hesitate = true;
  if (opts.unreadFadeMs) kakao.unreadFadeMs = Number(opts.unreadFadeMs);
}

function parseKakaoBlock(
  lines: string[],
  start: number,
  stats: CompileStats,
  timerSeconds?: number,
  blockOpts?: Record<string, string>,
): [SceneCommandOut[], number] {
  const messages: KakaoMessageOut[] = [];
  const trailingCommands: SceneCommandOut[] = [];
  let embeddedChoices: ChoiceOut[] | undefined;
  let i = start;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (RE_KAKAO_CLOSE.test(trimmed)) {
      const kakao: SceneCommandOut = { type: 'KAKAO', messages };
      // 2026-05-08 재설계: KAKAO_TIMER + 임베드 CHOICE_KAKAO를 단일 KAKAO 명령으로.
      // - 타이머/late_reply_count 메커니즘 폐기 → 호감도 1초당 -5 디케이로 대체.
      // - choices는 KakaoModal이 메시지+선택지 동시 표시.
      if (timerSeconds !== undefined) {
        kakao.affectionDecay = { target: 'H4', perSecond: 5 };
        if (embeddedChoices && embeddedChoices.length > 0) {
          kakao.choices = embeddedChoices;
        }
      }
      // 블록 헤더 옵션 적용 (mode/heroine/unreadFadeMs/hesitate 등).
      if (blockOpts) applyKakaoBlockOptions(kakao, blockOpts);
      return [[kakao, ...trailingCommands], i + 1];
    }
    // 중첩 CHOICE_KAKAO 처리
    if (RE_CHOICE_KAKAO_OPEN.test(trimmed)) {
      const [choiceBlock, nextI] = parseChoiceBlock(lines, i + 1, stats);
      if (choiceBlock.type === 'CHOICE' && timerSeconds !== undefined) {
        // KAKAO_TIMER 안 → 단일 KAKAO 명령에 choices 임베드 (별도 CHOICE 명령 산출 X).
        embeddedChoices = choiceBlock.choices;
      } else {
        // KAKAO_TIMER 밖이면 기존 폴백 (별도 CHOICE 명령으로 추가).
        trailingCommands.push(choiceBlock);
      }
      i = nextI;
      continue;
    }
    const m = trimmed.match(RE_KAKAO_LINE);
    if (m) {
      const msg: KakaoMessageOut = { sender: m[1].trim(), text: m[3].trim() };
      const opts = m[2] ? parseKVOptions(m[2].replace(/^,\s*/, '')) : {};
      if (opts.delay) msg.delay = Number(opts.delay);
      if (opts.typing === 'true') msg.typing = true;
      if (opts.image) msg.image = opts.image;
      if (opts.preTyping1) msg.preTyping1 = Number(opts.preTyping1);
      if (opts.prePause) msg.prePause = Number(opts.prePause);
      if (opts.preTyping2) msg.preTyping2 = Number(opts.preTyping2);
      messages.push(msg);
    } else if (trimmed.startsWith('-') && trimmed.includes('타이핑 인디케이터')) {
      // 무시 (RejectEnding이 typing 단계로 처리)
    }
    i++;
  }
  // close 못 찾음
  stats.warnings.push(`KAKAO 블록 종료 [/KAKAO] 누락 (start line ${start})`);
  const kakao: SceneCommandOut = { type: 'KAKAO', messages };
  if (blockOpts) applyKakaoBlockOptions(kakao, blockOpts);
  return [[kakao, ...trailingCommands], i];
}

function parseChoiceBlock(
  lines: string[],
  start: number,
  stats: CompileStats,
): [SceneCommandOut, number] {
  const choices: ChoiceOut[] = [];
  let i = start;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (RE_CHOICE_CLOSE.test(trimmed)) {
      return [{ type: 'CHOICE', choices }, i + 1];
    }
    const m = trimmed.match(RE_CHOICE_LINE);
    if (m) {
      const parsed = parseChoiceLine(m[1]);
      if (parsed) choices.push(parsed);
    }
    i++;
  }
  stats.warnings.push(`CHOICE 블록 종료 [/CHOICE] 누락 (start line ${start})`);
  return [{ type: 'CHOICE', choices }, i];
}

function parseChoiceLine(raw: string): ChoiceOut | null {
  // 신표기법 (CONVENTIONS §3.7): "텍스트" {tone:warm_supportive, key:true, descriptor:ch6_h4_xxx} → next: scene_id
  // 옛 표기법: "텍스트" → +10 H4 → KEY:H4:ch6_h4_xxx → next: scene_id
  // 둘 공존 가능 (Step 3 마이그레이션 중간 단계)

  // 1. 신표기법 메타 블록 {...} 추출 (있으면 분리)
  const toneMeta: {
    tone?: string;
    isKey?: boolean;
    descriptor?: string;
    mechanism?: string;
    coFireNpcs?: string[];
  } = {};
  let cleanRaw = raw;
  const metaMatch = raw.match(/\{([^}]+)\}/);
  if (metaMatch) {
    const inner = metaMatch[1];
    const parts = inner.split(',').map((s) => s.trim());
    for (const part of parts) {
      const [k, v] = part.split(':').map((s) => s.trim());
      if (k === 'tone') toneMeta.tone = v;
      else if (k === 'key' && (v === 'true' || v === 'TRUE')) toneMeta.isKey = true;
      else if (k === 'isKey' && (v === 'true' || v === 'TRUE')) toneMeta.isKey = true;
      else if (k === 'descriptor') toneMeta.descriptor = v;
      else if (k === 'mechanism') toneMeta.mechanism = v;
      else if (k === 'coFire' || k === 'coFireNpcs') {
        // coFire:junhyuk 또는 coFire:junhyuk+taeho — 옵션별 코파이어 NPC override
        const npcs = v.split(/[+|]/).map((x) => x.trim().toLowerCase()).filter((x) => NPC_TOK_SET.has(x));
        if (npcs.length > 0) toneMeta.coFireNpcs = npcs;
      }
    }
    cleanRaw = raw.replace(metaMatch[0], '').trim();
  }

  // 2. 화살표 분리
  const arrows = cleanRaw.split('→').map((s) => s.trim());
  if (arrows.length === 0) return null;

  // 3. 텍스트 추출 (따옴표/괄호 우선, 없으면 raw)
  const first = arrows[0];
  const textMatch = first.match(/^"([^"]*)"\s*(?:\(.*?\))?\s*$/) ?? first.match(/^\((.+?)\)$/);
  const text = textMatch ? textMatch[1] : first.replace(/^"|"$/g, '');

  const choice: ChoiceOut = { text };
  const effects: SceneCommandOut[] = [];

  for (let i = 1; i < arrows.length; i++) {
    const segment = arrows[i].trim();

    const nextMatch = segment.match(/^next:\s*([a-zA-Z0-9_]+)$/);
    if (nextMatch) {
      choice.next = nextMatch[1];
      continue;
    }

    const incMatch = segment.match(/^([+\-]\d+)\s+([A-Z_a-z0-9]+)$/);
    if (incMatch) {
      effects.push({ type: 'FLAG_INC', key: incMatch[2], delta: Number(incMatch[1]) });
      continue;
    }

    const lateMatch = segment.match(/^\+late_reply_count$/);
    if (lateMatch) {
      effects.push({ type: 'FLAG_INC', key: 'late_reply_count', delta: 1 });
      continue;
    }

    const keyMatch = segment.match(/^KEY:(H[1-5]):([a-zA-Z0-9_]+)$/);
    if (keyMatch) {
      effects.push({ type: 'KEY_CHOICE', heroine: keyMatch[1], choiceId: keyMatch[2] });
      continue;
    }
  }

  // 4. 신표기법 메타 박기
  if (toneMeta.tone) choice.tone = toneMeta.tone;
  if (toneMeta.isKey) choice.isKey = true;
  if (toneMeta.descriptor) choice.descriptor = toneMeta.descriptor;
  if (toneMeta.mechanism) choice.mechanism = toneMeta.mechanism;
  if (toneMeta.coFireNpcs && toneMeta.coFireNpcs.length > 0) {
    choice.coFireNpcs = toneMeta.coFireNpcs;
  }

  if (effects.length > 0) choice.effects = effects;
  return choice;
}

function skipUntil(lines: string[], start: number, re: RegExp): number {
  let i = start;
  while (i < lines.length && !re.test(lines[i].trim())) i++;
  return i + 1;
}

function skipIfBlock(lines: string[], start: number): number {
  let i = start + 1;
  let depth = 1;
  while (i < lines.length && depth > 0) {
    const t = lines[i].trim();
    if (RE_IF.test(t)) depth++;
    else if (RE_IF_END.test(t)) depth--;
    i++;
  }
  return i;
}

// ─── 메인 ─────────────────────────────────────────────────────────

function main(): void {
  const stats: CompileStats = {
    files: 0,
    scenes: 0,
    unknownDirectives: new Set(),
    warnings: [],
  };

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const allScenes: SceneOut[] = [];
  for (const dir of SCENARIO_DIRS) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const scenes = compileFile(filePath, stats);
      stats.files++;
      stats.scenes += scenes.length;
      allScenes.push(...scenes);
    }
  }

  // 중복 ID 검사
  const ids = new Set<string>();
  const dups: string[] = [];
  for (const s of allScenes) {
    if (ids.has(s.id)) dups.push(s.id);
    ids.add(s.id);
  }
  if (dups.length > 0) {
    console.error(`✗ 중복 씬 ID: ${dups.join(', ')}`);
    process.exit(1);
  }

  // JSON 파일 출력 (per-scene)
  for (const s of allScenes) {
    writeFileSync(path.join(OUT_DIR, `${s.id}.scene.json`), JSON.stringify(s, null, 2), 'utf8');
  }

  // 매니페스트 (id → 파일 경로)
  const manifest = allScenes.map((s) => ({ id: s.id, file: `${s.id}.scene.json`, commandCount: s.commands.length }));
  writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2), 'utf8');

  // 보고
  console.log(`✓ ${stats.files}개 .md 파일 → ${stats.scenes}개 씬 컴파일`);
  console.log(`  출력: ${OUT_DIR}`);
  if (stats.unknownDirectives.size > 0) {
    console.warn(`⚠ 알 수 없는 디렉티브 (NARRATION fallback 또는 무시):`);
    for (const d of stats.unknownDirectives) console.warn(`    ${d}`);
  }
  if (stats.warnings.length > 0) {
    console.warn(`⚠ ${stats.warnings.length}건 경고:`);
    for (const w of stats.warnings.slice(0, 20)) console.warn(`    ${w}`);
    if (stats.warnings.length > 20) console.warn(`    ... 외 ${stats.warnings.length - 20}건`);
  }
}

main();
