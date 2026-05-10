/**
 * 거절 엔딩 후반부 연출 — 카톡 4줄은 ch06_h4_reject.scene.json의 KAKAO 명령(KakaoModal)이 책임지고,
 * 본 컴포넌트는 그 다음 5~8단계만 처리한다.
 *
 * 5. 검은 페이드 아웃
 * 6. 타이틀 카드 "BAD ENDING — 답장이 늦어서"
 * 7. 영상 video_reject_seoyoon (5~7초)
 * 8. 엔딩 크레딧 + 해금 토스트
 *
 * BGM(bgm_sad)·SFX(sfx_katalk_notify)는 scene.json의 BGM/SFX 명령이 처리.
 */

import { useEffect, useState } from 'react';
import { audioManager } from '@/engine/audioManager';
import { REJECT_STAGE_TIMING_MS } from '@/engine/rejectLines';

interface Props {
  onComplete: () => void;
}

type Stage = 'fade-out' | 'title' | 'video' | 'toast';

export function RejectEnding({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('fade-out');

  useEffect(() => {
    if (stage === 'fade-out') {
      const t = setTimeout(() => setStage('title'), REJECT_STAGE_TIMING_MS['fade-out']);
      return () => clearTimeout(t);
    }
    if (stage === 'title') {
      const t = setTimeout(() => setStage('video'), REJECT_STAGE_TIMING_MS.title);
      return () => clearTimeout(t);
    }
    if (stage === 'video') {
      audioManager.stopBgm({ fade: 4 });
      const t = setTimeout(() => setStage('toast'), REJECT_STAGE_TIMING_MS.video);
      return () => clearTimeout(t);
    }
    if (stage === 'toast') {
      const t = setTimeout(onComplete, REJECT_STAGE_TIMING_MS.toast);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [stage, onComplete]);

  // 단계 5·6: 검은 페이드 아웃 → 타이틀 카드
  if (stage === 'fade-out' || stage === 'title') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
        style={{
          background: '#000',
          color: '#fff',
          zIndex: 'var(--z-modal)',
          opacity: stage === 'title' ? 1 : 0,
        }}
      >
        {stage === 'title' && (
          <div className="text-center">
            <div className="text-sm tracking-widest opacity-70 mb-2">BAD ENDING</div>
            <h1 className="text-4xl font-bold">— 답장이 늦어서 —</h1>
          </div>
        )}
      </div>
    );
  }

  // 단계 7: video — VEO 영상 재생 (끝까지, 스킵 불가)
  if (stage === 'video') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#000', zIndex: 'var(--z-modal)' }}
      >
        <video
          src="/video/video_reject_seoyoon.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          className="max-w-full max-h-full"
          aria-label="비 내리는 창문 + 카톡 화면 비춤 + 페이드아웃"
        />
      </div>
    );
  }

  // 단계 8: toast — 엔딩 크레딧 + 해금 토스트
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: '#000', color: '#fff', zIndex: 'var(--z-modal)' }}
    >
      <div className="text-sm tracking-widest opacity-70 mb-2">엔딩 카드 해금</div>
      <h2 className="text-2xl font-bold mb-1">END_H4_REJECT</h2>
      <div className="text-base opacity-80">— 답장이 늦어서 —</div>
      <div
        className="mt-8 px-4 py-2 rounded-md text-sm"
        style={{ background: '#222', color: '#eee' }}
      >
        엔딩 리스트에 해금되었습니다
      </div>
    </div>
  );
}
