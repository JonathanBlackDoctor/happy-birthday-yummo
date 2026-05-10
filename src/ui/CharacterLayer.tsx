import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { resolveSpriteName } from '@/data/spriteResolver';

/**
 * 6슬롯 위치 모델 (대규모 동선 재설계 라운드 2026-05-08, 좌표 재조정 2026-05-09).
 * - 앞줄(_front 묵시): left/center/right — 25%/50%/75%, max-h 90%, z=2 (대화 주체)
 * - 뒷줄(_back): left_back/center_back/right_back — 15%/35%/85%, max-h 75%, z=1 (군중·배경 인물)
 * - center_back은 X=35%로 center와 분리 (2026-05-09 PM — 조나단·윤모 center 겹침 회피). _back은 작게+뒤로 = 입체감
 * - left_back/right_back은 앞줄과 10% 분리 (5%였던 1차 라운드는 자산 폭 큰 캐릭에서 시각 겹침 발생)
 * - 4명+ 동시 등장 시 시나리오 작가가 _back 슬롯에 명시 배치
 */
type Position =
  | 'left'
  | 'center'
  | 'right'
  | 'left_back'
  | 'center_back'
  | 'right_back'
  // 친밀 페어 슬롯 (2026-05-09 추가) — 윤모 + 1명 H 같이 앉은 자리(ch05_02b_h*).
  // pair_left/pair_right는 38%/62%로 24% 차이 = 친밀 거리. 앞줄 z·max-h 동일.
  | 'pair_left'
  | 'pair_right';

const POSITION_X: Record<Position, string> = {
  left: '25%',
  center: '50%',
  right: '75%',
  left_back: '15%',
  center_back: '35%',
  right_back: '85%',
  pair_left: '38%',
  pair_right: '62%',
};

const POSITION_MAX_H: Record<Position, string> = {
  left: '90%',
  center: '90%',
  right: '90%',
  left_back: '75%',
  center_back: '75%',
  right_back: '75%',
  pair_left: '90%',
  pair_right: '90%',
};

const POSITION_Z: Record<Position, number> = {
  left: 2,
  center: 2,
  right: 2,
  left_back: 1,
  center_back: 1,
  right_back: 1,
  pair_left: 2,
  pair_right: 2,
};

const VALID_POSITIONS = new Set<Position>([
  'left',
  'center',
  'right',
  'left_back',
  'center_back',
  'right_back',
  'pair_left',
  'pair_right',
]);

/**
 * 캐릭터별 표시 maxHeight scale (PM 결정 2026-05-08).
 * 슬롯별 base × scale 적용. 명시 안 된 prefix는 1.0 (기본 POSITION_MAX_H 그대로).
 */
const PREFIX_SCALE: Record<string, number> = {
  gyumin: 1.2, // 김규민: 120% 확대
};

/**
 * 슬롯 무관 절대 maxHeight (게임 캔버스 높이 % 기준).
 * 조나단/표경민은 슬롯과 무관하게 키가 동일하게 보이도록 고정값 사용.
 */
const PREFIX_FIXED_MAX_H: Record<string, string> = {
  gyeongmin: '82.8%', // 표경민: yunmo와 junhyuk의 중간 키 (= 90% × 0.92)
  nathan: '82.8%', // 조나단: 표경민과 동일 키
};

/**
 * 슬롯 무관 절대 maxWidth — fixed 키 캐릭터 중 가로가 너무 넓을 때 보정.
 * 자산 비율 검토 결과(2026-05-08): 조나단 0.593, 표경민 0.603으로 거의 동일 → 가로 제한 불필요.
 * 향후 가로가 너무 큰 자산이 추가되면 prefix 등록.
 */
const PREFIX_FIXED_MAX_W: Record<string, string> = {};

/**
 * 슬롯 무관 절대 X 좌표 — prefix별로 우측 영역 좁아지는 시각 충돌 회피용 (2026-05-09).
 * PM 신고: 장윤영(yuna)이 right(75%) 슬롯에서 조나단(right_back 85%)과 시각 겹침 → 65%로 좌측 이동.
 * 슬롯 ID는 그대로(시나리오 호환), X 좌표만 prefix 기준으로 override.
 */
