/**
 * 스토리 모드 선택 — 풀 / 압축 / 팔정팟 각색 (2026-05-10).
 *
 * 게임 첫 부팅 시 OP 영상 직후 1회 표시. settingsStore.storyMode === null 일 때만 노출.
 * 선택 후 settingsStore에 영구 저장 → 다음 부팅부터 자동 스킵.
 *
 * "팔정팟 각색" 카드는 metaStore.has_cleared_once === false 면 잠금 — 엔딩 1개 도달 후 해금.
 *
 * E2E 자동화 환경(navigator.webdriver / ?scene= / ?flags=)에서는 App.tsx가 자동으로
 * 'full'로 세팅 후 이 컴포넌트를 렌더하지 않음.
 */

import { useState } from 'react';
import { useSettingsStore, type StoryMode } from '@/stores/settingsStore';
import { useMetaStore } from '@/stores/metaStore';

interface Props {
  onComplete: () => void;
}

export function ModeSelect({ onComplete }: Props) {
  const setSetting = useSettingsStore((s) => s.set);
  const hasAchievedTrueEnding = useSettingsStore((s) => s.hasAchievedTrueEnding);
  const autoPlayUnlocked = useSettingsStore((s) => s.autoPlayUnlocked);
  // 팔정팟 각색 카드 해금 — 어떤 엔딩이든 1개 도달 후 ModeSelect 재진입 시 활성.
  // metaStore.has_cleared_once 는 recordEnding(EndingScreen 마운트)에서 true 로 박힘 → 영구 보존.
  const palJeongPotUnlocked = useMetaStore((s) => s.has_cleared_once);
  // 트루 엔딩 도달했고 아직 자동재생 잠금해제 안 됐으면 마운트 직후 축하 모달.
  // 확인 시 autoPlayUnlocked=true 영구 기록 → 이후 ModeSelect 진입에선 다시 안 뜸.
  const [showUnlockModal, setShowUnlockModal] = useState(
    () => hasAchievedTrueEnding && !autoPlayUnlocked,
  );

  // 2026-05-09 정정: 메인 테마 BGM은 OpeningVideo 마운트 시점에 시작(OP 영상과 동시).
  // ModeSelect 마운트 시점엔 이미 재생 중 → audioManager가 같은 ID면 fade만 처리하므로 중복 호출 불필요.

  const choose = (mode: StoryMode) => {
    setSetting('storyMode', mode);
    onComplete();
  };

  const confirmUnlock = () => {
    setSetting('autoPlayUnlocked', true);
    setShowUnlockModal(false);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center px-6 md:px-8 pt-2 md:pt-3 pb-6 md:pb-8"
      style={{ zIndex: 'var(--z-menu)', backgroundColor: '#FED8E5' }}
      data-testid="mode-select"
    >
      <div className="flex items-center justify-center w-full" style={{ flex: '1 1 0%', minHeight: 0 }}>
        <img
          src="./img/title.webp"
          alt="구연시: 본과 1학년의 봄"
          className="title-float max-w-[92%] max-h-full object-contain select-none"
          draggable={false}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl mt-3 md:mt-5">
        <button
          type="button"
          onClick={() => choose('compressed')}
          className="relative flex-1 min-h-[120px] p-6 bg-mint hover:bg-mint-dark text-text rounded-2xl text-left transition-colors border-2 border-mint-dark shadow-lg"
          data-testid="mode-select-compressed"
        >
          <span className="absolute -top-3 left-4 px-2 py-0.5 bg-mint-dark text-white text-xs font-bold rounded-full">
            추천 ★
          </span>
          <div className="text-xl font-bold mb-2">압축 버전</div>
          <div className="text-sm opacity-80">
            대사·카톡·선택지·CG 100% 보존, 지문 절반. 짧게 한 회차 돌릴 때 추천.
          </div>
        </button>
        <button
          type="button"
          onClick={() => choose('full')}
          className="flex-1 min-h-[120px] p-6 bg-accent hover:bg-accent-hover text-text rounded-2xl text-left transition-colors"
          data-testid="mode-select-full"
        >
          <div className="text-xl font-bold mb-2">풀 스토리</div>
          <div className="text-sm opacity-80">
            모든 지문·독백·연출이 그대로. 본과 1학년의 봄을 천천히 따라가는 정석 버전.
          </div>
        </button>
        <button
          type="button"
          onClick={() => palJeongPotUnlocked && choose('palJeongPot')}
          disabled={!palJeongPotUnlocked}
          aria-disabled={!palJeongPotUnlocked}
          title={palJeongPotUnlocked ? undefined : '엔딩 1개 도달 후 해금'}
          className={
            palJeongPotUnlocked
              ? 'relative flex-1 min-h-[120px] p-6 bg-violet-300 hover:bg-violet-400 text-text rounded-2xl text-left transition-colors'
              : 'relative flex-1 min-h-[120px] p-6 bg-text/30 text-white/70 rounded-2xl text-left cursor-not-allowed select-none'
          }
          data-testid="mode-select-pal-jeong-pot"
        >
          {!palJeongPotUnlocked && (
            <span className="absolute -top-3 left-4 px-2 py-0.5 bg-text text-white text-xs font-bold rounded-full">
              🔒 잠김
            </span>
          )}
          <div className="text-xl font-bold mb-2">팔정팟 각색</div>
          <div className="text-sm opacity-80">
            {palJeongPotUnlocked
              ? '팔정팟이 다시 들려주는 봄의 이야기. 가장 짧지만 가장 풍성한 버전.'
              : '엔딩 1개를 본 뒤 타이틀로 돌아오면 해금됩니다.'}
          </div>
        </button>
      </div>

      {showUnlockModal && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', zIndex: 'var(--z-modal)' }}
          data-testid="autoplay-unlock-modal"
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-[440px] w-[88%] text-center shadow-2xl border-4 border-mint-dark"
          >
            <div className="text-3xl mb-3">🎉</div>
            <div className="text-xl font-bold mb-3 text-text">
              트루 엔딩 달성!
            </div>
            <div className="text-sm text-text-light mb-5 leading-relaxed">
              자동재생 기능이 잠금해제되었어요.<br />
              좌측 상단 ▶ 버튼으로 켜고 끌 수 있어요.
            </div>
            <button
              type="button"
              onClick={confirmUnlock}
              className="px-6 py-3 bg-mint-dark text-white font-semibold rounded-lg min-h-[44px] hover:brightness-95"
              data-testid="autoplay-unlock-confirm"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
