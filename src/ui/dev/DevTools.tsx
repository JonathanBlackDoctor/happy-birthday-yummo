/**
 * 개발자 도구 패널 — dev 빌드(import.meta.env.DEV)에만 마운트.
 *
 * 우하단 floating 패널. 매번 hard reload 없이 시나리오 점프 + 캐시 reset + 라이브 상태 확인.
 *
 * 탭 구성:
 *   1. 점프  — 시나리오 검색 + 챕터 경계/엔딩 단축 점프 + 캐시 reset
 *   2. 상태  — 현재 씬·챕터·런타임 모드 + 호감도 13개 라이브 표시
 *   3. 수정  — CHANGELOG.md 최근 엔트리 5개 (날짜 + 제목 + 변경 요약)
 *   4. 도구  — 호감도 빠른 조작 + 챕터 회상 강제 + 세이브 복사/붙여넣기 + 모드 전환
 *
 * 단축키 (Dev 빌드 한정):
 *   Ctrl+Alt+R: 캐시 reset + 부팅
 *   Ctrl+Alt+H: 패널 토글 (숨김/표시)
 *   Ctrl+Alt+1~4: 탭 전환
 *
 * (2026-05-09 사용자 결정: 매 새로고침 시 캐시·잔존 상태 정리가 번거로워 도입.
 *  2026-05-09 PM 후속: 최근 수정 시점·내용 즉시 확인 + 시나리오 200+개 검색 점프 + 라이브 호감도 조작 + 회상 트리거 버그 수정.)
 */

import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SCENE_MANIFEST_FULL, SCENE_MANIFEST_COMPRESSED } from '@/scenes/manifest';
import type { AffinityTargetId, ChapterId, HeroineId } from '@/engine/types';
// CHANGELOG.md raw import — vite ?raw 로더로 dev 시점에 텍스트 인라인.
// 빌드(prod)에선 DevTools 자체가 마운트 안 되므로 번들 누수 없음.
import changelogText from '../../../00-master/CHANGELOG.md?raw';

// ─────────────────────────────────────────────────────────
// 단축 점프 후보 (정적)
// ─────────────────────────────────────────────────────────
type ShortcutGroup =
  | 'prologue'
  | 'ch01'
  | 'ch02'
  | 'ch03'
  | 'ch04'
  | 'ch05'
  | 'ch06_h1'
  | 'ch06_h2'
  | 'ch06_h3'
  | 'ch06_h4'
  | 'ch06_h5'
  | 'end_solo'
  | 'ending';

interface SceneShortcut {
  label: string;
  sceneId: string;
  group: ShortcutGroup;
}

