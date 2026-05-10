/**
 * 미니 하트 도트 — ±1~2 작은 호감도 변동 시 풍성 온도계 대신 표시.
 *
 * 박스/이름 없이 ♥ 아이콘 + 변화량(+1, -2)만. 0.6초 짧게 페이드.
 * 부모(AffectionToastStack)가 mount/unmount + 우측 계단식 위치 결정.
 */

import { useEffect, useState } from 'react';
import { HEROINES } from '@/data/characters';
import type { AffinityTargetId } from '@/engine/types';

const NPC_NAME: Record<string, string> = {
  gyumin: '김규민',
  gyeongmin: '표경민',
  nathan: '조나단',
  wook: '정욱',
  junhyuk: '오준혁',
  mom: '엄마',
  taeho: '이태호 교수',
};
function resolveName(target: AffinityTargetId): string {
  if (target in NPC_NAME) return NPC_NAME[target];
  return HEROINES[target as 'H1' | 'H2' | 'H3' | 'H4' | 'H5'].name;
}

const FADE_IN_MS = 150;
const HOLD_END_MS = 1850; // FADE_IN(150) + HOLD(1700)
const FADE_OUT_MS = 150;

export interface AffectionMiniDotProps {
  heroine: AffinityTargetId;
  delta: number;
  /** lifecycle 트리거를 위한 이벤트 ID — 같은 prop 변화로 카드가 갱신될 때 페이즈 리셋 */
  eventId: string;
}

export function AffectionMiniDot({ heroine, delta, eventId }: AffectionMiniDotProps) {
  // setTimeout + CSS transition 기반 — RAF freeze 환경에서도 작동.
  const [phase, setPhase] = useState<'pre' | 'visible' | 'exit'>('pre');

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setPhase('visible'), 16);
    const exitTimer = window.setTimeout(() => setPhase('exit'), HOLD_END_MS);
    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
    };
  }, [eventId]);

  const opacity = phase === 'visible' ? 1 : 0;
  const transitionDur = phase === 'visible' ? FADE_IN_MS : FADE_OUT_MS;

  const sign = delta > 0 ? '+' : '';
  const color = delta > 0 ? 'var(--toast-delta-up, #E64178)' : 'var(--toast-delta-down, #8A6B7A)';

  return (
    <div
      role="status"
      aria-label={`${resolveName(heroine)} ${sign}${delta}`}
      style={{
        opacity,
        transition: `opacity ${transitionDur}ms ease`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 10px rgba(216,80,140,0.35))',
      }}
    >
      <svg width={22} height={22} viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 14s-5.5-3.4-5.5-7.2A3.3 3.3 0 0 1 8 4a3.3 3.3 0 0 1 5.5 2.8C13.5 10.6 8 14 8 14z"
          fill={color}
        />
      </svg>
      <span
        style={{
          color,
          fontWeight: 800,
          fontSize: 18,
          textShadow: `0 0 6px ${color}55, 0 1px 2px rgba(0,0,0,0.25)`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {sign}
        {delta}
      </span>
    </div>
  );
}
