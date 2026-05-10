/**
 * EndingHistoryModal 데이터 처리 검증 — 통계 계산 + 정렬 + 필터링 (2026-05-10 W5 후속 라운드).
 *
 * 본 테스트는 컴포넌트 렌더 검증이 아닌 metaStore 데이터 변환 로직 검증.
 * (vitest+jsdom으로 React 컴포넌트 렌더 테스트는 별도 라운드 — 본 라운드는 데이터 정합만.)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useMetaStore, DEFAULT_META, type EndingRecord } from '@/stores/metaStore';

function reset() {
  localStorage.clear();
  useMetaStore.setState({ ...DEFAULT_META });
}

function makeRecord(overrides: Partial<EndingRecord> = {}): EndingRecord {
  return {
    endingId: 'END_H1_TRUE',
    grade: 'B',
    finalScore: 350,
    savedAt: new Date('2026-05-09T10:00:00.000Z').toISOString(),
    ...overrides,
  };
}

describe('endingHistory 필터링 — endingId별 분리', () => {
  beforeEach(reset);

  it('같은 endingId만 필터링', () => {
    const { recordEnding } = useMetaStore.getState();
    recordEnding(makeRecord({ endingId: 'END_H1_TRUE', finalScore: 400 }));
    recordEnding(makeRecord({ endingId: 'END_H1_TRUE', finalScore: 500 }));
    recordEnding(makeRecord({ endingId: 'END_H2_TRUE', finalScore: 450 }));
    recordEnding(makeRecord({ endingId: 'END_H1_TRUE', finalScore: 600 }));

    const h1Only = useMetaStore.getState().endingHistory.filter((eh) => eh.endingId === 'END_H1_TRUE');
    expect(h1Only).toHaveLength(3);
    expect(h1Only.map((r) => r.finalScore)).toEqual([400, 500, 600]);
  });
});

describe('endingHistory 통계 — 최고 등급 / 최고 점수', () => {
  beforeEach(reset);

  it('여러 회차 중 최고 등급 + 최고 점수 추출', () => {
    const { recordEnding } = useMetaStore.getState();
    recordEnding(makeRecord({ grade: 'C', finalScore: 250 }));
    recordEnding(makeRecord({ grade: 'A', finalScore: 480 }));
    recordEnding(makeRecord({ grade: 'B', finalScore: 350 }));
    recordEnding(makeRecord({ grade: 'S', finalScore: 600 }));

    const records = useMetaStore.getState().endingHistory;
    const top = records.reduce((max, r) => Math.max(max, r.finalScore), 0);
    expect(top).toBe(600);

    const ORDER = { S: 5, A: 4, B: 3, C: 2, D: 1 } as const;
    const best = records.reduce((b, r) => (ORDER[r.grade] > ORDER[b] ? r.grade : b), records[0].grade);
    expect(best).toBe('S');
  });

  it('빈 배열에선 최고치 0 / null', () => {
    const records = useMetaStore.getState().endingHistory;
    expect(records).toHaveLength(0);
    expect(records.reduce((max, r) => Math.max(max, r.finalScore), 0)).toBe(0);
  });
});

describe('endingHistory 정렬 — savedAt 내림차순', () => {
  beforeEach(reset);

  it('최신 기록이 위로', () => {
    const { recordEnding } = useMetaStore.getState();
    recordEnding(makeRecord({ savedAt: '2026-05-08T10:00:00.000Z', finalScore: 300 }));
    recordEnding(makeRecord({ savedAt: '2026-05-10T10:00:00.000Z', finalScore: 500 }));
    recordEnding(makeRecord({ savedAt: '2026-05-09T10:00:00.000Z', finalScore: 400 }));

    const records = useMetaStore.getState().endingHistory;
    const sorted = [...records].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));

    expect(sorted[0].finalScore).toBe(500); // 2026-05-10
    expect(sorted[1].finalScore).toBe(400); // 2026-05-09
    expect(sorted[2].finalScore).toBe(300); // 2026-05-08
  });
});
