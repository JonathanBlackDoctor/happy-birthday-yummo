/* eslint-disable no-console */
/**
 * 빌드 검증 스크립트 v0.4.
 *
 * 입력: `src/scenes/*.scene.json` (compile-scene 출력) + `src/scenes/compiled-manifest.json`
 *      + `04-image-prompts/backgrounds/bg-list.md` (BG 화이트리스트)
 *      + `04-image-prompts/event-cgs/cg-list.md` (CG 화이트리스트)
 *      + `04-image-prompts/veo-videos/video-list.md` (VIDEO 화이트리스트)
 *      + `src/engine/audioMappings.ts` (BGM/SFX 한↔영 매핑 + 화이트리스트)
 * 검증:
 *   1. 16개 엔딩 도달성 (각 엔딩 ID가 어딘가 ENDING 디렉티브로 등장)
 *   2. JUMP/CHOICE.next 의 sceneId 실재 검증 (고립 노드 없음)
 *   3. KEY_CHOICE 매트릭스 정합 (BRANCH-GRAPH §5 정합 — 단 v0.1은 카운트만)
 *   4. FLAG_INC key가 GameFlags에 존재
 *   5. 거절 카톡 도달성 (late_reply_count >= 2 트리거 가능 경로 ≥1)
 *   6. BG 디렉티브의 image ID가 bg-list.md 화이트리스트에 등록 (변형/특수 ID 화이트리스트 포함)
 *   7. (v0.3) CG/VIDEO 디렉티브 ID가 cg-list/video-list.md 화이트리스트에 등록
 *   8. (v0.4) BGM/SFX 디렉티브 ID는 **영문 ID만 허용**. 한글 큐 잔존 시 error
 *           (compile-scene normalizeBgmId/SfxId 변환 누락 회귀 방지).
 *
 * 실패 시 exit 1 (CI fail).
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SCENES_DIR = path.join(ROOT, 'src/scenes');
const MANIFEST = path.join(SCENES_DIR, 'compiled-manifest.json');
const BG_LIST = path.join(ROOT, '04-image-prompts/backgrounds/bg-list.md');
const CG_LIST = path.join(ROOT, '04-image-prompts/event-cgs/cg-list.md');
const VIDEO_LIST = path.join(ROOT, '04-image-prompts/veo-videos/video-list.md');
const AUDIO_MAPPINGS = path.join(ROOT, 'src/engine/audioMappings.ts');
const BG_DIR = path.join(ROOT, 'public/img/bg');
const CG_DIR = path.join(ROOT, 'public/img/cg');
const VIDEO_DIR = path.join(ROOT, 'public/video');

// BackgroundLayer.tsx의 BG_ALIAS와 동기화 (현재 비어 있음)
const BG_ALIAS: Record<string, string> = {};

// 시나리오에서 합법적으로 사용되는 특수 BG ID (단색 페이드, 변형 매핑 등)
const SPECIAL_BG_IDS = new Set([
  'black',
  'white',
  // bg-list.md §변형(variant) 룰 매핑 표 line 25-44 — 라우트가 아직 옛 ID로 호출 시 허용
  'bg_anatomy_lab_entrance',
  'bg_biochem_lab',
  'bg_biochem_lab_night',
  'bg_phd_office',
  'bg_uikuk_corridor',
  'bg_library_evening',
  'bg_library_rooftop',
  'bg_campus_cafe_night',
  'bg_classroom_test',
  'bg_pub_party',
  'bg_dongseongno',
  'bg_dongseongno_night',
  'bg_pension_evening',
  'bg_pension_room_night',
  'bg_sports_field',
  'bg_campus_cherry_path',
  'bg_campus_night',
  'bg_bundang_cafe_window',
  'bg_festival_day',
  'bg_katalk_room',
]);

const REQUIRED_ENDINGS = [
  'END_H1_TRUE', 'END_H1_HAPPY', 'END_H1_NORMAL', 'END_H1_BAD',
  'END_H2_TRUE', 'END_H2_HAPPY', 'END_H2_NORMAL', 'END_H2_BAD',
  'END_H3_TRUE', 'END_H3_HAPPY', 'END_H3_NORMAL',
  'END_H4_TRUE', 'END_H4_NORMAL', 'END_H4_REJECT',
  'END_H5_TRUE',
  'END_SOLO_SUMMER',
];

const VALID_FLAG_KEYS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'late_reply_count',
  'flag_anatomy_first_done', 'flag_dongsan_visit_done',
  'flag_seoyoon_first_meet', 'flag_first_kakao_serin',
  'mode',
  // 시나리오 임시 플래그 (W4 v0.1는 화이트리스트 외 허용)
]);

interface CompiledScene {
  id: string;
  meta?: unknown;
  commands: Array<Record<string, unknown>>;
}

interface ManifestEntry {
  id: string;
  file: string;
  commandCount: number;
}

const errors: string[] = [];
const warnings: string[] = [];

function loadAllScenes(): CompiledScene[] {
  if (!readdirSync(SCENES_DIR).includes('compiled-manifest.json')) {
    errors.push('compiled-manifest.json 누락 — npm run compile 먼저 실행');
    return [];
  }
  const manifest: ManifestEntry[] = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const scenes: CompiledScene[] = [];
  for (const m of manifest) {
    const filePath = path.join(SCENES_DIR, m.file);
    try {
      scenes.push(JSON.parse(readFileSync(filePath, 'utf8')));
    } catch (e) {
      errors.push(`${m.file} 로드 실패: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return scenes;
}

function collectEndings(scenes: CompiledScene[]): Set<string> {
  const found = new Set<string>();
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'ENDING' && typeof c.endingId === 'string') {
        found.add(c.endingId);
      }
    }
  }
  return found;
}

function collectSceneIds(scenes: CompiledScene[]): Set<string> {
  return new Set(scenes.map((s) => s.id));
}

function validateJumps(scenes: CompiledScene[], existingIds: Set<string>): void {
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'JUMP' && typeof c.sceneId === 'string') {
        if (!existingIds.has(c.sceneId)) {
          warnings.push(`[${s.id}] JUMP 대상 누락: ${c.sceneId}`);
        }
      }
      if (c.type === 'CHOICE' && Array.isArray(c.choices)) {
        for (const choice of c.choices as Array<{ next?: string; text?: string }>) {
          if (choice.next && !existingIds.has(choice.next)) {
            warnings.push(`[${s.id}] CHOICE next 누락: "${choice.text}" → ${choice.next}`);
          }
        }
      }
    }
  }
}

function validateFlagKeys(scenes: CompiledScene[]): void {
  const usedKeys = new Set<string>();
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'FLAG_INC' && typeof c.key === 'string') {
        usedKeys.add(c.key);
      }
      if (c.type === 'FLAG_SET' && typeof c.key === 'string') {
        usedKeys.add(c.key);
      }
      if (c.type === 'CHOICE' && Array.isArray(c.choices)) {
        for (const choice of c.choices as Array<{ effects?: Array<{ type?: string; key?: string }> }>) {
          for (const eff of choice.effects ?? []) {
            if ((eff.type === 'FLAG_INC' || eff.type === 'FLAG_SET') && typeof eff.key === 'string') {
              usedKeys.add(eff.key);
            }
          }
        }
      }
    }
  }
  for (const k of usedKeys) {
    if (!VALID_FLAG_KEYS.has(k) && !k.startsWith('flag_')) {
      warnings.push(`알 수 없는 플래그 키: ${k} (FLAG_INC/FLAG_SET)`);
    }
  }
}

function collectKeyChoices(scenes: CompiledScene[]): {
  legacy: Record<string, string[]>;
  toneNew: number;
  toneByHeroine: Record<string, number>;
} {
  // 옛 표기법(KEY_CHOICE 디렉티브 + CHOICE.effects KEY_CHOICE)과 신표기법(choice.tone + isKey) 분리 카운트
  const legacy: Record<string, string[]> = { H1: [], H2: [], H3: [], H4: [], H5: [] };
  let toneNew = 0;
  // 신표기법은 런타임에 toneMatrix 룩업으로 H1~H5 결정. 컴파일 시점은 isKey 라벨만 카운트.
  // KEY_HEROINE_TONE 매핑: mature_serious→H1 / direct_friendly→H2 / warm_supportive→H3(or H4 대면) / bright_forward→H5
  const TONE_TO_HEROINE: Record<string, string> = {
    mature_serious: 'H1',
    direct_friendly: 'H2',
    warm_supportive: 'H3', // H4 대면도 같은 톤이지만 H3 우선 매칭 (Known Issue)
    bright_forward: 'H5',
  };
  const toneByHeroine: Record<string, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0 };

  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'KEY_CHOICE' && typeof c.heroine === 'string' && typeof c.choiceId === 'string') {
        legacy[c.heroine]?.push(c.choiceId);
      }
      if (c.type === 'CHOICE' && Array.isArray(c.choices)) {
        for (const choice of c.choices as Array<{
          effects?: Array<{ type?: string; heroine?: string; choiceId?: string }>;
          tone?: string;
          isKey?: boolean;
          mechanism?: string;
        }>) {
          for (const eff of choice.effects ?? []) {
            if (eff.type === 'KEY_CHOICE' && typeof eff.heroine === 'string' && typeof eff.choiceId === 'string') {
              legacy[eff.heroine]?.push(eff.choiceId);
            }
          }
          // 신표기법: isKey: true + tone → 해당 톤의 KEY 히로인에게 카운트
          if (choice.isKey && choice.tone) {
            toneNew++;
            const h = TONE_TO_HEROINE[choice.tone];
            if (h) toneByHeroine[h]++;
          }
          // H4 미니게임 메커니즘
          if (choice.mechanism === 'h4_reply_speed') {
            toneNew++;
            toneByHeroine.H4++;
          }
        }
      }
    }
  }
  return { legacy, toneNew, toneByHeroine };
}

function parseBgList(): Set<string> {
  // bg-list.md 본체 등록 항목: ## N. `bg_xxx.webp` ... 패턴 추출
  const text = readFileSync(BG_LIST, 'utf8');
  const ids = new Set<string>();
  const re = /^##\s+\d+\.\s+`(bg_[a-z0-9_]+)\.webp`/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

function parseCgList(): Set<string> {
  if (!readdirSync(path.dirname(CG_LIST)).includes(path.basename(CG_LIST))) return new Set();
  const text = readFileSync(CG_LIST, 'utf8');
  const ids = new Set<string>();
  const re = /^###\s+\d+\.\s+`(cg_[a-z0-9_]+)\.webp`/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ids.add(m[1]);
  return ids;
}

function parseVideoList(): Set<string> {
  if (!readdirSync(path.dirname(VIDEO_LIST)).includes(path.basename(VIDEO_LIST))) return new Set();
  const text = readFileSync(VIDEO_LIST, 'utf8');
  const ids = new Set<string>();
  const re = /^##\s+\d+\.\s+`(video_[a-z0-9_]+)\.mp4`/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ids.add(m[1]);
  return ids;
}

function parseAudioMappings(): {
  bgmEn: Set<string>;
  sfxEn: Set<string>;
  bgmKo: Set<string>;
  sfxKo: Set<string>;
} {
  const text = readFileSync(AUDIO_MAPPINGS, 'utf8');
  const bgmEn = new Set<string>();
  const sfxEn = new Set<string>();
  const bgmKo = new Set<string>();
  const sfxKo = new Set<string>();
  // BGM_MAP — { ko: '<ko>', en: 'bgm_<en>' } — v0.4: ko/en 분리 (컴파일 결과는 en만 허용)
  const bgmRe = /\{\s*ko:\s*'([^']+)',\s*en:\s*'(bgm_[a-z0-9_]+)'\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = bgmRe.exec(text)) !== null) {
    bgmKo.add(m[1]);
    bgmEn.add(m[2]);
  }
  // SFX_MAP — { ko: '<ko>' | null, en: 'sfx_<en>' }
  const sfxRe = /\{\s*ko:\s*(?:'([^']+)'|null),\s*en:\s*'(sfx_[a-z0-9_]+)'/g;
  while ((m = sfxRe.exec(text)) !== null) {
    if (m[1]) sfxKo.add(m[1]);
    sfxEn.add(m[2]);
  }
  return { bgmEn, sfxEn, bgmKo, sfxKo };
}

function validateBgIds(scenes: CompiledScene[], registered: Set<string>): void {
  const seen = new Set<string>();
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'BG' && typeof c.image === 'string') {
        const id = c.image;
        if (seen.has(id)) continue;
        seen.add(id);
        if (!registered.has(id) && !SPECIAL_BG_IDS.has(id)) {
          warnings.push(`BG ID 미등록: ${id} (bg-list.md 또는 SPECIAL_BG_IDS 화이트리스트에 추가)`);
        }
      }
    }
  }
}

/**
 * 시나리오에서 참조되는 BG/CG/VIDEO ID에 대응하는 실파일이 존재하는지 검증.
 * BG_ALIAS로 매핑된 ID는 alias 대상 파일이 존재하면 통과(임시 폴백).
 */
