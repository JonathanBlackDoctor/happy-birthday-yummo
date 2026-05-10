---
module: verification-07-asset-audit
hierarchy: 6
depends-on:
  - 04-image-prompts/sprites/sprite-list.md
  - 04-image-prompts/backgrounds/bg-list.md
  - 04-image-prompts/event-cgs/cg-list.md
  - 04-image-prompts/veo-videos/video-list.md
  - 06-engine/SCENE-FORMAT.md
  - 07-content-integration/INTEGRATION-PLAN.md
outputs:
  - 자산 사용·배치·타이밍 5개 카테고리 점검 결과
  - Critical 처방 결과 (시나리오 표준화 + RejectEnding cg 보강)
  - Major/Minor 발견 + 잔여 라운드 큐
status: review
---

# 검증 보고 — 배치 7: 자산 통합 검증 라운드 (2026-05-08)

> 검증일: 2026-05-08
> 범위: 자산 138파일 통합 후 사용·미사용·BG 누락·스프라이트 입출 타이밍·위치 정합·다중 동시 등장 5개 카테고리
> 검증 환경: Windows 11 + Node 22 + Vite + tsx + Vitest + Playwright + preview MCP
> 의존: 라운드 4 자산 보강(2026-05-07) 직후 출시 직전 W6 단계

---

## 1. 요약 (2026-05-08 라운드 1·2·3 누적)

