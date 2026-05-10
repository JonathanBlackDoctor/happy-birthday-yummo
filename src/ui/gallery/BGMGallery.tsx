/**
 * BGM 갤러리 — UI-SPEC §7.2.
 *
 * - 8트랙 BGM-list.md SSoT 미러 (BGM_CATALOG)
 * - 해금된 트랙만 재생 가능, 재생 중은 민트 배경
 */

import { useState } from 'react';
import { useMetaStore } from '@/stores/metaStore';
import { BGM_CATALOG } from '@/data/bgmCatalog';
import { audioManager } from '@/engine/audioManager';

export function BGMGallery() {
  // 2026-05-09 W5 메뉴 사이클 라운드 — STATE-SCHEMA §4 MetaData(metaStore)로 이관 완료.
  const unlocked = useMetaStore((s) => s.unlocked_bgms);
  const [playing, setPlaying] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    if (playing === id) {
      audioManager.stopBgm({ fade: 2 });
      setPlaying(null);
    } else {
      audioManager.playBgm(id, { fade: 2 });
      setPlaying(id);
    }
  };

  return (
    <ul className="space-y-2 max-w-2xl">
      {BGM_CATALOG.map((track) => {
        const isUnlocked = unlocked.includes(track.id);
        const isPlaying = playing === track.id;
        return (
          <li
            key={track.id}
            className="flex items-center gap-4 p-3 rounded-lg"
            style={{
              background: isPlaying ? 'var(--color-mint)' : 'transparent',
              opacity: isUnlocked ? 1 : 0.4,
            }}
          >
            <button
              type="button"
              disabled={!isUnlocked}
              onClick={() => togglePlay(track.id)}
              className="w-10 h-10 rounded-full bg-accent text-text font-bold disabled:opacity-50"
              aria-label={isPlaying ? '정지' : '재생'}
            >
              {isPlaying ? '■' : '▶'}
            </button>
            <div className="flex-1">
              <div className="font-semibold">{track.title}</div>
              <div className="text-sm text-text-light">
                {track.composer} · {track.license} · {track.description}
              </div>
            </div>
            <div className="text-xs text-text-light">
              {Math.floor(track.durationSeconds / 60)}:
              {String(track.durationSeconds % 60).padStart(2, '0')}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
