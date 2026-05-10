/**
 * CHARACTER 명령의 (id, sprite) → 스프라이트 파일 경로 변환.
 *
 * 시나리오 작가는 한글/영문/H#로 자유롭게 박을 수 있고, sprite는 단순 표정명(`default`, `smile`)
 * 또는 이미 prefix 포함된 형식(`yunmo_default`) 둘 다 허용.
 *
 * - 매핑 가능한 캐릭터(윤모 + H1~H5)만 스프라이트 노출. 사이드 캐릭터는 null → 렌더 X.
 * - sprite 값에 underscore 포함 + prefix가 알려진 캐릭터면 그대로 사용 (옛 데이터 호환).
 */

const PREFIX_BY_NAME: Record<string, string> = {
  // 윤모
  yunmo: 'yunmo',
  구윤모: 'yunmo',
  윤모: 'yunmo',
  // H1
  serin: 'serin',
  H1: 'serin',
  차세린: 'serin',
  세린: 'serin',
  // H2
  hajeong: 'hajeong',
  H2: 'hajeong',
  윤하정: 'hajeong',
  하정: 'hajeong',
  // H3
  seol: 'seol',
  H3: 'seol',
  한설: 'seol',
  설: 'seol',
  // H4
  seoyoon: 'seoyoon',
  H4: 'seoyoon',
  나서윤: 'seoyoon',
  서윤: 'seoyoon',
  // H5
  yuna: 'yuna',
  H5: 'yuna',
  장윤영: 'yuna',
  윤영: 'yuna',
  // 동기 4명 (라운드 4, 2026-05-07. gyeongmin/nathan 채택 — 카톡 아바타와 정합)
  gyumin: 'gyumin',
  김규민: 'gyumin',
  규민: 'gyumin',
  junhyuk: 'junhyuk',
  오준혁: 'junhyuk',
  준혁: 'junhyuk',
  nathan: 'nathan',
  조나단: 'nathan',
  gyeongmin: 'gyeongmin',
  표경민: 'gyeongmin',
  경민: 'gyeongmin',
};

const KNOWN_PREFIXES = new Set([
  'yunmo', 'serin', 'hajeong', 'seol', 'seoyoon', 'yuna',
  'gyumin', 'junhyuk', 'nathan', 'gyeongmin',
]);

/**
 * 표정 자산이 default 1종만 있는 사이드 캐릭터 (정책 상수, 보호망).
 * 시나리오에서 default 외 sprite 값이 와도 default로 폴백 — silent fail(null) 방지.
 * 표정 자산 추가 시 해당 prefix를 이 셋에서 제거하면 자동 복구.
 *
 * 2026-05-08 옵션 B 라운드: 시나리오에서 사이드 캐릭은 default만 사용하도록 정합화.
 * 보호망은 유지 — 미래 시나리오 변경 시 잘못된 sprite가 들어와도 안전 폴백.
 */
const SIDE_DEFAULT_ONLY = new Set(['gyumin', 'gyeongmin', 'nathan', 'junhyuk']);

/**
 * 스프라이트 파일 alias — 시나리오 표기와 실파일이 다를 때 매핑.
 * 2026-05-08 옵션 B 라운드: 시나리오 표기를 실파일에 맞게 정합화하여 alias 비움.
 * 미래에 시나리오/자산 불일치 발생 시 이 객체에 한 줄 추가하여 빠르게 처방 가능.
 */
const SPRITE_FILE_ALIAS: Record<string, string> = {};

/**
 * id + sprite → 파일명(`{prefix}_{sprite}`). 매핑 실패 시 null.
 */
export function resolveSpriteName(id: string, sprite: string): string | null {
  let fileName: string | null;
  let prefix: string | undefined;
  if (sprite.includes('_') && KNOWN_PREFIXES.has(sprite.split('_')[0])) {
    fileName = sprite;
    prefix = sprite.split('_')[0];
  } else {
    prefix = PREFIX_BY_NAME[id];
    if (!prefix) return null;
    fileName = `${prefix}_${sprite}`;
  }
  // 사이드 캐릭터(default 1종만 있음) → 표정 무시, default로 폴백
  if (prefix && SIDE_DEFAULT_ONLY.has(prefix)) {
    return `${prefix}_default`;
  }
  return SPRITE_FILE_ALIAS[fileName] ?? fileName;
}
