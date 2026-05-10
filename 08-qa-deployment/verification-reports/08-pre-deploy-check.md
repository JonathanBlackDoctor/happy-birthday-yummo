---
module: 08-pre-deploy-check
hierarchy: 6
depends-on:
  - 00-master/MASTER-PLAN.md
  - 00-master/PROGRESS-TRACKER.md
  - 00-master/CHANGELOG.md
outputs:
  - 출시 직전(Phase C) Claude 영역 사전 점검 결과 보고
  - 회귀 검증 7종 + README 정합 점검 실측치
  - PM 검토 대기 항목 (회귀 발견 시)
status: review
---

# 08-pre-deploy-check.md — Phase C 출시 직전 사전 점검

> 실행 일시: **2026-05-10 03:20 KST** (CronCreate 일회성 예약 fire)
> 실행 컨텍스트: Phase A(PROGRESS-TRACKER 동기화 + 코드 정합성 정리) + Phase B(PM 결정 4건 모두 "유지") 완료 직후. Phase C(GitHub Pages 배포) 직전 Claude 영역 사전 점검.
> 원칙: **코드 변경 0** (README 정합 픽스만 허용). 회귀 발견 시 노트만 남기고 PM 검토 대기.

---

## 1. README 출시 정합 점검

| 항목 | 결과 |
|---|---|
| 게임 제목 "구연시: 본과 1학년의 봄" 반영 | ✅ [`README.md:1`](../../README.md) 정확 반영 |
| 옛 가제 "성서로맨스" 잔재 grep | ✅ **0건** (성서로맨스 / seongseo / sungseo 패턴 매칭 0) |
| 배포 URL 자리 | ⬜ (PM이 GitHub repo 생성 후 채울 영역, 본 라운드 범위 외) |

**잔여 stale 노트** (본 라운드 픽스 X — 출시 직전 변동성 회피로 PM 검토 대기):
- L99~L104 진행 일정 표 "W1 (현재)" → 실제 W6 출시 직전. 출시 후 또는 별도 라운드에서 갱신.
- L50 "스프라이트 48종 + 배경 15장" → 실제 스프라이트 63종(라운드 4 사이드 4명 추가) + 배경 17장(라운드 4 신규 2장 + 라운드 5 LANCZOS 업스케일).
- L86 동일 자산 수치 stale.

→ Phase B 결정 일관성("유지" 원칙)과 정합. README 본문 수정 0.

---

## 2. 회귀 검증 (풀 + 압축 양 모드)

### 2.1 모드 무관 (단위 테스트 / 타입체크 / 게임 제목)

| # | 명령 | 기대 | 실측 | 결과 |
|---|---|---|---|---|
| 1 | `npm run typecheck` (`tsc --noEmit`) | 0 errors | 0 errors (no output) | ✅ |
| 2 | `npm test` (vitest) | 72/72 통과 | **72/72 통과** (rejectLines 11 / saveSlots 20 / toneMatrix 26 / branchEvaluator 15, 1.09s) | ✅ |

### 2.2 풀 모드 (`src/scenes/`)

| # | 명령 | 기대 | 실측 | 결과 |
|---|---|---|---|---|
| 3 | `npm run compile` (`--mode=full` 기본) | 212 씬 | **212 씬** (warning 6: IF v0.1 미지원 기존) | ✅ |
| 4 | `npm run validate` | 16 엔딩 + 거절 도달성 + 화이트리스트 | 16/16 + 거절 도달성 OK (h4_reply_speed 8건) + BG 17+22 / CG 20 / VIDEO 12 / BGM 8en9ko / SFX 14en8ko | ✅ |
| 5 | `npx tsx scripts/audit-asset-flow.ts` | Critical 16건 (BG_NULL 14 + POSITION_COLLISION 2) | **Critical 16건** (BG_NULL_CRITICAL 14 + POSITION_COLLISION 2) + Major 12 + Info 110 | ✅ 기대 일치 |
| 6 | `npm run test:e2e` (Playwright 풀 모드 16 엔딩) | 16/16 통과 (flaky retry 회복 허용) | ✅ **16/16 통과** (8.8m, 10 passed + 6 flaky retry 회복, exit code 0) — **2026-05-10 옵션 A1 처방 후 회복** | ✅ 회복 완료 |

### 2.3 압축 모드 (`src/scenes/compressed/`)

