/**
 * 톤 보상 매트릭스 — CONVENTIONS.md §3.7 SSoT 미러.
 *
 * 다섯 히로인의 선택지 보상 함수를 차별화한다. 동일 선택지(같은 톤 태그)가
 * 5명에게 다른 점수가 되도록 5×5 매트릭스 룩업으로 계산.
 *
 * 호출 흐름:
 *   gameStore.pickChoice(idx)
 *     → toneToFlagIncs(choice, sceneMeta) → SceneCommand[]
 *     → applyEffects가 5개 FLAG_INC를 적용
 *
 * H3 시간대 갭: SceneMeta.toneTime 'night' 시 보정.
 * H4 미니게임: Choice.mechanism === 'h4_reply_speed' + replyTimeMs로 분기.
 */

import type {
  Choice,
  HeroineId,
  NpcAffinityId,
  SceneCommand,
  SceneMeta,
  SceneTime,
  ToneTag,
} from './types';
import { HEROINE_IDS, NPC_AFFINITY_IDS } from './types';

/** 5×5 베이스 매트릭스 (낮 기본). H3 밤 보정은 NIGHT_DELTA로 별도. */
export const TONE_MATRIX: Record<HeroineId, Record<ToneTag, number>> = {
  H1: {
    mature_serious: 10, // KEY
    warm_supportive: 5,
    direct_friendly: 1,
    playful_casual: -2, // 거리감 닫힘
    bright_forward: -1,
  },
  H2: {
    mature_serious: -1,
    warm_supportive: 3,
    direct_friendly: 10, // KEY
    playful_casual: 5,
    bright_forward: 1,
  },
  H3: {
    mature_serious: 5,
    warm_supportive: 10, // KEY (낮 한정)
    direct_friendly: 1,
    playful_casual: -1,
    bright_forward: -1,
  },
  H4: {
    // PM 보정: 톤 매치 베이스 -2 (warm_supportive +3→+1, direct_friendly +5→+3)
    mature_serious: 1,
    warm_supportive: 1,
    direct_friendly: 3,
    playful_casual: 1,
    bright_forward: 1,
  },
  H5: {
    mature_serious: -2, // 어색
    warm_supportive: 1,
    direct_friendly: 5,
    playful_casual: 5,
    bright_forward: 10, // KEY
  },
};

/**
 * H3 밤 보정 — '안경 갭'(낮 학자 / 밤 풀어진 부드러움)을 시스템에 박는다.
 * SceneMeta.toneTime === 'night'일 때 H3 한정으로 가산.
 *
 * 룰:
 *   mature_serious 낮 +5  → 밤 +1   (학자 톤은 밤엔 풀어지길 원함, -4)
 *   warm_supportive 낮 +10(KEY) → 밤 +5  (KEY 자리는 낮 한정, 밤은 일반 매치, -5)
 *   direct_friendly 낮 +1 → 밤 +1   (변화 없음)
 *   playful_casual 낮 -1  → 밤 +3   (밤엔 풀어진 톤 환영, +4)
 *   bright_forward 낮 -1  → 밤 -1   (변화 없음)
 */
export const H3_NIGHT_DELTA: Record<ToneTag, number> = {
  mature_serious: -4,
  warm_supportive: -5,
  direct_friendly: 0,
  playful_casual: 4,
  bright_forward: 0,
};

/**
 * NPC 호감도 톤 매트릭스 — 친구 5명 + 엄마 + 교수. 엔딩·KEY 무관 (2026-05-08 분리).
 * H 매트릭스보다 점수 폭 작게(±1~3) — H 풍성 토스트와 충돌 안 하도록.
 *
 * 친구 캐릭터별 성향 (02-characters/side-characters.md 참조):
 * - 김규민: 솔로 권리·시동 톤 — 직설·장난 선호
 * - 표경민: 신중·옳은 말 톤 — 진중·따뜻 선호
 * - 조나단: 추임새·웃음 — 장난·밝음 선호
 * - 정욱: 단답·실용 — 진중·직설 선호
 * - 오준혁: 5조 동기, 의외 여학생 — 따뜻·장난 선호
 * - 엄마: 진중·따뜻 선호, 가벼움 비호감
 * - 이태호: 해부학 교수, 진중 위주
 */
export const NPC_TONE_MATRIX: Record<NpcAffinityId, Record<ToneTag, number>> = {
  gyumin: {
    mature_serious: 0,
    warm_supportive: 1,
    direct_friendly: 3,
    playful_casual: 3,
    bright_forward: 2,
  },
  gyeongmin: {
    mature_serious: 3,
    warm_supportive: 3,
    direct_friendly: 1,
    playful_casual: -1,
    bright_forward: 0,
  },
  nathan: {
    mature_serious: 0,
    warm_supportive: 1,
    direct_friendly: 2,
    playful_casual: 3,
    bright_forward: 3,
  },
  wook: {
    mature_serious: 2,
    warm_supportive: 1,
    direct_friendly: 3,
    playful_casual: 1,
    bright_forward: 0,
  },
  junhyuk: {
    mature_serious: 1,
    warm_supportive: 3,
    direct_friendly: 2,
    playful_casual: 2,
    bright_forward: 1,
  },
  mom: {
    mature_serious: 3,
    warm_supportive: 3,
    direct_friendly: 1,
    playful_casual: -1,
    bright_forward: 1,
  },
  taeho: {
    mature_serious: 3,
    warm_supportive: 2,
    direct_friendly: 1,
    playful_casual: -1,
    bright_forward: 0,
  },
};

