/**
 * 메인 게임 상태 — STATE-SCHEMA.md §2 정합 + ARCHITECTURE.md §5 정합.
 *
 * - Zustand persist 미들웨어로 자동저장 (key: kmu-vn-autosave)
 * - SceneRenderer + UI 컴포넌트가 useGameStore로 구독
 * - applyCommand는 부수효과 없는 상태 전이만. 음원 재생은 SceneRenderer가 호출
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AffinityTargetId,
  ChapterId,
  Choice,
  EndingId,
  GameFlags,
  HeroineId,
  HistoryEntry,
  SaveSlot,
  Scene,
  SceneCommand,
  SceneMeta,
} from '@/engine/types';
import { ScriptInterpreter } from '@/engine/scriptInterpreter';
import { toneToFlagIncs, toneToKeyChoice } from '@/engine/toneMatrix';
import { preloadSceneAssets } from '@/engine/assetPreloader';
import { nameToHeroineId } from '@/data/characters';
import { ENDING_SCENE_MAP, CHAPTER6_START_MAP } from '@/data/endings';
import { audioManager } from '@/engine/audioManager';
import type { SaveInput } from '@/engine/saveSlots';
import { useMetaStore } from '@/stores/metaStore';
import { resolveSpriteName } from '@/data/spriteResolver';

const HEROINE_KEYS = new Set<string>(['H1', 'H2', 'H3', 'H4', 'H5']);
function isHeroineKey(k: string): k is HeroineId {
  return HEROINE_KEYS.has(k);
}

const interpreter = new ScriptInterpreter();

// 같은 씬에서 step null 안전 가드가 반복 발동될 때 콘솔 경고를 1회로 throttle.
// 의도된 안전 가드(시나리오 끝에 명시적 [JUMP]/[ENDING] 없을 시 reseek)지만
// 자동 풀플레이/이상 흐름에서 누적 노이즈가 다른 실 경고를 가리는 문제를 회피.
const _stepNullWarnedScenes = new Set<string>();
// startScene 동시 호출 차단 mutex — 빠른 advance 연타로 JUMP cmd가 중복 step되거나
// safety reseek(0)이 옛 씬에서 다시 JUMP에 도달해 두 번째 startScene이 시작되는 race를 차단.
// 첫 호출이 진행 중일 때 들어온 추가 호출은 noop (의도된 다음 sceneId는 첫 호출과 동일하거나
// 이미 첫 호출 중에 처리되는 시나리오라 무시 안전).
let _startSceneInFlight = false;

// 사용자 입력(Space hold·연타 클릭)으로 인한 대사 과속 advance 차단.
// 시스템 자동 advance(BG/CHARACTER/BGM/FLAG/VIDEO onEnded 등)는 영향받지 않음 — userAdvance만 게이트.
const USER_ADVANCE_COOLDOWN_MS = 600;
let _lastUserAdvanceAt = 0;

const initialFlags = (): GameFlags => ({
  H1: 0,
  H2: 0,
  H3: 0,
  H4: 0,
  H5: 0,
  gyumin: 0,
  gyeongmin: 0,
  nathan: 0,
  wook: 0,
  junhyuk: 0,
  mom: 0,
  taeho: 0,
  late_reply_count: 0,
  last_increment_order: [],
  key_choices: { H1: [], H2: [], H3: [], H4: [], H5: [] },
  current_chapter: 'prologue',
  current_scene_id: '',
  visited_scenes: [],
  met_heroines: [],
  chapter_start_snapshot: null,
  prev_chapter_snapshot: null,
  flag_anatomy_first_done: false,
  flag_dongsan_visit_done: false,
  flag_seoyoon_first_meet: false,
  flag_first_kakao_serin: false,
  mode: 'main',
});

export type RuntimeMode =
  | 'idle'
  | 'scene'
  | 'choice'
  | 'kakao'
  | 'cg'
  | 'ending';

/**
 * 호감도 변동 이벤트 — AffectionToastStack이 큐로 구독.
 * prev/new를 함께 보존해 온도계 채움 애니메이션이 시작점·도착점을 알 수 있게 한다.
 * `consumed` 마킹 후 4초 지나면 GC.
 */
export interface AffectionEvent {
  id: string;
  /** 호감도 대상 — H1~H5 + 'friend' + 'mom'. 필드명은 호환 위해 heroine 유지. */
  heroine: AffinityTargetId;
  prevValue: number;
  newValue: number;
  delta: number;
  ts: number;
  consumed: boolean;
}

let _affectionEventCounter = 0;
function makeAffectionEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  _affectionEventCounter++;
  return `aff-${Date.now()}-${_affectionEventCounter}`;
}

const AFFECTION_QUEUE_MAX = 50;
const AFFECTION_GC_AGE_MS = 4000;

function pushAffectionEvent(
  events: AffectionEvent[],
  ev: AffectionEvent,
): AffectionEvent[] {
  const now = ev.ts;
  const cleaned = events.filter(
    (e) => !e.consumed || now - e.ts < AFFECTION_GC_AGE_MS,
  );
  const trimmed = cleaned.length >= AFFECTION_QUEUE_MAX
    ? cleaned.slice(cleaned.length - AFFECTION_QUEUE_MAX + 1)
    : cleaned;
  return [...trimmed, ev];
}

interface RuntimeState {
  flags: GameFlags;
  history: HistoryEntry[];

