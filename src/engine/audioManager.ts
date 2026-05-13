/**
 * Howler.js 래퍼 — ARCHITECTURE.md §2 + BGM-list §2 정합.
 *
 * - BGM 한 트랙 동시 재생 (이전 트랙은 fade out 후 unload)
 * - **일상 BGM(`bgm_daily`) 예외**: 정지·전환 시 unload 대신 fade out + pause로 stash.
 *   다음 재생 시 stash에서 복원 → 같은 위치에서 fade in 재개. 사용자가 일상 BGM
 *   앞부분만 반복해서 듣게 되던 단조로움 회귀 처방 (2026-05-09 PM 지시).
 * - SFX 풀링 (동일 ID 즉시 재생 가능)
 * - 음량은 settingsStore에서 주입 (외부 호출자가 setVolumes로 동기화)
 * - 자산 미존재 시 onloaderror로 graceful warn (W4 placeholder 시기에 빌드 실패 방지)
 */

import { Howl } from 'howler';
import { bgmPath, isKnownBgm, isKnownSfx, sfxPath } from './audioMappings';

interface CurrentBgm {
  id: string;
  howl: Howl;
}

/**
 * 정지·전환 시 unload 대신 pause로 stash해 다음 재생에 같은 위치에서 이어 듣게 할 BGM 영문 ID.
 * 'bgm_daily'(= 한글 큐 '일상' / alias '잔잔')만 해당. 다른 BGM은 기존 stop+unload 유지.
 */
const RESUMABLE_BGM_IDS: ReadonlySet<string> = new Set(['bgm_daily']);

const FADE_TOKEN_MS: Record<number, number> = {
  1: 150,
  2: 600,
  3: 900,
  4: 2000,
};

function fadeMs(token: number | undefined): number {
  if (token === undefined) return FADE_TOKEN_MS[2];
  return FADE_TOKEN_MS[token] ?? FADE_TOKEN_MS[2];
}

/**
 * Howler.js v2.2.4 html5 모드 회귀 처방 — Howl 생성 시 `loop: true`가 underlying
 * `HTMLAudioElement.loop`로 전파되지 않아(라이브 검사로 확인) 트랙이 1회 끝난 뒤 자동
 * 무한 루프가 안 걸리던 현상. node.loop를 직접 true로 박아 native HTMLAudio 루프 동작으로 강제.
 * Howler 내부 'ended' 이벤트 기반 수동 재시작에 의존하지 않게 만든다.
 */
interface HowlInternalSound {
  _node?: HTMLAudioElement;
}
interface HowlWithSounds {
  _sounds?: HowlInternalSound[];
}

function enforceNativeLoop(howl: Howl): void {
  const sounds = (howl as unknown as HowlWithSounds)._sounds;
  if (!sounds) return;
  for (const s of sounds) {
    if (s._node && !s._node.loop) s._node.loop = true;
  }
}

class AudioManager {
  private currentBgm: CurrentBgm | null = null;
  // RESUMABLE_BGM_IDS에 속한 트랙이 정지·전환되면 unload 대신 여기에 보관. 다음 재생 시 동일 위치에서 fade in 재개.
  private stashedBgms: Map<string, Howl> = new Map();
  // stash pause용 토큰. releaseCurrentBgm setTimeout 콜백이 stale 발화(이미 stash가 복원됐는데 pause 호출) 하는 회귀 방지.
  private stashPauseTokens: Map<string, number> = new Map();
  private tokenSeq = 0;
  private sfxPool: Map<string, Howl> = new Map();
  // 2026-05-09: loop ambient SFX 트래킹 (예: 열차 주행음).
  // BG 변경 시 자동 stopAllLoopingSfx로 정리 (장소 전환 = ambient 정지).
  private loopingSfx: Map<string, Howl> = new Map();
  private bgmVolume = 0.7;
  private sfxVolume = 0.8;
  private muted = false;

  setVolumes(opts: { bgm?: number; sfx?: number; muted?: boolean }): void {
    if (opts.bgm !== undefined) this.bgmVolume = opts.bgm;
    if (opts.sfx !== undefined) this.sfxVolume = opts.sfx;
    if (opts.muted !== undefined) this.muted = opts.muted;
    if (this.currentBgm) {
      this.currentBgm.howl.volume(this.muted ? 0 : this.bgmVolume);
    }
  }