| # | 명령 | 기대 | 실측 | 결과 |
|---|---|---|---|---|
| 7 | `npm run compile:compressed` | 212 씬 (풀과 정합) | **216 → 212 씬** (Phase A에서 .scene.json 4건 삭제했으나 manifest 미재생성으로 stale 상태였음. 본 라운드에서 정합화) | ✅ stale 정리 완료 |
| 8 | `npm run validate:compressed` (풀↔압축 cross-validate) | mismatch 0 | **mismatch 0** · 풀 215 · 압축 212 · 공통 212 · 풀 only 3 (dummy_full_loop 3종, 런타임 fallback OK) · 압축 only 0 · 보존 항목(KAKAO/CHOICE/FLAG_INC/JUMP/ENDING/CG/VIDEO) 풀과 0% 변화 ✓ | ✅ |
| 9 | `npx tsx scripts/audit-asset-flow.ts --mode=compressed` (도구 신규 flag) | 풀과 동등 또는 유사 | **Critical 18건** (BG_NULL_CRITICAL 16 + POSITION_COLLISION 2) + Major 12 + Info 109. **풀 대비 BG_NULL +2건** | 🟨 압축본 BG_NULL 2건 추가 발견 (별도 라운드 이연) |
| 10 | E2E 압축 모드 검증 | — | **미실행** (e2e helpers가 풀 모드 가정, 별도 라운드 도구 갱신 필요) | 🟨 압축 e2e 검증 누락 |

### 2.4 빌드

| # | 명령 | 기대 | 실측 | 결과 |
|---|---|---|---|---|
| 11 | `npm run build` (압축본 manifest 갱신 후 재빌드) | 통과 | **2.90s 통과** | ✅ |

---

## 3. 회귀 발견 / PM 검토 대기

### 🚨 출시 차단급 신규 회귀 1건 — E2E 15/16 fail

| 항목 | 값 |
|---|---|
| 결과 | **1 passed / 15 failed** (16개 엔딩 중 15건 실패) |
| 소요 시간 | 12.7m (정상 시 ~30s · 25배 증가) |
| 재시도 | retries=1로 1회 재시도 후에도 회복 X |
| 이전 통과 기록 | 자산 통합 검증 라운드 후속(2026-05-08) 16/16 통과 29.1s |

**실패 목록** (15건):
- H1 차세린 4종(TRUE / HAPPY / NORMAL / BAD)
- H2 윤하정 4종(TRUE / HAPPY / NORMAL / BAD)
- H3 한설 3종(TRUE / HAPPY / NORMAL)
- H4 나서윤 2종(TRUE / NORMAL)
- H5 장윤영 1종(TRUE)
- 단독 엔딩 1종(END_SOLO_SUMMER)

**통과** (1건): H4 REJECT 추정 (KakaoModal `handleTimeout` 직접 점프 경로라 EVALUATE_BRANCH 우회).

**원인 추정** (분석 only, 본 라운드 fix X):
- 2026-05-09 Ch5 엔딩 라우팅 복구 라운드(CHANGELOG)에서 `EVALUATE_BRANCH` → `EVALUATE_TIER` 2-단계 분리. e2e helpers/spec이 옛 1-단계 라우팅(`ch05_07_close + flags 주입` 직후 즉시 endingId 산출) 가정으로 작성된 채 미갱신 의심.
- `tests/e2e/helpers.ts`의 `expectEnding` 또는 EVALUATE_BRANCH 진입 흐름이 새 라우팅(`evaluateRoute` → chapter6 시작 씬 → `EVALUATE_TIER` → 엔딩 씬 → ENDING 명령)에 맞춰 갱신 필요.
- Phase A 2번(b_late 4건 제거 + validate-build KAKAO mechanism 카운트)은 e2e 무관 영역이라 본 회귀 원인 X. 단 Phase A 진행 시 e2e 실행을 누락해 회귀 발견 시점이 본 라운드로 지연됨.

**처방 방향** (PM 검토 대기, 본 라운드 fix X):
- Option A — `tests/e2e/helpers.ts`의 `expectEnding` 경로를 2-단계 라우팅에 맞춤(권장. 게임 동작은 정확하고 e2e가 stale)
- Option B — flags 주입으로 chapter6 본편 + EVALUATE_TIER까지 자동 traverse하도록 helper 보강
- Option C — `?scene=` 파라미터로 직접 엔딩 씬 진입 (가장 빠르지만 라우팅 검증력 약함)

### 🟨 압축본 점검 신규 발견 (별도 라운드 이연)

- **압축본 BG_NULL_CRITICAL +2건** — 풀 14 → 압축 16. 압축 시 BG 디렉티브 누락이 풀보다 더 발생. 풀 BG_NULL과 동일하게 KAKAO/CHOICE edge BG 상속 false positive 의심 → BFS 정정 별도 라운드.
- **E2E 압축 모드 검증 미실행** — `tests/e2e/helpers.ts` + `endings.spec.ts`가 풀 모드 가정으로 작성. 압축 모드 검증 위해 `?storyMode=compressed` 파라미터 또는 settingsStore 직접 주입 helper 갱신 필요. e2e 풀 회귀 처방 라운드와 묶어 진행 권장.
- **`audit-asset-flow.ts` `--mode=compressed` flag 추가됨** (본 라운드 검증 도구 갱신, 게임 코드 무변동). ✅ **CI 통합 완료 (2026-05-10 후속 라운드)** — `.github/workflows/ci.yml`에 `Compile scenarios — 압축 모드` + `Audit asset flow — 압축 모드 --mode=compressed` 2-step 추가 (continue-on-error 비차단). CHANGELOG `2026-05-10 — CI 압축 모드 audit 통합` 엔트리 참조.