  currentSceneId: string;
  currentCommandIndex: number;
  currentCommand: SceneCommand | null;
  /** 현재 화면에 띄워진 텍스트 명령의 인덱스 (DIALOGUE/MONOLOGUE/NARRATION). 없으면 null. */
  currentTextCommandIndex: number | null;
  /** 텍스트 명령 인덱스 스택 — 최대 5단계까지 ←로 되돌릴 수 있게 보존. */
  textCommandStack: number[];
  /**
   * @deprecated 한 라운드 호환용. AffectionToastStack 도입 후에는 affectionEvents를 사용.
   * 다음 라운드에서 제거 예정. 기존 AffectionToast.tsx만 본 필드를 구독.
   */
  lastAffectionChange: { heroine: HeroineId; delta: number; ts: number } | null;
  /**
   * 호감도 변동 큐 — AffectionToastStack이 구독해 풍성/미니 분기 + 묶음 표시.
   * persist에서 제외(휘발성). FLAG_INC 적용 시 push, Stack consume 마킹 후 GC.
   */
  affectionEvents: AffectionEvent[];
  /** 챕터 전환 페이드 opacity (0~1). 0 = 투명, 1 = 검정 가림. ChapterFader가 직접 사용. */
  chapterFadeOpacity: number;
  /**
   * 챕터 경계에서 fade-out 완료 후 사용자 "다음 챕터 시작하기" 클릭 대기 상태.
   * true일 때 ChapterStartPrompt가 검정 화면 위에 버튼 노출.
   * E2E 환경(navigator.webdriver / ?scene= / ?flags=)에서는 startScene이 자동 통과.
   */
  awaitingChapterAdvance: boolean;
  /** ChapterStartPrompt 클릭 시 호출할 resolve 함수 보관 (휘발성, persist 제외). */
  _chapterAdvanceResolve: (() => void) | null;
  runtimeMode: RuntimeMode;
  pendingEnding: EndingId | null;

  // 시각 상태 (UI 레이어)
  bg: { image: string | null };
  characters: Record<string, { sprite: string; position: 'left' | 'center' | 'right' }>;
  cg: { image: string; cgId: string } | null;

  // 백로그 일시 닫기 등
  isBacklogOpen: boolean;
  isPauseMenuOpen: boolean;
  isGalleryOpen: boolean;
  /** SaveLoadScreen 모드 — 'save'/'load'면 화면 노출, null이면 닫힘 (휘발성, persist 제외). */
  saveLoadMode: 'save' | 'load' | null;
  /** SettingsScreen 노출 여부 (휘발성, persist 제외). */
  isSettingsOpen: boolean;
}

interface Actions {
  startScene: (sceneId: string) => Promise<void>;
  advance: () => Promise<void>;
  /** 사용자 입력(Space/Enter/클릭) 경로 전용 — 마지막 호출 후 USER_ADVANCE_COOLDOWN_MS 미만은 noop. */
  userAdvance: () => void;
  rewindOne: () => Promise<void>;
  pickChoice: (choiceIndex: number) => Promise<void>;
  closeKakao: () => Promise<void>;
  applyCommand: (cmd: SceneCommand) => void;
  appendHistory: (entry: HistoryEntry) => void;
  resetForNewGame: () => void;

  setBacklogOpen: (open: boolean) => void;
  setPauseMenuOpen: (open: boolean) => void;
  setGalleryOpen: (open: boolean) => void;
  setSaveLoadOpen: (mode: 'save' | 'load' | null) => void;
  setSettingsOpen: (open: boolean) => void;

  /** 현재 게임 상태를 SaveInput으로 직렬화 (saveSlots.saveSlot 호출자 측에서 사용). */
  takeSnapshot: () => SaveInput;
  /** SaveSlot 데이터로 현재 게임 상태 복원 — interpreter 시킹 + BGM 트랙 분기 포함. */
  applySnapshot: (slot: SaveSlot) => Promise<void>;

  /** AffectionToastStack이 묶음 디큐 시점에 호출 — 표시 시작한 이벤트 id들을 consumed=true로. */
  markAffectionEventsConsumed: (ids: string[]) => void;
  /** consumed && 4초 경과 항목 제거. 풍성 토스트 unmount 후 호출 권장. */
  pruneAffectionEvents: () => void;

  /** ChapterStartPrompt 버튼이 호출. 보관된 resolve 실행 + state clear → startScene 흐름 재개. */
  confirmChapterAdvance: () => void;
}

type GameState = RuntimeState & Actions;

const initialRuntime = (): RuntimeState => ({
  flags: initialFlags(),
  history: [],
  currentSceneId: '',
  currentCommandIndex: 0,
  currentCommand: null,
  currentTextCommandIndex: null,
  textCommandStack: [],
  lastAffectionChange: null,
  affectionEvents: [],
  chapterFadeOpacity: 0,
  awaitingChapterAdvance: false,
  _chapterAdvanceResolve: null,
  runtimeMode: 'idle',
  pendingEnding: null,
  bg: { image: null },
  characters: {},
  cg: null,
  isBacklogOpen: false,
  isPauseMenuOpen: false,
  isGalleryOpen: false,
  saveLoadMode: null,
  isSettingsOpen: false,
});

function applyEffects(state: RuntimeState, effects: SceneCommand[] | undefined): RuntimeState {
  if (!effects) return state;
  let next = state;
  for (const cmd of effects) {
    next = applyOne(next, cmd);
  }
  return next;
}

/**
 * 선택지 픽 시 적용. 옛 표기법(effects 안의 FLAG_INC/KEY_CHOICE)과
 * 신 톤 매트릭스(choice.tone)가 공존 가능. Step 3 마이그레이션 중간 단계 동안 둘 다 적용.
 *
 * activeHeroines 필터 (2026-05-08): SceneMeta.activeHeroines 있으면 그 명단의 H에만 톤 매트릭스 결과 적용.
 * 미박이거나 빈 배열이면 fallback으로 5명 모두 적용(점진 마이그레이션, 기존 시나리오 무영향).
 * late_reply_count는 H4 미니게임 시스템 결과라 active 필터 무관.
 */