function validateAssetFiles(scenes: CompiledScene[]): void {
  const refs = { bg: new Set<string>(), cg: new Set<string>(), video: new Set<string>() };
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'BG' && typeof c.image === 'string') refs.bg.add(c.image);
      if (c.type === 'CG' && typeof c.cgId === 'string') refs.cg.add(c.cgId);
      if (c.type === 'VIDEO' && typeof c.src === 'string') refs.video.add(c.src);
    }
  }
  // 단색 페이드는 파일 검증 제외
  refs.bg.delete('black');
  refs.bg.delete('white');

  for (const id of refs.bg) {
    const file = path.join(BG_DIR, `${id}.webp`);
    if (existsSync(file)) continue;
    const alias = BG_ALIAS[id];
    if (alias && existsSync(path.join(BG_DIR, `${alias}.webp`))) {
      warnings.push(`BG 자산 임시 alias: ${id} → ${alias}.webp (TODO: 정식 자산 생성 후 BG_ALIAS 제거)`);
      continue;
    }
    errors.push(`BG 자산 누락: public/img/bg/${id}.webp (시나리오 참조됨)`);
  }
  for (const id of refs.cg) {
    if (!existsSync(path.join(CG_DIR, `${id}.webp`))) {
      errors.push(`CG 자산 누락: public/img/cg/${id}.webp (시나리오 참조됨)`);
    }
  }
  for (const id of refs.video) {
    if (!existsSync(path.join(VIDEO_DIR, `${id}.mp4`))) {
      errors.push(`VIDEO 자산 누락: public/video/${id}.mp4 (시나리오 참조됨)`);
    }
  }
}

