/**
 * 씬 렌더러 — 엔진 메인 컴포넌트.
 *
 * - gameStore의 currentCommand를 보고 적절한 UI 컴포넌트를 렌더
 * - BG/CHARACTER/CG 레이어 합성 + 텍스트박스 + 카톡 모달 + 엔딩 화면
 * - audioManager 부수효과는 useEffect로 currentCommand 변화 시 처리
 */

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { audioManager } from '@/engine/audioManager';
import { BackgroundLayer } from '@/ui/BackgroundLayer';
import { CharacterLayer } from '@/ui/CharacterLayer';
import { CGOverlay } from '@/ui/CGOverlay';
import { DialogueBox } from '@/ui/DialogueBox';
import { ChoiceList } from '@/ui/ChoiceList';
import { Backlog } from '@/ui/Backlog';
import { PauseMenu } from '@/ui/PauseMenu';
import { SettingsScreen } from '@/ui/SettingsScreen';
import { MiniControls } from '@/ui/MiniControls';
import { VideoLayer } from '@/ui/VideoLayer';
import { KakaoModal } from '@/ui/katalk/KakaoModal';
import { EndingScreen } from '@/ui/EndingScreen';
import { GalleryScreen } from '@/ui/gallery/GalleryScreen';
import { AffectionToast } from '@/ui/AffectionToast';
import { ChapterFader } from '@/ui/ChapterFader';
import { ChapterTransitionRecap } from '@/ui/ChapterTransitionRecap';
import { AutoPlayButton } from '@/ui/AutoPlayButton';

