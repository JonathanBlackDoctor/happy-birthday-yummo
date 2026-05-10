/**
 * 최상위 — OpeningVideo → (storyMode === null 이면 ModeSelect) → SceneRenderer.
 *
 * 2026-05-08: 풀/압축 스토리 모드 옵션 추가. 매 부팅마다 OP 영상 후 ModeSelect 노출 (PM 결정).
 * 마운트 시 storyMode를 null로 리셋 → OP 영상 종료 후 ModeSelect → 선택 → SceneRenderer 진입.
 *
 * E2E 테스트 모드 (DEV 빌드 한정):
 *   ?scene=<id>  — 임의 씬으로 시작 (storyMode null 리셋 스킵, 자동 'full' 적용)
 *   ?flags=<encoded JSON> — flags 직접 주입 (호감도/late_reply_count 등)
 */

import { useEffect, useRef, useState } from 'react';
import { SceneRenderer } from '@/engine/SceneRenderer';
import { OrientationLock } from '@/ui/OrientationLock';
import { OpeningVideo } from '@/ui/OpeningVideo';
import { ModeSelect } from '@/ui/ModeSelect';
import { IntroTyping } from '@/ui/IntroTyping';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { audioManager } from '@/engine/audioManager';
import { resolveEntryScene } from '@/scenes/manifest';
import { DevTools } from '@/ui/dev/DevTools';

// E2E 테스트가 게임 상태에 직접 접근 가능하도록 window에 store 노출.
// W6 출시 직전에 prod 빌드에서 비활성화 검토 (cheating 방지). 현재는 preview 빌드도 E2E 대상이라 항상 노출.
if (typeof window !== 'undefined') {
  (window as unknown as { __gameStore: typeof useGameStore }).__gameStore = useGameStore;
}

function applyTestFlagsFromUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const flagsJson = params.get('flags');
  if (!flagsJson) return;
  try {
    const overrides = JSON.parse(decodeURIComponent(flagsJson)) as Record<string, unknown>;
    useGameStore.setState((s) => ({ flags: { ...s.flags, ...overrides } }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[E2E] ?flags= JSON parse 실패:', e);
  }
}

// E2E 테스트는 OP 영상을 건너뛰어야 함 (timeout 방지)
// - navigator.webdriver: Playwright 등 자동화 환경 자동 스킵
// - ?scene= / ?flags= URL 파라미터: 명시 스킵
function isE2eEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof navigator !== 'undefined' && navigator.webdriver) return true;
  const params = new URLSearchParams(window.location.search);
  return params.has('scene') || params.has('flags');
}

function shouldShowOpening(): boolean {
  return !isE2eEnvironment();
}

