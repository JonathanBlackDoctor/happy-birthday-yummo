---
module: verification-01-macro-consistency
hierarchy: 6
depends-on:
  - 08-qa-deployment/verification-reports/00-meta-setup.md
  - 00-master/MASTER-PLAN.md
  - 03-story/STORY-BIBLE.md
  - 03-story/BRANCH-GRAPH.md
  - 03-story/route-H4-na-seoyoon.md
  - 03-story/scenarios/ch06_h4_seoyoon.md
  - 00-master/CONVENTIONS.md
outputs:
  - 시간선·도달성·산수·엔딩룰 정합 검증
  - 문서 간 정합성 페어별 검증
  - 핵심 연출 (거절 카톡·변태 망상·트루엔딩·첫만남·H4 미니게임) 검증
status: done
---

# 검증 보고 — 배치 2: 매크로 정합성 + 문서 정합성 + 핵심 연출 (L1·L9·L8)

> 검증일: 2026-04-30
> 범위: L1 매크로(시간선/도달성/산수/엔딩룰/KEY 톤 매핑) + L9 문서 간 정합성(8개 페어) + L8 핵심 연출(거절·망상·트루·첫만남·H4 미니게임·회식·ch01_02b)
> 의존: 배치 1(메타·셋업) 보고서 — Critical 2건/Major 2건 발견 사항 회귀 점검 포함

---

## L1 매크로 정합성

### L1.1 시간선

검증 결과:
- ✅ STORY-BIBLE §3 line 33~46 시간선 마스터: 프롤로그 2/25~28 → Ch.1~6 → 엔딩 6/20~7/10 (H1 트루 7/4 토요일 포함)
- ✅ **2026년 7월 4일 = 토요일** (2026년 1월 1일 목요일 기준 산출 일치). H1 트루엔딩 분당 카페 7/4 모먼트 캘린더 정합
- ✅ 본과1 시험기간 4월 말~5월 초 (Ch.4 4/27~5/3 시험 임박 + Ch.5 5/11~17 시험 종료) — 한국 의대 1학기 중간고사 시기 합리
- ✅ 카데바 실습 3월 중순 (Ch.2 3/16~22) — 한국 의대 본과1 1학기 해부학 실습 시작 시기 합리
- ✅ STORY-BIBLE line 46 "엔딩 시기 7월 초 확장 사유" 명시 (H1 7/4 분당 본가 모먼트), CHANGELOG 외부 피드백 라운드 #1 #2 (line 450~) 정합

### L1.2 BRANCH-GRAPH §7 도달성 6항목

| 검증 항목 | 결과 | 근거 |
|---|:---:|---|
| 16개 엔딩 모두 명시 | ✅ | BRANCH-GRAPH §2 line 35~52 (16/16) |
| H4 REJECT 단독 트리거 (`late_reply_count >= 2`, 호감도 무관) | ✅ | BRANCH-GRAPH §6.1 #1 line 202~204 + route-H4 line 40 + ch06_h4_seoyoon |
| END_SOLO_SUMMER 도달 (`max < 30`) | ✅ | BRANCH-GRAPH §6 line 184~186 + ch05_decision Scene 07 |
| H5 TRUE 도달성 (1위 + ≥80 + 키 3개) | ✅ | 톤 매트릭스 Step 4 시뮬 H5 +125 + 키 5개 (CHANGELOG line 156·177) |
| H4 TRUE 임계 80→70 완화 후 도달성 | ✅ | 톤 매트릭스 Step 4 시뮬 H4 +68 ≥70 + 키 8개 (CHANGELOG line 161~167·177) |
| 모든 분기 노드 종착 (고립 노드 없음) | (배치 4 L10 정밀 검증) | 정적 grep 단계 |

### L1.3 호감도 산수 — 톤 매트릭스 적용 후

### [Critical] L1.3.a BRANCH-GRAPH §4 누적 표가 톤 매트릭스 Step 4 시뮬과 stale
- **위치**: `03-story/BRANCH-GRAPH.md:130-142`
- **현재 상태**:
  ```
  - H1: +50  - H2: +56  - H3: +50  - H4: +35  - H5: +36
  ```
  (line 130~138, "한 히로인에게 올인 시 Ch.1~5 누적 (실제 시나리오 기준)")
- **기대 상태**: 톤 매트릭스 Step 4 시뮬 결과 + 처방 후 누적 (CHANGELOG line 110·148~156·171~178):
  ```
  - H1: +113  - H2: +117  - H3: +98  - H4: +68  - H5: +125
  ```
