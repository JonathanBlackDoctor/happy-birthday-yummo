---
module: verification-05-continuity
hierarchy: 6
depends-on:
  - 08-qa-deployment/verification-reports/00-meta-setup.md
  - 08-qa-deployment/verification-reports/01-macro-consistency.md
  - 08-qa-deployment/verification-reports/02-structure-character.md
  - 08-qa-deployment/verification-reports/03-system-scene.md
  - 08-qa-deployment/verification-reports/04-text-domain-rating.md
outputs:
  - L12 연속성·디테일 검증
  - 6개 배치 종합 보고서 + Critical/Major 우선순위 큐
  - W5/W6 후속 검증 핸드오프
status: done
---

# 검증 보고 — 배치 6: 연속성·디테일 + 6개 배치 종합 (L12 + Final)

> 검증일: 2026-04-30
> 범위: L12 연속성 + 6개 배치 통합 우선순위 큐 + W5/W6 핸드오프
> 의존: 배치 1~5 보고서 — Critical 10 / Major 9 / Minor 12 누계

---

## L12 연속성·디테일

### [Pass] L12.1 시간 마커 + 요일 정합성 ✓

10개 시나리오 본문에 `# Hint: time="..."` 정확 명시. 본문 지문에 날짜+요일+시각까지 표기.

#### 2026 캘린더 요일 정합 검증 (5개 핵심 자리)

| 위치 | 본문 명시 | 산출 (1월 1일 목요일 기준) | 결과 |
|---|---|:---:|:---:|
| ch05_decision:53 | "5월 11일 월요일 오후 5시" | day 130 → Mon | ✓ |
| ch05_decision:323 | "5월 12일 화요일 새벽 1시 30분" | day 131 → Tue | ✓ |
| ch05_decision:437 | "5월 13일 수요일 저녁" | day 132 → Wed | ✓ |
| ch05_decision:518·568 | "5월 16일 토요일 저녁 7시" | day 135 → Sat | ✓ |
| ch05_decision:738 | "5월 17일 일요일 새벽 2시" | day 136 → Sun | ✓ |
| ch06_h1_serin:58 | "6월 1일 월요일 오후 4시" | day 151 → Mon | ✓ |
| ch06_h1_serin:440 | "6월 6일 토요일 저녁 6시 5분" | day 156 → Sat | ✓ |
| ch06_h1_serin:635 (TRUE) | "2026-07-04 morning" | day 184 → Sat | ✓ (STORY-BIBLE §3 정합) |

**8/8 요일 캘린더 정확** ✓.

### [Pass] L12.2 한 챕터 안 시간 흐름 ✓ (Ch.5 모범)

ch05_decision 7개 씬 시간 흐름:
1. Scene 01: 5/11 afternoon (시험 종료 17시)
2. Scene 02: 5/11 evening (회식 1차)
3. Scene 03: 5/12 dawn (새벽 1시 30분)
4. Scene 04: 5/13 evening (자취방 MT 결정)
5. Scene 05: 5/16 evening (가창 펜션 19시)
6. Scene 06: 5/16 night (MT 모닥불)
7. Scene 07: 5/17 dawn (새벽 2시 펜션 한 방)

7일 안 7개 씬 — 시간 흐름 자연. 점프(5/13→5/16) "MT 5월 16일 토요일 ㄱㄱ" 단톡으로 단서 제공 (line 444) ✓.

### [Pass] L12.3 챕터 간 시간 점프 단서 ✓

STORY-BIBLE §3 시간선 마스터 + 각 챕터 첫 씬 `# Hint: time` 명시:
- 프롤로그 (2/25~28) → Ch.1 (3/2~8): 약 1주 점프
- Ch.1 → Ch.2 (3/16~22): 약 1주 점프
- Ch.2 → Ch.3 (4/6~12): 약 2주 점프
- Ch.3 → Ch.4 (4/27~5/3): 약 2주 점프
- Ch.4 → Ch.5 (5/11~17): 약 1주 점프
- Ch.5 → Ch.6 (6/1~7): 약 2주 점프
- Ch.6 → 엔딩 (6/20~7/10): 2~5주 점프

각 점프는 시험·실습·축제 일정으로 자연 정당화. (배치 2 L1.1 회귀)

### [Pass] L12.4 동선 시간 합리성 ✓