function validateCgIds(scenes: CompiledScene[], registered: Set<string>): void {
  const seen = new Set<string>();
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'CG' && typeof c.cgId === 'string') {
        const id = c.cgId;
        if (seen.has(id)) continue;
        seen.add(id);
        if (!registered.has(id)) {
          warnings.push(`CG ID 미등록: ${id} (cg-list.md 화이트리스트에 추가)`);
        }
      }
    }
  }
}

function validateVideoIds(scenes: CompiledScene[], registered: Set<string>): void {
  const seen = new Set<string>();
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'VIDEO' && typeof c.src === 'string') {
        const id = c.src;
        if (seen.has(id)) continue;
        seen.add(id);
        if (!registered.has(id)) {
          warnings.push(`VIDEO ID 미등록: ${id} (video-list.md 화이트리스트에 추가)`);
        }
      }
    }
  }
}

function validateAudioIds(
  scenes: CompiledScene[],
  audio: { bgmEn: Set<string>; sfxEn: Set<string>; bgmKo: Set<string>; sfxKo: Set<string> },
): void {
  const bgmSeen = new Set<string>();
  const sfxSeen = new Set<string>();
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'BGM' && typeof c.track === 'string') {
        const id = c.track;
        if (bgmSeen.has(id)) continue;
        bgmSeen.add(id);
        if (audio.bgmKo.has(id)) {
          errors.push(
            `[${s.id}] BGM 한글 키 잔존: "${id}" — 컴파일 시 영문 ID로 변환되어야 함 (compile-scene normalizeBgmId 누락 회귀)`,
          );
        } else if (!audio.bgmEn.has(id)) {
          errors.push(`[${s.id}] BGM 미매핑: "${id}" (audioMappings.ts BGM_MAP 추가 필요)`);
        }
      }
      if (c.type === 'SFX' && typeof c.sound === 'string') {
        const id = c.sound;
        if (sfxSeen.has(id)) continue;
        sfxSeen.add(id);
        if (audio.sfxKo.has(id)) {
          errors.push(
            `[${s.id}] SFX 한글 키 잔존: "${id}" — 컴파일 시 영문 ID로 변환되어야 함 (compile-scene normalizeSfxId 누락 회귀)`,
          );
        } else if (!audio.sfxEn.has(id)) {
          errors.push(`[${s.id}] SFX 미매핑: "${id}" (audioMappings.ts SFX_MAP 추가 필요)`);
        }
      }
    }
  }
}

