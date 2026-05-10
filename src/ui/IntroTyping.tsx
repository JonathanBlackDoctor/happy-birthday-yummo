/**
 * 인트로 타이핑 자막 — M-009 처방 (PM 결정 2026-05-10).
 *
 * 페이지 접속 직후 스토리 배경 자막을 타이핑으로 표시. "확인" 버튼 클릭이
 * 첫 user gesture 역할을 해 모바일 브라우저의 audio autoplay 차단을 해제하고,
 * 동시에 게임 자산(오프닝 영상 + BGM)이 백그라운드에서 다운로드될 시간을 번다.
 *
 * 타이핑 진행 중 첫 2초는 스킵 비활성 (자산 다운로드 시간 보장). 2초 후 화면 탭 = skip.
 * E2E 환경은 App.tsx에서 자동 스킵 (introCompleted 초기값 true).
 */

import { useEffect, useState } from 'react';

const INTRO_TEXT =
  '2026년 봄, 의예과를 마친 본과 1학년 의대생의 새 학기가 시작된다. 익숙해진 자취방, 새로 펼쳐질 강의실, 그리고 곧 만나게 될 사람들.';
const TYPE_INTERVAL_MS = 50;
const SKIP_ACTIVATION_MS = 2000;

interface Props {
  onConfirm: () => void;
}

export function IntroTyping({ onConfirm }: Props) {
  const [shown, setShown] = useState(0);
  const [skipReady, setSkipReady] = useState(false);
  const isComplete = shown >= INTRO_TEXT.length;

  useEffect(() => {
    if (isComplete) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), TYPE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [shown, isComplete]);

  useEffect(() => {
    const id = window.setTimeout(() => setSkipReady(true), SKIP_ACTIVATION_MS);
    return () => clearTimeout(id);
  }, []);

  const handleSkipOrConfirm = () => {
    if (!isComplete) {
      if (!skipReady) return;
      setShown(INTRO_TEXT.length);
      return;
    }
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-black px-8"
      style={{ zIndex: 9999 }}
      role="region"
      aria-label="스토리 배경"
      onClick={handleSkipOrConfirm}
      data-testid="intro-typing"
    >
      <p
        className="max-w-2xl text-center text-white"
        style={{
          fontFamily: "'Pretendard', -apple-system, sans-serif",
          fontSize: 'clamp(22px, 5.5vw, 36px)',
          wordBreak: 'keep-all',
          lineHeight: 1.8,
          letterSpacing: '0.02em',
        }}
        aria-live="polite"
      >
        {INTRO_TEXT.slice(0, shown)}
        {!isComplete && <span style={{ opacity: 0.6 }}>|</span>}
      </p>
      {isComplete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          className="mt-12 px-8 border border-white/60 rounded-md text-white hover:bg-white/10 transition-colors"
          style={{ fontSize: '16px', minHeight: '44px', minWidth: '88px' }}
          data-testid="intro-confirm"
        >
          확인
        </button>
      ) : skipReady ? (
        <p className="mt-8 text-xs text-white/40" aria-hidden="true">
          화면을 탭하면 건너뜁니다
        </p>
      ) : null}
    </div>
  );
}
