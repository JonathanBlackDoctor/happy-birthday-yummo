/**
 * 엔딩 점수 패널 — 5단계 시퀀스 state machine (Animated 패널 전용).
 *
 * Phase: 0(대기 → 마운트 직후 자동 1로) → 1(Winner 호감도) → 2(가중치+핵심) → 3(그 외 4명) → 4(조연) → 5(SCORE+GRADE) → 6(완료).
 *
 * 페이싱:
 *   - 자동: 각 phase의 애니메이션이 끝났다고 패널이 판단 → setTimeout으로 약 500ms 휴지 후 advance.
 *   - 수동: Space/Enter/클릭으로 즉시 advance(현재 phase 강제 종료 + 다음 phase 시작).
 *   - 스킵: Esc 또는 ▶▶ 스킵 버튼 → phase 6 직행.
 *   - reduced-motion: 마운트 시 즉시 phase 6.
 *
 * 본 훅은 phase 번호만 관리한다. 각 phase의 sub-step(예: phase 3의 4명 sequential)은
 * 패널 컴포넌트가 phase 안에서 자체 RAF/setTimeout으로 처리 후 advance 호출.
 */
import { useCallback, useEffect, useState } from 'react';

export type EndingAnimPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface UseEndingPhaseMachineOpts {
  reducedMotion?: boolean;
  /** Phase 0 → 1 자동 시작까지의 마운트 후 대기 ms. 기본 300. */
  startDelayMs?: number;
}

export interface EndingPhaseMachine {
  phase: EndingAnimPhase;
  /** 현재 phase의 끝 상태로 즉시 점프 + 다음 phase로 진행 (clamp at 6). */
  advance: () => void;
  /** phase 6으로 즉시 점프. 모든 애니 즉시 종료. */
  skip: () => void;
  /** phase 6 도달 여부. */
  isDone: boolean;
}

export function useEndingPhaseMachine(opts: UseEndingPhaseMachineOpts = {}): EndingPhaseMachine {
  const { reducedMotion = false, startDelayMs = 300 } = opts;
  const [phase, setPhase] = useState<EndingAnimPhase>(0);

  // 마운트 직후 phase 1으로 진입 (reduced-motion이면 6 직행).
  useEffect(() => {
    if (reducedMotion) {
      setPhase(6);
      return;
    }
    const t = window.setTimeout(() => {
      setPhase((p) => (p === 0 ? 1 : p));
    }, startDelayMs);
    return () => window.clearTimeout(t);
  }, [reducedMotion, startDelayMs]);

  const advance = useCallback(() => {
    setPhase((p) => (p < 6 ? ((p + 1) as EndingAnimPhase) : p));
  }, []);

  const skip = useCallback(() => {
    setPhase(6);
  }, []);

  // 키보드: Space/Enter → advance, Esc → skip. phase 6이면 listener 비활성.
  useEffect(() => {
    if (phase === 6) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, advance, skip]);

  return { phase, advance, skip, isDone: phase === 6 };
}
