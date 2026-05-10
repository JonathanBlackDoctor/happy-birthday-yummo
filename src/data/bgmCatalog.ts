/**
 * BGM 8트랙 카탈로그 — `docs/assets/BGM-list.md` SSoT 미러.
 * BGM 갤러리(UI-SPEC §7.2)에서 사용.
 */

export interface BgmCatalogEntry {
  id: string;
  ko: string;
  title: string;
  composer: string;
  license: string;
  durationSeconds: number;
  description: string;
}

export const BGM_CATALOG: readonly BgmCatalogEntry[] = [
  {
    id: 'bgm_main_theme',
    ko: '메인_테마',
    title: '春よ、強く美しく',
    composer: '龍崎一',
    license: 'DOVA-Syndrome',
    durationSeconds: 134,
    description: '타이틀·오프닝·트루엔딩 크레딧',
  },
  {
    id: 'bgm_daily',
    ko: '일상',
    title: 'カフェBGM',
    composer: 'H★',
    license: 'DOVA-Syndrome',
    durationSeconds: 318,
    description: '강의실·캠퍼스·자취방·일상',
  },
  {
    id: 'bgm_comic',
    ko: '코믹',
    title: 'コミカルな時間',
    composer: '田中芳典',
    license: 'DOVA-Syndrome',
    durationSeconds: 113,
    description: '변태 망상 페어 시그니처',
  },
  {
    id: 'bgm_tension',
    ko: '긴장',
    title: '焦燥',
    composer: 'マニーラ',
    license: 'DOVA-Syndrome',
    durationSeconds: 167,
    description: '카데바 첫 대면·시험·고백 직전',
  },
  {
    id: 'bgm_romantic',
    ko: '로맨틱',
    title: 'Is This Love',
    composer: 'gooset',
    license: 'DOVA-Syndrome',
    durationSeconds: 153,
    description: '호감도 상승 이벤트',
  },
  {
    id: 'bgm_sad',
    ko: '슬픔',
    title: 'あの日の僕たちへ',
    composer: '蒲鉾さちこ',
    license: 'DOVA-Syndrome',
    durationSeconds: 136,
    description: '거절 엔딩·배드 엔딩',
  },
  {
    id: 'bgm_climax',
    ko: '클라이맥스',
    title: '感動をあなたに #2',
    composer: 'Kyaai',
    license: 'DOVA-Syndrome',
    durationSeconds: 176,
    description: '트루엔딩 클라이맥스',
  },
  {
    id: 'bgm_katalk',
    ko: '카톡',
    title: 'Ambient Pads Loop 04',
    composer: 'DRAGON-STUDIO',
    license: 'Pixabay License',
    durationSeconds: 19,
    description: '카톡 모달 잔잔 배경',
  },
] as const;