- 분당↔동대구 KTX "두 시간" (prologue:116) — 실제 거리감 정합 (배치 5 L7.1)
- 동산병원↔의대 본관↔성서 약대 캠퍼스: STORY-BIBLE §4 line 49~54 명시 자리
- 자취방(성서)↔의대 본관: 도보 가능 거리 (시트 line 26 "의대 인근 자취")

### [Pass] L12.5 한 씬 안 캐릭터 위치 추적 ✓

샘플 검증 (ch05_decision:518):
> "본과 1학년 동기 12명, 의예과 후배 3명(장윤영 포함), 약대 승보와 나서윤. **한설은 늦게 합류 예정**. **차세린은 동산병원 일정 후 합류 가능성**. 펜션 마당에 모닥불 준비 중."

다수 인물 등장 시점에 누가 언제 합류·이탈하는지 명시 ✓.

### [Pass] L12.6 의상·계절·날씨 시그널 풍부 ✓

본문 grep 결과:
- 계절·날씨 (`벚꽃|반팔|패딩|코트|우산|봄볕|새벽|밤바람`): 총 **205건** (10개 시나리오)
  - ch06_h5: 43건 / ch06_h1: 43건 / ch06_h3: 36건 / ch06_h4: 23건 / ch05: 23건
  - 6월 ch06_h1 line 440: "벚꽃은 거의 다 떨어졌고 잎이 푸르러진 가지" — 6월 시기 정합
- 의상·소품 (`캐리어|니트|크롭|스크럽|가운|마스크|미니 가방`): 총 **112건** (11개 시나리오)
  - ch02_anatomy: 16건 (해부 가운·마스크) / ch06_h4: 23건 (약대 가운·미니 가방) / ch06_h1: 22건 (의국 가운·청록 스크럽)

캐릭터 시트 §2 외모 + §10 의상 변형 정합. 시각적 디테일 풍부 ✓.

### L12 발견 사항 — 0건

L12 영역에서 추가 발견 없음. 시간선·요일·동선·의상·소품 모두 정합. **본 게임의 디테일 일관성 우수**.

---

# 6개 배치 종합 보고서

## 누계 카운트

| 우선순위 | 카운트 | 배치별 분포 |
|:---:|:---:|---|
| **Critical** | **10** | 배치 1: 2 / 배치 2: 5 / 배치 3: 1 / 배치 4: 2 / 배치 5: 0 / 배치 6: 0 |
| **Major** | **9** | 배치 1: 2 / 배치 2: 4 / 배치 3: 2 / 배치 4: 1 / 배치 5: 0 / 배치 6: 0 |
| **Minor** | **12** | 배치 1: 3 / 배치 2: 3 / 배치 3: 1 / 배치 4: 3 / 배치 5: 2 / 배치 6: 0 |
| **Nit** | **0** | — |
| **Pass-through** | **50+ 영역** | — |

**총 31건 발견** (Critical 10 + Major 9 + Minor 12).

---

## Critical 우선순위 큐 (즉시 처방 권장 순서)

### 🔴 P0 — PROD blocking (게임 작동 차단)

#### C1. JUMP placeholder 5건 — 챕터 흐름 끊김
- **위치**: prologue:319, ch01:460, ch02:523, ch03:584, ch04:788
- **처방**: 단순 텍스트 교체 5건 (`ch01_ot_first_day` → `ch01_01_ot_intro` 등)
- **영향**: 모든 챕터 간 흐름이 placeholder ID로 끊김. 빌드/실행 시 다음 챕터 진입 불가.
- **출처**: 배치 4 L10.2

### 🔴 P1 — SSoT 정합성 (외부 검증자 신뢰성 직격)

#### C2~C7. MASTER-PLAN frozen 잔재 6건 (배치 1·2)
- **위치**:
  - C2 (Critical): line 20 엔딩 수 "15개 + α" → 16개 (배치 1 L0.1.b)
  - C3 (Critical): line 148 H4 거절 트리거 "호감도 <50 + 지연 ≥3회" → "지연 ≥2 (호감도 무관) OR aff <60" (배치 2 L9.5.a)
  - C4 (Critical): line 137~141 H1~H5 표 (R2 약어 / 영남대 / 장유나) (배치 2 L9.5.b)
  - 배치 1 L0.1.c (Major): line 17 "구윤모와 플레이" 서브 모드 v1.1 이연 미반영
  - 배치 1 L0.1.a (Major): MASTER-PLAN/CONVENTIONS/CHANGELOG/PROGRESS-TRACKER frontmatter 누락
  - 배치 2 L9.5.c (Minor): line 152 거절 4단계 cross-reference 부재
