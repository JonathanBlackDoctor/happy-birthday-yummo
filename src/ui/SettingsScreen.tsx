/**
 * 환경설정 — 미니 컨트롤의 ⚙ 버튼에서 진입하는 작은 floating 패널.
 *
 * 2026-05-10 PM 정정: 풀스크린 모달 → 우하단 floating 패널.
 * PauseMenu에서 분리 (메뉴 클릭 한 번 줄임). 외부 포인터 다운 시 자동 닫힘.
 *
 * 항목 (PM 결정 2026-05-10 정리):
 *   - 음량 BGM/SFX 슬라이더 2종 (Voice 제거)
 *   - 텍스트 속도 라디오 4종
 *   - 자동진행 지연 슬라이더 (1000~5000ms)
 *   - 폰트 크기 슬라이더 (14~30px)
 *   - 텍스트박스 투명도 슬라이더 (0.5~1.0)
 *   - 애니메이션 줄이기 토글
 *   - 기본값으로 리셋 / 데이터 초기화
 *
 * 제거 (외부 UI에 이미 있거나 PM 결정으로 빠짐):
 *   - Voice 슬라이더 (보이스 자산 도착 후 별도 라운드에서 부활)
 *   - 음소거 토글 (MiniControls의 MuteToggle에 이미 있음)
 *   - 미열람 텍스트도 스킵 토글
 */

import { useEffect, useRef, useState } from 'react';
import {
  useSettingsStore,
  TEXT_SPEED_LABEL,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  type TextSpeed,
} from '@/stores/settingsStore';
import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/engine/audioManager';
import { confirmAndResetGame } from './util/resetGame';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  format?: (value: number) => string;
}

function SliderRow({ label, value, min, max, step, onChange, format }: SliderRowProps) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="flex justify-between items-baseline text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-text-light">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
        aria-label={label}
        aria-valuetext={format ? format(value) : String(value)}
      />
    </label>
  );
}

const TEXT_SPEEDS: readonly TextSpeed[] = ['slow', 'normal', 'fast', 'instant'];

export function SettingsScreen() {
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);

  const bgmVolume = useSettingsStore((s) => s.bgmVolume);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);
  const textSpeed = useSettingsStore((s) => s.textSpeed);
  const autoAdvanceDelay = useSettingsStore((s) => s.autoAdvanceDelay);
  const textboxOpacity = useSettingsStore((s) => s.textboxOpacity);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setSetting = useSettingsStore((s) => s.set);
  const resetSettings = useSettingsStore((s) => s.reset);

  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 포인터 다운 시 자동 닫힘 (VolumeControl 패턴 미러).
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
        setSettingsOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [setSettingsOpen]);

  const close = () => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    setSettingsOpen(false);
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="환경설정"
      data-testid="settings-screen"
      className="absolute right-2 bottom-2 md:right-3 md:bottom-3 w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto bg-bg/95 backdrop-blur-sm text-text rounded-xl shadow-xl border border-text-light/30 p-4 flex flex-col gap-3"
      style={{ zIndex: 'var(--z-menu)' }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">환경설정</h2>
        <button
          type="button"
          onClick={close}
          className="w-7 h-7 rounded-md text-text-light hover:text-text hover:bg-text-light/10"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 음량 — Voice 제거, 음소거 토글은 MiniControls에 있어 미노출 */}
      <section className="flex flex-col gap-2">
        <SliderRow
          label="BGM"
          value={bgmVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setSetting('bgmVolume', v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <SliderRow
          label="효과음 (SFX)"
          value={sfxVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setSetting('sfxVolume', v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </section>

      {/* 텍스트 */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold">텍스트 속도</span>
          <div role="radiogroup" aria-label="텍스트 속도" className="flex flex-wrap gap-1">
            {TEXT_SPEEDS.map((sp) => (
              <button
                key={sp}
                type="button"
                role="radio"
                aria-checked={textSpeed === sp}
                onClick={() => setSetting('textSpeed', sp)}
                className={`flex-1 min-w-[58px] min-h-[32px] px-2 py-1 rounded-md border text-xs transition-colors ${
                  textSpeed === sp
                    ? 'bg-accent border-accent text-text'
                    : 'bg-bg border-text-light/30 hover:bg-accent/20'
                }`}
              >
                {TEXT_SPEED_LABEL[sp]}
              </button>
            ))}
          </div>
        </div>
        <SliderRow
          label="자동진행 지연"
          value={autoAdvanceDelay}
          min={500}
          max={5000}
          step={500}
          onChange={(v) => setSetting('autoAdvanceDelay', v)}
          format={(v) => `${(v / 1000).toFixed(1)}초`}
        />
        <SliderRow
          label="폰트 크기"
          value={fontSize}
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
          onChange={(v) => setSetting('fontSize', v)}
          format={(v) => `${v}px`}
        />
        <SliderRow
          label="텍스트박스 투명도"
          value={textboxOpacity}
          min={0.5}
          max={1.0}
          step={0.05}
          onChange={(v) => setSetting('textboxOpacity', v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </section>

      {/* 기타 */}
      <section className="flex items-center justify-between gap-2 py-1">
        <label className="flex items-center gap-2 text-xs cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setSetting('reduceMotion', e.target.checked)}
            className="w-4 h-4 accent-accent"
          />
          <span>애니메이션 줄이기</span>
        </label>
      </section>

      {/* 액션 */}
      <section className="flex flex-col gap-1.5 pt-2 border-t border-text-light/30">
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="min-h-[32px] px-3 py-1 rounded-md bg-bg border border-text-light/40 hover:bg-accent/20 text-left text-xs"
          >
            기본값으로 리셋
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-warning/30">
            <span className="text-xs flex-1">기본값으로?</span>
            <button
              type="button"
              onClick={() => {
                resetSettings();
                setConfirmReset(false);
              }}
              className="min-h-[28px] px-2 py-0.5 rounded bg-accent hover:bg-accent-hover text-xs"
            >
              예
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="min-h-[28px] px-2 py-0.5 rounded bg-bg border border-text-light/40 text-xs"
            >
              아니오
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={confirmAndResetGame}
          className="min-h-[32px] px-3 py-1 rounded-md bg-bg border border-danger/50 hover:bg-danger/30 text-left text-xs"
        >
          데이터 초기화 (호감도/진행)
        </button>
        <p className="text-[10px] text-text-light leading-snug px-1">
          ※ 갤러리·수동 슬롯·엔딩 기록·환경설정은 보존됩니다.
        </p>
      </section>
    </div>
  );
}