/** KEY 톤 매핑. H4는 미니게임 메커니즘이 KEY 역할 → null. */
export const KEY_HEROINE_TONE: Record<HeroineId, ToneTag | null> = {
  H1: 'mature_serious',
  H2: 'direct_friendly',
  H3: 'warm_supportive', // 시간대 무관 (Step 4, 2026-04-30 PM 결정) — KEY 자리는 낮/밤 모두 묘사 보너스 가산
  H4: null,
  H5: 'bright_forward',
};

/** 묘사 보너스 (KEY 라벨 + 매칭 톤일 때 추가 가산) */
export const DESCRIPTOR_BONUS = 5;

/**
 * NPC 호감도 증가폭 배수 (사용자 결정 2026-05-08, 2026-05-11 ×15 상향 — A1).
 * "자칫하다가는 NPC 호감도가 H를 우습게 넘어버리고 SOLO 엔딩이 되도록" 의도.
 * NPC_TONE_MATRIX 매트릭스 점수에 곱해 적용. 기본 매트릭스 ±1~3 → 실제 ±15~45 (옛 ±10~30).
 * 보너스 NPC(mom/junhyuk/taeho) 임계 도달성을 위해 일괄 ×15로 상향.
 * H KEY 자리 +15와 비교해 NPC가 ±15~45이라 히로인 관리 안 하면 NPC가 빠르게 추월.
 */
export const NPC_GAIN_MULTIPLIER = 15;

/** H4 미니게임 룰 — H4에만 적용, 다른 4명은 영향 없음. */
export const H4_REPLY_SPEED = {
  /** 통과 기준 ms (CONVENTIONS §3.7 #5: 15초) */
  thresholdMs: 15_000,
  /** 통과 시 추가 가산 (베이스 매트릭스 위) */
  passDelta: 1,
  /** 타임아웃 페널티 (베이스 매트릭스 위) */
  failDelta: -3,
} as const;

/**
 * 한 선택지(톤 태그가 박힌 Choice)에 대해 5명에게 적용할 점수 변동을 계산.
 *
 * @param choice — 선택지 (tone 필수, isKey/descriptor/mechanism/replyTimeMs 선택)
 * @param sceneMeta — 씬 메타 (toneTime 'night' 시 H3 보정)
 * @returns Map<HeroineId, delta> — 각 히로인별 +/- 점수
 */
export function computeToneDeltas(
  choice: Pick<Choice, 'tone' | 'isKey' | 'mechanism' | 'replyTimeMs'>,
  sceneMeta?: Pick<SceneMeta, 'toneTime'>,
): Record<HeroineId, number> {
  const result: Record<HeroineId, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 };
  if (!choice.tone) return result;

  const time: SceneTime = sceneMeta?.toneTime ?? 'day';

  for (const h of HEROINE_IDS) {
    let delta = TONE_MATRIX[h][choice.tone];

    // H3 시간대 갭
    if (h === 'H3' && time === 'night') {
      delta += H3_NIGHT_DELTA[choice.tone];
    }

    // 묘사 보너스: 본 히로인의 KEY 톤 + KEY 라벨일 때만
    // 2026-04-30 Step 4: H3 KEY 시간대 무관 변경 (PM 결정).
    // 안경 갭(낮 학자/밤 부드러움) 캐릭터 특성은 H3_NIGHT_DELTA(일반 매트릭스 자리)
    // 에서만 시간대 보정하고, KEY 자리는 시간대 무관 묘사 보너스 가산.
    if (choice.isKey) {
      const keyTone = KEY_HEROINE_TONE[h];
      if (keyTone !== null && keyTone === choice.tone) {
        delta += DESCRIPTOR_BONUS;
      }
    }

    // H4 KEY 가산 — 두 분기:
    // (1) 미니게임 자리(mechanism:h4_reply_speed): 통과 시 +1 + 묘사 +5(isKey 시), 타임아웃 -3.
    // (2) 대면 KEY 자리(mechanism:h4_facing_key + isKey): 묘사 +5 가산.
    //     2026-05-05 옵션 B (PM 결정) — H3와의 톤 충돌 방지를 위해 명시 마커 도입.
    //     기존 KEY_HEROINE_TONE[H4] = null이라 위 묘사 분기에 안 걸리므로 별도 처리.
    if (h === 'H4') {
      if (choice.mechanism === 'h4_reply_speed' && choice.replyTimeMs !== undefined) {
        const passed = choice.replyTimeMs < H4_REPLY_SPEED.thresholdMs;
        delta += passed ? H4_REPLY_SPEED.passDelta : H4_REPLY_SPEED.failDelta;
        if (passed && choice.isKey) {
          delta += DESCRIPTOR_BONUS;
        }
      } else if (choice.mechanism === 'h4_facing_key' && choice.isKey) {
        // 대면 KEY 자리 — 명시 마커로 H3와 라우팅 분리 (옵션 B)
        delta += DESCRIPTOR_BONUS;
      }
    }

    result[h] = delta;
  }

  return result;
}

