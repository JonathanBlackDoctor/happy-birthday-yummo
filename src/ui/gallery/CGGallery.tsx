/**
 * CG 갤러리 — UI-SPEC §7.1.
 *
 * - 그리드 4열 (PC) / 2열 (모바일)
 * - 풀스크린 보기 시 워터마크 crop된 `*_full.webp` 사용 (MASTER-PLAN §5.3)
 * - 미해금 슬롯은 회색 자물쇠 표시
 *
 * 본 라운드는 placeholder — 실제 CG 목록은 `04-image-prompts/event-cgs/cg-list.md` (W3 산출물).
 */

import { useState } from 'react';
import { useMetaStore } from '@/stores/metaStore';

// W3 산출물 cg-list.md 정합 (5명 × 4컷 = 20장 placeholder)
const CG_PLACEHOLDERS: readonly string[] = [
  'cg_serin_first_meet', 'cg_serin_lab_late', 'cg_serin_dongsan', 'cg_serin_true',
  'cg_hajeong_classroom', 'cg_hajeong_library', 'cg_hajeong_hands', 'cg_hajeong_true',
  'cg_seol_lab', 'cg_seol_late_night', 'cg_seol_chemistry', 'cg_seol_true',
  'cg_seoyoon_first_meet', 'cg_seoyoon_date', 'cg_seoyoon_kakao', 'cg_seoyoon_true',
  'cg_yuna_underclass', 'cg_yuna_festival', 'cg_yuna_confession', 'cg_yuna_true',
] as const;

export function CGGallery() {
  // 2026-05-09 W5 메뉴 사이클 라운드 — STATE-SCHEMA §4 MetaData(metaStore)로 이관 완료.
  const unlocked = useMetaStore((s) => s.unlocked_cgs);
  const [openCgId, setOpenCgId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CG_PLACEHOLDERS.map((id) => {
          const isUnlocked = unlocked.includes(id);
          return (
            <button
              key={id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => setOpenCgId(id)}
              className="aspect-video rounded-lg overflow-hidden bg-text-light/20 disabled:opacity-50 hover:scale-[1.03] transition-transform"
            >
              {isUnlocked ? (
                <img
                  src={`/img/cg/${id}.webp`}
                  alt={id}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-light text-2xl">
                  🔒
                </div>
              )}
            </button>
          );
        })}
      </div>

      {openCgId && (
        <button
          type="button"
          className="fixed inset-0 bg-black/90 flex items-center justify-center"
          style={{ zIndex: 'var(--z-toast)' }}
          onClick={() => setOpenCgId(null)}
          aria-label="닫기"
        >
          <img
            src={`/img/cg/${openCgId}_full.webp`}
            alt={openCgId}
            ref={(el) => { if (el) el.setAttribute('fetchpriority', 'high'); }}
            decoding="async"
            className="max-w-[95%] max-h-[95%] object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </button>
      )}
    </>
  );
}
