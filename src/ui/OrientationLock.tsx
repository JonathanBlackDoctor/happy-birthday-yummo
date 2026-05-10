/**
 * 세로모드 회전 안내 오버레이 — UI-SPEC §10 + MASTER-PLAN §5.5.
 *
 * 모바일/태블릿 (`pointer: coarse`) + 세로 (`orientation: portrait`) 시
 * 풀스크린 오버레이로 가로 회전 안내. CSS 미디어 쿼리만으로 표시 토글.
 *
 * z-index = var(--z-toast) (400) → 게임 위 덮음 → pointer-events 자동 차단으로
 * 게임 일시정지 효과 달성. 회전 시 자동 해제.
 *
 * 데스크톱(fine pointer) 세로 모니터에서는 표시 X.
 */
export function OrientationLock() {
  return (
    <div className="orientation-lock-overlay" role="alert" aria-live="polite">
      <div className="orientation-lock-icon" aria-hidden="true">
        🔄
      </div>
      <div className="orientation-lock-message">가로로 회전해주세요</div>
      <div className="orientation-lock-sub">게임이 일시정지됩니다</div>
    </div>
  );
}