- **처방**: **PM unfreeze 라운드 단일 트랜잭션** — 6건 + 본 검증에서 발견된 다른 stale 일괄 처리. CHANGELOG 신규 엔트리 "MASTER-PLAN unfreeze 라운드 (2026-04-30+)" 단일 기록.

#### C8. STORY-BIBLE §6.3 HAPPY 키 2개 누락 + H4 ≥70 cross-reference 부재
- **위치**: STORY-BIBLE:87·94
- **처방**: HAPPY 조건 "≥60" → "≥60 + 키 2개 통과" 갱신 + H4 ≥70 메모 추가
- **출처**: 배치 2 L1.4.a·b

#### C9. PROGRESS-TRACKER 톤 매트릭스 마이그레이션 미반영
- **위치**: PROGRESS-TRACKER:9, 70, 200~208
- **처방**: 현재 상태 줄에 "톤 매트릭스 5단계 + 19개 status 전환 완료" 추가. 사용자 검증 대기 항목 갱신.
- **출처**: 배치 1 L0.2.a·b

### 🔴 P2 — 본문 stale (시나리오 done이지만 의사코드/표 stale)

#### C10. BRANCH-GRAPH §4 누적 표 + §5 H3 메모 + §6 명명 stale 통합
- **위치**: BRANCH-GRAPH §4 line 119~142 + §5 line 146 + §6 line 174~226
- **처방**:
  - §4 누적 표 시뮬값 갱신 (옛 H1+50/H2+56/H3+50/H4+35/H5+36 → 신 +113/+117/+98/+68/+125)
  - §4 변동값 표에 톤 매트릭스 cross-reference 추가
  - §5 line 146 메모 "H3 warm_supportive 낮" → "시간대 무관 (Step 4)"
  - §6 의사코드 명명 (`affection_H1`/`flag_seoyoon_late_reply_count`/`lastIncrementOrder`) → types.ts/STATE-SCHEMA 정합 (`H1`/`late_reply_count`/`last_increment_order`)
- **출처**: 배치 2 L1.3.a·b·1.5.a + 배치 4 L6.8

#### C11. video_meet_seol Ch.2 호출 누락
- **위치**: ch02_anatomy.md (Scene 04 부근, line 362 cg_seol_lab_first 호출 직후)
- **처방**: `[VIDEO: video_meet_seol skipable=true]` 1줄 추가
- **출처**: 배치 2 L8.4.a

---

## Major 우선순위 큐

### 🟡 M1. 캐릭터 시트 §6 stale (5시트 동일 패턴)
- **위치**: H1·H2·H3·H4·H5 시트 §6
  - H1·H2·H3·H5 §6 트루엔딩 키 호감도 (+5/+5/+10) → 톤 매트릭스 +15 분할 패턴 (KEY +10 + 묘사 +5) (배치 3 L3.1.c)
  - H4 §6 의사코드 "aff <60 → 배드 엔딩" → "REJECT 흡수" + "<70" (배치 3 L3.1.a)
  - H4 §6 line 78 분기 표 "호감도 <60 → 배드 분기" 동일 stale (배치 3 L3.1.b)
- **처방**: 5시트 §6 일괄 갱신 단일 트랜잭션
- **출처**: 배치 3 L3.1.a·b·c

### 🟡 M2. route-H4 §END_H4_TRUE ≥80 stale
- **위치**: route-H4-na-seoyoon:103
- **처방**: `≥ 80` → `≥ 70` + `late_reply_count == 0` → `< 2`
- **출처**: 배치 2 L9.2.a

