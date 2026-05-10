/**
 * 06-engine/ARCHITECTURE.md §4 + SCENE-FORMAT.md §1.1·§2 SSoT 미러.
 *
 * W5 컴파일러(`scripts/md-to-scene.ts`)가 시나리오 .md → JSON 변환 시 본 타입을 산출한다.
 * 본 라운드(W4)에서는 더미 .scene.json만 직접 작성. 한글 SFX/BGM 큐 → 영문 ID 변환은 W5 컴파일러 책임.
 */

export type HeroineId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5';

export const HEROINE_IDS: readonly HeroineId[] = ['H1', 'H2', 'H3', 'H4', 'H5'] as const;

/**
 * NPC 호감도 (2026-05-08, 사용자 분리 결정).
 * - 친구 5명: gyumin(김규민)·gyeongmin(표경민)·nathan(조나단)·wook(정욱)·junhyuk(오준혁)
 * - 가족 1: mom(엄마)
 * - 교수 1: taeho(이태호 교수, 해부학)
 * 엔딩·KEY 시스템 무관 — 토스트 시각 만족 + 분위기 표현용.
 */
export type NpcAffinityId =
  | 'gyumin'
  | 'gyeongmin'
  | 'nathan'
  | 'wook'
  | 'junhyuk'
  | 'mom'
  | 'taeho';

export const NPC_AFFINITY_IDS: readonly NpcAffinityId[] = [
  'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk', 'mom', 'taeho',
] as const;

/** 호감도 대상 일반화 — H1~H5 + NPC 7. AffectionEvent.heroine·SceneMeta.activeHeroines 등에서 사용. */
export type AffinityTargetId = HeroineId | NpcAffinityId;
export const AFFINITY_TARGET_IDS: readonly AffinityTargetId[] = [
  'H1', 'H2', 'H3', 'H4', 'H5',
  'gyumin', 'gyeongmin', 'nathan', 'wook', 'junhyuk', 'mom', 'taeho',
] as const;

export type ChapterId =
  | 'prologue'
  | 'ch01'
  | 'ch02'
  | 'ch03'
  | 'ch04'
  | 'ch05'
  | 'ch06'
  | 'ending';

/** 16개 엔딩 ID — BRANCH-GRAPH.md §2 SSoT 미러 (END_SOLO_SUMMER 포함) */
export type EndingId =
  | 'END_H1_TRUE' | 'END_H1_HAPPY' | 'END_H1_NORMAL' | 'END_H1_BAD'
  | 'END_H2_TRUE' | 'END_H2_HAPPY' | 'END_H2_NORMAL' | 'END_H2_BAD'
  | 'END_H3_TRUE' | 'END_H3_HAPPY' | 'END_H3_NORMAL'
  | 'END_H4_TRUE' | 'END_H4_NORMAL' | 'END_H4_REJECT'
  | 'END_H5_TRUE'
  | 'END_SOLO_SUMMER';

export interface Affection {
  H1: number;
  H2: number;
  H3: number;
  H4: number;
  H5: number;
}

/**
 * 챕터 시작 시점 호감도 스냅샷 — 챕터 회상 그래픽(ChapterTransitionRecap)이
 * 직전 챕터의 변화량(delta)을 가시화하기 위해 startScene 챕터 경계 분기에서 갱신한다.
 * H1~H5 + NPC 7 모두 보관 (Recap에서 변화 있는 인물만 추려 표시).
 */
export interface ChapterAffinitySnapshot {
  chapter: ChapterId;
  values: Record<AffinityTargetId, number>;
}

