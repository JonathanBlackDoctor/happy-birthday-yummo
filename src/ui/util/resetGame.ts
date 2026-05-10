/**
 * 새 게임 시작 헬퍼 — PauseMenu·EndingScreen·ChapterTransitionRecap의 "타이틀로" 동작 통합.
 *
 * 동작 (2026-05-08 사용자 결정):
 *   1. confirm() 다이얼로그 — 호감도/진행 상황 초기화 동의 받음
 *   2. 메모리 state 즉시 초기화 (resetForNewGame)
 *   3. localStorage 명시 클리어 — zustand persist API → 폴백으로 localStorage.removeItem
 *   4. settingsStore.storyMode null 리셋 (App.tsx 마운트 시 ModeSelect 다시 노출)
 *   5. location.reload — 깨끗한 부팅
 *
 * 순서가 중요: set 먼저 → clearStorage 다음. 거꾸로면 reload 직전 set이 partialize에 잡혀
 * 다시 저장될 가능성이 있다. 단 reload가 같은 turn에 호출되므로 실 위험은 작지만 명시적 순서 유지.
 */

import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

const CONFIRM_MESSAGE = '새 게임을 시작하면 호감도와 진행 상황이 초기화됩니다. 계속할까요?';

export function confirmAndResetGame(): void {
  if (typeof window === 'undefined') return;
  const ok = window.confirm(CONFIRM_MESSAGE);
  if (!ok) return;

  // 1) 메모리 state 즉시 리셋
  useGameStore.getState().resetForNewGame();

  // 2) localStorage 명시 클리어 — zustand persist API 우선, 실패 시 직접 삭제
  try {
    const persist = (useGameStore as unknown as { persist?: { clearStorage?: () => void } }).persist;
    if (persist?.clearStorage) {
      persist.clearStorage();
    } else {
      window.localStorage.removeItem('kmu-vn-autosave');
    }
  } catch {
    try {
      window.localStorage.removeItem('kmu-vn-autosave');
    } catch {
      // localStorage 비활성/거부 환경 — reload 후 default state로 시작되므로 안전
    }
  }

  // 3) storyMode null 리셋 (App.tsx 마운트 시 ModeSelect 노출)
  useSettingsStore.getState().set('storyMode', null);

  // 4) 깨끗한 부팅
  window.location.reload();
}