export default function App() {
  const startScene = useGameStore((s) => s.startScene);
  const storyMode = useSettingsStore((s) => s.storyMode);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setSetting = useSettingsStore((s) => s.set);
  const [bootError, setBootError] = useState<string | null>(null);
  const [showOpening, setShowOpening] = useState(() => shouldShowOpening());
  // M-009 처방 (PM 결정 2026-05-10): 인트로 타이핑이 첫 user gesture 역할.
  // E2E 환경은 즉시 통과 (16엔딩 자동 테스트 무영향).
  const [introCompleted, setIntroCompleted] = useState(() => isE2eEnvironment());

  // settings.reduceMotion → body[data-kmu-reduce-motion] 동기화 (PM 결정 2026-05-10).
  // tokens.css/globals.css의 reduce-motion 룰이 이 attribute를 selector로 사용하므로,
  // OS의 prefers-reduced-motion과 무관하게 게임 내 토글만으로 동작 줄이기 제어.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.dataset.kmuReduceMotion = reduceMotion ? 'true' : 'false';
  }, [reduceMotion]);
  // 2026-05-09 PM 진단 라운드 — StrictMode 이중 useEffect 호출 방지 + 첫 부팅 페이드인 단일 발동 보장.
  const sceneStartedRef = useRef(false);

  // 마운트 시 storyMode null로 리셋 — 매 부팅마다 ModeSelect 다시 노출 (PM 결정 2026-05-08).
  // E2E 환경(?scene/?flags/webdriver)은 예외 — 별도 effect가 'full'로 자동 세팅.
  useEffect(() => {
    if (!isE2eEnvironment()) {
      setSetting('storyMode', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // E2E 환경에서 storyMode가 미설정이면 자동으로 'full' 적용 (ModeSelect 스킵)
  useEffect(() => {
    if (isE2eEnvironment() && storyMode === null) {
      setSetting('storyMode', 'full');
    }
  }, [storyMode, setSetting]);

  useEffect(() => {
    applyTestFlagsFromUrl();
  }, []);

  // 폰트 크기 CSS var 동기화 — 12~22px 슬라이더 변경 시 즉시 반영 (W5 메뉴 사이클 라운드 2026-05-09).
  // tokens.css 기본 26px(데스크톱) / 22px(모바일)이지만 사용자 설정이 우선.
  // 명/대사 비율 유지 위해 --font-size-name = fontSize + 2 (tokens.css 26/28 비율 미러).
  const fontSize = useSettingsStore((s) => s.fontSize);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--font-size-text', `${fontSize}px`);
    document.documentElement.style.setProperty('--font-size-name', `${fontSize + 2}px`);
    document.documentElement.style.setProperty('--font-size-monologue', `${fontSize - 1}px`);
  }, [fontSize]);

  // 음소거 동기화 — settingsStore.muted 변동 시 audioManager에 즉시 반영.
  // SceneRenderer의 setVolumes effect는 bgmVolume/sfxVolume만 다루므로 muted는 여기서 별도 동기화.
  const muted = useSettingsStore((s) => s.muted);
  useEffect(() => {
    audioManager.setVolumes({ muted });
  }, [muted]);

  // 2026-05-09 PM 정정 #3: 메인 테마 BGM은 페이지 접속 즉시 (App 최상위 마운트). fade 4 = 2000ms.
  // OP 영상은 muted라 충돌 없음. ModeSelect/OpeningVideo의 BGM 호출 모두 제거됨.
  // M-009 처방 (2026-05-10): 모바일 audio autoplay 차단 회피 — IntroTyping "확인" 클릭 후 재생.
  useEffect(() => {
    if (isE2eEnvironment()) return;
    if (!introCompleted) return;
    audioManager.playBgm('bgm_main_theme', { fade: 4, volume: 0.6 });
  }, [introCompleted]);

  // 모드가 확정 + OP 영상 종료 후에 prologue 시작.
  // - 첫 부팅: OP 종료 → ModeSelect에서 사용자가 선택 → storyMode 확정 → 이 effect 트리거 → startScene.
  // - 재부팅: storyMode 이미 저장 → OP 종료 후 이 effect 트리거 → startScene.
  // - E2E: showOpening 초기값 false + storyMode 'full' 자동 세팅 → 즉시 startScene.
  //
  // showOpening true 동안 startScene 호출 금지 — OP 위 클릭/키보드(Space/Enter)가 underlying
  // DialogueBox.handleClick / SceneRenderer.handleAreaClick으로 흘러 advance 트리거되던 회귀 처방.
  // 또한 챕터 경계(isChapterBoundary)가 OP 동안 발동해 ChapterStartPrompt가 OP 위에 노출되던 회귀도 함께 차단.
  // 2026-05-09 PM 진단 라운드 — 첫 부팅 페이드인을 store 외부(여기)에서 직접 진행.
  // 이전에는 gameStore.startScene 안의 isFirstBoot 분기에서 처리했지만 dev HMR로 인한 store 인스턴스
  // 분리 시 set이 미반영되는 문제 발견 (PM 풀 플레이에서 페이드인 자체가 안 보임).
  // 단일 store 인스턴스(window.__gameStore)에 직접 setState하면 dev/prod 모두 안전.
  // sceneStartedRef로 StrictMode 이중 호출도 차단.
  useEffect(() => {
    if (storyMode === null) return;
    if (showOpening) return;
    if (sceneStartedRef.current) return;
    sceneStartedRef.current = true;

    const e2e = isE2eEnvironment();
    // 사용자 결정 2026-05-09 라운드 #12 — OP→프롤로그는 "새 게임 시작".
    // persist 잔존 호감도/스냅샷/visited_scenes를 모두 정리하여
    //  (1) OP→프롤로그 사이 stale 챕터 회상 출현 차단
    //  (2) 호감도 0부터 깨끗한 진행 보장
    //  (3) ChapterTransitionRecap의 delta 계산이 신선한 스냅샷 기반이 되도록 함.
    // E2E(?scene=, ?flags=, webdriver)는 임의 씬 + flags 인젝션을 허용해야 하므로 스킵.
    if (!e2e) {
      useGameStore.getState().resetForNewGame();
    }

    const isFirstBoot = useGameStore.getState().currentSceneId === '';
    if (isFirstBoot && !e2e) {
      // 검정 화면에서 시작 (SceneRenderer 마운트 첫 frame BG flash 회피).
      useGameStore.setState({ chapterFadeOpacity: 1 });
    }

    void (async () => {
      try {
        await startScene(resolveEntryScene());
        if (isFirstBoot && !e2e) {
          // 3.2초 페이드인 (50 step × 64ms).
          for (let i = 49; i >= 0; i--) {
            useGameStore.setState({ chapterFadeOpacity: i / 50 });
            await new Promise((r) => setTimeout(r, 64));
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setBootError(msg);
      }
    })();
  }, [storyMode, startScene, showOpening]);

  if (bootError) {
    return (
      <>
        <div className="w-full h-full flex items-center justify-center text-text bg-bg p-8">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-4">씬 로드 실패</h1>
            <pre className="whitespace-pre-wrap text-sm">{bootError}</pre>
          </div>
        </div>
        <OrientationLock />
      </>
    );
  }

  return (
    <>
      {introCompleted && (
        <>
          <SceneRenderer />
          {showOpening && <OpeningVideo onComplete={() => setShowOpening(false)} />}
          {!showOpening && storyMode === null && (
            <ModeSelect onComplete={() => { /* storyMode 변경이 effect 트리거 */ }} />
          )}
        </>
      )}
      {!introCompleted && <IntroTyping onConfirm={() => setIntroCompleted(true)} />}
      <OrientationLock />
      {import.meta.env.DEV && <DevTools />}
    </>
  );
}
