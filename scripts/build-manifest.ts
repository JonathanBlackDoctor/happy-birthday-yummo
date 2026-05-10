/* eslint-disable no-console */
/**
 * 자산 매니페스트 빌더 v0.1.
 *
 * 입력:
 *   - `src/scenes/*.scene.json` (compile-scene 출력) — 시나리오 사용 자산 ID 인벤토리
 *   - `src/engine/audioMappings.ts` SFX_MAP / BGM_MAP — 한글→영문 ID 변환
 *   - `04-image-prompts/backgrounds/bg-list.md` — 등록 BG 화이트리스트
 *   - `04-image-prompts/sprites/sprite-list.md` (옵션) — 등록 스프라이트
 *   - `04-image-prompts/event-cgs/cg-list.md` (옵션) — 등록 CG
 *   - `04-image-prompts/veo-videos/video-list.md` (옵션) — 등록 영상
 *
 * 출력: `public/manifest.json`
 *   {
 *     "backgrounds": [...],   // 시나리오 사용 + bg-list 등록
 *     "characters": { id: [sprite_variant, ...] },
 *     "cgs": [...],
 *     "videos": [...],
 *     "bgms": [...],          // 영문 ID
 *     "sfx": [...],           // 영문 ID
 *     "_meta": { generatedAt, sceneCount, ... }
 *   }
 *
 * INTEGRATION-PLAN.md §3 SSoT 미러. W5 콘텐츠 통합 라운드 (2026-05-06).
 *
 * 사용:
 *   npm run manifest
 *   npx tsx scripts/build-manifest.ts
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SCENES_DIR = path.join(ROOT, 'src/scenes');
const SCENES_MANIFEST = path.join(SCENES_DIR, 'compiled-manifest.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_FILE = path.join(PUBLIC_DIR, 'manifest.json');
const BG_LIST = path.join(ROOT, '04-image-prompts/backgrounds/bg-list.md');
const SPRITE_LIST = path.join(ROOT, '04-image-prompts/sprites/sprite-list.md');
const CG_LIST = path.join(ROOT, '04-image-prompts/event-cgs/cg-list.md');
const VIDEO_LIST = path.join(ROOT, '04-image-prompts/veo-videos/video-list.md');
const AUDIO_MAPPINGS = path.join(ROOT, 'src/engine/audioMappings.ts');

/**
 * 코드 직접 참조 자산 — 시나리오 [CG/VIDEO/SFX] 디렉티브 외부에서 import/렌더되는 자산.
 * compile-scene이 못 잡으므로 manifest에 명시적으로 합침. cg-list/video-list.md에는 등록되어 있어야 cross-check 통과.
 */
const EXTRA_CGS: readonly string[] = [
  'cg_seoyoon_reject', // src/ui/katalk/RejectEnding.tsx (거절 엔딩 단계 5 풀스크린 오버레이)
];

const EXTRA_VIDEOS: readonly string[] = [
  'video_opening',         // src/ui/OpeningVideo.tsx (게임 시작 자동 재생)
  'video_reject_seoyoon',  // src/ui/katalk/RejectEnding.tsx (거절 엔딩 단계 7)
];

interface SceneCommand {
  type: string;
  [key: string]: unknown;
}
interface CompiledScene {
  id: string;
  commands: SceneCommand[];
}
interface ManifestEntry {
  id: string;
  file: string;
  commandCount: number;
}

interface AssetManifest {
  backgrounds: string[];
  characters: Record<string, string[]>;
  cgs: string[];
  videos: string[];
  bgms: string[];
  sfx: string[];
  _meta: {
    generatedAt: string;
    sceneCount: number;
    registered: {
      bg: number;
      sprite: number;
      cg: number;
      video: number;
    };
    notes: string[];
  };
}

const warnings: string[] = [];

function loadScenes(): CompiledScene[] {
  if (!existsSync(SCENES_MANIFEST)) {
    console.error('✗ compiled-manifest.json 누락 — npm run compile 먼저 실행');
    process.exit(1);
  }
  const m: ManifestEntry[] = JSON.parse(readFileSync(SCENES_MANIFEST, 'utf8'));
  return m.map((e) => JSON.parse(readFileSync(path.join(SCENES_DIR, e.file), 'utf8')));
}

function parseBgList(): Set<string> {
  const text = readFileSync(BG_LIST, 'utf8');
  const ids = new Set<string>();
  const re = /^##\s+\d+\.\s+`(bg_[a-z0-9_]+)\.webp`/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ids.add(m[1]);
  return ids;
}

