/**
 * 엔딩 점수 카드 안 액체 채움 SVG 레이어 (Animated 패널 전용).
 *
 * 우측 점수 카드 안에 절대 위치로 깔리는 SVG 레이어:
 *   - 핑크 그라디언트 액체 (#FF4F90 → #FFD9E5)
 *   - <feTurbulence> + <feDisplacementMap>로 표면 일렁임 (turbulenceAmp 0~1)
 *   - bubbles: 액체 안에서 위로 떠오르는 거품 입자 (RAF 자체 관리)
 *   - overflow 입자: 100% 도달 시 표면에서 위로 튀어나가는 골드 입자 (RAF 자체 관리)
 *
 * fillPct: 0~1 (target). spring으로 부드럽게 보간.
 * turbulenceAmp: 0~1 (target). 평소 0.3, Phase 2/4 부풀음 순간 0.8까지.
 *
 * 카드 내부에 `position: absolute; inset: 0; pointer-events: none;`로 깔린다.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { createSpring } from './spring';

export interface EndingLiquidBoxProps {
  /** 0~1 채움 비율 (S컷 550점 = 1). spring으로 부드러운 보간. */
  fillPct: number;
  /** 0~1 표면 일렁임 진폭. 평소 0.3, 부풀음 시 0.8. */
  turbulenceAmp?: number;
  /** 100% 도달 시 골드 입자 분파 + boxShadow glow. */
  overflowActive?: boolean;
  /** 비주얼 강도. reduced-motion 시 'still'(turbulence·bubbles 0). */
  intensity?: 'rich' | 'still';
}

interface Bubble {
  id: number;
  x: number; // 0~1 (액체 영역 내 가로 비율)
  y: number; // 0~1 (액체 영역 내 세로 비율, 1=바닥, 0=수면)
  r: number; // px
  vy: number; // y/sec (음수 = 위로)
  bornAt: number;
}

interface OverflowParticle {
  id: number;
  x: number; // px (카드 가로 중심 ±)
  y: number; // px (카드 위에서 음수, 양수면 카드 안)
  vx: number;
  vy: number;
  bornAt: number;
}

const BUBBLE_TARGET_COUNT = 5;
const BUBBLE_LIFETIME_MS = 3000;
const OVERFLOW_SPAWN_INTERVAL_MS = 180;

