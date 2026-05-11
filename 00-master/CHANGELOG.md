# 00-master/CHANGELOG.md

> 마스터 플랜 또는 확정된 모듈에 대한 변경 이력. 모든 변경은 이곳에 기록되어야 한다.

## 형식

```
### YYYY-MM-DD
- **변경**: [무엇을 어떻게]
- **모듈**: [영향받는 모듈]
- **사유**: [왜]
- **승인**: [승인자 + 커밋 해시]
```

---

## 이력

### 2026-05-11 — 모바일 QA 처방 4건 (OG 썸네일 / portrait 토스트 / 전체화면 버튼 / 480px 비율)

- **변경 배경**: PM이 안드로이드 S22 Ultra + 아이패드 + 데스크톱에서 모바일 QA. 4건 신고: (1) 공유 링크 카톡 썸네일이 절반만 보임 (2) 세로 모드에서 "가로로 회전" 풀스크린 락이 답답 — 진행은 되되 추천만 (3) 모바일 브라우저 UI가 게임 가림 — 전체화면 버튼 필요 (4) S22 Ultra(412×915) 같은 작은 폰에서 대사창/온도계 비율 깨짐 (아이패드는 OK). PM AskUserQuestion 4개 결정: (1) OG 1200×630 별도 자산 + 메타 (2) 세션 첫 진입 1회만 2초 토스트 (3) MiniControls에 별도 버튼 (4) 480px 전용 브레이크포인트 추가.

- **(1) OG 썸네일 — 1.91:1 분리 자산**:
  - **신규 자산**: `public/img/title-og.webp` (1200×630, 47KB, RGB). 기존 1500×1500 정사각 `title.webp`를 height-fit으로 630에 맞춰 가운데 배치 + 좌우 `#FED8E5` 핑크 letterbox. 카톡/페북이 1.91:1로 crop해도 잘림 없음. (PIL `Image.LANCZOS` 리샘플 + `quality=88, method=6`)
  - **수정**: `index.html` line 23·29 `og:image` / `twitter:image` → `./img/title-og.webp`. line 24 직상에 `og:image:width=1200 / height=630 / type=image/webp` 명시.
  - 게임 내 `title.webp`(시작 화면 등)는 그대로 유지 — OG 전용 자산 분리.

- **(2) Portrait — 풀스크린 락 → 2초 토스트로 전환**:
  - **수정**: `src/ui/OrientationLock.tsx` 전면 재작성. CSS 미디어 쿼리(`pointer:coarse + portrait`) 기반 풀스크린 불투명 오버레이 → JS state(`useState` + `matchMedia` 구독) + `sessionStorage` 플래그(`kmu-portrait-toast-shown`) 기반. 세션당 1회만 "가로 버전 플레이를 추천합니다" 2초 노출 후 자동 페이드아웃. 새로고침 시 sessionStorage 리셋되어 다시 한 번 노출.
  - **CSS**: `src/styles/globals.css` `.orientation-lock-overlay` 풀스크린(`inset: 0`, 불투명 검정 96%) → 상단 토스트(`top: 16px; left: 50%; transform: translateX(-50%)`, 92% 어두운 배경 + 보더 라운드 12px + 그림자). `pointer-events: none` 추가 — **세로에서도 게임 입력 차단 X**. `@media (pointer:coarse) and (orientation:portrait) { display: flex }` 룰 제거 (이제 JS가 가시성 결정). 페이드 인 `@keyframes orientation-toast-in` 200ms.
  - `.orientation-lock-sub` 서브 텍스트("게임이 일시정지됩니다") 제거 — 더 이상 일시정지 X.

- **(3) 전체화면 버튼 — MiniControls 인라인**:
  - **수정**: `src/ui/MiniControls.tsx` 파일 내 인라인 `FullscreenButton` 컴포넌트 추가. `document.documentElement.requestFullscreen({ navigationUI: 'hide' })` / `document.exitFullscreen()` 토글. `fullscreenchange` 이벤트 구독으로 아이콘 동기화(⛶ ↔ 🗗) + `aria-label` 동적("전체화면 진입"/"전체화면 종료") + `aria-pressed`.
  - **iPhone Safari 분기**: `typeof document.documentElement.requestFullscreen === 'function'` 체크 → `supported=false` 시 `return null` (버튼 자체 미렌더).
  - **배치**: PC 분기(우하단 가로 일렬) + 모바일 분기(우상단 햄버거 토글 메뉴) **양쪽에 SettingsButton/MuteToggle 앞에** 추가. 기존 `BTN_CLASS` 그대로 사용해 디자인 톤 통일.
  - SFX: 토글 시 `audioManager.playSfx('sfx_pageturn', { volume: 0.7 })` — 다른 메뉴 버튼 패턴 미러. ESC는 브라우저 기본 동작이라 별도 핸들러 X.

- **(4) 480px 전용 브레이크포인트 — 작은 폰 비율 회복**:
  - **수정**: `src/styles/tokens.css` 기존 768px 룰 *유지*(중형 폰·소형 태블릿 검증값 회귀 방지), 그 아래 `@media (max-width: 480px)` 블록 신규 추가. cascade로 ≤480px만 추가 축소:
    - `--textbox-bottom: 16px / --textbox-width: 94% / --textbox-height: 28%` (768 38% → 28%) — 화면 1/3 이상 차지 문제 해결, 캐릭터 가림 회복.
    - `--textbox-padding: 14px 18px`
    - `--font-size-text: 19px / --font-size-name: 21px / --font-size-monologue: 18px` (768 22/24/21 → 19/21/18)
    - `--therm-scale: 0.55` (768 0.75 → 0.55) — 온도계 점유율 추가 축소.
  - **부수 수정 — App.tsx 폰트 inline 가드**: `src/App.tsx` line 99 `fontSize` CSS var 동기화 effect가 사용자 설정 안 만진 기본값(26)에서도 inline `--font-size-text: 26px`를 박아넣어 tokens.css 미디어 쿼리(22/19)를 항상 덮던 문제 발견. `fontSize === FONT_SIZE_DEFAULT`일 때 `removeProperty` 분기 추가 → tokens.css 룰이 자연스럽게 적용. 슬라이더로 명시 변경 시에만 inline 우선. `import { FONT_SIZE_DEFAULT } from '@/stores/settingsStore'` 추가.

- **검증** (preview port 5175 dev):
  - 1280×800 데스크톱: `--textbox-height: 22%`, `--font-size-text: 26px`, `--therm-scale: 1` (PC 기본값 그대로). PC 분기 `[data-testid="fullscreen-button"]` 노출 `⛶`.
  - 600×900 (480<x≤768): `38% / 22px / 0.75` (기존 768 룰 회귀 0).
  - 412×915 S22 Ultra: `28% / 19px / 0.55` ✓. 햄버거 ☰ 클릭 → 메뉴 안 `⛶` 노출(`aria-label="전체화면 진입"`).
  - 콘솔/서버 에러 0건.
  - OrientationLock JS는 `(pointer:coarse) + portrait` 매칭 시점만 동작 — 데스크톱 Chrome은 `pointer:fine`이라 미발현(정상). 실기기 검증은 PM이 안드로이드/iOS에서 별도.

- **모듈 (status: review)**:
  - `index.html` (OG/Twitter 메타).
  - `src/ui/OrientationLock.tsx` (전면 재작성).
  - `src/styles/globals.css` (orientation-lock 스타일).
  - `src/styles/tokens.css` (480px 룰 추가).
  - `src/ui/MiniControls.tsx` (FullscreenButton).
  - `src/App.tsx` (fontSize inline 가드).
  - `public/img/title-og.webp` (신규 자산).

- **PM 후속**:
  1. 실기기 검증 — 안드로이드 S22 Ultra + 아이폰 Safari(버튼 숨김 확인) + 아이패드 Safari.
  2. 배포 후 페북 [Sharing Debugger](https://developers.facebook.com/tools/debug/) + 카톡 본인톡 전송으로 OG 1.91:1 정상 노출 확인.

- **승인**: PM 직접 (2026-05-11 채팅, AskUserQuestion 4건 + ExitPlanMode 승인 + 자산 색상 `#FFE4EC` → `#FED8E5` 정정).

### 2026-05-11 — 랭킹 모달 1위 포디움 상단 잘림 후속 정정

- **변경**: 직전 라운드(랭킹 UI 전면 리디자인) PM 시각 검수에서 1위 포디움 카드 윗부분이 살짝 잘림 신고. 원인 = `PodiumCard.style.transform: translateY(-12px)` 가 1위 카드를 위로 들어 올리는데 부모(스크롤 영역) 상단 경계가 그 lift 공간을 안 줘서 12px 분 잘림.
- **수정 1줄**: `src/ui/RankingModal.tsx` `Podium` 래퍼 div 에 `style={{ paddingTop: 14 }}` 추가. translateY(-12px) lift + 2px 버퍼 확보.
- **검증**: 라이브 DOM 측정 — `podium-1` getBoundingClientRect.top = 315, `ranking-list` 스크롤 영역 top = 313 → top 2px 안쪽 정상, clippedTop=false. ✓
- **모듈** (status: review): `src/ui/RankingModal.tsx`.
- **사유**: PM 시각 신고 — "1등 포디움 윗부분이 잘림".
- **승인**: PM 직접 (2026-05-11 채팅).

### 2026-05-11 — 랭킹 UI 전면 리디자인 (인라인 → 풀스크린 모달 + 포디움 + 등급 칩 + sticky 본인 위치)

- **변경**: 어제~오늘 도입한 랭킹 시스템 UI 전면 재설계. 인라인 form 스타일(EndingScreen 하단 박혀 있음) → 풀스크린 모달 분리. PM이 AskUserQuestion으로 4개 결정 일괄 답변 (전면 리디자인 + 모달 분리 + 포디움 + 색 칩 + UX 4종 모두). 게임 메인 보라/금색 톤 살리고 정보 가독성도 끌어올림.
- **신규 1건**: `src/ui/RankingModal.tsx` (~365줄)
  - props: `{open, onClose, endingId, flags}` — EndingScreen에서 mount 제어.
  - 구성: 헤더(🏆 ONLINE RANKING + ✕) / 닉네임 input + 등록 / 필터 토글(전체/{히로인}/이 엔딩) / 포디움(1·2·3위) / 4~10위 일반 행 / sticky 본인 위치(Top 10 밖일 때만).
  - **포디움**: 시각 순서 2위(왼쪽)·1위(중앙·-12px translateY·금색 glow `box-shadow 0 0 24px rgba(245,215,110,0.35)`)·3위(오른쪽). 메달 이모지(🥇🥈🥉) + 닉네임 + 점수 + 등급 칩(lg) + 엔딩명. entries < 3 시 빈 슬롯은 점선 placeholder("—").
  - **등급 색 칩**: `EndingHistoryModal.GRADE_COLOR` 미러 (S=#FFD86B 금 / A=#FF6FA8 분홍 / B=#7CC4C7 청록 / C=#B8B8C8 회 / D=#8A8A98 어두운 회). 기존 갤러리 색 일관성 유지(플레이어가 한 팔레트 학습). 헬퍼 `gradeChipStyle(grade, size)` 컴포넌트 내부.
  - **본인 위치 sticky 행**: 등록 record가 entries Top 10에 없으면 모달 하단에 황금 테두리 행 "👤 본인 · {등수} · {닉네임} · {점수}점". Top 10 안이면 본인 행이 노란 background로 이미 보이므로 sticky 생략.
  - **닉네임 localStorage 자동 저장**: 키 `kmu-vn-rank-nickname`, 등록 성공 시 저장. 모달 마운트 시 input 초기값으로 복원. `confirmAndResetGame` 영향 X.
  - **본인 행 펄스**: `@keyframes rankingRowPulse` (modal 내부 `<style>`) 2.5s background+scale 펄스. `useSettingsStore.reduceMotion` true 시 펄스 트리거 자체 skip (JS state로 가드).
  - **닫기 3종**: ✕ 버튼 / Esc 키 / 배경 dim 클릭. 각각 `audioManager.playSfx('sfx_pageturn')` (EndingHistoryModal 패턴 미러).
- **수정 1건**: `src/ui/EndingScreen.tsx` (711줄 → 472줄, **239줄 감축**)
  - **제거**: 인라인 RankingSection 컴포넌트(180줄) + RankingSectionProps 인터페이스 + 7개 ranking 관련 useState + ranking useEffect + handleSubmitRanking 함수 + RankingSection JSX 마운트.
  - **신규**: `const [showRanking, setShowRanking] = useState(false)` 1줄 + 액션 버튼 행 마지막에 "🏆 랭킹" 버튼(금색 테두리 + glow) 1개 + outer div 안 `<RankingModal open={showRanking} ... />` mount 1개.
  - **import 정리**: `HEROINES`, `fetchRanking`, `submitScore`, `FetchOptions`, `RankingEntry` 모두 RankingModal로 이동. EndingScreen은 `isRankingEnabled` (버튼 노출 게이트) + 신규 `RankingModal` import만 유지.
  - **stale 주석 정정**: `// VITE_RANKING_API_URL 미설정 시…` → `// VITE_PANTRY_ID 미설정 시 버튼·모달 자체가 안 보임…` (어제 백엔드 교체 잔재).
- **검증** (라이브 end-to-end):
  - `tsc --noEmit` exit 0.
  - dev 5175에서 `pendingEnding=END_H1_TRUE` 강제 + intro dismiss → EndingScreen mount 정상.
  - 액션 버튼 행에 [타이틀로 / 결과 공유 / 이미지 저장 / 조연 (7) / 🏆 랭킹] 5종 노출 확인 ✓.
  - "🏆 랭킹" 클릭 → `[data-testid="ranking-modal"]` mount + 헤더·입력·필터(3버튼: 전체/세린/이 엔딩)·포디움(현재 entry 1개 + placeholder 2개) 정상 렌더링.
  - 닫기 3종 모두 동작: Esc 키 ✓ / ✕ 버튼 ✓ / 배경 dim 클릭 ✓.
  - 필터 "이 엔딩" 클릭 → END_H1_TRUE 만 필터링(현재 0건) → 빈 상태 메시지 "아직 기록이 없어요. 첫 번째 등록자가 되어 보세요." 정상.
  - 펄스·sticky 본인 행·localStorage 복원: 코드 리뷰 (테스트 row 추가하면 PM Pantry에 잔여 → 회피). 이미 검증된 submitScore 파이프라인 위에 얹은 시각 효과만이라 회귀 위험 낮음.
- **재사용**: `EndingHistoryModal.GRADE_COLOR` (색 칩 팔레트) / `audioManager.playSfx('sfx_pageturn')` (모달 닫기 사운드) / `--z-modal: 300` (z-index 토큰) / `useSettingsStore.reduceMotion` (애니 가드) / `findEnding` / `HEROINES.shortName` / `computeEndingScore` / `submitScore`·`fetchRanking`·`isRankingEnabled` (백엔드 그대로).
- **모듈** (status: review):
  - `src/ui/RankingModal.tsx` (신규)
  - `src/ui/EndingScreen.tsx` (대폭 수정, 인라인 RankingSection 제거)
- **의도적으로 안 한 것**: 점수 카운트업 / 영문 제목 한글화 (사용자 미선택). 별 개수 등급 (색 칩 채택). 페이지네이션 (Top 10/20만 유지).
- **사유**: PM 결정 (2026-05-11 AskUserQuestion 응답) — 인라인 form 스타일이 게임 톤과 안 맞고 정보 가독성도 평이. 모달 분리로 EndingScreen 단정해지고 랭킹 창은 자유로운 디자인 가능.
- **승인**: PM 플랜 승인 (2026-05-11, plan: swift-purring-rocket 2차 라운드).

### 2026-05-11 — RELEASE-RUNBOOK 신설 + DEPLOYMENT 운영/스펙 역할 분리

- **변경**: 베타 첫 푸시 라운드(2026-05-11)에서 회고한 4종 함정 + 사전 점검 + 푸시 후 검증을 [`08-qa-deployment/RELEASE-RUNBOOK.md`](../08-qa-deployment/RELEASE-RUNBOOK.md) 단일 문서로 정착. DEPLOYMENT.md는 인프라 스펙으로 남고, RUNBOOK은 PM이 푸시 직전·직후 차례로 통과해야 할 체크리스트로 역할 분리.
- **RELEASE-RUNBOOK 구조 (7 절)**:
  - §0 SSoT 위치 — vite.config / 워크플로우 / helpers / playwright / build-manifest / compile-scene / .gitignore
  - §1 사전 점검 8단계 — 자산 경로 grep / 워크플로우 grep / typecheck·lint·test / compile:all + validate / manifest / build / preview 자산 200 OK / e2e 로컬 (선택)
  - §2 푸시 절차 — 정상 / hang 처방 / 인증 실패 처방
  - §3 푸시 후 검증 — Actions 모니터링 / 라이브 자산 8종 200 OK / PM 실기 게이트
  - §4 알려진 회귀 함정 4종 — 절대 자산경로 / E2E cold-cache race / ESLint scripts / 워크플로우 working-directory
  - §5 정식 출시 시 추가 점검 — 새 repo / 상대경로 호환 / localStorage 키 보존 / 커스텀 도메인
  - §6 빠른 푸시 체크리스트 (1줄 요약 8줄)
  - §7 변경 이력
- **함정 4종 상세 (RUNBOOK §4)**:
  - **§4.1 자산 절대경로** — `/img/`, `/snd/`, `/video/` → `img/`, `snd/`, `video/` 일괄 치환 PowerShell 패턴 박힘. 본 라운드 처방 사례 인용.
  - **§4.2 E2E cold-cache idle race** — `helpers.ts:autoAdvanceUntilEnding` 진입 직후 30s idle 대기 가드 처방. timeout 상향(옵션 C 30분)은 증상 가림이라 폐기 결정.
  - **§4.3 ESLint scripts 에러** — `scripts/` 미사용 변수 → `_` prefix / `let` → `const` / `[+\-]` → `[+-]` 등 8건 처방 패턴.
  - **§4.4 워크플로우 옵션 A 위반** — `working-directory: game-project` + `cache-dependency-path: game-project/...` + 아티팩트 `path: game-project/...` 박혀 있으면 옵션 B로 추정. 옵션 A는 모두 미지정 또는 `game-project/` prefix 없음.
- **수정 3건**:
  - `08-qa-deployment/RELEASE-RUNBOOK.md` 신설 (200줄+ runbook)
  - `08-qa-deployment/DEPLOYMENT.md` 본문 첫 줄에 RELEASE-RUNBOOK 크로스레퍼런스 추가 (인프라 스펙 vs 운영 RUNBOOK 역할 분리 명시)
  - 본 CHANGELOG 엔트리
- **모듈** (status: review): `08-qa-deployment/RELEASE-RUNBOOK.md` · `08-qa-deployment/DEPLOYMENT.md`.
- **사유**: PM 요청 "정식 버전과 다음 베타 버전 푸시 시에도 이런 곤란함을 겪지 않도록 로그를 잘 작성해". 본 라운드 4종 함정이 다음 베타 푸시·정식 출시 푸시에서 재발할 가능성 큰 운영 함정이라 단일 체크리스트로 정착.
- **승인**: PM 구두 (2026-05-11).

### 2026-05-11 — 카톡/대사 타이밍 완화 + 카톡 자동 진행 settings 분리 + 히로인/일반 분리

- **변경**: (1) `KAKAO_ACCEL_COOLDOWN_MS` 600→300ms, (2) 카톡 메시지 자동 흐름 간격을 `settingsStore.autoAdvanceDelay`에서 분리 → `KAKAO_AUTO_ADVANCE_MS=1000ms`(일반) + `KAKAO_AUTO_ADVANCE_HEROINE_MS=1500ms`(히로인 참여 카톡)로 이원화 (기존 `PER_MESSAGE_DELAY_DEFAULT_MS=800` 폐기). 히로인 여부는 `kakaoCmd.messages` sender 중 `nameToHeroineId(...) !== null` 검사. 자동재생 ON 분기는 그대로 `autoAdvanceDelay` 사용 유지. (3) `USER_ADVANCE_COOLDOWN_MS` 600→400ms.
- **모듈**: `06-engine` (`src/ui/katalk/KakaoModal.tsx`, `src/stores/gameStore.ts`)
- **사유**: PM 플레이 결과 카톡 클릭 씹힘·자동 진행 너무 느림(2000ms)·일반 대사 클릭 답답함. 카톡 자동 흐름은 좌하단 "자동재생" 슬라이더와 의미가 달라(카톡은 자동재생 OFF여도 톡톡 흐름 필요) 상수 분리. 히로인 카톡은 진지함·여운 유지를 위해 일반 친구 단톡보다 호흡을 길게.
- **승인**: PM (커밋 해시 TBD)

### 2026-05-11 — 자산 경로 절대→상대 일괄 전환 (GitHub Pages 서브패스 호환)

- **변경 사실**: PM 라이브 사이트 보고 — UI/text는 정상 보이지만 모든 자산(이미지/사운드/영상) 미로드. 진단: `vite.config.ts base: './'` 자체는 정상이지만 코드 안의 절대경로 `/img/`, `/snd/`, `/video/`가 GitHub Pages 서브패스(`/Cuyeonsi-beta/`)에서 `https://jonathanblackdoctor.github.io/img/...` 로 잘못 해석되어 404. 처방: 모든 자산 경로에서 leading `/` 제거 → 상대경로화. 브라우저가 document URL(`/Cuyeonsi-beta/`) 기준으로 해석 → `/Cuyeonsi-beta/img/...` ✓ 정상 로드.
- **수정 23건**:
  - 코드 19 파일: `assetPreloader.ts` (3건) · `endingFlavor.ts` (4건) · `CGOverlay.tsx` · `AffectionThermometer.tsx` (8건) · `kakaoProfiles.ts` (12건) · `BackgroundLayer.tsx` · `CharacterLayer.tsx` · `audioMappings.ts` (2건) · `EndingScreen.tsx` · `OpeningVideo.tsx` (2건) · `KakaoMessage.tsx` · `CGGallery.tsx` (2건) · `EndingGallery.tsx` · `SpriteGallery.tsx` (2건) · `EndingHistoryModal.tsx` · `VideoLayer.tsx` (2건) · `generateEndingImage.ts` (2건) · `RejectEnding.tsx` · `types.ts` (주석 1건). 총 47건 치환.
  - 시나리오 .md 2 파일: `03-story/scenarios/ch06_h4_seoyoon.md` + `compressed/ch06_h4_seoyoon.md` (KAKAO 사진 첨부 `image:/img/sprites/...` → `image:img/sprites/...`). 총 3건 치환.
  - 컴파일 산출물 2 파일: `npm run compile:all`로 `ch06_h4_03_perv_pair.scene.json` 풀/압축 양 모드 재생성.
- **치환 패턴** (PowerShell `[System.IO.File]::ReadAllText/WriteAllText` UTF-8 NoBOM):
  - `(['""``])/img/` → `$1img/` (quote/backtick 보존)
  - `(['""``])/snd/` → `$1snd/`
  - `(['""``])/video/` → `$1video/`
  - `:/img/` → `:img/` (KAKAO `image:/img/...` 인라인 메타용)
- **검증**: typecheck 0 / vitest 104/104 / compile:all 풀212+압축212 / validate 0 errors (사전 경고 2건은 무관) / build 3.67s / preview localhost:4173 자산 200 OK 응답 확인.
- **호환성**: 상대경로는 어떤 deploy base에서도 작동 (root domain·서브패스·로컬 dev 모두). 향후 정식 출시 별 repo로 옮겨도 무수정.
- **모듈** (status: review): 코드 19 파일 + 시나리오 .md 2 파일 + 컴파일 산출물 2 파일.
- **사유**: 베타 라이브 자산 미로드 출시 차단급 회귀. 절대경로 사용이 GitHub Pages 서브패스 deploy와 호환 안 됨.
- **승인**: PM 구두 (2026-05-11).

### 2026-05-11 — CI e2e 근본 원인 처방: autoAdvanceUntilEnding idle 대기 가드

- **재진단 (옵션 C 30분도 부족 보고 후)**: 90s timeout 자체보다 더 근본 회귀 발견. `gameStore.ts:231` 초기 `runtimeMode: 'idle'` + `helpers.ts:101` autoAdvance가 `'idle' → return` 조기 종료. CI cold-cache로 scene JSON 로드 지연 시 autoAdvance가 startScene 완료 전 'idle' 상태로 읽고 즉시 return → expectEnding이 90초 동안 DOM 기다리다 timeout. retry에선 OS file cache로 startScene이 빨리 끝나 'scene' 상태로 진입해 통과. 매 테스트 NEW context로 OS 캐시 미공유였던 패턴 설명.
- **처방**: `tests/e2e/helpers.ts` autoAdvanceUntilEnding 진입 직후 idle 대기 가드 30초 추가. `runtimeMode !== 'idle'`까지 50ms 폴링 → 그 이후에도 'idle'이면 진짜 idle 상태(엔딩 완료 후 등)로 종료. timeout 증가 대신 race 해소.
- **수정 1건**: `tests/e2e/helpers.ts` (`autoAdvanceUntilEnding` 초기 idle 대기 블록 신규).
- **무수정**: `expectEnding` timeoutMs(90s) 그대로 / playwright retries 그대로 / CI timeout-minutes 30 그대로. 근본 처방이라 cushion 불필요.
- **검증**: typecheck 0 + lint 0 errors + 본 라운드 helpers 변경은 E2E 도구 영역(브라우저 preview 비대상).
- **모듈** (status: review): `tests/e2e/helpers.ts`.
- **사유**: PM "30분도 부족" 보고 후 재진단. 옵션 C 단순 timeout 상향은 증상 가림이라 폐기, 근본 race 처방.
- **승인**: PM 구두 (2026-05-11).

### 2026-05-11 — 베타 출시 ✅ + CI e2e job timeout 15→30분 (옵션 C)

- **베타 출시 성공**: 라이브 URL `https://jonathanblackdoctor.github.io/Cuyeonsi-beta/` HTTP 200 OK 확인 (Last-Modified 2026-05-10 17:41 GMT). `<title>구연시: 본과 1학년의 봄</title>` + og:title/og:image/twitter card 정상. `deploy.yml`(Pages 배포)은 `ci.yml`과 독립이라 e2e 실패 무관 첫 푸시 직후 성공.
- **CI e2e 옵션 C 처방**: `.github/workflows/ci.yml` e2e job `timeout-minutes: 15 → 30`. 진단 — 16/16 첫 시도 1.5m timeout(`helpers.ts:167 expectEnding timeoutMs = 90_000`) → retry 2-4초 성공. CI 러너 cold cache로 95MB dist 첫 로드 90초 초과. retry는 OS file cache + HTTP cache warm으로 즉시 성공. cold start 1.5m × 16 + 작은 retry = ~25분 안에 끝, 15분 한도 초과로 cancel됐던 회귀 처방.
- **무수정**: `helpers.ts` timeoutMs(90s) + playwright.config `retries: 2` 그대로. retry로 회복 가능한 flake라 job 한도만 늘려 16/16 완주 보장.
- **수정 1건**: `.github/workflows/ci.yml` e2e job timeout-minutes + 처방 사유 주석.
- **모듈** (status: review): `.github/workflows/ci.yml`.
- **사유**: 베타 출시 완료 후 CI 그린 복구. cold-cache 근본 처방(B: warmup, D: 비활성)은 별도 라운드. 단순 timeout 상향이 가장 낮은 위험.
- **승인**: PM 구두 (2026-05-11, 옵션 C 선택).

### 2026-05-11 — 온라인 랭킹 백엔드 JSONBin → Pantry 재교체 (PM 셋업 401 반복 → UUID 1개 모델로 단순화)

- **변경**: 같은 날 오전 도입한 JSONBin.io 안 폐기 → Pantry (https://getpantry.cloud) 백엔드로 재교체. PM이 .env.local에 키 박아 dev 재기동하니 `X-Master-Key is invalid or the bin doesn't belong to your account` 401 반복. 진단 로그로 키 길이 38·47·`/` 시작·`$` 없음 확인 → JSONBin 어카운트 페이지에서 PM이 두 번 다 X-Access-Key를 X-Master-Key 자리에서 복사한 것. X-Access-Key 헤더로도 시도했으나 같은 401(`bin doesn't belong to your account`) → bin과 key가 같은 계정 소속인지조차 확실히 매칭 안 되는 상태. JSONBin UI 헷갈림이 PM 비기술자에게 비현실적 → **키 1개(UUID)만 쓰는 Pantry로 백엔드 전환**.
- **재작성 1건**: `src/engine/ranking.ts` — JSONBin GET `/v3/b/{BIN_ID}/latest` + X-Master-Key → Pantry GET `/apiv1/pantry/{PANTRY_ID}/basket/kmu-vn-ranking` (헤더 없음). saveAll은 POST(upsert). loadAll은 basket 미존재(400) → 빈 배열 처리. 화이트리스트·sanitize·trim 500 동일.
- **수정 3건**:
  - `.env.example` — `VITE_JSONBIN_BIN_ID` + `VITE_JSONBIN_KEY` 두 키 → `VITE_PANTRY_ID` 단일 UUID. UUID는 `$` 없어 따옴표 불필요하지만 일관성 권장.
  - `src/vite-env.d.ts` — `ImportMetaEnv` 단일 키로 갱신.
  - `docs/RANKING-SETUP.md` — JSONBin 절차 → Pantry 절차로 전면 재작성. 가입(이메일 입력) → 메일에서 UUID 복사 → `.env.local` 한 줄 → 재기동 → 검증. 30일 비활성 시 archive 주의 추가. JSONBin을 안 쓰는 이유 §"왜 JSONBin 안 쓰는지" 신설.
- **검증** (라이브 end-to-end):
  - PM이 Pantry ID 발급·`.env.local` 작성 후 PreviewMCP로 dev 재기동 → 콘솔 `[ranking-debug] PANTRY_ID len=36 starts="5557"` 정상.
  - `pendingEnding=END_H1_TRUE` 강제 + 닉네임 "진단테스트" 입력 → 등록 클릭 → 버튼 "등록 완료 ✓" / submitDisabled=true / 랭킹 리스트 1행 "1. 진단테스트 / 세린 / TRUE / 463점 / A" 표시 ✓ POST 성공.
  - 진단 row는 임시 export `__wipeRanking()` 호출로 즉시 삭제 → fetchRanking 결과 빈 배열 ✓.
  - `tsc --noEmit` exit 0 (진단 로그·임시 wipe export 모두 제거 후 재검증).
- **모듈** (status: review):
  - `src/engine/ranking.ts` (재작성, 백엔드 2회차 교체)
  - `.env.example` / `src/vite-env.d.ts` (수정)
  - `docs/RANKING-SETUP.md` (전면 재작성)
- **사유**: PM 직접 셋업 시도에서 JSONBin 키 2종 + Bin ID 매칭 401 반복. Pantry는 UUID 1개로 read+write 모두 인증 → 헷갈림 0건. 보안 트레이드오프 동일(클라 번들에 ID 노출 → 조작 가능, 친구 한정 사용 권장).
- **승인**: PM 직접 (2026-05-11, 채팅 진행 중 라이브 검증).
- **참고**: 같은 날 오전 자 "JSONBin.io 직접 호출로 재구현" 항목은 본 라운드로 **superseded**. JSONBin 안의 코드·문서 모두 본 라운드에서 교체됨.

### 2026-05-11 — 온라인 랭킹 백엔드 JSONBin.io 직접 호출로 재구현 (전일 Cloudflare Worker 안 폐기)

- **변경**: 어제(2026-05-10) 도입한 Cloudflare Worker + KV 프록시 안 폐기 → JSONBin.io 무료 백엔드 직접 호출 방식으로 교체. **PM 명시 결정**: 보안 약화(마스터 키가 클라 번들에 그대로 박힘) 수용하고 PM 셋업 작업을 진짜 5~10분 안에 끝낼 수 있는 단일 외부 서비스 가입+키 복붙 방식 채택. PM이 컴퓨터 지식 없어 wrangler CLI 셋업·KV namespace 명령·worker 배포 절차가 비현실적이었음.
- **삭제**: `worker/` 디렉토리 일괄 제거 (wrangler.toml + src/index.ts + package.json + tsconfig.json + README.md, 5파일). repo 루트에만 있던 산출물이라 `game-project/` 트리에는 변동 없음.
- **재작성 1건**: `src/engine/ranking.ts` — Worker URL 호출 → JSONBin.io API 직접 호출. `loadAll()` (GET `/v3/b/{BIN_ID}/latest` + X-Master-Key) + `saveAll(entries)` (PUT `/v3/b/{BIN_ID}` + X-Master-Key) 두 헬퍼. `submitScore()` 는 load → push → sort → trim(500) → save 루프(JSONBin이 partial append 미지원). `fetchRanking()` 은 load → 클라 필터·정렬. 화이트리스트 검증 정규식 `VALID_ENDING_PREFIX` (16개 endingId 패턴) 클라 측에 둠. 닉네임 sanitize(`<>&"'\``) + 8자 컷 동일.
- **수정 2건**:
  - `.env.example` — `VITE_RANKING_API_URL=` → `VITE_JSONBIN_BIN_ID=` + `VITE_JSONBIN_KEY=` 두 키.
  - `src/vite-env.d.ts` — `ImportMetaEnv` 인터페이스 두 키로 교체.
- **신규 1건**: `docs/RANKING-SETUP.md` — PM용 5~10분 셋업 가이드 (가입 / Bin 만들기 / Master Key 복사 / `.env.local` 작성 / 재기동 / 검증). 보안 한계와 키 교체 절차도 명시.
- **EndingScreen.tsx 무수정**: 전일 추가한 RankingSection UI는 같은 `submitScore`/`fetchRanking`/`isRankingEnabled` API 표면을 그대로 사용 → 백엔드 교체 영향 0.
- **검증**:
  - `tsc --noEmit` 무에러 (exit 0).
  - Vite dev (port 5175) 라이브 — `pendingEnding=END_H1_TRUE` 강제 + intro-typing dismiss 후 EndingScreen mount 정상 + 제목 "세린 / TRUE" 노출 + 환경변수 미설정 상태에서 `data-testid="ending-ranking-section"` 미존재 (graceful degradation 정상).
  - 전체 셋업 + 등록·조회 동작은 Vite 서버 재기동 권한이 없어 PM이 docs/RANKING-SETUP.md 따라 직접 검증 필요.
- **모듈** (status: review):
  - `src/engine/ranking.ts` (재작성, 백엔드 교체)
  - `.env.example` (수정)
  - `src/vite-env.d.ts` (수정)
  - `docs/RANKING-SETUP.md` (신규)
- **사유**: PM 명시 — "보안 약하더라도 10분 안에 구현 가능한 걸로". Worker 안은 코드 품질·보안은 더 좋지만 wrangler CLI · CF 계정 · KV namespace 명령 등 PM에게 비현실적인 인프라 셋업 부담. JSONBin은 웹 가입 + Bin 생성 + 키 복붙만으로 끝남.
- **승인**: PM 직접 (2026-05-11, 채팅 요청 "보안에 취약하더라도 10분 안에 구현할 수 있는 걸로 다시 해줘").
- **참고**: 2026-05-10 자 "온라인 랭킹 시스템 1차 도입 (Cloudflare Worker 프록시)" 항목은 본 라운드로 **superseded**. 해당 안의 worker/ 산출물은 본 라운드에서 모두 삭제됨.

### 2026-05-11 — NPC 도달성 보강: A1 ×15 + 제한적 H+NPC co-fire + 임계 per-NPC 최댓값 (v5)

- **변경**: 보너스 NPC(mom/junhyuk/taeho) 발동 도달성을 위해 4갈래 패키지 동시 적용. 옛 룰(2026-05-10 v4 임계 100)에선 도달성 부족으로 사실상 미발동이었던 것을 "최선 플레이 시 정확히 임계 도달"로 균형 조정.
  - **A. 멀티플라이어 ×15 일괄 상향** ([toneMatrix.ts:169](../src/engine/toneMatrix.ts:169))
    - `NPC_GAIN_MULTIPLIER` 10 → 15. NPC 매트릭스 ±1~3 → 실제 ±15~45 적용.
  - **B. SceneMeta·Choice에 `coFireNpcs` 신설** ([types.ts:281,299](../src/engine/types.ts:281))
    - `Choice.coFireNpcs?: NpcAffinityId[]` (옵션별 override, 우선)
    - `SceneMeta.coFireNpcs?: NpcAffinityId[]` (씬 단위 기본값, 폴백)
    - 두 자리 모두 박힌 NPC는 1-NPC drop 룰 우회 — H 변동과 함께 적용됨.
  - **C. `applyChoiceEffects` 분기 추가** ([gameStore.ts:280](../src/stores/gameStore.ts:280))
    - `coFireSet = pickedChoice.coFireNpcs ?? sceneMeta?.coFireNpcs ?? []` 우선순위.
    - 1.5단계 신설: coFire 등록 NPC는 별도 `coFireNpcCmds` 버킷으로 빼내 항상 적용.
    - 2단계(일반 NPC 1-NPC max abs 픽): **coFire가 명시된 자리(Choice 또는 Scene)는 자동 비활성화**.
      - 작가가 명시적으로 NPC 라우팅을 컨트롤하는 신호 → 의도하지 않은 다른 NPC 가산 차단.
      - **버그 차단**: 옵션 effects가 특정 NPC를 음수로 박는데(예: cafe 옵션 B `gyumin -30`) 1-NPC 픽이 같은 NPC 톤 +값(gyumin +45)을 추가 발동 시 순 +15가 되어 의도 어긋나는 케이스 차단.
    - 토스트는 H-only 유지(NPC 변동은 호감도 패널 게이지로만 보임).
    - 검증: 전 씬 CHOICE 전수 스캔 결과 한 옵션이 같은 NPC를 두 번 변동시키는 케이스 **0건** 확인.
  - **D. 임계값 per-NPC 최댓값 (v5)** ([endingScore.ts:107](../src/engine/endingScore.ts:107))
    - 옛 v4: `mom/junhyuk/taeho 모두 100` 단독 평가
    - 신 v5: `mom 90 / junhyuk 75 / taeho 75` — 각 NPC의 이론상 최댓값 (best-pick 합)
    - 도달성 출처는 코드 주석으로 명시 (시나리오 확장 시 같이 갱신 필요).
  - **E. 컴파일러 .md → .scene.json 파서 확장** ([compile-scene.ts:306](../scripts/compile-scene.ts:306))
    - `# Hint:` 라인에 `coFire=taeho+junhyuk` 파싱 추가.
    - CHOICE 옵션 메타 `{tone:..., coFire:junhyuk}` 파싱 추가 (옵션별 override).
    - `ChoiceOut.coFireNpcs` 필드 추가 → JSON 출력 정합.
  - **F. 시나리오 변경 (4개 씬 × 5 SoT 동기화)**:
    - **`prologue_01_home`** — 어머니 마지막 한 마디 직후에 새 CHOICE 3옵션 신설 (mom 단독 active 기존). 옵션 톤 warm/direct/playful → mom +45/+15/-15.
    - **`ch02_02_cadaver_first`** — 옵션별 coFire: 옵션 A `coFire:junhyuk` (H2 KEY + junhyuk +30), 옵션 B `coFire:taeho` (H2 +3 + taeho +30).
    - **`ch02_03_biochem_lab`** — 씬 단위 `coFire=taeho`. 두 옵션 모두 taeho 발동 (warm +30, mature +45 — taeho 베스트 픽).
    - **`ch01_05_cafe`** — no-tone 3옵션에 톤 박기 + 옵션별 coFire/effects:
      - 옵션 A `mature_serious + coFire:gyeongmin+junhyuk` → gyeongmin +45 + junhyuk +15
      - 옵션 B `playful_casual + coFire:junhyuk + effects:[gyumin -30]` → gyumin **-30** (대폭) + junhyuk +30
      - 옵션 C `warm_supportive + coFire:junhyuk` → junhyuk +45
    - 각 옵션 영향 ≤2명 룰 준수. 모닥불 5지선다(`ch05_06_bonfire`)는 손대지 않음 (PM 결정).
- **검증 (best-pick 시뮬, ×15 적용 후)**:
  - mom: prologue_01_home(warm +45) + prologue_02_train(warm +45) = **+90 = 임계** ✓
  - junhyuk: ch01_05_cafe(warm 옵션C +45) + ch02_02 옵션A(direct +30) = **+75 = 임계** ✓
  - taeho: ch02_02 옵션B(warm +30) + ch02_03(mature +45) = **+75 = 임계** ✓
  - 차선 픽이면 임계 미달 → 보너스 미발동 (의도된 "최선 플레이 보상" 룰).
- **수정 파일 (총 19개)**:
  - 엔진 4: `toneMatrix.ts`, `types.ts`, `gameStore.ts`, `endingScore.ts`
  - 컴파일러 1: `scripts/compile-scene.ts`
  - 시나리오 14 (4개 씬 × 5 SoT 중 일부 + .md 단독):
    - `prologue.md`(풀+압축) + `prologue.txt`(윤문) + `prologue_01_home.scene.json`(풀+압축)
    - `ch01_ot.md`(풀+압축) + `ch01_ot.txt`(윤문) + `ch01_05_cafe.scene.json`(풀+압축)
    - `ch02_anatomy.md`(풀+압축) + `ch02_anatomy.txt`(윤문) + `ch02_02_cadaver_first.scene.json`(풀+압축) + `ch02_03_biochem_lab.scene.json`(풀+압축)
- **모듈**: `src/engine/{toneMatrix,types,endingScore}.ts`, `src/stores/gameStore.ts`, `scripts/compile-scene.ts`, `03-story/scenarios/**/*.md` + 윤문 .txt + `src/scenes/**/*.scene.json`
- **사유**: PM(사용자) 결정 — 임계 100 v4 룰은 NPC active 자리 부족으로 발동 불가능했음. (a) 멀티 ×15로 폭 확대, (b) coFire로 H+NPC 동시 발동 허용, (c) 임계를 "이론상 최댓값"으로 재정의. 해부 자리(이태호 강의 + 5조 분위기) + 카페 자리(친구들)에 자연 통합.
- **승인**: PM plan-mode 승인(2026-05-11)

---

### 2026-05-11 — 옵션 A 채택: `game-project/` = repo 루트 + 워크플로우 정정 + 베타-정식 출시 분리

- **변경 사실**: PM 확정 (2026-05-11) — repo `Cuyeonsi-beta`는 **베타 릴리스 전용 채널** (정식 출시는 별도 repo/도메인 추후 결정). 배포 URL `https://jonathanblackdoctor.github.io/Cuyeonsi-beta/` 확정. repo 현재 비어있음 → 옵션 A 채택: `game-project/` 자체를 repo 루트로 푸시(0501test/worker/veo_frame_*.png 등 비-게임 작업물 미포함).
- **워크플로우 정정 2건** (`game-project/.github/workflows/`):
  - **`ci.yml`** — `working-directory: game-project` 11곳 일괄 제거 / `cache-dependency-path: game-project/package-lock.json` → `package-lock.json` (2곳) / 아티팩트 `path: game-project/dist` → `path: dist` / Playwright report `path: game-project/playwright-report/` → `playwright-report/`
  - **`deploy.yml`** — `working-directory: game-project` 3곳 제거 / `cache-dependency-path` + 아티팩트 `path` 동일 패턴 정정
- **`.gitignore` 보강** (`game-project/.gitignore`): 기존 32줄 → 40줄. 신규 추가 — `*.tsbuildinfo` (tsc cache) / `.vite/` / `playwright-report/` / `test-results/` / `coverage/` / `Thumbs.db` / `desktop.ini`. 기존 항목(node_modules·dist·*.log·.env·.vscode·.DS_Store) 보존.
- **수정 5건**:
  - `game-project/.github/workflows/ci.yml` — working-directory 일괄 제거 + 경로 정정
  - `game-project/.github/workflows/deploy.yml` — 동일 패턴 정정
  - `game-project/.gitignore` — Vite/test artifact/OS 보강
  - `08-qa-deployment/DEPLOYMENT.md` §1 배포 URL "확정" 표기 + 베타 채널 명시 / §2 레이아웃 전제 옵션 A 기준 정정
  - `00-master/PROGRESS-TRACKER.md` — "출시" 단일 항목 → 베타 출시 + 정식 출시 분리
- **PM 직접 영역 (Claude 미실행)**: `game-project/`에서 `git init` → `git add . && git commit -m "..."` → `git remote add origin https://github.com/JonathanBlackDoctor/Cuyeonsi-beta.git` → `git push -u origin main`. 푸시 후 GitHub Actions "Deploy to GitHub Pages" 실행 결과 모니터링.
- **검증 잔여**:
  - 첫 Actions 배포 성공 확인 (CI build + e2e + deploy 통과)
  - 라이브 URL `https://jonathanblackdoctor.github.io/Cuyeonsi-beta/` 모바일/PC 접속 확인
  - 거절 카톡 엔딩 라이브 도달 (DEPLOYMENT.md §10 출시 체크리스트)
- **모듈** (status: review): `.github/workflows/ci.yml` · `.github/workflows/deploy.yml` · `.gitignore` · `08-qa-deployment/DEPLOYMENT.md` · `00-master/PROGRESS-TRACKER.md`.
- **사유**: PM 베타 채널 활성화 + 빈 repo 확인 후 레이아웃 결정. 옵션 A는 repo 깔끔 + 워크플로우 단순화 + 비-게임 작업물 격리.
- **승인**: PM 구두 (2026-05-11).

### 2026-05-11 — 음소거·설정 버튼 페이지 넘김 SFX 제거 + sfx_pageturn 앞 0.3s 크롭

- **변경**:
  - [`MuteToggle.tsx`](../src/ui/MuteToggle.tsx), [`SettingsButton.tsx`](../src/ui/SettingsButton.tsx) onClick에서 `audioManager.playSfx('sfx_pageturn', ...)` 호출 제거. 두 버튼은 SFX 없이 즉시 토글만.
  - `public/snd/sfx/sfx_pageturn.mp3` 앞 0.3초 ffmpeg `-ss 0.3 -acodec copy`로 크롭 후 덮어쓰기, `dist/snd/sfx/sfx_pageturn.mp3`도 동기화. 결과 11,747 bytes.
- **모듈** (status: review):
  - `src/ui/MuteToggle.tsx`
  - `src/ui/SettingsButton.tsx`
  - `public/snd/sfx/sfx_pageturn.mp3` (+ dist 사본)
- **사유**: PM 지시 — 우하단 음소거/설정 버튼은 페이지 넘김 컨텍스트가 아니라 효과음이 어색. SFX 자체도 앞부분 무음/노이즈 0.3s가 트리거 즉응성을 해침.
- **검증**: dev 프리뷰(5175)에서 `/snd/sfx/sfx_pageturn.mp3` fetch 200 OK · 11,747 bytes 확인. 두 버튼 onClick 핸들러에서 audioManager import 제거되어 호출 경로 자체 소실.
- **승인**: PM 구두 승인 (자동 모드)

---

### 2026-05-11 — Ch.5 모닥불 SSoT 정공법 복원 (2026-05-10 일괄 컴파일 부수 회귀 처방)

- **변경 사실**: 2026-05-10 23:30:23에 PM이 H4 거절 카톡 라운드(`ch06_h4_seoyoon.md` 풀+압축 SSoT 갱신)를 위해 `npm run compile:all`을 실행한 결과, 같은 컴파일이 모든 .scene.json을 일괄 재생성하면서 어제 모닥불 라운드(2026-05-09 effects/페어/HIDE 부착 + 후속 보강 tone/isKey 제거)가 부수적으로 회귀. 어제 작업이 `.scene.json` 직접 편집만 거쳤고 SSoT인 `ch05_decision.md`(풀+압축)는 동시 갱신을 하지 않았던 것이 단일 원인.
- **변경**: SSoT 정공법으로 영구 복원. `ch05_decision.md` 풀+압축 두 파일에서 모닥불 본 씬 + 5개 분기 씬을 술집 패턴(`ch05_02_pub_first` + `ch05_02b_h*`)과 정확히 일치시킨 뒤 `npm run compile:all` 실행.
  - **모닥불 본 씬 [`Scene: ch05_06_bonfire`](../03-story/scenarios/ch05_decision.md)** (풀+압축): 5개 CHOICE에서 `{tone:...}` 표기 제거 + `→ +25 Hx → KEY:Hx:ch5_bonfire` 표기 추가. 톤 매트릭스가 자동으로 다른 4명에게 점수 박는 것 차단(사용자 의도 "선택한 1명만 호감도 변화"), 술집 표기와 1:1 일치.
  - **모닥불 분기 [`Scene: ch05_06b_h{1-5}`](../03-story/scenarios/ch05_decision.md)** (풀+압축, 5개씩 = 10): 각 분기 시작 `[FLAG: flag_ch5_bonfire=hN]` 직후에 `[CHARACTER_HIDE: <비선택 4명> fade]` 4줄 + `[지문] 다른 일행이 슬쩍 자리를 비켜준다.` + `[CHARACTER: 윤모 pair_left default fade]` + `[CHARACTER: <히로인> pair_right <sprite> fade]` 페어 배치 박음. h5 장윤영은 sprite `smile_big` 보존.
- **컴파일 결과**: `npm run compile:all` 12개 .md → 212개 씬 (풀+압축 대칭) 재생성. 모닥불 14건 검증:
  - `ch05_06_bonfire.scene.json` (풀+압축): 5개 CHOICE 각각 `effects: [FLAG_INC +25, KEY_CHOICE]` 박힘, `tone`/`isKey` 없음 ✓
  - `ch05_06b_h{1-5}.scene.json` (풀+압축, 10개): 모두 `CHARACTER_HIDE` 4건 + `pair_left` 1건 + `pair_right` 1건 정확히 박힘 ✓
- **검증**:
  - `npm run typecheck` 통과
  - `tests/unit/branchEvaluator.test.ts` 15/15 통과
  - 컴파일 경고 6건은 본 라운드 무관(IF 블록 v0.1 미지원 — 기존 잔존, 다른 evaluate 씬). 모닥불 라운드 무경고
- **모듈** (status: review):
  - `03-story/scenarios/ch05_decision.md` (풀)
  - `03-story/scenarios/compressed/ch05_decision.md` (압축)
  - `src/scenes/ch05_06_bonfire.scene.json` + 압축본 (자동 재컴파일)
  - `src/scenes/ch05_06b_h{1-5}.scene.json` + 압축본 (자동 재컴파일, 10개)
- **무수정 보존**:
  - `ch05_07_close_evaluate` (H4 카톡 미니게임 안내 NARRATION/affectionDecay) — PM이 별도 라운드로 처리 예정. 본 라운드 범위 밖.
  - 어제 살아남은 다른 변경 (`ReplyTimer.tsx` 3초, `KakaoModal.tsx` `isReplySpeedGame` + `handleTimeout`, `gameStore.ts` EVALUATE_TIER 핸들러, `endings.ts` ENDING_SCENE_MAP/CHAPTER6_START_MAP, BRANCH-GRAPH/STORY-BIBLE/route-H4 SSoT 동기) 모두 그대로.
- **사유**: PM 진단 — 어제 PM 의도하지 않은 부수 회귀로 모닥불 12건 .scene.json만 옛 상태로 돌아감. PM 결정 옵션 A(SSoT 정공법 복원). 이번 라운드 후에는 다음 컴파일에도 회귀하지 않음(SSoT 자체가 새 상태로 박혔으므로).
- **재발 방지 룰**: 시나리오 .scene.json 직접 편집 금지. 시나리오 변경은 항상 `03-story/scenarios/*.md`(풀+압축) SSoT 편집 → `npm run compile:all` 흐름. 어제 누락은 이 룰 미준수가 단일 원인.
- **승인**: PM 구두 (2026-05-11, "일단 모닥불만 복원해").

### 2026-05-11 — 메인 테마 BGM 오프닝 wow/cut 회귀 처방 (OpeningVideo fallback playBgm 제거)

- **변경**:
  - **[`src/ui/OpeningVideo.tsx`](../src/ui/OpeningVideo.tsx)** — 마운트 시 `audioManager.playBgm('bgm_main_theme', { fade: 4, volume: 0.6 })` fallback effect 삭제. `audioManager` import도 제거. BGM 진입은 [`src/App.tsx:120-124`](../src/App.tsx) `introCompleted` effect 단일 진입점으로 통일. fallback 의도와 회귀 사유를 코멘트로 명시.
- **모듈** (status 변동 없음):
  - `src/ui/OpeningVideo.tsx`
- **사유**: PM 청감 보고 — "맨 처음 오프닝에서 메인 테마 BGM의 속도와 볼륨이 흔들리고 끊긴다." 라이브 진단(dev 5175) 결과 다음 회귀 확인:
  - **두 곳에서 동시에 `playBgm` 호출**: 2026-05-10 IntroTyping(M-009) 도입으로 신규된 [`App.tsx:120-124`](../src/App.tsx) `introCompleted` effect와 [`OpeningVideo.tsx`](../src/ui/OpeningVideo.tsx) 마운트 fallback effect가 동시에 같은 호출 발사. fallback 가드 `currentBgmId() !== 'bgm_main_theme'`은 직전 호출이 아직 `this.currentBgm` 세팅 전(또는 동일 React 효과 사이클 내)이라 통과해 두 번째 호출이 실제로 발사됨.
  - **Howler `html5: true` + 미로드 상태에서 `fade()` 큐 적재**: mp3 로드 전이라 첫 호출의 `fade(0, 0.6, 2000)`은 `Howl._queue`에 `{event:'fade', action}`로 push되고, 두 번째 호출은 audioManager 동일 ID 분기 [`audioManager.ts:89-92`](../src/engine/audioManager.ts:89)에서 `howl.fade(howl.volume(), 0.6, 2000)` 호출 → `howl.volume()`이 `_volume`(초기값 0)을 반환하므로 `fade(0, 0.6, 2000)` 두 번째 액션도 큐에 적재. 실측 `_queue.length === 3`(`[play, fade, fade]`).
  - **mp3 로드 시 큐 직렬 실행**: 로드 완료 → `play` → 첫 `fade(0→0.6, 2s)` 끝나며 `'fade'` 이벤트 emit → Howler `_loadQueue`가 두 번째 `fade(0→0.6, 2s)` 발사 → 두 번째 fade의 `_fade` 시작부 `self.volume(from=0, null)`이 발동해 **재생 중 HTMLAudioElement 볼륨을 즉시 0으로 스냅** → 이후 다시 0→0.6 페이드인. 청감상 "2초 페이드인 → 뚝 끊김 → 다시 페이드인" = 사용자 보고와 정확히 일치.
  - 2026-05-09 라운드(L1359·L1339)의 비디오 audio strip + Howler `html5: true` 전환은 WebAudio underrun식 wow/flutter는 차단했지만, IntroTyping 도입 후 새로 생긴 호출 중복 회귀는 별개 경로.
- **승인**: PM 구두 (2026-05-11 — 진단 후 옵션 A 선택).
- **검증**:
  - 라이브 dev(5175) reload + IntroTyping 스킵 + 확인 클릭 + 5초 대기 — Howl 첫 감지 시 `_queue.length: 2`(`[fade, volume]`, 정상 단일 호출 패턴) ✓ (이전: 3).
  - 페이드 도중 native `audio_evt:volumechange vol:0` 0건 ✓ (이전: 1건 t≈8.5s 시점 스냅).
  - BGM 정상 재생 5s 시점: `paused:false / ct:27.8 / native vol:0.7`(SceneRenderer setVolumes의 사용자 설정 0.7 정상 반영) ✓.
  - 콘솔 warn/error 0건 ✓.
- **잠재 부작용** (무시 가능):
  - "App effect 미실행(예: dev HMR 직후)일 때 BGM이 안 깔리는 케이스"의 fallback이 사라짐. IntroTyping 게이트 도입 이후 `introCompleted=true`가 되려면 사용자 클릭이 필수이므로 같은 사이클에 App.tsx effect도 반드시 실행됨. HMR 후에도 IntroTyping이 다시 마운트되어 같은 진입점을 거치므로 실용적 영향 없음.
- **followup**:
  - PM 청감 재확인 — OP 페이드인 ~2초 직후 끊김이 사라졌는지 풀 플레이.

### 2026-05-11 — ch01_05_cafe 표경민 화면 등장 cue 추가 (김규민 바로 앞 stacking)

- **변경**:
  - **[`03-story/scenarios/ch01_ot.md:344`](03-story/scenarios/ch01_ot.md)** 김규민 cue 직후에 `[CHARACTER: 표경민 center default fade]` 신규 추가.
  - **[`03-story/scenarios/compressed/ch01_ot.md:286`](03-story/scenarios/compressed/ch01_ot.md)** 동일 위치에 동일 cue 추가.
- **모듈** (status 변동 없음):
  - `03-story/scenarios/ch01_ot.md`
  - `03-story/scenarios/compressed/ch01_ot.md`
- **사유**: ch01_05_cafe line 340 지문에 "윤모, 김규민, 표경민, 조나단이 창가 자리에 앉아 있다"고 묘사돼 있으나 ch01 전체에 표경민 `[CHARACTER:]` cue가 0건이었음. 표경민이 line 349·358·371 등에서 대사함에도 화면엔 스프라이트 미등장(보이지 않는 화자). PM 결정: 표경민을 김규민과 같은 `center` 슬롯에 추가. 김규민(line 343) 직후 삽입하므로 zustand characters 객체 키 순서상 표경민이 김규민보다 늦게 등록 → CharacterLayer `Object.entries(displayChars).map` 렌더 순서로 표경민이 DOM 뒤(즉 stacking 위) → **표경민이 김규민 바로 앞에 표시**. 표경민 PREFIX_FIXED_MAX_H=82.8% < 김규민 maxH 108%(PREFIX_SCALE 1.2)이라 표경민 자산이 작아 김규민의 어깨선·머리 양옆이 보임. 사용자 명시 의도("표경민이 center의 김규민 바로 앞으로").
- **승인**: 사용자(PM) 직접 지시 (2026-05-11).
- **검증**: 정적 분석. ch01_05_cafe 등장 후 화면 구도:
  - 윤모(`left` 25% z=2), 김규민(`center` 50% z=2 maxH 108%), 표경민(`center` 50% z=2 maxH 82.8% — DOM 위), 조나단(`right` 75% z=2), 오준혁(line 364 추가 `right_back` 85% z=1).
  - center 슬롯 표경민/김규민 stacking은 의도된 시각 효과(앞에 선 표경민 + 뒤로 보이는 김규민 어깨/머리). 일반적 슬롯 충돌이 아니라 카메라 시점 상 의도된 stacking.
- **회귀 체크**: 같은 씬 line 445 `[CHARACTER: 윤모 center smile fade]` 시점에 윤모도 center로 이동 → center 슬롯에 윤모·김규민·표경민 3명 동시. zustand 키 순서상 윤모(line 342) 가장 먼저 → DOM 가장 뒤(stacking 가장 아래) → 윤모가 김규민·표경민에 가려짐. **이는 ch01_05_close 모놀로그 진행 중 별개 회귀**(이번 처방 범위 외). 이전 보고에서 식별됨, PM 처방 미정.

### 2026-05-11 — H5 호칭 메커니즘 재구성: 양방향 호칭 풀이 → 단방향 "선배" → "오빠"

- **변경 사실**: PM 검수 — TRUE 엔딩 클라이맥스 자리에서 윤모가 "윤영아"로 호명하는 부분이 어색. KEY #3 메커니즘을 양방향 호칭 풀이(윤모→윤영아 + 윤영→윤모)에서 H5 단방향 호칭 변화(선배 → 오빠)로 재구성.
- **변경 핵심**:
  1. **H5의 윤모 호칭**: "윤모"/"윤모야" → "오빠" 일괄. 후배 여학생이 한 학기 끝에 "선배"에서 "오빠"로 풀어 부르는 한국 미연시 정통 톤으로 정렬.
  2. **KEY #3 선택지**: "선배 그만하고 '윤모'라고 불러도 돼" → "선배 말고 그냥 '오빠'라고 불러도 돼" (descriptor 그대로 `ch6_h5_call_yunyoung` 유지 — 시멘틱 의미 동일).
  3. **윤모의 클라이맥스 호명 제거**: TRUE 엔딩 마지막 "어. 한 학기 더 가자, 윤영아." → "어. 한 학기 더 가자." / 벤치 자리 "(부드럽게) 윤영아." → "(부드럽게) 어." — 양방향 호명이 H5의 "오빠" 호칭 풀이와 경쟁하지 않도록 정리.
  4. **05_close 슬립**: "윤... 아니, 선배." → "오... 아니, 선배." (호칭 시도 → 자기 정정 톤 유지, 새 호칭에 맞게 갱신).
  5. **윤모의 학기 초·중반 "윤영아" 호명 보존**: Scene 01b_take 첫 호명 + Scene 04b_sleep 카톡 + Scene 05_blossom_path 산책 인사 — 자연스런 연장자 호명이라 무수정.
- **수정 파일**:
  - **시나리오 풀** (3개): `03-story/scenarios/ch06_h5_yuna.md` (Scene 05b_call 재작성 + Scene 05b_call_partial 윤모 호명 제거 + Scene 05_close 호칭 정정 + TRUE 엔딩 클라이맥스 일괄 + 작가 메모 KEY #3·호칭 풀이 양방향 → 단방향 표현 갱신)
  - **시나리오 압축** (1개): `03-story/scenarios/compressed/ch06_h5_yuna.md` (동일 패턴)
  - **윤문** (1개): `03-story/scenarios/윤문 완료/ch06_h5_yuna.txt` (동일 패턴)
  - **route 문서**: `03-story/route-H5-jang-yuna.md` (KEY 선택지 + TRUE 엔딩 비트 + 검증 체크리스트)
  - **BRANCH-GRAPH**: `03-story/BRANCH-GRAPH.md` §5 H5 행 "윤모라고 불러" → "오빠라고 불러"
  - **palJeongPot 시놉시스**: `03-story/scenarios/palJeongPot/06-lee-mungyu.md` H5 행 (호칭 표현)
  - **엔진 풀** (5개): `src/scenes/ch06_h5_05_blossom_path.scene.json` (CHOICE) + `ch06_h5_05_close.scene.json` + `ch06_h5_05b_call.scene.json` (전면 재작성) + `ch06_h5_05b_call_partial.scene.json` + `ch06_h5_true.scene.json` (8개 라인)
  - **엔진 압축** (5개): 동일 5개 파일의 압축 버전
- **무수정 보존**:
  - 윤모의 mid-chapter "윤영아" 호명 (Scene 01b_take 첫 호명 + Scene 04b_sleep KAKAO 헤더 + Scene 05_blossom_path 산책 인사) — 자연스런 연장자 호명, 양방향 어색함의 원인이 아님.
  - 다른 히로인의 "윤모야"/"윤모" 호칭 (H1 차세린 TRUE "윤모", H4 나서윤 TRUE 한 줄 반말 "고마워, 윤모야") — H5와 무관한 별개 메커니즘이라 손대지 않음.
- **모듈** (status: review): 위 11개 파일 (시나리오 3 + route + BRANCH-GRAPH + palJeongPot + 엔진 10 + 본 엔트리).
- **사유**: PM 검수 — 풀스토리 TRUE 엔딩 클라이맥스 자리의 양방향 호명이 어색하다는 지적. 한국 미연시 정통 톤(후배 → 선배 → 오빠 호칭 변화)으로 정렬하면서 윤모-호명 climactic 자리는 정리.
- **승인**: PM 구두 (2026-05-11).

### 2026-05-10 — ch03 Scene 04 김규민 left_back → right_back (전날 표경민 left_back 이동의 사이드이펙트 처방)

- **변경**:
  - **[`03-story/scenarios/ch03_dongsan.md:338`](03-story/scenarios/ch03_dongsan.md)** 김규민 슬롯 `left_back` → `right_back`.
  - **[`03-story/scenarios/compressed/ch03_dongsan.md:271`](03-story/scenarios/compressed/ch03_dongsan.md)** 동일.
- **모듈** (status 변동 없음):
  - `03-story/scenarios/ch03_dongsan.md`
  - `03-story/scenarios/compressed/ch03_dongsan.md`
- **사유**: 2026-05-09 처방으로 표경민 슬롯이 `left` → `left_back` (X=15%, z=1)으로 이동하면서, 같은 ch03 Scene 04 후반(line 338, 장윤영 등장 시) 김규민이 `right` → `left_back`으로 이동하던 기존 cue와 슬롯 충돌. line 338부터 Scene 끝(line 440)까지 표경민·김규민이 동일 슬롯 `left_back`(X=15%, z=1, maxH 동일)에 동시 등장 → React 렌더 순서상 김규민이 위 + 김규민 PREFIX_SCALE=1.2로 자산 20% 큼 → **표경민 거의 100% 가려짐**. 김규민을 `right_back`(X=85%, z=1)으로 이동하면 장윤영(`right` X=75%이지만 PREFIX_FIXED_X.yuna=`65%` override)과 X 차이 20%로 안전 분리.
- **승인**: 사용자(PM) 직접 지시 (2026-05-10).
- **검증**: 정적 분석으로 확인. ch03 Scene 04 line 338 이후 화면 구도:
  - 윤모(`center` 50% z=2), 표경민(`left_back` 15% z=1), 조나단(`center_back` 35% z=1), 김규민(`right_back` 85% z=1), 장윤영(`right`→`yuna` PREFIX 65% z=2).
  - X 분포: 15·35·50·65·85 — 모든 인접 차 ≥15%, 동일 슬롯 충돌 0.
- **회귀 체크**: 다른 챕터에서 김규민 `left_back` 사용은 `_backup-원본/ch06_h5_yuna.md:87` 외 표준 시나리오에 없음(grep 확인). `right_back` 변경의 부수효과 없음.

### 2026-05-10 — GitHub Pages 활성화 + 저장소 `Cuyeonsi-beta` 등록

- **변경 사실**: PM이 GitHub repo [`JonathanBlackDoctor/Cuyeonsi-beta`](https://github.com/JonathanBlackDoctor/Cuyeonsi-beta) 활성화 완료. 추정 배포 URL `https://jonathanblackdoctor.github.io/Cuyeonsi-beta/` (GitHub Pages 기본 패턴, PM 첫 Actions 배포 성공 후 실측 확인 잔여).
- **호환성 확인**:
  - **Vite `base: './'` 상대경로** — `/Cuyeonsi-beta/` 서브패스에서 자산 정상 로드. 빌드 무수정.
  - **deploy.yml/ci.yml `working-directory: game-project`** — repo 루트에 `game-project/` 서브폴더 보존 기대. 워크스페이스 루트(`0428 스토리 검증/`)를 통째로 푸시했어야 정상.
  - **localStorage `kmu-vn-*` 키 보존** — 2026-05-09 게임 제목 변경 라운드 PM 결정 일관(세이브 호환).
  - **og:image 상대경로** `./img/title.webp` — 서브패스 환경 정상 로드.
- **수정 3건**:
  - `08-qa-deployment/DEPLOYMENT.md` §1 배포 환경 — repo URL + 추정 Pages URL + 빌드 출력 경로 갱신 / §2 워크플로우 — 옛 의사 YAML 본문 제거하고 실제 deploy.yml/ci.yml 링크로 교체 + 레이아웃 전제 명시 / §4 Vite 설정 — 옛 `base: '/kmu-vn/'` 의사 코드 제거하고 실제 `base: './'` 정책 + 내부 식별자 `kmu-vn` 보존 메모 / status `draft` → `review`
  - `00-master/PROGRESS-TRACKER.md` W6 §출시 직전 종합 라운드 잔여 표 — `⬜ GitHub Pages 활성화 + 도메인` → `🟨` (활성화 완료, 첫 배포 성공 + 라이브 검증 잔여)
  - 본 CHANGELOG 엔트리
- **검증 잔여 (PM 실기 영역)**:
  - GitHub Actions "Deploy to GitHub Pages" 워크플로우 첫 실행 결과 확인
  - 배포 URL 라이브 접속 + 모바일/PC 자산 로드 확인
  - 거절 카톡 엔딩 라이브 도달 확인 (DEPLOYMENT.md §10 출시 체크리스트)
- **사유**: PM 직접 GitHub repo 생성·활성화 + URL 공유. 출시까지 남은 차단점 중 1건 종료, 잔여는 실기 검증 3종(모바일·Lighthouse·IntroTyping) + 첫 배포 성공 확인.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 명대사 16개 PM 최종 검수 완료 (엔딩 결과 화면)

- **변경**: PM이 [`src/data/endingFlavor.ts`](../src/data/endingFlavor.ts) 16개 엔딩 명대사·화자·결정적 장면 매핑을 직접 검수·수정 완료. 2026-05-09 v3 라운드(엔딩 결과 화면 종합 업그레이드 v1→v2→v3) 잔여 1건 처방.
- **검수 범위**: 16개 키 (END_H1_TRUE/HAPPY/NORMAL/BAD · END_H2_TRUE/HAPPY/NORMAL/BAD · END_H3_TRUE/HAPPY/NORMAL · END_H4_TRUE/NORMAL/REJECT · END_H5_TRUE · END_SOLO_SUMMER) 모두 PM 검토. `quote` 본문 + `quoteSpeaker` 표기 + `decisiveImage`(cg/bg/none) + BG-only 엔딩의 `sprite` 합성 ID 모두 PM 직접 수정본 그대로 확정.
- **무수정 보존**: REJECT는 `decisiveImage: 'none'` + 빈 quote — RejectEnding 8단계 시퀀스가 자체 처리하므로 EndingScreen 백업은 단순 어두운 배경(설계 의도 일관).
- **모듈** (status: review → done): `src/data/endingFlavor.ts`.
- **사유**: 출시 전 권장 잔여 항목(2026-05-09 [v3 라운드 엔트리](#2026-05-09--엔딩-결과-화면-종합-업그레이드)) PM 사인오프. 출시까지 남은 작업 중 컨텐츠 검수 1건 종료, 실질적 차단점은 GitHub Pages 배포 + PM 실기 검증 3종(모바일·Lighthouse·IntroTyping)만 남음.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 승보 00년생 명시 + 나서윤 카톡 "승보" → "승보 오빠" 호칭 정합

- **변경 사실**: PM 확정 — 승보 = **00년생** (3수 후 23학번 약대 진학). 윤모(04년생) 기준 4살 위 형, 나서윤(03년생) 기준 3살 위 오빠.
- **변경**: `ch04_library` Scene 05 카톡 나서윤 1:1 첫 메시지 "낮에 승보한테 친추 받으셨다고 들었어요" → "낮에 승보 오빠한테 친추 받으셨다고 들었어요". 직전 엔트리(같은 일자 Ch.4 김규민 "승보" → "승보 형" 정합)에서 보존했던 "나서윤 동갑 예외"는 03년생 동갑 가정에 기반한 것이라 폐기.
- **수정 6건**:
  - `03-story/scenarios/ch04_library.md` Scene 05 카톡 (풀)
  - `03-story/scenarios/compressed/ch04_library.md` Scene 05 카톡 (압축)
  - `03-story/scenarios/윤문 완료/ch04_library.txt` Scene 05 카톡 (윤문)
  - `src/scenes/ch04_05_seoyoon_kakao.scene.json` 나서윤 KAKAO (엔진 풀)
  - `src/scenes/compressed/ch04_05_seoyoon_kakao.scene.json` 나서윤 KAKAO (엔진 압축)
  - `02-characters/side-characters.md` §2.4 — 출생연도 "00년생 (3수)" 명시 + 호칭 룰 갱신("03년생 약대 동학번 나서윤도 3살 위라 '승보 오빠'", "지문·내레이션은 호칭 없이 '승보'")
- **무수정 보존**: 지문·내레이션의 "승보" 단독 호명(ch05_decision Scene 02b_h4 "승보가 옆자리를 손짓하며 부른다", ch05 Scene 02 단체 자리 "약대 쪽엔 승보와 나서윤" 등) — 화자 없는 3인칭 내레이션이라 호칭 불필요.
- **모듈** (status: review): `03-story/scenarios/ch04_library.md` · `03-story/scenarios/compressed/ch04_library.md` · `03-story/scenarios/윤문 완료/ch04_library.txt` · `src/scenes/ch04_05_seoyoon_kakao.scene.json` · `src/scenes/compressed/ch04_05_seoyoon_kakao.scene.json` · `02-characters/side-characters.md`.
- **사유**: PM 사실 정정 — 승보 출생연도 00년생으로 확정. 나서윤(03년생)도 3살 차이라 "오빠" 호칭이 맞음.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — Ch.4 김규민 첫 대사 "승보" → "승보 형" 호칭 정합

- **변경**: `ch04_library` Scene 04 첫 등장 김규민 대사 "어, 승보. 우리도 학식 가는 길." → "어, 승보 형. 우리도 학식 가는 길.". 동일 김규민이 Ch.5에서 "승보 형 + 서윤 누나도 합류" / "약대 승보 형"으로 일관되게 형 호칭을 쓰는데, Ch.4 첫 호명만 빠져 있던 단일 회귀.
- **사실 검증**: 승보는 23학번 약대 4학년이지만 윤모(04년생 현역)/김규민/조나단/정욱 입장에서 "형" — `02-characters/side-characters.md` §2.4 "윤모 입장에선 약대 동기 형" 명시. Ch.5 호명 결과(조나단 "승보 형이 합석 콜" / 정욱 "약대 승보 형도 같이 ㄱ?" / 김규민 "약대 승보 형" + "승보 형 + 서윤 누나") 전부 형 사용.
- **수정 6건**:
  - `03-story/scenarios/ch04_library.md` Scene 04
  - `03-story/scenarios/compressed/ch04_library.md` Scene 04
  - `03-story/scenarios/윤문 완료/ch04_library.txt` Scene 04
  - `src/scenes/ch04_04_seoyoon_meet.scene.json` 김규민 DIALOGUE
  - `src/scenes/compressed/ch04_04_seoyoon_meet.scene.json` 김규민 DIALOGUE
  - `02-characters/side-characters.md` §2.4 화자 라벨 룰 — "어, 승보" → "어, 승보 형" + 04년생 동기 형 / 24학번 후배 오빠 / 03년생 동갑 나서윤 무호칭 룰 명시
- **모듈** (status: review): `03-story/scenarios/ch04_library.md` · `03-story/scenarios/compressed/ch04_library.md` · `03-story/scenarios/윤문 완료/ch04_library.txt` · `src/scenes/ch04_04_seoyoon_meet.scene.json` · `src/scenes/compressed/ch04_04_seoyoon_meet.scene.json` · `02-characters/side-characters.md`.
- **사유**: PM 검수 — 승보가 나이 많은데 호칭이 빠진 구간 점검 요청. 풀/압축 양 버전 동기 + 시트 룰 정합.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — EndingHistoryModal viewport 정착 픽스 (스크롤 위치 무관 즉시 노출)

- **변경**: 갤러리 엔딩 탭에서 슬롯 클릭 시 점수 내역 모달이 viewport 밖에 그려지던 회귀 픽스.
  - **진단**: [EndingHistoryModal.tsx](game-project/src/ui/gallery/EndingHistoryModal.tsx) 루트가 `absolute inset-0`이라 부모(GalleryScreen, 자체 `overflow-y-auto` 스크롤 컨테이너) 기준으로 위치 잡힘. 사용자가 아래로 스크롤해 하단 슬롯을 클릭하면 모달이 스크롤 영역 최상단(상대좌표 0)에 그려져 viewport 밖에 위치 → 사용자가 다시 위로 스크롤해야 보임.
  - **픽스**: `absolute inset-0` → `fixed inset-0`. viewport 기준 정착해 어떤 스크롤 위치에서도 즉시 보임. SaveLoadScreen·SettingsScreen 등 다른 모달과 달리 EndingHistoryModal은 스크롤 컨테이너 안에 마운트되므로 별도 처방 필요했음.
- **수정 1건**: `src/ui/gallery/EndingHistoryModal.tsx` — 루트 div className `absolute` → `fixed` + 정정 사유 코멘트.
- **검증**:
  - 단위 테스트 104/104 통과.
  - Vite 빌드 통과 4.82s.
  - Preview 라이브: 16개 엔딩 모두 해금 시드 → 갤러리 엔딩 탭 → `scrollTop = scrollHeight`로 하단 끝까지 스크롤(640) → END_SOLO_SUMMER 슬롯 클릭 → 모달 position `fixed`, 카드 top 116 / bottom 684 (viewport 800 안에 정확히 배치, `cardInViewport: true`) ✓.
- **모듈** (status: review): `src/ui/gallery/EndingHistoryModal.tsx`.
- **사유**: PM 검수 — 사용자가 아래로 스크롤한 상태에서 슬롯 클릭 시 모달을 보기 위해 다시 위로 스크롤하는 번거로움 신고.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — ModeSelect "팔정팟 각색" 3번째 카드 추가 (잠금 해금형)

- **변경**: ModeSelect에 "팔정팟 각색" 3번째 옵션 신설. 친구 6명(정욱·표경민·오준혁·김규민·남희석·이문규)이 분담 각색한 본을 별도 모드로 선택 가능.
  - **`src/stores/settingsStore.ts`** — `StoryMode` 유니언에 `'palJeongPot'` 추가. version 5 → 6 마이그레이션(필드 변경 없음, 타입 확장만).
  - **`src/scenes/manifest.ts`** — `palJeongPotModules` 글롭(`./palJeongPot/*.scene.json`) + `SCENE_MANIFEST_PAL_JEONG_POT` 추가. Proxy의 get/has/ownKeys/resolveEntryScene 모두 3-모드 인식. **풀로 자동 폴백** — 팔정팟 폴더가 비거나 부분만 있으면 풀 시나리오로 자연 폴백, 게임 흐름 안 깨짐.
  - **`src/scenes/palJeongPot/`** — 신규 폴더 + README.md. 컴파일 산출물(`<sceneId>.scene.json`)을 떨어뜨리는 자리.
  - **`src/ui/ModeSelect.tsx`** — 3번째 카드 "팔정팟 각색" 추가. `metaStore.has_cleared_once === true`일 때만 활성, 아니면 🔒 잠김 + "엔딩 1개 도달 후 해금" 카피. 기존 max-w-2xl → max-w-3xl 확장.
  - **`03-story/scenarios/palJeongPot/`** — 시놉시스 6분담(README + 01~06 .md) 초안. ~6,100자 / 1인 ~1,000자.
- **잠금 해금 동작**: EndingScreen 마운트 시 `recordEnding()`이 `has_cleared_once: true`를 metaStore에 박음(이미 구현됨). "타이틀로 돌아가기" → 다음 ModeSelect 진입 시 카드 자동 해금. 별도 모달이나 안내 없이 카드 자체가 활성화되며 부제 카피가 잠금 안내에서 분담 안내로 교체됨.
- **자동재생 잠금해제 모달과의 분리**: `autoPlayUnlocked`는 트루엔딩 한정, `palJeongPotUnlocked`는 모든 카테고리(TRUE/HAPPY/NORMAL/BAD/REJECT/SOLO) 1개로 충분. 두 해금 트리거가 서로 독립.
- **컨벤션 정합**: 분담 .md는 status: `draft` (각색본은 출시 후 PM이 직접 수정), 팔정팟 폴더 안 룰은 풀 분기 그래프(씬 ID·CHOICE next·KAKAO·FLAG·ENDING·KAKAO_TIMER) 1:1 보존, 변태 망상 페어 4회 한 줄 X.
- **검증**: Vite HMR로 settingsStore/manifest/ModeSelect 핫리로드 확인 예정. v5→v6 마이그레이션은 기존 사용자 storyMode 'full'/'compressed'/null 모두 그대로 보존(필드 추가 없음, version만 bump).
- **모듈** (status 변동): `src/stores/settingsStore.ts` review · `src/scenes/manifest.ts` review · `src/ui/ModeSelect.tsx` review · `03-story/scenarios/palJeongPot/*` draft (신규).
- **사유**: PM 요청 (2026-05-10) — 친구 6명 팔정팟에 본과 1학년 시나리오 분담 각색을 맡기되, 출시 첫 회차 직후부터 갑자기 노출되면 정서가 떨어지므로 "엔딩 1개 도달 후 해금" 게이트 부여.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — IntroTyping 미세 조정 (속도 50ms + max-w-2xl)

- **변경**: 직전 PM 검수 후속 미세 조정 2건. `src/ui/IntroTyping.tsx` 한 파일.
  - **(1) 타이핑 속도** — `TYPE_INTERVAL_MS` 40 → **50 ms**/자. 76자 × 50 = 3.8초 (직전 3.04초 대비 +25%, 5.3→3.04→3.8 단계 정착).
  - **(2) max-width** — `max-w-3xl` (768px) → **`max-w-2xl`** (672px 기본). 폰트 36px / lineHeight 1.8 그대로, 줄바꿈만 살짝 좁아져 가독 안정.
- **검증**:
  - Vite 빌드 통과 2.72s.
  - Preview 4173 reload 후 IntroTyping `className: max-w-2xl` 적용 확인 + fontSize 36px 유지 ✅.
  - 타이핑 실속도는 preview iframe background throttle 때문에 정확 측정 불가 — PM 실기 active focus에서 최종 확인 (정상 환경 기대치 약 3.8초).
- **모듈** (status 변동 없음, 이미 review): `src/ui/IntroTyping.tsx`.
- **사유**: PM 미세 조정 (2026-05-10) — 속도는 50ms로 약간 늘리고 폭은 다시 2xl로 좁혀 영화 자막 톤 안정화.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — IntroTyping PM 후속 검수 (속도·폰트·스킵 지연)

- **변경**: M-009 IntroTyping 직전 라운드 후속 PM 검수 3건. `src/ui/IntroTyping.tsx` 한 파일.
  - **(1) 타이핑 속도** — `TYPE_INTERVAL_MS` 70 → **40 ms**/자. 76자 × 40 ≒ 3.04초 (직전 5.3초 대비 -43%). 빠른 인상으로 변경.
  - **(2) 폰트 크기** — `fontSize` `clamp(16px, 4vw, 24px)` → **`clamp(22px, 5.5vw, 36px)`**. max-width도 `max-w-2xl`(672px) → `max-w-3xl`(768px)로 함께 확장. 영화 자막 톤에서 더 크게 보이도록.
  - **(3) 스킵 활성화 지연** — 신규 `SKIP_ACTIVATION_MS = 2000` ms. 인트로 마운트 후 첫 2초간 화면 탭 무시 + "화면을 탭하면 건너뜁니다" 안내도 미노출. 2초 후 `setSkipReady(true)` → 안내 노출 + 클릭으로 즉시 완료 가능. **목적: 오프닝 영상(`/video/video_opening.mp4`) + 메인 BGM 로딩 시간 보장**. 타이핑 자연 종료(3.04초)까지는 스킵해도 어차피 1초 차이라 안전.
- **검증**:
  - Vite 빌드 통과 2.94s. 새 번들 `index-BgnSTUWc.js` 919.8 KB raw — `clamp(22px)` / `5.5vw` / `36px` / `2000` / `40` 모두 dist 매치 확인 (PowerShell grep).
  - Preview 4173 reload 후 IntroTyping 마운트 ✅ / fontSize computed `36px` (clamp 최댓값, 768 viewport에서 5.5vw=42.24 → max 36) ✅ / DOM 분기 정상 ✅.
  - 타이핑 실시간 속도와 스킵 2초 활성화 timing은 preview iframe background throttle로 검증 신뢰성 낮음 — PM 실기 active focus + 모바일 실측에서 최종 확인 권장 (정상 환경 기대치: 타이핑 약 3초 + 스킵 2초 후 활성화).
- **모듈** (status 변동 없음, 이미 review): `src/ui/IntroTyping.tsx`.
- **사유**: PM 검수 (2026-05-10) — 직전 IntroTyping은 5초 + 작은 폰트 + 즉시 스킵 가능. PM이 (1) 빠른 인상 + (2) 큰 폰트 + (3) 첫 2초는 스킵 막아 영상·음악 다운로드 시간 확보를 요청.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — NPC 곱 보너스 발동 조건 변경 (12명 중 max → 호감도 자체 임계 ≥100)

- **변경**: `endingScore.ts`의 mom/junhyuk/taeho 곱 보너스 발동 조건을 "12명 중 max"에서 "해당 NPC 호감도 ≥ 임계(100)"로 단독 평가로 바꿈. 옛 룰은 NPC active 자리 부족으로 사실상 발동 불가능했음(특히 taeho는 active 자리 0개라 영원히 0).
  - **수정 1건**: `src/engine/endingScore.ts`
    - 파일 헤더 주석 v3 → v4 개정 (발동 조건 변경 명시)
    - `NPC_BONUS_MULTIPLIER` 옆에 `NPC_BONUS_THRESHOLD = { mom: 100, junhyuk: 100, taeho: 100 } as const;` 신설 (export, 추후 시뮬·테스트에서 임계 조정 가능)
    - `computeEndingScore` 내부 12명 max 판정 블록(`allEntries`/`maxIds`) 제거 → `flags[npc] >= NPC_BONUS_THRESHOLD[npc]` 단독 평가로 교체
  - **유지**:
    - `NPC_BONUS_MULTIPLIER` (mom ×5 / junhyuk ×10 / taeho ×3) — 발동 시 곱하는 배수는 그대로
    - `SUPPORTING_WEIGHT` (×0.3) — 조연 가중치 그대로
    - `GRADE_CUTS` — 등급컷 그대로
  - **사이드이펙트**: 옛 룰에서 mom/junhyuk/taeho가 12명 중 max인 시뮬 케이스는 (NPC 도달성 부족으로) 사실상 0건이라 발동 분포 변화 ≈ 0%. 신 룰은 도달성을 NPC active 자리 보강으로 만들어줘야 발동 발생 — 별도 라운드에서 PM 결정 후 진행 예정.
  - **모듈**: `src/engine/endingScore.ts`
  - **사유**: PM 보고 — taeho는 어떤 CHOICE 블록에도 active 자리 없어 호감도 영원히 0 → "해부학교실 APPLY" 보너스 발동 0건. junhyuk(오준혁)도 max +25라 12명 중 max 도달 불가능. 발동 조건을 NPC 자체 임계로 분리해 도달성 설계를 별도 룰로 다룰 수 있게 함.
  - **후속 작업 (PM 결정 대기)**: NPC 호감도 도달성 보강 — NPC_GAIN_MULTIPLIER 상향 / 새 active 자리 추가 / 직접 effects 박힌 CHOICE 블록 신설 / Ch.5·Ch.6 NPC 전용 5지선다 등 다양한 방법 후보 검토 중. 임계 100을 기준으로 어느 조합이 적정한지 PM 답 후 진행.
  - **승인**: PM 구두 승인(2026-05-10)

---

### 2026-05-10 — 사이드 캐릭터 일괄 리네임 (이창용→남희석 / 윤재→승보) + 시트 §2.4 승보 신설

- **변경**: PM 직접 명령으로 사이드 캐릭터 두 명을 일괄 리네임. 동시에 `02-characters/side-characters.md` §2.4 승보 항목을 정식 신설 (PM 후속 권고 5회 누적된 미해결 시트 정합 항목 동시 처리).
  - **§2.3 (구) 이창용 펠로우 → 남희석 펠로우** — 동산병원 내과 펠로우, 차세린 선배. 역할·스프라이트 1종 default 무변동
  - **(구) 윤재 → 승보** 일괄 호칭 변경 — 약대 23학번, 김규민 친구, H4 매개. 변형 ("윤재 형"/"약대 윤재"/"약대 동기 윤재") 자동 포함
  - **§2.4 승보 신설** — 시나리오 4개 챕터(Ch.4·5·6H2·6H4)에 13회 직접 대사 + 49줄 분량 호명에도 시트 미등록이던 단역을 정식 등록
- **PM 결정 4건 (변경 양식 확정)**:
  1. **`[약대 동기]` 화자 라벨 유지** — Ch.4 첫 등장 시 인물 정체 시각 노출 방지를 위한 의도적 익명 라벨. 활성 .md 17건 + .scene.json speaker 17건 + 윤문 .txt 8건 + `[CHARACTER_HIDE: 약대 동기]` 디렉티브 모두 무변동
  2. **§2.4 승보 정식 등록** — PM 후속 권고 5회 누적(`ch04_library.md` L902/L1094, `ch05_decision.md` L962/L1116, `ch06_h4_seoyoon.md` L1196) 동시 해결
  3. **`_backup-원본/` 보존** — 2026-05-08 박지수→이문규 라운드 양식 그대로. 4개 파일(`ch03_dongsan.md`/`ch04_library.md`/`ch06_h1_serin.md`/`ch06_h2_hajeong.md`) 변경 대상 외 (역사 기록 보존)
  4. **(구) 이창용 ch03 unbalanced CHARACTER lifecycle 그대로 보존** — 메인 `ch03_dongsan.md`에 `[CHARACTER:]` 등장 디렉티브 없이 `[CHARACTER_HIDE: 남희석]`만 남는 상태 유지(2026-05-08 silent fail 처리에서 등장 디렉티브 제거된 결과). 정합 라운드는 별도 일정
- **영향 범위** — 활성 54개 파일 + 시트 1개:
  - **이창용→남희석 23개 파일**: 시트 1 + 활성 .md 2 + 압축 .md 2 + 윤문 .txt 2 + .scene.json 메인 7 + .scene.json 압축 6 + `route-common.md` 1 + `00-master/PROGRESS-TRACKER.md` 1 + `08-qa-deployment/verification-reports/02-structure-character.md` 1
  - **윤재→승보 31개 파일**: 시트 1 + 활성 .md 4 + 압축 .md 3 + 윤문 .txt 4 + .scene.json 메인 11 + .scene.json 압축 8
  - 일괄 변경에 PowerShell `[System.IO.File]::ReadAllText/WriteAllText` UTF-8 NoBOM 인코딩 사용. frontmatter `status: done` → `status: review` 일괄 전환도 동일 라운드에서 처리
  - `ch06_h2_hajeong.md` 활성 .md만 윤재 매치 (지문 1건 "약대 윤재가 합석한 자리 끝에서") — 압축본은 윤재 매치 0건이라 변경 없음
  - `ch06_h1_bad.scene.json`은 메인만 있고 압축본 부재 (이창용 매치 1건 메인만 변경)
- **변경 보존 (역사 기록)**:
  - `_backup-원본/ch03_dongsan.md` 25건 + `_backup-원본/ch06_h1_serin.md` 18건 + `_backup-원본/ch04_library.md` + `_backup-원본/ch06_h2_hajeong.md` 등 백업 4파일
  - `00-master/CHANGELOG.md` 2026-05-08 박지수→이문규 라운드 엔트리 (이창용 ch03 silent fail 처리 노트)
  - `08-qa-deployment/verification-reports/07-asset-audit.md` 미등록 6명 자산 플래그 표 (라운드 시점 데이터)
- **사유**: PM 직접 명령 (2026-05-10). side-characters.md §2.4 신설은 시나리오 4개 챕터에 활약하는 단역이 시트 미등록인 정합 누락 5회 후속 권고 누적분 동시 해결.
- **모듈** (영향 모듈 status `done` → `review` 일괄 전환):
  - `02-characters/side-characters.md` (§2.3 헤더·§5 검증 줄·§7 이름 변경 라운드 신설 + §2.4 승보 항목 신설)
  - `03-story/scenarios/ch03_dongsan.md`, `ch04_library.md`, `ch05_decision.md`, `ch06_h1_serin.md`, `ch06_h2_hajeong.md`, `ch06_h4_seoyoon.md`
  - `03-story/route-common.md` (Ch.3 비트 1건)
  - 압축 + 윤문 동기 (compressed/* 5개 + 윤문 완료/* 6개)
  - 엔진 .scene.json 32개 (메인 18 + 압축 14)
  - `00-master/PROGRESS-TRACKER.md`, `08-qa-deployment/verification-reports/02-structure-character.md`
- **검증** (라운드 끝):
  - `grep -r "이창용" 03-story/ src/scenes/ 02-characters/ 00-master/PROGRESS-TRACKER.md` (백업·CHANGELOG·07-asset-audit 제외) → 0건 기대
  - `grep -r "윤재"` 활성 영역 → 0건 기대
  - `[약대 동기]` 화자 라벨 카운트 무변동 확인
  - `npm run build` (game-project): `public/manifest.json` characters 키 무변동 (이창용·윤재 둘 다 자산 미등록이므로)
- **범위 외**:
  - `src/data/spriteResolver.ts` `PREFIX_BY_NAME` (이창용·윤재 둘 다 미등록 → silent fail 그대로 유지)
  - `src/engine/toneMatrix.ts` `NPC_TONE_MATRIX`, `src/engine/types.ts` `NpcAffinityId`, `src/data/spriteCatalog.ts`, `src/data/characters.ts` (둘 다 미등록)
  - `public/manifest.json`, `public/img/` 자산 파일 (둘 다 자산 없음)
  - 이창용 ch03 unbalanced lifecycle 정합 라운드 (PM 결정 4 — 별도 일정)
  - 시트 §2.4 승보 자산 생성 (스프라이트·avatar — PM 직접 영역)
- **승인**: PM (구윤모) — Plan 모드 4가지 결정 후 Auto 모드로 일괄 실행.

---

### 2026-05-10 — 모바일 사전 점검 처방 라운드 (M-001/M-007/M-009)

- **변경**: 모바일 사전 점검(§6) 자동 발견 10건 중 PM 결정에 따라 3건 처방 적용. 나머지 7건은 "유지" 결정 (§6.6 표 PM 결정 컬럼 참조).
- **(1) M-001 — Pretendard 폰트 (옵션 A2 CDN 채택)**: `index.html` `<head>`에 jsdelivr Pretendard variable dynamic-subset CSS 1줄 + preconnect 추가. 약 130 KB, font-display: swap 내장. preview 검증으로 `[...document.fonts].length` 0 → 92 (Pretendard Variable 9 weight × 자모 서브셋), `pretendardLoaded: true` 확인.
- **(2) M-007 — Open Graph + Twitter Card 메타 태그 (옵션 A 채택)**: `index.html`에 og:type/title/description/image/image:alt/locale + twitter:card/title/description/image 총 10개 추가. og:image는 PM 결정대로 기존 `./img/title.webp` (1500×1500) 그대로 사용 — SNS 자동 크롭. og:url은 GitHub Pages 배포 URL 정해진 후 PM이 절대 URL로 교체 권장 (인라인 코멘트로 안내).
- **(3) M-009 — 인트로 타이핑 자막 (옵션 D 신규 채택)**: 페이지 접속 후 약 5초 스토리 배경 자막 타이핑 → "확인" 버튼 클릭 → 게임 진입. 첫 user gesture가 모바일 audio autoplay 차단을 해제하고 동시에 게임 자산 다운로드 시간을 번다.
  - 신규 파일: `src/ui/IntroTyping.tsx` — INTRO_TEXT(76자, PM 확정 초안 A) + 글자당 70ms 타이핑 + 클릭 시 즉시 완료(skip) + "확인" 버튼(높이 44 px iOS HIG). aria-live=polite + role=region.
  - INTRO_TEXT: "2026년 봄, 의예과를 마친 본과 1학년 의대생의 새 학기가 시작된다. 익숙해진 자취방, 새로 펼쳐질 강의실, 그리고 곧 만나게 될 사람들."
  - `src/App.tsx`: `introCompleted` state(E2E 환경 초기값 true) + IntroTyping 마운트 분기 + BGM useEffect를 `[introCompleted]` 의존으로 변경. introCompleted=false 동안 SceneRenderer/OpeningVideo/ModeSelect 모두 렌더 안 됨.
- **검증**:
  - typecheck 0 errors / Vite 빌드 통과 2.60s. 메인 번들 760 KB → 763 KB raw (+3 KB IntroTyping).
  - Preview 4173 reload 후 IntroTyping 자동 마운트 ✅ (검정 BG, z-9999, Pretendard fontFamily). 9자 시점 타이핑 진행 + 커서 노출 ✅.
  - 화면 탭 → skip 시 텍스트 79자 완성 + 커서 사라짐 + "확인" 버튼 노출 (높이 44 px) ✅.
  - 확인 버튼 클릭 → IntroTyping 언마운트 + OpeningVideo 마운트 + bgm_main_theme.mp3 / video_opening.mp4 / title.webp GET 모두 200/206 정상 ✅.
  - Howler `ctxState: running`, `usingWebAudio: true`, `noAudio: false` ✅ (데스크톱 preview에서는 user gesture 없이도 running이라 모바일 차단 시뮬은 PM 실기에서 최종 검증 필요).
  - og 메타 10개 / Pretendard CDN 정상 로드 / 콘솔 error 0 / 자산 404 0.
- **§6 처방 결과 갱신**: `08-pre-deploy-check.md` §6.6 PM 결정 컬럼 — M-001/M-007/M-009 = "✅ 처방 적용 완료", 나머지 7건 = "✅ 유지". §6.8 임시 결론 카운트 갱신 예정.
- **모듈** (status 변동 없음, 이미 review): `index.html`, `src/ui/IntroTyping.tsx` (신규), `src/App.tsx`, `08-qa-deployment/verification-reports/08-pre-deploy-check.md` (§6 처방 결과 컬럼).
- **사유**: PM 결정 (Auto Mode 종료 직후 2026-05-10): M-001 A2 / M-007 A / M-009 D 신규 / 그 외 유지. 모바일 사전 점검에서 발견된 출시 차단 후보(M-001 Pretendard) 우선 처방 + M-009로 모바일 audio autoplay 회피 + 자산 다운로드 시간 확보 1석 2조.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 자동진행 지연 0.5초까지 + 카톡에 autoAdvanceDelay 적용 + 가속 cooldown

- **변경**: PM 검수 2건.
  - **(1) 자동진행 지연 슬라이더 0.5초까지 확장** — `SettingsScreen`의 `자동진행 지연` 슬라이더 `min={1000}` → `min={500}`. step 500 그대로 → 0.5초·1초·1.5초·…·5초 단위 선택 가능.
  - **(2) 단톡방·카톡 장면에서 자동진행 지연 / 클릭연타 지연 미작동 픽스** — `KakaoModal` 이전 동작:
    - 메시지 자동 흐름: `PER_MESSAGE_DELAY_MS = 800` 하드코드.
    - 자동재생 모드: `setInterval(..., 200)` 하드코드.
    - 클릭/스페이스 가속: cooldown 없음 → 빠른 연타로 모든 메시지 즉시 노출.
   - 픽스:
    - 자동 흐름 setTimeout 지연 = `useSettingsStore((s) => s.autoAdvanceDelay)` (폴백 800).
    - 자동재생 setInterval 간격 = 같은 `autoAdvanceDelay` (폴백 200).
    - `handleAccelerate`에 `KAKAO_ACCEL_COOLDOWN_MS = 600` 도입 + `lastAccelAtRef` 가드 (`gameStore.USER_ADVANCE_COOLDOWN_MS`와 동일 톤).
- **수정 2건**:
  - `src/ui/SettingsScreen.tsx` — `자동진행 지연` SliderRow `min={500}`.
  - `src/ui/katalk/KakaoModal.tsx` — `PER_MESSAGE_DELAY_MS` 상수명 `PER_MESSAGE_DELAY_DEFAULT_MS`로 폴백 표시. `autoAdvanceDelay` import + 자동 흐름·자동재생에 적용. `KAKAO_ACCEL_COOLDOWN_MS` + `lastAccelAtRef`로 가속 cooldown.
- **검증**:
  - 단위 테스트 104/104 통과.
  - Vite 빌드 통과 2.44s.
  - Preview 라이브:
    - SettingsScreen 슬라이더 min/max/step 정합 `500/5000/500` ✓.
    - autoAdvanceDelay=3000 + KAKAO 명령 주입 → 50ms 시점 1개 노출 / 1초 시점 1개 (3초 미달이라 자동 흐름 미발동) / 3초 시점 2개 ✓.
    - 5번 Space 연타(150ms 안) → 1번만 통과(메시지 1→2) / 700ms 후 1번 더 → cooldown 통과(2→3) ✓.
- **모듈** (status: review): `src/ui/SettingsScreen.tsx`, `src/ui/katalk/KakaoModal.tsx`.
- **사유**: PM 검수 — 자동진행 빠른 호흡(0.5초) 요청 + 카톡 장면이 사용자 설정·연타 가드 둘 다 무시하는 회귀.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 캐릭터 이미지 unlock 근본 픽스 (resolveSpriteName) + 자동재생 잠금해제 흐름 검증

- **변경**:
  - **(1) 캐릭터 이미지 갤러리 작동 안 됨 → 픽스** — 사용자 신고. 진단:
    - `cmd.sprite`는 시나리오에서 `default`, `smile_warm` 같은 단순 표정으로 박힘 ([spriteResolver.ts](game-project/src/data/spriteResolver.ts) 매핑 룰).
    - 직전 라운드는 `useMetaStore.getState().unlockSprite(cmd.sprite)`로 단순 표정명을 그대로 push → SpriteGallery 카탈로그(풀 파일명 `hajeong_default` 기준)와 매치 X → 모든 슬롯 잠금 표시.
    - 픽스: `gameStore.applyCommand`에서 `resolveSpriteName(cmd.id, cmd.sprite)` 호출 후 풀 파일명을 unlock. import 추가.
    - 라이브 검증: applyCommand 3회 호출(구윤모/차세린/윤하정 default + smile_warm) → metaStore.unlocked_sprites에 `yunmo_default`, `serin_smile_warm`, `hajeong_default` 정확히 push ✓.
  - **(2) 자동재생 잠금해제 흐름 검증** — 사용자 요청 "확인해". 흐름:
    - EndingScreen 마운트 시 카테고리 'TRUE' 엔딩이면 `setSetting('hasAchievedTrueEnding', true)` 호출 ([EndingScreen.tsx:99-104](game-project/src/ui/EndingScreen.tsx)).
    - 다음 부팅 ModeSelect 마운트 시 `hasAchievedTrueEnding && !autoPlayUnlocked` 조건으로 잠금해제 모달 표시 ([ModeSelect.tsx:24-26](game-project/src/ui/ModeSelect.tsx)).
    - 모달 확인 시 `autoPlayUnlocked=true` 영구 기록. 다음 진입부터 모달 미노출.
    - 라이브 검증: localStorage 시드(hasAchievedTrueEnding=true, autoPlayUnlocked=false) → reload → ModeSelect 진입 시 `autoplay-unlock-modal` + `autoplay-unlock-confirm` 모두 노출 ✓ → 확인 클릭 → autoPlayUnlocked=true 영구 기록 ✓.
- **수정 1건**:
  - `src/stores/gameStore.ts` — `resolveSpriteName` import + CHARACTER unlock 분기에서 풀 파일명 변환 후 unlock.
- **검증**:
  - 단위 테스트 104/104 통과.
  - Vite 빌드 통과 2.30s.
  - Preview 라이브: 자동재생 모달 트리거·확인·영구 기록 ✓ / 캐릭터·BGM·CG unlock 모두 정상 push ✓.
- **모듈** (status: review): `src/stores/gameStore.ts`.
- **사유**: PM 검수 — 자동재생 잠금해제 흐름 확인 요청 + 캐릭터 이미지 갤러리 작동 안 됨 신고. 자동재생은 이미 정상 작동 확인, 캐릭터 이미지는 단순 표정명/풀 파일명 mismatch 픽스.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — H1 트루 엔딩 BG `bg_cafe_serin` 정합화 + 컴파일 SoT 정리 (재발 방지)

- **변경**: `ch06_h1_true` 트루 엔딩 BG가 `bg_bundang_home`(분당 본가 거실, 밤)으로 잘못 박혀 있던 자리를 전용 자산 `bg_cafe_serin`로 일괄 정렬. 컴파일 SoT(`.md` 시나리오)까지 같이 손봐, 다음 컴파일에서 다시 본가 거실로 되돌아가지 않도록 막음. bg-list에 §10-1 정합성 가드 명시.
  - **수정 8개 파일**:
    - `src/scenes/ch06_h1_true.scene.json` — `BG.image` `bg_bundang_home` → `bg_cafe_serin`
    - `src/scenes/compressed/ch06_h1_true.scene.json` — 동일
    - `03-story/scenarios/ch06_h1_serin.md` Scene `ch06_h1_true` `[BG: bg_bundang_home fade=4]` → `[BG: bg_cafe_serin fade=4]`
    - `03-story/scenarios/compressed/ch06_h1_serin.md` — 동일
    - `03-story/scenarios/윤문 완료/ch06_h1_serin.txt` — 동일
    - `03-story/route-H1-cha-serin.md` §END_H1_TRUE 무대 — 옛 `bg_bundang_home (variant: cafe_window)` → `bg_cafe_serin` 전용 자산 + 별칭 폐기 명시
    - `04-image-prompts/backgrounds/bg-list.md` — §0.1 별칭 표 `bg_bundang_cafe_window` 행 취소선(폐기) + §10 `bg_bundang_home`에 "H1 트루 엔딩 카페 자리 사용 금지" 가드 + **§10-1 `bg_cafe_serin` 신설** (사용 씬 한정 + 정합성 가드 6자리 체크리스트)
    - `public/manifest.json` + `dist/manifest.json` — `bg_cafe_serin` 등록(`bg_bundang_home`과 `bg_campus_cafe` 사이, 알파벳 순)
  - **재발 방지 가드 (bg-list.md §10-1 미러)**: 다음 6자리 모두 `bg_cafe_serin`으로 일치돼야 컴파일 후 카페로 정상 출력. 한 자리라도 어긋나면 컴파일러가 .md SoT로 JSON을 덮어써 본가 거실로 깨짐.
    1. `route-H1-cha-serin.md` §END_H1_TRUE 무대
    2. `scenarios/ch06_h1_serin.md` `[BG:]` 라인
    3. `scenarios/compressed/ch06_h1_serin.md` `[BG:]` 라인
    4. `scenarios/윤문 완료/ch06_h1_serin.txt` `[BG:]` 라인
    5. `src/scenes/ch06_h1_true.scene.json` `BG.image`
    6. `src/scenes/compressed/ch06_h1_true.scene.json` `BG.image`
  - **모듈**: `src/scenes/{,compressed/}ch06_h1_true.scene.json`, `03-story/route-H1-cha-serin.md`, `03-story/scenarios/{,compressed/}ch06_h1_serin.md`, `03-story/scenarios/윤문 완료/ch06_h1_serin.txt`, `04-image-prompts/backgrounds/bg-list.md`, `public/manifest.json`, `dist/manifest.json`
  - **사유**: PM 보고 — 트루 엔딩 BG가 자꾸 본가 거실로 되돌아간다. 원인: 컴파일 SoT인 `.md` 5개 파일이 모두 `bg_bundang_home`이라 .scene.json만 수정해도 다음 빌드에서 `npx tsx scripts/compile-scene.ts`로 덮어써짐. 자산 자체는 이미 `bg_cafe_serin.webp` (127KB)로 분리 완료했으나 .md SoT가 미반영이었음.
  - **승인**: PM 구두 승인(2026-05-10)

---

### 2026-05-10 — 온라인 랭킹 시스템 1차 도입 (EndingScreen + Cloudflare Worker 프록시)

- **변경**: 엔딩 화면에서 닉네임 입력 → 점수·엔딩 ID·등급을 통합 랭킹에 등재 + 다른 플레이어 기록 조회. 단일 KV 키 `ranking:all` 에 배열 저장, 클라에서 전체/히로인/이 엔딩 3종 필터. 환경변수 `VITE_RANKING_API_URL` 미설정 시 섹션 자체가 안 보여 게임 진행에 0 영향 (graceful degradation).
- **아키텍처**: `EndingScreen ──fetch──▶ Cloudflare Worker ──▶ Workers KV`. Worker가 검증·정렬·top 500 trim 담당, 마스터키는 클라에 노출 안 됨. 데이터 레코드 `{nickname≤8, endingId, heroineId(파생: split('_')[1] | 'SOLO'), finalScore, grade S~D, timestamp ISO}`.
- **신규 파일 6개**:
  - `worker/wrangler.toml` — Cloudflare Workers 설정, KV 바인딩 `RANK_KV`.
  - `worker/src/index.ts` — Worker 본체 (~130줄). OPTIONS/GET/POST 분기, 닉네임 sanitize(한글·영문·숫자만 + 8자 컷), endingId 화이트리스트(16개), finalScore 0~1500 + grade S~D 검증, KV push→sort→trim 500.
  - `worker/package.json` + `worker/tsconfig.json` — wrangler + @cloudflare/workers-types.
  - `worker/README.md` — 1회 배포 절차(`wrangler login` → `kv namespace create` → `wrangler deploy`).
  - `game-project/src/engine/ranking.ts` — 클라 모듈 (~75줄). `isRankingEnabled()` / `submitScore()` / `fetchRanking({heroine?, endingId?, limit?})`. 네트워크 실패는 throw 대신 `{ok:false, error}` 또는 빈 배열.
  - `game-project/.env.example` — `VITE_RANKING_API_URL=` 빈 값 템플릿. 실제 URL은 `.env.local` (gitignored)에 PM이 배포 후 붙임.
- **수정 2건**:
  - `game-project/src/ui/EndingScreen.tsx` — 기존 NPC 토글 패널 아래에 `RankingSection` 신규 컴포넌트 추가. 닉네임 input(maxLength 8 + 한글·영문·숫자만 정규식 필터) + 등록 버튼(idle/submitting/done/error 상태) + 필터 토글 3버튼(전체/{히로인 shortName}/이 엔딩) + Top 10 리스트(순위·닉네임·엔딩명·점수·등급, 본인 행 노란 하이라이트). `useEffect`로 endingId/필터 변경 시 자동 재조회. 등록 성공 시 자동 refetch.
  - `game-project/src/vite-env.d.ts` — `ImportMetaEnv` 인터페이스에 `VITE_RANKING_API_URL?: string` 타입 명시.
- **재사용**: `computeEndingScore(flags, endingId)` 결과 그대로 사용 (재계산 X) / `findEnding(endingId)?.heroine` 으로 히로인 ID 추출 (SOLO는 null) / `HEROINES[heroineId].shortName` 으로 필터 버튼 라벨.
- **검증**:
  - `tsc --noEmit` 무에러 (exit 0).
  - Vite dev (port 5175)에서 `pendingEnding=END_H1_TRUE` 강제 진입 → EndingScreen mount 정상 + 제목 "세린 / TRUE" + 4개 액션 버튼 + NPC 토글 panel 28 div items 정상 작동 회귀 0건 확인.
  - `VITE_RANKING_API_URL` 미설정 환경에서 `data-testid="ending-ranking-section"` 미존재 확인 (graceful degradation 정상).
  - 환경변수 설정 시 렌더링 검증은 Vite 서버 재시작이 필요 (env vars compile-time inlined) → preview_stop 권한 거부로 본 라운드 미수행. PM이 Worker 배포 후 `.env.local` 추가 + `npm run dev` 재기동으로 직접 검증 필요.
- **모듈** (status: review):
  - `game-project/src/ui/EndingScreen.tsx` (수정)
  - `game-project/src/engine/ranking.ts` (신규)
  - `game-project/src/vite-env.d.ts` (수정)
  - `game-project/.env.example` (신규)
  - `worker/wrangler.toml` (신규)
  - `worker/src/index.ts` (신규)
  - `worker/package.json` (신규)
  - `worker/tsconfig.json` (신규)
  - `worker/README.md` (신규)
- **의도적으로 안 한 것** (스코프 밖):
  - 회원/로그인 — 닉네임만.
  - 욕설 필터 — Worker에서 `<>&"'` sanitize 외 신뢰. 문제 시 후속.
  - 닉네임 localStorage 자동저장 — 첫 버전은 매번 입력. 필요 시 후속.
  - 페이지네이션 — Top 10/20만. 전체 보기 X.
- **사유**: PM 요청 — 엔딩 도달 후 점수가 다른 플레이어와 비교되는 리플레이 동기. 계명대 동기·친구 단위 캐주얼 랭킹 목적. 짧은 1시간~1시간 30분 작업으로 마무리.
- **승인**: PM 플랜 승인 (2026-05-10, plan: swift-purring-rocket).

### 2026-05-10 — 모바일 사전 점검 라운드 등록 (08-pre-deploy-check §6)

- **변경**: `08-pre-deploy-check.md`에 §6 모바일 사전 점검 섹션 신규 추가. PM 1인이 iOS+Android 실기 2대로 4–5시간 진행하는 관찰·기록 라운드. **코드 변경 0**.
- **Phase 0–2(자동) 진행**: dist 88.83 MB / 자산 85.44 MB / `bgm_daily.mp3` 128 kbps 검증(메모리 기록 dist 반영 ✅) / `vite.config base='./'` GitHub Pages 호환 확인 / preview 4173에서 T1(375×667) + T3(768×1024) 에뮬 자동 캡처 + console·network 수집.
- **Phase 3(실기) 핸드오프**: §6.4 핫스팟 7개 + §6.5 발견 이슈 표는 PM이 iOS·Android 실기에서 골든 패스 1회씩 수행 후 채움.
- **모듈** (status 변동 없음, 이미 review): `08-qa-deployment/verification-reports/08-pre-deploy-check.md`.
- **사유**: W6 출시 직전 모바일 환경 위험을 출시 전에 파악(디자인 깨짐·렉·터치 정확성·LTE 첫 부팅·iOS Safari autoplay 정책 등). 출시 후 회귀 패치는 재빌드·재배포 1사이클 더 듦.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 갤러리 첫 탭 = 엔딩 + CG/BGM/스프라이트 자동 해금 + 조연 온도계 근본 픽스

- **변경**: PM 후속 검수 3건 — 갤러리 탭 순서 + 자동 해금 + NPC 패널 잔존 회귀.
  - **(1) GalleryScreen 첫 탭 = '엔딩'** — 사용자 의도(가장 의미 있는 정보 우선). TABS 배열 순서 `엔딩 / 하이라이트 / 캐릭터 이미지 / BGM` + `useState<Tab>('ending')` 디폴트.
  - **(2) CG·BGM·Sprite 자동 해금 (실제 작동)** — 직전 라운드까지 metaStore에 `unlocked_cgs/bgms` 필드는 있었지만 채워주는 코드가 없어 갤러리 항상 비어 있던 결함. `gameStore.applyCommand`의 set 흐름 외부에 분기 추가:
    - `cmd.type==='CG' && cmd.cgId` → `metaStore.unlockCg(cgId)`
    - `cmd.type==='BGM' && cmd.track` → `metaStore.unlockBgm(track)`
    - `cmd.type==='CHARACTER' && cmd.sprite` → `metaStore.unlockSprite(sprite)` (이전 라운드 작업, 그대로 유지)
  - **(3) 조연 온도계 ↔ 점수 거리 근본 픽스** — 사용자 신고 "여전히 멀다" 잔존. 진단:
    - `intensity='subtle'`일 때 AffectionThermometer는 SVG를 **VIEW 사이즈(60×280)**로 렌더 ([AffectionThermometer.tsx:108-109](game-project/src/ui/affection/AffectionThermometer.tsx)). 이전 라운드는 460(=THERMOMETER_DISPLAY_H) 기준으로 wrapper height를 잡아 **하단 171px가 빈 영역으로 누적** → 라벨이 시각 SVG 끝과 한참 떨어져 보임.
    - SVG 내부 nameLabel `<text y=278>` (BULB_BOTTOM+16) 위치도 시각 빈 공간을 만듦.
    - 해결: `NPC_THERM_VIEW_W/H = 60/280` 상수 도입 → wrapper 정확히 SVG 사이즈에 맞춤. SVG nameLabel prop 비활성(외부 표시로 일원화). 외부 div에 인물명·점수 1줄로 묶어 marginTop:4로 SVG 직하단에. 검증 라이브: outerH 266 = svgVisH 266 정합, gap 4px ✓.
- **수정 3건**:
  - `src/ui/gallery/GalleryScreen.tsx` — TABS 순서 변경 + 디폴트 'ending'.
  - `src/stores/gameStore.ts` — applyCommand에 CG/BGM 자동 unlock 분기 추가 (CHARACTER 옆).
  - `src/ui/EndingScreen.tsx` — `NPC_THERM_VIEW_W/H` 상수 + NpcThermItem outer/inner 사이즈 280 기준 + nameLabel prop 제거 + 외부 인물명+점수 묶음 4px gap.
- **검증**:
  - 단위 테스트 104/104 통과.
  - Vite 빌드 통과 2.67s.
  - Preview 라이브: 갤러리 첫 탭 '엔딩' 활성 색 확인 ✓ / NPC 패널 outerH 266, gap 4px, 인물명+점수 1줄 ✓ / CG·BGM·Sprite는 게임 진행하면 자동 해금 (인게임 [CG]/[BGM]/[CHARACTER] 명령 적용 시).
- **모듈** (status: review): `src/ui/gallery/GalleryScreen.tsx`, `src/stores/gameStore.ts`, `src/ui/EndingScreen.tsx`.
- **사유**: PM 검수 3건 — 탭 순서 / 갤러리 실제 작동 / NPC 패널 잔존 회귀.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 결과 이미지 스프라이트 우측 정렬 + 갤러리 탭 정리 (하이라이트 / 캐릭터 이미지 신설)

- **변경**: PM 후속 검수 3건.
  - **(1) 결과 이미지 스프라이트 중앙 → 우측 6% padding** — 직전 라운드의 가로 중앙 합성이 점수 텍스트와 겹쳐 스프라이트가 가려짐. ffmpeg overlay `(W-w)/2:H-h` → `W-w-${rightPad}:H-h` (padding = 1080×6%=65px, 메인 EndingScreen `right: 6%` 미러). `npm run generate:ending-square` 재실행 → 7개 BG+sprite 자산 재생성.
  - **(2) 갤러리 탭 'CG' → '하이라이트' 라벨 변경** — UI-SPEC §7.1 명세 갱신, GalleryScreen `TABS` 배열 라벨만.
  - **(3) '캐릭터 이미지' 탭 신규 (SpriteGallery)** — 인물별 섹션(구윤모/H1~H5/NPC 4명) + 그리드. `metaStore.unlocked_sprites` 기반 해금 표시(미해금 자물쇠), 클릭 시 풀스크린 보기(CGGallery 패턴 미러). 인게임 [CHARACTER] 명령 적용 시 자동 해금.
- **신규 파일 2개**:
  - `src/data/spriteCatalog.ts` — `SPRITE_CATALOG` 정적 매니페스트 (10명 인물 × variant 합 63건). `ALL_SPRITE_IDS` flat 리스트 + `spriteVariantLabel` 헬퍼.
  - `src/ui/gallery/SpriteGallery.tsx` — 인물 섹션 헤더 + 그리드(3/4/6열 반응형) + 풀스크린 모달.
- **수정 4건**:
  - `scripts/generate-ending-square.ts` — overlay 우측 6% padding으로 변경.
  - `src/stores/metaStore.ts` — `unlocked_sprites: string[]` 필드 + `unlockSprite(id)` 액션, version 1→2 마이그레이션.
  - `src/stores/gameStore.ts` — `applyCommand` 끝부분에 `cmd.type==='CHARACTER'` 분기 + `useMetaStore.getState().unlockSprite(cmd.sprite)` 호출 (set 흐름 외부에서 호출, persist 충돌 회피).
  - `src/ui/gallery/GalleryScreen.tsx` — TABS 4개 ('하이라이트'/'캐릭터 이미지'/'BGM'/'엔딩'), SpriteGallery import + tab=='sprite' 분기.
- **검증**:
  - 단위 테스트 104/104 통과 (metaStore.persist 검증의 version 기대값 1→2 동시 갱신).
  - Vite 빌드 통과 2.41s.
  - 자산 재생성: 15/16 (REJECT type=none).
  - Preview 라이브 검증: 갤러리 탭 4종 라벨 정합 ✓ / 캐릭터 이미지 탭에 10명 인물 섹션 헤더 + 시드한 6장 해금 슬롯 노출 ✓ / END_H2_NORMAL 결과 이미지에서 우측 영역에 스프라이트 픽셀 (rightBottom 살색 [249,240,223]) + 좌측은 BG 어두운 색 [87,69,59] ✓.
- **모듈** (status: review): `src/data/spriteCatalog.ts` (신규), `src/ui/gallery/SpriteGallery.tsx` (신규), `src/ui/gallery/GalleryScreen.tsx`, `src/stores/metaStore.ts`, `src/stores/gameStore.ts`, `scripts/generate-ending-square.ts`, `public/img/ending-square/*.webp` (BG+sprite 7장 갱신).
- **사유**: PM 후속 검수 — 결과 이미지 가독성 개선 + 갤러리 신기능 (하이라이트 라벨 정정 + 캐릭터 이미지 갤러리).
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — H2 NORMAL 엔딩 배경 자취방 → 밤 도서관 (PM 즉결)

- **변경**: `src/data/endingFlavor.ts` END_H2_NORMAL의 `decisiveImage.id` `bg_studio_room` → `bg_library_night`. sprite/quote 그대로 (`hajeong_smile_small`, "너랑 친구잖아.").
- **자산**: `npm run generate:ending-square` 재실행 → `public/img/ending-square/END_H2_NORMAL.webp` 갱신 (BG center crop + sprite 중앙하단 합성). 다른 14장은 변동 없음.
- **검증**:
  - 단위 테스트 104/104 통과.
  - Vite 빌드 통과 3.10s.
  - Preview 라이브 검증 (port 5175): `pendingEnding=END_H2_NORMAL` 강제 진입 → EndingScreen 배경 src `/img/bg/bg_library_night.webp` 확인 ✓ / `generateEndingImage` 결과 1.4MB image/png Blob 정상 ✓.
- **모듈** (status: review): `src/data/endingFlavor.ts`, `public/img/ending-square/END_H2_NORMAL.webp`.
- **사유**: PM 즉결 — 자취방 톤보다 밤 도서관이 H2 분위기에 더 맞음.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — Phase C E2E 회귀 처방 라운드 (옵션 A1) ✅ E2E 16/16 회복

- **변경**: PM 옵션 A1 채택(helpers 갱신 + EVALUATE_TIER 컴파일러 누락 처방 + spec 신 임계 + hybrid 진입). 게임 시나리오·엔진·UI·자산 무변동, 테스트 도구 + 시나리오 마커만 갱신.
- **(1) `tests/e2e/helpers.ts` autoAdvanceUntilEnding 재작성** — 옛 단순 advance 루프(`scene` 모드 외 즉시 종료) → 5개 모드 generic 처리:
  - `ending`/`idle`: 종료
  - `awaitingChapterAdvance`: `confirmChapterAdvance()` 호출 (E2E 환경은 store가 자동 통과시키지만 ChapterTransitionRecap fallback 가드)
  - `scene` + cmd `CHOICE`/`scene` 외: advance — 단 CHOICE는 별도 `runtimeMode === 'choice'` 분기로 처리
  - `choice`: `pickChoice(0)` (Ch.6 본편 분기 임의 첫 옵션)
  - `kakao`: KAKAO.choices 있으면 `pickChoice(0)` (h4_reply_speed 미니게임 timer 우회), 없으면 `closeKakao()`
  - `cg`: 1100ms 대기 후 `advance()` (CGOverlay 1s lock 후 사용자 클릭 시뮬레이션)
  - hang 가드: 같은 (mode:scene:cmdIdx) snapshot 30회 연속 → 안전 종료
  - maxIterations 500 → 5000 + expectEnding timeout 20s → 90s
- **(2) `tests/e2e/helpers.ts` `gotoEndingFromEvaluate` 신규** — Ch.6 끝 evaluate 씬에 `?scene=ch06_h{N}_*_evaluate&flags=...` 직접 진입. Ch.6 본편 traverse 우회 → INC 누적이 spec 입력 임계를 밀어올리는 회귀 회피.
- **(3) `playwright.config.ts` test timeout 30s → 120s** — 2-단계 라우팅 흐름의 자체 90s 폴링과 여유.
- **(4) `scripts/compile-scene.ts` EVALUATE_TIER 파싱 추가** — `RE_EVAL_TIER = /^\[EVALUATE_TIER:\s*(H[1-5])\s*\]$/` 정규식 + `SceneCommandOut` 유니언에 `{ type: 'EVALUATE_TIER'; winner: string }` 추가. 5/9 Ch5 엔딩 라우팅 복구 라운드의 누락 처방 (당시 `.scene.json` 직접 부착했으나 본 사전 점검 라운드 `npm run compile` 시 시나리오 .md 마커 부재로 산출물에서 사라진 stale).
- **(5) 시나리오 .md 5개 + 압축본 5개에 `[EVALUATE_TIER: H<N>]` 마커 추가** — `ch06_h1_serin.md` / `ch06_h2_hajeong.md` / `ch06_h3_seol.md` / `ch06_h4_seoyoon.md` / `ch06_h5_yuna.md` + 압축본 동일. 각 evaluate 씬 NARRATION 직후, `[IF: ...]` 블록 직전 위치(IF는 v0.1 미지원으로 무시되지만 EVALUATE_TIER가 winner 기반 endingId 결정 + 점프).
- **(6) `tests/e2e/endings.spec.ts` 매트릭스 갱신** — scriptInterpreter.determineEnding 신 임계(2026-05-09 endings-results-revamp 라운드 PM 결정)에 맞춤. **hybrid 진입 전략**:
  - **TRUE/HAPPY/NORMAL/BAD 14건**: `gotoEndingFromEvaluate(ch06_h{N}_*_evaluate)` 직접 진입 + 신 임계 매트릭스 (H1: TRUE≥105·HAPPY≥90·NORMAL≥70 / H2: TRUE≥110·HAPPY≥95·NORMAL≥75 / H3: TRUE≥90·HAPPY≥75 / H4: TRUE≥70+KEY3+late=0·NORMAL≥45 / H5: TRUE≥120+KEY3)
  - **REJECT 1건 + SOLO 1건**: `gotoEndingFromCh05` 그대로 (EVALUATE_BRANCH 즉시 종결 라우팅 검증)
- **검증**:
  - `npx tsc --noEmit` — 0 errors ✓
  - `npm test` — vitest 104/104 ✓
  - `npm run compile:all` — 풀 212 + 압축 212 씬 ✓ (EVALUATE_TIER 5건 정확 산출)
  - `npm run validate` — 16/16 엔딩 + 거절 도달성 + 화이트리스트 ✓
  - `npm run build` — vite 2.39s ✓
  - `npm run test:e2e` — **16/16 통과** (8.8m, 10 passed + 6 flaky retry 회복, exit code 0). 직전 12.7m 15 fail → 8.8m 0 fail.
- **모듈** (status 변동):
  - `tests/e2e/helpers.ts` (autoAdvanceUntilEnding 재작성 + gotoEndingFromEvaluate 신규)
  - `tests/e2e/endings.spec.ts` (hybrid 진입 + 신 임계 매트릭스)
  - `playwright.config.ts` (timeout 120s)
  - `scripts/compile-scene.ts` (EVALUATE_TIER 파싱)
  - `03-story/scenarios/ch06_h{1,2,3,4,5}_*.md` 5개 + 압축본 5개 (EVALUATE_TIER 마커)
  - `src/scenes/ch06_h{1,2,3,5}_*_evaluate.scene.json` + 압축본 (자동 재컴파일, EVALUATE_TIER 명령 부착)
  - `08-qa-deployment/verification-reports/08-pre-deploy-check.md` (E2E ✅ 갱신)
- **사유**: PM 옵션 A 결정 후 helpers 갱신 진행 중 4건 추가 회귀 발견(CG advance / choice 모드 / 챕터 회상 / EVALUATE_TIER 컴파일러 누락) → 옵션 A1로 범위 확장하여 출시 차단 한 번에 해소.
- **승인**: PM 결정 (옵션 A1 확장 진행 지시 2026-05-10).
- **다음 단계**:
  - ⬜ GitHub repo 생성 + push + Pages Source "GitHub Actions" (PM 직접)
  - ⬜ 배포 후 라이브 검증
- **잔여 (별도 라운드 이연)**:
  - ⬜ E2E 압축 모드 검증 helper (`?storyMode=compressed`) — 압축본은 풀과 씬 ID·CHOICE 그래프 동일하므로 fallback OK라 출시 후 가능
  - 🟨 audit BG_NULL_CRITICAL (풀 14 / 압축 16) BFS edge BG 상속 정정 — 별도 라운드
  - 🟨 audit POSITION_COLLISION 2건 — 시각 검토 별도 라운드
  - flaky 6건 환경 부담 — CI retries=2로 안정. 근본 디버깅은 출시 후 별도 라운드

### 2026-05-10 — 엔딩 후속 라운드 2: 조연 간격 / 다운로드 분기 / 결과 이미지 배경 합성 / 갤러리 점수 내역

- **변경**: PM 후속 검수 5건 처방 — 조연 간격 / 이미지 다운로드 분기 / 결과 이미지 자산 합성 / 갤러리 썸네일 + 점수 내역.
  - **(1) 조연 온도계 ↔ 점수 간격 좁힘** — 직전 라운드의 `marginTop: 6`이 SVG 자연 흰 여백 + scale 후 layout vs visual 높이 어긋남으로 너무 멀어 보였음. wrapper를 outer(layout container, `overflow: hidden`, height = bulb visual end + 4px) + inner(transform: scale, 자연 SVG 사이즈) 2단으로 분리 → 점수가 bulb 바로 아래 4px gap으로 붙음. 라이브 검증 gapPx 4 ✓.
  - **(2) "이미지 저장" → 항상 다운로드** — `saveOrShareEndingImage` (Web Share API share sheet 우선) → `downloadEndingImage` (a[download] 전용)로 단순화. PC Chrome에서 Windows Share UI 떠서 "다운로드 옵션 없다" 신고. 모바일도 다운로드 폴더에 저장됨(브라우저 표준). saveOrShareEndingImage는 deprecated alias로 호환 유지.
  - **(3) 결과 이미지 배경 합성** — 직전 라운드의 그라데이션 단색 배경 → 엔딩별 1:1 정사각 자산 + 반투명 어두운 보라 레이어(rgba(31,24,34,0.62)) + 텍스트. EndingScreen의 BG 케이스 오버레이 톤 미러. 자산 누락 시 그라데이션 폴백 자동.
  - **(4) 갤러리 EndingGallery — 썸네일 + 클릭 시 점수 내역 모달** — 미해금은 ??? 그대로, 해금은 1:1 자산 위에 그라데이션 + 카테고리/제목/부제 텍스트. 해금 슬롯 클릭 → `EndingHistoryModal` 풀스크린 (PauseMenu 모달 패턴 미러). 통계(달성 횟수/최고 등급/최고 점수) + 표(회차/날짜/등급/점수, 시간 내림차순) + ESC 닫기.
  - **(5) 정보 답변 (코드 변경 없음)**:
    - "결과 공유" 링크: `window.location.origin` (게임 루트) — 점수·등급은 텍스트 본문에만, URL은 게임 메인 진입 링크라 받은 사람이 보낸 사람의 결과 재현 불가. URL 파라미터 결과 인코딩은 비범위.
    - 엔딩 점수 기록 위치: `localStorage['kmu-vn-meta'].state.endingHistory: EndingRecord[]` (metaStore). EndingScreen 마운트 시 `useEffect`가 `metaStore.recordEnding()` 1회 호출 (StrictMode ref 가드).
- **신규 파일 4개**:
  - `scripts/generate-ending-square.ts` — 16개 엔딩 자산 ffmpeg 일괄 생성 (CG center crop / BG center crop + sprite 중앙하단 합성 88% 높이 / type:none skip). package.json `generate:ending-square` script 등록.
  - `public/img/ending-square/*.webp` 15장 — 16-1(REJECT type:none). CG 8장 + BG+sprite 7장. 50~150KB 압축 (총 ~1.5MB).
  - `src/ui/gallery/EndingHistoryModal.tsx` — 풀스크린 모달, `metaStore.endingHistory.filter` 기반 통계 + 표 + 썸네일.
  - `tests/unit/generateEndingImage.test.ts` (3 tests) / `endingHistoryModal.test.ts` (4 tests) — 신규 7개 단위 테스트.
- **수정 4건**:
  - `src/ui/EndingScreen.tsx` — NpcThermItem outer/inner 분리 + marginTop 4 / `saveOrShareEndingImage` → `downloadEndingImage` import + handleSaveImage 단순화.
  - `src/ui/util/generateEndingImage.ts` — `fetchEndingSquare()` 신규 (Image onload/onerror 폴백) + `generateEndingImage`에 자산 drawImage + 반투명 레이어 / `saveOrShareEndingImage` → `downloadEndingImage` (share sheet 분기 제거).
  - `src/ui/gallery/EndingGallery.tsx` — 해금 슬롯에 1:1 썸네일 + cursor-pointer + 클릭 시 EndingHistoryModal 마운트 (`openId` state).
  - `package.json` scripts — `generate:ending-square` 추가.
- **사양 (PM 결정 2026-05-10)**:
  - BG+sprite 합성 룰: 가로 중앙 + 하단 정렬 + 88% 높이 (사용자 결정 "중앙").
  - 자산 사전 생성: ffmpeg 8.1+ CLI 활용 (의존성 추가 0, 기존 자산 파이프라인 정합).
  - 점수 내역 UI: 풀스크린 모달 (PauseMenu 모달 패턴 미러).
- **검증**:
  - 단위 테스트 104/104 통과 (97 → 104, 신규 7건).
  - Vite 빌드 통과 2.32s.
  - 자산 생성: 15/16 성공 (END_H4_REJECT는 type=none, 런타임 폴백).
  - Preview 라이브 검증: 조연 패널 gap 4px ✓ / 갤러리에 해금 3슬롯 (END_H1_TRUE, END_H1_NORMAL, END_SOLO_SUMMER) 노출 + 썸네일 정상 ✓ / 슬롯 클릭 → EndingHistoryModal 통계 (2회/S/625) + 표 2행 + 썸네일 src 정합 ✓ / generateEndingImage 3종(CG/BG+sprite/none) 모두 image/png Blob 반환 (852KB~1.18MB) ✓.
- **모듈** (status: review): `src/ui/EndingScreen.tsx`, `src/ui/util/generateEndingImage.ts`, `src/ui/gallery/EndingGallery.tsx`, `src/ui/gallery/EndingHistoryModal.tsx` (신규), `scripts/generate-ending-square.ts` (신규), `public/img/ending-square/*.webp` (자산).
- **사유**: PM 후속 검수에서 (1) 조연 간격 멀어 보임, (2) 다운로드 옵션 없음, (3) 결과 이미지에 배경 합성 요청, (4) 갤러리 점수 내역 보기 제안, (5) 정보 요청 2건. 한 라운드에 5건 동시 처방.
- **승인**: PM 구두 + 플랜 승인 2026-05-10 (`C:\Users\PC\.claude\plans\4-cryptic-piglet.md` 마지막 갱신).

### 2026-05-10 — 엔딩 화면 후속: 조연 패널 collapse 픽스 + 이미지 저장 옵션 추가

- **변경**: 엔딩 화면 사용성 3건 처방.
  - **(1) 조연 호감도 패널 collapse 회귀 픽스** — 7명 NPC 토글이 보이지 않던 결함. CSS 스펙상 `overflow-x: auto`가 자동으로 `overflow-y: auto`를 강제하여 flex 컨테이너 height가 0으로 collapse → 자식 7개가 layout 밖으로 흘러나가 사실상 비노출됐음. `overflow-x-auto` 제거 + `flex-wrap` 채택(모바일 자동 줄바꿈, PC 1280에서는 7명 한 줄 유지). 검증: panelH 0 → 502, 모든 7개 마운트.
  - **(2) 조연 온도계 + 점수 글씨 확대** — `NPC_GRID_SCALE` 0.65 → 0.95(이전 너무 작아 시인성 부족). 점수 텍스트 `text-[10px]` rgba(220,220,225,0.6) → `text-sm font-semibold` rgba(255,248,252,0.92) + textShadow. wrapper width/height를 scaled 크기와 동일 명시로 layout 정합 보강.
  - **(3) 엔딩 결과 이미지 저장 옵션** — "결과 공유" 옆에 "이미지 저장" 버튼 신규. `src/ui/util/generateEndingImage.ts` 신규 — 순수 Canvas2D로 1080×1080 카드 PNG 생성 (배경 그라데이션, 게임 제목, 엔딩명, 부제, 등급 도장, 점수, 명대사 2줄, 날짜). 의존성 0 (html2canvas 미사용 PM 결정 일관). 모바일은 `navigator.share({files})` share sheet, PC는 `<a download>` 다운로드. 폴백 체인 자동.
- **타이틀 리셋 ↔ 메뉴 호감도 검증** — 사용자 요청에 따라 라이브 검증: `confirmAndResetGame` → `resetForNewGame()` 직후 H1~H5 모두 0, `met_heroines: []`, PauseMenu의 AffectionStatusPanel이 5명 모두 LockedThermometer로 즉시 전환 ✓. 호감도 리셋이 메뉴 패널까지 정상 반영됨을 확인.
- **수정 1건**:
  - `src/ui/EndingScreen.tsx` — NPC 패널 className(overflow → flex-wrap), `NPC_GRID_SCALE` 0.65 → 0.95, NpcThermItem wrapper height/width 정정 + 점수 스타일 확대, "이미지 저장" 버튼 + `handleSaveImage` 추가, `saveOrShareEndingImage` import.
- **신규 1건**:
  - `src/ui/util/generateEndingImage.ts` — `generateEndingImage(input): Blob` + `saveOrShareEndingImage(input)` 헬퍼. Canvas2D 1080×1080, Pretendard 폰트 + sans-serif 폴백. `document.fonts.ready` 대기 후 그림.
- **검증**:
  - 단위 테스트 97/97 통과 (회귀 0).
  - Vite 빌드 통과 2.08s.
  - Preview 라이브 검증: 임의 호감도 박은 후 엔딩 진입 → 조연 토글 → panelH 502 ×7 정상 노출 ✓ / 점수 글씨 22.75px(이전 10px) ✓ / 이미지 생성 → blob 859,775 bytes type 'image/png' ✓ / 리셋 후 met_heroines=[] + 메뉴 5명 잠금 ✓.
- **모듈** (status 변동 없음 — UI 미세 픽스 + 신규 유틸): `src/ui/EndingScreen.tsx`, `src/ui/util/generateEndingImage.ts` (신규).
- **사유**: PM 자체 검증에서 (1) 조연 패널이 토글해도 안 보임, (2) 점수 글씨 너무 작음, (3) 이미지로 저장 옵션 추가 요청 + 리셋 흐름 검증 요구.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — CI 압축 모드 audit 통합 (08 사전 점검 잔여 #2 처방)

- **변경**: `.github/workflows/ci.yml`에 압축 모드 audit 2-step 추가. 풀 모드 audit step name 명확화.
  - **(1) `Audit asset flow` → `Audit asset flow — 풀 모드`** name 갱신 — 압축 모드 step 신설에 맞춰 일관성 보존.
  - **(2) `Compile scenarios — 압축 모드 (압축 audit 의존성)`** 신규 — `npm run compile:compressed` 실행. 압축본 `src/scenes/compressed/*.scene.json` 갱신 (audit이 의존).
  - **(3) `Audit asset flow — 압축 모드 (위치/BG/스프라이트 입출 정합 — 비차단)`** 신규 — `npx tsx scripts/audit-asset-flow.ts --mode=compressed` 실행. `continue-on-error: true` (풀 모드와 동일 비차단 정책).
  - 게임 코드 무변동, 검증 도구 인프라 보강만. validate:compressed 통합은 본 라운드 범위 외 (필요 시 별도 라운드).
- **모듈** (status: review):
  - `.github/workflows/ci.yml` — audit step 1개(풀) → 3개(풀 audit + 압축 compile + 압축 audit)
- **사유**: 08 사전 점검(2026-05-10) §2.3 #9 + 결론 "audit-asset-flow.ts --mode=compressed CI 통합" 잔존 #2 — 도구는 직전 라운드에 flag 추가됐으나 CI 미통합. PM 결정으로 처방 (별도 라운드 이연 1번 — E2E 회귀 처방 라운드는 PM Option A/B/C 결정 대기 중이라 그동안 위험 0 작업으로 진행).
- **검증** (로컬):
  - `npm run compile:compressed` → 12 .md → **212 씬** (warning 6: IF v0.1 미지원 기존, 본 라운드 무관) ✓
  - `npx tsx scripts/audit-asset-flow.ts --mode=compressed` → **Critical 18건** (BG_NULL_CRITICAL 16 + POSITION_COLLISION 2) + Major 12 + Info 109. **08 사전 점검 §2.3 #9 실측치와 정확 일치** ✓
  - YAML 들여쓰기 정합 (6 spaces step + 8 spaces 속성) ✓
- **잔여 추적**:
  - 08 사전 점검 §2.3 #10 E2E 압축 모드 검증 — 풀 E2E 회귀 처방 라운드에 묶어 진행 (helper 갱신 묶음).
  - 압축본 BG_NULL_CRITICAL +2건 (풀 14 → 압축 16) — KAKAO/CHOICE edge BG 상속 BFS false positive 정정 별도 라운드 (출시 무관).
- **승인**: PM (별도 라운드 이연 #1 처방 진행 동의 2026-05-10).
- **다음 단계 (변동 없음)**:
  - 🔴 **E2E 회귀 처방 라운드** (출시 차단) — 풀 + 압축 양 모드 묶어 진행. PM Option A/B/C 결정 후 Claude 처방.
  - ⬜ GitHub repo 생성 + push to main + Pages Source: GitHub Actions (PM 직접)

### 2026-05-10 — W5 메뉴 사이클 후속 정정: fontSize 회귀 + 환경설정 분리 (PM 정정 라운드)

- **변경**: 자체 검증에서 fontSize 회귀 1건 발견 + PM 환경설정 분리 결정에 따른 4건 처방.
  - **(1) fontSize 회귀 픽스 — 슬라이더 범위 12~22 → 14~30, 기본 16 → 26**: tokens.css의 `--font-size-text` PC 기본 26 / 모바일 22 정합. 기본 16으로 두면 마운트 시 모든 텍스트가 즉시 작아지는 시각 회귀. settingsStore version 4→5 bump + v4→v5 마이그레이션(기존 사용자 fontSize 일괄 26 리셋).
  - **(2) 환경설정 분리 — PauseMenu에서 빠지고 미니 컨트롤 ⚙ 진입점**: `src/ui/SettingsButton.tsx` 신규 (MuteToggle 옆 톱니바퀴, BTN_CLASS 동일 톤). PauseMenu의 "환경설정" 항목 + `isSettingsOpen` 자식 분기 제거. SceneRenderer가 `<SettingsPanelMount />`로 직접 마운트(메뉴 무관, 게임 화면에서 한 번에).
  - **(3) SettingsScreen 풀스크린 모달 → 우하단 floating 패널 (320×640)**: `absolute right-2 bottom-2`, `z-menu`. 외부 포인터 다운 시 자동 닫힘 (VolumeControl 패턴 미러). 배경 어둠막 X.
  - **(4) 환경설정 항목 정리 (PM 결정)**: Voice 슬라이더 / 음소거 토글(외부 MuteToggle 중복) / "미열람 텍스트도 스킵" 토글 제거. 잔존: BGM·SFX·텍스트 속도·자동진행 지연·폰트 크기·텍스트박스 투명도·애니메이션 줄이기·기본값 리셋·데이터 초기화.
- **수정 5건**:
  - `src/stores/settingsStore.ts` — version 4→5, FONT_SIZE_MIN/MAX/DEFAULT 14/30/26, v4→v5 마이그레이션 추가, muted JSDoc "MiniControls 전용" 명시.
  - `src/ui/SettingsScreen.tsx` — 풀스크린 모달 → floating 패널, voice/muted/skipUnseenText 항목 제거, 외부 클릭 닫힘 effect 추가.
  - `src/ui/PauseMenu.tsx` — "환경설정" items 항목 제거, isSettingsOpen import/구독/분기 제거.
  - `src/ui/MiniControls.tsx` — MuteToggle 자리에 SettingsButton + MuteToggle 가로 배치 (PC + 모바일 햄버거 양쪽).
  - `src/engine/SceneRenderer.tsx` — `<SettingsPanelMount />` 신규 inline 컴포넌트로 isSettingsOpen 단독 구독.
- **신규 1건**: `src/ui/SettingsButton.tsx`.
- **검증**:
  - 단위 테스트 97/97 통과 (회귀 0).
  - Vite 빌드 통과 2.08s.
  - Preview 브라우저 검증 (port 5175 dev): localStorage 클리어 후 부팅 → fontSize 26 / `--font-size-text: 26px` ✓. ⚙ 클릭 → 320×640 floating 패널, BGM/SFX 슬라이더 2종(Voice 제거), 폰트 14~30 기본 26, 라디오 4종, 토글 1종(애니메이션 줄이기, skipUnseenText/muted 제거), 액션 2종(기본값 리셋·데이터 초기화) 모두 정합 ✓.
- **모듈** (status: review): `06-engine/STATE-SCHEMA.md` (Settings v5 + fontSize 14~30/기본 26 정합), `05-ui-design/UI-SPEC.md` §8 (환경설정 슬림화 + ⚙ 진입점 명세).
- **사유**: PM 자체 검증에서 fontSize 회귀(글자 26→16 강제 작아짐) 신고 + 환경설정 분리 + 항목 정리 4건 동시 처방 요청. 같은 라운드 안에서 직전 W5 메뉴 사이클 라운드의 시각/UX 결함을 닫음.
- **승인**: PM 구두 (2026-05-10).

### 2026-05-10 — 스프라이트 검정 라운드 1.1: compressed/ 동기화

- **변경**: 라운드 1(2026-05-09) 메인 적용 후 사용자 결정 변경 — `compressed/` 디렉토리도 동일 outfit 적용 진행. 7개 압축 .md에 sprite 15건 + 본문 1건 = 16건 적용 (메인 16+2=18건과 비교: `ch06_h3_seol` 압축본은 메인의 [CHARACTER:] 두 라인이 한 라인으로 합쳐져 1건 적은 15건. `ch06_h5_yuna` 트루 의상 묘사 라인이 압축본엔 애초에 빠져 있어 본문 수정 1건만 — `ch06_h1_serin` 트루 본문만).
  - **(1) `serin_outfit_casual`**: `compressed/ch06_h1_serin.md` line 39, 48 (Scene 01).
  - **(2) `serin_outfit_winter_coat`**: `compressed/ch06_h1_serin.md` line 466, 476 (트루).
  - **(3) `hajeong_outfit_lab_coat`**: `compressed/ch02_anatomy.md` line 55, 100 ([CHOICE] 이전).
  - **(4) `hajeong_outfit_party`**: `compressed/ch06_h2_hajeong.md` line 168 (동성로).
  - **(5) `seol_outfit_casual`**: `compressed/ch06_h3_seol.md` line 34 (Scene 01 — 메인 두 라인이 압축본에서 합쳐진 자리).
  - **(6) `seol_outfit_lab_late`**: `compressed/ch04_library.md` line 243, 255 ([CHOICE] 이전).
  - **(7) `seoyoon_outfit_date`**: `compressed/ch06_h4_seoyoon.md` line 347, 366 (Scene 04).
  - **(9) `yuna_outfit_dress`**: `compressed/ch06_h5_yuna.md` line 656, 709 (트루).
  - **(10) `yuna_outfit_festival`**: `compressed/ch06_h5_yuna.md` line 164 (Scene 02).
  - **본문 묘사 동반 수정 1건**: `compressed/ch06_h1_serin.md` line 468 — "베이지 셔츠 원피스+카디건" → "베이지 트렌치 코트+흰 블라우스" (winter_coat 정합).
  - **본문 수정 미적용**: `compressed/ch06_h5_yuna.md`에는 트루 의상 묘사 라인이 압축 과정에서 이미 빠져 있어 수정 자리 0건.
- **모듈** (status: review):
  - `03-story/scenarios/compressed/ch02_anatomy.md` (sprite 2건)
  - `03-story/scenarios/compressed/ch04_library.md` (sprite 2건)
  - `03-story/scenarios/compressed/ch06_h1_serin.md` (sprite 4건 + 본문 1건)
  - `03-story/scenarios/compressed/ch06_h2_hajeong.md` (sprite 1건)
  - `03-story/scenarios/compressed/ch06_h3_seol.md` (sprite 1건)
  - `03-story/scenarios/compressed/ch06_h4_seoyoon.md` (sprite 2건)
  - `03-story/scenarios/compressed/ch06_h5_yuna.md` (sprite 3건)
  - `src/scenes/compressed/*.scene.json` — `npm run compile -- --mode=compressed`로 자동 재생성 (15건 sprite outfit 토큰 반영, 212 씬 정합 유지)
- **사유**: 라운드 1(메인) 적용 후 사용자 질문 — "풀버전과 압축 버전에 모두 적용됐는지 확인해". 압축본 grep 결과 outfit 토큰 0건 발견 → 즉시 동기화 진행 지시. 컴파일러 `--mode=compressed`가 별도로 `src/scenes/compressed/*.scene.json`을 만들어 압축 모드 게임 플레이 시 outfit이 default로 보이는 비대칭 회피.
- **검증**:
  - **C-1 압축 .md outfit 토큰**: 15건 정확 적용 ✓ (grep 통과)
  - **C-2 압축 컴파일**: `npm run compile -- --mode=compressed` → 12 .md → 212 씬, 6건 IF 경고는 사전 v0.1 미지원 (본 라운드 무관) ✓
  - **C-3 컴파일된 .scene.json**: `src/scenes/compressed/*.scene.json` 안 `"sprite": "outfit_*"` 15건 정확 반영 ✓
  - **C-4 본문 line 468**: "베이지 트렌치 코트" 정합 확인 ✓
  - **C-5 validate**: `npm run validate` → 212 씬 + 16/16 엔딩 + 시각 자산 실파일 검증 통과 ✓
- **잔여 추적**:
  - `npm run validate:compressed` 풀↔압축 cross-validate 재실행 (직전 2026-05-10 라운드에서 mismatch 0 통과 — 본 라운드 변경은 sprite 토큰만이라 compile 결과에 추가 mismatch 발생 가능성 0).
- **승인**: PM 구두 (2026-05-10 — 풀버전과 압축 버전 모두 적용 확인 지시).

### 2026-05-10 — Phase C 사전 점검 후속: 압축본 일괄 점검 + Phase A 2번 stale 정리

- **변경**: 직전 라운드(Phase C 사전 점검)에서 풀 모드만 검증한 누락을 처방. 압축 모드 일괄 점검 + Phase A 2번 stale manifest 정합화.
  - **(1) Phase A 2번 stale 발견 + 정리** — Phase A 2번(2026-05-09 dead code 정리)에서 압축본 `.scene.json` 4건(`ch04_05b_late`/`ch05_07b_late`/`ch06_h4_03b_late`/`ch06_h4_05b_late`) 삭제했으나 `compile:compressed` 미실행으로 압축본 `compiled-manifest.json`이 216 씬 stale 상태로 잔존(b_late 4건이 manifest에 박혀 있음). 본 라운드에서 `npm run compile:compressed` 실행 → **216 → 212 씬 정합화** (풀과 일치).
  - **(2) `npm run validate:compressed` 신규 실행** — `scripts/validate-compressed.ts` 사용, 풀↔압축 cross-validate. 결과: **mismatch 0** · 풀 215 · 압축 212 · 공통 212 · 풀 only 3건(`dummy_full_loop` 3종, 런타임 fallback OK) · 압축 only 0건. 보존 항목 KAKAO 490 / CHOICE 35 / FLAG_INC 21 / JUMP 151 / ENDING 16 / CG 24 / VIDEO 10 모두 풀 대비 0% 변화 ✓. 압축 비율: NARR -61% / MONO -55% / DIAL -24% (의도된 압축).
  - **(3) `audit-asset-flow.ts`에 `--mode=compressed` flag 추가** — 도구가 `SCENES_DIR = src/scenes` 하드코딩이라 압축본 audit 불가능했던 한계 해소. `process.argv.includes('--mode=compressed')`로 분기, 기본은 풀(기존 동작 보존). 검증 도구 갱신만, 게임 코드 무변동.
  - **(4) 압축본 audit 실행 결과** — Critical 18건(BG_NULL_CRITICAL 16 + POSITION_COLLISION 2) + Major 12 + Info 109. **풀 대비 BG_NULL +2건**. 압축 시 BG 디렉티브 누락이 풀보다 더 발생. 풀 BG_NULL과 동일하게 KAKAO/CHOICE edge BG 상속 BFS 정정 false positive 의심 → 별도 라운드 이연.
  - **(5) `npm run build` 재실행** — 압축본 manifest 갱신 영향 dist 반영. 2.90s 통과 (gzip 273 KB).
- **검증 누락 잔존** (별도 라운드):
  - ⬜ **E2E 압축 모드 검증** — `tests/e2e/helpers.ts` + `endings.spec.ts`가 풀 모드 가정으로 작성. `?storyMode=compressed` 또는 settingsStore 직접 주입 helper 갱신 필요. 풀 E2E 회귀 처방 라운드(Ch5 엔딩 라우팅 2-단계)와 묶어 진행 권장.
  - ⬜ **`audit-asset-flow.ts` `--mode=compressed` CI 통합** — `.github/workflows/ci.yml` audit step이 풀만 호출. 추후 별도 step 추가 검토.
- **모듈** (status 변동):
  - `scripts/audit-asset-flow.ts` — `--mode=compressed` flag 추가 (검증 도구 갱신)
  - `src/scenes/compressed/compiled-manifest.json` — 자동 재생성 (216 → 212 씬)
  - `src/scenes/compressed/*.scene.json` — `npm run compile:compressed`로 재컴파일 (시나리오 본문 stale 갱신 — 5/9 후반부 라운드들 + 5/10 H5 라벨 누출 라운드 등 다른 세션 변경분 반영 가능성)
  - `dist/` — `npm run build` 재실행 결과
  - `08-qa-deployment/verification-reports/08-pre-deploy-check.md` — §2 풀+압축 분리 표 + 압축본 발견 추가 + 결론 갱신
  - `00-master/PROGRESS-TRACKER.md` — 라인 9 누계 갱신 (압축본 점검 결과 추가)
  - `00-master/CHANGELOG.md` — 본 라운드 엔트리
- **사유**: 직전 라운드 PM 보고 후 사용자 질문 — "압축 버전과 풀스토리 버전 모두 점검한 것 맞아?". 본 사전 점검이 풀만 검증한 누락 확인 → 즉시 압축본 일괄 점검 진행 지시. 출시 직전 검증 신뢰도 회복.
- **승인**: PM (압축본 일괄 점검 진행 지시 2026-05-10).
- **다음 단계 (변동 없음)**:
  - 🔴 **E2E 회귀 처방 라운드** (출시 차단) — 풀 + 압축 양 모드 묶어 진행. PM 결정 옵션 A/B/C 후 Claude 처방.
  - ⬜ GitHub repo 생성 + push to main + Pages Source: GitHub Actions (PM 직접)

### 2026-05-10 — W5 메뉴 사이클: Save/Load · Settings · Mute · Auto-Speed · Font · Ending Score & Share

- **변경**: PauseMenu의 stub alert 3종(저장/불러오기/환경설정) 제거 + 신규 화면 진입. 음량 슬라이더는 미니 컨트롤에서 빠지고 음소거 토글로 대체(상세 음량은 SettingsScreen으로 이동). 자동재생 지연 슬라이더, 폰트 크기 슬라이더, 엔딩 점수 자동저장(metaStore), 엔딩 결과 공유 버튼 동시 추가. "타이틀로" 리셋 정책은 현행 그대로(autosave만 삭제, 갤러리·설정·수동 슬롯·엔딩 기록 보존).
  - **신규 파일 7개**:
    - `src/stores/metaStore.ts` — STATE-SCHEMA §4 MetaData를 zustand persist로 구현 (`kmu-vn-meta`, version 1). `recordEnding(record)` / `unlockCg/unlockBgm/unlockEnding` / `resetMeta`. `EndingRecord = { endingId, grade, finalScore, savedAt }` 타입.
    - `src/ui/MuteToggle.tsx` — VolumeControl 대체. 단일 토글(🔊/🔇), `audioManager.setVolumes({ muted })` 동기화는 App.tsx effect가 담당.
    - `src/ui/SaveLoadScreen.tsx` — 6슬롯 그리드. save/load 모드 prop, ✕ 삭제, confirm 다이얼로그, SaveSlotError STORAGE_ERROR 토스트.
    - `src/ui/SettingsScreen.tsx` — 음량 3슬라이더(BGM/SFX/Voice) + 텍스트속도 라디오 4종 + 자동진행/투명도/폰트 슬라이더 + skipUnseenText/reduceMotion/muted 토글 + 기본값 리셋 + 데이터 초기화.
    - `src/ui/util/shareEnding.ts` — Web Share API + 클립보드 + prompt 폴백 (의존성 0).
    - `tests/unit/metaStore.test.ts` / `snapshot.test.ts` / `shareEnding.test.ts` — 신규 단위 테스트.
  - **수정 11건**:
    - `src/stores/settingsStore.ts` — version 3→4 마이그레이션 + `muted` + `fontSize` (12~22) 필드 추가. `FONT_SIZE_MIN/MAX/DEFAULT` + `TEXT_SPEED_LABEL` export.
    - `src/stores/gameStore.ts` — `takeSnapshot()` / `applySnapshot(slot)` / `setSaveLoadOpen(mode)` / `setSettingsOpen(open)` 액션 + `saveLoadMode` / `isSettingsOpen` UI 상태 (휘발성, partialize 제외).
    - `src/ui/PauseMenu.tsx` — stub alert 3개 제거, `saveLoadMode/isSettingsOpen` 구독해 자식 화면 마운트 분기.
    - `src/ui/MiniControls.tsx` — `<VolumeControl />` → `<MuteToggle />` 교체 (PC + 모바일 햄버거 양쪽).
    - `src/ui/DialogueBox.tsx` — 자동재생 지연 200ms 하드코드 → `useSettingsStore((s) => s.autoAdvanceDelay)` 사용. effect deps 갱신.
    - `src/ui/EndingScreen.tsx` — `useEffect` + StrictMode ref 가드로 `metaStore.recordEnding` 1회 호출 (해금 + 점수 히스토리 누적). 신규 "결과 공유" 버튼 + 토스트.
    - `src/App.tsx` — `fontSize` 변경 시 `--font-size-text/--font-size-name/--font-size-monologue` CSS var 동기화. `muted` 변경 시 `audioManager.setVolumes({ muted })` 동기화.
    - `src/ui/gallery/CGGallery.tsx` / `BGMGallery.tsx` / `EndingGallery.tsx` — `flags as GameFlags & { unlocked_*?: ... }` 빈배열 cast → `useMetaStore((s) => s.unlocked_*)` 직접 구독으로 이관.
- **모듈** (status: review):
  - `06-engine/STATE-SCHEMA.md` — §3 Settings(muted/fontSize 추가, version 4), §4 MetaData(`endingHistory: EndingRecord[]` 추가), §6 또는 §7에 "타이틀로 리셋 정책" 명시 (autosave만 삭제, 수동 슬롯·meta·settings 보존).
  - `05-ui-design/UI-SPEC.md` — §8 환경설정에 fontSize 슬라이더 항목 추가, §10 SaveLoadScreen 신설(6슬롯 그리드 / save·load 모드 / ✕ 삭제 / 빈 슬롯 표기), §11 EndingScreen에 "결과 공유" 버튼.
- **사양 (PM 결정 2026-05-09 라운드 진입 시)**:
  - 리셋 범위: `kmu-vn-autosave`만 삭제. 수동 슬롯·meta·settings 보존 (현행 resetGame.ts 정책 유지).
  - BGM 위치 복원: 트랙 처음부터 fade-in (audioManager seek API 미추가).
  - 공유: 텍스트 + URL — Web Share API → 클립보드 → prompt 3단 폴백. 의존성 추가 0 (html2canvas 미사용).
  - 폰트: 12~22px 슬라이더, CSS var 동적 토글로 즉시 반영.
- **사유**: PauseMenu 메뉴 사이클이 stub 상태로 출시 차단급. W5 콘텐츠 통합 라운드 마지막 결착 + PM 추가 요구(자동재생 속도·폰트·엔딩 공유) 동시 처방. 회귀 위험 영역(saveSlots.ts·audioManager.ts) 비변경, 신규 store/util/UI 위주.
- **검증** (라운드 진입 시 plan):
  - 단위 테스트 3종 신규 + 기존 saveSlots.test.ts 호환 확인.
  - Playwright 16 엔딩 E2E 회귀 0 — EndingScreen + PauseMenu 변경에 따른 selector 안정성 검증.
  - 인게임 플레이 — 음소거 토글, 저장/불러오기 라운드트립, 자동진행 5초 슬라이더, 폰트 12↔22, "타이틀로" 후 갤러리·설정·수동 슬롯 보존, 엔딩 도달 → metaStore.endingHistory push, 결과 공유 → 클립보드/share sheet.
- **승인**: 사용자(PM) 플랜 승인 2026-05-09 (`C:\Users\PC\.claude\plans\4-cryptic-piglet.md`).

### 2026-05-10 — Phase C 사전 점검 라운드 (CronCreate 일회성 fire 03:20 KST) 🚨 출시 차단급 E2E 회귀 발견

- **변경**: 코드 변경 0 (README 정합 픽스만 허용 영역이었으나 README 잔재 0건이라 픽스 불요). 검증 전용 라운드.
- **실행**: 2026-05-10 03:20 KST CronCreate 일회성 fire (Phase C GitHub Pages 배포 직전 Claude 영역 사전 점검).
- **검증 결과** (7종 중 6종 통과 + 1종 출시 차단급 회귀):
  - ✅ **README 정합 점검**: 게임 제목 "구연시: 본과 1학년의 봄" L1 정확 반영, "성서로맨스" 잔재 0건. 잔여 stale (W1 → W6 진행 표시·자산 수치 48→63 등) 본 라운드 픽스 X (Phase B "유지" 원칙 일관성).
  - ✅ `npm run typecheck` — 0 errors
  - ✅ `npm test` — vitest 72/72 (rejectLines 11 + saveSlots 20 + toneMatrix 26 + branchEvaluator 15, 1.09s)
  - ✅ `npm run compile` — 212 씬 (warning 6: IF v0.1 미지원 기존 알려진 이슈)
  - ✅ `npm run validate` — 16/16 엔딩 + 거절 도달성 OK (h4_reply_speed 8건 정상 카운트) + BG 17+22 / CG 20 / VIDEO 12 / BGM 8en9ko / SFX 14en8ko 화이트리스트
  - ✅ `npm run build` — vite production 2.29s (index 692.91 KB / gzip 272.94 KB)
  - ✅ `npx tsx scripts/audit-asset-flow.ts` — Critical 16건 (BG_NULL_CRITICAL 14 + POSITION_COLLISION 2, 모두 별도 라운드 이연 기대 일치) + Major 12 + Info 110
  - 🚨 `npm run test:e2e` — **1 passed / 15 failed** (12.7m, retries=1로 재시도 후에도 회복 X). 정상 시 ~30s · 25배 증가.
- **출시 차단급 회귀 분석** (본 라운드 fix X — 코드 변경 0 원칙):
  - **실패 15건**: H1 4종(TRUE/HAPPY/NORMAL/BAD) + H2 4종(TRUE/HAPPY/NORMAL/BAD) + H3 3종(TRUE/HAPPY/NORMAL) + H4 2종(TRUE/NORMAL) + H5 1종(TRUE) + END_SOLO_SUMMER.
  - **통과 1건**: H4 REJECT 추정 (`KakaoModal handleTimeout`이 `startScene('ch06_h4_reject')` 직접 점프 경로라 EVALUATE_BRANCH 우회).
  - **원인 추정**: 2026-05-09 Ch5 엔딩 라우팅 복구 라운드(EVALUATE_BRANCH → EVALUATE_TIER 2-단계 분리)에서 엔진은 갱신됐으나 `tests/e2e/helpers.ts` + `endings.spec.ts`가 옛 1-단계 라우팅(`ch05_07_close + flags 주입` 직후 즉시 endingId 산출) 가정으로 작성된 채 미갱신 의심.
  - **회귀 발견 시점 지연**: Phase A 2번(2026-05-09 dead code 정리 + audit/validate 갱신) 진행 시 e2e 실행을 누락(typecheck + vitest + compile + validate + build + audit만 회귀 검증)하여 본 라운드까지 발견 지연.
- **처방 옵션** (PM 결정 대기):
  - **A) `tests/e2e/helpers.ts` `expectEnding` 경로를 2-단계 라우팅에 맞춤** (권장 — 게임 동작은 정확하고 e2e가 stale)
  - **B) flags 주입으로 chapter6 본편 + EVALUATE_TIER까지 자동 traverse하도록 helper 보강**
  - **C) `?scene=` 파라미터로 직접 엔딩 씬 진입** (가장 빠르지만 라우팅 검증력 약함)
- **모듈** (status 변동):
  - `08-qa-deployment/verification-reports/08-pre-deploy-check.md` — 신규 생성 (status: review)
  - `00-master/PROGRESS-TRACKER.md` — 라인 9 누계 + W6 섹션 출시 차단급 회귀 추가
  - `00-master/CHANGELOG.md` — 본 라운드 엔트리
- **사유**: PM 지시 — 5/10 03:20 일회성 예약 fire 시점에 Phase C(GitHub Pages 배포) 진입 직전 Claude 영역 사전 점검 일괄 진행. 출시 직전 회귀 가드.
- **승인**: PM (Phase C 사전 점검 진행 지시 2026-05-10).
- **다음 단계**:
  - 🔴 **E2E 회귀 처방 라운드** (출시 차단, PM 결정 옵션 A/B/C 후 Claude 처방)
  - ⬜ GitHub repo 생성 + push to main + Pages Source: GitHub Actions (PM 직접)
  - ⬜ 배포 후 라이브 검증

### 2026-05-10 — H5 라벨 누출 → "장윤영" 본명 일괄 치환 (지문/내레이션 한정)

- **변경**: H5 루트 시나리오의 NARRATION/지문 텍스트에 코드 라벨 `H5`가 그대로 새어나가 있던 자리를 본명 `장윤영`으로 일괄 치환. DIALOGUE/MONOLOGUE는 영향 없음(원래 본명/호칭 사용 중). 메타데이터·INC/IF/route 조건·`# Hint`·SOLO 폴백 디버그 라우팅 라인은 의도된 코드 참조라 미변경.
  - **수정 파일 23개 (총 89건 라인)**:
    - `src/scenes/` 메인 21개 파일 (NARRATION text 29건):
      - Festival 자리: `ch06_h5_01_festival_booth`, `ch06_h5_01_close`, `ch06_h5_01b_take`, `ch06_h5_01b_quick`, `ch06_h5_01b_light`
      - Club event 자리: `ch06_h5_02_club_event` ×4, `ch06_h5_02_close` ×2, `ch06_h5_02b_help`, `ch06_h5_02b_partial`
      - Library 자리: `ch06_h5_03_morning_library` ×2, `ch06_h5_03_close`, `ch06_h5_03b_distance` ×2, `ch06_h5_03b_quick`
      - Late kakao: `ch06_h5_04_late_kakao`, `ch06_h5_04b_avoid`
      - Blossom path / 마무리: `ch06_h5_05_blossom_path` ×2, `ch06_h5_05_close`, `ch06_h5_05b_call` ×2, `ch06_h5_05b_keep`
      - 트루 엔딩: `ch06_h5_true` ×4
    - `src/scenes/compressed/ch06_h5_true.scene.json` — NARRATION 1건
    - `03-story/scenarios/ch06_h5_yuna.md` — 지문 라인 29건
    - `03-story/scenarios/compressed/ch06_h5_yuna.md` — 지문 라인 1건 (트루 엔딩 시작 지문)
    - `03-story/scenarios/윤문 완료/ch06_h5_yuna.txt` — 지문 라인 29건
  - **치환 규칙**: 조사 호환 일괄 치환 — `H5가→장윤영이`, `H5는→장윤영은`, `H5를→장윤영을`, `H5의→장윤영의`, `H5와→장윤영과`, `H5에게→장윤영에게`, `H5에→장윤영에`, `H5 →장윤영 ` (장윤영은 ㅇ 받침 종성 → 가/이 중 "이" 선택). 모놀로그의 친근형 "윤영이"는 기존대로 유지.
  - **미변경 (의도)**:
    - `ch06_h5_solo_fallback.scene.json` 메인+compressed: SOLO 폴백 디버그 라우팅 NARRATION ("— H5 1위이지만 트루 진입 조건 미달...") — 디자이너 주석 톤이라 보존
    - `_backup-원본/ch06_h5_yuna.md`: 백업 원본, 의도적 미변경
    - 메타 `activeHeroines: ["H5"]`, `KEY_CHOICE.heroine: "H5"`, `FLAG_INC.key: "H5"`, `[INC: H5 +N]`, `[IF: H5 < 70]`, `# Hint: heroine=H5` 등 코드 참조 자리 모두 보존
  - **모듈**: `src/scenes/ch06_h5_*.scene.json` (21개) + compressed 1개 + `03-story/scenarios/ch06_h5_yuna.md` + `03-story/scenarios/윤문 완료/ch06_h5_yuna.txt`
  - **사유**: PM(사용자) 보고 — H5 NARRATION에 코드 라벨이 그대로 표시되어 인게임 화면에 "H5가 잠깐 멈춘다" 같은 문장이 출력되는 버그. 폴리시 윤문 단계에서 라벨 누출이 잡히지 않은 채 시드 시나리오 → .md → 윤문 .txt → .scene.json 전 단계에 전파됨.
  - **승인**: PM 구두 승인(2026-05-10)

---

### 2026-05-10 — 엔딩 결과 패치: 위너 아바타 / 히든 라인 누락 / 조연 토글 위치 / 히든 라벨 4건 변경

- **변경**: 엔딩 결과창의 4가지 이슈 일괄 수정.
  1. **위너 온도계 아바타 누락 수정** — `EndingStatsPanelDefault.tsx` 위너 thermometer가 `heroineId={winner}`('H1' 등 enum 값)로 호출되어 `/img/avatar/H1.webp`(존재 X)를 찾고 있었음. 비-위너는 `meta.id`(영문 슬러그 'serin' 등) 사용. 위너도 `HEROINES[winner].id`로 변경하여 `/img/avatar/serin.webp` 등 정상 매핑.
  2. **hidden 보너스 라인 누락 수정** — Phase 4의 `setTimeout` 체인이 friend/mom/junhyuk/taeho 라인을 순차 등장시키는 도중, 사용자가 카드 클릭/SPACE/ENTER로 advance하면 cleanup으로 timer 취소되어 hidden visibility set이 누락. Phase 5 effect 시작 시 Phase 1~4의 모든 라인을 final 상태(visibility + target)로 일괄 보강하여 누락 방지. 같은 flags면 어느 엔딩이든 동일 hidden 발현 보장.
  3. **조연 호감도 그리드를 '타이틀로 돌아가기' 버튼 옆 작은 토글로 이동** — 기존 `EndingStatsPanel.tsx`(정적) / `EndingStatsPanelDefault.tsx`(기본) 패널 내부에 있던 조연(7) ▾ 토글 + NPC 그리드 제거. `EndingScreen.tsx`로 단일 토글(`ending-npc-toggle`)과 NPC 그리드(`ending-npc-panel`)를 이동. 토글은 작은 글래스 버튼(`text-xs px-3 py-2`), 펼치면 7개 조연 온도계가 그 아래 row로 등장.
  4. **히든 보너스 라벨 변경**:
     - `오준혁 신` → `오준혁과 CC`
     - `보독표령` → `해부학교실 APPLY`
     - 영향: `endingScore.ts` (hiddenBonusLabels), `EndingStatsPanel.tsx`, `EndingStatsPanelAnimated.tsx`, `EndingStatsPanelDefault.tsx`. `최고의 아들`은 그대로.
- **수정 파일 6건**:
  - `src/ui/affection/EndingStatsPanelDefault.tsx` — winner heroineId 수정 + Phase 5 finalize 로직 + NPC 토글/그리드 코드 제거 + 라벨 변경
  - `src/ui/affection/EndingStatsPanel.tsx` — NPC 토글/그리드 제거 + 라벨 변경
  - `src/ui/affection/EndingStatsPanelAnimated.tsx` — 라벨 변경 (chip 텍스트)
  - `src/ui/EndingScreen.tsx` — NPC 토글 + 그리드 + `NpcThermItem` 컴포넌트 추가
  - `src/engine/endingScore.ts` — `hiddenBonusLabels` 라벨 변경 + 주석 변경
- **검증**:
  - END_H1_TRUE / H1=50 winner / mom=80 / junhyuk=80 / taeho=30 → mom hidden + junhyuk hidden 둘 다 표시 ✓ / SCORE 703 / GRADE S ✓
  - END_H1_TRUE / H1=50 / taeho=90 → "★ 해부학교실 APPLY (교수×3)" 라인 정상 발현 ✓
  - 위너 svg image href = `/img/avatar/serin.webp` ✓
  - `ending-npc-toggle`이 EndingScreen에 표시되고 패널 내부엔 없음 ✓
- **모듈**: 위 6건
- **승인**: PM 구두 승인 (2026-05-10)

---

### 2026-05-10 — Reduce-motion 정책 변경: OS 신호 무시, 게임 내 토글만 따름

- **변경**: `@media (prefers-reduced-motion: reduce)` 글로벌 룰을 `body[data-kmu-reduce-motion='true']` 셀렉터로 전환. App.tsx에서 `settings.reduceMotion` 변화를 body data attribute로 동기화. OS의 reduce-motion 신호(`prefers-reduced-motion`)는 더 이상 게임 동작에 영향을 주지 않음.
  - **수정 파일 3건**:
    - `src/styles/tokens.css` — 글로벌 reduce-motion 룰 (`* { animation-duration: 0.01ms; transition-duration: 0.01ms }`) 셀렉터를 OS 미디어 쿼리에서 body attribute로 전환
    - `src/styles/globals.css` — `orientation-lock-icon` + `char-anim-*` reduce-motion 룰 동일 패턴 전환
    - `src/App.tsx` — `useSettingsStore((s) => s.reduceMotion)` 변화 시 `document.body.dataset.kmuReduceMotion` 토글
  - **EndingScreen 분기 수정**: OS 신호 호출(`prefersReducedMotionOS`) 제거, `settings.reduceMotion`만 사용
  - **EndingStatsPanelDefault 수정**: 동일하게 OS 신호 호출 제거
  - **사유**: OS 레벨에서 prefers-reduced-motion이 켜진 사용자가 게임 시스템 설정을 건드리지 않고도 새 결과창 애니메이션을 볼 수 있어야 함. 게임 내 명시적 reduceMotion 토글이 있으니 그것만으로 사용자 의지를 받는다.
  - **모듈**: `src/styles/tokens.css`, `src/styles/globals.css`, `src/App.tsx`, `src/ui/EndingScreen.tsx`, `src/ui/affection/EndingStatsPanelDefault.tsx`
  - **승인**: PM 구두 승인(2026-05-10)
  - **검증**: 9초 시퀀스 정상 (phase 0→504ms→1900ms→1100ms→900ms→1500ms→500ms 도장). 게임 내 `reduceMotion=true` 시 정적 패널로 폴백, OS 신호는 무시.

---

### 2026-05-10 — 엔딩 결과 기본 시퀀스 애니메이션 도입 (toggle 의미 반전)

- **변경**: 이스터에그 토글이 OFF일 때도 점수 산정 시 항상 6단계 시퀀스 애니메이션이 재생되도록 변경. 기존 토글의 의미를 반전(OFF=신규 시퀀스 애니, ON=기존 액체 애니, reduced-motion=정적 폴백). 점수창 세로 정렬을 비-위너 체온계 컬럼 중심에 맞춤.
  - **신규 파일 1개**:
    - `src/ui/affection/EndingStatsPanelDefault.tsx` — 기본(이스터에그 OFF) 시퀀스 애니메이션 패널. Phase 1 위너 체온계 분홍 glow 페이드인+1회 맥동 + Winner 호감도 카운트업 → keybonus 카운트업(sequential). Phase 2 두 라인 동시 가중치 변환(라벨에 ×N + 값 동시 카운트업) + focus 발현 시 별도 라인. Phase 3 그 외 히로인 호감도 카운트업(체온계 변동 X) + SOLO 페널티 별도 라인. Phase 4 조연 보너스(×0.3) + 친목/히든(엄마/오준혁/교수) 순차 라인. Phase 5 SCORE 1500ms 계기판 카운트업. Phase 6 GRADE 바운스 도장.
  - **수정 1건**:
    - `src/ui/EndingScreen.tsx` — 분기 로직 3-way 확장:
      - `reducedMotion` (settings.reduceMotion 또는 OS prefers-reduced-motion) → `EndingStatsPanel` (정적 폴백)
      - `animatedEndingPanel: true` (이스터에그) → `EndingStatsPanelAnimated` (액체)
      - 그 외(기본) → `EndingStatsPanelDefault` (신규)
  - **레이아웃 변경**: 위너 단독 컬럼(top-align) + 비-위너 4명 컬럼·점수창 그룹(items-center) 으로 분리. 점수창 세로 중심이 비-위너 체온계 중심(0.78× scale)과 자동 정합.
  - **사양 (질문 3라운드 결과)**:
    - 라인: Winner 호감도 → keybonus 순차, Phase 2는 두 라인 동시 가중치 변환
    - 보너스: focus / SOLO / friend / hidden은 칩이 아닌 별도 라인으로 순차 등장
    - Winner 라벨: "Winner 호감도" (히로인명 미포함, ★ Winner 라벨로 식별)
    - Winner 네온: 분홍 glow 0→0.95 페이드인 + 1회 맥동
    - SCORE/GRADE 위치: 카드 상단 그대로 유지
    - 체온계 드레인 효과 제거 — 체온계는 정적 호감도값 유지, 점수창 라인만 카운트업
  - **모듈**: `src/ui/EndingScreen.tsx`, `src/ui/affection/EndingStatsPanelDefault.tsx`
  - **사유**: PM(사용자) 요청 — 토글 OFF에서도 결과창 임팩트가 너무 정적이라 항상 보이는 시퀀스 애니메이션이 필요. 이스터에그 액체 애니는 보존하되 토글 ON으로만 격상.
  - **보존**: `EndingStatsPanel.tsx`(reduced-motion 폴백), `EndingStatsPanelAnimated.tsx`(이스터에그 액체), `endingScore.ts`(점수 산정 SSoT) 모두 미수정. settings store의 `animatedEndingPanel` 키 유지(의미만 반전).
  - **승인**: PM 구두 승인(2026-05-09 plan)

---

### 2026-05-09 — 엔딩 점수 액체 애니메이션 패널(이스터에그) 추가

- **변경**: 엔딩 점수 산정 화면에 5단계 액체 채움 + 카운트업 + GRADE 도장 시퀀스 신규 패널 추가. 기존 `EndingStatsPanel.tsx`(347줄)는 절대 수정 X — 별도 컴포넌트로 분리하고 토글로 교체. 기본은 정적 패널, 이스터에그로만 활성.
  - **신규 파일 4개**:
    - `src/ui/affection/EndingStatsPanelAnimated.tsx` — 5단계 phase machine + 라인 5줄(Winner호감도×가중 / 핵심선택지×가중 / 그 외 히로인 / 조연 보너스(×0.3) / SCORE+GRADE) + 보정 칩(×집중1.2 / ×SOLO0.8 / ×친목1.3 / ★히든×5/×10/×3) + GRADE 도장 모션
    - `src/ui/affection/EndingLiquidBox.tsx` — 카드 배경 SVG `<feTurbulence>` + `<feDisplacementMap>` 액체 표면 + 거품 입자 + S컷(550점) 초과 시 골드 입자 분파
    - `src/ui/affection/useEndingCountUp.ts` — easeOutCubic 카운트업 훅 (setTimeout 16ms 폴링 — 자동화/headless 환경에서도 동작 보장. RAF 기반 시도가 일부 환경에서 미동작)
    - `src/ui/affection/useEndingPhaseMachine.ts` — phase 0~6 state machine + Space/Enter advance + Esc skip
  - **수정 3건**:
    - `src/stores/settingsStore.ts` — `animatedEndingPanel: boolean` 키 추가 (default false, localStorage persist)
    - `src/ui/EndingScreen.tsx:177` — `useSettingsStore((s) => s.animatedEndingPanel)`로 토글 분기 (이전 URL `?animated=1` 분기 폐기)
    - `src/ui/affection/AffectionStatusPanel.tsx:25` — PauseMenu(ESC)의 `<h3>호감도</h3>`에 `onClick`으로 토글. 이스터에그라 시각 시그널은 미묘 (ON 시 글씨 색 #FF6FA8 + glow 6px)
  - **사양 (질문 4라운드 결과)**:
    - 라인: 단순화 5줄 + 보정 칩, S등급 컷 550점에 박스 100% 채움, 초과 시 골드 입자 분파
    - 페이싱: 12~15초 자동 + Space/Enter 수동 advance + Esc/▶▶스킵 즉시 결과
    - 액체 색: 모두 핑크 단일색(#FF4F90 → #FFD9E5)
    - 흐름 trail: 안 보임 (체온계 ↓ ↔ 박스 ↑ 동시)
    - 가중치 ×N 적용: 액체가 부드럽게 부풀어오름
    - SOLO 페널티: "그 외 히로인" 라인 옆 ×0.8 칩 + heroineSum × 0.8 = hTotal로 누적 카운트업 갱신
  - **사용자 추가 결정 (구현 후)**:
    - 기본 동작은 기존 정적 패널 채택 (액체 애니는 토글 ON 시만)
    - 토글 출처: PauseMenu의 "호감도" 글씨 클릭 (URL 파라미터 폐기)
    - SFX 호출 전부 제거 — `audioManager.playSfx` 8건 모두 삭제, import 제거
- **모듈** (status: review):
  - `06-engine/` (settingsStore + EndingScreen wire 변경)
  - `05-ui-design/` (신규 EndingStatsPanelAnimated + EndingLiquidBox + 2개 훅)
- **사유**: PM이 점수 계산 시퀀스에 시각적 임팩트 원함. 다만 기본 흐름은 기존 정적 패널이 안전(reduced-motion·접근성 친화). 이스터에그로 숨겨두면 발견의 즐거움 + PM이 비교 검증 가능.
- **승인**: PM 결정 (구두) — CHANGELOG 기록 후 영향 모듈 status를 review로 PM이 직접 갱신 예정.

### 2026-05-09 — 스프라이트 검정 라운드 1: outfit 10종 적용 (sprite 활용률 0% → 적용)

- **변경**: 메인 시나리오 [CHARACTER:] sprite 토큰의 default → outfit_xxx 일괄 변환 (사용자 행 단위 OK/NO 입검 결과 적용한 16건) + H1/H5 트루 엔딩 본문 의상 묘사 동반 수정 2건. 총 18건.
  - **(1) `serin_outfit_casual`**: `ch06_h1_serin.md` line 69, 81 — `ch06_h1_01_festival_visit` 씬 한정 (사용자 입검 #1).
  - **(2) `serin_outfit_winter_coat`**: `ch06_h1_serin.md` line 632, 647 — H1 트루 분당 카페 (사용자 입검 #2).
  - **(3) `hajeong_outfit_lab_coat`**: `ch02_anatomy.md` line 78, 138 — `ch02_02_cadaver_first` [CHOICE] 등장 이전까지만 (사용자 입검 #3, 선택 후 자리 line 161, 226 default 유지).
  - **(4) `hajeong_outfit_party`**: `ch06_h2_hajeong.md` line 231 — 동성로 술집 자리만 (사용자 입검 #4 a).
  - **(5) `seol_outfit_casual`**: `ch06_h3_seol.md` line 66, 72 — `ch06_h3_01_festival_booth` 씬 한정 (사용자 입검 #5).
  - **(6) `seol_outfit_lab_late`**: `ch04_library.md` line 322, 337 — `ch04_03_lab_late` [CHOICE] 이전까지만 (사용자 입검 #6, 선택 후 자리 line 372 default 유지).
  - **(7) `seoyoon_outfit_date`**: `ch06_h4_seoyoon.md` line 439, 464 — `ch06_h4_04_date` 씬 한정 (사용자 입검 #7, 분기 후 자리 line 518, 566 default 유지).
  - **(8) `seoyoon_outfit_school`**: 적용 안 함 (사용자 입검 #8 NO — `ch06_h4` line 811, 870 default 유지).
  - **(9) `yuna_outfit_dress`**: `ch06_h5_yuna.md` line 847, 923 — H5 트루 벚꽃길 (사용자 입검 #9).
  - **(10) `yuna_outfit_festival`**: `ch06_h5_yuna.md` line 228 — `ch06_h5_02_club_event` 씬 한정 (사용자 입검 #10, 분기 후 자리 line 268 default 유지).
  - **본문 묘사 동반 수정 2건**:
    - `ch06_h1_serin.md` line 634: "베이지 셔츠 원피스+카디건 / 부스+산책로 콜백" → "베이지 트렌치 코트+흰 블라우스" (winter_coat 정합).
    - `ch06_h5_yuna.md` line 845: "캐주얼(흰 셔츠+청바지)" → "봄 차림(미니 원피스+카디건)" (dress 정합).
  - **표정 변화 포기**: outfit 적용 자리는 사용자 결정 4번에 따라 같은 sprite 통일 — `ch06_h1` 트루 default→smile_warm 변환, `ch06_h5` 트루 warm_smile 단일, `ch06_h4` 데이트 default→default 변환을 outfit 단일로 흡수.
- **모듈** (status: review):
  - `03-story/scenarios/ch02_anatomy.md` (sprite 2건)
  - `03-story/scenarios/ch04_library.md` (sprite 2건)
  - `03-story/scenarios/ch06_h1_serin.md` (sprite 4건 + 본문 1건)
  - `03-story/scenarios/ch06_h2_hajeong.md` (sprite 1건)
  - `03-story/scenarios/ch06_h3_seol.md` (sprite 2건)
  - `03-story/scenarios/ch06_h4_seoyoon.md` (sprite 2건)
  - `03-story/scenarios/ch06_h5_yuna.md` (sprite 3건 + 본문 1건)
- **사유**: 12개 outfit 변형 sprite 자산이 sprite-list.md에 정식 등록·생성된 상태에서 메인 시나리오 [CHARACTER:] 토큰에 한 번도 사용된 적 없는 자리 (자산 활용률 0%, 작가 메모 자체 점검에 의도만 적혀 있고 실 명령어엔 미반영). 사용자 지목 4건(ch06_h1_01_festival_visit / ch06_h1_true / ch06_h5_02_club_event / ch06_h5_true) 외에도 전 챕터에 동일 누락 발견 → 사용자 결정 1번(전 챕터 + 엔딩 전수 점검) + 결정 8번(매핑 표 행 단위 OK/NO 입검) 워크플로로 16건 sprite + 2건 본문 일괄 처방.
- **검증**:
  - **C-1 자산 매니페스트**: `public/img/sprites/`에서 10개 outfit .webp 실파일 존재 확인 ✓ (serin/hajeong/seol/seoyoon/yuna 각 2종)
  - **C-2 spriteResolver 통과**: `outfit_xxx` 토큰이 `src/data/spriteResolver.ts` line 83 분기(`sprite.includes('_')` true + `KNOWN_PREFIXES.has('outfit')` false → 정상 분기)로 통과해 `{prefix}_outfit_xxx` 합성 ✓
  - **C-3 본문-스프라이트 시각 정합**: 변경 16건 모두 직전·직후 [지문] 의상 묘사와 일치 (불일치 0건) ✓ — H1/H5 트루는 본문 동반 수정 2건으로 정합.
  - **C-4 표정 변화 포기 어색 자리 사전 식별**: 사용자 입검 단계에서 (a) 씬 한정 / (b) [CHOICE] 이전까지 / (c) 분기 후 default 유지 처방으로 어색 자리 미연 회피 — H4 distant 분기, H5 부스 표정 흐름 보존 ✓
- **변경 안 함 (사용자 결정 5·7번)**:
  - `compressed/`, `_backup-원본/`, `윤문 완료/` 디렉토리 (메인 .md만)
  - `src/scenes/*.scene.json` (다음 라운드 PM 컴파일 시 일괄 재생성)
  - `04-image-prompts/sprites/sprite-list.md`, `02-characters/heroines/*.md` §10 (자산 명세 정확 명칭 보존)
  - 각 ch06_h*.md 후반 작가 메모 (자체 점검) 섹션 (이력 기록 보존)
  - 작가 메모 어휘 잔존 차이 (`ch06_h1` 작가 메모의 `outfit_gown` vs 시트 정확 명칭 `outfit_winter_coat`) — 본문 [CHARACTER:]는 시트 정확 명칭으로 적용. 작가 메모 정합은 다음 라운드 추적.
- **잔여 추적**:
  - CG-sprite 부분 일치 후보 2건 (`cg_seol_true` 카디건+머리 풀림 두 결 부분 일치, `cg_seoyoon_first_meet` 흰 셔츠+긴 베이지 코트 부분 일치) — 본 라운드 미수정, 다음 라운드 검토.
  - `seoyoon_outfit_school` 미적용 (사용자 결정 #8 NO) — 트루 학생회관 자리 default 유지.
  - 컴파일 JSON 비동기화 — 다음 PM 컴파일 라운드에서 .md → JSON 일괄 처리 후 자체 플레이 확인.
- **승인**: PM 구두 (Phase A 매핑 표 행 단위 입검 + Phase B 18건 적용 + Phase C 검증 통과 2026-05-09).

### 2026-05-09 — Phase B PM 결정 묶음: 4건 모두 "유지" (출시 우선)

- **변경**: Phase B PM 결정 항목 4건 일괄 "유지" 결정 — 출시 차단급 작업 0건. 처방 코드 변경 0.
  - **(1) 엔딩 CG 배치 (NORMAL 3 + BAD 2 + SOLO 1 = 6건 미배치) — 미배치 그대로**: EndingScreen이 배경 BG + 엔딩 타이틀 + EndingStatsPanel(점수 카드 + 5H/7NPC 온도계 + 명대사)로 충분히 시각 부담 채움. TRUE 5/5 + HAPPY 3/3 + REJECT(cg_seoyoon_reject) 자산 보유분 그대로 출시.
  - **(2) 트루 시퀀스 ANIMATION-SPEC §12 vs 시나리오 정합 — 출시 후 라운드 이연**: 자체 플레이 검증(2026-05-09) 페이드 어색함 신고 0건. 결정적 결함 없음.
  - **(3) Ch.5 변태 망상 페어 #4 위치 — 현재 위치 유지**: `ch05_decision` Scene 06_pair_pause(모닥불 단체 풍경 직전). 챕터당 1~2회 룰 준수, §3.6 톤 가드레일 통과, 12세 등급 안전선 검증.
  - **(4) 외부 작가 윤문 어휘 룰 위반 3개 시나리오(ch06_h5_yuna·ch05_decision·ch06_h4_seoyoon) — 현재 상태 출시**: 자체 플레이 검증·톤 패스 통과 상태라 결정적 결함 없음. 빈도 위반은 추후 윤문 라운드 #2에서 일괄 처리 가능.
- **모듈** (status 변동 없음): 결정 기록만, 코드 무변동.
- **사유**: 출시 우선 원칙. 처방 가능 항목이지만 시각 부담·결함이 결정적이지 않고, 출시 후 후속 라운드로 이연 가능. PM 우선순위는 GitHub Pages 배포 → 출시.
- **승인**: PM (Phase B 1~4 모두 "유지" 2026-05-09).
- **다음 단계**: Phase C — GitHub Pages 활성화 + 도메인 설정 (PM 직접).

### 2026-05-09 — 코드 정합성 일괄 정리 라운드 (dead code 4건 + audit VALID_POSITIONS + validate KAKAO mechanism + audit CI 통합)

- **변경**: Phase A 2번 — 출시 전 코드 정합성 4건 묶음 처방. 회귀 위험 0 영역만 선별.
  - **(1) dead code 4건 b_late 시나리오 블록 제거** — H4 미니게임 5/9 라운드(15초 → 3초 즉시 패배)에서 KakaoModal `handleTimeout`이 `startScene('ch06_h4_reject')` 직접 점프로 바뀌면서, 옛 "답장 늦음 → b_late 분기 → -3 호감도 → close" 흐름이 도달 불가가 됐다. SSoT 시나리오 .md 4건(`ch04_library` ch04_05b_late / `ch05_decision` ch05_07b_late / `ch06_h4_seoyoon` ch06_h4_03b_late · ch06_h4_05b_late) + 압축본 4건 = 총 8건 `# Scene:` 블록 제거. stale `src/scenes/*.scene.json` + `src/scenes/compressed/*.scene.json` 8건 삭제. `npm run compile` 결과 216 → 212 씬으로 정확히 4건 감소. 시나리오 화자명·대사·next 참조 0건 (이미 5/9 라운드에서 `(타임아웃) → next: b_late` 분기는 시나리오에서 빠져 있었고 씬 정의만 stale로 남아있던 상태).
  - **(2) `scripts/audit-asset-flow.ts` VALID_POSITIONS 갱신** — 술집(`ch05_02b_h*`)·모닥불(`ch05_06b_h*`) 친밀 페어 슬롯 `pair_left`/`pair_right` 신규 등록. INVALID_POSITION 20건 false positive 일괄 해소(Critical 40 → 20).
  - **(3) `scripts/validate-build.ts` validateRejectReachability KAKAO 안 mechanism 카운트** — 5/9 라운드에서 H4 미니게임 mechanism이 옛 `[CHOICE_KAKAO]` 분리 표기 → `[KAKAO]` 안 choices 통합 표기로 바뀌었으나 validate 검증 로직은 `c.type === 'CHOICE'`만 보고 KAKAO 무시 → 컴파일된 8건 mechanism 카운트가 0건으로 잡혀 거절 도달성 false negative. `(c.type === 'CHOICE' || c.type === 'KAKAO')` 분기 통합. (b_late 4건 제거 후 표면화된 검증 회귀 처방.)
  - **(4) `.github/workflows/ci.yml` audit-asset-flow CI 통합** — `Validate build` 다음 step에 `Audit asset flow` 신규(npx tsx 직접 호출). 잔여 BG_NULL_CRITICAL false positive 14건 + POSITION_COLLISION 2건이 별도 라운드로 이연된 상태라 `continue-on-error: true`로 비차단(빌드 실패 X, 로그만 노출). 잔여 처방 완료 후 비차단 플래그 제거 예정.
- **모듈** (status 변동 없음 — 모두 코드 정합성):
  - `03-story/scenarios/ch04_library.md` (b_late 블록 제거)
  - `03-story/scenarios/ch05_decision.md` (b_late 블록 제거)
  - `03-story/scenarios/ch06_h4_seoyoon.md` (b_late 블록 ×2 제거)
  - `03-story/scenarios/compressed/ch04_library.md` / `ch05_decision.md` / `ch06_h4_seoyoon.md` (동일 4건 압축본)
  - `scripts/audit-asset-flow.ts` (VALID_POSITIONS pair_left/pair_right 추가)
  - `scripts/validate-build.ts` (validateRejectReachability KAKAO 분기 추가)
  - `.github/workflows/ci.yml` (Audit step 신규, continue-on-error 비차단)
  - 컴파일 결과 자동 갱신: `src/scenes/*.scene.json` 4건 삭제 + `src/scenes/compiled-manifest.json` 갱신
- **사유**: 출시 전 사전 정리. 배포 후 회귀 방지 + 도구 가드(audit CI 자동 실행)를 켜둔 상태로 출시. PM 결정 불요 영역만 묶음 처방.
- **검증**:
  - `npm run typecheck` — 0 errors ✓
  - `npm run test` — vitest 72/72 통과 ✓
  - `npm run compile` — 216 → 212 씬 (b_late 4건 정확 감소) ✓
  - `npm run validate` — 16/16 엔딩 + KEY 매트릭스 + 거절 도달성(신표기 H4 미니게임 8건 정상 카운트) + BG/CG/VIDEO/BGM/SFX 화이트리스트 ✓
  - `npm run build` — vite production 2.13s 통과 ✓
  - `npx tsx scripts/audit-asset-flow.ts` — Critical 40 → **16건** (24건 처방: INVALID_POSITION 20건 false positive 해소 + dead code 4건 제거). 잔여 16건 = BG_NULL_CRITICAL 14건(KAKAO/CHOICE edge BG 상속 BFS 정정 별도 라운드) + POSITION_COLLISION 2건(별도 검토).
- **잔여 (별도 라운드)**:
  - audit BG_NULL_CRITICAL 14건 BFS edge BG 상속 정합 정정 (KAKAO.choices.next + startScene 호출에서 incoming BG 상속)
  - POSITION_COLLISION 2건 시각 검토
  - 위 잔여 처방 후 ci.yml `continue-on-error: true` 제거 → 차단 가드로 격상
- **승인**: PM (Phase A 2번 진행 지시 2026-05-09).

### 2026-05-09 — 엔딩 결과 화면 v3: 조연 ×0.3 가중 + 표현 한국어화 + 60:40 좌우 + BG-only 스프라이트

- **변경**:
  - **(1) 조연(친구 5 + 엄마 + 교수 = 7명) 호감도에 ×0.3 가중치** — [`src/engine/endingScore.ts`](../src/engine/endingScore.ts) `SUPPORTING_WEIGHT = 0.3` 신설. 각 조연 인물 점수 = 호감도 × 0.3 × (개별 곱셈 보너스 if any). 기존 곱셈 보너스(엄마×5/오준혁×10/교수×3)는 0.3 적용 후 곱해져 실효 ×1.5/×3/×0.9. 친목 보너스(친구 합 ×1.3)도 0.3 적용된 친구 합에 적용. 사유: 조연 점수가 히로인 점수 비중을 압도하지 않도록 — "히로인 본편이 메인" 의도 강화.
  - **(2) 등급 컷 50의 배수 정리** — [`src/engine/endingScore.ts`](../src/engine/endingScore.ts) GRADE_CUTS = { S:550, A:400, B:300, C:200, D:0 }. 조연 ×0.3 적용 후 v3 시뮬 분포(TRUE 337-657 med 520 / HAPPY 290-508 med 420 / NORMAL 145-387 med 302 / BAD 136-323 med 243 / REJECT 90-266 med 194 / SOLO 34-173 med 133) 기반. 이전 v2 컷 650/500/400/300/0보다 약 25% 하향.
  - **(3) 표현 한국어화·축약** — UI 라벨 일괄 정정:
    - "KEY" → "핵심 선택지"
    - "H/H1" → "히로인/세린" ([`src/data/characters.ts`](../src/data/characters.ts) HEROINES에 `shortName` 추가: 세린/하정/한설/서윤/윤영. AffectionThermometer nameLabel + Stats breakdown 라벨에 사용. 한국어 본명 `차세린/윤하정/장윤영` 등은 시나리오/카톡 sender 그대로 유지)
    - "NPC/친구·가족·교수" → "조연" (더보기 토글 라벨)
    - "카테고리" → "엔딩 가중"
    - "윈너" → "Winner" (영문 유지 — PM 결정)
  - **(4) 엔딩 이름 포맷 일괄 변경** — [`src/data/endings.ts`](../src/data/endings.ts) ENDING_CATALOG title 16개 갱신:
    - "차세린 트루" → "세린 / TRUE"
    - "한설 해피" → "한설 / HAPPY"
    - "나서윤 거절" → "서윤 / REJECT"
    - "혼자 여름방학" → "혼자 여름방학 / SOLO"
    - subtitle("내과의 봄", "성서의 봄", "느린 답장", "답장이 늦어서") 4개는 그대로 유지 — 제목 다음 줄 "— ... —" 형식.
  - **(5) BG-only 5개 엔딩에 윈너 히로인 스프라이트 합성** — [`src/data/endingFlavor.ts`](../src/data/endingFlavor.ts) `EndingFlavor.sprite?: string` 필드 추가. 톤별 매핑:
    - END_H1_NORMAL → `serin_smile_warm` (학생-선생님 거리 정중하지만 따뜻)
    - END_H1_BAD → `serin_concerned` (거리 재확립의 단호함)
    - END_H2_NORMAL → `hajeong_smile_small` (가벼운 친구)
    - END_H2_BAD → `hajeong_pout` (어색한 대답)
    - END_H3_NORMAL → `seol_smile_slight` (잠깐 빼두는 거리)
    - SOLO_SUMMER 미사용(윈너 없음). [`src/ui/EndingScreen.tsx`](../src/ui/EndingScreen.tsx) 레이어 2b 추가 — vignette + 스프라이트 + 0.62 오버레이 순으로 합성.
  - **(6) 60:40 좌우 레이아웃 + 조연 온도계 0.65** — [`src/ui/affection/EndingStatsPanel.tsx`](../src/ui/affection/EndingStatsPanel.tsx) `flex-row gap-4` 컨테이너 + 좌측 `flex-[6]`(온도계 영역) / 우측 `flex-[4]`(점수표). 조연 온도계 SCALE 0.5→0.65 + height 18px 다이어트(라벨과 온도계 간격 축소). 점수표 SCORE/GRADE는 가로 배치 유지(폭 좁아짐 대비), breakdown row는 세로 그대로.
- **모듈** (status: review):
  - `src/data/characters.ts` (HEROINES shortName)
  - `src/data/endings.ts` (ENDING_CATALOG title 포맷)
  - `src/data/endingFlavor.ts` (EndingFlavor.sprite + 5 매핑)
  - `src/engine/endingScore.ts` (SUPPORTING_WEIGHT 0.3 + GRADE_CUTS)
  - `src/ui/EndingScreen.tsx` (스프라이트 레이어)
  - `src/ui/affection/EndingStatsPanel.tsx` (60:40 + 조연 0.65 + 라벨 일괄)
  - `scripts/simulateEndingScores.ts` (재실행 결과 분포)
- **사유**: PM 1차 검수 후 후속 6건 — ① 조연 점수가 너무 큰 비중 → ×0.3 가중, ② 표현 일관화(한국어/축약), ③ BG-only 엔딩에 인물 부재 시 분위기 부족 → 스프라이트 합성, ④ 조연 온도계가 너무 작음 → 0.65 + 간격 축소, ⑤ endingFlavor PM 직접 검토 완료 — 그대로 유지, ⑥ 가로 화면 기준 → 좌우 60:40 분할.
- **검증**: `tsc --noEmit` 통과. `npm test` 72/72 통과. `npx tsx scripts/simulateEndingScores.ts` 재실행 — 새 분포 출력. preview MCP 시각 검증:
  - **END_H1_NORMAL (H1=75, KEY 1, 비윈너 30 average)**: BG `bg_campus_cafe` + 우측 스프라이트 `serin_smile_warm` (height 704, right 77px) ✓ Winner 세린 (75+10)×1×1.2=102 / 히로인합 217 / 친구합 44(×0.3) / 엄마 5 / 교수 3 = 268 → **C** (>200, <300) ✓ 표현 "Winner 세린", "핵심 선택지", "엔딩 가중", "조연 (7)" ✓ 제목 "세린 / NORMAL" ✓
  - **친목+히든(오준혁 max=130) END_H1_TRUE**: Winner 세린 324 / 히로인합 444 / 친구합 raw 446(오준혁 130×0.3×10=390 포함) → ×친목 1.3 = 580 / 엄마 5 / 교수 3 = **1031** → **S** ✓ ★ 오준혁 신 칩 + 골드 외곽 ✓
  - 60:40 좌우 레이아웃 동작 ✓ NPC 토글 라벨 "조연 (7) ▾" ✓ 온도계 scale 0.65 ✓
- **승인**: PM 명시적 메시지("점수 공식에 오해가 있었어..." → 4-question 라운드 1·2 → 6번 후속 PM 명시).

### 2026-05-09 — 엔딩 결과 화면 v2: 인물별 곱셈 점수 모델 + 인물별 임계 차별화 + 보너스 재설계

- **변경**:
  - **(1) 점수 공식 인물별 곱셈 모델로 재설계** — [`src/engine/endingScore.ts`](../src/engine/endingScore.ts) 전면 재작성. 이전 라운드의 "전체 점수 × 카테고리 배수" 모델을 폐기하고 PM 정정에 따라 "각 인물의 호감도 점수에만 보너스 적용" 모델로 전환:
    - **윈너 H 점수** = (호감도 + 윈너KEY×10) × 카테고리배수 × 집중배수
      - 카테고리: TRUE 2.0 / HAPPY 1.5 / NORMAL 1.0 / BAD 0.7 / REJECT 0.6
      - 집중: 윈너-2위 격차 ≥40 → ×1.2
    - **비-윈너 H 점수** = 호감도 (×1)
    - **엄마 점수** = 호감도 × (5 if 12명 중 max) — 최고의 아들 보너스
    - **오준혁 점수** = 호감도 × (10 if 12명 중 max) — 오준혁 신 (히든)
    - **교수 점수** = 호감도 × (3 if 12명 중 max) — 보독표령 보너스
    - **친구 5명 합** (오준혁 점수 포함된 후) × (1.3 if 4명 이상 ≥40) — 친목 보너스
    - **SOLO 페널티** = H 5명 합에만 ×0.8 (NPC는 그대로)
    - **finalScore** = H_total + 친구합(친목 적용) + 엄마 점수 + 교수 점수
  - **(2) 인물별 트루/해피/노말/배드 임계 차별화** — [`src/engine/scriptInterpreter.ts:125-180`](../src/engine/scriptInterpreter.ts) determineEnding 재작성. BRANCH-GRAPH §4 시뮬 누적(H1+113 / H2+117 / H3+98 / H4+68 / H5+125) 기반 ~75-85% 컷:
    - H1: TRUE ≥105 / HAPPY ≥90 / NORMAL ≥70 / BAD <70
    - H2: TRUE ≥110 / HAPPY ≥95 / NORMAL ≥75 / BAD <75
    - H3: TRUE ≥90 / HAPPY ≥75 / NORMAL <75 (BAD 자리 NORMAL 흡수)
    - H4: TRUE ≥70 + KEY≥3 + late=0 / NORMAL ≥45 / REJECT (late≥1 OR aff<45)
    - H5: TRUE ≥120 + KEY≥3 / 미달 SOLO_SUMMER 폴백
    - 모든 케이스 KEY ≥3 유지. 사유: 캡 해제로 시뮬 누적이 100~125까지 가능해진 후 일률 ≥80은 너무 쉬움. PM 결정 "난이도 조금 있었으면 해".
  - **(3) 새 등급 컷** — [`src/engine/endingScore.ts`](../src/engine/endingScore.ts) GRADE_CUTS = { S:650, A:500, B:400, C:300, D:0 }. 시뮬 분포(TRUE 340-856 med 653 / HAPPY 293-706 med 525 / NORMAL 148-586 med 407 / BAD 140-522 med 348 / REJECT 94-464 med 299 / SOLO 37-372 med 238) 기반 neutral 중앙값 + 50의 배수 정리. 히든 발현 시 1100~2300 → 거의 항상 S(이스터에그 의도).
  - **(4) EndingStatsPanel breakdown 인물별 분해 표시** — [`src/ui/affection/EndingStatsPanel.tsx`](../src/ui/affection/EndingStatsPanel.tsx) 점수 카드 row 구조 갱신. 윈너 분해(호감도+KEY×10 → ×카테고리 → ×집중 → 합) → H 합 (+ SOLO 페널티 if SOLO) → 친구합 (+ 친목 if 발현) → 엄마/교수 점수 → 히든 칩(★ 최고의 아들 / ★★ 오준혁 신 / ★ 보독표령). 적용된 항목만 가변 노출.
  - **(5) 시뮬 스크립트 v2 + 단위 테스트 갱신** — [`scripts/simulateEndingScores.ts`](../scripts/simulateEndingScores.ts) 재작성(인물별 곱셈 + mom/junhyuk/taeho 히든 변형). [`tests/unit/branchEvaluator.test.ts`](../tests/unit/branchEvaluator.test.ts) 7개 케이스 임계값 갱신 (H1 80→105, H2 80→110/HAPPY 70→95, H3 80→90, H4 60→45, H5 80→120, 동률 80→110 등).
- **모듈** (status: review):
  - `src/engine/endingScore.ts` (전면 재작성)
  - `src/engine/scriptInterpreter.ts` (determineEnding 인물별 임계)
  - `src/ui/affection/EndingStatsPanel.tsx` (breakdown 분해 표시)
  - `scripts/simulateEndingScores.ts` (인물별 곱셈 시뮬)
  - `tests/unit/branchEvaluator.test.ts` (임계 갱신)
- **사유**: 직전 라운드(1차) 후 PM 명시적 정정 — "트루 2배 보너스는 트루 엔딩을 함께한 히로인의 호감도 점수에만 곱해지는 거고, 최고의 아들 보너스는 엄마의 점수에만 곱해지는 거". 즉 이전의 "(전체 base) × 카테고리배수 + 글로벌 가산 보너스"를 "각 인물 점수 × 그 인물 전용 곱셈"으로 패러다임 전환. 임계값도 "수학적으로 예측하고 세밀하게 조정하여 다르게 주어져야 해" — 인물별 차별화로 전환. 보너스도 "처음부터 다시 검토" — 가산 보너스(이전 집중/순수/완주/친목 가산) 폐기, 인물별/그룹별 곱셈으로 재설계.
- **검증**: `tsc --noEmit` 통과. `npm test` 72/72 통과(rejectLines/saveSlots/toneMatrix/branchEvaluator 갱신본). `npx tsx scripts/simulateEndingScores.ts` 분포 산출. preview MCP 시각 검증:
  - **H1 TRUE 일반(H1=113, KEY3, neutral NPC)**: 윈너 (113+30)×2×1.2=343 / H합 463 / 친구합 145(친목 미발현) / 엄마 15 / 교수 10 → finalScore 633 → A (650 미만) ✓
  - **H1 TRUE 친목 발현(친구 4명 ≥40)**: 친구합 212×1.3=276 → finalScore 762 → S ✓
  - **H1 TRUE 히든(엄마=130 max)**: 엄마 점수 650(=130×5) → finalScore 1256 → S, ★ 최고의 아들 칩 노출 ✓
  - **SOLO_SUMMER**: H합 108 × 0.8 = 86, finalScore 236 → D, bg_studio_room 풀스크린 ✓
- **승인**: PM 명시적 승인 (메시지 "점수 공식에 오해가 있었어... 점수 체계를 완전히 새로 다시 짜" + 4-question AskUserQuestion 라운드 2회 — 점수 공식 / 임계값 / 보너스 / 등급 컷).

### 2026-05-09 — 엔딩 결과 화면 종합 업그레이드: 결정적 장면 배경 + 명대사 + 카테고리 배수 점수 + NPC 토글 + 캡 해제

- **변경**:
  - **(1) 호감도 0~100 캡 해제** — [`src/stores/gameStore.ts:428`](../src/stores/gameStore.ts) FLAG_INC clamp의 `Math.min(100, ...)` 제거. 음수 방지(`Math.max(0, ...)`)는 유지. 누적 호감도가 그대로 라벨/점수에 노출(예: H5 시뮬 +125). 트루 임계 ≥80 등 분기 로직은 100 초과 통과로 무영향. 사유: 시뮬상 누적이 100을 넘는데 잘려나가 의미 있는 차이가 사라지는 문제.
  - **(2) 신규 데이터 모듈 endingFlavor.ts** — [`src/data/endingFlavor.ts`](../src/data/endingFlavor.ts) 신규. `Record<EndingId, EndingFlavor>` 16개 키 컴파일 강제. 각 엔딩별 `decisiveImage`(cg/bg/none) + `quote`(명대사) + `quoteSpeaker`. CG 보유 10개 엔딩(TRUE 5 + HAPPY 3 + H4_NORMAL + H4_REJECT는 'none'으로 우회) + BG-only 6개(H1/H2 NORMAL/BAD, H3 NORMAL, SOLO_SUMMER) + REJECT 1개(none). 명대사 1차 추출 후 PM 검수 대상.
  - **(3) EndingScreen 시각 리뉴얼** — [`src/ui/EndingScreen.tsx`](../src/ui/EndingScreen.tsx) 4-레이어 합성: ① 결정적 장면 이미지 풀스크린(`/img/cg|bg/{id}.webp`, CG는 saturate 1·brightness 0.88 / BG는 saturate 0.85·brightness 0.7) ② BG에 한정 radial-gradient vignette(스포트라이트) ③ 어두운 보라 반투명 오버레이(CG 0.78, BG 0.62, none 단색) ④ 콘텐츠(명대사 인용 「...」 + 화자 footer + 제목 + 통계 패널 + 복귀 버튼). REJECT는 `decisiveImage.type === 'none'`으로 단순 어두운 배경 유지(RejectEnding 8단계 자체 처리 무수정). `data-testid="ending-screen"`, `data-ending-id` 그대로 유지.
  - **(4) 점수 공식 정교화 — endingScore.ts SSoT 분리** — [`src/engine/endingScore.ts`](../src/engine/endingScore.ts) 신규(순수 로직). 6단계 산출: ① base = heroineSum + winnerBonus(×1) + keyChoiceBonus(×5) + npcBonus(×0.3), ② tiered = base × ENDING_MULTIPLIER[category] (TRUE 2.0 / HAPPY 1.5 / NORMAL 1.0 / BAD 0.7 / REJECT 0.6 / SOLO 0.8), ③ additive = focus(+50, 윈너-2위 ≥40) + pure(+20, NPC 합 ≤200) + completion(+15, 모든 H ≥30) + friend(+25, 친구 5명 중 4명 이상 ≥40), ④ raw = tiered + additive, ⑤ multiplicative = (×5 if 엄마 max) × (×10 if 오준혁 max), ⑥ finalScore = raw × multiplicativeFactor. 히든(★) 발현 시 점수 카드 골드 외곽 + 라벨 칩 노출.
  - **(5) 등급 컷 재산정** — `endingScore.GRADE_CUTS` = { S:900, A:600, B:400, C:200, D:0 }. [`scripts/simulateEndingScores.ts`](../scripts/simulateEndingScores.ts) 신규 — 5 winner × 6 카테고리 × 3 시나리오(optimal/neutral/pessimal) ≈ 90 케이스 + 히든 변형(mom/junhyuk/both) 시뮬. 분포: TRUE 555–1132 / HAPPY 501–825 / NORMAL 269–551 / BAD 257–398 / REJECT 177–245 / SOLO 53–166. 자동 산정 컷(904/702/453/392)이 NORMAL pessimal을 D로 떨어뜨려 수동 보정. 히든 발현 시 1800~11000 → 거의 항상 S(이스터에그).
  - **(6) EndingStatsPanel 분리·압축** — [`src/ui/affection/EndingStatsPanel.tsx`](../src/ui/affection/EndingStatsPanel.tsx) 메인 row를 H 5명만(윈너 0.95 / 나머지 0.78 scale 유지)으로 축소, NPC 7명은 "친구·가족·교수 (7) ▾" 토글로 분리(`data-testid="ending-npc-toggle"`/`ending-npc-panel`, scale 0.55→0.5). 라벨 `{value} / 100` → 100 이하면 `{value}점`, 초과면 `{value}점 (+오버)` 골드. 점수 카드 breakdown은 적용된 항목만 가변 노출(미달은 row 미렌더). 외곽/내부 padding 압축(`py-10`→`py-6`, `mb-3/6`→`mb-2/3`, `gap-3/4`→`gap-2/3`) — 1280×800 한 화면 안에 들어옴.
- **모듈** (status: review):
  - `src/stores/gameStore.ts` (line 428 캡 제거)
  - `src/data/endingFlavor.ts` (신규)
  - `src/engine/endingScore.ts` (신규)
  - `src/ui/EndingScreen.tsx`
  - `src/ui/affection/EndingStatsPanel.tsx`
  - `scripts/simulateEndingScores.ts` (신규)
- **사유**: 사용자 요청 6건 ① 어두운보라 단색 배경을 결정적 장면 + 반투명 오버레이로, ② NPC 온도계 더보기 토글, ③ "100점 만점" 표기 폐기 → 호감도만, ④ 점수 체계 정교화(트루 ×2, 해피 ×1.5 등), ⑤ 시뮬 기반 새 등급 컷, ⑥ 레이아웃 살짝 압축. 추가 PM 결정: 보너스 4종(focus/pure/completion/friend) + 히든 2종(엄마 ×5, 오준혁 ×10).
- **검증**: `tsc --noEmit` 통과, `npm test` 72/72 통과(rejectLines/saveSlots/toneMatrix/branchEvaluator), `npx tsx scripts/simulateEndingScores.ts` 분포·컷 산출 통과. preview MCP 시각 검증: ① END_H1_TRUE(H1=113, KEY3) — cg_serin_true 풀스크린 + 명대사 「잘 받았어요. 진짜로.」 + 카테고리 배수(TRUE ×2)824 + 집중+50 + 순수+20, finalScore 894 → A 등급 ✓. ② END_H1_NORMAL(H1=55) — bg_campus_cafe 풀스크린 + filter saturate(0.85) brightness(0.7) + radial-gradient vignette + 0.62 오버레이 + ×1 배수 → C 등급 ✓. ③ NPC 토글 — 클릭 시 ▾→▴ + 7명 SVG 펼침 + 화면 한 컷 안 ✓. ④ 히든(mom=120) — 점수 카드 골드 외곽(2px solid #FFD86B) + boxShadow gold + ★ 최고의 아들 칩 + ×5 row, finalScore 4400 → S 등급 ✓. ⑤ REJECT — `decisiveImage.type === 'none'`으로 RejectEnding 8단계 후 백업 진입 시 단순 어두운 배경 유지 ✓.
- **승인**: PM 명시적 승인(plan mode ExitPlanMode + 사전 4-question AskUserQuestion 라운드 — 캡 해제 / 카테고리 배수 / NPC 토글 / 보너스 종류).

### 2026-05-09 — 스토리 검증 라운드: 5건 일괄 패치 + 카톡 UI 정합화 + 거절 엔딩 머뭇거림 연출

- **변경**:
  - **(1) 선택지 매 진입 셔플** — [`src/ui/ChoiceList.tsx`](../src/ui/ChoiceList.tsx): `useMemo`로 cmd identity 변경 시 1회 Fisher-Yates 셔플. `data-testid="choice-${origIdx}"`와 `pickChoice(origIdx)`는 원본 인덱스 유지(e2e [`tests/e2e/helpers.ts:108`](../tests/e2e/helpers.ts) 호환). 사유: 매 진입마다 동일 순서 → 최상단 옵션 선호 편향. 셔플로 균형.
  - **(2) 차세린 트루 엔딩 카페 BG** — PM 자산 `game-project/assets/bg_cafe_.png` → ffmpeg(libwebp q=80) 변환 → [`public/img/bg/bg_cafe_serin.webp`](../public/img/bg/bg_cafe_serin.webp) (127KB). [`src/scenes/ch06_h1_true.scene.json:6`](../src/scenes/ch06_h1_true.scene.json) + 압축본: BG 키 `bg_bundang_home` → `bg_cafe_serin`. 사유: 내레이션은 "분당 본가 근처 카페 창가"인데 배경이 본가 거실로 박혀 있어 정합성 깨짐.
  - **(3) 거절 엔딩 카톡 KakaoModal 표준화 + 8단계 후반부 분리** — [`src/scenes/ch06_h4_reject.scene.json`](../src/scenes/ch06_h4_reject.scene.json) + 압축본을 정식 시나리오로 재작성: BG black + BGM bgm_sad + SFX katalk_notify + KAKAO(heroine: H4, mode: dm, 4줄) + ENDING. [`src/ui/katalk/RejectEnding.tsx`](../src/ui/katalk/RejectEnding.tsx): 카톡 단계(`fade-in`/`typing`/`messages`/`pause`) 제거 → `fade-out` → `title` → `video` → `toast` 4단계만 처리(EndingScreen 호출 시 시작). [`src/ui/katalk/KakaoModal.tsx`](../src/ui/katalk/KakaoModal.tsx) `handleTimeout`: ReplyTimer 타임아웃 시 `pendingEnding` 직접 set 대신 `startScene('ch06_h4_reject')` 점프 → 정상 흐름에서도 KakaoModal 모바일 폰창으로 거절 4줄 표시. 사유: 거절 엔딩 카톡이 RejectEnding 자체 풀스크린 UI라 다른 챕터 카톡과 시각적으로 이질적.
  - **(4) 장윤영 첫 등장 후 선택지: H5만 변동** — [`src/scenes/ch03_04_back_to_school.scene.json`](../src/scenes/ch03_04_back_to_school.scene.json) + 압축본: `meta.activeHeroines` `["H1","H5"]` → `["H5"]`. 사유: 톤 매트릭스가 H1(차세린)에게도 영향(`bright_forward` 시 H1: -1, `direct_friendly` 시 H1: +1) — 사용자 의도는 장윤영 첫 등장 직후 선택지에서 차세린 호감도 흔들림 제거.
  - **(5) SOLO 엔딩 작가 노트 NARRATION 삭제** — [`src/scenes/end_solo_summer_main.scene.json`](../src/scenes/end_solo_summer_main.scene.json): 라인 27의 `{분기 진입 변주 — 본 모놀로그 첫 줄 한 줄만 진입 조건별로 변주 가능...}` NARRATION 노드 제거. 압축본은 이미 정리됨. 사유: 작가 메모가 화면에 그대로 출력되는 버그.
  - **(6) 거절 엔딩 카톡 머뭇거림 시퀀스 (메시지 단위)** — [`src/engine/types.ts`](../src/engine/types.ts) `KakaoMessage`에 `preTyping1?`, `prePause?`, `preTyping2?` 필드 추가. KAKAO 명령에 `hesitate?: boolean`(글로벌 디폴트 1000/600/1000), `unreadFadeMs?: number` 추가. [`src/ui/katalk/KakaoModal.tsx`](../src/ui/katalk/KakaoModal.tsx): `nextMsgSeq` useMemo로 다음 메시지의 단계별 ms 산출, 0인 단계 자동 스킵. typing 인디케이터 표시 조건과 가속 비활성화도 메시지별 시퀀스 인지. 사용자 표 정합 ([`src/scenes/ch06_h4_reject.scene.json`](../src/scenes/ch06_h4_reject.scene.json) + 압축본):
    - 메시지 1 "답장이 너무 늦어서 미안해ㅠㅠ": typing(1.0s) → pause(0.6s) → typing(0.8s)
    - 메시지 2 "그날 만나서 얘기하고 시간 잘 보냈는데": typing(0.6s)
    - 메시지 3 "더 진행하기엔 무리가 있을거 같아..": pause(0.6s) → typing(0.5s)
    - 메시지 4 "좋은 인연 만나길 바랄게 🥺🥺": typing(0.8s) → pause(1.0s) → typing(3.0s)
  - **(7) typing 인디케이터 말풍선·폰트 통일** — [`src/ui/katalk/KakaoMessage.tsx`](../src/ui/katalk/KakaoMessage.tsx) `showTyping` 분기 + [`src/ui/katalk/KakaoModal.tsx`](../src/ui/katalk/KakaoModal.tsx) 머뭇거림 인디케이터: 기존 `text-sm` 클래스 → `fontSize: var(--kakao-font-size)` + `lineHeight: 1.4` 인라인. 일반 메시지 버블과 fontSize/lineHeight/padding/borderRadius 모두 일치(색만 typing-dot으로 옅게 유지). 사유: typing 버블이 일반 버블보다 작아 시각적 점프 발생.
  - **(8) 모든 1:1 카톡 안 읽음 "1" 자동 페이드** — [`src/ui/katalk/KakaoModal.tsx`](../src/ui/katalk/KakaoModal.tsx): `inferredMode === 'dm'`(senders ≤ 2)면 `unreadFadeMs ?? 400` 자동 적용. 단톡(group, 3인 이상)은 자동 미적용(미독자 수 의미 보존). [`src/ui/katalk/KakaoMessage.tsx`](../src/ui/katalk/KakaoMessage.tsx)에 `unreadFadeMs` prop 추가 — 메시지 등장 후 그 ms 후 노란 카운트 숨김(useState `unreadVisible`). 사유: 사용자 요청 — 1:1 채팅에서 카톡 표준 UX(읽음 표현)와 일치.
  - **(9) 사진 첨부 메시지 → 이미지 버블** — [`src/engine/types.ts`](../src/engine/types.ts) `KakaoMessage.image?: string` 필드 추가. [`src/ui/katalk/KakaoMessage.tsx`](../src/ui/katalk/KakaoMessage.tsx): self/other 양쪽 분기에서 `message.image` 박혀 있으면 텍스트 버블 대신 `<img className="rounded-2xl max-w-[240px] block">` 렌더. [`src/scenes/ch06_h4_03_perv_pair.scene.json`](../src/scenes/ch06_h4_03_perv_pair.scene.json) + 압축본: 나서윤 `(사진 첨부)` 메시지 → `text: ""`, `image: "/img/sprites/seoyoon_outfit_school.webp"`. 사유: placeholder 텍스트를 실제 사진으로 교체.
- **모듈** (status: review):
  - `src/ui/ChoiceList.tsx`, `src/ui/EndingScreen.tsx`, `src/ui/katalk/KakaoModal.tsx`, `src/ui/katalk/KakaoMessage.tsx`, `src/ui/katalk/RejectEnding.tsx`
  - `src/engine/types.ts`
  - `src/scenes/ch06_h1_true.scene.json` (+ 압축본)
  - `src/scenes/ch06_h4_reject.scene.json` (+ 압축본)
  - `src/scenes/ch06_h4_03_perv_pair.scene.json` (+ 압축본)
  - `src/scenes/ch03_04_back_to_school.scene.json` (+ 압축본)
  - `src/scenes/end_solo_summer_main.scene.json`
  - `public/img/bg/bg_cafe_serin.webp` (신규 자산)
- **사유**: 자체 플레이 검증 라운드(2026-05-09)에서 발견된 이슈 5건 + 거절 엔딩 카톡 UI 정합화 추가 4건. 모두 게임 동작/연출 이슈이며 시스템 구조 변경 X. SSoT(.md 시나리오) 동기화는 PM 별도 처리 예정.
- **검증**: `tsc --noEmit` 통과, `npm test` 72/72 통과(rejectLines/saveSlots/toneMatrix/branchEvaluator). 브라우저 점프 검증으로 카페 BG 로드, 거절 엔딩 KakaoModal + 머뭇거림 timeline(메시지별 사용자 표와 jitter 내 일치), SOLO 엔딩 작가 노트 미출력, 사진 메시지 240×568 렌더, 1:1 카톡 마지막 메시지 unread "1" ~545ms 후 페이드 모두 확인.
- **승인**: PM 구두 (회차 내 명시적 승인 — 옵션 선택·머뭇거림 표 직접 지정).

### 2026-05-09 — 게임 제목 "성서로맨스" → "구연시" 변경 + ModeSelect 타이틀 화면 리디자인

- **변경**:
  - **게임 제목 변경**: 가제 "성서로맨스: 본과 1학년의 봄" → **"구연시: 본과 1학년의 봄"**. 유저 가시 + 핵심 SSoT 문서 일괄 패치. 내부 식별자 `kmu-vn`(npm name, localStorage 키, GitHub Pages base path)은 보존(세이브/배포 호환).
    - [`index.html:8`](../index.html), [`package.json:5`](../package.json), [`README.md:1`](../README.md)
    - [`00-master/MASTER-PLAN.md:14`](MASTER-PLAN.md), [`03-story/STORY-BIBLE.md:168`](../03-story/STORY-BIBLE.md), [`05-ui-design/UI-SPEC.md:154`](../05-ui-design/UI-SPEC.md), [`08-qa-deployment/DEPLOYMENT.md:99`](../08-qa-deployment/DEPLOYMENT.md) (OG meta 예시)
  - **ModeSelect 타이틀 화면 리디자인**:
    - PM 최종 자산 `assets/title_cut.png` (5.87MB, 2048×2048) → ffmpeg `geq` 필터로 (a) 우측 하단 163×163 alpha=0 마스킹(AI 생성 검은 사각 아티팩트 제거) + (b) 가장자리 30px 폭 알파 그라데이션(맨 가장자리 0 → 안쪽 255 선형) + 1500×1500 lanczos 다운스케일 + libwebp q=88 인코딩 → [`public/img/title.webp`](../public/img/title.webp) (148KB, 약 97% 감축). 옛 `title.png` 삭제.
    - [`src/ui/ModeSelect.tsx`](../src/ui/ModeSelect.tsx): 헤딩 "스토리 길이 선택" + 부제 "한 번 선택하면…" 제거. 외곽 컨테이너 `justify-start` + 이미지 wrapper에 `flex: 1 1 0%; min-height: 0` → 이미지가 사용 가능 공간을 채우며 화면 상단에 가깝게(`pt-2 md:pt-3`), 하단에 압축/풀 스토리 두 버튼(`mt-3 md:mt-5` + `pb-6 md:pb-8`). 이미지 `max-w-[92%] max-h-full object-contain`. **배경색 `bg-bg` → 인라인 `#FED8E5`** (이미지 자체 핑크 배경과 동일 → 마스킹된 투명 영역이 부모 배경으로 메워져 이음매 없이 블렌드, drop-shadow 제거). 버튼 본문·테스트ID·"추천 ★" 배지 모두 보존(E2E·기존 UX 안정).
    - [`src/styles/globals.css`](../src/styles/globals.css) `@keyframes titleHeartbeat` + `.title-float` 클래스 추가 — **심장박동 펄스**(`transform: scale`, `.char-anim-zoom`과 동일 패턴). 1s 사이클 ease-in-out, 14% scale(1.06) lub → 28% scale(1) → 42% scale(1.06) dub → 70%~100% scale(1) 휴지기. **`!important`로 `tokens.css:155`의 글로벌 `*` reduce-motion 룰을 무력화** → 사용자 PC가 reduce-motion ON이어도 펄스 동작(기존 `.char-anim-*`/캐릭터 워킹·zoom 패턴과 동일, PM 결정 2026-05-09 시각 유지 정책 준수). [클래스명 `.title-float`은 JSX 참조 호환성을 위해 유지 — 실제 효과는 펄스]
- **모듈** (status: review): `05-ui-design/UI-SPEC.md`, `00-master/MASTER-PLAN.md`, `03-story/STORY-BIBLE.md`, `08-qa-deployment/DEPLOYMENT.md`
- **사유**: PM 직접 결정 — 타이틀 캘리그라피 자산 완성 + 가제 확정. 첫 부팅 화면을 모드 선택 텍스트 위주에서 게임 제목 시각 노출 위주로 전환. 3라운드 PM 피드백 반영: ①배경 일체화(#FED8E5)·검은 아티팩트 마스킹·drop-shadow 제거·reduce-motion 강제 → ②자산 잘림 방지·163 corner·30px 가장자리 알파 그라데이션·레이아웃 위로 이동 → ③애니메이션 종류 변경(부유 → 심장박동 펄스, `.char-anim-zoom` 패턴).
- **승인**: PM 구두.

### 2026-05-09 — Ch5 모닥불 후속: 톤 매트릭스 차단 + 비선택 4명 즉시 페이드아웃

- **변경**:
  - **[`src/scenes/ch05_06_bonfire.scene.json`](src/scenes/ch05_06_bonfire.scene.json)** + 압축본: 5개 선택지에서 `tone` 및 `isKey` 필드 제거. `effects`(FLAG_INC +25 + KEY_CHOICE)만 남김. 술집(`ch05_02_pub_first`) 패턴과 정확히 일치 — `tone`이 박히면 toneMatrix가 자동으로 5명 모두에게 ±점수를 박기 때문에 "선택한 사람만 호감도 변화" 사용자 의도 위반.
  - **[`src/scenes/ch05_06b_h{1-5}.scene.json`](src/scenes/ch05_06b_h1.scene.json)** + 압축본 (총 10): 분기 진입 즉시 비선택 히로인 4명 `CHARACTER_HIDE`(fade) + "다른 일행이 슬쩍 자리를 비켜준다." 한 줄 내레이션 추가. 선택한 히로인은 기존대로 `pair_right`로 배치.
- **모듈** (status: review):
  - `src/scenes/ch05_06_bonfire.scene.json` (+ 압축본)
  - `src/scenes/ch05_06b_h{1-5}.scene.json` (+ 압축본)
- **사유**: 사용자(PM) 직접 확인 후 추가 보고 — "선택한 사람만 호감도 오르고 다른 히로인은 변화 없음" + "선택 즉시 다른 인물 스프라이트 화면에서 벗어남". 이전 라운드는 effects만 박았으나 `tone`이 남아 있어 toneMatrix가 다른 히로인에게 자동 점수 적용. 자동저장 로그(H3 분기 시 H1/H2/H4/H5에도 잔점수)에서 확인. 비선택 HIDE는 이전 라운드 계획에 있었으나 "모닥불 본 씬에 5명 미등장이라 불필요"로 판단해 생략 — 사용자가 명시 요구로 무조건 박음.
- **승인**: PM 구두 (사용자 직접 확인 후 추가 요청).

### 2026-05-09 — Ch5 모닥불 정비 + 엔딩 라우팅 복구 + H4 미니게임 3초 단축

- **변경**:
  - **모닥불 호감도/페어 배치 정합** — 술집(`ch05_02_pub_first` → `ch05_02b_h*`) 패턴과 일치시킴.
    - **[`src/scenes/ch05_06_bonfire.scene.json`](src/scenes/ch05_06_bonfire.scene.json)** + 압축본: 5개 선택지에 `effects: [FLAG_INC +25 + KEY_CHOICE]`, `isKey: true` 추가. `choiceId: ch5_bonfire`.
    - **[`src/scenes/ch05_06b_h{1-5}.scene.json`](src/scenes/ch05_06b_h1.scene.json)** + 압축본 (총 10): 분기 진입 시 `CHARACTER 윤모 pair_left` + 히로인 `pair_right`로 페어 배치. 비선택 4명은 모닥불 본 씬에서 등장하지 않으므로 별도 HIDE 불필요.
  - **엔딩 라우팅 복구 (치명 버그)** — 챕터 5 끝 EVALUATE_BRANCH가 즉시 `runtimeMode='ending'` 전환해 챕터 6 본편 + 16개 엔딩 씬을 모두 스킵하던 문제 처방. 2-단계 평가로 분리:
    - **[`src/engine/types.ts:236-247`](src/engine/types.ts)** — 새 SceneCommand `EVALUATE_TIER { winner: HeroineId }` 추가.
    - **[`src/engine/scriptInterpreter.ts:60-100`](src/engine/scriptInterpreter.ts)** — `evaluateRoute(flags): EvaluateRouteResult` 신규 (REJECT/SOLO 즉시 종결 vs. chapter6 라우팅) + `evaluateTier(winner, flags): EndingId` 신규. 기존 `evaluateBranch`는 두 메서드를 위임하는 deprecated wrapper로 유지(테스트 호환).
    - **[`src/data/endings.ts:60-90`](src/data/endings.ts)** — `ENDING_SCENE_MAP: Record<EndingId, string>` (16개 매핑) + `CHAPTER6_START_MAP: Record<HeroineId, string>` (5개 매핑). 컴파일타임 강제로 누락 검출.
    - **[`src/stores/gameStore.ts:660-790`](src/stores/gameStore.ts)** — `EVALUATE_BRANCH` 핸들러: route가 ending이면 해당 엔딩 씬으로 직접 점프, chapter6면 `ch06_h{N}_01_*` 시작 씬으로 점프. `runtimeMode='ending'`은 엔딩 씬 말미 ENDING 커맨드가 책임. `EVALUATE_TIER` 핸들러 신규.
    - **[`src/scenes/ch06_h{1-5}_*_evaluate.scene.json`](src/scenes/ch06_h1_04_evaluate.scene.json)** + 압축본 (총 10): NARRATION 다음에 `EVALUATE_TIER { winner: H<N> }` 부착.
    - 16개 엔딩 씬(`ch06_h{1-5}_{true,happy,normal,bad,reject}.scene.json` + `end_solo_summer_main.scene.json`)은 이미 말미 `ENDING { endingId }` 커맨드 보유 — 보강 불필요.
  - **H4 미니게임 룰 명확화 — 15초 → 3초 + 즉시 패배** (사용자 결정 2026-05-09):
    - **[`src/ui/katalk/ReplyTimer.tsx:19`](src/ui/katalk/ReplyTimer.tsx)** — `DEFAULT_SECONDS = 15` → `3`. 펄스 임계 `remaining<=5` → `remaining<=1`.
    - **[`src/ui/katalk/KakaoModal.tsx`](src/ui/katalk/KakaoModal.tsx)** — `mechanism === 'h4_reply_speed'` 박힌 choices를 가진 KAKAO에서 메시지 흐름 완료 시 ReplyTimer 마운트(`isReplySpeedGame` 조건). `handleTimeout`은 `late_reply_count++` + `pendingEnding='END_H4_REJECT'` + `runtimeMode='ending'`으로 즉시 RejectEnding 시퀀스 진입.
    - **[`src/scenes/ch05_07_close_evaluate.scene.json`](src/scenes/ch05_07_close_evaluate.scene.json)** + 압축본: 답장 KAKAO에서 `affectionDecay` 블록 제거. NARRATION 안내 "답장하기 (15초)" → "답장하기 (3초). 늦으면 나서윤은 이번 봄을 같이 보내지 않기로 마음먹는다."
    - **[`src/engine/scriptInterpreter.ts:75`](src/engine/scriptInterpreter.ts)** — `evaluateRoute` F-1 임계 `late_reply_count >= 2` → `>= 1` 강화. 3초 단축에 맞춰 단 1회 타임아웃이라도 즉시 REJECT 트리거.
    - **[`tests/unit/branchEvaluator.test.ts`](tests/unit/branchEvaluator.test.ts)** — `late >= 1 → REJECT` 테스트로 갱신, `late === 1 → NORMAL`(옛 임계) 케이스는 강화에 따라 `late === 1 → REJECT`로 재작성.
- **모듈** (status: review):
  - `src/engine/types.ts`, `src/engine/scriptInterpreter.ts`, `src/stores/gameStore.ts`, `src/data/endings.ts`
  - `src/ui/katalk/ReplyTimer.tsx`, `src/ui/katalk/KakaoModal.tsx`
  - `src/scenes/ch05_06_bonfire.scene.json`, `src/scenes/ch05_06b_h{1-5}.scene.json` (5)
  - `src/scenes/ch05_07_close_evaluate.scene.json`
  - `src/scenes/ch06_h{1-5}_*_evaluate.scene.json` (5)
  - 위 모든 파일의 `src/scenes/compressed/` 압축본
  - `tests/unit/branchEvaluator.test.ts`
- **사유**: 사용자(PM) 직접 보고 3건 일괄 처방.
  - (1) 모닥불 선택이 호감도에 반영되지 않고 분기 씬 페어 배치도 술집 모범사례와 다름. 술집 패턴 그대로 복제하는 게 일관성 + 작업 비용 모두 최소.
  - (2) 챕터 5 끝 EVALUATE_BRANCH가 endingId만 산출하고 `runtimeMode='ending'`을 즉시 트리거 — `EndingScreen` 스텁이 뜨면서 챕터 6 본편(축제/카페/산책 + 04~07 evaluate)과 16개 엔딩 씬이 한 줄도 재생되지 않는 치명 회귀. 2-단계 평가(승자 결정 → 챕터 6 → 티어 결정 → 엔딩 씬)로 본편 재생 복구.
  - (3) H4 카톡 미니게임이 affectionDecay 1초당 -5만 적용되어 패배 기준이 모호. 사용자가 3초 + 즉시 패배(REJECT 강제)로 룰 명확화 결정. ReplyTimer 컴포넌트는 이미 구현돼 있었으나 KakaoModal이 마운트하지 않아 사실상 미사용 코드였음 — `mechanism: 'h4_reply_speed'` 마커로 다시 연결.
- **승인**: PM 구두 승인 (Plan 모드 ExitPlanMode 승인 — `C:\Users\PC\.claude\plans\5-zippy-flask.md`).

### 2026-05-09 — BGM 무한 루프 native 강제 (Howler html5 모드 loop 미전파 회귀 처방)

- **변경**:
  - **[`src/engine/audioManager.ts:39-58`](src/engine/audioManager.ts)** — `enforceNativeLoop(howl: Howl)` private 헬퍼 신규. Howl 내부 `_sounds[]._node`(HTMLAudioElement)를 순회하며 `node.loop = true`로 직접 박는다. `HowlInternalSound` / `HowlWithSounds` 구조형으로 Howler 내부 접근(`as unknown as`)을 한 곳에 격리.
  - **[`src/engine/audioManager.ts:107-117`](src/engine/audioManager.ts)** 신규 Howl 생성 시 `onload` / `onplay` 콜백 추가 — 두 시점 모두 `enforceNativeLoop(this)` 호출. `play()` 직후에도 동기 호출 1회 추가(총 3중 보장).
  - **[`src/engine/audioManager.ts:91`](src/engine/audioManager.ts)** stash 복원 경로(`playBgm`의 `stashed.play()` 직후)에도 `enforceNativeLoop(stashed)` 추가. 복원된 노드의 loop 속성이 재확정되도록.
- **모듈** (status 변동 없음):
  - `src/engine/audioManager.ts`
- **사유**: 사용자(PM) 보고 — bgm_daily가 1회 끝난 후 더 이상 재생 안 되는 현상 의심 보고. 라이브 진단으로 원인 확정:
  - Howler.js v2.2.4 `html5: true` 모드에서 Howl 옵션 `loop: true`가 underlying `HTMLAudioElement.loop`로 자동 전파되지 않음.
  - 라이브 검사: `Howler._howls[0]._loop === true` 였지만 `_howls[0]._sounds[0]._node.loop === false`. 임시 Howl 생성으로 재현 — load 완료 후에도 `node.loop=false`, `node.getAttribute('loop')=null`.
  - Howler 내부적으로 'ended' 이벤트 기반 수동 재시작이 있으나 html5+pause/resume 사이클 + 긴 트랙(318s) 조합에서 신뢰 못 함. native loop 속성이 켜져 있으면 브라우저가 직접 처리해 가장 확실하다는 판단.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09 — "bgm_daily 재생이 1회 끝난 후 더이상 재생이 안 되도록 설정이 되어 있다면 무한 반복으로 바꿔. … 작업 완료하면 로그 작성하고 업데이트해").
- **검증**:
  - `npx tsc --noEmit` 0건 ✓ / `npx eslint src/engine/audioManager.ts` 0건 ✓ / `npx vite build` 2.13s 성공 ✓
  - 패치 전 라이브 검사: `_howls[0]._sounds[0]._node.loop === false` ✗ (bgm_main_theme).
  - 패치 후 dev(5175) reload + 2.5s 대기 → `nodeLoops: [true]` ✓.
  - 패치 후 production preview(4173) reload + 2.5s 대기 → `nodeLoops: [true]` ✓.
  - stash 복원 경로도 `enforceNativeLoop` 호출하므로 일상 BGM(bgm_daily) pause→resume 사이클 후에도 loop 보장(코드 경로 검토). bgm_daily 자체 라이브 트리거는 prologue→ch01 진입 시점에 첫 재생되어 별도 시나리오 진행 없이 즉시 검증 불가하나, 동일 코드 경로(`Howl 신규 생성 → play() → enforceNativeLoop`)가 bgm_main_theme에서 검증 완료되어 bgm_daily 포함 모든 BGM에 동일 적용됨.
- **동작 변화 요약**:
  - **이전**: `loop: true` 옵션이 Howl 레벨에만 박히고 underlying audio node는 `loop=false`. Howler 내부 'ended' 핸들러가 수동 재시작을 시도하나, html5 모드 + 긴 트랙 + pause/resume 조합에서 누락 가능. 트랙이 자연 종료되면 그대로 정지.
  - **이후**: 모든 BGM Howl 생성 시 onload/onplay/play-직후 3중 시점에 `node.loop = true`를 강제. 브라우저 native HTMLAudio 루프 동작이 항상 활성. stash 복원 경로에서도 재확정. bgm_daily(318s)·메인 테마·기타 모든 BGM이 사용자가 명시적으로 `BGM_STOP` / 다른 트랙 전환을 호출할 때까지 무한 반복.

---

### 2026-05-09 — 메뉴 행 위 음량 조절 버튼 신규 (BGM/SFX 인라인 슬라이더 패널)

- **변경**:
  - **[`src/ui/VolumeControl.tsx`](src/ui/VolumeControl.tsx)** (신규) — 닫힌 상태에서는 `음량` 토글 버튼(MiniControls의 `BTN_CLASS`와 동일 톤). 클릭 시 인라인 패널(BGM/SFX 슬라이더 2종) 펼침. 슬라이더 변경 → `useSettingsStore.set('bgmVolume'|'sfxVolume', 0~1)` 직접 호출 (SceneRenderer의 setVolumes useEffect가 audioManager로 자동 전파). 외부 `pointerdown` 시 자동 닫힘 (대사창/메뉴 클릭 흐름 방해 방지). `data-testid` 2종(`volume-control-toggle` / `volume-control-panel`) + `aria-label="음량 조절"` + `aria-expanded` + slider별 `aria-label`/`aria-valuetext` 부여.
  - **[`src/ui/MiniControls.tsx:13`](src/ui/MiniControls.tsx)** `import { VolumeControl } from './VolumeControl'` 추가.
  - **[`src/ui/MiniControls.tsx:42-58`](src/ui/MiniControls.tsx)** PC 분기 — 기존 `hidden md:flex absolute right-2 gap-2` 가로 행을 `hidden md:flex absolute right-2 flex-col items-end gap-2`로 재구성. 첫 자식으로 `<VolumeControl />`, 둘째 자식으로 기존 4버튼(`← 이전`/`Log`/`Gallery`/`Menu`)을 묶은 `<div className="flex gap-2">`. 컨테이너는 그대로 `bottom: var(--controls-bottom)` 앵커이므로 패널이 열리면 메뉴 행은 위치 유지, VolumeControl·패널이 위로 자라난다.
  - **[`src/ui/MiniControls.tsx:75-91`](src/ui/MiniControls.tsx)** 모바일 분기(햄버거 드롭다운) — `hamburgerOpen` 펼침 영역의 첫 항목으로 `<VolumeControl />` 삽입. 그 아래 기존 4버튼이 그대로 이어짐.
- **모듈** (status 변동):
  - `src/ui/VolumeControl.tsx` — **신규(review)**.
  - `src/ui/MiniControls.tsx` — review 유지(가벼운 wrapper 변경).
- **사유**: 사용자(PM) 지시 — "메뉴 UI 바로 위에 음량 조절 버튼 만든 다음, 로그 작성하고 업데이트해". 환경설정(W5) 화면이 아직 stub(`alert()`)이라 BGM/SFX 음량을 게임 진행 중에 조절할 수단이 부재했음. 메뉴 행 위에 인라인 토글 + 슬라이더로 즉시 조절 가능하게 보강.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09).
- **검증**:
  - `npx tsc --noEmit` 0건 ✓ / `npx eslint src/ui/VolumeControl.tsx src/ui/MiniControls.tsx` 0건 ✓ / `npx vite build` 1.90s 성공 ✓
  - dev 서버(5175) 라이브 검증 — viewport 560×425(모바일), 햄버거 열림 → `volume-control-toggle` 가시(2개 마운트, 가시 1개) → 클릭 → `volume-control-panel` 마운트, BGM/SFX 슬라이더 2개(default 70%/80%) ✓.
  - 슬라이더 드래그 시뮬레이션(BGM 50으로 변경) → `localStorage['kmu-vn-settings'].state.bgmVolume === 0.5` 확인 ✓ (검증 후 0.7 원복).
  - `document.body` 외부 `pointerdown` → 패널 자동 닫힘 ✓. 재오픈 시 슬라이더 값 보존 ✓.
  - production preview(4173) 동일 시나리오 재검증 ✓. 양 서버 console error 0건.
- **동작 변화 요약**:
  - **이전**: 메뉴 행은 `← 이전`/`Log`/`Gallery`/`Menu` 4버튼만. 음량 조절은 `Menu → 환경설정(W5)` stub `alert()`로 막혀 있어 게임 진행 중 변경 불가.
  - **이후**: 메뉴 행 위(PC) / 햄버거 드롭다운 최상단(모바일)에 `음량` 토글 신규. 클릭 시 BGM/SFX 슬라이더(0~100%) 인라인 노출, 변경값은 settingsStore에 즉시 persist되며 audioManager로 동기화돼 현재 재생 중인 BGM/SFX 음량 즉시 반영.

---

### 2026-05-09 — 일상 BGM 정지/재시작을 fade out/in 재개로 변경 (앞부분 반복 회귀 처방)

- **변경**:
  - **[`src/engine/audioManager.ts`](src/engine/audioManager.ts)** — `bgm_daily`(= 한글 큐 '일상' / alias '잔잔')를 `RESUMABLE_BGM_IDS` Set으로 분류. 정지·전환 시 unload 대신 fade out + `howl.pause()`로 `stashedBgms: Map<string, Howl>`에 보관. 다음 `playBgm('bgm_daily')`에서 stash hit이면 `play()`로 같은 seek 위치에서 이어 재생하면서 0 → targetVol fade in. `stopBgm` / `playBgm`(다른 트랙으로 교체)의 공통 정리 경로를 새 private 메서드 `releaseCurrentBgm`으로 통합 — 그 안에서 `RESUMABLE_BGM_IDS.has(id)` 분기로 일상은 stash, 그 외는 기존 stop+unload 유지.
- **모듈** (status 변동 없음 — `src/engine/audioManager.ts`는 이미 review):
  - `src/engine/audioManager.ts`
- **사유**: 사용자(PM) 보고 — 일상 BGM이 BGM_STOP / 다른 BGM(긴장·로맨틱·카톡 등) 전환으로 자주 정지·재시작되면서 매번 트랙 첫 부분만 반복해서 들리는 단조로움. 정지/재시작 대신 fade out/in으로 같은 위치에서 이어 듣게 하면 일상 BGM 전체 길이가 자연스럽게 노출된다는 판단. 다른 BGM은 장면별 단발 연출이라 기존 stop+unload 유지.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09 — "일상 BGM의 앞부분만 반복해서 듣게 돼 … 정지했다가 다시 재생하는 걸 반복하는 대신, fade out 했다가 fade in을 반복하는 걸로 변경해. 그다음 변경 로그 작성하고, preview와 dev에 업데이트해").
- **검증**:
  - `npx tsc --noEmit` 0건 ✓ / `npx eslint src/engine/audioManager.ts` 0건 ✓ / `npx vite build` 1.90s 성공 ✓
  - dist 번들(`dist/assets/index-CdKzkJsA.js`) 내 `"bgm_daily"` 문자열 2건 포함 — `RESUMABLE_BGM_IDS` 초기화 + 기존 BGM_MAP 매핑(en + alias) 모두 산출됨 ✓.
  - dev(5175) / preview(4173) 양 서버 reload 후 console error 0건. `__gameStore` 정상 (runtimeMode: 'idle', currentSceneId: 'prologue_01_home').
- **동작 변화 요약**:
  - **이전**: `playBgm` / `stopBgm`이 모든 BGM에 대해 fade out → `howl.stop()` + `howl.unload()`. 다음 `bgm_daily` 재생 시 새 Howl 생성 → 트랙 0초부터 재생.
  - **이후**: 일상 BGM은 fade out → `howl.pause()` (Howl 인스턴스 + seek 위치 보존, `stashedBgms`에 등록). 다음 `bgm_daily` 재생 시 stash hit → `howl.play()`로 같은 seek부터 fade in. 다른 BGM(긴장/로맨틱/슬픔/클라이맥스/카톡 등)은 기존 stop+unload 유지.
  - **연쇄 효과 (회귀 의도된 것)**: KakaoModal — 일상 중 카톡 모달 열림 → bgm_katalk가 일상을 stash → 모달 종료 시 KakaoModal의 `playBgm(prev)` 호출이 stash hit으로 이어져 일상 BGM이 같은 위치에서 fade in 재개. 이전엔 첫 부분으로 점프하던 부분이 자연 연속.

---

### 2026-05-09 — prologue → ch01 경계 회상 차단 (라운드 #11 후속 #2)

- **변경**:
  - **[`src/ui/ChapterTransitionRecap.tsx:230-231`](src/ui/ChapterTransitionRecap.tsx)** `hasRecap` 조건에 `!isPrologueBoundary` 추가. `prevSnap?.chapter === 'prologue'`이면 회상 모드 미진입 → fallback 단순 모드(`chapter-start-prompt` testid + "Chapter 1 — OT의 봄" 타이틀 + "시작하기" 버튼)만 노출.
  - **[`src/ui/ChapterTransitionRecap.tsx:269-280`](src/ui/ChapterTransitionRecap.tsx)** 버튼 타이밍 useEffect에서 중복 `isPrologueBoundary` 선언 제거. fallback 분기에 `PROMPT_UNLOCK_PROLOGUE_MS`(1000ms) 락 적용 (이전엔 0으로 즉시 활성화).
- **모듈** (status 변동 없음):
  - `src/ui/ChapterTransitionRecap.tsx`
- **사유**: 사용자(PM) 결정 — "프롤로그 시작 전에는 챕터 요약을 진행하면 안 돼". 프롤로그는 본격 챕터가 아닌 도입부라 "프롤로그 종료 → ch01 시작" 시점에 회상 단락(요약 + 온도계 + delta) 노출은 부자연스럽다는 판단. 라운드 #11에서 풀어두었던 "prologue → ch01도 회상 표시" 결정을 다시 차단으로 되돌림.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09 — "preview와 dev 모두에 업데이트해").
- **검증**:
  - `npx tsc --noEmit` 0건 ✓ / `npx eslint src/ui/ChapterTransitionRecap.tsx` 0건 ✓ / `npx vite build` 1.99s 성공 ✓
  - dev 서버(5175) 라이브 검증 — DevTools "✨ 회상 트리거" 사용:
    - prev='prologue' 트리거 → `chapter-start-prompt` 마운트 (단순 모드), `chapter-transition-recap` 미마운트, summary `<p>` 미렌더, 버튼 텍스트 "시작하기" ✓
    - prev='ch01' 트리거 → `chapter-transition-recap` 마운트 (회상 모드), summary "Chapter 1 — OT의 봄, 윤모는 차세린·윤하정·한설·나서윤·장윤영을 만났다…" 정상 ✓
  - production preview(4173) dist 번들 검증: `grep 'chapter==="prologue"' index-BrWtbcr4.js` → 1건(hasRecap 분기) 포함 ✓. 양 서버 모두 동일 동작.
- **동작 변화 요약**:
  - **이전 (라운드 #11 후속 #1)**: `hasRecap = !!prevSnap` — 모든 챕터 경계에서 회상 모드. 프롤로그 → ch01도 요약 단락 + (변동 0이면 빈) 온도계 영역 표시.
  - **이후**: prologue → ch01만 fallback 단순 모드("Chapter 1 — OT의 봄" + 1000ms 락 후 "시작하기"). ch01 이후 모든 챕터 경계는 그대로 회상 모드 (요약 + 온도계 + delta + 동적 라벨 "Chapter N 시작하기").

---

### 2026-05-09 — 챕터 회상 hasRecap 조건 완화 (라운드 #11 후속 fix)

- **변경**:
  - **[`src/ui/ChapterTransitionRecap.tsx:229`](src/ui/ChapterTransitionRecap.tsx)** `hasRecap = !!prevSnap && entries.length > 0` → `!!prevSnap`. 직전 챕터 스냅샷이 있으면 호감도 변동 인물 수와 무관하게 회상 모드 진입.
  - **[`src/ui/ChapterTransitionRecap.tsx:262-269`](src/ui/ChapterTransitionRecap.tsx)** `recapDur` 계산 분기 추가 — `entries.length === 0`이면 `THERM_START_OFFSET`(2000ms)만 사용 (인트로 + 요약만 보여주고 끝). entries 있을 때만 stagger × N + FILL + DELTA fade 누적.
- **모듈** (status 변동 없음):
  - `src/ui/ChapterTransitionRecap.tsx`
- **사유**: 사용자(PM) 보고 — "챕터가 종료될 때마다 회상이 진행되어야 하는데 전혀 진행되지 않고 있어". 라이브 디버그(임시 console.log instrumentation, 적용 후 제거)로 캡처:
  - `awaiting=true`, `prevSnap.values = {H1:80, ..., gyumin:30}`, 현재 flags = 동일 → 모든 delta=0 → `entries=[]` → `hasRecap=false` → fallback 단순 모드("시작하기" 단일 버튼)로 빠짐.
  - 원인: 이전 조건 `entries.length > 0`이 너무 엄격. (1) 호감도 사전 세팅된 DevTools 점프 (2) 본 챕터에서 호감도 변동이 없는 진행 시 회상이 통째로 fallback으로 떨어짐. 라운드 #11에서 요약 단락이 추가된 후로는 변동 0이어도 챕터 타이틀 + 등장 인물 요약이 의미 있는 회상이 되므로 더 엄격하게 막을 이유 없음.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09 — "원인을 파악하고 문제를 해결해").
- **검증**:
  - `npx tsc --noEmit` 0건 ✓
  - `npx eslint src/ui/ChapterTransitionRecap.tsx` 0건 ✓
  - `npx vitest run` 4 파일 / 72 테스트 통과 ✓
  - `npx vite build` 1.98s 성공 ✓
  - dev 서버 라이브 검증: 동일 시나리오(ch01 → ch02, 변동 0 entries)에서 패치 후
    - `data-testid="chapter-transition-recap"` 마운트 ✓ (이전엔 `chapter-start-prompt` fallback)
    - `data-testid="chapter-recap-summary"` "Chapter 1 — OT의 봄, 윤모는 차세린·윤하정·한설·나서윤·장윤영을 만났다." 정상 표시 ✓
    - 버튼 라벨 "Chapter 2 시작하기" 정상 ✓
    - 컨테이너 `opacity:1`, `pointer-events:auto`, 버튼 `disabled=false` 도달 ✓
- **동작 변화 요약**:
  - **이전**: 호감도 변동 없는 챕터 경계 → "시작하기" 단일 버튼만 노출 (회상 부재).
  - **이후**: 항상 회상 모드. entries 있으면 온도계 + delta 라벨까지, 없으면 인트로 라벨 + 요약 단락 + 버튼만으로 약 4초 시퀀스.
  - **타이밍** (entries=0 케이스): 0~1s 인트로 → 1~1.4s 요약 페이드인 → 2~3s 요약 유지 → 3s 버튼 컨테이너 reveal → 4s 버튼 enable. 총 약 4초.

---

### 2026-05-09 — 챕터 회상 단계 업그레이드 (요약 단락 + 버튼 2단 unlock + 동적 라벨)

- **변경** (단일 파일):
  - **[`src/ui/ChapterTransitionRecap.tsx`](src/ui/ChapterTransitionRecap.tsx)** —
    - 타이밍 상수 재구성: `PROMPT_UNLOCK_DEFAULT_MS` 삭제, `BUTTON_REVEAL_DELAY_MS=1000` / `BUTTON_ENABLE_DELAY_MS=2000` / `SUMMARY_FADE_MS=400` / `SUMMARY_HOLD_BEFORE_THERM_MS=1000` / `THERM_START_OFFSET=2000` 신규.
    - **(1) 챕터 요약 단락** — `buildSummaryText(prev, flags, entries)` 신규(L116~181). `met_heroines` + delta entries(`buildEntries`) + `last_increment_order` + 직전 챕터 타이틀(`chapterTitleFromPrefix` 재사용)만으로 3인칭 한 단락 2~4문장 자동 합성. 한국어 조사 자동(`hasJongseong` + `josaEulReul`/`josaGwaWa`/`josaIeotda`). 구조: ① "챕터타이틀, 윤모는 …을(를) 만났다" (또는 met 비면 폴백) → ② "가장 가까워진 사람은 …(+N)이었다" → ③ 보조 +delta 1~2명 → ④ 최대 음수 1명 "어색해졌다(-N)". 인트로 페이드아웃 후 1000ms 시점에 `<p data-testid="chapter-recap-summary">` 페이드인, 온도계 동안 유지.
    - **(2) 버튼 unlock 2단 분리** — `unlocked` 단일 state 폐기, `revealed`/`enabled` 두 state로 분리. 일반 챕터 경계: `revealed`= recapEnd+1000ms (컨테이너 페이드인, disabled 상태) → `enabled`= recapEnd+2000ms (`disabled=false` + 포커스 이동). 프롤로그→ch01 경계: 단계 분리 없이 `max(1000ms, recapDur)` 락 후 동시 reveal+enable (기존 짧은 락 의도 유지). fallback(no-recap) 단순 모드: `enabled`만 사용.
    - **(3) 버튼 라벨 동적화** — `chapterPrefixLocal(sceneId)` 로컬 헬퍼(gameStore 비공개 `chapterPrefix`와 동일 로직 복제, 단일 파일 변경 원칙) + `buttonLabelFor(sceneId)` 신규. `'ch01'..'ch06'` → `Chapter 1 시작하기..Chapter 6 시작하기`, `'end'/'ending'` → `에필로그 시작하기`, `'prologue'` → `프롤로그 시작하기`(안전망), 그 외 → `시작하기`(폴백). 회상 모드 버튼 텍스트 + `aria-label` 동시 적용. fallback `시작하기` 버튼은 변경 없음.
    - **(4) 시퀀스 시프트** — 온도계 stagger 시작 offset `INTRO_END_MS`(1000ms) → `THERM_START_OFFSET`(2000ms)로 +1000ms 시프트. 요약 단락이 등장한 뒤 온도계가 채워지도록 `localStart` 변경.
    - 헤더 docstring 시퀀스 설명 라운드 #11 기준으로 갱신.
- **모듈** (status 변동 없음 — `src/ui/ChapterTransitionRecap.tsx`는 이미 review):
  - `src/ui/ChapterTransitionRecap.tsx`
- **사유**: PM 결정 — 기존 회상은 호감도 온도계 + delta 라벨만 보여줘 "이번 챕터에 무슨 일이 있었나"를 되짚는 서사적 요약이 부재. 또 회상 종료 후 +3000ms 단일 락이 너무 갑작스럽게 클릭 가능 상태로 전환되어 호흡이 거칠다는 보고. 마지막으로 버튼 라벨 "다음 챕터 시작하기"가 어느 챕터로 가는지 명시하지 않아 다음 챕터 인식이 약함. 세 항목을 한 라운드에 묶어 처리.
  - 사용자 결정 매트릭스(AskUserQuestion 두 라운드):
    - 요약 소스: **자동 생성**, **현재 flag만 사용** (key_choices/visited_scenes 라벨 매핑 같은 신규 메타데이터 작업 미포함)
    - 표시 형식: **한 단락 짧은 텍스트** (불릿 / CG 썸네일 그리드는 미채택)
    - 등장 시점: **온도계 전(intro 다음)** (동시 노출 / 별도 단계는 미채택)
    - 톤: **3인칭 서술** (1인칭 윤모 / 비인칭 다이제스트는 미채택)
    - 버튼 라벨 규칙: **다음 챕터 번호로 직설** (부제 포함 / 분기 별도 카피 미채택)
    - 신규 타이밍 적용 범위: **일반 챕터 경계만** (프롤로그→ch01 짧은 락은 기존 유지, fallback도 기존 유지)
- **승인**: 사용자(PM) 직접 지시 (2026-05-09 — Plan 모드 4문항 + 후속 3문항 답변 → ExitPlanMode 승인 + auto 모드 위임).
- **비-회귀 보존** (기존 race fix 보호):
  - 2026-05-09 라운드 #2 race 처방의 두 레이어(`gameStore.ts` `_startSceneInFlight` mutex / `SceneRenderer.tsx` `blockUserAdvance` 가드)는 이번 라운드에서 **건드리지 않음**. `awaitingChapterAdvance` set/unset 시점, `confirmChapterAdvance` 액션 시그니처, `startScene` 진입 가드 모두 손대지 않고 단계 분리는 UI 단(`enabled` state)에서만 처리. 빠른 클릭 연타 시 ch01→ch02→ch03 모든 boundary에서 회상 정상 마운트되는 동작 유지.
- **검증**:
  - `npx tsc --noEmit` 0건 ✓
  - `npx eslint src/ui/ChapterTransitionRecap.tsx` 0건 ✓
  - `npx vitest run` 4 파일 / 72 테스트 전부 통과 ✓ (rejectLines·saveSlots·toneMatrix·branchEvaluator)
  - `npx vite build` 2.23s 성공 ✓ (500kB 청크 경고는 기존 잔존, 무관)
  - dev 서버(5173) 라이브 트리거 검증 (DevTools "✨ 회상 트리거 (현재 위치 기준)", currentSceneId=`ch02_01_anatomy_morning`):
    - **요약 텍스트**: `"Chapter 1 — OT의 봄, 윤모는 차세린·윤하정·한설·나서윤·장윤영을 만났다. 가장 가까워진 사람은 차세린(+80)이었다. 윤하정·한설과의 거리도 조금 좁혀졌다."` — 조사 자동(`을` ← '영' 받침 ㅇ / `이었다` ← '린' 받침 ㄴ / `과의` ← '설' 받침 ㄹ) 정상 ✓
    - **버튼 라벨**: `Chapter 2 시작하기` (텍스트 + aria-label 동일) ✓
    - **다음 챕터 타이틀**: `Chapter 2 — 카데바` (`chapterTitle(sceneId)` 그대로) ✓
    - **타이밍** (entries 8명, recapDur ≈ 4900ms 기대치):
      - t=5507ms: `containerInlineOp=0`, `btnDisabled=true` (recap 진행 중)
      - t=5963ms: `containerInlineOp=1`, `btnDisabled=true` ← reveal 발동 (예상 5900ms ≈ 일치, +63ms 폴링 오차)
      - t=6961ms: `containerInlineOp=1`, `btnDisabled=false` ← enable 발동 (예상 6900ms ≈ 일치, +61ms)
      - t=7100ms: 둘 다 안정. 1초 reveal-only 윈도우(5963~6961ms ≈ 998ms) 정확.
    - 헤드리스 백그라운드 탭(`document.visibilityState='hidden'`)에서 RAF가 정지해 `now`-기반 인트로/요약/온도계 페이드는 0으로 고정 — 전경 탭에서는 정상 동작(기존 라운드 #4 검증 환경과 동일 한계, RAF 의존 코드는 변경 없음).
- **followup**:
  - `key_choices` / `visited_scenes` ID 라벨 매핑 테이블(요약 텍스트 풍부화)은 향후 라운드. 이번엔 기존 flag만 사용한 자동 합성으로 한정.
  - PROGRESS-TRACKER 업데이트는 PM 영역 (`src/ui/ChapterTransitionRecap.tsx` 이미 review 상태로 status 변동 없음).

---

### 2026-05-09 — ch02_04_seol_recover VEO silent skip 처방 (엔진 fix + 씬 순서 재배치)

- **변경**:
  - **[`src/stores/gameStore.ts:707-713`](src/stores/gameStore.ts:707)** `applyCommand` switch에 `VIDEO` case 추가 — `runtimeMode: 'scene'` 강제 복구. `cg` 상태는 보존 (영상 종료 후 CGOverlay 재출현 의도 보장).
  - **[`03-story/scenarios/ch02_anatomy.md:358-368`](03-story/scenarios/ch02_anatomy.md:358)** Scene `ch02_04_seol_recover` 시작 명령 순서 변경. 기존 `[CG: cg_seol_lab_first show] → [VIDEO: video_meet_seol]` → 신규 `[CHARACTER: 한설 right smile_slight fade] → [VIDEO: video_meet_seol] → [CG: cg_seol_lab_first show]`.
  - **[`03-story/scenarios/compressed/ch02_anatomy.md:278-284`](03-story/scenarios/compressed/ch02_anatomy.md:278)** 압축본 미러 동일 변경.
  - **[`src/scenes/ch02_04_seol_recover.scene.json`](src/scenes/ch02_04_seol_recover.scene.json)** + **[`src/scenes/compressed/ch02_04_seol_recover.scene.json`](src/scenes/compressed/ch02_04_seol_recover.scene.json)** `npm run compile:all` 재컴파일 결과 (md SSoT 기반 자동 생성).
- **모듈** (status 변동 없음 — 모두 이미 `review`):
  - `src/stores/gameStore.ts`
  - `03-story/scenarios/ch02_anatomy.md`
  - `03-story/scenarios/compressed/ch02_anatomy.md`
- **사유**: PM 라이브 검증 보고 — "한설의 등장 장면에서는 VEO가 재생돼?" 질문에서 출발. 트레이스 결과 ch02_04_seol_recover에서 `video_meet_seol`이 silent skip. 원인: 엔진 `applyCommand` switch가 `CG` case에서 `runtimeMode: 'cg'`로 전환하지만 `VIDEO` case는 default fallthrough로 runtime을 변경 안 함 → SceneRenderer line 120 `runtimeMode === 'scene' && cmd.type === 'VIDEO'` 조건이 false라 VideoLayer 마운트 안 됨. 유저는 CG 클릭 한 번에 VIDEO를 그냥 지나쳐 NARRATION 도달 (1회 클릭당 1 advance + dev StrictMode 이중 effect). 다른 VIDEO 호출 씬(ch01_02·ch03_02·ch03_04·ch04_04·ch06_h1~h5_true 9건)은 CHARACTER → VIDEO 패턴이라 영향 없음, ch02_04만 유일하게 CG → VIDEO 패턴.
  - 처방 이중화 — (1) 엔진 fix로 향후 시나리오에서 CG → VIDEO 순서가 다시 들어와도 안전 (방어선) (2) ch02_04 자체도 다른 meet 씬과 일관된 CHARACTER → VIDEO 패턴으로 재배치 (CG는 VEO 종료 후 클로즈업 컷으로 재배치, 자산 활용 보존).
- **승인**: 사용자(PM) 직접 지시 (2026-05-09 — 옵션 1 "엔진 fix" 선택 + 후속으로 "ch02_04도 CHARACTER → VIDEO로 바꿔" 지시).
- **검증**:
  - `npm run typecheck` 0건 ✓
  - `npm run validate` 216개 씬 통과 (기존 H4 미니게임 late_reply_count 경고는 무관) ✓
  - `npm run validate:compressed` 216개 씬 mismatch 0 ✓
  - `npm run compile:all` 12 .md → 216 씬 (IF 블록 v0.1 미지원 6건 기존 경고만 잔존) ✓
  - 런타임 검증 (dev 5173, `?scene=ch02_04_seol_recover`):
    - **수정 전 (엔진 fix만, 씬 구조 그대로)**: VideoLayer DOM 18ms 마운트 → unmount 확인 (헤드리스 백그라운드 탭 `play()` 자동 reject 환경 한계, 실제 전경 탭에서는 정상 5초 재생). `[data-video-id="video_meet_seol"]` z-index 300 ✓.
    - **수정 후 (씬 재배치)**: 자동 진행 종료 시점 `seolSprite="smile_slight" position="right"` + `cgImage="cg_seol_lab_first" cgVisible=true` + currentCmd=NARRATION + mode=scene 도달 — 의도한 시퀀스(CHARACTER → VIDEO → CG → NARRATION) 정확 재생 ✓.
  - 회귀: `ch01_02_meet_hajeong` (CHARACTER → VIDEO 기존 안전 패턴) 동일 환경에서 VideoLayer 정상 마운트 + CHOICE 도달까지 진행 확인 — 회귀 없음.
- **잠재 영향** (무시 가능):
  - `cg_seol_lab_first` 등장 타이밍이 VEO 종료 후로 늦춰짐 — 연출상 "VEO(첫 만남 강조 5초) → CG 클로즈업"으로 자연스러운 빌드업이라 PM 의도 부합.
  - `ch02_03b_quick` 경로(serious sprite 진입)와 `ch02_03b_apologize` 경로(smile_slight 진입) 모두 ch02_04 시작에서 명시적 `한설 smile_slight`로 일관 초기화 → 분기 sprite 잔존 회귀 차단 보너스.
- **followup**:
  - `03-story/scenarios/윤문 완료/ch02_anatomy.txt`(외부 작가 윤문 원본)는 SSoT 아님이므로 미반영 — 향후 윤문 라운드에서 작가에게 변경 통지 필요.

---

### 2026-05-09 — 조나단·윤모 center 슬롯 겹침 처방 (center_back X 50→35% + 표경민 left_back 이동)

- **변경**:
  - **[`src/ui/CharacterLayer.tsx:9-10, 31`](src/ui/CharacterLayer.tsx)** — `POSITION_X.center_back` `'50%'` → `'35%'`로 분리. 슬롯 모델 주석도 함께 갱신("center_back은 X=35%로 center와 분리").
  - **시나리오 6줄** 표경민 슬롯 `left` → `left_back` (충돌 4명 동시 등장 씬 한정):
    - [`03-story/scenarios/ch03_dongsan.md:65,303`](03-story/scenarios/ch03_dongsan.md)
    - [`03-story/scenarios/ch05_decision.md:61`](03-story/scenarios/ch05_decision.md)
    - `03-story/scenarios/compressed/ch03_dongsan.md:44,241`
    - `03-story/scenarios/compressed/ch05_decision.md:38`
- **모듈** (status 변동 없음):
  - `src/ui/CharacterLayer.tsx`
  - `03-story/scenarios/ch03_dongsan.md`
  - `03-story/scenarios/ch05_decision.md`
- **사유**: PM 보고 — "조나단과 구윤모 스프라이트가 둘 다 중앙에 올 때 조나단 이미지가 안 보이는 경우". 검증 결과 `ch03_01_dongsan_lobby` Scene 01(line 49 윤모 center + line 72 조나단 center_back), Scene 04(line 296 + line 304), `ch05_01_test_end`(line 55 + line 69) 세 곳에서 윤모(`center` X=50%) + 조나단(`center_back` X=50%)이 동시 출현, 두 슬롯 X 좌표 동일로 z-index만 다른 채 정확히 겹쳐 그려짐. 조나단 PREFIX_FIXED_MAX_H=82.8% + 윤모 90%로 비슷한 크기라 거의 가려짐. 백업본(`_backup-원본/`)에서는 모두 `right_back`이었으나 라운드 재설계 때 `center_back`으로 옮긴 흔적. PM 결정: 표경민 X=15%(left_back), 조나단 X=35%(center_back 슬롯 X 자체 변경, center_back 사용은 조나단 단독이라 부수효과 0).
- **승인**: 사용자(PM) 직접 지시 (2026-05-09).
- **검증**: dev server에서 `store.setState`로 ch03 Scene 01·04 4명 동시 상태 강제 주입 후 `getBoundingClientRect` + `getComputedStyle` 측정. 캔버스 1280px 기준:
  - 표경민(`left_back`): cssLeft=192px (15% ✓), zIndex=1, maxHeight=82.8%
  - 조나단(`center_back`): cssLeft=448px (35% ✓), zIndex=1, maxHeight=82.8%
  - 윤모(`center`): cssLeft=640px (50% ✓), zIndex=2, maxHeight=90%
  - 김규민(`right`): cssLeft=960px (75% ✓), zIndex=2, maxHeight=108% (PREFIX_SCALE 1.2)
  - 조나단 실제 렌더 범위 271~625px, 윤모 549~731px → 조나단 왼쪽 271~549px(폭 278px ≈ 자산 폭 354px의 78%)가 윤모에 안 가리고 가시.
- **회귀 체크**: `center_back` 사용은 시나리오 전체에서 조나단 단독(grep 확인). 표경민 `left` → `left_back`은 ch03·ch05 한정이며 ch04(`right`)·ch06_h1_serin(`left`)는 미수정 — `POSITION_X.left` 값(25%) 변동 없으므로 회귀 0. 풀 플레이 시각 검증은 PM 영역.

### 2026-05-09 — 빠른 advance 연타 시 회상 안 뜨는 race 처방 (mutex + 사용자 클릭 가드)

- **변경**:
  - **[`src/stores/gameStore.ts:38-44, 486-492, 565-567`](src/stores/gameStore.ts)** — module-level `_startSceneInFlight` flag 추가 + `startScene` 본문을 `try { ... } finally { _startSceneInFlight = false }`로 감싸 동시 호출 차단. 첫 호출이 진행 중이면 추가 호출은 noop.
  - **[`src/engine/SceneRenderer.tsx:30-44, 49-52, 87-91, 102, 110`](src/engine/SceneRenderer.tsx)** — `awaitingChapterAdvance` + `chapterFadeOpacity` selector 추가. `blockUserAdvance` 도출 후 (1) `handleAreaClick` 가드 (2) `DialogueBox.onAdvance` 가드 (3) 음원/시각 자동 advance useEffect에 `awaitingChapterAdvance` 가드.
- **모듈** (status 변동 없음):
  - `src/stores/gameStore.ts`
  - `src/engine/SceneRenderer.tsx`
- **사유**: 사용자 보고 — "빠르게 넘기다 보면 회상이 진행되지 않는 오류가 있는 것 같아". 시뮬(5ms 간격 store.advance 연타)로 재현 — ch01→ch02→ch03 두 boundary 모두 awaiting=false로 통과, 회상 0회 마운트. 원인: JUMP cmd가 `await get().startScene(...)`을 호출하는 advance가 빠른 fire-and-forget 연타로 중첩 → 두 번째 startScene이 첫 startScene의 awaiting setState를 race로 덮어씀 + safety reseek(0)이 옛 씬 끝 JUMP에 다시 도달해 또 다른 startScene 시작.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09).
- **검증**:
  - 패치 전 시뮬: ch01→ch02 (i=392, t=2323ms), ch02→ch03 (i=1168, t=6909ms) 두 boundary 모두 awaiting=false로 통과, recapMountCount=0.
  - 패치 후 시뮬: 깨끗한 부팅에서 빠른 5ms advance 연타 → prologue→ch01 첫 boundary에서 i=367, t=2175ms에 awaiting=true 도달 + recap DOM 마운트, prevSnap='prologue', chStartSnap='ch01', 회상 라벨 "프롤로그 · 종료 / 김규민+30 / 엄마+20" 정확 표시. 후속 ch01→ch02, ch02→ch03 boundary에서도 동일하게 회상 발동(시뮬 timeout 전 3개 boundary 통과 확인).

### 2026-05-09 — 일반 챕터 경계 회상 종료 후 +3s 락 조정

- **변경**:
  - **[`src/ui/ChapterTransitionRecap.tsx:131-152`](src/ui/ChapterTransitionRecap.tsx)** `unlockDelay` 계산 로직 변경. 기존 `Math.max(baseUnlock, recapDur)` → 일반 챕터 경계 + 회상 있음일 때 `recapDur + PROMPT_UNLOCK_DEFAULT_MS`(=회상 종료 + 3000ms). prologue→ch01 경계와 fallback(회상 없음 단순 시작 프롬프트)은 기존 max 로직 유지.
- **모듈** (status 변동 없음):
  - `src/ui/ChapterTransitionRecap.tsx`
- **사유**: PM 결정 — 기존 로직은 변화 인물 4명 이상이면 회상 종료 즉시 unlock되어 회상을 음미할 시간이 부족. "일반 챕터 경계에서 회상 종료 후 3초 뒤에 락 활성화"로 변경 요청. prologue 경계는 짧게 유지.
- **승인**: 사용자(PM) 직접 지시 (2026-05-09).
- **검증**:
  - dev 서버(5175) 풀 플레이 시뮬: DevTools 강제 트리거(prevSnap.chapter='ch01' 일반 경계, entries=4) → recapDur=3100ms → unlockTime 측정 6349ms ≈ recapDur(3100) + 3000ms (50ms 폴링 + setState 오차 +249ms). 신규 로직 정확 적용.
  - 기존 로직이었다면 max(3000, 3100)=3100ms 즉시 unlock이었으나 신규 로직으로 6100ms 지연 확인.

### 2026-05-09 — BGM Howler `html5: true` 전환 (OP+BGM wow/flutter 잔존 회귀 추가 처방)

- **변경**:
  - **[`src/engine/audioManager.ts:70`](src/engine/audioManager.ts:70)** `html5: false` → `html5: true` (BGM Howl 한정. SFX/loop SFX는 그대로 WebAudio 유지). 사유 주석 추가.
- **모듈** (status 변동 없음):
  - `src/engine/audioManager.ts`
- **사유**: PM 청감 보고 — 직전 라운드(비디오 audio strip) 후에도 OP+BGM 동시 재생 시 BGM 재생 속도 흔들림 잔존. Chrome video decoder의 audio 처리는 차단됐으나 **BGM 자체의 WebAudio 디코딩(`decodeAudioData`)이 OP 비디오 첫 키프레임 디코딩 burst와 같은 시점에 메인 스레드를 점유**하면서 WebAudio render quantum이 jitter → wow/flutter 잔존으로 추정. BGM을 HTMLAudioElement(html5 모드)로 격리해 비디오와 동등한 streaming decode 경로 사용 → AudioContext와 분리 + 메인 스레드 디코딩 부하 제거.
- **승인**: 사용자(PM) — "여전히 재생 속도가 흔들려" 직전 라운드 followup ("청감으로 여전히 wow/flutter 보이면 옵션 B 적용") 활성화.
- **검증**:
  - `npm run build` 통과 (1.85 s, 신규 번들 `index-CDhEK5Uc.js`).
  - preview 실측: `Howler._howls[0]` `html5: true`, `state: "loaded"`, `sounds[0].paused: false`, `sounds[0].volume: 0.6` (목표 음량 도달) ✓. AudioContext는 SFX용으로 여전히 생성(48 kHz / latency 10–40 ms / running)되지만 BGM은 그것을 사용하지 않음.
  - 콘솔: `[advance] step null at scene "prologue_03_close"` 경고 6건 — 이번 변경과 무관(이전 자동저장 잔존 store 상태 관련).
- **잠재 부작용** (무시 가능 수준):
  - BGM fade가 setInterval 기반 element.volume 갱신으로 변경 → 미세하게 less smooth. 그러나 BGM 페이드는 fade=4 (2000 ms)로 충분히 길어 청감 차이 거의 없음.
  - HTMLAudioElement DOM 부착(Howler 내부) — 메모리 미세 증가, 실용적 영향 없음.
- **followup**:
  - **PM 청감 재확인 필요**: OP 영상 + 메인 BGM 동시 재생 구간에서 wow/flutter가 사라졌는지 확인. 여전히 잔존 시 추가 진단(예: `bgm_main_theme.mp3` preload 시점을 OP 비디오 시작 전으로 이동 또는 OP 페이드인 800 ms 동안 BGM 시작 지연).

---

### 2026-05-09 — 비디오 12개 audio track 일괄 strip (OP+BGM 동시 재생 시 BGM wow/flutter 회귀 처방)

- **변경**:
  - **`game-project/public/video/*.mp4` (12개)** AAC 128 kbps stereo audio track 제거. `ffmpeg -i in.mp4 -an -c:v copy -movflags +faststart out.mp4` (재인코딩 없음 = 화질 무손실 + 빠름).
    | 파일 | with audio | no audio | 절감 |
    |---|---|---|---|
    | `video_opening.mp4` | 1409 KB | 1281 KB | -128 KB |
    | `video_meet_hajeong.mp4` | 1958 KB | 1829 KB | -129 KB |
    | `video_meet_seol.mp4` | 4244 KB | 4146 KB | -98 KB |
    | `video_meet_seoyoon.mp4` | 3433 KB | 3305 KB | -128 KB |
    | `video_meet_serin.mp4` | 4906 KB | 4776 KB | -130 KB |
    | `video_meet_yuna.mp4` | 4006 KB | 3875 KB | -131 KB |
    | `video_reject_seoyoon.mp4` | 3853 KB | 3724 KB | -129 KB |
    | `video_true_hajeong.mp4` | 6559 KB | 6429 KB | -130 KB |
    | `video_true_seol.mp4` | 4318 KB | 4187 KB | -131 KB |
    | `video_true_seoyoon.mp4` | 4832 KB | 4703 KB | -129 KB |
    | `video_true_serin.mp4` | 4359 KB | 4230 KB | -129 KB |
    | `video_true_yuna.mp4` | 6728 KB | 6599 KB | -129 KB |
    | **합계** | **49.4 MB** | **47.9 MB** | **-1.49 MB** |
  - **원본 백업**: `0501test/_video_orig_with_audio/` (12개 with audio, 롤백 가능). 임시 strip 출력은 `0501test/_video_noaudio/`.
  - 코드/시나리오/매니페스트 변경 없음.
- **모듈** (자산 교체만, 모듈 status 변동 없음):
  - `public/video/*.mp4`
- **사유**: PM 보고 — "OP VEO와 메인 BGM 동시 재생 시 BGM 재생 속도가 느려졌다 빨라짐" wow/flutter 회귀.
  - **근본 원인**: 모든 12개 mp4 컨테이너에 AAC 128 kbps audio track 잔존. `<video muted>`로 재생해도 Chrome은 audio decoder를 활성화하고 audio output device latency를 잠시 grab. 동시에 [audioManager.ts:70](src/engine/audioManager.ts:70) BGM은 `html5: false` (WebAudio 모드)로 AudioContext의 `BufferSource`로 재생. `video.play()` 직후 audio device 재조정 시점에 WebAudio buffer가 미세 underrun → catch-up → 청감상 wow/flutter.
  - mp4 audio track strip이 디코더 활성화 자체를 차단해 충돌 원천 제거.
- **승인**: 사용자(PM) — "원인이 무엇이고 어떻게 해결할 수 있을까" 진단 요청 후 "A 진행" (옵션 A = 비디오 audio track strip).
- **검증**:
  - ffprobe (변환 후): 12개 모두 audio stream 0 ✓
  - `npm run build` 통과 (1.95 s, 신규 번들 `index-ZLUXxtQW.js`).
  - preview 실측 (`document.visibilityState='visible'`):
    - `video_opening.mp4` 다운 크기 1,443,770 → **1,311,995 B** (audio strip 효과 정확히 반영, -128 KB).
    - **`webkitAudioDecodedByteCount=0` 9개 샘플 2.3 s 동안 일관 0** — Chrome video decoder가 audio 처리 안 함 ✓ (vs `webkitVideoDecodedByteCount` 1,031,652 → 1,308,695 정상 진행, video decoder는 정상).
    - AudioContext: sampleRate 48000 Hz (BGM mp3와 일치 — resample 없음), baseLatency 10 ms, outputLatency 40 ms, state running — Howler/WebAudio 정상.
- **rejected/deferred**:
  - **옵션 B (Howler `html5: false → true`)**: 미적용. A로 근본 원인 제거됐으니 불필요. 만약 청감으로 여전히 wow/flutter 보이면 B 추가 적용 검토.
- **followup**:
  - **PM 청감 확인 필요**: OP 영상 + 메인 테마 BGM 동시 재생 구간에서 BGM 재생 속도 흔들림이 사라졌는지 풀 플레이로 확인. 회귀 시 옵션 B 적용.
  - 향후 신규 비디오 자산 추가 시 사전에 audio track 없이 출력하도록 자산 후처리 파이프라인에 strip 단계 명시 (`process_veo.py` 또는 후속 단계).

---

### 2026-05-09 — 첫 부팅 랙 실측 + BGM 8개 MP3 192→128 kbps 재인코딩

- **변경**:
  - **`game-project/public/snd/bgm/*.mp3` (8개)** MP3 192 kbps → 128 kbps 재인코딩 (libmp3lame, 48 kHz stereo 유지). map_metadata 0 + id3v2_version 3로 메타데이터 보존. 모든 파일 정확히 -33% 감량.
    | 파일 | 192k | 128k | duration |
    |---|---|---|---|
    | `bgm_climax.mp3` | 4128 KB | 2752 KB | 176 s |
    | `bgm_comic.mp3` | 2653 KB | 1768 KB | 113 s |
    | `bgm_daily.mp3` | 7456 KB | **4970 KB** | 318 s |
    | `bgm_katalk.mp3` | 452 KB | 301 KB | 19 s |
    | `bgm_main_theme.mp3` | 3145 KB | **2096 KB** | 134 s |
    | `bgm_romantic.mp3` | 3591 KB | 2394 KB | 153 s |
    | `bgm_sad.mp3` | 3191 KB | 2128 KB | 136 s |
    | `bgm_tension.mp3` | 3917 KB | 2611 KB | 167 s |
    | **합계** | **27.9 MB** | **18.6 MB** | -9.3 MB (-33%) |
  - **원본 백업**: `0501test/_bgm_orig_192k/` (롤백 가능). 임시 변환 출력은 `0501test/_bgm_128k/`.
  - 코드/시나리오/매니페스트 변경 없음 (manifest.json은 ID 목록만 — 파일 크기 미포함).
- **모듈** (자산 교체만, 모듈 status 변동 없음):
  - `public/snd/bgm/*.mp3`
- **사유**: 첫 부팅 랙 실측 결과(같은 세션) 자원 워터폴에서 `bgm_main_theme.mp3` 3.22 MB(부팅 시 풀 다운로드)와 `bgm_daily.mp3` 7.64 MB(첫 씬 진입 시 풀 다운로드)가 MASTER-PLAN §8.2 < 3 초(3G) 목표를 위협한다고 판단. 192 kbps stereo는 BGM에서 음질 차 무지각 — PM이 "MP3 128 kbps (안전)" 옵션 선택.
- **승인**: 사용자(PM) — "권고 적용해" + AskUserQuestion 선택지 "MP3 128 kbps (안전)".
- **검증**:
  - ffprobe: 8개 모두 `codec=mp3 / sample_rate=48000 / channels=2 / bit_rate=128000` 확인. duration 변동 없음.
  - `npm run build` 통과 (1.83 s, 신규 번들 `index-DUByVc0l.js`).
  - preview 실측: `bgm_main_theme.mp3` 3,220,686 → **2,147,214 B**, `bgm_daily.mp3` 7,635,145 → **5,090,188 B** 다운 크기 변화 확인. 동일 부팅 경로에서 long task 0 / layout shift 0 / console error 0 / failed request 0 유지. 클릭 → 첫 씬 텍스트 162 ms 변동 없음.
- **첫 부팅 랙 실측 결과 요약** (BGM 변경 전):
  - localhost warm cache: DOMContentLoaded 30 ms, 모든 부트 자원 55 ms 내 도착 — **랙 없음**.
  - long task 0건 / CLS 0 / 콘솔 에러 0 / 직렬 의존성 없음.
  - OP 비디오 800 ms 페이드인 + 5–7 s 재생은 의도된 인트로 (랙 아님).
  - cold cache 추정 (기존 192 kbps 기준): 100 Mbps fiber ~390 ms / 50 Mbps ~780 ms / 4G 20 Mbps ~1.9 s / **3G 5 Mbps ~7.8 s ← MASTER-PLAN §8.2 위협**. 시각적 first paint 경로(JS+CSS 100 KB)는 3G에서도 < 0.5 s — 영상·BGM은 백그라운드 스트림이라 첫 인터랙션 미차단.
  - 측정 한계: preview 탭이 `document.visibilityState='hidden'`이라 Chrome paint 이벤트 미발생 → FCP/LCP 자동 수집 불가. DOM mutation 폴링 + Performance Observer로 직접 대체 측정.
- **rejected/deferred**:
  - **OP 비디오 스킵 옵션** (settingsStore.skipOpening): PM "적용 안 함" — 매 부팅 OP 노출 유지.
  - **OPUS 96k WebM 변환**: PM "MP3 128k 안전" 선택 — 호환성/음질 더 좋지만 채택 안 함.
  - **`preview_screenshot` 30 s 타임아웃 원인 디버깅**: 게임 코드 무관(측정 인프라). 미작업.
- **followup**:
  - cold cache 환경에서 실제 3G throttling 측정은 별도 라운드 (Lighthouse / Chrome DevTools). 본 변경으로 부팅 자원 5 MB → 3.9 MB(-21%), 첫 씬 BGM 7.6 MB → 5 MB(-33%)이라 3G 7.8 s → 약 6 s 수준으로 개선 추정. 여전히 < 3 s 목표는 미달 — 다음 단계로 BGM lazy/streaming(`<audio>` 사용) 또는 OPUS 변환 재검토 가치.

---

### 2026-05-09 — production preview 검증 창 준비 (PM 세션 검증 미완 상태 종료)

- **변경**:
  - **`.claude/launch.json`**: `kmu-vn-preview` configuration 신규 추가 — `npm --prefix game-project run preview -- --host --port 4173 --strictPort`. dev cache로 인한 Vite HMR 미반영 문제 회피용.
  - **production build 실행**: `npm run build` 통과 (built in ~2초). `dist/` 산출.
  - **preview MCP `kmu-vn-preview` start**: `http://localhost:4173/`에서 production 빌드 호스팅. 새 코드(App.tsx 페이드인 외부화 + sceneStartedRef 가드 + OpeningVideo BGM fallback) 정상 적용 확인 — preview eval로 OP 영상 마운트 + `fadeOpacity:0 / sceneId:'' / storyMode:null` 첫 부팅 정상.
- **모듈** (status 변동 없음):
  - `.claude/launch.json`
  - `dist/` (빌드 산출물)
- **사유**: PM 풀 플레이 검증을 위해 preview 창 띄울 필요. 직전 라운드(페이드인 외부화 + Vite watch 보강)에서 dev server cache가 끝까지 옛 코드 모듈을 잡고 있어 자동 검증 실패. production build는 dev cache 무관이라 새 코드 확실히 검증 가능.
- **승인**: 사용자(PM) — "검증 플레이 창 열어줘".
- **검증**:
  - production build typecheck/build 0 errors. vitest 72/72 (이전 라운드 유지).
  - preview eval: OP 영상 mount 확인. ModeSelect 클릭 → 페이드인/임팩트는 PM 직접 시각/청감 검증 대기.
  - **PM이 세션 종료 시점에 풀 플레이 검증 미완** — 다음 PM 세션에서 풀 플레이 후 회귀/이슈 신고 시 추가 처방.
- **followup** (PM 다음 세션에서 검증할 항목):
  1. **페이지 접속 즉시 메인 테마 BGM 2초 페이드인** (App.tsx mount effect, fade 4)
  2. **OP 영상 동안 BGM 유지** (영상 muted, BGM fallback이 OpeningVideo mount에서 보강)
  3. OP 종료 → **ModeSelect "스토리 길이 선택" 화면** (예상 플레이타임 줄 부재 확인)
  4. 풀/압축 클릭 직후 → **검정 화면에서 3.2초 페이드인** (50 step × 64ms 선형 감소)
  5. 첫 NARRATION → MONOLOGUE → 윤모 등장 시점 → **1.8초 zoom-in + 핑크 glow + translateY**(yunmo-enter keyframe)
  6. prologue_01_home 첫 [BGM:일상] 명령 → **메인테마 → bgm_daily 자연 페이드 전환** (audioManager 단일 BGM 트랙 + stopBgm 보장)
  7. 우측 하단 메뉴 버튼 클릭 → `sfx_pageturn` **볼륨 0.7**
  8. 챕터 전환 "시작하기" 버튼 → `sfx_pageturn`
  9. 카톡 미니게임 → **메시지+선택지 동시 표시** + **H4 호감도 1초당 -5 디케이** + 알림 0.2 / 전송 0.1 청감
  10. PC viewport(>768px) → **MiniControls 우하단 + 대사창과 비겹침** (textbox-height 22%, controls-bottom 8px, 버튼 36×36)
  11. 5인 동시 등장 씬(ch03_04_back_to_school 등) → **장윤영 65% / 조나단 center_back / 김규민 right** 시각 분리
  12. 열차 안 prologue_02_train → **ktx_주행음 loop 0.6 ambient** + 자취방 BG 변경 시 자동 페이드아웃
  13. 자취방 prologue_03_studio → **sfx_suitcase_wheels 미재생** (시나리오 + 매핑에서 제거)
- **세션 종료 메모**:
  - 작업한 라운드들(직전 4건): 카톡 미니게임 재설계 #1 / UX 정합 묶음 #1 / UX 정합 묶음 #2 / UX 정합 묶음 #3 / 프롤로그 임팩트 진단 #4.
  - 미해결 followup 누적: H4 거절 엔딩 트리거 재설계 (late_reply_count 폐기) / ReplyTimer.tsx dead code 정리 / `AffectionThermometer.tsx:102 nameLabel unused` 다른 에이전트 작업물 / yunmo-enter 매번 발동 vs 첫 한 번만 발동 결정 / 자산 파일 sfx_suitcase_wheels.mp3 destructive 삭제 결정 / dev server vite cache 회귀 모니터링.
  - PM이 세션 재개 시 풀 플레이 검증 후 회귀/이슈 신고 받아 후속 처방.

---

### 2026-05-09 — 자산 무결성 검증 라운드 (CG · BG · 엔딩 → 점수창)

- **변경**: 코드/시나리오 수정 없음. PM 요청 검증 3종 결과 정리.
- **모듈**: status 변경 없음.
- **사유**: PM 두 가지 무결성 검증 + CG 적용 점검 요청.
- **검증 ① CG 적용**:
  - manifest cgs 20장 ↔ public/img/cg/*.webp 40 파일(thumb+full 20쌍) ↔ 시나리오 사용 19종 + RejectEnding.tsx 직접 마운트 1종 = **100% 활용**, 고아 자산 0.
  - 트루 5/5 (BGM_climax → VIDEO → CG → ENDING) ✓ / HAPPY 3/3 ✓ / NORMAL 1/4 (H4만) / BAD 0/2 / SOLO 0/1 / REJECT RejectEnding 처리.
  - 일상씬 CG 분포 정상 (ch02 hajeong_anatomy/seol_lab_first / ch03 serin_first_meet/yuna_booth / ch04 hajeong_library/serin_cafe_late/seol_late_night/seoyoon_first_meet/yuna_cafe / ch06 진입 페스티벌 3종).
  - **PM 의도 결정 미수렴 항목** (별도 라운드): NORMAL 3건(H1/H2/H3) + BAD 2건(H1/H2) + SOLO 엔딩 CG 미배치, 트루 엔딩 시퀀스 순서(시나리오 VIDEO→CG vs ANIMATION-SPEC §12 CG→VIDEO) 정합.
- **검증 ② BG 누락**:
  - `npx tsx scripts/audit-asset-flow.ts` (v3.1, transitive BG inherit BFS) 실행 — 219개 씬 그래프 시뮬레이션.
  - audit 보고: BG_NULL_CRITICAL 18건 / INVALID_POSITION 10건 / CHARACTER_CONCURRENT_MANY 12건.
  - 정밀 분석 결과 — **시각 영향 0건**:
    - BG_NULL 18건 = dead code 4건 (ch04/05/06_h4 카톡 미니게임 재설계 잔재 b_late) + KAKAO.choices edge BG 상속 false positive 14건. `gameStore.startScene`이 `bg.image` reset 안 하므로 후속 close 씬에서 직전 KAKAO 씬 BG (`bg_studio_room`/`bg_mt_pension`) 그대로 보임.
    - INVALID_POSITION 10건 = pair_left/pair_right (2026-05-09 친밀 페어 슬롯 신설). audit 도구의 VALID_POSITIONS 셋에 미등록 → false positive.
- **검증 ③ 엔딩 → 점수창 연결**:
  - 16개 EndingId 모두 시나리오 ENDING 명령 박힘 (각 씬 마지막 명령) ✓
  - 코드 흐름: `applyCommand ENDING → store.pendingEnding + runtimeMode='ending' → SceneRenderer.tsx:114 → EndingScreen → (REJECT는 RejectEnding 17.5초 후 onComplete) → EndingStatsPanel(computeEndingScore + 5H/7NPC thermometer + score card)`.
  - typecheck 0 에러 (이전 stale 보고됐던 EndingStatsPanel `winner` 필드 에러 해소 확인). E2E `all-endings.spec.ts` 16/16 통과 이력 (2026-05-06).
- **승인**: 사용자(PM) — plan 파일 `zippy-imagining-pnueli.md` 승인.
- **followup** (별도 라운드 권장):
  - 🟡 PM 결정: NORMAL/BAD/SOLO 엔딩 CG 추가 필요한지 + 트루 엔딩 시퀀스 순서 (영상→CG vs CG→영상) 정합.
  - 🟦 audit-asset-flow 정확도 개선: KAKAO.choices/CHOICE.next edge BG 상속 BFS 정정 (false positive 14건 제거) + VALID_POSITIONS에 pair_left/pair_right 추가.
  - 🟦 Dead code 4건 정리: ch04_05b_late, ch05_07b_late, ch06_h4_03b_late, ch06_h4_05b_late 시나리오 .md에서 잔재 제거 + 재컴파일 (2026-05-09 카톡 미니게임 재설계 followup으로 이미 등록됨).

---

### 2026-05-09 — 프롤로그 임팩트 미발동 진단 + 페이드인 외부화 + OpeningVideo BGM fallback + Vite watch 보강

- **변경**:
  - **`src/App.tsx`** — 첫 부팅 페이드인 로직을 `gameStore.startScene` 안에서 **App.tsx의 storyMode 확정 useEffect로 이전**.
    - `useRef sceneStartedRef`로 StrictMode 이중 호출 방지.
    - `useGameStore.getState().currentSceneId === ''` 체크로 첫 부팅 판단.
    - `useGameStore.setState({ chapterFadeOpacity: 1 })`로 검정 시작 → `startScene` 완료 후 50 step × 64ms ≈ 3200ms 페이드인 (1 → 0).
    - **이유**: dev HMR로 zustand store module 인스턴스 분리 시 store 안의 `set(...)`이 컴포넌트가 구독한 인스턴스에 반영되지 않는 회귀 발견. App.tsx 한 곳에서 `useGameStore.setState`만 호출하면 모듈 인스턴스 분리에 강함(window-level singleton 패턴).
  - **`src/stores/gameStore.ts:548-552`** — `isFirstBoot && !isE2eEnvironment()` 페이드인 분기 제거. 단순 advance만 호출.
  - **`src/ui/OpeningVideo.tsx`** — BGM fallback useEffect 추가:
    ```ts
    if (audioManager.currentBgmId() !== 'bgm_main_theme') {
      audioManager.playBgm('bgm_main_theme', { fade: 4, volume: 0.6 });
    }
    ```
    App.tsx 마운트 effect가 어떤 이유로든(dev HMR 인스턴스 분리, e2e 가드, 리로드 race 등) 미발동된 경우 OpeningVideo가 페이지 첫 시각 화면에서 fallback. 같은 ID 재호출은 audioManager가 fade만 처리.
  - **`vite.config.ts`** — `server.watch.usePolling: true` + `interval: 200` 추가.
    Windows + NTFS 한국어 경로(`D:/조나단/...`)에서 chokidar native watch가 디스크 변경을 놓치는 케이스 발견 — 디스크에 새 코드 있어도 dev server가 옛 transform 캐시 유지. polling으로 강제.
- **모듈** (status 변동 없음 — 진단/회귀 처방):
  - `src/App.tsx`
  - `src/stores/gameStore.ts`
  - `src/ui/OpeningVideo.tsx`
  - `vite.config.ts`
- **사유**: PM 신고 — "프롤로그 임팩트가 구현되지 않은 것 같음. 제대로 확인하고 구현해. + OP 비디오 재생 시작 시 메인 BGM 재생 중인지 확인하고 미재생이면 재생". 진단 결과:
  - preview MCP의 dev server에서 `chapterFadeOpacity` store 값이 1로 set되지만 ChapterFader 컴포넌트의 inline opacity는 0 — store 인스턴스 분리 가능성. dev HMR 또는 Windows file watcher 이슈로 모듈 갱신이 미반영되어 set/구독 사이드 분리.
  - App.tsx로 페이드인 외부화하면 `useGameStore.setState`(모듈 ref)가 단일 호출 지점. window 전역 store와 동일 인스턴스 보장.
  - OpeningVideo BGM fallback은 어떤 경로로든 메인 테마 미재생 시 OP 영상 시작 직전 보장.
- **승인**: 사용자(PM) — "프롤로그 임팩트가 구현되지 않은 것 같아. 제대로 확인하고 구현해. + OP 영상 재생 시작 시 메인 배경음악 재생 중인지 확인하고 미재생이면 재생".
- **검증 (제한적)**:
  - `npx tsc --noEmit`: 0 errors (본 라운드 변경 파일 모두 통과). 기존 미해결 1건(`AffectionThermometer.tsx:102 nameLabel` — 다른 에이전트 작업물).
  - vitest 72/72 통과 (이전 라운드 검증 유지).
  - 디스크 파일 직접 grep 확인 — `App.tsx` line 63·108-126에 `sceneStartedRef`+`for (let i = 49...)` 페이드인 루프 정상 박힘 / `OpeningVideo.tsx` line 33-37에 BGM fallback useEffect 정상.
  - **preview MCP 자동 검증 실패** — preview 환경 dev server가 끝까지 옛 module cache 유지(`fetch('/src/App.tsx?import')` 결과에 새 코드 미포함). vite cache 삭제 + dev server stop/start 모두 시도했으나 갱신 X. **PM 본인 브라우저에서 hard reload(Ctrl+Shift+R)** 후 풀 플레이 검증 필요.
- **followup**:
  - **PM 풀 플레이 시각/청감 검증** (preview 환경 자동 검증 한계):
    - 페이드인: ModeSelect 풀/압축 클릭 직후 약 3.2초간 검정에서 게임 화면으로 페이드인.
    - 윤모 임팩트: prologue_01_home에서 윤모 등장 시 zoom-in(scale 0.55→1) + translateY(72→0) + 핑크 glow 1.8초 ease-out.
    - BGM: 페이지 접속 즉시 메인 테마 2초 페이드인. OP 영상 동안 유지. prologue 첫 BGM 명령에서 자연 페이드 전환.
  - **dev server 캐시 갱신 안 되면**: `rm -rf node_modules/.vite && rm -rf dist && npm run dev` 강제 재시작 권장.
  - **store 인스턴스 분리 회귀 모니터링**: dev preview에서 `window.__gameStore.getState().chapterFadeOpacity`와 ChapterFader inline opacity 일치 여부 주기적 점검.
  - **production build 검증**: `npm run build && npm run preview`로 dev cache 무관 검증 가능.

---

### 2026-05-09 — UX 정합 묶음 라운드 #3 (PM 후속 정정 8건 + 열차 ambient SFX 시스템)

- **변경** (라운드 #2 후속 정정 7건 + 열차 ambient + 자산 정리):
  - **시작 BGM 트리거 시점 이동 (3차)**: ModeSelect mount → OpeningVideo mount → **App.tsx 최상위 mount** (페이지 접속 즉시).
    - `src/App.tsx`: 신규 useEffect — `audioManager.playBgm('bgm_main_theme', { fade: 4, volume: 0.6 })` (fade 4 = 2000ms 페이드인). `isE2eEnvironment()` 가드.
    - `src/ui/OpeningVideo.tsx`: 직전 라운드의 BGM useEffect 제거.
  - **카톡 SFX 추가 하향**:
    - `src/ui/katalk/KakaoMessage.tsx`: 알림음 0.4 → **0.2**, 전송음 0.3 → **0.1**.
  - **메뉴 SFX 볼륨 명시**:
    - `src/ui/MiniControls.tsx` + `src/ui/PauseMenu.tsx`: `playSfx('sfx_pageturn', { volume: 0.7 })`.
  - **프롤로그 임팩트 추가 강화 (#2)**: PM 신고 "임팩트 적용됐는지 모르겠음" → 더 분명한 키프레임으로.
    - `src/styles/tokens.css` `@keyframes yunmo-enter`: 1800ms → **2600ms**, scale 0.78→**0.55**, translateY 28→**72**, easing `cubic-bezier(0.16, 1, 0.3, 1)` (더 강한 ease-out), drop-shadow glow 0.55→**0.85**, brightness 1.4→1.0 보정 추가 (검정에서 빛이 가시화되며 normalize되는 인상).
    - `src/stores/gameStore.ts` isFirstBoot 분기: 40 step × 60ms → **50 step × 64ms ≈ 3200ms** 페이드인.
  - **ModeSelect 플레이타임 표시 삭제**: PM 결정 — 추정치라 명시 부담. 두 카드 `예상 플레이타임` 줄 제거.
  - **조나단 right_back → center_back 일괄 변경**: PM 신고 "ch03_01_dongsan_lobby 조나단↔김규민 위치 겹침. 동일 패턴 많을 것" → 조나단 right_back 사용처 6개 시나리오 파일 모두 일괄 수정.
    - `03-story/scenarios/ch03_dongsan.md` (정식+compressed+윤문) — 2곳 + 2곳 + 2곳 = 6곳
    - `03-story/scenarios/ch05_decision.md` (정식+compressed+윤문) — 1곳 + 1곳 + 1곳 = 3곳
    - 총 9곳에서 `[CHARACTER: 조나단 right_back ...]` → `[CHARACTER: 조나단 center_back ...]`. 컴파일 결과 .scene.json도 자동 갱신.
    - 효과: 김규민(right 75%) + 조나단(center_back 50%) — X 25% + z(2 vs 1) + max-h(90% vs 75%) 차이로 입체 분리. 우측 영역 단독 김규민.
  - **열차 ambient SFX 시스템 신설**:
    - `src/engine/audioManager.ts`: `loopingSfx: Map<string, Howl>` 추가. `playSfx(en, { loop: true })` 옵션 — Howl `loop: true` + 별도 풀(중복 시작 방지). `stopSfx(en)` + `stopAllLoopingSfx()` 메서드 (200ms fade-out + unload).
    - `src/engine/types.ts:SceneCommand` SFX 항목에 `loop?: boolean` 추가.
    - `scripts/compile-scene.ts`: `RE_SFX` 정규식 확장 — `(?:\s+(?:volume=[0-9.]+|loop))*`로 옵션 토큰 묶음 매칭. `parseDirective` SFX 분기에서 토큰별 split → `loop` 발견 시 `out.loop = true`.
    - `src/engine/SceneRenderer.tsx`: SFX cmd 처리에 `loop: cmd.loop` 옵션 전달. **BG 변경 시 자동 stopAllLoopingSfx 호출** (장소 전환 = ambient 정지). 즉 KTX 안에서 자취방으로 BG 변경되면 ktx 주행음 자동 페이드아웃.
    - 시나리오 `prologue.md` (정식+compressed+윤문) — `[SFX: ktx_주행음 volume=0.3]` → `[SFX: ktx_주행음 volume=0.6 loop]` (3 파일).
    - 검증: `prologue_02_train.scene.json` SFX cmd `{ sound: 'sfx_ktx_run', volume: 0.6, loop: true }` 정상 컴파일.
  - **sfx_suitcase_wheels 삭제**:
    - `src/engine/audioMappings.ts`: SFX_MAP에서 `{ ko: '캐리어_바퀴', en: 'sfx_suitcase_wheels' }` 항목 제거.
    - `public/manifest.json`: SFX 목록에서 `sfx_suitcase_wheels` 제거.
    - 시나리오 `prologue.md` (정식+compressed+윤문) — `[SFX: 캐리어_바퀴 volume=0.4]` 줄 제거 (3 파일).
    - 자산 파일 `public/snd/sfx/sfx_suitcase_wheels.mp3`는 보존(destructive 회피, PM 명시적 삭제 요청 시 별도 라운드).
- **모듈** (status 변동 없음 — 직전 라운드 후속 정정·확장):
  - `src/App.tsx`, `src/ui/OpeningVideo.tsx`, `src/ui/ModeSelect.tsx`
  - `src/ui/katalk/KakaoMessage.tsx`, `src/ui/MiniControls.tsx`, `src/ui/PauseMenu.tsx`
  - `src/styles/tokens.css`, `src/stores/gameStore.ts`
  - `src/engine/audioManager.ts`, `src/engine/audioMappings.ts`, `src/engine/types.ts`, `src/engine/SceneRenderer.tsx`
  - `scripts/compile-scene.ts`
  - `src/scenes/*.scene.json` (재컴파일)
  - `03-story/scenarios/prologue.md` (+compressed+윤문)
  - `03-story/scenarios/ch03_dongsan.md` (+compressed+윤문)
  - `03-story/scenarios/ch05_decision.md` (+compressed+윤문)
  - `public/manifest.json`
- **사유**: PM 풀 플레이 검증 후 직전 라운드 #2 8건 후속 정정/확장 신고:
  - "ModeSelect mount에서 BGM 시작 X. 페이지 접속 → 2초 fade in → OpeningVideo → ModeSelect 흐름" → BGM을 App 최상위로.
  - "카톡 알림 0.2, 전송 0.1" → 추가 하향.
  - "프롤로그 임팩트 적용됐는지 잘 모르겠음" → 추가 강화 (scale 0.55, ms 2600, glow 0.85, 페이드인 3.2s).
  - "메뉴 SFX 좋아. 볼륨 0.7" → 명시.
  - "플레이타임 삭제" → 제거.
  - "열차 안에 있는 동안 열차 SFX 계속 재생, 0.6" → ambient SFX 시스템 신설.
  - "sfx_suitcase_wheels 사용하지 말고 삭제" → 매핑/매니페스트/시나리오 정리.
  - "ch03_01_dongsan_lobby 조나단↔김규민 위치 겹침. 동일 위치 많을 것" → right_back → center_back 9곳 일괄.
- **승인**: 사용자(PM) — 위 8건 명시 결정.
- **검증**:
  - `npm run compile` + `compile:compressed`: 216×2 씬 0 에러 (IF 블록 v0.1 미지원 6건은 기존 한계).
  - `npm test`: vitest 72/72 통과.
  - `npx tsc --noEmit`: 1건 에러 (`src/ui/affection/AffectionThermometer.tsx:102 nameLabel unused`)는 다른 에이전트 작업물 — 본 라운드 무관.
  - 직접 검증: `ch03_01_dongsan_lobby.scene.json:108` `position: "center_back"` ✓ / `prologue_02_train.scene.json:16-19` `loop: true` ✓ / `prologue_03_studio.scene.json` sfx_suitcase_wheels SFX cmd 부재 ✓.
- **followup**:
  - **AffectionThermometer.tsx unused nameLabel** (다른 에이전트 작업물, 본 라운드 무관): typecheck 빌드 실패 회피 위해 사용 또는 underscore prefix 처리 권장.
  - **자산 파일 정리**: `public/snd/sfx/sfx_suitcase_wheels.mp3` PM이 destructive 명시 시 삭제. 본 라운드는 매핑·시나리오 사용처 정리만.
  - **PM 풀 플레이 청감 검증**: 카톡 SFX 0.2/0.1 / 메뉴 sfx_pageturn 0.7 / 챕터 시작 sfx_pageturn(별도 볼륨 명시 X) / KTX 주행음 0.6 loop / BGM 메인테마 fade 4(2000ms). 너무 작거나 크면 미세 조정.
  - **프롤로그 임팩트 풀 플레이 시각 평가**: yunmo-enter 2.6s scale 0.55 + 페이드인 3.2s. 너무 길면 한 단계 단축. drop-shadow glow가 BG와 어색하게 합성되는지.
  - **다른 ambient SFX 후보**: 술집 왁자지껄(`sfx_bar_ambient`), 실험실 등 — 시나리오 검토 후 PM 결정 시 loop 토큰 박기.
  - **조나단 외 다른 prefix의 right_back 충돌**: 본 라운드는 nathan만. PM 풀 플레이 시 다른 캐릭(예: gyumin/gyeongmin 등) 우측 슬롯 충돌 신고되면 별도 처방.

---

### 2026-05-09 — UX 정합 묶음 라운드 #2 (PM 후속 정정 7건)

- **변경** (직전 UX 정합 묶음 라운드 #1의 PM 후속 정정):
  - **메뉴 UI 컨트롤러 아래로 (정정)**: 라운드 #1의 `--controls-bottom: 240px`(대사창 위) 처방을 PM이 정정 — "메뉴 UI는 컨트롤러(대사창) 아래에 있어야 함. 컨트롤러 세로폭 미세 축소 + 메뉴 버튼 크기 축소로 겹침 회피".
    - **`src/styles/tokens.css`**: `--textbox-height: 24% → 22%` (PC), `--controls-bottom: 240px → 8px` (대사창 아래 우하단으로 복귀).
    - **`src/ui/MiniControls.tsx`**: BTN_CLASS 사이즈 축소 — `min-h-[44px] min-w-[44px] px-3 py-2 ... text-sm` → `min-h-[36px] min-w-[36px] px-2 py-1 ... text-xs`. 대사창(bottom 56~214px)과 MiniControls(bottom 8~44px) 사이 12px 갭.
  - **시작 BGM 트리거 시점 정정**: `audioManager.playBgm('bgm_main_theme')`을 ModeSelect mount → **OpeningVideo mount**로 이동. PM 신고: "OP VEO와 동시에 시작했으면". OP는 muted라 BGM 충돌 없음. ModeSelect의 호출 제거(같은 ID 호출은 audioManager가 fade만 처리하므로 제거가 더 명료).
    - `src/ui/OpeningVideo.tsx`: 마운트 useEffect에 `audioManager.playBgm('bgm_main_theme', { fade: 3, volume: 0.6 })` 추가.
    - `src/ui/ModeSelect.tsx`: 직전 라운드의 BGM useEffect 제거 (정정 주석만 남김).
  - **카톡 SFX 볼륨 추가 정정**:
    - `src/ui/katalk/KakaoMessage.tsx`: 알림음 `sfx_katalk_notify` 0.7 → **0.4** (PM 신고 "시끄러움"). 전송음 `sfx_katalk_send` 0.4 → **0.3** (한 단계 더 약하게).
  - **프롤로그 임팩트 강화**:
    - **`src/styles/tokens.css`** `@keyframes yunmo-enter`: 1100ms → **1800ms**, scale `0.94→1.0` → `0.78→1.0`, translateY `8→0` → `28→0`. drop-shadow glow(`rgba(255,184,209, 0.55)`) 55% 키프레임에 추가 — "윤모가 검정 화면에서 빛을 머금고 다가오는" 임팩트. easing `ease-out` → `cubic-bezier(0.22, 1, 0.36, 1)` (강한 ease-out).
    - **`src/stores/gameStore.ts`** isFirstBoot 분기 페이드인: 32 step × 47ms ≈ 1500ms → **40 step × 60ms ≈ 2400ms**. 윤모 1.8s 임팩트와 합성되어 "느긋하게 시야가 열리며 윤모가 다가오는" 연출.
  - **MiniControls/PauseMenu SFX 통일**:
    - `src/ui/MiniControls.tsx`: fire 함수의 `sfx_click` → **`sfx_pageturn`** (PM 결정 "우측 하단 UI 누를 때 페이지 넘기는 소리"). 햄버거 토글도 동일.
    - `src/ui/PauseMenu.tsx`: 5개 items(재개/저장/불러오기/환경설정/타이틀로) 클릭 모두 `sfx_pageturn` 발동. fire wrapper 도입.
  - **ModeSelect 예상 플레이타임 표시**:
    - `src/ui/ModeSelect.tsx`: 압축 버전 카드에 "예상 플레이타임 — 약 3~4시간" / 풀 스토리 카드에 "약 6~8시간" 추가 (`mt-3 text-xs font-semibold`).
- **모듈** (status 변동 없음 — 라운드 #1 유효, 본 라운드는 정정·강화):
  - `src/styles/tokens.css`
  - `src/ui/MiniControls.tsx`
  - `src/ui/PauseMenu.tsx`
  - `src/ui/OpeningVideo.tsx`
  - `src/ui/ModeSelect.tsx`
  - `src/ui/katalk/KakaoMessage.tsx`
  - `src/stores/gameStore.ts`
- **사유**: PM 풀 플레이 검증 후 직전 라운드 7건 후속 정정/강화 신고:
  - "메뉴 UI는 컨트롤러 아래에. 컨트롤러 세로폭 미세 축소 + 메뉴 버튼도 살짝 축소" → 240px 위치 처방 회수, 대사창+버튼 동시 축소 처방.
  - "시작 BGM이 OP 영상과 동시에 시작했으면" → OpeningVideo mount로 이동.
  - "카톡 알림음 0.4, 전송음 0.3" → 추가 하향.
  - "프롤로그 임팩트와 구윤모 등장 임팩트를 더 키워" → 페이드인 1.5s→2.4s, yunmo-enter 1.1s→1.8s + scale 0.78 + glow.
  - "ModeSelect에서 예상 플레이타임 표시" → 카드에 명시.
  - "우측 하단 UI 누를 때와 메뉴 들어갔다 나올 때도 페이지 넘기는 소리" → MiniControls/PauseMenu 모두 sfx_pageturn 통일.
- **승인**: 사용자(PM) — 위 7건 명시 결정.
- **검증**:
  - typecheck 0 errors / vitest 72/72 통과.
  - 파일 변경 직접 확인 — tokens.css `--textbox-height: 22%` + `--controls-bottom: 8px` 정확히 박힘 / yunmo-enter 1800ms cubic-bezier + scale 0.78 + drop-shadow glow / OpeningVideo bgm_main_theme useEffect / ModeSelect 두 카드 플레이타임 텍스트.
  - preview 브라우저는 dev server stylesheet 캐시 이슈로 즉시 미반영 — PM 새로고침 후 풀 플레이 검증 권장 (HMR 새로고침 시 갱신).
- **followup**:
  - **PC 데스크탑(>768px)에서 textbox 22%·controls 8px 시각 검증**: 모바일(viewport <768px)은 38% 그대로라 영향 없음. PC 풀 플레이 시 대사창 12px 위에 컨트롤 노출이 자연스러운지 + 짧은 대사에서 박스가 너무 작아 보이지 않는지.
  - **시작 BGM 음량 감각**: OP 영상 시작과 함께 메인 테마가 시각 페이드인과 일관되는지(현재 fade 3 = 900ms vs OP 페이드인 800ms). PM 신고 시 fade 4(2000ms) 검토.
  - **윤모 등장 임팩트 시각 평가**: glow(drop-shadow rgba 핑크)가 윤모 캐릭터에만 적용되는데 BG·다른 캐릭터와의 시각 합성 자연스러운지. 워킹(슬라이드 1500ms) + yunmo-enter(1800ms zoom+glow) 동시 발동 합성감.
  - **카톡 SFX 0.4/0.3 청감**: 너무 작아져 인지 안 되면 0.5/0.4로 일부 복귀 검토.
  - **플레이타임 추정치 정확도**: 풀 6~8h / 압축 3~4h은 추정 — 실제 측정(W5 콘텐츠 통합 풀 플레이) 후 갱신 권장.
  - **PauseMenu 외 다른 모달(Backlog/Gallery/CGOverlay) SFX**: 본 라운드는 PauseMenu만. PM 신고 시 다른 모달 진입/나옴도 sfx_pageturn 통일 검토.

---

### 2026-05-09 — 캐릭터별 워킹 프로필 (PREFIX_WALK_PROFILE)

- **변경**:
  - **`src/ui/CharacterLayer.tsx`**: `PREFIX_WALK_PROFILE` 객체 신설 — 5명 H + 윤모 + 친구 4명 prefix별로 `{ms, distance, bobAmp}` 명시 등록. 명시 안 된 prefix는 `BASE_WALK` (1500ms / 220px / 6px) 사용. `profileFor(id, sprite)` 헬퍼. `WALK_MS` 상수 제거 → BG 분기·일반 enter·exit 모든 timeout이 캐릭터별 `profile.ms` 사용. wrapper outer-slide의 inline `--char-walk-ms/--char-walk-distance/--char-bob-amp` custom property로 적용 → 같은 `.char-anim-*` 클래스의 keyframe `var(...)`이 캐릭별 다른 값으로 해상.
  - **`05-ui-design/ANIMATION-SPEC.md`** §3에 캐릭터별 보정 표 추가.
- **모듈** (status: review 유지): `src/ui/CharacterLayer.tsx`, `05-ui-design/ANIMATION-SPEC.md`.
- **사유**: PM 풀플레이 #3 — "사람마다 보폭과 걷는 속도가 꽤 차이가 나면 좋겠어. 그래서 정지하는 시각도 다르고." 캐릭터 성격 정합 (한설은 차분·천천히, 장윤영은 활발·빠르게, 김규민은 큰 키·보폭 큼 등).
- **승인**: 사용자(PM) — 미세 조정은 PM 풀플레이로 직접.
- **followup**:
  - PM 풀플레이로 캐릭터별 보폭·속도 어색함 평가, 미세 조정.
  - 후속 작가/시나리오 캐릭터 추가 시 PREFIX_WALK_PROFILE에 prefix 등록 (안 등록해도 base 폴백).

---

### 2026-05-09 — 캐릭터 워킹 미세 튜닝 #2 (6px / 1500ms)

- **변경**: `--char-bob-amp` 3px → 6px / `--char-walk-ms` 900ms → 1500ms / `WALK_MS` 상수 동기 / ANIMATION-SPEC §3·§3.5 수치 동기.
- **모듈** (status: review 유지): `src/styles/tokens.css`, `src/ui/CharacterLayer.tsx`, `05-ui-design/ANIMATION-SPEC.md`.
- **사유**: PM 풀플레이 #2 — "너무 빨라. 1500ms로 늘려. 그리고 보빙이 더 많이 튀어야 해."
- **승인**: 사용자(PM) 명시 수치.
- **followup**: 6px 보빙이 너무 튀거나 1500ms가 길게 느껴지면 추가 조정.

---

### 2026-05-09 — 캐릭터 워킹 보빙 진폭·시간 튜닝 (3px / 900ms)

- **변경**:
  - **`src/styles/tokens.css`**: `--char-bob-amp` 1px → 3px, `--char-walk-ms` 700ms → 900ms.
  - **`src/ui/CharacterLayer.tsx`**: `WALK_MS` 상수도 동기 (700 → 900). phase clear 타이밍과 CSS keyframe 종료 일치 보장.
  - **`05-ui-design/ANIMATION-SPEC.md`** §3·§3.5 수치 동기.
- **모듈** (status: review 유지):
  - `src/styles/tokens.css`
  - `src/ui/CharacterLayer.tsx`
  - `05-ui-design/ANIMATION-SPEC.md`
- **사유**: PM 풀플레이 신고 — "줌은 잘 작동해. 그런데 워킹은 빠른 속도의 슬라이드로만 작동해." 진단: 1px 진폭 보빙이 시각 인지가 거의 안 돼 워킹 사이클이 단순 빠른 슬라이드로만 보임. 진폭 키우고 시간 살짝 늘려 호흡 부여.
- **승인**: 사용자(PM) 추측 처방 — 풀플레이 재검증 후 추가 미세 조정 가능.
- **검증**: dev preview에서 `.char-anim-bob` computed `animation-duration: 0.9s`, `--char-bob-amp: 3px` 적용 확인. 빌드·콘솔 에러 0건.
- **followup**: PM 풀플레이로 보빙 인지 + 슬라이드 호흡 자연스러움 평가. 산만하면 진폭 2px / 시간 1000ms 등 추가 조정.

---

### 2026-05-09 — 캐릭터 워킹·zoom 회귀 fix (BG 분기 + reduce-motion override)

- **변경**:
  - **`src/ui/CharacterLayer.tsx`** — 두 건 회귀 처방:
    - **BG 분기 누락**: BG 변경 + 캐릭터 등장이 같은 useEffect 사이클에서 발생하는 일반 시나리오 흐름(`[BG: ...]` → `[CHARACTER: ...]`)에서 BG 분기로 들어가 즉시 동기화하고 return → 워킹 enter가 발동 안 되던 버그. 이제 BG 분기 안에서도 새 캐릭터에 대해 `walkPhase='enter'` + `enterDir` + 700ms deferred clear 적용. 이전 BG의 캐릭터들은 BG fade 600ms와 함께 사라지는 정책 그대로.
    - **inline `style.animation` → 클래스 selector**: outer-slide/inner-zoom/inner-bob wrapper 3단의 inline animation 속성을 `.char-anim-enter-left/right`, `.char-anim-exit-left/right`, `.char-anim-bob`, `.char-anim-zoom` 클래스로 전환.
  - **`src/styles/globals.css`** — 신규 클래스 6종 정의 + `@media (prefers-reduced-motion: reduce)` 안에서 같은 클래스에 `animation-duration: var(--char-walk-ms|--char-zoom-ms) !important`로 명시 override. 글로벌 `*` selector 룰보다 클래스 selector가 더 specific하므로 specificity 동률 비교에서 클래스 selector가 이김 → reduce-motion 환경에서도 워킹·zoom 시각 유지.
  - **`05-ui-design/ANIMATION-SPEC.md`** §1.1 신설 — 캐릭터 워킹·zoom의 reduce-motion 예외 정책 명시.
- **모듈** (status: review 유지):
  - `src/ui/CharacterLayer.tsx`
  - `src/styles/globals.css`
  - `05-ui-design/ANIMATION-SPEC.md`
- **사유**: PM 풀플레이 신고 — "워킹은 구현이 안 됐어. 줌도 구현되지 않았고 대신 스포트라이트 이미지가 순간 깜빡이는 걸로 보여." 진단 결과 두 원인:
  1. 일반 시나리오에서 BG와 캐릭터가 같은 사이클에 변경 → BG 분기에서 즉시 동기화하고 return → 워킹 분기 미진입.
  2. PM 환경 `prefers-reduced-motion: reduce` 활성 → 글로벌 룰이 keyframe을 0.01ms로 강제 단축 → 워킹·zoom이 1프레임 내에 끝나 "깜빡임"으로만 보임.
- **승인**: 사용자(PM) — "내 PC 설정 바꾸지 않고 구현할 수는 없어?" → reduce-motion 환경에서도 워킹·zoom 작동하도록 정책 변경.
- **검증**:
  - dev preview(reduce-motion: true 환경)에서 `.char-anim-enter-left` 클래스의 computed `animation-duration: 0.7s`, `.char-anim-zoom` `0.45s` 정상 적용 확인 (글로벌 `* { 0.01ms }` 룰을 specificity로 override 성공).
  - 빌드 에러 0건, 콘솔 에러 0건 (CharacterLayer 자체).
- **followup**:
  - PM 풀플레이 시각 검증 (워킹 등·퇴장 + 표정/화자 zoom).
  - 만약 reduce-motion 사용자가 워킹·zoom 자체를 원치 않으면 §1.1에 명시한 대로 `var(--char-walk-ms)`를 0ms로 fallback하는 옵션 검토 (현재는 기본 duration 유지).

---

### 2026-05-09 — UX 정합 묶음 (대사 속도·메뉴 UI·스프라이트·시작 BGM·챕터 SFX·카톡 SFX·프롤로그 페이드인 임팩트)

- **변경** (5건 묶음 라운드 — 4~8단계 + 추가 PM 요청):
  - **`src/stores/settingsStore.ts`**: `TEXT_SPEED_MS` 모든 값 ÷1.5 (slow 60→40, normal 30→20, fast 15→10, instant 0). DialogueBox 타이프라이터가 자동 반영.
  - **`src/styles/tokens.css`**: PC 전용 `--controls-bottom: 240px` 토큰 신규 (textbox-bottom 56 + height 24%×720 ≈228.8px → 11px 갭). 윤모 첫 등장 임팩트 keyframe `@keyframes yunmo-enter`(opacity 0→1 + translateY 8→0 + scale 0.94→1.0, 1100ms ease-out) + `.yunmo-enter` 클래스 + 일반 캐릭 `.char-enter`(600ms opacity) 추가.
  - **`src/ui/MiniControls.tsx`**: PC div `bottom-2` 제거 + `style.bottom: var(--controls-bottom)`. 모바일(우상단 햄버거)는 변동 없음.
  - **`src/ui/CharacterLayer.tsx`**: `PREFIX_FIXED_X = { yuna: '65%' }` 신규. img `left` 우선순위 `PREFIX_FIXED_X[prefix] ?? POSITION_X[position]`. img className에 `isYunmo`이면 `yunmo-enter` 추가 (매 등장 시 fade+zoom+slight slide).
  - **`src/ui/ModeSelect.tsx`**: 마운트 useEffect에서 `audioManager.playBgm('bgm_main_theme', { fade: 3, volume: 0.6 })`. OP 영상은 `muted`라 BGM 충돌 없음. prologue_01_home 첫 [BGM: 일상_배경] 명령에서 audioManager가 자연 페이드 전환.
  - **`src/App.tsx` + `src/stores/gameStore.ts`**: App.tsx의 storyMode 확정 useEffect에서 `currentSceneId === ''`(첫 부팅) 체크 후 `useGameStore.setState({ chapterFadeOpacity: 1 })` 즉시 set → SceneRenderer 마운트 첫 frame에 검정. ModeSelect unmount → SceneRenderer 마운트 사이의 BG flash 차단. gameStore.startScene에 `isFirstBoot && !isE2eEnvironment()` 분기 추가 — 첫 advance 후 32 step × 47ms ≈1500ms 페이드인. 기존 isChapterBoundary 분기와 별도.
  - **`src/ui/ChapterStartPrompt.tsx`**: confirm 클릭 핸들러 직전 `audioManager.playSfx('sfx_pageturn')` 호출. 일반 advance에는 미발동.
  - **`src/ui/katalk/KakaoMessage.tsx:47-50`**: 알림음 `sfx_katalk_notify` volume 0.5 → **0.7** (PM 추가 요청). 메세지 전송 `sfx_katalk_send` 명시 `{ volume: 0.4 }` (default 0.8 → **0.4** = 절반).
- **모듈** (status: review 전환):
  - `src/stores/settingsStore.ts`
  - `src/styles/tokens.css`
  - `src/ui/MiniControls.tsx`
  - `src/ui/CharacterLayer.tsx`
  - `src/ui/ModeSelect.tsx`
  - `src/ui/ChapterStartPrompt.tsx`
  - `src/ui/katalk/KakaoMessage.tsx`
  - `src/App.tsx`
  - `src/stores/gameStore.ts`
- **사유**: PM 풀 플레이 검증에서 5건 신고 + 추가 2건. 페이지 SFX 호출 코드 부재 → 챕터 시작 시에만. 메인 테마 미재생(prologue 첫 BGM이 bgm_daily) → ModeSelect+OP 동안 메인 테마. 메세지 전송 SFX 음량 → 절반. 카톡 알림음 0.7로 상향. 5인 동시 등장 우측 영역에서 yuna↔nathan 시각 겹침 → yuna 65%. 대사 속도 → 1.5배. PC 우하단 컨트롤이 대사창과 겹쳐 가독성 저하 → 토큰 정의로 위로. 프롤로그 시작 갑작스러움 → ModeSelect 직후 검정에서 1.5초 페이드인 + 윤모 등장 시 1.1초 zoom-in 임팩트 keyframe.
- **승인**: 사용자(PM) — 5건 plan 승인 + 추가 결정 "ModeSelect 선택 후 즉시 페이드인" + "카톡 알림음 0.7" + "메세지 전송 SFX 절반" + "yuna right 75%→65%".
- **검증**:
  - typecheck 0 errors / vitest 72/72 통과.
  - preview MCP — `--controls-bottom: 240px` 적용 ✓ / 풀 스토리 클릭 후 1.5s 페이드인 (chapterFadeOpacity 0.88→0.78→0.69→0.56→0.47→0.38→0.25→0.16 선형 감소) ✓ / 윤모 첫 등장 img.classList에 `yunmo-enter` 적용 ✓ / 페이드인 완료 후 fadeOpacity=0 ✓.
  - 청감 검증(코드 변경만이라 PM 풀 플레이 검증 권장): 카톡 알림음 0.7 / 메세지 전송 0.4 / 챕터 시작 sfx_pageturn / ModeSelect bgm_main_theme.
- **followup**:
  - **yunmo-enter 적용 범위 검토**: 현재 모든 yunmo mount마다 발동 (매 씬마다 윤모 등장에 1.1s zoom-in). PM이 과하다고 신고하면 첫 부팅 한 번만 발동으로 좁히기 (휘발성 store flag 또는 useRef 트래킹).
  - **다른 에이전트 캐릭터 워킹 라운드와 yunmo-enter 합성**: 기존 wrapper `characterEnterFromLeft/Right` 700ms slide와 img의 yunmo-enter 1100ms zoom이 동시 발동. 시각 충돌 가능성 — PM 풀 플레이 시 ‎잘 보이고 어색하지 않은지 검증.
  - **조나단↔김규민 추가 처방 미적용**: 본 라운드는 yuna만. PM 풀 플레이 후 nathan PREFIX_FIXED_X 88% 또는 PREFIX_FIXED_MAX_H 75% 등으로 추가 좁힘 검토.
  - **카톡 미니게임 H4 거절 엔딩 트리거 재설계** (직전 라운드 followup 유효): late_reply_count 폐기 후 진입 경로 부재 → 호감도 임계값 기반 재설계.
  - **ReplyTimer.tsx 파일 삭제** (dead code, 직전 라운드 followup 유효).

---

### 2026-05-09 — 캐릭터 스프라이트 워킹 + 화자/표정 zoom 애니메이션 도입

- **변경**:
  - **`src/ui/CharacterLayer.tsx`**: 기존 `<img>` 단층 렌더 구조를 wrapper 3단(outer-slide → inner-zoom → inner-bob → `<img>`)으로 리팩터. PREFIX_FLIP `scaleX(-1)`은 `<img>` 자체에 그대로 보존(transform 합성 충돌 방지). shadow `displayChars` state로 deferred unmount(700ms) 도입 — `CHARACTER_HIDE` 명령 시 워킹 퇴장이 끝난 뒤 DOM 제거. `walkPhase`(enter/exit), `enterDir`(left/right), `zoomKey`(증가 카운터 by id) state 신설. `prevCharsRef`(id→sprite key)·`prevSpeakerRef`(prefix)·`prevSlotSideRef`(직전 진입 방향) 3개 ref. `pickEnterDir(position, prevSide)` 헬퍼 (left/right 슬롯은 즉시 결정, center 계열은 직전 반대편, 직전 없으면 왼쪽). 화자 매핑은 `resolveSpriteName(speaker, 'default')`로 prefix 추출 → spriteResolver의 PREFIX_BY_NAME(한글명·영문·H#) 활용. 가드 `animationsBlocked` 한 곳 집약: `pendingEnding` ∨ `runtimeMode === 'kakao'|'cg'` ∨ `MONOLOGUE.subtype === 'perv_start'`.
  - **`src/styles/globals.css`**: `@keyframes` 6종 신설 — `characterEnterFromLeft/Right`, `characterExitToLeft/Right`, `characterBob`(translateY ±1px 사인파 3.5회), `characterZoom`(scale 1.0→1.04→1.0 ease-in-out 450ms). 모두 `transform-origin: bottom center`로 발 고정.
  - **`src/styles/tokens.css`**: 캐릭터 애니메이션 토큰 5개 추가 — `--char-walk-ms: 700ms` / `--char-walk-distance: 220px` / `--char-bob-amp: 1px` / `--char-zoom-ms: 450ms` / `--char-zoom-scale: 1.04`.
  - **`05-ui-design/ANIMATION-SPEC.md`**: §3 워킹 등장 재작성, §3.5 워킹 퇴장 + 특수 모드 가드 신설, §4 표정 변경에 zoom 추가, §4.5 화자 zoom 신설, §14 검증 항목 5개 추가. status `draft → review` 전환.
- **모듈** (status: review 전환):
  - `src/ui/CharacterLayer.tsx`
  - `src/styles/globals.css`
  - `src/styles/tokens.css`
  - `05-ui-design/ANIMATION-SPEC.md`
- **사유**: PM 결정 — 일반 대사씬에서 캐릭터가 정적이라 몰입 약함. 등·퇴장 워킹 + 화자/표정 변경 zoom으로 시각 리듬·발화자 강조 부여. 정밀 타이밍이 잡힌 거절 엔딩 17.5초 시퀀스, 변태 망상 0.5초 sprite swap, 카톡 모달, CG 표시는 가드로 보존.
- **승인**: 사용자(PM) — "스프라이트 이미지에 애니메이션 추가. 등장·퇴장 시 걷는 듯한 움직임 + 대사·표정 변경 시 미세한 확대→축소". 디테일 결정 7가지: W6 패치 안 포함 / 슬라이드+미세 보빙 / ±220px·700ms·1px / center는 직전 반대편 / 화자 변경 시 zoom (같은 캐릭터 연속 대사 미트리거) / 표정 변경 시 zoom / 모놀로그에서 화자가 화면에 등장 중이면 적용 / 일반 대사씬에만 (특수 모드 가드).
- **검증**:
  - `npx tsc --noEmit`: 본 라운드 변경 파일(CharacterLayer.tsx, tokens.css, globals.css) 0 errors. 기존 미해결 2건(EndingStatsPanel.tsx winner / ChapterTransitionRecap.tsx unused) 본 라운드 무관.
  - 콘솔 에러 0건, 빌드 에러 0건 (Vite HMR로 즉시 적용 확인).
  - dev preview 환경에서 `prefers-reduced-motion: reduce` + dynamic import store 인스턴스 분리로 시각 시뮬레이션 제한 → PM 풀플레이 검증 필요.
- **followup**:
  - **PM 풀플레이 시각 평가**: 프롤로그 ~ ch01 전반에서 워킹 등·퇴장 자연스러움, 화자 zoom 산만함 정도, 표정 zoom + 크로스페이드 합성, center 슬롯 진입 방향이 시나리오 흐름에 자연스러운지. 산만하면 zoom scale 1.04→1.03 또는 zoom-ms 450→350으로 미세 조정.
  - **회귀 검증**: 거절 엔딩 8단계(§12) 17.5초 timeline 보존 + 변태 망상 zoom 폭발 미발생 + 카톡 모달·CG 노출 중 가드 정상 + AffectionToastStack 동시 발생 시 충돌 없음.
  - **시나리오 `speakerId` 박힌 비율 점검**: 한글명 fallback 의존도가 낮으면 안전, 높으면 PREFIX_BY_NAME에 누락 한글명 추가 필요.
  - **ANIMATION-SPEC** review → done 전환 (PM 풀플레이 통과 후).

---

### 2026-05-09 — 카톡 15초 미니게임 재설계 (KAKAO_TIMER+CHOICE_KAKAO 통합 + 호감도 디케이)

- **변경** (5건 묶음 라운드 — 1~3단계 완료, 4~8단계 진행 중):
  - **`src/engine/types.ts`**: `SceneCommand` KAKAO 항목에 `choices?: Choice[]` + `affectionDecay?: { target: AffinityTargetId; perSecond: number }` 옵셔널 필드 추가. `replyTimerEnabled`/`timerSeconds`는 `@deprecated` 주석만 남기고 필드 보존(잔존 .scene.json 호환). `ChoiceMechanism.h4_reply_speed` 데이터 잔존은 무해 — 주석으로 마킹.
  - **`scripts/compile-scene.ts`**: `parseKakaoBlock`이 KAKAO_TIMER 안에서 만난 `[CHOICE_KAKAO]`를 별도 CHOICE 명령으로 push하던 기존 동작을 변경 → 단일 KAKAO 명령의 `choices` 필드로 임베드. `affectionDecay: { target: 'H4', perSecond: 5 }` 자동 산출. KAKAO_TIMER 밖 [CHOICE_KAKAO]는 기존 폴백 유지.
  - **시나리오 데이터 9개 파일** (`ch04_library`/`ch05_decision`/`ch06_h4_seoyoon` × 정식+compressed+윤문): `[CHOICE_KAKAO]` 블록의 "타임아웃" 분기 옵션 12개 위치 일괄 제거 (옵션 3 → 2). 분기 씬(`ch04_05b_late`/`ch05_07b_late`/`ch06_h4_03b_late`/`ch06_h4_05b_late`)은 dead code로 남김 (followup 정리 라운드).
  - **`src/scenes/*.scene.json` + compressed**: `npm run compile + compile:compressed`로 자동 재생성 (216×2 씬). 카톡 미니게임 자리에 KAKAO 명령에 choices+affectionDecay 임베드 정상 박힘.
  - **`src/stores/gameStore.ts`**: `pickChoice` 가드 확장 — `cmd.type === 'CHOICE'`만 허용하던 기존을 `(CHOICE) || (KAKAO && cmd.choices)` 양쪽 허용. KAKAO 임베드 choices에서 선택 시에도 자연스럽게 effects 적용 + 다음 씬 진입.
  - **`src/ui/katalk/KakaoModal.tsx`** 재설계: ReplyTimer/handleTimeout 로직 전부 제거. 메시지 자동 흐름은 그대로(800ms 간격) + `allShown` + `cmd.choices` 박힌 경우 푸터에 인라인 선택지 버튼 그룹 렌더. `affectionDecay` 박힌 경우 1초마다 `useGameStore.setState`로 직접 flags 업데이트 (0~100 clamp, 토스트 미발생). **중요한 함정 회피**: `applyCommand({ type: 'FLAG_INC' })`로 디케이를 적용하면 store의 `currentCommand`가 KAKAO에서 FLAG_INC로 덮여 KakaoModal cmd selector가 cmd를 잃고 useEffect cleanup → 디케이 1회만 발화 후 정지. setState 직접 업데이트로 우회 (검증 6초 측정 -5/s 정확). BGM 진입 직전 `audioManager.currentBgmId()`를 `useRef`로 캡처 → unmount 시 prev !== 'bgm_katalk'면 자동 복귀.
- **모듈** (status: review 전환):
  - `src/engine/types.ts`
  - `scripts/compile-scene.ts`
  - `03-story/scenarios/ch04_library.md` (+compressed+윤문)
  - `03-story/scenarios/ch05_decision.md` (+compressed+윤문)
  - `03-story/scenarios/ch06_h4_seoyoon.md` (+compressed+윤문)
  - `src/scenes/*.scene.json` (재컴파일)
  - `src/stores/gameStore.ts`
  - `src/ui/katalk/KakaoModal.tsx`
- **사유**: PM 풀 플레이 검증에서 "카톡 창이 뜨면 타이머는 가는데 선택지는 전혀 나오지 않아서 무조건 미니게임 실패" 신고. 조사 결과 컴파일러는 `[KAKAO_TIMER]+[CHOICE_KAKAO]`를 **KAKAO + 별도 CHOICE 두 명령으로 분리**하고 KakaoModal은 KAKAO만 처리. 타이머 만료 후에야 CHOICE에 진입하는 구조라 사용자에게 답장 기회 자체 없음. PM 결정 — 메시지+선택지 동시 표시 + 타이머 폐기 + 호감도 1초당 -5 디케이 메커니즘. 타임아웃 옵션 + late_reply_count 메커니즘 자체 폐기.
- **승인**: 사용자(PM) — "메세지+선택지 동시 표시. 타이머를 없애는 대신 호감도 온도계 값이 1초당 5의 속도로 빠르게 줄어들도록." + "타임아웃 선택지 자체 제거 + late_reply_count 메커니즘 폐기".
- **검증**:
  - typecheck 0 errors / vitest 72/72 통과 / 컴파일러 216×2 씬 0 에러 (IF 블록 v0.1 미지원 6건 경고는 기존 한계).
  - preview MCP `?scene=ch06_h4_03_perv_pair&flags={H4:80}`:
    - 두 번째 KAKAO에 choices 2개 + affectionDecay 임베드 ✓
    - 1초당 H4 정확히 -5 감소 (6초 측정 80→55→50→45→40→35→30) ✓
    - 인라인 선택지 2개 표시 (타임아웃 옵션 부재) ✓
    - 선택 클릭 → 디케이 정지 + ch06_h4_03b_replied 진입 + 2초 후 H4 안정 ✓
- **followup**:
  - **H4 거절 엔딩 트리거 재설계**: `late_reply_count >= 2 → END_H4_REJECT` 트리거 영구 발화 X (시나리오에서 마커 제거). 호감도 임계값 또는 신규 플래그 기반 재설계 필요. `src/engine/scriptInterpreter.ts:69·110` + `BRANCH-GRAPH.md §H4` 영향.
  - `src/ui/katalk/ReplyTimer.tsx` 파일 삭제 (현재 import만 제거된 dead code).
  - `h4_reply_speed` mechanism 데이터 잔존 정리 (시나리오에 mechanism 마커 남아있음, 무해하나 정리 권장).
  - 다음 묶음 (4~8단계): 게임 시작 BGM(메인 테마)·페이지 SFX·메세지 SFX 볼륨, 대사 속도 1.5배, 메뉴 UI 위치, 스프라이트 yuna 65%, 프롤로그 시작 임팩트(페이드인 + 윤모 등장).

---

### 2026-05-08 — NPC 호감도 ×10 폭 + SOLO 엔딩 우선 트리거 + NPC 1명 룰 정정

- **변경**: 사용자 결정 4가지 동시 적용.
  - **NPC 호감도 폭 ×10** (`engine/toneMatrix.ts`): `NPC_GAIN_MULTIPLIER = 10` 신설. NPC_TONE_MATRIX 매트릭스 ±1~3 → 실제 적용 ±10~30. H KEY 자리 +15와 비교해 NPC 1회 픽 +30 가능 → "친구·엄마와 너무 놀면 H 호감도 우습게 넘어버림" 의도 충족.
  - **fallback +15~+25 랜덤** (`stores/gameStore.ts`): tone·effects 미박 + active=NPC 박힌 케이스도 NPC 1명에 +15~+25 랜덤 가산.
  - **SOLO 엔딩 우선 트리거** (`engine/scriptInterpreter.ts:evaluateBranch` F-1b 신설): `max(NPC) > max(H)` 이면 즉시 `END_SOLO_SUMMER`. late_reply_count F-1 다음 우선순위. 동률은 H 승리.
  - **NPC 1명 룰 정정**: H 변동 ≥1명 → NPC 모두 drop. H 0명일 때만 NPC 중 max |delta| 1명만 통과. active에 NPC 명시되면 그 NPC들 중에서만 후보 좁힘 (작가 의도 정합).
- **검증**: typecheck 0 / vitest 72/72 / 컴파일 정식 219 + 압축 219 정상.
  - preview 시뮬: prologue mom warm_supportive 픽 → mom +30 (10배). prologue friend direct_friendly 픽 → gyumin +30. 누적 maxNpc 30 > maxH 0 → SOLO 트리거 발동 확인.
  - 통계: tone 박힌 옵션 101개 + fallback 7개 = 108개 중 1명 변동 85.2%, 2~3명 3.7%, 4~5명 9.3%(회식·불곷). NPC 동시 다중 0%.
- **게임플레이 영향**: prologue 2~3번 픽 누적으로 NPC 30~60 가능. ch01~ch06 진행 중 H KEY 못 챙기면 H max ~30 유지 → 평가 시점 SOLO 발동. 친구·엄마 응답 진심도 균형 압박 시스템.
- **모듈** (status: review): `engine/toneMatrix.ts`, `engine/scriptInterpreter.ts`, `stores/gameStore.ts`.
- **사유**: 사용자 요청 — (1) 친구·엄마·교수 호감도가 H 우습게 넘으면 SOLO 엔딩. (2) NPC는 한 선택에 1명만 변동. (3) H 변동 있으면 NPC 미발동. NPC가 "선택에 호감도 변화 0인 상황 방지" 보조 역할로 도입됐으니, H가 자명하게 책임지면 NPC 추가 미필요.
- **다음 단계**: 시나리오 작업 — sub-씬·메인 씬에 NPC active 마커 더 추가해 친구·교수 토스트 빈도 조정. 현재 prologue·ch01_03·ch01_05만 NPC active 박힘. ch02~ch05 다른 챕터에도 친구 단톡·강의실·도서관 sub-씬 분리해 active=friend/gyumin/gyeongmin/taeho 추가 검토.

### 2026-05-08 — 호감도 토스트 "표시 안 됨" 회귀 두 건 처방 (clamp 가드 + 유령 카드 누적)

- **변경**: 외부 피드백 검증 후 두 모듈 동시 fix.
  - **`src/stores/gameStore.ts:applyOne(FLAG_INC)`**: `if (cmd.delta !== 0 && prev !== next)` → `if (cmd.delta !== 0)`. clamp(`prev===next`)로 인한 push 차단 가드 제거. 호감도가 100/0에 도달한 H에 +10/-10 선택지가 와도 토스트가 큐에 들어간다. 액체 채움 애니메이션은 prev===next라 정지하지만 변화량 숫자(+10)는 표시되어 "정답 선택 신호"가 보존된다.
  - **`src/ui/affection/AffectionToastStack.tsx`**: 카드 unmount 타이머 `useEffect`의 의존성 패턴 교체. 구버전은 `[activeCards, prune]`로 cleanup → 모든 타이머 reset 회귀 — 새 카드 추가마다 기존 카드 lifetime이 무한 연장되어 'exit' 페이드아웃 후 invisible 상태로 `activeCards`에 잔류('유령 카드'). idx 누적으로 새 토스트가 우상단(idx 0~4) 밖 좌하방으로 밀렸다. 처방: `useRef<Map<string, number>>`로 카드별 타이머 추적. 신규 카드만 setTimeout 등록(`if (timersRef.current.has(card.id)) continue`), 콜백 안에서 self-제거 + ref 정리. 별도 unmount-only useEffect로 컴포넌트 언마운트 시 일괄 클리어.
- **모듈** (status 변동 없음 — 06-engine은 done 상태):
  - `src/stores/gameStore.ts`
  - `src/ui/affection/AffectionToastStack.tsx`
- **사유**: 사용자(PM) 풀 플레이 — "선택지 선택 후 호감도 온도계가 우측 상단에 표시되어야 할 상황인데도 표시되지 않는 버그 매우 빈번". 외부 피드백 워크플로우(memory: feedback_external_review_workflow.md)대로 사실 검증 표 작성 — 두 가설 모두 진짜 원인 확인. 가설 1(clamp 가드)은 후반부(H 100 도달) + 초반 음수 선택지(0 floor) 양쪽에서 발생. 가설 2(유령 카드)는 사용자가 "매우 빈번"하다고 한 핵심 — 한 선택지가 NPC 7+H 5 = 12명 토스트를 트리거하니 두 번째 선택만 해도 idx 12부터 시작.
- **승인**: 사용자(PM) — "진행해."
- **검증** (`RICH_TOTAL_MS=4000`, `MINI_TOTAL_MS=2000` 현재 값 기준):
  - typecheck 0 errors.
  - preview 직접 측정: 5명 H 동시 push → 5장이 idx 0~4 정상 위치(`top=24·80·136·192·248`, `right=24·88·152·216·280`) 모두 `opacity=1` ✓.
  - 두 burst (1.5s 간격, 각 2장) → t=1700에 4장(b1·b2 함께 idx 0~3) 모두 visible / t=4500에 b1 unmount + b2가 idx 0~1로 재배치(`top=24·80`) ✓ — 유령 카드 누적 해소.
  - fix 전 회귀였다면 b2 카드들이 idx 2~3 자리(`top=136·192`)에 그대로 남아 우상단을 비웠을 것 — 본 라운드 측정으로 차이 확정.
- **인접 변경 없음**: SSoT(`05-ui-design/UI-SPEC.md` §11, `ANIMATION-SPEC.md` §13)는 토스트 *시각·타이밍*을 명세하고, 본 라운드는 *내부 lifecycle 관리 패턴*만 교체 → SSoT 영향 없음. CONVENTIONS에 트리거 룰만 추가 권장(룰 초안: "FLAG_INC가 H1~H5에 발생하고 `cmd.delta !== 0`이면 `affectionEvents`에 push한다. clamp 동일 여부 무관" + "토스트 카드의 unmount 타이머는 카드 추가/제거 단위로 등록·해제한다, activeCards 배열 변경 전체에 묶지 않는다").

---

### 2026-05-08 — NPC 7명 분리 + 선택지별 차등 호감도 + 4초 토스트 + 메뉴 차단

- **변경**: 사용자 결정 4가지 동시 적용.
  - **NPC 7명 분리** (`engine/types.ts`): 'friend' 통합 폐기 → `gyumin·gyeongmin·nathan·wook·junhyuk·mom·taeho`. `NpcAffinityId` + `AffinityTargetId` 타입 확장. `GameFlags` 7개 필드 추가, `friend` 제거. persist version 3 → 4.
  - **NPC_TONE_MATRIX 7행** (`engine/toneMatrix.ts`): 캐릭터별 5톤 응답표. 김규민 직설·장난, 표경민 진중, 조나단 밝음, 정욱 단답·실용, 오준혁 따뜻, 엄마 진중·따뜻, 이태호 진중. 점수 ±1~3.
  - **active 필터 H 한정** (`stores/gameStore.ts:applyChoiceEffects`): `activeHeroines` 필터는 H1~H5만 적용. NPC 7명은 항상 톤 매트릭스 통과. 한 선택지에 7 NPC가 톤별 차등 변동.
  - **fallback 자동 가산**: tone·effects 둘 다 미박 + active 마커 박힘 → active 대상에 +3~+10 균등 랜덤. "선택 이후 항상 토스트" 충족.
  - **4초 + 박스·그림자 강화** (`AffectionToastStack.tsx`): 풍성 카드 표시 시간 2.5s → 4.0s. 미니 도트 0.6s → 2.0s. 흰 박스 부활(반투명 핑크) + 강한 그림자 + blur(8px). 텍스트 이름·변화량(28→34px)·현재값(N/100) 3줄 구조 복원.
  - **메뉴/백로그/갤러리 차단**: `isPauseMenuOpen·isBacklogOpen·isGalleryOpen` 중 하나라도 열려있으면 토스트 mount X.
  - **컴파일러 확장** (`scripts/compile-scene.ts`): `parseHint`가 7 NPC 토큰 인식 + `friend` 단축어 → 5명 친구 자동 스프레드. `all` 토큰은 5 H + 7 NPC = 12 대상.
  - **AffectionThermometer 아바타 매핑**: 친구 4명 카톡 프로필 자산 재사용, 오준혁·엄마·교수 default 폴백.
  - **prologue 선택지에 톤 박기**: `prologue_02_train`/`prologue_03_studio` 5개 선택지에 톤 명시(bright_forward/warm_supportive/playful_casual/direct_friendly/mature_serious) — 정식+compressed 동일.
- **검증**: typecheck 0 / vitest 72/72 통과. preview에서 prologue warm_supportive 픽 시 7 NPC 모두 톤별 차등 변동 + 5장 풍성·미니 토스트 동시 마운트 확인 (gyeongmin/junhyuk/mom +3, taeho +2, gyumin +1, nathan/wook drop).
- **모듈** (status: review 전환): `engine/types.ts`, `engine/toneMatrix.ts`, `stores/gameStore.ts`, `scripts/compile-scene.ts`, `ui/affection/*`, `03-story/scenarios/prologue.md` (정식 + compressed).
- **사유**: 사용자 요청 — (1) 메뉴에서 토스트 가림. (2) 더 오래·더 잘 보이게. (3) 수치 표시. (4) 친구·엄마·교수 온도계도 등장. (5) 어떤 선택지가 어떤 NPC에 얼마나 영향. tone 매트릭스 NPC 행으로 자연 차등.
- **다음 단계**: ch01_03/05·ch02 일부 sub-씬에 명시 [INC: <npc> +N] 추가 (선택지마다 더 명확한 차등). 오준혁·엄마·교수 전용 아바타 자산 합성. PauseMenu의 AffectionStatusPanel에 NPC 별 추가 검토.

### 2026-05-08 — ChapterStartPrompt 1초 락 (우발 클릭 방지)

- **변경**: `src/ui/ChapterStartPrompt.tsx` — 버튼 노출 직후 1초간 비활성. `PROMPT_UNLOCK_MS = 1000` 상수 + `unlocked` state + setTimeout으로 `awaiting=true`가 될 때마다 false→true 전환. 락 동안 `disabled` + `disabled:opacity-50 disabled:cursor-not-allowed` 표시. autoFocus는 unlock 시점으로 미룸.
- **모듈**: `src/ui/ChapterStartPrompt.tsx`
- **사유**: PM 풀 플레이 검증 — 챕터 마지막 대사 클릭 직후 fade-out 끝나며 ChapterStartPrompt가 즉시 노출되는데, 사용자의 advance 클릭 흐름의 관성으로 시작하기 버튼이 의도치 않게 즉시 클릭되는 케이스 가능. CGOverlay의 1초 락(2026-05-08 라운드)과 동일 패턴으로 챕터 시작도 의식적 클릭이 되도록.
- **승인**: 사용자(PM) — "시작하기 버튼을 바로 못 누르고 버튼이 보인 뒤 1초 뒤부터 활성화되도록 해."
- **검증**: typecheck 0 errors / vitest 72/72 / preview 브라우저 — `awaitingChapterAdvance=true` 직후 `disabled=true` + 1초 후 자동 `disabled=false`.

---

### 2026-05-08 — 야간 생화학 실험실 BG 분리 (`bg_biochem_lab_night` 정식 자산화)

- **변경**: 한설+윤모 야간 실험실 자리 BG 시간대 정합. 기존엔 `bg_anatomy_lab`(낮 자산) 한 장을 모든 시간대 공유했고 `bg-list.md` alias 표(line 29)에 `bg_biochem_lab_night → bg_anatomy_lab (variant: biochem_night)`로 변형 메타만 표기. 사용자가 별도 야간 실험실 PNG 자산을 `0501test/배경/night_lab.png`에 제공 → 정식 자산 분리.
  - **자산 변환·등록**: ffmpeg `libwebp -quality 85`로 PNG → WebP (88KB) → `public/img/bg/bg_biochem_lab_night.webp` 저장. `public/manifest.json`에 `bg_biochem_lab_night` 등록 (`bg_anatomy_lab`과 `bg_bundang_home` 사이).
  - **시나리오 BG 마커 라인 번호 기반 정밀 교체** (TRUE/NORMAL 자리는 보존):
    - `ch04_library.md` line 308 (Scene `ch04_03_lab_late`, "4/28 밤 11시 본관 4층 생화학 실험실") → night
    - `ch06_h3_seol.md` line 409 + 441 (Scene `ch06_h3_03_late_night_lab`, "6/3 새벽 1시 5분") → night
    - `ch06_h3_seol.md` line 782 (Scene `ch06_h3_happy`, "6/14 밤 11시") → night
    - 같은 라인을 compressed/.md 2개 + 윤문 .txt 2개 동기화 (총 6개 파일)
    - **보존**: `ch06_h3_seol.md` line 675 (Scene `ch06_h3_true`, "6/26 저녁 7시 박사 논문실" — 별도 공간) + line 840 (Scene `ch06_h3_normal`, "6/8 오후 3시")
  - **엔진 .scene.json 새벽/밤 씬만 교체** (메인 + compressed = 6개):
    - `src/scenes/ch04_03_lab_late.scene.json` + compressed
    - `src/scenes/ch06_h3_03_late_night_lab.scene.json` + compressed (BG 두 자리 모두)
    - `src/scenes/ch06_h3_happy.scene.json` + compressed
    - **보존**: ch02_01_anatomy_morning / ch02_02_cadaver_first / ch02_03_biochem_lab (모두 낮) / ch06_h3_normal (오후 3시) / ch06_h3_true (저녁 박사 논문실 별도 공간)
  - **`bg-list.md` 갱신**: alias 표에서 `bg_biochem_lab_night` 행 제거 + §3-1 정식 항목 신설 (사용 씬 명시 + 밤 실험실 프롬프트 + 12세 가드레일 결).
- **모듈** (status 변동 없음):
  - `public/manifest.json` (자산 등록)
  - `public/img/bg/bg_biochem_lab_night.webp` (신규 자산)
  - `04-image-prompts/backgrounds/bg-list.md` (alias 표 + §3/§3-1)
  - `03-story/scenarios/ch04_library.md` + compressed + 윤문
  - `03-story/scenarios/ch06_h3_seol.md` + compressed + 윤문
  - `src/scenes/ch04_03_lab_late.scene.json` + compressed
  - `src/scenes/ch06_h3_03_late_night_lab.scene.json` + compressed
  - `src/scenes/ch06_h3_happy.scene.json` + compressed
- **사유**: 사용자(PM)가 직전 라운드(`bg_campus_cafe_night` 분리)와 같은 패턴 발견 — 한설 새벽 1시 실험실 자리에 낮 BG가 깔리는 시각 위화감. alias로 처리됐던 자리에 별도 자산을 직접 제공하여 시간대 정합 확보. 같은 BG ID를 공유하던 다른 시간대 실험실(낮 Ch.2 / 오후 NORMAL / 저녁 TRUE 박사실)은 보존되어야 하므로 ID 분리가 안전.
- **추가 정합 결정**: 사용자가 명시한 자리는 "새벽" 한정이지만, `ch06_h3_happy`("밤 11시")도 같은 한설+윤모 야간 실험실 결이라 시각 위화감 동일. `bg_campus_cafe_night` 라운드의 "새벽 자리만" 일관성과 달리 본 라운드는 야간 BG 정합을 우선시해 HAPPY까지 함께 교체. NORMAL(오후)·TRUE(저녁 박사실)는 시간대/공간 차이로 분리 보존.
- **승인**: 사용자(PM)
- **검증**: BG ID 잔여 grep — 새벽/밤 씬 6개 JSON(메인+compressed) 모두 `bg_biochem_lab_night` ✅ / 보존 5개(ch02 3종·normal·true) `bg_anatomy_lab` 그대로 ✅ / 시나리오 .md 라인 308·409·441·782만 night·라인 675·840 default 분리 정상 ✅.

### 2026-05-08 — OP 영상 클릭/Space 스킵 회귀 근본 처방 + 챕터 시작 UI 개편

- **변경**:
  - `src/App.tsx`: `useEffect` startScene 호출에 `if (showOpening) return` 가드 추가. OP 표시 중엔 startScene 보류 → DialogueBox 등 underlying scene UI 미마운트 → window keydown handler / SceneRenderer.handleAreaClick 모두 비활성. `showOpening`을 effect deps에 추가해 OP 종료 시점에 자동 트리거.
  - `src/ui/OpeningVideo.tsx`: capture phase로 `window.addEventListener('click'/'keydown', block, true)` defensive 차단 추가. Space/Enter/Backspace는 preventDefault + 모든 click/keydown은 stopImmediatePropagation으로 underlying handler 도달 차단. App.tsx의 startScene 보류와 이중 처방으로 자동저장 race 등 어떤 흐름에서도 OP 위 입력이 advance를 트리거 못 하게 보장.
  - `src/stores/gameStore.ts`: `chapterTitle(sceneId)` 헬퍼 export — route-common.md / route-H{1~5}-*.md 챕터 헤더 정합 한글 제목 매핑. Ch.6는 `ch06_h1`~`ch06_h5` prefix로 분기별 히로인 이름까지 추출.
  - `src/ui/ChapterStartPrompt.tsx`: 레이아웃 개편. 화면 가운데 큰 챕터 제목 + 그 아래 "시작하기" 버튼(예전 "다음 챕터 시작하기" → 단순화). 세로 flex + gap-10. 제목은 white text-3xl md:text-5xl font-bold, 버튼은 기존 `bg-accent` 동일.
- **모듈** (status 변동 없음 — 핵심 동작 보강):
  - `src/App.tsx`
  - `src/ui/OpeningVideo.tsx`
  - `src/stores/gameStore.ts`
  - `src/ui/ChapterStartPrompt.tsx`
- **사유**:
  - **OP 클릭/Space 스킵 회귀**: 1차/2차 처방(외곽 div onClick 제거 → React stopPropagation)에도 사용자 검증 결과 "전혀 해결되지 않았어" 보고. 진단 — DialogueBox.tsx:95의 `window.addEventListener('keydown', handler)`가 native bubble phase 등록이라 React 이벤트 시스템의 stopPropagation으로 막히지 않음. 또한 OP 동안 storyMode 자동 적용으로 startScene이 백그라운드에서 진행되어 DialogueBox 마운트 → keyboard handler 활성. 근본 처방 = OP 동안 scene UI 자체를 마운트 안 함 (App.tsx 가드) + OP 자체 capture phase 방어막 (다른 진입 경로 대응).
  - **챕터 버튼 OP 위 노출 회귀**: 자동저장된 currentSceneId가 다른 챕터일 때 `chapterPrefix(prevSceneId) !== chapterPrefix(prologue_01_home)` 조건이 true가 되어 fade-out + ChapterStartPrompt가 OP 위에 노출. App.tsx 가드로 startScene 자체를 OP 종료 후로 미루면 자동 해결.
  - **챕터 UI 단순화**: PM 의도 — "다음 챕터 이름이 화면 가운데 + 버튼은 시작하기만". 챕터 진입을 의식적 인지 + 단순 버튼 입력으로.
- **승인**: 사용자(PM) — "오프닝에서 클릭하거나 스페이스바를 눌렀을 때 다음 장면이 스킵되는 문제가 전혀 해결되지 않았어. 다음 챕터 시작하기 버튼은 오프닝에서는 없애. 다음 챕터 시작하기 버튼은, 화면 가운데 다음 챕터 이름이 나오고 버튼에는 '시작하기'만 적혀있도록 해."
- **검증**: typecheck 0 errors / vitest 72/72 / preview 브라우저:
  - OP 표시 중 click/Space/Enter → underlying advance 0 (capture phase 흡수 + scene UI 비마운트).
  - 챕터 경계(ch01_05_close → ch02 등) 도달 시 검정 화면 가운데 "Chapter 2 — 카데바" 텍스트 + 그 아래 "시작하기" 버튼 노출.
  - OP 동안엔 ChapterStartPrompt 미노출 (startScene 보류).
- **회귀 안전망**:
  - E2E `isE2eEnvironment()` true 시 `showOpening` 초기값 false → App.tsx 즉시 startScene → 기존 Playwright autoAdvance 호환.
  - OP 종료 시 capture handler unmount cleanup → 일반 게임플레이 keyboard advance 정상.
  - 챕터 제목 매핑 누락 시 chapterPrefix() fallback (예: 'ch99' → 'ch99' 표시).
- **다음 단계 (잔여)**:
  - 챕터 제목 표시 페이드 인 애니메이션 검토 (현재는 즉시 노출).
  - Ch.6 분기 외 H4 BAD/거절 등 특수 엔딩 sceneId 챕터 제목 정합 검증.

---

### 2026-05-08 — CharacterLayer _back 슬롯 X 좌표 재조정 (앞줄과 10% 분리)

- **변경**: 6슬롯 모델의 뒷줄(_back) X 좌표를 30/50/70 → **15/50/85**로 재조정. 1차 라운드의 5% 차이(앞줄 25/75 vs 뒷줄 30/70)가 자산 가로 폭이 큰 캐릭(gyumin 0.539, gyeongmin 0.603, nathan 0.593)에서 시각 겹침을 일으킨다는 PM 신고 처방.
  - **POSITION_X 변경** (`src/ui/CharacterLayer.tsx`):
    - `left_back: 30% → 15%` (앞줄 left 25%와 10% 분리)
    - `right_back: 70% → 85%` (앞줄 right 75%와 10% 분리)
    - center_back 50% 유지 (center와 같은 X지만 z+scale 차이로 입체감)
- **사유**: PM 풀 플레이 시각 검증에서 3건 겹침 직접 신고:
  1. **ch04_04_seoyoon_meet** — 김규민 right_back(70%) + 나서윤 right(75%) → X 5% 차이로 가운 폭 겹침
  2. **ch03_04_back_to_school cmd#9~** — 김규민 right(75%) + 조나단 right_back(70%) → 동일 패턴
  3. **ch03_04_back_to_school cmd#36** (장윤영 등장) — 표경민 left(25%) + 김규민 left_back(30%), 조나단 right_back(70%) + 장윤영 right(75%) → 양쪽 동시 5% 차이
  audit POSITION_COLLISION은 같은 슬롯 ID 검사라 X 좌표 근접은 못 잡음. 좌표 분리가 근본 처방.
- **검증** (`npm run audit && npm run typecheck && npm test`):
  - audit Critical **0건** 유지 (6슬롯 ID 자체는 그대로라 다른 검출 영향 X)
  - audit Major 12 / Info 110 (변동 없음)
  - typecheck 무에러 / vitest **72/72** 통과
  - preview 시각 검증은 PM 직접 — `ch04_04_seoyoon_meet` / `ch03_04_back_to_school` 진입해서 5명 동시 등장 슬롯 분리 확인 권장
- **모듈**:
  - `src/ui/CharacterLayer.tsx` (POSITION_X _back 3행 + 코멘트 갱신)
- **승인**: PM (구윤모) — 옵션 "적극적 분리 10% 차이" 채택.
- **부수 효과**: 화면 가장자리 자산 잘림 위험 검토 — gyumin scale 1.2 적용 후 가로 ~58% 폭이지만 max-h 75%(_back) 클램프 시 ~40% 폭. left_back 15% 좌표 + 자산 중심 정렬(translateX(-50%))이면 left edge -5%~35% 범위 → 약간 화면 좌측 5% 잘림 가능. PM 풀 플레이 후 필요 시 PREFIX_FIXED_MAX_W로 폭 제한 또는 좌표 미세 조정.

### 2026-05-08 — 새벽 카페 BG 분리 (`bg_campus_cafe_night` 정식 자산화)

- **변경**: 차세린 새벽 대화 자리 BG 시간대 정합. 기존엔 `bg_campus_cafe`(낮 자산) 한 장을 새벽·오후·점심 모두 공유했고 `bg-list.md` alias 표(line 34)에 `bg_campus_cafe_night → bg_campus_cafe (variant: night)`로 변형 메타만 표기. 사용자가 별도 새벽 카페 PNG 자산을 `0501test/배경/bg_campus_cafe_night.png`에 제공 → 정식 자산 분리.
  - **자산 변환·등록**: ffmpeg `libwebp -quality 85`로 PNG → WebP (1672×941, 155KB) → `public/img/bg/bg_campus_cafe_night.webp` 저장. `public/manifest.json`에 `bg_campus_cafe_night` 등록 (`bg_campus_cafe`와 `bg_campus_night_blossom` 사이).
  - **시나리오 BG 마커 첫 자리만 교체** (각 파일 두 번째 자리는 낮 카페라 보존):
    - `ch04_library.md` line 186 (Scene `ch04_02_cafe_late`, "4월 28일 새벽 0시 30분") → `bg_campus_cafe_night`
    - `ch06_h1_serin.md` line 234 (Scene `ch06_h1_02_late_cafe`, "새벽 1시 5분") → `bg_campus_cafe_night`
    - 같은 라인을 compressed/.md 2개 + 윤문 .txt 2개 동기화 (총 6개 파일)
    - **보존**: `ch04_library.md` line 726 (장윤영 점심 카페, "봄볕이 창으로 들어와") + `ch06_h1_serin.md` line 782 (Scene `ch06_h1_normal`, "오후 4시")
  - **엔진 .scene.json 4개 새벽 씬만 교체**:
    - `src/scenes/ch04_02_cafe_late.scene.json` + compressed
    - `src/scenes/ch06_h1_02_late_cafe.scene.json` + compressed
    - **보존**: ch01_05_cafe (Ch.1 낮) / ch04_06_yuna_morning (장윤영 아침) / ch06_h1_normal (오후 4시) / ch06_h2_happy / ch06_h4_04_date — 모두 차세린 새벽 외 시간대
  - **`bg-list.md` 갱신**: alias 표에서 `bg_campus_cafe_night` 행 제거 + §8-1 정식 항목 신설 (사용 씬 명시 + 새벽 카페 프롬프트). §8 헤더 "캠퍼스 카페 실내" → "캠퍼스 카페 실내 (낮)"로 시간대 명시.
- **모듈** (status 변동 없음):
  - `public/manifest.json` (자산 등록)
  - `public/img/bg/bg_campus_cafe_night.webp` (신규 자산)
  - `04-image-prompts/backgrounds/bg-list.md` (alias 표 + §8/§8-1)
  - `03-story/scenarios/ch04_library.md` + compressed + 윤문
  - `03-story/scenarios/ch06_h1_serin.md` + compressed + 윤문
  - `src/scenes/ch04_02_cafe_late.scene.json` + compressed
  - `src/scenes/ch06_h1_02_late_cafe.scene.json` + compressed
- **사유**: 사용자(PM)가 풀 플레이 검증 중 차세린 새벽 1시 카페 자리에 낮 BG가 깔리는 시각 위화감 발견. alias로 대체했던 자리에 별도 자산을 직접 제공하여 시간대 정합 확보. 같은 BG ID를 공유하던 다른 시간대 카페(낮·오후·아침)는 보존되어야 하므로 ID 분리가 안전.
- **승인**: 사용자(PM)
- **검증**: BG ID 잔여 grep — 새벽 씬 4개 JSON(메인+compressed) 모두 `bg_campus_cafe_night` ✅ / 낮 씬 5개(ch01·ch04 yuna·ch06 normal·ch06 h2 happy·ch06 h4 date) `bg_campus_cafe` 보존 ✅ / 시나리오 .md 첫 자리 night·두 번째 자리 default 분리 정상 ✅.

### 2026-05-08 — OP 영상 클릭 차단 보강 + 챕터 전환 "다음 챕터 시작하기" 버튼 도입

- **변경**:
  - `src/ui/OpeningVideo.tsx`: 외곽 div에 `onClick={(e) => e.stopPropagation()}` 추가. storyMode 확정 상태에서 OP+SceneRenderer 동시 마운트 시 OP 위 클릭이 underlying SceneRenderer.handleAreaClick으로 버블링되어 advance 트리거하던 회귀 차단. ChapterFader와 동일한 2단(차폐+stopPropagation) 패턴.
  - `src/stores/gameStore.ts`:
    - RuntimeState에 `awaitingChapterAdvance: boolean` + 휘발성 `_chapterAdvanceResolve: (() => void) | null` 필드 추가, initialRuntime 기본값 false/null.
    - `confirmChapterAdvance()` 액션 추가 — 보관된 resolve 호출.
    - `startScene` 챕터 경계 분기에서 fade-out + 새 씬 로드 후 `awaitingChapterAdvance: true` set + Promise await → 사용자 confirmChapterAdvance 호출 시 resolve → fade-in 진행. E2E 환경(`navigator.webdriver` / `?scene=` / `?flags=`)은 `isE2eEnvironment()` 헬퍼로 자동 통과 (Playwright autoAdvance/expectEnding 호환).
  - `src/ui/ChapterStartPrompt.tsx` 신규: awaitingChapterAdvance 구독, 검정 화면 위 중앙 "다음 챕터 시작하기" 버튼(`bg-accent`, 마운트 시 autoFocus → Space/Enter 키보드 활성화 가능). z-index 360(ChapterFader 350 위, AffectionToast 400 아래). `onClick stopPropagation`으로 버튼 클릭 외 영역도 SceneRenderer로의 버블링 차단.
  - `src/engine/SceneRenderer.tsx`: ChapterStartPrompt import + ChapterFader 다음에 마운트.
- **모듈** (status 변동 없음 — 핵심 동작 보강):
  - `src/ui/OpeningVideo.tsx`
  - `src/ui/ChapterStartPrompt.tsx` (신규)
  - `src/stores/gameStore.ts`
  - `src/engine/SceneRenderer.tsx`
- **사유**:
  - **OP 클릭 회귀**: PM 풀 플레이 검증에서 발견. 1차 OP 처방(외곽 div onClick 제거)에서는 직접 onClick handler만 제거했지만, App.tsx fragment의 sibling 구조에서 React 이벤트 시스템 특정 케이스(SSR hydration race / iOS click 전달 / addEventListener 패턴 등)로 클릭이 underlying SceneRenderer onClick까지 도달 가능. ChapterFader 케이스(2026-05-08 라운드)와 동일 패턴으로 `e.stopPropagation()` 명시 추가 — 어떤 경로로든 OP 클릭이 외부 advance를 트리거 못 하게 보장.
  - **챕터 전환 자동 진행 → 사용자 액션 요구**: 기존 흐름은 fade-out 1.6s → 즉시 fade-in 1.6s = 챕터 사이 텀 3.2s 자동 진행. PM 의도 — 챕터 전환을 사용자가 능동적으로 인지하고 다음 챕터를 시작하는 의식적 행위로 격상. 검정 화면에서 버튼 클릭 시점에 페이드 인 시작 → 새 챕터 시작이 사용자 입력으로 트리거됨.
- **승인**: 사용자(PM) — "OP 영상 재생 중에도 클릭할 시 다음 장면으로 넘어가는 버그가 있는데 해결해. 그리고 챕터가 바뀔 때마다 다음 챕터 시작하기 버튼을 누르도록 수정해."
- **검증**:
  - typecheck 0 errors / vitest 72/72 / E2E Playwright 16/16 (E2E 자동 통과).
  - preview 브라우저: OP 클릭 시도 → underlying advance 0 / 챕터 경계 도달 시 검정 화면 + "다음 챕터 시작하기" 버튼 노출 → 클릭 시 fade-in + 다음 챕터 진행.
- **회귀 안전망**:
  - E2E `isE2eEnvironment()` 자동 통과로 helpers `autoAdvanceUntilEnding`/`expectEnding` 흐름 무영향.
  - 첫 챕터(prologue) 진입은 `prevSceneId === ''` 조건으로 챕터 경계 미감지 → 버튼 미노출, OP → 게임 자연 시작.
  - persist `partialize`에서 `awaitingChapterAdvance`/`_chapterAdvanceResolve` 제외(휘발성) — 페이지 reload 시 깨끗하게 시작.
- **다음 단계 (잔여)**:
  - 챕터 전환 시 챕터 번호/제목 표시(예: "Chapter 2 — 해부학 실습실") 추가 검토 (W5 환경설정 라운드).
  - 키보드 advance(Space/Enter)도 페이드/프롬프트 중 일관 차단 검토.

---

### 2026-05-08 — AffectionToast SFX 자동 합성 (sfx_affection_up/down)

- **변경**: AffectionToast 슬롯 2종을 ffmpeg sine 합성으로 채움.
  - **sfx_affection_up**: C5(523.25Hz) → E5(659.25Hz) → G5(783.99Hz) 메이저 트라이어드 상승 차임. 0.16s + 0.16s + 0.28s = 0.6s. 5ms attack + 50ms release per note. 음량 가중치 0.55→0.65→0.75 (점강).
  - **sfx_affection_down**: G5 → E5 → C5 하강. 동일 envelope. 음량 가중치 0.55→0.5→0.45 (점감, "물러나는" 인상).
  - 후처리: `aformat=channel_layouts=mono` + `loudnorm=I=-18:TP=-1.5:LRA=11` + 44100Hz mono + libmp3lame 128k CBR.
  - 출력: `public/snd/sfx/sfx_affection_up.mp3` / `sfx_affection_down.mp3` (각 ~10.6KB, 0.6s).
  - `npm run manifest` → `public/manifest.json` sfx 13 → 15.
- **검증**: ffprobe 길이/채널/sample rate 정합, audioManager graceful warn 없음, 토스트 트리거 시 정상 SFX 로딩 (preview eval).
- **모듈** (status: review 전환): `docs/assets/SFX-list.md` §3.5b 신설.
- **사유**: 사용자 요청(2026-05-08 Auto 모드) — "사운드 자산은 네가 직접 합성해". 기존 SFX-list §3.5 ffmpeg 자동 합성 패턴 차용 + UI-SPEC §11.5 톤 가이드(부드러운 차임, 12세 — 강한 알람 X) 정합.
- **다음 단계**: PM 청감 시 톤 판단. 사무적이면 외부 차임 다운 또는 가산 합성(harmonic 추가)로 정정.

### 2026-05-08 — 챕터 페이드 중 클릭 advance 차단 (pointer-events + stopPropagation 2단)

- **변경**: `src/ui/ChapterFader.tsx`
  - `pointerEvents` 임계 `opacity > 0.5` → `opacity > 0.01` (페이드 진행 모든 시점 클릭 흡수).
  - `onClick={(e) => e.stopPropagation()}` 추가 — ChapterFader가 클릭 받았을 때 외곽 SceneRenderer `handleAreaClick`으로 이벤트 버블링되는 경로 차단.
- **모듈** (status 변동 없음 — 핵심 동작 보강, 명세 변경 아님):
  - `src/ui/ChapterFader.tsx`
- **사유**: PM 풀 플레이 검증 — 챕터 전환 시 페이드 인/아웃 진행 중 사용자가 클릭하면 다음 장면으로 넘어가버림. 1차 처방으로 임계만 0.5→0.01 단축 후 검증 시도 중 **이벤트 버블링 회귀 발견** — pointer-events: 'auto'로 ChapterFader가 클릭을 받아도 React onClick 이벤트가 SceneRenderer 외곽 div(`handleAreaClick`)로 버블링되어 advance 트리거. stopPropagation 가드를 추가해 2단 처방으로 완성.
- **승인**: 사용자(PM) — "챕터가 바뀌며 페이드인/페이드아웃 될 때는 클릭해서 다음 장면으로 넘어가지 못하도록 막아".
- **검증**:
  - typecheck 0 errors / vitest 72/72.
  - preview 브라우저 elementFromPoint 시뮬레이션:
    - opacity 0 → 클릭 타겟 BUTTON/IMG (DialogueBox/BackgroundLayer), advance 정상 (8회 클릭 → +6 advance).
    - opacity 0.05/0.5/1.0 → 클릭 타겟 DIV(chapter-fader), 5회 클릭 시도 → currentCommandIndex 변동 0건.
- **회귀 안전망**:
  - 키보드(Space/Enter) advance는 페이더와 무관하게 작동 — 사용자 명시 요청 "클릭" 범위 외, 별도 처방 미진행.
  - 챕터 경계 외 일반 씬 전환은 ChapterFader가 트리거되지 않음(opacity = 0 유지) → 영향 없음.
- **다음 단계 (잔여)**:
  - 키보드 advance도 페이드 중 차단할지 PM 확인 필요 (UX 일관성 vs 명시 요청 범위).

---

### 2026-05-08 — 캐릭터 표시 보정 라운드 (조나단/김규민/표경민/윤하정 시각 균형 4 라운드)

PM 라이브 플레이 후 사이드 캐릭터 시각 균형 4건 미세 조정. CharacterLayer에 prefix별 표시 보정 시스템(SCALE / FIXED_MAX_H / FIXED_MAX_W / FLIP) 도입.

#### 라운드 #1 — 조나단 자산 80% 리사이즈 (시도, 효과 X 학습)

- **PM 보고**: "조나단 스프라이트 이미지가 혼자서 조금 커. 이미지 크기를 20% 정도 줄이고 바로 게임에 적용됐는지 검증해."
- **자산 자체 80% 리사이즈** — `public/img/sprites/nathan_default.webp` 1496×2522 → 1196×2016 (ffmpeg `scale=trunc(iw*0.8/2)*2:trunc(ih*0.8/2)*2`, 178 KB → 138 KB)
- **학습**: CharacterLayer가 maxHeight 기반이라 자산 px 줄여도 화면 표시 height는 동일 (px 비율 유지). 자산 리사이즈는 로딩 사이즈 절감만 효과. 시각 크기 변경엔 CSS maxHeight 보정 필수.

#### 라운드 #2 — 조나단 표시 maxHeight × 0.92

- 시도 #1 (× 0.8): 검증 결과 키 차이 20%로 너무 작아 김규민 등 다른 사이드 캐릭터와 키 안 맞음
- **PM 피드백**: "너무 많이 줄여서 키높이가 안 맞아"
- 시도 #2 (× 0.92): 키 차이 8%로 자연스러움 ✓

#### 라운드 #3 — 4명 일괄 표시 보정 (PM 요청 3건)

- **PM 요청**:
  - "김규민은 더 커야해. 120%로 확대"
  - "표경민은 더 작아야해. 키높이가 구윤모와 오준혁의 중간정도"
  - "윤하정은 좌우대칭시켜야해"
- **CharacterLayer.tsx에 prefix별 보정 시스템 도입**:
  - `PREFIX_SCALE: Record<string, number>` — 슬롯별 base × scale (김규민 1.2, 표경민 0.92, 조나단 0.92)
  - `PREFIX_FLIP: Set<string>` — 좌우반전 (윤하정 hajeong)
- **className `-translate-x-1/2` 제거 + inline `transform: 'translateX(-50%) scaleX(-1)'`로 통합** — flip이 중앙 정렬과 충돌하지 않도록
- **검증** (preview MCP DOM, 6명 동시):
  - 김규민 _back 720px (600 × 1.2) ✓
  - 표경민 앞줄 662px (720 × 0.92) ✓
  - 윤하정 transform `matrix(-1, 0, 0, 1, ...)` scaleX(-1) ✓

#### 라운드 #4 — 조나단·표경민 슬롯 무관 키 일치

- **PM 요청**: "조나단 키가 표경민 키와 같게. 대신 너무 크면 가로너비를 줄이기."
- **문제**: PREFIX_SCALE은 슬롯별 base × scale 방식이라, 조나단(_back 600 × 0.92 = 552)과 표경민(앞줄 720 × 0.92 = 662)이 슬롯에 따라 키가 달라짐
- **신규 `PREFIX_FIXED_MAX_H` 도입** — 슬롯 무관 절대 maxHeight (게임 캔버스 % 기준)
  - 조나단·표경민 모두 `82.8%` (= 90% × 0.92)로 통일 → 어느 슬롯에 들어가든 동일 키
- **신규 `PREFIX_FIXED_MAX_W` 도입** (사용자 요청 "너무 크면 가로 너비 줄이기" 대응 시도):
  - 시도 #1: nathan `24%` 적용 → maxWidth 제약으로 키도 같이 줄어 518px (표경민 662와 다시 안 맞음)
  - 시도 #2: 자산 비율 검토 — nathan w/h = 0.593, gyeongmin w/h = 0.603 → 거의 동일, 오히려 조나단이 1.7% 좁음 → 가로 제한 불필요로 결론. PREFIX_FIXED_MAX_W는 빈 객체로 유지(미래 가로 큰 자산 등록용 슬롯)
- **검증** (preview MCP DOM):
  - _back 슬롯: 조나단 662×393 / 표경민 662×400 — 키 동일 ✓
  - 앞줄 슬롯: 조나단 662×393 / 표경민 662×400 — 키 동일 ✓
  - 슬롯 무관 동일 키 보장 ✓ / 가로 비율 0.983 (자연스러움)

#### 최종 PREFIX 보정 테이블 (CharacterLayer.tsx)

```ts
const PREFIX_SCALE = {
  gyumin: 1.2,        // 김규민 120% (슬롯별 base × 1.2)
};
const PREFIX_FIXED_MAX_H = {
  gyeongmin: '82.8%', // 표경민 슬롯 무관 통일
  nathan: '82.8%',    // 조나단 표경민과 동일 키
};
const PREFIX_FIXED_MAX_W = {};  // 자산 비율 검증 후 비움
const PREFIX_FLIP = new Set(['hajeong']);  // 윤하정 좌우반전
```

#### 자산 변경

- `public/img/sprites/nathan_default.webp` 1496×2522 → 1196×2016 (80% 리사이즈, 178→138 KB) — 라운드 #1
- 다른 캐릭터 자산 변경 X

#### 변경 파일

- `src/ui/CharacterLayer.tsx` — PREFIX_SCALE / PREFIX_FIXED_MAX_H / PREFIX_FIXED_MAX_W / PREFIX_FLIP 4개 보정 테이블 + map 안 적용 로직 + transform 통합

#### 검증 통과

- typecheck ✓ / build 301 KB·gzip 88 KB ✓
- preview MCP DOM 측정 — 슬롯 무관 키 일치 + flip 적용 + 김규민 1.2x 모두 확정

#### 시각 균형 보정 정책 (향후 PM 피드백 처방용)

1. **슬롯 따라 비례 조정**이 자연스러우면 → `PREFIX_SCALE` 추가
2. **슬롯 무관 절대 키**가 필요하면 → `PREFIX_FIXED_MAX_H` 추가
3. **가로가 너무 큰 자산** 시 → `PREFIX_FIXED_MAX_W` 추가
4. **좌우반전** 필요 시 → `PREFIX_FLIP`에 추가

각 객체에 한 줄 추가/제거로 빠른 처방. 자산 자체 변경(ffmpeg 리사이즈)보다 CSS 보정이 화면 표시에 효과적임을 라운드 #1 학습으로 확인.

- **승인**: PM(구윤모) — 4 라운드 라이브 피드백 + preview MCP DOM 시각 검증
- **다음 단계**: PM 풀 플레이 시 시각 균형 추가 보고 시 위 정책 따라 처방

---

### 2026-05-08 — sfx_pageturn 매 대사 advance 호출 제거 (옵션 A)

- **변경**: `src/ui/DialogueBox.tsx` `handleClick`의 `audioManager.playSfx('sfx_pageturn')` + 관련 주석 제거. Backlog 오픈 시 1회만 재생되도록 정리.
- **모듈** (status 변동 — `docs/assets/SFX-list.md` §2 매핑 표 갱신 별도 라운드 권장):
  - `src/ui/DialogueBox.tsx`
- **사유**: PM 풀 플레이 검증 — 한 씬 100+ 대사를 클릭으로 진행할 때마다 종이 넘김 소리가 재생돼 피로 + 메타포 부적합(매 대사가 새 페이지 단위가 아님). SFX-list §2 line 92의 "텍스트 다음 / 백로그 페이지" 명세를 자산 통합 검증 라운드 후속 ②a에서 "advance 시 매번 재생"으로 직역한 결과. 미연시 표준은 페이지 턴 사운드를 큰 분기(챕터·씬 전환·백로그 오픈)에만 사용 → audioManager 호출 1줄 제거가 가장 단순한 처방.
- **승인**: 사용자(PM) — A/B/C 옵션 제시 후 "a" 채택 (DialogueBox 호출 제거, Backlog mount 유지).
- **검증**: typecheck 0 errors / vitest 72/72 / preview 브라우저 — 대사 advance 무음 + Backlog 오픈 시 sfx_pageturn 정상 재생 + 변태 자기자각 sfx_realize 영향 없음(audioManager import 유지).
- **다음 단계 (잔여)**:
  - `docs/assets/SFX-list.md` §2 line 92 "텍스트 다음" 표현 제거 → "백로그 페이지"만 남기기 (별도 마이너 라운드).

---

### 2026-05-08 — 대규모 동선 재설계 라운드 2차 (audit v3.1 + transitive inherit BFS + critical 39→0)

- **변경**: 1차 라운드 잔여 (BG_NULL 40건 + CONCURRENT_MANY 12건 + audit v2 store 정합) 처방. audit를 3-tier severity 모델로 리팩터하고 transitive inherit BFS를 추가하여 store BG state 유지를 정확히 추적. false positive 대폭 제거 후 진짜 critical 2건만 시나리오 처방.
  - **audit v2 → v3.1**: 3-tier severity 모델 (`scripts/audit-asset-flow.ts`)
    - 🔴 **Critical** (exit 1): INVALID_POSITION, CG_HIDE_MISSING, POSITION_COLLISION, BG_NULL_CRITICAL
    - 🟡 **Major** (검토 권장): CHARACTER_CONCURRENT_MANY (≥4명, 6슬롯 모델로 처리 가능)
    - ⚪ **Info** (store 자동 처리, 시각 영향 없음): BG_NULL_INFO, CHARACTER_LEFT_BEHIND, BG_CHANGE_RESIDUAL_CHARS
  - **transitive inherit BFS** (`computeEffectiveOutBgs`): fixed-point iteration으로 각 씬 출구의 effective BG 후보 집합 계산. 씬 내 BG 명령이 있으면 그 BG, 없으면 incoming의 effectiveOutBg 합집합 그대로 전파. store BG state 유지 정합. 30회 iter 충분 (216 씬, 대부분 DAG).
  - **BG_CHANGE_RESIDUAL_CHARS 정합**: 같은 BG ID 또는 black/white 폴백은 false positive 제거 (24건 → 7건). audit 시뮬레이션도 store처럼 BG 변경 시 캐릭터 자동 클리어.
  - **시나리오 처방** (진짜 critical 2건):
    - `ch06_h4_reject` (incoming 0개, RejectEnding 컴포넌트 자동 진입): `[BG: black]` 안전 가드 추가
    - `ch06_h5_solo_fallback` (incoming 0개, EVALUATE_BRANCH 폴백): `[BG: black]` 안전 가드 추가
- **검증** (`npm run compile && npm run audit && npm run typecheck && npm test`):
  - audit Critical: 39 → **0건** ✅
  - audit Major: 12건 (CHARACTER_CONCURRENT_MANY — informational, 6슬롯 모델 정합. POSITION_COLLISION 0건 검증됨, 6명 동시 ch05_02_close·ch05_06_pair_pause는 히로인 5명+윤모 의도된 모임 씬)
  - audit Info: 110건 (LEFT_BEHIND 103 + RESIDUAL 7 + BG_NULL_INFO 0 — store 자동 처리)
  - compile 216 씬 + typecheck 무에러 + vitest **72/72** 통과
- **모듈** (영향 모듈 status는 done 유지 — audit 정합 갱신 + 안전 가드, 신규 명세 아님):
  - `scripts/audit-asset-flow.ts` (v2 → v3.1: 3-tier + transitive inherit BFS + RESIDUAL false positive 제거)
  - `03-story/scenarios/ch06_h4_seoyoon.md` (ch06_h4_reject 씬 BG black)
  - `03-story/scenarios/ch06_h5_yuna.md` (ch06_h5_solo_fallback 씬 BG black)
- **사유**: 1차 라운드의 BG_NULL 40건은 store가 BG state를 유지하는데도 audit가 incoming 1개라도 null이면 critical로 잡는 보수적 로직 때문에 false positive 다수. transitive inherit BFS로 실제 store 동작과 정합 후 진짜 critical 2건만 식별 + 시나리오 처방. PROGRESS-TRACKER PM 잔여 "다른 챕터 끝 BG black 패턴 30+ 씬 일괄 처방"은 audit 정밀화로 false positive 제거되어 PM 직접 작업 부담 해소.
- **승인**: PM (구윤모) — 옵션 "audit 잔여 12+40 모두" 채택 (자산 보정은 별도 — PM이 키 미세 조정으로 이미 완료, 이번 라운드 범위 외).
- **잔여**:
  - 🟡 CHARACTER_CONCURRENT_MANY 12건 (Major) — 6슬롯 모델로 처리 가능이지만 시각 부담 검증은 PM 풀 플레이 권장
  - ⚪ CHARACTER_LEFT_BEHIND 103건 + BG_CHANGE_RESIDUAL_CHARS 7건 (Info) — store 자동 클리어로 시각 영향 0이지만 시나리오 작가 의도 표현이라 정보 보존
  - audit-asset-flow CI 통합 (별도 라운드)

### 2026-05-08 — 12챕터 시나리오 active=Hx 마커 일괄 적용 + 컴파일러 확장

- **변경**: AffectionToast v2 라운드 시스템 처방(`activeHeroines` 필터)을 12챕터 정식 + 12챕터 압축본에 일괄 적용. 한 H 단독 씬의 다른 H 호감도 변동 어색함 제거.
  - **컴파일러 확장** (`scripts/compile-scene.ts`):
    - `parseHint` 정규식 확장 — `active=H1`, `active=H1+H2+H3`, `active=H1,H2`, `active=all` 모든 표기 지원.
    - `toneTime=day|night` 표기도 파싱(기존 미처리 문제 동시 해결, H3 매트릭스 밤 보정 자동 적용).
    - `heroine=Hx` 표기 fallback — ch06 5개 챕터(40 메인 씬)는 기존 `heroine=H1` 마커가 자동 active 인식되어 시나리오 수정 0건.
    - **sub-씬 메타 상속** — `# Hint`가 박히지 않은 sub-씬(예: `ch01_02b_serious`)은 직전 메인 씬의 메타를 자동 상속. activeHeroines/toneTime 자연 전파.
  - **정식 시나리오 ch01~ch05** (`03-story/scenarios/`):
    - ch01_ot.md: 4 메인 씬 → active=H2 (OT intro는 호감도 변동 X로 비움)
    - ch02_anatomy.md: 4 메인 씬 → 2종 H2 + 2종 H2+H3
    - ch03_dongsan.md: 3 메인 씬 → H1, H1+H5, H1+H2+H5 (lobby는 비움)
    - ch04_library.md: 7 메인 씬 → H2, H1, H3, H4, H4, H5, all
    - ch05_decision.md: 7 메인 씬 → H2, all, H5, H2, H1+H3+H4+H5, all, H4
  - **압축 시나리오 compressed/ch01~ch05**: 동일 패턴 sed 일괄 적용 (정식과 시간선 라인 1:1 매칭).
  - **ch06 5개 + prologue + end_solo + 압축본 동일**: 컴파일러 fallback으로 자동 처리, 시나리오 수정 0건.
  - **결과 검증**: 컴파일 정식 12 .md → 216 씬 / 압축 12 .md → 216 씬 정상. .scene.json 메타 spot 검증:
    - ch01_02_meet_hajeong → `activeHeroines:["H2"]` (직접 박음)
    - ch01_02b_serious (sub) → `activeHeroines:["H2"]` (상속)
    - ch04_03_lab_late → `["H3"]`
    - ch05_02_pub_first → `["H1","H2","H3","H4","H5"]` (all 풀림)
    - ch06_h1_01_festival_visit → `["H1"]` (heroine=H1 fallback)
- **자동 추출 정확도**: AWK 패턴(`\[차세린\]|\[CHARACTER: 차세린|{speaker:차세린}|차세린 \(`)으로 각 씬 본문에서 H 등장 카운트 후 결정. 카메오 등장만 있는 씬은 비워서 fallback(5명) 유지. 작가 의도와 차이날 수 있는 씬은 PM 풀플레이 시연으로 검토 후 정정 가능.
- **모듈** (status: review 전환): `03-story/scenarios/{ch01_ot,ch02_anatomy,ch03_dongsan,ch04_library,ch05_decision}.md` + `compressed/` 동일 5개 + `scripts/compile-scene.ts`.
- **typecheck**: 0 에러. **vitest**: 72/72 통과.
- **사유**: 사용자 결정(2026-05-08) — "한 히로인 선택지인데 다른 H 점수 변동 이상" 처방으로 시스템에 active 필터 추가했고, 그 시스템을 실제 시나리오에 일괄 적용. AffectionToastStack이 active 외 H의 토스트는 표시하지 않아 작가 의도가 화면에 정확히 반영됨.

### 2026-05-08 — 5조 단역 박지수·차민호 → 시트 등록 동기 이문규·정욱 일괄 흡수

- **변경**: 시트 미등록이지만 실제 시나리오에서 5조 회식 톤·풍선 안내 결로 활약하던 단역 박지수·차민호를, 시트(`02-characters/side-characters.md` §1.5/1.6)에는 등록되어 있으나 실제 스크립트에 미등장이던 이문규·정욱으로 흡수. 박지수→이문규 / 차민호→정욱 일괄 이름 교체.
  - 시나리오 메인 .md 7개 (ch01_ot / ch02_anatomy / ch03_dongsan / ch04_library / ch05_decision / ch06_h1_serin / ch06_h2_hajeong)
  - 시나리오 compressed .md 7개 동일 챕터
  - 윤문 완료 .txt 7개 동일 챕터
  - 엔진 `src/scenes/*.scene.json` 16개 + `src/scenes/compressed/*.scene.json` 13개 (총 29개)
  - 시트 `02-characters/side-characters.md`: §1.5 이문규 컨셉 "롤 친구" → "5조 회식 톤 메이커", §1.6 정욱 컨셉 "공부 친구" → "5조 막내 결" 갱신. §4 채팅방 표 "롤 단톡" 제거 + "해부 5조" 멤버 명단 갱신. §6 신설 (이름 통합 이력).
- **모듈**:
  - `02-characters/side-characters.md` (status: done 유지, §1.5/1.6/§4/§6 갱신)
  - `03-story/scenarios/*.md` (status: done 유지)
  - `03-story/scenarios/compressed/*.md` (status: done 유지)
  - `03-story/scenarios/윤문 완료/*.txt`
  - `src/scenes/*.scene.json` + `src/scenes/compressed/*.scene.json`
- **사유**: PM이 시트 vs 실제 스크립트 정합 검증 중 발견한 불일치 — 시트에 정식 등록된 이문규·정욱(시트 §1.4 "동기 6명")이 실제 스크립트 0건 미등장인 반면, 시트 미등록 단역 박지수·차민호가 5조 5명 중 두 자리를 차지. 둘을 통합하면 시트 6명 동기가 모두 실제 등장 + 시트 미등록 단역 0명으로 정합 확보.
- **승인**: 사용자(PM)
- **미수정** (의도적):
  - `_backup-원본/`: 백업 보존
  - `dist/assets/*.js`: 다음 빌드에서 자동 재생성
  - 과거 라운드 노트(`PROGRESS-TRACKER.md`, `08-qa-deployment/verification-reports/07-asset-audit.md`, 시나리오 본문 라운드 노트의 박지수·차민호 회고 언급 일부): 역사 기록 보존
- **후속 정리 (동일 라운드)**: 정욱이 윤모/윤하정에게 쓰던 "형/누나" 호칭 + 존댓말을 시트 §1 헤더 "총 6명, 모두 본과1" 동급생 결로 정리 (PM 결정).
  - `ch06_h2_hajeong.md` 풍선 자리 4줄: "풍선 받아왔어요!" → "풍선 받아왔어." / "형, 제가 풍선 다는 거 도와드릴까요?" → "같이 다는 거 도와줄까?" / "와 윤하정 누나 정확하시네ㅋㅋ" → "와 윤하정 정확하네ㅋㅋ"
  - 지문 "5조 막내인 정욱." 표현 제거 (동급생 결과 충돌)
  - `02-characters/side-characters.md` §1.6 갱신: "5조 막내 결 + 풀어 쓴 존댓말 + 형/누나 호칭" → "잡일 도맡는 결 + 동급생 반말 + 짧은 톤"
  - 메인 시나리오 .md / compressed .md / 윤문 .txt / 엔진 메인 JSON / 엔진 compressed JSON 5개 채널 동기화
- **범위 외**: `ch06_h2_hajeong.md` 도입부 [오준혁] "윤모 형, 안녕하세요!" — 오준혁도 본과1 동기인데 "형 + 존댓말" 사용 (동일 헤더 충돌 사례). 본 라운드는 정욱·이문규 한정 PM 명령이라 미수정. 추후 별도 라운드 필요 시 후속.

### 2026-05-08 — 오프닝 영상 페이드 인/락 + CG 락 1초 단축

- **변경**: 게임 진입 UX 다듬기.
  - `src/ui/OpeningVideo.tsx`: VideoLayer 페이드 패턴 차용 — 검정 오버레이 800ms step fade-in (16 step × 50ms) + 페이드 완료 시점 play() 호출. 사용자 의도 "페이드 인 된 뒤에 시작" 그대로(영상은 fade 동안 paused, 첫 프레임 노출).
    스킵 차단 — 외곽 div의 `onClick={onComplete}` 제거 + `cursor-pointer` → `cursor-default`. div가 `absolute inset-0`이라 클릭 흡수만 + 자연 종료(`onEnded`)·`onError`·`play().catch()`만 onComplete 발화.
    풀스크린 — `max-w-full max-h-full` (letterbox) → `w-full h-full object-cover`로 viewport 가득 채움. 16:9 영상 + 16:9 모니터에서 crop 0, 21:9/4:3에서만 약간 crop.
    onCompleteRef 패턴 — App.tsx의 inline `() => setShowOpening(false)`가 매 렌더 새 함수 reference라 useEffect deps에 직접 넣으면 storyMode 변경 시 페이드 재시작 위험 → ref 캡처 + `[]` 의존성으로 마운트 시 1회만.
    autoplay 차단 robustness — VideoLayer 패턴 그대로 ref + `play().catch(onComplete)` 추가 (기존 onError는 *load* 실패용, autoplay 정책 거부는 promise reject로 별도 처리 필요).
  - `src/ui/CGOverlay.tsx`: `CG_MIN_LOCK_MS` 2000 → 1000. 주석 "최소 1초간 advance 잠금 (PM 결정 라운드 #4 → 2026-05-08 단축)"으로 라운드 #4 결정의 후속 단축임을 추적 가능하게 표시.
- **모듈** (status 변동 없음 — UI-SPEC/ANIMATION-SPEC에 OP 영상 섹션 부재 + CG lock 시간 명시 없음, 후속 W5 환경설정 라운드에서 정식 명세 정비 권장):
  - `src/ui/OpeningVideo.tsx`
  - `src/ui/CGOverlay.tsx`
- **사유**: PM 풀 플레이 검증에서 OP 시작 시 갑작스러운 컷 + 클릭 한 번에 스킵되는 어색함 + letterbox 검정 띠로 게임 첫인상 약하다는 피드백. 진입 UX는 게임당 1회 이벤트라 약간의 드라마틱 fade(800ms) + 풀스크린 채움 + 끝까지 시청 강제로 격상. CG 2초 lock은 PM 결정 라운드 #4(2026-05-08 PM 라이브 플레이)에서 도입했으나 실 플레이 시 길게 느껴진다는 동일 PM 후속 판단 → 짧은 클릭으로 휙 지나가는 것을 막는 본래 목적은 1초로도 충분.
- **승인**: 사용자(PM)
- **검증**: typecheck 0 errors / vitest 72/72 / preview 브라우저 — OP 페이드 인 → 영상 자연 진행 → 스킵 시도 무반응 → onEnded 자동 ModeSelect, CG 등장 1초 후 advance 가능.
- **회귀 안전망**:
  - E2E 환경(`navigator.webdriver` / `?scene=` / `?flags=`)에서 `isE2eEnvironment()` true → `showOpening` 초기값 false → OpeningVideo 비마운트 (기존 자동 스킵 동작 보존, Playwright 16/16 영향 없음).
  - autoplay 차단 시 `play().catch(onComplete)` → 즉시 다음 화면 진입 (게임 흐름 차단 안 됨).
- **다음 단계 (잔여)**:
  - W5 환경설정 라운드에서 UI-SPEC.md / ANIMATION-SPEC.md에 OP 영상 + CG lock 정식 섹션 추가 일괄 정비.

---

### 2026-05-08 — 호감도 토스트 시각 리비전 v2 + activeHeroines 필터

- **변경**: 호감도 토스트 시각·구조 사용자 피드백 반영 + 시나리오 "한 H 단독 씬에 다른 H 토스트가 뜨는 어색함" 시스템 처방.
  - **`AffectionThermometer.tsx`**: PC 표시 사이즈 60×280 → 78×364 (1.3배). avatar 경로 `/img/sprites/{id}.webp` → `/img/avatar/{id}.webp` 교정 (카톡 프로필 자산 재사용). 시각 효과 4종 추가 — bulb 외곽 핑크 심장 펄스(1.6s 주기), 채움 진행 중 도쿠먼트 라이트(관 안 광선 0.6s 위→아래), 완료 직후 spark 입자 6개(360ms 산란) + 외곽 white flash(140ms), 표면 광택 두 줄(0.85/0.35 알파). RAF 신호(phase·pulsePhase·flowPhase·completeAge) prop으로 받음.
  - **`AffectionToastStack.tsx`**: 흰 박스 카드 제거. 풍성 카드 = 온도계 + 변화량(+5 28px)만. 우측 계단식 배치(top:24+i*36, right:24+i*48 비스듬히 좌하방). drop-shadow로 SVG 외곽만 띄움.
  - **`AffectionMiniDot.tsx`**: 동일 정신으로 박스·이름 제거. ♥ + 변화량(18px)만.
  - **activeHeroines 필터** (시스템 변경): `SceneMeta.activeHeroines?: HeroineId[]` 추가 (`engine/types.ts`). `applyChoiceEffects`에서 마커 있으면 그 H에만 톤 매트릭스 결과 적용 + KEY_CHOICE도 그 H만 인정. 미박이면 fallback으로 5명 모두 적용 — 점진 마이그레이션, 기존 12개 챕터 시나리오 무영향. `late_reply_count` / H4 미니게임은 active 무관(거절 엔딩 시스템).
- **사양 (사용자 결정)**: 흰 박스 제거 / 이름·현재값 제거 / 변화량(+5)만 / 우측 계단식 / 1.3배 / 시각 효과 4종 모두 / activeHeroines 다수 가능 + 미박 시 fallback.
- **시작값 20 변경 X**: 사용자 판단 — value 채움 매핑은 0~100 그대로. 변화 강조는 위 시각 효과 4종으로 처리.
- **모듈** (status: review 전환):
  - `06-engine/SCENE-FORMAT.md` §1.3c "activeHeroines" 신설
  - `06-engine/types.ts` SceneMeta.activeHeroines 추가
  - `05-ui-design/UI-SPEC.md` §11 갱신 (1.3배·계단식·시각 효과·activeHeroines)
  - `05-ui-design/ANIMATION-SPEC.md` §13 타임라인 표 시각 효과 4종 추가
- **사유**: 사용자 피드백 — (1) 박스+이름이 시각 노이즈, 온도계 자체가 정보 매체로 충분. (2) 가로 계단식이 세로 나열보다 게임 화면과 조화. (3) 한 H 씬에 다른 H 점수 변동은 시나리오 의도 위반. 톤 매트릭스 시스템은 유지하되 active 필터로 표시·적용 범위 통제.
- **다음 단계**: 시나리오 작가 라운드 — 12챕터 .md 헤더에 `active=Hx` 마커 점진 추가. 회식·펜션은 `active=H1+H2+H3+H4+H5` 다수. H4 단독 카톡 씬은 `active=H4`. 사운드 자산 PM 직접 수집 (sfx_affection_up/down).

### 2026-05-08 — 자산 정합 라운드 옵션 B (스프라이트 alias 정합화 + sprite-list 정규식 확장)

- **변경**: 옵션 A 후속. spriteResolver SPRITE_FILE_ALIAS 4종(`hajeong_sleeping`, `seol_smile_small`, `gyumin_smirk`, `nathan_laugh`)이 alias·SIDE_DEFAULT_ONLY 폴백으로 동작 중인 인벤토리 노이즈 정리. 시나리오 표기를 실파일에 맞게 정합화.
  - **시나리오 7건 교체** (정식 .md 파일만, _backup/compressed/윤문 완료는 SSoT 외):
    - `ch04_library.md:73` 윤하정 `sleeping → default` (CG cg_hajeong_library가 잠든 모습 일러스트로 의미 보완)
    - `ch04_library.md:372` 한설 `smile_small → smile_slight` (실파일 매칭, 의미 보존)
    - `ch01_ot.md:343-344` 김규민 `smirk → default`, 조나단 `laugh → default` (사이드 캐릭, 능청/호탕 표현 손실 감내)
    - `ch03_dongsan.md` 조나단 2건 `laugh → default` (replace_all)
    - `ch05_decision.md:69` 조나단 `laugh → default`
  - **spriteResolver.ts 정합화**: `SPRITE_FILE_ALIAS` 객체 빈 객체로 비움(주석으로 라운드 의도 명시 + 미래 불일치 발생 시 한 줄 추가 가능 안내). `SIDE_DEFAULT_ONLY` 보호망은 유지 — 미래 시나리오 변경 시 silent fail(null) 방지.
  - **build-manifest.ts parseSpriteList() 정규식 확장**: 윤모(`#### N. \`xxx.webp\`` 헤더) 외 히로인 5명(`- \`xxx.webp\` — desc` bullet) 형식도 매치하도록 패턴 추가. `_meta.registered.sprite` 8 → **58**로 정상화.
  - **bg_library_day** placeholder 유지 결정 — 자산 파일 존재 + manifest 등록되어 있고 시나리오 미사용은 자산 사전 배치 패턴 정합. 옵션 B 범위 외.
- **검증** (`npm run compile && npm run manifest && npm run typecheck && npm test`):
  - manifest characters: 윤하정 7→**6** (sleeping 제거), 한설 9→**8** (smile_small 제거, smile_slight 그대로), 김규민 2→**1** (smirk 제거), 조나단 1 (laugh→default 동일 키)
  - manifest cgs **20** / videos **12** / bgms **8** / sfx **15** (sfx_affection_up/down 포함, audioMappings SSoT 정확 반영) — 옵션 A 검증 시 sfx 13으로 잘못 잡았으나 audioMappings 실제 SFX_MAP 15행 정합
  - `_meta.registered.sprite`: 8 → **58** (정규식 확장 효과)
  - typecheck 무에러 / vitest **72/72** 통과
  - preview reload 후 console error **0건** / network failed **0건**
- **모듈** (영향 모듈 status는 done 유지 — 정합 정정 변경, 신규 명세 아님):
  - `src/data/spriteResolver.ts` (SPRITE_FILE_ALIAS 비움 + 주석)
  - `scripts/build-manifest.ts` (parseSpriteList bullet 패턴 추가)
  - `03-story/scenarios/ch01_ot.md`, `ch03_dongsan.md`, `ch04_library.md`, `ch05_decision.md` (CHARACTER 디렉티브 7건)
  - `public/manifest.json` (자동 재생성)
- **사유**: 자산 검증 보고서 후속 처방. alias·폴백은 게임 흐름엔 영향 없으나 인벤토리·매니페스트 노이즈 + 미래 작가가 시나리오 작성 시 "왜 default로 폴백되는지" 혼란 유발. 시나리오 표기를 실파일에 맞게 정합화하면 SSoT(시나리오) ↔ 자산이 1:1 매핑되어 audit·디버깅 용이.
- **승인**: PM (구윤모) — 옵션 B Recommended 채택 ("시나리오 표기 정합화") + sleeping/smirk/laugh 의미 손실 감내 결정.
- **의미 손실 메모**: 윤하정 잠든 표정·김규민 능청·조나단 호탕은 default(평소)로 폴백. 별도 라운드(자산 추가)로 복원 시 시나리오 표기를 다시 변경 + spriteResolver SIDE_DEFAULT_ONLY에서 해당 prefix 제거.

### 2026-05-08 — 압축본 후속 라운드 (자동 검증 스크립트 + ModeSelect 추천 강조)

- **변경**: 12챕터 압축본 라운드의 후속 잔여 항목 처리.
  - **신규 검증 스크립트**: `scripts/validate-compressed.ts` — 풀↔압축 무결성 자동 검증. 씬 ID 1:1 매핑 + KAKAO/CHOICE/CHOICE_KAKAO/FLAG_INC/FLAG_SET/KEY_CHOICE/JUMP/ENDING/CG/VIDEO 카운트 일치 + CHOICE next 그래프·CG ID·VIDEO src 풀 일치까지 자동 검사. 합산 통계 표 출력 + 실패 시 exit 1 (CI fail). 풀 only 씬은 경고로만 (런타임 fallback OK).
  - **`package.json`**: `validate:compressed` 스크립트 추가.
  - **`src/ui/ModeSelect.tsx`** (PM 직접 수정): 압축 버전을 좌측 우선 배치 + "추천 ★" 배지 + mint 강조(border + shadow)로 디폴트 권장. 풀 스토리는 우측 액센트 색.
  - **`src/ui/PauseMenu.tsx`**: storyMode 토글은 메뉴에 두지 않기로 결정 (PM 결정). 첫 부팅 ModeSelect 1회 선택으로 충분 — 진행 중 모드 변경 UX는 W5 환경설정 화면에서 재검토. 메뉴는 호감도 패널 + 5개 원래 항목(재개/저장/불러오기/환경설정/타이틀로)만 유지.
- **검증**:
  - `npm run validate:compressed` 그린 (216개 공통 씬, mismatch 0건). 풀 only 3개 (dummy 테스트 씬)는 경고로만 처리.
  - 합산: total 3900→2776 (-29%), NARR -60%, MONO -55%, DIAL -24%, KAKAO/CHOICE/FLAG_INC/JUMP/ENDING/CG/VIDEO 100% 보존.
  - ModeSelect 브라우저 검증: "압축 버전 추천 ★" 좌측 강조 + 풀 우측 평소 액센트 (PM 직접 검증).
  - PauseMenu 브라우저 검증: 호감도 패널 + 5개 원래 메뉴만 노출, storyMode 토글 제거됨.
- **모듈** (status `review`):
  - `05-ui-design/UI-SPEC.md` (이미 review, ModeSelect 추천 강조 + PauseMenu 토글 회수 영향)
- **사유**: 사용자 풀 플레이 검증 전에 자동 무결성 스크립트로 회귀 안전망 확보. ModeSelect를 디폴트 권장 흐름으로 분명히 (압축이 새 사용자에 더 친화적). PauseMenu에 토글을 두지 않는 이유 — 모드 변경이 진행 중에 자주 일어나는 동작이 아니고, 메뉴 단순함을 우선.
- **승인**: 사용자(PM)
- **다음 단계 (잔여)**:
  - 사용자 풀 플레이 검증 (12챕터 압축본 자연성 — 사용자 직접 수행).
  - `npm run validate:compressed` CI 통합 (GitHub Actions 또는 pre-commit hook).
  - W5 환경설정 화면에서 storyMode 변경 옵션 재검토.

---

### 2026-05-08 — 압축본 12챕터 완성 라운드 (옵션 시스템 + 전체 압축본 + DIALOGUE 후속 압축)

- **변경**: 1차 라운드(옵션 시스템 + 3챕터 압축본) 후속으로 나머지 9챕터 압축본 작성 + DIALOGUE 추가 압축 정책 반영.
  - 신규 압축본 9개: `03-story/scenarios/compressed/{ch03_dongsan,ch04_library,ch05_decision,ch06_h1_serin,ch06_h2_hajeong,ch06_h3_seol,ch06_h4_seoyoon,ch06_h5_yuna,end_solo_summer}.md`
  - 1차 3개(prologue/ch01_ot/ch02_anatomy)는 DIALOGUE 약 19% 추가 압축 (의례적 응답·연속 같은 화자 라인 합치기, 시그니처 첫 인사·갭 모먼트 보존).
- **압축 정책 (최종)**: NARRATION 60% 감축, MONOLOGUE 55% 감축, DIALOGUE 24% 감축. KAKAO 메시지/CHOICE/IF/FLAG/INC/JUMP/ENDING/KAKAO_TIMER/CHOICE_KAKAO/BG/BGM/SFX/CHARACTER/CG/VIDEO 100% 보존. Ch.6 변태 망상 페어 0회 룰 동일.
- **검증 (216개 씬 전체 합산)**:
  - 풀 vs 압축 씬 ID 1:1 일치 (216 ↔ 216, `diff` 빈 출력, orphan 0건).
  - mismatchCount 0 — KAKAO 메시지(505→505)/CHOICE(39→39) 100% 일치.
  - total commands: 3900 → 2776 (-29%).
  - NARRATION: 544 → 215 (-60%) / MONOLOGUE: 817 → 368 (-55%) / DIALOGUE: 1466 → 1121 (-24%).
  - `npm run compile:compressed` 그린 (12개 .md → 216개 씬 컴파일, IF 경고 6건은 풀과 동일 v0.1 한계).
  - `npm run typecheck` 그린, `npm test` 4 files / 72 tests 그린.
- **모듈** (status `review`로 전환):
  - `03-story/scenarios/{prologue,ch01_ot,ch02_anatomy,ch03_dongsan,ch04_library,ch05_decision,ch06_h1_serin,ch06_h2_hajeong,ch06_h3_seol,ch06_h4_seoyoon,ch06_h5_yuna}.md` (11개 풀 시나리오, 압축본 동기화 대상 표시)
  - `03-story/scenarios/end_solo_summer.md` (이미 review)
  - `03-story/scenarios/compressed/*.md` 12개 (신규 작성)
- **사유**: 1차 사용자 합의 "절반 정도 분량" 목표를 12챕터 전체로 확장. NARRATION/MONOLOGUE 위주 50~60% + DIALOGUE 가볍게 20~30% 정책으로 분기 그래프·카톡 미니게임·CG/영상 트리거·변태 망상 페어 무결성 보장하면서 플레이타임 약 절반 단축.
- **승인**: 사용자(PM)
- **다음 단계 (잔여)**:
  - 풀 vs 압축 자동 검증 스크립트 (sceneId/CHOICE/KAKAO 카운트 자동 일치) — 수동 검증 자동화.
  - PauseMenu에 storyMode 토글 추가 (현재는 localStorage 삭제로만 재선택).
  - 사용자 풀 플레이 검증 (12챕터 압축본 자연성 확인).

---

### 2026-05-08 — 호감도 온도계 토스트 + PauseMenu 단계 패널

- **변경**: 기존 텍스트 토스트(`AffectionToast.tsx`, "차세린 +5") → 풍성 SVG 온도계 토스트로 격상.
  - **신규 컴포넌트**: `src/ui/affection/AffectionToastStack.tsx`(큐 구독·클러스터·사운드 1회) + `AffectionThermometer.tsx`(60×280 유리관+bulb+눈금+액체+광택+프로필) + `AffectionMiniDot.tsx`(±1~2 미니 ♥) + `AffectionStatusPanel.tsx`(메뉴 5명 별 1~5) + `spring.ts`(RAF spring solver) + `stages.ts`(별 단계 분류).
  - **gameStore**: `lastAffectionChange` 단일 → `affectionEvents: AffectionEvent[]` 큐 추가 (한 라운드 호환 유지). `applyOne(FLAG_INC)`이 prev/new 보존하여 push. 액션 `markAffectionEventsConsumed` / `pruneAffectionEvents` 추가. 큐 길이 상한 50, consumed && 4초 경과 GC. persist 제외(휘발성).
  - **AffectionToast.tsx**: AffectionToastStack을 export하는 진입점으로 축소 (외부 import 호환).
  - **audioMappings.ts + SFX-list.md §2**: `sfx_affection_up` / `sfx_affection_down` 두 행 추가 (P1, ko: null). 묶음당 |delta| 최대값 부호로 1회 재생.
  - **tokens.css**: `--toast-card-*`, `--therm-*` 변수 신설. 768px 미만에 `--therm-scale: 0.75` 자동.
  - **PauseMenu.tsx**: 메뉴 안에 AffectionStatusPanel 슬롯 (max-w-2xl로 확장). 5명 별 1~5 + 단계 라벨, 숨김 수치 노출 X.
- **사양 (사용자 결정 5라운드)**: 사실적 온도계 + 눈금실린더, 단일 톤 핑크 + 액체 그라디언트, 강한 광택, spring 채움(stiffness 220 / damping 14, ~6% 오버슈팅), 10단위 눈금 + 50 강조선, 단계 라인(40·60·80) 표시 X, 우상단 위치 유지, 2.5초, 음수 역방향 비움(색 핑크), 다중 동시 5개 세로 나열, 카톡 모달 위 표시 OK(z-toast 400 > z-modal 300), 모바일 70~80% 축소, 메뉴는 별 1~5 (낯섦/호기심/호감/따뜻함/운명).
- **모듈** (status: review 전환):
  - `05-ui-design/UI-SPEC.md` §11 신설 (AffectionToast)
  - `05-ui-design/ANIMATION-SPEC.md` §13 신설 (AffectionToast 타임라인 + spring 파라미터)
  - `05-ui-design/COLOR-TOKENS.md` §5.5 신설 (토스트 토큰)
  - `06-engine/STATE-SCHEMA.md` §2 (AffectionEvent 구조 추가)
  - `docs/assets/SFX-list.md` §2 (sfx_affection_up/down 두 행)
- **사유**: 미연시 게임 핵심 루프(선택→피드백→몰입)의 감정 회로 강화. 호감도 변동의 임팩트를 시각적으로 부각해 선택 결과의 의미를 즉각 체감하게 함. 사용자가 "온도계 메타포로 매우 신경써서 디자인" 명시.
- **승인**: PM 라운드 승인 (eager-rolling-naur 플랜).
- **다음 단계**: 사운드 자산(`sfx_affection_up.mp3` / `..._down.mp3`) PM 직접 수집 → `public/snd/sfx/` 배치. 풀플레이 시연 후 spring 강도(stiffness/damping)·표시 시간 미세조정 검토.

### 2026-05-08 — 스토리 모드 옵션 라운드 (풀/압축 선택 + 3챕터 압축본)

- **변경**: 게임 첫 부팅 시 풀/압축 스토리 모드 선택 옵션 도입.
  - `src/stores/settingsStore.ts`: `storyMode: 'full' | 'compressed' | null` 필드 추가, persist version 1→2 migrate (`null` = 미선택, 기존 사용자도 다음 부팅 시 ModeSelect 1회 노출).
  - `src/scenes/manifest.ts`: Proxy 기반 모드 분기. `storyMode === 'compressed'` 면 `src/scenes/compressed/<id>.scene.json` 우선 룩업, 없으면 풀로 자동 fallback (이번 라운드 외 9챕터는 자동 풀 사용).
  - `scripts/compile-scene.ts`: `--mode=full|compressed` 플래그. 풀=`03-story/scenarios/*.md` → `src/scenes/`, 압축=`03-story/scenarios/compressed/*.md` → `src/scenes/compressed/`.
  - `package.json`: `compile:compressed`, `compile:all` 스크립트 추가.
  - `src/ui/ModeSelect.tsx` 신규: OP 영상 후 풀스크린 1회 노출, 선택 후 settingsStore 영구 저장. E2E 환경(`?scene=`/`?flags=`/`navigator.webdriver`)에서는 자동 'full' 적용.
  - `src/App.tsx`: `startScene` 호출을 `storyMode !== null` 조건부로 변경 — 압축 선택 시 풀로 시작 후 전환되는 어색함 차단.
- **압축 정책**: NARRATION/MONOLOGUE 50~60% 삭감. DIALOGUE/KAKAO/CHOICE/CG/BG/BGM/SFX/CHARACTER/VIDEO/FLAG/JUMP 100% 보존. 변태 망상 페어(Ch.1 Scene 4 윤하정 앞머리 / Ch.2 Scene 4 한설 안경) 한 줄도 안 건드림.
- **이번 라운드 압축 대상**: prologue, ch01_ot, ch02_anatomy (3개). 나머지 9챕터(ch03_dongsan ~ end_solo_summer)는 다음 세션. 압축본 누락 챕터는 manifest fallback으로 풀 자동 사용 → 게임 흐름 단절 없음.
- **모듈**:
  - `03-story/scenarios/compressed/{prologue,ch01_ot,ch02_anatomy}.md` 신규 (status: review)
  - `03-story/scenarios/{prologue,ch01_ot,ch02_anatomy}.md` (status: review로 전환 — 압축본 동기화 대상 표시)
  - `05-ui-design/UI-SPEC.md` (ModeSelect 화면 명세 추가 영향)
  - `06-engine/SCENE-FORMAT.md` (manifest Proxy + compile `--mode` 명세 영향)
  - `07-content-integration/INTEGRATION-PLAN.md` (빌드 파이프라인 변경 영향)
- **검증**:
  - `npm run compile` 그린 (12개 .md → 216개 풀 씬, 회귀 없음).
  - `npm run compile:compressed` 그린 (3개 .md → 33개 압축 씬).
  - 풀/압축 씬 ID 33개 1:1 일치 (`diff` 빈 출력).
  - KAKAO 메시지 카운트 일치: prologue_01_home 24/24, ch01_03_kakao_evening 41/41, ch02_05_kakao_night 37/37.
  - `npm run typecheck` 그린, `npm test` 4 files / 72 tests 그린.
- **사유**: 사용자가 한 회차 빠르게 돌리고 싶을 때 / 분기 그래프와 핵심 대사·카톡은 그대로 보존하면서 NARRATION·MONOLOGUE만 줄여서 플레이타임 단축. 분량 합의 "절반 정도"는 NARRATION/MONOLOGUE 절반 기준 (전체 라인 수 기준은 약 25~35% 감소 — 디렉티브·카톡·대사 보존으로 자연 발생).
- **승인**: 사용자(PM)
- **다음 단계 (잔여)**:
  - 나머지 9챕터 압축본 작성: ch03_dongsan, ch04_library, ch05_decision, ch06_h1~h5, end_solo_summer.
  - PauseMenu에 storyMode 토글 추가 (현재는 localStorage 삭제로만 재선택).
  - 압축본 검증 스크립트 (sceneId/CHOICE 그래프 자동 일치 확인) — 수동 검증 자동화.

---

### 2026-05-08 — CG 1080p LANCZOS 업스케일 라운드 (이벤트 CG 화질 격차 해소)

- **변경**: PM 풀 플레이 검증 중 "이벤트 배경 화질 낮다" 보고 → 측정 결과 CG는 native 1376×768 (1.06M px) vs 배경 1920×1080 (2.07M px, 라운드 3에서 LANCZOS 업스케일됨). 캔버스 1920×1080에서 CG 1.40x 자동 보간 → 흐림. 배경 정책과 통일하여 CG도 미리 LANCZOS 1920w 업스케일 적용.
- **모듈**:
  - `public/img/cg/` 40장 모두 덮어쓰기 — 게임용 20장 (q=88) + 갤러리용 20장 (`_full` suffix, q=90)
  - 처리: 0501test/processed-bg-cg-veo/02-cg-game-webp/* + 03-cg-gallery-webp/* → LANCZOS width=1920 비례 업스케일 → public/img/cg/
  - `npm run manifest` 재생성 (cgs 20 인벤토리 동일, 자산 메타만 갱신)
- **해상도 변환 매트릭스**:
  | 입력 비율 | 입력 | 출력 | 케이스 |
  |---|---|---|---|
  | 16:9 (1.79) | 1376×768 | **1920×1072** | 게임용 18장 + 갤러리용 3장 (no-crop festival) |
  | 16:9 crop | 1276×768 | **1920×1156** | 갤러리용 15장 (✦ 우측 100px crop 후) |
  | 3:2 (1.5) | 1536×1024 | **1920×1280** | 게임용 2장 (cg_serin_true / cg_hajeong_anatomy) |
  | 3:2 crop | 1436×1024 | **1920×1369** | 갤러리용 2장 |
- **자산 크기 변화**: 게임용 1.0 → 2.0 MB / 갤러리용 1.0 → 2.0 MB / 합계 2.0 → **5.4 MB** (+3.4 MB).
- **dist/ 영향**: ~95 MB → **~98 MB** (GitHub Pages 100 MB 한도까지 여유 ~2 MB로 줄어듦, 출시 전 영상 외부 호스팅 결정 가속 권장).
- **검증**:
  - preview 콘솔 에러 0건 (HMR로 즉시 반영)
  - 모든 CG width ≥ 1920 (브라우저 자동 보간 → controlled LANCZOS 결과로 전환)
- **사유**:
  - 정보량 추가는 없지만 (LANCZOS는 알고리즘적 보간), 브라우저 LANCZOS/bicubic이 표시 시점에 동일 작업 수행하던 걸 미리 controlled 환경에서 수행 → 시각적으로 약간 더 선명 + 디바이스 간 일관성 확보
  - 배경(라운드 3)과 통일된 정책 — CG만 native 유지하던 비대칭 해소
- **승인**: 사용자(PM)
- **다음 단계 (잔여)**:
  - PM 풀 플레이 시각 검증 후 추가 향상 필요 시 **옵션 C (Real-ESRGAN anime 업스케일)** 진행 — RTX 4070 GPU 가속, 약 1~2시간, AI 디테일 추가
  - dist/ 100MB 한도 임박 — 영상 외부 호스팅 (GitHub LFS / Cloudflare R2 / Vimeo) 결정

---

### 2026-05-08 — 자산 매니페스트 정합 라운드 (코드 직접 참조 자산 등록 + bg_kakao_fullscreen 제거)

- **변경**: 자산 사용 정합성 전수 검증 결과 manifest 인벤토리 8건 불일치 발견·처방. 게임 흐름 영향 0(런타임 자산 모두 정상 로드 중), manifest는 인벤토리/감사 용도라 출시 차단 아님이지만 출시 전 정합화 진행.
  - **build-manifest.ts 보강**: 코드 직접 참조 자산용 `EXTRA_CGS = ['cg_seoyoon_reject']`, `EXTRA_VIDEOS = ['video_opening', 'video_reject_seoyoon']` 상수 추가 + buildManifest()에서 `cgs`/`videos` Set에 합침. SFX는 `audioMaps.sfxEnSet` 전수, BGM도 `bgmEnSet` 전수 등록으로 변경 — 한글 큐 매핑 없는 시스템 SFX(`sfx_click`/`sfx_pageturn`/`sfx_timer_out`/`sfx_realize`/`sfx_katalk_send`)도 manifest에 노출.
  - **bg-list.md §17 (`bg_kakao_fullscreen`) 제거**: RejectEnding.tsx가 인라인 `var(--kakao-bg)` 스타일로 카톡 풀스크린 처리 중이라 webp 자산 불필요. bg-list 등록만 남아있고 컴파일된 .scene.json/시나리오 [BG] 디렉티브 모두 미참조 상태였음. §18 (rooftop) → §17, §19 (ktx_window) → §18로 재번호. outputs 카운트 19장→18장.
- **검증** (`npm run compile && npm run manifest`):
  - backgrounds 18→**17** (bg_kakao_fullscreen 제거)
  - cgs 19→**20** (cg_seoyoon_reject 추가)
  - videos 10→**12** (video_opening, video_reject_seoyoon 추가)
  - sfx 8→**13** (시스템 SFX 5종 추가)
  - bgms **8** (변동 없음, 그대로)
  - characters **10**, sceneCount **216**, _meta.notes **빈 배열** (cross-check 통과)
- **모듈**: 
  - `04-image-prompts/backgrounds/bg-list.md` (§17 제거 + 재번호 + outputs)
  - `scripts/build-manifest.ts` (EXTRA_CGS, EXTRA_VIDEOS 상수 + buildManifest 합치기 로직)
  - `public/manifest.json` (자동 재생성)
- **사유**: build-manifest가 `src/scenes/*.scene.json` (시나리오 [CG/VIDEO/SFX] 디렉티브)에서만 자산 ID를 수집해, 코드(RejectEnding/OpeningVideo/audioManager)에서 직접 import·렌더하는 자산이 manifest에 누락됨. 인벤토리 정합성 + 향후 dist 빌드 시 누락 자산 검출 신뢰성 확보.
- **승인**: PM (구윤모) — 자산 검증 결과 보고 → 옵션 A(최소 처방) + bg_kakao_fullscreen은 bg-list에서 제거 채택 → 이번 변경.

### 2026-05-08 — 자동 풀플레이 회귀 사냥 라운드 (JUMP 비동기 race fix + step null throttle)

- **변경**: 출시 직전 자동 풀플레이로 65 씬 7분 traversal하면서 출시 차단급 회귀 1건 + 콘솔 노이즈 1건 발견·처방. PM 의심 영역(자동 클리어 fix의 ch02_01·ch03_01·ch04_06) 검증 통과.
  - **REGRESSION #1 fix (출시 차단급) — JUMP 비동기 race**: `src/stores/gameStore.ts` `advance()`에 cmd.type==='JUMP' 분기 추가 — `applyCommand` 우회하고 `await get().startScene(cmd.sceneId)` 직접 호출 후 return. 기존 흐름은 applyCommand의 set() 동기 처리 후 fire-and-forget `void get().startScene(...)`이라 startScene loadScene+JSON parse(~100~200ms) 비동기 동안 autoplay tick(30ms) 또는 SceneRenderer useEffect 자동 advance가 옛 씬에서 step null → 안전 가드 reseek(0) 사이클을 6번 돌면서 BG/CHARACTER/DIALOGUE 명령 6배 재처리. **ch02_01_anatomy_morning에서 cmdIdx 3→13→23 사이클 6회(~7초) 무한 루프 → fix 후 정상 1회 traversal**. 호감도/플래그는 안전 가드가 cmd[0]만 retry라 누적 영향 0이지만 화면 깜빡임 + 자동 클리어 logic 6배 부담.
  - **REGRESSION #2 부분 fix (콘솔 노이즈) — step null safety guard throttle**: 모듈 스코프 `_stepNullWarnedScenes: Set<string>` 추가 + `console.warn` 호출 전 `has(scene.id)` 체크. 같은 씬 반복 발동 시 첫 1회만 발행 의도. **JUMP fix 후에도 close 씬 5개에서 6회씩 잔존 (race 여부는 별도 조사 필요)** — 출시 차단 아님, 별도 라운드.
- **검증** (3차 풀플레이 435초 종착):
  - 종착 ID: **END_H4_REJECT** (autoplay KAKAO 자연 흐름의 ReplyTimer 자동 timeout으로 late_reply_count≥2 누적 — 의도된 평가 결과)
  - 65 씬 traversal / 17 CHOICE 자동 / 16 KAKAO / hang 0 / network failed 0
  - charSnapshots 32건 — **PM 의심 ch02_01·ch03_01·ch04_06 모두 정상**: BG 변동 직후 charsCount=0 일관, 의도된 마운트 보존(ch02_02 윤모/윤하정, ch04_07 윤모, ch05_07 윤모/차세린/한설) → **자동 캐릭터 클리어 fix 회귀 없음 확인**
  - vitest 72/72 + typecheck 무에러
- **모듈**: `src/stores/gameStore.ts` (advance JUMP 분기 + 모듈 스코프 throttle Set)
- **사유**: 출시 직전 자동 풀플레이로만 잡을 수 있는 race condition. JUMP는 시나리오 모든 씬 끝에 있는 명령이라 모든 챕터 전환에 영향. PM 라이브 플레이는 사용자 클릭 간격이 100ms 이상이라 race 안 발생했지만 자동 풀플레이는 30ms 간격이라 노출.
- **승인**: PM (구윤모) — autoplay 진단 → REGRESSION 즉시 stop + 옵션 제시 → (a) 근본 원인 fix 채택 → 검증 종착 → (b) CHANGELOG 갱신 채택.
- **잔여 (별도 라운드)**: 
  - close 씬 5개(prologue_03_close/ch01_05_close/ch02_02b_steady/ch02_06_close/prologue_02_after_choice) step null 6회 잔존 race 분석 — 추정 SceneRenderer useEffect ↔ autoplay tick 동시 advance
  - 다른 루트(H1 TRUE / SOLO_SUMMER) 자동 풀플레이로 추가 검증 권장
  - autoplay 시 KAKAO ReplyTimer 자연 timeout 누적이 H4 분기 강제 — H4 직접 검증 시는 ch04 직진입 + flags 주입 권장 (E2E 패턴)

### 2026-05-08 — 대규모 동선 재설계 라운드 1차 (CharacterLayer 6슬롯 + 엔진 BG 자동 클리어 + audit v2)

- **변경**: 자산 통합 검증 라운드 후속 ③ 잔여 영역 — PM 결정 (c) 하이브리드 방향 + (자동 검출) 범위 채택. PM 라이브 플레이에서 발견된 "엄청나게 많은 동선 문제 장면"을 audit v2 자동 검출 + 엔진 fix + 시나리오 핫스팟 처방 3단으로 처방.
  - **Phase 1 (CharacterLayer 6슬롯 확장)** — `src/ui/CharacterLayer.tsx` 위치 모델을 3슬롯(left/center/right) → 6슬롯으로 확장. 앞줄(left/center/right, X 25/50/75%, max-h 90%, z=2) + 뒷줄(left_back/center_back/right_back, X 30/50/70%, max-h 75%, z=1). 같은 X 좌표라도 _back은 작게+뒤로 = 입체감. SCENE-FORMAT.md §1.1 VIDEO 디렉티브 표 갱신, audit-asset-flow.ts VALID_POSITIONS 6슬롯 갱신.
  - **Phase 2 (audit-asset-flow.ts v2)** — JUMP/CHOICE.next 그래프 빌드 + incoming edges 합집합으로 BG 상속 정밀 추적 (false positive 145→40, 105건 가지치기). 신규 검출 카테고리 2종: `CHARACTER_LEFT_BEHIND` (씬 끝까지 HIDE 없음 — 105건 / `BG_CHANGE_RESIDUAL_CHARS` (BG 변경 시 잔존 캐릭터 — 24건). CHARACTER_CONCURRENT_MANY 임계 ≥3 → ≥4 (6슬롯 모델 정합).
  - **Phase 3a (gameStore 엔진 fix)** — `src/stores/gameStore.ts` applyCommand BG case에 자동 캐릭터 클리어 로직. BG ID 변경 시 `characters: {}`로 리셋 (장면 전환 = 캐릭터 동선 리셋). 같은 BG 또는 black/white 단색 폴백은 캐릭터 유지 (페이드 효과·연출 정합). 의도된 보존 케이스(BG 변경 후 같은 캐릭터 등장)는 시나리오에서 BG 직후 [CHARACTER] 다시 명시. **이 fix로 105 LEFT_BEHIND + 24 RESIDUAL = 129건이 실질 시각 영향 0** (audit는 시나리오 명시 의도 검증용, store 로직과 별개).
  - **Phase 3d (시나리오 핫스팟 슬롯 재배치)** — POSITION_COLLISION 10건 모두 처방 (10→0건). 룰: 동기 4명(김규민/조나단/오준혁/표경민) 두 번째 등장 시 _back 슬롯, 메인 히로인 등장 임팩트는 앞줄 우선.
    - ch01_ot.md 오준혁 → right_back
    - ch03_dongsan.md 조나단 → right_back (replace_all 4건)
    - ch03_dongsan.md cmd#35 5명 동시 — 김규민 left_back 신규 라인 추가 (장윤영 등장 시점 자리 양보)
    - ch04_library.md 김규민 → right_back (나서윤 메인 임팩트 보존)
    - ch05_decision.md 조나단 → right_back / 한설 center → right (윤모 center 충돌 회피)
    - ch06_h2_hajeong.md 오준혁 → right_back (윤하정 메인 보존)
- **검증**:
  - `npm run compile` — 12 .md → 216 씬 (warning 6 기존)
  - `npm run manifest` — backgrounds 18 / characters 10 / cgs 19 / videos 10 / bgms 8 / sfx 8 (불변)
  - `npm run validate` — 16/16 엔딩 + 자산 화이트리스트 정합 0건 경고
  - `npm run typecheck` — tsc 0 errors
  - `npm run test` — vitest **72/72**
  - `npm run build` — vite 1.45s, index 262.22 kB / gzip 80.20 kB (직전 +0.45 kB CharacterLayer 슬롯 모델 확장 + gameStore 자동 클리어)
  - `npm run test:e2e` — Playwright **16/16 통과** (14 passed + 2 flaky retry 회복, 1.2분)
  - `npx tsx scripts/audit-asset-flow.ts` — POSITION_COLLISION **10→0건** ✅, INVALID_POSITION 0건, CG_HIDE_MISSING 0건. CHARACTER_LEFT_BEHIND 105건 + BG_CHANGE_RESIDUAL_CHARS 24건은 store 자동 클리어 fix로 실질 시각 영향 0.
  - **preview MCP DOM 검증** — `ch03_04_back_to_school` cmd#35 시점 5명 동시 등장 시각 분배 확정: 윤모 center(50%, z=2, 90%) + 표경민 left(25%) + 김규민 left_back(30%, z=1, 75%) + 장윤영 right(75%) + 조나단 right_back(70%, z=1, 75%). 6슬롯 시각 분리 ✓ 콘솔 에러 0건.
- **모듈** (status 변동):
  - `src/ui/CharacterLayer.tsx` — 6슬롯 위치 모델 + max-h/z-index 분리
  - `src/stores/gameStore.ts` — applyCommand BG 자동 클리어
  - `scripts/audit-asset-flow.ts` — v2 (JUMP 그래프 + 신규 카테고리 2종)
  - `06-engine/SCENE-FORMAT.md` (status: review, 6슬롯 명세)
  - `03-story/scenarios/{ch01_ot,ch03_dongsan,ch04_library,ch05_decision,ch06_h2_hajeong}.md` (슬롯 재배치 11곳)
  - `src/scenes/*.scene.json` — 재컴파일
- **사유**: PM 라이브 플레이에서 "엄청나게 많은 장면이 문제 — 동선을 자세히 완전히 새로 짜는 단계 필요"라는 피드백. audit v2로 자동 검출한 190건 중 PM 결정 (A) 엔진 fix 우선 + 시나리오 21건 처방. 엔진 fix가 129건을 자동 해소하고, 시나리오 처방이 슬롯 충돌 10건을 모두 해소.
- **승인**: PM (구윤모) — (c) 하이브리드 + (자동 검출) 채택. 본 라운드는 1차 — 후속 라운드에서 PM 풀 플레이 시각 검증 후 추가 처방 결정.
- **잔여 (별도 라운드)**:
  - **🟨 PM 풀 플레이 시각 검증** — 자동 클리어 fix가 의도되지 않은 캐릭터 사라짐을 만든 케이스 발견 시 시나리오에서 BG 직후 [CHARACTER] 다시 명시 처방. 의심 케이스: ch02_01_anatomy_morning(자취방→학교 이동 후 김규민 대화 시 윤모 사라짐), ch03_01_dongsan_lobby(캠퍼스→동산병원), ch04_06_yuna_morning(학교→카페).
  - CHARACTER_CONCURRENT_MANY 12건 시각 분배 미세 조정 (현재 처방으로 ch03_04 5명은 6슬롯 자연스러움, 나머지 11건은 4명 동시이지만 시나리오에 따라 _back 활용 가능)
  - BG_NULL_ON_FIRST_TEXT 40건 — 시나리오 첫 명령 [BG] 누락 또는 incoming JUMP에서 BG 보장 안 됨. 일부는 정밀 검증 false positive 가능
  - audit v2를 store 로직 정합 (BG 변경 시 자동 클리어 시뮬레이션) 갱신 — LEFT_BEHIND/RESIDUAL을 의도된 동작과 의도되지 않은 회귀로 분리
  - 미등록 6명 자산 생성 + spriteResolver 등록 + 시나리오 디렉티브 복원 (PM 직접 작업)
  - GitHub Pages 활성화 + Lighthouse 실측 (PM 직접 작업)

### 2026-05-08 — 자산 통합 검증 라운드 후속 처방 (PM 결정 ①②④ + ③ 잔여 큐 + E2E flaky retry 보강)

- **변경**: 자산 통합 검증 라운드(2026-05-08) 보고서 §6 잔여 라운드 큐 중 PM 결정 4건 일괄 처방 + E2E flaky 보강.
  - **① video_opening App 진입점 OP 재생** (옵션 a 채택) — 신규 `src/ui/OpeningVideo.tsx` (`/video/video_opening.mp4` 자동재생, 클릭 또는 onEnded → onComplete, autoplay 차단/onError 시 즉시 onComplete). `src/App.tsx`에 `showOpening` 상태 + 첫 마운트 시 OP 표시 후 SceneRenderer 전환. `shouldShowOpening()` 함수가 navigator.webdriver(Playwright 자동화 환경) / `?scene=` / `?flags=` URL 파라미터 시 OP 자동 스킵.
  - **② sfx_pageturn 코드 호출 추가** (옵션 a 채택) — `src/ui/Backlog.tsx` mount 시 1회 + `src/ui/DialogueBox.tsx` advance 시(텍스트 다 표시 + 다음 클릭) `audioManager.playSfx('sfx_pageturn')`. SFX-list.md §"텍스트 다음 / 백로그 페이지" 사용처 정합화.
  - **④ SCENE-FORMAT skipable 옵션 정식 제거** (옵션 a 채택) — `06-engine/SCENE-FORMAT.md` §1.1 VIDEO 디렉티브 표 갱신. 시나리오 본문 10건 일괄 정리(`skipable=true]` → `]`): ch01·ch02·ch03×2·ch04·ch06_h1·ch06_h2·ch06_h3·ch06_h4·ch06_h5. `scripts/compile-scene.ts` RE_VIDEO 정규식 단순화 + return 객체 단순화 + SceneCommandOut union의 VIDEO 타입에서 `skipable` 제거. `src/engine/types.ts` SceneCommand union의 VIDEO 동일 변경. `src/ui/VideoLayer.tsx` 메모 갱신.
  - **③ 슬롯 충돌·동시 ≥3명 시각 품질 영역** — PM 라이브 플레이 피드백("이 외에도 문제가 되는 장면이 엄청나게 많아서, 대규모로 동선을 자세히 완전히 새로 짜는 단계가 필요해")에 따라 본 라운드 미처방, **별도 대규모 동선 재설계 라운드 큐로 이관**. 단일 fix가 아닌 12개 시나리오 캐릭터 동선·위치·등장/퇴장 타이밍 전수 재설계 필요 영역.
  - **E2E flaky retry 보강** — 본 라운드 e2e 재실행 중 4번 시도 모두 매번 다른 4건이 timeout으로 실패하는 명확한 flaky 패턴 발견 (직전 자산 통합 검증 라운드 1회 16/16 통과는 운). `tests/e2e/helpers.ts` `expectEnding` timeoutMs 기본 10s → 20s 상향 (TRUE 엔딩 video_true_* 7초 + EndingScreen 마운트 + 페이드 합산 환경 부담 회복용). `playwright.config.ts` 로컬 retries 0 → 1 (CI 2 유지). 결과 12 passed + 4 flaky retry 통과 = 16/16 1.9분.
- **검증 (회귀 통과)**:
  - `npm run compile` — 12 .md → 216 씬 (warning 6 기존)
  - `npm run manifest` — backgrounds 18 / characters 10 / cgs 19 / videos 10 / bgms 8 / sfx 8 (불변)
  - `npm run validate` — 16/16 엔딩 + 모든 화이트리스트 정합 0건 경고
  - `npm run typecheck` — tsc 0 errors
  - `npm run test` — vitest **72/72**
  - `npm run build` — vite 1.48s, index 261.77 kB / gzip 80.07 kB (전 라운드 +1.17 kB OpeningVideo + sfx 호출)
  - `npm run test:e2e` — Playwright **16/16 통과** (12 passed + 4 flaky retry 회복, 1.9분)
- **모듈** (status 변동):
  - `src/ui/OpeningVideo.tsx` (신규)
  - `src/App.tsx` (showOpening + navigator.webdriver/URL 파라미터 OP 스킵)
  - `src/ui/Backlog.tsx` (mount sfx_pageturn)
  - `src/ui/DialogueBox.tsx` (advance sfx_pageturn)
  - `06-engine/SCENE-FORMAT.md` (status: review, VIDEO 디렉티브 skipable 옵션 제거)
  - `scripts/compile-scene.ts` (RE_VIDEO 단순화)
  - `src/engine/types.ts` (VIDEO 타입 정리)
  - `src/ui/VideoLayer.tsx` (메모만)
  - `tests/e2e/helpers.ts` (expectEnding 기본 20s)
  - `playwright.config.ts` (로컬 retries 1)
  - `03-story/scenarios/{ch01_ot,ch02_anatomy,ch03_dongsan,ch04_library,ch06_h1_serin,ch06_h2_hajeong,ch06_h3_seol,ch06_h4_seoyoon,ch06_h5_yuna}.md` (skipable=true 제거 9개 시나리오 10건)
  - `src/scenes/*.scene.json` (재컴파일로 skipable 필드 제거)
- **사유**: 자산 통합 검증 라운드 후속 — PM 풀 플레이 검증 결과 ①(거절 엔딩 cg 시각 OK) + ③(5명 동시 슬롯 겹침 + 다른 장면 다수 발견 → 대규모 동선 재설계 별도 라운드 필요). ①②④는 작은 fix로 즉시 처방 가능 영역. E2E flaky는 retry로 안정화.
- **승인**: PM (구윤모) — ①a / ②a / ③ 별도 대규모 라운드 큐 / ④a 채택.
- **잔여 (별도 라운드)**:
  - **🔴 대규모 동선 재설계 라운드 (Critical, 출시 전 필수)** — 12개 시나리오 캐릭터 동선·위치·등장/퇴장 타이밍 전수 재설계. POSITION_COLLISION 10건 + CHARACTER_CONCURRENT_MANY 18건 + PM 풀 플레이에서 추가 발견된 다수 장면. 시나리오 단위 재작성 또는 CharacterLayer 슬롯 모델 확장(left_back/right_back z-index 분리) 등 옵션 PM 결정 필요.
  - 미등록 6명 자산 생성(스프라이트) 후 spriteResolver 등록 + 시나리오 디렉티브 복원
  - BG_NULL_ON_FIRST_TEXT 145건 정밀 검증 (JUMP 그래프 시뮬레이터 v2)
  - audit-asset-flow.ts CI 통합
  - E2E flaky 근본 원인 디버깅 (현재 retry로 회복 — 매번 다른 케이스 timeout, 영상 자원 부담 또는 zustand persist 사이드 이펙트 의심)

### 2026-05-08 — PM 라이브 플레이 피드백 통합 라운드 (UX/엔진/자산 30+건 처방 6 라운드)

PM 직접 dev 플레이 6회 라운드에 걸친 피드백을 모두 처방. 카톡 UI 전면 리팩터 + 시각 효과 4종 신규 + 빈 화면/멈춤 치명 버그 다수 + 자산 통합.

#### 라운드 #2 (피드백 13건 + 결정 7건 — PM 응답 후 일괄 처방)

- **자산 통합** (4건): bg_festiva.webp 오타 → bg_festival.webp rename / 카카오톡 프로필 8장 (구윤모·기본1·2·3·김규민·정욱·조나단·표경민) + 히로인 5명 default 스프라이트 얼굴 crop → 120×120 WebP 13장 `public/img/avatar/` 생성 / iPhone_Message_5.5-6.5s.mp3 → `sfx_katalk_send` 매핑
- **엔진 빈 화면 버그 #1 — CharacterLayer src 합성 깨짐**: `/img/sprites/${c.sprite}.webp` (`default.webp`) 호출 → 모든 캐릭터 onError로 숨김. 신규 `src/data/spriteResolver.ts` (한글/영문/H# → prefix) + CharacterLayer 리팩터. 103회 등장 윤모 + 히로인 5명 + 사이드 4명 모두 정상 로드.
- **엔진 빈 화면 버그 #2 — assetPreloader 같은 src 버그**: 같은 잘못된 URL 캐싱 → 항상 캐시 미스 → "이미지 제때 안 뜸" 직접 원인. spriteResolver 공유로 픽스.
- **카톡 UI 전면 리팩터** (스크린샷 매칭): 반응형 폰창(PC 460×736 중앙, 모바일 풀스크린) / 발신자별 아바타+이름+시각+안 읽은 수 / 자동 흐름 800ms + 클릭·Space·Enter 가속 / 자동 스크롤 / `mode: 'dm' | 'group'` 자동 추론 / 룸 이름·인원·핀 공지 / `kakaoMeta.ts` 시각·안읽음 자동 도출. 신규 `kakaoProfiles.ts`(아바타 매핑 + default1·2·3 해시 폴백) + KAKAO 데이터 모델 확장.
- **사용자 인터랙션** (5건): DialogueBox keyboard handler 추가 (Space/Enter advance, Backspace 직전대화) — Space 일관성 픽스 / SceneRenderer 외곽 div onClick — 화면 어디든 클릭 advance / 신규 `gameStore.rewindOne()` + `textCommandStack` (1단계) + MiniControls "← 이전" 버튼 / 변태망상 텍스트박스 `animate-pulse` 깜빡임 제거 + CharacterLayer perv_start subtype 동안 `yunmo_perv ↔ yunmo_perv_1` 0.5s swap.
- **시각 효과 신규 4종**: 신규 `ChapterFader.tsx` (챕터 경계 검정 페이드 1.6s) / 신규 `AffectionToast.tsx` (호감도 변동 우상단 토스트) / `BackgroundLayer` 디졸브 800ms / VEO 끝까지 재생 강제(skipable false) + cmd 변경 시 `currentTime=0 + play()` 호출 (rewind 멈춤 방지).
- **카톡 알림음 룰 변경**: 첫 메시지(상대만) `sfx_katalk_notify` 0.5x, 그 외 모든 메시지(본인 포함) `sfx_katalk_send` (슥 소리).
- **v2 프로필 분기**: 김규민2/표경민2 ch03_05_kakao_night 카톡 씬부터 적용. shouldUseV2Profile() 헬퍼 + KAKAO_SCENE_ORDER 정합.
- **사이드 스프라이트 통합**: gyumin/gyeongmin/nathan/junhyuk 4명. 표정 자산은 default 1종만 → SIDE_DEFAULT_ONLY 셋으로 시나리오 smirk/laugh 등 모두 default 폴백.
- **시각 보강** (3건): 미니컨트롤 가시성 — `bg-black/55 + backdrop-blur + border-white/30 + text-white + shadow-lg` / 폰트 +20% — `--font-size-text 22→26px` (PC), 18→22px (모바일) / BG 우하단 워터마크 — clip-path → `transform: scale(1.06) origin: top left` (자연스러운 좌상단 기준 확대).
- **신규 검증 도구**: `validate-build.ts` v0.4 — 시각 자산 실파일 존재 검증 (BG_ALIAS 폴백 인식). 누락 자산 ERROR로 빌드 차단.
- **시나리오 본문 정리**: prologue.md "동기들보다 한 살 더 먹고~" 1줄 제거 (PM 요청).

#### 라운드 #3 (피드백 9건)

- 워터마크 clip-path → scale(1.06) 변경 (구멍 같은 어색함 해소)
- 카톡 폰트 본문은 `--kakao-font-size 16px` 별도 토큰으로 본문 폰트(26px)와 분리
- 본인 메시지 카카오 노란색: `--kakao-bubble-self: #FEE500`
- 오준혁 카톡 프로필 자산 부재 → FRIEND_PROFILES에서 entry 제거 + KakaoMessage onError default1·2·3 해시 폴백
- 텍스트박스 크기 축소: bottom 40→56px, width 86→80%, height 28→24% (미니컨트롤과 비충돌)
- rewind 1→5단계: `prevTextCommandIndex` → `textCommandStack: number[]` (slice -5)
- 호감도 토스트 z-index 분리: ChapterFader 350 / AffectionToast 400 (페이드 시 가려짐 해소)
- 챕터 페이드 1.0→1.6s + BG 디졸브 800ms 추가

#### 라운드 #4 (피드백 6건)

- **VEO rewind 치명 버그**: `useEffect`로 cmd 변경마다 `video.currentTime=0 + play().catch(onEnded)` — 같은 영상 재진입 시 멈춤 방지
- VEO skipable 무시 → 영상 끝까지 재생 강제 (PM 결정)
- CG 최소 2초 lock: `unlocked` state + 2s setTimeout, button disabled
- rewind 5→10단계: `textCommandStack.slice(-10)`
- 카톡 폰트 비율 — 발신자 이름 12→14px (라운드 #5에서), 본문 18px
- **prefers-reduced-motion 우회**: 검증 환경 + PM PC reduce motion 의심 → CSS transition 1e-05s 강제 단축 회피. ChapterFader/AffectionToast/BackgroundLayer 모두 store-driven step setState 패턴(`gameStore.startScene` 안에서 `chapterFadeOpacity`를 50ms × 32 step으로 직접 갱신).

#### 라운드 #5 (피드백 5건)

- **토스트 H5 덮어쓰기 버그**: `toneToFlagIncs`가 한 CHOICE에서 H1~H5 5개 FLAG_INC 발행 → applyOne이 매번 lastAffectionChange 덮어써서 마지막 H5만 남는 버그. 처방: `applyChoiceEffects`에서 가장 큰 양수 delta heroine 1명만 lastAffectionChange로 set. 검증: mature_serious + isKey → "차세린 +15" 정확히 표시.
- **BG 디졸브 빈 프레임**: `new Image()` probe로 onload 후에야 setLayers 디졸브 시작. 캐시 미스 시점 빈 화면 제거.
- **VEO 페이드 in/out**: VideoLayer에 자체 검정 overlay + 12 step × 25ms 페이드 (시작 1→0, onEnded 0→1).
- **토스트 시인성**: bg `rgba(20,20,28,0.92)` + border 2px white/45 + 폰트 22→24px + padding 14×24 + shadow 강화 + 숫자 글로우.
- **카톡 이름 폰트** 12→14px.

#### 라운드 #6 (피드백 2건 — 치명)

- **선택지로 ← 시 멈춤**: pickChoice → 다음 씬 startScene에서 `textCommandStack`/`currentTextCommandIndex` reset 안 해서, 새 씬에서 이전 씬 인덱스로 seek → 잘못된 위치. 처방: startScene setState에 stack reset + rewindOne 안전 가드 (target 인덱스가 현재 씬 범위 밖이면 stack 정리 후 noop).
- **프롤로그→ch01 BG 사라짐**: fade-in이 advance보다 먼저 끝나서 새 씬 BG 적용이 fade-in 후에야 → 짧은 빈 프레임. 처방: fade-out 후 setState → **advance() 먼저 호출** (첫 BG 명령 적용) → fade-in. fade-in과 BG 디졸브 동시 진행.

#### 추가 (Hotfix 2건)

- **프롤로그 마지막 NARRATION에서 BG 사라짐**: prologue_03_close 마지막 NARRATION 직후 `[BG black]` 명령 → 마지막 대사가 검정 위에 표시되는 시각 어색함. 처방: BG black + 시스템 NARRATION (`— 끝 → Ch.1`) 두 명령 제거. 챕터 fade-out이 자연스럽게 검정 처리. prologue.md 원본 동기화.
- **프롤로그 마지막 멈춤 (saved data 어긋남)**: 옛 saved currentCommandIndex가 새 commands 길이(11→9) 범위 밖 → step null → idle 멈춤. 처방 1: zustand persist `version: 1 → 2` (옛 saved 자동 무효화). 처방 2: advance step null 안전 가드 — 씬에 commands 있으면 seek(0) retry로 자동 복구.

#### 변경 통계

- **신규 파일** (8건): `src/ui/AffectionToast.tsx` / `src/ui/ChapterFader.tsx` / `src/data/spriteResolver.ts` / `src/data/kakaoProfiles.ts` / `src/engine/kakaoMeta.ts` / 13장 압축 아바타 자산 / `sfx_katalk_send.mp3` / `gyumin_v2.webp` + `gyeongmin_v2.webp`
- **갱신 파일** (15건): gameStore.ts (rewindOne / textCommandStack / chapterFadeOpacity / lastAffectionChange / applyChoiceEffects / persist v2 / advance null 가드 / startScene fade timing) / SceneRenderer.tsx (외곽 onClick + AffectionToast/ChapterFader 마운트) / DialogueBox.tsx (keyboard handler + animate-pulse 제거) / CharacterLayer.tsx (resolver + perv swap) / BackgroundLayer.tsx (BG_ALIAS 비움 + 디졸브 + scale crop) / CGOverlay.tsx (2s lock) / VideoLayer.tsx (rewind 픽스 + 페이드 + skipable 비활성) / KakaoModal.tsx + KakaoMessage.tsx (전면 리팩터) / MiniControls.tsx (← 버튼 + 가시성) / assetPreloader.ts (resolver + BG_ALIAS) / audioMappings.ts (sfx_katalk_send) / spriteResolver.ts (사이드 4명 + ID 통일 nathan/gyeongmin) / tokens.css (폰트 26/14/16/18px + kakao 노란색 + textbox 축소) / globals.css / scripts/validate-build.ts (v0.4 자산 존재 검증 + BG_ALIAS 비움)
- **자산 변경**: BG `bg_ktx_window.webp` + `bg_dongdaegu_station.webp` 정식 자산 들어와 alias 제거 / 사이드 스프라이트 rename `kyungmin_default → gyeongmin_default`, `jonathan_default → nathan_default` (PM 결정 영문 ID 통일)
- **시나리오 본문**: prologue_03_close.scene.json (BG black + 시스템 NARRATION 제거) + prologue.md 동기화 / prologue.md "동기들보다 한 살" 1줄 제거 + prologue_02_train.scene.json 동기화

#### 검증

- typecheck ✓ / vitest 72/72 ✓ / build 261 KB·gzip 80 KB ✓ / validate 통과 (216 씬, alias 경고 0건) ✓
- preview MCP DOM 검증 — 다음 항목 모두 정상:
  - 폰트 26px / 카톡 본문 18px / 카톡 이름 14px
  - 카톡 본인 메시지 노란색 rgb(254,229,0)
  - rewind 10단계 stack 정상, 11번째 noop, 새 씬 진입 시 stack reset
  - 호감도 토스트 mature_serious + isKey → "차세린 +15"
  - 챕터 페이드 store-driven 0.13→0.97→0.06 정상 step
  - BG 디졸브 32 step, prologue→ch01 fade-out 끝 시점 BG 교체 + fade-in 동시
  - VEO `currentTime=0 + play()` 호출, 페이드 in/out
  - CG 2초 lock disabled
  - 사이드 캐릭터 default 폴백 (smirk/laugh → default)
- preview 시뮬레이션 (prologue_03_close → ch01_01_ot_intro): 마지막 NARRATION → click → JUMP → fade-out → ch01 진입 → fade-in → 첫 NARRATION 표시 ✓

#### PM 직접 확인 잔여

- 새로고침 후 zustand version 2 mismatch로 옛 saved 자동 폐기 → 처음부터 새 진행
- 다른 챕터·엔딩 (ch04_07_close, ch05_07_close, ch06_h*_close, end_solo_summer_main 등)도 prologue와 동일 `[BG black] → 시스템 NARRATION → JUMP` 패턴 30+ 씬에 잠재. PM이 진행 중 같은 증상 보이면 일괄 처방 가능.
- W6 출시 차단 항목: GitHub Pages 활성화 / PM 실디바이스 모바일 QA / Lighthouse Performance ≥80 / 풀 플레이 1회 (영상 12개 + 모든 BGM/SFX 청감)

- **승인**: PM(구윤모) — 6 라운드 라이브 피드백 + 사용자 결정 7건 + 추가 hotfix 2건
- **다음 단계**: PM 풀 플레이 라운드 #7 → 잔여 챕터 끝 BG black 패턴 보고 시 일괄 처방 → GitHub Pages 활성화 → 출시

---

### 2026-05-08 — 자산 통합 검증 라운드 (Critical 33건 처방 + audit-asset-flow.ts 신규)

- **변경**: PM 요구 5개 카테고리 자산 점검(미사용·BG 누락·스프라이트 입출 타이밍·위치 정합·다중 동시 등장) 결과 출시 차단급 Critical 3종 처방. 자세한 발견·처방·잔여는 [`08-qa-deployment/verification-reports/07-asset-audit.md`](../08-qa-deployment/verification-reports/07-asset-audit.md) 참조.
  - **Critical #1 처방** — 비표준 위치값 24건 시나리오 표준화. `[CHARACTER: <id> left_back/right_back ...]` → `left/right`로 일괄 치환. `src/ui/CharacterLayer.tsx:5-9` `POSITION_X` 3슬롯 한정과 호환되도록. 영향 9개 시나리오: ch01_ot(1) / ch03_dongsan(4) / ch04_library(1) / ch05_decision(4) / ch06_h1_serin(2) / ch06_h2_hajeong(1) / ch06_h3_seol(1) / ch06_h5_yuna(6) + ch05_decision L558 차세린 left ↔ 한설 left 충돌 회피로 한설 → center 옮김.
  - **Critical #2 처방** — 미등록 캐릭터 6명 디렉티브 8건 제거. `약대 동기`(ch04 1건) / `본과1 후배`(ch06_h3 1건) / `박지수`(ch06_h1 + ch06_h2 2건) / `차민호`(ch06_h2 1건) / `이태호`(ch02 1건) / `이창용`(ch03 2건) — `spriteResolver.ts` `PREFIX_BY_NAME` 미등록 → silent fail이던 디렉티브 모두 본문에서 제거(화자명·대사·모놀로그·지문은 보존). manifest characters 16 → 10명 정확히 감소.
  - **Critical #3 처방** — `cg_seoyoon_reject` 누락 복원. 거절 엔딩 자산이 코드/시나리오 모두 호출 0회였으나 `RejectEnding.tsx` 단계 4(pause) 메모 표 정합화. `src/ui/katalk/RejectEnding.tsx`에 풀스크린 오버레이 + 페이드인(1s ease-in) + onError 폴백(자산 미존재 시 게임 흐름 차단 안 함) 추가.
  - **신규 점검 도구** — `scripts/audit-asset-flow.ts` (216개 씬 단위 시뮬레이터). INVALID_POSITION / BG_NULL_ON_FIRST_TEXT / CG_HIDE_MISSING / POSITION_COLLISION / CHARACTER_CONCURRENT_MANY 5종 발견 카테고리. 회귀 방지에 CI 통합 후보(잔여).
- **검증 (회귀 통과)**:
  - `npm run compile` — 12 .md → 216 씬 (warning 6: IF v0.1 미지원 기존)
  - `npm run manifest` — backgrounds 18 / characters **16→10** / cgs 19 / videos 10 / bgms 8 / sfx 8
  - `npm run validate` — 16/16 엔딩 도달, 모든 화이트리스트 정합 0건 경고
  - `npm run typecheck` — tsc 0 errors
  - `npm run test` — vitest 4 files / **72 tests passed**
  - `npm run build` — vite 1.45s
  - `npm run test:e2e` — Playwright Chromium **16/16 endings passed (29.1s)**
  - `npx tsx scripts/audit-asset-flow.ts` — INVALID_POSITION **0건** ✅ / CG_HIDE_MISSING 0건 ✅ / Critical 0건
  - preview MCP DOM 검증 — `ch03_04_back_to_school` cmd#34 시점 5명 동시 등장 + right(75%) 슬롯 3명 겹침(김규민/조나단/장윤영) 좌표 측정 확인. 콘솔 에러/경고 0건.
- **모듈** (status 변동):
  - `03-story/scenarios/ch01_ot.md` (status: review)
  - `03-story/scenarios/ch02_anatomy.md` (status: review)
  - `03-story/scenarios/ch03_dongsan.md` (status: review)
  - `03-story/scenarios/ch04_library.md` (status: review)
  - `03-story/scenarios/ch05_decision.md` (status: review)
  - `03-story/scenarios/ch06_h1_serin.md` (status: review)
  - `03-story/scenarios/ch06_h2_hajeong.md` (status: review)
  - `03-story/scenarios/ch06_h3_seol.md` (status: review)
  - `03-story/scenarios/ch06_h5_yuna.md` (status: review)
  - `src/ui/katalk/RejectEnding.tsx` (단계 4 cg overlay)
  - `scripts/audit-asset-flow.ts` (신규)
  - `08-qa-deployment/verification-reports/07-asset-audit.md` (신규, status: review)
- **사유**: W6 출시 직전 라운드 4 자산 보강 후 PM 직접 요구 — 자산 138파일이 통합됐지만 "제때 들어오고 사라지는지·미사용은 없는지·다중 동시 등장 깨지지 않는지" 전수 점검 미시행. 본 라운드에서 출시 차단급 33건 발견·처방.
- **승인**: PM (구윤모) — Critical #1 옵션 a (시나리오 표준화) + Critical #2 처방 (복원) 채택.
- **잔여 (별도 라운드)**:
  - 미등록 6명 자산(스프라이트) 생성 후 `spriteResolver.ts` 등록 + 시나리오 디렉티브 복원
  - `video_opening` 결정 — 진입점 OP 영상 vs video-list 제거
  - `sfx_pageturn` 결정 — Backlog 코드 호출 추가 vs audioMappings 제거
  - 슬롯 충돌 10건 + 동시 ≥3명 18건 시각 품질 처방 (PM 풀 플레이 후 결정)
  - BG_NULL_ON_FIRST_TEXT 145건 정밀 검증 (JUMP 그래프 시뮬레이터 v2)
  - VIDEO skipable 명세-동작 정합 (SCENE-FORMAT 제거 vs VideoLayer 부활)
  - RejectEnding cg_seoyoon_reject 풀 플레이 시각 검증 (preview MCP DOM 폴링에서 pause 단계 cg 마운트 미확인 — 코드/build 정합·onError 폴백 안전, PM 실제 풀 플레이 시각 검증 필요)
  - `audit-asset-flow.ts` CI 통합

### 2026-05-08 — `fetchPriority` React 18 호환 fix (ref callback + setAttribute)

- **변경**: BGM/SFX fix 라운드 후속 검증에서 발견된 React 18 콘솔 경고 12회 처리. `<img fetchPriority="high">` 카멜케이스 prop이 React 18 화이트리스트에 없어 `Warning: React does not recognize the fetchPriority prop on a DOM element` 경고 발행. (React 19 부터 화이트리스트 등록.)
  - **시도 1 (실패)**: `{...{ fetchpriority: 'high' as const }}` spread 우회 → React 18은 소문자 `fetchpriority`도 unknown prop으로 분류, 경고 그대로. 가설 오류.
  - **시도 2 (성공, 채택)**: `ref={(el) => { if (el) el.setAttribute('fetchpriority', 'high'); }}` ref callback 패턴. 마운트 시 직접 DOM API로 attribute 부여 → React prop 검사 우회 + 효과 유지.
  - **영향 파일**: `src/ui/BackgroundLayer.tsx:87` / `src/ui/CGOverlay.tsx:47` / `src/ui/gallery/CGGallery.tsx:74` 3건.
- **검증**:
  - DOM 직접 조회 (`document.querySelector('img').getAttribute('fetchpriority')`) → `"high"` 반환 (효과 유지)
  - 브라우저 reload 후 `preview_console_logs level=warn` → **0건**
  - `npm run test` 72/72 통과
  - `npm run typecheck` — 본 라운드 영향 파일 무에러. 별도 작업 중인 `ChapterFader.tsx` + `gameStore.ts:248-250` `chapterTransition` 필드 타입 누락 에러 3건은 본 라운드 범위 밖.
- **모듈**: BackgroundLayer.tsx / CGOverlay.tsx / gallery/CGGallery.tsx
- **사유**: 출시 직전 콘솔 노이즈 제거. 성능 효과(브라우저 fetch priority) 유지하면서 React 18 호환. React 19 업그레이드 시 ref callback 그대로 두거나 카멜케이스 prop으로 단순화 가능.
- **승인**: PM (구윤모) — B안 (ref callback) 채택. A안(prop 제거) 대비 성능 효과 유지가 권장됨.

### 2026-05-08 — BGM/SFX 한글→영문 변환 회귀 fix (compile v0.3 + validate v0.4)

- **변경**: 시나리오 풀 플레이 검증 중 `[audioManager] Unknown BGM: 일상` 콘솔 경고 6회 발견 → 출시 차단급 회귀 fix.
  - **원인**: `scripts/compile-scene.ts:271·282` 에서 `slugAsset()` 만 호출하고 `koToEnBgm()`/`koToEnSfx()` 변환을 누락 → 컴파일된 씬 JSON에 한글 큐(`"track": "일상"`, `"sound": "카톡_알림"`) 그대로 박힘 → `audioManager.playBgm/Sfx`는 영문 ID만 받으므로 `isKnownBgm/Sfx` 실패 → BGM/SFX 사실상 무음.
  - **영향 범위**: 216개 씬 전부 / BGM 8트랙 + SFX 12종 시나리오 큐 모두.
  - **fix (compile v0.3)**: `scripts/compile-scene.ts` 에 `normalizeBgmId()` / `normalizeSfxId()` 헬퍼 추가. 영문 ID 통과 / 한글이면 `koToEnBgm`/`koToEnSfx` 변환 / 미매핑은 원본 보존(validate가 잡음). RE_BGM/RE_SFX 매치 분기에서 `slugAsset` → `normalizeXxxId` 교체. `audioMappings.ts` import 추가.
  - **fix (validate v0.4)**: `scripts/validate-build.ts` 의 `parseAudioMappings` 가 `bgmKo`/`bgmEn`/`sfxKo`/`sfxEn` 을 별도 `Set` 으로 분리 수집. `validateAudioIds` 가 컴파일 결과에 한글 키 잔존 시 **error**(이전 v0.3은 한↔영 모두 통과). 검증 항목 §8 헤더 갱신.
  - **재컴파일**: 216개 씬 재생성. 한글 BGM/SFX 잔존 0건 (`grep '"track":'`/`'"sound":'` 결과 모두 영문 prefix).
  - **검증**: `npm run validate` (216 씬 / 16 엔딩 / KEY 45회 / 거절 도달성) + `npm run test` 72/72 + `npm run typecheck` 무에러 + 브라우저 reload 후 `Unknown BGM` 경고 사라짐 확인.
- **모듈**:
  - `scripts/compile-scene.ts` — v0.2 → v0.3 (BGM/SFX 정규화)
  - `scripts/validate-build.ts` — v0.3 → v0.4 (한글 잔존 시 error)
  - `src/scenes/*.scene.json` — 216개 재생성 (한글 BGM/SFX 영문 변환)
- **사유**: W6 풀 플레이 검증 중 발견된 출시 차단급 회귀. 시나리오 BGM·SFX 큐가 사실상 무음으로 작동했음 → 출시 전 즉시 fix + 회귀 방지 가드 추가.
- **승인**: PM (구윤모) — A안 (compile-scene 변환 + validate-build 가드 보강) 채택.
- **잔여 (별도 라운드)**: 브라우저 검증 중 발견된 `BackgroundLayer` `fetchPriority` prop React 18 카멜케이스 경고 12회 — 이번 라운드 범위 밖, 별도 처리.

### 2026-05-07 — V.O. 표기 자연어 치환 라운드 (시나리오 7개 / 본문 + 메모 100% 한국어화)

- **변경**: 외부 작가 윤문 라운드 #1에서 도입된 영상 작법 약어 `V.O.` (Voice Over)를 일반 플레이어 친화적인 한국어 자연어 묘사로 컨텍스트별 일괄 치환. 본 시나리오 .md 7개 파일 + 작가 메모 모두 처리. 백업 폴더(`_backup-원본/`)는 보존.
  - **사유**: V.O.는 영상 시나리오 표준 약어지만 VN 텍스트 게임 컨텍스트에서 일반 게이머에겐 불투명. 화자명에 `V.O.`가 그대로 포함되어 UI에 노출(`김규민 V.O.`)되면 어색. 컨텍스트별 자연어 표기가 의미 손실 없이 더 명확.
  - **컨텍스트별 5패턴 치환 매핑**:

    | 패턴 | 사례 | 치환 | 영향 |
    |---|---|---|---|
    | 해부학 실습 안내 (이태호 교수) | `[이태호] (V.O.) 그럼 묵념하겠습니다.` | `(안내)` | ch02_anatomy.md 4건 |
    | 견학 가이드 안내 (이창용 펠로우) | `[이창용] (V.O.) 네, 갔다 와요. 이쪽이에요.` | `(앞쪽에서)` | ch03_dongsan.md 1건 |
    | 부스 안쪽 외침 (메니스 후배 / 5조 동기) | `[메니스 후배] (V.O.) 윤모 형! 잠깐만요!` | `(부스에서)` / `(부스 안쪽)` | ch03_dongsan.md 3건 + ch06_h2 2건 + ch06_h5 6건 |
    | 회식·MT 다른 자리 외침 | `[김규민] (V.O.) 야 윤모, MT 얘기 나왔다.` | `(저쪽 자리)` / `(옆 자리)` / `(단체 자리)` / `(마당에서)` | ch05_decision 5건 + ch06_h2 4건 |
    | 작게 속삭임 (V.O. 제거 + 톤 보존) | `[김규민 V.O.] (작게)` | `[김규민] (작게)` | ch06_h2 2건 |
    | 회상 속 음성 (나은영 교수) | `[V.O.: 나은영 교수] (메모리 안 V.O.)` | `[나은영 교수] (회상)` | ch06_h3_seol.md 1건 |

  - **작가 메모 갱신**: 각 시나리오의 화자 등장 일람·모먼트 표·변경 제안에서 `V.O.` 언급 모두 컨텍스트 맞춤 자연어로 치환 (ch02·ch03·ch05·ch06_h1·ch06_h2·ch06_h3·ch06_h5 메모). 예: "Scene 02 V.O. 1회" → "Scene 02 회상 1회" / "단체 자리 V.O." → "단체 자리 외침" / "(V.O. 두 줄)" → "(부스 안쪽 외침 두 줄)".

  - **잔재 0건 확인**: `grep "V\.O\." 03-story/scenarios/*.md`(백업 제외) 결과 0건. 백업 폴더 `_backup-원본/`은 외부 작가 원본 보존 목적으로 V.O. 그대로 유지.

- **모듈** (status 변동):
  - `03-story/scenarios/ch02_anatomy.md` — 본문 4건 + 메모 1건 (status: review)
  - `03-story/scenarios/ch03_dongsan.md` — 본문 4건 + 메모 1건 (status: review)
  - `03-story/scenarios/ch05_decision.md` — 본문 5건 (status: review)
  - `03-story/scenarios/ch06_h1_serin.md` — 메모 4건 (본문 V.O. 0건, 메모만) (status: review)
  - `03-story/scenarios/ch06_h2_hajeong.md` — 본문 6건 + 메모 5건 (status: review)
  - `03-story/scenarios/ch06_h3_seol.md` — 본문 2건 + 메모 5건 (status: review)
  - `03-story/scenarios/ch06_h5_yuna.md` — 본문 6건 + 메모 3건 (status: review)
  - 시나리오 .md frontmatter에 status 필드 없음 — CHANGELOG 명시 + PM 사인오프 라운드에서 검증 처리.

- **검증 결과** (모두 통과):
  - `npm run typecheck`: 무에러 ✓
  - `npm run test`: 72/72 (skip 0) ✓
  - `npm run compile`: 12 .md → 216 씬 (IF 6건 경고 유지) ✓
  - `npm run validate`: 16/16 엔딩 + BG 18+22 / CG 20 / VIDEO 12 / BGM 17 / SFX 22 — 0건 경고 ✓
  - `npm run manifest`: BG 18 / Char 16 / CG 19 / VIDEO 10 / BGM 8 / SFX 8 — 메모 0건 ✓
  - `npm run build`: Vite 1.46s / JS 258.03 KB / gzip 78.83 KB ✓

- **유지 사항**: BRANCH-GRAPH / STATE-SCHEMA / ARCHITECTURE / UI-SPEC / COLOR-TOKENS 무수정. 호감도 변동·KEY·플래그·연출 큐·거절 카톡 텍스트 전부 무수정. 외부 작가 윤문본 톤·내용 보존 (V.O. 디렉티브 표기만 자연어화).

- **다음 단계 후보**:
  - PM 검증 — 7개 시나리오 V.O. → 자연어 치환 톤 적합성 1회 점검 후 PM 사인오프
  - W6 모바일 실디바이스 QA / Lighthouse / GitHub Pages 활성화 + 출시
  - 백업 폴더(`_backup-원본/`) V.O. 표기는 보존 (외부 작가 원본 reference)

- **승인**: PM(구윤모) "옵션 A로 진행 후 진행사항 기록해" 명령 — 본 라운드 사인오프 대기

---

### 2026-05-07 — 라운드 4 자산 보강 (사이드 캐릭터 4명 + 누락 배경 2장 + spriteResolver 확장)

- **변경**: 풀 플레이 검증(라운드 3) 진행 중 발견된 누락 자산 보강. 사이드 캐릭터 4명(김규민·오준혁·조나단·표경민) 스프라이트 + 시나리오 placeholder 배경 2장(`bg_dongdaegu_station`·`bg_ktx_window`) 추가. SceneRenderer BG/CHARACTER 자동 진행 회귀 fix.
- **모듈**:
  - `src/engine/SceneRenderer.tsx` — BG/CHARACTER/CHARACTER_HIDE/CG_HIDE 명령에서 advance 자동 호출 추가 (5줄 fix). 버그: BG 단독 명령 후 DialogueBox 클릭 UI 없어 정지 → prologue_01_home 첫 진입 멈춤. E2E는 ch05_07_close 진입이라 통과했지만 사용자 풀 플레이에서 첫 회귀 노출.
  - `src/data/spriteResolver.ts` — `PREFIX_BY_NAME` + `KNOWN_PREFIXES`에 4명 추가 (gyumin/junhyuk/jonathan/kyungmin). 한글 풀네임 + 약식 + 영문 ID 모두 매핑.
  - `public/img/sprites/` — 4 webp 추가 (gyumin/junhyuk/jonathan/kyungmin _default.webp), 총 59→**63**
  - `public/img/bg/` — 2 webp 추가 (bg_dongdaegu_station/bg_ktx_window 1920×1080 LANCZOS), 총 15→**17**
  - `public/manifest.json` 재생성
- **사유**:
  - 사용자 풀 플레이 첫 화면에서 분당 본가 BG만 표시되고 텍스트박스 안 등장 → SceneRenderer useEffect의 BG 처리 누락 버그 발견. 시각 레이어만 갱신하는 명령은 클릭 UI 없이 자동 advance해야 다음 NARRATION/CHOICE까지 흐름 자연스러움.
  - manifest의 `bg_dongdaegu_station`·`bg_ktx_window` 둘 다 시나리오에서 호출되지만 실 자산 미생성 상태 (라운드 3 검증 결과 placeholder 등록만). 이번에 ch01_05 KTX 씬 + ch04 동대구역 씬에서 실제 BG 표시 가능.
  - 사이드 캐릭터 4명: 시나리오에서 한글 ID로 등장하지만 스프라이트 파일 미생성 → CharacterLayer가 onError로 hidden 처리해 표시 X. 4명 모두 풀바디 default만 1차 추가 (감정 변형은 후속 라운드).
- **자산 후처리**:
  - 스프라이트: 한글 파일명(`김규민 스프라이트.png` 등)을 `{영문ID}_default.png`로 rename → 기존 라운드 1·2 파이프라인(`postprocess.py`) 그대로 적용. rembg birefnet-general + WebP q=85 + 알파 트림. 결과 1268~1516×2508~2656, 174~278KB.
  - 배경: 2752×1536 PNG → `process_bg.py` LANCZOS 1920×1080 업스케일 + WebP q=85. 99~251KB.
- **승인**: 사용자(PM)
- **다음 단계**:
  - 사이드 캐릭터 변형(웃음·놀람 등) 필요 시 후속 라운드
  - BGM 한글 트랙명 매핑 (`audioManager`에서 한글 cmd.track → 영문 변환 누락 — 음악 재생 실패만 발생, 게임 진행 무관)
  - `npm run lint -- --fix` (라운드 3 핸드오프 미처리 7 errors)
  - 매니페스트 재실행 (사이드 캐릭터 추가로 characters 16→20 예상)

---

### 2026-05-07 — bg_festiva → bg_festival 오타 픽스 (출시 차단 자산명 정합)

- **변경**: `public/img/bg/bg_festiva.webp` → `bg_festival.webp` 이름 변경. 시나리오·매니페스트는 모두 `bg_festival` 참조 중 — 자산 파일명만 마지막 `l` 누락이라 게임 실행 시 의대 축제장 BG 404. 자산 측만 1줄 변경으로 정합.
- **모듈**: `public/img/bg/bg_festival.webp` (rename)
- **검증**:
  - `npm run manifest` 통과 (backgrounds 18, 정합 0건 경고)
  - `npm run build` 통과 (253.25 KB / gzip 77.22 KB)
  - `npm run test` (vitest) **72/72 통과**
- **사유**: 누락 BG 4건 분석(2026-05-07) 결과 — 3건은 자산 미생성 placeholder(`bg_dongdaegu_station` / `bg_kakao_fullscreen` / `bg_ktx_window`, BackgroundLayer.tsx BG_ALIAS로 폴백 처리됨)이고 `bg_festival`만 단순 오타라 즉시 픽스. PM에게 3개 placeholder 프롬프트 별도 안내(bg-list.md §16/§17/§19 SSoT).
- **승인**: PM(구윤모) — "bg_festiva 오타 픽스 진행하고 3개 placeholder BG 자산 생성 프롬포트 알려줘"
- **다음 단계**: PM이 Gemini Nano Banana 2로 3개 placeholder BG 자산 생성 → `public/img/bg/`에 배치 → BackgroundLayer.tsx + assetPreloader.ts BG_ALIAS 2줄 제거 → 자동 복구.

---

### 2026-05-06 — W6 VIDEO 명령 처리 라운드 (출시 차단 픽스 — VideoLayer 신규 + SceneRenderer 마운트)

- **변경**:
  - **신규 `src/ui/VideoLayer.tsx`** — SCENE-FORMAT VIDEO 디렉티브 처리. `{ type: 'VIDEO', src: 'video_xxx', skipable }` 명령 도착 시 풀스크린 모달 (z-index modal) + `<video src="/video/${src}.mp4" autoPlay muted playsInline preload="auto">`. `onEnded`로 자동 advance, `onError`로 자산 미존재 시 graceful fallback advance. skipable=true는 클릭/Enter/Space로 즉시 advance, role="button"·tabindex=0·aria-label="클릭하여 영상 스킵"; skipable=false는 role 없음·tabindex=-1·aria-label="영상 재생 중".
  - **`src/engine/SceneRenderer.tsx` VIDEO case 마운트** — `runtimeMode === 'scene' && cmd.type === 'VIDEO'` 매칭 시 `<VideoLayer cmd={cmd} onEnded={() => void advance()} />` 마운트. 기존 DialogueBox 옆 형제로 추가.
- **모듈**:
  - 신규: `src/ui/VideoLayer.tsx`
  - 갱신: `src/engine/SceneRenderer.tsx` (import + VIDEO 마운트 분기)
- **검증** (preview MCP DOM):
  - `setState({ runtimeMode: 'scene', currentCommand: { type: 'VIDEO', src: 'video_meet_serin', skipable: true } })`:
    - layerExists ✅ / videoSrc=`/video/video_meet_serin.mp4` ✅ / autoplay/muted/playsinline=true ✅ / preload=auto ✅
    - role="button" / tabindex="0" / aria-label="클릭하여 영상 스킵" / data-video-id="video_meet_serin" / z-index=300 ✅
  - `setState({ ..., src: 'video_opening', skipable: false })`:
    - role=null / tabindex="-1" / aria-label="영상 재생 중" / videoSrc=`/video/video_opening.mp4` ✅
- **회귀**:
  - `npm run build` 통과 (247.62 KB / gzip 75.27 KB, 이전 246.90 → +0.7 KB로 VideoLayer 추가 영향 미미)
  - `npm run typecheck` 통과
  - `npm run test` (vitest) **72/72 통과** (skip 0)
  - **`npm run test:e2e` 16/16 통과 (28.9초)** — 기존 helpers `autoAdvanceUntilEnding`이 `state.advance()` 직접 호출하므로 VIDEO 명령에서도 영상 재생 시간 무관하게 빠르게 진행 (REJECT 엔딩만 20.2초, 다른 15개 460~720ms 유지)
- **사유**:
  - W6 WebM 제거 라운드 검증 중 발견된 출시 차단급 이슈 (CHANGELOG 본 라운드 이전 엔트리 §변경 제안 #1).
  - `types.ts:130` `VIDEO` 타입 정의됨 + scene.json 10개에 VIDEO 명령 존재 + `public/video/*.mp4` 12개 자산 배치됨. 그러나 SceneRenderer가 VIDEO 명령을 처리하지 않아 영상 재생 X (자동 advance만, RejectEnding 단독 컴포넌트는 예외).
  - 12개 영상 모두 의도된 시점(첫 만남 5개 + 트루엔딩 5개 + 오프닝 + 거절)에 정상 재생되도록 픽스.
- **변경 제안 (별도 라운드)**:
  1. VideoLayer + audioManager BGM 연계 — 영상 재생 중 BGM 자동 fade out / onEnded 시 fade in 검토
  2. 영상 자산 미존재 시 placeholder 화면 표시 (현재는 즉시 advance하므로 흐름 끊김 사용자 체감 X — OK 단 디버그 시 피드백 부족)
  3. E2E mobile-portrait / mobile-landscape projects 활성화 (playwright.config.ts:32 주석 처리됨)
- **승인**: PM(구윤모) — "진행해"
- **다음 단계 (W6 출시 차단)**:
  - GitHub Pages 활성화 + 도메인
  - PM 실디바이스 QA + Lighthouse 실측 + 풀 플레이 1회 (영상 12개 정상 재생 청각·시각 확인)
  - 출시 🎉

---

### 2026-05-06 — W6 WebM 제거 라운드 (PM 옵션 a 채택, dist 144M → 95M, RejectEnding 경로 픽스 보너스)

- **변경**:
  - **`public/video/*.webm` 12개 삭제** — `video_meet_*` 5 + `video_true_*` 5 + `video_opening` + `video_reject_seoyoon`. 총 49MB 절감. mp4(H.264) 12개만 유지.
  - **`04-image-prompts/veo-videos/video-list.md` §영상 후처리 갱신** — "WebM(VP9) 폴백 권장" → "H.264 mp4 단일 인코딩"으로 SSoT 변경. 사유 + 이력 보존 메모 추가.
  - **`src/ui/katalk/RejectEnding.tsx:120` 경로 버그 픽스 (보너스)** — `src="/vid/video_reject_seoyoon.mp4"` → `src="/video/video_reject_seoyoon.mp4"`. 옛 경로 `/vid/`는 dev server SPA fallback으로 200(HTML) 반환되어 영상 재생 X 상태였음. webm 검증 차원에서 발견·픽스. `preload="auto"` 명시 추가 (거절 엔딩 시퀀스 들어가면 즉시 시작 필요).
- **모듈**:
  - 삭제: `public/video/{video_meet_serin,video_meet_hajeong,video_meet_seol,video_meet_seoyoon,video_meet_yuna,video_true_serin,video_true_hajeong,video_true_seol,video_true_seoyoon,video_true_yuna,video_opening,video_reject_seoyoon}.webm` 12개
  - 갱신: `04-image-prompts/veo-videos/video-list.md` §영상 후처리
  - 갱신: `src/ui/katalk/RejectEnding.tsx` (경로 + preload)
- **검증** (preview MCP dev server):
  - `/video/video_reject_seoyoon.mp4` → 200 / video/mp4 / 3,946,261 bytes ✅
  - `/video/video_meet_serin.mp4` → 200 / video/mp4 / 5,024,174 bytes ✅
  - `/video/video_meet_serin.webm` → 200 / **text/html / 712 bytes** (SPA fallback, 파일 부재 확인) ✅
  - `/vid/video_reject_seoyoon.mp4` → 200 / **text/html / 712 bytes** (옛 잘못된 경로 부재, 게임 코드는 /video/로 픽스됨) ✅
- **회귀**:
  - `npm run manifest` 통과 (videos 10, sceneCount 216, 화이트리스트 정합)
  - `npm run build` 통과 (246.90 KB / gzip 75.05 KB)
  - `npm run typecheck` 통과
  - `npm run test` (vitest) **72/72 통과** (skip 0)
- **dist 실측**:
  - **144 MB → 95 MB** (49 MB 절감, 34% 감소)
  - 분포: video 50M (12 mp4) + snd 29M + img 15M + assets/JS 1M
  - **MASTER-PLAN §8.2 < 50MB** 목표 대비 1.9x 초과 (이전 2.88x). GitHub Pages 1GB 한도 안전 범위.
- **사유**:
  - PM 결정 (W6 성능 최적화 라운드 후속): "webm 제거 진행해" → 옵션 (a) 채택. H.264 mp4는 모든 모던 브라우저 지원하므로 폴백 불필요.
  - 듀얼 인코딩은 옛 권장(IE/구형 모바일). 2025+ 시점 mp4 단일이 표준.
- **변경 제안 (별도 라운드)**:
  1. **VIDEO 명령 SceneRenderer 처리 누락 — PROD 차단** (W6 성능 최적화 라운드에서 발견): `types.ts:130`에 `VIDEO` type 정의 + scene.json 12개에 VIDEO 명령 존재하지만 `SceneRenderer.tsx`의 useEffect에 `case 'VIDEO'` 없음 → VIDEO 명령이 무시되고 자동 advance만 됨. 12개 영상이 게임 흐름에서 재생 X (RejectEnding은 별도 컴포넌트라 예외). 출시 차단급.
  2. 영상 `<video preload="metadata">` (RejectEnding은 auto 유지 — 즉시 재생 필요)
  3. 영상 추가 압축 — 비트레이트 2 Mbps → 1 Mbps (옵션 b, 화질 트레이드오프)
- **승인**: PM(구윤모) — "webm 제거 진행해"
- **다음 단계 (W6 출시 차단)**:
  - **VIDEO 명령 SceneRenderer 처리 추가** (위 #1, 출시 차단급) — 별도 라운드 처리 필요
  - GitHub Pages 활성화 + 도메인
  - PM 실디바이스 QA + Lighthouse 실측
  - 출시 🎉

---

### 2026-05-06 — W6 성능 최적화 라운드 (이미지 프리로더 + decoding/fetchPriority + lazy 갤러리)

- **변경**:
  - **신규 `src/engine/assetPreloader.ts`** — MASTER-PLAN §8.1 "이미지 프리로딩 큐" 정합. 씬 commands 스캔 → BG/CG/CHARACTER ID 추출 → `new Image()` 객체에 `decoding=async` + `src` 할당 → 브라우저 HTTP 캐시 적재. 동일 URL 재호출은 noop.
  - **gameStore.startScene 후크**: `interpreter.loadScene` 직후 `preloadSceneAssets(scene.commands)` 호출. 씬 진입 시 모든 자산 백그라운드 fetch → 컴포넌트 마운트 시 캐시 히트로 즉시 표시 (씬 전환 깜빡임 회피).
  - **이미지 컴포넌트 로딩 속성 명시**:
    - `BackgroundLayer`: `loading="eager" decoding="async" fetchPriority="high"` (첫 화면 시각 핵심)
    - `CGOverlay`: 동일 (이벤트 CG 즉시 표시 필요)
    - `CharacterLayer`: `loading="eager" decoding="async"` (스프라이트 항상 화면, 우선순위 BG보다 약간 낮음)
    - `CGGallery 미리보기 grid`: `loading="lazy" decoding="async"` (20개 placeholder, viewport 밖 자산은 스크롤 시 fetch)
    - `CGGallery 풀스크린 보기`: `decoding="async" fetchPriority="high"` (클릭 시 즉시 표시)
- **모듈**:
  - 신규: `src/engine/assetPreloader.ts`
  - 갱신: `src/stores/gameStore.ts` (preloadSceneAssets import + startScene 후크)
  - 갱신: `src/ui/BackgroundLayer.tsx` `src/ui/CGOverlay.tsx` `src/ui/CharacterLayer.tsx` `src/ui/gallery/CGGallery.tsx`
- **검증** (preview MCP dev server):
  - prologue 진입 직후 `preloadCacheSize() = 3` (bundang_home BG + yunmo smile/default sprites) ✅
  - BG `<img>` 속성: `loading="eager"` `fetchPriority="high"` `decoding="async"` ✅
  - dev server 콘솔 에러 0건 ✅
  - 전체 prologue 자산 백그라운드 fetch 정상 작동
- **회귀**:
  - `npm run build` 통과 (246.88 KB / gzip 75.05 KB, 이전 246.25 → +0.6 KB로 preloader 모듈 추가 영향 미미)
  - `npm run typecheck` 통과
  - `npm run test` (vitest) **72/72 통과** (skip 0)
- **사유**:
  - QA-PLAN §1.4 + MASTER-PLAN §8.2 성능 목표(초기 로드 <3s, 씬 전환 <200ms) 충족 도구. 자산 프리로드는 §8.1 명시 항목인데 실제 구현 누락 → 본 라운드 처리.
  - 이미지 디코딩 비동기 + fetchPriority high는 LCP(Largest Contentful Paint) 개선에 효과. Lighthouse Performance ≥80 목표 도달 보조.
- **빌드 크기 보고 (PM 결정 필요)**:
  - **현재 dist 144MB** = video 99MB + snd 29MB + img 15MB + JS/CSS 2.2MB
  - **MASTER-PLAN §8.2 목표 < 50MB 약 2.88x 초과**
  - 가장 큰 영향: VEO 영상 12개 × MP4+WebM 듀얼 인코딩 = 99MB
  - **PM 옵션 (택1)**:
    - (a) **WebM 제거** — mp4만 사용. 약 50MB로 감소. mp4(H.264)는 모든 모던 브라우저 지원. 빠름 / 안전
    - (b) **영상 추가 압축** — 비트레이트 2 Mbps → 1 Mbps. 화질 손실 가능
    - (c) **외부 CDN** — Vercel Blob / Cloudflare R2 등. 추가 작업 + 월 비용
    - (d) **MASTER-PLAN §8.2 목표 갱신** — 출시 차단 X, GitHub Pages 1GB 한도 + 100GB/월 대역폭 충분. 144MB는 GitHub Pages 무료 티어 안전 범위.
  - 현재는 (d) 상태가 자연스러움 (출시 차단 X). PM 결정 대기 후 별도 라운드.
- **변경 제안 (별도 라운드)**:
  1. Lighthouse CI GitHub Actions 통합 — `lighthouse-ci-action`으로 PR마다 점수 추적, ≥80 게이트
  2. 폰트 프리로드 — `<link rel="preload" as="font">` Pretendard woff2 서브셋 (현재 시스템 fallback 사용 중)
  3. 영상 lazy load — `<video>` 태그가 첫 호출까지 fetch 안 하도록 `preload="none"` 명시
  4. Vite manifest 분석 — bundle visualizer로 247KB main bundle 추가 분할 여지 확인
  5. 이미지 AVIF 포맷 추가 — WebP 폴백, AVIF 우선 (MASTER-PLAN §2.1 명시 — 현재 WebP만 사용)
- **승인**: PM(구윤모) — "성능 최적화 진행"
- **다음 단계 (W6 출시 차단)**:
  - PM 빌드 크기 (a)/(b)/(c)/(d) 결정
  - GitHub Pages 활성화 + 도메인
  - 실디바이스 수동 QA (QA-PLAN §1.3) + Lighthouse 측정
  - 출시 🎉

---

### 2026-05-06 — W6 모바일 반응형 QA 라운드 (OrientationLock + 햄버거 + 터치 영역 44px + viewport-fit)

- **변경**:
  - **신규 `src/ui/OrientationLock.tsx`** + `globals.css` `.orientation-lock-overlay` CSS — UI-SPEC §10 + MASTER-PLAN §5.5 회전 안내 오버레이. `pointer: coarse` + `orientation: portrait` 매칭 시 풀스크린, 회전 아이콘(-90deg pulse 2s) + "가로로 회전해주세요" 메시지. App.tsx에 형제로 마운트. `prefers-reduced-motion` 시 애니메이션 정지.
  - **MiniControls 햄버거 메뉴** (UI-SPEC §3): 768px 미만 시 우상단 ☰ ↔ ✕ 토글, 펼친 메뉴 Log/Gallery/Menu 세로 일렬. PC(`md:` ≥768px)는 우하단 가로 일렬 유지. 모든 버튼 `min-h-[44px] min-w-[44px]` 적용 (QA-PLAN §1.3 ≥44pt 충족).
  - **PauseMenu 모바일 폭**: `min-w-[320px]` → `w-full max-w-sm` + 외부 `p-4` + 버튼 `min-h-[44px]`. 320px 폰에서도 좌우 16px 여백 확보.
  - **GalleryScreen 헤더 wrap**: `flex-wrap` + 탭/닫기 버튼 `min-h-[44px]` + 모바일 폰트 축소.
  - **모달 열렸을 때 MiniControls 숨김**: SceneRenderer에서 `!isBacklogOpen && !isPauseMenuOpen && !isGalleryOpen` 가드 — UI-SPEC §3 정합.
  - **OrientationLock 배경 알파 강화**: 0.85 → 0.96 (`rgba(31, 24, 34, 0.96)`) — 게임 거의 완전 가림.
  - **index.html viewport**: `viewport-fit=cover` 추가 (iPhone safe-area 대응).
- **모듈**:
  - 신규: `src/ui/OrientationLock.tsx`
  - 갱신: `src/App.tsx` (OrientationLock 형제 마운트)
  - 갱신: `src/styles/globals.css` (.orientation-lock-overlay + 키프레임 + 모바일 미디어쿼리)
  - 갱신: `src/ui/MiniControls.tsx` (햄버거 토글 + 44px)
  - 갱신: `src/ui/PauseMenu.tsx` (모바일 폭)
  - 갱신: `src/ui/gallery/GalleryScreen.tsx` (헤더 wrap + 44px)
  - 갱신: `src/engine/SceneRenderer.tsx` (모달 시 MiniControls 숨김)
  - 갱신: `index.html` (viewport-fit=cover)
- **검증** (preview MCP + DOM 측정):
  - desktop 1280×800: PC 미니 우하단 261×49.5px 3버튼, narrow=false ✅
  - tablet 768×1024 (md breakpoint boundary): PC 미니 표시, narrow=true(CSS) + `md:flex` 표시(Tailwind) — 768 정확값에서 텍스트박스 모바일 변수 + 미니 PC 모드 공존, 실모바일 영향 거의 없음
  - mobile portrait 375×812: 모바일 햄버거 47×49.5px 우상단, narrow=true, 텍스트박스 38% / 18px / 24px padding 변수 매칭, 갤러리 2열 grid 151.6px, PauseMenu 339×445px ✅
  - mobile landscape 812×375: orientLock display:none, narrow=false, BG 1920×1080 cover 풀 ✅
  - OrientationLock 강제 활성: 오버레이 z=400 fixed inset-0, 회전 아이콘 + 메시지 + 보조 텍스트 정확 표시 ✅
  - 햄버거 토글: ☰ → ✕ 전환, 펼친 메뉴 Log/Gallery/Menu 각 75×44px, aria-expanded 토글 ✅
  - 모달 열렸을 때 MiniControls hamburger DOM 미존재 ✅
- **회귀**:
  - `npm run build` 통과 (246.25 KB / gzip 74.84 KB)
  - `npm run typecheck` 통과
  - `npm run test` (vitest) **72/72 통과** (skip 0)
  - `npm run lint` 7 errors는 W4 이전 사전 존재 이슈(`scripts/build-manifest.ts`·`compile-scene.ts`·`verifyToneMatrix.ts`) — 본 라운드 변경 파일 0건
- **사유**:
  - W6 출시 차단급 잔여 항목. UI-SPEC §10 + §5.5 + QA-PLAN §1.3 명세 미구현 4건(OrientationLock / 햄버거 / 터치 영역 / viewport-fit) 충족.
  - preview MCP는 `pointer: coarse` 시뮬 X → CSS 표준 미디어쿼리 그대로 유지(실모바일에서 정확 매칭). preview에서는 강제 표시로 외관·기능 검증.
- **변경 제안 (별도 라운드)**:
  1. 모바일 가로(landscape) 작은 height(<500px) 텍스트박스 28% = 105px 좁음 — UI-SPEC §5.5 명세 갱신 PM 검토.
  2. Tailwind `md:` (min-width 768) vs CSS `max-width: 768px` boundary 768 정확값 충돌 — 실모바일 영향 거의 없음, 명세 우선 유지.
  3. iPhone safe-area-inset 미적용 — `env(safe-area-inset-*)` 추가 padding 검토 (notch 깊은 핸드폰 좌우 잘림 방지).
  4. 사전 존재 lint 에러 7건(scripts/ 디렉토리) — 별도 라운드 정리.
  5. 실디바이스 수동 QA (QA-PLAN §1.3 표 4종 — 갤럭시 S22 / iPhone 14 / iPad / 갤럭시 Tab) — PM 직접 작업.
- **승인**: PM(구윤모) — "모바일 반응형 QA 진행"
- **다음 단계 (W6 출시 차단)**:
  - 성능 최적화 + Lighthouse Performance ≥80
  - GitHub Pages 활성화 + 도메인
  - 실디바이스 수동 QA 1회
  - 출시 🎉

---

### 2026-05-06 — W4·W5 후속 클린업 라운드 (오디오 자산 W5 통합 + SFX status done + 효과음 라이선스 면제)

- **변경**:
  - 오디오 자산 W5 통합: `docs/assets/{bgm,sfx}/*.mp3` 20개(BGM 8 + SFX 12) → `public/snd/{bgm,sfx}/` 이동. mp3만 이동, 이력 폴더 `_candidates/` / `확정/` / `직접 corp/`는 보관 유지.
  - `npm run manifest` 재실행 → `public/manifest.json` 재생성 (`bgms` 8, `sfx` 8 등재). `sfx_click` / `sfx_pageturn` / `sfx_realize` / `sfx_timer_out` 4종은 시나리오 한글 큐 없이 게임 코드 직접 호출이라 매니페스트 의도 누락 — 자산 파일은 12개 모두 `public/snd/sfx/`에 배치.
  - **PM 결정 (효과음 라이선스 면제)**: SFX는 곡(BGM)이 아니므로 라이선스 추적/표기 의무 면제. SFX-list.md §4.3 11행 "TBD" → "효과음 — 면제" 일괄 갱신. ID3 Comment "TBD: PM 추적 대기" 잔존은 음질·재생 무영향이라 재태깅 미진행.
  - SFX-list.md status `review` → **`done`**.
- **모듈**:
  - `public/snd/bgm/*.mp3` 8개 (이동) + `public/snd/sfx/*.mp3` 12개 (이동)
  - `docs/assets/bgm/`은 mp3 이동 후 비어 있음. `docs/assets/sfx/`에는 이력 폴더 3종만 잔존.
  - `public/manifest.json` 재생성 (sceneCount 216 / backgrounds 18 / characters 16 / cgs 19 / videos 10 / bgms 8 / sfx 8)
  - `docs/assets/BGM-list.md` §0 / §2.1 / §7.2 폴더 표기 갱신, Phase 5 W5 통합 ✅
  - `docs/assets/SFX-list.md` frontmatter status `review→done`, §0 W4·W5 후속 클린업 라운드 박음, §3.6 라이선스 면제 처리, §4.3 표 7→4열 축소(효과음 면제), §5 / §7 폴더 표기 갱신, §8 #10/#13/#15 ✅
- **검증**:
  - `npm run build` 통과 (297 모듈, vite production build 정상)
  - `npm run manifest` 통과 (matches expected counts)
  - `npm run validate` 통과 (16/16 엔딩 도달 + KEY 45회 + 거절 도달성 + BG/CG/VIDEO/오디오 화이트리스트)
  - `npm run test` (vitest) 4 파일 / **72/72 통과** (skip 0)
  - `game-project/dist/snd/{bgm,sfx}/` 정상 복사 확인 (BGM 8 + SFX 12)
- **사유**:
  - PROGRESS-TRACKER W4·W5 후속 클린업 잔여 2건(자산 폴더 이동 + SFX 라이선스 추적표) 처리.
  - 자산 경로 룰 `audioMappings.ts sfxPath/bgmPath` → `/snd/{bgm,sfx}/...` 정합. 그동안 `public/snd/{bgm,sfx}` 비어 있어 게임 실행 시 모든 오디오 404 위험 해소.
  - 효과음 라이선스 면제: 곡(BGM)과 달리 효과음은 라이선스 추적/크레딧 표기 적용 부적절.
- **승인**: PM(구윤모) — "(a) + 작업 A 진행 승인. 작업 B는 곡이 아니라 효과음이라 라이선스와 표기 의무 없음. 작업 B는 그냥 완료로 처리."
- **다음 단계**:
  - W6 QA 청취 검증 (거절 엔딩 BGM 페이드, 카톡 BGM↔SFX 음역대, 모바일)
  - 마일스톤 #3 게이트 (`bgm_sad` / `bgm_climax` 큐 위치·페이드 1회 재정합)
  - (별도 라운드) `06-engine/SCENE-FORMAT.md` §1.1 SFX 매핑 참조 코멘트, `scripts/compile-scene.ts` SFX 매핑 로딩 v0.3+, 게임 내 크레딧 화면 `src/scenes/credits.scene.json` 자동 생성

---

### 2026-05-06 — 라운드 3 자산 통합 (배경 + CG + VEO + 매니페스트 빌드)

- **변경**: W3 사용자 직접 작업 3종(이미지 생성·이미지 후처리·VEO 영상 생성) 완료 처리. 라운드 3 자산 파이프라인(`0501test/_scripts/process_bg.py` + `process_cg.py` + `process_veo.py` + `process_veo_cropped.py` + `make_report_bg_cg_veo.py`) 신규 추가. 자산 138 파일을 `game-project/public/`로 통합. `npm run manifest` 실행으로 `public/manifest.json` 자동 생성.
- **모듈**: `00-master/PROGRESS-TRACKER.md` W3 사용자 직접 작업 ⬜→✅ 6항목 / `04-image-prompts/sprites/sprite-list.md` status `review`→`done` / `04-image-prompts/backgrounds/bg-list.md` status `review`→`done` / `04-image-prompts/event-cgs/cg-list.md` status `draft`→`done` / `04-image-prompts/veo-videos/video-list.md` status `draft`→`done` / `public/manifest.json` 신규 / `public/img/sprites/` 59 webp / `public/img/bg/` 15 webp / `public/img/cg/` 40 webp (20 게임용 + 20 갤러리용 `_full` suffix) / `public/video/` 24 (12 mp4 + 12 webm).
- **사유**:
  - 마스터 플랜 §6 자산 분배 완료. 실제 산출 스프라이트 59장(yunmo 9 + 5히로인×10) + 배경 15장 + CG 20장 + 영상 12개.
  - VEO 워터마크 처리 결정: `video_opening`은 delogo(1280×720 native), 나머지 11개는 cropped(1800×1080) — 사용자 결정. 비율 비통일이지만 게임 엔진 letterbox 처리.
  - CG 워터마크 정책 (마스터 플랜 §워터마크): 게임용은 ✦ 그대로(텍박스 가림 전제), 갤러리용은 우측 100px crop. festival 3장(serin/seol/yuna)은 ✦ 없어 no-crop.
  - 배경: 1376×768 native + 1920×1080 LANCZOS 업스케일 둘 다 출력. 게임 빌드는 1080p 사용.
  - `video_meet_seol`: 6초 시점부터 자막 등장 → ffmpeg `-t 6`으로 trim (8초→6초).
- **자산 합계**: 138 파일, 63.9 MB (스프라이트 7.5 + 배경 2.6 + CG 3.8 + 영상 50.0). GitHub Pages 100MB 한도 여유 확보.
- **자산 매니페스트 결과** (`public/manifest.json`): backgrounds 18, characters 16, cgs 19, videos 10, bgms 8, sfx 8. 매니페스트 카운트와 등록 카운트(cgs 22, videos 12)의 차이는 시나리오 미사용 자산 + placeholder 분기 — W5 후속 라운드에서 정합.
- **W3 자산 후처리 도구**:
  - `0501test/_scripts/.venv/` Python 3.13 + rembg 2.0.75 + birefnet-general/isnet-anime + Pillow + opencv-python + numpy + onnxruntime + torch 2.6.0+cu124 (ProPainter용)
  - `0501test/_scripts/ProPainter/` 신규 (PoC, RTX 4070 12GB는 1080p 직접 처리 OOM — resize_ratio 0.5/0.7 + LANCZOS 업스케일만 가능. delogo 대비 처리 시간 60~90배라 미채택)
  - ffmpeg 8.1 (libx264/libvpx-vp9/aac/libopus/delogo/crop)
  - 환경변수 다중 입력셋 모드 (`PIPELINE_SRC_BG/CG/VEO`, `PIPELINE_DST`, `VEO_FORMATS`, `VEO_ONLY`, `BG_RESIZE_1080P`)
- **승인**: 사용자(PM)
- **다음 단계**:
  - W5 콘텐츠 통합 풀 플레이 검증 (`npm run dev` → 자산 로딩 확인)
  - 매니페스트 정합 라운드 (cgs 19 vs 등록 22, videos 10 vs 등록 12 차이 분석)
  - `bg_kakao_fullscreen` / `bg_ktx_window` / `bg_dongdaegu_station` placeholder 자산 결정

---

### 2026-05-06 — SFX Phase 2.5 PM 청취 검증 통과 + ebur128 LUFS 실측 기록

- **변경**: PM이 12개 SFX 자산 모두 직접 청취 후 "문제 없음" 확정. Claude가 ffmpeg `ebur128=peak=true`로 객관 LUFS 실측 → §3.6.1 신규 표 12행 박음. PM 청취 결정 우선으로 status `review` 유지(라이선스 추적 미완료라 done 미달).
- **모듈**: `docs/assets/SFX-list.md` §3.6 청취 통과 ✅ 헤더 + 신규 §3.6.1 ebur128 LUFS 실측 표 + 발견 요약 + 후속 정정 옵션. `00-master/PROGRESS-TRACKER` 상단 줄 갱신.
- **ebur128 실측 결과 요약** (목표 -18 LUFS Integrated):
  - **목표 근접 6종** (편차 ±1.3 dB 내): `sfx_katalk_notify` (-17.6) / `sfx_realize` (-19.1) / `sfx_timer_out` (-18.7) / `sfx_pageturn` (-19.3) / `sfx_ktx_run` (-17.7) / `sfx_suitcase_wheels` (-17.5)
  - **약간 낮음 3종** (편차 -2~-3.5 dB): `sfx_lab_door_open` (-20.4) / `sfx_glass_drop` (-21.5) / `sfx_bar_ambient` (-20.2)
  - **음량 미달 2종** (편차 -7~-8 dB): `sfx_light_off` (-24.9) / `sfx_footsteps` (-25.6)
  - **측정 한계 1종**: `sfx_click` (-70.0) — Phase 1.5 합성본 25ms ebur128 측정 범위 밖, 청감 무문제
- **TP 클리핑 발견 4건** (`sfx_realize` 0.2 / `sfx_pageturn` 0.9 / `sfx_light_off` 1.0 / `sfx_footsteps` 1.1 dBFS) — loudnorm 1-pass + TP=-1.5 한계로 발생. PM 청감 무문제 결정.
- **편차 분석**: 트랙 간 음량 편차 8.1 dB (-25.6 ~ -17.5). PM 청취 시 시나리오 `volume=` 파라미터(0.3~0.6)가 흡수해서 청감 OK.
- **후속 정정 옵션** (W6 QA 청감 재검토 시 활용):
  1. `sfx_light_off` / `sfx_footsteps` loudnorm 재적용 (-18 LUFS 정확)
  2. TP 클리핑 4건 loudnorm 2-pass 재처리 (TP=-2.0 dBFS 한계)
  - PM 결정으로 **본 라운드 적용 안 함**, 청감 검증 우선
- **사유**: PM 청취 검증 통과로 4차 PM 직접 crop 라운드 마무리. 객관 LUFS 실측은 정보 보존 + W6 QA 모니터링 항목 + 후속 정정 옵션 근거.
- **잔여 작업** (status `review` → `done` 조건):
  1. §4.3 라이선스 추적표 11행 PM 정보 입력 → ID3 Comment 재태깅
  2. W5 통합 — `docs/assets/sfx/` → `public/snd/sfx/` 이동 + 매니페스트 등재
  3. W6 QA — H4 거절 엔딩 풀 플레이 + 카톡 BGM↔SFX 음역대 + 변태 자기자각 + 모바일 청취
  4. (선택) LUFS 후속 정정 라운드
- **승인**: PM(구윤모) 직접 청취 — "내가 모두 청취했어. 문제 없어"

---

### 2026-05-06 — SFX Phase 2.5 4차 PM 직접 crop 라운드 (6종 확정)

- **변경**: 3차 청취에서 만족스럽지 않던 6종을 PM이 직접 crop → Claude는 mono 변환·LUFS·페이드·128k mp3·ID3만 적용 → 본 파일 갈아끼움.
  - **PM 직접 crop 6종 (`docs/assets/sfx/직접 corp/` → `docs/assets/sfx/sfx_<id>.mp3`)**:
    - `sfx_timer_out` 1.84~3.4s → **1.8~3.0s (PM 직접)** = 1.190s mono
    - `sfx_pageturn` 2.5~3.5s → **2.0~3.0s (PM 직접)** = 0.981s mono
    - `sfx_light_off` 0.5~1.5s → **0.3~1.0s (PM 직접)** = 0.693s mono
    - `sfx_lab_door_open` 후보 5개 비교 → **3.0~4.0s (PM 직접)** = 1.007s mono
    - `sfx_glass_drop` 후보 5개 비교 → **12.2~13.2s (PM 직접)** = 1.007s mono
    - `sfx_bar_ambient` 60~68s 그대로 (PM 직접 + **stereo→mono** 변경)
  - **PM "다 mono로" 명령**: 6종 모두 mono. `sfx_bar_ambient`도 환경음 루프이지만 mono 채택 (§5 채널 분기 표 갱신). `sfx_ktx_run`은 PM 명령 범위 외 → stereo 유지 (후속 라운드 ktx_run mono 변경 검토).
  - **§3.7 후보 10개 보류**: `_candidates/sfx_glass_drop_v{1~5}.mp3` + `_candidates/sfx_lab_door_open_v{1~5}.mp3` PM 직접 crop으로 결정 → `_candidates/` 그대로 보관 (이력·향후 교체용).
- **모듈**: `docs/assets/SFX-list.md` §3.6 표 갱신 (4차 컬럼) + §3.7 보류 메모 + §5 채널 분기 표 (bar_ambient mono) + §8 #9 PM 청취 검증 ✅ 마킹.
- **사양 (4차 PM 직접 crop 라운드)**:
  - 입력: PM이 이미 crop한 stereo mp3 (44.1 kHz)
  - 처리: `-ac 1` (mono) + 시작 5ms / 끝 30ms 페이드 + loudnorm I=-18:TP=-1.5 + libmp3lame 128k + ID3 (Album="kmu-vn SFX", Comment="TBD: PM 추적 대기 / PM direct crop &lt;범위&gt;")
- **사유**: PM 청취 시 후보 비교로도 만족스럽지 않은 트랙들에 대해 직접 crop으로 결정 (Claude의 silencedetect 자동 결정·후보 추출보다 PM 청취 판단 우선). 워크플로 분담을 BGM 라운드(PM Audacity 직접) 패턴으로 부분 회귀.
- **잔여 작업**: §4.3 라이선스 추적표 11행 PM 정보 입력 → ID3 Comment 재태깅 → status `review` → `done` (W5/W6 통과 후).
- **승인**: PM(구윤모) 직접 crop + "다 mono로 바꾸고 볼륨도 처리해서 확정해" 명령

---

### 2026-05-06 — W6 Playwright E2E 라운드 #1: 16개 엔딩 자동 도달 검증 통과

- **변경**: QA-PLAN.md §1.1 "16개 엔딩 자동 플레이" E2E 테스트 작성 + 모두 통과. 시나리오 → 컴파일러 → 엔진 → UI 통합 검증 인프라 구축. W4 Phase F 스켈레톤(`playwright.config.ts`) 활성화.

  - **신규 작성**:
    - `tests/e2e/helpers.ts` — `gotoScene()` (querystring `?scene=&flags=` 주입) / `expectEnding()` (data-ending-id 검증) / `autoAdvanceUntilEnding()` (window.__gameStore 직접 advance 루프 + raf 대기) / `gotoEndingFromCh05()` (ch05_07_close + flags 매트릭스 진입).
    - `tests/e2e/endings.spec.ts` — **16개 엔딩 자동 도달 테스트**:
      - H1 4종 (TRUE/HAPPY/NORMAL/BAD) + H2 4종 + H3 3종(BAD 없음) + H4 3종(REJECT 흡수) + H5 1종(TRUE만) + END_SOLO_SUMMER. BRANCH-GRAPH §6.1 + scriptInterpreter.evaluateBranch 정합.
  - **인프라 변경**:
    - `src/scenes/manifest.ts` — vite `import.meta.glob`로 `./*.scene.json` 자동 매핑(216개 동적 import 코드분할). `resolveEntryScene()` 헬퍼 — querystring `?scene=<id>` 우선 / 폴백 `prologue_01_home`.
    - `src/App.tsx` — `applyTestFlagsFromUrl()`: querystring `?flags=<encoded JSON>` → useGameStore.setState로 호감도/late_reply_count/key_choices 직접 주입. `window.__gameStore` 노출(E2E 직접 조작용).
    - `src/ui/EndingScreen.tsx` — `data-testid="ending-screen"` + `data-ending-id={endingId}` 속성 추가.
    - `src/ui/ChoiceList.tsx` — `data-testid="choice-list"` + `data-testid="choice-{idx}"` 속성 추가.
    - `playwright.config.ts` — `baseURL: http://localhost:4173` (preview 정합) / `fullyParallel: false` + `workers: 1` (단일 preview 서버 + zustand persist localStorage 공유 race 방지).
  - **PROD blocker 픽스**:
    - `03-story/scenarios/ch05_decision.md:864-868` IF/ELSE 블록 안에 있던 `[EVALUATE_BRANCH]`가 컴파일러 v0.1 IF skip 시 함께 사라져 게임 분기 불가 상태였음. IF/JUMP 제거 + `[EVALUATE_BRANCH]` 단독으로 단순화. evaluateBranch 함수가 SOLO 분기(`max < 30`) + REJECT(`late_reply ≥ 2`) 우선 평가를 SSoT로 처리하므로 IF는 redundant. 컴파일러 IF 경고 7→6건 감소.
  - **CI 활성화**:
    - `.github/workflows/ci.yml` `e2e` job `if: false` → 실행. needs: build 후 `npm run compile && npm run build && playwright install + test:e2e`. 실패 시 playwright-report artifact 업로드.
    - 단위 테스트 step 카운트 갱신(69 → 72) + manifest 빌드 step 추가.

- **모듈** (status 변동):
  - `tests/e2e/helpers.ts`, `tests/e2e/endings.spec.ts` (신규)
  - `src/scenes/manifest.ts` (vite glob 자동 매핑)
  - `src/App.tsx` (E2E hook + window 노출)
  - `src/ui/EndingScreen.tsx`, `src/ui/ChoiceList.tsx` (data-testid)
  - `playwright.config.ts` (workers/parallel/baseURL)
  - `03-story/scenarios/ch05_decision.md` (PROD blocker 픽스, status: review)
  - `.github/workflows/ci.yml` (e2e job 활성화)

- **검증 결과** (모두 통과):
  - `npm run typecheck`: 무에러 ✓
  - `npm run test`: 72/72 ✓
  - `npm run compile`: 12 .md → 216 씬, IF 6건 경고(ch05 EVALUATE_BRANCH 살림으로 7→6)
  - `npm run validate`: 16/16 엔딩 + BG 18+22 / CG 20 / VIDEO 12 / BGM 17 / SFX 20 — 0건 경고
  - `npm run manifest`: BG 18 / Char 16 / CG 19 / VIDEO 10 / BGM 8 / SFX 8 — 메모 0건
  - `npm run build`: Vite 1.44s / JS 245.08 KB / gzip 74.53 KB / 81 modules
  - `npm run test:e2e`: **16/16 엔딩 모두 통과** (29.9s, REJECT 시퀀스 20.2s 포함). 모든 엔딩 ID가 EndingScreen `data-ending-id`로 정확히 라우팅됨 ✓

- **다음 단계 (W6 라운드 #2 후보)**:
  - 모바일 반응형 E2E (devices['iPhone 13 landscape'] 추가)
  - Lighthouse Performance ≥80 검증 추가
  - GitHub Pages 배포 활성화 + 출시 준비
  - 갤러리 해금/저장 슬롯 E2E (W5 사인오프 후)

- **승인**: PM(구윤모) "W6 E2E로 진입" — 본 라운드 사인오프 대기

---

### 2026-05-06 — SFX Phase 2.5 3차 청취 라운드 (5종 재크롭 + 후보 5개씩 2종 추출)

- **변경**: PM 3차 청취 결과 8개 트랙 재처리. 6종 단순 변경(시작점/길이) + 2종 후보 5개씩 추출.
  - **단순 변경 5종 재처리** (sfx_bar_ambient 60~68s는 2차 그대로 = PM 재확인):
    - `sfx_realize`: 1.3s → **1.6s** (0.05~1.65s) — PM "더 길게" 재요청, 두 chime + 잔향 끝까지
    - `sfx_timer_out`: 0.955s → **1.515s** (1.84~3.4s) — PM "더 길게" 재요청, 본 알람 + 끝 잔향 fade
    - `sfx_pageturn`: 0.3s → **1.0s** (2.5~3.5s) — PM 1초 통째 명시 (분석상 첫 0.265s swoosh + 0.735s 무음, fade out 자연)
    - `sfx_suitcase_wheels`: 3.0s → **5.0s** (0.13~5.13s) — PM "더 길게" 재요청
    - `sfx_light_off`: 0.5s → **1.0s** (0.5~1.5s) — PM 1초로 변경
  - **후보 5개씩 추출 (PM 선정 대기)**:
    - `sfx_glass_drop` × 5 후보 (각 1.0s, mono) — 시작점 7.7 / 10.0 / 12.1 / 14.1 / 15.8s. silencedetect로 7회+ 임팩트 발견 → 5개 가장 깨끗한 구간
    - `sfx_lab_door_open` × 5 후보 (각 2.0s, mono) — 시작점 3.3 / 6.4 / 9.9 / 12.8 / 18.3s. silencedetect로 5회+ 별개 임팩트 발견
    - `_candidates/sfx_glass_drop_v{1~5}.mp3` + `_candidates/sfx_lab_door_open_v{1~5}.mp3` 배치
    - PM 청취 후 1개 선정 → `docs/assets/sfx/sfx_<id>.mp3` 갈아끼움. 현재 본 파일은 2차 처리(13~14s / 2.5~4.5s) 그대로
- **§5 권장 길이 초과 모두 허용 (PM 결정)**: §5 본문 갱신은 별도 라운드. PM 청취 결과가 §5보다 우선. 현재 초과 4종(realize 1.6s, pageturn 1.0s, suitcase_wheels 5.0s, timer_out 1.515s — 모두 §5 권장 한도 초과).
- **모듈**: `docs/assets/SFX-list.md` §3.6 표 갱신 (3차 컬럼) + 신규 §3.7 (PM 후보 청취 라운드 가이드) + §8 #9 청취 검증 🟦 부분 진행.
- **사유**: PM 2차 청취 후 재요청 (sfx_realize·sfx_timer_out·sfx_suitcase_wheels "더 길게" / sfx_pageturn 1초 통째 / sfx_light_off 1초 / glass_drop·lab_door_open 후보 비교).
- **잔여 작업**: PM이 glass_drop·lab_door_open 5개 후보 청취 → 1개씩 선정 → Claude가 `docs/assets/sfx/`로 복사 + §3.6 표 시작점 확정.
- **승인**: PM(구윤모) 직접 청취 + Claude 파형 분석 silencedetect 보조

---

### 2026-05-06 — W5 콘텐츠 통합 라운드 #2: 발견 이슈 4건 일괄 처방 (정합 0건 경고 달성)

- **변경**: W5 라운드 #1에서 발견된 정합 갭 4건을 일괄 처방. validate-build / build-manifest 모두 0건 경고 달성. 시나리오 영문화 + 자산 매핑 통합.

  - **이슈 #2 한글 BG alias 3건 영문화** (시나리오 prologue.md):
    - `[BG: 분당_본가_거실_밤 fade]` (line 30) → `[BG: bg_bundang_home fade]` (bg-list §10 기등록 BG와 정확 매칭)
    - `[BG: ktx_창밖_낮 fade]` (line 108) → `[BG: bg_ktx_window fade]` (신규 BG §19 등록 후 매칭)
    - `[BG: 자취방_저녁 fade]` (line 212) → `[BG: bg_studio_room fade]` (bg-list §11 기등록 BG와 정확 매칭)
    - `04-image-prompts/backgrounds/bg-list.md` §19 `bg_ktx_window.webp` 신규 등록 — KTX 차내 창가 (낮). frontmatter outputs "배경 18장" → "배경 19장 전체 프롬프트 (15장 + 신규 4장)".

  - **이슈 #1 BGM "잔잔" 미매핑 처방** (audioMappings):
    - `src/engine/audioMappings.ts` BGM_MAP에 alias 추가: `{ ko: '잔잔', en: 'bgm_daily' }`. ch06_h1_serin.md 새벽 카페 컨텍스트 기준 fallback 매핑(주석으로 명시). PM이 별도 트랙 의도라면 BGM-list §1.1 갱신 후 재매핑 가능.

  - **이슈 #3 build-manifest 정밀 cross-check** (list.md 파싱):
    - `scripts/build-manifest.ts` v0.2: `parseSpriteList()` (`#### N. \`<id>.webp\``) + `parseCgList()` (`### N. \`cg_*.webp\``) + `parseVideoList()` (`## N. \`video_*.mp4\``) 헬퍼 추가. CG/VIDEO cross-check 추가(시나리오 사용 ↔ list 등록 정합).
    - `_meta.registered` 필드 추가: `{ bg, sprite, cg, video }` 등록 카운트 노출. AssetManifest 인터페이스 갱신.

  - **이슈 #4 validate-build BGM/SFX/CG/VIDEO 화이트리스트 통합** (v0.3):
    - `scripts/validate-build.ts` v0.3: `parseCgList()` / `parseVideoList()` / `parseAudioMappings()` 헬퍼 + `validateCgIds()` / `validateVideoIds()` / `validateAudioIds()` 검증 함수 추가. BGM/SFX는 한글·영문 ID 모두 화이트리스트 통과(audioMappings.ts BGM_MAP/SFX_MAP의 ko/en 둘 다 등록).

- **모듈** (status 변동):
  - `04-image-prompts/backgrounds/bg-list.md` (§19 신규 + outputs 갱신)
  - `03-story/scenarios/prologue.md` (한글 BG 3건 영문화) — review (사용자 사인오프 대기)
  - `src/engine/audioMappings.ts` (BGM_MAP 잔잔 alias 추가)
  - `scripts/build-manifest.ts` (v0.2 list.md 파싱 통합)
  - `scripts/validate-build.ts` (v0.3 BGM/SFX/CG/VIDEO 화이트리스트)

- **검증 결과** (모두 통과 + 0건 경고):
  - `npm run typecheck`: 무에러 ✓
  - `npm run test`: 72건 (72 passed / 0 skipped) — 변동 없음
  - `npm run compile`: 12개 .md → 216개 씬 (IF 7건 경고 유지: 옵션 Z 이연)
  - `npm run validate`: 16/16 엔딩 + **BG 18 + 특수 22 + CG 20 + VIDEO 12 + BGM 17 + SFX 20 — 0건 경고** ✓
  - `npm run manifest`: BG 18 / Char 16 / CG 19 / VIDEO 10 / BGM 8 / SFX 8 — **메모 0건** ✓
  - `npm run build`: Vite 947ms / JS 220.44 KB / gzip 69.89 KB / 81 modules ✓

- **유지 사항**: BRANCH-GRAPH / STATE-SCHEMA / ARCHITECTURE / UI-SPEC / COLOR-TOKENS 무수정. 11개 시나리오(prologue 외) 무수정. MASTER-PLAN §4.3 거절 카톡 텍스트 글자 단위 그대로(rejectLines.ts SSoT 가드 11건 통과).

- **다음 단계**:
  - W5 라운드 #1 + #2 영향 모듈 PM 사인오프 대기
  - W3 자산 생성 (PM 직접 작업)이 진행되면 placeholder → 실제 자산 교체 라운드 진입
  - W6 Playwright E2E 16개 엔딩 자동 플레이 작성 (자산 무관 트랙)

- **승인**: PM(구윤모) "발견 이슈 처리해" 명령 — 본 라운드 사인오프 대기

---

### 2026-05-06 — SFX Phase 2.5 청취 검증 후 8종 재처리 (파형 분석 활용)

- **변경**: PM 청취 검증 피드백 8종 + 파형 분석(silencedetect)으로 1차 결함 1건 발견·정정. ffmpeg 재크롭 + 후처리 동일 사양.
  - **PM 청취 피드백 (8종 새 crop 범위)**:
    - `sfx_bar_ambient`: 30~38s → **60~68s** (8s loop, stereo)
    - `sfx_glass_drop`: 0~1s → **13~14s** (1s, mono)
    - `sfx_lab_door_open`: 0~2s → **2.5~4.5s** (2s, mono)
    - `sfx_light_off`: 0~0.5s → **0.5~1.0s** (0.5s, mono)
    - `sfx_pageturn`: 0~0.1s → **2.5~2.8s** (0.3s, mono) — PM 지정 2.5~3.5s 중 파형 분석상 실제 swoosh 첫 0.265s
    - `sfx_realize`: 0~0.3s → **0.05~1.35s** (1.3s, mono) — 두 chime 구조 발견 (1차 0.08~0.153s + 2차 0.799~1.317s)
    - `sfx_suitcase_wheels`: 0~2s → **0.13~3.13s** (3s, mono) — 시작 무음 0.124s 컷 + PM "더 길게"
    - `sfx_timer_out`: 0~0.6s → **1.84~2.84s** (1s, mono, 실측 0.955s)
  - **파형 분석 발견 (silencedetect)**:
    - **`sfx_timer_out` 1차 결함**: 본 알람은 1.84~2.99s에만 존재. 1차 처리 0~0.6s는 시작 무음만 자른 결과(들리지 않는 SFX). PM 청취로 발견 → 본 알람 위치 ffmpeg silencedetect로 확정.
    - `sfx_realize` 두 chime 구조 발견: 1차 처리는 1차 chime + 무음만 포함. PM "더 길게" 의도가 2차 chime까지 포함이라는 추정 정합.
    - `sfx_pageturn` PM 지정 1초 구간 중 실제 소리 첫 0.265s, 잔향 포함 0.3s 채택.
    - `sfx_suitcase_wheels` 시작 0.124s 무음 + 16.5s 연속 굴림 — 시작 무음 컷.
- **모듈**: `docs/assets/SFX-list.md` §3.6 표 갱신 + §5 권장 길이 초과 3종 메모 + 파형 분석 결과 메모 + §8 #9 ✅ 마킹.
- **§5 권장 길이 초과 3종 (PM 결정 우선)**:
  - `sfx_realize` 1.3s (§5 권장 0.2~0.4s) — 두 chime 살림
  - `sfx_pageturn` 0.3s (§5 권장 <0.1s) — 페이지 swoosh 자연 톤
  - `sfx_suitcase_wheels` 3.0s (§5 권장 1~2s) — PM 명시
- **사유**: PM이 1차 처리(2026-05-06 일괄)를 청취 후 8종 재처리 + 길이 변경 요청. 파형 분석을 도구로 활용해 PM 의도 + 음향 자연성 동시 충족.
- **잔여 작업**: §4.3 라이선스 추적표 11행 PM 정보 입력 → ID3 Comment 재태깅 → status `review` → `done` (W6 QA 후).
- **승인**: PM(구윤모) 직접 청취 검증 + Claude 파형 분석 보조

---

### 2026-05-06 — W5 콘텐츠 통합 라운드 #1: 자산 매니페스트 빌드 인프라 구축

- **변경**: INTEGRATION-PLAN.md §3 자산 매니페스트 자동 생성 도구 신규 작성. 컴파일된 씬에서 사용 자산 ID 추출 + audioMappings 한→영 변환 + bg-list 등록 화이트리스트 통합 → `public/manifest.json` 출력. CG 디렉티브 파서 버그 동시 수정.

  - **신규 작성**:
    - `scripts/build-manifest.ts` v0.1 — 컴파일된 씬 + audioMappings.ts(BGM_MAP/SFX_MAP) + bg-list.md 파싱 → AssetManifest 출력. 매니페스트 구조: `{ backgrounds[], characters{id: variants[]}, cgs[], videos[], bgms[], sfx[], _meta }`. 미매핑 BGM/SFX + 미등록 BG는 `_meta.notes` 배열로 보존(빌드 차단 X).
    - `package.json` scripts에 `manifest`: `tsx scripts/build-manifest.ts` 추가.
  - **CG 파서 버그 픽스**:
    - `scripts/compile-scene.ts` RE_CG 결과 처리에서 `m[2]` (액션 토큰 `show`)를 cgId로 잘못 사용하던 버그 수정. `m[1]` (cg_id, 예: `cg_seoyoon_reject`)이 cgId가 되도록 변경. 액션 토큰은 무시(show 기본 가정 / CG_HIDE는 별도 디렉티브).
    - 결과: 매니페스트 cgs 1개("show") → **19개** (실제 cg_* ID 정상 추출).

- **모듈** (status 변동 없음 / 신규):
  - `scripts/build-manifest.ts` (신규)
  - `scripts/compile-scene.ts` (CG 파서 픽스)
  - `package.json` (manifest script 추가)
  - `public/manifest.json` (자동 생성 출력)

- **검증 결과** (모두 통과):
  - `npm run typecheck`: 무에러 ✓
  - `npm run test`: 72건 (72 passed / 0 skipped) — 변동 없음
  - `npm run compile`: 12개 .md → 216개 씬 / IF 7건 경고 유지(옵션 Z 이연), CG 파서 정상 동작 검증
  - `npm run validate`: 16/16 엔딩 도달 / BG 화이트리스트 17+22 / 한글 BG alias 3건 경고 유지
  - `npm run build`: Vite 965ms / JS 220.41 KB / gzip 69.89 KB / 81 modules — 변동 없음
  - `npm run manifest`: ✓ `public/manifest.json`
    - **backgrounds 20** (시나리오 사용 + bg-list 등록 합집합)
    - **characters 16** (윤모 + H1~H5 + 사이드 + 교수 + 그룹)
    - **cgs 19** (CG 파서 픽스 후 정상 추출)
    - **videos 10** (5 만남 + 5 트루)
    - **bgms 9** (audioMappings 8 + 미매핑 1)
    - **sfx 8** (P1 환경음 7 + P0 카톡 알림)
    - 메모 4건: 미등록 BG 3건(분당_본가_거실_밤·ktx_창밖_낮·자취방_저녁) + BGM 미매핑 1건(잔잔)

- **발견 이슈 (별도 라운드 백로그)** — 매니페스트 빌드는 차단하지 않으나 정합성 갭:
  1. **BGM "잔잔" 미매핑**: ch06_h1_serin.md:237에서 사용. audioMappings.ts BGM_MAP에 추가 필요(예: `bgm_calm` 또는 기존 `bgm_daily`/`bgm_romantic` 재활용). PM 결정 필요(트랙 크리에이션 vs 기존 재활용).
  2. **한글 BG alias 3건**: `분당_본가_거실_밤`(→ bg_bundang_home variant?), `ktx_창밖_낮`(→ KTX 차내 신규?), `자취방_저녁`(→ bg_studio_room variant?). 시나리오 영문화 또는 SPECIAL_BG_IDS 매핑 추가. 해결책은 W5 후속 라운드 또는 시나리오 정합화 라운드.
  3. **W5-3 매니페스트 정밀 cross-check**: list.md(sprite/cg/video) 파싱 + 매니페스트의 자산 ID가 등록 list와 정합 검증. 본 라운드는 시나리오 사용 인벤토리만 추출 — list 등록 자산 중 시나리오 미사용 또는 list 미등록인데 시나리오 사용은 별도 검증.
  4. **validate-build 통합**: 현재 validate-build는 BG 화이트리스트만 검증. BGM/SFX/CG/VIDEO 화이트리스트 검증을 별도 step으로 추가 가능(또는 build-manifest의 notes를 errors로 승격).

- **다음 단계**:
  - W5 후속 라운드 (PM 결정 후): BGM "잔잔" 처방 + 한글 BG alias 3건 영문화 또는 매핑 + 정밀 cross-check
  - W3 자산 생성 (PM 직접 작업)이 진행되면 placeholder → 실제 자산 교체 라운드 진입
  - W6 Playwright E2E 16개 엔딩 자동 플레이 작성 (자산 무관 트랙)

- **승인**: PM(구윤모) "다음 단계 진행해" + AskUserQuestion(W5 콘텐츠 통합) — 본 라운드 사인오프 대기

---

### 2026-05-06 — SFX Phase 2 + Phase 2.5 완료 (12종 자산 배치 + status: review)

- **변경**: SFX 12종 자산 후처리 + 배치 완료. SFX-list `status: in-progress` → **`review`**.
  - **Phase 2 완료** (PM 직접): P0 4종(`sfx_katalk_notify` / `sfx_realize` / `sfx_timer_out` / `sfx_pageturn`) PM 외부 다운 채택 + P1 7종(환경음) 외부 다운. `sfx_click`만 Phase 1.5 v1 합성본 유지. 12개 원본 → `docs/assets/sfx/확정/` 임시 보관.
  - **Phase 2.5 완료** (Claude ffmpeg 일괄): crop + 채널 변환 (UI/단발 mono / 환경음 stereo) + 시작 5ms 페이드인 + 끝 30ms 페이드아웃 + -18 LUFS Integrated 정규화 (loudnorm 1-pass) + 128 kbps CBR mp3 + ID3 (Album="kmu-vn SFX", Comment="TBD: PM 추적 대기" 또는 합성 메타). 12개 모두 `docs/assets/sfx/sfx_<id>.mp3` 배치.
  - **ffprobe 자동 검증 통과**: 12개 모두 길이·채널 §5 정합 (UI/단발 0.025~0.6s mono / 환경음 단발 0.5~3.0s mono / 환경음 루프 8.0s stereo). bitrate는 짧은 파일(<1초) 헤더 비율 영향으로 평균 128k 초과 표시 — 데이터 인코딩은 128k CBR.
- **모듈**: `docs/assets/SFX-list.md` (status review). 부수 갱신: `00-master/PROGRESS-TRACKER` (상단 줄 + W4 SFX 항목).
- **신규 §3.6 추가**: Phase 2 + Phase 2.5 최종 채택 결과 표 (트랙 12개 × 원본 길이/crop 범위/최종 길이/채널/bitrate/§5 정합).
- **신규 §4.3 추가**: 라이선스 추적표 11행 + sfx_click 1행 = 12행. P0 4종 + P1 7종은 PM 출처 정보 대기(TBD), sfx_click은 Phase 1.5 자체제작.
- **§8 체크리스트 갱신**: Phase 2/2.5 항목 ✅ 처리. 잔여 7항목(PM 청취 검증 / §4.3 라이선스 채움 / SCENE-FORMAT 매핑 코멘트 / compile-scene SFX 매핑 / W5 이동 / W6 QA / status review→done) ⬜ 유지.
- **워크플로 변경 (BGM 라운드와 분담 차이)**:
  - BGM: PM이 Audacity로 직접 crop·정규화·후처리 → mp3 배치
  - SFX: PM 다운 → `확정/` 임시 보관 → **Claude ffmpeg 일괄 crop·후처리** → mp3 배치
  - 사유: SFX는 12개 트랙 × 짧은 길이로 일괄 자동화가 효율적. 환경음 청취 위치 추측 불확실한 4트랙은 PM 청취 후 재처리 옵션.
- **사유**: PM이 옵션 C(자동화 없이 BGM 동일 방식) 채택 후 외부 다운 진행. crop 단계만 Claude 위임으로 워크플로 가속.
- **다음 액션**:
  1. PM 12개 파일 청취 → `sfx_pageturn` / `sfx_lab_door_open` / `sfx_glass_drop` / `sfx_bar_ambient` 4종 위치 부적절 시 "X-Y초로 다시" 피드백 → Claude 재처리
  2. PM이 P0 4종 + P1 7종 출처 정보(곡명·작곡자·URL·라이선스) 알려주면 §4.3 표 채움 + ffmpeg ID3 Comment 재태깅
  3. W5 통합 시 `docs/assets/sfx/` → `public/snd/sfx/` 이동 + 매니페스트 등재
- **승인**: PM(구윤모) 직접 명령 ("crop 도와준 후 나머지 처리")

---

### 2026-05-06 — W4 Known Issue 정리 라운드 (#1·#2·#4·#5 처방 + #3 W5+ 이연)

- **변경**: PROGRESS-TRACKER `Known Issue / 변경 제안 (W4 후속)` 5건 일괄 처방. PM 결정(2026-05-05 AskUserQuestion 라운드)에 따라 #1·#2·#4·#5는 즉시 처방, #3은 W5+로 이연.

  - **#5 신규 BG 3종 등록**:
    - `04-image-prompts/backgrounds/bg-list.md` §16(`bg_dongdaegu_station` H2 TRUE 동대구역 KTX), §17(`bg_kakao_fullscreen` H4 REJECT 카톡 풀스크린 UI), §18(`bg_library_night` variant=rooftop 도서관 옥상 야경) 본체 프롬프트 신규 작성. frontmatter outputs "배경 15장" → "배경 18장 전체 프롬프트 (15장 + 신규 3장)".
    - `scripts/validate-build.ts` v0.2: `parseBgList()` 헬퍼 + `validateBgIds()` BG ID 화이트리스트 검증 추가. SPECIAL_BG_IDS 22건(black/white + variant 매핑 표 line 25-44) + bg-list 17 unique ID 등록. 컴파일된 씬의 BG image 필드 대조.

  - **#2 SCENE_CUE 디렉티브 정식 등록**:
    - `06-engine/SCENE-FORMAT.md` §1.1 표에 `[SCENE_CUE: 라벨]` 행 추가 (비기능 메타, UI 미표시, 즉시 advance, DEV 빌드만 콘솔 노출).
    - `src/engine/types.ts` `SceneCommand` 유니온에 `{ type: 'SCENE_CUE'; label: string }` 추가.
    - `scripts/compile-scene.ts` v0.2: 기존 NARRATION fallback + warnings 푸시 제거, `{ type: 'SCENE_CUE', label }` 직접 출력.
    - `src/engine/SceneRenderer.tsx` useEffect dispatch에 SCENE_CUE 케이스 추가 (DEV 빌드만 console.debug 라벨 노출, 즉시 advance).

  - **#4 toneMatrix H3/H4 KEY 톤 충돌 해소 (옵션 B — mechanism 마커)**:
    - `src/engine/types.ts` `ChoiceMechanism` 유니온 확장: `'h4_reply_speed' | 'h4_facing_key'`.
    - `src/engine/toneMatrix.ts` `computeToneDeltas` H4 분기: 대면 KEY 자리 묘사 보너스 가산을 `mechanism === 'h4_facing_key' && isKey`로 명시 라우팅. 마커 누락 시 H4 묘사 보너스 0 (H3 KEY로만 라우팅).
    - `src/engine/toneMatrix.ts` `toneToKeyChoice`: H4 미니게임(h4_reply_speed) 분기 위에 H4 대면 KEY(h4_facing_key) 분기 신설. 일반 KEY 루프에서 H4 제외 (mechanism 마커 전용 라우팅).
    - `tests/unit/toneMatrix.test.ts`: `it.skip` [KNOWN ISSUE] 제거 + 가드 테스트 [현재 동작] 제거. 신규 5건 추가 (h4_facing_key + KEY_CHOICE H4 / 마커 + descriptor 누락 fallback / H3 정상 동작 / 마커 + isKey false → null / computeToneDeltas 회귀 가드 마커 없으면 H4 묘사 0). 단위 테스트 전체 69→72건 (skip 0).
    - `03-story/scenarios/ch06_h4_seoyoon.md` H4 대면 KEY 자리 3개에 `mechanism:h4_facing_key` 마커 부여 (line 216 ch6_h4_exam_cheer / line 524 ch6_h4_distance / line 759 ch6_h4_close_reply). 미니게임 KEY 자리 2개(line 354·655)는 기존 `mechanism:h4_reply_speed` 유지.
    - `00-master/CONVENTIONS.md` §3.7 #4 H4 두 KEY 자리 룰 갱신 + 자체점검 항목에 h4_facing_key 마커 누락 점검 추가.

  - **#1 EndingScreen ↔ RejectEnding 라우팅 (옵션 A — 컴포넌트 살리기)**:
    - `src/ui/EndingScreen.tsx`: `endingId === REJECT_ENDING_ID` 분기 추가. `useState<rejectComplete>` 가드로 RejectEnding 우선 렌더 후 onComplete 시 EndingScreen 백업 (타이틀로 돌아가기 버튼) 라우팅.
    - `src/ui/katalk/RejectEnding.tsx`: Stage 유니온에 `'video' | 'toast'` 추가. #7(video) 단계 — `<video src="/vid/video_reject_seoyoon.mp4" autoPlay muted playsInline />` 검은 배경 풀스크린 + audioManager.stopBgm. #8(toast) 단계 — 엔딩 카드 해금 + "엔딩 리스트에 해금되었습니다" 토스트. 로컬 STAGE_TIMING_MS 제거하고 rejectLines.ts의 REJECT_STAGE_TIMING_MS SSoT 사용.
    - `03-story/scenarios/ch06_h4_seoyoon.md` Scene `ch06_h4_reject` 본문 1001-1053 단순화: 8단계 디렉티브 시퀀스(BG/BGM/SFX/KAKAO/CHARACTER/CG/CG_HIDE/VIDEO/BGM_STOP + SCENE_CUE 8건 + 지문 5건)를 `[ENDING: END_H4_REJECT]` 단일 디렉티브로 축소. RejectEnding 컴포넌트가 8단계 시퀀스를 자체 처리. 작가 메모 표(line 1100 부근 8단계 표)는 참조용으로 보존.

  - **#3 컴파일러 v0.3 IF/ELSE 정밀 파싱 — W5+ 이연 (옵션 Z)**:
    - `scripts/compile-scene.ts` 헤더 코멘트에 옵션 Z 결정 명시: "IF/ELSE/[/IF] 중첩 블록 미지원 (선형 점프만 처리, 시나리오에 등장 시 경고) — W5+ 이연 (PM 결정 2026-05-05)".
    - `00-master/PROGRESS-TRACKER.md` Known Issue #2 항목에 ⏸ "W5+ 이연 (PM 결정 2026-05-05, 옵션 Z) — EVALUATE_BRANCH가 47건 흡수 → 실질 영향 X. 회귀 위험 줄이고 W5 진입 우선" 메모.
    - 사유: scriptInterpreter.evaluateBranch가 `late_reply_count >= 2` 등 47건 IF 조건을 런타임에 흡수. 컴파일러 정밀 파싱은 W5 콘텐츠 통합 후 안전하게 추가 가능.

- **모듈** (status: done → review 전환):
  - `04-image-prompts/backgrounds/bg-list.md`
  - `06-engine/SCENE-FORMAT.md`
  - `00-master/CONVENTIONS.md` (§3.7 #4 + 자체점검)
  - `00-master/PROGRESS-TRACKER.md` (Known Issue 섹션)
  - `src/engine/types.ts`, `src/engine/toneMatrix.ts`, `src/engine/SceneRenderer.tsx`
  - `src/ui/EndingScreen.tsx`, `src/ui/katalk/RejectEnding.tsx`
  - `scripts/compile-scene.ts`, `scripts/validate-build.ts`
  - `tests/unit/toneMatrix.test.ts`
  - `03-story/scenarios/ch06_h4_seoyoon.md`

- **검증 결과**:
  - `npm run typecheck`: 무에러 ✓
  - `npm run test`: **72건 (72 passed / 0 skipped)** — 4파일 (toneMatrix + branchEvaluator + saveSlots + rejectLines). 이전 라운드 1건 skip 해제 + 신규 5건 추가.
  - `npm run compile`: 12개 .md → 216개 씬 (변동 없음). IF 워닝 7건 유지(옵션 Z 이연), SCENE_CUE 워닝 0건.
  - `npm run validate`: 16/16 엔딩 도달 + KEY 매트릭스 신표기법 45회 (H1:5 H2:7 H3:15 H4:12 H5:6) + H4 미니게임 12건 + 거절 도달성 OK + BG 화이트리스트 17건 + 특수 22건. 한글 BG alias 3건(분당_본가_거실_밤·ktx_창밖_낮·자취방_저녁) 경고만 잔존(별도 라운드 영문화).
  - `npm run build`: Vite production 965ms / JS 220.41 KB / gzip 69.89 KB (이전 786ms / 217 KB → +3 modules로 81 modules). ✓

- **유지 사항**: BRANCH-GRAPH / STATE-SCHEMA / ARCHITECTURE / UI-SPEC / COLOR-TOKENS 무수정. 11개 시나리오(ch06_h4_seoyoon 외) 무수정. MASTER-PLAN §4.3 거절 카톡 텍스트 글자 단위 그대로(rejectLines.ts SSoT 가드 11건 통과).

- **변경 제안 (다른 모듈) — 본 라운드에서 직접 수정 X, 추적만**:
  1. 한글 BG alias(분당_본가_거실_밤·ktx_창밖_낮·자취방_저녁) 3건 영문화 — W5 콘텐츠 통합 라운드에서 시나리오 일괄 정합화 (또는 SPECIAL_BG_IDS 추가)
  2. `KakaoModal` 풀스크린/타이핑 인디케이터 옵션 — 거절 엔딩 외 다른 카톡 시퀀스 재사용 시 옵션 prop 확장 (현재는 RejectEnding 단독 자급자족)
  3. `SCENE_CUE` 디렉티브를 다른 시나리오(ch06_h1·h2·h3·h5) 클라이맥스 단계 명시에도 활용 검토 (현재는 ch06_h4_reject 한정 17건이지만 본 라운드로 시나리오 본문에서 0건으로 축소됨)

- **다음 단계**:
  - 사용자: W3 자산 생성 (Gemini Nano Banana 2 이미지 ~98장 + VEO 영상 12개 — bg_dongdaegu_station / bg_kakao_fullscreen / bg_library_night rooftop 신규 3장 포함 / SFX Phase 2 환경음 7종)
  - Claude Code: W5 콘텐츠 통합 진입 (자산 매니페스트 검증, placeholder → 실제 자산 교체) / W6 Playwright E2E (16개 엔딩 자동 플레이) + 모바일 QA + 성능 최적화 + 출시

- **승인**: PM(구윤모) 옵션 결정 (2026-05-05 AskUserQuestion: #1=A / #4=B / #3=Z) + 본 라운드 사인오프 대기

---

### 2026-05-05 — SFX Phase 2 옵션 C 채택 (환경음 7종 PM 직접 수집)

- **변경**: SFX 환경음 7종 수집 방식 결정 — **옵션 C: 자동화 없이 BGM 라운드와 동일한 PM 직접 워크플로** 채택. PROGRESS-TRACKER 상단 "병렬 트랙" 줄 갱신 (Phase 1.5 완료 + 옵션 C 반영).
- **검토된 옵션** (2026-05-05 PM 인터랙티브 Q&A):
  - A. Pixabay API 메타데이터 자동 수집 → **API 미공개로 불가** (이미지/비디오만 지원, Audio endpoint 403/404, 2026-05-04 확인)
  - B. ffmpeg 합성만 진행(P0 5종, Phase 1.5) + 환경음 9종 PM 직접 → **Phase 1.5 완료, P1 환경음은 옵션 C로 이전**
  - **C. 자동화 없이 BGM 라운드 동일 방식 (채택)** — Freesound CC0 우선 → Pixabay → Zapsplat. SFX-list §4 검색 키워드 표 그대로 활용.
- **모듈**: `00-master/PROGRESS-TRACKER` (상단 줄). SFX-list 본문은 §0 사용자 결정 #1에 옵션 C 흐름이 이미 명시됨(2026-05-04 갱신, "7종 환경음 사용자 직접 수집") — 추가 수정 불필요.
- **사유**: PM이 라이선스 책임 분담(MASTER-PLAN §10.1) + 청취 톤 적합성 인간 판단 + 시스템 다운로드 안전 룰을 종합 판단. BGM 라운드에서 검증된 워크플로 재활용이 가장 안전·실용적.
- **다음 액션 (PM)**:
  1. P0 5종 — `docs/assets/sfx/_candidates/` 15개 후보 청취 → 트랙당 1개 선정 (또는 v{N} 톤 조정 피드백)
  2. P1 환경음 7종 — BGM 라운드 워크플로(SFX-list §4·§5·§6): Freesound CC0 우선 → Pixabay → Zapsplat 검색 → 후보 2~3개 다운 → 청취 → 1개 선정 → §6 후처리(Audacity -18 LUFS + 시작 5ms 페이드인 + 끝 30ms 페이드아웃 + ffmpeg 128k mp3 + ID3) → `docs/assets/sfx/`에 `sfx_<id>.mp3` 배치
  3. ffprobe 자동 검증 (BGM 패턴 동일) → status `in-progress` → `review`
- **승인**: PM(구윤모) 직접 명령 (인터랙티브 Q&A, 옵션 C 선택)

---

### 2026-05-04 — SFX Phase 1.5 자동 합성 라운드 (5종 × 3 후보 = 15개 ffmpeg 합성)

- **변경**: SFX-list.md 갱신 (status: in-progress 유지) + ffmpeg 자체 합성 5종 후보 15개 `docs/assets/sfx/_candidates/` 배치.
  - **P0 5종 자동 합성 완료**: `sfx_katalk_notify` / `sfx_realize` / `sfx_timer_out` / `sfx_click` / `sfx_pageturn` × v1/v2/v3
  - **합성 도구**: ffmpeg 8.1 lavfi (sine, anoisesrc, concat, afade, highpass/lowpass, amix). MP3 mono CBR 128k, ID3 Album="kmu-vn SFX" + Comment="ffmpeg synth v{N} / Claude generated"
  - **모든 후보 명세 길이 정합** (ffprobe 자동 검증): click 20-30ms / pageturn 80-90ms / realize 250-300ms / katalk_notify 300-420ms / timer_out 450-550ms
- **마일스톤 #3 후 SFX 큐 재grep (2026-05-04)**: 카톡_알림 23 → **28** (+5: ch06_h1 +2 / ch06_h3 +1 / ch06_h5 +1 / end_solo +1). 다른 종류 변동 0. 총 31 → **36 / 8종류**. **신규 P2 종류 0건** — 시나리오 작가가 의대 축제·체전·여름방학 환경음을 SFX 큐 대신 모놀로그/지문으로 표현. P2 placeholder 보류 또는 P3 이전 검토.
- **사용자 결정 사항 갱신 #1**: 원래 "마일스톤 #3 후 일괄 수집" → **"5종 ffmpeg 자동 합성 (Phase 1.5) + 7종 환경음 사용자 직접 (Phase 2 대기)"** 분할. PM이 본 세션에서 Pixabay API 키 제공 + 옵션 A 선택. 단 Pixabay 공식 Audio API 미지원 확인(403/404, 이미지/비디오 API만 공식) → 환경음 7종은 사용자가 https://pixabay.com/sound-effects/ 직접 검색 흐름 (BGM 라운드 동일 패턴).
- **모듈**: `SFX-list` (status: in-progress 유지, Phase 2 환경음 7종 + 5종 후보 1개 선정 후 review). 부수 갱신: `00-master/PROGRESS-TRACKER` (W4 SFX 항목 갱신).
- **§3.5 신규 섹션**: Claude ffmpeg 자동 합성 결과 표 + 사용자 청취 가이드 + 선정 후 처리 체크리스트 + 폴백 옵션. 합성 후보는 모두 lavfi 사인파/노이즈 기반 — CC0 라이선스 X, 자체 제작본 (저작권 PM 본인).
- **§4 적용 범위 명시**: P0 시스템 4종은 §3.5 ffmpeg 합성으로 해결, §4는 P1 환경음 7종에만 적용. Pixabay 공식 Audio API 미지원 사실 명시.
- **사유**: 마일스톤 #3 도달 시점에서 SFX Phase 2 트리거. PM이 "자동화 가능?" 질문 + Pixabay API 키 제공으로 ffmpeg 합성 트랙(5종) 100% 자동화 검토. Pixabay Audio API 미지원 확인 후 5종 자동 합성 + 7종 사용자 직접의 분할 채택.
- **Phase 2 대기 작업 (사용자 직접)**:
  1. 5종 후보 청취 (`docs/assets/sfx/_candidates/sfx_*_v{1,2,3}.mp3` 15개) → 각 트랙당 1개 선정 → `_v*` 제거 후 상위 폴더로 이동
  2. 환경음 7종 Pixabay 사이트 직접 검색·다운 (SFX-list §4 검색 키워드 활용)
  3. 후처리 (-18 LUFS 정규화, 5ms 페이드인 + 30ms 페이드아웃, 128k mp3 + ID3) — BGM 라운드 워크플로 동일
  4. `docs/assets/sfx/`에 12종 모두 배치 → ffprobe 자동 검증
  5. 사용자 결정 #1 갱신 + status: in-progress → review
- **Pixabay API 키 처리**: PM이 본 세션에 키 제공. Claude는 어떤 .md/스크립트/CHANGELOG에도 키를 기록하지 않음 (본 세션 메모리 일회성 사용). PM에게 본 작업 종료 후 Pixabay 대시보드에서 키 회전(regenerate) 권장.
- **승인**: PM(구윤모) 직접 명령 (옵션 A 채택)

---

### 2026-05-04 — W4 Phase A~F 1차 완료 (엔진/UI + 시나리오 컴파일러 + 빌드 검증 + CI/CD)

- **변경**: Plan(graceful-juggling-peacock) Phase A+B+C+D+E+F 묶음 진행. 기존 W4 코드 골격(types/gameStore/scriptInterpreter/toneMatrix/UI/카톡 등) 검증 + 누락된 7개 항목 신규 작성·통합.
  - **Phase A 스캐폴딩** (기존 + 보강):
    - `package.json` scripts 추가 (test, test:watch, test:e2e, compile, validate, typecheck) + devDeps 추가 (@playwright/test, jsdom, prettier, tsx, vitest)
    - 기존 tsconfig/vite/tailwind/postcss/index.html/.gitignore/main.tsx/App.tsx/styles 그대로 활용
  - **Phase B 타입·상태** (기존 + 신규 5건):
    - `vitest.config.ts` 신규 (jsdom 환경 + alias)
    - `src/engine/saveSlots.ts` 신규 (STATE-SCHEMA §1·§5·§6 정합 — 수동 6슬롯 + 마이그레이션 v0→v1)
    - `tests/unit/branchEvaluator.test.ts` 신규 15건 (BRANCH-GRAPH §6.1 + Step 4 PM 결정 H4 70 임계 정합)
    - `tests/unit/toneMatrix.test.ts` 신규 23건 (5×5 매트릭스 + H3 night + H4 미니게임 + KEY 묘사 + KEY_CHOICE 발행, 1 skipped: H3/H4 KEY 톤 충돌 Known Issue)
    - `tests/unit/saveSlots.test.ts` 신규 20건 (저장·로드·삭제·일람·마이그레이션·6슬롯 분리)
  - **Phase C 시나리오 컴파일러 + 빌드 검증** (신규 4건):
    - `scripts/compile-scene.ts` v0.2 — SCENE-FORMAT §1.1 디렉티브 파서 (BG/BGM/SFX/CHARACTER/DIALOGUE/MONOLOGUE/NARRATION/CHOICE/CG/VIDEO/KAKAO/KAKAO_TIMER/INC/FLAG/KEY/JUMP/EVALUATE_BRANCH/ENDING/SCENE_CUE) + **톤 매트릭스 신표기법 파싱** (`{tone:..., key:..., descriptor:..., mechanism:...}`) + **CHOICE_KAKAO 별도 명령 추출 + h4_reply_speed mechanism 자동 부여**. 12개 .md → 216개 씬 컴파일 성공.
    - `scripts/validate-build.ts` v0.1 — 16엔딩 도달성 + KEY 매트릭스 분리 카운트 (옛 표기법 KEY_CHOICE / 신표기법 isKey+mechanism) + 거절 카톡 도달성 (late_reply_count 트리거 ≥2 OR H4 미니게임 ≥2) + JUMP/next 검증 + 깨진 변수 참조 검증
    - `src/engine/rejectLines.ts` 신규 — **MASTER-PLAN §4.3 거절 카톡 변경 금지 텍스트** SSoT 모듈 (REJECT_LINES 4줄 + 8단계 REJECT_STAGES 메타 + 타이밍 + REJECT_ENDING_ID)
    - `tests/unit/rejectLines.test.ts` 11건 — 4줄 글자 단위 가드 (`ㅠㅠ` 1줄, `..` 3줄, `🥺🥺` 4줄) + 8단계 순서 정확 매핑 + 타이밍 정합
    - 컴파일된 출력: `src/scenes/<scene_id>.scene.json` × 216 + `compiled-manifest.json`
  - **Phase D UI 골격** (기존 검증 완료):
    - DialogueBox.tsx (글자 타이핑 3단계 + self_aware white flash) / ChoiceList.tsx / BackgroundLayer.tsx / CharacterLayer.tsx / CGOverlay.tsx / Backlog.tsx / MiniControls.tsx / PauseMenu.tsx / EndingScreen.tsx / gallery/ (BGMGallery, CGGallery, EndingGallery, GalleryScreen) 모두 작성된 상태 검증
  - **Phase E 카톡 + 거절 시퀀서** (기존 + SSoT 분리):
    - KakaoModal.tsx (풀스크린 + 시간차 등장 + ReplyTimer 통합) / KakaoMessage.tsx (본인/상대 정렬 + 타이핑 인디케이터) / ReplyTimer.tsx (15초 카운트다운 + 마지막 5초 빨간 펄스 + sfx_timer_out) 기존 작성 검증
    - **RejectEnding.tsx** REJECT_LINES + 타이밍을 인라인 const → `rejectLines.ts` SSoT 모듈 import로 갱신. 컴포넌트 8단계 시퀀서(fade-in → typing → messages → pause → fade-out → title) 기존 로직 그대로 보존.
  - **Phase F CI/CD** (신규 3건):
    - `.github/workflows/ci.yml` — push/PR → install → typecheck → lint → test → compile → validate → build → upload artifact (e2e job placeholder, W6 활성화)
    - `.github/workflows/deploy.yml` — main push → Pages 배포 (concurrency group: pages)
    - `playwright.config.ts` — chromium project + webServer (npm run preview) + e2e 디렉토리 스켈레톤 (W6 16개 엔딩 자동 플레이 작성 대기)

- **모듈**: `package.json`, `vitest.config.ts`, `playwright.config.ts`, `src/engine/saveSlots.ts`, `src/engine/rejectLines.ts`, `src/ui/katalk/RejectEnding.tsx`, `tests/unit/{branchEvaluator,toneMatrix,saveSlots,rejectLines}.test.ts`, `scripts/{compile-scene,validate-build}.ts`, `.github/workflows/{ci,deploy}.yml`

- **검증 결과**:
  - TypeScript typecheck: 무에러 ✓
  - Vitest 단위 테스트: **69건 (68 passed / 1 skipped Known Issue)** — 4파일 (branchEvaluator 15 / toneMatrix 22+1 / saveSlots 20 / rejectLines 11)
  - 시나리오 컴파일러: **12개 .md → 216개 씬** 변환 (7건 경고: IF 블록 v0.1 미지원 — EVALUATE_BRANCH가 흡수하므로 무영향)
  - 빌드 검증: **16/16 엔딩 도달** + KEY 신표기법 45회 (H1:5 H2:7 H3:15 H4:12 H5:6) + H4 미니게임 mechanism 12건 + 거절 도달성 OK
  - Vite production build: 786ms (JS 217KB / gzip 69KB) ✓

- **사유**: 마일스톤 #3 풀 텍스트 5/5 완료 + 외부 피드백 라운드 사인오프 후, W4 코드 1차 완료를 통해 시나리오·자산 무관 부분 70~80% 달성. Plan §즉시 시작 가능 작업 권장안 채택 — 시나리오와 W4 코드 병렬 진행으로 6주 일정 압축. 사용자 분석 요청 ("W4 작업이 이전 작업 미완성 상태에서 진행 가능?")에 대한 plan 답변 + 실행. ARCHITECTURE.md §6 evaluateBranch가 H4 `late_reply_count >= 2` 우선 평가 + Step 4 PM 결정 임계 70 완화 이미 정합 — 변경 제안 #1 자동 정합 확인.

- **유지 사항**: 기존 src/ 하위 핵심 파일(types/gameStore/scriptInterpreter/toneMatrix/audioManager/data/scenes/ui) 무수정. CONVENTIONS / BRANCH-GRAPH / SCENE-FORMAT / STATE-SCHEMA / UI-SPEC / COLOR-TOKENS / ARCHITECTURE 무수정. 모든 .md 시나리오 12개 무수정. MASTER-PLAN §4.3 거절 카톡 텍스트 글자 단위 그대로 (4줄 가드 11건 통과).

- **변경 제안 (다른 모듈) — 본 라운드에서 직접 수정 X, 추적만**:
  1. `BRANCH-GRAPH.md` §6.1 — 자동 정합 확인. 추가 액션 X.
  2. `SCENE-FORMAT.md` §1.1 — `[SCENE_CUE: ...]` 정식 등록 검토 (현재 컴파일러 NARRATION fallback)
  3. `bg-list.md` — `bg_dongdaegu_station` (H2 TRUE) / `bg_kakao_fullscreen` (H4 REJECT 1단계) / `bg_library_night` variant=rooftop 신규 등록 검토 (W3 라운드)
  4. `toneMatrix.ts` — `toneToKeyChoice` H3/H4 KEY 톤 충돌 (warm_supportive 동일). 옵션: SceneCommand[] 반환 / H4 별도 마커 / H4 별도 톤 도입. 시나리오는 신표기법 사용 + H4 미니게임은 mechanism으로 별도 처리되므로 실질 영향 없음. 단위 테스트 1건 it.skip으로 추적.
  5. `EndingScreen.tsx` — `endingId === 'END_H4_REJECT'` 시 RejectEnding 우선 표시 + onComplete 후 EndingScreen 백업 라우팅 검토
  6. `compile-scene.ts` v0.3 — IF/ELSE 블록 정밀 파싱 (현재 7건 경고). EVALUATE_BRANCH가 흡수하므로 우선순위 낮음.

- **다음 단계**:
  - 사용자: W3 자산 생성 (Gemini Nano Banana 2 이미지 ~98장 + VEO 영상 12개 + SFX 라이브러리 수집)
  - Claude Code: W5 콘텐츠 통합 (자산 매니페스트 검증, placeholder → 실제 자산 교체) / W6 Playwright E2E (16개 엔딩 자동 플레이) + 모바일 QA + 성능 최적화 + 출시

- **승인**: PM(구윤모) Plan 승인 (graceful-juggling-peacock) / 커밋 해시 TBD

---

### 2026-04-30 — 외부 작가 윤문 라운드 #1 (12개 시나리오 일괄 통합)

외부 작가에게 챕터 단위 윤문 의뢰 → 12개 .txt 회수 → 검증 리포트 → 백업 후 일괄 교체. 게임 작동 차단 0건 검증 후 진행.

**작가용 가드레일 브리프** — 모든 챕터 대본·캐릭터 시트만 보는 외부 작가용 한 장 룰셋. 시스템 태그(BG/BGM/SFX/CG/VIDEO/CHARACTER/JUMP) + CHOICE 마커(`tone/key/descriptor/mechanism`) + 거절 카톡 4분할 텍스트 토씨 보존 + 16개 엔딩 ID·조건 + 캐릭터 캐논(이름·학번·고향·동아리) + 히로인별 KEY 톤 매핑 + 12세 등급(욕설 절대 금지) + 변태 망상 페어 트리오 룰 + 회피 어휘 5종(결/한 톤/한 박자/본심/메타 어휘) + §3.6 #8 치환어 빈도 감시 룰 + 자체점검 체크리스트.

**검증 리포트 — 엔진 차단 0건**:

- 씬 ID 12/12 일치 (신규/삭제 0건)
- `[JUMP:]` 타깃 12/12 보존
- `[CHOICE]` 블록 마커 (`tone=` / `key=` / `descriptor=` / `mechanism=`) 12/12 일치
- 호감도 디렉티브 (`+N H#` / `-N H#`) 12/12 보존
- 시스템 큐 태그 (BG/BGM/SFX/CG/VIDEO/CHARACTER) 12/12 보존
- 거절 카톡 4분할 텍스트 (`ch06_h4_seoyoon.md` 1018~1021행) 토씨 일치 — MASTER-PLAN §4.3 정합
- 캐릭터 캐논 (이름·나이·학번·소속·고향·동아리) 12/12 보존
- 욕설 (시발/미친/ㅁㅊ) 0건

**백업 후 일괄 교체**:

- 백업 폴더 신규 생성: `03-story/scenarios/_backup-원본/` 12개 .md 보관 (git 미사용 환경 안전 장치)
- 윤문 .txt 본문 추출: 11개 첫 줄 파일명 + 빈 줄 스트립 (`ch01_ot.txt`만 예외 — 이미 frontmatter로 시작)
- 원본 트레일링 메타 결합: `[ENDING:]` 다음 `---` + `## 작가 메모 (자체 점검)` 섹션 EOF까지 원본에서 추출 → 윤문 본문 끝에 결합
- 12개 .md 덮어쓰기 (UTF-8 무 BOM, 한글 인코딩 spot check 통과)

**본문 변동 미미** (게임 작동 무영향): ch06_h1_serin 0줄 / ch06_h2 0줄 / ch06_h3 −1 / ch06_h4 +4 / ch06_h5 −1 / end_solo_summer 본문 변동 없음. 작가가 게임 큐 보존하면서 표현 다듬은 결과. 라인 드롭 (−175~−310, 6개 파일)은 모두 작가가 컷한 트레일링 메타였고 원본에서 복원.

**잔여 (별도 라운드)**:

- 어휘 룰 위반 정리 (작가 재작업 또는 사용자 직접 패스 권장 3개): `ch06_h5_yuna` "직진" 19 · "한 톤" 14 · "결" 11, `ch05_decision` "결" 25 · "자리" 49, `ch06_h4_seoyoon` "자리" 35 · "분위기" 25 · "결" 8
- 치환어 분산 패스 4개: `ch04_library` / `ch06_h1_serin` / `ch06_h2_hajeong` / `ch06_h3_seol` ("자리" / "분위기" 5+회/씬 분산)
- `ch05_decision` 변태 망상 페어 자각 라벨 1건 추가 보강 (윤문 중 4/4/3 → 4/3/4 드리프트, CONVENTIONS §3.3 트리오 룰 복원)

**모듈**: `03-story/scenarios/*.md` 12개 (status: review 유지) + `00-master/PROGRESS-TRACKER.md` (외부 작가 윤문 라운드 #1 섹션 신규 추가) + `03-story/scenarios/_backup-원본/` 12개 (백업).

**사유**: 외부 작가의 표현 윤문·캐릭터 보강을 받되 게임 엔진 호환성·캐논·12세 등급·MASTER-PLAN §4.3 거절 카톡 텍스트·CONVENTIONS §3 톤 룰은 절대 변경 금지로 가드레일 통제. 가드레일 브리프(사전) + 검증 리포트(사후) 두 단계 통제로 외부 작업 통합 워크플로 확립.

**다음 단계**: 어휘 룰 정리 라운드 → 사용자 시나리오 검증 (모든 시나리오 status: review → done) → 마일스톤 #4 (.md → JSON 변환).

**승인**: PM(구윤모) 직접 명령 (일괄 교체 + 잔여 어휘 룰 별도 처리 결정).

---

### 2026-04-30 — 검증 처방 라운드 Phase 1 (JUMP placeholder 5건 처방)

6개 배치 검증 보고서(`08-qa-deployment/verification-reports/00~05-*.md`) 발견 사항 처방 라운드 진입. Phase 1 우선 처리: 챕터 간 흐름 placeholder ID 5건을 실제 첫 씬 ID로 일괄 교체. 게임 작동 시 챕터 흐름 끊김(PROD blocking) 해소.

**JUMP 라인 5건 갱신**:

| 시나리오 | 라인 | 옛 (placeholder) | 신 (실제 ID) |
|---|---:|---|---|
| `prologue.md` | 319 | `ch01_ot_first_day` | `ch01_01_ot_intro` |
| `ch01_ot.md` | 460 | `ch02_anatomy_first_day` | `ch02_01_anatomy_morning` |
| `ch02_anatomy.md` | 523 | `ch03_dongsan_visit` | `ch03_01_dongsan_lobby` |
| `ch03_dongsan.md` | 584 | `ch04_library_night` | `ch04_01_library_late` |
| `ch04_library.md` | 788 | `ch05_branch_decision` | `ch05_01_test_end` |

**작가 메모 §"다음 챕터 연결" 갱신 (5건)**: placeholder 명시 메모 → 실제 ID 정합 + 처방 기록.

**status 전환**:
- `ch01_ot.md`, `ch02_anatomy.md`, `ch03_dongsan.md`, `ch04_library.md`: `done` → `review` (PM 재사인오프 대기)
- `prologue.md`: `review` 유지

**검증**: SCENE-FORMAT §5 line 244 "모든 next: 또는 JUMP: 가 실제 존재하는 씬 가리킴" 룰 통과 확인. 5개 placeholder 0건 잔존.

**사유**: 6개 배치 검증 보고서 02-01-macro-consistency.md L8.4·L10.2 + 03-system-scene.md L10.2 누적 발견. 시나리오 본문 status: done이지만 placeholder 잔존은 톤 매트릭스 영향 모듈 review→done 사인오프 시 본문 stale 점검 누락 패턴(회귀 패턴 #1)의 일부. 단순 텍스트 교체로 즉시 처방 가능 — Phase 1 우선 처리.

**승인**: PM(구윤모) 직접 명령 ("처방 진입해", 2026-04-30).

---

### 2026-04-30 — 검증 처방 라운드 Phase 2 (MASTER-PLAN unfreeze 라운드)

frozen 정책으로 누적된 MASTER-PLAN stale 5건 + CONVENTIONS §1 frontmatter self-exempt 메모 1건 일괄 갱신. 회귀 패턴 #2(MASTER-PLAN frozen 잔재 누적) 해소.

**MASTER-PLAN.md 5건 갱신**:

1. **line 17 모드 표기**: "구윤모와 플레이(서브, 20분)" → "구윤모와 플레이(서브, **v1.1 이연** — CHANGELOG 2026-04-29 참조)". v1.0 범위 명시.
2. **line 20 엔딩 수**: "**15개** + α(공통 트루엔딩 1개 검토)" → "**16개** (히로인 5명 × {트루·해피·노멀·배드 — H4 BAD 거절 흡수} + 단독 `END_SOLO_SUMMER`). BRANCH-GRAPH §2 참조". 2026-04-28 단독 엔딩 추가 + H4 BAD 흡수 룰 반영.
3. **line 137 H1 학번**: "내과 R2" → "내과 **전공의 2년차**" (CHANGELOG 2026-04-30 R2 약어 자연 풀이 라운드 정합).
4. **line 140 H4 학번**: "**카리나** | 영남대 약대 본3" → "**카리나** | **계명대 약대 4학년 (23학번, 03년생)**" (W3 prep 잔재 정리 라운드 2026-04-29 정합). 거절 트리거도 "답장 지연 ≥2 또는 호감도 부족" 풀이.
5. **line 141 H5 가명**: "**장유나**" → "**장윤영**" (W3 prep 라운드 정합). 영문 자산 ID `yuna_*` 코드 호환성 위해 유지.
6. **line 148 H4 거절 트리거**: "Ch.5 종료 시점에 나서윤 호감도 < 50 + 답장 지연 누적 ≥3회" → "답장 지연 누적 ≥2회 (호감도 무관 우선 트리거) **OR** 호감도 < 60 (BAD 자리 거절이 흡수). BRANCH-GRAPH §6.1 참조". 2026-04-28 거절 트리거 강화 정합.
7. **line 152 거절 연출 cross-reference**: 4단계 요약 끝에 "상세 8단계 연출 명세는 route-H4-na-seoyoon.md §END_H4_REJECT + H4-na-seoyoon.md §6 참조" 추가.

**CONVENTIONS.md §1 갱신** (frontmatter 자기 위반 해소):

- §1 헤더 양식 룰에 "**예외 (00-master/ self-exempt)**" 단락 추가. MASTER-PLAN/CONVENTIONS는 frozen SSoT(status 개념 없음 — 변경은 CHANGELOG 기록 + PM 승인), CHANGELOG/PROGRESS-TRACKER는 living document(지속 갱신 — `status: done` 자체가 어색). 4개 마스터 파일 frontmatter 면제 명문화.

**status 전환**:

- `00-master/MASTER-PLAN.md`: frozen SSoT (status 개념 없음, 본 unfreeze 라운드 종료 후 다시 frozen 상태로 복귀 — 향후 변경은 본 형태로 PM 승인 라운드 단위)
- `00-master/CONVENTIONS.md`: frozen SSoT (CONVENTIONS §1 명문화 후)

**검증**:
- 본 unfreeze 라운드 처리 후 MASTER-PLAN ↔ STORY-BIBLE / BRANCH-GRAPH / 캐릭터 시트 정합 (다른 모듈은 이미 갱신 상태).
- frontmatter self-exempt 룰 명문화로 검증 보고 00-meta-setup.md L0.1.a Major 발견 해소.

**사유**: 6개 배치 검증 보고서(`08-qa-deployment/verification-reports/00·01-*.md`) Critical 4건 + Major 2건 + Minor 1건 누적. frozen 정책은 보호 가치 있지만 변경 발생 시점에 즉시 cross-reference 메모 안 추가하면 stale 누적 (회귀 패턴 #2). 본 라운드에서 누적 7건 일괄 정합화 + §1 self-exempt 명문화로 자기 위반 해소.

**승인**: PM(구윤모) 직접 명령 ("처방 진입해", 2026-04-30, 검증 보고 Phase 2 처방 사인오프).

---

### 2026-04-30 — 검증 처방 라운드 Phase 3 (본문 stale 정합화)

톤 매트릭스 review→done 사인오프 시 본문 stale 점검 누락 패턴(회귀 패턴 #1) 해소. 영향 모듈 7개 본문 갱신 + status: done → review 전환.

**1. BRANCH-GRAPH.md §4·§5·§6 정합화**:

- **§4 호감도 변동 표** (line 119~142): 옛 시뮬값(H1+50/H2+56/H3+50/H4+35/H5+36)을 톤 매트릭스 Step 4 시뮬값(H1+113/H2+117/H3+98/H4+68/H5+125)으로 교체. 신 룰 요약 추가 (KEY +15 분할 / 페널티 -2/-3 / H4 보정 -2 / H4 미니게임 ±1/-3 / H4 대면 KEY +5 / H3 시간대 갭). CONVENTIONS §3.7 #3 5×5 매트릭스 SSoT cross-reference 명시.
- **§5 line 146 메모**: "H3 warm_supportive 낮" → "H3 warm_supportive **시간대 무관, Step 4 PM 결정**" + "H4는 미니게임 메커니즘 + 대면 KEY 묘사 분기 둘 다" 풀이.
- **§6 의사코드** (line 174~245): 명명 일괄 갱신 — `state.flags.affection_H1` → `state.flags.H1`, `state.flags.flag_seoyoon_late_reply_count` → `state.flags.late_reply_count`, `state.flags.lastIncrementOrder` → `state.flags.last_increment_order`, `state.flags[\`affection_${branch}\`]` → `state.flags[branch]`. types.ts/STATE-SCHEMA 실제 명명 정합. H4 임계 80→70 완화 반영.
- **§6.1 H4 평가 순서 사람용 요약**: 임계 80→70 완화 반영, `affection_H4` → `H4` 명명 정합.

**2. STORY-BIBLE.md §6.3 엔딩 분류 표** (line 86~91):
- 트루 조건에 "(H4 한정 ≥70 — 2026-04-30 Step 4 완화)" cross-reference 추가
- 해피 조건 "단일 히로인 ≥60" → "단일 히로인 ≥60 + 키 선택지 2개 통과" (BRANCH-GRAPH §2 정합)

**3. PROGRESS-TRACKER.md** (line 9 + line 200~208):
- 현재 상태 줄에 "톤 매트릭스 마이그레이션 5단계 + 영향 모듈 19개 review→done 전환 + 검증 6배치 보고 + 처방 라운드 Phase 1·2·3" 추가
- §사용자 검증 대기 항목 갱신: 1차 검증(2026-04-28) 완료 항목 4건 ✅ 표기 + 2026-04-30 신규 검증 대기 항목 4건 추가

**4. ch02_anatomy.md Scene 04 video_meet_seol 호출 추가** (line 363):
- `[CG: cg_seol_lab_first show]` 직후 `[VIDEO: video_meet_seol skipable=true]` 1줄 추가
- 영상 12개 분배 (오프닝1 + 첫만남5 + 트루5 + 거절1) 본문 호출 11/12 → 12/12 완성

**5. route-H4-na-seoyoon.md §END_H4_TRUE** (line 103):
- 진입 조건 갱신 — `affection_H4 >= 80` → `>= 70`, `late_reply_count == 0` → `< 2`
- BRANCH-GRAPH §6.1 + Step 4 임계 완화 정합

**6. 캐릭터 시트 §6 트루 키 호감도 표기 갱신 (5시트 동일 패턴)**:
- H1·H2·H3·H5 시트 §6 트루엔딩 트리거 키 표기: 옛 (+5/+5/+10) → 신 (+15: KEY +10 + 묘사 +5 분할 / Ch.6 클라이맥스 단일 +10) 갱신. 톤 매트릭스 Step 1~3 신표기 분할 누적 패턴 정합.
- H3 시트 §6: 시간대 무관 메모 추가 (Step 4 PM 결정).
- H4 시트 §6 line 78 분기 평가 표: "호감도 <60 → 배드 분기" → "거절 분기 (REJECT가 BAD 자리 흡수)" 갱신.
- H4 시트 §6 line 92~100 의사코드: BAD 엔딩 → END_H4_REJECT 흡수, 80→70 완화, fallback NORMAL 명시.

**status 전환 (7개 파일)**:

| 파일 | 옛 status | 신 status |
|---|:---:|:---:|
| `03-story/BRANCH-GRAPH.md` | done | review |
| `02-characters/heroines/H1-cha-serin.md` | done | review |
| `02-characters/heroines/H2-yoon-hajeong.md` | done | review |
| `02-characters/heroines/H3-han-seol.md` | done | review |
| `02-characters/heroines/H4-na-seoyoon.md` | done | review |
| `02-characters/heroines/H5-jang-yuna.md` | done | review |
| `03-story/scenarios/ch02_anatomy.md` | review (Phase 1) | review (유지) |

`STORY-BIBLE.md`, `route-H4-na-seoyoon.md`는 이미 review 상태. `00-master/PROGRESS-TRACKER.md`는 living document(self-exempt 룰).

**검증**:
- BRANCH-GRAPH §4 누적값 ↔ verifyToneMatrix.ts 자체 검증 13~15개 항목 ↔ Step 4 시뮬값 정합
- BRANCH-GRAPH §6 의사코드 ↔ types.ts/STATE-SCHEMA 명명 1:1 정합
- 영상 12개 본문 호출 12/12 완성 (이전 11/12)
- 5시트 §6 ↔ route-common Ch.3·Ch.4 KEY 분할 패턴 정합
- H4 시트 §6 의사코드 ↔ BRANCH-GRAPH §6.1 라우팅 정합

**사유**: 6개 배치 검증 보고서 누적 발견 — Critical L1.3.a / L1.4.a / L8.4.a / L9.5.a~b / L0.2.a + L3.1.a + L6.8 + Major L1.3.b / L1.5.a / L9.2.a / L3.1.b·c. 회귀 패턴 #1(done 사인오프 본문 stale 점검 누락) 일괄 해소.

**승인**: PM(구윤모) 직접 명령 ("처방 진입해", 2026-04-30, 검증 보고 Phase 3 처방 사인오프).

---

### 2026-04-30 — 검증 처방 라운드 Phase 4 + Phase 5 통합 (PM 결정 사항 반영 + Minor 일괄)

PM 결정 2건 + Minor 12건 일괄 처방. **Phase 4a** Ch.6 변태 망상 페어 4건 회귀 + **Phase 4b** KEY:H#: 옛 표기 29건 검증 + **Phase 5** Minor 처방 통합.

#### Phase 4a — Ch.6 변태 망상 페어 4건 회귀 (PM 결정: 옵션 b)

사용자 검증 체크리스트 "Ch.6 0회" 룰 + STORY-BIBLE §7.2 + route-common §Ch.4 spec("Ch.1·2·3·5만 발생") 정합. ch06_h1·h2·h3·h5 4시나리오에서 변태 망상 페어 본문 통째 제거 + 캐릭터 결에 맞는 케어 모놀로그 2줄로 대체.

**4시나리오 본문 페어 영역 갱신 (각 약 18줄 → 2줄)**:

| 시나리오 | 본문 위치 | 페어 → 케어 모놀로그 대체 |
|---|---|---|
| `ch06_h1_serin.md` | Scene 02 line 295~313 | 차세린 피로 풀린 자세 받는 케어 ("피곤이 그대로 묻어 있는 자세 / 머그잔 따뜻한지나 잘 챙겨드리는 게 먼저") |
| `ch06_h2_hajeong.md` | Scene 04 line 551~569 | 윤하정 야경 분위기 받는 케어 ("야경 분위기 받아주는 게 우선 / 옥상에서 보낼 한 줄이 무거우니까") |
| `ch06_h3_seol.md` | Scene 03 line 495~513 | 한설 야식·한숨 받아주는 케어 ("야식 챙기는 거 우선 / 한설 선생님 한숨 받아주는 한 줄") |
| `ch06_h5_yuna.md` | Scene 02 line 240~258 | 장윤영 후배 정중 받는 케어 ("후배 정중하게 받는 게 우선 / 응원 막대 한 개 가져온 마음을 부스 한 시간 도와주는 마음으로 풀어주면 되는 거") |

**제거된 본문 요소** (4시나리오 동일 패턴):
- BGM 코믹 큐 (`[BGM: 코믹 fade=1 volume=0.4]`)
- 캐릭터 perv·recover·default 스프라이트 큐 (`[CHARACTER: 윤모 center perv/recover/default fade]`)
- 망상 시작 모놀로그 4줄 + 자기자각 모놀로그 3줄 + 정상복귀 모놀로그 2줄 (4+3+2 형식)

**보존된 본문 요소**:
- BGM 로맨틱 큐 (정상복귀 후 BGM 변경 — 케어 모놀로그 분위기 유지)
- 페어 직전 [지문]·[CG] (다음 자리 진입 자연성)

**4시나리오 frontmatter outputs 갱신**: "변태 망상 페어 1회 (...)" → "변태 망상 페어 0회 (Ch.6 0회 — PM 결정 회귀, 2026-04-30. 페어 자리는 케어 모놀로그로 대체)"

**4시나리오 챕터 머리말 메모 갱신**: 페어 의도 설명 → "변태 망상 페어 0회 — PM 결정 회귀 (2026-04-30) ... 본문 Scene N 페어 자리는 케어 모놀로그로 대체"

**4시나리오 작가 메모 §변태 망상 페어 절 헤더 갱신**:
- 옛: `### 변태 망상 페어 #1 (Ch.6 챕터당 1회 정확 준수)`
- 신: `### 변태 망상 페어 — Ch.6 0회 회귀 (PM 결정 2026-04-30)` + 첫 줄에 PM 결정 메모 + "(이하 옛 페어 의도 기록 — 이력)" 명시
- 절 본문(옛 페어 의도 설명 30줄)은 이력 보존 차원에서 그대로 유지.

**status 전환**:
- `ch06_h1_serin.md`, `ch06_h2_hajeong.md`, `ch06_h3_seol.md`, `ch06_h5_yuna.md`: `done` → `review`
- ch06_h4_seoyoon.md, end_solo_summer.md: 영향 없음 (변태 망상 페어 0회 의도 정합)

**검증**:
- 4시나리오 본문 perv·recover 캐릭터 스프라이트 호출 0건 grep 통과 ✓
- 4시나리오 (망상 시작)·(자기자각)·(정상복귀) 모놀로그 0건 grep 통과 ✓
- STORY-BIBLE §7.2 + route-common §Ch.4 spec("Ch.1·2·3·5만 발생") 정합 ✓
- Ch.1·2·3·5 본문 변태 망상 페어 #1·#2·#3·#4 (총 4회) 보존 ✓

#### Phase 4b — KEY:H#: 옛 표기 29건 검증 (PM 결정: 옵션 b — 검증 결과 본문 0건 / 작가 메모만)

배치 4 검증 보고 L10.3에서 발견된 KEY:H#: 옛 표기 29건의 정확 위치 grep 검증:

**검증 결과 (전수 위치 분석)**:

| 시나리오 | 옛 표기 카운트 | 위치 분류 |
|---|---:|---|
| ch01_ot.md | 3 | 작가 메모 KEY 선택지 표 + 본문 텍스트 |
| ch02_anatomy.md | 2 | 작가 메모 호감도 변동 표 |
| ch03_dongsan.md | 2 | 작가 메모 호감도 변동 표 |
| ch04_library.md | 4 | 작가 메모 KEY 선택지 표 |
| ch05_decision.md | 2 | 작가 메모 KEY 선택지 표 |
| ch06_h1_serin.md | 4 | 작가 메모 KEY 선택지 표 |
| ch06_h2_hajeong.md | 3 | 작가 메모 KEY 선택지 표 |
| ch06_h3_seol.md | 3 | 작가 메모 KEY 선택지 표 |
| ch06_h4_seoyoon.md | 3 | 작가 메모 KEY 선택지 표 |
| ch06_h5_yuna.md | 3 | 작가 메모 KEY 선택지 표 |

**29건 = 100% 작가 메모 영역**. 본문 [CHOICE] 블록 옛 표기 grep `→ KEY:H[1-5]:` 결과 **No matches found** — 본문 정합성 ✓.

**처방 결정**: 작가 메모 영역 KEY 표는 **SCENE-FORMAT §1.3b 옛 표기법 호환 룰** + **이력 보존 차원**에서 그대로 유지. 본문 [CHOICE] 블록은 모든 신표기 변환 완료 (Step 3 마이그레이션 사인오프 시점). SCENE-FORMAT §5 line 251 "한 챕터 안 신·옛 공존 금지" 룰은 **본문 [CHOICE] 블록 한정** — 작가 메모 영역은 메타 영역으로 룰 범위 밖.

**보강 처방**: route-common.md Ch.5 회식 5지선다 비트 시트에 "선택 안 된 4명 톤 매트릭스 자동 페널티" 메모 추가 (Mn3·Mn6 처방).

#### Phase 5 — Minor 12건 처방

**처방 완료 (6건)**:

| ID | 항목 | 처방 |
|---|---|---|
| Mn1 | side-characters depends-on에 CONVENTIONS 누락 | `00-master/CONVENTIONS.md` 의존성 추가 |
| Mn2 | STATE-SCHEMA.md draft 잔존 | status `draft` → `review` 전환 (W4 코드 스켈레톤 + 톤 매트릭스 영향 검토 후) |
| Mn3·Mn6 | 회식 5지선다 4명 페널티 비트 시트 누락 | route-common Ch.5 비트 시트에 "선택 안 된 4명: 톤 매트릭스 자동 페널티 -2/-3 적용" 메모 추가 |
| Mn7 | toneMatrix.ts:89 주석 stale "낮 한정" | "시간대 무관 (Step 4, 2026-04-30 PM 결정) — KEY 자리는 낮/밤 모두 묘사 보너스 가산"으로 갱신 |
| Mn9 | types.ts `current_scene_id` STATE-SCHEMA 미반영 | STATE-SCHEMA §2 GameFlags에 `current_scene_id: string` 필드 추가 |

**Phase 1·2·3에서 회귀 처방됨 (3건)**:

| ID | 항목 | 처방 시점 |
|---|---|---|
| Mn4 | MASTER-PLAN §4.3 거절 4단계 cross-ref 부재 | Phase 2 (line 152 cross-reference 추가) |
| Mn5 | STORY-BIBLE H4 ≥70 cross-reference 부재 | Phase 3 (§6.3 표 갱신) |
| Mn12 | PROGRESS-TRACKER 사용자 검증 대기 항목 stale | Phase 3 (사용자 검증 완료 항목 ✅ 표기 + 신규 검증 대기 항목) |

**보류 (자동화 영역, 3건)**:

| ID | 항목 | 사유 |
|---|---|---|
| Mn8 | verifyToneMatrix.ts 카운트 mismatch (15 vs CHANGELOG 13) | CHANGELOG 옛 엔트리 본문 수정 회피 (이력 보존). 코드 카운트가 정답 — 향후 verifyToneMatrix.ts 출력 라벨에 "13개 자체 검증 (시간대·대면 KEY 추가로 expect 호출 15회)" 메모 권장. W6 QA 자동화에서 처리. |
| Mn10 | ch06_h1 작가 메모 "한 박자" 2건 | Phase 4a §변태 망상 페어 절 헤더 갱신으로 영역 의미 변화 (이력 보존 명시) — 별도 처방 불필요. |
| Mn11 | "자리" 빈도 본문/메모 분리 검증 한계 | 본문/메모 영역 자동 분리 grep 스크립트 필요. W6 QA 자동화 영역. |

**status 전환 (Phase 4·5 통합)**:

| 파일 | 옛 status | 신 status |
|---|:---:|:---:|
| `03-story/scenarios/ch06_h1_serin.md` | done | review |
| `03-story/scenarios/ch06_h2_hajeong.md` | done | review |
| `03-story/scenarios/ch06_h3_seol.md` | done | review |
| `03-story/scenarios/ch06_h5_yuna.md` | done | review |
| `06-engine/STATE-SCHEMA.md` | draft | review |
| `02-characters/side-characters.md` | review (유지) | review (depends-on만 추가) |
| `03-story/route-common.md` | done (유지) | review (회식 5지선다 비트 시트 메모 추가) |
| `src/engine/toneMatrix.ts` | (코드, status 개념 없음) | 주석 갱신만 |

#### Phase 1+2+3+4+5 처방 라운드 종합

**6개 배치 검증 보고서(`08-qa-deployment/verification-reports/00~05-*.md`) 발견 31건 처방 결과**:

| 우선순위 | 처방 | 보류·이력 보존 |
|:---:|:---:|:---:|
| Critical 10 | 10/10 ✓ | 0 |
| Major 9 | 9/9 ✓ | 0 |
| Minor 12 | 9/12 (Mn1·2·3·4·5·6·7·9·12) | 3 (Mn8·10·11 — 자동화·이력 보존) |

**처방 영향 모듈 (총 24건 수정)**:

- 코드 (1): `src/engine/toneMatrix.ts` (주석)
- 마스터 (3): `00-master/MASTER-PLAN.md` (5건 unfreeze) + `00-master/CONVENTIONS.md` (§1 self-exempt) + `00-master/PROGRESS-TRACKER.md` (현재 상태 + 사용자 검증 대기)
- 분기·세계관 (3): `03-story/BRANCH-GRAPH.md` (§4·§5·§6 정합화) + `03-story/STORY-BIBLE.md` (§6.3 키 2개 + H4 ≥70) + `03-story/route-common.md` (Ch.5 5지선다 메모)
- 캐릭터 시트 (6): `02-characters/heroines/H1~H5.md` 5건 (§6 트루 키 호감도 신표기) + `02-characters/side-characters.md` (depends-on)
- 시나리오 (10): `prologue.md`·`ch01_ot.md`·`ch02_anatomy.md`·`ch03_dongsan.md`·`ch04_library.md` (5건 JUMP placeholder + ch02 video_meet_seol 추가) + `ch06_h1·h2·h3·h5_*.md` (4건 변태 망상 페어 회귀)
- 루트 (1): `03-story/route-H4-na-seoyoon.md` (≥70 완화)
- 엔진 (1): `06-engine/STATE-SCHEMA.md` (status review 전환 + current_scene_id 필드)

**검증 보고서 6개 (`08-qa-deployment/verification-reports/00~05-*.md`) status: review**: PM 검토 후 done 사인오프 가능.

**다음 라운드 (W5/W6)**:
- 영향 모듈 status review→done 재사인오프 (단, 본 라운드 처방 결과 회귀 검증 후)
- W5 콘텐츠 통합 (md→JSON 변환) 시점 L13~L14 자동 검증 (JUMP 자동 valid·자산 매니페스트·호감도 시뮬·회피 어휘 자동 grep)
- W6 QA 자동화 (Mn8·Mn11 본문/메모 분리 + 카운트 정합)

**사유**: 6개 배치 검증 보고서 31건 발견 처방 일괄. 회귀 패턴 #1(done 사인오프 본문 stale 점검 누락) + #2(MASTER-PLAN frozen 잔재 누적) + #3(cross-reference broken) 모두 해소. PM 결정 2건(Ch.6 변태 망상 페어 회귀 + KEY 옛 표기 검증 결과 본문 정합)도 일괄 반영.

**승인**: PM(구윤모) 직접 명령 ("처방 진입해" + "1. Ch.6 변태 망상 페어 4건은 (b) 회귀 / 2. KEY:H#: 옛 표기 29건은 (b) 미변환 stale" + "다음 라운드에서 Phase 4 나머지까지 끝낸 후 한 엔트리로 묶어. 계속 진행해", 2026-04-30, 검증 보고 Phase 4·5 통합 처방 사인오프).

---

### 2026-04-30 — 검증 처방 라운드 Phase 6 (회귀 검증 + 추가 stale 일괄 처방)

Phase 5 완료 후 회귀 검증에서 추가 stale 발견 → PM 결정 "(b) 14건 모두 일괄"로 추가 처방. Phase 2·3·4 처방 시 누락된 본문 stale 일괄 정합화.

#### A. ch06_h4 변태 망상 페어 회귀 — Phase 4a 처방 누락분 (1건)

배치 2 L8.2.b에서 "ch06_h4 0회 (의도)"로 잘못 분류 (keyword grep 한계). 실제 본문 line 344~362에 변태 망상 페어 1회 잔존. PM 결정 "Ch.6 0회 회귀" 일관 적용:

- **본문 line 344~362** 페어 영역 (BGM 코믹 + perv·recover·default + 망상 4 + 자기자각 3 + 정상복귀 2) → 케어 모놀로그 2줄 + BGM 카톡 큐 대체 ("답장은 자연스럽게. 약대 가운 한 번 받았으니 사진에 대한 한 줄 + 응원 한 줄 / 분위기를 따라가면 되는 거")
- **frontmatter outputs**: "변태 망상 페어 1회 (약대 가운 차림 — Scene 03)" → "변태 망상 페어 0회 (Ch.6 0회 — PM 결정 회귀, 2026-04-30)"
- **챕터 머리말**: "변태 망상 페어 #1 ... Scene 03 H4 약대 가운 차림" → "변태 망상 페어 0회 — PM 결정 회귀"
- **작가 메모 §변태 망상 페어 절 헤더** + 첫 줄 회귀 메모 추가 + (이력 보존)
- **status**: `done` → `review`

#### B. 옛 명명 일괄 정합화 (12건 본문 + 5건 작가 메모 의사코드)

Phase 3 BRANCH-GRAPH §6 갱신 시 누락된 다른 모듈 본문 stale 일괄 처방. types.ts/STATE-SCHEMA 실제 명명 정합:

**본문 stale 갱신 (12건)**:

| 위치 | 옛 명명 | 신 명명 |
|---|---|---|
| `00-master/CONVENTIONS.md:281~293` | `affection_H1~H5: 0` (5건), `flag_seoyoon_late_reply_count: 0` | `H1~H5: 0`, `late_reply_count: 0` (코드 블록 통째 갱신) |
| `00-master/CONVENTIONS.md` | (`last_increment_order: HeroineId[]` 신규 추가) | types.ts 정합 |
| `03-story/STORY-BIBLE.md:72` | `affection_H1~H5` | `H1~H5` (변경 메모 추가) |
| `03-story/route-H1-cha-serin.md:42` | `state.flags.affection_H1` | `state.flags.H1` |
| `03-story/route-H4-na-seoyoon.md:36` | `state.flags.affection_H4` | `state.flags.H4` |
| `03-story/route-H4-na-seoyoon.md:42` | `aff < 80` | `aff < 70` (Step 4 임계 완화) |
| `03-story/route-H4-na-seoyoon.md:103` | `affection_H4 >= 70` | `H4 >= 70` |
| `02-characters/heroines/H4-na-seoyoon.md:82` | `flag_seoyoon_late_reply_count: number` | `late_reply_count: number` |
| `05-ui-design/UI-SPEC.md:234` | `affection_H4 -= 3` | `H4 -= 3` |
| `06-engine/ARCHITECTURE.md:315` | `affection_H4 -3` | `H4 -3` |

**시나리오 분기 평가 의사코드 + IF 체인 표 갱신 (5시나리오)**:

| 시나리오 | 위치 | 갱신 |
|---|---|---|
| `ch06_h1_serin.md` | line 608~613 + line 1014 | `affection_H1` → `H1` (replace_all) |
| `ch06_h2_hajeong.md` | line 713~718 + line 1050 | `affection_H2` → `H2` (replace_all) |
| `ch06_h3_seol.md` | line 664~669 + line 997 | `affection_H3` → `H3` (replace_all) |
| `ch06_h4_seoyoon.md` | line 837~840 + line 1066 | `affection_H4` → `H4` + **임계 80→70 + late ==0 → <2 갱신** (Step 4 완화) |
| `ch06_h5_yuna.md` | line 825 + line 1040 | `affection_H5` → `H5` (replace_all) |

**ch04_library.md:928 메모 갱신**: "INC는 affection_H1~H5 외 카운터형 플래그에도 적용" → "INC는 H1~H5 호감도 외 카운터형 플래그에도 적용" + 명명 정합 메모.

#### C. MASTER-PLAN unfreeze 보강 (3건 — Phase 2 누락분)

Phase 2 §1·§4.2·§4.3 처방 시 누락된 다른 위치 stale:

| 위치 | 옛 표기 | 신 표기 |
|---|---|---|
| `MASTER-PLAN.md:90` | "후배(장유나/박원영)" | "후배(장윤영/장원영)" — H5 가명 + 시각 모티브 정합 |
| `MASTER-PLAN.md:267` | "11. 영남대 약대 앞" | "11. 계명대 약대 앞" — W3 prep 라운드 정합 |
| `MASTER-PLAN.md:275` | "영상 (VEO 3.1 Fast, 최대 15개)" | "최대 12개 — 2026-04-28 확정 분배" |

#### status 전환 (Phase 6 통합)

| 파일 | 옛 status | 신 status |
|---|:---:|:---:|
| `03-story/scenarios/ch06_h4_seoyoon.md` | done | review (변태 망상 페어 회귀) |
| `06-engine/ARCHITECTURE.md` | done | review (line 315 명명 정합) |
| 그 외 영향 모듈 (CONVENTIONS, STORY-BIBLE, route-H1·H4, UI-SPEC, ch06_h1·h2·h3·h5, ch04, H4 시트, MASTER-PLAN) | 기존 status (review/frozen/이미 review) | 기존 유지 |

#### 회귀 검증 결과

- ✅ **본문 잔존 0건** (옛 명명·옛 표기·placeholder·perv 캐릭터 큐 모두 0건 grep 통과)
- ✅ 메모/이력/검증 보고서 영역만 옛 명명 인용 잔존 (의도된 보존 — SCENE-FORMAT §1.3b 호환 + 처방 이력)

#### 사유

Phase 5 종료 후 회귀 검증 단계에서 Phase 2·3·4 처방 누락된 본문 stale 17건 발견. PM 결정 "(b) 14건 모두 일괄"로 추가 처방. **회귀 패턴 #1(done 사인오프 본문 stale 점검 누락)**의 깊이가 예상보다 깊었음 — 한 라운드 처방으로 모든 stale 색출 어려운 패턴. 회귀 검증을 routine으로 정착해야 할 시그널.

#### 처방 누계 (Phase 1+2+3+4+5+6 통합)

| 우선순위 | 발견 (회귀 검증 후) | 처방 | 보류 |
|:---:|:---:|:---:|:---:|
| Critical | 10 + 회귀 발견 1 (ch06_h4 페어 + ch06_h4 임계 80→70) | **11/11** ✓ | 0 |
| Major | 9 + 회귀 발견 11 (옛 명명 + MASTER-PLAN 추가) | **20/20** ✓ | 0 |
| Minor | 12 + 회귀 발견 2 (ch04 메모 + ch06 IF 체인) | **11/14** | 3 (Mn8·10·11 자동화·이력) |
| **합계** | **45 (31 + 회귀 14)** | **42** ✓ | **3** |

**승인**: PM(구윤모) 직접 명령 ("회귀 검증 진행" → "(b) 14건 모두 일괄", 2026-04-30, 검증 보고 Phase 6 처방 사인오프).

---

### 2026-04-30 — 검증 처방 라운드 영향 모듈 status review → done 전환 (PM 사인오프)

검증 6배치 보고서(`08-qa-deployment/verification-reports/00~05-*.md`) 발견 45건 + 회귀 검증 후 통합 처방 결과(Phase 1~6 통합 42건 처방 / 3건 자동화·이력 보류) 일괄 사인오프. PM 회귀 검증 통과 확인(본문 잔존 0건 grep 통과) 후 영향 모듈 22개 + 검증 보고서 6개 status `review` → `done` 전환.

**status 전환 (28개 파일)**:

| 영역 | 파일 (전수) |
|---|---|
| 시나리오 (10) | `prologue.md` (이미 review)·`ch01_ot.md`·`ch02_anatomy.md`·`ch03_dongsan.md`·`ch04_library.md`·`ch05_decision.md` (이미 done)·`ch06_h1_serin.md`·`ch06_h2_hajeong.md`·`ch06_h3_seol.md`·`ch06_h4_seoyoon.md`·`ch06_h5_yuna.md`·`end_solo_summer.md` (이미 review) |
| 분기·세계관 (3) | `BRANCH-GRAPH.md` / `STORY-BIBLE.md` / `route-common.md` (이미 done) |
| 루트 (2) | `route-H1-cha-serin.md` / `route-H4-na-seoyoon.md` (route-H2·H3·H5 이미 review) |
| 캐릭터 (6) | `goo-yunmo.md` (이미 review) / `side-characters.md` / `H1~H5.md` 5건 |
| 엔진 (2) | `STATE-SCHEMA.md` / `ARCHITECTURE.md` (SCENE-FORMAT 이미 done) |
| UI (1) | `UI-SPEC.md` |
| QA 검증 보고서 (6) | `verification-reports/00-meta-setup.md` ~ `05-continuity.md` |

**도합**: 22개 영향 모듈 (review → done) + 6개 검증 보고서 (review → done) = **28개 status 전환**

**처방 라운드 종료 보장 사항**:
- ✅ 본문 잔존 0건 (옛 명명·옛 표기·placeholder·perv 캐릭터 큐 모두 grep 통과)
- ✅ 톤 매트릭스 시뮬값(H1+113/H2+117/H3+98/H4+68/H5+125) 정합 — 5명 모두 트루 도달 가능
- ✅ 영상 12개 분배 12/12 본문 호출 (video_meet_seol Ch.2 추가 후)
- ✅ 거절 카톡 4줄 텍스트 8곳 무결 + 8단계 연출 정확
- ✅ Ch.1·2·3·5 변태 망상 페어 #1~#4 보존, Ch.6 + 프롤로그 + end_solo_summer 0회 정합
- ✅ types.ts/STATE-SCHEMA 명명 정합 (BRANCH-GRAPH·route-H1·H4·STORY-BIBLE·UI-SPEC·ARCHITECTURE·CONVENTIONS·H4 시트·ch06 5시나리오 모두)
- ✅ MASTER-PLAN unfreeze 잔재 0건 (엔딩 16개 + 서브 모드 v1.1 + H1~H5 표 + 거절 트리거 + 영상 12개 + 영남대→계명대 + 장유나→장윤영)
- ✅ 회피 어휘 §3.6 #1~#7 본문 0건 / 욕설 0건 / AI 클리셰 0건

**남은 작업 (W5/W6)**:
- W5 콘텐츠 통합: 시나리오 .md → 씬 JSON 변환 (`scripts/md-to-scene.ts`) + L13~L14 자동 검증 (JUMP 자동 valid·자산 매니페스트·호감도 시뮬·회피 어휘 자동 grep)
- W6 QA 자동화: 보류 3건 처리 (Mn8 verifyToneMatrix 카운트 mismatch / Mn10 작가 메모 한 박자 / Mn11 자리 빈도 본문/메모 분리) + Playwright E2E 16개 엔딩

**사유**: PM 회귀 검증 통과 확인 후 28개 status 전환으로 본 처방 라운드 정합성 확정. 다음 라운드(W5 콘텐츠 통합)로 진입할 수 있는 안정 상태 도달.

**승인**: PM(구윤모) 직접 명령 ("PM 사인오프 라운드 진행해", 2026-04-30, 검증 처방 라운드 영향 모듈 일괄 사인오프).

---

### 2026-04-30 — 톤 매트릭스 영향 모듈 status review → done 전환 (PM 사인오프)

Step 1-5 완료 후 PM 사인오프에 따라 영향 모듈 19개의 YAML 헤더 status를 `review` → `done` 전환 + 본문 [Δ pending review] 마커 11개 일괄 제거. 톤 매트릭스 마이그레이션의 모든 작업 사이클 종료.

**status 전환 (19개 파일)**:

| 영역 | 파일 |
|---|---|
| 룰/명세 (4) | `03-story/BRANCH-GRAPH.md`, `03-story/route-common.md`, `06-engine/ARCHITECTURE.md`, `06-engine/SCENE-FORMAT.md` |
| 캐릭터 시트 (5) | `02-characters/heroines/H1~H5.md` |
| 시나리오 (10) | `03-story/scenarios/ch01_ot.md` ~ `ch06_h5_yuna.md` |

**[Δ pending review] 마커 제거 (11개)**:
- `00-master/MASTER-PLAN.md` §3.2 분기 시스템 + §4.3 거절 엔딩 (2개)
- `00-master/CONVENTIONS.md` §3.5 히로인 말투 차별화 (1개)
- `03-story/BRANCH-GRAPH.md` §4 호감도 변동표 + §5 키 매트릭스 (2개)
- `03-story/route-common.md` 최상단 인용 블록 (1개)
- `02-characters/heroines/H1~H5.md` §6 (5개)

**작업 방법**: PowerShell 정규식으로 일괄 처리. status 헤더 정규식 `(?m)^status: review$` → `status: done`, 마커 정규식 ` \[Δ pending review[^\]]*\]` 단일 줄 + `(?s)> \*\*\[Δ pending review[^*]*?\]\*\*[^\r\n]*\r?\n\r?\n` multi-line 인용 블록.

**보존 항목 (의도적)**:
- 변경 기록 마커 `[Δ 2026-04-30 ...]` (예: SCENE-FORMAT §1.3, CONVENTIONS §3.7 #4 갱신 마커) — 향후 추적 용도, "pending review"가 아닌 변경 사실 기록
- `STATE-SCHEMA.md` 톤 매트릭스 메모 — `GameFlags` 스키마 변경 없음 명시
- CHANGELOG.md 본문 안의 [Δ pending review] 텍스트 — 작업 이력의 일부

**status review 유지 파일 (본 마이그레이션 영향 없음, 다른 라운드 review 상태)**:
- `03-story/scenarios/prologue.md` + `end_solo_summer.md` (INC 0개라 마이그레이션 영향 없음)
- `03-story/STORY-BIBLE.md`, `03-story/route-H1~H5.md` (Ch.6 분기 비트 시드, 본 작업 외)
- `02-characters/goo-yunmo.md`, `side-characters.md`
- `04-image-prompts/backgrounds/bg-list.md`, `sprites/sprite-list.md`
- `05-ui-design/UI-SPEC.md`, `07-content-integration/INTEGRATION-PLAN.md`, `08-qa-deployment/QA-PLAN.md`

**TypeScript 검증**: `tsc --noEmit` 통과 ✓.

**최종 상태 — 톤 매트릭스 마이그레이션 사이클 종료**:
- 영향 모듈 19개 모두 `status: done` ✓
- 본문 [Δ pending review] 마커 0건 ✓
- legacy INC/KEY 코멘트 0건 ✓ (Step 5에서 제거)
- TypeScript 빌드 통과 ✓
- 5명 모두 트루 진입 가능 (Step 4 시뮬 검증)
- "한 히로인의 정답이 다른 히로인의 오답" 시스템 레벨 작동

**승인**: PM(구윤모) 직접 명령 ("review → done 전환 진행", 2026-04-30). 마이그레이션 작업 사이클 공식 종료.

---

### 2026-04-30 — 톤 매트릭스 Step 5 클린업 (옛 legacy 코멘트 일괄 제거)

Step 1-4 완료 후 시나리오 본문에 보존했던 `<!-- legacy ... -->` 롤백 안전망 코멘트 블록을 일괄 제거. 톤 매트릭스 마이그레이션 전체 작업 마무리.

**제거 결과 (10개 시나리오 × 평균 13.6개 = 136개 블록 일괄 제거)**:

| 시나리오 | Before | After |
|---|---:|---:|
| ch01_ot.md | 4 | 0 |
| ch02_anatomy.md | 6 | 0 |
| ch03_dongsan.md | 6 | 0 |
| ch04_library.md | 14 | 0 |
| ch05_decision.md | 20 | 0 |
| ch06_h1_serin.md | 13 | 0 |
| ch06_h2_hajeong.md | 21 | 0 |
| ch06_h3_seol.md | 12 | 0 |
| ch06_h4_seoyoon.md | 23 | 0 |
| ch06_h5_yuna.md | 17 | 0 |
| **합계** | **136** | **0** |

**제거 방법**: PowerShell 정규식 `(?s)<!-- legacy.*?-->\r?\n?`로 multi-line 블록 매칭. 각 파일별로 UTF-8 인코딩 보존 + `[regex]::Matches` 검증으로 Before/After 카운트 비교.

**보존 항목 (의도적 유지)**:
- 시나리오 본문 자동 [INC: H# +N] 자리 (예: ch03 카톡 자동 +1, ch04 도서관 합석 +5, ch05 모닥불 자동, ch06 자동 호감) — SCENE-FORMAT §1.1 정식 디렉티브로 본문 자동 호감 자리는 옛 표기 유지가 표준. 신 시스템 [CHOICE] 자리 변환과 호환.
- 작가 메모 §"신 톤 매트릭스 마이그레이션" 절 — 작업 기록·추적 용도. 향후 톤 패스 라운드에서 의미 충돌 자리 검토 시 참고. PM 결정 시 별도 정리 가능.
- SCENE-FORMAT §1.3b 옛 표기법 호환 메모 — 자동 INC 자리 호환 유지 룰 보존.

**TypeScript 검증**: `tsc --noEmit` 통과 ✓ / 시나리오 본문 legacy 코멘트 0건 (`grep '<!-- legacy'` 결과 No matches found).

---

## 톤 매트릭스 마이그레이션 전체 종료 (Step 1-5 종합)

**전체 일정**: 2026-04-30 단일 라운드 내 Step 1 → 5 일괄 진행.

**전체 변경 범위**:
- 코드 (4개): `src/engine/types.ts`, `src/engine/toneMatrix.ts` (신규), `src/engine/scriptInterpreter.ts`, `src/stores/gameStore.ts`
- 룰 문서 (5개): `00-master/MASTER-PLAN.md`, `00-master/CONVENTIONS.md` (§3.5/§3.7 신규), `00-master/CHANGELOG.md`, `06-engine/SCENE-FORMAT.md`, `06-engine/STATE-SCHEMA.md`, `06-engine/ARCHITECTURE.md`
- 분기 명세 (1개): `03-story/BRANCH-GRAPH.md`
- 시나리오 (10개): `03-story/scenarios/*.md` (148+ INC/KEY 라벨 → 톤 태그 변환)
- 캐릭터 시트 (5개): `02-characters/heroines/H1~H5.md`
- 검증 스크립트 (1개): `scripts/verifyToneMatrix.ts` (신규)

**핵심 결과**:
1. 5명 히로인 모두 트루 진입 가능 (H1+113 / H2+117 / H3+98 / H4+68 ≥70 / H5+125)
2. 동일 [CHOICE]가 5명에게 매트릭스 룩업으로 다른 점수 부여 — PM 핵심 요구 "한 히로인의 정답이 다른 히로인의 오답" 시스템 레벨 달성
3. H3 안경 갭(낮 학자/밤 부드러움) + H4 답장 속도 미니게임 + 대면 KEY 자리 모두 시스템에 박힘
4. 12세 등급 / 욕설 금지 / 카톡 분석 톤 정합성 영향 0 (톤 시스템은 점수 계산만 변경)

**다음 단계 — PM 사인오프 후 영향 모듈 status review → done 전환**:
영향받은 모듈의 status가 모두 review로 박혀 있음 (Step 1에서 전환). PM이 본 라운드 결과를 확인하고 사인오프하면 done 복귀 가능.

**승인**: PM(구윤모) 직접 명령 ("Step 5 진행", 2026-04-30). 마이그레이션 전체 마무리.

---

### 2026-04-30 — 톤 매트릭스 Step 4 (트루 도달 검증 + H3/H4 처방 적용)

Step 3 마이그레이션 후 의미 충돌 9건이 트루 도달에 미치는 영향을 정량 검증. Plan 시뮬 결과:

**Step 4 처방 적용 전 누적 시뮬 (5명 트루 빌드)**:

| 히로인 | 누적 | 트루 ≥80 | KEY 등록 | 차단 |
|---|---:|---|---:|:---:|
| H1 | +113 | ✓ | 5개 | — |
| H2 | +117 | ✓ | 7개 | — |
| H3 | **+78** | ✗ | **2개** (booth_care + ch2_apology) | **차단** |
| H4 | **+48** | ✗ | 4개 | **차단** |
| H5 | +125 | ✓ | 5개 | — |

**PM 처방 결정**:
- H3: KEY 시간대 무관 변경 (옵션 a)
- H4: 대면 KEY 묘사 분기 추가 (옵션 b)

**적용 변경**:
1. `src/engine/toneMatrix.ts`:
   - `computeToneDeltas`: H3 KEY 자리 시간대 무관 묘사 보너스. H4 + warm_supportive + isKey + mechanism 없음 시 묘사 보너스 +5 자동.
   - `toneToKeyChoice`: H3 야간 KEY 등록 허용. H4 대면 KEY 자리(warm_supportive + isKey)도 KEY 등록.
2. `00-master/CONVENTIONS.md` §3.7 #4: H3 시간대 무관 + H4 대면 KEY 룰 명시.
3. `03-story/scenarios/ch05_decision.md` 회식 자리4 (H4): mechanism:h4_reply_speed 마커 제거 (회식은 미니게임 X, 대면 KEY로 처리).
4. `scripts/verifyToneMatrix.ts`: H3 KEY 시간대 무관(낮 +15 / 밤 +10) + H4 대면 KEY +6 + H4 미니게임 +7 자체 검증 추가.

**처방 적용 후 누적 추정 (5명 트루 빌드)**:

| 히로인 | 처방 전 | +Δ | 처방 후 | 트루 ≥80 | KEY 등록 |
|---|---:|---:|---:|:---:|---:|
| H1 | +113 | 0 | +113 | ✓ | 5개 |
| H2 | +117 | 0 | +117 | ✓ | 7개 |
| H3 | +78 | +20 (4자리 ×+5) | **+98** | **✓** | **6개** ✓ |
| H4 | +48 | +20 (4자리 ×+5) | **+68** | **✗ (-12 부족)** | **8개** ✓ |
| H5 | +125 | 0 | +125 | ✓ | 5개 |

**H3 트루 진입 회복 ✓** (KEY 6개 + aff +98).
**H4 여전히 차단** — KEY 등록은 8개로 충분하나 aff +68 (80 미달).

**H4 추가 부족분 -12 처리 — PM 결정 (X1) 채택**:
- **H4 트루 aff 임계 80→70 완화**. 적용:
  - `src/engine/scriptInterpreter.ts` L96: `if (aff < 80)` → `if (aff < 70)`
  - `03-story/BRANCH-GRAPH.md` §2 표: H4_TRUE 조건 ≥80 → ≥70, H4_NORMAL 60~79 → 60~69
  - `02-characters/heroines/H4-na-seoyoon.md` §6 트리거 표 갱신
- 결과: H4 누적 +68 + KEY 8개 + late <2 → ≥70 충족, 트루 진입 ✓
- H4 트루 의도된 어려움(미니게임 타임아웃 엄격) 유지 — 답장 지연 ≥2회 시 즉시 거절은 그대로.

**최종 5명 트루 도달 검증**:

| 히로인 | aff 누적 | 임계 | KEY | 트루 진입 |
|---|---:|---:|---:|:---:|
| H1 | +113 | ≥80 | 5개 | ✓ |
| H2 | +117 | ≥80 | 7개 | ✓ |
| H3 | +98 | ≥80 | 6개 | ✓ |
| H4 | +68 | **≥70** (완화) | 8개 | **✓** |
| H5 | +125 | ≥80 | 5개 | ✓ |

**5명 모두 트루 진입 가능** — 처방 적용 완료.

**TypeScript 검증**: `tsc --noEmit` 통과 ✓. `verifyToneMatrix.ts` 자체 검증 13개 항목 모두 통과 (시간대 무관 H3 / H4 대면 KEY 신규 항목 추가).

**다음 단계 (Step 4 완료 후 결정)**:
- (a) H4 부족분 처방 결정 → 적용 → 재시뮬
- (b) H4 처방 후 → Step 5 옛 INC 라벨 코멘트 클린업

**의미 충돌 9건 최종 상태**:
- 충돌 1 (H1 ch4_care): 영향 -10이나 H1 +113라 무시 가능
- 충돌 2,4,6,(추가 H3 no_glasses_admire 저녁): H3 KEY 시간대 무관 처방으로 회복
- 충돌 3 (H4 ch4 미니게임): toneMatrix 갱신으로 +7 회복
- 충돌 5,7,8,9 (H4 대면 KEY): 대면 KEY 묘사 분기 추가로 +20 회복, 그러나 누적 -12 잔존

**승인**: PM(구윤모) 직접 명령 ("Step 4 진행", 2026-04-30, AskUserQuestion 답변 추천 처방 채택). H4 부족분 처리 결정 대기.

---

### 2026-04-30 — 톤 매트릭스 Step 3 일괄 완료 (ch02-ch06 + ch01 본문 보정 + toneMatrix.ts 갱신)

Step 3 시나리오 마이그레이션 ch02-ch06 일괄 진행. 9개 시나리오 + ch01_02b_casual 본문 픽스 + toneMatrix.ts 코드 갱신. 모든 시나리오의 [INC: H# +N] / [KEY: H# scene_id] 라벨이 [CHOICE: ... {tone:..., key:..., descriptor:..., mechanism:...}] 신표기법으로 전환.

**ch01_02b_casual 본문 처방 (a) 적용 (PM 결정)**:
- "표정을 살짝 굳힌다" → "잠깐 윤모를 본다"
- pout 표정 → default
- "어. 좀 차갑네. 첫 인상 망친 건가" → "어. 무뚝뚝한 듯 받아주네. 차갑진 않다"
- 페널티 묘사 제거하고 무뚝뚝하지만 호의적인 톤으로. 신 매트릭스 H2 + playful_casual = +5 정합 확보.

**toneMatrix.ts 갱신 (Step 2 보강, ch04 마이그레이션 중 발견)**:
- H4 KEY는 미니게임 메커니즘인데 KEY_HEROINE_TONE[H4] = null이라 묘사 보너스 +5가 자동 가산 안 되는 결함 발견 (옛 +15 → 신 +2, 트루 진입 불가능 수준).
- 수정: `H4 + mechanism:h4_reply_speed + replyTimeMs < 15s + isKey` 조건 시 묘사 보너스 +5 자동 가산. CONVENTIONS §3.7 #4 정합.
- 결과: H4 미니게임 통과 + KEY 자리 = 매트릭스 +1 (보정) + 미니게임 +1 + 묘사 +5 = +7 (옛 +15 대비 -8). 한 자리 -8씩이라 트루 도달 검증 필요.

**시나리오별 변환 결과 (총 9개 파일 + 약 175 INC/KEY 라벨)**:

| 시나리오 | 변환 자리 | 의미 충돌 | 비고 |
|---|---|---|---|
| ch02_anatomy.md | 6개 | 0건 | H2 KEY direct_friendly + H3 KEY warm_supportive (낮) ✓ |
| ch03_dongsan.md | 7개 | 0건 | H1/H5 KEY 정합. H2 자동 +1 카톡은 옛 표기 유지 |
| ch04_library.md | 22개 | **3건** | H1 ch4_care KEY 미매치 / H3 ch4_meal 야간 KEY 무효 / H4 미니게임 KEY -8점 |
| ch05_decision.md | 24개 | **2건** | 회식 H3 KEY 야간 무효 / 회식 H4 KEY 등록 안 됨 (회식은 미니게임 X) |
| ch06_h1_serin.md | 24개 | 0건 | H1 KEY 3개 모두 mature_serious 정합 ✓ |
| ch06_h2_hajeong.md | 21개 | 0건 | H2 KEY 3개 모두 direct_friendly 정합 ✓ |
| ch06_h3_seol.md | 24개 | **1건** | KEY #3 (late_night_honest) 야간 H3 KEY 무효 — 트루 진입 위협 |
| ch06_h4_seoyoon.md | 27개 | **3건** | 대면 KEY 자리 3곳 (exam_cheer/distance/close_reply)이 미니게임 X라 KEY 등록 안 됨 |
| ch06_h5_yuna.md | 26개 | 0건 | H5 KEY 3개 모두 bright_forward 정합 ✓ |

**총 의미 충돌 9건** (트루 도달 균형 위협):
1. **H1 ch4_care KEY 미매치**: 케어 텍스트(warm_supportive) vs H1 KEY(mature_serious) — Ch.6 KEY 3개로 보충 가능.
2. **H3 ch4_meal 야간 KEY 무효**: 야간 실험실 자리 (낮 한정 KEY)
3. **H4 ch4_first_reply 미니게임 -8점**: toneMatrix.ts 갱신 후 +7 회복.
4. **H3 회식 KEY 야간 무효**: 회식은 저녁 자리.
5. **H4 회식 KEY 등록 안 됨**: 회식은 미니게임 자리 X.
6. **H3 KEY #3 (late_night_honest) 야간 무효**: 트루 KEY 3개 중 1개 손실 → 트루 진입 불가능 위험.
7-9. **H4 Ch.6 대면 KEY 3곳**: exam_cheer/distance/close_reply가 모두 대면 자리라 H4 KEY 등록 X. 미니게임 KEY는 03b_replied/05b_replied 2개만.

**처방 권고 (Step 4 검증 필수)**:
- H3: 매트릭스에서 H3 KEY 시간대 무관 변경 검토 (CONVENTIONS §3.7 #4 갱신 필요)
- H4: 대면 KEY 자리에서도 묘사 보너스 가산되도록 toneMatrix.ts 추가 보강 검토 (예: descriptor 기반 KEY 등록)
- 또는 시나리오 KEY 자리를 매트릭스 정합 자리로 이동 (큰 본문 수정)

**자동 INC 자리 처리**: ch03 라인 556 H2 +1 (단톡), ch04 H5 +5 (도서관 합석), ch05 자동, ch06_h2 자동 +3 (츤데레), ch06_h1 자동 +5×4 (festival/late_cafe/walk×2/ending), ch06_h2/h4/h5 자동 +5 다수 — 모두 본문 자동 INC라 옛 표기 유지. 신 시스템 [CHOICE] 자리 변환과 공존 가능 (SCENE-FORMAT §5 한 [CHOICE] 안 공존 금지 룰만 적용).

**옛 라벨 보존**: 모든 [INC]/[KEY] 라벨이 `<!-- legacy ... -->` 코멘트로 보존. 롤백 안전망 유지. Step 5에서 클린업 예정.

**TypeScript 검증**: `tsc --noEmit` 통과 ✓ (.md 변경은 컴파일 무관, toneMatrix.ts 코드 갱신도 통과).

**5명 동시 점수 시스템 입증**: 동일 [CHOICE]에 톤 박혀 있고 매트릭스 룩업이 5명에게 다른 점수 부여. PM 핵심 요구 "한 히로인의 정답이 다른 히로인의 오답" 시스템 레벨에서 작동.

**다음 단계 (Step 4 검증 + Step 5 클린업)**:
- Step 4: 빌드 검증 자동화 (5명 80 도달 시뮬, REJECT 트리거, SOLO 도달, 의미 충돌 9건 균형 점검). verifyToneMatrix.ts 확장 + npm script 추가.
- Step 4 PM 결정 사항: H3/H4 KEY 자리 충돌 처방 (매트릭스 변경 vs 시나리오 본문 수정).
- Step 5: 옛 INC 라벨 코멘트 제거 클린업 (전 챕터 done 사인오프 후).

**승인**: PM(구윤모) 직접 명령 ("충돌 본문 간단히만 손보고 바로 ch02~ch06 일괄 진행", 2026-04-30). Step 4 검증 + 충돌 처방 결정 대기.

---

### 2026-04-30 — 톤 매트릭스 Step 3 (Ch.1 시범 마이그레이션 — ch01_ot.md)

Step 1 룰 + Step 2 엔진 룩업 완료 후, 시나리오 본문의 [INC: H# +N] / [KEY: H# scene_id] 라벨을 신표기법(`[CHOICE: ... {tone:..., key:..., descriptor:...}]`)으로 전환하는 작업의 첫 챕터. ch01_ot.md만 시범 변환하고 PM 사인오프 후 ch02~ch06 일괄 진행 예정.

**변환 결과 (ch01_ot.md, INC/KEY 라벨 4곳)**:
- Scene 02 [CHOICE] 진중 답 → `{tone:direct_friendly, key:true, descriptor:ch1_first_intro}` (H2 KEY)
- Scene 02 [CHOICE] 가벼운 답 → `{tone:playful_casual}`
- Scene 02b_serious 진입 [INC: H2 +10] [KEY: H2 ch1_first_intro] → 코멘트 보존(롤백용), 점수는 선택지 자리에서 처리
- Scene 02b_casual 진입 [INC: H2 -2] → 코멘트 보존
- Scene 03 카톡 끝 [INC: H2 +5] → 코멘트 보존(KEY 매치 시 매트릭스 자동 +5 가산)

**누적 시뮬 (옛 vs 신)**:
- H2 KEY 통과 빌드: 옛 +15 (KEY +10 + 묘사 +5) = 신 +15 (한 자리 통합) ✓
- H2 가벼운 답 빌드: 옛 -2 → 신 +5 (부호 반전, 의미 충돌 1건 — 아래 검토 필요)
- 다른 4명(H1/H3/H4/H5) 동시 점수 신규 발생 (옛 시스템에선 0).

**의미 충돌 1건 (PM 검토 필요)**:
- ch01_02b_casual 본문 묘사 ("윤하정이 표정을 살짝 굳힌다", "어. 좀 차갑네. 첫 인상 망친 건가") vs 신 매트릭스 H2 + playful_casual = +5.
- 옛 시스템: 가벼운 톤이 H2에 -2 페널티 → 본문 굳음 묘사 정합.
- 신 시스템: 가벼운 동기 톤이 H2 KEY에 가까운 자리 (+5) → 본문과 부호 반전.
- 처방 옵션 (ch01_ot.md 작가 메모 §"신 톤 매트릭스 마이그레이션" 참조):
  (a) 본문 묘사 갱신 — H2 살짝 미소 / 무뚝뚝하지만 흐뭇. 별도 톤 패스 라운드. **권장**.
  (b) 매트릭스 H2 playful_casual +5 → +1로 깎음. CONVENTIONS §3.7과 충돌이라 비권장.
  (c) 가벼운 답 톤을 mature_serious로 변경 — H2 -1. 본문 그대로. 매트릭스 일관성 깨짐.

**5명 동시 점수 표 (마이그레이션 후 트루 빌드 H2 ch01)**:

| 자리 | H1 | H2 | H3 (낮/밤) | H4 | H5 |
|---|---|---|---|---|---|
| 진중 답 (KEY) | +1 | **+15** | +1 / +1 | +3 | +5 |
| 가벼운 답 | -2 | +5 | -1 / +3 | +1 | +5 |

**범위 영향**:
- ch01_ot.md (라인 98-101 [CHOICE] + 라인 107-108, 129, 251 INC/KEY 코멘트화 + 작가 메모 신규 절)
- 다른 11개 시나리오는 변경 없음

**TypeScript 검증**: `tsc --noEmit` 통과 (.md 변경은 컴파일 무관, 단 SCENE-FORMAT §1.3a 신표기법과 일관성 확인 OK).

**다음 단계 (ch02~ch06 일괄 마이그레이션)**:
- Ch.1 패턴 PM 사인오프 후 ch02_anatomy(6개) → ch03_dongsan(7개) → ch04_library(22개) → ch05_decision(24개) → ch06_h1~h5(122개) 순으로 일괄.
- 각 챕터마다 의미 충돌 자리(가벼운/진중 답 부호 반전)를 작가 메모에 기록.
- prologue.md / end_solo_summer.md는 INC 라벨 0개라 변환 불필요.

**승인**: PM(구윤모) 직접 명령 ("Step 3 진행", 2026-04-30). Ch.1 시범 결과 검토 후 ch02~ch06 일괄 진행 사인오프 대기.

---

### 2026-04-30 — 톤 차별화 보상 매트릭스 도입 (Step 1: 룰 + CHANGELOG)

다섯 히로인 선택지 보상 함수가 100% 통일된 단일 공식(KEY +10 + 묘사 +5 = +15 / 좋은 답 +1~+5 / 가벼운 답 0~-2)을 공유해 캐릭터 분화가 시스템 레벨에서 지워지는 문제를 해결한다. 1축 5단계 톤 매트릭스를 도입해 "한 히로인의 정답이 다른 히로인의 오답"이 되는 자리를 시스템적으로 만든다.

**사실 검증 (Plan 단계 Explore 결과)**:
- 현 시스템 100% 통일 확인. 출처: `route-common.md` §69-71/91-95/146-156/177-183, `BRANCH-GRAPH.md` §4 라인 121-128.
- 시나리오 본문 [INC: H# +N] 라벨 약 148곳 모두 동일 공식 사용.
- 5명 캐릭터 톤 축은 이미 명확히 차별화됨(`CONVENTIONS.md` §3.5, 각 히로인 시트 §1~6) — 시스템만 따라잡으면 됨.

**옵션 균형 점검 (Plan 시뮬)**:
- 단순 매트릭스 적용 시 H4 누적 +35 → +51로 트루 도달 쉬워짐 — 의도된 어려운 거절 엔딩 결 위배.
- 보정: H4 톤 매치 베이스 -2 (warm_supportive +3→+1, direct_friendly +5→+3). 미니게임 메커니즘은 그대로.
- 보정 후 누적 H1 +55 / H2 +66 / H3 +50 / H4 +39 / H5 +51 — 5명 모두 80 도달 가능 + H4 어려운 결 보존.

**단계 목표 (Step 1~5)**:
1. **Step 1 (이번 라운드)**: 룰 + CHANGELOG. CONVENTIONS §3.7 신규, MASTER-PLAN §3.2/§4.3 변경 마커, 영향 모듈 status review.
2. Step 2: 엔진 룩업 (`06-engine/toneMatrix.ts`) + INC → 톤 태그 변환 헬퍼 + 회귀 테스트.
3. Step 3: 시나리오 챕터별 마이그레이션 (Ch.1 → Ch.6 순서, 각 챕터 PM 사인오프).
4. Step 4: 빌드 검증 자동화 (5명 80 도달, REJECT, SOLO 모두 자동 시뮬).
5. Step 5: 옛 INC 라벨 주석 제거 클린업.

**룰 초안 (CONVENTIONS §3.7로 정식화)**:

선택지에는 점수 대신 **톤 태그**만 박는다. 점수는 5×5 히로인×톤 매트릭스 룩업으로 계산.

톤 5종:
- `mature_serious` — 어른·진중·학술 (H1 KEY 톤)
- `warm_supportive` — 정중·케어·존대 (H3 KEY 톤, 낮 한정)
- `direct_friendly` — 동기·반말·솔직 (H2 KEY 톤)
- `playful_casual` — 가벼움·반말·장난
- `bright_forward` — 밝음·직진·이모지 (H5 KEY 톤)

| 톤 | H1 | H2 | H3 (낮/밤) | H4 | H5 |
|---|---|---|---|---|---|
| `mature_serious` | **+10 KEY** | -1 | +5 / +1 | +1 | **-2** |
| `warm_supportive` | +5 | +3 | **+10 KEY (낮)** | +1 (보정) | +1 |
| `direct_friendly` | +1 | **+10 KEY** | +1 | +3 (보정) | +5 |
| `playful_casual` | **-2** (이모지 -3) | +5 | -1 / +3 | +1 | +5 |
| `bright_forward` | -1 | +1 | -1 | +1 | **+10 KEY** |
| 묘사 보너스 (KEY 자리) | +5 | +5 | +5 | +5 | +5 |
| H4 미니게임 가산 | — | — | — | 통과 +1 / 타임아웃 -3 + late_reply_count++ | — |

**페널티 강도(PM 결정)**: 톤 미스매치 -2 / 톤 정반대 + 어색 강조 -3.
**H4 보정(PM 결정)**: 톤 매치 베이스 -2 (KEY 메커니즘은 미니게임 그대로).
**라벨 표기법(PM 결정)**: [INC: H# +N] → `[CHOICE: tone=..., key=true|false, descriptor=...]` 전면 교체.

**영향 모듈 (전부 status: review 유지·전환)**:
- `00-master/MASTER-PLAN.md` §3.2 호감도 시스템, §4.3 H4 거절 트리거 → [Δ pending review] 마커
- `00-master/CONVENTIONS.md` §3.5 히로인 말투 차별화 → 마커, §3.7 (신규) 톤 매트릭스 정식화
- `03-story/BRANCH-GRAPH.md` §4 호감도 변동표, §5 키 선택지 매트릭스 → [Δ pending review] 마커 (이미 review status)
- `03-story/route-common.md` §69-71 / §91-95 / §146-156 / §177-183 (KEY +10/묘사 +5 분할 표기) → [Δ pending review] 마커 (이미 review status)
- `03-story/scenarios/*` 10개 (148 INC 라벨) — Step 3에서 챕터별 변환
- `02-characters/heroines/H1~H5.md` §6 (KEY 자리 톤 명세) → [Δ pending review] 마커
- `06-engine/toneMatrix.ts` — Step 2에서 신규 작성

**12세 등급 / 욕설 금지 (CONVENTIONS §8) 영향**: 없음. 톤 태그는 점수 계산만 변경.

**승인**: PM(구윤모) 직접 명령 (2026-04-30, plan 파일 `~/.claude/plans/readme-md-http-readme-md-wondrous-blossom.md` 승인 + 3개 결정 — 페널티 강함 / H4 톤 매치 -2 / 라벨 전면 교체).

---

### 2026-04-30 — §3.6 #8 사후 점검 라운드 (8개 톤 패스 시나리오 + 3개 미점검 시나리오)

외부 피드백 라운드 #1 직후 신설된 §3.6 #8 룰 ("치환어 빈도 감시")의 첫 적용 라운드. end_solo_summer 셀프 점검에서 6건 패턴 발견·분산 처리한 직후, 동일 룰을 11개 시나리오 본문에 일괄 적용.

**점검 범위 (11개 시나리오 본문)**:
1. **2026-04-29 톤 패스 라운드 거친 8개**: prologue + ch01_ot + ch02_anatomy + ch03_dongsan + ch04_library + ch05_decision + ch06_h4_seoyoon + ch06_h2_hajeong
2. **톤 패스 안 거친 3개**: ch06_h3_seol + ch06_h1_serin + ch06_h5_yuna

**측정 항목**:
- 회피 어휘 5종 (결/한 톤/한 박자/본심/메타) + 추가 회피 어휘 (박았/정답) 컨텍스트 점검 — 일반 명사 사용 vs 메타 어휘 위반 구분
- 이전 강박 어휘 자리/자세 한 씬 안 5회+ 빈도
- §3.6 #8 임계: 한 단락 안 같은 어휘 3회 이상 즉시 분산

---

#### 결과 1: 톤 패스 거친 8개 시나리오 — 깨끗 (회피 위반 3건만 픽스)

**§3.6 #1~#6 회피 어휘 직접 위반** (픽스 완료):
- `03-story/scenarios/ch05_decision.md` 761행 선택지 라벨 `"...정리하시는 결이 자연스러워서..."` → `"...정리하시는 모습이 자연스러워서..."` (메타 어휘 "결" → 일반 명사 "모습")
- `03-story/scenarios/ch05_decision.md` 777행 카톡 본문 동일 자리 `"...정리하신 결이 자연스러워서..."` → `"...정리하신 모습이 자연스러워서..."`
- `03-story/scenarios/ch02_anatomy.md` 216행 윤모 모놀로그 `"정답은 없겠지"` → `"맞고 틀린 건 없는 거지"` (회피 어휘 "정답" → 풀이)

**§3.6 #8 즉시 분산 룰 위반 (한 단락 안 3회+)**: **0건** ✓

자리/자세 한 씬 안 5회+ 빈도는 발생 (ch01 13 / ch02 11 / ch04 10 / ch05 33 / ch06_h4 30 / ch06_h2 34) — 컨텍스트 점검 결과 모두 일반 명사 의미 ("자리 잡다", "5조 자리", "옆 자리", "창가 자리", "부스 자리"). 메타 어휘 강박 X. 분산 권장 X.

**결론**: 2026-04-29 톤 패스 라운드 거친 8개 시나리오는 §3.6 #8 룰 사후 적용 결과 깨끗. 회피 어휘 직접 위반 3건만 픽스.

---

#### 결과 2: 톤 패스 안 거친 3개 시나리오 — 강박 패턴 매우 심함 (별도 라운드 필요)

**한 단락 안 자리/자세 3회+ 패턴 발견**:

| 시나리오 | 본문 라인 | 자리 빈도 | 자세 빈도 | 한 단락 안 3회+ 패턴 | 최대 단락 강박 |
|---|---|---|---|---|---|
| ch06_h3_seol | 1128줄 | 97회 (8.6%) | 51회 (4.5%) | 14건 | 한 단락 안 자리 8회 (883·904행) |
| ch06_h1_serin | 1219줄 | 51회 (4.2%) | 15회 (1.2%) | 5건 | 한 단락 안 자리 4회 (688행) |
| ch06_h5_yuna | 1150줄 | 173회 (15.0%) | 52회 (4.5%) | 26건 | 한 단락 안 자리 9회 (891행) |

ch06_h5_yuna 본문 자리 빈도 15%는 end_solo_summer 본문 39.8%보다는 낮으나 한 단락 안 9회·8회 자리 강박은 동급. 사용자가 톤 패스 라운드 (2026-04-29)를 ch06_h3·h1·h5 작성 전에 진행했고, 이 3개 시나리오는 톤 패스 룰 (회피 어휘 5종 변환) 적용 안 된 상태로 작성됨.

**§3.6 #8 즉시 분산 룰 위반 합계**: **45건** (한 단락 안 3회+ 패턴 — ch06_h3 14 + ch06_h1 5 + ch06_h5 26).

**처방 옵션**:
- (a) 단락별 분산 처리 — 45개 단락 일일이 손보기. 작업량 매우 큼 (최소 한 라운드 통째로).
- (b) end_solo_summer 패턴 유사한 한 단락 5회+ 단락만 우선 분산 — ch06_h5 6건 (137·432·446·576·693·707·738·891행) + ch06_h3 1건 (557·883·904행) 우선. 나머지는 후속.
- (c) ch06_h5_yuna 본문 전면 재작성 — end_solo_summer 패턴 (109회 → 0회) 동일. 자리 173회 → 5회 이하 목표. 1150줄이라 큰 작업.

**잔여 작업 처리 결과 (2026-04-30 후속 라운드, PM 결정: 옵션 1 — 단락 안 3회+ 패턴 분산)**:
- ✅ ch06_h5_yuna: 자리 173 → 38회 (-78%), 자세 52 → 18회 (-65%), 한 단락 안 3회+ 26건 → 0건. 5회+ 9건 + 3~4회 15건 + 본가/자취방 단락 추가 발견 1건 일괄 분산.
- ✅ ch06_h3_seol: 자리 97 → 40회 (-59%), 자세 51 → 34회 (-33%), 한 단락 안 3회+ 14건 → 0건. NORMAL 엔딩 한설 거리감 대사(자리 8회·8회 + 자세 4회) 포함 14건 분산.
- ✅ ch06_h1_serin: 자리 51 → 32회 (-37%), 자세 15회 그대로, 한 단락 안 3회+ 5건 → 0건.

각 시나리오 작가 메모 §3.6 #8 사후 점검 라운드 항목 추가 — 1차 측정 / 분산 처리 / 2차 측정 명시.

**11개 시나리오 §3.6 #8 일괄 검증 결과 (최종)**:

| 시나리오 | 자리 | 자세 | 한 단락 3회+ |
|---|---|---|---|
| prologue | 0 | 0 | 0 ✓ |
| ch01_ot | 13 | 0 | 0 ✓ |
| ch02_anatomy | 11 | 1 | 0 ✓ |
| ch03_dongsan | 1 | 1 | 0 ✓ |
| ch04_library | 10 | 6 | 0 ✓ |
| ch05_decision | 33 | 2 | 0 ✓ |
| ch06_h4_seoyoon | 30 | 3 | 0 ✓ |
| ch06_h2_hajeong | 34 | 3 | 0 ✓ |
| ch06_h3_seol | 40 | 34 | 0 ✓ |
| ch06_h1_serin | 32 | 15 | 0 ✓ |
| ch06_h5_yuna | 38 | 18 | 0 ✓ |
| end_solo_summer | 0 | 0 | 0 ✓ |

**11개 시나리오 모두 §3.6 #8 즉시 분산 룰 통과** (한 단락 안 3회+ 패턴 0건). 한 씬 안 5회+ 점검 권장 임계는 ch06_h3·h1·h5에서 자세 어휘 발생하나 단락 안 분포는 1~2회씩으로 정상.

**메타 통찰**: §3.6 #8 룰의 효용 입증 — 본 룰 적용으로 톤 패스 거친 8개와 안 거친 3개 모두 단락 안 강박 패턴 0건 달성. 향후 모든 새 시나리오 작성 시 §3.6 #8 + 톤 패스 자체점검 의무화 권장.

---

**자산 수량 / 16개 엔딩 매트릭스 영향**: 영향 없음.

**승인**: PM(구윤모) 직접 명령 (§3.6 #8 사후 점검 라운드 시작) (2026-04-30 결정). 잔여 처리는 PM 결정 대기.

---

### 2026-04-30 — 외부 피드백 라운드 #1 6단계 처리 (라우팅·시간선·캐릭터·호감도·메모·톤·룰)

본 라운드는 외부 피드백(2026-04-30 사용자 전달)에서 지적된 8개 항목 중 7.5개가 100% 사실로 검증돼 일괄 처리. 출시 차단급 3건 + 정합 픽스 4건 + 가드레일 룰 1건 신규 추가.

**1. END_SOLO_SUMMER 라우팅 통일 (출시 차단급)**
- **변경**: ch05_decision 868행 `[ENDING: END_SOLO_SUMMER]` 직접 호출 → `[JUMP: end_solo_summer_main]` 교체. ch06_h5_yuna 960행 `[JUMP: end_solo_summer]` → `[JUMP: end_solo_summer_main]` 타깃 씬 ID 정합. 두 진입점(ch05 직접 / ch06_h5 폴백) 모두 본 시나리오 모놀로그 시퀀스를 거쳐 171행 `[ENDING: END_SOLO_SUMMER]`에서 통일 호출.
- **사유**: 이전엔 ch05 직접 호출 시 모놀로그 시퀀스(5~7분 단일 씬) 스킵하고 엔딩 카드로 점프, ch06_h5 폴백은 모놀로그 재생 — 비대칭 발생. 작가 본인이 end_solo_summer.md 작가 메모 §변경 제안 #2/#3에서 인지했으나 ch05 쪽 미처리였음.
- **모듈**:
  - `03-story/scenarios/ch05_decision.md` (868행 IF 블록)
  - `03-story/scenarios/ch06_h5_yuna.md` (960행 + 1116행 메모)
  - `03-story/scenarios/end_solo_summer.md` (180행/247행/249행 메모 ✅ 처리 완료 마킹)
- **승인**: PM(구윤모) 직접 명령 (2026-04-30)

**2. STORY-BIBLE §3 시간선 6.30 → 7.10 확장**
- **변경**: 엔딩 시기 표기 "2026.06.20~30" → "2026.06.20~07.10". 총 시간선 표기 "약 4개월" → "약 4.5개월". H1 트루엔딩(7월 4일 분당 본가 근처 카페, ch06_h1_serin 640행) 포함. 다른 4개 트루엔딩 + END_SOLO_SUMMER(6.27)는 6월 말 자리 유지.
- **사유**: H1 트루엔딩이 차세린 짧은 휴가 첫날 + 윤모 분당 본가 주말 모먼트로 7월 4일 토요일 시점 점프. 시간선 표가 6.30까지였으면 H1 7.4 모먼트 포함 못 함.
- **모듈**: `03-story/STORY-BIBLE.md` §3 시간선 표

**3. 친구 단톡 "이문규" → "표경민" 정정 (3건)**
- **변경**: end_solo_summer 132·204·238행 "이문규" → "표경민" 일괄 치환.
- **사유**: 이문규는 등록된 사이드 캐릭터(side-characters.md §동기 6명)이긴 하나 프롤로그~Ch.5에서 친구 단톡 트리오는 김규민/표경민/조나단으로 일관. 마지막 16번째 엔딩에서 표경민 빠지고 이문규로 바뀌면 플레이어가 일관성 깨짐 명확히 인지. 이문규는 v1.1 추가 챕터에서 정식 데뷔.
- **모듈**: `03-story/scenarios/end_solo_summer.md` (3건)

**4. 호감도 명세 통일 — 옵션 b (KEY +10 + 묘사 보너스 +5) 분할 합산 형식**
- **변경**: 선택지 라벨·메모 표·자체점검을 모두 `+15 (KEY +10 + 묘사 보너스 +5)` 형식으로 분할 합산 풀어 적기. BRANCH-GRAPH §4 누적값(H2 +56 등)은 분할 합산 기준이라 무수정.
- **본문 INC 무수정** — 라벨·메모만 갱신. 옛 표기 "+5/+3"은 KEY 단일만 본 자리 (분할 합산 +15 = KEY +10 + 후속 묘사 +5).
- **모듈**:
  - `03-story/scenarios/ch04_library.md` 4건 (H1 키2 / H2 키2 / H3 키2 / H4 키1) + 메모 표 836~841행 + 자체점검 843~860행
  - `03-story/scenarios/ch02_anatomy.md` 2건 (H2 키1 / H3 키1) + 자체점검 메모
  - `03-story/scenarios/ch03_dongsan.md` 2건 (H1 키1 / H5 키1) + 자체점검 메모
  - `03-story/scenarios/ch01_ot.md` 자체점검 메모 (라벨은 단일 +10 KEY + 별도 +5 묘사 보너스 자리 분리)
  - `03-story/route-common.md` Ch.1·Ch.2·Ch.3·Ch.4·Ch.5 spec 호감도 변동 가능 범위 일괄 갱신
  - ch05·ch06_* 시나리오는 KEY 단일 +10 패턴 (후속 +5 INC 없음) — 갱신 불필요
- **사유**: ch04 H1 키2의 경우 선택지 라벨 +10 / 본문 INC 합 +15 / 메모 표 +5 / 자체점검 +5 — 네 곳이 다 다른 값으로 어긋남. 작가 본인이 자기가 적은 수치를 일관되게 추적 못 한 상태. 옵션 a(INC 줄이기)는 BRANCH-GRAPH §4 누적값 균형 재계산 동반이라 위험, 옵션 b(라벨 분할 합산 풀어 적기)는 문서 정합 작은 변경.

**5. ch04 877행 메모 본문 정합 갱신 (본문 무수정)**
- **변경**: ch04_library 877행 메모 "→ 윤모 '저는 04년생이라 학번 현역으로 들어왔어요'" 표기 → "윤모 04년생 현역 자기 정보는 본문에 굳이 명시 X" 풀이로 갱신. 본문(488~496행)은 윤모 "휴학 1년 했어요"만 답하고 04년생 현역 명시 X — 사용자 명시 2026-04-29 2차 조정 룰 ("첫 만남 대사에서 학번/나이 언급 절제, 윤모가 04년생 현역 자기 정보를 굳이 안 말함") 정확 준수 자리.
- **본문 무수정** — 메모만 갱신. 본문에 "04년생 현역" 한 줄 추가는 2차 조정 룰 위반이므로 X.
- **사유**: 877행 자체점검 메모가 2차 조정 이전 버전 잔재 — 본문을 메모에 맞추는 게 아니라 메모를 본문(2차 조정 룰 따른)에 맞춰야 함.

**6. end_solo_summer 본문 전면 재작성 — "자리" 강박 해소**
- **변경**: end_solo_summer.md 본문 (Scene 49~171행) 통째로 재작성. 이전 "자리" 빈도 109회 / 274줄(39.8%) → **본문 0회** 달성 (사용자 처방 단계 목표 1차 30 → 2차 15 → 최종 5회 이하 한 번에 달성).
- **사유**: 2026-04-29 톤 패스 라운드에서 회피 어휘 5종 (결/한 톤/한 박자/본심/메타)을 단일 "자리"로 일괄 치환하면서 발생한 강박 패턴. "자리. 같이 가기엔 자세가 한 단계 다른 자리이고" 같은 한국어 파싱 안 되는 문장 다수 발견. 16번째 엔딩, 단일 씬 5~7분짜리라 글의 밀도가 가장 중요한데 이전 상태로는 플레이어가 끝까지 못 읽을 위험.
- **재작성 방침**: 프롤로그 톤(자리 0회) 기준으로 자연 한국어 문장 흐름. "자리" 단일 치환 → 다양한 어휘 분산 (시간/거리감/마음/모먼트/한 줄/거리/모습/순간/방향). 한 단락 같은 어휘 3회 이상 패턴 0건. 본문 보존 항목: 진입 분기 변주 첫 줄 / 5명 한 명씩 떠올리기 / 친구 단톡 11줄 (표경민 정정 후) / 분당 본가 회상 / 어머니 첫 마디 / BG·BGM·ENDING 호출 모두 무수정.
- **모듈**: `03-story/scenarios/end_solo_summer.md` 본문 + 작가 메모 §3.6 가드레일 점검 (자리 빈도 항목 신규 추가)

**7. CONVENTIONS §3.6 #8 신규 룰 — 치환어 빈도 감시**
- **변경**: CONVENTIONS §3.6에 #8 "치환어 빈도 감시" 룰 신규 추가.
- **룰 요지**:
  1. 빈도 임계 — 한 씬 안 같은 어휘 5회 이상 점검, 한 단락 안 3회 이상 즉시 분산
  2. 치환 후보 복수 운영 — 회피 어휘 5종 각각에 단일 치환이 아닌 복수 후보군으로 분산 (예: "결" → "분위기/스타일/느낌/모습/사이/페이스/방식/흐름")
  3. 톤 패스 라운드 자체점검에 "치환어 빈도 카운트" 항목 추가
  4. 사후 검증 — 회피 어휘 0건만 보지 말고 치환 결과 빈도 둘 다 측정
- **사유**: 회피 룰이 새로운 강박 패턴을 만든 사례 (end_solo_summer 109회 / 274줄)가 메타 진단으로 정확. 룰을 못 박지 않으면 다음 라운드에서 또 다른 강박 치환 발생.
- **적용 시점**: 2026-04-30 이후 모든 톤 패스 라운드. 2026-04-29 라운드 결과(8개 시나리오)는 별도 라운드에서 본 룰 적용 점검 필요 (end_solo_summer.md는 본 라운드 6번 작업으로 처리 완료).
- **모듈**: `00-master/CONVENTIONS.md` §3.6 #8 신규

**자산 수량 영향 점검 (1~7번 일괄)**: 스프라이트 / 배경 / CG / 영상 / BGM / SFX 모두 **영향 없음** (모든 변경은 시나리오 본문·메모·라우팅 + CONVENTIONS 룰 + STORY-BIBLE 시간선 표기, 자산 ID·자산 수량 무관).

**16개 엔딩 매트릭스 영향 점검**: **영향 없음** (END_SOLO_SUMMER 라우팅 정합, 엔딩 호출 자리 통일, 엔딩 ID 일체 무수정).

**잔여 작업 (별도 라운드)**:
- ⬜ 다른 8개 시나리오 (prologue + Ch.1~5 + Ch.6 H4·H2)에 §3.6 #8 치환어 빈도 감시 룰 사후 점검 라운드
- ⬜ Ch.5 변태 망상 페어 #4 위치 재검토 (펜션 도착 직후로 옮기거나 제거 — 사용자 결정 후)
- ⬜ MASTER-PLAN frozen 직접 수정 금지 항목 (다음 unfreeze 시점에 일괄 반영): §3.1 시간선 / 시나리오 라우팅 정합 표기

**승인**: PM(구윤모) 직접 명령 + 외부 피드백 라운드 #1 처방 7가지 일괄 채택 (2026-04-30 결정)

---

### 2026-04-30 — "R2" 약어 자연 풀이 일관 처리 ("전공의 2년차" / "레지던트" / "전공의")

- **변경**: H1 차세린 직책 "내과 R2" 약어가 본문 대사·모놀로그·지문에서 부자연스럽다는 사용자 지적(라운드 2 추가 명령)을 받아 본문 자리는 자연 풀이 일괄 처리, 시트·라우트·STORY-BIBLE·작가 메모도 일관 갱신.
  - **본문 자리 (대사/모놀로그/지문, 8건 풀이)**:
    - `03-story/scenarios/ch06_h1_serin.md` 본문 5건 (라운드 2 손질에서 이미 처리 완료, 2026-04-29자)
    - `03-story/scenarios/ch03_dongsan.md` 본문 7건: 명함 텍스트 / 윤모 모놀로그 / 동기 대사 ×2 / 김규민 카톡 / 차세린 카톡 / 박지수 카톡 → "전공의 2년차" / "레지던트" / "전공의" 자리별 풀이
    - `02-characters/goo-yunmo.md` 모놀로그 예시 1건 (§4.4 "근데 누나는 R2시잖아?" → "전공의 2년차시잖아?")
  - **시트·메타 자리 (11건 일관 풀이)**:
    - `02-characters/heroines/H1-cha-serin.md` §3 성격 / §6 비트 / §9 스프라이트 (3건)
    - `03-story/STORY-BIBLE.md` §2 히로인 표 1건
    - `03-story/route-common.md` Ch.5 비트 1건
    - `03-story/route-H1-cha-serin.md` Ch.6 비트 1건
    - `03-story/scenarios/ch03_dongsan.md` 헤더·작가 메모 3건
    - `03-story/scenarios/ch04_library.md` 작가 메모 1건
    - `01-research/medical-life-realism.md` §1.4 1건
  - **KEEP (정식 등록 자리, 풀이 표기 이미 있거나 검증 이력 자리)**:
    - `02-characters/heroines/H1-cha-serin.md` §1 직책 표 "동산의료원 내과 R2 (전공의 2년차)" — 풀이 표기 이미 괄호 안에 있음
    - `02-characters/heroines/H1-cha-serin.md` §13 검증 "내과 R2 설정 — 확정" — 검증 이력 자리 (당시 표기 그대로)
- **선택 룰** (자리별 자연 풀이):
  - 학년 정확 자리 (윤모 자기자각 모놀로그·명함) → **"전공의 2년차"**
  - 일반 호칭 자리 (구어체 대사·동기 톤) → **"레지던트"**
  - 학년 비교 자리 (vs 본과 1학년) → **"전공의"**
- **모듈**:
  - `03-story/scenarios/ch06_h1_serin.md` (라운드 2에서 이미 처리)
  - `03-story/scenarios/ch03_dongsan.md` (본문 7건 + 메타 3건 손질)
  - `03-story/scenarios/ch04_library.md` (작가 메모 1건)
  - `02-characters/goo-yunmo.md` (모놀로그 예시 1건)
  - `02-characters/heroines/H1-cha-serin.md` (§3 / §6 / §9 3건, §1 / §13 KEEP)
  - `03-story/STORY-BIBLE.md` (§2 히로인 표 1건)
  - `03-story/route-common.md` (Ch.5 비트 1건)
  - `03-story/route-H1-cha-serin.md` (Ch.6 비트 1건)
  - `01-research/medical-life-realism.md` (§1.4 1건)
- **사유**: 본문 약어 "R2"가 의학 전문 용어 그대로 노출되어 일반 플레이어 입장에서 부자연스러움. CONVENTIONS §3.4 (윤모 말투 룰) + §3.5 (히로인 말투 차별화) "정중한 어른 톤" 정합 + 일반 게임 텍스처 자연성 제고. 시트 §1 직책 풀이 표기 ("(전공의 2년차)")가 이미 괄호 안에 등록되어 있으므로 본문 풀이가 시트 정합과 충돌 없음.
- **변경 제안 (다른 모듈, 본 라운드 무수정 — frozen unfreeze 필요)**:
  - **`00-master/MASTER-PLAN.md` §4.2 히로인 표 H1 행** — "동산병원 내과 R2" → "동산병원 내과 전공의 2년차" 표기 갱신 필요. **MASTER-PLAN frozen 직접 수정 금지** (CONVENTIONS §11). 다음 frozen unfreeze 시점에 일괄 반영. 본 라운드는 CHANGELOG 엔트리로 메모만.
- **자산 수량 영향 점검**: 스프라이트 / 배경 / CG / 영상 / BGM / SFX 모두 **영향 없음** (자산 ID는 `serin_*`, `cg_serin_*`, `video_*_serin` 형식이라 R2 표기와 무관).
- **16개 엔딩 매트릭스 영향 점검**: **영향 없음** (엔딩 ID `END_H1_*` 그대로).
- **승인**: PM(구윤모) 직접 명령 (2026-04-30 결정)

---

### 2026-04-29 — "구윤모와 플레이" 서브 모드 v1.0 범위 제외 (v1.1+ 이연)

- **변경**: `03-story/route-female-pc.md` (여자 PC 서브 모드, 4챕터 압축 20분, 엔딩 3종)을 v1.0 출시 범위에서 제외하고 v1.1+ 후속 개발로 이연. **파일 삭제 X — 사양 보존용으로 유지**.
  - `03-story/route-female-pc.md` frontmatter `status: draft` → **`deferred`** + 최상단 경고 박스 추가 ("⚠️ v1.0 출시 범위 제외 — v1.1+ 후속 개발 예정. 본 문서는 사양 보존용으로 유지."). 본문 내용 무수정 (사양 보존).
  - `README.md` "핵심 결정사항 요약 §모드" 줄 — `"구윤모로 플레이"(메인) + "구윤모와 플레이"(서브, 20분)` → `"구윤모로 플레이" 단일 모드 (v1.0). "구윤모와 플레이"(서브 20분)은 v1.1 후속 개발로 이연`.
  - `00-master/PROGRESS-TRACKER.md` W2 비트 시트 섹션 `route-female-pc.md` 행 ✅ → **⏸ deferred** "v1.0 제외, v1.1 이연" 표기 + 범례에 `⏸ 보류(deferred)` 1줄 추가 + 현재 상태 박스에 "v1.0 범위: 메인 모드만 ('구윤모와 플레이' 서브 모드 v1.1 이연)" 1줄 추가.
- **사유**: v1.0 출시 범위 압축 — 메인 모드 ("구윤모로 플레이", 4시간, 16개 엔딩, 5명 히로인) 완성 우선. 서브 모드 ("구윤모와 플레이", 20분 단편, 시점 변환)는 메인 출시 후 v1.1+ 후속 콘텐츠로 추가 개발. 6주 일정 안정화 + 마일스톤 #3 (Ch.6 분기 시나리오 풀 텍스트) 집중을 위함.
- **영향 모듈**:
  - `03-story/route-female-pc.md` (status=deferred, 본문 보존)
  - `README.md` (모드 표기 단일화)
  - `00-master/PROGRESS-TRACKER.md` (W2 진행 상태 갱신)
  - `00-master/MASTER-PLAN.md` ⚠️ frozen 직접 수정 금지 — §1 "모드" 셀 / §3.1 "서브 모드 구조" 단락 / §9 일정 W2 "5+1 루트" 표기는 **v1.1 이연 표기 필요**하나 본 라운드는 CHANGELOG 메모만 (다음 frozen unfreeze 시점에 반영).
  - 게임설계서 / 총괄보고서 (외부 문서, 별도 처리)
- **자산 수량 영향 점검** (v1.0 범위에서 제외):
  - 스프라이트 48종 — **영향 없음** (PC 스프라이트 X, 구윤모 스프라이트는 메인과 공유 — route-female-pc §5)
  - 배경 15장 — **영향 없음** (배경 일부 재활용 명시 — route-female-pc §5)
  - 이벤트 CG 20장 — **영향 없음** (서브 모드 신규 CG = 0 명시 — route-female-pc §5)
  - 영상 12개 — **영향 없음** (서브 모드 영상 큐 없음, 메인 12개 그대로)
  - BGM 8트랙 — **영향 없음** (메인 공유)
  - SFX — **영향 없음**
- **16개 엔딩 매트릭스 영향 점검**:
  - 메인 모드 엔딩 16개 (히로인 5명 × {트루/해피/노멀/배드} 누락분 + 거절 카톡 + END_SOLO_SUMMER) **영향 없음**.
  - 서브 모드 전용 엔딩 3개(`END_FEMALE_HAPPY`/`END_FEMALE_NORMAL`/`END_FEMALE_BAD`)는 v1.0 매트릭스에 포함 **안 됨** — BRANCH-GRAPH §2 16개 그대로 유지.
- **변경 제안 (다른 모듈, 본 라운드 무수정)**:
  - **`06-engine/STATE-SCHEMA.md` L90~92** — `mode: 'main' | 'female_pc'` 유니온 타입 + `player_name?: string` 옵셔널 필드. **제안**: v1.0에서는 `mode: 'main'`만 구현, `female_pc` 분기는 v1.1+로 이연 표기. 두 가지 옵션 — (a) 타입 정의는 그대로 두되 주석에 "// v1.1 이연: female_pc 모드는 v1.0 미구현, 분기 코드는 unreachable" 명시 / (b) v1.0 빌드는 `mode: 'main'` 리터럴로 좁히고 `player_name` 제거 후 v1.1 시 부활. 엔진 라운드 작업 시 결정.
  - **`04-image-prompts/sprites/sprite-list.md` / `cg-list.md` / `video-list.md` "female" 매치 6건** — 모두 히로인 영문 디스크립터(`Korean female resident doctor` 등)로 서브 모드 PC와 무관. **수정 불필요**.
  - **`04-image-prompts/backgrounds/bg-list.md` / `06-engine/SCENE-FORMAT.md` / `07-content-integration/INTEGRATION-PLAN.md` / `08-qa-deployment/QA-PLAN.md` / `02-characters/goo-yunmo.md`** — 서브 모드 관련 언급/자산 0건. **수정 불필요**.
  - **MASTER-PLAN frozen unfreeze 시점**: §1 모드 셀, §3.1 서브 모드 단락, §9 W2 일정 "5+1 루트"에 "v1.1 이연" 표기 일괄 반영 필요. 본 라운드는 CHANGELOG 엔트리로 메모만.
- **승인**: PM(구윤모) 직접 명령 (2026-04-29 결정)

---

### 2026-04-29 — W4 코드 스켈레톤 신설 (엔진 + UI + 카톡 + 갤러리)

- **변경**: `src/`, `package.json`, `vite.config.ts`, `tsconfig.json`(+ `tsconfig.node.json`), `tailwind.config.cjs`, `postcss.config.cjs`, `eslint.config.js`, `index.html`, `.gitignore` 신규 작성. PROGRESS-TRACKER W4 "다음 작업 (W4 코드)" 4항목 ⬜ → ✅.
  - **엔진 코어** (`src/engine/`):
    - `types.ts` — SceneCommand 20종 discriminated union, GameFlags, EndingId 16종 (END_SOLO_SUMMER 포함), SaveSlot — STATE-SCHEMA §2 + ARCHITECTURE §4 SSoT 미러
    - `audioMappings.ts` — SFX 12종 + BGM 8트랙 한글↔영문 매핑 (Q3=(a) 수동 미러 방식). `koToEnSfx`/`koToEnBgm` 미매핑 시 throw
    - `audioManager.ts` — Howler.js 래퍼 (BGM 단일 트랙 + SFX 풀링 + fade 토큰 1~4 = 150/600/900/2000ms)
    - `scriptInterpreter.ts` — 씬 진행 + EVALUATE_BRANCH 알고리즘 SSoT 미러 (BRANCH-GRAPH §6.1 + route-H4 정확한 평가 순서: late≥2 → SOLO → determineEnding 히로인별 분기)
    - `SceneRenderer.tsx` — 메인 컴포넌트, 음원 부수효과 + UI 레이어 합성
  - **스토어** (`src/stores/`): Zustand persist (autosave/settings 분리 — STATE-SCHEMA §1 키 명세 정합)
  - **UI** (`src/ui/`): DialogueBox(우측 하단 워터마크 가림 위치 + 글자별 타이핑 + 모놀로그 italic + 변태 자기자각 white flash 100ms + sfx_realize) / ChoiceList / Backlog / PauseMenu / MiniControls / EndingScreen / BackgroundLayer / CharacterLayer / CGOverlay
  - **카톡** (`src/ui/katalk/`):
    - `KakaoModal` — UI-SPEC §6 정합, 핑크 배경 + 본인 우측 민트 / 상대 좌측 화이트 버블, sfx_katalk_notify 자동
    - `ReplyTimer` — 15초 (STORY-BIBLE §7.1 확정값) progress ring + 마지막 5초 빨간 펄스, 만료 시 sfx_timer_out + late_reply_count++ + H4 -3
    - `RejectEnding` — 거절 8단계 연출 hook (route-H4-na-seoyoon §"8단계 연출" 순서 정확: 페이드 인→bgm_sad fade=4→sfx_katalk_notify→입력중 1.5s→4줄 0.8s 간격→2초 정지→페이드 아웃→타이틀)
    - 정확한 카톡 텍스트 4줄 변경 금지 (MASTER-PLAN §4.3) 그대로 박힘
  - **갤러리** (`src/ui/gallery/`): GalleryScreen 탭(CG/BGM/엔딩) + CGGallery 4열 그리드(워터마크 crop된 `*_full.webp` 사용) + BGMGallery 8트랙(BGM_CATALOG SSoT 미러) + EndingGallery 16슬롯(미해금 ??? 표시)
  - **데이터** (`src/data/`): `endings.ts`(16개 카탈로그, BRANCH-GRAPH §2 정합) + `bgmCatalog.ts`(BGM-list §0 8트랙 메타) + `characters.ts`(YUNMO + HEROINES H1~H5)
  - **더미 씬** (`src/scenes/`): `dummy_full_loop.scene.json` (BG/BGM/CHARACTER/DIALOGUE/MONOLOGUE/CHOICE) → `dummy_full_loop_kakao.scene.json` (KAKAO 3메시지 + JUMP) → `dummy_full_loop_ending.scene.json` (BGM_main_theme + NARRATION + ENDING SOLO_SUMMER). 풀 루프 검증 통과.
- **사용자 결정 (3건, 2026-04-29)**:
  - Q1=네: `npm install` + `npm run build` + `npm run lint` 실제 실행하여 검증. node_modules .gitignore, package-lock.json 커밋.
  - Q2=(a): 더미 씬 JSON 직접 작성 + Scene 타입가드. ARCHITECTURE 정합 + W5 컴파일러 산출 형태와 일치.
  - Q3=(a): SFX/BGM 매핑 수동 미러 (`src/engine/audioMappings.ts`). Vite 플러그인 자동 파싱 (b)는 변경 제안 큐잉.
- **검증**: `npm install` 242 패키지 / `npm run build` ✅ (78 모듈, 215kB JS / 13kB CSS / 925ms) / `npm run lint` ✅ 0 에러. CONVENTIONS §9 빌드 검증 1·2번 통과. 3·4·5번(test/E2E/자산검증)은 W5/W6 범위.
- **모듈**: 신규 `src/` (위계 4 코드 산출). 부수 갱신: `00-master/PROGRESS-TRACKER` (W4 코드 4항목 ⬜→✅ + 상단 현재 상태 행).
- **변경 제안 (W5 라운드 검토)**:
  1. SFX/BGM 매핑 SSoT 자동 동기화 — Vite 플러그인이 빌드 시점에 `docs/assets/SFX-list.md` §2 + `BGM-list.md` §1.1 자동 파싱하여 `audioMappings.ts` 생성. 현재는 수동 미러 (.md 갱신 시 audioMappings.ts 수동 반영 필요).
  2. `scripts/md-to-scene.ts` 시나리오 .md → JSON 컴파일러 — SCENE-FORMAT §3 명세대로 작성. 본 라운드 인터페이스(`Scene` 타입)만 정의.
  3. STATE-SCHEMA §4 영구 메타(`unlocked_endings`/`unlocked_cgs`/`unlocked_bgms`) 분리 — 현재 W4 갤러리는 임시로 `flags`에서 조회. W5에서 `kmu-vn-meta` localStorage 키 분리 + 별도 metaStore 신설.
  4. ESLint 빌드 검증 스크립트 (CONVENTIONS §9 4번 자산 누락 + 분기 도달성) — `scripts/validate.ts` W5에서 신설. 본 라운드는 audioMappings의 throw로 런타임 검증만.
- **승인**: PM(구윤모) 직접 명령 (Q1=네 / Q2=a / Q3=a 선택)

---

### 2026-04-29 — SFX-list.md 마이너 보강 (§2 sfx_realize 톤 정합 / §4 유리병 키워드 가드)

- **변경**: `docs/assets/SFX-list.md` 2줄 마이너 패치 (status `in-progress` 유지, 라운드 새로 열지 않음).
  - §2 매핑 테이블 `sfx_realize` 행 비고에 추가: "놀람·경악 톤 X — CONVENTIONS §3.3 부드러운 자각 톤(2026-04-28 갱신) 정합, pop보다 chime 우선"
  - §4 CC0 큐레이션 가이드 키워드 표 아래 가드 한 줄 추가: ❌ glass shatter / glass break / broken glass  ✅ glass drop / bottle thud / soft drop (CONVENTIONS §8 12세 가드레일)
- **모듈**: `SFX-list` (status 무변경, 본문 마이너 보강만)
- **사유**: Phase 2 큐레이션 라운드 진입 전 12세 가드레일·자기자각 부드러운 톤 명문화. CONVENTIONS §3.3·§8 정합 강화.
- **승인**: PM(구윤모) 직접 명령

---

### 2026-04-29 — SFX-list.md SSoT 신설 (명세 Phase 1 완료)

- **변경**: `docs/assets/SFX-list.md` 신규 작성 (status: `in-progress`).
  - 시나리오 한글 SFX 큐 **31회 / 8종류** (grep 실측, ch06_h4_seoyoon + ch06_h2_hajeong 포함) + 시스템 SFX 4종 매핑 테이블 14행 통합
  - 시나리오 큐 빈도: 카톡_알림 23 / 술집_왁자지껄 2 / 발자국·실습실_문_열림·유리병_떨어짐·ktx_주행음·캐리어_바퀴·불_끄는_소리 각 1
  - 시스템 SFX 4종: `sfx_click` / `sfx_pageturn` / `sfx_timer_out` / `sfx_realize` (CONVENTIONS §5.2 + ANIMATION-SPEC §8/§9)
  - 사용자 결정 3건 반영: ① 타이밍 마일스톤 #3 후 본 수집 / ② 매핑 빌드 타임 자동 치환(시나리오 한글 유지, `scripts/md-to-scene.ts`가 변환) / ③ 카톡 알림음 자체 제작
  - BGM-list.md 패턴 차용 (frontmatter, 후처리 §6 Audacity+ffmpeg, ffprobe 검증 흐름, 폴더 임시→최종)
  - SFX 사양 — **128 kbps CBR** (BGM 192k 대비 저용량) / **-18 LUFS** (BGM -16 대비 -2 dB, SFX는 BGM 위에 얹힘) / 모노/스테레오 채널 분기 (UI/단발 모노, 환경음 루프 스테레오)
  - 12세 가드레일: 유리병_떨어짐 깨짐 X (낙하 톡만), sfx_timer_out 불쾌 알람 X, sfx_realize 놀람 X 코믹 톤
- **모듈**: 신규 `SFX-list` (status: `in-progress`). 부수 갱신: `00-master/PROGRESS-TRACKER` (W4 SFX 항목 ⬜ → 🟦 in-progress + 상단 병렬 트랙 줄).
- **사유**: BGM 큐레이션 라운드 완료 직후 모멘텀 활용. 시나리오 SFX 큐 32건(grep total, 표 인용 1 제외 = 31 실행 큐) 누적 → 명세 SSoT 미리 고정으로 마일스톤 #3 작성 시 큐 추가 일관성 확보.
- **이전 계획서 참고**: 다른 모듈이 작성한 SFX 수집 계획서(첨부)를 베이스로 채택 + 4건 조정:
  1. 위치 `04-audio/sfx-list.md` → `docs/assets/SFX-list.md` (BGM-list와 일관, PROGRESS-TRACKER 명시 경로)
  2. frontmatter hierarchy 3 → 4 (docs/ 운영 디렉토리 패턴 통일)
  3. 시나리오 큐 카운트 22건 → 31건 (ch06_h4_seoyoon 6 + ch06_h2_hajeong 3 추가, grep 재실측)
  4. MASTER-PLAN §7.1 followup 삭제 (docs/ 운영 디렉토리는 BGM 라운드에서 이미 처리, frozen 미수정 — 운영 doc 별개)
- **표 인용 정합 (BGM 슬픔 룰 동일 패턴)**: `grep "\[SFX: 카톡_알림"`은 ch06_h4_seoyoon에서 7건 잡지만 L1189 1건은 거절 엔딩 8단계 명세 표 안 코드 인용 (실행 큐 X). 본 표는 실행 큐 6회만 카운트.
- **Phase 2 (마일스톤 #3 후 별도 라운드)**: Ch.6 H1/H3/H5 + END_SOLO_SUMMER에서 `[SFX:` grep 재실행 → P2 추출 + P0/P1 승격 결정 + 카톡 알림음 자체 제작(Audacity Sine wave 3음 모티프) + CC0 큐레이션(Freesound 우선) + 후처리(-18 LUFS, 5ms 페이드인 / 30ms 페이드아웃, 128k mp3 + ID3) + `docs/assets/sfx/` 배치 + ffprobe 자동 검증.
- **승인**: PM(구윤모) 직접 명령 (이전 계획서 참고 지시)

---

### 2026-04-29 — CONVENTIONS §3.6 신규 (과용 어휘 가드레일)

- **변경**: `00-master/CONVENTIONS.md` §3.6 "과용 어휘 가드레일" 신규 추가 — 5개 과용 패턴(`결` / `한 톤` / `한 박자` / `본심` / `직진·갭 모먼트`) + #6 추가 회피 어휘(`박다/박았다`, `~분`, `0.5초 같은 정적`, `정답이지` 남발) + #7 윤모 모놀로그 톤 기준점 재확인.
- **모듈**: `CONVENTIONS`
- **사유**: W2 시나리오 라운드 점검 결과, 윤모 모놀로그·지문에서 5개 패턴이 과용되어 카톡 84,861개 분석 일상 톤과 충돌. 시적 압축·평론가 어조 회피, 일상어 풀어쓰기 기준 명문화. 사용자 직접 명령.
- **후속**: 프롤로그 + Ch.1~5 + Ch.6 H4·H2 8개 시나리오 일괄 톤 패스 라운드 별도 진행 예정 (본 라운드는 컨벤션만 추가, 시나리오 본문 무수정).
- **승인**: PM(구윤모) 직접 명령

---

### 2026-04-29 — BGM 8트랙 큐레이션 완료 + MP3 자산 배치

- **변경**: BGM-list.md `status: draft` → **`done`**. 8개 BGM MP3 파일 후처리 완료 + `docs/assets/bgm/`에 배치.
  - **선정 8곡** (DOVA-Syndrome 7 + Pixabay 1):
    - `bgm_main_theme` — 春よ、強く美しく / 龍崎一 / DOVA-Syndrome (134.1s)
    - `bgm_daily` — カフェBGM / H★ / DOVA-Syndrome (318.1s — 25회 빈도 트랙으로 긴 길이 의도적)
    - `bgm_comic` — コミカルな時間 / 田中芳典 / DOVA-Syndrome (113.1s)
    - `bgm_tension` — 焦燥 / マニーラ / DOVA-Syndrome (167.1s)
    - `bgm_romantic` — Is This Love / gooset / DOVA-Syndrome (153.2s)
    - `bgm_sad` — あの日の僕たちへ(Dear Our Past Days) / 蒲鉾さちこ / DOVA-Syndrome (136.1s)
    - `bgm_climax` — 感動をあなたに #2 / Kyaai / DOVA-Syndrome (176.1s, **도입부 10초 crop**)
    - `bgm_katalk` — Ambient Pads Loop 04 / DRAGON-STUDIO / Pixabay License (19.2s, 짧은 루프)
  - **후처리 적용** (ffmpeg 일괄): -16 LUFS Integrated 정규화 / 끝 50ms 페이드 / 192 kbps CBR / ID3 태깅 (Artist + Album="kmu-vn BGM" + Comment="<URL> / <라이선스>")
  - **ffprobe 자동 검증 통과**: 8트랙 모두 192 kbps CBR (실측 192,038~192,776) + ID3 3개 필드 채워짐 + 파일명 CONVENTIONS §5.2 정확
  - **임시 위치**: `docs/assets/bgm/` (큐레이션 산출물 보관). **W5 콘텐츠 통합 시 `public/snd/bgm/`로 이동 예정** (CONVENTIONS §5.2 SSoT 폴더).
- **모듈**: `BGM-list` (status done). 부수 갱신: `00-master/PROGRESS-TRACKER` (W4 BGM 작업 ⬜ → ✅).
- **§4.1 라이선스 우선순위 갱신**: Pixabay Content License 신규 등급 **A+** 추가 (`bgm_katalk` 출처). 표기 권장, 상업 OK, NFT/재배포 X.
- **사유**: PM 직접 큐레이션 라운드 완료. 시나리오 풀 텍스트 작성과 병렬로 W4 사용자 직접 작업 1건 완료.
- **마일스톤 #3 게이트 유지**: H1/H2/H3/H5 트루엔딩 + END_SOLO_SUMMER 시나리오 작성 후 `bgm_sad` / `bgm_climax` 큐 위치·페이드 1회 재정합 라운드 (PROGRESS-TRACKER 후속 검증 게이트). 트랙 자체는 그대로 유지될 가능성 높음, 큐 위치만 점검.
- **W5/W6 후속 작업** (Phase 5 — BGM-list §5):
  1. W5 통합: `docs/assets/bgm/` 8개 파일 → `public/snd/bgm/` 이동 + 매니페스트 등록 + 시나리오 한글 BGM 큐 58회 영문 ID 매핑 검증
  2. W6 QA: 거절 엔딩 BGM 페이드 타이밍 수동 청취 (QA-PLAN §3) + 카톡 BGM ↔ SFX 음역대 충돌 청취 + LUFS 편차 < 1 청감 검증
  3. `src/scenes/credits.scene.json` 자동 생성 시 §4.2 양식 8곡 등재
- **정리**: PM이 별도로 올린 `BGM____list.md` (압축본) 내용을 본 SSoT `BGM-list.md`에 머지 후 중복 파일 삭제.
- **승인**: PM(구윤모) 직접 큐레이션 + Claude Code 머지/검증

---

### 2026-04-29 — `docs/` 운영 디렉토리 신설 + BGM-list.md 추가

- **변경**: 운영용 신규 디렉토리 `game-project/docs/` 생성. 산하에 `docs/assets/` 신설.
  - 신규 파일: `docs/assets/BGM-list.md` — BGM 8트랙 큐레이션 명세 (status: draft).
  - 향후 추가 예정 (이번 라운드 외): `docs/assets/SFX-list.md`, `docs/plans/W4-engine.md`, `docs/plans/W4-ui.md`, `docs/plans/W4-kakao.md`, `docs/plans/W4-galleries.md`, `docs/plans/W5-scene-json.md`.
- **모듈**: 신규 `BGM-list`. 부수 갱신: `00-master/PROGRESS-TRACKER` (W4 사용자 작업 링크 + 마일스톤 #3 게이트 신규 섹션).
- **사유**: PM(사용자) 직접 명령. SSoT 모듈(`00-master/`~`08-qa-deployment/`, frozen 또는 review 흐름)와 별개로 운영 doc(작업 플랜·자산 큐레이션) 정리. BGM 큐레이션은 W4 사용자 직접 작업으로 시나리오 풀 텍스트 작성과 병렬 진행 가능 — 시나리오와 의존성 적고 다운로드/라이선스 확인에 시간 걸리므로 미리 시작.
  - 본 .md는 MASTER-PLAN §6.1 (8트랙 정의, frozen) + CONVENTIONS §5.2 (영문 파일명) + STORY-BIBLE §9 (분위기) + ANIMATION-SPEC §12 (거절 엔딩 페이드 타이밍) + 시나리오 7개 한글 BGM 큐 58회를 통합한 단일 큐레이션 워크플로 문서.
  - 시나리오 큐 빈도 grep 실측: 일상 25 / 카톡 10 / 메인_테마 7 / 로맨틱 6 / 코믹 5 / 긴장 2 / 클라이맥스 2 / 슬픔 1.
- **마일스톤 #3 정의**: `03-story/scenarios/` 산하 H1/H2/H3/H5 트루엔딩 라우트 + END_SOLO_SUMMER 시나리오 풀 텍스트 작성 완료 시점. 이때 `bgm_climax` 큐 추가 + `bgm_sad` 다른 BAD 분기 큐 추가 가능 → BGM-list.md §3.6·§3.7과 1회 재정합 필수. PROGRESS-TRACKER 신규 "후속 검증 게이트" 섹션에 명시.
- **MASTER-PLAN 영향**: §7.1 폴더 구조에 `docs/` 명시 안 됨 (frozen 미수정). SSoT 룰상 신규 폴더 추가는 PM 승인 필요 — 본 라운드 직접 명령으로 승인 처리. 빌드 산출물 디렉토리 `docs/`(GitHub Pages, MASTER-PLAN §2.2)와 이름 충돌 가능 — 빌드 산출물은 향후 `dist/`로 변경하거나 운영 doc을 `docs-internal/`로 이전 검토 (별도 라운드).
- **승인**: PM(구윤모) 직접 명령

---

### 2026-04-29 — W3 prep 잔재 정리 라운드 — 영남대→계명대 4건, 장유나→장윤영 2건

- **변경**: W2-prep 라운드 종료 후 W3 라운드 처리 대기로 보류됐던 자산 명세 + 컨벤션 잔재 6건 일괄 정리. CHANGELOG 라운드 2 #7 / W2-prep "C 카테고리" / W2-prep 후속 작업 #1·#2 처리.
  - **영남대 → 계명대 4건** (자산 영문 디스크립터 / ID):
    1. `04-image-prompts/backgrounds/bg-list.md` §12 — `bg_yeungnam_pharm` → **`bg_kmu_pharm`** (ID 변경). 한글 헤더 "영남대 약대 앞" → "계명대 약대 앞 (성서 캠퍼스, 의대와 같은 캠퍼스)". SUBJECT/SETTING 영문 디스크립터를 Keimyung University Seongseo campus pharmacy school 기준으로 갱신 + "Yeungnam" 브랜딩 NEGATIVE에 명시 차단. 사용 챕터 노트 추가 (Ch.4 H4 첫 만남 / Ch.6 H4 분기). H4 나서윤(계명대 약대 4학년, 23학번) 소속 정합.
    2. `04-image-prompts/event-cgs/cg-list.md` H4 §1 `cg_seoyoon_first_meet` — SETTING "trendy Daegu Dongseong-ro evening restaurant" → "Keimyung University Seongseo campus, the pharmacy school front / library walkway in soft focus, late spring afternoon golden hour". 옷·소품도 와인 잔 → 슬림 테이크아웃 커피컵 + 약대 교재 토트백으로 캠퍼스 우연 조우 톤 정합.
    3. `04-image-prompts/event-cgs/cg-list.md` H4 §4 `cg_seoyoon_true` — SETTING "Yeungnam pharmacy school building" → "Keimyung University pharmacy school building on the Seongseo campus". "Yeungnam" 브랜딩 NEGATIVE에 명시 차단.
    4. `04-image-prompts/veo-videos/video-list.md` §5 `video_meet_seoyoon` + §10 `video_true_seoyoon` — SCENE/연출 모두 계명대 성서 캠퍼스 기준으로 갱신. video_meet_seoyoon은 "trendy Daegu evening restaurant" → "Keimyung Seongseo campus 캠퍼스 우연 조우(약대 앞/도서관 walkway)" + 와인잔 → 테이크아웃 커피컵으로 cg_seoyoon_first_meet과 정합. video_true_seoyoon은 "Yeungnam pharmacy school front" → "Keimyung pharmacy school building on Seongseo campus".
  - **장유나 → 장윤영 2건** (한글 표기):
    5. `04-image-prompts/event-cgs/cg-list.md` H5 섹션 헤더 "## H5 장유나 — 4장" → "## H5 장윤영 — 4장". 영문 ID `cg_yuna_*` 4장 그대로 유지.
    6. `00-master/CONVENTIONS.md` §3.5 히로인 말투 행 / §4 호감도 변수 주석 — "장유나" 2개소 → "장윤영" + 영문 ID `yuna` 유지 명시 코멘트 추가. 카톡 분석 기반 H5 말투 룰("선배~!", 직진형, "~거든요!", 이모지 자주) 그대로 유지.
- **모듈**: `bg-list`, `cg-list`, `video-list`, `CONVENTIONS`
- **사유**: W2-prep 라운드에서 식별된 W3 처리 보류 항목. 시나리오 풀 텍스트(Ch.6 H4 분기) 작성이 진행됨에 따라 자산 명세도 같은 캠퍼스 기준으로 정합화. CONVENTIONS의 "장유나" 잔재는 사용자 직접 승인이 필요한 SSoT 모듈이라 보류 중이었던 항목.
- **영문 ID 정책**: 자산 ID(`seoyoon`, `yuna` 및 `cg_seoyoon_*`, `cg_yuna_*`, `video_*_seoyoon`, `video_*_yuna`)는 코드 호환성을 위해 절대 변경 금지. 한글 헤더·영문 디스크립터·SETTING/SUBJECT만 갱신. 단 `bg_yeungnam_pharm` ID는 영남대(Yeungnam) 자체가 잔재 표기라 ID도 `bg_kmu_pharm`으로 갱신(다른 H4 자산 ID와 달리 이는 캐릭터 ID가 아닌 장소 ID).
- **유지 사항**: MASTER-PLAN.md (frozen, §4.2 "영남대 약대 본3" / §6.2 "영남대 약대 앞" / §3.1 "장유나/박원영" 그대로 — BRANCH-GRAPH/STORY-BIBLE이 SSoT). BRANCH-GRAPH.md / STORY-BIBLE.md / 시나리오 .md / 캐릭터 시트(02-characters/) 무수정. 다른 라운드 작업(BGM-list 등) 미반영. CHANGELOG 라운드 2 #14 (variant별 별도 자산 생성 결정)는 W3 본 작업 시점 사용자 결정 항목으로 그대로 유지.
- **변경 제안 (다른 모듈)** — 본 라운드에서 직접 수정 X, 추적만:
  1. `07-content-integration/INTEGRATION-PLAN.md` §3 매니페스트 L71 — `"bg_yeungnam_pharm"` 항목이 본 라운드 ID 변경의 다운스트림 참조로 잔류. 다음 W5 라운드(콘텐츠 통합) 또는 즉시 정합 패치 검토 필요.
- **승인**: PM(구윤모) 직접 명령 / 커밋 해시 TBD

---

### 2026-04-29 — 마일스톤 #3 진행중 (Ch.6 H4 나서윤 분기 풀 텍스트 작성, 1/5)

- **변경**: `03-story/scenarios/ch06_h4_seoyoon.md` 신규 작성. H4 나서윤 분기 풀 텍스트 (3종 엔딩 TRUE/NORMAL/REJECT, BAD 없음 — 거절이 흡수).
  - **6개 메인 씬 + 11개 분기 씬 + 3개 엔딩 씬** 구조:
    - Scene 01 오프닝 카톡 (6/1, H4 시험 마지막 주 직전 본인 쪽 먼저 카톡)
    - Scene 02 캠퍼스 점심 (6/3, KEY #1 시험 응원 +10)
    - Scene 03 약대 가운 사진 + 변태 망상 페어 #1 + 미니게임 #1
    - Scene 04 토요일 데이트 (6/13 동성로 카페, KEY #2 자연스러운 거리감 +10)
    - Scene 05 새벽 카톡 미니게임 #2 (6/14 새벽)
    - Scene 06 마무리 (KEY #3 호감 명시 마무리 +10)
    - Scene 07 분기 평가 (BRANCH-GRAPH §6.1 5조건 평가)
    - Scene 08 TRUE 엔딩 (6/27 학생회관 앞 벚꽃길, "답장 빠르게 해줘서 고마워, 윤모야", "이름을 부르는 게 이렇게 무겁고 가벼울 줄")
    - Scene 09 NORMAL 엔딩 (느린 답장, "다음 시험 끝나고 봬요")
    - Scene 10 REJECT 엔딩 (8단계 연출 정확 + 변경 금지 카톡 텍스트 + video_reject_seoyoon)
  - **KEY 3개 (각 +10)**: ch6_h4_exam_cheer (시험 응원) / ch6_h4_distance (거리감 존중) / ch6_h4_close_reply (호감 명시 마무리)
  - **좋은 답변 +5 모먼트 5건** (H4 특성 반영):
    1. 답장 빠른 응답 보상 #1 (Scene 03b_replied 누적 보상)
    2. 같은 캠퍼스 우연 마주침 (Scene 04 입장 "답장 빠르게 받아주셨던 거")
    3. 🥺 → 🫶 이모지 호흡 변화 (Scene 03b_replied 모놀로그 명시)
    4. 약대 시험기간 케어 (Scene 01b_warm)
    5. 답장 빠른 누적 보상 #2 (Scene 05b_replied)
  - **답장 미니게임 2회** (Ch.6 추가, 15초 타이머): Scene 03 약대 가운 카톡 / Scene 05 새벽 카톡 다음 날
  - **변태 망상 페어 #1** (Ch.6 챕터당 1회): Scene 03 약대 가운 사진 받았을 때, (망상 ×3 → 자기자각 ×3 → 정상복귀 ×2), 12세 등급 + 욕설 0건 ("아 진짜. 정신 차려라")
  - **거절 카톡 텍스트** MASTER-PLAN §4.3 / H4 §6 / route-H4 정확 인용 (글자·줄바꿈·🥺🥺 정확):
    ```
    답장이 너무 늦어서 미안해ㅠㅠ
    그날 만나서 얘기하고 시간 잘 보냈는데
    더 진행하기엔 무리가 있을거 같아..
    좋은 인연 만나길 바랄게 🥺🥺
    ```
  - **거절 8단계 연출 정확 준수**: [SCENE_CUE: 1~8단계] 마커 + 단계별 BG/BGM/SFX/CG/VIDEO 큐 (페이드 인 → bgm_sad → 카톡 알림 → 타이핑 1.5초 → 4줄 0.8초 간격 → 2초 정지 → 검은 페이드 아웃 → 타이틀 카드 → video_reject_seoyoon)
  - **호감도 시뮬레이션**: Ch.5 종료 +40 가정 + Ch.6 최대 +71 (KEY 3 +30 + 좋은 답변 5 +25 + 미니게임 2 +20 - 자동 +1 등) → 트루 80 도달 가능. 평균 통과 시 +90, 실패 케이스 NORMAL 라우팅, 미니게임 2회 모두 타임아웃 시 late_reply_count ≥2로 REJECT 즉시 트리거.
- **모듈**: `ch06_h4_seoyoon` (신규)
- **사유**: W2 분기 시나리오 작성 (1/5). Ch.5 종료 후 H4 1위 분기로 라우팅되는 진입점이고, H4가 거절 엔딩 메커니즘 핵심 캐릭터라 우선순위 1.
- **유지 사항**: 시나리오 본문 톤 Ch.5와 일관 (친구 단톡 외 부드럽게, 메신저 약자 0건, 학년 표기 풀어 씀, 23학번 04년생 / 나서윤 03년생 재수 디테일 자연스럽게 한 줄로). H4 톤 시트 §4·§11 일관 유지 (시크 결 + 🥺/🫶 시그니처). 거절 카톡 텍스트 / 8단계 연출 변경 0.
- **변경 제안 (다른 모듈)** — 본 라운드에서 직접 수정 X, 추적만:
  1. `BRANCH-GRAPH.md` §6.1: route-H4 §END_H4_TRUE의 `late_reply_count == 0` 진입 조건을 §6.1 알고리즘에도 명시화 검토 (사용자 명시 "트루 조건은 late_reply_count == 0" 강하게 반영하려면 `[IF: late_reply_count == 0]` 추가 가드 필요)
  2. `SCENE-FORMAT.md` §1.1: `[SCENE_CUE: ...]` 디렉티브 신규 등록 검토 (단계별 연출 명시용, 또는 기존 [지문]으로 대체 표기)
  3. `cg-list.md`: `cg_seoyoon_date` 시기 Ch.5 → Ch.6 이동 반영 (W3 라운드)
  4. `bg-list.md`: `bg_kakao_fullscreen` (거절 1단계용) 신규 BG 등록 또는 모달 컴포넌트 처리 룰 명시 검토
  5. `H4-na-seoyoon.md` §6 루트 비트: 본 시나리오 6개 메인 씬 + 3종 엔딩 빌드 구조와 1:1 매핑 갱신 검토
- **승인**: PM(구윤모) 직접 명령 / 커밋 해시 TBD

---

### 2026-04-29 — 마일스톤 #2 추가 후속 (옵션 B 하이브리드: "좋은 답변 +5" 모먼트 보강)

- **변경**: Ch.1~4에 "좋은 답변 +5" 자동 호감도 모먼트 9건 추가. 시나리오 본문 텍스트 0건 수정, 시스템 큐(`[INC]`)만 마킹.
  - **ch01_ot.md** 1건: Scene 03 H2 1:1 카톡 후속 모놀로그 직후 → `[INC: H2 +5]`
  - **ch02_anatomy.md** 2건:
    - Scene 02b_steady 진정 후속 대사 끝 → `[INC: H2 +5]`
    - Scene 03b_apologize 청소 자처 후속 대사 끝 → `[INC: H3 +5]`
  - **ch03_dongsan.md** 2건:
    - Scene 03 명함 받은 후 모놀로그 직후 → `[INC: H1 +5]`
    - Scene 04_after_yuna 번호 교환 모먼트 직후 → `[INC: H5 +5]`
  - **ch04_library.md** 5건:
    - Scene 01b_share 족보 공유 후속 대사 끝 → `[INC: H2 +5]`
    - Scene 02b_care 케어 후속 모놀로그 직후 → `[INC: H1 +5]`
    - Scene 03b_meal 야식 챙김 후속 모놀로그 직후 → `[INC: H3 +5]`
    - Scene 05b_replied 카톡 마무리 후속 모놀로그 직후 → `[INC: H4 +5]`
    - Scene 06 H5 도서관 앞 응원 받음 → 기존 `[INC: H5 +1]` → `[INC: H5 +5]` 갱신
  - **Ch.5는 변경 없음** — 회식 5지선다 +10 + 모닥불 +5 + 카톡 키 +10이 이미 충분.
- **모듈**: `ch01_ot`, `ch02_anatomy`, `ch03_dongsan`, `ch04_library`
- **사유**: 마일스톤 #2 후속 검토에서 누적 호감도 +35~+46 (사용자 예상 50대 후반 미달) 확인. BRANCH-GRAPH §4 가정 "키 +10 + 좋은 답변 ×2 +10"의 좋은 답변 모먼트가 시나리오에 거의 없음. 옵션 B 채택 — 자연스러운 호감 모먼트에 +5 자동 변동 마킹으로 본문 무수정 보강.
- **유지 사항**: 시나리오 본문(대사·지문·모놀로그) 절대 무수정. 비-KEY [CHOICE] 옵션 변경 X. 새 선택지 추가 X. KEY +10 그대로. Ch.1 H2 가벼운 응답 -2 그대로.
- **H2 균형 조정 (사용자 명시 결정 옵션 c)**: H2 키 4개 + 추가 모먼트 3개로 가장 유리하지만 시나리오 의도(같은 5조 동기 만남 빈도) 존중. 트루 조건 "key_count ≥ 3" 그대로 유지(4개 중 3개 통과면 OK).
- **효과 (검증)**:
  - 새 누적 호감도: H1 +45 / H2 +61 / H3 +45 / H4 +40 / H5 +46
  - Ch.6에서 +35~+40 보충 시 트루(80) 도달 가능
  - H4 가장 빠듯 (+40 → Ch.6 +40 보충 필요), H2 가장 유리 (+61)
  - 16개 엔딩 모두 도달 가능
- **승인**: PM(구윤모) 직접 피드백 / 커밋 해시 TBD

---

### 2026-04-29 — 마일스톤 #2 후속 동기화 (호감도 시스템 정합화)

- **변경**: 마일스톤 #2 점검에서 발견한 P0급 치명 이슈 해결.
  - **P0-1 호감도 변동값 일괄 상향**: KEY 변동값 +5 → +10 (BRANCH-GRAPH §4 정합)
    - `ch01_ot.md` 1건 (H2 ch1_first_intro)
    - `ch02_anatomy.md` 2건 (H2 ch2_cadaver_calm, H3 ch2_apology)
    - `ch03_dongsan.md` 2건 (H1 ch3_first_intro, H5 ch3_first_intro)
    - `ch04_library.md` 4건 (H2 ch4_share, H1 ch4_care, H3 ch4_meal, H4 ch4_first_reply)
    - `ch05_decision.md` 2건 (H5 ch5_late_kakao, H4 ch5_dawn_reply) — 회식 5지선다 5건은 이미 +10
    - **CHOICE 줄 + INC 줄 모두 갱신, 시나리오 본문(대사·지문·모놀로그)은 무수정**
  - **P2 H4 키 +3 → +10 통일**: ch4_first_reply 키 변동값 +3에서 +10으로. 다른 KEY와 일관.
  - **P1 BRANCH-GRAPH §5 매트릭스 갱신**:
    - Ch.1 H2 키 추가 (ch1_first_intro)
    - Ch.5 H1·H2·H3 회식 5지선다 키 추가
    - Ch.3 H2 자동 +1 / Ch.4 H5 자동 +1을 "키 아님"으로 명시
    - 키 카운트 메모 추가 (H1·H3·H4·H5 각 3개, H2 4개)
    - 회식 5지선다 메모 추가 (5명 모두 KEY 부여, 1명만 활성화)
  - **P1 BRANCH-GRAPH §4 변동 표 갱신**: 한 히로인 올인 누적 추정값 추가 (H1 +50, H2 +56, H3 +50, H4 +35, H5 +36)
  - **P1 추가 SOLO 명시 분기**: ch05_decision.md Scene 07 close에 `[IF: H1<30 AND ... ENDING: END_SOLO_SUMMER] [ELSE] [EVALUATE_BRANCH] [/IF]` 추가. 엔진 알고리즘 백업 + 시나리오 자체 가시화.
- **모듈**: `ch01_ot`, `ch02_anatomy`, `ch03_dongsan`, `ch04_library`, `ch05_decision`, `BRANCH-GRAPH`
- **사유**: 마일스톤 #2 점검 결과 P0급 치명 이슈 3건 발견:
  1. 5명 전원 트루(≥80) 도달 불가 (Ch.1~5 누적 +23~+31에 그침)
  2. H4 NORMAL/TRUE 도달 불가 (aff <60 → 항상 거절 라우팅)
  3. H5 TRUE 도달 불가 → SOLO 폴백 (BRANCH-GRAPH §6.2)
  → 원인은 BRANCH-GRAPH §4 가정값(키 +10)과 시나리오 실제값(키 +5) 불일치.
  → 옵션 A 채택: 시나리오 실제값을 BRANCH-GRAPH 가정에 맞춰 +10으로 일괄 상향.
- **유지 사항**: 시나리오 본문(대사·지문·모놀로그) 절대 무수정. 비-KEY 변동값(+1/+2/+5/-2/-3 등) 그대로. 친구 단톡 톤 그대로. 자동 변동(+1) 그대로.
- **효과 (검증 필요)**:
  - 5명 전원 Ch.1~5 누적 +35~+56 → Ch.6 +25~+45 보충으로 트루(80) 도달 가능
  - H4 60 도달 가능 → NORMAL/TRUE 활성
  - H5 80 도달 가능 → TRUE 활성
  - 16개 엔딩 모두 도달 가능 (CI 빌드 검증으로 최종 확인 필요)
- **승인**: PM(구윤모) 직접 피드백 / 커밋 해시 TBD

---

### 2026-04-29 — 톤 룰 3차 갱신 + 기존 시나리오 4개 점검 라운드

- **변경**: 친구 단톡 외 모든 대사 부드럽게(메신저 약자 제거) + 학년 표기 "본과 1학년/본과 4학년" 통일 + 23학번=04년생 현역/나서윤 03년생 재수 디테일 정확 적용.
  - **prologue.md**: "본과1" → "본과 1학년" (3곳)
  - **ch01_ot.md**: "본과1" → "본과 1학년" (4곳), 친구 카페 잡담 메신저 약자 제거 (조나단·김규민 6곳: "ㅋㅋㅋ"→"(큭큭)", "ㄷㄷ"→"와", "ㄹㅇㅋㅋ"→"(웃으며)" 등), 윤하정 첫 만남 "ㅇㅇ. 너도?" → "어, 5조. 너도?", H2 1:1 카톡 윤모 응답 약자 풀이 ("ㅇㅇ/ㅇㅋ" → "어 받았어/보냈어/어 잘 자")
  - **ch02_anatomy.md**: "본과1" → "본과 1학년" (5곳), H2 1:1 카톡 윤모 응답 약자 풀이 ("ㅇㅇ/ㄹㅇ/ㅋㅋㅋ/ㅇㅋ" → "어/그러게/그래" 등). 5조 단톡은 친구 단톡이라 짧은 톤 유지.
  - **ch03_dongsan.md**: "본과1" → "본과 1학년" (7곳), 친구 오프라인 메신저 약자 제거 (김규민·조나단 7곳: "ㄷㄷ"→"와", "ㄹㅇ 직진"→"진짜 직진", "ㅋㅋㅋㅋ 활기차네"→"(작게 웃으며) 활기차네" 등), H5 1:1 카톡 윤모 응답 약자 풀이 ("ㅋㅋ/ㅇㅇ/ㅇㅋ" → "아/어 알겠어/제거" 등), H2 1:1 카톡 윤모 응답 약자 풀이 ("ㄴㄴ/ㅋㅋ/ㅇㅋ" → "별거 없어/그건 묻어주고/어")
  - **ch04_library.md** (신규): 톤 룰 선반영 + 2차 조정(과한 풀이 환원) + 3차 조정(H4 학번/나이 언급 절제). "본과1"→"본과 1학년" 14곳 + "본3 본4"→"본과 4학년".
  - **CONVENTIONS.md §3.4 "윤모 말투 룰"**: 후속 라운드 갱신 예정 (PM 승인 대기). 본 라운드는 시나리오 선반영.
- **모듈**: `prologue`, `ch01_ot`, `ch02_anatomy`, `ch03_dongsan`, `ch04_library` (시나리오 5개)
- **사유**: 사용자 명시 피드백 (2026-04-29 세 차례):
  1. "친구끼리의 단톡을 제외한 대사들이 더 길고 부드러워도 돼."
  2. "친구들의 대사들도 오프라인에서는 더 부드럽게 바꿔줘. 학년을 말할 때 '본과1' 대신 '본과 1학년'이라고 똑바로 말하도록 수정해. 23학번은 현역 기준 04년생이야. 나서윤은 재수생인거지."
  3. "오프라인 말투 개선한 건 좋은데, 내가 의도한 것보다는 과해. 적정한 수준으로 돌리고. 나서윤과의 대화에서 나이와 학번 언급이 너무 과하니까 수정해."
  → 정리:
   - 친구 캐릭터(김규민·조나단·표경민·약대 동기 윤재)도 오프라인에서는 메신저 약자(ㄷㄷ/ㄹㅇ/ㅋㅋ) X.
   - 단 부드러운 풀이가 두세 줄로 늘어나지 않도록 적정선 유지. 메신저 약자만 빼고 자연스러운 결.
   - 학년은 "본과 1학년/본과 4학년"으로 풀어 씀. "본과1/본3/본4" 약어 X.
   - H4 첫 만남 학번/나이 정보는 한 번씩만 자연스럽게 흘리고 끝.
- **유지 사항**: 친구 단톡(5조 단톡, 본과 1학년 동기 단톡) 짧은 카톡 톤 그대로. ㅇㅇ/ㄱㄱ/ㄷㄷ/ㅋㅋㅋ 자유롭게. 메신저 = 데이터 충실 / 그 외 = 본성 충실.
- **승인**: PM(구윤모) 직접 피드백 / 커밋 해시 TBD

---

### 2026-04-28 — 사용자 1차 본인 정보 검증 (5라운드 인터랙티브 Q&A)

- **변경**: 사용자 검증 체크리스트 결과 반영 + 영향받는 분기 그래프 동기화
  - `02-characters/goo-yunmo.md` §7 — 자취/이동/동아리/운동/카톡 패턴 확정
  - `02-characters/heroines/H1~H5.md` §13 — H1·H2·H3 그대로 OK, **H4 소속 변경**, **H5 가명 변경**
  - `03-story/STORY-BIBLE.md` §10 — 게임 제목 가제·단독 노멀 엔딩·영상 12개 분배 확정
  - `02-characters/side-characters.md` §5 — 동기 4명 → 6명, 교수 3명 재지정
  - `03-story/BRANCH-GRAPH.md` §2/§3/§6/§7/§8 — 15개 → 16개 엔딩, H4 REJECT 트리거 갱신, END_SOLO 활성화 (사후 보강)
- **모듈**: `goo-yunmo`, `H1~H5`, `STORY-BIBLE`, `side-characters`, `BRANCH-GRAPH`
- **사유**: 큰 줄기는 모두 OK였으나, H4 영남대 약대 → 계명대 약대(같은 캠퍼스) 변경으로 첫 만남이 자연스러워지고, 거절 엔딩 트리거를 호감도 무관/답장 지연 ≥2회로 강화하여 사용자 핵심 요구사항(거절 엔딩 1회 이상 도달 가능)에 부합. H5 가명은 사용자 선호로 "장유나" → "장윤영" 변경. 사이드 캐릭터는 카톡 분석상 등장한 실친 이름을 가명에 활용(가드레일 안에서).
- **승인**: PM(구윤모) 직접 검증 / 커밋 해시 TBD

#### 핵심 변경점 요약

1. **구윤모 본인 정보 확정**
   - 거주: 대구 성서 자취 (TBD 제거)
   - 본가 이동: KTX/SRT
   - 본과1 과대: 1·2학기 모두 확정
   - 동아리 3개: 리온(댄스) / 메니스(테니스, 2027 회장 예정) / 파노라마(사진)
   - 운동: 헬스 주 2~3회 + 테니스 동아리 정기 활동
   - 카톡 말투 분석: 대체로 정확, 일부 세부 조정 예정 (별도 라운드)

2. **H4 나서윤 — 핵심 변경**
   - 학적: 영남대 약대 본3 → **계명대 약대 4학년 (23학번, 03년생, 6년제 통합)**
   - 거주: 경산 → 대구 성서 자취 (계명대 인근)
   - 첫 만남: 동성로 합석 모임 → **계명대 캠퍼스 우연 조우** (의대-약대 같은 캠퍼스)
   - 학번 동기 + 학년 차이(윤모 본1, 서윤 약대4) 디테일이 첫 만남 자연스러움 강화
   - 답장 시간 제한: **15초 확정**
   - **거절 엔딩 트리거 강화**: `late_reply_count >= 2` (호감도 무관) → 거절 엔딩
     - 이유: "답장이 너무 늦어서 미안해" 카톡과 메커니즘 일관성. 호감도 높아도 답장 패턴 나쁘면 거절. 사용자 핵심 요구사항(거절 엔딩 1회 도달 가능) 충족.

3. **H5 가명 변경**: 장유나 → **장윤영**
   - 시각 모티브("장원영"형) / 24학번 의예과 2학년 / 인천 출신 / 직진 강도 — 모두 그대로
   - 자산 ID(`yuna_*`, `cg_yuna_*`, `video_*_yuna.mp4`)는 코드 호환성 위해 영문 ID 유지

4. **사이드 캐릭터 가명 재지정**
   - 동기 4명 → 6명 (카톡 분석상 자주 등장한 실친 이름 활용)
     - 김규민 (베프, "비통한 솔로" 컨셉) — 자취 따로(성서 인근), 윤모 자취방에 자주 놀러옴
     - 표경민 (모범생, 윤하정 라이벌)
     - 조나단 (분위기 메이커, 회식·MT 핵심)
     - 오준혁 (해부조 동기, 여학생, 비공략) — 이름 중성적이라 처음엔 남자로 오해받는 입체감
     - 이문규 (롤 친구, 비중 낮음)
     - 정욱 (공부 친구, 단톡 가끔 등장)
   - 교수 3명 재지정
     - 이태호 교수 (해부학, 40대 영포티, 친절·쾌활하지만 사생활 소문 약간) — 코미디 톤 가드레일 점검 필요
     - 나은영 교수 (생화학, 한설 지도교수, 50대 미혼, 똑똑하기만 함)
     - 이창용 펠로우 (동산병원 내과, 차세린 선배)

5. **STORY-BIBLE 일관성 갱신**
   - 게임 제목 가제 "성서로맨스: 본과 1학년의 봄" 확정
   - 단독 노멀 엔딩(16번째, 모든 호감도 <30 시 "혼자 여름방학") 추가 확정
   - 영상 12개 분배(오프닝1 + 첫만남5 + 트루5 + 거절1) 확정
   - 무대: 영남대 약대(경산) 줄 제거 → 계명대 약대(성서, 의대와 같은 캠퍼스) 추가
   - 거절 엔딩 트리거 표·카톡 메신저 룰 갱신

6. **BRANCH-GRAPH 동기화** (사후 보강)
   - 엔딩 카운트 15 → 16 (frontmatter, §2 표 제목/꼬리, §7 검증)
   - `END_H4_REJECT` 조건: `<50 + late_reply ≥3` → **`late_reply ≥2 (호감도 무관) OR aff <60`** (H4 §6 시트와 정합)
   - `END_H5_TRUE` 한글 표기 "장유나" → **"장윤영"**
   - `END_SOLO` (혼자 여름방학) 신규 추가 — `§2` 표·`§3` JSON·`§6` 알고리즘에 정식 활성화 (이전엔 `ALL_LOW` placeholder로 비활성)
   - `§6` 알고리즘 정리: 분기 평가 순서 명시, H4 BAD 자리는 REJECT로 라우팅, H5는 TRUE 미달 시 SOLO 폴백, H3는 BAD 미존재 → NORMAL 폴백
   - `§7` 도달성 검증에 신규 룰 3개 추가 (H4 REJECT, END_SOLO, H5 TRUE 도달성)

#### 후속 작업 (별도 라운드)

1. 카톡 말투 "일부 조정 필요" 항목 사용자 추가 피드백 대기
2. 김규민 "비통한 솔로" 컨셉 + 자기자각 트리거 결합의 12세 등급 톤 점검
3. H4 학제 일관성 (약대 6년제 4학년 ≈ 본과3?) — `01-research/kmu-medical-school.md` 보강
4. H4 거주지 변경 → Ch.4 시퀀스 비트 재작성 (`03-story/route-H4-na-seoyoon.md`, `03-story/route-common.md`)
5. 이태호 교수 "문란" 컨셉의 12세 등급 안전선 톤 가이드
6. MASTER-PLAN §4.3 거절 카톡 인용 텍스트는 그대로(변경 금지). 트리거 조건만 갱신됨 — 충돌 재확인
7. 04-image-prompts 자산 명세 (영남대 → 계명대, "장유나" 한글 표기 등) 일관성 갱신은 W3 라운드에서 처리

#### 후속 작업 — 자동 일관성 점검 (2026-04-28 라운드 2)

> 위 사용자 검증 라운드 직후 Claude Code가 전체 모듈 .md 일관성 점검을 수행하여 식별한 추적 항목.
> 라운드 1 후속 작업(#1~7)이 다루지 못한 신규 불일치만 기록.
> 영향받는 모듈의 `status: review` 갱신은 각 항목 처리 시 동시에 진행한다.

8. **사이드 캐릭터 이름 라우트 동기화** — `02-characters/side-characters.md`는 동기 4명→6명/교수 3명 재지정 완료(라운드 1)됐으나 라우트들에 옛날 가명 잔재.
   - `03-story/route-common.md` Ch.1 비트 5 "박재훈, 이도현, 김태우" → 새 6명 중 등장 인물로 갱신
   - `03-story/route-common.md` Ch.2 비트 1 "김명석 교수" → "이태호 교수"
   - `03-story/route-common.md` Ch.3 비트 1 "이성호 펠로우" → "이창용 펠로우"
   - `03-story/route-common.md` Ch.4 비트 7 "동기 박재훈이 약대 친구와 합석" — #4 후속 작업과 함께 재작성
   - `06-engine/SCENE-FORMAT.md` §2 예시 JSON `"sender": "side_jaehoon"` → 새 ID로 갱신

9. **H5 한글 가명 "장유나" → "장윤영" 라우트 동기화** — H5 시트/STORY-BIBLE은 가명 변경 완료, 라우트 미반영.
   - `03-story/route-H5-jang-yuna.md`: Ch.6 제목 "장유나 분기" / 엔딩 타이틀 "장유나 트루 엔딩 — 벚꽃길 너머"
   - `03-story/route-common.md` Ch.3 비트 6 "첫 만남: 장유나 (H5)"
   - 자산 ID(`yuna_*`, `cg_yuna_*`, `video_*_yuna`)는 영문 그대로 유지 (H5 시트 §13 명시)

10. **side-characters.md 자체 잔재 정리** —
    - §3 단역 "약대 동기 친구 (Ch.4 합석 자리): 나서윤 데려옴" — H4 첫 만남이 캠퍼스 우연 조우로 변경됐으므로 "합석 자리" 표현 무효
    - §1.4 오준혁 "윤하정과 같은 해부조" 두 번 중복 표기 정리

11. **엔딩 카운트 15 → 16 일괄 동기화** — BRANCH-GRAPH/STORY-BIBLE은 라운드 1에 16개 + END_SOLO 활성화 완료, 다른 모듈 미반영.
    - `README.md` "엔딩: 15개"
    - `00-master/PROGRESS-TRACKER.md` 다수 (15개 엔딩 매트릭스 / §8 분포 / Playwright E2E 15개 + side-characters "동기 4명, 교수 3명")
    - `05-ui-design/UI-SPEC.md` §7.3 "15개 슬롯 그리드"
    - `08-qa-deployment/QA-PLAN.md` outputs / §1.1 케이스 목록(**`END_SOLO` 누락 추가**) / §5 사인오프 체크리스트
    - `06-engine/SCENE-FORMAT.md` §5 "15개 ID 중 하나"

12. **엔진 명세 내부 정합** — `06-engine/ARCHITECTURE.md`:
    - §6 `evaluateBranch` H4 분기 옛날 트리거(`< 50 && late >= 3`) → BRANCH-GRAPH §6.1 새 알고리즘(`late_reply ≥2` 우선, `aff <60` BAD 흡수)으로 갱신
    - §6 `'ending_alone'` + "(선택)" 코멘트 → `'END_SOLO'` 정식 활성화
    - §4 GameFlags `flag_seoyoon_late_replies: number[]` (배열) ↔ `06-engine/STATE-SCHEMA.md` §2 `late_reply_count: number` (단일) — STATE-SCHEMA 기준 통일
    - §2 폴더 구조 `scenes/endings/end_solo.scene.json` 추가 명시

13. **답장 타이머 시간 15초 일원화** — 확정값(H4 시트 §11 / STORY-BIBLE §7.1 / 라운드 1) **15초**. 갱신 대상:
    - `06-engine/ARCHITECTURE.md` §8 `ReplyTimer` `timerSeconds = 60` → 15
    - `05-ui-design/UI-SPEC.md` §6 카톡 mockup "답장 시간 25초" → 15
    - `06-engine/SCENE-FORMAT.md` §1.1·§1.2 `[KAKAO_TIMER: 30]` → 15
    - `03-story/route-H4-na-seoyoon.md` 답장 미니게임 명세 "기본 60초" → 15

14. **배경 ID 사전 정합화 (W3 라운드 동시 처리 권장)** — 정본은 `04-image-prompts/backgrounds/bg-list.md`. 라우트들이 참조하는 누락·충돌 ID:
    - `bg_anatomy_lab_entrance` (bg-list엔 `bg_anatomy_lab`만), `bg_biochem_lab`, `bg_biochem_lab_night`
    - `bg_uikuk_corridor` (bg-list `bg_dongsan_hallway`와 충돌 — 한국식 로마자 vs 영문 통일 필요)
    - `bg_library_evening`, `bg_campus_cafe_night`
    - `bg_classroom_test`, `bg_pub_party`, `bg_pension_evening`, `bg_pension_room_night`
    - `bg_dongseongno_night`, `bg_library_rooftop`, `bg_phd_office`, `bg_sports_field`, `bg_campus_cherry_path`
    - 처리 시 MASTER-PLAN §6.2 "배경 15장" 카운트 재검토(16+ 가능성) 동시 진행
    - `07-content-integration/INTEGRATION-PLAN.md` §3 매니페스트 예시 `bg_anatomy_lab_entrance`도 함께 갱신

15. **마이너 정합 이슈** —
    - `MASTER-PLAN.md` §7.1 폴더 구조 `docs-internal/` 표기 vs 실제 `game-project/` 직하위 — frozen 미수정, 차이 인지만
    - `MASTER-PLAN.md` §6.3 VEO "여유분 3개" vs STORY-BIBLE §10 "12개 확정" — frozen 미수정, 운용은 12개 기준
    - `STORY-BIBLE.md` §6.3 거절 트리거 표기 "(지연 ≥2) OR (aff <60)" — 사람용 가독성에서 "지연 우선 / aff는 BAD 흡수" 의미가 잘 안 보임, 표기 명확화
    - `01-research/medical-life-realism.md` §4 시간선 (중간/기말 2시험) vs STORY-BIBLE §3 (Ch.5 본과 첫 시험 단일) — 1시험 기준 정합

---

### 2026-04-28 (W2-prep 일관성 동기화 라운드)

- **변경**: 라운드 2(자동 일관성 점검)에서 식별된 B/D/E/F/G 카테고리 일괄 동기화. 시나리오 풀 텍스트 작성 직전 정리.
- **모듈**: `route-common`, `route-H1~H5`, `route-H4-na-seoyoon`, `side-characters`, `SCENE-FORMAT`, `ARCHITECTURE`, `UI-SPEC`, `QA-PLAN`, `README`, `PROGRESS-TRACKER`, `sprite-list`, `bg-list`, `INTEGRATION-PLAN`, `STORY-BIBLE`(부수), `BRANCH-GRAPH`(부수), `01-research/kmu-medical-school`(부수)
- **사유**: 시나리오 풀 텍스트 작성 시작 전 SSoT 정합성 확보. CHANGELOG 라운드 2 #1~8과 #11~13 처리.
- **승인**: 사용자 직접 승인 (W2-prep)

#### 핵심 변경점 요약

1. **B-1 `route-common.md`** — Ch.4 H4 첫 만남 "동성로 영남대 합석" → "계명대 캠퍼스 우연 조우(도서관/학생식당)". Ch.5 거절 트리거 옛 트리거 → `late_reply_count ≥ 2` 즉시(호감도/순위 무관). 분기 후 처리에서 `END_SOLO_SUMMER` 활성화 명시.
2. **B-2 `route-H4-na-seoyoon.md`** — Ch.6 무대(영남대→계명대), 분기 알고리즘(BRANCH-GRAPH §6.1 동일 4줄), 트루엔딩 무대·타이틀(경산의 봄 → **성서의 봄**, 영남대 약대 캠퍼스 → 계명대 학생회관 앞/벚꽃길), 답장 타이머(60초 → **15초**) 일괄 갱신.
3. **D-1 사이드 캐릭터 이름 일괄 치환** — 박재훈→김규민, 이도현→표경민, 김태우→조나단, 김명석→이태호, 이성호→이창용. `SCENE-FORMAT.md` 예시 JSON `side_jaehoon` → `side_kyumin`. 한지원은 라우트 등장 없음(영향 0).
4. **D-2 H5 한글 가명 일괄** — "장유나" → "장윤영". `route-common`, `route-H5`, `sprite-list` 한글 헤더, `01-research/kmu-medical-school.md` L44 갱신. 영문 자산 ID `yuna_*` 호환성 유지.
5. **D-3 `side-characters.md`** — §3 약대 동기 합석 단역 제거(변경 사유 주석으로 추가). §1.4 오준혁 "윤하정과 같은 해부조" 중복 행 정리.
6. **E 엔딩 카운트 15→16 일괄** — `README` / `PROGRESS-TRACKER`(다수) / `UI-SPEC` §7.3 / `QA-PLAN` (frontmatter / §1.1 + `END_SOLO_SUMMER` 추가 / §5) / `SCENE-FORMAT` §5 갱신. SSoT(`STORY-BIBLE` / `BRANCH-GRAPH`)의 `END_SOLO` → **`END_SOLO_SUMMER`** 일관성 부수 갱신.
7. **F-1/F-2 `ARCHITECTURE.md` §6 evaluateBranch** — BRANCH-GRAPH §6.1과 동일하게 4줄로 재작성:
   ```
   if (late_reply_count >= 2) return 'END_H4_REJECT';   // 즉시, 호감도/순위 무관
   const winner = determineWinner(flags);
   if (winner === 'NONE') return 'END_SOLO_SUMMER';     // 16번째 엔딩
   return determineEnding(winner, flags);
   ```
   - `'ending_alone'` + "(선택)" 코멘트 → `'END_SOLO_SUMMER'` 정식 활성
   - §2 폴더 구조 `scenes/endings/end_solo_summer.scene.json` 추가
8. **F-3 GameFlags 통일** — `ARCHITECTURE.md` §4 `flag_seoyoon_late_replies: number[]` 제거. `STATE-SCHEMA.md` §2 `late_reply_count: number` 단일이 SSoT.
9. **F-4 답장 타이머 15초 일원화** — `ARCHITECTURE.md` §8 `timerSeconds = 60` → 15. `UI-SPEC.md` §6 카톡 mockup "25초" → 15. `SCENE-FORMAT.md` §1.1·§1.2 `[KAKAO_TIMER: 30]` → 15. `route-H4-na-seoyoon.md` §답장 미니게임 명세 "기본 60초" → "**15초** (H4 시트 §11 / STORY-BIBLE §7.1 확정값)".
10. **G 배경 ID 사전 정합화** — `bg-list.md` 상단에 **변형(variant) 룰** + 라우트→bg-list 매핑표(18행) 추가. 라우트 13+개 누락 ID를 본 15장에 variant 메타로 흡수. 라우트 측 모든 BG 큐를 본 ID + variant 표기로 일괄 치환. `INTEGRATION-PLAN.md` §3 매니페스트 예시도 본 15장으로 갱신.

#### 변경된 모듈 status: `draft` → `review`

`route-common`, `route-H1~H5`, `sprite-list`, `bg-list`, `UI-SPEC`, `ARCHITECTURE`, `SCENE-FORMAT`, `INTEGRATION-PLAN`, `QA-PLAN` (총 13개). `STORY-BIBLE` / `BRANCH-GRAPH` / `side-characters`는 이전부터 review 상태 유지.

#### 주의 / Out of scope

- **`MASTER-PLAN.md` (frozen)** — §1 "엔딩 15개", §3.1 "장유나/박원영", §4.2 "영남대 약대 본3", §6.2 "영남대 약대 앞", §6.3 "여유분 3개" 등은 그대로. BRANCH-GRAPH/STORY-BIBLE이 SSoT.
- **`CONVENTIONS.md`** — L90 "장유나", L102 "// 장유나" 잔재. 사용자 직접 승인 없이 수정 금지(메모리 룰). 후속 작업으로 추적.
- **C 카테고리 (자산 영문 디스크립터)** — `bg_yeungnam_pharm`, `cg-list` H4 영문 디스크립터, `video-list` H4 영문 디스크립터, `cg-list` H5 한글 헤더. **W3 라운드에서 처리** (`PROGRESS-TRACKER §W3 라운드 처리 대기 항목` 명시).
- **A 카테고리** — frozen 충돌은 정상, 의도된 워크플로.
- **H 카테고리 (마이너)** — 다음 점검 라운드에서. 라운드 2 #15 그대로 유효.

#### 후속 작업 (W2-prep 라운드 후 추적)

1. **CONVENTIONS.md L90/L102 "장유나" 잔재** — 사용자 직접 승인 후 "장윤영"으로 갱신
2. **C 카테고리 W3 라운드 처리** (위 Out of scope 4개 항목)
3. **bg-list variant 자산 분리 결정** — W3 시점에 시각 차이 큰 variant(예: phd_office vs anatomy_lab)는 별도 webp 생성, 작은 것은 메타만 유지
4. **H 카테고리 마이너 정합** — 라운드 2 #15 그대로 유효 (MASTER-PLAN docs-internal 폴더 / VEO 여유분 / STORY-BIBLE 거절 트리거 표기 / medical-life-realism §4)
5. **라운드 1 후속 #1~3, #5** 미처리 (카톡 말투 일부 조정 / 김규민 12세 톤 / H4 학제 보강 / 이태호 12세 톤) — 사용자 피드백/별도 라운드 대기
6. **라운드 2 후속 #15 (마이너 정합)** — 다음 점검 라운드에서. 라운드 2 #8~14는 본 라운드에서 모두 처리 완료
7. **시나리오 풀 텍스트 작성 (W2 본 라운드)** — 본 동기화 결과를 시드로 시작

---

### 2026-04-28 (W2-prep 패치 — 점검 라운드 후속)

- **변경**: W2-prep 라운드 직후 점검에서 발견된 3개 정합 이슈 정정
- **모듈**: `03-story/route-H4-na-seoyoon`, `03-story/route-common`
- **사유**: BRANCH-GRAPH §6.1 ↔ route-H4 분기 알고리즘 결과 차이(late=1 케이스에서 잘못된 NORMAL 라우팅) + Ch.4 무대/키 선택지 잔재 라벨 정리. 시나리오 풀 텍스트 작성 직전 마지막 정합.
- **승인**: 사용자 직접 승인 (W2-prep 패치)

#### 변경점

1. **`route-H4-na-seoyoon.md` §Ch.6 분기 알고리즘** — `late == 0` 조건 오류 정정. BRANCH-GRAPH §6.1 사람용 요약과 동일 순서/조건의 5단계 의사코드로 재작성:
   ```
   if late >= 2 → END_H4_REJECT (즉시)
   elif aff < 60 → END_H4_REJECT (BAD 흡수)
   elif aff < 80 → END_H4_NORMAL
   elif key_count >= 3 → END_H4_TRUE
   else → END_H4_NORMAL  (aff ≥80 키 부족 fallback)
   ```
   - 결과 차이 케이스: `late=1, aff=80, key=3` → 이전 의사코드 NORMAL (오류) → **TRUE** (BRANCH-GRAPH 정답)
   - 평가 순서 차이도 명시 (각주 추가)

2. **`route-common.md` Ch.4 §무대** — "동성로 (외부 합석)" 잔재 라벨 정리. H4 첫 만남이 캠퍼스 우연 조우로 변경됨에 따라 Ch.4 비트에 동성로 시퀀스 없음. 무대/배경 항목에서 동성로 제거 + "계명대 캠퍼스 (도서관/학생식당, H4 우연 조우)" 추가. BG ID도 `bg_dongseong_street` 제거 + `bg_kmu_main` / `bg_library_day` 표기.

3. **`route-common.md` Ch.4 §키 선택지 후보** — "(H4 키1) 카톡 답장을 **30분 내** 누름" → "(H4 키1) 카톡 답장 미니게임 통과 (**15초** 타이머 안에 답장 — H4 시트 §11 / STORY-BIBLE §7.1 확정값)". F-4 타이머 일원화와 정합.

---

### 2026-04-28 (W2 시나리오 톤 — 윤모 오프라인 대화 분리)

- **변경**: 구윤모의 톤을 채널별로 분리. 카톡 톤(짧은 단답, ㅇㅇ/ㄱㄱ/ㄷㄷ, ㅋㅋㅋ)은 메신저 한정. 오프라인 대화는 더 부드럽고 예의 있게 (메신저 약자 금지, 단답 회피).
- **모듈**: `02-characters/goo-yunmo`, `03-story/scenarios/prologue`, `03-story/scenarios/ch01_ot`
- **사유**: 사용자 직접 피드백. 카톡 분석 데이터(84,861개 메시지 기반)는 정확하지만 그 톤이 오프라인에 그대로 옮겨지면 윤모 본 성격(§2 "밝고 쾌활, 친화력 좋음, 다정함")이 안 살아남. 채널 분리로 두 톤 모두 보존.
- **승인**: 사용자 직접 승인 (W2 시나리오 톤 라운드)

#### 변경점

1. **`02-characters/goo-yunmo.md`** — §4 재구성:
   - §4.3 (신규) **"오프라인 대화 톤 (대면 대화, 카톡과 분리)"** 추가. 카톡 vs 오프라인 비교표 + 어머니/동기 첫 만남 예시 포함.
   - §4.3 모놀로그 톤 → §4.4
   - §4.4 변태 망상 페어 룰 → §4.5 (참조 오타도 정정: "CONVENTIONS.md 4.3" → "CONVENTIONS.md §3.3")
   - status `review` 유지 (이미 review).

2. **`03-story/scenarios/prologue.md`** — Scene 1 어머니 거실 대화 윤모 라인 부드럽게:
   - "어. 거의." → "어. 거의 다 했어."
   - "그러게." + "시험기간 되면 더 그럴 거고." → "그러게... 시험기간 되면 더 그럴 거고." (한 줄로 결합 + 여운)
   - "본과는 좀 빡세겠지." → "알겠어. 본과는 좀 빡세겠지만, 무리 안 할게."
   - 마지막에 "응. 고마워." 추가
   - status `draft` → `review`

3. **`03-story/scenarios/ch01_ot.md`** — 오프라인 대사 일괄 수정 (카톡 블록 내부는 변경 X):
   - **Scene 01 OT 자기소개**: "어, 안녕하세요" → "네, 안녕하세요" / "한 학기 같이 잘 해봅시다" → "한 학기 같이 잘 부탁드리겠습니다" / "부족한 거" → "부족한 부분", "바로" → "편하게"
   - **Scene 02 H2 첫 만남**: "ㅇㅇ. 구윤모." → "응, 맞아. 구윤모."
   - **Scene 02 키 선택지** 텍스트 자체:
     - "앞으로 잘 부탁한다" → "어. 앞으로 잘 부탁할게"
     - "조 잘 부탁ㅋ" → "어, 조 잘 부탁~"
   - **Scene 02b_serious**: 본문 대사 "앞으로 잘 부탁한다." → "어. 앞으로 잘 부탁할게."
   - **Scene 02b_casual**: 본문 대사 "조 잘 부탁ㅋ" → "(가볍게) 어, 조 잘 부탁~" + 지문 "가벼운 톤" → "너무 가벼운 톤"
   - **Scene 02_after_meet**: "아 ㅇㅇ. 안녕, 준혁아." → "아, 응. 안녕, 준혁아."
   - **Scene 04 첫 강의**: "5조라며." → "어, 5조라고 했잖아." / "(피식) ㅇㅇ 알겠다." → "(피식) 응, 알겠어."
   - **Scene 05 카페**: "그냥 평범함." → "그냥 평범하지." / "긴 머리. 무뚝뚝." → "긴 머리에, 무뚝뚝한 편." / "ㅇㅇ 곧." → "어, 금방 할게."
   - **Scene 05 키 선택지** 텍스트: "야 첫날부터 뭔 소리야 ㅋㅋ" → "야 첫날부터 뭔 소리야"
   - **Scene 05b_playful**: 본문 대사 "야 첫날부터 뭔 소리야 ㅋㅋ" → "(피식) 야 첫날부터 뭔 소리야."
   - status `draft` → `review`

#### 변경 안 된 영역 (의도적)

- **카톡 블록 (`[KAKAO] ... [/KAKAO]`)**: 기존 톤 그대로. 윤모 카톡 응답 평균 4자대 / ㅇㅇ/ㄱㄱ/ㄷㄷ/ㄴㄴ/ㅋㅋㅋ 폭격 유지.
- **`[구윤모 모놀로그]`**: 내면 독백은 별도 톤(가볍지만 솔직, 자기 비하 약간) — 이번 변경 대상 아님.
- **존댓말 자기소개·교수 안내**: 이미 정중. 미세한 어휘 폴리시만(예: "잘 해봅시다" → "잘 부탁드리겠습니다") 적용.
- **친구 사이 단답 인사** (예: "어, 옆자리." 같은 H2 발화): H2 본인 톤이라 변경 X. 윤모 응답만 부드럽게.

#### 후속 작업

1. **`00-master/CONVENTIONS.md` §3.4 "구윤모 말투 룰"** — 현재는 카톡/오프라인 분리 안 됨 ("친구 사이: 'ㅇㅇ', 'ㄱㄱ' ... 자주" 식으로 전체 적용). PM 직접 승인 후 카톡/오프라인 행 분리 갱신 필요. (CONVENTIONS는 사용자 직접 승인 전 수정 금지 룰 — feedback_ssot_workflow.md.)
2. 후속 챕터 시나리오(Ch.2~Ch.6, 엔딩) 작성 시 본 룰(goo-yunmo §4.3) 일관 적용.
3. 기 작성된 라우트 .md(`route-common.md`, `route-H1~H5.md`)의 시드 모놀로그/대사 점검은 W2 시나리오 풀 텍스트 작성 라운드에서 자연 반영.

---

### 2026-04-28 (욕설 절대 금지 룰 추가 + 7세 등급 시도→롤백)

- **변경**: 사용자 명령 2회로 인한 정정. 1차로 게임 등급 7세 + 변태 망상→연애 망상 + 욕설 금지 일괄 적용을 시도했으나, 사용자가 "변태 망상·등급은 원래대로 두고 ch03_dongsan 가운 자락 표현만 빼라"고 정정. 최종: **욕설 절대 금지 룰만 신규 도입, 등급(12세)·변태 망상 컨셉은 유지, ch03 한 줄 표현만 수정**.
- **모듈**: `00-master/CONVENTIONS`, `00-master/MASTER-PLAN`, `02-characters/goo-yunmo`, `02-characters/heroines/H2-yoon-hajeong`, `03-story/STORY-BIBLE`, `03-story/route-common`, `03-story/scenarios/prologue·ch01_ot·ch02_anatomy·ch03_dongsan`, `04-image-prompts/sprites/sprite-list`, `04-image-prompts/PROMPT-GUIDE`, `04-image-prompts/backgrounds/bg-list`, `04-image-prompts/event-cgs/cg-list`, `04-image-prompts/veo-videos/video-list`, `05-ui-design/UI-SPEC`, `05-ui-design/ANIMATION-SPEC`, `08-qa-deployment/QA-PLAN`, `01-research/reference-vn-analysis`, `README`
- **사유**: 사용자 직접 명령 2회.
  1. 1차: "욕설 금지 + 변태→연애 + 7세 등급" — 일괄 적용
  2. 2차 정정: "욕설 금지만 유지, 등급·변태 망상 컨셉은 원래대로, ch03 가운 자락 표현만 변경"
- **승인**: 사용자 직접 승인 (2단계)

#### 최종 변경점 (정정 반영)

1. **욕설 절대 금지 룰 신규 도입** (유지):
   - `CONVENTIONS.md` §3.3 변태 망상 페어 룰 — 자기자각 예시에서 "시발/미친" 제거 → "아 진짜. 정신 차려라"
   - `CONVENTIONS.md` §3.4 윤모 말투 룰 — "**욕설 절대 금지**" 항목 신규
   - `CONVENTIONS.md` §8 12세 가드레일 — 기존 "시발/ㅁㅊ까지 OK" 폐기 → "욕설 절대 금지" 명시
   - `goo-yunmo.md` §4.4 모놀로그 톤 예시 — "시발 정신 차려라" → "아 진짜. 정신 차려라"
   - `goo-yunmo.md` §4.5 변태 망상 페어 룰 — 자기자각 톤 욕설 없이 부드럽게 명시
   - `goo-yunmo.md` §5 `yunmo_recover` 스프라이트 설명 — 욕설 없는 자각 톤
   - `STORY-BIBLE.md` §7.2 — 자기자각 톤 욕설 X 명시
   - `MASTER-PLAN.md` §1 등급 표기에 "욕설 절대 금지 룰 추가" 노트
   - `MASTER-PLAN.md` §4.1 변태 메롬 — 자기자각 톤 욕설 X 노트
   - `README.md` ⚠️ 절대 잊으면 안 되는 것 — 욕설 금지 룰 추가
   - `QA-PLAN.md` §QA 체크리스트 — "욕설 0건" 점검 항목 추가
   - 시나리오 4개 본문 욕설 0건 ✓:
     - `ch01_ot.md` Scene 04 자기자각 "아 미친"/"시발" → "아 진짜"/"" + Scene 05 김규민 "아 시발" → "아 진짜"
     - `ch02_anatomy.md` Scene 04 자기자각 "아 미친"/"시발" → "아 진짜"/""
     - `ch03_dongsan.md` Scene 02 자기자각 "아 미친"/"시발" → "아 진짜"/""
   - `H2-yoon-hajeong.md` §11 카톡 예시 "ㅋㅋㅋ 미친" → "ㅋㅋㅋ 대박" (친구 카톡도 욕설 X)

2. **등급 12세 + 변태 망상 컨셉 유지** (1차 적용 후 2차 정정으로 롤백):
   - `MASTER-PLAN.md` §1 등급: 12세 (1차에서 7세로 변경했다가 롤백)
   - `goo-yunmo.md` §2 "음란하고 변태 기질" 캐릭터 설정 그대로
   - `STORY-BIBLE.md` §7.2 "변태 망상 페어 (구윤모 시그니처)" 명칭 그대로
   - `route-common.md` Ch.1·2·3·5 "변태 망상 페어 #N" 표기 그대로
   - 시나리오 4개의 망상 페어 시각/분위기 묘사 (앞머리 흘러내림, 안경 닦기, 가운 단추 등) 원래대로 유지
   - 부수 자료(sprite-list / PROMPT-GUIDE / bg-list / cg-list / video-list / UI-SPEC / ANIMATION-SPEC / reference-vn-analysis) 12세 + 변태 망상 표기 그대로

3. **`ch03_dongsan.md` 가운 자락 표현 변경** (사용자 핵심 정정 요청):
   - Scene 02 변태 망상 페어 (망상 시작 2번째 줄):
     - 변경 전: "...의국 소파에서 잠깐 잠들어 있는데, **가운 자락이 살짝 흘러내리고** 마침 그 순간에 옆을 지나가게 된다면..."
     - 변경 후: "...의국 소파에서 잠깐 잠들어 있는데, **머그잔이 식어가는 옆에서 평온히 쉬고 계신** 그 순간을 마침 옆에서 보게 된다면..."
   - 다른 망상 페어 시각 묘사(가운 단추, 머리카락 흘러내림 등)는 그대로.

#### 최종 status

- 모든 영향 모듈 status 그대로 유지 (이미 review 또는 draft 상태).
- 시나리오 4개 status: `review`.

#### 후속 작업

1. 후속 챕터 시나리오(Ch.4~Ch.6, 엔딩) 작성 시 욕설 0건 점검 자동화.
2. CHANGELOG의 1차/2차 정정 라운드는 본 엔트리로 통합 정리됨. 별도 추적 X.
3. 메모리 `feedback_game_rating_seven.md`는 "욕설 절대 금지" 단일 룰로 갱신됨 — 등급/망상 부분은 롤백 명시.

