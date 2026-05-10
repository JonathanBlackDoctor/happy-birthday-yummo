/**
 * 16개 엔딩 결과 화면 플레이버 — 결정적 장면(CG/BG) + 명대사.
 *
 * EndingScreen이 본 매핑으로 풀스크린 배경(CG 또는 BG)을 렌더하고,
 * 어두운 보라 반투명 오버레이 + 상단 명대사 인용을 합성한다.
 *
 * 명대사(quote)는 16개 엔딩 씬 파일(`ch06_h{N}_{tier}.scene.json` + `end_solo_summer_main.scene.json`)에서
 * 마지막 결정적 DIALOGUE/MONOLOGUE 한 줄을 1차 추출 → PM 검수.
 *
 * 누락 검출: `Record<EndingId, EndingFlavor>` 타입으로 16개 키 강제. 누락 시 컴파일 에러.
 *
 * (2026-05-09 PM 결정 — endings-results-revamp 라운드)
 */

import type { EndingId } from '@/engine/types';

export interface EndingFlavor {
  /**
   * 결과 화면 풀스크린 배경에 깔 결정적 장면.
   * - 'cg' : `/img/cg/{id}.webp` — TRUE/HAPPY/H4_NORMAL 등 CG 보유 엔딩.
   * - 'bg' : `/img/bg/{id}.webp` — H1/H2 NORMAL/BAD, H3 NORMAL, SOLO 등 CG 없는 엔딩.
   * - 'none': RejectEnding이 자체 8단계 시퀀스 처리 — EndingScreen 백업은 단순 어두운 배경.
   */
  decisiveImage:
    | { type: 'cg'; id: string }
    | { type: 'bg'; id: string }
    | { type: 'none' };
  /**
   * BG-only 엔딩에 BG 위로 합성할 윈너 히로인 스프라이트.
   * `/img/sprites/{spriteId}.webp` (예: 'serin_smile_warm').
   * undefined면 스프라이트 미합성. CG 엔딩은 CG 자체에 인물 포함되어 있어 보통 미사용.
   * SOLO 엔딩은 윈너가 없으므로 미사용.
   */
  sprite?: string;
  /** 명대사 본문 (따옴표 미포함). 빈 문자열이면 인용 미표시. */
  quote: string;
  /** 화자 표기 (예: "차세린", "구윤모"). 빈 문자열이면 footer 미표시. */
  quoteSpeaker: string;
}

export const ENDING_FLAVOR: Record<EndingId, EndingFlavor> = {
  END_H1_TRUE: {
    decisiveImage: { type: 'cg', id: 'cg_serin_true' },
    quote: '잘 받았어요. 진짜로.',
    quoteSpeaker: '차세린',
  },
  END_H1_HAPPY: {
    decisiveImage: { type: 'cg', id: 'cg_serin_cafe_late' },
    quote: '한 학기 잘 와줬어요.',
    quoteSpeaker: '차세린',
  },
  END_H1_NORMAL: {
    decisiveImage: { type: 'bg', id: 'bg_campus_cafe' },
    sprite: 'serin_smile_warm',
    quote: '학생-선생님으로 한 학기 더. 그게 자연스러운 거리예요.',
    quoteSpeaker: '차세린',
  },
  END_H1_BAD: {
    decisiveImage: { type: 'bg', id: 'bg_dongsan_hallway' },
    sprite: 'serin_concerned',
    quote: '학생-선생님 관계가 자연스러울 것 같아요.',
    quoteSpeaker: '차세린',
  },
  END_H2_TRUE: {
    decisiveImage: { type: 'cg', id: 'cg_hajeong_true' },
    quote: '부산 한 번 와줘. 본가 아니라 그냥 부산.',
    quoteSpeaker: '윤하정',
  },
  END_H2_HAPPY: {
    decisiveImage: { type: 'cg', id: 'cg_hajeong_drunk' },
    quote: '친구에서 시작하자.',
    quoteSpeaker: '윤하정',
  },
  END_H2_NORMAL: {
    // 2026-05-10 PM 변경: bg_studio_room(자취방) → bg_library_night(밤 도서관).
    decisiveImage: { type: 'bg', id: 'bg_library_night' },
    sprite: 'hajeong_smile_small',
    quote: '너랑 친구잖아.',
    quoteSpeaker: '윤하정',
  },
  END_H2_BAD: {
    decisiveImage: { type: 'bg', id: 'bg_lecture_day' },
    sprite: 'hajeong_pout',
    quote: '...뭐, 됐어.',
    quoteSpeaker: '윤하정',
  },
  END_H3_TRUE: {
    decisiveImage: { type: 'cg', id: 'cg_seol_true' },
    quote: '그 말 정말 잘 받았어요.',
    quoteSpeaker: '한설',
  },
  END_H3_HAPPY: {
    decisiveImage: { type: 'cg', id: 'cg_seol_late_night' },
    quote: '새벽 1시 실험실에서의 그 한마디, 마음에 두고 갈게요.',
    quoteSpeaker: '한설',
  },
  END_H3_NORMAL: {
    decisiveImage: { type: 'bg', id: 'bg_anatomy_lab' },
    sprite: 'seol_smile_slight',
    quote: '그 일은 그 일대로 마음에 두고 갈게요.',
    quoteSpeaker: '한설',
  },
  END_H4_TRUE: {
    decisiveImage: { type: 'cg', id: 'cg_seoyoon_true' },
    quote: '답장 빠르게 해줘서 고마워, 윤모야.',
    quoteSpeaker: '나서윤',
  },
  END_H4_NORMAL: {
    decisiveImage: { type: 'cg', id: 'cg_seoyoon_date' },
    quote: '그 다음 시험 끝나고 봬요.',
    quoteSpeaker: '나서윤',
  },
  END_H4_REJECT: {
    decisiveImage: { type: 'none' },
    quote: '',
    quoteSpeaker: '',
  },
  END_H5_TRUE: {
    decisiveImage: { type: 'cg', id: 'cg_yuna_true' },
    quote: '"오빠" 한 번 부르는 게 의외로 어렵더라고요!',
    quoteSpeaker: '장윤영',
  },
  END_SOLO_SUMMER: {
    decisiveImage: { type: 'bg', id: 'bg_studio_room' },
    quote: '그래도 본과 1학년 봄, 좋은 봄이었지.',
    quoteSpeaker: '구윤모',
  },
};

/** EndingScreen 헬퍼 — decisiveImage.type 기반 webp 경로 산출. 'none'은 null. */
export function resolveDecisiveImagePath(flavor: EndingFlavor): string | null {
  if (flavor.decisiveImage.type === 'none') return null;
  const folder = flavor.decisiveImage.type === 'cg' ? 'cg' : 'bg';
  return `/img/${folder}/${flavor.decisiveImage.id}.webp`;
}
