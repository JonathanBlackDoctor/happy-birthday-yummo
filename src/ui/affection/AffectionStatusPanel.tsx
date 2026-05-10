/**
 * 메뉴 호감도 단계 패널 — PauseMenu(ESC) 안에서 5명 호감도를 별 1~5개로 반(半) 공개.
 *
 * 숨김 수치(0~100)는 노출 금지. 별과 단계 라벨만 노출 (stages.ts).
 * AffectionThermometer를 intensity="subtle" + 정적 value로 재사용 — 토스트와 시각 일관성 확보.
 *
 * (2026-05-08) 미등장 히로인 잠금 표시 — flags.met_heroines에 없는 H는
 * 큰 ?와 "???" 라벨로 가림 (사용자 결정: 첫 [CHARACTER] 등장 시점이 잠금 해제 기준).
 */

import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { HEROINES } from '@/data/characters';
import { HEROINE_IDS } from '@/engine/types';
import { AffectionThermometer } from './AffectionThermometer';
import { affectionStage } from './stages';

const THERM_SCALE = 0.42; // 온도계 확대(100×460) 후 5칸 그리드 폭 보존용

export function AffectionStatusPanel() {
  const flags = useGameStore((s) => s.flags);
  const met = flags.met_heroines;
  const animatedEnabled = useSettingsStore((s) => s.animatedEndingPanel);
  const setSetting = useSettingsStore((s) => s.set);

  // 이스터에그: "호감도" 글씨 클릭 시 엔딩 액체 애니메이션 패널 토글.
  const toggleAnimated = () => {
    setSetting('animatedEndingPanel', !animatedEnabled);
  };

  return (
    <div className="w-full">
      <h3
        className="text-base font-semibold mb-3 text-text-light cursor-pointer select-none"
        onClick={toggleAnimated}
        title={animatedEnabled ? '액체 애니메이션 ON' : ''}
        style={{
          textShadow: animatedEnabled ? '0 0 6px rgba(255, 111, 168, 0.65)' : 'none',
          color: animatedEnabled ? '#FF6FA8' : undefined,
          transition: 'color 200ms ease, text-shadow 200ms ease',
        }}
      >
        호감도
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {HEROINE_IDS.map((hid) => {
          const meta = HEROINES[hid];
          const isLocked = !met.includes(hid);
          if (isLocked) {
            return (
              <div
                key={hid}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/30"
              >
                <LockedThermometer />
                <span className="text-sm font-semibold text-text/60">???</span>
                <span aria-hidden="true" className="text-xs" style={{ letterSpacing: '0.5px', opacity: 0.25 }}>
                  ★★★★★
                </span>
                <span className="text-[11px] text-text-light/60">미등장</span>
              </div>
            );
          }

          const value = flags[hid];
          const stage = affectionStage(value);
          return (
            <div
              key={hid}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/40"
            >
              <div style={{ transform: `scale(${THERM_SCALE})`, transformOrigin: 'top center', height: 200 }}>
                <AffectionThermometer
                  value={value}
                  heroineId={meta.id}
                  nameLabel={meta.name}
                  intensity="subtle"
                />
              </div>
              <span className="text-sm font-semibold text-text">{meta.name}</span>
              <span
                aria-label={`${stage.stars}단계 ${stage.label}`}
                className="text-xs"
                style={{ letterSpacing: '0.5px' }}
              >
                {'★'.repeat(stage.stars)}
                <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - stage.stars)}</span>
              </span>
              <span className="text-[11px] text-text-light">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 미등장 히로인 자리에 표시되는 ? 마크. AffectionThermometer와 동일 외곽 사이즈(scale 0.42 적용 후)로
 * 그리드 시프트 회피. 회색조 + 큰 ? 글자.
 */
function LockedThermometer() {
  return (
    <div
      role="img"
      aria-label="미등장 히로인"
      style={{
        width: 100 * THERM_SCALE,
        height: 460 * THERM_SCALE,
        marginTop: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        background: 'rgba(180, 170, 185, 0.12)',
        border: '1.5px dashed rgba(120, 110, 130, 0.5)',
        color: 'rgba(80, 70, 90, 0.55)',
        fontSize: 56,
        fontWeight: 900,
        textShadow: '0 1px 2px rgba(255,255,255,0.4)',
        userSelect: 'none',
      }}
    >
      ?
    </div>
  );
}