### 🟡 M3. KEY:H#: 옛 표기 29건 (10개 시나리오) — 챕터별 자동 자리 vs 미변환 분리 검토
- **출처**: 배치 4 L10.3 + 배치 2 L9 [INC: H#] 46건과 합쳐 옛 표기 75건

### 🟡 M4. Ch.6 변태 망상 페어 4건 의도 확인
- **위치**: ch06_h1·h2·h3·h5 각 1회
- **처방**: PM 의사결정 — (a) Ch.6 분기 별도 카운팅 의도 vs (b) 사용자 체크리스트 "Ch.6 0회" 회귀
- **출처**: 배치 2 L8.2.a

### 🟡 M5. 회식 5지선다 4명 페널티 처리 비트 시트 누락
- **위치**: route-common.md Ch.5 line 177~183
- **처방**: 비트 시트 메모 한 줄 추가 ("선택 안 된 4명: 톤 매트릭스 자동 페널티 -2/-3 적용")
- **출처**: 배치 3 L2.4.a

### 🟡 M6. ch04 cross-reference broken (route-common §Ch.4 spec 부재)
- **위치**: ch04_library:39 ↔ route-common
- **처방**: route-common §Ch.4에 변태 망상 페어 발생 챕터 spec 명시
- **출처**: 배치 2 L9.3.a

---

## Minor 우선순위 큐 (12건 — PM 결정 대기)

| ID | 항목 | 위치 | 출처 |
|---|---|---|---|
| Mn1 | side-characters depends-on에 CONVENTIONS 누락 | side-characters.md:5-6 | 배치 1 L0.3.a |
| Mn2 | STATE-SCHEMA.md draft 잔존 | STATE-SCHEMA:10 | 배치 1 L0.4.a |
| Mn3 | route-common §Ch.4 spec broken | ch04_library:39 | 배치 2 L9.3.a (M6와 별도) |
| Mn4 | MASTER-PLAN §4.3 거절 4단계 cross-ref 부재 | MASTER-PLAN:152 | 배치 2 L9.5.c |
| Mn5 | STORY-BIBLE H4 ≥70 cross-reference 부재 | STORY-BIBLE:84-94 | 배치 2 L1.4.b |
| Mn6 | 회식 5지선다 페널티 메모 누락 | route-common Ch.5 | 배치 3 L2.4.a (M5와 별도) |
| Mn7 | toneMatrix.ts line 89 주석 stale "낮 한정" | toneMatrix.ts:89 | 배치 4 L6.6 |
| Mn8 | verifyToneMatrix.ts 카운트 mismatch (15 vs CHANGELOG 13) | scripts/verifyToneMatrix.ts | 배치 4 L6.5 |
| Mn9 | types.ts `current_scene_id` STATE-SCHEMA 미반영 | types.ts:45 | 배치 4 L6.7 |
| Mn10 | ch06_h1_serin 작가 메모 "한 박자" 2건 | ch06_h1:1173·1191 | 배치 5 L5.3 |
| Mn11 | "자리" 빈도 본문/메모 분리 검증 한계 | 11시나리오 451건 | 배치 5 L5.4.a |
| Mn12 | PROGRESS-TRACKER 사용자 검증 대기 항목 stale | PROGRESS-TRACKER:200~208 | 배치 1 L0.2.b |

---

## 패턴 분석 — 회귀 패턴

### 🔁 패턴 #1: "done 사인오프 시 본문 stale 점검 누락"

**발생 위치**: 톤 매트릭스 마이그레이션 review→done 라운드 (CHANGELOG 2026-04-30 line 19)에서 19개 모듈 status 전환됐으나 본문 stale 잔존:

| 모듈 | status | 본문 stale 발견 |
|---|:---:|---|
| BRANCH-GRAPH.md | done | §4 누적 표 / §5 H3 메모 / §6 명명 |
| H1·H2·H3·H4·H5.md | done | §6 트루 키 호감도 옛 표기 + H4 의사코드 |
| ch01~ch06 시나리오 (10개) | done | JUMP placeholder 5건 + KEY:H#: 옛 표기 29건 + [INC: H#] 옛 표기 46건 |

**처방 권장**: review→done 사인오프 워크플로우에 "본문 stale 점검 단계" 추가. 자동 grep 스크립트로 옛 명명·옛 표기·placeholder 패턴 일괄 색출.

### 🔁 패턴 #2: "MASTER-PLAN frozen 잔재 누적"

PROGRESS-TRACKER line 51, 68 명시 "MASTER-PLAN frozen 항목 (다음 unfreeze 시점에 일괄 반영)" — 본 검증에서 누적된 frozen 잔재 6건 (C2~C7).

**처방 권장**: PM unfreeze 라운드 단일 트랜잭션 + 향후 변경 사항 발생 즉시 MASTER-PLAN cross-reference 메모 추가 (frozen이라도 SSoT 본문은 갱신).

### 🔁 패턴 #3: "cross-reference broken"

- ch04 → route-common §Ch.4 spec (배치 2 L9.3.a)
- STORY-BIBLE §6.3 → BRANCH-GRAPH §6.1 (H4 ≥70 위임 부재, 배치 2 L1.4.b)
- MASTER-PLAN §4.3 → route-H4 §END_H4_REJECT (8단계 연출 위임 부재, 배치 2 L9.5.c)

**처방 권장**: 모든 위임 cross-reference에 정확한 §·line 번호 명시. 갱신 시 cross-reference 동시 점검.

---

## 권장 실행 전략

### Phase 1 (P0): JUMP placeholder 5건 — 즉시 처방 (게임 작동 차단)
단일 PR 5분 작업. SCENE-FORMAT §5 line 244 룰 위반 즉시 해소.

### Phase 2 (P1): MASTER-PLAN unfreeze 단일 라운드
PM 결정 + CHANGELOG 단일 엔트리. C2~C7 6건 + Mn4·Mn12·Mn5 일괄 처리.

### Phase 3 (P2): 본문 stale 정합화 라운드
- BRANCH-GRAPH §4·§5·§6 본문 갱신 (C10)
- 5시트 §6 트루 키 호감도 표기 갱신 (M1)
- route-H4 §END_H4_TRUE ≥70 갱신 (M2)
- video_meet_seol Ch.2 호출 추가 (C11)
- STORY-BIBLE §6.3 키 2개 + H4 ≥70 (C8)
- PROGRESS-TRACKER 갱신 (C9)

### Phase 4 (PM 의사결정 대기)
- M3 KEY:H#: 옛 표기 29건 (자동 자리 vs 미변환)
- M4 Ch.6 변태 망상 페어 4건 의도 확인
- M5·M6 비트 시트 메모 추가
- Mn7·Mn8·Mn9 코드 주석·STATE-SCHEMA 동기화
- Mn10·Mn11 작가 메모·자리 빈도

### Phase 5: 회귀 검증 + W5 진입
- 본 6개 배치 검증 보고서 회귀 점검 라운드 (Phase 1~3 처방 후)
- W5 콘텐츠 통합 (md→JSON 변환) 시점 L13~L14 자동 검증

---

## W5/W6 후속 검증 핸드오프

본 검증에서 다루지 않은 영역 (계획 명시):

### L13 플레이어 경험 (UX) — W5/W6 사용자 검증 단계
- 진입 마찰 (의대 용어·학번·등장 인물 첫 1시간 밀집도)
- 정보 노출 페이싱 (히로인 배경 점진 노출)
- 감정 곡선 (Ch.2 무거움 → Ch.3 가벼움 → Ch.4 긴장 → Ch.5 해방+결정)
- 분기 만족도 (1주차 선택 의미감)
- 단독 엔딩 UX (END_SOLO_SUMMER 의도된 엔딩으로 느껴지는지)

### L14 빌드·CI 자동화 — W5 컴파일러 + W6 CI
- JUMP 타겟 자동 valid 검증 (본 검증에서 placeholder 5건 색출)
- 에셋 ID 등록 여부 (`src/scenes/manifest.ts` ↔ 본문)
- 플래그 set/check 매칭
- 호감도 누적 시뮬 (Ch.1~6 전 경로 + 16개 엔딩 도달성)
- 회피 어휘 grep 자동화
- 카톡 거절 텍스트 무결성 hash 비교

### W6 QA 단계 추가 권장
- 본문/메모 분리 자동 검증 (Mn11 자리 빈도 회귀 점검)
- 톤 태그 ↔ 라벨 텍스트 의미 일치 175개 샘플링
- 모놀로그 5줄+ 연속 페이싱 정밀 검토
- H2·H3 사투리 적정성 사용자 검증

---

## 검증 한계 명시 (배치 1~6 통합)

| 영역 | 한계 | 보완 시점 |
|---|---|---|
| 호감도 산수 정확 합산 (175개 라벨 + 자동 INC 자리) | L14 자동화 영역 | W5 컴파일러 |
| 자리 빈도 본문/메모 분리 | grep 한계 | W6 QA 자동 스크립트 |
| 본문/메모 영역 분리 (회피 어휘 검증) | grep 한계 | W6 QA 자동 |
| 의대 은어 자연스러움 | 평가 어려움 | W5/W6 사용자 검증 |
| H2·H3 사투리 적정성 | 사용자 출신지 검증 | W5/W6 사용자 |
| 모놀로그 5줄+ 연속 페이싱 | 본문 직접 검토 분량 큼 | W6 QA |
| 톤 태그 ↔ 라벨 텍스트 의미 일치 175개 | 자동화 어려움 | W6 샘플링 |
| BGM/SFX 큐 본문 grep | 본 검증 범위 외 | W5 컴파일러 자동 |
| 자산 ID 매니페스트 ↔ 본문 (`src/scenes/manifest.ts`) | 코드 직접 검증 | W5 컴파일러 |
| video_opening 호출 위치 (타이틀 화면) | 시스템 코드 검증 | W6 E2E |

---

## 검증 종료 결론

### 정량 평가

| 영역 | 결과 | 점수 |
|---|---|:---:|
| 톤 매트릭스 시스템 (5×5 코드) | 모든 검증 통과 | A+ |
| 12세 등급 + 욕설 절대 금지 | 본문 0건 위반 | A+ |
| AI 흔적 클리셰 | 본문 0건 | A+ |
| 카톡 시그니처 + 채널 분리 | 시트 §4 정합 | A+ |
| 캐릭터 시트 외모·말투·나이·학번·관계 | 5/5 정합 | A |
| 시간선 + 요일 캘린더 | 8/8 정합 | A+ |
| 거절 카톡 4줄 + 8단계 연출 | 8곳 무결 + 본문 정확 | A+ |
| KEY 톤 ↔ 캐릭터 의미 정합성 | 5/5 정합 | A+ |
| BRANCH-GRAPH 호감도 누적 정합 | 본문 stale (Step 4 후) | C |
| MASTER-PLAN frozen 잔재 | 6건 누적 | D |
| JUMP placeholder | 5건 PROD blocking | C |

### 종합 평가

**대본 검증 통과 — 단 즉시 처방 11건**:
- 5건 (JUMP placeholder): 단순 텍스트 교체 5분 작업
- 6건 (MASTER-PLAN unfreeze): 단일 PM 트랜잭션
- 그 외 10건 (M1~M6 + 일부 Critical): 본문 stale 정합화 라운드

**본 게임의 강점**:
- 84,861개 카톡 분석 기반 윤모 말투 정확성
- §3.6 가드레일 8개 + 사후점검 라운드로 회피 어휘 본문 0건
- 톤 매트릭스 5×5 시스템 (toneMatrix.ts) — "한 히로인의 정답이 다른 히로인의 오답" 시스템 레벨 작동
- 12세 등급 안전선 + 변태 망상 페어 보수 시각 단서
- 캐릭터 시트 + 시나리오 본문 정합성 우수

**본 게임의 약점**:
- review→done 사인오프 워크플로우 본문 stale 점검 누락 패턴 (회귀 패턴 #1)
- MASTER-PLAN frozen 잔재 누적 (회귀 패턴 #2)
- cross-reference broken 패턴 (회귀 패턴 #3)

세 패턴 모두 **자동화 도구**로 해결 가능 — 본 검증의 가장 큰 가치는 자동 grep 패턴 발견이 아니라 **회귀 패턴 식별** ➜ 워크플로우 개선 권장.

---

## 6개 배치 보고서 위치

```
game-project/08-qa-deployment/verification-reports/
├── 00-meta-setup.md                      # L0
├── 01-macro-consistency.md               # L1·L9·L8
├── 02-structure-character.md             # L2·L3
├── 03-system-scene.md                    # L6·L10·L4
├── 04-text-domain-rating.md              # L5·L7·L11
└── 05-continuity.md                      # L12 + 종합 (본 보고서)
```

각 배치 보고서는 frontmatter `status: review`. PM 검토 후 `done` 전환 가능. 본 종합 보고서를 바탕으로 **Phase 1 (JUMP placeholder 5건 즉시 처방)** + **Phase 2 (MASTER-PLAN unfreeze 라운드)** 진입 권장.