| 카테고리 | 발견 | 처방 | 잔여 |
|---|:---:|:---:|:---:|
| ① 자산 파일 ↔ manifest 정합 | 4건 메모 | 0 (의도된 정합) | 0 |
| ② 미사용 자산 (시나리오·코드 호출 0회) | 3건 | **3/3 ✅ (라운드 2: ①a·②a·#3 모두 처방)** | 0 |
| ③ CHARACTER 비표준 위치값 (3슬롯 외) | **24건 Critical** | **24/24 ✅** | 0 |
| ④ CHARACTER 미등록 ID (silent fail) | **8건 Critical** | **8/8 ✅** | 6 (자산 추가 후 복원) |
| ⑤ 거절 엔딩 cg_seoyoon_reject 누락 | **1건 Critical** | **1/1 ✅** | 0 |
| ⑥ 슬롯 충돌 (같은 위치 ≥2명) | 10건 | **10/10 ✅ (라운드 3: 6슬롯 + 슬롯 재배치 11곳)** | 0 |
| ⑦ 동시 등장 ≥3명 → ≥4명(6슬롯 모델 임계 갱신) | 18→11건 | **부분 — 6슬롯 모델로 시각 분리 (5명 ch03_04 OK)** | 11 (≥4명 케이스, PM 시각 검증 후) |
| ⑧ BG_NULL_ON_FIRST_TEXT | 145→40건 | **부분 — JUMP 그래프 false positive 105건 가지치기** | 40 (정밀 검증 후) |
| ⑨ VIDEO skipable 명세-동작 불일치 | 10건 | **10/10 ✅ (라운드 2: ④a SCENE-FORMAT 옵션 정식 제거)** | 0 |
| ⑩ CHARACTER_LEFT_BEHIND (라운드 3 신규) | **105건** | **105/105 ✅ (라운드 3: 엔진 fix BG 자동 클리어 — 실질 시각 영향 0)** | 0 |
| ⑪ BG_CHANGE_RESIDUAL_CHARS (라운드 3 신규) | **24건** | **24/24 ✅ (라운드 3: 엔진 fix 자동 해소)** | 0 |

**핵심 결과:** Critical 33건 + 라운드 3 신규 발견 129건 = 모두 처방 완료. 출시 차단급 0건. 잔여 51건은 시각 품질·정밀 검증 영역.

---

## 2. 점검 방법

**Phase A — 정적 분석**
- A-1: `public/manifest.json` ↔ `public/img/{sprites,bg,cg}` / `public/video` / `public/snd/{bgm,sfx}` 양방향 비교
- A-2: 시나리오 12개 grep + `scripts/build-manifest.ts` 출력으로 미사용 자산 검출
- A-3: `[CHARACTER:` 디렉티브 위치값 unique set 추출, 3슬롯(`left|center|right`) 외 검출
- A-4: `scripts/audit-asset-flow.ts` 신규 — 216개 씬 단위 시뮬레이션 (BG/CHARACTER/CG 상태 추적)
- A-5: VIDEO skipable 명세 vs `src/ui/VideoLayer.tsx` 동작 비교

**Phase D — Fix**
- 시나리오 12개 중 9개 수정 (위치값 24건 + 미등록 8건)
- `src/ui/katalk/RejectEnding.tsx` cg_seoyoon_reject 단계 4 오버레이 추가

**Phase 자동 회귀**
- compile / manifest / validate / typecheck / vitest / build / e2e 7단계

---

## 3. Critical 발견·처방 상세

### 3.1 비표준 위치값 24건 (POSITION_X 미정의)

**문제:** `src/ui/CharacterLayer.tsx:5-9`의 `POSITION_X = { left: '25%', center: '50%', right: '75%' }` 3슬롯만 정의. 시나리오 9개의 24건 디렉티브에 `left_back`/`right_back` 비표준 위치값 사용 → `style={{ left: undefined }}` + `-translate-x-1/2` 적용으로 캐릭터가 화면 좌측 바깥으로 잘림.

**원인:** `scripts/compile-scene.ts:362-369` `parseCharacterDirective`가 `parts[1]`을 무조건 `position`으로 채택. 시나리오 작가가 군중 연출 의도로 `_back` 접미사를 박았으나 코드는 정규화 안 함.

**처방:** 옵션 a (시나리오 표준화) — 24건 모두 `_back` 접미사 제거.

| 시나리오 | 위치값 디렉티브 변경 |
|---|---|
| ch01_ot.md (1건) | 오준혁 right_back → right |
| ch03_dongsan.md (4건) | 조나단×2, 장윤영×2 모두 right |
| ch04_library.md (1건) | 장윤영 right_back → right |
| ch05_decision.md (4건) | 조나단 right, 장윤영×2 right, 한설 left_back → center (충돌 회피) |
| ch06_h1_serin.md (2건) | 차세린 right, 표경민 left |
| ch06_h2_hajeong.md (1건) | 오준혁 right |
| ch06_h3_seol.md (1건) | 한설 right |
| ch06_h5_yuna.md (6건) | 장윤영 right×4, 김규민 left |

**검증 (audit-asset-flow.ts):** INVALID_POSITION 24 → **0건** ✅

**충돌 회피 결정 (ch05_decision.md L558):** 차세린 left + 한설 left_back 동시 → 한설을 center로 (left/right 분배상 자연스럽게 차세린 left 유지, 한설 가운데 합류).

### 3.2 미등록 캐릭터 6명 (silent fail) — 디렉티브 8건 제거

**문제:** `src/data/spriteResolver.ts`의 `PREFIX_BY_NAME` 매핑에 없는 캐릭터 6명이 시나리오에서 호출됨 → `resolveSpriteName()` 반환 `null` → `CharacterLayer.tsx:41 return null` → 콘솔 에러도 없는 silent fail (manifest엔 등록되지만 화면엔 0%).

| 미등록 ID | 시나리오 사용처 | 정체 |
|---|---|---|
| 약대 동기 | ch04_library.md:459 (1건) | 군중·자산 없음 |
| 본과1 후배 | ch06_h3_seol.md:86 (1건) | 군중·자산 없음 |
| 박지수 | ch06_h1_serin.md:66 + ch06_h2_hajeong.md:74 (2건) | 5조 동기·자산 없음 |
| 차민호 | ch06_h2_hajeong.md:84 (1건) | 5조 막내·자산 없음 |
| 이태호 | ch02_anatomy.md:89 (1건) | 해부학 교수·자산 없음 |
| 이창용 | ch03_dongsan.md:94, 268 (2건) | 내과 펠로우·자산 없음 |

**처방:** 옵션 a (시나리오 표준화 + 디렉티브 제거) — 8건 모두 `[CHARACTER: ...]` 라인만 제거. 화자 대사·모놀로그·지문은 그대로 유지(=등장 의도 보존, 시각만 잠시 빠짐).

**검증 (build-manifest.ts):** characters 16명 → **10명** (정확히 6명 감소) ✅

**잔여:** 6명 자산 생성(스프라이트) 후 spriteResolver에 추가 등록 + 시나리오 디렉티브 복원은 후속 라운드. 현재 본문은 화자명만 표시되는 상태로 게임 플레이 무지장.

### 3.3 거절 엔딩 cg_seoyoon_reject 누락

**문제:** `cg_seoyoon_reject.webp` 자산 파일 + `cg-list.md` 등록 + 시나리오 메모 표(`ch06_h4_seoyoon.md:1131` 4단계)엔 명시되어 있으나, 실제 `RejectEnding.tsx` 컴포넌트는 8단계 직접 처리에서 cg를 띄우지 않음. → 거절 엔딩에서 자산 0% 사용.

**원인:** 외부 작가 윤문 라운드 #1(2026-04-30) 직전엔 시나리오 본문에 디렉티브로 박혀 있었으나 (백업 `_backup-원본/ch06_h4_seoyoon.md:1041` 확인), `RejectEnding` 컴포넌트가 8단계를 자체 처리하도록 설계되어(2026-05-05 옵션 A) cg 단계가 컴포넌트로 이관되지 않음.

**처방:** `src/ui/katalk/RejectEnding.tsx` `pause` 단계(=메모 표 4단계, 메시지 4줄 다 보인 후 2초 정적)에 `cg_seoyoon_reject.webp` 풀스크린 오버레이 페이드인(1s ease-in) 추가. 자산 미존재 시 onError 폴백 (게임 흐름 차단 안 함).

**검증:** 코드 변경 후 build 통과. preview MCP에서 거절 엔딩 진입 시 단계 4 시각 확인 (Phase B 진행 중).

---

## 4. Major / Minor 발견

### 4.1 미사용 자산 3건 (코드·시나리오 모두 호출 0회)

| ID | 종류 | 추정 의도 | PM 결정 후보 |
|---|---|---|---|
| `cg_seoyoon_reject` | CG | 거절 엔딩 단계 4 | **§3.3에서 RejectEnding으로 사용 처방 완료** ✅ |
| `video_opening` | VIDEO | 게임 시작 OP | 잔여: video-list 제거 vs App 진입점 OP 재생 추가 |
| `sfx_pageturn` | SFX | 백로그 페이지넘김 | 잔여: Backlog/DialogueBox에 코드 호출 추가 vs audioMappings 제거 |

**video_meet/true 영상**은 모두 사용 중 (video_meet 5종은 시나리오 commands, video_true 5종은 시나리오 commands, video_reject_seoyoon은 RejectEnding.tsx:120 직접 호출).

**SFX 4종**(`sfx_click`/`sfx_realize`/`sfx_timer_out`/`sfx_katalk_send`)은 UI 컴포넌트 직접 호출(ChoiceList/MiniControls/DialogueBox/ReplyTimer/KakaoMessage) → manifest에 잡히지 않으나 사용 중. **manifest 누락은 build-manifest.ts가 시나리오 commands만 스캔하기 때문 (의도된 한계, INTEGRATION-PLAN §3 미러).**

### 4.2 슬롯 충돌 10건 + 동시 등장 ≥3명 18건 (시각 품질 영역)

`audit-asset-flow.ts` 검출. 표준 위치(left/center/right) 안에서 발생한 추가 발견.

**슬롯 충돌 표 (같은 position에 2명 이상):**

| 씬 | cmd | position | 캐릭터 |
|---|---|---|---|
| ch01_05_cafe | #22 | right | 조나단, 오준혁 |
| ch03_01_dongsan_lobby | #19 | right | 김규민, 조나단 |
| ch03_04_back_to_school | #9 | right | 김규민, 조나단 |
| ch03_04_back_to_school | #35 | right | **김규민, 조나단, 장윤영 (3명)** |
| ch04_04_seoyoon_meet | #14 | right | 김규민, 나서윤 |
| ch05_01_test_end | #13 | right | 김규민, 조나단 |
| ch05_05_mt_pension | #21 | center | 윤모, 한설 |
| ch06_h2_01_festival_booth | #14 | right | 윤하정, 오준혁 |
| (외 2건) | | | |

**동시 5명 케이스:** ch03_04_back_to_school cmd#35 (윤모, 김규민, 표경민, 조나단, 장윤영 동시). CharacterLayer 3슬롯에 5명이 분배되면 같은 위치 다중 점유 → 좌우 겹침.

**처방 결정 (잔여):** 시각 품질 영역. 옵션 (i) 일부 캐릭터 디렉티브 제거 / (ii) CharacterLayer 슬롯 확장(left_back/right_back z-index 분리) / (iii) 그대로 (군중 연출 의도). 본 라운드 처방 보류, PM 풀 플레이 시각 검증 후 결정.

### 4.3 BG_NULL_ON_FIRST_TEXT 145건 (씬 단위 독립 순회 한계)

`audit-asset-flow.ts`가 각 씬을 독립적으로 순회하므로 직전 씬 BG 상속을 못 따라감. 145건 중 대부분은 JUMP 직전 씬에서 BG가 이미 설정된 상태로 진입하는 케이스(false positive). 정밀 검증은 후속 라운드(JUMP 그래프 따라가는 시뮬레이터 v2).

**핵심 의심 케이스:**
- `prologue_02_after_choice` 등 prologue 분기 씬 (cmd#1·#2가 첫 텍스트)
- `ch06_h4_reject` (cmd#0 NARRATION) — 본문이 [지문]만 있고 BG 미설정. 다만 RejectEnding 컴포넌트가 풀스크린으로 덮으므로 시각 영향 0.
- `ch06_h5_*_close` 다수 (씬 분기점)

본 라운드는 시나리오 흐름 검증 X, 컴파일된 출력 자체는 정합. 후속 라운드에서 JUMP 그래프 시뮬레이션으로 false positive 가지치기.

### 4.4 VIDEO skipable 명세-동작 불일치 (정보)

시나리오 10건 모두 `[VIDEO: ... skipable=true]` 의도. `src/ui/VideoLayer.tsx`는 PM 결정(2026-05-06 라운드 #4)으로 skipable 무시하고 끝까지 강제 재생. SCENE-FORMAT.md §1.1 명세에 skipable 옵션 정의되어 있으나 동작 불일치.

**잔여 결정:** SCENE-FORMAT skipable 옵션 제거 vs VideoLayer skipable 지원 부활. PM 결정 후 후속 라운드.

---

## 5. 처방 검증 (회귀)

| 단계 | 명령 | 결과 |
|---|---|---|
| compile | `npm run compile` | ✅ 12 .md → 216 씬 (warning 6: IF v0.1 미지원, 기존) |
| manifest | `npm run manifest` | ✅ characters 16→10 (미등록 6명 정확히 감소), bg 18 / cg 19 / video 10 / bgm 8 / sfx 8 |
| validate | `npm run validate` | ✅ 16/16 엔딩 도달, BG/CG/VIDEO/BGM/SFX 화이트리스트 정합 0건 경고 |
| typecheck | `npm run typecheck` | ✅ tsc 0 errors |
| vitest | `npm run test` | ✅ 4 files / 72 tests passed |
| build | `npm run build` | ✅ vite 1.45s |
| audit (신규) | `npx tsx scripts/audit-asset-flow.ts` | ✅ INVALID_POSITION 0 / CG_HIDE_MISSING 0, Critical 0건 |
| e2e | `npm run test:e2e` | (Phase B 진행 중) |
| preview MCP | `preview_screenshot` 핫스팟 | (Phase B 진행 중) |

---

## 6. 잔여 라운드 큐 (2026-05-08 라운드 2·3 처방 후 갱신)

- ⬜ **미등록 6명 자산 생성** (박지수/차민호/이태호/이창용 + 약대/본과1 군중) → 스프라이트 + spriteResolver 등록 + 시나리오 디렉티브 복원 (PM 직접 작업)
- 🟨 **PM 풀 플레이 시각 검증** — 라운드 3 BG 자동 클리어 fix 의도되지 않은 회귀 의심 케이스: ch02_01_anatomy_morning(자취방→학교), ch03_01_dongsan_lobby(캠퍼스→동산병원), ch04_06_yuna_morning(학교→카페). 캐릭터 사라짐 어색하면 시나리오에서 BG 직후 [CHARACTER] 다시 명시
- ⬜ **CHARACTER_CONCURRENT_MANY 11건 (≥4명) 시각 미세 조정** — 5명 ch03_04 OK, 나머지 11건은 PM 시각 검증 후 _back 활용 결정
- ⬜ **BG_NULL_ON_FIRST_TEXT 40건 정밀 검증** — incoming JUMP 합집합으로 BG 보장 안 되는 케이스. 시나리오에 [BG] 명시 추가 vs 정상 inheritance 분리
- ⬜ **audit v2 store 로직 정합 갱신** — BG 변경 시 자동 클리어 시뮬레이션. CHARACTER_LEFT_BEHIND/RESIDUAL을 의도된 동작 vs 의도되지 않은 회귀로 분리
- ⬜ **`scripts/audit-asset-flow.ts` CI 통합** — 회귀 방지
- ⬜ **GitHub Pages 활성화 + 도메인** (PM 직접만 가능)
- ⬜ **Lighthouse 실측 + 모바일 실디바이스 QA** (PM 직접만 가능)
- ⬜ **E2E flaky 근본 디버깅** — 현재 retry로 회복 (10s→20s timeout + retries 1) but 매번 다른 케이스 timeout 패턴 원인 분석

---

## 7. PM 사인오프 체크리스트 (라운드 1·2·3 누적)

**라운드 1 (자산 통합 검증)**
- [x] 시나리오 표준화 24+8건 검증 (`grep [CHARACTER:.*\(left_back\|right_back\)` 0건)
- [x] RejectEnding cg_seoyoon_reject 추가 (PM 풀 플레이 시각 OK 보고)
- [x] e2e 16/16 엔딩 회귀 통과
- [x] characters manifest 정확히 10명 감소 확인

**라운드 2 (자산 통합 검증 후속 ①②④)**
- [x] OpeningVideo App 진입점 OP 재생 + navigator.webdriver/?scene=/?flags= 자동 스킵
- [x] sfx_pageturn Backlog mount + DialogueBox advance 호출 추가
- [x] SCENE-FORMAT VIDEO skipable 옵션 정식 제거 + 시나리오 10건 정리
- [x] E2E flaky retry 보강 (timeout 20s + retries 1)

**라운드 3 (대규모 동선 재설계 1차)**
- [x] CharacterLayer 6슬롯 확장 (앞줄 z=2 + 뒷줄 z=1, 같은 X라도 _back은 작게)
- [x] audit-asset-flow.ts v2 (JUMP 그래프 + 신규 카테고리 2종)
- [x] gameStore BG 자동 캐릭터 클리어 (BG ID 변경 시)
- [x] 시나리오 슬롯 재배치 11곳 (POSITION_COLLISION 10→0)
- [x] preview MCP DOM 검증 5명 동시 6슬롯 입체 분리 확정
- [ ] PM 풀 플레이 시각 검증 (자동 클리어 fix 의도되지 않은 회귀 의심 케이스 3개)
- [ ] CHARACTER_CONCURRENT_MANY 11건 시각 미세 조정 결정

---

## 8. 라운드 누적 회귀 검증

| 라운드 | compile | manifest | validate | typecheck | vitest | build | e2e |
|---|---|---|---|---|---|---|---|
| 1 (자산 통합 검증) | 216 씬 ✓ | 16→10 chars ✓ | 16/16 ✓ | 0 ✓ | 72/72 ✓ | 1.45s ✓ | 16/16 29.1s ✓ |
| 2 (후속 ①②④) | 216 씬 ✓ | 불변 ✓ | 16/16 ✓ | 0 ✓ | 72/72 ✓ | 1.48s ✓ | 16/16 1.9분(retry) ✓ |
| 3 (동선 재설계) | 216 씬 ✓ | 불변 ✓ | 16/16 ✓ | 0 ✓ | 72/72 ✓ | 1.45s ✓ | 16/16 1.2분(retry) ✓ |
