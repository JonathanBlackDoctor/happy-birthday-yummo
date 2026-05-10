import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

const BG_ALIAS: Record<string, string> = {};
const DISSOLVE_MS = 800;
const DISSOLVE_STEPS = 24;

interface Layer {
  id: string;
  src: string;
  opacity: number;
}

/**
 * BG 디졸브 — 두 레이어 crossfade.
 * 새 이미지 onload 완료 후에야 디졸브 시작 (캐시 미스로 빈 화면 잠깐 보이는 문제 회피).
 * step 기반 setState로 prefers-reduced-motion 환경에서도 정상 페이드.
 */
export function BackgroundLayer() {
  const bg = useGameStore((s) => s.bg);
  const [layers, setLayers] = useState<Layer[]>([]);
  const prevSrcRef = useRef<string | null>(null);

  useEffect(() => {
    if (!bg.image) {
      setLayers([]);
      prevSrcRef.current = null;
      return;
    }
    const resolved = BG_ALIAS[bg.image] ?? bg.image;
    const newSrc = `/img/bg/${resolved}.webp`;
    if (prevSrcRef.current === newSrc) return;

    if (prevSrcRef.current === null) {
      setLayers([{ id: `${newSrc}-${Date.now()}`, src: newSrc, opacity: 1 }]);
      prevSrcRef.current = newSrc;
      return;
    }

    const prevSrc = prevSrcRef.current;
    const newId = `${newSrc}-${Date.now()}`;
    let cancelled = false;
    const timers: number[] = [];

    const startDissolve = () => {
      if (cancelled) return;
      // 새 레이어를 opacity 0으로 마운트 (이전 레이어 그대로 유지 → 빈 프레임 X)
      setLayers([
        { id: `prev-${Date.now()}`, src: prevSrc, opacity: 1 },
        { id: newId, src: newSrc, opacity: 0 },
      ]);
      const stepMs = Math.floor(DISSOLVE_MS / DISSOLVE_STEPS);
      for (let i = 1; i <= DISSOLVE_STEPS; i++) {
        const id = window.setTimeout(() => {
          if (cancelled) return;
          const op = i / DISSOLVE_STEPS;
          setLayers((cur) => {
            if (cur.length < 2) return cur;
            return [cur[0], { ...cur[1], opacity: op }];
          });
          if (i === DISSOLVE_STEPS) {
            setLayers([{ id: newId, src: newSrc, opacity: 1 }]);
          }
        }, i * stepMs);
        timers.push(id);
      }
    };

    // 새 이미지 사전 로드. 성공/실패 무관 디졸브 시작 (자산 부재 시도 이전 BG 유지하면서 점진 전환)
    const probe = new Image();
    probe.onload = startDissolve;
    probe.onerror = startDissolve;
    probe.src = newSrc;

    prevSrcRef.current = newSrc;

    return () => {
      cancelled = true;
      timers.forEach((id) => clearTimeout(id));
    };
  }, [bg.image]);

  if (!bg.image && layers.length === 0) {
    return <div className="absolute inset-0 bg-bg" style={{ zIndex: 'var(--z-bg)' }} />;
  }

  return (
    <div
      className="absolute inset-0 bg-bg overflow-hidden"
      style={{ zIndex: 'var(--z-bg)' }}
    >
      {layers.map((layer) => (
        <img
          key={layer.id}
          src={layer.src}
          alt=""
          ref={(el) => {
            if (el) el.setAttribute('fetchpriority', 'high');
          }}
          loading="eager"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.06)',
            transformOrigin: 'top left',
            opacity: layer.opacity,
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ))}
    </div>
  );
}
