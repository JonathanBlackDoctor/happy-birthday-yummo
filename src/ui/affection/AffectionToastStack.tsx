/**
 * 호감도 토스트 스택 — gameStore.affectionEvents 큐를 구독해 가로 나열로 표시.
 *
 * UI-SPEC §11 + ANIMATION-SPEC §13 SSoT 정합 (2026-05-08 라운드 갱신).
 *
 * 동작:
 * 1. 미소비 이벤트를 첫 ts 기준 ±50ms 윈도우로 클러스터링.
 * 2. |delta| 내림차순 정렬, 상위 5개 채택. 6개 이상 drop + warn.
 * 3. 모든 변동(±1 포함)을 동일한 풍성 온도계 카드로 표시 — 사용자 결정 2026-05-08.
 *    소폭 변화도 가시성 보장. delta별 spring 설정으로 모션 강도 가변.
 * 4. 묶음당 사운드 1회 — |delta| 최대값의 부호로 sfx_affection_up/down.
 * 5. 카드 unmount 시 prune. z-toast(400) > z-modal(300)로 카톡 모달 위에 자연 표시.
 *
 * 시각: 흰 박스/이름/현재값 모두 제거. 온도계 + 변화량(+5)만.
 *      가로 나열 — 상단 고정 y, 우측에서 좌측으로 카드 idx별 누적 (5개 동시 시 가로 배열).
 * 시간: 총 6초. 진입 페이드 300ms / 표시 5400ms / 페이드아웃 600ms (위로 떠오르며 사라짐).
 */

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { AffectionEvent } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';
import { HEROINES } from '@/data/characters';
import type { AffinityTargetId } from '@/engine/types';
import {
  AffectionThermometer,
  THERMOMETER_DISPLAY_W,
  THERMOMETER_DISPLAY_H,
} from './AffectionThermometer';
import { createSpring, easeOutCubic } from './spring';

/** NPC 표시명·아바타 ID. AffectionThermometer가 받은 ID로 자체 avatar 매핑. */
const NPC_META: Record<
  'gyumin' | 'gyeongmin' | 'nathan' | 'wook' | 'junhyuk' | 'mom' | 'taeho',
  { id: string; name: string }
> = {
  gyumin: { id: 'gyumin', name: '김규민' },
  gyeongmin: { id: 'gyeongmin', name: '표경민' },
  nathan: { id: 'nathan', name: '조나단' },
  wook: { id: 'wook', name: '정욱' },
  junhyuk: { id: 'junhyuk', name: '오준혁' },
  mom: { id: 'mom', name: '엄마' },
  taeho: { id: 'taeho', name: '이태호 교수' },
};

function isNpc(target: AffinityTargetId): target is keyof typeof NPC_META {
  return (
    target === 'gyumin' || target === 'gyeongmin' || target === 'nathan' ||
    target === 'wook' || target === 'junhyuk' || target === 'mom' || target === 'taeho'
  );
}

function resolveTargetMeta(target: AffinityTargetId): { id: string; name: string } {
  if (isNpc(target)) return NPC_META[target];
  return HEROINES[target];
}

const CLUSTER_WINDOW_MS = 50;
const MAX_CARDS = 5;

const RICH_FADE_IN_MS = 300;
// 사용자 결정 2026-05-09: 호감도 채움이 더 눈에 잘 띄도록 천천히. 800ms → 1700ms.
const RICH_FILL_MS = 1700;
const RICH_RIPPLE_MS = 600;
const RICH_TOTAL_MS = 6000;
const RICH_FADE_OUT_MS = 600;
const RICH_HOLD_END_MS = RICH_TOTAL_MS - RICH_FADE_OUT_MS; // 5400

/**
 * 가로 나열: +N 라벨이 온도계 위로 올라가고 가로 폭은 온도계 자체 폭만 차지하므로
 * 카드 폭을 좁힘 — 사용자 결정 2026-05-09 "양 옆 간격 더 줄이기".
 *
 * 위치 (2026-05-09 후속 조정): 우측 모서리에 너무 붙지 않게 + 위쪽 모서리와 가깝게.
 *  TOP=24 (이전 70은 위쪽이 너무 비어 있음. +N 라벨이 컨테이너 첫 자식이라 24부터 자연스럽게 시작)
 *  RIGHT=32 (이전 16은 모서리에 거의 붙음 → 살짝 띄움)
 */
const TOAST_CARD_W = THERMOMETER_DISPLAY_W + 12; // 온도계 100 + 좌우 살짝
const TOAST_GAP = 6;
const TOAST_BASE_TOP = 24;
const TOAST_BASE_RIGHT = 32;

/**
 * delta 절댓값에 따라 spring 강도 가변 — 큰 변화일수록 출렁이고 약한 변화는 단단하게.
 * (사용자 결정 2026-05-08: 모션을 더 다이나믹하게.)
 * 2026-05-09 추가 조정: 전체적으로 더 천천히 → stiffness 낮추고 damping 약간 증가.
 */