// 챕터별 핵심 비트 — 시나리오 .md 헤더(chXX_YY) 정합. b-variant·_close는 점프해도 의미 부족이라 제외.
const SHORTCUTS: SceneShortcut[] = [
  // 프롤로그 — 본가 → 열차 → 자취방
  { label: '01 본가', sceneId: 'prologue_01_home', group: 'prologue' },
  { label: '02 KTX 열차', sceneId: 'prologue_02_train', group: 'prologue' },
  { label: '03 자취방', sceneId: 'prologue_03_studio', group: 'prologue' },

  // ch01 OT — OT → 하정 첫 만남 → 카톡 → 첫 강의 → 카페
  { label: '01 OT', sceneId: 'ch01_01_ot_intro', group: 'ch01' },
  { label: '02 하정 첫 만남', sceneId: 'ch01_02_meet_hajeong', group: 'ch01' },
  { label: '02 톤 직후', sceneId: 'ch01_02_after_meet', group: 'ch01' },
  { label: '03 카톡 저녁', sceneId: 'ch01_03_kakao_evening', group: 'ch01' },
  { label: '04 첫 강의', sceneId: 'ch01_04_first_lecture', group: 'ch01' },
  { label: '05 카페', sceneId: 'ch01_05_cafe', group: 'ch01' },

  // ch02 카데바 — 해부학 아침 → 카데바 → 생화학 → 한설 회복 → 카톡 밤
  { label: '01 해부학 아침', sceneId: 'ch02_01_anatomy_morning', group: 'ch02' },
  { label: '02 카데바 첫 대면', sceneId: 'ch02_02_cadaver_first', group: 'ch02' },
  { label: '02 톤 직후', sceneId: 'ch02_02_after_choice', group: 'ch02' },
  { label: '03 생화학 실험', sceneId: 'ch02_03_biochem_lab', group: 'ch02' },
  { label: '04 한설 회복', sceneId: 'ch02_04_seol_recover', group: 'ch02' },
  { label: '05 카톡 밤', sceneId: 'ch02_05_kakao_night', group: 'ch02' },

  // ch03 동산 — 동산 로비 → 세린 첫 만남 → 명함 → 학교 복귀 → 카톡 밤
  { label: '01 동산 로비', sceneId: 'ch03_01_dongsan_lobby', group: 'ch03' },
  { label: '02 세린 첫 만남', sceneId: 'ch03_02_serin_meet', group: 'ch03' },
  { label: '03 명함 교환', sceneId: 'ch03_03_card_exchange', group: 'ch03' },
  { label: '04 윤아 직후', sceneId: 'ch03_04_after_yuna', group: 'ch03' },
  { label: '04 학교 복귀', sceneId: 'ch03_04_back_to_school', group: 'ch03' },
  { label: '05 카톡 밤', sceneId: 'ch03_05_kakao_night', group: 'ch03' },

  // ch04 도서관 — 도서관 → 카페 → 연구실 → 서윤 첫 만남 → 서윤 카톡 → 윤아 아침
  { label: '01 도서관 늦밤', sceneId: 'ch04_01_library_late', group: 'ch04' },
  { label: '02 카페 늦밤', sceneId: 'ch04_02_cafe_late', group: 'ch04' },
  { label: '03 연구실 늦밤', sceneId: 'ch04_03_lab_late', group: 'ch04' },
  { label: '04 서윤 첫 만남', sceneId: 'ch04_04_seoyoon_meet', group: 'ch04' },
  { label: '05 서윤 카톡', sceneId: 'ch04_05_seoyoon_kakao', group: 'ch04' },
  { label: '06 윤아 아침', sceneId: 'ch04_06_yuna_morning', group: 'ch04' },

  // ch05 5월 분기 — 시험 → 술집 5지 → 새벽 카톡 → MT 결정 → 펜션 → 캠프파이어
  { label: '01 시험 종료', sceneId: 'ch05_01_test_end', group: 'ch05' },
  { label: '02 술집 5지', sceneId: 'ch05_02_pub_first', group: 'ch05' },
  { label: '03 새벽 카톡', sceneId: 'ch05_03_kakao_dawn', group: 'ch05' },
  { label: '04 MT 결정', sceneId: 'ch05_04_mt_decision', group: 'ch05' },
  { label: '05 MT 펜션', sceneId: 'ch05_05_mt_pension', group: 'ch05' },
  { label: '06 캠프파이어', sceneId: 'ch05_06_bonfire', group: 'ch05' },
  { label: '06 페어 일시정지', sceneId: 'ch05_06_pair_pause', group: 'ch05' },

  // ch06 H1 차세린 분기 — 페스티벌 → 늦카페 → 산책 → 평가
  { label: '01 페스티벌 방문', sceneId: 'ch06_h1_01_festival_visit', group: 'ch06_h1' },
  { label: '02 늦카페', sceneId: 'ch06_h1_02_late_cafe', group: 'ch06_h1' },
  { label: '03 산책', sceneId: 'ch06_h1_03_walk', group: 'ch06_h1' },
  { label: '04 평가', sceneId: 'ch06_h1_04_evaluate', group: 'ch06_h1' },

  // ch06 H2 윤하정 분기 — 부스 → 동성로 → 산책/연장 → 옥상 → 평가
  { label: '01 페스티벌 부스', sceneId: 'ch06_h2_01_festival_booth', group: 'ch06_h2' },
  { label: '02 동성로', sceneId: 'ch06_h2_02_dongseong', group: 'ch06_h2' },
  { label: '03 산책', sceneId: 'ch06_h2_03_walk', group: 'ch06_h2' },
  { label: '03 연장', sceneId: 'ch06_h2_03_extend', group: 'ch06_h2' },
  { label: '04 옥상', sceneId: 'ch06_h2_04_rooftop', group: 'ch06_h2' },
  { label: '05 평가', sceneId: 'ch06_h2_05_evaluate', group: 'ch06_h2' },

  // ch06 H3 한설 분기 — 부스 → 산책 → 늦밤 연구실 → 평가
  { label: '01 페스티벌 부스', sceneId: 'ch06_h3_01_festival_booth', group: 'ch06_h3' },
  { label: '02 산책', sceneId: 'ch06_h3_02_walk', group: 'ch06_h3' },
  { label: '03 늦밤 연구실', sceneId: 'ch06_h3_03_late_night_lab', group: 'ch06_h3' },
  { label: '04 평가', sceneId: 'ch06_h3_04_evaluate', group: 'ch06_h3' },

  // ch06 H4 나서윤 분기 — 오픈 → 캠퍼스 점심 → 변태 페어 → 데이트 → 늦카톡 → 평가
  { label: '01 오픈', sceneId: 'ch06_h4_01_open', group: 'ch06_h4' },
  { label: '02 캠퍼스 점심', sceneId: 'ch06_h4_02_campus_lunch', group: 'ch06_h4' },
  { label: '03 변태 페어', sceneId: 'ch06_h4_03_perv_pair', group: 'ch06_h4' },
  { label: '04 데이트', sceneId: 'ch06_h4_04_date', group: 'ch06_h4' },
  { label: '05 늦카톡', sceneId: 'ch06_h4_05_late_kakao', group: 'ch06_h4' },
  { label: '07 평가', sceneId: 'ch06_h4_07_evaluate', group: 'ch06_h4' },

  // ch06 H5 장윤영 분기 — 부스 → 클럽 이벤트 → 도서관 아침 → 늦카톡 → 벚꽃길 → 평가
  { label: '01 페스티벌 부스', sceneId: 'ch06_h5_01_festival_booth', group: 'ch06_h5' },
  { label: '02 클럽 이벤트', sceneId: 'ch06_h5_02_club_event', group: 'ch06_h5' },
  { label: '03 도서관 아침', sceneId: 'ch06_h5_03_morning_library', group: 'ch06_h5' },
  { label: '04 늦카톡', sceneId: 'ch06_h5_04_late_kakao', group: 'ch06_h5' },
  { label: '05 벚꽃길', sceneId: 'ch06_h5_05_blossom_path', group: 'ch06_h5' },
  { label: '06 평가', sceneId: 'ch06_h5_06_evaluate', group: 'ch06_h5' },
  { label: 'SOLO fallback', sceneId: 'ch06_h5_solo_fallback', group: 'ch06_h5' },

  // SOLO 엔딩 단일 진입
  { label: '여름방학 메인', sceneId: 'end_solo_summer_main', group: 'end_solo' },

  // 16개 엔딩 — types.ts EndingId SSoT 정합 (H1·H2 4종 / H3 3종 / H4 3종 / H5 1종 / SOLO 1종)
  { label: 'H1 트루', sceneId: 'ch06_h1_true', group: 'ending' },
  { label: 'H1 해피', sceneId: 'ch06_h1_happy', group: 'ending' },
  { label: 'H1 노말', sceneId: 'ch06_h1_normal', group: 'ending' },
  { label: 'H1 배드', sceneId: 'ch06_h1_bad', group: 'ending' },
  { label: 'H2 트루', sceneId: 'ch06_h2_true', group: 'ending' },
  { label: 'H2 해피', sceneId: 'ch06_h2_happy', group: 'ending' },
  { label: 'H2 노말', sceneId: 'ch06_h2_normal', group: 'ending' },
  { label: 'H2 배드', sceneId: 'ch06_h2_bad', group: 'ending' },
  { label: 'H3 트루', sceneId: 'ch06_h3_true', group: 'ending' },
  { label: 'H3 해피', sceneId: 'ch06_h3_happy', group: 'ending' },
  { label: 'H3 노말', sceneId: 'ch06_h3_normal', group: 'ending' },
  { label: 'H4 트루', sceneId: 'ch06_h4_true', group: 'ending' },
  { label: 'H4 노말', sceneId: 'ch06_h4_normal', group: 'ending' },
  { label: 'H4 거절', sceneId: 'ch06_h4_reject', group: 'ending' },
  { label: 'H5 트루', sceneId: 'ch06_h5_true', group: 'ending' },
  { label: 'SOLO', sceneId: 'end_solo_summer_main', group: 'ending' },
];

