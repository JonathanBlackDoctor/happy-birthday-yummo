/**
 * 갤러리 — UI-SPEC §7. 탭 구조 (하이라이트 / 캐릭터 이미지 / BGM / 엔딩).
 *
 * 2026-05-10 PM 정정: 'CG' 라벨 → '하이라이트' 변경 + '캐릭터 이미지' 탭 신규(SpriteGallery).
 */

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useMetaStore } from '@/stores/metaStore';
import { CGGallery } from './CGGallery';
import { BGMGallery } from './BGMGallery';
import { EndingGallery } from './EndingGallery';
import { SpriteGallery } from './SpriteGallery';
import { MiniControls } from '@/ui/MiniControls';

type Tab = 'ending' | 'cg' | 'sprite' | 'bgm';

// 2026-05-10 PM 정정: 첫 탭 = '엔딩' (사용자 의도 — 가장 의미 있는 정보가 먼저).
const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'ending', label: '엔딩' },
  { id: 'cg', label: '하이라이트' },
  { id: 'sprite', label: '캐릭터 이미지' },
  { id: 'bgm', label: 'BGM' },
];

export function GalleryScreen() {
  const close = useGameStore((s) => s.setGalleryOpen);
  const markSpritesSeen = useMetaStore((s) => s.markSpritesSeen);
  const [tab, setTab] = useState<Tab>('ending');

  // 닫기 클릭 시 NEW 뱃지 큐 비움 — 사용자가 갤러리 한 번 봤다고 간주. (2026-05-11 A+C 라운드)
  // useEffect cleanup으로 안 쓰는 이유: StrictMode 이중 마운트 시 cleanup이 즉시 발화해
  // 첫 진입에서도 뱃지가 안 뜬다 (개발 환경 한정 버그). onClick은 결정론적.
  const handleClose = () => {
    markSpritesSeen();
    close(false);
  };

  return (
    <div
      className="absolute inset-0 bg-bg text-text overflow-y-auto"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <div className="sticky top-0 bg-bg border-b border-text-light/30 px-4 md:px-6 py-3 flex flex-wrap items-center gap-2 z-10">
        <h2 className="text-xl md:text-2xl font-bold mr-2 md:mr-4">갤러리</h2>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[44px] px-4 py-2 rounded-lg ${tab === t.id ? 'bg-accent' : 'bg-bg hover:bg-accent/40'}`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClose}
          className="ml-auto min-h-[44px] min-w-[44px] px-3 py-1 text-text-light hover:text-text"
        >
          닫기
        </button>
      </div>

      <div className="p-6">
        {tab === 'cg' && <CGGallery />}
        {tab === 'sprite' && <SpriteGallery />}
        {tab === 'bgm' && <BGMGallery />}
        {tab === 'ending' && <EndingGallery />}
      </div>

      {/* 모바일 QA 2026-05-11: Gallery에도 환경설정/음소거/전체화면 접근 — minimal 모드. */}
      <MiniControls mode="minimal" />
    </div>
  );
}
