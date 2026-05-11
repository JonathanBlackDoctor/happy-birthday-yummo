/**
 * 세로모드 안내 토스트 — UI-SPEC §10 + MASTER-PLAN §5.5 (모바일 QA 2026-05-11 처방).
 *
 * 변경 이력:
 * - 이전: portrait + coarse pointer 동안 풀스크린 불투명 오버레이 + "가로로 회전해주세요 / 게임이 일시정지됩니다".
 *   → 세로 모드에서 플레이 자체가 막혀 작은 폰 사용자가 답답.
 * - 현재: 세션당 1회만 상단 토스트 "가로 버전 플레이를 추천합니다" 2초 노출 후 자동 페이드아웃.
 *   세로 모드에서도 게임 입력이 그대로 동작 (pointer-events: none).
 *
 * 표시 트리거: matchMedia('(pointer: coarse) and (orientation: portrait)') 첫 매칭 1회.
 * 세션 플래그(sessionStorage)로 새로고침 전까지 재노출 차단. 새로고침 시 다시 한 번 보임.
 */

import { useEffect, useState } from 'react';

const SESSION_KEY = 'kmu-portrait-toast-shown';

export function OrientationLock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    const mq = window.matchMedia('(pointer: coarse) and (orientation: portrait)');

    let hideTimer: number | undefined;

    const trigger = () => {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
      sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(true);
      hideTimer = window.setTimeout(() => setVisible(false), 2000);
    };

    if (mq.matches) {
      trigger();
    } else {
      const onChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          trigger();
          mq.removeEventListener('change', onChange);
        }
      };
      mq.addEventListener('change', onChange);
      return () => {
        mq.removeEventListener('change', onChange);
        if (hideTimer) window.clearTimeout(hideTimer);
      };
    }

    return () => {
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="orientation-lock-overlay" role="status" aria-live="polite">
      <div className="orientation-lock-icon" aria-hidden="true">
        🔄
      </div>
      <div className="orientation-lock-message">가로 버전 플레이를 추천합니다</div>
    </div>
  );
}
