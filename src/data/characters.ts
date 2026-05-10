/**
 * 캐릭터 정적 데이터 — `02-characters/` 시트 정합 (이름·코드·UI 컬러).
 * 시나리오 작가가 사용하는 화자 표기와 매칭. 카톡 sender ID 매핑에도 사용.
 */

import type { HeroineId } from '@/engine/types';

export interface CharacterMeta {
  id: string; // 영문 코드 (스프라이트 파일명 prefix)
  name: string; // 화면 표시명 (한글)
  bubbleColor?: string; // 카톡 버블 강조 (옵션)
  shortName?: string; // 친구 단톡 등 짧은 표기
}

export const YUNMO: CharacterMeta = {
  id: 'yunmo',
  name: '구윤모',
  shortName: '윤모',
};

export const HEROINES: Record<HeroineId, CharacterMeta> = {
  H1: { id: 'serin', name: '차세린', shortName: '세린' },
  H2: { id: 'hajeong', name: '윤하정', shortName: '하정' },
  H3: { id: 'seol', name: '한설', shortName: '한설' },
  H4: { id: 'seoyoon', name: '나서윤', shortName: '서윤' },
  H5: { id: 'yuna', name: '장윤영', shortName: '윤영' }, // 영문 ID `yuna` 유지 (CONVENTIONS §3.5)
};

export function characterByCode(code: string): CharacterMeta | null {
  if (code === YUNMO.id) return YUNMO;
  for (const h of Object.values(HEROINES)) {
    if (h.id === code) return h;
  }
  return null;
}

export function isHeroineId(value: string): value is HeroineId {
  return value === 'H1' || value === 'H2' || value === 'H3' || value === 'H4' || value === 'H5';
}

/**
 * [CHARACTER] 명령의 id(시나리오 작가가 한글 또는 영문 슬러그로 박음) → HeroineId 역인덱스.
 * met_heroines 추적용. KAKAO sender는 영문 슬러그(`hajeong`)로 들어와도 같이 처리.
 * (2026-05-08 추가)
 */
const HEROINE_NAME_INDEX: Record<string, HeroineId> = {
  // 한글 이름
  '차세린': 'H1',
  '윤하정': 'H2',
  '한설': 'H3',
  '나서윤': 'H4',
  '장윤영': 'H5',
  // 영문 슬러그 (HEROINES.id)
  serin: 'H1',
  hajeong: 'H2',
  seol: 'H3',
  seoyoon: 'H4',
  yuna: 'H5',
};

export function nameToHeroineId(name: string): HeroineId | null {
  return HEROINE_NAME_INDEX[name] ?? null;
}
