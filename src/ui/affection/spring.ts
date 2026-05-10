/**
 * RAF용 spring solver — framer-motion 부재 대체.
 *
 * 호감도 온도계 채움 애니메이션이 spring 이징(살짝 오버슈팅 후 안착)으로 도달해야 한다는
 * UI 사양에 따라 반감쇠(under-damped) 진동 시뮬레이션을 1프레임 단위로 적분.
 *
 * 사용:
 *   const s = createSpring({ from: 65, to: 70 });
 *   const tick = (dt_ms: number) => { const { value, done } = s.step(dt_ms); ... };
 *
 * 종료 조건: |value-to| < epsPos && |velocity| < epsVel 가 200ms 연속 충족.
 */

export interface SpringOptions {
  from: number;
  to: number;
  /** k. 높을수록 빠름. 기본 220. */
  stiffness?: number;
  /** c. 높을수록 진동 감쇠. 기본 14. */
  damping?: number;
  /** m. 1로 두는 게 직관적. */
  mass?: number;
  /** 초기 속도. 기본 0. */
  velocity?: number;
  /** 종료 위치 허용 오차. 기본 0.05. */
  epsPos?: number;
  /** 종료 속도 허용 오차. 기본 0.05. */
  epsVel?: number;
  /** 종료 조건 충족 후 안정화 대기 ms. 기본 120. */
  settleMs?: number;
}

export interface SpringHandle {
  step(dtMs: number): { value: number; velocity: number; done: boolean };
  current(): number;
  isDone(): boolean;
}

export function createSpring(opts: SpringOptions): SpringHandle {
  const {
    from,
    to,
    stiffness = 220,
    damping = 14,
    mass = 1,
    velocity = 0,
    epsPos = 0.05,
    epsVel = 0.05,
    settleMs = 120,
  } = opts;

  let position = from;
  let velo = velocity;
  let settledAcc = 0;
  let done = false;

  return {
    step(dtMs: number) {
      if (done) return { value: position, velocity: velo, done: true };
      // dt를 5ms 단위로 substep 적분 — 큰 dt에서 발산 방지.
      const dt = Math.max(0, dtMs) / 1000;
      const sub = Math.max(1, Math.ceil(dt / 0.005));
      const h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const Fspring = -stiffness * (position - to);
        const Fdamper = -damping * velo;
        const a = (Fspring + Fdamper) / mass;
        velo += a * h;
        position += velo * h;
      }
      const close = Math.abs(position - to) < epsPos && Math.abs(velo) < epsVel;
      if (close) {
        settledAcc += dtMs;
        if (settledAcc >= settleMs) {
          position = to;
          velo = 0;
          done = true;
        }
      } else {
        settledAcc = 0;
      }
      return { value: position, velocity: velo, done };
    },
    current() {
      return position;
    },
    isDone() {
      return done;
    },
  };
}

/** 단순 트윈 — prefers-reduced-motion 환경 폴백용. ease-out cubic. */
export function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}
