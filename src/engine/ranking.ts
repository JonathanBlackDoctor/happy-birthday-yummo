/**
 * 온라인 랭킹 클라이언트 — Pantry (https://getpantry.cloud) 직접 호출.
 * 셋업 절차는 `docs/RANKING-SETUP.md` 참조.
 *
 * Pantry는 Pantry ID(UUID) 1개만으로 read+write. 별도 키·헤더 없음.
 * VITE_PANTRY_ID 미설정 시 EndingScreen 랭킹 섹션 자동 비활성.
 *
 * 보안 주의: Pantry ID가 클라 번들에 박힘 → 마음먹은 사람은 점수 조작/데이터 삭제 가능.
 * 친구·동기 캐주얼 랭킹용 한정. 이상 발생 시 Pantry 새로 발급해 ID 교체.
 *
 * 비활성 주의: Pantry는 30일 동안 한 번도 접근 안 되면 아카이브됨.
 * 활성 사용 중이면 무관.
 */

import type { EndingId } from '@/engine/types';
import type { EndingGrade } from '@/engine/endingScore';

const PANTRY_ID = (import.meta.env.VITE_PANTRY_ID ?? '').trim();
const BASKET = 'kmu-vn-ranking';
const BASE_URL = 'https://getpantry.cloud/apiv1/pantry';
const MAX_RECORDS = 500;
const VALID_ENDING_PREFIX = /^END_(H[1-5]_(TRUE|HAPPY|NORMAL|BAD|REJECT)|SOLO_SUMMER)$/;

export interface RankingEntry {
  nickname: string;
  endingId: EndingId;
  heroineId: string;
  finalScore: number;
  grade: EndingGrade;
  timestamp: string;
}

export interface SubmitInput {
  nickname: string;
  endingId: EndingId;
  finalScore: number;
  grade: EndingGrade;
}

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

export interface FetchOptions {
  heroine?: string;
  endingId?: EndingId;
  limit?: number;
}

export function isRankingEnabled(): boolean {
  return PANTRY_ID.length > 0;
}

function deriveHeroineId(endingId: string): string {
  if (endingId === 'END_SOLO_SUMMER') return 'SOLO';
  return endingId.split('_')[1] ?? 'UNKNOWN';
}

async function loadAll(): Promise<RankingEntry[]> {
  const res = await fetch(`${BASE_URL}/${PANTRY_ID}/basket/${BASKET}`, {
    cache: 'no-store',
  });
  // Pantry 는 basket 없으면 400 + "does not exist" 메시지 → 빈 배열 처리.
  if (res.status === 400) return [];
  if (!res.ok) throw new Error(`load ${res.status}`);
  const json = await res.json();
  if (Array.isArray(json?.entries)) return json.entries as RankingEntry[];
  return [];
}

async function saveAll(entries: RankingEntry[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/${PANTRY_ID}/basket/${BASKET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) throw new Error(`save ${res.status}`);
}

export async function fetchRanking(opts: FetchOptions = {}): Promise<RankingEntry[]> {
  if (!isRankingEnabled()) return [];
  try {
    let entries = await loadAll();
    if (opts.heroine) entries = entries.filter((e) => e.heroineId === opts.heroine);
    if (opts.endingId) entries = entries.filter((e) => e.endingId === opts.endingId);
    entries.sort((a, b) => b.finalScore - a.finalScore);
    return opts.limit ? entries.slice(0, opts.limit) : entries;
  } catch {
    return [];
  }
}

export async function submitScore(input: SubmitInput): Promise<SubmitResult> {
  if (!isRankingEnabled()) return { ok: false, error: 'ranking disabled' };
  if (!VALID_ENDING_PREFIX.test(input.endingId)) {
    return { ok: false, error: 'invalid endingId' };
  }
  const nickname = input.nickname
    .replace(/[<>&"'`]/g, '')
    .trim()
    .slice(0, 8);
  if (nickname.length === 0) return { ok: false, error: 'nickname required' };
  try {
    const record: RankingEntry = {
      nickname,
      endingId: input.endingId,
      heroineId: deriveHeroineId(input.endingId),
      finalScore: Math.round(input.finalScore),
      grade: input.grade,
      timestamp: new Date().toISOString(),
    };
    const all = await loadAll();
    all.push(record);
    all.sort((a, b) => b.finalScore - a.finalScore);
    const trimmed = all.slice(0, MAX_RECORDS);
    await saveAll(trimmed);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