function parseSpriteList(): Set<string> {
  if (!existsSync(SPRITE_LIST)) return new Set();
  const text = readFileSync(SPRITE_LIST, 'utf8');
  const ids = new Set<string>();
  // 윤모: `#### N. \`<char>_<variant>.webp\`` 헤더 형식
  const headerRe = /^####\s+\d+\.\s+`([a-z][a-z0-9_]+)\.webp`/gim;
  let m: RegExpExecArray | null;
  while ((m = headerRe.exec(text)) !== null) ids.add(m[1]);
  // 히로인 5명: `- \`<char>_<variant>.webp\` — desc` bullet 형식
  const bulletRe = /^-\s+`([a-z][a-z0-9_]+)\.webp`/gim;
  while ((m = bulletRe.exec(text)) !== null) ids.add(m[1]);
  return ids;
}

function parseCgList(): Set<string> {
  if (!existsSync(CG_LIST)) return new Set();
  const text = readFileSync(CG_LIST, 'utf8');
  const ids = new Set<string>();
  // `### N. \`cg_xxx.webp\`` 패턴
  const re = /^###\s+\d+\.\s+`(cg_[a-z0-9_]+)\.webp`/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ids.add(m[1]);
  return ids;
}

function parseVideoList(): Set<string> {
  if (!existsSync(VIDEO_LIST)) return new Set();
  const text = readFileSync(VIDEO_LIST, 'utf8');
  const ids = new Set<string>();
  // `## N. \`video_xxx.mp4\`` 패턴
  const re = /^##\s+\d+\.\s+`(video_[a-z0-9_]+)\.mp4`/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ids.add(m[1]);
  return ids;
}

function parseAudioMaps(): {
  bgmKoToEn: Map<string, string>;
  sfxKoToEn: Map<string, string>;
  bgmEnSet: Set<string>;
  sfxEnSet: Set<string>;
} {
  const text = readFileSync(AUDIO_MAPPINGS, 'utf8');
  const bgmKoToEn = new Map<string, string>();
  const sfxKoToEn = new Map<string, string>();
  const bgmEnSet = new Set<string>();
  const sfxEnSet = new Set<string>();

  // BGM_MAP 파싱 — { ko: '메인_테마', en: 'bgm_main_theme' } 패턴
  const bgmRe = /\{\s*ko:\s*'([^']+)',\s*en:\s*'(bgm_[a-z0-9_]+)'\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = bgmRe.exec(text)) !== null) {
    bgmKoToEn.set(m[1], m[2]);
    bgmEnSet.add(m[2]);
  }
  // SFX_MAP 파싱 — { ko: '...' | null, en: 'sfx_...', priority: 'P0' } 패턴
  const sfxRe = /\{\s*ko:\s*(?:'([^']+)'|null),\s*en:\s*'(sfx_[a-z0-9_]+)'/g;
  while ((m = sfxRe.exec(text)) !== null) {
    if (m[1]) sfxKoToEn.set(m[1], m[2]);
    sfxEnSet.add(m[2]);
  }
  return { bgmKoToEn, sfxKoToEn, bgmEnSet, sfxEnSet };
}