const GROUP_TITLES: Record<ShortcutGroup, string> = {
  prologue: '프롤로그',
  ch01: 'Ch.1 OT의 봄',
  ch02: 'Ch.2 카데바',
  ch03: 'Ch.3 동산',
  ch04: 'Ch.4 도서관',
  ch05: 'Ch.5 5월의 분기',
  ch06_h1: 'Ch.6 H1 차세린',
  ch06_h2: 'Ch.6 H2 윤하정',
  ch06_h3: 'Ch.6 H3 한설',
  ch06_h4: 'Ch.6 H4 나서윤',
  ch06_h5: 'Ch.6 H5 장윤영',
  end_solo: '에필로그 SOLO',
  ending: '엔딩 16종',
};

const CB_GROUP_ORDER: ShortcutGroup[] = [
  'prologue',
  'ch01',
  'ch02',
  'ch03',
  'ch04',
  'ch05',
  'ch06_h1',
  'ch06_h2',
  'ch06_h3',
  'ch06_h4',
  'ch06_h5',
  'end_solo',
];

// ─────────────────────────────────────────────────────────
// 호감도 대상 메타
// ─────────────────────────────────────────────────────────
const HEROINE_LABELS: Record<HeroineId, string> = {
  H1: 'H1 차세린',
  H2: 'H2 윤하정',
  H3: 'H3 한설',
  H4: 'H4 나서윤',
  H5: 'H5 장윤영',
};

const NPC_LABELS: Record<Exclude<AffinityTargetId, HeroineId>, string> = {
  gyumin: '김규민',
  gyeongmin: '표경민',
  nathan: '조나단',
  wook: '정욱',
  junhyuk: '오준혁',
  mom: '엄마',
  taeho: '이태호 교수',
};

const CHAPTER_OPTIONS: ChapterId[] = ['prologue', 'ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06'];

// ─────────────────────────────────────────────────────────
// CHANGELOG.md 파서
// ─────────────────────────────────────────────────────────
interface ChangelogEntry {
  date: string;          // 'YYYY-MM-DD'
  title: string;         // 헤더에서 ` — ` 뒤
  summary: string;       // **변경**: 본문(짤막 요약, 최대 ~280자)
  modules: string[];     // **모듈**: 본문 파싱
  raw: string;           // 본문 전체(접기/펼치기용)
}

const ENTRY_HEADER_RE = /^### (\d{4}-\d{2}-\d{2})(?:\s*[—–-]\s*(.+))?$/;

function parseChangelog(text: string): ChangelogEntry[] {
  const lines = text.split(/\r?\n/);
  const entries: ChangelogEntry[] = [];
  let cur: { date: string; title: string; bodyLines: string[] } | null = null;
  for (const line of lines) {
    const m = line.match(ENTRY_HEADER_RE);
    // `### YYYY-MM-DD` 그 자체는 형식 예시 — 스킵.
    if (m && m[1] !== 'YYYY-MM-DD') {
      if (cur) entries.push(finalizeEntry(cur));
      cur = { date: m[1], title: (m[2] ?? '').trim(), bodyLines: [] };
      continue;
    }
    if (cur) cur.bodyLines.push(line);
  }
  if (cur) entries.push(finalizeEntry(cur));
  return entries;
}

function finalizeEntry(e: { date: string; title: string; bodyLines: string[] }): ChangelogEntry {
  const raw = e.bodyLines.join('\n').trim();
  return {
    date: e.date,
    title: e.title || '(제목 없음)',
    summary: extractSection(raw, '변경'),
    modules: extractModules(raw),
    raw,
  };
}

function extractSection(body: string, key: string): string {
  // `- **변경**:` 또는 `- **변경**:인라인` 또는 `- **변경** (메타):` 까지 매칭.
  const re = new RegExp(`^- \\*\\*${key}\\*\\*[^\\n]*?:\\s*(.*)$`, 'm');
  const m = body.match(re);
  if (!m) return '';
  const startIdx = body.indexOf(m[0]) + m[0].length;
  // 다음 `- **xxx**` 헤더(콜론 유무 무관) 또는 새 ### 직전까지.
  const rest = body.slice(startIdx);
  const stopRe = /\n- \*\*[^*]+\*\*|\n### /;
  const stop = rest.search(stopRe);
  const section = (m[1] + '\n' + (stop >= 0 ? rest.slice(0, stop) : rest)).trim();
  // 마크다운 잡음 정리(링크/굵게/백틱·리스트 마커) — 짧은 요약 가독성용.
  return section
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*-\s+/gm, ' • ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);
}

function extractModules(body: string): string[] {
  // `- **모듈**:` 또는 `- **모듈** (status 변동 없음):` 둘 다 허용.
  const re = /^- \*\*모듈\*\*[^\n]*\n([\s\S]*?)(?:\n- \*\*|\n### |$)/m;
  const m = body.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) =>
      l
        .replace(/^- /, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .trim(),
    )
    .filter(Boolean)
    .slice(0, 6);
}

