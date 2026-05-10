/**
 * 백로그 — 최근 100개 텍스트 (UI-SPEC §3 미니 컨트롤 → Log 버튼).
 *
 * 자산 통합 검증 라운드 후속 ②a (2026-05-08 PM 결정): 백로그 오픈 시 sfx_pageturn 재생 (페이지 넘김 톤).
 */

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';

export function Backlog() {
  const history = useGameStore((s) => s.history);
  const close = useGameStore((s) => s.setBacklogOpen);

  useEffect(() => {
    audioManager.playSfx('sfx_pageturn');
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(58, 46, 63, 0.85)' }}
      onClick={() => close(false)}
    >
      <div
        className="bg-bg text-text rounded-2xl max-w-[80%] max-h-[80%] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">백로그</h2>
        <ul className="space-y-2">
          {history.map((h, i) => (
            <li key={`${h.timestamp}-${i}`} className="border-b border-text-light/30 pb-2">
              {h.speaker && <span className="font-semibold mr-2">{h.speaker}</span>}
              <span className={h.type === 'monologue' ? 'italic opacity-80' : ''}>{h.text}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-accent text-text rounded-lg"
          onClick={() => close(false)}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