export function SceneRenderer() {
  const cmd = useGameStore((s) => s.currentCommand);
  const runtimeMode = useGameStore((s) => s.runtimeMode);
  const isBacklogOpen = useGameStore((s) => s.isBacklogOpen);
  const isPauseMenuOpen = useGameStore((s) => s.isPauseMenuOpen);
  const isGalleryOpen = useGameStore((s) => s.isGalleryOpen);
  const awaitingChapterAdvance = useGameStore((s) => s.awaitingChapterAdvance);
  const chapterFadeOpacity = useGameStore((s) => s.chapterFadeOpacity);
  const advance = useGameStore((s) => s.advance);
  const userAdvance = useGameStore((s) => s.userAdvance);

  // 사용자 advance 차단 — 챕터 fade-out/in 중이거나 회상 대기 중이면 클릭/자동 텍스트 advance 모두 무시.
  // 빠른 연타로 boundary 진입 직전·후에 advance가 추가 호출되어 회상이 발동하지 않거나
  // 첫 명령들이 검정 화면에서 사라지는 race를 차단. (2026-05-09 회상 안 뜨는 회귀 처방.)
  // 단 store.startScene 안의 internal `await get().advance()`는 이 가드와 무관 (직접 호출).
  const blockUserAdvance = awaitingChapterAdvance || chapterFadeOpacity > 0.01;

  const bgmVolume = useSettingsStore((s) => s.bgmVolume);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);

  // 음량 동기화
  useEffect(() => {
    audioManager.setVolumes({ bgm: bgmVolume, sfx: sfxVolume });
  }, [bgmVolume, sfxVolume]);

  // 음원 부수효과 — BGM/SFX/BGM_STOP 명령은 store가 시각 상태를 바꾸지 않으므로 자동 진행
  useEffect(() => {
    if (!cmd) return;
    // 회상 대기 중에는 자동 advance 차단 (BG/CHARACTER/BGM 등이 회상 화면 위에서 진행되지 않도록)
    if (awaitingChapterAdvance) return;
    if (cmd.type === 'BGM') {
      audioManager.playBgm(cmd.track, { volume: cmd.volume, fade: cmd.fade });
      void advance();
    } else if (cmd.type === 'BGM_STOP') {
      audioManager.stopBgm({ fade: cmd.fade });
      void advance();
    } else if (cmd.type === 'SFX') {
      // 2026-05-09: loop 옵션 박힌 SFX는 ambient ambient 트랙으로 처리(BG 변경 시 자동 정지).
      audioManager.playSfx(cmd.sound, { volume: cmd.volume, loop: cmd.loop });
      void advance();
    } else if (cmd.type === 'FLAG_INC' || cmd.type === 'FLAG_SET' || cmd.type === 'KEY_CHOICE') {
      // 플래그 명령은 store에서 적용 후 자동 진행
      void advance();
    } else if (cmd.type === 'SCENE_CUE') {
      // 비기능 메타 큐 — 즉시 advance. 디버그 빌드에서만 라벨 노출 (DEV 환경만 콘솔).
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(`[SCENE_CUE] ${cmd.label}`);
      }
      void advance();
    } else if (cmd.type === 'EVALUATE_BRANCH' || cmd.type === 'JUMP') {
      // EVALUATE_BRANCH는 store에서 pendingEnding 세팅 후 ending 모드. JUMP는 startScene 호출.
      // 여기서 추가 작업 없음.
    } else if (
      cmd.type === 'BG' ||
      cmd.type === 'CHARACTER' ||
      cmd.type === 'CHARACTER_HIDE' ||
      cmd.type === 'CG_HIDE'
    ) {
      // 2026-05-09: BG 변경 = 장소 전환 → loop ambient SFX 자동 정지 (예: 열차 안 → 자취방 진입 시 ktx 주행음 stop).
      if (cmd.type === 'BG') {
        audioManager.stopAllLoopingSfx();
      }
      // 시각 레이어만 갱신하는 명령 — DialogueBox 같은 클릭 UI가 없으므로 자동 진행 (다음 NARRATION/CHOICE까지)
      void advance();
    }
  }, [cmd, advance, awaitingChapterAdvance]);

  // 화면 어디든 클릭 → advance (텍스트 명령일 때만, 클릭 타깃이 button/모달이 아닐 때)
  const isTextCmdForClick =
    cmd && (cmd.type === 'DIALOGUE' || cmd.type === 'MONOLOGUE' || cmd.type === 'NARRATION');
  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockUserAdvance) return;
    if (runtimeMode !== 'scene' || !isTextCmdForClick) return;
    if (isBacklogOpen || isPauseMenuOpen || isGalleryOpen) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"], input, select, textarea')) return;
    userAdvance();
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-bg"
      onClick={handleAreaClick}
    >
      <BackgroundLayer />
      <CharacterLayer />
      <CGOverlay />

      {runtimeMode === 'scene' && cmd && (cmd.type === 'DIALOGUE' || cmd.type === 'MONOLOGUE' || cmd.type === 'NARRATION') && (
        <DialogueBox onAdvance={() => { if (!blockUserAdvance) userAdvance(); }} />
      )}
      {runtimeMode === 'scene' && cmd && cmd.type === 'VIDEO' && (
        <VideoLayer cmd={cmd} onEnded={() => void advance()} />
      )}
      {runtimeMode === 'choice' && <ChoiceList />}
      {runtimeMode === 'kakao' && <KakaoModal />}
      {runtimeMode === 'ending' && <EndingScreen />}

      <AffectionToast />
      <ChapterFader />
      <ChapterTransitionRecap />

      {!isBacklogOpen && !isPauseMenuOpen && !isGalleryOpen && <MiniControls />}
      {(runtimeMode === 'scene' || runtimeMode === 'kakao' || runtimeMode === 'cg')
        && !isBacklogOpen && !isPauseMenuOpen && !isGalleryOpen
        && <AutoPlayButton />}
      {isBacklogOpen && <Backlog />}
      {isPauseMenuOpen && <PauseMenu />}
      {isGalleryOpen && <GalleryScreen />}
      <SettingsPanelMount />
    </div>
  );
}

/**
 * SettingsScreen 마운트 — PauseMenu와 무관하게 isSettingsOpen 단독 구독.
 * 미니 컨트롤의 ⚙ 버튼이 토글하므로 메뉴/백로그/갤러리 노출 중에는 자연 비노출 (z-menu와 동일 레벨이므로
 * 다른 풀스크린 패널에 가려짐). 게임 화면에서만 보이도록 추가 가드는 두지 않는다 — PM이 메뉴 도중
 * 빠른 음량/폰트 조정을 원하면 그대로 작동하도록.
 */
function SettingsPanelMount() {
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  if (!isSettingsOpen) return null;
  return <SettingsScreen />;
}