/**
 * 톤 → SceneCommand[] 변환. gameStore.applyEffects가 그대로 흘려넣을 수 있게.
 * H4 미니게임 타임아웃 시 late_reply_count 증가 명령도 동시 산출.
 */
export function toneToFlagIncs(
  choice: Pick<Choice, 'tone' | 'isKey' | 'mechanism' | 'replyTimeMs'>,
  sceneMeta?: Pick<SceneMeta, 'toneTime'>,
): SceneCommand[] {
  if (!choice.tone) return [];

  const deltas = computeToneDeltas(choice, sceneMeta);
  const cmds: SceneCommand[] = [];

  for (const h of HEROINE_IDS) {
    if (deltas[h] !== 0) {
      cmds.push({ type: 'FLAG_INC', key: h, delta: deltas[h] });
    }
  }

  // H4 미니게임 타임아웃 → 거절 트리거 카운트
  if (
    choice.mechanism === 'h4_reply_speed' &&
    choice.replyTimeMs !== undefined &&
    choice.replyTimeMs >= H4_REPLY_SPEED.thresholdMs
  ) {
    cmds.push({ type: 'FLAG_INC', key: 'late_reply_count', delta: 1 });
  }

  // NPC 호감도 변동 — 매트릭스 × NPC_GAIN_MULTIPLIER (사용자 결정: NPC 폭 대폭 키워 SOLO 압박).
  // active 필터·1명 룰은 applyChoiceEffects에서 적용.
  for (const npc of NPC_AFFINITY_IDS) {
    const delta = NPC_TONE_MATRIX[npc][choice.tone] * NPC_GAIN_MULTIPLIER;
    if (delta !== 0) {
      cmds.push({ type: 'FLAG_INC', key: npc, delta });
    }
  }

  return cmds;
}

/**
 * KEY 라벨 박힌 선택지가 본 히로인에게 KEY 통과로 기록되는지 검사.
 * 통과면 KEY_CHOICE 명령을 발행해 key_choices 리스트에 추가.
 *
 * H4는 미니게임 통과(replyTimeMs < threshold) 시 별도 KEY_CHOICE 발행.
 */
export function toneToKeyChoice(
  choice: Pick<Choice, 'tone' | 'isKey' | 'mechanism' | 'replyTimeMs' | 'descriptor'>,
  sceneId: string,
  _sceneMeta?: Pick<SceneMeta, 'toneTime'>,
): SceneCommand | null {
  // H4 미니게임은 isKey 무관하게 통과 시 KEY 기록 (CONVENTIONS §3.7 #4)
  if (choice.mechanism === 'h4_reply_speed') {
    if (
      choice.replyTimeMs !== undefined &&
      choice.replyTimeMs < H4_REPLY_SPEED.thresholdMs
    ) {
      return {
        type: 'KEY_CHOICE',
        heroine: 'H4',
        choiceId: choice.descriptor ?? sceneId,
      };
    }
    return null;
  }

  // H4 대면 KEY 자리 — mechanism 'h4_facing_key' 마커로 명시 라우팅 (옵션 B, 2026-05-05).
  // H3 KEY 자리(warm_supportive + isKey)와 동일 톤이라 마커 없으면 H3로 라우팅됨.
  if (choice.mechanism === 'h4_facing_key' && choice.isKey) {
    return {
      type: 'KEY_CHOICE',
      heroine: 'H4',
      choiceId: choice.descriptor ?? sceneId,
    };
  }

  if (!choice.isKey || !choice.tone) return null;

  // 일반 KEY 자리 — 톤 매칭 H1/H2/H3/H5. H4는 위 mechanism 마커 분기로만 처리.
  // 2026-04-30 Step 4: H3 KEY 시간대 무관 변경 (PM 결정).
  for (const h of HEROINE_IDS) {
    if (h === 'H4') continue; // H4는 mechanism 마커 전용 라우팅
    const keyTone = KEY_HEROINE_TONE[h];
    if (keyTone === null || keyTone !== choice.tone) continue;
    return {
      type: 'KEY_CHOICE',
      heroine: h,
      choiceId: choice.descriptor ?? sceneId,
    };
  }
  return null;
}