function applyChoiceEffects(
  state: RuntimeState,
  choice: Choice,
  sceneMeta?: SceneMeta,
): RuntimeState {
  let next = applyEffects(state, choice.effects);

  // ── tone·effects 미박 fallback (2026-05-08 사용자 결정) ──
  // 분기만 결정하는 선택지에서도 토스트가 끊기지 않도록 active 대상에 +3~+10 랜덤 가산.
  // 룰 (사용자 정정): H 변동 있는 선택지엔 NPC 미발동. H 0명일 때만 NPC 1명 발동.
  // → H가 active면 H 모두에 가산, H 없고 NPC만 active면 NPC 1명 랜덤.
  const hasNoEffects = !choice.effects || choice.effects.length === 0;
  if (!choice.tone && hasNoEffects) {
    const active = sceneMeta?.activeHeroines;
    if (active && active.length > 0) {
      const heroineActive = active.filter((t) => isHeroineKey(t));
      const npcActive = active.filter((t) => !isHeroineKey(t));
      if (heroineActive.length > 0) {
        // H 있으면 H에만 가산 (NPC 미발동 — H 변동이 호감도 토스트 책임짐)
        for (const target of heroineActive) {
          const delta = 3 + Math.floor(Math.random() * 8);
          next = applyOne(next, { type: 'FLAG_INC', key: target, delta });
        }
      } else if (npcActive.length > 0) {
        // H 없고 NPC만 → 그중 1명 랜덤 선택. NPC 폭 큰 룰(2026-05-08) 정합 — +15~+25 랜덤.
        const picked = npcActive[Math.floor(Math.random() * npcActive.length)];
        const delta = 15 + Math.floor(Math.random() * 11); // 15~25
        next = applyOne(next, { type: 'FLAG_INC', key: picked, delta });
      }
    }
  }

  if (choice.tone) {
    const toneCmds = toneToFlagIncs(choice, sceneMeta);
    const active = sceneMeta?.activeHeroines;
    const isActiveFiltered = active !== undefined && active.length > 0;

    // coFire 목록 결정 (2026-05-11): 옵션별 override → 씬 단위 → 빈 배열 순.
    // coFire 등록된 NPC는 1-NPC drop 룰 우회 (H 변동과 함께 적용).
    const coFireSet = new Set<string>(
      choice.coFireNpcs ?? sceneMeta?.coFireNpcs ?? [],
    );

    // 1단계: H1~H5는 active 필터 통과한 것만, NPC는 coFire 여부로 분리.
    type FlagIncCmd = Extract<SceneCommand, { type: 'FLAG_INC' }>;
    const heroineCmds: FlagIncCmd[] = [];
    const coFireNpcCmds: FlagIncCmd[] = [];
    const npcCmds: FlagIncCmd[] = [];
    const otherCmds: SceneCommand[] = [];
    for (const c of toneCmds) {
      if (c.type !== 'FLAG_INC') {
        otherCmds.push(c);
        continue;
      }
      if (c.key === 'late_reply_count') {
        otherCmds.push(c);
        continue;
      }
      if (isHeroineKey(c.key)) {
        if (isActiveFiltered && !active!.includes(c.key)) continue;
        if (c.delta !== 0) heroineCmds.push(c);
      } else if (coFireSet.has(c.key)) {
        // coFire 등록 NPC는 항상 적용 (H drop·1-NPC drop 룰 둘 다 우회)
        if (c.delta !== 0) coFireNpcCmds.push(c);
      } else {
        if (c.delta !== 0) npcCmds.push(c);
      }
    }

    // 2단계: 일반 NPC는 H 변동이 1명 이상이면 모두 drop. H 0명일 때만 |delta| 최대 1명 통과.
    // coFire NPC는 별도 버킷이라 본 룰의 영향 없음.
    // (사용자 결정 2026-05-08: NPC 호감도는 "선택이 어떤 호감도도 못 만드는 상황 방지" 보조용.
    //  H 변동이 있으면 토스트가 이미 발생 → 일반 NPC 추가 미필요.)
    // active에 NPC가 명시돼있으면 그 NPC들만 후보로 좁힘 (작가 의도 = mom/taeho 같은 명시 우선).
    //
    // 2026-05-11: coFire 명시 (Choice 또는 SceneMeta) 시 1-NPC 픽 자체를 비활성화.
    // 작가가 명시적으로 NPC 라우팅을 컨트롤하는 신호 → 의도하지 않은 다른 NPC 가산 차단.
    // (예: ch01_05_cafe 옵션 B는 gyumin -30 effects만 박혔는데, 1-NPC 픽이 gyumin 톤 +45를
    //  추가로 발동시키면 순 +15가 되어 의도(gyumin 대폭 down) 어긋남.)
    const hasExplicitCoFire =
      choice.coFireNpcs !== undefined || sceneMeta?.coFireNpcs !== undefined;
    let pickedNpc: FlagIncCmd | null = null;
    if (!hasExplicitCoFire && heroineCmds.length === 0 && npcCmds.length > 0) {
      const activeNpcSet =
        isActiveFiltered
          ? new Set(active!.filter((t) => !isHeroineKey(t)))
          : null;
      const candidates = activeNpcSet && activeNpcSet.size > 0
        ? npcCmds.filter((c) => activeNpcSet.has(c.key as Exclude<AffinityTargetId, HeroineId>))
        : npcCmds;
      for (const c of candidates) {
        if (!pickedNpc || Math.abs(c.delta) > Math.abs(pickedNpc.delta)) {
          pickedNpc = c;
        }
      }
    }

    const filtered: SceneCommand[] = [
      ...otherCmds,
      ...heroineCmds,
      ...coFireNpcCmds,
      ...(pickedNpc ? [pickedNpc] : []),
    ];

    for (const cmd of filtered) {
      next = applyOne(next, cmd);
    }
    const keyCmd = toneToKeyChoice(choice, next.currentSceneId, sceneMeta);
    if (
      keyCmd &&
      (!isActiveFiltered ||
        keyCmd.type !== 'KEY_CHOICE' ||
        active!.includes(keyCmd.heroine))
    ) {
      next = applyOne(next, keyCmd);
    }

    // 토스트는 한 CHOICE의 가장 큰 양수 delta 히로인 1명만 표시 (5개 H 동시 갱신 시 H5로 덮어쓰는 버그 수정)
    let topInc: { heroine: HeroineId; delta: number } | null = null;
    for (const cmd of filtered) {
      if (cmd.type !== 'FLAG_INC' || cmd.key === 'late_reply_count') continue;
      if (cmd.delta <= 0) continue;
      if (!topInc || cmd.delta > topInc.delta) {
        topInc = { heroine: cmd.key as HeroineId, delta: cmd.delta };
      }
    }
    if (topInc) {
      next = {
        ...next,
        lastAffectionChange: { heroine: topInc.heroine, delta: topInc.delta, ts: Date.now() },
      };
    }
  }

  return next;
}

