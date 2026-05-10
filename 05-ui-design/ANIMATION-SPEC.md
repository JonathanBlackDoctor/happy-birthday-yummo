---
module: ANIMATION-SPEC
hierarchy: 4
depends-on:
  - 05-ui-design/UI-SPEC.md
outputs:
  - 모든 애니메이션의 정확한 스펙 (트리거, duration, easing)
status: review
---

# 05-ui-design/ANIMATION-SPEC.md

## 1. 글로벌 룰

- 기본 easing: `ease` (`cubic-bezier(0.25, 0.1, 0.25, 1)`)
- duration 토큰:
  - `--transition-fast`: 150ms
  - `--transition-normal`: 300ms
  - `--transition-slow`: 600ms
- `prefers-reduced-motion: reduce` 시 모든 애니메이션을 0ms로 단축 (즉시 전환)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1.1 캐릭터 워킹·zoom 예외 (PM 결정 2026-05-09)

§3·§3.5·§4·§4.5의 캐릭터 워킹/bob/zoom은 reduce-motion 환경에서도 시각 유지. 사유: PM이 본인 환경에서 직접 시각 확인 + 미연시의 핵심 시각 연출이라 단축 시 "깜빡임"으로만 보이는 회귀 발생.

구현: inline `style.animation` 대신 클래스 selector(`.char-anim-enter-left/right`, `.char-anim-exit-left/right`, `.char-anim-bob`, `.char-anim-zoom`)로 적용. `prefers-reduced-motion: reduce` 미디어 쿼리 안에서 같은 클래스에 `animation-duration: var(--char-walk-ms|--char-zoom-ms) !important`로 specificity 동률에서 override (글로벌 `*` selector보다 클래스 selector가 더 specific).

reduce-motion 사용자가 워킹·zoom 시각을 원치 않으면 향후 `var(--char-walk-ms)`를 0ms로 단축하는 follow-up 정책 가능. 현 시점은 기본 700ms / 450ms 그대로.

## 2. 텍스트 타이핑

- 글자당 등장:
  - `slow`: 60ms
  - `normal`: 30ms
  - `fast`: 15ms
  - `instant`: 0ms (즉시 전체 표시)
- 사용자 클릭 시 즉시 전체 표시 (스킵)
- 다음 클릭으로 다음 명령 진행

## 3. 캐릭터 등장 (워킹 진입, 2026-05-09 갱신)

기본 트랜지션 = "워킹 등장": 화면 외부에서 슬롯 위치까지 슬라이드 + 미세 상하 보빙으로 걷기 사이클을 정적 자산으로 시뮬레이션.

- **거리·시간 (base = yunmo)**: ±220px / 1500ms / `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out 변형)
- **상하 보빙 (base)**: translateY ±6px, 1500ms 동안 사인파 3.5회 (`@keyframes characterBob`)
- **캐릭터별 보정** (`PREFIX_WALK_PROFILE`, 2026-05-09 PM 결정 라운드 #3): 사람마다 보폭·속도·흔들림이 달라 정지 시각도 다르게.
  - serin (차세린, 차분): 235px / 1750ms / 5px
  - hajeong (윤하정, 톡톡 빠르게): 180px / 1250ms / 8px
  - seol (한설, 천천히 침착): 250px / 1900ms / 4px
  - seoyoon (나서윤, 침착): 225px / 1650ms / 5px
  - yuna (장윤영, 활발 통통): 170px / 1150ms / 9px
  - gyumin (김규민, 큰 키): 270px / 1400ms / 5px
  - gyeongmin / nathan / junhyuk: base 동일 (220 / 1500 / 6)
  - 명시 안 된 prefix는 BASE_WALK 사용
  - wrapper outer-slide의 inline custom property로 적용 → keyframe `var(--char-walk-*)`이 캐릭별 다른 값으로 해상
- **transform-origin**: `bottom center` — 발 고정 상태로 변환
- **opacity**: 0→1 동시에 페이드 인
- **진입 방향**:
  - `left` / `left_back` → 화면 왼쪽 외부에서
  - `right` / `right_back` → 화면 오른쪽 외부에서
  - `center` / `center_back` → 직전 등장 캐릭터의 반대편, 직전 없으면 왼쪽
- 위치별 X 좌표 (게임 캔버스 % 기준, CharacterLayer 6슬롯 모델):
  - left: 25% / center: 50% / right: 75%
  - left_back: 15% / center_back: 50% / right_back: 85%
- 모바일은 자동으로 스케일 조정

**Fallback** (워킹 미적용):
- BG 변경으로 캐릭터가 자동 클리어될 때 → 워킹 생략, BG fade 600ms와 함께 사라짐
- 특수 모드 가드(§3.5) 활성 시 → 워킹·zoom 모두 즉시 동기화로 폴백

## 3.5. 캐릭터 퇴장 (워킹 거울, 2026-05-09 신설)

`CHARACTER_HIDE` 명령:
- 들어왔던 방향으로 거울 슬라이드 + 보빙 동일, 1500ms `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- transform-origin: bottom center, opacity 1→0
- displayChars deferred unmount (700ms 후 DOM 제거)