  playBgm(en: string, opts: { volume?: number; fade?: number } = {}): void {
    if (!isKnownBgm(en)) {
      console.warn(`[audioManager] Unknown BGM: ${en}`);
      return;
    }
    const fadeIn = fadeMs(opts.fade);
    const targetVol = (opts.volume ?? this.bgmVolume) * (this.muted ? 0 : 1);

    if (this.currentBgm?.id === en) {
      this.currentBgm.howl.fade(this.currentBgm.howl.volume(), targetVol, fadeIn);
      return;
    }

    // resumable BGM 재요청 — stash된 howl을 복원해 같은 위치에서 fade in 재개.
    const stashed = this.stashedBgms.get(en);
    if (stashed) {
      if (this.currentBgm) {
        this.releaseCurrentBgm({ fade: opts.fade });
      }
      this.stashedBgms.delete(en);
      // 이전 release가 예약한 setTimeout(pause)가 stale 발화로 방금 복원한 howl을 멈추지 않도록 토큰 무효화.
      this.stashPauseTokens.delete(en);
      this.currentBgm = { id: en, howl: stashed };
      if (stashed.playing()) {
        // 아직 fade out 중(playing 상태) — html5 모드에서 play()를 재호출하면 두 번째
        // <audio> 인스턴스가 생성된다. play() 생략하고 현재 위치에서 바로 fade up.
        stashed.fade(stashed.volume(), targetVol, fadeIn);
      } else {
        // 이미 pause됐으면 처음부터 volume(0) → play() → fade in.
        // html5 모드에서 play()는 비동기(HTMLAudioElement.play() Promise).
        // once('play') 안에서 fade를 걸어야 실제 재생 시작 후 볼륨이 올라간다.
        // 즉시 fade를 걸면 interval이 play 시작 전에 완료돼 볼륨이 0에 남는 회귀 방지.
        stashed.volume(0);
        stashed.once('play', () => {
          enforceNativeLoop(stashed);
          stashed.fade(0, targetVol, fadeIn);
        });
        stashed.play();
      }
      return;
    }

    if (this.currentBgm) {
      this.releaseCurrentBgm({ fade: opts.fade });
    }

    const howl = new Howl({
      src: [bgmPath(en)],
      loop: true,
      volume: 0,
      // 2026-05-09: BGM은 HTMLAudioElement 모드(html5:true)로 재생.
      // OP 비디오와 동시 재생 시 WebAudio decodeAudioData가 메인 스레드를 점유하면서
      // BGM playback rate가 흔들리던(wow/flutter) 회귀 처방. 비디오 audio strip(라운드 5)으로
      // 충분치 않아 BGM 디코딩 경로 자체를 비디오와 동등한 HTMLMediaElement로 분리.
      // SFX는 그대로 WebAudio(낮은 latency 필요).
      html5: true,
      onload: function () {
        // Howler v2.2.4 html5 모드 회귀 처방 — node.loop 강제 (loop:true가 자동 전파 X).
        enforceNativeLoop(this as unknown as Howl);
      },
      onplay: function () {
        // 재생 시작 직후 한 번 더 보장 (sound가 onload 시점에 아직 _sounds에 없는 케이스 방어).
        enforceNativeLoop(this as unknown as Howl);
      },
      onloaderror: (_id, err) => {
        console.warn(`[audioManager] BGM load failed (${en}):`, err);
      },
    });
    // html5 모드에서 play()는 비동기(HTMLAudioElement.play() Promise).
    // once('play') 안에서 fade를 걸어야 실제 재생 시작 후 볼륨이 올라간다.
    // 즉시 fade를 걸면 interval이 play 시작 전에 완료돼 볼륨이 0에 남는 회귀 방지.
    howl.once('play', () => { howl.fade(0, targetVol, fadeIn); });
    howl.play();
    enforceNativeLoop(howl);
    this.currentBgm = { id: en, howl };
  }

  stopBgm(opts: { fade?: number } = {}): void {
    if (!this.currentBgm) return;
    const fadeOut = fadeMs(opts.fade);
    this.releaseCurrentBgm({ fade: opts.fade });
    // 무음 방지 fallback — fade 완료 후 새 BGM이 없으면 일상 BGM으로 자동 복구.
    // BGM 명령이 없는 씬 체인이나 BGM_STOP 후 빈 구간을 채운다.
    setTimeout(() => {
      if (!this.currentBgm) {
        this.playBgm('bgm_daily', { fade: 2 });
      }
    }, fadeOut + 150);
  }