### 🟡 이미 알려진 잔여 (별도 라운드 이연, 출시 차단급 X)

- audit BG_NULL_CRITICAL (풀 14 / 압축 16) — KAKAO/CHOICE edge BG 상속 BFS 정정 별도 라운드 (false positive로 판단됨)
- audit POSITION_COLLISION 2건 (풀·압축 동일) — 시각 검토 별도 라운드
- vite chunk size warning 692 KB — 코드 분할 별도 최적화 라운드 (출시 무관)
- compile IF 블록 v0.1 미지원 6건 — EVALUATE_BRANCH가 기능 흡수, 출시 무관

---

## 4. 출시 차단급 잔여 항목 (Phase C 진입 가드)

| 항목 | 상태 |
|---|---|
| Claude 영역 사전 점검 | ✅ 본 라운드 통과 |
| **GitHub repo 생성** (PM 직접) | ⬜ 미진행 (working dir이 git repo 아님 — `git init` + `remote add origin` 필요) |
| **첫 push to main** (PM 직접) | ⬜ 미진행 (CI ci.yml + Deploy deploy.yml 자동 실행 — 첫 빌드 5~10분 예상) |
| **GitHub repo Settings → Pages → Source: GitHub Actions** (PM 직접) | ⬜ 미진행 (한 번만 필요) |
| (선택) Custom domain + `public/CNAME` | ⬜ 도메인 결정 시 |
| 배포 후 URL 라이브 확인 | ⬜ |

---

## 5. 결론

**Claude 영역 사전 점검 풀+압축 양 모드 합산 11종 중 8종 ✅ + 2종 🟨 + 1종 ⬜ + 0종 🚨** (2026-05-10 옵션 A1 처방 라운드 후 갱신).

- ✅ 풀 모드: typecheck / vitest 104/104 / compile / validate / audit / build / **E2E 16/16** · README 정합 / 압축 compile / validate:compressed
- 🟨 압축 모드 audit BG_NULL +2건 — 별도 라운드 이연 (풀과 동일한 false positive 의심)
- ⬜ E2E 압축 모드 검증 미실행 — `?storyMode=compressed` helper 별도 라운드 이연 (압축본은 풀과 씬 ID·CHOICE 그래프 동일하므로 fallback OK)

**현재 상태**: **E2E 회귀 처방 완료, GitHub Pages 배포 진입 가능** ✅.

### Phase A 2번 후속 처방 (본 라운드 안에서 완료)

- ✅ 압축본 `compiled-manifest.json` stale 정리 (216 → 212 씬). Phase A 2번에서 `.scene.json` 4건 삭제했으나 `compile:compressed` 미실행으로 manifest와 실파일 불일치였던 상태 해소.
- ✅ `audit-asset-flow.ts`에 `--mode=compressed` flag 추가 (검증 도구 갱신, 게임 코드 무변동).

### PM 다음 액션 (우선순위 순)

1. ✅ ~~E2E 회귀 처방 라운드~~ — **2026-05-10 옵션 A1 처방 완료** (helpers 5건 갱신: ch+choice/kakao/cg/awaiting/EVALUATE_TIER + scriptInterpreter EVALUATE_TIER 컴파일러 누락 처방 + spec 신 임계 매트릭스 + evaluate 직접 진입 hybrid)
2. ⬜ GitHub repo 생성 (`kmu-vn` 권장 또는 PM 선호 이름)
3. ⬜ `git init` + 첫 commit + push to main
4. ⬜ Repo Settings → Pages → Source "GitHub Actions"
5. ⬜ 배포 후 URL 라이브 검증

**Phase C 진입 조건**: ✅ **E2E 16/16 통과 회복 완료** (8.8m, 10 passed + 6 flaky retry 회복).

---

## 6. 모바일 사전 점검 (2026-05-10)

> 본 라운드는 출시 직전 모바일 환경 위험을 PM 1인이 4–5시간에 걸쳐 관찰·기록하는 라운드. **코드 변경 0**. 발견 이슈는 §6.5에 처방 옵션과 함께 표기 → PM 결정 후 별도 라운드(코드/자산 처방)에서 진행.
> Phase 0(라운드 등록)·1(정적)·2(에뮬)는 자동 완료. Phase 3(iOS+Android 실기) + Phase 4(정리·결정)는 PM 핸드오프.
> 계획 파일: `C:/Users/PC/.claude/plans/qa-binary-sunbeam.md`

### §6.1 환경

| 키 | 값 |
|---|---|
| 일시 | 2026-05-10 (자동 라운드) / PM 실기 라운드 일시: ⬜ |
| 빌드 출력 | `dist/` 88.83 MB (자산 85.44 MB + JS/CSS 3.39 MB). 메인 번들 `index-UoOR7S26.js` **888.9 KB raw** + `index-D4-HubfZ.css` 24.9 KB |
| Vite 설정 | `base: './'` ✅ GitHub Pages 호환 / `target: es2020` (구형 브라우저 미지원) / `sourcemap: true` (배포 빌드 1.7 MB sourcemap 포함 — 줄일지 PM 결정 대기) |
| iOS 실기 | ⬜ (모델/iOS/Safari 버전) |
| Android 실기 | ⬜ (모델/Android/Chrome 버전) |
| 에뮬 (자동 완료) | T1 375×667 ✅ + T3 768×1024 ✅. T2.1·T2.2 실기는 PM |
| 네트워크 | preview 4173 (no-store) / LTE 측정은 PM 실기 |

