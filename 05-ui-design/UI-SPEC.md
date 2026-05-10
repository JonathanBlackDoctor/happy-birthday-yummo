---
module: UI-SPEC
hierarchy: 4
depends-on:
  - 00-master/MASTER-PLAN.md
  - 06-engine/ARCHITECTURE.md
outputs:
  - 모든 UI 화면 명세 (메뉴, 게임, 카톡, 갤러리)
  - 텍스트박스 정확한 치수
  - 모바일 반응형 룰
status: review
---

# 05-ui-design/UI-SPEC.md

## 1. 디자인 토큰 (CSS 변수)

```css
:root {
  /* Color */
  --color-bg: #FFE4EC;             /* 메인 파우더 핑크 */
  --color-accent: #FFB8D1;         /* 핑크 액센트 */
  --color-accent-hover: #FFA0BD;
  --color-text: #3A2E3F;           /* 메인 텍스트 */
  --color-text-light: #6B5B70;
  --color-mint: #A8DADC;           /* 민트 강조 */
  --color-mint-dark: #7CC4C7;
  
  /* Textbox */
  --color-textbox-bg: rgba(58, 46, 63, 0.85);
  --color-textbox-text: #FFF8FA;
  --color-textbox-name: #FFE4EC;
  --color-textbox-name-bg: var(--color-mint);
  
  /* Layout */
  --textbox-bottom: 40px;
  --textbox-width: 86%;
  --textbox-height: 28%;
  --textbox-padding: 28px 40px;
  --textbox-radius: 16px;
  
  /* Typography */
  --font-main: 'Pretendard', -apple-system, sans-serif;
  --font-size-text: 22px;
  --font-size-name: 24px;
  --font-size-monologue: 21px;
  --line-height: 1.6;
  --letter-spacing: -0.2px;
  
  /* UI Controls */
  --btn-padding: 10px 20px;
  --btn-radius: 8px;
  --btn-bg: rgba(255, 184, 209, 0.9);
  --btn-bg-hover: rgba(255, 160, 189, 1);
  --btn-text: #3A2E3F;
  
  /* Animation */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 600ms ease;
  
  /* Z-index 레이어 */
  --z-bg: 0;
  --z-character: 10;
  --z-cg: 50;
  --z-textbox: 100;
  --z-controls: 110;
  --z-menu: 200;
  --z-modal: 300;
  --z-toast: 400;
}

@media (max-width: 768px) {
  :root {
    --textbox-bottom: 20px;
    --textbox-width: 92%;
    --textbox-height: 38%;
    --textbox-padding: 18px 24px;
    --font-size-text: 18px;
    --font-size-name: 20px;
    --font-size-monologue: 17px;
  }
}
```

## 2. 화면 구성 (메인 게임 화면)

```
┌────────────────────────────────────────────────────┐
│ [메뉴]                              [Auto Skip Save]│ <- 우상단/우하단 미니
│                                                    │
│                                                    │
│         [BG (1920×1080)]                          │
│                                                    │
│       [Character Layer]                           │
│                                                    │
│  ┌────┐                                           │
│  │이름│                                           │
│  ├──────────────────────────────────────────────┐│
│  │ 텍스트가 한 글자씩 타이핑되어 나옵니다...   ▼││
│  └──────────────────────────────────────────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
```

### 2.1 텍스트박스 (확정 사양)

- 위치: 화면 하단 고정
- 너비: `var(--textbox-width)` (PC 86%, 모바일 92%)
- 높이: `var(--textbox-height)` (PC 28%, 모바일 38%)
- 좌우 중앙 정렬
- 하단 마진: `var(--textbox-bottom)` (PC 40px, 모바일 20px)
- 배경: `var(--color-textbox-bg)` (반투명 다크)
- 모서리: `var(--textbox-radius)` (16px)
- 텍스트 컬러: `var(--color-textbox-text)`
- 폰트: Pretendard, `var(--font-size-text)`, line-height 1.6