function buildManifest(): AssetManifest {
  const scenes = loadScenes();
  const registeredBgs = parseBgList();
  const registeredSprites = parseSpriteList();
  const registeredCgs = parseCgList();
  const registeredVideos = parseVideoList();
  const audioMaps = parseAudioMaps();

  const bgs = new Set<string>();
  const cgs = new Set<string>();
  const videos = new Set<string>();
  const bgms = new Set<string>();
  const sfx = new Set<string>();
  const characters: Record<string, Set<string>> = {};

  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'BG' && typeof c.image === 'string') {
        // 단색 (black/white) 제외
        if (c.image !== 'black' && c.image !== 'white') bgs.add(c.image);
      }
      if (c.type === 'CG' && typeof c.cgId === 'string') cgs.add(c.cgId);
      if (c.type === 'VIDEO' && typeof c.src === 'string') videos.add(c.src);
      if (c.type === 'BGM' && typeof c.track === 'string') {
        const ko = c.track;
        const en = audioMaps.bgmKoToEn.get(ko);
        if (en) {
          bgms.add(en);
        } else if (audioMaps.bgmEnSet.has(ko)) {
          bgms.add(ko); // 이미 영문 ID인 경우
        } else {
          warnings.push(`BGM 미매핑: "${ko}" (audioMappings.ts BGM_MAP 추가 필요)`);
          bgms.add(ko);
        }
      }
      if (c.type === 'SFX' && typeof c.sound === 'string') {
        const ko = c.sound;
        const en = audioMaps.sfxKoToEn.get(ko);
        if (en) {
          sfx.add(en);
        } else if (audioMaps.sfxEnSet.has(ko)) {
          sfx.add(ko);
        } else {
          warnings.push(`SFX 미매핑: "${ko}" (audioMappings.ts SFX_MAP 추가 필요)`);
          sfx.add(ko);
        }
      }
      if (c.type === 'CHARACTER' && typeof c.id === 'string') {
        characters[c.id] ??= new Set<string>();
        if (typeof c.sprite === 'string') characters[c.id].add(c.sprite);
      }
    }
  }

  const charactersOut: Record<string, string[]> = Object.fromEntries(
    Object.entries(characters).map(([k, v]) => [k, [...v].sort()]),
  );

  // bg-list 등록되어 있지만 시나리오 미사용 BG도 매니페스트에 포함 (placeholder 자산 사전 배치 가능)
  for (const bg of registeredBgs) bgs.add(bg);

  // 코드 직접 참조 자산을 manifest에 합침 (시나리오 외부 사용)
  for (const cg of EXTRA_CGS) cgs.add(cg);
  for (const v of EXTRA_VIDEOS) videos.add(v);

  // audioMappings SSoT 전수 등록 — 한글 큐 매핑 없는 시스템 SFX (ko: null) 포함.
  // 시나리오 [SFX] 디렉티브가 닿지 않는 P0 SFX(sfx_click/sfx_pageturn/sfx_timer_out/sfx_realize/sfx_katalk_send)도 manifest에 노출.
  for (const en of audioMaps.sfxEnSet) sfx.add(en);
  for (const en of audioMaps.bgmEnSet) bgms.add(en);

  const notes: string[] = [];

  // BG cross-check (시나리오 사용 ↔ bg-list 등록)
  for (const bg of bgs) {
    if (!registeredBgs.has(bg) && bg !== 'black' && bg !== 'white') {
      notes.push(`미등록 BG (시나리오 사용): ${bg}`);
    }
  }

  // CG cross-check (시나리오 사용 ↔ cg-list 등록)
  for (const cg of cgs) {
    if (!registeredCgs.has(cg)) notes.push(`미등록 CG (시나리오 사용): ${cg}`);
  }

  // VIDEO cross-check (시나리오 사용 ↔ video-list 등록)
  for (const v of videos) {
    if (!registeredVideos.has(v)) notes.push(`미등록 VIDEO (시나리오 사용): ${v}`);
  }

  // CHARACTER + sprite cross-check (시나리오 사용 ↔ sprite-list 등록)
  // sprite-list ID는 영문 (yunmo_default 등). 시나리오 CHARACTER는 한글 (윤모/차세린/...)이라 매핑 필요.
  // 여기서는 sprite-list 등록 ID를 출력에 노출하고 cross-check는 불필요한 미스매치 회피를 위해 메모만.
  // (한글 CHARACTER → 영문 ID 매핑 정합화는 별도 라운드)

  for (const w of warnings) notes.push(w);

  return {
    backgrounds: [...bgs].sort(),
    characters: charactersOut,
    cgs: [...cgs].sort(),
    videos: [...videos].sort(),
    bgms: [...bgms].sort(),
    sfx: [...sfx].sort(),
    _meta: {
      generatedAt: new Date().toISOString(),
      sceneCount: scenes.length,
      registered: {
        bg: registeredBgs.size,
        sprite: registeredSprites.size,
        cg: registeredCgs.size,
        video: registeredVideos.size,
      },
      notes,
    },
  };
}

function main(): void {
  console.log('자산 매니페스트 빌드 시작 ...');
  const manifest = buildManifest();
  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✓ ${OUT_FILE}`);
  console.log(`  backgrounds: ${manifest.backgrounds.length}`);
  console.log(`  characters: ${Object.keys(manifest.characters).length}`);
  console.log(`  cgs: ${manifest.cgs.length}`);
  console.log(`  videos: ${manifest.videos.length}`);
  console.log(`  bgms: ${manifest.bgms.length}`);
  console.log(`  sfx: ${manifest.sfx.length}`);
  if (manifest._meta.notes.length > 0) {
    console.warn(`⚠ ${manifest._meta.notes.length}건 메모:`);
    for (const n of manifest._meta.notes) console.warn(`  ${n}`);
  }
}

main();
