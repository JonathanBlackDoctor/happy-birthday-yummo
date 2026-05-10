/**
 * 엔딩 점수 패널 — 숫자 계기판 카운트업 훅 (Animated 패널 전용).
 *
 * setTimeout 기반 16ms 폴링 (자동화/headless 환경에서도 동작 보장).
 * target 변경 시 현재 표시값에서 target까지 easeOutCubic 보간.
 */
import { useEffect, useState } from 'react';
import { easeOutCubic } from './spring';

export interface UseEndingCountUpOpts {
  durationMs?: number;
  reducedMotion?: boolean;
}

export function useEndingCountUp(target: number, opts: UseEndingCountUpOpts = {}): number {
  const { durationMs = 1200, reducedMotion = false } = opts;
  const [display, setDisplay] = useState<number>(target);

  useEffect(() => {
    if (reducedMotion) {
      if (display !== target) setDisplay(target);
      return;
    }
    if (target === display) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const from = display;
    const startTs = performance.now();
    const step = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startTs;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      const v = from + (target - from) * eased;
      if (t >= 1) {
        setDisplay(target);
        return;
      }
      setDisplay(v);
      timer = setTimeout(step, 16);
    };
    timer = setTimeout(step, 16);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // display는 deps에서 의도적 제외 — 매 setDisplay마다 effect 재실행 시 보간이 끊김.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs, reducedMotion]);

  return display;
}