/** STATE-SCHEMA.md §2 SSoT 미러 */
export interface GameFlags extends Affection {
  /** NPC 호감도 — 친구 5명 + 엄마 + 교수. 토스트 시각 만족 전용, 엔딩·KEY 시스템 무관 (2026-05-08 분리). */
  gyumin: number;
  gyeongmin: number;
  nathan: number;
  wook: number;
  junhyuk: number;
  mom: number;
  taeho: number;
  late_reply_count: number;
  last_increment_order: HeroineId[];
  key_choices: Record<HeroineId, string[]>;
  current_chapter: ChapterId;
  current_scene_id: string;
  visited_scenes: string[];
  /**
   * 첫 [CHARACTER] 명령으로 화면에 등장한 적 있는 히로인 ID 목록 (2026-05-08 추가).
   * 메뉴 호감도 패널 잠금(?) 표시 + 카톡만 등장한 케이스 분리에 사용.
   * applyCommand의 CHARACTER 분기에서 한글 id → HeroineId 역매핑(`characters.nameToHeroineId`) 후 push.
   */
  met_heroines: HeroineId[];
  /**
   * 현재 챕터 시작 시점 호감도 스냅샷. startScene 챕터 경계 분기에서 갱신.
   * 첫 부팅(prologue 진입)에선 prologue 시작값(모두 0)으로 초기화.
   */
  chapter_start_snapshot: ChapterAffinitySnapshot | null;
  /**
   * 직전 챕터 시작 시점 스냅샷 — ChapterTransitionRecap이 (prev_start → 현재값)으로 변화량을 표시.
   * 첫 챕터 경계(prologue → ch01)에서는 null (Recap 없이 ChapterStartPrompt fallback).
   */
  prev_chapter_snapshot: ChapterAffinitySnapshot | null;
  flag_anatomy_first_done: boolean;
  flag_dongsan_visit_done: boolean;
  flag_seoyoon_first_meet: boolean;
  flag_first_kakao_serin: boolean;
  mode: 'main' | 'female_pc';
  player_name?: string;
}

export type SpritePosition = 'left' | 'center' | 'right';
export type Transition = 'fade' | 'slide' | 'cut';

/**
 * 톤 태그 — CONVENTIONS.md §3.7 SSoT 미러.
 * 시나리오 작가는 선택지마다 본 5종 중 하나만 박는다. 점수는 toneMatrix.ts가 계산.
 */
export type ToneTag =
  | 'mature_serious'
  | 'warm_supportive'
  | 'direct_friendly'
  | 'playful_casual'
  | 'bright_forward';

export const TONE_TAGS: readonly ToneTag[] = [
  'mature_serious',
  'warm_supportive',
  'direct_friendly',
  'playful_casual',
  'bright_forward',
] as const;

/** H3 시간대 갭 마커 — `[SCENE: time=night]`로 박힌 경우 toneMatrix가 보정 */
export type SceneTime = 'day' | 'night';

/**
 * H4 전용 마커 — Choice.mechanism으로 박힘.
 * - `h4_reply_speed`: 카톡 답장 속도 미니게임 (현재는 KAKAO.affectionDecay 메커니즘으로 대체. 데이터 잔존은 무해)
 * - `h4_facing_key`: 대면 KEY 자리 마커 (warm_supportive 톤이 H3와 충돌하지 않도록 H4로 명시 라우팅)
 */
export type ChoiceMechanism = 'h4_reply_speed' | 'h4_facing_key';

export interface KakaoMessage {
  sender: 'yunmo' | HeroineId | string;
  text: string;
  delay?: number;
  typing?: boolean;
  /** 사진 메시지 — 박혀 있으면 텍스트 대신 이미지 버블로 렌더. 경로는 public 기준 (`/img/...`). */
  image?: string;
  /**
   * 메시지 등장 전 머뭇거림 시퀀스 — 메시지 단위 미세 조정.
   * 박힌 단계만 진행되고 0/undefined는 스킵. 1차 typing → 멈춤 → 2차 typing → 메시지.
   * KAKAO 명령의 `hesitate: true`는 명시 없는 메시지에 디폴트(1000/600/1000) 적용.
   */
  preTyping1?: number;
  prePause?: number;
  preTyping2?: number;
}

export interface FlagCondition {
  /** 화이트리스트 표현식. 안전 평가 전용. */
  expr: string;
}

