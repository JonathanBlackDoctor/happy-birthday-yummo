/**
 * 게임 진입점 OP 영상 — `video/video_opening.mp4` 5~7초 자동재생.
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
  // 모바일 QA 2026-05-11 3차: 안드로이드 Chrome이 autoplay 차단 시도 시 native ▶️ 인디케이터 노출 회귀.
  // video를 onPlaying 전까지 opacity 0으로 가려 native UI까지 함께 hide.
  const [videoReady, setVideoReady] = useState(false);

  // BGM은 App.tsx의 introCompleted effect 단일 진입점이 책임 (M-009, 2026-05-10).

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // PIP/Remote/Cast 인디케이터 강제 비활성 — 일부 안드로이드 OEM이 ▶️처럼 노출.
    v.disablePictureInPicture = true;
    (v as HTMLVideoElement & { disableRemotePlayback?: boolean }).disableRemotePlayback = true;
    try {
      (v as HTMLVideoElement & { controlsList?: string }).controlsList = 'nodownload nofullscreen noremoteplayback noplaybackrate';
    } catch {
      /* 일부 구형 브라우저 미지원 — 무시 */
    }

    // 모바일 QA 2026-05-11 3차: setTimeout 800ms 후 play() 호출이 user gesture 만료로 안드로이드에서 차단.
    // <video autoPlay> 속성으로 변경 — mount 직후 동기 자동재생. 검정 오버레이가 800ms fade 동안 가리므로
    // 시각적으로는 동일(처음 800ms는 사용자에게 안 보임). play() 명시 호출 제거 → 차단 시도 자체 없음.
    const timers: number[] = [];
    const stepMs = Math.floor(FADE_MS / FADE_STEPS);
    for (let i = 1; i <= FADE_STEPS; i++) {
      const id = window.setTimeout(() => {
        setOverlayOpacity(1 - i / FADE_STEPS);
      }, i * stepMs);
      timers.push(id);
    }
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  // OP 표시 중 모든 click/keydown(Space/Enter)을 capture phase에서 흡수
  // → underlying DialogueBox.handleClick (window keydown bubble handler) 및
  //   SceneRenderer.handleAreaClick으로 흐르는 advance 회귀를 근본 차단.
  // 예외: skip 버튼([data-testid="opening-video-skip"]) 클릭은 통과 (4차 처방).
  useEffect(() => {
    const block = (e: Event) => {
      if (e.type === 'click' && e.target instanceof HTMLElement && e.target.closest('[data-testid="opening-video-skip"]')) {
        return; // skip 버튼은 정상 클릭 흐름 보장
      }
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
        src="video/video_opening.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => setVideoReady(true)}
        onEnded={() => onCompleteRef.current()}
        onError={() => {
          // eslint-disable-next-line no-console
          console.warn('[OpeningVideo] load failed — skipping');
          onCompleteRef.current();
        }}
        className="w-full h-full object-cover"
        style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 120ms ease-out' }}
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
      {/* Skip 버튼 — 모바일 QA 2026-05-11 4차. 페이드인 끝(videoReady)부터 노출, 클릭 시 onComplete 즉시 호출.
          OP는 SceneRenderer 미진입 상태라 별도 페이드아웃 없이 바로 onComplete → App.tsx가 showOpening false 처리. */}
      {videoReady && (
        <button
          type="button"
          onClick={() => onCompleteRef.current()}
          aria-label="오프닝 영상 건너뛰기"
          data-testid="opening-video-skip"
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