- **수정 제안**: §4 누적 표 신 시뮬값으로 갱신. 본문 라벨 일관 처리 명시 시기는 "2026-04-30 톤 매트릭스 마이그레이션 Step 4 처방 후" 추가. line 142 메모 "본 표는 마일스톤 #2 점검 시점(2026-04-29) 추정값"을 "톤 매트릭스 Step 4 시뮬값(2026-04-30)"으로 갱신.
- **영향 범위**: BRANCH-GRAPH status는 done(2026-04-30 review→done 사인오프) — 본문 stale은 외부 검증자가 BRANCH-GRAPH 자체를 SSoT로 신뢰할 시 옛 누적값으로 결정. 이전 5명 모두 트루 도달 가능 사실(Step 4 처방 후) 미반영 → 시뮬 신뢰성 손상.

### [Major] L1.3.b BRANCH-GRAPH §4 호감도 변동값 표(line 119~128)가 옛 룰 (톤 매트릭스 페널티 -2/-3 / 톤 매치 차등 / H4 보정 -2 미반영)
- **위치**: `03-story/BRANCH-GRAPH.md:119-128`
- **현재 상태**: 표는 "매우 좋은 답변(키) +10 / 좋은 답변 +5 또는 +3 / 평범 +1~+2 / 부적절 -1~-2 / 매우 부적절 -3~-5 / 늦장 -3" — 톤 매트릭스 적용 전 룰.
- **기대 상태**: CONVENTIONS §3.7 #3 line 215~233 5×5 매트릭스 + 페널티 강도 + H4 보정. line 146 메모만 있고 §4 본 표는 옛 룰 그대로.
- **수정 제안**: §4 변동값 표 헤더에 "(2026-04-29 마일스톤 #2 동기화 — 옛 룰. 톤 매트릭스 적용 후는 CONVENTIONS §3.7 #3 매트릭스 우선)" cross-reference 명시 + 신 룰 요약(미스매치 -2 / 정반대 -3 / H4 톤 매치 베이스 -2 보정).
- **영향 범위**: L1.3.a와 동일 — 외부 검증자가 §4를 절대 룰로 신뢰할 위험.

### L1.4 엔딩 분류 룰 일관성

### [Critical] L1.4.a STORY-BIBLE §6.3 ↔ BRANCH-GRAPH §2 HAPPY 조건 충돌
- **위치**: `03-story/STORY-BIBLE.md:87` vs `03-story/BRANCH-GRAPH.md:38·42·46·230`
- **현재 상태**:
  - STORY-BIBLE §6.3 line 87: `해피 | 단일 히로인 ≥60 | 정적 CG + 텍스트` (키 조건 없음)
  - BRANCH-GRAPH §2 line 38: `END_H1_HAPPY | HAPPY | H1 1위 + ≥60 + 키 2개` (키 2개 명시)
  - BRANCH-GRAPH §6 line 230: `if (aff >= 60 && keys >= 2) return HAPPY` (키 2개 명시 — 코드 분기)
- **기대 상태**: 두 문서 동일 조건. BRANCH-GRAPH §2가 16개 엔딩 표의 SSoT (배치 1 L0.1 결정권 표 정합)이므로 STORY-BIBLE §6.3을 BRANCH-GRAPH 기준으로 갱신.
- **수정 제안**: STORY-BIBLE §6.3 line 87 → `해피 | 단일 히로인 ≥60 + 키 2개 통과 | 정적 CG + 텍스트` (또는 기존처럼 단순 표기 + cross-reference `(상세 조건은 BRANCH-GRAPH §2 참조)`).
- **영향 범위**: 시나리오 작성자가 STORY-BIBLE만 보고 H1 HAPPY 조건을 ≥60만으로 오해 시 ch06_h1 분기에 키 2개 통과 자리 누락 가능. 현재 ch06_h1 본문은 BRANCH-GRAPH 기준 작성됨 (CHANGELOG 사인오프 통과). 그러나 STORY-BIBLE만 stale.

### [Minor] L1.4.b STORY-BIBLE §6.3 표에 H4 ≥70 cross-reference 부재
- **위치**: `03-story/STORY-BIBLE.md:84-94`
- **현재 상태**: 표 line 86 "트루 | 단일 히로인 ≥80 + 키 선택지 3개 통과 | 영상 컷 포함". H4의 ≥70 완화는 line 94 "H4는 BAD가 별도 존재하지 않고 거절(REJECT)이 흡수: 답장 지연 ≥2회 우선 평가, 그 외에 aff <60도 거절 라우팅. 자세한 평가 순서는 BRANCH-GRAPH.md §6.1 참조"에서 위임만 명시. 트루 임계 ≥70 cross-reference 부재.
- **기대 상태**: BRANCH-GRAPH §2 line 48 "END_H4_TRUE 조건 ≥70 + 키 3개 + late_reply <2 ※ 2026-04-30 Step 4: 80→70 완화" 명시. STORY-BIBLE 표에도 H4 별도 표기 또는 위임 메모.
- **수정 제안**: line 94 ※ 메모에 "H4 트루 임계 80→70 완화 (2026-04-30 Step 4)" 한 줄 추가. 또는 §6.3 표에 "(H4 트루: ≥70, 자세히는 BRANCH-GRAPH §2)" 표기.
- **영향 범위**: 외부 검증자가 STORY-BIBLE §6.3만 보고 모든 트루 = ≥80으로 오해. H4만 ≥70 사실 누락.

