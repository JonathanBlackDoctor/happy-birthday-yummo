/**
 * 엔딩 리스트 — UI-SPEC §7.3.
 *
 * - 16개 슬롯 그리드 (END_SOLO_SUMMER 포함)
 * - 미해금 슬롯은 ??? 표시
 * - 해금 슬롯: 1:1 정사각 자산(/img/ending-square/{id}.webp) 썸네일 + 메타 텍스트
 * - 해금 슬롯 클릭 시 EndingHistoryModal 노출 (점수 내역 표) — 2026-05-10 PM 신규
 */

import { useState } from 'react';
import { useMetaStore } from '@/stores/metaStore';
import { ENDING_CATALOG } from '@/data/endings';
import { EndingHistoryModal } from './EndingHistoryModal';
import type { EndingId } from '@/engine/types';

export function EndingGallery() {
  // 2026-05-09 W5 메뉴 사이클 라운드 — STATE-SCHEMA §4 MetaData(metaStore)로 이관 완료.
  // EndingScreen 마운트 시 metaStore.recordEnding이 자동 push (해금 + 점수 히스토리).
  const unlocked = useMetaStore((s) => s.unlocked_endings);
  const [openId, setOpenId] = useState<EndingId | null>(null);

  const total = ENDING_CATALOG.length;
  const unlockedCount = unlocked.length;

  return (
    <div>
      <div className="mb-4 text-text-light">
        해금: {unlockedCount} / {total}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ENDING_CATALOG.map((e) => {
          const isUnlocked = unlocked.includes(e.id);
          if (!isUnlocked) {
            return (
              <div
                key={e.id}
                className="aspect-square rounded-lg p-4 flex flex-col items-center justify-center text-center"
                style={{
                  background: 'var(--color-text-light)',
                  color: '#fff',
                  opacity: 0.5,
                }}
              >
                <div className="text-3xl">???</div>
              </div>
            );
          }
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setOpenId(e.id)}
              className="aspect-square rounded-lg overflow-hidden relative cursor-pointer hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ background: 'var(--color-accent)' }}
              data-testid={`ending-slot-${e.id}`}
            >
              {/* 1:1 썸네일 — 자산 누락 시 onError 숨김 (배경 색만 노출) */}
              <img
                src={`/img/ending-square/${e.id}.webp`}
                alt={e.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* 어두운 보라 반투명 + 텍스트 (가독성) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center"
                style={{
                  background: 'linear-gradient(to top, rgba(31,24,34,0.85) 0%, rgba(31,24,34,0.35) 60%, rgba(31,24,34,0.0) 100%)',
                  color: '#FFF8FA',
                }}
              >
                <div
                  className="text-[10px] tracking-widest opacity-80"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                >
                  {e.category}
                </div>
                <div
                  className="font-bold text-sm mt-0.5"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                >
                  {e.title}
                </div>
                {e.subtitle && (
                  <div
                    className="text-xs opacity-90 mt-0.5"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                  >
                    {e.subtitle}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {openId && <EndingHistoryModal endingId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