function springConfigForDelta(d: number) {
  const a = Math.abs(d);
  if (a >= 10) return { stiffness: 90, damping: 11, mass: 1.2 };
  if (a >= 3) return { stiffness: 140, damping: 15, mass: 1.0 };
  return { stiffness: 200, damping: 20, mass: 0.9 };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

export function AffectionToastStack() {
  const events = useGameStore((s) => s.affectionEvents);
  const markConsumed = useGameStore((s) => s.markAffectionEventsConsumed);
  const prune = useGameStore((s) => s.pruneAffectionEvents);
  // 메뉴/백로그/갤러리 열려있을 때 토스트 숨김 — UI 흐름 차단 회피.
  const isPauseMenuOpen = useGameStore((s) => s.isPauseMenuOpen);
  const isBacklogOpen = useGameStore((s) => s.isBacklogOpen);
  const isGalleryOpen = useGameStore((s) => s.isGalleryOpen);
  const overlayOpen = isPauseMenuOpen || isBacklogOpen || isGalleryOpen;

  const [activeCards, setActiveCards] = useState<AffectionEvent[]>([]);

  // 미소비 이벤트 → 클러스터링 → activeCards 추가 + consumed 마킹
  useEffect(() => {
    const unconsumed = events.filter((e) => !e.consumed);
    if (unconsumed.length === 0) return;

    const ts0 = unconsumed[0].ts;
    const cluster = unconsumed.filter(
      (e) => Math.abs(e.ts - ts0) <= CLUSTER_WINDOW_MS,
    );
    const sorted = [...cluster].sort(
      (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
    );
    const taken = sorted.slice(0, MAX_CARDS);
    const dropped = sorted.slice(MAX_CARDS);
    if (dropped.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[AffectionToastStack] cluster has ${sorted.length} events, dropping ${dropped.length}`,
      );
    }

    const top = taken[0];
    if (top) {
      audioManager.playSfx(top.delta >= 0 ? 'sfx_affection_up' : 'sfx_affection_down');
    }

    setActiveCards((prev) => [...prev, ...taken]);
    markConsumed([...taken.map((e) => e.id), ...dropped.map((e) => e.id)]);
  }, [events, markConsumed]);

  // 카드별 lifetime 타이머 — 신규 카드만 setTimeout 등록.
  // useRef<Map>으로 카드별 타이머 추적, 신규 id에만 등록 / 콜백에서 self-제거 + ref 정리.
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    for (const card of activeCards) {
      if (timersRef.current.has(card.id)) continue;
      const tid = window.setTimeout(() => {
        timersRef.current.delete(card.id);
        setActiveCards((prev) => prev.filter((c) => c.id !== card.id));
        prune();
      }, RICH_TOTAL_MS + 80);
      timersRef.current.set(card.id, tid);
    }
  }, [activeCards, prune]);

  // 컴포넌트 unmount 시 모든 타이머 정리
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const tid of timers.values()) {
        window.clearTimeout(tid);
      }
      timers.clear();
    };
  }, []);

  if (activeCards.length === 0 || overlayOpen) return null;

  return (
    <>
      {activeCards.map((card, idx) => {
        const top = TOAST_BASE_TOP;
        const right = TOAST_BASE_RIGHT + idx * (TOAST_CARD_W + TOAST_GAP);
        return <RichToastCard key={card.id} event={card} top={top} right={right} />;
      })}
    </>
  );
}

interface RichToastCardProps {
  event: AffectionEvent;
  top: number;
  right: number;
}

function RichToastCard({ event, top, right }: RichToastCardProps) {
  const meta = resolveTargetMeta(event.heroine);
  const reduced = useRef(prefersReducedMotion()).current;
  const springCfg = useRef(springConfigForDelta(event.delta)).current;

  // 진입/퇴장 페이드는 setTimeout + CSS transition으로 — RAF freeze(hidden 탭, 백그라운드)에서도 작동.
  // RAF는 spring 채움·wobble·pulse·flow·spark 등 시각 효과 전용.
  const [lifecyclePhase, setLifecyclePhase] = useState<'pre' | 'visible' | 'exit'>('pre');
  const [value, setValue] = useState(event.prevValue);
  const [wobble, setWobble] = useState(0);
  const [vfxPhase, setVfxPhase] = useState<'idle' | 'filling' | 'complete'>('filling');
  const [pulsePhase, setPulsePhase] = useState(0);
  const [flowPhase, setFlowPhase] = useState(0);
  const [completeAge, setCompleteAge] = useState(0);

  const rafRef = useRef<number | null>(null);

  // 페이드 lifecycle — setTimeout 기반 (RAF 무관)
  useEffect(() => {
    const enterTimer = window.setTimeout(() => setLifecyclePhase('visible'), 16);
    const exitTimer = window.setTimeout(() => setLifecyclePhase('exit'), RICH_HOLD_END_MS);
    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
    };
  }, [event.id]);

  // RAF: spring 채움 + 시각 효과 (delta별 가변 spring 적용)
  useEffect(() => {
    const start = performance.now();
    const spring = reduced
      ? null
      : createSpring({
          from: event.prevValue,
          to: event.newValue,
          ...springCfg,
        });
    const wobbleAmp = Math.min(4, Math.max(0.8, Math.abs(event.delta) / 3));
    let lastFrameTs = start;
    let completeStartedAt: number | null = null;
    let localVfxPhase: 'filling' | 'complete' = 'filling';

    const tick = () => {
      const now = performance.now();
      const t = now - start;
      const dt = now - lastFrameTs;
      lastFrameTs = now;

      setPulsePhase((t / 1600) % 1);
      if (localVfxPhase === 'filling') setFlowPhase((t / 600) % 1);
      else setFlowPhase(0);

      if (reduced) {
        const p = Math.min(1, t / 200);
        setValue(event.prevValue + (event.newValue - event.prevValue) * easeOutCubic(p));
        setWobble(0);
        if (p >= 1 && localVfxPhase !== 'complete') {
          localVfxPhase = 'complete';
          setVfxPhase('complete');
          completeStartedAt = now;
        }
      } else if (spring) {
        if (!spring.isDone() && t < RICH_FILL_MS + 200) {
          const r = spring.step(dt);
          setValue(r.value);
          setWobble(Math.sin(t / 60) * wobbleAmp);
          if (r.done && completeStartedAt === null) {
            completeStartedAt = now;
            localVfxPhase = 'complete';
            setVfxPhase('complete');
          }
        } else if (t < RICH_FILL_MS + RICH_RIPPLE_MS) {
          if (completeStartedAt === null) {
            completeStartedAt = now;
            localVfxPhase = 'complete';
            setVfxPhase('complete');
          }
          const r = (t - RICH_FILL_MS) / RICH_RIPPLE_MS;
          const decay = 1 - r;
          setValue(event.newValue);
          setWobble(Math.sin(r * Math.PI * 2) * wobbleAmp * 0.8 * decay);
        } else {
          setValue(event.newValue);
          setWobble(0);
        }
      }

      if (completeStartedAt !== null) {
        setCompleteAge(now - completeStartedAt);
      }

      if (t < RICH_TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [event.id, event.prevValue, event.newValue, event.delta, reduced, springCfg]);

  const sign = event.delta > 0 ? '+' : '';
  const deltaColor =
    event.delta > 0 ? 'var(--toast-delta-up, #E64178)' : 'var(--toast-delta-down, #8A6B7A)';

  // 진입(pre→visible): 우측에서 살짝 이동하며 페이드인.
  // 퇴장(visible→exit): 위로 떠오르며 페이드아웃 (translateY -16).
  const opacity = lifecyclePhase === 'pre' ? 0 : lifecyclePhase === 'visible' ? 1 : 0;
  const translateX = lifecyclePhase === 'pre' ? 12 : 0;
  const translateY = lifecyclePhase === 'exit' ? -16 : 0;
  const transitionDur =
    lifecyclePhase === 'visible' ? RICH_FADE_IN_MS : lifecyclePhase === 'exit' ? RICH_FADE_OUT_MS : 0;

  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        top,
        right,
        zIndex: 'var(--z-toast)' as React.CSSProperties['zIndex'],
        opacity,
        transform: `translate(${translateX}px, ${translateY}px) scale(var(--therm-scale, 1))`,
        transformOrigin: 'top right',
        transition: `opacity ${transitionDur}ms ease-out, transform ${transitionDur}ms ease-out`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 8px 18px rgba(216, 80, 140, 0.45)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18))',
      }}
      aria-label={`${meta.name} ${sign}${event.delta}, 현재 ${Math.round(value)}/100`}
    >
      {/* +N 라벨을 온도계 위로 (사용자 결정 2026-05-09).
          네온 샤인 효과 강화 — drop-shadow + textShadow 다층 누적. */}
      <span
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: deltaColor,
          textShadow: [
            `0 0 4px ${deltaColor}`,
            `0 0 10px ${deltaColor}`,
            `0 0 18px ${deltaColor}aa`,
            `0 0 30px ${deltaColor}88`,
            '0 2px 6px rgba(0,0,0,0.55)',
            '0 0 2px rgba(255,255,255,0.85)',
          ].join(', '),
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        {sign}
        {event.delta}
      </span>
      <AffectionThermometer
        value={value}
        wobble={wobble}
        heroineId={meta.id}
        nameLabel={meta.name}
        intensity="rich"
        phase={vfxPhase}
        pulsePhase={pulsePhase}
        flowPhase={flowPhase}
        completeAge={completeAge}
        displayWidth={THERMOMETER_DISPLAY_W}
        displayHeight={THERMOMETER_DISPLAY_H}
      />
    </div>
  );
}
