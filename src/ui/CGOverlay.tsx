import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

const CG_MIN_LOCK_MS = 1000;

/**
 * CG 오버레이 — 풀스크린 이벤트 CG.
 * 등장 후 최소 1초간 advance 잠금 (PM 결정 라운드 #4 → 2026-05-08 단축) — 짧은 클릭으로 휙 지나가는 것 방지.
 */
export function CGOverlay() {
  const cg = useGameStore((s) => s.cg);
  const advance = useGameStore((s) => s.advance);
  const [unlocked, setUnlocked] = useState(false);
  const cgIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cg) {
      setUnlocked(false);
      cgIdRef.current = null;
      return undefined;
    }
    if (cgIdRef.current === cg.cgId) return undefined;
    cgIdRef.current = cg.cgId;
    setUnlocked(false);
    const t = setTimeout(() => setUnlocked(true), CG_MIN_LOCK_MS);
    return () => clearTimeout(t);
  }, [cg]);

  if (!cg) return null;

  return (
    <button
      type="button"
      className="absolute inset-0 w-full h-full bg-black disabled:cursor-not-allowed"
      style={{ zIndex: 'var(--z-cg)' }}
      onClick={() => {
        if (unlocked) void advance();
      }}
      disabled={!unlocked}
      aria-label={unlocked ? '다음으로 진행' : 'CG 감상 중'}
    >
      <img
        src={`/img/cg/${cg.image}.webp`}
        alt={cg.cgId}
        ref={(el) => { if (el) el.setAttribute('fetchpriority', 'high'); }}
        loading="eager"
        decoding="async"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </button>
  );
}