### L1.5 KEY 톤 매핑 정합성

### [Major] L1.5.a BRANCH-GRAPH §5 line 146 메모 "H3 warm_supportive 낮"이 톤 매트릭스 Step 4 "H3 시간대 무관"과 stale
- **위치**: `03-story/BRANCH-GRAPH.md:146`
- **현재 상태**: "H1 mature_serious / H2 direct_friendly / **H3 warm_supportive 낮** / H5 bright_forward / H4는 미니게임 메커니즘이 KEY 역할"
- **기대 상태**: CONVENTIONS §3.7 #4 line 240: "H3: warm_supportive ※ **시간대 무관** (2026-04-30 Step 4, PM 결정). H3_NIGHT_DELTA는 일반 자리에만 보정 적용. KEY 자리는 낮/밤 모두 묘사 보너스 가산."
- **수정 제안**: line 146 → "H3 warm_supportive (시간대 무관, KEY 자리만)" 또는 cross-reference `(CONVENTIONS §3.7 #4 참조 — H3 시간대 무관)`.
- **영향 범위**: BRANCH-GRAPH status: done인데 §5 메모 stale. CHANGELOG line 19 review→done 사인오프 시 본문 stale 점검 누락. toneMatrix.ts 코드는 시간대 무관(CHANGELOG line 142~144) — 코드 정합 OK, 명세 stale.

### Pass-through (L1)
- ✅ L1.4 H4 평가 순서 일관: BRANCH-GRAPH §6.1 line 241~245 (`late ≥2 → aff <60 → aff <70 → key ≥3 → fallback`) ↔ route-H4 line 40~44 동일 순서
- ✅ L1.4 H1/H2 HAPPY 키 2개 정합: BRANCH-GRAPH §2·§6 둘 다 키 2개 (STORY-BIBLE만 stale)
- ✅ L1.5 KEY 톤 매핑 5/5 일관 (H3 시간대 메모 외): CONVENTIONS §3.7 #4 ↔ BRANCH-GRAPH §5 ↔ toneMatrix.ts (CHANGELOG line 142~146 신뢰)

---

## L9 문서 간 정합성

페어별 검증 (배치 1 SSoT 우선순위 표 기반):

### 9.1 STORY-BIBLE ↔ BRANCH-GRAPH
- ✅ 16개 엔딩 ID·코드명·분류 일치 (L1.4.a 충돌만 — STORY-BIBLE §6.3 키 2개 누락)
- ⚠️ H4 트루 ≥70 cross-reference 부재 (L1.4.b)
- ✅ END_SOLO_SUMMER 16번째 명시 일관

### 9.2 BRANCH-GRAPH ↔ route-H?.md
- ✅ H4 평가 순서 동일 (route-H4 line 40~44)
- ✅ H4 트루 임계 ≥70 일관 (route-H4 §END_H4_TRUE line 103 — 단 본문은 ">=80 AND key_count >= 3"으로 표기, line 47 "이전 의사코드의 `late == 0` 조건은 오류였음" 메모는 있으나 ≥80 표기 자체는 갱신 안 됨)
- 다른 route-H?도 배치 3·4에서 추가 검증

### [Major] L9.2.a route-H4-na-seoyoon §END_H4_TRUE 진입 조건 ≥80 stale
- **위치**: `03-story/route-H4-na-seoyoon.md:103`
- **현재 상태**: `진입 조건: affection_H4 >= 80 AND key_count >= 3 AND late_reply_count == 0 (BRANCH-GRAPH §6.1)`
- **기대 상태**: BRANCH-GRAPH §2 line 48에서 H4 트루 ≥70 완화 (Step 4). route-H4 line 103도 ≥70으로 갱신 필요.
- **수정 제안**: `affection_H4 >= 70 AND key_count >= 3 AND late_reply_count < 2 (BRANCH-GRAPH §2·§6.1)` (`== 0`도 부정확 — `< 2`가 맞음. line 47 자체 메모에서 인정).
- **영향 범위**: route-H4 status: review (마이그레이션 영향 없는 모듈 분류 — CHANGELOG line 47 "STORY-BIBLE, route-H1~H5는 본 작업 외"). 즉 톤 매트릭스 Step 4 처방이 BRANCH-GRAPH·H4 시트·scriptInterpreter.ts에는 반영됐으나 route-H4에는 미반영. **검증에서 발견된 누락**.

### 9.3 route-common ↔ scenarios
- 검증 한계: route-common 본문 grep으로 변태 망상 페어 발생 챕터 spec 검색 결과 0건. 그러나 ch04_library line 39 "route-common §Ch.4 spec 준수: 발생 챕터는 Ch.1·2·3·5"라고 cross-reference. **L9.3.a 발견** ↓

