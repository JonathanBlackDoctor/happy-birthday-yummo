---
module: ARCHITECTURE
hierarchy: 4
depends-on:
  - 00-master/MASTER-PLAN.md
  - 00-master/CONVENTIONS.md
  - 05-ui-design/UI-SPEC.md
outputs:
  - 엔진 코드 아키텍처 명세 (Claude Code 구현 가이드)
  - 폴더 구조, 파일 책임, 데이터 플로우
status: review
---

# 06-engine/ARCHITECTURE.md

> 자체 React/TypeScript 비주얼 노벨 엔진의 기술 명세.
> 이 문서를 따라 Claude Code가 `src/engine/`을 구현한다.

## 1. 기술 스택 (확정)

| 영역 | 선택 | 이유 |
|---|---|---|
| 빌드 도구 | Vite 5+ | 빠른 HMR, 정적 빌드 |
| 언어 | TypeScript 5+ (strict) | 타입 안정성 |
| UI | React 18 | 생태계, hooks |
| 상태 | Zustand 4+ | 가벼움, 직렬화 쉬움 (저장 슬롯) |
| 스타일 | Tailwind CSS 3+ + CSS Variables | 디자인 토큰 |
| 사운드 | Howler.js 2.2+ | 사운드 풀링, 모바일 호환 |
| 영상 | 네이티브 `<video>` | 가벼움 |
| 라우팅 | 자체 (씬 ID 기반) | 외부 라우터 불필요 |
| 테스트 | Vitest + Playwright | 단위 + E2E |
| 폰트 | Pretendard woff2 서브셋 | 한국어 최적 |

`package.json` 핵심 의존:
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "howler": "^2.2.4"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.45.0"
  }
}
```

## 2. 폴더 구조

```
src/
├── main.tsx                    # 엔트리
├── App.tsx                     # 최상위 라우터 (메뉴 ↔ 게임 ↔ 갤러리)
├── engine/
│   ├── SceneRenderer.tsx       # 씬 렌더링 메인 컴포넌트
│   ├── ChoiceRenderer.tsx      # 선택지 UI
│   ├── DialogueBox.tsx         # 텍스트박스 (하단 고정)
│   ├── CharacterLayer.tsx      # 캐릭터 스프라이트 레이어
│   ├── BackgroundLayer.tsx     # 배경 레이어
│   ├── CGOverlay.tsx           # 이벤트 CG 풀스크린 표시
│   ├── VideoOverlay.tsx        # VEO 영상 재생
│   ├── AudioManager.ts         # Howler 래핑
│   ├── ScriptInterpreter.ts    # 씬 스크립트 해석기
│   ├── SaveManager.ts          # 저장/로드 (localStorage)
│   ├── PreloadManager.ts       # 자산 프리로드 큐
│   ├── KakaoModal.tsx          # 카톡 메신저 모달
│   ├── ReplyTimer.tsx          # H4 답장 시간 미니게임
│   ├── toneMatrix.ts           # 톤×히로인 5×5 보상 매트릭스 (CONVENTIONS §3.7, 2026-04-30)
│   └── types.ts                # 엔진 공통 타입
├── ui/
│   ├── TitleScreen.tsx
│   ├── MainMenu.tsx
│   ├── PauseMenu.tsx           # 게임 중 메뉴 (오토/스킵/저장 등)
│   ├── Settings.tsx
│   ├── SaveLoadScreen.tsx
│   ├── BacklogScreen.tsx
│   ├── GalleryScreen.tsx       # CG/BGM/엔딩 통합 갤러리
│   ├── ModeSelect.tsx          # 메인/서브 모드 선택
│   └── components/             # 공통 버튼/모달
├── stores/
│   ├── gameStore.ts            # 메인 게임 상태 (Zustand)
│   ├── settingsStore.ts        # 설정 (음량, 텍스트 속도)
│   └── saveStore.ts            # 저장 슬롯 관리
├── scenes/
│   ├── manifest.ts             # 씬 ID → 파일 매핑
│   ├── prologue.scene.json
│   ├── ch01_*.scene.json
│   ├── ch02_*.scene.json
│   ├── ...
│   └── endings/
│       ├── end_h1_true.scene.json
│       ├── end_h4_reject.scene.json   # ⚠️ 거절 엔딩
│       ├── end_solo_summer.scene.json # ⚠️ 16번째 엔딩 "혼자 여름방학"
│       └── ...
├── characters/
│   └── data.ts                 # 캐릭터 정적 데이터 (이름, 색상, 스프라이트 매니페스트)
├── assets-manifest.ts          # 모든 이미지/사운드 경로 + 프리로드 우선순위
└── styles/
    ├── globals.css
    └── tokens.css              # CSS 변수 (UI-SPEC.md §5.1)
