/**
 * 캐릭터 이미지 갤러리 — UI-SPEC §7.4 (2026-05-10 신규 라운드).
 *
 * - 인물별 섹션 (주인공 / 히로인 5명 / NPC 친구) + 인물 헤더 + 그리드
 * - 해금된 스프라이트만 풀컬러, 미해금은 회색 자물쇠 (CGGallery 패턴 미러)
 * - 클릭 → 풀스크린 보기 (어두운 보라 배경 + 중앙 정렬 + 외부 클릭 닫힘)
 * - 해금: gameStore.applyCommand의 CHARACTER 분기에서 metaStore.unlockSprite(cmd.sprite) 자동 호출
 */

import { useState } from 'react';
import { useMetaStore } from '@/stores/metaStore';
import { SPRITE_CATALOG, ALL_SPRITE_IDS, spriteVariantLabel } from '@/data/spriteCatalog';

export function SpriteGallery() {
  const unlocked = useMetaStore((s) => s.unlocked_sprites);
  const newlyUnlocked = useMetaStore((s) => s.newly_unlocked_sprites);
  const [openId, setOpenId] = useState<string | null>(null);

  const total = ALL_SPRITE_IDS.length;
  const unlockedCount = ALL_SPRITE_IDS.filter((id) => unlocked.includes(id)).length;

  return (
    <div>
      <div className="mb-4 text-text-light">
        해금: {unlockedCount} / {total}
      </div>

      {SPRITE_CATALOG.map((char) => {
        const charUnlocked = char.sprites.filter((s) => unlocked.includes(s)).length;
        return (
          <section key={char.prefix} className="mb-6">
            <div className="flex items-baseline justify-between mb-2 border-b border-text-light/30 pb-1">
              <h3 className="text-lg font-bold">{char.name}</h3>
              <span className="text-xs text-text-light">
                {charUnlocked} / {char.sprites.length}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {char.sprites.map((id) => {
                const isUnlocked = unlocked.includes(id);
                const variant = spriteVariantLabel(id);
                if (!isUnlocked) {
                  return (
                    <div
                      key={id}
                      className="aspect-[3/4] rounded-lg bg-text-light/30 flex flex-col items-center justify-center text-text-light/70 text-xs gap-1 px-1"
                      title={id}
                    >
                      <span className="text-2xl">🔒</span>
                      <span className="opacity-70 text-[10px] truncate w-full text-center">
                        {variant}
                      </span>
                    </div>
                  );
                }
                const isNew = newlyUnlocked.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOpenId(id)}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden bg-text-light/10 hover:scale-[1.04] transition-transform focus:outline-none focus:ring-2 focus:ring-accent flex flex-col"
                    data-testid={`sprite-slot-${id}`}
                    title={id}
                  >
                    <div className="flex-1 flex items-end justify-center overflow-hidden">
                      <img
                        src={`img/sprites/${id}.webp`}
                        alt={id}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full object-contain object-bottom"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-text-light bg-bg/70 py-1 px-1 truncate text-center">
                      {variant}
                    </div>
                    {isNew && (
                      <span
                        data-testid={`sprite-slot-${id}-new`}
                        className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(245,215,110,0.95)',
                          color: '#1f1822',
                          boxShadow: '0 0 8px rgba(245,215,110,0.6)',
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {openId && (
        <button
          type="button"
          className="fixed inset-0 bg-black/90 flex items-center justify-center"
          style={{ zIndex: 'var(--z-toast)' }}
          onClick={() => setOpenId(null)}
          aria-label="닫기"
          data-testid="sprite-fullscreen"
        >
          <img
            src={`img/sprites/${openId}.webp`}
            alt={openId}
            decoding="async"
            className="max-w-[95%] max-h-[95%] object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </button>
      )}
    </div>
  );
}
