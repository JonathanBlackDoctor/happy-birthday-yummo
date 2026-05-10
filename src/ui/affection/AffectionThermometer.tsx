/**
 * 호감도 온도계 SVG — 순수 시각 컴포넌트.
 *
 * 단일 책임: 0~100 value를 받아 유리 온도계 + 핑크 액체 채움 + 광택 + bulb 안 카톡 아바타를 렌더.
 * lifecycle/spring/표면 흔들림 계산은 부모(AffectionToastStack의 카드 또는 AffectionStatusPanel)가 한다.
 *
 * Plan: 05-ui-design/UI-SPEC.md §11 + ANIMATION-SPEC.md §13 (W6 라운드 2026-05-08 갱신).
 * - 사실적 온도계 + 눈금실린더 결합. 강한 광택 / 액체 그라데이션.
 * - 눈금 10단위, 50 위치 강조선. 단계(40·60·80) 라인은 표시 안 함.
 * - bulb 안에 히로인 카톡 아바타 원형 마스킹 (`/img/avatar/{id}.webp`).
 * - 시각 효과: 수면 하이라이트, bulb 외곽 심장 펄스, 도쿠먼트 라이트(관 외곽 흐름),
 *   완료 시 spark 입자 + 전체 flash. 모두 RAF 계산값(progress·complete·pulsePhase)을 prop으로 받아 렌더.
 */

import { useId } from 'react';

const VIEW_W = 60;
const VIEW_H = 280;
const TUBE_X = 22;
const TUBE_W = 16;
const TUBE_TOP = 10;
const TUBE_BOTTOM = 220;
const BULB_CX = 30;
const BULB_CY = 240;
const BULB_R = 22;
const BULB_BOTTOM = BULB_CY + BULB_R;
const TICK_X1 = 14;
const TICK_X2_NORMAL = 20;
const TICK_X2_BOLD = 11;
const VALUE_TO_Y_RANGE = TUBE_BOTTOM - TUBE_TOP; // 210

/**
 * PC 표시 사이즈 — 1.7배 권장 (UI-SPEC §11.1, 2026-05-08 사용자 결정으로 확대).
 * 메뉴 패널은 0.42 scale로 축소해 5칸 그리드 폭 보존.
 */
export const THERMOMETER_DISPLAY_W = 100;
export const THERMOMETER_DISPLAY_H = 460;

/**
 * heroineId → 아바타 경로 매핑.
 * H1~H5: `/img/avatar/{slug}.webp` (히로인 베이스 스프라이트 얼굴 crop).
 * NPC 친구 5명: 카톡 프로필 자산 그대로 재사용.
 * NPC mom·taeho: 별도 자산 미존재 → default 폴백 (PM 추후 합성 또는 외부 다운).
 */
function resolveAvatarPath(id: string): string {
  switch (id) {
    case 'gyumin':
    case 'gyeongmin':
    case 'nathan':
    case 'wook':
      return `/img/avatar/${id}.webp`;
    case 'junhyuk':
      // 오준혁은 카톡 프로필 자산 미존재 — default3 폴백 (해시 결정 회피, 안정 매핑).
      return '/img/avatar/default3.webp';
    case 'mom':
      return '/img/avatar/default1.webp';
    case 'taeho':
      return '/img/avatar/default2.webp';
    default:
      return `/img/avatar/${id}.webp`;
  }
}