const PREFIX_FIXED_X: Record<string, string> = {
  yuna: '65%',
};

/** 좌우 반전(flip)이 필요한 캐릭터 prefix. */
const PREFIX_FLIP: Set<string> = new Set([
  'hajeong', // 윤하정
]);

/**
 * 캐릭터별 워킹 보정 (ANIMATION-SPEC §3·§3.5, 2026-05-09 PM 결정 라운드 #3).
 * 사람마다 보폭·속도·흔들림이 달라 정지 시각도 다르게 — base = yunmo 기준.
 * - ms: 워킹 1회 총 시간 (ms 클수록 천천히)
 * - distance: 슬라이드 거리 (px 클수록 보폭 큼)
 * - bobAmp: 상하 보빙 진폭 (px 클수록 통통 튐)
 * 명시되지 않은 prefix는 BASE_WALK 사용. PM이 풀플레이로 미세 조정.
 */
type WalkProfile = { ms: number; distance: number; bobAmp: number };
const BASE_WALK: WalkProfile = { ms: 1500, distance: 220, bobAmp: 6 };
const PREFIX_WALK_PROFILE: Record<string, WalkProfile> = {
  yunmo: { ms: 1500, distance: 220, bobAmp: 6 }, // 본과1 평균 (base)
  serin: { ms: 1750, distance: 235, bobAmp: 5 }, // 차세린 — 차분, 보폭 큼
  hajeong: { ms: 1250, distance: 180, bobAmp: 8 }, // 윤하정 — 톡톡 빠르게
  seol: { ms: 1900, distance: 250, bobAmp: 4 }, // 한설 — 천천히, 보폭 큼, 흔들림 적음
  seoyoon: { ms: 1650, distance: 225, bobAmp: 5 }, // 나서윤 — 침착
  yuna: { ms: 1150, distance: 170, bobAmp: 9 }, // 장윤영 — 활발 통통
  gyumin: { ms: 1400, distance: 270, bobAmp: 5 }, // 김규민 — 큰 키 보폭 큼
  gyeongmin: { ms: 1500, distance: 220, bobAmp: 6 }, // 표경민 — 평균
  nathan: { ms: 1500, distance: 220, bobAmp: 6 }, // 조나단 — 평균
  junhyuk: { ms: 1500, distance: 220, bobAmp: 6 }, // 오준혁 — 평균
};

const PERV_SWAP_INTERVAL_MS = 500;

function profileFor(id: string, sprite: string): WalkProfile {
  const file = resolveSpriteName(id, sprite);
  const prefix = file?.split('_')[0] ?? '';
  return PREFIX_WALK_PROFILE[prefix] ?? BASE_WALK;
}

type SpriteEntry = { sprite: string; position: 'left' | 'center' | 'right' };

function spriteToPrefix(id: string, sprite: string): string | null {
  const file = resolveSpriteName(id, sprite);
  return file?.split('_')[0] ?? null;
}

function speakerToPrefix(speaker: string | undefined | null): string | null {
  if (!speaker) return null;
  const file = resolveSpriteName(speaker, 'default');
  return file?.split('_')[0] ?? null;
}

function pickEnterDir(
  position: string,
  prevSide: 'left' | 'right' | null,
): 'left' | 'right' {
  if (position === 'left' || position === 'left_back') return 'left';
  if (position === 'right' || position === 'right_back') return 'right';
  return prevSide === 'left' ? 'right' : 'left';
}

