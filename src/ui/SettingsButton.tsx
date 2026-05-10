/**
 * 환경설정 진입 버튼 — 미니 컨트롤의 ⚙ 톱니바퀴 (2026-05-10 PM 정정).
 *
 * - 클릭 시 SettingsScreen 작은 floating 패널 토글.
 * - PauseMenu에서 환경설정 항목을 분리한 결과 — 메뉴 거치지 않고 게임 화면에서 한 번에.
 * - MuteToggle과 시각 톤 통일 (BTN_CLASS 동일).
 */

import { useGameStore } from '@/stores/gameStore';

const BTN_CLASS =
  'min-h-[36px] min-w-[36px] px-2 py-1 bg-black/55 hover:bg-black/75 text-white border border-white/30 backdrop-blur-sm shadow-lg rounded-md text-xs font-medium flex items-center justify-center transition-colors';

export function SettingsButton() {
  const isOpen = useGameStore((s) => s.isSettingsOpen);
  const setOpen = useGameStore((s) => s.setSettingsOpen);

  const onClick = () => {
    setOpen(!isOpen);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="환경설정"
      aria-expanded={isOpen}
      data-testid="settings-button"
      className={`${BTN_CLASS} text-base`}
    >
      ⚙
    </button>
  );
}