/**
 * E2E 자동화 환경 감지 (Playwright `navigator.webdriver` / `?scene=` / `?flags=`).
 * 챕터 경계 "다음 챕터 시작하기" 대기를 자동 통과시켜 helpers.autoAdvanceUntilEnding 호환.
 */
function isE2eEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof navigator !== 'undefined' && navigator.webdriver) return true;
  const params = new URLSearchParams(window.location.search);
  return params.has('scene') || params.has('flags');
}

/**
 * H1~H5 + 7 NPC의 현재 호감도값을 Record로 추출 — chapter_start_snapshot 갱신용.
 * (2026-05-08 추가, ChapterTransitionRecap이 변화량 비교 시 사용.)
 */
function pickAffinityValues(flags: GameFlags): Record<AffinityTargetId, number> {
  return {
    H1: flags.H1, H2: flags.H2, H3: flags.H3, H4: flags.H4, H5: flags.H5,
    gyumin: flags.gyumin,
    gyeongmin: flags.gyeongmin,
    nathan: flags.nathan,
    wook: flags.wook,
    junhyuk: flags.junhyuk,
    mom: flags.mom,
    taeho: flags.taeho,
  };
}

/**
 * 씬 ID에서 챕터 prefix 추출. 챕터 경계 감지에 사용.
 * `prologue_01_home` → `prologue`, `ch01_03_kakao_evening` → `ch01`,
 * `ch06_h1_true` → `ch06`, `end_solo_summer_main` → `end`.
 */
function chapterPrefix(sceneId: string): string {
  if (sceneId.startsWith('prologue')) return 'prologue';
  if (sceneId.startsWith('end_')) return 'end';
  const m = sceneId.match(/^(ch\d+)/);
  return m ? m[1] : sceneId;
}

/**
 * 챕터 진입 시 ChapterStartPrompt에 표시할 한글 제목.
 * route-common.md / route-H{1~5}-*.md의 챕터 헤더 정합.
 * Ch.6는 분기별로 히로인 이름이 다르므로 sceneId 두 번째 segment(`h1~h5`)까지 본다.
 */
export function chapterTitle(sceneId: string): string {
  if (sceneId.startsWith('prologue')) return '프롤로그';
  if (sceneId.startsWith('end_solo_summer')) return '에필로그 — 혼자 여름방학';
  if (sceneId.startsWith('end_')) return '에필로그';
  if (sceneId.startsWith('ch01')) return 'Chapter 1 — OT의 봄';
  if (sceneId.startsWith('ch02')) return 'Chapter 2 — 카데바';
  if (sceneId.startsWith('ch03')) return 'Chapter 3 — 동산';
  if (sceneId.startsWith('ch04')) return 'Chapter 4 — 도서관';
  if (sceneId.startsWith('ch05')) return 'Chapter 5 — 5월의 분기';
  if (sceneId.startsWith('ch06_h1')) return 'Chapter 6 — 차세린 분기';
  if (sceneId.startsWith('ch06_h2')) return 'Chapter 6 — 윤하정 분기';
  if (sceneId.startsWith('ch06_h3')) return 'Chapter 6 — 한설 분기';
  if (sceneId.startsWith('ch06_h4')) return 'Chapter 6 — 나서윤 분기';
  if (sceneId.startsWith('ch06_h5')) return 'Chapter 6 — 장윤영 분기';
  if (sceneId.startsWith('ch06')) return 'Chapter 6';
  return chapterPrefix(sceneId);
}

