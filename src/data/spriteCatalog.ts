/**
 * 스프라이트 카탈로그 — 캐릭터 이미지 갤러리(SpriteGallery)용 정적 매니페스트.
 *
 * `public/img/sprites/{spriteId}.webp` 자산 목록을 인물별로 그룹화.
 * 자산 추가 시 본 파일도 함께 수동 갱신 필요 (build-manifest 자동화는 별도 라운드).
 *
 * 정렬 의도:
 *   1. 구윤모 (주인공) — 가장 위
 *   2. 히로인 5명 (H1~H5 순) — 본편 등장 순서
 *   3. NPC 친구·교수 (default만 보유) — 자산 있는 만큼만
 *
 * (2026-05-10 신규 — 캐릭터 이미지 갤러리 라운드)
 */

export interface SpriteCharacter {
  /** 스프라이트 prefix (`yunmo`, `serin` 등). 자산 ID는 `${prefix}_${variant}`. */
  prefix: string;
  /** 사용자 표시 한글 이름. */
  name: string;
  /** 본 인물의 스프라이트 ID 전체 (prefix 포함). 인게임 [CHARACTER] 명령에 박히는 ID와 동일. */
  sprites: string[];
}

export const SPRITE_CATALOG: readonly SpriteCharacter[] = [
  {
    prefix: 'yunmo',
    name: '구윤모 (주인공)',
    sprites: [
      'yunmo_default',
      'yunmo_smile',
      'yunmo_blush',
      'yunmo_panic',
      'yunmo_perv',
      'yunmo_perv_1',
      'yunmo_recover',
      'yunmo_sad',
      'yunmo_serious',
    ],
  },
  {
    prefix: 'serin',
    name: '차세린',
    sprites: [
      'serin_default',
      'serin_smile',
      'serin_smile_warm',
      'serin_blush',
      'serin_concerned',
      'serin_serious',
      'serin_surprised',
      'serin_tired',
      'serin_outfit_casual',
      'serin_outfit_winter_coat',
    ],
  },
  {
    prefix: 'hajeong',
    name: '윤하정',
    sprites: [
      'hajeong_default',
      'hajeong_smile_small',
      'hajeong_warm_smile',
      'hajeong_blush',
      'hajeong_drunk',
      'hajeong_panic',
      'hajeong_pout',
      'hajeong_serious',
      'hajeong_outfit_lab_coat',
      'hajeong_outfit_party',
    ],
  },
  {
    prefix: 'seol',
    name: '한설',
    sprites: [
      'seol_default',
      'seol_smile_slight',
      'seol_warm_smile',
      'seol_blush',
      'seol_concerned',
      'seol_serious',
      'seol_tired',
      'seol_no_glasses',
      'seol_outfit_casual',
      'seol_outfit_lab_late',
    ],
  },
  {
    prefix: 'seoyoon',
    name: '나서윤',
    sprites: [
      'seoyoon_default',
      'seoyoon_smile_slight',
      'seoyoon_smile_full',
      'seoyoon_warm',
      'seoyoon_blush',
      'seoyoon_distant',
      'seoyoon_serious',
      'seoyoon_thinking',
      'seoyoon_outfit_date',
      'seoyoon_outfit_school',
    ],
  },
  {
    prefix: 'yuna',
    name: '장윤영',
    sprites: [
      'yuna_default',
      'yuna_smile_big',
      'yuna_warm_smile',
      'yuna_excited',
      'yuna_blush',
      'yuna_pout',
      'yuna_sad',
      'yuna_serious',
      'yuna_outfit_dress',
      'yuna_outfit_festival',
    ],
  },
  {
    prefix: 'gyumin',
    name: '김규민',
    sprites: ['gyumin_default'],
  },
  {
    prefix: 'gyeongmin',
    name: '표경민',
    sprites: ['gyeongmin_default'],
  },
  {
    prefix: 'nathan',
    name: '조나단',
    sprites: ['nathan_default'],
  },
  {
    prefix: 'junhyuk',
    name: '오준혁',
    sprites: ['junhyuk_default'],
  },
];

/** 모든 스프라이트 ID flat 리스트 — 통계 / 갤러리 카운트용. */
export const ALL_SPRITE_IDS: readonly string[] = SPRITE_CATALOG.flatMap((c) => c.sprites);

/** 스프라이트 ID에서 표시용 라벨(variant 부분) 추출 — 예: 'serin_outfit_casual' → 'outfit casual'. */
export function spriteVariantLabel(spriteId: string): string {
  const idx = spriteId.indexOf('_');
  if (idx === -1) return spriteId;
  return spriteId.slice(idx + 1).replace(/_/g, ' ');
}
