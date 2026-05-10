---
module: STATE-SCHEMA
hierarchy: 4
depends-on:
  - 06-engine/ARCHITECTURE.md
  - 03-story/BRANCH-GRAPH.md
outputs:
  - 게임 상태 스키마 (저장/로드 호환)
  - localStorage 키 명세
status: review
---

# 06-engine/STATE-SCHEMA.md

> 모든 저장 가능한 상태의 정확한 스키마.
> 변경 시 마이그레이션 필요 → `version` 필드로 관리.

> **[2026-04-30 톤 매트릭스 메모]** CONVENTIONS §3.7 도입으로 `Choice` 타입에 `tone`/`isKey`/`descriptor`/`mechanism`/`replyTimeMs` 필드 추가됐다(SCENE-FORMAT §1.3a 참조). `GameFlags` 자체 스키마는 변경 없음 — 호감도 0~100, `late_reply_count`, `key_choices` 모두 그대로. 따라서 `version: 1` 유지·마이그레이션 불필요. 기존 저장 슬롯과 100% 호환.

## 1. 저장 슬롯 구조

| 키 (localStorage) | 내용 |
|---|---|
| `kmu-vn-autosave` | 자동저장 1슬롯 (Zustand persist) |
| `kmu-vn-save-1` | 수동저장 슬롯 1 |
| `kmu-vn-save-2` | 수동저장 슬롯 2 |
| `kmu-vn-save-3` | 수동저장 슬롯 3 |
| `kmu-vn-save-4` | 수동저장 슬롯 4 |
| `kmu-vn-save-5` | 수동저장 슬롯 5 |
| `kmu-vn-save-6` | 수동저장 슬롯 6 |
| `kmu-vn-settings` | 환경설정 |
| `kmu-vn-meta` | 갤러리 해금 등 영구 데이터 (게임 새로 시작해도 유지) |

## 2. 메인 게임 상태 (`SaveSlot` 타입)

```typescript
export interface SaveSlot {
  version: 1;
  savedAt: string;           // ISO 8601
  thumbnail?: string;        // dataURL, 슬롯 표시용 (BG 캡처)
  preview: {
    chapter: string;         // "Ch.3"
    sceneTitle: string;      // "동산병원 견학"
    timeInGame: string;      // "2026-04-08 14:30"
    excerpt: string;         // 마지막 대사 30자
    activeHeroine?: HeroineId; // 현재 1위 (UI 힌트, 결정 전이면 undefined)
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

export interface GameFlags {
  // 호감도 (0~100)
  H1: number;
  H2: number;
  H3: number;
  H4: number;
  H5: number;
  
  // 동률 결정용 (마지막 +값 받은 순서)
  last_increment_order: HeroineId[];
  
  // 카톡 답장 시스템 (H4 거절 핵심)
  late_reply_count: number;
  
  // 키 선택지 통과 기록
  key_choices: {
    H1: string[];
    H2: string[];
    H3: string[];
    H4: string[];
    H5: string[];
  };
  
  // 진행 상태
  current_chapter: ChapterId;
  current_scene_id: string;   // 현재 씬 ID (런타임 추적, types.ts 정합)
  visited_scenes: string[];   // 백로그/스킵 가속
  
  // 챕터별 핵심 이벤트 플래그
  flag_anatomy_first_done: boolean;       // Ch.2 카데바 첫 대면 끝
  flag_dongsan_visit_done: boolean;       // Ch.3 견학 완료
  flag_seoyoon_first_meet: boolean;
  flag_first_kakao_serin: boolean;
  // ...
  
  // 서브 모드용
  mode: 'main' | 'female_pc';
  player_name?: string;       // female_pc 모드에서 사용자가 입력
}

export type ChapterId = 'prologue' | 'ch01' | 'ch02' | 'ch03' | 'ch04' | 'ch05' | 'ch06' | 'ending';
export type HeroineId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5';

export interface HistoryEntry {
  speaker: string;
  text: string;
  type: 'dialogue' | 'monologue' | 'narration';
  sceneId: string;
  timestamp: number;
}

/**
 * 휘발성 호감도 변동 큐 — AffectionToastStack이 구독.
 * persist.partialize에서 제외 (저장 안 함). 카드 unmount 후 4초 지나면 GC.
 * UI-SPEC §11 + ANIMATION-SPEC §13 정합.
 */
export interface AffectionEvent {
  id: string;             // crypto.randomUUID() 또는 ts+counter 폴백
  heroine: HeroineId;
  prevValue: number;      // 0~100, 채움 spring의 시작점
  newValue: number;       // 0~100, 채움 spring의 도착점 (clamp 후)
  delta: number;          // applyOne(FLAG_INC).cmd.delta (clamp 전 의도)
  ts: number;             // Date.now()
  consumed: boolean;      // Stack이 카드 mount 시점에 true
}
```

## 3. 환경설정 (`Settings` 타입)

