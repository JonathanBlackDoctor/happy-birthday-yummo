/**
 * 수동 저장 슬롯 6개 + 마이그레이션 — STATE-SCHEMA.md §1, §5, §6 SSoT 미러.
 *
 * - kmu-vn-autosave: Zustand persist 전용 (gameStore.ts에서 관리, 본 모듈은 미터치)
 * - kmu-vn-save-1 ~ kmu-vn-save-6: 본 모듈이 관리
 * - kmu-vn-meta: 갤러리 해금 등 영구 데이터 (별도, W4 후속 라운드)
 *
 * 본 모듈은 순수 함수 — gameStore에서 호출, DOM 의존 X (jsdom 테스트 가능).
 */

import type { GameFlags, HeroineId, HistoryEntry, SaveSlot } from './types';

export type SlotIndex = 1 | 2 | 3 | 4 | 5 | 6;

const SLOT_KEY_PREFIX = 'kmu-vn-save-';

/** 저장 시점 게임 상태 스냅샷에 필요한 부분만 입력으로 받음 (gameStore 의존성 분리) */
export interface SaveInput {
  flags: GameFlags;
  history: HistoryEntry[];
  currentSceneId: string;
  currentCommandIndex: number;
  audio: {
    bgmTrack: string | null;
    bgmTime: number;
  };
  /** 미리보기용 사용자 보이는 컨텍스트 (UI 측에서 빌드해서 전달) */
  preview: {
    chapter: string;
    sceneTitle: string;
    timeInGame: string;
    excerpt: string;
    activeHeroine?: HeroineId;
  };
  /** dataURL 썸네일 (자산 부재 라운드는 빈 문자열 가능) */
  thumbnail?: string;
}

function slotKey(index: SlotIndex): string {
  return `${SLOT_KEY_PREFIX}${index}`;
}

/**
 * 슬롯에 저장. 6슬롯 중 하나에 SaveSlot 직렬화 + localStorage 기록.
 * STATE-SCHEMA §6 saveSlot 함수 시그니처 정합.
 */
export function saveSlot(index: SlotIndex, input: SaveInput): SaveSlot {
  const slot: SaveSlot = {
    version: 1,
    savedAt: new Date().toISOString(),
    thumbnail: input.thumbnail,
    preview: input.preview,
    flags: input.flags,
    history: input.history.slice(-50),
    currentSceneId: input.currentSceneId,
    currentCommandIndex: input.currentCommandIndex,
    audio: { ...input.audio },
  };
  try {
    localStorage.setItem(slotKey(index), JSON.stringify(slot));
  } catch (e) {
    // QuotaExceeded 등 — 호출자가 사용자에게 안내
    throw new SaveSlotError(
      `저장 실패 (슬롯 ${index}): ${e instanceof Error ? e.message : String(e)}`,
      'STORAGE_ERROR',
    );
  }
  return slot;
}

/**
 * 슬롯 로드. 없으면 null.
 * STATE-SCHEMA §6 loadSlot + §5 마이그레이션 정합.
 */
export function loadSlot(index: SlotIndex): SaveSlot | null {
  const raw = localStorage.getItem(slotKey(index));
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SaveSlotError(
      `슬롯 ${index} JSON 파싱 실패`,
      'PARSE_ERROR',
    );
  }
  return migrate(parsed);
}

/** 슬롯 삭제 (사용자 명시 액션 시) */
export function deleteSlot(index: SlotIndex): void {
  localStorage.removeItem(slotKey(index));
}

/** 모든 슬롯 메타 일람 (UI 슬롯 그리드용) */
export function listSlots(): Array<{ index: SlotIndex; slot: SaveSlot | null }> {
  const indices: SlotIndex[] = [1, 2, 3, 4, 5, 6];
  return indices.map((index) => ({ index, slot: loadSlot(index) }));
}

/**
 * 슬롯 존재 여부.
 */
export function hasSlot(index: SlotIndex): boolean {
  return localStorage.getItem(slotKey(index)) !== null;
}

/**
 * STATE-SCHEMA §5 마이그레이션 전략.
 * v0 (version 필드 없음) → v1.
 * v1 → 그대로.
 * 알 수 없는 버전 → 에러.
 */
export function migrate(raw: unknown): SaveSlot {
  if (!raw || typeof raw !== 'object') {
    throw new SaveSlotError('잘못된 슬롯 데이터', 'INVALID_DATA');
  }
  const obj = raw as Record<string, unknown>;
  const version = obj.version as number | undefined;

  if (version === 1) {
    return obj as unknown as SaveSlot;
  }

  if (version === undefined) {
    // v0 → v1: 기본값 채우고 version 박음
    return {
      version: 1,
      savedAt: (obj.savedAt as string) ?? new Date().toISOString(),
      thumbnail: obj.thumbnail as string | undefined,
      preview: (obj.preview as SaveSlot['preview']) ?? {
        chapter: '',
        sceneTitle: '',
        timeInGame: '',
        excerpt: '',
      },
      flags: obj.flags as GameFlags,
      history: (obj.history as HistoryEntry[]) ?? [],
      currentSceneId: (obj.currentSceneId as string) ?? '',
      currentCommandIndex: (obj.currentCommandIndex as number) ?? 0,
      audio: (obj.audio as SaveSlot['audio']) ?? { bgmTrack: null, bgmTime: 0 },
    };
  }

  throw new SaveSlotError(
    `알 수 없는 슬롯 버전: ${String(version)}`,
    'UNKNOWN_VERSION',
  );
}

export type SaveSlotErrorCode =
  | 'STORAGE_ERROR'
  | 'PARSE_ERROR'
  | 'INVALID_DATA'
  | 'UNKNOWN_VERSION';

export class SaveSlotError extends Error {
  constructor(
    message: string,
    public readonly code: SaveSlotErrorCode,
  ) {
    super(message);
    this.name = 'SaveSlotError';
  }
}
