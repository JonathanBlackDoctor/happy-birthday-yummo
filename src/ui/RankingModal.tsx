/**
 * 온라인 랭킹 모달 — EndingScreen 액션 행 "🏆 랭킹" 버튼 클릭 시 마운트.
 *
 * 구성 (위→아래):
 *   1. 헤더: "🏆 ONLINE RANKING" + 우측 ✕ 닫기
 *   2. 닉네임 입력 + 등록 버튼 (idle/submitting/done/error)
 *   3. 필터 토글 (전체/{히로인 shortName}/이 엔딩)
 *   4. 포디움 1·2·3위 카드 (entries 1개 이상일 때)
 *   5. 4위~10위 일반 행
 *   6. 본인 위치 sticky 행 (Top 10 밖일 때만)
 *
 * 시각:
 *   - dim 배경 + 중앙 카드 (max-width 720px, max-height 90vh)
 *   - 등급 색 칩 5종 (EndingHistoryModal `GRADE_COLOR` 미러)
 *   - 1위 카드 금색 glow
 *   - 등록 직후 본인 행 펄스 2.5s (reduceMotion 시 off)
 *
 * 닫기: ✕ / Esc / 배경 dim 클릭. 모두 sfx_pageturn 재생.
 *
 * 닉네임 영구 저장: localStorage 'kmu-vn-rank-nickname' (≤8자).
 */

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { findEnding } from '@/data/endings';
import { HEROINES } from '@/data/characters';
import { computeEndingScore, type EndingGrade } from '@/engine/endingScore';
import {
  fetchRanking,
  submitScore,
  type FetchOptions,
  type RankingEntry,
} from '@/engine/ranking';
import { audioManager } from '@/engine/audioManager';
import type { EndingId, GameFlags, HeroineId } from '@/engine/types';

const NICKNAME_LS_KEY = 'kmu-vn-rank-nickname';
const NICKNAME_RE = /[^ㄱ-ㆎ가-힣a-zA-Z0-9 ]/g;
const TOP_N = 10;

// EndingHistoryModal `GRADE_COLOR` 미러 — 게임 일관성.
const GRADE_COLOR: Record<EndingGrade, string> = {
  S: '#FFD86B',
  A: '#FF6FA8',
  B: '#7CC4C7',
  C: '#B8B8C8',
  D: '#8A8A98',
};

