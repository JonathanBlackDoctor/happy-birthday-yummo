/**
 * 씬 진행 / 선택지 / 분기 평가 코어 루프.
 *
 * - 씬 매니페스트(`@/scenes/manifest`)에서 Scene 로드
 * - SceneCommand를 한 번에 하나씩 흘림
 * - 선택지 effects 적용 + next 점프
 * - EVALUATE_BRANCH: BRANCH-GRAPH §6.1 + route-H4 §"분기 평가" 알고리즘 SSoT 미러
 *
 * 본 모듈은 순수 — DOM/상태 변경 없음. gameStore에서 호출.
 */

import type {
  EndingId,
  GameFlags,
  HeroineId,
  Scene,
  SceneCommand,
} from './types';
import { HEROINE_IDS } from './types';
import { SCENE_MANIFEST } from '@/scenes/manifest';

/**
 * evaluateRoute 결과 — 챕터 5 끝에서 즉시 종결 케이스(REJECT/SOLO)인지,
 * 챕터 6 본편으로 진행할 winner인지 분기.
 */
export type EvaluateRouteResult =
  | { kind: 'ending'; endingId: EndingId }
  | { kind: 'chapter6'; winner: HeroineId };

export class ScriptInterpreter {
  private scene: Scene | null = null;
  private commandIndex = 0;

  async loadScene(sceneId: string): Promise<Scene> {
    const loader = SCENE_MANIFEST[sceneId];
    if (!loader) {
      throw new Error(`Unknown scene id: ${sceneId}. Update src/scenes/manifest.ts.`);
    }
    this.scene = await loader();
    this.commandIndex = 0;
    return this.scene;
  }

  currentScene(): Scene | null {
    return this.scene;
  }

  currentIndex(): number {
    return this.commandIndex;
  }

  /** 현재 커맨드 1개 반환하고 인덱스 전진. 끝이면 null. */
  step(): SceneCommand | null {
    if (!this.scene) return null;
    if (this.commandIndex >= this.scene.commands.length) return null;
    const cmd = this.scene.commands[this.commandIndex];
    this.commandIndex += 1;
    return cmd;
  }

  /** 인덱스를 직접 세팅 (저장 로드 시) */
  seek(index: number): void {
    this.commandIndex = index;
  }

  /**
   * 챕터 5 끝 라우팅 — 즉시 종결 케이스(REJECT/SOLO)는 ending 분기, 그 외엔 챕터 6 본편으로.
   *
   * BRANCH-GRAPH §6.1 + route-H4 §"분기 평가" 알고리즘 SSoT 미러.
   *
   * 평가 순서 (이 순서가 중요):
   *   F-1: late_reply_count >= 1 → END_H4_REJECT (즉시, 호감도/순위 무관)
   *        — 2026-05-09 미니게임 3초 단축에 맞춰 ≥2 → ≥1 강화.
   *   F-1b (2026-05-08): max(NPC) > max(H) → END_SOLO_SUMMER
   *        — 친구·엄마·교수에 너무 마음 쏟아 히로인 호감도 우습게 넘어버림.
   *   F-2: 모든 호감도 <30 → END_SOLO_SUMMER (16번째 엔딩)
   *   F-3: 메인 히로인 결정 후 챕터 6 본편으로 라우팅 (티어 결정은 evaluateTier가 챕터 6 끝에서 수행).
   */
  evaluateRoute(flags: GameFlags): EvaluateRouteResult {
    if (flags.late_reply_count >= 1) return { kind: 'ending', endingId: 'END_H4_REJECT' };

    const maxH = Math.max(flags.H1, flags.H2, flags.H3, flags.H4, flags.H5);
    const maxNpc = Math.max(
      flags.gyumin, flags.gyeongmin, flags.nathan, flags.wook, flags.junhyuk,
      flags.mom, flags.taeho,
    );
    if (maxNpc > maxH) return { kind: 'ending', endingId: 'END_SOLO_SUMMER' };

    const winner = this.determineWinner(flags);
    if (winner === 'NONE') return { kind: 'ending', endingId: 'END_SOLO_SUMMER' };
    return { kind: 'chapter6', winner };
  }

