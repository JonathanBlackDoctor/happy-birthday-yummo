/**
 * 답장 타이머 — H4 거절 엔딩 핵심 미니게임.
 * UI-SPEC §6.2 + ANIMATION-SPEC §8 + STORY-BIBLE §7.1.
 *
 * - 3초 카운트다운 (2026-05-09 사용자 결정: 15s→3s 단축. 패배 기준 명확화)
 * - 마지막 1초 빨간 펄스
 * - 만료: sfx_timer_out + late_reply_count++ (호출자가 처리)
 *   late_reply_count >= 1이면 evaluateRoute가 즉시 END_H4_REJECT 강제.
 */

import { useEffect, useState } from 'react';
import { audioManager } from '@/engine/audioManager';

interface Props {
  seconds?: number;
  onTimeout: () => void;
  onCancel?: () => void;
}

const DEFAULT_SECONDS = 3;

export function ReplyTimer({ seconds = DEFAULT_SECONDS, onTimeout, onCancel }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expired) {
        setExpired(true);
        audioManager.playSfx('sfx_timer_out');
        onTimeout();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, expired, onTimeout]);

  const fraction = remaining / seconds;
  const isDanger = remaining <= 1 && remaining > 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-bg/90">
      <ProgressRing fraction={fraction} danger={isDanger} />
      <div className="text-sm">
        <div className={isDanger ? 'text-danger font-bold animate-pulse' : ''}>
          답장 {remaining}초
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-text-light underline mt-1"
          >
            (답장 보류)
          </button>
        )}
      </div>
    </div>
  );
}

function ProgressRing({ fraction, danger }: { fraction: number; danger: boolean }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);
  return (
    <svg width={40} height={40} viewBox="0 0 40 40">
      <circle
        cx={20}
        cy={20}
        r={radius}
        fill="none"
        stroke="var(--color-text-light)"
        strokeWidth={3}
        opacity={0.3}
      />
      <circle
        cx={20}
        cy={20}
        r={radius}
        fill="none"
        stroke={danger ? 'var(--color-danger)' : 'var(--color-mint-dark)'}
        strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}
