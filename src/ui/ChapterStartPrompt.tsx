/**
 * 챕터 전환 대기 프롬프트 — fade-out 완료 후 사용자 클릭 대기 (PM 결정 2026-05-08).
 *
 * gameStore.startScene 챕터 경계 분기에서 awaitingChapterAdvance=true로 set되면
 * ChapterFader(opacity=1, 검정) 위에 다음 챕터 이름 + "시작하기" 버튼 노출.
 * 클릭 시 confirmChapterAdvance → startScene 흐름 재개 → fade-in.
 *
 * 진입 1초 락 — 버튼 노출 직후 우발 클릭(이전 화면 마지막 클릭이 흡수되거나 키보드 연타)으로
 * 챕터를 휙 넘기는 것 방지. CGOverlay와 동일 패턴.
 *
 * z-index 360: ChapterFader(350) 위, AffectionToast(400) 아래.
 * E2E 환경(navigator.webdriver / ?scene= / ?flags=)에서는 startScene이 자동 통과해 마운트되지 않음.
 */

import { useEffect, useRef, useState } from 'react';
import { useGameStore, chapterTitle } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';

const PROMPT_UNLOCK_MS = 1000;

export function ChapterStartPrompt() {
  const awaiting = useGameStore((s) => s.awaitingChapterAdvance);
  const sceneId = useGameStore((s) => s.currentSceneId);
  const confirm = useGameStore((s) => s.confirmChapterAdvance);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!awaiting) {
      setUnlocked(false);
      return undefined;
    }
    setUnlocked(false);
    const t = window.setTimeout(() => setUnlocked(true), PROMPT_UNLOCK_MS);
    return () => clearTimeout(t);
  }, [awaiting]);

  useEffect(() => {
    if (awaiting && unlocked) buttonRef.current?.focus();
  }, [awaiting, unlocked]);

  if (!awaiting) return null;

  const title = chapterTitle(sceneId);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-10"
      style={{ zIndex: 360 }}
      onClick={(e) => e.stopPropagation()}
      data-testid="chapter-start-prompt"
    >
      <div
        className="text-3xl md:text-5xl font-bold text-white text-center px-6 select-none"
        data-testid="chapter-start-title"
      >
        {title}
      </div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!unlocked) return;
          audioManager.playSfx('sfx_pageturn');
          confirm();
        }}
        disabled={!unlocked}
        className="px-10 py-4 bg-accent hover:bg-accent-hover text-text rounded-2xl text-xl md:text-2xl font-semibold transition-colors shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="chapter-start-button"
        aria-label="시작하기"
      >
        시작하기
      </button>
    </div>
  );
}