export interface AffectionThermometerProps {
  /** 0~100. 채움 높이 결정. */
  value: number;
  /** 액체 표면 ±px 흔들림. RAF가 sin 보낸다. 미사용 시 0. */
  wobble?: number;
  /** 히로인 영문 ID — `/img/avatar/{id}.webp` 매핑. bulb 안 원형 컷. */
  heroineId: string;
  /**
   * 인물 이름 라벨. 박혀 있으면 bulb(아바타) 아래 SVG <text>로 표시. (2026-05-09 사용자 결정)
   * 없으면 라벨 미표시 — 호출자가 별도 노출하는 케이스 호환.
   */
  nameLabel?: string;
  /**
   * 시각 강도. 'rich'(강한 광택, 효과 ON), 'subtle'(메뉴 패널처럼 조용히, 효과 OFF).
   */
  intensity?: 'rich' | 'subtle';
  /**
   * RAF 진행 단계 — toast 카드가 보내는 신호.
   * - phase: 'idle'(static) | 'filling'(채우기 진행) | 'complete'(채움 끝, spark/flash)
   * - pulsePhase: 0~1 반복(bulb 심장 펄스)
   * - flowPhase: 0~1 반복(관 외곽 도쿠먼트 라이트 흐름)
   * - completeAge: 안착 후 경과(ms). flash·spark 시점 결정.
   */
  phase?: 'idle' | 'filling' | 'complete';
  pulsePhase?: number;
  flowPhase?: number;
  completeAge?: number;
  /** PC 디스플레이 사이즈 1.3배(78×364). subtle 모드에서는 부모가 transform: scale로 별도 축소. */
  displayWidth?: number;
  displayHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AffectionThermometer({
  value,
  wobble = 0,
  heroineId,
  nameLabel,
  intensity = 'rich',
  phase = 'idle',
  pulsePhase = 0,
  flowPhase = 0,
  completeAge = 0,
  displayWidth = intensity === 'rich' ? THERMOMETER_DISPLAY_W : VIEW_W,
  displayHeight = intensity === 'rich' ? THERMOMETER_DISPLAY_H : VIEW_H,
  className,
  style,
}: AffectionThermometerProps) {
  const uid = useId().replace(/:/g, '');
  const fillGradId = `therm-fill-${uid}`;
  const glassGradId = `therm-glass-${uid}`;
  const fillMaskId = `therm-fillmask-${uid}`;
  const bulbAvatarId = `therm-bulbav-${uid}`;
  const bulbGlowId = `therm-bulbglow-${uid}`;
  const flowGradId = `therm-flow-${uid}`;

  const v = Math.max(0, Math.min(100, value));
  const yTopBase = TUBE_BOTTOM - (v / 100) * VALUE_TO_Y_RANGE;
  const yTop = Math.max(TUBE_TOP, Math.min(TUBE_BOTTOM, yTopBase + wobble * 0.4));
  const fillH = BULB_BOTTOM + 10 - yTop;

  // 표면 광택 path — 살짝 위로 볼록한 곡선. wobble로 control y 미세 변화.
  const surfaceCx = TUBE_X + TUBE_W / 2;
  const surfaceCtrlY = yTop + 3 + wobble * 0.6;
  const surfacePath = `M${TUBE_X},${yTop} Q${surfaceCx},${surfaceCtrlY} ${TUBE_X + TUBE_W},${yTop}`;

  const tickRows = Array.from({ length: 11 }, (_, i) => i * 10);

  // ── 시각 효과 계산 ───────────────────────────────────────
  // bulb 심장 펄스: 0~1 반복. 외곽 ring radius·opacity 호흡.
  const pulseScale = intensity === 'rich' ? 1 + 0.10 * Math.sin(pulsePhase * Math.PI * 2) : 1;
  const pulseOpacity = intensity === 'rich' ? 0.55 + 0.25 * Math.sin(pulsePhase * Math.PI * 2) : 0.4;

  // 도쿠먼트 라이트: 관 외곽 따라 위/아래로 흐르는 광선.
  // flowPhase 0~1을 관 height에 매핑. 채움 진행 중에만 표시.
  const flowing = intensity === 'rich' && phase === 'filling';
  const flowY = TUBE_BOTTOM - flowPhase * (TUBE_BOTTOM - TUBE_TOP);
  const flowOpacity = flowing ? Math.sin(flowPhase * Math.PI) * 0.7 : 0;

  // 완료 직후 flash: completeAge 0~140ms 동안 외곽 화이트 글로우 100%.
  const flashOpacity =
    intensity === 'rich' && phase === 'complete' && completeAge < 140
      ? 1 - completeAge / 140
      : 0;

  // spark 입자: completeAge 0~360ms. 6개 입자가 yTop 근처에서 사방으로.
  const sparks = (() => {
    if (intensity !== 'rich' || phase !== 'complete' || completeAge >= 360) return [];
    const t = completeAge / 360; // 0~1
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i / 6) * Math.PI * 2 + Math.PI * 0.5;
      const dist = 18 * t + 4;
      return {
        cx: TUBE_X + TUBE_W / 2 + Math.cos(angle) * dist,
        cy: yTop + Math.sin(angle) * dist - t * 6,
        r: 1.6 * (1 - t * 0.5),
        op: (1 - t) * 0.95,
        key: i,
      };
    });
  })();

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={displayWidth}
      height={displayHeight}
      role="img"
      aria-label={`호감도 온도계 ${Math.round(v)}/100`}
      className={className}
      style={{ overflow: 'visible', ...style }}
    >
      <defs>
        <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--therm-fill-top, #FF4F90)" />
          <stop offset="20%" stopColor="rgba(255, 220, 235, 0.95)" />
          <stop offset="55%" stopColor="var(--therm-fill-mid, #FFB8D1)" />
          <stop offset="80%" stopColor="var(--therm-fill-mid2, #FF8FBF)" />
          <stop offset="100%" stopColor="var(--therm-fill-bot, #FFD9E5)" />
        </linearGradient>
        <linearGradient id={glassGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
        </linearGradient>
        <linearGradient id={flowGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,200,225,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <clipPath id={fillMaskId}>
          <rect
            x={TUBE_X}
            y={TUBE_TOP}
            width={TUBE_W}
            height={TUBE_BOTTOM - TUBE_TOP + 6}
            rx={TUBE_W / 2}
            ry={TUBE_W / 2}
          />
          <circle cx={BULB_CX} cy={BULB_CY} r={BULB_R - 2} />
        </clipPath>
        <clipPath id={bulbAvatarId}>
          <circle cx={BULB_CX} cy={BULB_CY} r={BULB_R - 5} />
        </clipPath>
        <filter id={bulbGlowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={intensity === 'rich' ? 3.5 : 1.5} />
        </filter>
      </defs>

      {/* 1) bulb 외곽 심장 펄스 — 가장 뒤에 깔림 */}
      {intensity === 'rich' && (
        <g opacity={pulseOpacity} transform={`translate(${BULB_CX} ${BULB_CY}) scale(${pulseScale}) translate(${-BULB_CX} ${-BULB_CY})`}>
          <circle
            cx={BULB_CX}
            cy={BULB_CY}
            r={BULB_R + 5}
            fill="var(--therm-bulb-glow, rgba(255,111,168,0.55))"
            filter={`url(#${bulbGlowId})`}
          />
        </g>
      )}

      {/* 2) 유리관 outline (배경) — 사용자 결정 2026-05-09: 어두운 배경에서 잘 보이도록 fill α 0.10→0.32, stroke α 0.55→0.85.
             추가로 외곽 짙은 그림자 ring을 깔아 BG 색에 흐려지지 않게 한다. */}
      <rect
        x={TUBE_X - 2}
        y={TUBE_TOP - 2}
        width={TUBE_W + 4}
        height={TUBE_BOTTOM - TUBE_TOP + 10}
        rx={TUBE_W / 2 + 1}
        ry={TUBE_W / 2 + 1}
        fill="rgba(20, 14, 26, 0.45)"
      />
      <rect
        x={TUBE_X}
        y={TUBE_TOP}
        width={TUBE_W}
        height={TUBE_BOTTOM - TUBE_TOP + 6}
        rx={TUBE_W / 2}
        ry={TUBE_W / 2}
        fill="rgba(255,255,255,0.32)"
        stroke="var(--therm-glass-stroke, rgba(255,255,255,0.85))"
        strokeWidth={1.4}
      />
      <circle
        cx={BULB_CX}
        cy={BULB_CY}
        r={BULB_R + 1.5}
        fill="rgba(20, 14, 26, 0.45)"
      />
      <circle
        cx={BULB_CX}
        cy={BULB_CY}
        r={BULB_R}
        fill="rgba(255,255,255,0.32)"
        stroke="var(--therm-glass-stroke, rgba(255,255,255,0.85))"
        strokeWidth={1.4}
      />

      {/* 3) 채움 액체 (clipPath 마스킹 + 그라디언트) */}
      <g clipPath={`url(#${fillMaskId})`}>
        <rect
          x={TUBE_X - 2}
          y={yTop}
          width={TUBE_W + 4}
          height={fillH}
          fill={`url(#${fillGradId})`}
        />
        {/* 표면 강조 — 두 줄(밝은 광택 + 두꺼운 하이라이트 밴드) */}
        {v > 0 && (
          <>
            <path
              d={surfacePath}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M${TUBE_X + 1},${yTop + 2.2} Q${surfaceCx},${surfaceCtrlY + 2.2} ${TUBE_X + TUBE_W - 1},${yTop + 2.2}`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {/* 4) 도쿠먼트 라이트 — 관 외곽 흐름. 채움 진행 중에만. */}
        {flowing && (
          <rect
            x={TUBE_X - 1}
            y={flowY - 22}
            width={TUBE_W + 2}
            height={44}
            fill={`url(#${flowGradId})`}
            opacity={flowOpacity}
          />
        )}
      </g>

      {/* 5) 눈금 — 10단위, 50 위치 강조 */}
      {tickRows.map((tick) => {
        const ty = TUBE_BOTTOM - (tick / 100) * VALUE_TO_Y_RANGE;
        const isMid = tick === 50;
        return (
          <line
            key={tick}
            x1={isMid ? TICK_X2_BOLD : TICK_X1}
            x2={TICK_X2_NORMAL}
            y1={ty}
            y2={ty}
            stroke="var(--therm-tick, rgba(58,46,63,0.35))"
            strokeWidth={isMid ? 1.5 : 0.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* 6) 유리 좌측 하이라이트 — 길게 세로 곡선 */}
      <path
        d={`M${TUBE_X + 2},${TUBE_TOP + 6} Q${TUBE_X + 1},${TUBE_TOP + 60} ${TUBE_X + 3},${TUBE_BOTTOM - 12}`}
        stroke="var(--therm-highlight, rgba(255,255,255,0.55))"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx={BULB_CX - 7}
        cy={BULB_CY - 9}
        rx={4}
        ry={6}
        fill="rgba(255,255,255,0.5)"
        transform={`rotate(-25 ${BULB_CX - 7} ${BULB_CY - 9})`}
      />

      {/* 7) bulb 안 카톡 아바타 (원형 마스킹) — NPC는 별도 매핑 */}
      <g clipPath={`url(#${bulbAvatarId})`}>
        <rect
          x={BULB_CX - BULB_R}
          y={BULB_CY - BULB_R}
          width={BULB_R * 2}
          height={BULB_R * 2}
          fill="rgba(255,255,255,0.6)"
        />
        <image
          href={resolveAvatarPath(heroineId)}
          x={BULB_CX - (BULB_R - 5)}
          y={BULB_CY - (BULB_R - 5)}
          width={(BULB_R - 5) * 2}
          height={(BULB_R - 5) * 2}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
      <circle
        cx={BULB_CX}
        cy={BULB_CY}
        r={BULB_R - 5}
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth={1.2}
      />

      {/* 8) 유리관 가로 그라디언트 광택 (가장 위층) */}
      <rect
        x={TUBE_X}
        y={TUBE_TOP}
        width={TUBE_W}
        height={TUBE_BOTTOM - TUBE_TOP + 6}
        rx={TUBE_W / 2}
        ry={TUBE_W / 2}
        fill={`url(#${glassGradId})`}
        pointerEvents="none"
      />

      {/* 9) 완료 직후 spark 입자 */}
      {sparks.map((s) => (
        <circle
          key={s.key}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="rgba(255,240,250,0.95)"
          opacity={s.op}
        />
      ))}

      {/* 10) 완료 직후 전체 flash — 외곽 white halo */}
      {flashOpacity > 0 && (
        <g opacity={flashOpacity} pointerEvents="none">
          <rect
            x={TUBE_X - 6}
            y={TUBE_TOP - 6}
            width={TUBE_W + 12}
            height={TUBE_BOTTOM - TUBE_TOP + 18}
            rx={TUBE_W}
            ry={TUBE_W}
            fill="none"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={2.5}
            filter={`url(#${bulbGlowId})`}
          />
          <circle
            cx={BULB_CX}
            cy={BULB_CY}
            r={BULB_R + 8}
            fill="none"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={2.5}
            filter={`url(#${bulbGlowId})`}
          />
        </g>
      )}

      {/* 11) bulb 아래 인물 이름 (사용자 결정 2026-05-09).
             SVG는 overflow:visible이라 viewBox 280을 살짝 벗어나도 표시됨.
             폰트 세련 (자족 명시 + 굵기 600 + 트래킹 1.1px) + outline은 얇게(strokeWidth 1.2) — 사용자 결정. */}
      {nameLabel && (
        <text
          x={BULB_CX}
          y={BULB_BOTTOM + 16}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight={600}
          fill="var(--therm-name, rgba(255, 248, 252, 0.96))"
          stroke="rgba(20, 14, 26, 0.85)"
          strokeWidth={1.2}
          paintOrder="stroke"
          fontFamily='"Pretendard Variable", Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
          style={{
            letterSpacing: '1.1px',
            userSelect: 'none',
            fontFeatureSettings: '"ss01", "kern"',
          }}
        >
          {nameLabel}
        </text>
      )}
    </svg>
  );
}