function validateRejectReachability(scenes: CompiledScene[]): boolean {
  // late_reply_count +1 트리거 카운트 — Ch.4·5·6 미니게임 + 거절 분기 도달성 간접 검증
  // 옛 표기법 (FLAG_INC late_reply_count) + 신표기법 (mechanism h4_reply_speed 타임아웃) 둘 다 카운트
  let lateIncs = 0;
  let h4Mechanism = 0;
  let rejectEndings = 0;
  for (const s of scenes) {
    for (const c of s.commands) {
      if (c.type === 'FLAG_INC' && c.key === 'late_reply_count') lateIncs++;
      // CHOICE + KAKAO 둘 다 choices 배열 보유 — KAKAO 안 mechanism도 카운트 (5/9 미니게임 통합)
      if ((c.type === 'CHOICE' || c.type === 'KAKAO') && Array.isArray(c.choices)) {
        for (const choice of c.choices as Array<{
          effects?: Array<{ type?: string; key?: string }>;
          mechanism?: string;
        }>) {
          for (const eff of choice.effects ?? []) {
            if (eff.type === 'FLAG_INC' && eff.key === 'late_reply_count') lateIncs++;
          }
          if (choice.mechanism === 'h4_reply_speed') h4Mechanism++;
        }
      }
      if (c.type === 'ENDING' && c.endingId === 'END_H4_REJECT') rejectEndings++;
    }
  }
  // 거절 도달 가능: 옛 표기 ≥2건 OR 신표기법 미니게임 ≥2건
  const totalLatePotential = lateIncs + h4Mechanism;
  if (totalLatePotential < 2) {
    errors.push(
      `late_reply_count 트리거 ${lateIncs}건 + H4 미니게임 ${h4Mechanism}건 = ${totalLatePotential}. 거절 도달 위해 ≥2 필요.`,
    );
    return false;
  }
  if (rejectEndings === 0) {
    errors.push('END_H4_REJECT [ENDING] 디렉티브 부재. 거절 카톡 엔딩 도달 불가.');
    return false;
  }
  console.log(`  옛 표기 late_reply +1 트리거: ${lateIncs}건`);
  console.log(`  신표기 H4 미니게임 (mechanism h4_reply_speed): ${h4Mechanism}건`);
  return true;
}