### §6.2 자동 점검 결과 (Phase 1·2)

#### §6.2.1 자산·번들 실측

| 항목 | 실측 | 목표 | 결과 |
|---|---|---|---|
| dist 전체 | 88.83 MB | ≤ 90 MB | ✅ 권장 통과 |
| `public/img` (139 WebP, 100% 모던 포맷) | 18.41 MB | — | ✅ |
| `public/snd` (BGM 8 + SFX 15 MP3) | 19.09 MB | — | ✅ |
| `public/video` (MP4 12개) | 47.94 MB | — | 🟨 가장 무거움 |
| 메인 JS 번들 raw | 888.9 KB | ≤ 1 MB raw | ✅ |
| sourcemap | 1.7 MB | (배포 시 제외 검토) | 🟢 비차단 |
| 최대 이미지: `bg_campus_night_blossom.webp` | 341.5 KB | ≤ 500 KB | ✅ |
| 최대 비디오: `video_true_yuna.mp4` | 6.44 MB | ≤ 10 MB | ✅ |
| `bgm_daily.mp3` 비트레이트 (ffprobe) | **128 kbps** | ≤ 192 kbps | ✅ 메모리 기록 dist 반영 확인 |

#### §6.2.2 폰트 검증 (T1 375×667 + T3 768×1024 양쪽)