BG 변경 자동 클리어:
- 워킹 미적용. opacity fade 300ms (기존 Tailwind `transition-opacity duration-300` 유지) + BG fade 600ms와 평행 종료.

**특수 모드 가드** (워킹·zoom 모두 차단, displayChars만 동기화):
- `pendingEnding != null` (거절 엔딩 등 정밀 타이밍 시퀀스 보존)
- `runtimeMode === 'kakao' | 'cg'` (모달 뒤 노이즈 방지 + CPU 절약)
- `MONOLOGUE.subtype === 'perv_start'` (0.5초 sprite swap이 zoom을 폭발시키는 회귀 차단)

## 4. 캐릭터 표정 변경 (zoom 강조, 2026-05-09 갱신)

같은 슬롯에서 sprite key가 바뀔 때:
- **크로스페이드**: 100ms (Tailwind `transition-opacity duration-300` 유지로 src swap 자연스러움)
- **zoom-in→zoom-out**: scale 1.0→1.04→1.0, 450ms `ease-in-out` (`@keyframes characterZoom`)
- transform-origin: bottom center (발 고정)
- 가드: §3.5와 동일

## 4.5. 화자 변경 zoom (2026-05-09 신설)

DIALOGUE 또는 MONOLOGUE 명령에서 화자가 직전과 다를 때, 화면에 매핑 가능한 캐릭터에 §4와 동일한 zoom keyframe 1회 트리거.

- **트리거 조건**:
  - `cmd.type` ∈ {DIALOGUE, MONOLOGUE}
  - 화자 매핑: `cmd.speakerId` 우선, 없으면 `cmd.speaker`(한글명) → `spriteResolver.PREFIX_BY_NAME` 역매핑
  - 매핑된 prefix가 displayChars 안 어느 캐릭터의 prefix와 일치
  - 직전 화자 prefix와 다름 (같은 캐릭터 연속 대사는 미트리거)
- **모놀로그 분기**: 화자(주로 윤모)가 화면에 등장 중이면 적용. 화면에 없으면 매핑 실패 → 미트리거.
- **가드**: §3.5와 동일 (perv_start·ending·kakao·cg 차단).

## 5. 배경 트랜지션

- `fade`: 600ms ease
- `cut`: 0ms
- 챕터 전환 시 white flash 200ms 추가

## 6. CG 표시

- 등장: 풀스크린 페이드 인 500ms
- 표시 중: 스킵 가능 (클릭 시 다음 텍스트로)
- 닫힘: 페이드 아웃 400ms

## 7. 카톡 모달

- 모달 등장: 화면 우측에서 슬라이드 인, 400ms ease-out
- 메시지 등장:
  - 새 메시지 버블: 아래에서 위로 슬라이드(20px) + 페이드 인, 300ms ease-out
  - 첫 메시지부터 마지막까지 0.5~1.5초 간격 (메시지 텍스트 길이에 비례)
- 타이핑 인디케이터: "..." 점 3개가 0.4초마다 깜빡 (점 1→점2→점3 순차 페이드)
- 모달 닫힘: 우측으로 슬라이드 아웃 + 페이드, 300ms

## 8. ReplyTimer (H4 거절 핵심)

- ProgressRing: 60도/초 시계방향 채워짐 (남은 시간 비례)
- 마지막 5초:
  - 링 컬러 빨갛게 변환 (`--color-danger`)
  - 0.5초마다 살짝 펄스 (scale 1→1.05→1)
- 만료:
  - 링 fade out 200ms
  - 화면 하단 "답장 시기를 놓쳤습니다" 토스트 800ms 표시
  - SFX `sfx_timer_out.mp3`

## 9. 변태 망상 시퀀스 효과

| subtype | 효과 |
|---|---|
| `perv_start` | 텍스트박스 hue-rotate 살짝 (5deg, 핑크빛), 0.5초 wobble |
| `self_aware` | 화면 white flash 100ms (opacity 0.3 max), SFX `sfx_realize` |
| `recover` | 정상 톤 복귀, 0.3초 fade |

## 10. 메뉴 / 화면 전환

- 메뉴 항목 호버: 좌측 ▶ 표시 슬라이드 인 + 텍스트 색 살짝 강조, 150ms
- 화면 전환 (메뉴 → 게임 등): 500ms 페이드
- 모달 등장: 백그라운드 dim 300ms + 모달 슬라이드 in 300ms

## 11. 갤러리

- 그리드 항목 호버: scale 1.03, 200ms
- 풀스크린 보기: 그리드 → 풀스크린 모달 페이드 400ms
- 다음/이전 CG: 좌우 슬라이드 300ms

## 12. 엔딩 시퀀스 (특수)

### 거절 엔딩 (H4) 정확한 타이밍