function main(): void {
  console.log('빌드 검증 시작 ...');
  const scenes = loadAllScenes();
  if (scenes.length === 0) {
    console.error('✗ 씬 0개');
    process.exit(1);
  }

  const sceneIds = collectSceneIds(scenes);
  const endings = collectEndings(scenes);
  const keyChoices = collectKeyChoices(scenes);

  // 1. 16개 엔딩 도달성
  const missing = REQUIRED_ENDINGS.filter((e) => !endings.has(e));
  if (missing.length > 0) {
    errors.push(`엔딩 ${missing.length}개 미도달: ${missing.join(', ')}`);
  } else {
    console.log(`✓ 16개 엔딩 모두 도달 가능 (${endings.size}/16)`);
  }

  // 2. JUMP/next 도달성
  validateJumps(scenes, sceneIds);

  // 3. FLAG 키 검증
  validateFlagKeys(scenes);

  // 4. KEY_CHOICE 카운트 보고 (옛 + 신표기법 분리)
  console.log('KEY 카운트 (BRANCH-GRAPH §5 정합 참고):');
  console.log('  [옛 표기법] KEY_CHOICE 디렉티브:');
  for (const h of ['H1', 'H2', 'H3', 'H4', 'H5']) {
    const list = keyChoices.legacy[h] ?? [];
    const unique = new Set(list);
    console.log(`    ${h}: ${list.length}회 (${unique.size} 고유)`);
  }
  console.log(`  [신표기법] tone:isKey + mechanism: 총 ${keyChoices.toneNew}회`);
  for (const h of ['H1', 'H2', 'H3', 'H4', 'H5']) {
    console.log(`    ${h}: ${keyChoices.toneByHeroine[h]}회 (톤 매핑)`);
  }

  // 5. 거절 도달성
  const rejectOk = validateRejectReachability(scenes);
  if (rejectOk) console.log('✓ 거절 카톡 도달성 OK (late_reply_count 트리거 ≥2 + END_H4_REJECT)');

  // 6. BG ID 화이트리스트 검증 (v0.2)
  const registeredBgs = parseBgList();
  validateBgIds(scenes, registeredBgs);
  console.log(`✓ BG ID 화이트리스트: bg-list.md ${registeredBgs.size}건 + 특수 ${SPECIAL_BG_IDS.size}건`);

  // 7. CG / VIDEO ID 화이트리스트 검증 (v0.3)
  const registeredCgs = parseCgList();
  validateCgIds(scenes, registeredCgs);
  console.log(`✓ CG ID 화이트리스트: cg-list.md ${registeredCgs.size}건`);

  const registeredVideos = parseVideoList();
  validateVideoIds(scenes, registeredVideos);
  console.log(`✓ VIDEO ID 화이트리스트: video-list.md ${registeredVideos.size}건`);

  // 8. BGM / SFX 매핑 검증 (v0.4 — 영문 ID만 허용, 한글 잔존 시 error)
  const audioMaps = parseAudioMappings();
  validateAudioIds(scenes, audioMaps);
  console.log(
    `✓ 오디오 매핑: BGM ${audioMaps.bgmEn.size}en/${audioMaps.bgmKo.size}ko · SFX ${audioMaps.sfxEn.size}en/${audioMaps.sfxKo.size}ko (컴파일 결과는 영문만 허용)`,
  );

  // 9. (v0.4) 시각 자산 실파일 존재 검증 — BG/CG/VIDEO
  validateAssetFiles(scenes);
  console.log('✓ 시각 자산 실파일 검증 완료 (BG_ALIAS 폴백 포함)');

  // 보고
  console.log(`\n총 ${scenes.length}개 씬 검증 완료`);
  if (warnings.length > 0) {
    console.warn(`⚠ ${warnings.length}건 경고:`);
    for (const w of warnings.slice(0, 30)) console.warn(`  ${w}`);
    if (warnings.length > 30) console.warn(`  ... 외 ${warnings.length - 30}건`);
  }
  if (errors.length > 0) {
    console.error(`✗ ${errors.length}건 에러:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log('✓ 빌드 검증 통과');
}

main();