export function CharacterLayer() {
  const characters = useGameStore((s) => s.characters);
  const bgImage = useGameStore((s) => s.bg.image);
  const cmd = useGameStore((s) => s.currentCommand);
  const runtimeMode = useGameStore((s) => s.runtimeMode);
  const pendingEnding = useGameStore((s) => s.pendingEnding);

  // 변태망상(perv_start) subtype 동안 yunmo_perv ↔ yunmo_perv_1 0.5초 toggle
  const isPervActive =
    cmd?.type === 'MONOLOGUE' && cmd.subtype === 'perv_start';
  const [pervSwap, setPervSwap] = useState(false);
  useEffect(() => {
    if (!isPervActive) {
      setPervSwap(false);
      return undefined;
    }
    const t = setInterval(() => setPervSwap((v) => !v), PERV_SWAP_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isPervActive]);

  // 워킹·zoom·deferred unmount 상태 (ANIMATION-SPEC §3·§3.5·§4·§4.5)
  const [displayChars, setDisplayChars] = useState<Record<string, SpriteEntry>>(
    {},
  );
  const [walkPhase, setWalkPhase] = useState<
    Record<string, 'enter' | 'exit'>
  >({});
  const [enterDir, setEnterDir] = useState<Record<string, 'left' | 'right'>>(
    {},
  );
  const [zoomKey, setZoomKey] = useState<Record<string, number>>({});

  const prevCharsRef = useRef<Record<string, string>>({});
  const prevBgRef = useRef<string | null>(null);
  const prevSpeakerRef = useRef<string | null>(null);
  const prevSlotSideRef = useRef<'left' | 'right' | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // 특수 모드 가드 — perv_start·ending·kakao·cg 동안 워킹·zoom 미적용 (즉시 동기화)
  const animationsBlocked =
    Boolean(pendingEnding) ||
    runtimeMode === 'kakao' ||
    runtimeMode === 'cg' ||
    isPervActive;

  // (1) characters · bg.image diff → 등·퇴장 워킹 + 표정 zoom + deferred unmount
  useEffect(() => {
    const prevChars = prevCharsRef.current;
    const prevBg = prevBgRef.current;
    const bgChanged = bgImage !== prevBg;

    const newSprites: Record<string, string> = {};
    for (const [id, c] of Object.entries(characters)) {
      newSprites[id] = c.sprite;
    }

    // BG 변경: 이전 캐릭터들은 BG fade와 함께 사라짐(워킹 퇴장 미적용),
    // 새 BG에 등장한 캐릭터는 워킹 등장 적용 (가드 통과 시).
    if (bgChanged) {
      for (const t of timeoutsRef.current.values()) clearTimeout(t);
      timeoutsRef.current.clear();
      prevSlotSideRef.current = null;
      prevBgRef.current = bgImage;
      prevCharsRef.current = newSprites;

      const newIds = Object.keys(characters);
      if (animationsBlocked || newIds.length === 0) {
        setDisplayChars(characters);
        setWalkPhase({});
        setEnterDir({});
        return;
      }

      const additions: Record<string, SpriteEntry> = {};
      const dirAdditions: Record<string, 'left' | 'right'> = {};
      const phaseAdditions: Record<string, 'enter'> = {};
      let lastSide: 'left' | 'right' | null = null;
      for (const id of newIds) {
        additions[id] = characters[id];
        const dir = pickEnterDir(characters[id].position, lastSide);
        dirAdditions[id] = dir;
        phaseAdditions[id] = 'enter';
        lastSide = dir;
      }
      prevSlotSideRef.current = lastSide;
      setDisplayChars(additions);
      setEnterDir(dirAdditions);
      setWalkPhase(phaseAdditions);

      for (const id of newIds) {
        const ms = profileFor(id, characters[id].sprite).ms;
        const t = setTimeout(() => {
          setWalkPhase((prev) => {
            if (!(id in prev)) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
          timeoutsRef.current.delete(id);
        }, ms);
        timeoutsRef.current.set(id, t);
      }
      return;
    }

    const enteredIds: string[] = [];
    const expressionChangedIds: string[] = [];
    for (const [id, c] of Object.entries(characters)) {
      if (!(id in prevChars)) enteredIds.push(id);
      else if (prevChars[id] !== c.sprite) expressionChangedIds.push(id);
    }
    const exitedIds = Object.keys(prevChars).filter(
      (id) => !(id in characters),
    );

    if (
      enteredIds.length === 0 &&
      expressionChangedIds.length === 0 &&
      exitedIds.length === 0
    ) {
      prevCharsRef.current = newSprites;
      prevBgRef.current = bgImage;
      return;
    }

    // 가드: 특수 모드면 워킹·zoom 생략하되 displayChars는 동기화
    if (animationsBlocked) {
      for (const t of timeoutsRef.current.values()) clearTimeout(t);
      timeoutsRef.current.clear();
      setDisplayChars(characters);
      setWalkPhase({});
      setEnterDir({});
      prevCharsRef.current = newSprites;
      prevBgRef.current = bgImage;
      return;
    }

    // 등장: displayChars 즉시 추가 + walkPhase enter + 700ms 후 clear
    if (enteredIds.length > 0) {
      const additions: Record<string, SpriteEntry> = {};
      const dirAdditions: Record<string, 'left' | 'right'> = {};
      const phaseAdditions: Record<string, 'enter'> = {};
      let lastSide = prevSlotSideRef.current;
      for (const id of enteredIds) {
        additions[id] = characters[id];
        const dir = pickEnterDir(characters[id].position, lastSide);
        dirAdditions[id] = dir;
        phaseAdditions[id] = 'enter';
        lastSide = dir;
      }
      prevSlotSideRef.current = lastSide;
      setDisplayChars((prev) => ({ ...prev, ...additions }));
      setEnterDir((prev) => ({ ...prev, ...dirAdditions }));
      setWalkPhase((prev) => ({ ...prev, ...phaseAdditions }));

      for (const id of enteredIds) {
        const existing = timeoutsRef.current.get(id);
        if (existing) clearTimeout(existing);
        const ms = profileFor(id, characters[id].sprite).ms;
        const t = setTimeout(() => {
          setWalkPhase((prev) => {
            if (!(id in prev)) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
          timeoutsRef.current.delete(id);
        }, ms);
        timeoutsRef.current.set(id, t);
      }
    }

    // 표정 변경 zoom: sprite 갱신 + zoomKey++
    if (expressionChangedIds.length > 0) {
      setDisplayChars((prev) => {
        const next = { ...prev };
        for (const id of expressionChangedIds) {
          next[id] = characters[id];
        }
        return next;
      });
      setZoomKey((prev) => {
        const next = { ...prev };
        for (const id of expressionChangedIds) {
          next[id] = (next[id] ?? 0) + 1;
        }
        return next;
      });
    }

    // 퇴장: walkPhase exit + 700ms 후 displayChars/walkPhase/enterDir에서 제거
    if (exitedIds.length > 0) {
      setWalkPhase((prev) => {
        const next = { ...prev };
        for (const id of exitedIds) next[id] = 'exit';
        return next;
      });
      for (const id of exitedIds) {
        const existing = timeoutsRef.current.get(id);
        if (existing) clearTimeout(existing);
        const exitSprite = prevChars[id] ?? 'default';
        const ms = profileFor(id, exitSprite).ms;
        const t = setTimeout(() => {
          setDisplayChars((prev) => {
            if (!(id in prev)) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
          setWalkPhase((prev) => {
            if (!(id in prev)) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
          setEnterDir((prev) => {
            if (!(id in prev)) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
          timeoutsRef.current.delete(id);
        }, ms);
        timeoutsRef.current.set(id, t);
      }
    }

    prevCharsRef.current = newSprites;
    prevBgRef.current = bgImage;
  }, [characters, bgImage, animationsBlocked]);

  // (2) currentCommand 변경 → 화자 변경 시 화면 내 매핑 캐릭터에 zoom
  useEffect(() => {
    if (animationsBlocked) return;
    if (!cmd) return;
    if (cmd.type !== 'DIALOGUE' && cmd.type !== 'MONOLOGUE') return;
    const speakerKey =
      cmd.type === 'DIALOGUE' ? cmd.speakerId || cmd.speaker : cmd.speaker;
    const prefix = speakerToPrefix(speakerKey);
    if (!prefix) {
      prevSpeakerRef.current = null;
      return;
    }
    if (prevSpeakerRef.current === prefix) return;
    prevSpeakerRef.current = prefix;
    for (const [id, c] of Object.entries(displayChars)) {
      if (spriteToPrefix(id, c.sprite) === prefix) {
        setZoomKey((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
        break;
      }
    }
  }, [cmd, animationsBlocked, displayChars]);

  // unmount 시 모든 deferred timeout 정리
  useEffect(() => {
    return () => {
      for (const t of timeoutsRef.current.values()) clearTimeout(t);
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 'var(--z-character)' }}
    >
      {Object.entries(displayChars).map(([id, c]) => {
        // 변태망상 활성 + 윤모면 perv 스프라이트 강제 swap
        const isYunmo =
          resolveSpriteName(id, 'default')?.startsWith('yunmo_') ?? false;
        const effectiveSprite =
          isPervActive && isYunmo ? (pervSwap ? 'perv_1' : 'perv') : c.sprite;
        const fileName = resolveSpriteName(id, effectiveSprite);
        if (!fileName) return null;
        // 6슬롯 외 비표준 위치값(legacy 보호)은 center로 폴백
        const position: Position = VALID_POSITIONS.has(c.position as Position)
          ? (c.position as Position)
          : 'center';
        // 캐릭터별 표시 보정 (PM 결정 2026-05-08) — 자산 비율 차이로 시각 균형이 안 맞을 때 maxHeight scale + 좌우 반전 + 절대 maxH/maxW 적용.
        const prefix = fileName.split('_')[0];
        const scale = PREFIX_SCALE[prefix] ?? 1.0;
        const flip = PREFIX_FLIP.has(prefix);
        const baseMaxH = POSITION_MAX_H[position];
        const fixedMaxH = PREFIX_FIXED_MAX_H[prefix];
        const maxH =
          fixedMaxH ?? (scale === 1.0 ? baseMaxH : `calc(${baseMaxH} * ${scale})`);
        const maxW = PREFIX_FIXED_MAX_W[prefix];
        const imgTransform = flip
          ? 'translateX(-50%) scaleX(-1)'
          : 'translateX(-50%)';

        const phase = walkPhase[id];
        const dir = enterDir[id] ?? 'left';
        const slideClass =
          phase === 'enter'
            ? `char-anim-enter-${dir}`
            : phase === 'exit'
              ? `char-anim-exit-${dir}`
              : '';
        const bobClass = phase ? 'char-anim-bob' : '';
        const zk = zoomKey[id];
        const zoomClass = zk !== undefined ? 'char-anim-zoom' : '';

        // 캐릭터별 워킹 보정값 — wrapper의 inline custom property로 박아
        // .char-anim-* 클래스의 keyframe `var(--char-walk-*)`이 캐릭별 다른 값으로 해상.
        const walkProfile = PREFIX_WALK_PROFILE[prefix] ?? BASE_WALK;
        const walkVars = {
          '--char-walk-ms': `${walkProfile.ms}ms`,
          '--char-walk-distance': `${walkProfile.distance}px`,
          '--char-bob-amp': `${walkProfile.bobAmp}px`,
        } as CSSProperties;

        return (
          <div
            key={id}
            className={`absolute inset-0 pointer-events-none ${slideClass}`}
            style={{
              zIndex: POSITION_Z[position],
              transformOrigin: 'bottom center',
              willChange: 'transform, opacity',
              ...walkVars,
            }}
          >
            <div
              key={`zoom-${zk ?? 0}`}
              className={`absolute inset-0 pointer-events-none ${zoomClass}`}
              style={{
                transformOrigin: 'bottom center',
                willChange: 'transform',
              }}
            >
              <div
                className={`absolute inset-0 pointer-events-none ${bobClass}`}
                style={{
                  transformOrigin: 'bottom center',
                  willChange: 'transform',
                }}
              >
                <img
                  src={`/img/sprites/${fileName}.webp`}
                  alt={id}
                  loading="eager"
                  decoding="async"
                  className="absolute bottom-0 transition-opacity duration-300"
                  style={{
                    left: PREFIX_FIXED_X[prefix] ?? POSITION_X[position],
                    maxHeight: maxH,
                    maxWidth: maxW,
                    transform: imgTransform,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