```
[페이드 인 검은 화면] 0~500ms
[카톡 모달 등장] 500~900ms
[BGM 페이드 인 sad] 500~2500ms
[메시지 1번 등장] 1500ms ("답장이 너무 늦어서 미안해ㅠㅠ")
[메시지 2번 등장] 2400ms ("그날 만나서 얘기하고 시간 잘 보냈는데")
[메시지 3번 등장] 3400ms ("더 진행하기엔 무리가 있을거 같아..")
[메시지 4번 등장] 4500ms ("좋은 인연 만나길 바랄게 🥺🥺")
[2초 정지] 4500~6500ms
[화면 페이드 아웃 검은색] 6500~7500ms
[엔딩 타이틀 페이드 인 "BAD ENDING — 답장이 늦어서"] 7500~8500ms
[2초 표시] 8500~10500ms
[영상 video_reject_seoyoon.mp4 재생] 10500~17500ms (7초)
[엔딩 크레딧 텍스트] 17500ms~
[갤러리 해금 토스트] 엔딩 크레딧 시작 후 1초
```

### 트루엔딩 (5종 공통 구조)

```
[CG 페이드 인] 0~500ms
[BGM 클라이맥스 페이드 인] 0~2000ms
[모놀로그/대사 진행] 변동
[영상 페이드 인] 영상 시작
[영상 재생] 7초
[엔딩 타이틀 등장] 영상 끝 후 500ms
[크레딧 롤] ~30초
```

## 13. AffectionToast (호감도 온도계, 2026-05-08 갱신)

> 구현: `src/ui/affection/AffectionToastStack.tsx` + `AffectionThermometer.tsx` + `spring.ts`.
> framer-motion 부재 — RAF 기반. spring solver는 자체 구현.

### 13.1 풍성 카드 타임라인 (총 2.5초)

| 구간 | t (ms) | 효과 |
|---|---|---|
| 진입 페이드인 + 슬라이드 | 0 → 220 | opacity 0→1, translateX 12→0 |
| 채움(spring) | 0 → 800 | fillHeight prev→new, ~6% 오버슈팅 후 안착 |
| 표면 sin 흔들림 | 0 → 800 | 표면 곡선 control y에 ±2px sin (주기 ~120ms) |
| 도쿠먼트 라이트 흐름 | 0 → 800 | 관 안에서 광선이 0.6초 주기로 위→아래 흐름 |
| 안착 후 미세 물결 | 800 → 1200 | 1주기 감쇠 사인, 진폭 1.5px → 0 |
| 완료 flash | 안착 → +140 | 외곽 화이트 halo 100% → 0% |
| 완료 spark | 안착 → +360 | yTop 주변 6개 입자 사방으로 산란 + 페이드 |
| bulb 심장 펄스 | 0 → 끝 | 1.6초 주기 외곽 ring radius·opacity 호흡 (전 구간) |
| 유지 | 1200 → 2100 | 정적 (펄스만 유지) |
| 페이드아웃 | 2100 → 2500 | opacity 1→0, translateX 0→-8 |

### 13.2 spring 파라미터
- `stiffness: 220` / `damping: 14` / `mass: 1` / `velocity: 0` (초기)
- 종료 조건: `|value-to| < 0.05 && |velocity| < 0.05` 가 120ms 연속 충족.
- 5ms substep 적분으로 발산 방지.

### 13.3 음수(-) 처리
- 동일 spring 거꾸로 적용. 색상은 핑크 유지.
- 표면 흔들림 진폭·주기는 동일.
- delta 텍스트 색만 `--toast-delta-down`.

### 13.4 미니 도트 타임라인 (총 0.6초)
- 페이드인 100ms (linear) → 유지 400ms → 페이드아웃 100ms (linear).
- 채움/물결 없음.

### 13.5 reduced-motion 분기
- `prefers-reduced-motion: reduce` 시 spring 생략 → 200ms `easeOutCubic` 트윈.
- 표면 흔들림 0회, 미세 물결 0회.
- 페이드는 50ms로 단축.

### 13.6 묶음 타이밍 (Stack 클러스터)
- 첫 미소비 이벤트 ts 기준 ±50ms 윈도우로 한 묶음 결정.
- 같은 묶음의 모든 카드는 거의 동시(같은 RAF 프레임)에 마운트되어 함께 등장.
- 카드별 unmount는 풍성 2580ms / 미니 680ms (총 표시 + 80ms 안전 여유) 후.

## 14. 사용자 검증

- [ ] 글자별 타이핑 속도 OK?
- [ ] 거절 엔딩 타이밍 (총 17.5초) 적정?
- [ ] reduced-motion 접근성 처리 OK?
- [ ] AffectionToast spring 오버슈팅 자연스러운지?
- [ ] 음수 변동 역방향 채움 OK?
- [ ] §3 캐릭터 워킹 등장 자연스러움 (4명+ 동시 등장 씬 포함)
- [ ] §3.5 워킹 퇴장 거울 방향 자연스러움 + BG 변경 시 fade-only 폴백 OK
- [ ] §4 표정 변경 zoom + 크로스페이드 합성 산만하지 않음
- [ ] §4.5 화자 zoom 빈도 적정 (같은 캐릭터 연속 대사 미트리거 확인)
- [ ] 특수 모드(perv_start / ending / kakao / cg) 가드 정상 — 거절 엔딩 17.5초 timeline 보존
