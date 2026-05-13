/**
 * 저장/불러오기 화면 — 6슬롯 그리드 (UI-SPEC §10, 2026-05-09 W5 메뉴 사이클 라운드 신설).
 *
 * - 모드: 'save' | 'load'. PauseMenu에서 진입.
 * - 슬롯 카드: 챕터 + 미리보기 + savedAt + 좌상단 인덱스 / 우상단 ✕(삭제, save 모드 한정).
 * - 빈 슬롯: '― 비어 있음 ―'. save 모드에서만 클릭 가능, load 모드는 비활성.
 * - 저장 시 기존 내용 덮어쓰기는 confirm() 한 번. 삭제도 confirm().
 * - SaveSlotError.code === 'STORAGE_ERROR' → 토스트 "저장 공간이 부족합니다".
 *
 * 모달 레이아웃은 PauseMenu.tsx 패턴 재사용.
 */

import { useState, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { audioManager } from '@/engine/audioManager';
import {
  saveSlot,
  deleteSlot,
  listSlots,
  SaveSlotError,
  type SlotIndex,
} from '@/engine/saveSlots';
import type { SaveSlot, StoryMode } from '@/engine/types';

type Mode = 'save' | 'load';

interface Props {
  mode: Mode;
}

const STORY_MODE_LABEL: Record<StoryMode, string> = {
  full: '풀스토리',
  compressed: '압축버전',
  palJeongPot: '팔정팟 각색',
};

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function SaveLoadScreen({ mode }: Props) {
  const close = useGameStore((s) => s.setSaveLoadOpen);
  const takeSnapshot = useGameStore((s) => s.takeSnapshot);
  const applySnapshot = useGameStore((s) => s.applySnapshot);
  // storyMode가 null인 상태에서 저장/불러오기 화면이 열리는 경우는 없지만 타입 안전을 위해 'full' 폴백
  const storyMode: StoryMode = useSettingsStore((s) => s.storyMode) ?? 'full';
  const [slots, setSlots] = useState(() => listSlots(storyMode));
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => setSlots(listSlots(storyMode)), [storyMode]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleSave = (idx: SlotIndex, existing: SaveSlot | null) => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    if (existing) {
      const ok = window.confirm(`슬롯 ${idx}을 덮어쓸까요?`);
      if (!ok) return;
    }
    try {
      saveSlot(storyMode, idx, takeSnapshot());
      refresh();
      showToast(`슬롯 ${idx}에 저장했습니다.`);
    } catch (e) {
      if (e instanceof SaveSlotError && e.code === 'STORAGE_ERROR') {
        showToast('저장 공간이 부족합니다.');
      } else {
        showToast('저장 실패. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  const handleLoad = async (idx: SlotIndex, existing: SaveSlot | null) => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    if (!existing) return;
    const ok = window.confirm(`슬롯 ${idx}에서 불러올까요? 현재 진행이 사라집니다.`);
    if (!ok) return;
    try {
      await applySnapshot(existing);
      // applySnapshot이 saveLoadMode를 null로 만들지만, 안전하게 한 번 더.
      close(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(`불러오기 실패: ${msg}`);
    }
  };

  const handleDelete = (idx: SlotIndex) => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    const ok = window.confirm(`슬롯 ${idx}을 삭제할까요? 되돌릴 수 없습니다.`);
    if (!ok) return;
    deleteSlot(storyMode, idx);
    refresh();
    showToast(`슬롯 ${idx}을 삭제했습니다.`);
  };

  const title = mode === 'save' ? '저장' : '불러오기';

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{ zIndex: 'var(--z-menu)', background: 'rgba(58, 46, 63, 0.85)' }}
      data-testid="save-load-screen"
      data-mode={mode}
    >
      <div className="min-h-full flex items-center justify-center p-4">
       <div className="bg-bg text-text rounded-2xl p-6 md:p-8 w-full max-w-3xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{title}</h2>
            <span className="text-sm text-text-light border border-text-light/40 rounded-full px-2.5 py-0.5">
              {STORY_MODE_LABEL[storyMode]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
              close(null);
            }}
            className="min-h-[40px] min-w-[40px] px-3 py-1 text-text-light hover:text-text"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {slots.map(({ index, slot }) => {
            const empty = slot === null;
            const disabled = mode === 'load' && empty;
            const onClick = () =>
              mode === 'save' ? handleSave(index, slot) : void handleLoad(index, slot);
            return (
              <div key={index} className="relative">
                <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className="w-full text-left min-h-[112px] p-4 rounded-xl border border-text-light/30 bg-bg hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid={`save-slot-${index}`}
                >
                  <div className="flex items-center justify-between text-xs text-text-light">
                    <span>슬롯 {index}</span>
                    <span>{slot ? formatSavedAt(slot.savedAt) : ''}</span>
                  </div>
                  {empty ? (
                    <div className="mt-3 text-center text-text-light italic">
                      ― 비어 있음 ―
                    </div>
                  ) : (
                    <div className="mt-1.5">
                      <div className="font-semibold truncate">{slot.preview.chapter}</div>
                      {slot.preview.sceneTitle && slot.preview.sceneTitle !== slot.preview.chapter && (
                        <div className="text-sm text-text-light truncate">
                          {slot.preview.sceneTitle}
                        </div>
                      )}
                      {slot.preview.excerpt && (
                        <div className="text-sm mt-1 line-clamp-2 opacity-80">
                          {slot.preview.excerpt}
                        </div>
                      )}
                    </div>
                  )}
                </button>
                {!empty && (
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-text-light/20 hover:bg-danger/60 text-text flex items-center justify-center text-sm"
                    aria-label={`슬롯 ${index} 삭제`}
                    data-testid={`save-slot-${index}-delete`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {toast && (
          <div
            role="status"
            className="text-center text-sm py-2 px-3 rounded-lg bg-accent/40"
            data-testid="save-load-toast"
          >
            {toast}
          </div>
        )}
       </div>
      </div>
    </div>
  );
}
