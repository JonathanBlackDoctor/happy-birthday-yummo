/**
 * 일시정지 메뉴 — UI-SPEC §3 미니 컨트롤(우하단) → Save/Load 진입점.
 *
 * 2026-05-09 W5 메뉴 사이클 라운드 — Save/Load stub alert 제거 + 신규 화면 진입.
 * 2026-05-10 PM 정정 — 환경설정은 메뉴에서 분리되어 미니 컨트롤의 ⚙ 버튼으로 이동.
 *
 * AffectionStatusPanel — 5명 호감도 단계(별 1~5)를 메뉴 안에서 반(半) 공개 (UI-SPEC §10).
 *
 * StoryMode 토글은 메뉴에 두지 않는다 (사용자 결정 2026-05-08): 첫 부팅 ModeSelect 1회 선택으로 충분.
 */

import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';
import { AffectionStatusPanel } from './affection/AffectionStatusPanel';
import { confirmAndResetGame } from './util/resetGame';
import { SaveLoadScreen } from './SaveLoadScreen';

export function PauseMenu() {
  const close = useGameStore((s) => s.setPauseMenuOpen);
  const setSaveLoadOpen = useGameStore((s) => s.setSaveLoadOpen);
  const saveLoadMode = useGameStore((s) => s.saveLoadMode);

  // 2026-05-09 PM: 메뉴 들어갔다 나올 때마다 페이지 넘기는 소리. 볼륨 0.7 (PM 결정).
  const fire = (cb: () => void) => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    cb();
  };

  const items: Array<{ label: string; onClick: () => void }> = [
    { label: '재개', onClick: () => fire(() => close(false)) },
    { label: '저장', onClick: () => fire(() => setSaveLoadOpen('save')) },
    { label: '불러오기', onClick: () => fire(() => setSaveLoadOpen('load')) },
    { label: '타이틀로', onClick: () => fire(confirmAndResetGame) },
  ];

  // 자식 화면이 열려 있으면 자식만 마운트 (메뉴 카드 비노출 — z-index/스택 정합).
  if (saveLoadMode) {
    return <SaveLoadScreen mode={saveLoadMode} />;
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{ zIndex: 'var(--z-menu)', background: 'rgba(58, 46, 63, 0.85)' }}
    >
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-bg text-text rounded-2xl p-6 md:p-8 w-full max-w-2xl flex flex-col gap-5">
          <h2 className="text-2xl font-bold">메뉴</h2>
          <AffectionStatusPanel />
          <div className="flex flex-col gap-3">
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={it.onClick}
                className="min-h-[44px] px-4 py-3 bg-accent hover:bg-accent-hover text-text rounded-lg text-left"
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