// 모듈 로드 시 1회만 파싱(메모리 인라인). HMR 시 재평가.
const CHANGELOG_ENTRIES: ChangelogEntry[] = parseChangelog(changelogText);

// ─────────────────────────────────────────────────────────
// 유틸 동작
// ─────────────────────────────────────────────────────────
function clearAllStorage(): void {
  try {
    const persist = (useGameStore as unknown as { persist?: { clearStorage?: () => void } }).persist;
    persist?.clearStorage?.();
  } catch {
    /* noop */
  }
  try {
    const persist = (useSettingsStore as unknown as { persist?: { clearStorage?: () => void } }).persist;
    persist?.clearStorage?.();
  } catch {
    /* noop */
  }
  try {
    window.localStorage.removeItem('kmu-vn-autosave');
    window.localStorage.removeItem('kmu-vn-settings');
  } catch {
    /* noop */
  }
}

function freshReload(): void {
  clearAllStorage();
  window.location.reload();
}

interface JumpOptions {
  preserveFlags?: boolean;
  resetMaxAffection?: boolean;
}

function jumpToScene(sceneId: string, options: JumpOptions = {}): void {
  const url = new URL(window.location.href);
  url.searchParams.set('scene', sceneId);
  if (!options.preserveFlags) {
    clearAllStorage();
    if (options.resetMaxAffection) {
      url.searchParams.set(
        'flags',
        encodeURIComponent(
          JSON.stringify({
            H1: 80, H2: 80, H3: 80, H4: 80, H5: 80,
            gyumin: 30, gyeongmin: 30, nathan: 30,
            met_heroines: ['H1', 'H2', 'H3', 'H4', 'H5'],
          }),
        ),
      );
    }
  } else {
    // 현재 자동저장 store 그대로 유지(`?scene=`만 박아 진입 씬 override).
  }
  window.location.href = url.toString();
}

/**
 * 챕터 회상 강제 트리거 — fix: 현재 씬의 챕터 prefix를 반영해 prev_chapter_snapshot.chapter를 동적으로 결정.
 * 이전엔 ch01 하드코딩이라 prologue에서 트리거 시 회상이 ch01→prologue 방향으로 잘못 매핑되던 회귀 처방.
 */
function chapterIdFromSceneId(sceneId: string): ChapterId {
  if (sceneId.startsWith('prologue')) return 'prologue';
  if (sceneId.startsWith('ch01')) return 'ch01';
  if (sceneId.startsWith('ch02')) return 'ch02';
  if (sceneId.startsWith('ch03')) return 'ch03';
  if (sceneId.startsWith('ch04')) return 'ch04';
  if (sceneId.startsWith('ch05')) return 'ch05';
  if (sceneId.startsWith('ch06')) return 'ch06';
  if (sceneId.startsWith('end_')) return 'ending';
  return 'prologue';
}

const PREV_CHAPTER_OF: Record<ChapterId, ChapterId | null> = {
  prologue: null,
  ch01: 'prologue',
  ch02: 'ch01',
  ch03: 'ch02',
  ch04: 'ch03',
  ch05: 'ch04',
  ch06: 'ch05',
  ending: 'ch06',
};

function triggerChapterRecap(prevChapterOverride?: ChapterId): void {
  useGameStore.setState((s) => {
    const cur = chapterIdFromSceneId(s.currentSceneId || 'prologue_01_home');
    const prev = prevChapterOverride ?? PREV_CHAPTER_OF[cur] ?? 'ch01';
    return {
      awaitingChapterAdvance: true,
      flags: {
        ...s.flags,
        prev_chapter_snapshot: {
          chapter: prev,
          values: {
            H1: 0, H2: 0, H3: 0, H4: 0, H5: 0,
            gyumin: 0, gyeongmin: 0, nathan: 0, wook: 0, junhyuk: 0, mom: 0, taeho: 0,
          },
        },
        // 변동 인물이 있어야 회상 그래픽이 그려짐 — 현재값에 floor 박음.
        met_heroines: Array.from(new Set([...s.flags.met_heroines, 'H1', 'H2', 'H3'])) as HeroineId[],
        H1: Math.max(s.flags.H1, 12),
        H2: Math.max(s.flags.H2, 8),
        H3: Math.max(s.flags.H3, 5),
        gyumin: Math.max(s.flags.gyumin, 18),
      },
    };
  });
}

// DevTools는 일반 game flow의 0–100 clamp를 우회 — PM이 임의 값(예: 150, -30)으로 엔딩 분기 thresholding 테스트.
// 주의: 본 setter로 100 초과로 박아도 후속 FLAG_INC가 발동하면 applyOne의 clamp(min=0, max=100)에 의해 100으로 끌려옴.
//       100+ 상태를 유지하려면 자동 진행 없이 박은 값으로 점프/평가 트리거.
function adjustAffection(target: AffinityTargetId, delta: number): void {
  useGameStore.setState((s) => {
    const prev = s.flags[target];
    return { flags: { ...s.flags, [target]: prev + delta } };
  });
}

function setAffection(target: AffinityTargetId, value: number): void {
  useGameStore.setState((s) => ({ flags: { ...s.flags, [target]: value } }));
}

// ─────────────────────────────────────────────────────────
// SKIP — 다음 회상/선택지/분기 지점까지 자동 advance.
// 정지 조건:
//   - currentCommand가 CHOICE (선택지 발생)
//   - currentCommand가 KAKAO + choices 박힘 (카톡 미니게임 = 사실상 선택지)
//   - awaitingChapterAdvance true (챕터 경계 회상/시작 프롬프트 대기)
//   - pendingEnding 또는 runtimeMode === 'ending'
//   - runtimeMode === 'idle' (씬 종료 — 안전 정지)
// 카톡 메시지만(선택지 없음)인 경우 closeKakao로 자동 닫고 진행.
// 무한 루프 회피: 최대 600 step + 500ms timeout.
// ─────────────────────────────────────────────────────────
let _skipCancel = false;