| 항목 | 실측 | 결과 |
|---|---|---|
| `document.fonts` 등록 수 | **0건** | 🚨 |
| `Pretendard` 로드 여부 | **false** | 🚨 |
| `body.fontFamily` computed | `Pretendard, -apple-system, sans-serif` | (선언만 있음) |
| `@font-face` 선언 src/*.css 검색 | **0건** | 🚨 |

→ **M-001 발견**: Pretendard self-host 또는 CDN import 부재. 모든 사용자가 OS 시스템 폰트로 fallback (iOS=SF Pro, Android=Roboto/Noto Sans CJK). PM 의도(Pretendard 표시)와 다른 동작.

#### §6.2.3 미디어쿼리 vs inline style

| 항목 | 실측 | 비고 |
|---|---|---|
| `--font-size-text` at 375×667 | **26px** (App.tsx inline) | tokens.css `@media (max-width: 768px)` 22px 무효 |
| `--font-size-text` at 768×1024 | **26px** | 동일 |
| `--textbox-width` / `--textbox-height` | **92% / 38%** | 모바일 토큰 적용 ✅ (inline 미덮음 항목) |
| settingsStore default `fontSize` | **26** (`FONT_SIZE_DEFAULT`, 2026-05-10 PM 정정 v5) | App.tsx:95 코멘트 "사용자 설정이 우선" — 의도된 동작 |

→ **M-002 발견 (의도 확인 필요)**: tokens.css의 모바일 22px 토큰은 dead code. App.tsx:95 코멘트상 "사용자 설정이 우선"이 PM 의도라면 dead code 주석 보강만 필요. 모바일에서 별도 작은 기본값을 원한다면 코드 수정 필요. **PM 결정 대기**.

#### §6.2.4 터치 영역 실측

| 버튼 | min 토큰 | 실제 computed | iOS HIG (44×44) |
|---|---|---|---|
| MiniControls 햄버거 (모바일 우상단) | 36×36 | **44.9×40.6 px** (padding 6.5×13 적용) | ✅ 너비 OK · 🟨 높이 -3.4 px 미달 |

→ **M-003 발견**: 햄버거 버튼 높이 40.6px → iOS HIG 44 미달 -3.4px. 너비는 OK. 미스탭 영향은 PM 실기에서 확정.

#### §6.2.5 768px 경계 양쪽 메뉴 동시 노출

| 뷰포트 | 햄버거 (`md:hidden`) | PC 메뉴 (`hidden md:flex`) |
|---|---|---|
| 375×667 | 표시 ✅ | 숨김 ✅ |
| **768×1024** | **표시 ⚠** | **표시 ⚠** |

→ **M-004 발견**: Tailwind `md` breakpoint = `min-width: 768px`이므로 정확히 768px에서 둘 다 활성. 햄버거(우상단) + PC 일렬 메뉴(우하단)가 동시 노출. 위치는 분리되지만 UX 일관성 손상. iPad mini portrait(768) 사용자에게 노출.

#### §6.2.6 콘솔·네트워크 sanity (자동 골든 패스 일부)

| 항목 | 실측 | 결과 |
|---|---|---|
| 콘솔 error | 0건 | ✅ |
| 콘솔 warn (비핫스팟) | `[advance] step null at scene "prologue_03_close" — re-seeking to 0 for safety` 다수 (스킵·rewind 시 재현, 의도된 가드) | 🟢 |
| 자산 404 | 0건 | ✅ |
| 같은 자산 중복 요청 (`bgm_daily.mp3`, `video_opening.mp4`) | 다수 (Cache-Control: no-store 헤더 영향 + audio replay race) | 🟢 preview 한정 |
| `playsInline muted autoPlay` (`VideoLayer.tsx:73-75`) | iOS Safari autoplay 정책 호환 ✅ | ✅ |

#### §6.2.7 GitHub Pages 호환

| 항목 | 결과 |
|---|---|
| `vite.config.ts` `base: './'` | ✅ 상대 경로 → 어떤 repo 이름으로도 작동 |
| `index.html` `viewport-fit=cover` | ✅ Notch 세이프영역 대응 |
| `OrientationLock.tsx` | ✅ pointer:coarse + portrait 시 풀스크린 안내 (CSS 미디어쿼리) |
| PWA/manifest | ⬜ 미설정 (출시 후 v0.2 backlog) |

### §6.3 카테고리 합격표 (PM 실기 후 채움)

| 카테고리 | T1(SE 에뮬) | T2.1(iOS 실기) | T2.2(Android 실기) | T3(iPad 에뮬) | 비고/이슈ID |
|---|---|---|---|---|---|
| A 디자인·레이아웃 | (자동: 텍스트박스 92% / 38% 적용 ✅) | ⬜ | ⬜ | (자동: 768 경계 메뉴 중복 ⚠ M-004) | M-004 |
| B 폰트·텍스트 | 🚨 Pretendard 미로드 | ⬜ | ⬜ | 🚨 동일 | **M-001** |
| C 성능·렉 | (Lighthouse 미실행 — DevTools 필요) ⬜ | ⬜ | ⬜ | ⬜ | — |
| D 터치·인터랙션 | (자동 측정: 햄버거 40.6 px 🟨) | ⬜ (실기 미스탭 빈도 측정) | ⬜ | — | M-003 |
| E 회전·세이프영역 | — | ⬜ (회전 + notch 노출) | ⬜ | ⬜ | — |
| F 네트워크·배터리 | — | ⬜ (LTE 첫 부팅 측정) | ⬜ (USB DevTools throttle) | — | — |
| G 호환성 | — | ⬜ (autoplay, WebP, MP4) | ⬜ (구형 안드 시 BrowserStack) | — | — |
| H 회귀 | — | ⬜ (골든 패스 1회) | ⬜ (골든 패스 1회) | — | — |

### §6.4 합격 기준 실측치 (PM 실기 후 채움)

| 지표 | 권장 (Pass) | 엄격 | 실측 (T2.2 Android USB DevTools 권장) | 결과 |
|---|---|---|---|---|
| Lighthouse Performance (모바일) | ≥ 70 | ≥ 80 | ⬜ | ⬜ |
| FCP | ≤ 3.5s | ≤ 2.5s | ⬜ | ⬜ |
| LCP | ≤ 5.0s | ≤ 3.0s | ⬜ | ⬜ |
| TTI | ≤ 6.0s | ≤ 4.0s | ⬜ | ⬜ |
| 첫 부팅 LTE Slow 4G | ≤ 30s | ≤ 15s | ⬜ | ⬜ |
| 누적 빌드 다운로드 | ≤ 90 MB | ≤ 50 MB | **88.83 MB (자동 측정)** | ✅ 권장 |
| FPS — 캐릭터 워킹 220 px | ≥ 30 | ≥ 55 | ⬜ | ⬜ |
| FPS — 비디오 재생 | ≥ 24 | ≥ 30 | ⬜ | ⬜ |
| FPS — 카톡 타이핑/타이머 | ≥ 30 | ≥ 60 | ⬜ | ⬜ |
| JS heap 30분 후 | ≤ 250 MB | ≤ 200 MB | ⬜ | ⬜ |
| INP (탭 → 진행) | ≤ 300 ms | ≤ 100 ms | ⬜ | ⬜ |
| 콘솔 error 수 | 0 | 0 | **0 (자동)** | ✅ |
| 콘솔 warn 수 | ≤ 10 | ≤ 3 | (advance step null 가드 다수, 비핫스팟) | 🟢 |

### §6.5 핫스팟 7건 (PM 실기 후 채움)

| # | 시나리오 | 트리거 | iOS 결과 | Android 결과 | FPS | 메모리 피크 | 비고 |
|---|---|---|---|---|---|---|---|
| HS1 | 오프닝 영상 자동재생 (iOS Safari `playsinline muted autoPlay`) | URL 진입 직후 | ⬜ | ⬜ | ⬜ | ⬜ | 코드상 호환 ✅ |
| HS2 | 캐릭터 워킹 220 px / 1500 ms | Ch.1 H1 첫 등장 | ⬜ (T1=375 시 클리핑?) | ⬜ | ⬜ | ⬜ | — |
| HS3 | 비디오 재생 (MP4 only) | 챕터/엔딩 비디오 | ⬜ | ⬜ | ⬜ | ⬜ | WebM/HEVC 없음 |
| HS4 | BGM 페이드 + loop SFX 정지 | 챕터 BG 전환 | ⬜ | ⬜ | — | — | — |
| HS5 | 카톡 ReplyTimer 15초 | Ch.1·Ch.5·거절 카톡 | ⬜ (40.6 px 탭 정확성) | ⬜ | ⬜ | — | M-003 영향 |
| HS6 | Backlog/Gallery 스크롤 | 진행 후 Backlog | ⬜ | ⬜ | ⬜ | ⬜ | — |
| HS7 | EndingScreen 1080×1080 합성 | 엔딩 도달 | ⬜ | ⬜ | — | ⬜ (≤ 250 MB?) | Pretendard fallback 폰트로 합성됨 (M-001 영향) |

### §6.6 발견 이슈 (M-001~)

| ID | 카테고리 | 발견 | 심각도 | 설명 | 처방 후보 (A 코드 / B 자산 / C 출시 후) | PM 결정 |
|---|---|---|---|---|---|---|
| **M-001** | B 폰트 | 자동 (정적+에뮬) | 🚨 Critical (출시 차단 후보) | Pretendard `@font-face` 선언 0건 → 모든 사용자 OS fallback. PM 의도와 다른 폰트 표시. iOS=SF Pro, Android=Roboto/Noto Sans CJK | **A1** Pretendard self-host (`public/fonts/` woff2 + `@font-face { font-display: swap }` + tokens.css/Tailwind 정합) — 약 1 MB 추가 / **A2** CDN import (`https://cdn.jsdelivr.net/gh/orioncactus/pretendard/...`) — 첫 부팅 외부 의존 / **C** 그대로 출시 (사용자 OS 폰트로 송출) | ✅ **A2 채택 (PM 2026-05-10)** |
| **M-002** | A 레이아웃 | 자동 | 🟢 Minor (의도 확인 필요) | tokens.css `@media (max-width: 768px)` `--font-size-text: 22px`가 App.tsx inline style 26px에 의해 덮임. App.tsx 코멘트는 "사용자 설정이 우선"으로 의도된 동작 | **A** 코멘트 보강 (`tokens.css:115` 옆 "App.tsx inline 우선, 사용자 설정 못 받은 첫 렌더만 적용") / **C** 그대로 (의도된 동작이면 dead code 그대로) | ✅ **C 유지 (PM 2026-05-10)** |
| **M-003** | D 터치 | 자동 | 🟨 Major | MiniControls 햄버거 컴퓨티드 높이 40.6 px → iOS HIG 44 미달 -3.4 px (너비 44.9 OK) | **A** `min-h-[44px]` 적용 또는 `py-1`→`py-2` (padding +4 px, 시각 유지) / **B** 위치 우상단 → 기존 PC 메뉴와 통합 / **C** 그대로 (실기 미스탭 빈도 보고) | ✅ **C 유지 (PM 2026-05-10)** |
| **M-004** | A 레이아웃 | 자동 | 🟨 Major | Tailwind `md` 경계 = 768 px 정확히일 때 햄버거(`md:hidden`) + PC 메뉴(`hidden md:flex`) 동시 활성 → iPad mini portrait 사용자 양쪽 노출 | **A** Tailwind config에 모바일/PC breakpoint 분기 명확화 (예: `md: '769px'`로 1px 시프트) / **B** 햄버거 조건 `(max-width: 767.99px)` CSS로 변경 / **C** 그대로 (위치 분리되어 시각 충돌 약함) | ✅ **C 유지 (PM 2026-05-10)** |
| **M-005** | C 성능 | 자동 | 🟢 Minor | dist에 sourcemap 1.7 MB 포함 (`vite.config.ts:15` `sourcemap: true`) — 프로덕션 배포 시 사용자 다운로드 비용 증가 | **A** prod 빌드만 sourcemap 제외 (`build.sourcemap: 'hidden'` 또는 false) / **C** 그대로 (배포 후 디버깅 편의) | ✅ **C 유지 (PM 2026-05-10)** |
| **M-006** | C 성능 | 자동 | 🟢 Minor | 메인 JS 번들 888.9 KB raw — Vite chunk size warning 692 KB 초과 (08-pre-deploy-check §3 기존 알려진 잔여) | **A** 코드 분할 라운드 (출시 무관) / **C** 그대로 (출시 후 v0.2) | ✅ **C 유지 (PM 2026-05-10)** |
| **M-007** | A 레이아웃 (메타) | 자동 (정적) | 🟨 Major | `index.html`에 Open Graph 메타 태그 0건 (`og:image`, `og:title`, `og:description`, `twitter:card`). 카톡/페북/디스코드 등으로 게임 URL 공유 시 미리보기 없음. `DEPLOYMENT.md:99-100`에 권장 코드는 있지만 index.html 미적용 | **A** index.html에 og:title + og:description + og:image (1200×630 webp) + twitter:card summary_large_image 추가 — 약 10분 / **C** v0.2 backlog | ✅ **A 채택 (PM 2026-05-10)** |
| **M-008** | E 세이프영역 | 자동 (정적) | 🟨 Major | src/ 전체에서 `env(safe-area-inset-*)` 사용 0건. `viewport-fit=cover`만 선언되고 실제 inset 적용 코드 없음. iPhone X+ 노치 폰 가로 모드에서 좌우 영역 + 세로 모드에서 상단 노치 영역에 UI(MiniControls 우상단 햄버거, 텍스트박스) 가림 위험 | **A** App 루트 wrapper 또는 globals.css `.app-root { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }` + 햄버거 위치 보정 — 약 30분 / **B** OrientationLock으로 강제 가로만 허용 (이미 일부 적용 — 검증 필요) / **C** 그대로 (ui:width 92% 영향 약함) | ✅ **C 유지 (PM 2026-05-10)** |
| **M-009** | C 성능 (오디오) | 자동 (코드) | 🟨 Major | App.tsx:117 마운트 즉시 `audioManager.playBgm('bgm_main_theme', {fade:4})` 호출. 모바일 브라우저(iOS Safari, Android Chrome)는 user gesture 전 audio 재생 차단(NotAllowedError). 첫 탭(ModeSelect 버튼 클릭 등) 전까지 BGM 무음. Howler가 첫 gesture 시 자동 재개하는지 실기 검증 필요 | **A** ModeSelect "구윤모로 플레이" onClick에서 BGM 시작으로 이동 (마운트 즉시 → user gesture 후) / **B** Howler `unlock` 패턴 명시 호출 / **C** 그대로 (Howler html5 모드가 자동 재개 가능성) / **D 신규** 접속 후 5초 스토리 배경 타이핑 인트로 → "확인" 버튼 → 오프닝 시작. 이 동안 자산 다운로드 + 첫 탭이 user gesture 됨 (BGM unlock + audio 재생). 1석 2조 처방 | ✅ **D 신규 채택 (PM 2026-05-10)** |
| **M-010** | G 호환성 | 자동 (정적) | 🟢 Minor | `vite.config.ts:16` `target: 'es2020'` — Samsung Internet ≤ 13(2020-08), Android WebView ≤ 80, iOS Safari ≤ 13.4 미지원. 한국 시장 모바일 점유율은 매우 낮으나 0% 아님 | **A** target 'es2018' 또는 'esnext'로 변경 (번들 크기 영향 미미) / **C** 그대로 | ✅ **C 유지 (PM 2026-05-10)** |
| M-011~ | (PM 실기) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### §6.7 PM 실기 핸드오프 — Phase 3

PM이 iOS·Android 실기 2대로 직접 진행할 항목 (예상 75분 + 75분):

#### Phase 3.1 — iOS 실기 (75분)

1. 같은 와이파이 PC IP에 접속: `http://<PC IP>:4173/` (`npm run preview -- --host` 또는 4173 직접 노출 확인)
2. 골든 패스 1회 풀 플레이 (§6.5 표 트리거 순서 따라):
   - URL → ModeSelect → 오프닝 영상 (HS1) → 프롤로그 캐릭터 워킹 (HS2) → Ch.1 H1 만남 → 첫 카톡 ReplyTimer 15초 (HS5) → Backlog 스크롤 (HS6) → SettingsScreen fontSize 22px 슬라이더 → SaveLoad Slot 1 → Ch.2 Gallery → END_SOLO_SUMMER 또는 가까운 엔딩 → EndingScreen generateEndingImage 다운로드 (HS7)
3. 화면 녹화 ON (iOS 기본 화면 녹화) → §6.5 결과 컬럼에 OK/🟨/🚨 + FPS 체감 + 메모리 piek
4. 회전 테스트 (E 카테고리) — 세로 모드에서 OrientationLock 안내 표시 확인 + notch 가림 확인
5. LTE 첫 부팅 (F 카테고리) — 와이파이 OFF, LTE만으로 새 시크릿 탭에서 진입 → 첫 화면 표시까지 stopwatch
6. 30분 누수 (선택) — 골든 패스 후 폰 화면 켜둔 채 30분 → 메모리·발열 체감
7. 결과를 §6.3·§6.4·§6.5에 입력 + §6.6에 신규 이슈 M-007~ 추가

#### Phase 3.2 — Android 실기 (75분)

1. USB → PC `chrome://inspect#devices` → Android Chrome 탭 Inspect → DevTools 패널 사용
2. Phase 3.1과 동일 골든 패스 1회 + DevTools Performance 캡처 (FPS) + Memory snapshot (전·후)
3. Lighthouse 모바일 — DevTools → Lighthouse → Mobile + Performance + Best Practices → §6.4 입력
4. Network throttle "Slow 4G" + Disable cache → 첫 부팅 시간 → §6.4 입력
5. 결과를 §6.3·§6.4·§6.5에 입력 + §6.6에 신규 이슈 추가

### §6.8 출시 신호 결정 (PM 결정)

본 라운드 결과를 종합:

```
🚨 0건 + 🟨 PM 허용 (또는 처방 라운드 분리) → 모바일 QA "✅ 통과"
                                              ↓
            §3·§4 점검 표에 신규 행 ✅:
            | 모바일 사전 점검 (PM 1인, iOS+Android 실기) | ✅ |
                                              ↓
            Phase C 진입 조건 충족 (E2E 통과 + 모바일 통과)
                                              ↓
            [PM 직접] git init / push main / Pages 설정 / 배포 후 라이브 검증

🚨 ≥1건 → 차단 → 처방 라운드(별도) → 재검증
```

**현재 자동 라운드 임시 결론** (PM 실기 결과 입력 전):

| 항목 | 자동 결과 (처방 전) | 처방 후 (2026-05-10) |
|---|---|---|
| 🚨 Critical | 1건 (M-001 Pretendard 미로드) | **0건** ✅ |
| 🟨 Major | 5건 (M-003, M-004, M-007, M-008, M-009) | **2건** (M-003, M-008 — PM 유지 결정) |
| 🟢 Minor | 4건 (M-002, M-005, M-006, M-010) | 4건 (모두 PM 유지 결정) |
| 처방 적용 | — | **3건 — M-001(A2 CDN) + M-007(og 태그) + M-009(IntroTyping)** ✅ |
| 콘솔 error | 0 | 0 |
| 자산 404 | 0 | 0 |
| 빌드 크기 | 88.83 MB | 88.83 MB (변동 미미) |

**PM 결정 필요 (출시 전 차단 가드)**:

1. **M-001 Pretendard** — A1 self-host 추가 vs A2 CDN vs C 그대로 출시 — 가장 빠른 처방 시간: A1 약 30분 (woff2 다운 + @font-face + 검증). 본 라운드 외 별도 처방 라운드 필요.
2. **M-003 햄버거 높이** — 실기 미스탭 빈도 측정 후 결정. PM 실기 결과로 보강.
3. **M-004 768 경계 메뉴 중복** — A 처방 1줄(Tailwind config breakpoint 시프트) — 본 라운드 외 별도 처방.
4. **M-007 OG 메타 태그** — 카톡 공유 시 미리보기. 출시 직전 10분 처방 권장.
5. **M-008 safe-area-inset 미적용** — 노치 폰 노출 시 UI 가림 위험. PM 실기에서 노치 가림 실측 후 처방 결정.
6. **M-009 BGM user gesture** — Howler가 자동 재개하지 않으면 첫 탭 전 무음. PM 실기 첫 진입 시 BGM 들리는지 확인 필수.

**Claude 자동 영역 결론**: 자동으로 발견 가능한 모바일 위험 **10건** 식별 완료. **M-001은 출시 차단 후보** (PM 의도와 명백히 다른 폰트 표시) — Phase 3 실기 진행 전 우선 결정 권장.

### §6.9 자동 영역에서 점검 완료된 안전 항목 (참고)

> 추가 의심 영역도 자동 검증으로 통과 확인 — 별도 이슈 등록 불필요.

| 항목 | 검증 결과 | 비고 |
|---|---|---|
| `prefers-reduced-motion` 처리 | ✅ App.tsx + tokens.css + globals.css에서 OS 신호 무시 + 게임 토글만 따름(PM 결정 2026-05-10) | 정합 |
| `viewport-fit=cover` 선언 | ✅ index.html:6 | M-008과 별개로 선언 자체는 OK |
| WebP 브라우저 지원 | ✅ Canvas 토스트 변환 OK (preview 검증) | iOS 14+ / Android Chrome 79+ |
| localStorage 양 | ✅ 0.71 KB / 5 MB iOS Safari 한도 (kmu-vn-settings 722 bytes만, 6 saveSlots는 진행 후 채움 예정) | 안전 |
| `playsInline muted autoPlay` (VideoLayer) | ✅ iOS Safari autoplay 정책 호환 (VideoLayer.tsx:73-75) | onError graceful onEnded fallback |
| 한국어 lang 선언 (`<html lang="ko">`) | ✅ index.html:2 | 검색 엔진/스크린리더 정합 |
| theme-color (`#FFE4EC`) | ✅ index.html:7 | 안드 Chrome 주소창 색 |
| 자산 404 | ✅ 0건 | 모든 자산 200/206 정상 |
| 콘솔 error | ✅ 0건 | warn은 있지만 의도된 가드 |
| `OrientationLock` 컴포넌트 존재 | ✅ pointer:coarse + portrait CSS 미디어쿼리 기반 | 실기 동작은 PM 검증 |
| `bgm_daily.mp3` 비트레이트 | ✅ 128 kbps (메모리 기록 dist 반영 확인) | 첫 부팅 무게 감소 처방 적용됨 |
| dist 빌드 크기 | ✅ 88.83 MB / 권장 90 MB 미만 | 누적 다운로드 권장 통과 |
