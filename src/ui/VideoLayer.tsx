/**
 * VEO 영상 재생 레이어 — SCENE-FORMAT VIDEO 디렉티브 처리.
 *
 * - `{ type: 'VIDEO', src }` 도착 시 풀스크린 모달 재생
 * - 자산: `video/${src}.mp4`
 * - 페이드 in/out: 시작 시 검정 → 영상 (300ms), 끝 시 영상 → 검정 (300ms) → onEnded
 * - cmd 변경 시 video.currentTime=0 + play() — rewind로 같은 영상 재진입 시 멈춤 방지
 * - onError: 자산 미존재 시 즉시 onEnded → advance
 * - skip 버튼(모바일 QA 2026-05-11 4차): 우상단 작은 반투명 버튼 — 재생 페이드 끝난 뒤 클릭 가능,
 *   누르면 handleEnded(페이드 아웃 → onEnded) 호출.
 */

import { useEffect, useRef, useState } from 'react';
import type { SceneCommand } from '@/engine/types';

interface Props {
  cmd: Extract<SceneCommand, { type: 'VIDEO' }>;
  onEnded: () => void;
}

const FADE_MS = 300;
const FADE_STEPS = 12;

export function VideoLayer({ cmd, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(1); // 검정 오버레이 (시작 시 1, 영상 재생 중 0)
  // 모바일 QA 2026-05-11 3차: 안드로이드 Chrome이 autoplay 진입 직전 native ▶️ 인디케이터를 띄우는 회귀.
  // video를 onPlaying 이벤트 전까지 opacity 0으로 가려 native UI까지 함께 hide.
  const [videoReady, setVideoReady] = useState(false);

  // cmd 변경 시 영상 시작 + 페이드인
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setOverlayOpacity(1);
    setVideoReady(false);
    // PIP/Remote/Cast 인디케이터 강제 비활성 — 일부 안드로이드 OEM이 ▶️처럼 노출.
    v.disablePictureInPicture = true;
    (v as HTMLVideoElement & { disableRemotePlayback?: boolean }).disableRemotePlayback = true;
    try {
      (v as HTMLVideoElement & { controlsList?: string }).controlsList = 'nodownload nofullscreen noremoteplayback noplaybackrate';
    } catch {
      /* 일부 구형 브라우저 미지원 — 무시 */
    }
    v.currentTime = 0;
    void v.play().catch(() => {
      onEnded();
    });
    // 페이드인: 1 → 0 over FADE_MS
    const timers: number[] = [];
    const stepMs = Math.floor(FADE_MS / FADE_STEPS);
    for (let i = 1; i <= FADE_STEPS; i++) {
      const id = window.setTimeout(() => {
        setOverlayOpacity(1 - i / FADE_STEPS);
      }, i * stepMs);
      timers.push(id);
    }
    return () => timers.forEach((id) => clearTimeout(id));
  }, [cmd, onEnded]);

  // 페이드아웃 중복 트리거 방지(자연 종료 + skip 중복 클릭).
  const [skipping, setSkipping] = useState(false);

  const handleEnded = () => {
    if (skipping) return;
    setSkipping(true);
    // 페이드아웃: 0 → 1 over FADE_MS, 끝나면 onEnded
    const stepMs = Math.floor(FADE_MS / FADE_STEPS);
    for (let i = 1; i <= FADE_STEPS; i++) {
      window.setTimeout(() => {
        setOverlayOpacity(i / FADE_STEPS);
        if (i === FADE_STEPS) onEnded();
      }, i * stepMs);
    }
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black"
      style={{ zIndex: 'var(--z-modal)' }}
      aria-label="영상 재생 중 — 끝까지 시청"
      data-testid="video-layer"
      data-video-id={cmd.src}
    >
      <video
        ref={videoRef}
        src={`video/${cmd.src}.mp4`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => setVideoReady(true)}
        onEnded={handleEnded}
        onError={() => {
          // eslint-disable-next-line no-console
          console.warn(`[VideoLayer] load failed: ${cmd.src}`);
          onEnded();
        }}
        className="max-w-full max-h-full"
        style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 120ms ease-out' }}
      />
      {/* 페이드 오버레이 — 영상 위 검정 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'black',
          pointerEvents: 'none',
          opacity: overlayOpacity,
        }}
      />
      {/* Skip 버튼 — 모바일 QA 2026-05-11 4차. 페이드인 끝(videoReady)부터 노출, 클릭 시 페이드아웃 시퀀스. */}
      {videoReady && !skipping && (
        <button
          type="button"
          onClick={handleEnded}
          aria-label="영상 건너뛰기"
          data-testid="video-skip"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
            color: 'rgba(255, 255, 255, 0.85)',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 999,
            backdropFilter: 'blur(2px)',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 150ms ease',
            zIndex: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          Skip ▶▶
        </button>
      )}
    </div>
  );
}