async function skipToNextDecision(onTick?: (count: number) => void): Promise<{ steps: number; reason: string }> {
  _skipCancel = false;
  const startedAt = performance.now();
  const MAX_STEPS = 600;
  const MAX_MS = 4000;
  let steps = 0;
  while (steps < MAX_STEPS) {
    if (_skipCancel) return { steps, reason: 'cancel' };
    if (performance.now() - startedAt > MAX_MS) return { steps, reason: 'timeout' };
    const s = useGameStore.getState();
    const cmd = s.currentCommand;
    if (s.awaitingChapterAdvance) return { steps, reason: 'chapter-advance' };
    if (s.pendingEnding || s.runtimeMode === 'ending') return { steps, reason: 'ending' };
    if (cmd?.type === 'CHOICE') return { steps, reason: 'choice' };
    if (cmd?.type === 'KAKAO' && cmd.choices && cmd.choices.length > 0) return { steps, reason: 'kakao-choice' };
    if (s.runtimeMode === 'idle') return { steps, reason: 'idle' };
    if (cmd?.type === 'KAKAO') {
      // 카톡 메시지만 — 자동 닫고 진행
      await s.closeKakao();
    } else {
      await s.advance();
    }
    steps += 1;
    onTick?.(steps);
    // 비동기 startScene·preload가 끼는 경우 microtask 양보 (UI 프리징 회피).
    await new Promise((r) => setTimeout(r, 0));
  }
  return { steps, reason: 'max-steps' };
}

function cancelSkip(): void {
  _skipCancel = true;
}

// ─────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────
type Tab = 'jump' | 'state' | 'changes' | 'tools';