### [Minor] L9.3.a ch04_library의 route-common §Ch.4 spec cross-reference broken
- **위치**: `03-story/scenarios/ch04_library.md:39` ↔ `03-story/route-common.md`
- **현재 상태**: ch04_library line 39 "변태 망상 페어 0회 (route-common §Ch.4 spec 준수: 발생 챕터는 Ch.1·2·3·5)" — cross-reference. route-common에서 grep `발생 챕터|Ch.1.*Ch.2.*Ch.3.*Ch.5` 결과 0건.
- **기대 상태**: route-common 본문에 변태 망상 페어 발생 챕터 spec(Ch.1·2·3·5) 명시 또는 ch04 cross-reference 표현 변경.
- **수정 제안**: route-common §Ch.4 부분에 "변태 망상 페어 0회 (룰: Ch.1·2·3·5만 발생)" 추가. 또는 ch04_library cross-reference에서 "STORY-BIBLE §7.2 + route-common Ch.4 비트 시드 0회 표기" 식으로 수정.
- **영향 범위**: 검증자가 cross-reference 따라가다 깨짐. route-common 갱신 시 본 cross-reference 함께 점검.

### 9.4 캐릭터 시트 ↔ 시나리오 본문
- 배치 3(L3 캐릭터)에서 깊이 검증

### 9.5 MASTER-PLAN ↔ STORY-BIBLE / 하위 모듈

### [Critical] L9.5.a MASTER-PLAN §4.3 line 148 H4 거절 트리거 옛 정의
- **위치**: `00-master/MASTER-PLAN.md:148`
- **현재 상태**: `**트리거**: Ch.5 종료 시점에 나서윤 호감도 < 50 + 답장 지연 누적 ≥3회`
- **기대 상태**: 2026-04-28 갱신 후 정확 트리거: `late_reply_count >= 2` (호감도 무관 우선) **OR** `affection_H4 < 60`. BRANCH-GRAPH §6.1 line 241~245 명시.
- **수정 제안**: line 148 → `**트리거**: late_reply_count ≥ 2 (호감도 무관 우선) OR affection_H4 < 60 (BAD 자리 흡수). 자세한 평가 순서 BRANCH-GRAPH §6.1 참조.`
- **영향 범위**: MASTER-PLAN frozen 정책으로 본문 수정 미수행. CHANGELOG line 32 "[Δ pending review] 마커 11개 일괄 제거"에 §4.3 마커 포함 — 마커 제거 ≠ 본문 수정. **마커 제거 후 stale 잔존 = 외부 검증자가 본문을 신뢰 가능한 것처럼 보이는 위험**.

### [Critical] L9.5.b MASTER-PLAN §4.2 H1~H5 표 다수 stale
- **위치**: `00-master/MASTER-PLAN.md:137-141`
- **현재 상태**:
  - H1 line 137: "동산병원 내과 R2" — 약어 "R2"
  - H4 line 140: "**카리나** | 영남대 약대 본3"
  - H5 line 141: "**장유나** | 계명의대 의예과2"
- **기대 상태**:
  - H1: "전공의 2년차" 풀이 (CHANGELOG 2026-04-30 line 520 "R2 약어 자연 풀이 일관 처리")
  - H4: "**카리나** | 계명대 약대 4학년 (23학번, 03년생)" (W3 prep 잔재 정리 라운드 2026-04-29 영남대→계명대 + H4 시트 §1 약대 4학년)
  - H5: "**장윤영** | 계명의대 의예과2 (24학번)" (W3 prep 잔재 정리 라운드 장유나→장윤영)
- **수정 제안**: 4건 일괄 갱신. MASTER-PLAN frozen unfreeze 라운드에 처리.
- **영향 범위**: L0.1.b·L0.1.c와 동일 — frozen 잔재. CHANGELOG에 다른 모듈은 갱신 명시(line 75~78), MASTER-PLAN만 누락.

### [Minor] L9.5.c MASTER-PLAN §4.3 line 152 거절 엔딩 연출 4단계 요약 (route-H4 8단계와 cross-reference 부재)
- **위치**: `00-master/MASTER-PLAN.md:152`
- **현재 상태**: `**연출**: 카톡 화면 풀스크린 → 메시지 한 줄씩 타이핑 효과 → 페이드아웃 → "BAD ENDING: 답장이 늦어서" 타이틀` (4단계 요약)
- **기대 상태**: route-H4-na-seoyoon line 68~77 / H4 시트 §6 / ch06_h4_seoyoon SCENE_CUE 1~8단계가 정확 8단계 명세. MASTER-PLAN은 "(상세 8단계 연출 명세는 route-H4-na-seoyoon.md §END_H4_REJECT 참조)" cross-reference 필요.
- **영향 범위**: 검증자가 MASTER-PLAN 4단계만 보고 8단계 의도 누락 가능.

