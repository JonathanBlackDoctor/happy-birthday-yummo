/**
 * 거절 카톡 정확 텍스트 — MASTER-PLAN.md §4.3 SSoT 미러 (변경 금지).
 *
 * 본 라인은 H4 거절 엔딩 핵심 — 사용자가 마스터 플랜 frozen 명시 텍스트로 박아둠.
 * RejectEnding.tsx가 본 모듈을 import해서 화면에 출력.
 * 단위 테스트가 글자 단위·줄바꿈·🥺🥺 정확성을 가드.
 *
 * H4 시트 §6 + route-H4 §END_H4_REJECT + ch06_h4_seoyoon.md Scene `ch06_h4_reject` 모두 동일 텍스트.
 */

export const REJECT_LINES: readonly string[] = [
  '답장이 너무 늦어서 미안해ㅠㅠ',
  '그날 만나서 얘기하고 시간 잘 보냈는데',
  '더 진행하기엔 무리가 있을거 같아..',
  '좋은 인연 만나길 바랄게 🥺🥺',
] as const;

/** 8단계 연출 단계 ID — H4 §6 정확 매핑 */
export const REJECT_STAGES = [
  'fade-in', // 1단계: 카톡 풀스크린 페이드 인
  'bgm', // 2단계: bgm_sad
  'typing', // 3단계: SFX 알림 + 타이핑 인디케이터 + 4줄 한 줄당 0.8초
  'pause', // 4단계: 마지막 🥺🥺 후 2초 정지
  'fade-out', // 5단계: 검은 페이드 아웃
  'title', // 6단계: 타이틀 카드 "BAD ENDING — 답장이 늦어서"
  'video', // 7단계: video_reject_seoyoon (5~7초)
  'toast', // 8단계: 엔딩 크레딧 + 해금 토스트
] as const;

export type RejectStage = (typeof REJECT_STAGES)[number];

/** RejectEnding.tsx 단계 타이밍 (ms) — H4 §6 정합 */
export const REJECT_STAGE_TIMING_MS: Record<RejectStage, number> = {
  'fade-in': 500,
  bgm: 0, // BGM 페이드는 fade-in 단계 안에서 동시 시작
  typing: 1500, // 입력 중... 1.5초
  pause: 2000, // 마지막 🥺🥺 후 2초
  'fade-out': 1000,
  title: 2000,
  video: 7000, // 5~7초 — 7초로 상한
  toast: 1500,
};

/** 메시지 한 줄당 페이드 인 간격 (ms) — H4 §6 "0.8초 간격" */
export const REJECT_MESSAGE_INTERVAL_MS = 800;

/** 거절 엔딩 ID — STATE-SCHEMA / BRANCH-GRAPH 정합 */
export const REJECT_ENDING_ID = 'END_H4_REJECT' as const;
