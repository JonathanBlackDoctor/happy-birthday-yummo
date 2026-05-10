/**
 * 음량 조절 — MiniControls 메뉴 행 바로 위에 노출되는 버튼 + 인라인 슬라이더 패널.
 *
 * - 닫힌 상태: `음량` 버튼 1개 (MiniControls의 BTN_CLASS와 동일 톤).
 * - 열린 상태: 버튼 아래 인라인 패널 — BGM/SFX 슬라이더 (settingsStore set으로 즉시 반영).
 *   SceneRenderer의 setVolumes useEffect가 store 변동을 audioManager에 동기화하므로 본 컴포넌트는 store만 업데이트.
 * - 외부 포인터 다운 시 자동 닫힘 (대사창/메뉴 클릭 흐름 방해 안 하도록).
 *
 * 위치 정책: VolumeControl 자체는 위치 X. 부모(MiniControls)가 flex-col 흐름 안에 끼워넣어
 * 메뉴 행 위(PC) / 햄버거 드롭다운 최상단(모바일)에 자연스럽게 배치한다.
 *
 * 2026-05-09 PM 지시 — "메뉴 UI 바로 위에 음량 조절 버튼 만든 다음, 로그 작성하고 업데이트해".
 */

import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { audioManager } from '@/engine/audioManager';

const BTN_CLASS =
  'min-h-[36px] min-w-[36px] px-2 py-1 bg-black/55 hover:bg-black/75 text-white border border-white/30 backdrop-blur-sm shadow-lg rounded-md text-xs font-medium flex items-center justify-center transition-colors';

interface VolumeRowProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  ariaLabel: string;
}

function VolumeRow({ label, value, onChange, ariaLabel }: VolumeRowProps) {
  const pct = Math.round(value * 100);
  return (
    <label className="flex flex-col gap-1 text-white text-xs">
      <span className="flex justify-between">
        <span>{label}</span>
        <span aria-hidden>{pct}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        aria-label={ariaLabel}
        aria-valuetext={`${pct}%`}
        className="w-full accent-white"
      />
    </label>
  );
}

export function VolumeControl() {
  const bgmVolume = useSettingsStore((s) => s.bgmVolume);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);
  const setSetting = useSettingsStore((s) => s.set);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 포인터 다운 시 자동 닫힘.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const toggle = () => {
    audioManager.playSfx('sfx_pageturn', { volume: 0.7 });
    setOpen((v) => !v);
  };

  return (
    <div ref={ref} className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label="음량 조절"
        aria-expanded={open}
        data-testid="volume-control-toggle"
        className={BTN_CLASS}
      >
        음량
      </button>
      {open && (
        <div
          role="group"
          aria-label="음량 조절"
          data-testid="volume-control-panel"
          className="w-56 p-3 bg-black/80 border border-white/30 rounded-md backdrop-blur-sm shadow-lg flex flex-col gap-3"
        >
          <VolumeRow
            label="BGM"
            value={bgmVolume}
            onChange={(v) => setSetting('bgmVolume', v)}
            ariaLabel="BGM 음량"
          />
          <VolumeRow
            label="SFX"
            value={sfxVolume}
            onChange={(v) => setSetting('sfxVolume', v)}
            ariaLabel="SFX 음량"
          />
        </div>
      )}
    </div>
  );
}