  /**
   * 현재 BGM 정리 — RESUMABLE_BGM_IDS면 fade out + pause(언로드 X)로 stash, 아니면 기존처럼 fade out + stop + unload.
   * stash된 트랙은 다음 playBgm(같은 ID) 호출에서 같은 seek 위치로 fade in 재개된다.
   */
  private releaseCurrentBgm(opts: { fade?: number } = {}): void {
    if (!this.currentBgm) return;
    const fadeOut = fadeMs(opts.fade);
    const { id, howl } = this.currentBgm;
    howl.fade(howl.volume(), 0, fadeOut);
    if (RESUMABLE_BGM_IDS.has(id)) {
      // 같은 ID에 이미 stash가 있으면(이론상 거의 없음) 옛 것을 정리하고 새 것으로 교체.
      const prevStash = this.stashedBgms.get(id);
      if (prevStash && prevStash !== howl) {
        prevStash.stop();
        prevStash.unload();
      }
      const token = ++this.tokenSeq;
      this.stashPauseTokens.set(id, token);
      this.stashedBgms.set(id, howl);
      setTimeout(() => {
        // stash가 그 사이 복원/교체됐으면 토큰이 바뀌어 있음 → pause 스킵.
        if (this.stashPauseTokens.get(id) !== token) return;
        howl.pause();
      }, fadeOut + 50);
    } else {
      setTimeout(() => {
        howl.stop();
        howl.unload();
      }, fadeOut + 50);
    }
    this.currentBgm = null;
  }

  /**
   * 슬롯 로드용 — 현재 + stash 모두 즉시 정리. fade/stash 연속성은 상태 점프 의미가 없으므로 버린다.
   * 호출 후 playBgm을 깨끗한 상태에서 다시 시작할 수 있다.
   */
  resetBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.howl.stop();
      this.currentBgm.howl.unload();
      this.currentBgm = null;
    }
    for (const [, howl] of this.stashedBgms) {
      howl.stop();
      howl.unload();
    }
    this.stashedBgms.clear();
    this.stashPauseTokens.clear();
  }

  playSfx(en: string, opts: { volume?: number; loop?: boolean } = {}): void {
    if (!isKnownSfx(en)) {
      console.warn(`[audioManager] Unknown SFX: ${en}`);
      return;
    }
    const targetVol = (opts.volume ?? this.sfxVolume) * (this.muted ? 0 : 1);
    if (opts.loop) {
      // 이미 재생 중이면 볼륨만 갱신 (중복 시작 방지).
      const existing = this.loopingSfx.get(en);
      if (existing) {
        existing.volume(targetVol);
        return;
      }
      const howl = new Howl({
        src: [sfxPath(en)],
        loop: true,
        volume: targetVol,
        html5: false,
        onloaderror: (_id, err) => {
          console.warn(`[audioManager] SFX (loop) load failed (${en}):`, err);
        },
      });
      howl.play();
      this.loopingSfx.set(en, howl);
      return;
    }
    let howl = this.sfxPool.get(en);
    if (!howl) {
      howl = new Howl({
        src: [sfxPath(en)],
        volume: 1,
        html5: false,
        onloaderror: (_id, err) => {
          console.warn(`[audioManager] SFX load failed (${en}):`, err);
        },
      });
      this.sfxPool.set(en, howl);
    }
    howl.volume(targetVol);
    howl.play();
  }

  /** 특정 loop SFX 정지 (시나리오에 [SFX_STOP: <id>] 큐로 박힐 때 호출). */
  stopSfx(en: string): void {
    const looping = this.loopingSfx.get(en);
    if (!looping) return;
    looping.fade(looping.volume(), 0, 200);
    setTimeout(() => {
      looping.stop();
      looping.unload();
    }, 250);
    this.loopingSfx.delete(en);
  }

  /** 모든 loop SFX 정지. BG 변경 시 SceneRenderer가 호출 (장소 전환 = ambient 정지). */
  stopAllLoopingSfx(): void {
    for (const [, howl] of this.loopingSfx) {
      howl.fade(howl.volume(), 0, 200);
      const target = howl;
      setTimeout(() => {
        target.stop();
        target.unload();
      }, 250);
    }
    this.loopingSfx.clear();
  }

  /** 현재 재생 중인 BGM 영문 ID (없으면 null). 저장 슬롯 audio.bgmTrack에 사용. */
  currentBgmId(): string | null {
    return this.currentBgm?.id ?? null;
  }
}

export const audioManager = new AudioManager();
