/**
 * 텍스트박스 — UI-SPEC §2.1·§2.2·§2.3·§2.4 정합.
 *
 * - 우측 하단까지 차서 워터마크 영역(이미지 하단 ~28%)을 가림 (UI-SPEC §5.3 + MASTER-PLAN 5.3)
 * - 화자명 박스: 좌측 상단 살짝 튀어나옴, 민트 배경
 * - 모놀로그: 화자명 박스 X, italic, 텍스트 색 흐림
 * - 변태 망상 subtype: white flash + 미세 흔들림 (ANIMATION-SPEC §9)
 * - 글자별 타이핑 (settingsStore.textSpeed 토큰 사용)
 */

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore, TEXT_SPEED_MS } from '@/stores/settingsStore';
import { audioManager } from '@/engine/audioManager';

interface Props {
  onAdvance: () => void;
}

export function DialogueBox({ onAdvance }: Props) {
  const cmd = useGameStore((s) => s.currentCommand);
  const textSpeed = useSettingsStore((s) => s.textSpeed);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const flashRef = useRef<HTMLDivElement | null>(null);

  const isTextCmd =
    cmd && (cmd.type === 'DIALOGUE' || cmd.type === 'MONOLOGUE' || cmd.type === 'NARRATION');
  const fullText = isTextCmd ? cmd.text : '';
  const speaker = isTextCmd && cmd.type !== 'NARRATION' ? cmd.speaker : null;
  const isMonologue = isTextCmd && cmd.type === 'MONOLOGUE';
  const subtype = isTextCmd && cmd.type === 'MONOLOGUE' ? cmd.subtype : undefined;

  // 변태 자기자각 white flash + sfx_realize
  useEffect(() => {
    if (subtype === 'self_aware') {
      audioManager.playSfx('sfx_realize');
      const el = flashRef.current;
      if (el) {
        el.style.opacity = '0.3';
        setTimeout(() => {
          if (el) el.style.opacity = '0';
        }, 100);
      }
    }
  }, [subtype]);

  // 타이핑 효과
  useEffect(() => {
    if (!isTextCmd) return undefined;
    setDisplayed('');
    setDone(false);
    const speedMs = TEXT_SPEED_MS[textSpeed];
    if (speedMs === 0) {
      setDisplayed(fullText);
      setDone(true);
      return undefined;
    }
    let i = 0;
    const handle = setInterval(() => {
      i += 1;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(handle);
        setDone(true);
      }
    }, speedMs);
    return () => clearInterval(handle);
  }, [fullText, textSpeed, isTextCmd]);

  const rewindOne = useGameStore((s) => s.rewindOne);

  // 자동재생 — 텍스트 출력 완료 후 settingsStore.autoAdvanceDelay 뒤 자동 advance. cooldown bypass 위해 store.advance 직접 호출.
  // 챕터 페이드 / 일시정지·백로그·갤러리 열림 / 비-텍스트 cmd면 정지. 텍스트 reveal 도중엔 fire 안 됨(done 가드).
  // 2026-05-09 W5 메뉴 사이클 — 200ms 하드코드 → settingsStore.autoAdvanceDelay (1000~5000ms 슬라이더) 사용.
  const autoPlayEnabled = useSettingsStore((s) => s.autoPlayEnabled);
  const autoAdvanceDelay = useSettingsStore((s) => s.autoAdvanceDelay);
  const advance = useGameStore((s) => s.advance);
  const awaitingChapterAdvance = useGameStore((s) => s.awaitingChapterAdvance);
  const chapterFadeOpacity = useGameStore((s) => s.chapterFadeOpacity);
  const isPauseMenuOpen = useGameStore((s) => s.isPauseMenuOpen);
  const isBacklogOpen = useGameStore((s) => s.isBacklogOpen);
  const isGalleryOpen = useGameStore((s) => s.isGalleryOpen);
  useEffect(() => {
    if (!autoPlayEnabled || !isTextCmd || !done) return undefined;
    if (awaitingChapterAdvance || chapterFadeOpacity > 0.01) return undefined;
    if (isPauseMenuOpen || isBacklogOpen || isGalleryOpen) return undefined;
    const t = window.setTimeout(() => {
      void advance();
    }, autoAdvanceDelay);
    return () => clearTimeout(t);
  }, [
    autoPlayEnabled,
    autoAdvanceDelay,
    isTextCmd,
    done,
    awaitingChapterAdvance,
    chapterFadeOpacity,
    isPauseMenuOpen,
    isBacklogOpen,
    isGalleryOpen,
    advance,
  ]);

  const handleClick = () => {
    if (!done) {
      // 빠른 스킵 — 즉시 전체 표시
      setDisplayed(fullText);
      setDone(true);
      return;
    }
    onAdvance();
  };

  // 키보드: Space/Enter advance, Backspace 1단계 뒤로. 텍스트 명령일 때만 활성.
  useEffect(() => {
    if (!isTextCmd) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClick();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        void rewindOne();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTextCmd, done, fullText, rewindOne]);

  if (!isTextCmd) return null;

  return (
    <>
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100"
        style={{ opacity: 0, zIndex: 'var(--z-toast)' }}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={handleClick}
        className="absolute left-1/2 -translate-x-1/2 text-left"
        style={{
          bottom: 'var(--textbox-bottom)',
          width: 'var(--textbox-width)',
          height: 'var(--textbox-height)',
          padding: 'var(--textbox-padding)',
          background: 'var(--color-textbox-bg)',
          color: 'var(--color-textbox-text)',
          borderRadius: 'var(--textbox-radius)',
          fontSize: 'var(--font-size-text)',
          lineHeight: 'var(--line-height)',
          letterSpacing: 'var(--letter-spacing)',
          zIndex: 'var(--z-textbox)',
          fontStyle: isMonologue ? 'italic' : 'normal',
        }}
        aria-label="다음으로 진행"
      >
        {speaker && !isMonologue && (
          <div
            className="absolute font-semibold"
            style={{
              top: -16,
              left: 28,
              padding: '6px 18px',
              background: 'var(--color-textbox-name-bg)',
              color: 'var(--color-textbox-name)',
              borderRadius: 'calc(var(--textbox-radius) / 2)',
              fontSize: 'var(--font-size-name)',
            }}
          >
            {speaker}
          </div>
        )}
        {isMonologue && speaker && (
          <div className="absolute top-2 left-7 text-xs opacity-60">
            ─ {speaker}의 마음 ─
          </div>
        )}
        <p className="whitespace-pre-wrap">
          {displayed}
          {done && <span className="ml-2 inline-block animate-pulse">▼</span>}
        </p>
      </button>
    </>
  );
}