export function EndingLiquidBox({
  fillPct,
  turbulenceAmp = 0.3,
  overflowActive = false,
  intensity = 'rich',
}: EndingLiquidBoxProps) {
  const reactId = useId();
  const filterId = `liquidTurb-${reactId}`;
  const gradId = `liquidGrad-${reactId}`;
  const clipId = `liquidClip-${reactId}`;

  const [displayFillPct, setDisplayFillPct] = useState(0);
  const [displayTurbAmp, setDisplayTurbAmp] = useState(0.3);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [overflows, setOverflows] = useState<OverflowParticle[]>([]);
  const lastTsRef = useRef<number | null>(null);
  const overflowAccRef = useRef<number>(0);
  const bubbleIdRef = useRef<number>(0);
  const overflowIdRef = useRef<number>(0);
  const fillSpringRef = useRef(createSpring({ from: 0, to: 0, stiffness: 120, damping: 16 }));
  const turbSpringRef = useRef(createSpring({ from: 0.3, to: 0.3, stiffness: 200, damping: 18 }));

  // fillPct prop 변경 시 spring target 갱신.
  useEffect(() => {
    if (intensity === 'still') {
      setDisplayFillPct(fillPct);
      return;
    }
    fillSpringRef.current = createSpring({
      from: fillSpringRef.current.current(),
      to: fillPct,
      stiffness: 120,
      damping: 16,
    });
  }, [fillPct, intensity]);

  useEffect(() => {
    if (intensity === 'still') {
      setDisplayTurbAmp(0);
      return;
    }
    turbSpringRef.current = createSpring({
      from: turbSpringRef.current.current(),
      to: turbulenceAmp,
      stiffness: 180,
      damping: 18,
    });
  }, [turbulenceAmp, intensity]);

  // RAF 루프: spring step + bubbles + overflow particles
  useEffect(() => {
    if (intensity === 'still') return;
    let cancelled = false;
    let rafId = 0;

    const tick = (ts: number) => {
      if (cancelled) return;
      const dtMs = lastTsRef.current === null ? 16 : ts - lastTsRef.current;
      lastTsRef.current = ts;
      const dt = dtMs / 1000;

      // fill spring step
      const fillStep = fillSpringRef.current.step(dtMs);
      setDisplayFillPct(fillStep.value);

      // turbulence spring step
      const turbStep = turbSpringRef.current.step(dtMs);
      setDisplayTurbAmp(turbStep.value);

      // bubbles: 위로 이동, 수면(y<=0) 도달 또는 lifetime 초과 시 제거. 부족하면 spawn.
      setBubbles((prev) => {
        const updated: Bubble[] = [];
        for (const b of prev) {
          const ny = b.y + b.vy * dt;
          const age = ts - b.bornAt;
          if (ny > 0 && age < BUBBLE_LIFETIME_MS) {
            updated.push({ ...b, y: ny });
          }
        }
        // spawn to target count if liquid 존재
        const fp = fillStep.value;
        const targetCount = fp > 0.05 ? BUBBLE_TARGET_COUNT : 0;
        while (updated.length < targetCount) {
          updated.push({
            id: bubbleIdRef.current++,
            x: 0.1 + Math.random() * 0.8,
            y: 0.85 + Math.random() * 0.1,
            r: 1.2 + Math.random() * 1.6,
            vy: -(0.05 + Math.random() * 0.08),
            bornAt: ts,
          });
        }
        return updated;
      });

      // overflow particles: overflowActive면 일정 간격으로 spawn, 자체 중력으로 떨어짐
      if (overflowActive) {
        overflowAccRef.current += dtMs;
        while (overflowAccRef.current >= OVERFLOW_SPAWN_INTERVAL_MS) {
          overflowAccRef.current -= OVERFLOW_SPAWN_INTERVAL_MS;
          setOverflows((prev) => [
            ...prev,
            {
              id: overflowIdRef.current++,
              x: (Math.random() - 0.5) * 0.6, // -0.3 ~ 0.3 (카드 가로 비율)
              y: 0,
              vx: (Math.random() - 0.5) * 80,
              vy: -200 - Math.random() * 100,
              bornAt: ts,
            },
          ]);
        }
      } else {
        overflowAccRef.current = 0;
      }

      // overflow 입자 물리 업데이트 (gravity ~600 px/s²)
      setOverflows((prev) => {
        const updated: OverflowParticle[] = [];
        for (const p of prev) {
          const age = ts - p.bornAt;
          if (age > 1500) continue;
          updated.push({
            ...p,
            x: p.x + (p.vx * dt) / 200,
            y: p.y + p.vy * dt,
            vy: p.vy + 600 * dt,
          });
        }
        return updated;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      lastTsRef.current = null;
    };
  }, [intensity, overflowActive]);

  // SVG 좌표는 viewBox 0 0 100 100 비율로 정규화. 부모 카드 크기 채움.
  const fillY = 100 - displayFillPct * 100;
  const fillH = displayFillPct * 100;
  const baseFreq = 0.012 + displayTurbAmp * 0.04;
  const dispScale = 2 + displayTurbAmp * 14;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        borderRadius: 'inherit',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          borderRadius: 'inherit',
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF4F90" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#FF8AB8" stopOpacity="0.78" />
            <stop offset="1" stopColor="#FFD9E5" stopOpacity="0.72" />
          </linearGradient>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFreq}
              numOctaves={2}
              seed={4}
              result="turb"
            />
            <feDisplacementMap in="SourceGraphic" in2="turb" scale={dispScale} />
          </filter>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="100" height="100" rx="0.8" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* 액체 본체 */}
          <rect
            x="-2"
            y={fillY}
            width="104"
            height={fillH + 4}
            fill={`url(#${gradId})`}
            filter={intensity === 'rich' ? `url(#${filterId})` : undefined}
            opacity={fillH > 0 ? 1 : 0}
          />
          {/* 수면 하이라이트 */}
          {fillH > 1 && (
            <rect
              x="0"
              y={fillY - 0.6}
              width="100"
              height="1.2"
              fill="#FFE5EE"
              opacity="0.55"
              filter={intensity === 'rich' ? `url(#${filterId})` : undefined}
            />
          )}

          {/* bubbles — 액체 영역 내 좌표 (fillH 기준) */}
          {fillH > 1 &&
            bubbles.map((b) => {
              // bubble.y 0~1 (1=바닥, 0=수면) → 화면 y = fillY + b.y * fillH
              const cy = fillY + b.y * fillH;
              const cx = b.x * 100;
              const opacity = Math.min(1, b.y * 1.3) * 0.55;
              return (
                <circle
                  key={b.id}
                  cx={cx}
                  cy={cy}
                  r={b.r * 0.6}
                  fill="#FFFFFF"
                  opacity={opacity}
                />
              );
            })}
        </g>

        {/* overflow 골드 입자 (clip 바깥 — 카드 위로 튀어나감) */}
        {overflows.map((p) => (
          <circle
            key={p.id}
            cx={50 + p.x * 100}
            cy={p.y * 0.1 + (50 - displayFillPct * 50)}
            r={1.4}
            fill="#FFD86B"
            opacity={Math.max(0, 1 - (Date.now() - p.bornAt) / 1500)}
          />
        ))}
      </svg>
    </div>
  );
}