function gradeChipStyle(grade: EndingGrade, size: 'sm' | 'md' | 'lg' = 'sm'): React.CSSProperties {
  const bg = GRADE_COLOR[grade];
  const px = size === 'lg' ? 14 : size === 'md' ? 10 : 8;
  const py = size === 'lg' ? 4 : 2;
  const fs = size === 'lg' ? 16 : size === 'md' ? 13 : 11;
  return {
    background: bg,
    color: '#1f1822',
    padding: `${py}px ${px}px`,
    borderRadius: 999,
    fontSize: fs,
    fontWeight: 800,
    letterSpacing: '0.04em',
    display: 'inline-block',
    lineHeight: 1,
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  endingId: EndingId;
  flags: GameFlags;
}

export function RankingModal({ open, onClose, endingId, flags }: Props) {
  const reducedMotion = useSettingsStore((s) => s.reduceMotion);
  const heroine: HeroineId | null = findEnding(endingId)?.heroine ?? null;
  const heroineLabel = heroine ? HEROINES[heroine].shortName ?? '히로인' : null;

  const [nickname, setNickname] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'heroine' | 'ending'>('all');
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRecord, setMyRecord] = useState<{ nickname: string; finalScore: number } | null>(null);
  const [pulseRowKey, setPulseRowKey] = useState<string | null>(null);

  // 모달 열릴 때 localStorage에서 닉네임 복원.
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(NICKNAME_LS_KEY) || '';
      if (saved) setNickname(saved.replace(NICKNAME_RE, '').slice(0, 8));
    } catch {
      // localStorage 접근 실패 (private mode 등) — 그냥 빈 값
    }
  }, [open]);

  // Esc 키로 닫기.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 필터·endingId 변경 시 자동 재조회.
  useEffect(() => {
    if (!open || !endingId) return;
    let cancelled = false;
    setLoading(true);
    const opts: FetchOptions = { limit: TOP_N };
    if (filter === 'heroine' && heroine) opts.heroine = heroine;
    else if (filter === 'ending') opts.endingId = endingId;
    void fetchRanking(opts).then((list) => {
      if (cancelled) return;
      setEntries(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, endingId, filter, heroine]);

  const handleClose = () => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    onClose();
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length === 0) return;
    if (submitState === 'submitting' || submitState === 'done') return;
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      const score = computeEndingScore(flags, endingId);
      const finalScoreInt = Math.round(score.finalScore);
      const result = await submitScore({
        nickname: trimmed,
        endingId,
        finalScore: finalScoreInt,
        grade: score.grade,
      });
      if (result.ok) {
        // 닉네임 저장
        try {
          localStorage.setItem(NICKNAME_LS_KEY, trimmed);
        } catch {
          // 저장 실패는 무시
        }
        setSubmitState('done');
        setMyRecord({ nickname: trimmed, finalScore: finalScoreInt });
        // 재조회 + 펄스 트리거
        const opts: FetchOptions = { limit: TOP_N };
        if (filter === 'heroine' && heroine) opts.heroine = heroine;
        else if (filter === 'ending') opts.endingId = endingId;
        const list = await fetchRanking(opts);
        setEntries(list);
        setPulseRowKey(`${trimmed}-${finalScoreInt}`);
        if (!reducedMotion) {
          window.setTimeout(() => setPulseRowKey(null), 2600);
        } else {
          setPulseRowKey(null);
        }
      } else {
        setSubmitState('error');
        setSubmitError(result.error ?? '등록 실패');
      }
    } catch (e) {
      setSubmitState('error');
      setSubmitError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!open) return null;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, TOP_N);
  const myIndexInList = myRecord
    ? entries.findIndex(
        (e) => e.nickname === myRecord.nickname && e.finalScore === myRecord.finalScore,
      )
    : -1;
  const showStickyMine = myRecord !== null && (myIndexInList === -1 || myIndexInList >= TOP_N);
  // sticky 표시용 본인 등수 — Top 10 안이면 myIndexInList+1, 밖이면 별도 계산 X(전체 데이터 없으므로 "TOP 밖" 표기)
  const stickyRankLabel =
    myIndexInList >= 0 ? `${myIndexInList + 1}위` : 'Top 10 밖';

  const filterButtons: Array<['all' | 'heroine' | 'ending', string]> = [
    ['all', '전체'],
    ...(heroineLabel ? ([['heroine', heroineLabel]] as Array<['heroine', string]>) : []),
    ['ending', '이 엔딩'],
  ];

  return (
    <div
      onClick={handleBackgroundClick}
      className="fixed inset-0 flex items-center justify-center p-3"
      style={{
        zIndex: 'var(--z-modal)',
        background: 'rgba(15, 8, 22, 0.85)',
      }}
      data-testid="ranking-modal"
      data-ending-id={endingId}
    >
      <style>{`
        @keyframes rankingRowPulse {
          0%   { background: rgba(255,220,140,0.22); transform: scale(1); }
          25%  { background: rgba(255,220,140,0.55); transform: scale(1.02); }
          70%  { background: rgba(255,220,140,0.32); transform: scale(1.005); }
          100% { background: rgba(255,220,140,0.22); transform: scale(1); }
        }
        .ranking-row-pulse { animation: rankingRowPulse 2.5s ease-in-out; }
      `}</style>

      <div
        className="rounded-xl flex flex-col gap-4"
        style={{
          background: 'var(--color-dark-bg)',
          color: 'var(--color-dark-text)',
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          padding: 24,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-bold tracking-wider" style={{ letterSpacing: '0.08em' }}>
            🏆 ONLINE RANKING
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="min-h-[36px] min-w-[36px] px-2 py-1 rounded-md hover:opacity-100"
            style={{ opacity: 0.7, background: 'rgba(255,255,255,0.06)' }}
          >
            ✕
          </button>
        </div>

        {/* 닉네임 입력 + 등록 */}
        <div className="flex flex-row items-center gap-2 flex-wrap">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.replace(NICKNAME_RE, '').slice(0, 8))}
            maxLength={8}
            placeholder="닉네임 (최대 8자)"
            disabled={submitState === 'submitting' || submitState === 'done'}
            className="px-3 py-2 rounded-md text-sm flex-1"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: 'rgba(255,248,252,0.96)',
              minWidth: 160,
            }}
            data-testid="ranking-nickname-input"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              nickname.trim().length === 0 ||
              submitState === 'submitting' ||
              submitState === 'done'
            }
            data-testid="ranking-submit-button"
            className="px-4 py-2 rounded-md text-sm font-semibold"
            style={{
              background:
                submitState === 'done'
                  ? 'rgba(120,200,120,0.32)'
                  : 'var(--color-dark-accent)',
              color: 'var(--color-dark-bg)',
              opacity:
                nickname.trim().length === 0 || submitState === 'submitting' ? 0.5 : 1,
              cursor:
                nickname.trim().length === 0 || submitState === 'submitting'
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {submitState === 'submitting'
              ? '등록 중...'
              : submitState === 'done'
              ? '등록 완료 ✓'
              : '랭킹 등록'}
          </button>
        </div>
        {submitState === 'error' && submitError && (
          <div
            className="text-xs"
            style={{ color: '#ffb0b0' }}
            data-testid="ranking-error"
          >
            등록 실패: {submitError}
          </div>
        )}

        {/* 필터 토글 */}
        <div className="flex flex-row items-center gap-1 flex-wrap">
          {filterButtons.map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className="px-3 py-1 rounded-md text-xs"
              style={{
                background:
                  filter === mode ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                color: 'rgba(255,248,252,0.95)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 본문 스크롤 영역 */}
        <div
          className="overflow-y-auto pr-1"
          style={{ flex: 1, minHeight: 0 }}
          data-testid="ranking-list"
        >
          {loading ? (
            <div className="text-xs opacity-70 text-center py-8">로딩 중...</div>
          ) : entries.length === 0 ? (
            <div className="text-sm opacity-80 text-center py-12">
              아직 기록이 없어요.
              <br />
              <span className="opacity-70">첫 번째 등록자가 되어 보세요.</span>
            </div>
          ) : (
            <>
              {/* 포디움 (1·2·3위) */}
              <Podium top3={top3} myRecord={myRecord} pulseKey={pulseRowKey} />

              {/* 4위~10위 일반 행 */}
              {rest.length > 0 && (
                <div
                  className="rounded-md overflow-hidden mt-3"
                  style={{
                    background: 'rgba(0,0,0,0.30)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  {rest.map((entry, i) => {
                    const rank = i + 4;
                    const isMine =
                      myRecord !== null &&
                      entry.nickname === myRecord.nickname &&
                      entry.finalScore === myRecord.finalScore;
                    const rowKey = `${entry.nickname}-${entry.finalScore}`;
                    const isPulsing = pulseRowKey === rowKey;
                    const entryMeta = findEnding(entry.endingId);
                    return (
                      <div
                        key={`${entry.timestamp}-${i}`}
                        className={`flex flex-row items-center gap-2 px-3 py-1.5 text-sm ${
                          isPulsing ? 'ranking-row-pulse' : ''
                        }`}
                        style={{
                          background: isMine
                            ? 'rgba(255,220,140,0.22)'
                            : i % 2 === 0
                            ? 'rgba(255,255,255,0.04)'
                            : 'transparent',
                          borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span
                          className="w-7 text-right opacity-80"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {rank}.
                        </span>
                        <span className="w-20 truncate font-semibold">{entry.nickname}</span>
                        <span className="flex-1 text-xs opacity-80 truncate">
                          {entryMeta?.title ?? entry.endingId}
                        </span>
                        <span
                          className="w-12 text-right font-bold"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {entry.finalScore}
                        </span>
                        <span style={gradeChipStyle(entry.grade, 'sm')}>{entry.grade}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* sticky 본인 위치 (Top 10 밖일 때만) */}
        {showStickyMine && myRecord && (
          <div
            data-testid="ranking-sticky-self"
            className="flex flex-row items-center gap-3 px-3 py-2 rounded-md text-sm"
            style={{
              background: 'rgba(245,215,110,0.10)',
              border: '1px solid rgba(245,215,110,0.45)',
              boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <span className="text-base">👤</span>
            <span className="font-semibold opacity-90">본인</span>
            <span
              className="font-bold"
              style={{ color: '#ffd86b', fontVariantNumeric: 'tabular-nums' }}
            >
              {stickyRankLabel}
            </span>
            <span className="opacity-50">·</span>
            <span className="truncate font-semibold">{myRecord.nickname}</span>
            <span className="opacity-50">·</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{myRecord.finalScore}점</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface PodiumProps {
  top3: RankingEntry[];
  myRecord: { nickname: string; finalScore: number } | null;
  pulseKey: string | null;
}

function Podium({ top3, myRecord, pulseKey }: PodiumProps) {
  // 시각 순서: 2위(왼쪽) - 1위(중앙) - 3위(오른쪽). 데이터는 점수 desc로 들어와 있어 인덱스 0=1위.
  const slots: Array<{ pos: 1 | 2 | 3; entry: RankingEntry | null }> = [
    { pos: 2, entry: top3[1] ?? null },
    { pos: 1, entry: top3[0] ?? null },
    { pos: 3, entry: top3[2] ?? null },
  ];
  // 1위 카드가 translateY(-12px)로 위로 떠 있어 부모 상단 경계에 잘리지 않도록 paddingTop 14px 확보.
  return (
    <div className="flex flex-row items-end justify-center gap-3" style={{ paddingTop: 14 }}>
      {slots.map(({ pos, entry }) => (
        <PodiumCard
          key={pos}
          pos={pos}
          entry={entry}
          myRecord={myRecord}
          pulseKey={pulseKey}
        />
      ))}
    </div>
  );
}

interface PodiumCardProps {
  pos: 1 | 2 | 3;
  entry: RankingEntry | null;
  myRecord: { nickname: string; finalScore: number } | null;
  pulseKey: string | null;
}

const MEDAL: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function PodiumCard({ pos, entry, myRecord, pulseKey }: PodiumCardProps) {
  const isFirst = pos === 1;
  const isMine =
    entry !== null &&
    myRecord !== null &&
    entry.nickname === myRecord.nickname &&
    entry.finalScore === myRecord.finalScore;
  const rowKey = entry ? `${entry.nickname}-${entry.finalScore}` : null;
  const isPulsing = rowKey !== null && pulseKey === rowKey;

  const baseStyle: React.CSSProperties = {
    background: isMine ? 'rgba(255,220,140,0.22)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${isFirst ? 'rgba(245,215,110,0.55)' : 'rgba(255,255,255,0.18)'}`,
    borderRadius: 10,
    padding: isFirst ? '14px 12px' : '10px 8px',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    transform: isFirst ? 'translateY(-12px)' : undefined,
    boxShadow: isFirst ? '0 0 24px rgba(245,215,110,0.35)' : undefined,
  };
  const placeholderStyle: React.CSSProperties = {
    ...baseStyle,
    background: 'transparent',
    border: '1px dashed rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.35)',
  };

  if (!entry) {
    return (
      <div style={placeholderStyle}>
        <div style={{ fontSize: isFirst ? 32 : 24 }}>{MEDAL[pos]}</div>
        <div style={{ fontSize: isFirst ? 18 : 14, marginTop: 4 }}>—</div>
      </div>
    );
  }

  const entryMeta = findEnding(entry.endingId);
  const nameSize = isFirst ? 18 : 14;
  const scoreSize = isFirst ? 26 : 20;

  return (
    <div
      style={baseStyle}
      className={isPulsing ? 'ranking-row-pulse' : undefined}
      data-testid={`podium-${pos}`}
    >
      <div style={{ fontSize: isFirst ? 36 : 28, lineHeight: 1 }}>{MEDAL[pos]}</div>
      <div
        className="truncate"
        style={{ fontSize: nameSize, fontWeight: 700, marginTop: 6 }}
      >
        {entry.nickname}
      </div>
      <div
        style={{
          fontSize: scoreSize,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          marginTop: 4,
        }}
      >
        {entry.finalScore}
      </div>
      <div style={{ marginTop: 6 }}>
        <span style={gradeChipStyle(entry.grade, isFirst ? 'lg' : 'md')}>{entry.grade}</span>
      </div>
      <div
        className="truncate"
        style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}
      >
        {entryMeta?.title ?? entry.endingId}
      </div>
    </div>
  );
}