  /**
   * 챕터 6 끝의 evaluate 씬에서 호출. 이미 라우팅된 winner를 받아 호감도/KEY/late_reply로
   * 트루/해피/노멀/배드/REJECT 티어를 결정.
   */
  evaluateTier(winner: HeroineId, flags: GameFlags): EndingId {
    return this.determineEnding(winner, flags);
  }

  /** @deprecated 2026-05-09 — evaluateRoute + evaluateTier로 분리. 외부 호출처 정리되면 제거. */
  evaluateBranch(flags: GameFlags): EndingId {
    const route = this.evaluateRoute(flags);
    if (route.kind === 'ending') return route.endingId;
    return this.evaluateTier(route.winner, flags);
  }

  private determineWinner(flags: GameFlags): HeroineId | 'NONE' {
    const scores: Array<{ id: HeroineId; score: number }> = HEROINE_IDS.map(
      (id) => ({ id, score: flags[id] }),
    );
    const max = Math.max(...scores.map((s) => s.score));
    if (max < 30) return 'NONE';
    const tied = scores.filter((s) => s.score === max).map((s) => s.id);
    if (tied.length === 1) return tied[0];
    // 동률: last_increment_order에서 마지막에 등장한 (가장 최근에 +값 받은) 쪽
    const order = flags.last_increment_order;
    for (let i = order.length - 1; i >= 0; i -= 1) {
      if (tied.includes(order[i])) return order[i];
    }
    return tied[0];
  }

  private determineEnding(winner: HeroineId, flags: GameFlags): EndingId {
    const aff = flags[winner];
    const keys = flags.key_choices[winner].length;

    /**
     * 인물별 임계값 차별화 (2026-05-09 endings-results-revamp 라운드, PM 결정).
     *
     * 캡 해제(0~∞) + 시뮬 max 기준 ~75-85% 컷. KEY 임계 ≥3 유지.
     * BRANCH-GRAPH §4 시뮬 누적: H1+113 / H2+117 / H3+98 / H4+93 / H5+125 (Ch.1~5).
     *
     *   H1: TRUE ≥105 / HAPPY ≥90  / NORMAL ≥70 / BAD <70
     *   H2: TRUE ≥110 / HAPPY ≥95  / NORMAL ≥75 / BAD <75
     *   H3: TRUE ≥90  / HAPPY ≥75  / NORMAL <75 (BAD 자리 NORMAL 흡수)
     *   H4: TRUE ≥70  + KEY≥3 + late=0 / NORMAL ≥45 / REJECT (late≥1 OR aff<45)
     *   H5: TRUE ≥120 + KEY≥3 / 미달 시 SOLO_SUMMER 폴백
     */

    if (winner === 'H4') {
      if (flags.late_reply_count >= 1) return 'END_H4_REJECT';  // route-H4 우선
      if (aff < 45) return 'END_H4_REJECT';
      if (aff < 70) return 'END_H4_NORMAL';
      if (keys >= 3) return 'END_H4_TRUE';
      return 'END_H4_NORMAL';  // ≥70인데 KEY 부족
    }

    // H5 트루 단일 (BAD/NORMAL/HAPPY 없음). 미달 시 SOLO_SUMMER 폴백.
    if (winner === 'H5') {
      if (aff >= 120 && keys >= 3) return 'END_H5_TRUE';
      return 'END_SOLO_SUMMER';
    }

    // H3 BAD 없음 — NORMAL이 BAD 자리 흡수
    if (winner === 'H3') {
      if (aff >= 90 && keys >= 3) return 'END_H3_TRUE';
      if (aff >= 75) return 'END_H3_HAPPY';
      return 'END_H3_NORMAL';
    }

    // H1, H2 — 4종 풀, 인물별 컷 다름
    if (winner === 'H1') {
      if (aff >= 105 && keys >= 3) return 'END_H1_TRUE';
      if (aff >= 90) return 'END_H1_HAPPY';
      if (aff >= 70) return 'END_H1_NORMAL';
      return 'END_H1_BAD';
    }

    // H2
    if (aff >= 110 && keys >= 3) return 'END_H2_TRUE';
    if (aff >= 95) return 'END_H2_HAPPY';
    if (aff >= 75) return 'END_H2_NORMAL';
    return 'END_H2_BAD';
  }
}
