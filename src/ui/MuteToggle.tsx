/**
 * 음소거 토글 — MiniControls의 음량 슬라이더 대체 (2026-05-09 W5 메뉴 사이클 라운드).
 *
 * - 단일 버튼 (🔊 / 🔇). 클릭 시 settingsStore.muted 토글.
 * - audioManager.setVolumes({ muted }) 동기화는 SceneRenderer의 setVolumes useEffect가 담당.
 * - 상세 음량(BGM/SFX/Voice) 조절은 SettingsScreen에서.
 */

import { useSettingsStore } from '@/stores/settingsStore';

const BTN_CLASS =
  'min-h-[36px] min-w-[36px] px-2 py-1 bg-black/55 hover:bg-black/75 text-white border border-white/30 backdrop-blur-sm shadow-lg rounded-md text-xs font-medium flex items-center justify-center transition-colors';

export function MuteToggle() {
  const muted = useSettingsStore((s) => s.muted);
  const setSetting = useSettingsStore((s) => s.set);

  const onClick = () => {
    setSetting('muted', !muted);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={muted ? '음소거 해제' : '음소거'}
      aria-pressed={muted}
      data-testid="mute-toggle"
      className={`${BTN_CLASS} text-base`}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