### 9.6 CONVENTIONS ↔ 시나리오 본문
- 배치 5(L5 대사·어휘)에서 회피 어휘 grep + 욕설 grep 깊이 검증

### 9.7 CONVENTIONS §3.7 톤 매트릭스 ↔ 다중 모듈
- ✅ CONVENTIONS §3.7 #3 5×5 매트릭스 (line 215~223) — toneMatrix.ts 정합 (CHANGELOG line 102·142~146 신뢰)
- ✅ §3.7 #4 KEY 톤 매핑 — H1~H5 시트 §6 (배치 3에서 정밀)
- ⚠️ BRANCH-GRAPH §5 line 146 메모 "H3 warm_supportive 낮" stale (L1.5.a 발견)
- ✅ §3.7 #5 H4 미니게임 (mechanism=h4_reply_speed, 15초, 통과 +1, 타임아웃 -3 + count++) — route-H4 line 156·H4 시트 §11·STORY-BIBLE §7.1 일관

### 9.8 자산 매니페스트 ↔ 본문
- 배치 4(L4 씬·연출)에서 정밀

### 9.9 toneMatrix.ts ↔ §3.7 ↔ verifyToneMatrix.ts
- (배치 4 L6에서 코드 직접 검증)

---

## L8 핵심 연출

### L8.1 거절 카톡 엔딩 — 텍스트 무결성 + 8단계 연출

### [Pass] L8.1.a 거절 카톡 4줄 텍스트 8곳 모두 일치 ✓
검증 위치 8곳 (전수 grep, 글자·이모지 일치):
| 위치 | 라인 |
|---|---|
| `00-master/MASTER-PLAN.md` | 151 (한 줄 인용) |
| `00-master/CHANGELOG.md` | 763 (작업 이력) |
| `02-characters/heroines/H4-na-seoyoon.md` | 107~110 |
| `03-story/route-H4-na-seoyoon.md` | 62~66 |
| `03-story/scenarios/ch06_h4_seoyoon.md` | 1027~1030 (KAKAO 블록) |
| `03-story/scenarios/ch06_h4_seoyoon.md` | 1169~1172 (작가 메모 인용) |
| `05-ui-design/ANIMATION-SPEC.md` | 120 (애니메이션 타이밍) |
| `src/ui/katalk/RejectEnding.tsx` | 23 (코드 배열) |

8/8 일치 — **변경 금지 텍스트** 무결성 확보.

### [Pass] L8.1.b 8단계 연출 ch06_h4_seoyoon 본문 정확 구현 ✓
- 1단계 페이드 인 → BGM 전환 (line 1019~1020 BGM bgm_sad)
- 2단계 카톡 풀스크린 (line 1021~1022)
- 3단계 SFX + 타이핑 인디케이터 1.5초 + 메시지 한 줄당 0.8초 (line 1023~1031 KAKAO 블록 정확)
- 4단계 마지막 🥺🥺 후 2초 정지 (line 1033 SCENE_CUE)
- 5단계 검은 페이드 아웃 (line 1043~1046 BG: black fade=4)
- 6단계 타이틀 카드 BAD ENDING (line 1050~1052)
- 7단계 영상 video_reject_seoyoon 5~7초 (line 1054~1056 + BGM_STOP fade=4)
- 8단계 엔딩 크레딧 + 해금 토스트 (line 1060~1064 + ENDING: END_H4_REJECT)

8/8 단계 명시. 윤모 모놀로그 1~2줄 (line 1037 "(창밖 비) ..." + line 1048 "답장이 늦었던 게... 그렇게 큰 일이었나.") 임팩트 보존.

### L8.2 변태 망상 페어 분배

### [Major] L8.2.a Ch.6 변태 망상 페어 4건 발생 — 사용자 체크리스트 L8.2 "Ch.6 0회"와 충돌
- **위치**: ch06_h1_serin.md:30·45·984, ch06_h2_hajeong.md:28·43·1021, ch06_h3_seol.md:29·44·967, ch06_h5_yuna.md:32·46·1010
- **현재 상태**: ch06_h1/h2/h3/h5 각각 "변태 망상 페어 #1 (Ch.6 챕터당 1회 한도)" 자체 카운팅. ch06_h4·end_solo_summer만 0회.
- **기대 상태 후보 (사용자 결정 필요)**:
  - (a) **의도된 변경**: Ch.5의 #4 "마지막"은 공통부 마지막. Ch.6 분기는 별도 카운팅 (분기별 1회). 이미 본문에 "Ch.6 챕터당 1회 한도" 명시 + 작가 메모에 "H2/H3 보수 시각 단서 계승" 자세한 의도 설명. → STORY-BIBLE §7.2 / route-common에 "Ch.6 분기는 별도 카운팅" 명시 추가 필요.
  - (b) **회귀**: 사용자 체크리스트 "Ch.6 0회"가 정확하면 ch06_h1/h2/h3/h5 4건 모두 제거 (분량 큼).