```typescript
export interface Settings {
  version: 4;  // 2026-05-09 W5 메뉴 사이클 라운드 — muted + fontSize 추가

  // 음량 (0~1)
  bgmVolume: number;
  sfxVolume: number;
  voiceVolume: number;       // 보이스 자산 도착 후 audioManager 연결 예약

  // 텍스트
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  autoAdvanceDelay: number;  // ms (1000~5000)

  // UI
  textboxOpacity: number;    // 0.5~1.0
  fontSize: number;          // 본문 폰트 크기 px (12~22). 2026-05-09 추가.

  // 음원 토글 — MiniControls의 MuteToggle + SettingsScreen 토글 동시 동기화. audioManager.setVolumes({ muted }) 연동.
  muted: boolean;            // 2026-05-09 추가.

  // 기타
  skipUnseenText: boolean;   // 미열람 텍스트도 스킵 가능 여부 (기본 false)
  reduceMotion: boolean;     // 애니메이션 줄이기 (접근성)

  // 자동재생 / 이스터에그 (이전 라운드 누적)
  autoPlayEnabled: boolean;
  autoPlayUnlocked: boolean;
  hasAchievedTrueEnding: boolean;
  animatedEndingPanel: boolean;
  storyMode: 'full' | 'compressed' | null;
}

// 마이그레이션 룰 (v3 → v4): muted=false, fontSize=16 기본값으로 채움.
// 그 외 필드는 그대로 유지. settingsStore.ts migrate fromVersion < 4 분기 참조.
```

## 4. 영구 메타 (`MetaData` — 새 게임에도 유지)

```typescript
export interface EndingRecord {
  endingId: EndingId;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  finalScore: number;
  savedAt: string;            // ISO 8601
}

export interface MetaData {
  version: 1;

  // 갤러리 해금 — 본 키만 누적, 새 게임에도 유지.
  unlocked_endings: EndingId[];
  unlocked_cgs: string[];     // CG ID 리스트
  unlocked_bgms: string[];    // BGM 트랙 리스트

  // 엔딩 도달 누적 기록 — 같은 엔딩 재달성 시 push (중복 OK). EndingScreen이 마운트 시 자동 push.
  // 2026-05-09 W5 메뉴 사이클 라운드 신규.
  endingHistory: EndingRecord[];

  // 통계 / 첫 클리어
  total_play_count: number;
  has_cleared_once: boolean;
}
```

**구현 위치**: `src/stores/metaStore.ts` — zustand persist (`kmu-vn-meta`, version 1).
액션: `recordEnding(record)` / `unlockCg(id)` / `unlockBgm(id)` / `unlockEnding(id)` / `resetMeta()`.

## 5. 마이그레이션 전략

```typescript
function migrate(raw: any): SaveSlot {
  if (!raw.version) {
    // v0 → v1
    return { ...defaultSaveSlot(), ...migrateV0(raw), version: 1 };
  }
  if (raw.version === 1) return raw;
  throw new Error(`Unknown save version: ${raw.version}`);
}
```

## 6. 직렬화 / 역직렬화

```typescript
// JSON.stringify + 압축은 일단 안 함 (저장 슬롯이 ~100KB 미만 예상)
function saveSlot(slotIndex: 1 | 2 | 3 | 4 | 5 | 6, state: GameState): void {
  const slot: SaveSlot = {
    version: 1,
    savedAt: new Date().toISOString(),
    thumbnail: captureThumbnail(),
    preview: buildPreview(state),
    flags: state.flags,
    history: state.history.slice(-50),  // 최근 50개만
    currentSceneId: state.currentSceneId,
    currentCommandIndex: state.currentCommandIndex,
    audio: {
      bgmTrack: state.audio.bgmTrack,
      bgmTime: state.audio.bgmTime,
    },
  };
  localStorage.setItem(`kmu-vn-save-${slotIndex}`, JSON.stringify(slot));
}

function loadSlot(slotIndex: number): SaveSlot | null {
  const raw = localStorage.getItem(`kmu-vn-save-${slotIndex}`);
  if (!raw) return null;
  return migrate(JSON.parse(raw));
}
```

## 7. 자동저장 트리거

다음 시점에 자동저장:
- 챕터 시작 시
- 선택지 직후
- 카톡 모달 종료 시
- 5분마다 (안전장치)

디바운스: 5초 내 중복 저장 금지.

## 7.1 "타이틀로 돌아가기" 리셋 정책 (PM 결정 2026-05-09)

`confirmAndResetGame()`(`src/ui/util/resetGame.ts`) 호출 시 동작:

**삭제 (리셋)**:
- `kmu-vn-autosave` (zustand persist 자동저장) — gameStore의 flags/history/현재 위치
- 메모리 RuntimeState — `useGameStore.getState().resetForNewGame()`
- `settingsStore.storyMode` 만 null로 (App 마운트 시 ModeSelect 다시 노출)

**보존 (절대 리셋 X)**:
- `kmu-vn-save-1 ~ kmu-vn-save-6` (수동 저장 슬롯 6개) — 사용자가 직접 만든 저장 데이터
- `kmu-vn-meta` (갤러리 해금·엔딩 점수 히스토리·has_cleared_once)
- `kmu-vn-settings` (storyMode 외 모든 환경설정)

이 정책은 호감도/진행상황만 깨끗이 되돌리되 사용자가 누적한 자료(갤러리·기록·설정·수동 슬롯)는 절대 잃지 않게 한다.
SettingsScreen "데이터 초기화" 버튼은 같은 `confirmAndResetGame()`을 호출 — 별도 광범위 삭제 옵션은 제공하지 않음.

## 8. localStorage 용량 한계

- 일반 브라우저: 5~10MB per origin
- 슬롯 6개 × 100KB = 600KB → 충분
- 메타: ~50KB
- 설정: ~5KB
- **총 사용량 < 1MB 예상**

만약 초과 가능성 있을 때:
- `history`를 더 작게 (최근 30개)
- `visited_scenes`를 비트맵 또는 Set 압축

## 9. 사용자 검증

- [ ] 저장 슬롯 6개 + 자동 1개 OK?
- [ ] `late_reply_count`가 거절 트리거 핵심으로 잘 정의됨?
- [ ] 영구 메타와 슬롯 분리 OK (새 게임 시작해도 갤러리 유지)?