```

## 3. 데이터 플로우

```
[User Action] ──┐
                ▼
        [gameStore (Zustand)]
                │
   ┌────────────┼────────────┐
   ▼            ▼            ▼
[SceneRenderer] [DialogueBox] [PreloadManager]
   │
   ▼
[ScriptInterpreter] reads scenes/*.scene.json
   │
   ▼
[Layered Output: BG → Characters → CG → Dialogue → UI]
```

## 4. 핵심 타입 (`src/engine/types.ts`)

```typescript
// 호감도 변수
export interface Affection {
  H1: number; H2: number; H3: number; H4: number; H5: number;
}

// 게임 플래그
export interface GameFlags extends Affection {
  late_reply_count: number;       // H4 거절 트리거 (STATE-SCHEMA.md §2 SSoT)
  flag_anatomy_first_done: boolean;
  current_chapter: 'prologue' | 'ch01' | ... | 'ch06' | 'ending';
  current_scene_id: string;
  visited_scenes: string[];        // 백로그/스킵용
  unlocked_endings: EndingId[];
  unlocked_cgs: string[];
  unlocked_bgms: string[];
  key_choices: Record<string, string[]>;  // heroine -> chosen key choice IDs
  last_increment_order: HeroineId[];      // 동률 결정용
  player_name?: string;            // 서브 모드용
}

// 씬 명령 (Discriminated Union)
export type SceneCommand =
  | { type: 'BG'; image: string; transition?: 'fade' | 'cut'; duration?: number }
  | { type: 'BGM'; track: string; volume?: number; fade?: number }
  | { type: 'SFX'; sound: string }
  | { type: 'CHARACTER'; id: string; sprite: string; position: 'left' | 'center' | 'right'; transition?: 'fade' | 'slide' }
  | { type: 'CHARACTER_HIDE'; id: string }
  | { type: 'DIALOGUE'; speaker: string; text: string; voice?: string; speakerId?: string }
  | { type: 'MONOLOGUE'; speaker: string; text: string; subtype?: 'normal' | 'perv_start' | 'self_aware' | 'recover' }
  | { type: 'NARRATION'; text: string }
  | { type: 'CHOICE'; choices: Choice[] }
  | { type: 'CG'; image: string; duration?: number; cgId: string }
  | { type: 'CG_HIDE' }
  | { type: 'VIDEO'; src: string; skipable: boolean }
  | { type: 'KAKAO'; messages: KakaoMessage[]; replyTimerEnabled?: boolean; timerSeconds?: number }
  | { type: 'FLAG_SET'; key: keyof GameFlags; value: any }
  | { type: 'FLAG_INC'; key: keyof Affection | 'late_reply_count'; delta: number; heroine?: HeroineId }
  | { type: 'KEY_CHOICE'; heroine: HeroineId; choiceId: string }
  | { type: 'JUMP'; sceneId: string }
  | { type: 'CONDITIONAL_JUMP'; condition: FlagCondition; thenScene: string; elseScene?: string }
  | { type: 'EVALUATE_BRANCH' }   // Ch.5 종료 시 메인 히로인 결정
  | { type: 'ENDING'; endingId: EndingId };

export interface Choice {
  text: string;
  next?: string;          // 다음 씬 ID
  effects?: SceneCommand[]; // 호감도 변동 등
}

export interface KakaoMessage {
  sender: 'yunmo' | HeroineId | string;
  text: string;
  delay?: number;        // 메시지 등장 전 딜레이 (ms)
  typing?: boolean;      // "입력중..." 인디케이터 표시
}

export type HeroineId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5';
export type EndingId = 'END_H1_TRUE' | 'END_H1_HAPPY' | ... | 'END_H4_REJECT' | ...;
```

## 5. Zustand 스토어 (`src/stores/gameStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  flags: GameFlags;
  history: HistoryEntry[];      // 백로그
  currentCommand: SceneCommand | null;
  isAuto: boolean;
  isSkip: boolean;
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  
  // 액션
  applyCommand: (cmd: SceneCommand) => void;
  jumpToScene: (sceneId: string) => Promise<void>;
  addToBacklog: (entry: HistoryEntry) => void;
  setFlag: <K extends keyof GameFlags>(key: K, value: GameFlags[K]) => void;
  incAffection: (heroine: HeroineId, delta: number) => void;
  unlockEnding: (id: EndingId) => void;
  // ...
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      flags: initialFlags(),
      history: [],
      currentCommand: null,
      // ...
    }),
    {
      name: 'kmu-vn-autosave',
      partialize: (state) => ({ flags: state.flags, history: state.history.slice(-100) }),
    }
  )
);
```

> ✅ Zustand `persist` 미들웨어로 자동저장. 매 5초 디바운스.

## 6. 스크립트 해석기 (`src/engine/ScriptInterpreter.ts`)

```typescript
export class ScriptInterpreter {
  private scene: Scene;
  private currentIndex: number = 0;
  
  async loadScene(sceneId: string): Promise<void> {
    this.scene = await fetch(`/scenes/${sceneId}.scene.json`).then(r => r.json());
    this.currentIndex = 0;
  }
  
  step(): SceneCommand | null {
    if (this.currentIndex >= this.scene.commands.length) return null;
    const cmd = this.scene.commands[this.currentIndex++];
    return cmd;
  }
  
  // EVALUATE_BRANCH 같은 특수 명령은 현재 flags 보고 다음 씬 결정
  // BRANCH-GRAPH.md §6.1 알고리즘 그대로 반영
  evaluateBranch(flags: GameFlags): string {
    // F-1: H4 거절 트리거 우선 평가 (즉시 발동, 호감도/순위 무관)
    if (flags.late_reply_count >= 2) return 'END_H4_REJECT';

    // 메인 히로인 결정 (모든 호감도 <30이면 'NONE')
    const winner = this.determineWinner(flags);
    if (winner === 'NONE') return 'END_SOLO_SUMMER';  // 16번째 엔딩

    // 히로인별 평가 (BRANCH-GRAPH §6 determineEnding 알고리즘 — H4 BAD 흡수, H3 BAD 없음, H5 TRUE 단일 등)
    return this.determineEnding(winner, flags);
  }
}
```

## 7. 자산 프리로드 (`src/engine/PreloadManager.ts`)

```typescript
class PreloadManager {
  private loaded = new Set<string>();
  
  async preloadScene(sceneId: string): Promise<void> {
    const scene = await this.loadScene(sceneId);
    const assets = this.extractAssets(scene);
    await Promise.all(assets.map(a => this.preloadAsset(a)));
  }
  
  // 다음 챕터의 첫 3개 씬을 백그라운드 프리로드
  async preloadAhead(currentSceneId: string): Promise<void> {
    const nextScenes = this.findNextScenes(currentSceneId, 3);
    nextScenes.forEach(s => this.preloadScene(s)); // fire and forget
  }
  
  private preloadAsset(url: string): Promise<void> {
    if (this.loaded.has(url)) return Promise.resolve();
    
    if (url.match(/\.(webp|png|jpg)$/)) {
      return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => { this.loaded.add(url); res(); };
        img.onerror = rej;
        img.src = url;
      });
    }
    if (url.match(/\.(mp3|ogg|wav)$/)) {
      // Howler가 처리
      return new Promise(res => {
        new Howl({ src: [url], preload: true, onload: () => { this.loaded.add(url); res(); } });
      });
    }
    return Promise.resolve();
  }
}
```

## 8. 카톡 모달 + 답장 시간 미니게임

H4 거절 엔딩 트리거 핵심:

```typescript
// KakaoModal.tsx
function KakaoModal({ messages, replyTimerEnabled, timerSeconds = 15 }: Props) {  // 확정값 15초 (H4 시트 §11 / STORY-BIBLE §7.1)
  // 1. 메시지를 시간차로 한 줄씩 등장
  // 2. 마지막 메시지 후 replyTimerEnabled면 ReplyTimer 활성화
  // 3. 타임아웃 = late_reply_count++ + H4 -3 (types.ts/STATE-SCHEMA 정합)
  // 4. 답장 선택 = 호감도 변동
}

// ReplyTimer.tsx
function ReplyTimer({ seconds, onTimeout, onReply }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  
  useEffect(() => {
    if (remaining <= 0) { onTimeout(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  
  return (
    <div className="reply-timer">
      <ProgressRing fraction={remaining / seconds} />
      <span>답장하기</span>
    </div>
  );
}
```

## 9. 빌드 검증 스크립트 (`scripts/validate.ts`)

CI에서 매 빌드 시 실행:

```typescript
// 1. 모든 씬이 어떤 엔딩으로든 도달 가능한지 그래프 탐색
// 2. 모든 참조된 자산 (이미지/사운드/영상)이 public/에 존재하는지
// 3. 모든 변수 (호감도, 플래그)가 사용 전 초기화되는지
// 4. 모든 KEY_CHOICE가 BRANCH-GRAPH.md와 일치하는지
// 5. 거절 엔딩 도달 가능성 (H4 분기에 잘못된 답변 ≥3 패턴 존재)

// 실패 시 빌드 fail
```

## 10. CI/CD (`.github/workflows/deploy.yml`)

```yaml
name: Build & Deploy
on:
  push: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run validate    # 빌드 검증 스크립트
      - run: npm run test        # Vitest
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e    # 1개 엔딩 자동 플레이
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    permissions: { pages: write, id-token: write }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

## 11. 모바일 반응형 (`tokens.css`)

```css
:root { /* PC 기본 */
  --ui-scale: 1;
  --textbox-height: 28%;
  --font-size-text: 22px;
}
@media (max-width: 768px) {
  :root {
    --ui-scale: 0.85;
    --textbox-height: 38%;
    --font-size-text: 18px;
  }
  /* 가로모드 권장 → 세로 시 회전 안내 토스트 표시 */
}
```

## 12. 성능 목표 검증

| 지표 | 목표 | 측정 |
|---|---|---|
| 초기 로드 | < 3초 (3G) | Lighthouse |
| 씬 전환 | < 200ms | 자체 perf marker |
| 메모리 | < 200MB (모바일) | Chrome DevTools |
| 빌드 크기 | < 50MB | `du -sh dist/` |

## 13. Claude Code 작업 순서

1. `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`
2. `src/styles/tokens.css` (UI-SPEC.md 토큰 입력)
3. `src/stores/gameStore.ts` + `settingsStore.ts` + `saveStore.ts`
4. `src/engine/types.ts`
5. `src/engine/ScriptInterpreter.ts`
6. `src/engine/AudioManager.ts`
7. `src/engine/PreloadManager.ts`
8. `src/engine/SceneRenderer.tsx` + 하위 레이어들
9. `src/engine/DialogueBox.tsx`, `CharacterLayer.tsx`, `BackgroundLayer.tsx`, `CGOverlay.tsx`
10. `src/engine/KakaoModal.tsx` + `ReplyTimer.tsx`
11. `src/ui/*.tsx` (메뉴/갤러리 등)
12. `scripts/validate.ts`
13. CI/CD 설정

## 14. 사용자 검증

- [ ] 기술 스택 (React/Zustand/Vite) OK?
- [ ] 폴더 구조 OK?
- [ ] persist (localStorage 자동저장) 동의?
- [ ] CI 검증 항목 추가/제거?