- **수정 제안**: PM 결정 (a) vs (b). CHANGELOG에 Ch.6 변태 망상 페어 추가 결정 명시 검색 결과 별도 라운드 명시 발견 안 됨 (검증 한계).
- **영향 범위**: 4개 시나리오 본문 + 작가 메모. CG·BGM·연출 큐 영향. **PM 의사결정 필요** — 본 보고서는 발견·기록까지만.

### [Pass] L8.2.b Ch.1~5·프롤로그·end_solo_summer·ch06_h4 변태 망상 페어 분배 정합 ✓
- 프롤로그 0회 (line 22 명시) ✓
- ch01_ot 1회 (페어 #1, line 18·27·502) ✓
- ch02_anatomy 1회 (페어 #2, line 21·32·552) ✓
- ch03_dongsan 1회 (페어 #3, line 24·36·615 — Scene 02 H1 가운/스크럽 + 어른 갭) ✓
- ch04_library 0회 (line 39 "발생 챕터는 Ch.1·2·3·5") ✓
- ch05_decision 1회 (페어 #4 "마지막 1회", line 30·41·917) ✓
- ch06_h4_seoyoon 0회 (의도) ✓
- end_solo_summer 0회 (line 43 "단독 자기 회상 자리에 페어 시퀀스 부적절") ✓

### [Pass] L8.2.c 자기자각 + 정상복귀 페어 무결성 + 12세 한도 준수
- 모든 페어 (4+3+2 형식) 명시: ch03 line 618 "(망상 시작) × 3줄 → (자기자각) × 3줄 → (정상복귀) × 2줄"
- ch06_h1·h3·h5 "보수 시각 단서 계승" 명시 (의류 흘러내림 X, 신체 묘사 X)
- 자기자각 톤 욕설 금지 (CHANGELOG 2026-04-28 갱신 룰) — 시나리오 본문 자체점검 명시 (배치 5 L11 grep으로 회귀 검증)

### L8.3 트루 엔딩 5종 일관 구조

### [Pass] L8.3.a 트루 엔딩 영상 5종 모두 호출 ✓
| 영상 | 호출 위치 |
|---|---|
| video_true_serin | ch06_h1_serin.md:667 (skipable=true) |
| video_true_hajeong | ch06_h2_hajeong.md:757 |
| video_true_seol | ch06_h3_seol.md:709 |
| video_true_seoyoon | ch06_h4_seoyoon.md:879 |
| video_true_yuna | ch06_h5_yuna.md:867 |

5/5 호출 + 모두 skipable=true (트루엔딩은 스킵 가능 — 거절은 skipable=false와 대비).

### L8.4 첫 만남 시퀀스 5종

### [Critical] L8.4.a video_meet_seol Ch.2 호출 누락
- **위치**: `03-story/scenarios/ch02_anatomy.md` 본문 + `ch06_h3_seol.md:1078` 작가 메모
- **현재 상태**: ch06_h3 line 1078 작가 메모 영상 호출 표 "video_meet_seol | (Ch.2에서 이미 트리거됨, Ch.6 미사용)" 명시. 그러나 ch02_anatomy.md 본문에 `[VIDEO: video_meet_seol]` 디렉티브 0건 (grep 결과).
- **기대 상태**: 첫 만남 5종 영상 모두 본문에서 호출되어야 함. 다른 4종은 모두 호출됨:
  - video_meet_hajeong → ch01_ot.md:88 ✓
  - video_meet_serin → ch03_dongsan.md:157 ✓
  - video_meet_yuna → ch03_dongsan.md:339 ✓
  - video_meet_seoyoon → ch04_library.md:458 ✓
  - **video_meet_seol → ch02_anatomy 본문 호출 0건** ❗
- **수정 제안**: ch02_anatomy.md Scene 04 (조교 첫 만남, line 362 부근 cg_seol_lab_first 호출 직전·직후)에 `[VIDEO: video_meet_seol skipable=true]` 추가. video-list.md 5종 모두 첫 만남 영상 등재됨 — 본문 호출만 누락.
- **영향 범위**: 영상 12개 분배 (오프닝1 + 첫만남5 + 트루5 + 거절1) 중 1건 누락 → 빌드 시 video_meet_seol.mp4 자산이 어디서도 호출되지 않아 dead asset 상태. 게임 플레이 시 H3 첫 만남에서 영상 컷씬 누락 → 플레이어 경험 불일치 (다른 4명은 영상 컷씬, H3만 텍스트).

### [Pass] L8.4.b 첫 만남 CG 5종 모두 호출 (명명 패턴 비일관 — 배치 4 L10 검증) ✓
| 히로인 | CG ID | 호출 위치 |
|---|---|---|
| H1 | cg_serin_first_meet | ch03_dongsan.md:163 (Ch.3 의국 복도) |
| H2 | cg_hajeong_anatomy | ch02_anatomy.md:194 (Ch.2 카데바 마스크) |
| H3 | cg_seol_lab_first | ch02_anatomy.md:362 (Ch.2 실험실 가운+안경) |
| H4 | cg_seoyoon_first_meet | ch04_library.md:468 (Ch.4 본관 앞) |
| H5 | cg_yuna_booth | ch03_dongsan.md:347 (Ch.3 부스 앞) |

5/5 호출. 명명 패턴은 통일 안 됨 (`*_first_meet` vs `*_anatomy` vs `*_lab_first` vs `*_booth`) — 배치 4 L10에서 자산 ID 정합 검증.

### L8.5 H4 미니게임 4곳 + 대면 KEY 묘사 분기

### [Pass] L8.5.a H4 미니게임 명세 일관 ✓
- STORY-BIBLE §7.1 line 106: "응답 시간: 나서윤 카톡 한정 15초 제한"
- H4 시트 §11 (배치 3에서 직접 검증): 15초 명시 (CHANGELOG 신뢰)
- route-H4 line 156: "토스트 15초 (H4 시트 §11 / STORY-BIBLE §7.1 확정값) 무시 → late_reply_count++ + 호감도 -3"
- CONVENTIONS §3.7 #5 line 247~249: 동일 룰 + mechanism=h4_reply_speed 마커
- BRANCH-GRAPH §4 line 128: "늦장 답장 (H4 한정) -3 + late_reply_count++"
- toneMatrix.ts: "통과 +1 / 타임아웃 -3 + late_reply_count++" (CHANGELOG line 232 명시)

5곳 일관 ✓.

### L8.5.b H4 대면 KEY 묘사 분기 (warm_supportive + isKey + mechanism 없음)
- CONVENTIONS §3.7 #4 line 241~243 명시
- toneMatrix.ts `computeToneDeltas`에 분기 추가 (CHANGELOG line 142~143)
- ch05_decision 회식 자리4 mechanism 마커 제거 (CHANGELOG line 145)
- ch06_h4_seoyoon 작가 메모 KEY 3개 (시험 응원 / 거리감 / 호감 명시) — 모두 옛 표기 [INC: H4 +10] [KEY:H4:*]로 표기 (line 1090~1094 작가 메모 표). 신표기 [CHOICE: tone=warm_supportive, key=true]로 변환됐는지는 본문 직접 검증 필요 (배치 4 L6).

### L8.6 Ch.5 회식 5지선다 + 모닥불 5지선다 톤 매트릭스 적용

### L8.6.a 검증 한계
- 회식 5지선다·모닥불 5지선다 본문 직접 검증은 ch05_decision.md 별도 부분 읽기 필요 (분량 큼).
- CHANGELOG line 145 명시: "ch05_decision.md 회식 자리4 (H4): mechanism:h4_reply_speed 마커 제거 (회식은 미니게임 X, 대면 KEY로 처리)"
- 자리1~5 톤 분포 검증 (CONVENTIONS §3.7 #6 line 252~258 가이드 5명 균형 분포)는 배치 4 L4·L6에서 본문 직접 grep.

### L8.7 ch01_02b_casual 본문 픽스 검증

### L8.7.a 검증 한계
- CHANGELOG line 200~205 명시: ch01 본문 보정 — "페널티 묘사 → 무뚝뚝하지만 호의적" 변환 (ch01_02b_casual 자리). 본문 직접 grep 필요.
- 배치 5 L5(대사·어휘) 또는 배치 4 L4(씬·연출)에서 본문 직접 검증.

---

## 다음 배치(3)로 넘기는 의존성 / 미해결 질문

### 검증 결과 핸드오프

1. **MASTER-PLAN frozen 잔재 누적 확정**: 배치 1 L0.1.b·c (엔딩 수 / 서브 모드) + 배치 2 L9.5.a (H4 트리거) / L9.5.b (H1 R2, H4 영남대 본3, H5 장유나) / L9.5.c (거절 4단계). **MASTER-PLAN unfreeze 라운드 PM 의사결정 묶음**: 5건 일괄 처리 권장. CHANGELOG 신규 엔트리 "MASTER-PLAN unfreeze 라운드" 단일 트랜잭션.

2. **BRANCH-GRAPH §4·§5 톤 매트릭스 후 stale**: §4 누적 표(L1.3.a) + §5 line 146 메모(L1.5.a). status: done이지만 본문 stale. CHANGELOG review→done 사인오프 시 본문 stale 점검 누락. PM 결정 필요: 본문 stale 갱신 vs cross-reference 추가.

3. **STORY-BIBLE §6.3 HAPPY 키 2개 누락 + H4 ≥70 cross-reference 부재** (L1.4.a·b): STORY-BIBLE status: review (사용자 검증 대기)이므로 다음 검증 라운드에 포함 가능.

4. **route-H4 §END_H4_TRUE ≥80 stale** (L9.2.a): 톤 매트릭스 Step 4가 BRANCH-GRAPH·H4 시트·scriptInterpreter.ts에는 반영됐으나 route-H4에는 누락. CHANGELOG line 47 "본 작업 외 모듈"로 분류돼 갱신 누락. 회귀 처리 필요.

5. **Ch.6 변태 망상 페어 4건 의도 확인** (L8.2.a): PM 의사결정 필요. (a) Ch.6 분기는 별도 카운팅 의도 vs (b) 사용자 체크리스트 "Ch.6 0회" 회귀.

6. **video_meet_seol 호출 누락** (L8.4.a): ch02_anatomy Scene 04에 `[VIDEO: video_meet_seol skipable=true]` 1줄 추가 필요. 단순 추가 — PM 승인 후 즉시 처리 가능.

7. **ch04 cross-reference broken** (L9.3.a): route-common §Ch.4에 변태 망상 페어 발생 챕터 spec 명시 또는 ch04 cross-reference 표현 변경.

### 우선순위 카운트

| 우선순위 | 카운트 | 항목 |
|:---:|:---:|---|
| Critical | 4 | L1.3.a BRANCH-GRAPH §4 누적 표 stale, L1.4.a STORY-BIBLE HAPPY 키 2개 누락, L9.5.a MASTER-PLAN H4 트리거 옛 정의, L9.5.b MASTER-PLAN H1~H5 표 다수 stale, L8.4.a video_meet_seol 호출 누락 |
| Major | 4 | L1.3.b BRANCH-GRAPH §4 변동값 표 옛 룰, L1.5.a BRANCH-GRAPH §5 H3 시간대 메모 stale, L8.2.a Ch.6 변태 망상 페어 의도 확인, L9.2.a route-H4 ≥80 stale |
| Minor | 3 | L1.4.b STORY-BIBLE H4 ≥70 cross-reference 부재, L9.3.a route-common §Ch.4 spec cross-reference broken, L9.5.c MASTER-PLAN 거절 4단계 cross-reference 부재 |
| Nit | 0 | — |

(L8.4.a video_meet_seol 호출 누락은 위 표에서 Critical 5건째로 카운트 — 위 행에서 5개 항목 나열됨)

**누계 (배치 1+2)**: Critical 7 / Major 6 / Minor 6 / Nit 0

### Pass-through (배치 2 검증 무결)

- L1.1 시간선 (2026 캘린더 7/4 토요일 + 본과1 학사 일정 + 카데바 시기)
- L1.2 도달성 6항목 중 5항목 (16개 엔딩, H4 REJECT, SOLO, H5/H4 TRUE 시뮬값) — #6 고립 노드 검증은 배치 4 L10
- L1.4 H4 평가 순서 일관 (BRANCH-GRAPH §6.1 = route-H4 §분기)
- L1.5 KEY 톤 매핑 5/5 일관 (H3 시간대 메모 외)
- L8.1 거절 카톡 4줄 텍스트 8곳 무결 + 8단계 연출 본문 정확 구현
- L8.2 Ch.1~5 + 프롤로그 + ch06_h4 + end_solo_summer 변태 망상 페어 분배 정합 + 자기자각 페어 무결성 + 12세 한도
- L8.3 트루 엔딩 영상 5종 모두 호출 (skipable=true 일관)
- L8.4.b 첫 만남 CG 5종 모두 호출 (명명 패턴 검증은 배치 4)
- L8.5.a H4 미니게임 명세 5곳 일관 (15초 / 통과 +1 / 타임아웃 -3 + count++)

### 검증 한계 (배치 4·5에서 보완)

- L1.3 175개 [CHOICE] 라벨 + 자동 INC 자리 전수 합산 (L14 자동화 영역 — 본 검증에서는 시뮬값 신뢰)
- L8.5.b H4 대면 KEY 본문 신표기 변환 검증 (배치 4 L6)
- L8.6 회식·모닥불 5지선다 톤 분포 (배치 4 L4)
- L8.7 ch01_02b_casual 본문 페널티 묘사 픽스 (배치 5 L5)
- L9.6 CONVENTIONS ↔ 본문 회피 어휘·욕설 grep (배치 5 L5·L11)
- L9.8 자산 매니페스트 ↔ 본문 (배치 4 L4·L10)

### 배치 3 시작 권장

배치 3 (L2 서사·페이싱 + L3 캐릭터)로 진입. 호칭 전환 추적 + 캐릭터 시그니처 어휘 + KEY 톤 ↔ 캐릭터 의미 정합성 검증.