function applyOne(state: RuntimeState, cmd: SceneCommand): RuntimeState {
  switch (cmd.type) {
    case 'FLAG_INC': {
      const flags = { ...state.flags };
      let lastAffection = state.lastAffectionChange;
      let affectionEvents = state.affectionEvents;
      if (cmd.key === 'late_reply_count') {
        flags.late_reply_count += cmd.delta;
      } else {
        // H1~H5 + 'friend' + 'mom' — 음수만 방지(0 floor), 상한은 해제 (2026-05-09 PM 결정).
        // 누적값을 그대로 결과 화면 라벨/점수에 노출 (예: H5 시뮬 +125). 트루 임계 ≥80 등 분기는 100 초과해도 통과.
        const target = cmd.key as AffinityTargetId;
        const prev = flags[target];
        const next = Math.max(0, prev + cmd.delta);
        flags[target] = next;
        // last_increment_order는 엔딩 동률 결정용 — H1~H5만 추적, NPC 제외.
        if (cmd.delta > 0 && isHeroineKey(target)) {
          flags.last_increment_order = [
            ...flags.last_increment_order.filter((h) => h !== target),
            target,
          ];
        }
        // FLAG_INC면 토스트 트리거 (delta 0만 제외).
        // clamp로 prev===next인 경우(이미 100/0 도달)도 push — 사용자가 "선택지 정답 골랐는데 토스트 안 뜬다"고
        // 인식하던 후반부 회귀 처방. 액체 채움은 prev===next라 정지하지만 변화량 숫자(+10 등)는
        // 그대로 표시되어 정답 신호 보존. (2026-05-08 라운드, 외부 피드백 검증.)
        if (cmd.delta !== 0) {
          const ts = Date.now();
          // lastAffectionChange는 deprecated 호환 — H 만 기록.
          if (isHeroineKey(target)) {
            lastAffection = { heroine: target, delta: cmd.delta, ts };
          }
          affectionEvents = pushAffectionEvent(affectionEvents, {
            id: makeAffectionEventId(),
            heroine: target,
            prevValue: prev,
            newValue: next,
            delta: cmd.delta,
            ts,
            consumed: false,
          });
        }
      }
      return { ...state, flags, lastAffectionChange: lastAffection, affectionEvents };
    }
    case 'FLAG_SET': {
      return {
        ...state,
        flags: { ...state.flags, [cmd.key]: cmd.value as never },
      };
    }
    case 'KEY_CHOICE': {
      const flags = { ...state.flags };
      const list = flags.key_choices[cmd.heroine];
      if (!list.includes(cmd.choiceId)) {
        flags.key_choices = {
          ...flags.key_choices,
          [cmd.heroine]: [...list, cmd.choiceId],
        };
      }
      return { ...state, flags };
    }
    default:
      return state;
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialRuntime(),

      async startScene(sceneId: string) {
        // mutex: 첫 호출이 진행 중이면 noop. 빠른 클릭 연타로 advance 안의 await get().startScene이
        // 중첩 호출되거나, safety reseek(0)이 옛 씬에서 다시 JUMP에 도달해 두 번째 호출이 시작되는
        // race를 차단. (2026-05-09 회상 안 뜨는 회귀 처방.)
        if (_startSceneInFlight) return;
        _startSceneInFlight = true;
        try {
        const prevSceneId = get().currentSceneId;
        const oldChapter = chapterPrefix(prevSceneId);
        const newChapter = chapterPrefix(sceneId);
        const isFirstBoot = prevSceneId === '';
        const isChapterChange = oldChapter !== newChapter;
        // isChapterBoundary는 fade/Recap 노출용 — 첫 부팅 제외 (OP 영상 + ModeSelect 통과 후 prologue 시작은 boundary 아님)
        const isChapterBoundary = !isFirstBoot && isChapterChange;

        // 챕터 prefix 변경 시(첫 부팅 포함) 스냅샷 갱신 — prev에 직전 챕터 시작값을 담고
        // 새 chapter_start_snapshot에는 이번 챕터 시작 시점값을 담는다. ChapterTransitionRecap이
        // (prev_chapter_snapshot.values → 현재 flags 값) 차이로 회상 그래픽 그림.
        if (isChapterChange) {
          set((s) => ({
            flags: {
              ...s.flags,
              prev_chapter_snapshot: isFirstBoot ? null : s.flags.chapter_start_snapshot,
              chapter_start_snapshot: {
                chapter: newChapter as ChapterId,
                values: pickAffinityValues(s.flags),
              },
            },
          }));
        }

        if (isChapterBoundary) {
          // 단계별 fade-out (32 step × 50ms = 1.6s)
          for (let i = 1; i <= 32; i++) {
            set({ chapterFadeOpacity: i / 32 });
            await new Promise((r) => setTimeout(r, 50));
          }
        }

        const scene: Scene = await interpreter.loadScene(sceneId);
        preloadSceneAssets(scene.commands);
        // 새 씬 진입 시 텍스트 인덱스 스택 reset — 이전 씬 인덱스로 새 씬을 잘못 seek하는 rewind 버그 방지
        set((s) => ({
          ...s,
          currentSceneId: scene.id,
          currentCommandIndex: 0,
          currentCommand: null,
          runtimeMode: 'scene',
          textCommandStack: [],
          currentTextCommandIndex: null,
          flags: {
            ...s.flags,
            current_scene_id: scene.id,
            visited_scenes: s.flags.visited_scenes.includes(scene.id)
              ? s.flags.visited_scenes
              : [...s.flags.visited_scenes, scene.id],
          },
        }));

        if (isChapterBoundary) {
          // fade-out 완료 + 새 씬 로드 후, 사용자 "다음 챕터 시작하기" 클릭 대기
          // (E2E 환경은 자동 통과 — Playwright autoAdvance/expectEnding 호환)
          if (!isE2eEnvironment()) {
            await new Promise<void>((resolve) => {
              set({ awaitingChapterAdvance: true, _chapterAdvanceResolve: resolve });
            });
            set({ awaitingChapterAdvance: false, _chapterAdvanceResolve: null });
          }
          // 첫 advance를 fade-in 시작 직전에 호출 — BG/CHARACTER 등 시각 명령이 fade-in과 동시에 디졸브되어 자연스러운 전환
          await get().advance();
          for (let i = 31; i >= 0; i--) {
            set({ chapterFadeOpacity: i / 32 });
            await new Promise((r) => setTimeout(r, 50));
          }
        } else {
          // 2026-05-09 PM 진단 라운드 — 첫 부팅 페이드인은 App.tsx로 이전(dev HMR 인스턴스 분리 회피).
          // store 안의 set이 컴포넌트 selector 인스턴스와 분리되어 미반영되던 회귀 처방.
          await get().advance();
        }
        } finally {
          _startSceneInFlight = false;
        }
      },

      async advance() {
        const cmd = interpreter.step();
        if (!cmd) {
          // 씬 끝 도달 — 안전 가드: 현재 씬에 commands가 있는데 인덱스가 범위 밖인 경우 (옛 saved data 등)
          // 첫 명령부터 다시 진행하여 멈춤 회피.
          const scene = interpreter.currentScene();
          if (scene && scene.commands.length > 0) {
            // 같은 씬에서 반복 발동 시 첫 1회만 콘솔 경고 (자동 풀플레이/이상 시나리오에서 노이즈 누적 방지).
            if (!_stepNullWarnedScenes.has(scene.id)) {
              _stepNullWarnedScenes.add(scene.id);
              // eslint-disable-next-line no-console
              console.warn(`[advance] step null at scene "${scene.id}" — re-seeking to 0 for safety`);
            }
            interpreter.seek(0);
            const retry = interpreter.step();
            if (retry) {
              get().applyCommand(retry);
              return;
            }
          }
          set({ runtimeMode: 'idle', currentCommand: null });
          return;
        }
        // JUMP는 비동기 씬 로드를 즉시 await — applyCommand의 fire-and-forget 경로 우회.
        // 그렇지 않으면 startScene 완료(~100~200ms) 전에 다음 advance가 호출되어 옛 씬 cmd[length+]에서
        // step null → 안전 가드 reseek(0) 사이클이 발생. 자동 풀플레이/연속 advance 호출 시 BG/CHARACTER/
        // FLAG_INC 등이 6배 누적되는 회귀(2026-05-08 발견).
        if (cmd.type === 'JUMP') {
          await get().startScene(cmd.sceneId);
          return;
        }
        get().applyCommand(cmd);
      },

      userAdvance() {
        const now = performance.now();
        if (now - _lastUserAdvanceAt < USER_ADVANCE_COOLDOWN_MS) return;
        _lastUserAdvanceAt = now;
        void get().advance();
      },

      /**
       * 직전 텍스트 명령으로 되돌림. 스택에 보존된 최대 10단계까지 연속 호출 가능.
       * scene 모드에서만 작동. KAKAO/CHOICE/ENDING/CG 모드에서는 noop.
       * target 인덱스가 현재 씬 범위 밖이면 stack 정리 후 noop (안전 가드).
       */
      async rewindOne() {
        const s = get();
        if (s.runtimeMode !== 'scene' || s.textCommandStack.length === 0) return;
        const scene = interpreter.currentScene();
        const target = s.textCommandStack[s.textCommandStack.length - 1];
        if (!scene || target < 0 || target >= scene.commands.length) {
          // 스택에 다른 씬 인덱스 남은 경우 — 정리하고 noop
          set({ textCommandStack: [], currentTextCommandIndex: null });
          return;
        }
        set((cur) => ({
          ...cur,
          history: cur.history.slice(0, Math.max(0, cur.history.length - 2)),
          textCommandStack: cur.textCommandStack.slice(0, -1),
          currentTextCommandIndex: null,
        }));
        interpreter.seek(target);
        await get().advance();
      },

      async pickChoice(choiceIndex: number) {
        const cmd = get().currentCommand;
        // 일반 CHOICE 또는 KAKAO 임베드 choices(2026-05-08 카톡 미니게임 재설계).
        let choice: Choice | undefined;
        if (cmd?.type === 'CHOICE') {
          choice = cmd.choices[choiceIndex];
        } else if (cmd?.type === 'KAKAO' && cmd.choices) {
          choice = cmd.choices[choiceIndex];
        }
        if (!choice) return;

        const sceneMeta = interpreter.currentScene()?.meta;
        const pickedChoice = choice;
        set((s) => applyChoiceEffects(s, pickedChoice, sceneMeta));

        if (pickedChoice.next) {
          await get().startScene(pickedChoice.next);
        } else {
          set({ currentCommand: null, runtimeMode: 'scene' });
          await get().advance();
        }
      },

      async closeKakao() {
        const cmd = get().currentCommand;
        if (!cmd || cmd.type !== 'KAKAO') return;
        set({ currentCommand: null, runtimeMode: 'scene' });
        await get().advance();
      },

      applyCommand(cmd: SceneCommand) {
        // EVALUATE_BRANCH/EVALUATE_TIER가 결정한 다음 씬 ID. 비-null이면 set 후 startScene 트리거.
        let evaluateJumpTarget: string | null = null;
        set((s) => {
          let next: RuntimeState = { ...s, currentCommand: cmd, currentCommandIndex: interpreter.currentIndex() };

          switch (cmd.type) {
            case 'BG':
              // BG ID 변경 시 캐릭터 자동 클리어 — 장면 전환 = 캐릭터 동선 리셋
              // (대규모 동선 재설계 라운드 2026-05-08, PM 결정 옵션 A 엔진 fix 우선).
              // 의도된 보존 케이스(같은 캐릭터 새 BG에 그대로 등장)는 시나리오에서 BG 직후 [CHARACTER] 다시 명시.
              // 같은 BG ID 또는 black/white 단색 폴백 시는 캐릭터 유지 (페이드 효과·연출 정합).
              if (next.bg.image !== cmd.image && cmd.image !== 'black' && cmd.image !== 'white') {
                next = { ...next, bg: { image: cmd.image }, characters: {} };
              } else {
                next = { ...next, bg: { image: cmd.image } };
              }
              break;
            case 'CHARACTER': {
              // 첫 [CHARACTER] 등장 추적 — 한글 또는 영문 슬러그 id를 HeroineId로 역매핑.
              // (2026-05-08) 메뉴 호감도 패널 잠금(?) 표시 + "만난 적 없는데 호감도 변함" 인상 차단.
              const hid = nameToHeroineId(cmd.id);
              const metHeroines = hid && !next.flags.met_heroines.includes(hid)
                ? [...next.flags.met_heroines, hid]
                : next.flags.met_heroines;
              next = {
                ...next,
                characters: {
                  ...next.characters,
                  [cmd.id]: { sprite: cmd.sprite, position: cmd.position },
                },
                flags:
                  metHeroines === next.flags.met_heroines
                    ? next.flags
                    : { ...next.flags, met_heroines: metHeroines },
              };
              break;
            }
            case 'CHARACTER_HIDE': {
              const { [cmd.id]: _removed, ...rest } = next.characters;
              void _removed;
              next = { ...next, characters: rest };
              break;
            }
            case 'CG':
              next = { ...next, cg: { image: cmd.image, cgId: cmd.cgId }, runtimeMode: 'cg' };
              break;
            case 'CG_HIDE':
              next = { ...next, cg: null, runtimeMode: 'scene' };
              break;
            case 'VIDEO':
              // 직전 CG가 runtimeMode='cg'로 둔 상태에서 VIDEO를 만나면 SceneRenderer가
              // VideoLayer를 마운트 안 해 영상이 silent skip 됨(ch02_04_seol_recover에서 발견).
              // VIDEO는 항상 풀스크린 모달이므로 runtime을 'scene'으로 복구해 마운트 보장.
              // cg 상태는 유지 — 영상 종료 후 CGOverlay가 다시 보이도록.
              next = { ...next, runtimeMode: 'scene' };
              break;
            case 'DIALOGUE':
            case 'MONOLOGUE':
            case 'NARRATION': {
              const entry: HistoryEntry = {
                speaker: cmd.type === 'NARRATION' ? '' : cmd.speaker,
                text: cmd.text,
                type:
                  cmd.type === 'DIALOGUE'
                    ? 'dialogue'
                    : cmd.type === 'MONOLOGUE'
                      ? 'monologue'
                      : 'narration',
                sceneId: next.currentSceneId,
                timestamp: Date.now(),
              };
              // 텍스트 명령 인덱스 스택에 push (최대 10단계 ←)
              const justAppliedIndex = interpreter.currentIndex() - 1;
              const nextStack = next.currentTextCommandIndex !== null
                ? [...next.textCommandStack, next.currentTextCommandIndex].slice(-10)
                : next.textCommandStack;
              next = {
                ...next,
                history: [...next.history.slice(-99), entry],
                runtimeMode: 'scene',
                textCommandStack: nextStack,
                currentTextCommandIndex: justAppliedIndex,
              };
              break;
            }
            case 'CHOICE':
              next = { ...next, runtimeMode: 'choice' };
              break;
            case 'KAKAO':
              next = { ...next, runtimeMode: 'kakao' };
              break;
            case 'FLAG_SET':
            case 'FLAG_INC':
            case 'KEY_CHOICE':
              next = applyOne(next, cmd);
              break;
            case 'EVALUATE_BRANCH': {
              // 챕터 5 끝: 즉시 종결(REJECT/SOLO) 또는 챕터 6 본편 라우팅으로 분기.
              // 최종 EndingScreen 마운트는 엔딩 씬 말미의 ENDING 커맨드가 책임 — 여기선 runtimeMode 미변경.
              const route = interpreter.evaluateRoute(next.flags);
              if (route.kind === 'ending') {
                evaluateJumpTarget = ENDING_SCENE_MAP[route.endingId];
                next = { ...next, pendingEnding: route.endingId };
              } else {
                evaluateJumpTarget = CHAPTER6_START_MAP[route.winner];
              }
              break;
            }
            case 'EVALUATE_TIER': {
              // 챕터 6 끝: winner 기반 티어 결정 + 해당 엔딩 씬으로 점프.
              const endingId = interpreter.evaluateTier(cmd.winner, next.flags);
              evaluateJumpTarget = ENDING_SCENE_MAP[endingId];
              next = { ...next, pendingEnding: endingId };
              break;
            }
            case 'ENDING':
              next = { ...next, pendingEnding: cmd.endingId, runtimeMode: 'ending' };
              break;
            case 'JUMP':
              // 점프는 비동기 — 다음 tick에서 startScene 호출
              break;
            // BG/CHARACTER 외 음원·영상은 SceneRenderer 부수효과로 처리
            default:
              break;
          }

          return next;
        });

        // JUMP는 store 외부에서 sceneId 받아 다음 tick 처리
        if (cmd.type === 'JUMP') {
          void get().startScene(cmd.sceneId);
        } else if (evaluateJumpTarget) {
          void get().startScene(evaluateJumpTarget);
        }

        // 2026-05-10 캐릭터 이미지 갤러리 라운드 — [CHARACTER] 적용 시 metaStore에 sprite 해금 push.
        // applyCommand의 set 흐름과 분리해 zustand persist 충돌 회피 (set 콜백 종료 후 외부 호출).
        // 2026-05-10 후속 정정: cmd.sprite는 시나리오에서 'default' 같은 단순 표정으로 박히므로
        // resolveSpriteName으로 풀 파일명(`hajeong_default` 등)으로 변환 후 unlock 해야
        // SpriteGallery 카탈로그(풀 파일명 기준)와 매치됨.
        if (cmd.type === 'CHARACTER' && cmd.sprite) {
          const fullSpriteName = resolveSpriteName(cmd.id, cmd.sprite);
          if (fullSpriteName) {
            useMetaStore.getState().unlockSprite(fullSpriteName);
          }
        }
        // 2026-05-10 후속 — CG/BGM 갤러리도 자동 해금. 이전엔 metaStore 필드만 정의되고
        // 채워주는 코드가 없어 갤러리가 항상 비어 보임 (사용자 신고 "실제로 작동 안 함").
        if (cmd.type === 'CG' && cmd.cgId) {
          useMetaStore.getState().unlockCg(cmd.cgId);
        }
        if (cmd.type === 'BGM' && cmd.track) {
          useMetaStore.getState().unlockBgm(cmd.track);
        }
      },

      appendHistory(entry: HistoryEntry) {
        set((s) => ({ history: [...s.history.slice(-99), entry] }));
      },

      resetForNewGame() {
        set(initialRuntime());
      },

      setBacklogOpen(open) {
        set({ isBacklogOpen: open });
      },
      setPauseMenuOpen(open) {
        set({ isPauseMenuOpen: open });
      },
      setGalleryOpen(open) {
        set({ isGalleryOpen: open });
      },
      setSaveLoadOpen(mode) {
        set({ saveLoadMode: mode });
      },
      setSettingsOpen(open) {
        set({ isSettingsOpen: open });
      },

      takeSnapshot() {
        const s = get();
        const lastEntry = s.history.length > 0 ? s.history[s.history.length - 1] : null;
        // activeHeroine: met_heroines 마지막 항목(최근 등장한 H), 없으면 winner 후보 last_increment_order 마지막.
        const lastMet = s.flags.met_heroines.length > 0
          ? s.flags.met_heroines[s.flags.met_heroines.length - 1]
          : undefined;
        const lastInc = s.flags.last_increment_order.length > 0
          ? s.flags.last_increment_order[s.flags.last_increment_order.length - 1]
          : undefined;
        const activeHeroine = lastMet ?? lastInc;
        const chapter = chapterTitle(s.currentSceneId);
        return {
          flags: s.flags,
          history: s.history,
          currentSceneId: s.currentSceneId,
          currentCommandIndex: s.currentCommandIndex,
          audio: {
            bgmTrack: audioManager.currentBgmId(),
            // BGM 위치 복원은 트랙 처음부터 (PM 결정 2026-05-09). 항상 0.
            bgmTime: 0,
          },
          preview: {
            chapter,
            sceneTitle: chapter,
            timeInGame: new Date().toLocaleString('ko-KR', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            }),
            excerpt: lastEntry?.text ?? '',
            activeHeroine,
          },
          thumbnail: '',
        };
      },

      async applySnapshot(slot) {
        // 1) 인터프리터 씬 로드 + 인덱스 시킹
        const scene = await interpreter.loadScene(slot.currentSceneId);
        preloadSceneAssets(scene.commands);
        interpreter.seek(slot.currentCommandIndex);

        // 2) 게임 state 복원 — flags/history/현재 위치
        set((s) => ({
          ...s,
          flags: slot.flags,
          history: slot.history,
          currentSceneId: slot.currentSceneId,
          currentCommandIndex: slot.currentCommandIndex,
          currentCommand: null,
          currentTextCommandIndex: null,
          textCommandStack: [],
          runtimeMode: 'scene',
          // UI flag 초기화
          isPauseMenuOpen: false,
          isBacklogOpen: false,
          isGalleryOpen: false,
          saveLoadMode: null,
          isSettingsOpen: false,
          // 시각 레이어는 advance가 새로 그릴 것 — 깔끔하게 비움
          bg: { image: null },
          characters: {},
          cg: null,
          chapterFadeOpacity: 0,
          awaitingChapterAdvance: false,
          _chapterAdvanceResolve: null,
        }));

        // 3) BGM 동기화 — 같은 트랙이면 그대로 두고, 다르면 새로 재생.
        // bgmTime은 항상 0 (PM 결정) — 즉, 트랙은 처음부터 fade-in.
        const targetBgm = slot.audio.bgmTrack;
        const currentBgm = audioManager.currentBgmId();
        if (targetBgm && targetBgm !== currentBgm) {
          audioManager.playBgm(targetBgm, { fade: 3 });
        } else if (!targetBgm && currentBgm) {
          audioManager.stopBgm({ fade: 2 });
        }

        // 4) 첫 명령부터 진행 — 시각 레이어를 새로 그림
        await get().advance();
      },

      markAffectionEventsConsumed(ids: string[]) {
        if (ids.length === 0) return;
        const idSet = new Set(ids);
        set((s) => ({
          affectionEvents: s.affectionEvents.map((ev) =>
            idSet.has(ev.id) && !ev.consumed ? { ...ev, consumed: true } : ev,
          ),
        }));
      },

      pruneAffectionEvents() {
        const now = Date.now();
        set((s) => {
          const next = s.affectionEvents.filter(
            (ev) => !ev.consumed || now - ev.ts < AFFECTION_GC_AGE_MS,
          );
          return next.length === s.affectionEvents.length
            ? s
            : { affectionEvents: next };
        });
      },

      confirmChapterAdvance() {
        const resolve = get()._chapterAdvanceResolve;
        if (resolve) resolve();
      },
    }),
    {
      name: 'kmu-vn-autosave',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        flags: s.flags,
        history: s.history.slice(-50),
        currentSceneId: s.currentSceneId,
        currentCommandIndex: s.currentCommandIndex,
      }),
      // version 변경 시 zustand가 옛 saved data를 폐기하고 default state로 시작.
      // 시나리오 .scene.json 명령 순서/길이 변경 시 옛 currentCommandIndex와 어긋나 step null → 멈춤 발생 가능 → version bump로 강제 reset.
      // v3 (2026-05-08): GameFlags에 friend·mom 필드 추가 → 옛 saved state는 폐기.
      // v4 (2026-05-08): friend 통합 → 5명 분리(gyumin·gyeongmin·nathan·wook·junhyuk) + taeho 추가.
      // v5 (2026-05-08): met_heroines + chapter_start_snapshot + prev_chapter_snapshot 도입.
      //   부수효과로 사용자 환경에 누적된 호감도 saved data 정리 (요구 #1, #2의 백업 처방).
      version: 5,
    },
  ),
);

export { interpreter };
