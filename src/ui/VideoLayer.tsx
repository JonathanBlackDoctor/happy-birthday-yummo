/**
 * VEO 영상 재생 레이어 — SCENE-FORMAT VIDEO 디렉티브 처리.
 *
 * - `{ type: 'VIDEO', src }` 도착 시 풀스크린 모달 재생
 * - 자산: `/video/${src}.mp4`
 * - 모든 영상은 끝까지 재생 (라운드 #4 PM 결정 + 자산 통합 검증 라운드 후속 ④a 2026-05-08 SCENE-FORMAT skipable 옵션 정식 제거)
 * - 페이드 in/out: 시작 시 검정 → 영상 (300ms), 끝 시 영상 → 검정 (300ms) → onEnded
 * - cmd 변경 시 video.currentTime=0 + play() — rewind로 같은 영상 재진입 시 멈춤 방지
 * - onError: 자산 미존재 시 즉시 onEnded → advance
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

  // cmd 변경 시 영상 시작 + 페이드인
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setOverlayOpacity(1);
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

  const handleEnded = () => {
    // 페이드아웃: 0 → 1 over FADE_MS, 끝나면 onEnded
    const timers: number[] = [];
    const stepMs = Math.floor(FADE_MS / FADE_STEPS);
    for (let i = 1; i <= FADE_STEPS; i++) {
      const id = window.setTimeout(() => {
        setOverlayOpacity(i / FADE_STEPS);
        if (i === FADE_STEPS) onEnded();
      }, i * stepMs);
      timers.push(id);
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
        src={`/video/${cmd.src}.mp4`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={() => {
          // eslint-disable-next-line no-console
          console.warn(`[VideoLayer] load failed: ${cmd.src}`);
          onEnded();
        }}
        className="max-w-full max-h-full"
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
    </div>
  );
}
