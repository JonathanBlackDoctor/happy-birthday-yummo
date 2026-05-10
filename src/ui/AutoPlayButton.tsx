/**
 * 자동재생 토글 버튼 — 좌상단 작은 버튼.
 *
 * 4상태:
 *   1. 잠금(autoPlayUnlocked=false): 🔒 아이콘. 클릭 시 0.5초 동안 화면 상단 중앙에
 *      "트루 엔딩 첫 해금 시 잠금해제" 반투명 토스트 표시.
 *   2. 잠금해제 OFF(autoPlayUnlocked=true && autoPlayEnabled=false): ▶ 아이콘. 클릭 시 ON.
 *   3. 잠금해제 ON(autoPlayUnlocked=true && autoPlayEnabled=true): ⏸ 아이콘. 클릭 시 OFF.
 *
 * 노출 조건은 SceneRenderer가 결정 — runtimeMode in {scene, kakao, cg} && 오버레이 메뉴 미열림.
 */

import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

const TOAST_DURATION_MS = 500;

export function AutoPlayButton() {
  const autoPlayUnlocked = useSettingsStore((s) => s.autoPlayUnlocked);
  const autoPlayEnabled = useSettingsStore((s) => s.autoPlayEnabled);
  const setSetting = useSettingsStore((s) => s.set);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (!autoPlayUnlocked) {
      // 잠금 상태 — 안내 토스트만 0.5초 표시.
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
      setShowToast(true);
      toastTimerRef.current = window.setTimeout(() => {
        setShowToast(false);
        toastTimerRef.current = null;
      }, TOAST_DURATION_MS);
      return;
    }
    setSetting('autoPlayEnabled', !autoPlayEnabled);
  };

  const icon = !autoPlayUnlocked ? '🔒' : autoPlayEnabled ? '⏸' : '▶';
  const ariaLabel = !autoPlayUnlocked
    ? '자동재생 잠김'
    : autoPlayEnabled
      ? '자동재생 끄기'
      : '자동재생 켜기';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        data-testid="autoplay-button"
        className="absolute flex items-center justify-center select-none transition-colors"
        style={{
          top: 12,
          left: 12,
          width: 36,
          height: 36,
          borderRadius: 8,
          background: autoPlayEnabled ? 'rgba(80, 200, 160, 0.85)' : 'rgba(0, 0, 0, 0.45)',
          color: '#fff',
          fontSize: 16,
          lineHeight: 1,
          zIndex: 'var(--z-toast)',
          opacity: autoPlayUnlocked ? 1 : 0.6,
        }}
      >
        {icon}
      </button>
      {showToast && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 13,
            zIndex: 'var(--z-toast)',
          }}
          data-testid="autoplay-locked-toast"
        >
          트루 엔딩 첫 해금 시 잠금해제
        </div>
      )}
    </>
  );
}