### 2.2 화자명 박스

- 텍스트박스 좌측 상단에서 살짝 튀어나옴 (top: -16px)
- 패딩: 6px 18px
- 배경: `var(--color-textbox-name-bg)` (민트)
- 텍스트: `var(--color-text)` (다크)
- 폰트: `var(--font-size-name)`, weight 600

### 2.3 모놀로그 스타일

- 화자명 박스 X
- 텍스트박스 자체는 동일하되, 텍스트 색이 약간 흐림 (#FFE4EC)
- 폰트: italic (모놀로그 표시)
- 좌측 상단에 "─ 구윤모의 마음 ─" 작은 라벨 (선택)

### 2.4 변태 망상 시 추가 효과

- `subtype: 'perv_start'`: 텍스트박스 배경 살짝 흔들림 (subtle wobble), 텍스트 색 핑크빛
- `subtype: 'self_aware'`: 화면 한 번 깜빡 (white flash 100ms), SFX `sfx_realize.mp3`
- `subtype: 'recover'`: 정상 모놀로그 톤으로 복귀

## 3. 미니 컨트롤 (우하단)

PC: 우하단 가로 일렬 5개 버튼
- Auto / Skip / Save / Load / Log / Settings(⚙)

모바일: 햄버거 메뉴(우상단) 토글 → 위 버튼 세로 일렬

각 버튼: 32×32px (PC), 28×28px (모바일), 둥근 사각형, 반투명 핑크 배경

## 4. 메인 메뉴 (타이틀 화면)

```
┌────────────────────────────────────────┐
│                                         │
│       [타이틀 로고 또는 텍스트]          │
│       구연시: 본과 1학년의 봄             │
│                                         │
│                                         │
│         ▶ 새 게임                        │
│           이어하기                       │
│           갤러리                         │
│           환경설정                       │
│           종료                           │
│                                         │
│                            v0.1.0       │
└────────────────────────────────────────┘
```

- 배경: 캠퍼스 벚꽃 야경 (`bg_campus_night_blossom`)
- 메뉴 우측 정렬 (또는 중앙)
- 파스텔 핑크 액센트 + 화이트 텍스트
- 호버: 텍스트 좌측에 ▶ 추가, 배경 살짝 어두워짐
- 처음 진입 시 오프닝 무비 자동 재생 (1회 후 스킵 가능)

## 5. 모드 선택 화면

새 게임 누르면:

```
┌────────────────────────────────────────┐
│       플레이 모드 선택                   │
│                                         │
│   ┌─────────────┐    ┌─────────────┐   │
│   │             │    │             │   │
│   │ 구윤모으로   │    │ 구윤모와    │   │
│   │   플레이     │    │   플레이    │   │
│   │             │    │             │   │
│   │  (4시간)     │    │   (20분)   │   │
│   └─────────────┘    └─────────────┘   │
│                                         │
└────────────────────────────────────────┘
```

서브 모드 선택 시 → 이름 입력 화면 → 게임 시작.

## 6. 카톡 메신저 모달

풀스크린 모달. 모바일에서 자연스러운 채팅 UI.

```
┌────────────────────────────────────────┐
│ ←  차세린                          ⋮    │ <- 헤더
├────────────────────────────────────────┤
│                                         │
│  [차세린] 학생, 어제 잘 들어갔어요?     │
│   ─────  오후 10:23                     │
│                                         │
│                       오후 10:25 ─────  │
│                          네 잘 들어왔어요│
│                                              ↑
│  [차세린] 다음 견학도 화이팅 :)        │  내 메시지(우측)
│   ─────  오후 10:30                     │
│                                         │
│  ⏳ 답장 시간 15초                      │ <- ReplyTimer (H4 한정, 확정값)
│                                         │
├────────────────────────────────────────┤
│  [선택지 1]                             │
│  [선택지 2]                             │
└────────────────────────────────────────┘
```

### 6.1 디자인 룰

- 카카오톡과 다른 색상 (라이선스 회피): 노란 배경 X → **파우더 핑크 배경**
- 메시지 버블: 본인은 우측 민트(`#A8DADC`), 상대는 좌측 화이트(`#FFFFFF`)
- 프로필 아이콘: 캐릭터 default 스프라이트의 얼굴만 추출한 원형 (사용자 후처리 필요)
- 등장 애니메이션: 메시지가 아래에서 위로 슬라이드 + 페이드 (300ms)
- 타이핑 인디케이터: "..." 점 3개 페이드 반복

### 6.2 ReplyTimer (H4 거절 트리거)

- 타이머 활성 시 화면 하단에 progress ring + 카운트다운
- 만료 시:
  - SFX `sfx_timer_out.mp3`
  - `late_reply_count++`
  - `H4 -= 3` (types.ts/STATE-SCHEMA 정합 — 옛 `affection_H4` 명명은 2026-04-30 갱신)
  - 카톡에 "(답장하지 못함)" 회색 텍스트 표시
  - 다음 씬으로 자동 진행

## 7. 갤러리 화면

탭 구조: 하이라이트 / 캐릭터 이미지 / BGM / 엔딩 (2026-05-10 PM 정정 — 'CG' 라벨 → '하이라이트' + '캐릭터 이미지' 탭 신설)

### 7.1 하이라이트 (구 CG)

- 그리드 4열 (PC), 2열 (모바일)
- 해금된 CG는 풀컬러, 미해금은 회색 자물쇠
- 클릭 → 풀스크린 보기 (워터마크 자른 `*_full.webp` 사용)
- 풀스크린에서 ←→ 키로 다음/이전 CG

### 7.1a 캐릭터 이미지 (스프라이트 갤러리, 2026-05-10 신설)

- 인물별 섹션 — 구윤모(주인공) / 차세린·윤하정·한설·나서윤·장윤영(H1~H5) / 김규민·표경민·조나단·오준혁(NPC 친구)
- 그리드 3열(모바일) / 4열(sm) / 6열(md+) — `aspect-[3/4]` 슬롯
- 미해금 슬롯: 자물쇠 + variant 라벨 (예: 'outfit casual')
- 해금 슬롯: 스프라이트 PNG + variant 라벨, 클릭 → 풀스크린 보기
- 해금 트리거: 인게임 [CHARACTER] 명령 적용 시 `metaStore.unlockSprite(cmd.sprite)` 자동 호출
- 카탈로그: `src/data/spriteCatalog.ts` 정적 매니페스트 (자산 추가 시 수동 갱신)

### 7.2 BGM 갤러리

- 리스트 (트랙명 + 사용 챕터)
- 해금된 트랙만 재생 가능
- 재생 중인 트랙은 민트 배경 강조

### 7.3 엔딩 리스트

- 16개 슬롯 그리드 (4×4 또는 적절한 레이아웃, END_SOLO_SUMMER 포함)
- 미해금: ??? 회색
- 해금: 1:1 정사각 자산 `/img/ending-square/{endingId}.webp` (사전 생성, ffmpeg) + 어두운 보라 그라데이션 + 카테고리 라벨 / 제목 / 부제 — 한눈에 시각적으로 구분 (2026-05-10 추가).
- **클릭 → EndingHistoryModal (풀스크린 모달)** — 2026-05-10 PM 결정 신기능:
  - 상단: 1:1 썸네일 + 엔딩 제목 + 부제
  - 통계: 달성 횟수 / 최고 등급 / 최고 점수
  - 표: 회차 / 날짜 / 등급 / 점수 (시간 내림차순)
  - 출처: `metaStore.endingHistory.filter(eh => eh.endingId === clickedId)`
  - ESC 또는 ✕로 닫기

자산 생성: `npm run generate:ending-square` — `ENDING_FLAVOR[id]` 기반 CG center crop / BG+sprite 중앙하단 합성. type:none(REJECT)는 런타임 그라데이션 폴백.

## 8. 환경설정

**진입점**: 미니 컨트롤의 ⚙ 톱니바퀴 버튼 (MuteToggle 옆). PauseMenu에는 두지 않음 (2026-05-10 PM 정정 — 게임 중 메뉴 거치지 않고 한 번에).
**형태**: 우하단 floating 패널 (320×640, 외부 포인터 다운 시 자동 닫힘, 어둠막 없음).

- 음량 슬라이더 2종 (BGM/SFX) — Voice는 보이스 자산 도착 후 별도 라운드에서 부활.
- 텍스트 속도 라디오 4종 (slow/normal/fast/instant)
- 자동진행 딜레이 슬라이더 (1000~5000ms, 500 step) — DialogueBox auto-advance에서 직접 사용
- **폰트 크기 슬라이더 (14~30px, 1 step, 기본 26)** — `--font-size-text/--font-size-name/--font-size-monologue` CSS var 동적 토글로 즉시 반영. tokens.css의 PC 기본 26 / 모바일 22 정합 (2026-05-10 정정 — 12~22 → 14~30).
- 텍스트박스 투명도 슬라이더 (0.5~1.0)
- "애니메이션 줄이기" 체크박스 (접근성)
- "기본값으로 리셋" 버튼 — settingsStore.reset() (확인 1단계)
- "데이터 초기화" 버튼 — confirmAndResetGame() (autosave만 삭제, 갤러리·수동 슬롯·meta·설정 보존)

**제거 (2026-05-10 PM 정정)**:
- "Voice 슬라이더" — 위와 동일 사유.
- "음소거" 체크박스 — 외부 MiniControls의 MuteToggle에 이미 있어 중복.
- "미열람 텍스트도 스킵 가능" 체크박스 — PM 결정으로 본 라운드부터 미노출.

## 9. 애니메이션 룰

- 페이드 트랜지션: 300ms ease
- 슬라이드 트랜지션: 300ms ease-out
- 텍스트 타이핑: 글자당 30ms (보통), 15ms (빠름), 60ms (느림), 0ms (즉시)
- 캐릭터 등장: fade 또는 slide-from-side
- 캐릭터 깜빡임/표정 변경: 100ms 크로스페이드
- 페이지 전환: 500ms 페이드

상세 → `ANIMATION-SPEC.md`

## 10. 모바일 가로모드 강제

- 세로 감지 시 토스트: "가로로 회전해주세요 🔄"
- 게임은 일시정지

## 11. AffectionToast — 호감도 온도계 토스트

> 구현: `src/ui/affection/AffectionToastStack.tsx` (라우터) + `AffectionThermometer.tsx`(SVG) + `AffectionMiniDot.tsx`(미니) + `spring.ts`(이징).
> 트리거: `gameStore.affectionEvents` 큐. `applyOne(FLAG_INC)`에서 prev/new 보존하여 push.

### 11.1 형태와 위치 (2026-05-08 갱신)
- **박스/이름/현재값 모두 제거** — 풍성 카드 = 온도계 + 변화량(+5)만. 미니 = ♥ + 변화량.
- **풍성 카드** (|delta| ≥ 3): SVG 온도계 78×364(1.3배) + 변화량 텍스트(28px extra-bold).
- **미니 도트** (|delta| ≤ 2): ♥ 아이콘 + 변화량(+1) 18px. 박스 없이 drop-shadow만.
- **우측 계단식 배치**: 카드 i가 `top: 24 + i*36, right: 24 + i*48` 으로 우상단에서 좌하방 비스듬히 내려감.
- z-index: `var(--z-toast)` (400) — 카톡 모달(300) 위에 자연 표시.
- `pointer-events: none` — 모든 인터랙션 통과.
- 그림자: 카드 자체 박스 없음. `filter: drop-shadow(0 8px 18px rgba(216,80,140,0.35))` 풍성 / `0 4px 10px ...` 미니로 SVG 외곽만 띄움.

### 11.2 온도계 SVG 구조 (viewBox 60×280, PC 78×364)
- 유리관 `rect x=22 y=10 w=16 h=210 rx=8` + bulb `circle cx=30 cy=240 r=22`.
- 채움 액체: clipPath(관 + bulb) 마스킹된 사각형. `--therm-fill-top → mid → bot` 핑크 그라디언트.
- 눈금 11개(0~100, 10단위). 50 위치만 길이·두께 강조.
- bulb 안: 카톡 아바타 `/img/avatar/{id}.webp` 원형 마스킹(`clipPath`, `xMidYMid slice`).
- 광택: 좌측 세로 곡선 하이라이트, bulb 좌상단 타원형 광택, 외곽 글로우(filter blur).

### 11.3 변화 강조 시각 효과 (intensity="rich")
1. **표면 하이라이트 + 두꺼운 광택 밴드** — 채움 위 path 두 줄(0.85 / 0.35 알파).
2. **bulb 외곽 핑크 심장 펄스** — 1.6초 주기로 외곽 ring radius·opacity 호흡.
3. **도쿠먼트 라이트** — 채움 진행 중 관 안에서 광선이 0.6초 주기 위→아래 흐름.
4. **완료 직후 spark 입자 + 전체 flash** — 안착 시점에 yTop 주변 6개 입자 360ms 사방 산란 + 외곽 화이트 halo 140ms.

### 11.4 다중 동시 표시
- 한 선택지 묶음(`±50ms` 윈도우)을 `|delta|` 내림차순으로 정렬.
- 최대 5개 카드 동시. 6개 이상은 drop + console.warn.
- ±3 이상은 풍성, 그 미만은 미니. 한 묶음에 풍성·미니 혼재 가능.
- 우측 계단식이라 5장 다 떠도 화면 우측 상단 영역 활용 가능.

### 11.5 호감도 변동 적용 범위 — activeHeroines 필터
- `SceneMeta.activeHeroines` (SCENE-FORMAT §1.3c) 마커가 있으면 그 H 목록만 토스트로 표시·점수 적용.
- 미박이면 5명 모두 적용(점진 마이그레이션, 기존 챕터 무영향).
- "H1 단독 씬에 H2 토스트가 뜨는 어색함" 차단 — 작가가 씬 헤더에 `active=H1` 한 줄로 통제.

### 11.6 사운드
- 묶음당 1회. `|delta|` 최대값 부호로 `sfx_affection_up` 또는 `sfx_affection_down`.
- `audioMappings.ts SFX_MAP` priority P1 등록. 자산 슬롯: `public/snd/sfx/sfx_affection_up.mp3` / `..._down.mp3`.

### 11.7 모바일 (768px 미만)
- `--therm-scale: 0.75` 자동 적용 (각 카드 `transformOrigin: top right`).
- 위치는 우측 계단식 그대로.

### 11.8 메뉴 단계 패널 (PauseMenu)
- `AffectionStatusPanel.tsx`. 5명 H1~H5 미니 온도계(`intensity="subtle"`) + 별 1~5 + 단계 라벨.
- 분류 (`stages.ts`): 0–19 ★ 낯섦 / 20–39 ★★ 호기심 / 40–59 ★★★ 호감 / 60–79 ★★★★ 따뜻함 / 80–100 ★★★★★ 운명.
- 숫자(67 등) 노출 금지. 별·라벨만.

## 12. 사용자 검증

- [ ] 텍스트박스 디자인 (28% 높이) OK?
- [ ] 카톡 UI 핑크 배경 OK?
- [ ] 갤러리 4열 그리드 OK?
- [ ] 모바일 가로모드 강제 OK? (또는 세로 지원도)
- [ ] AffectionToast 풍성 카드 ±3 이상 트리거 / 미니 도트 ±1~2 트리거 OK?
- [ ] 다중 동시 5명 변동 시 5개 세로 나열 OK?
- [ ] PauseMenu(ESC) 별 1~5 단계 표시 OK? (숫자 노출 안 됨)