export function DevTools() {
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState<Tab>('jump');

  // 단축키 — Ctrl+Alt+R: fresh reload, Ctrl+Alt+H: 토글, Ctrl+Alt+1~4: 탭.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.altKey) return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        freshReload();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setHidden((v) => !v);
      } else if (e.key === '1') {
        e.preventDefault();
        setTab('jump');
      } else if (e.key === '2') {
        e.preventDefault();
        setTab('state');
      } else if (e.key === '3') {
        e.preventDefault();
        setTab('changes');
      } else if (e.key === '4') {
        e.preventDefault();
        setTab('tools');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        void skipToNextDecision();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        title="DevTools 열기 (Ctrl+Alt+H)"
        style={{
          position: 'fixed',
          right: 8,
          bottom: 8,
          zIndex: 999,
          padding: '4px 8px',
          fontSize: 11,
          background: 'rgba(0,0,0,0.7)',
          color: '#FFB8D1',
          border: '1px solid rgba(255,184,209,0.5)',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        🛠️ Dev
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 8,
        bottom: 8,
        zIndex: 999,
        width: 320,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        fontSize: 11,
        background: 'rgba(20, 14, 26, 0.95)',
        color: '#F8F0F4',
        border: '1px solid rgba(255,184,209,0.35)',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        fontFamily: 'system-ui, sans-serif',
        userSelect: 'none',
      }}
    >
      <Header onClose={() => setHidden(true)} />
      <SkipBar />
      <Tabs current={tab} onChange={setTab} />
      <div style={{ overflow: 'auto', marginTop: 6, paddingRight: 2 }}>
        {tab === 'jump' && <JumpTab />}
        {tab === 'state' && <StateTab />}
        {tab === 'changes' && <ChangesTab />}
        {tab === 'tools' && <ToolsTab />}
      </div>
      <div style={{ marginTop: 4, fontSize: 9, opacity: 0.5, textAlign: 'right' }}>
        dev 빌드 전용 · Ctrl+Alt+H 토글 · Ctrl+Alt+S Skip
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 헤더 / 탭
// ─────────────────────────────────────────────────────────
function Header({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <strong style={{ color: '#FFB8D1', letterSpacing: 0.5 }}>🛠️ DevTools</strong>
      <button
        type="button"
        onClick={onClose}
        title="숨기기 (Ctrl+Alt+H)"
        style={{
          background: 'transparent',
          color: 'rgba(255,255,255,0.6)',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  );
}

const TAB_DEFS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: 'jump', label: '점프', hint: 'Ctrl+Alt+1' },
  { id: 'state', label: '상태', hint: 'Ctrl+Alt+2' },
  { id: 'changes', label: '수정', hint: 'Ctrl+Alt+3' },
  { id: 'tools', label: '도구', hint: 'Ctrl+Alt+4' },
];

// ─────────────────────────────────────────────────────────
// SKIP 바 — 어느 탭에서도 한 번에 다음 결정 지점까지 자동 진행.
// ─────────────────────────────────────────────────────────
const SKIP_REASON_LABEL: Record<string, string> = {
  choice: '선택지 도달',
  'kakao-choice': '카톡 선택지 도달',
  'chapter-advance': '챕터 회상/시작 대기',
  ending: '엔딩 도달',
  idle: '씬 종료 (idle)',
  'max-steps': '안전 정지 (600 step)',
  timeout: '안전 정지 (4초)',
  cancel: '사용자 취소',
};

function SkipBar() {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const runtimeMode = useGameStore((s) => s.runtimeMode);
  const awaiting = useGameStore((s) => s.awaitingChapterAdvance);

  const onSkip = async () => {
    if (running) {
      cancelSkip();
      return;
    }
    setRunning(true);
    setSteps(0);
    setLastResult(null);
    const result = await skipToNextDecision((c) => setSteps(c));
    setRunning(false);
    setSteps(result.steps);
    setLastResult(SKIP_REASON_LABEL[result.reason] ?? result.reason);
  };

  // 도달 가능 상태 — kakao(메시지만)는 자동 닫고 진행하므로 disabled 안 함.
  const blocked =
    runtimeMode === 'choice' ||
    runtimeMode === 'ending' ||
    awaiting; // 이미 결정 지점

  return (
    <div style={{ marginBottom: 6 }}>
      <button
        type="button"
        onClick={onSkip}
        disabled={blocked && !running}
        title="다음 회상/선택지/분기 지점까지 자동 진행"
        style={{
          width: '100%',
          padding: '5px 8px',
          fontSize: 11,
          background: running
            ? 'linear-gradient(135deg, #E64178, #B22A5C)'
            : blocked
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #FF9FCC, #FF6FA8)',
          color: blocked && !running ? 'rgba(255,255,255,0.4)' : 'white',
          border: 'none',
          borderRadius: 4,
          cursor: blocked && !running ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        {running ? `⏹ 중단 (진행 중 ${steps} step)` : '⏭ Skip → 다음 결정 지점'}
      </button>
      {(running || lastResult) && (
        <div style={{ marginTop: 3, fontSize: 9, opacity: 0.7, textAlign: 'right' }}>
          {running ? `진행 ${steps} step…` : `${steps} step → ${lastResult}`}
        </div>
      )}
    </div>
  );
}

function Tabs({ current, onChange }: { current: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
      {TAB_DEFS.map((t) => {
        const active = t.id === current;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.hint}
            style={{
              padding: '4px 0',
              fontSize: 11,
              background: active ? 'rgba(255,184,209,0.25)' : 'rgba(255,255,255,0.06)',
              color: active ? '#FFE0EC' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${active ? 'rgba(255,184,209,0.6)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: active ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// JUMP 탭 — 검색 박스 + 단축 점프 + 캐시 reset
// ─────────────────────────────────────────────────────────
function JumpTab() {
  const [query, setQuery] = useState('');
  const [preserveFlags, setPreserveFlags] = useState(false);
  const [resetMax, setResetMax] = useState(true);
  // 챕터별 섹션 펼침 상태 — 디폴트는 prologue + ch01만 열린 상태(스크롤 부담 감소).
  const [openGroups, setOpenGroups] = useState<Set<ShortcutGroup>>(
    new Set<ShortcutGroup>(['prologue', 'ch01', 'ending']),
  );

  const allSceneIds = useMemo(() => {
    return Array.from(
      new Set([...Object.keys(SCENE_MANIFEST_FULL), ...Object.keys(SCENE_MANIFEST_COMPRESSED)]),
    ).sort();
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as string[];
    return allSceneIds.filter((id) => id.toLowerCase().includes(q)).slice(0, 12);
  }, [query, allSceneIds]);

  const opts = (): JumpOptions => ({
    preserveFlags,
    resetMaxAffection: !preserveFlags && resetMax,
  });

  const toggleGroup = (g: ShortcutGroup) => {
    setOpenGroups((s) => {
      const next = new Set(s);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const expandAll = () => setOpenGroups(new Set([...CB_GROUP_ORDER, 'ending']));
  const collapseAll = () => setOpenGroups(new Set<ShortcutGroup>());

  return (
    <>
      <button
        type="button"
        onClick={freshReload}
        style={primaryBtn}
      >
        🔄 캐시 비우고 새 게임 (Ctrl+Alt+R)
      </button>

      <div style={{ marginTop: 6 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="씬 ID 검색 (예: ch03_02, kakao, mt_pension)"
          style={{
            width: '100%',
            padding: '5px 7px',
            fontSize: 11,
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 4,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {matches.length > 0 && (
          <div
            style={{
              marginTop: 3,
              maxHeight: 130,
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
            }}
          >
            {matches.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => jumpToScene(id, opts())}
                style={searchItemBtn}
                title={id}
              >
                {id}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10 }}>
        <label style={chkLabel}>
          <input
            type="checkbox"
            checked={preserveFlags}
            onChange={(e) => setPreserveFlags(e.target.checked)}
          />
          현재 자동저장 유지(점프만, 호감도/진행 보존)
        </label>
        <label style={{ ...chkLabel, opacity: preserveFlags ? 0.4 : 1 }}>
          <input
            type="checkbox"
            checked={resetMax}
            disabled={preserveFlags}
            onChange={(e) => setResetMax(e.target.checked)}
          />
          호감도 80 일괄 박기(엔딩 도달용)
        </label>
      </div>

      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 10, opacity: 0.6 }}>챕터 경계 점프</div>
        <div style={{ display: 'flex', gap: 3 }}>
          <button type="button" onClick={expandAll} style={tinyBtn} title="모두 펼치기">
            ▾▾
          </button>
          <button type="button" onClick={collapseAll} style={tinyBtn} title="모두 접기">
            ▸▸
          </button>
        </div>
      </div>

      {CB_GROUP_ORDER.map((g) => {
        const items = SHORTCUTS.filter((s) => s.group === g);
        if (items.length === 0) return null;
        const open = openGroups.has(g);
        return (
          <div key={g} style={{ marginTop: 4 }}>
            <button
              type="button"
              onClick={() => toggleGroup(g)}
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: 10,
                background: open ? 'rgba(255,184,209,0.12)' : 'rgba(255,255,255,0.04)',
                color: 'inherit',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{GROUP_TITLES[g]} <span style={{ opacity: 0.5 }}>({items.length})</span></span>
              <span style={{ opacity: 0.6 }}>{open ? '▾' : '▸'}</span>
            </button>
            {open && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginTop: 3 }}>
                {items.map((s) => (
                  <button
                    key={s.sceneId}
                    type="button"
                    onClick={() => jumpToScene(s.sceneId, opts())}
                    style={smallBtn}
                    title={s.sceneId}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={() => toggleGroup('ending')}
          style={{
            width: '100%',
            padding: '3px 6px',
            fontSize: 10,
            background: openGroups.has('ending') ? 'rgba(255,184,209,0.12)' : 'rgba(255,255,255,0.04)',
            color: 'inherit',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{GROUP_TITLES.ending} <span style={{ opacity: 0.5 }}>(16)</span></span>
          <span style={{ opacity: 0.6 }}>{openGroups.has('ending') ? '▾' : '▸'}</span>
        </button>
        {openGroups.has('ending') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginTop: 3 }}>
            {SHORTCUTS.filter((s) => s.group === 'ending').map((s) => (
              <button
                key={s.sceneId}
                type="button"
                onClick={() => jumpToScene(s.sceneId, opts())}
                style={smallBtn}
                title={s.sceneId}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// STATE 탭 — 라이브 게임 상태
// ─────────────────────────────────────────────────────────
function StateTab() {
  const currentSceneId = useGameStore((s) => s.currentSceneId);
  const runtimeMode = useGameStore((s) => s.runtimeMode);
  const flags = useGameStore((s) => s.flags);
  const awaitingChapterAdvance = useGameStore((s) => s.awaitingChapterAdvance);
  const storyMode = useSettingsStore((s) => s.storyMode);

  const row = (k: string, v: string | number) => (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', fontSize: 10 }}>
      <span style={{ opacity: 0.7 }}>{k}</span>
      <span style={{ fontFamily: 'monospace', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {String(v)}
      </span>
    </div>
  );

  return (
    <>
      <Section title="런타임">
        {row('씬 ID', currentSceneId || '(빈)')}
        {row('챕터', flags.current_chapter)}
        {row('runtimeMode', runtimeMode)}
        {row('storyMode', storyMode ?? 'null')}
        {row('chapter advance 대기', awaitingChapterAdvance ? 'true' : 'false')}
      </Section>

      <Section title="히로인 호감도">
        {(['H1', 'H2', 'H3', 'H4', 'H5'] as const).map((k) => (
          <Bar key={k} label={HEROINE_LABELS[k]} value={flags[k]} max={100} />
        ))}
      </Section>

      <Section title="NPC 호감도">
        {(Object.keys(NPC_LABELS) as Array<keyof typeof NPC_LABELS>).map((k) => (
          <Bar key={k} label={NPC_LABELS[k]} value={flags[k]} max={100} />
        ))}
      </Section>

      <Section title="진행 플래그">
        {row('met_heroines', flags.met_heroines.join(',') || '(없음)')}
        {row('visited_scenes', flags.visited_scenes.length)}
        {row('late_reply_count', flags.late_reply_count)}
        {row('mode', flags.mode)}
        {row('player_name', flags.player_name ?? '(미설정)')}
      </Section>
    </>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  // 100 초과/음수 시각 분리: 100+ → 골드 그라데이션 + "100/N" 레이블, 음수 → 회색 + 빈 바.
  const isOver = value > max;
  const isNeg = value < 0;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = isOver
    ? 'linear-gradient(90deg, #FFD080, #FF8C42)'
    : pct >= 60
      ? 'linear-gradient(90deg, #FF6FA8, #E64178)'
      : 'rgba(255,184,209,0.5)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px', fontSize: 10 }}>
      <span style={{ width: 78, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 200ms ease',
          }}
        />
      </div>
      <span
        style={{
          width: 32,
          textAlign: 'right',
          fontFamily: 'monospace',
          color: isOver ? '#FFD080' : isNeg ? '#888' : 'inherit',
        }}
        title={isOver ? `${value} (100 초과 — DevTools 직접 박음)` : isNeg ? `${value} (음수 — DevTools 직접 박음)` : `${value}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CHANGES 탭 — CHANGELOG.md 최근 엔트리
// ─────────────────────────────────────────────────────────
function ChangesTab() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? CHANGELOG_ENTRIES.slice(0, 30) : CHANGELOG_ENTRIES.slice(0, 5);
  const latest = CHANGELOG_ENTRIES[0];

  if (!latest) {
    return <div style={{ opacity: 0.6, padding: 4 }}>CHANGELOG.md 파싱 결과 없음.</div>;
  }

  return (
    <>
      <Section title={`최근 수정 — ${latest.date}`}>
        <div style={{ fontSize: 10, opacity: 0.85, padding: '2px 4px', lineHeight: 1.4 }}>
          {latest.title}
        </div>
      </Section>

      {visible.map((e, idx) => {
        const expanded = expandedIdx === idx;
        return (
          <div
            key={`${e.date}-${idx}`}
            style={{
              marginBottom: 4,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setExpandedIdx(expanded ? null : idx)}
              style={{
                width: '100%',
                padding: '5px 7px',
                fontSize: 10,
                background: expanded ? 'rgba(255,184,209,0.12)' : 'rgba(255,255,255,0.04)',
                color: 'inherit',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                <span style={{ opacity: 0.7, fontFamily: 'monospace', fontSize: 9 }}>{e.date}</span>
                <span style={{ opacity: 0.6, fontSize: 9 }}>{expanded ? '▾' : '▸'}</span>
              </div>
              <div style={{ marginTop: 2, lineHeight: 1.4 }}>{e.title}</div>
            </button>
            {expanded && (
              <div style={{ padding: '6px 8px', fontSize: 10, lineHeight: 1.5, background: 'rgba(0,0,0,0.25)' }}>
                {e.summary && (
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#FFB8D1', fontWeight: 600 }}>변경: </span>
                    <span style={{ opacity: 0.9 }}>{e.summary}</span>
                  </div>
                )}
                {e.modules.length > 0 && (
                  <div>
                    <span style={{ color: '#FFB8D1', fontWeight: 600 }}>모듈: </span>
                    <span style={{ opacity: 0.85, fontFamily: 'monospace', fontSize: 9 }}>
                      {e.modules.join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!showAll && CHANGELOG_ENTRIES.length > 5 && (
        <button type="button" onClick={() => setShowAll(true)} style={smallBtn}>
          더 보기 ({CHANGELOG_ENTRIES.length - 5}개 추가)
        </button>
      )}

      <div style={{ marginTop: 4, fontSize: 9, opacity: 0.5 }}>
        총 {CHANGELOG_ENTRIES.length}개 엔트리 · 00-master/CHANGELOG.md
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// TOOLS 탭 — 호감도 조작 / 회상 트리거 / 세이브 export·import / 모드 전환
// ─────────────────────────────────────────────────────────
function ToolsTab() {
  const flags = useGameStore((s) => s.flags);
  const storyMode = useSettingsStore((s) => s.storyMode);
  const setSetting = useSettingsStore((s) => s.set);
  const [recapPrev, setRecapPrev] = useState<ChapterId>('ch01');
  const [exportText, setExportText] = useState('');

  const exportSave = () => {
    const dump = {
      flags: useGameStore.getState().flags,
      currentSceneId: useGameStore.getState().currentSceneId,
      currentCommandIndex: useGameStore.getState().currentCommandIndex,
      runtimeMode: useGameStore.getState().runtimeMode,
    };
    const text = JSON.stringify(dump, null, 2);
    setExportText(text);
    void navigator.clipboard?.writeText(text).catch(() => {});
  };

  const importSave = () => {
    if (!exportText.trim()) return;
    try {
      const parsed = JSON.parse(exportText) as { flags?: unknown };
      if (parsed && typeof parsed === 'object' && parsed.flags) {
        useGameStore.setState((s) => ({ flags: { ...s.flags, ...(parsed.flags as object) } }));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DevTools] save import 실패:', e);
    }
  };

  return (
    <>
      <Section title="챕터 회상 강제 트리거">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 10, opacity: 0.7 }}>이전 챕터:</span>
          <select
            value={recapPrev}
            onChange={(e) => setRecapPrev(e.target.value as ChapterId)}
            style={selectStyle}
          >
            {CHAPTER_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => triggerChapterRecap(recapPrev)}
          style={accentBtn}
        >
          ✨ 회상 트리거 (현재 위치 기준)
        </button>
      </Section>

      <Section title="히로인 호감도 빠른 조작">
        {(['H1', 'H2', 'H3', 'H4', 'H5'] as const).map((k) => (
          <AffectionRow
            key={k}
            label={HEROINE_LABELS[k]}
            value={flags[k]}
            target={k}
          />
        ))}
      </Section>

      <Section title="NPC 호감도">
        {(Object.keys(NPC_LABELS) as Array<keyof typeof NPC_LABELS>).map((k) => (
          <AffectionRow
            key={k}
            label={NPC_LABELS[k]}
            value={flags[k]}
            target={k}
          />
        ))}
      </Section>

      <Section title="스토리 모드">
        <div style={{ display: 'flex', gap: 3 }}>
          {(['full', 'compressed', null] as const).map((m) => (
            <button
              key={String(m)}
              type="button"
              onClick={() => setSetting('storyMode', m)}
              style={{
                ...smallBtn,
                background: storyMode === m ? 'rgba(255,184,209,0.25)' : 'rgba(255,255,255,0.08)',
                flex: 1,
              }}
            >
              {m ?? '(미선택)'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="세이브 export / import">
        <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
          <button type="button" onClick={exportSave} style={{ ...smallBtn, flex: 1 }}>
            현재 상태 → 클립보드
          </button>
          <button type="button" onClick={importSave} style={{ ...smallBtn, flex: 1 }}>
            아래 JSON 적용
          </button>
        </div>
        <textarea
          value={exportText}
          onChange={(e) => setExportText(e.target.value)}
          placeholder="export 결과 또는 붙여넣기 JSON…"
          style={{
            width: '100%',
            height: 60,
            fontSize: 9,
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.3)',
            color: '#cce',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 3,
            padding: 4,
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </Section>
    </>
  );
}

function AffectionRow({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: AffinityTargetId;
}) {
  // 직접 입력 — 음수·100 초과 모두 허용. 빈 문자열은 0으로.
  const onDirectInput = (raw: string) => {
    const n = Number(raw);
    if (raw.trim() === '' || Number.isNaN(n)) return;
    setAffection(target, Math.trunc(n));
  };
  const isOver = value > 100;
  const isNeg = value < 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 0', fontSize: 10, flexWrap: 'wrap' }}>
      <span style={{ width: 78, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onDirectInput(e.target.value)}
        style={{
          width: 50,
          padding: '2px 4px',
          fontSize: 10,
          fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.06)',
          color: isOver ? '#FFD080' : isNeg ? '#888' : 'white',
          border: `1px solid ${isOver ? 'rgba(255,208,128,0.5)' : 'rgba(255,255,255,0.18)'}`,
          borderRadius: 3,
          textAlign: 'right',
          outline: 'none',
        }}
      />
      <button type="button" onClick={() => adjustAffection(target, -10)} style={tinyBtn} title="-10">
        -10
      </button>
      <button type="button" onClick={() => adjustAffection(target, +10)} style={tinyBtn} title="+10">
        +10
      </button>
      <button type="button" onClick={() => setAffection(target, 0)} style={tinyBtn} title="0으로 박기">
        0
      </button>
      <button type="button" onClick={() => setAffection(target, 100)} style={tinyBtn} title="100">
        100
      </button>
      <button type="button" onClick={() => setAffection(target, 200)} style={{ ...tinyBtn, color: '#FFD080' }} title="200 (clamp 우회 테스트)">
        200
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 공용 섹션 + 스타일
// ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 3, letterSpacing: 0.3 }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  marginBottom: 4,
  background: 'linear-gradient(135deg, #FF6FA8, #E64178)',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
};

const accentBtn: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  background: 'rgba(166, 133, 226, 0.4)',
  color: 'white',
  border: '1px solid rgba(166, 133, 226, 0.6)',
  borderRadius: 4,
  cursor: 'pointer',
};

const smallBtn: React.CSSProperties = {
  padding: '3px 5px',
  fontSize: 10,
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 3,
  cursor: 'pointer',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const tinyBtn: React.CSSProperties = {
  padding: '2px 4px',
  fontSize: 9,
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 3,
  cursor: 'pointer',
  minWidth: 26,
};

const searchItemBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '4px 6px',
  fontSize: 10,
  background: 'transparent',
  color: 'white',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'monospace',
};

const chkLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: '2px 4px',
  fontSize: 10,
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 3,
};
