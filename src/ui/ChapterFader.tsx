/**
 * 챕터 경계 페이드 오버레이 — store의 chapterFadeOpacity 직접 사용.
 * 페이드 step은 store의 startScene 안에서 단계별로 진행 (setTimeout 환경 영향 최소화).
 *
 * 페이드 중 클릭 advance 차단 (PM 결정 2026-05-08):
 *   1) pointer-events: opacity > 0.01 시 'auto'로 클릭 흡수
 *   2) onClick stopPropagation: 외곽 SceneRenderer의 handleAreaClick으로 버블링 차단
 *      (ChapterFader가 클릭을 받아도 부모 div의 advance 트리거 안 됨)
 *   epsilon 0.01: 페이드 step 최소값 1/32 = 0.03125, 부동소수점 오차 안전 마진.
 */

import { useGameStore } from '@/stores/gameStore';

export function ChapterFader() {
  const opacity = useGameStore((s) => s.chapterFadeOpacity);
  return (
    <div
      aria-hidden="true"
      data-testid="chapter-fader"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'black',
        pointerEvents: opacity > 0.01 ? 'auto' : 'none',
        opacity,
        zIndex: 350,
      }}
    />
  );
}