/** 시나리오 작가가 박는 디렉티브가 컴파일된 결과. SCENE-FORMAT.md §1.1·§2 정합. */
export type SceneCommand =
  | { type: 'BG'; image: string; transition?: Transition; duration?: number }
  | { type: 'BGM'; track: string; volume?: number; fade?: number }
  | { type: 'BGM_STOP'; fade?: number }
  | { type: 'SFX'; sound: string; volume?: number; loop?: boolean }
  | {
      type: 'CHARACTER';
      id: string;
      sprite: string;
      position: SpritePosition;
      transition?: Transition;
    }
  | { type: 'CHARACTER_HIDE'; id: string; transition?: Transition }
  | {
      type: 'DIALOGUE';
      speaker: string;
      speakerId?: string;
      text: string;
      voice?: string;
    }
  | {
      type: 'MONOLOGUE';
      speaker: string;
      text: string;
      subtype?: 'normal' | 'perv_start' | 'self_aware' | 'recover';
    }
  | { type: 'NARRATION'; text: string }
  | { type: 'CHOICE'; choices: Choice[] }
  | { type: 'CG'; image: string; cgId: string; duration?: number }
  | { type: 'CG_HIDE' }
  | { type: 'VIDEO'; src: string }
  | {
      type: 'KAKAO';
      messages: KakaoMessage[];
      /** @deprecated 2026-05-08 — 카톡 미니게임 재설계로 affectionDecay로 대체. 잔존 .scene.json 호환 위해 유지. */
      replyTimerEnabled?: boolean;
      /** @deprecated 2026-05-08 — affectionDecay로 대체. */
      timerSeconds?: number;
      /**
       * 카톡 미니게임 — 메시지+선택지 동시 표시. 선택지 클릭 시 closeKakao로 자연 진행.
       * (2026-05-08 재설계: 기존 [KAKAO_TIMER]+[CHOICE_KAKAO] 분리 구조를 단일 KAKAO에 임베드)
       */
      choices?: Choice[];
      /**
       * 호감도 감소 메커니즘 — 메시지 자동 흐름 완료 시점부터 1초당 perSecond만큼 target 호감도 감소.
       * 사용자가 선택지 클릭 시 디케이 정지. (15초 타이머 + late_reply_count 메커니즘 대체)
       */
      affectionDecay?: { target: AffinityTargetId; perSecond: number };
      heroine?: HeroineId;
      /**
       * 'dm' = 1:1, 'group' = 단톡방. 명시 없으면 senders 수로 자동 추론.
       * KakaoModal에서 발신자 이름·룸 이름·인원 표시 분기에 사용.
       */
      mode?: 'dm' | 'group';
      roomName?: string;
      roomMembers?: number;
      pinnedNotice?: string;
      /** 첫 메시지 표시 시각. 없으면 오후 8:00 디폴트. */
      startHour?: number;
      startMinute?: number;
      /**
       * 메시지 등장 전 머뭇거림 시퀀스 — 매 메시지 전에
       * '입력 중...' 1.0s → 멈춤 0.6s → '입력 중...' 다시 1.0s → 메시지 등장.
       * 거절 엔딩 등 발신자가 말을 고르는 정서 표현용.
       */
      hesitate?: boolean;
      /**
       * 안 읽음 카운트가 메시지 등장 후 자동 사라지기까지 ms.
       * undefined면 카톡 닫힐 때까지 유지(기본). 0 이상이면 그 시간 후 0으로 페이드.
       */
      unreadFadeMs?: number;
    }
  | { type: 'FLAG_SET'; key: keyof GameFlags; value: unknown }
  | {
      type: 'FLAG_INC';
      key: AffinityTargetId | 'late_reply_count';
      delta: number;
    }
  | { type: 'KEY_CHOICE'; heroine: HeroineId; choiceId: string }
  | { type: 'JUMP'; sceneId: string }
  | {
      type: 'CONDITIONAL_JUMP';
      condition: FlagCondition;
      thenScene: string;
      elseScene?: string;
    }
  | { type: 'EVALUATE_BRANCH' }
  | {
      /**
       * 챕터 6 끝의 evaluate 씬에서 박힘. 이미 결정된 winner를 인자로 받아
       * 호감도/KEY/late_reply_count로 트루/해피/노멀/배드/REJECT 티어를 결정하고
       * 해당 ch06_h{N}_{tier}.scene.json으로 JUMP한다.
       * (2026-05-09 ch05 EVALUATE_BRANCH의 "최종 결정" 책임 분리, 챕터 6 본편 재생 복구.)
       */
      type: 'EVALUATE_TIER';
      winner: HeroineId;
    }
  | { type: 'ENDING'; endingId: EndingId }
  | {
      /**
       * 비기능 메타 큐 — 시나리오 작가가 연출 단계를 명시적으로 레이블링.
       * 런타임은 즉시 advance (UI 미표시). 디버그 빌드에서만 옵션 노출.
       * SCENE-FORMAT.md §1.1 정식 등록 (W4 후속 라운드 2026-05-05).
       */
      type: 'SCENE_CUE';
      label: string;
    };

