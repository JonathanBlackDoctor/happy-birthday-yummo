/**
 * 선택지 UI — SCENE-FORMAT §1.3 + UI-SPEC §2.
 * 클릭 시 store.pickChoice → effects 적용 + next 점프.
 */

import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';

export function ChoiceList() {
  const cmd = useGameStore((s) => s.currentCommand);
  const pickChoice = useGameStore((s) => s.pickChoice);

  // 매 진입 시 1회 셔플. data-testid·pickChoice 인자는 원본 인덱스 유지(e2e 호환).
  const order = useMemo(() => {
    if (!cmd || cmd.type !== 'CHOICE') return [];
    const arr = cmd.choices.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [cmd]);

  if (!cmd || cmd.type !== 'CHOICE') return null;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(58, 46, 63, 0.5)' }}
      data-testid="choice-list"
    >
      {order.map((origIdx) => {
        const c = cmd.choices[origIdx];
        return (
          <button
            key={`${c.text}-${origIdx}`}
            type="button"
            data-testid={`choice-${origIdx}`}
            onClick={() => {
              audioManager.playSfx('sfx_click');
              void pickChoice(origIdx);
            }}
            className="min-w-[60%] max-w-[80%] text-text font-semibold transition-colors hover:brightness-95"
            style={{
              padding: 'var(--btn-padding)',
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              borderRadius: 'var(--btn-radius)',
              fontSize: 'var(--font-size-text)',
              border: 'none',
            }}
          >
            {c.text}
          </button>
        );
      })}
    </div>
  );
}
