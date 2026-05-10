/**
 * 게임 진입점 OP 영상 — `/video/video_opening.mp4` 5~7초 자동재생.
 *
 * - 진입 시 검정 오버레이 800ms step fade-in (16 step × 50ms) 후 play() 호출
 *   → 사용자 의도("페이드 인 된 뒤에 시작") 그대로
 *   → step 패턴은 prefers-reduced-motion 우회 (gameStore startScene과 동일 패턴)
 * - 영상 재생 중 클릭 무시 — 외곽 div onClick stopPropagation으로 SceneRenderer.handleAreaClick으로의
 *   이벤트 버블링 차단 (storyMode 확정 후 OP+SceneRenderer 동시 마운트 시 OP 위 클릭이 underlying scene
 *   advance를 트리거하던 회귀 처방). 자연 종료(onEnded) 또는 onError/play 실패 시만 onComplete.
 * - `w-full h-full object-cover` — letterbox 없이 viewport 가득 채움 (16:9 영상, 비율 mismatch 시 약간 crop)
 * - onCompleteRef 패턴으로 부모 재렌더 시 페이드 재시작 회피
 */

import { useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const FADE_MS = 800;
const FADE_STEPS = 16;

export function OpeningVideo({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  // BGM은 App.tsx의 introCompleted effect 단일 진입점이 책임 (M-009, 2026-05-10).
  // 과거에 fallback playBgm을 두었더니 IntroTyping 도입 이후 introCompleted 직후
  // App.tsx와 OpeningVideo 두 곳에서 동시에 playBgm이 호출되며 mp3 로드 전 Howler `_queue`에
  // fade 액션이 2건 적재 → 첫 fade(0→0.6) 종료 직후 두 번째 fade가 from=0으로 발동해
  // 볼륨이 즉시 0으로 스냅되고 다시 페이드인되는 wow/cut 회귀가 발생함.

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const timers: number[] = [];
    const stepMs = Math.floor(FADE_MS / FADE_STEPS);
    for (let i = 1; i <= FADE_STEPS; i++) {
      const id = window.setTimeout(() => {
        setOverlayOpacity(1 - i / FADE_STEPS);
        if (i === FADE_STEPS) {
          void v.play().catch(() => onCompleteRef.current());
        }
      }, i * stepMs);
      timers.push(id);
    }
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  // OP 표시 중 모든 click/keydown(Space/Enter)을 capture phase에서 흡수
  // → underlying DialogueBox.handleClick (window keydown bubble handler) 및
  //   SceneRenderer.handleAreaClick으로 흐르는 advance 회귀를 근본 차단.
  // App.tsx가 showOpening 동안 startScene 보류하므로 이론상 underlying handler는 없지만,
  // 자동저장 복원 race나 향후 흐름 변경에도 견고하도록 OP 자체에 방어막 명시.
  useEffect(() => {
    const block = (e: Event) => {
      if (e.type === 'keydown') {
        const ke = e as KeyboardEvent;
        if (ke.code !== 'Space' && ke.code !== 'Enter' && ke.code !== 'Backspace') return;
        ke.preventDefault();
      }
      e.stopImmediatePropagation();
    };
    window.addEventListener('click', block, true);
    window.addEventListener('keydown', block, true);
    return () => {
      window.removeEventListener('click', block, true);
      window.removeEventListener('keydown', block, true);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 bg-black cursor-default"
      style={{ zIndex: 'var(--z-modal)' }}
      onClick={(e) => e.stopPropagation()}
      aria-label="OP 영상 재생 중 — 끝까지 시청"
      data-testid="opening-video"
    >
      <video
        ref={videoRef}
        src="/video/video_opening.mp4"
        muted
        playsInline
        preload="auto"
        onEnded={() => onCompleteRef.current()}
        onError={() => {
          // eslint-disable-next-line no-console
          console.warn('[OpeningVideo] load failed — skipping');
          onCompleteRef.current();
        }}
        className="w-full h-full object-cover"
      />
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