export type SceneCommandType = SceneCommand['type'];

export interface Choice {
  text: string;
  next?: string;
  effects?: SceneCommand[];
  /**
   * 톤 매트릭스 신표기법 (CONVENTIONS §3.7).
   * `tone`이 박혀 있으면 effects의 FLAG_INC와 별개로 5명에게 매트릭스 룩업으로 자동 적용.
   * 옛 [INC: H# +N] 표기와 공존 가능 (Step 3 마이그레이션 중간 단계).
   */
  tone?: ToneTag;
  isKey?: boolean;
  /** 작가 메모용 자유 라벨 (예: 'quiet_care'). 엔진은 무시. */
  descriptor?: string;
  mechanism?: ChoiceMechanism;
  /** H4 미니게임 결과 (런타임에 채워짐). undefined면 미니게임 미실행 자리. */
  replyTimeMs?: number;
  /**
   * 옵션별 co-fire NPC override (2026-05-11 추가).
   * 설정 시 sceneMeta.coFireNpcs 무시. 옵션 A는 junhyuk만, 옵션 B는 taeho만 — 같은 분기.
   * 등록된 NPC는 H 변동과 함께 적용 (1-NPC drop 룰 우회).
   */
  coFireNpcs?: NpcAffinityId[];
}

export interface SceneMeta {
  chapter?: string;
  time?: string;
  /** H3 시간대 갭 보정 입력 (toneMatrix가 사용). day가 기본. */
  toneTime?: SceneTime;
  /**
   * 활성 호감도 대상 명단 — 본 씬에서 호감도 변동을 적용할 H/NPC 목록 (2026-05-08 추가, NPC 확장).
   * 미박이거나 빈 배열이면 fallback으로 모든 대상(5명 H + friend + mom) 적용 (점진 마이그레이션).
   * 시나리오 작가가 `active=H1,friend` 또는 `active=mom` 같은 메타로 박음.
   * 예: H1 단독 씬 → ['H1']. 친구 카페 → ['H2','friend']. 엄마 본가 → ['mom']. 회식 ch05 → 'all'.
   */
  activeHeroines?: AffinityTargetId[];
  /**
   * H+NPC co-fire 허용 NPC 목록 (씬 단위 기본값, 2026-05-11 추가).
   * 1-NPC drop 룰 우회 — 명시 NPC는 H 변동과 함께 적용.
   * Choice.coFireNpcs로 옵션별 override 가능.
   */
  coFireNpcs?: NpcAffinityId[];
}

export interface Scene {
  id: string;
  meta?: SceneMeta;
  commands: SceneCommand[];
}

/** 백로그 엔트리 (UI-SPEC §11) */
export interface HistoryEntry {
  speaker: string;
  text: string;
  type: 'dialogue' | 'monologue' | 'narration';
  sceneId: string;
  timestamp: number;
}

/** SaveSlot — STATE-SCHEMA §2 미러 */
export interface SaveSlot {
  version: 1;
  savedAt: string;
  thumbnail?: string;
  preview: {
    chapter: string;
    sceneTitle: string;
    timeInGame: string;
    excerpt: string;
    activeHeroine?: HeroineId;
  };
  flags: GameFlags;
  history: HistoryEntry[];
  currentSceneId: string;
  currentCommandIndex: number;
  audio: {
    bgmTrack: string | null;
    bgmTime: number;
  };
}
