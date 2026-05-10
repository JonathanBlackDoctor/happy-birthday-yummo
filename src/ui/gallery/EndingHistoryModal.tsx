/**
 * 엔딩 점수 내역 모달 — 갤러리 EndingGallery 슬롯 클릭 시 노출.
 *
 * 2026-05-10 PM 결정 라운드 신규 — `metaStore.endingHistory` 누적 기록을
 * 풀스크린 모달로 표시 (PauseMenu 모달 패턴 미러).
 *
 * 표시:
 *   - 상단: 엔딩 제목 + subtitle + 1:1 정사각 썸네일
 *   - 통계: 총 N회 달성 / 최고 등급 G / 최고 점수 X점
 *   - 표: 회차 / 날짜 / 등급 / 점수 (시간 내림차순)
 */

import { useEffect } from 'react';
import { useMetaStore, type EndingRecord } from '@/stores/metaStore';
import { findEnding } from '@/data/endings';
import { audioManager } from '@/engine/audioManager';
import type { EndingId } from '@/engine/types';
import type { EndingGrade } from '@/engine/endingScore';

const GRADE_ORDER: Record<EndingGrade, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

const GRADE_COLOR: Record<EndingGrade, string> = {
  S: '#FFD86B',
  A: '#FF6FA8',
  B: '#7CC4C7',
  C: '#B8B8C8',
  D: '#8A8A98',
};

interface Props {
  endingId: EndingId;
  onClose: () => void;
}

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function bestGrade(records: EndingRecord[]): EndingGrade | null {
  if (records.length === 0) return null;
  let best = records[0].grade;
  for (const r of records) {
    if (GRADE_ORDER[r.grade] > GRADE_ORDER[best]) best = r.grade;
  }
  return best;
}

function bestScore(records: EndingRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((max, r) => Math.max(max, r.finalScore), 0);
}

export function EndingHistoryModal({ endingId, onClose }: Props) {
  const records = useMetaStore((s) => s.endingHistory.filter((eh) => eh.endingId === endingId));
  const meta = findEnding(endingId);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 시간 내림차순 정렬 — 최신 위
  const sorted = [...records].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  const total = sorted.length;
  const best = bestGrade(records);
  const top = bestScore(records);

  const close = () => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    onClose();
  };

  return (
    // 2026-05-10 PM 정정: `absolute inset-0` → `fixed inset-0`.
    // 부모인 GalleryScreen이 자체 스크롤 컨테이너라 absolute는 스크롤 영역 전체 기준 위치 잡힘 →
    // 사용자가 아래로 스크롤해 슬롯 클릭 시 모달이 viewport 밖에 그려지는 문제.
    // fixed로 viewport 기준 정착해 사용자가 어디 스크롤해 있든 즉시 보이게 한다.
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(58, 46, 63, 0.85)' }}
      data-testid="ending-history-modal"
      data-ending-id={endingId}
    >
      <div className="bg-bg text-text rounded-2xl p-6 md:p-8 w-full max-w-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* 1:1 썸네일 — 자산 누락 시 onError 숨김 */}
            <img
              src={`/img/ending-square/${endingId}.webp`}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-20 h-20 rounded-lg object-cover bg-text-light/20 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-bold truncate">
                {meta?.title ?? endingId}
              </h2>
              {meta?.subtitle && (
                <div className="text-sm text-text-light truncate">— {meta.subtitle} —</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="min-h-[40px] min-w-[40px] px-3 py-1 text-text-light hover:text-text"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 통계 */}
        <section
          className="flex flex-wrap items-center justify-around gap-3 px-4 py-3 rounded-xl bg-accent/30"
          data-testid="ending-history-stats"
        >
          <div className="text-center">
            <div className="text-xs text-text-light">달성 횟수</div>
            <div className="text-2xl font-bold">{total}회</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-light">최고 등급</div>
            <div
              className="text-3xl font-black"
              style={best ? { color: GRADE_COLOR[best] } : undefined}
            >
              {best ?? '—'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-light">최고 점수</div>
            <div className="text-2xl font-bold tabular-nums">{top}</div>
          </div>
        </section>

        {/* 표 */}
        {sorted.length === 0 ? (
          <div className="text-center text-text-light py-8">아직 기록이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto" data-testid="ending-history-table">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-light border-b border-text-light/30">
                  <th className="text-left py-2 px-2 font-semibold">회차</th>
                  <th className="text-left py-2 px-2 font-semibold">날짜</th>
                  <th className="text-center py-2 px-2 font-semibold">등급</th>
                  <th className="text-right py-2 px-2 font-semibold">점수</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr
                    key={`${r.savedAt}-${i}`}
                    className="border-b border-text-light/15 hover:bg-accent/10"
                  >
                    <td className="py-2 px-2 text-text-light tabular-nums">
                      #{total - i}
                    </td>
                    <td className="py-2 px-2 tabular-nums">{formatSavedAt(r.savedAt)}</td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className="font-bold"
                        style={{ color: GRADE_COLOR[r.grade] }}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-semibold">
                      {r.finalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
