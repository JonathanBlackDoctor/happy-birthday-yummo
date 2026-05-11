/**
 * 미니 컨트롤 — UI-SPEC §3 + QA-PLAN §1.3.
 *
 * - PC (md+): 우하단 가로 일렬 (Log / Gallery / Menu)
 * - 모바일 (< 768px): 우상단 햄버거 토글 → 세로 메뉴
 * - 터치 영역 ≥44×44px (iOS HIG / QA-PLAN §1.3)
 *
 * Auto/Skip은 W5에서 텍스트 진행 모듈과 연동. 본 라운드는 Log/Menu/Gallery만 작동.
 */

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';
import { MuteToggle } from './MuteToggle';
import { SettingsButton } from './SettingsButton';

// 2026-05-09 PM 정정: 대사창과 겹침 회피 위해 버튼 사이즈 축소(44→36, px-3→px-2, py-2→py-1, sm→xs).
const BTN_CLASS =
  'min-h-[36px] min-w-[36px] px-2 py-1 bg-black/55 hover:bg-black/75 text-white border border-white/30 backdrop-blur-sm shadow-lg rounded-md text-xs font-medium flex items-center justify-center transition-colors';

// 모바일 QA 2026-05-11 처방: 모바일 브라우저 UI가 게임 영역을 가리는 문제 해소를 위해 전체화면 토글 추가.
// iPhone Safari는 requestFullscreen 미지원 → supported=false 분기로 버튼 자체 숨김.
function FullscreenButton() {
  const [isFs, setIsFs] = useState(() =>
    typeof document !== 'undefined' ? !!document.fullscreenElement : false
  );
  const supported =
    typeof document !== 'undefined' &&
    typeof document.documentElement.requestFullscreen === 'function';

  useEffect(() => {
    if (!supported) return;
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [supported]);

  if (!supported) return null;

  const toggle = async () => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({
          navigationUI: 'hide',
        } as FullscreenOptions);
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('[Fullscreen] toggle failed:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-label={isFs ? '전체화면 종료' : '전체화면 진입'}
      aria-pressed={isFs}
      data-testid="fullscreen-button"
      className={`${BTN_CLASS} text-base`}
    >
      {isFs ? '🗗' : '⛶'}
    </button>
  );
}

export function MiniControls() {
  const setBacklog = useGameStore((s) => s.setBacklogOpen);
  const setMenu = useGameStore((s) => s.setPauseMenuOpen);
  const setGallery = useGameStore((s) => s.setGalleryOpen);
  const rewindOne = useGameStore((s) => s.rewindOne);
  const canRewind = useGameStore((s) => s.runtimeMode === 'scene' && s.textCommandStack.length > 0);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const buttons: Array<{ label: string; onClick: () => void; disabled?: boolean }> = [
    { label: '← 이전', onClick: () => void rewindOne(), disabled: !canRewind },
    { label: 'Log', onClick: () => setBacklog(true) },
    { label: 'Gallery', onClick: () => setGallery(true) },
    { label: 'Menu', onClick: () => setMenu(true) },
  ];

  const fire = (cb: () => void) => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    cb();
    setHamburgerOpen(false);
  };

  return (
    <>
      {/* PC: 우하단 — VolumeControl(메뉴 행 위) + 가로 일렬 메뉴 행. flex-col로 같은 컨테이너에 묶여 controls-bottom에 앵커. */}
      <div
        className="hidden md:flex absolute right-2 flex-col items-end gap-2"
        style={{ zIndex: 'var(--z-controls)', bottom: 'var(--controls-bottom)' }}
      >
        <div className="flex gap-2">
          <FullscreenButton />
          <SettingsButton />
          <MuteToggle />
        </div>
        <div className="flex gap-2">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => fire(b.onClick)}
              disabled={b.disabled}
              className={`${BTN_CLASS} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 모바일: 우상단 햄버거 + 토글 시 세로 메뉴 (VolumeControl은 메뉴 항목 위에 올려놓음) */}
      <div
        className="md:hidden absolute top-2 right-2 flex flex-col items-end gap-2"
        style={{ zIndex: 'var(--z-controls)' }}
      >
        <button
          type="button"
          aria-label="메뉴 열기/닫기"
          aria-expanded={hamburgerOpen}
          onClick={() => {
            audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
            setHamburgerOpen((v) => !v);
          }}
          className={`${BTN_CLASS} text-xl`}
        >
          {hamburgerOpen ? '✕' : '☰'}
        </button>
        {hamburgerOpen && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
          <FullscreenButton />
          <SettingsButton />
          <MuteToggle />
        </div>
            {buttons.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => fire(b.onClick)}
                disabled={b.disabled}
                className={`${BTN_CLASS} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
