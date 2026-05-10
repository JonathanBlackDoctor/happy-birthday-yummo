/**
 * 카톡 발신자 → 아바타·표시명 매핑.
 *
 * 자산 출처:
 * - 친구·본인: `assets/카카오톡 프로필/` 압축본 → `public/img/avatar/{en}.webp`
 * - 히로인: default 스프라이트 얼굴 crop → `public/img/avatar/{heroine_id}.webp`
 * - 매핑 없음: default1·2·3 중 sender 문자열 해시로 결정 (단톡 멤버 색상 다양화)
 *
 * v2 프로필: 김규민·표경민은 3번째 카톡 씬(`ch03_05_kakao_night`)부터 새 사진 사용.
 */

import { HEROINES, YUNMO, isHeroineId } from './characters';

interface ProfileMapping {
  avatar: string;
  name: string;
}

const FRIEND_PROFILES: Record<string, ProfileMapping> = {
  김규민: { avatar: '/img/avatar/gyumin.webp', name: '김규민' },
  표경민: { avatar: '/img/avatar/gyeongmin.webp', name: '표경민' },
  조나단: { avatar: '/img/avatar/nathan.webp', name: '조나단' },
  정욱: { avatar: '/img/avatar/wook.webp', name: '정욱' },
  // 오준혁: 카톡 프로필 자산 없음 → default1·2·3 해시 폴백 (pickDefaultAvatar)
};

/** v2 프로필 적용 — 3번째 카톡 씬부터. */
const FRIEND_PROFILES_V2: Record<string, ProfileMapping> = {
  김규민: { avatar: '/img/avatar/gyumin_v2.webp', name: '김규민' },
  표경민: { avatar: '/img/avatar/gyeongmin_v2.webp', name: '표경민' },
};

/**
 * 스토리 순서로 카톡 등장 씬 (1-indexed). v2 프로필은 KAKAO_V2_FROM_INDEX부터 적용.
 */
const KAKAO_SCENE_ORDER: string[] = [
  'ch01_03_kakao_evening', // 1
  'ch02_05_kakao_night', // 2
  'ch03_05_kakao_night', // 3 ← v2 시작
  'ch04_05_seoyoon_kakao',
  'ch05_03_kakao_dawn',
  'ch06_h4_05_late_kakao',
  'ch06_h5_04_late_kakao',
];
const KAKAO_V2_FROM_INDEX = 2; // 0-indexed: ch03_05_kakao_night

export function shouldUseV2Profile(sceneId: string | null | undefined): boolean {
  if (!sceneId) return false;
  const idx = KAKAO_SCENE_ORDER.indexOf(sceneId);
  if (idx === -1) {
    // 매핑 외 카톡 씬(ch04~ch06 라우트별)이면 ch03 이후라고 추정 (v2 사용)
    // 단, ch01·ch02 prefix이면 v1 유지
    if (sceneId.startsWith('ch01') || sceneId.startsWith('ch02') || sceneId.startsWith('prologue')) {
      return false;
    }
    return true;
  }
  return idx >= KAKAO_V2_FROM_INDEX;
}

const DEFAULT_AVATARS = [
  '/img/avatar/default1.webp',
  '/img/avatar/default2.webp',
  '/img/avatar/default3.webp',
];

/** 같은 sender는 항상 같은 default 아바타가 나오도록 결정적으로 해시. */
function pickDefaultAvatar(sender: string): string {
  let h = 0;
  for (let i = 0; i < sender.length; i++) h = (h * 31 + sender.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[idx];
}

export function resolveProfile(
  sender: string,
  sceneId?: string | null,
): ProfileMapping {
  if (sender === 'yunmo' || sender === YUNMO.id || sender === YUNMO.name) {
    return { avatar: '/img/avatar/yunmo.webp', name: YUNMO.name };
  }
  if (isHeroineId(sender)) {
    const h = HEROINES[sender];
    return { avatar: `/img/avatar/${h.id}.webp`, name: h.name };
  }
  for (const h of Object.values(HEROINES)) {
    if (sender === h.id || sender === h.name) {
      return { avatar: `/img/avatar/${h.id}.webp`, name: h.name };
    }
  }
  if (shouldUseV2Profile(sceneId) && FRIEND_PROFILES_V2[sender]) {
    return FRIEND_PROFILES_V2[sender];
  }
  if (FRIEND_PROFILES[sender]) {
    return FRIEND_PROFILES[sender];
  }
  return { avatar: pickDefaultAvatar(sender), name: sender };
}

export function isSelfSender(sender: string): boolean {
  return sender === 'yunmo' || sender === YUNMO.id || sender === YUNMO.name;
}
