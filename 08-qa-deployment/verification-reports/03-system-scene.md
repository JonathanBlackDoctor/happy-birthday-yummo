---
module: verification-03-system-scene
hierarchy: 6
depends-on:
  - 08-qa-deployment/verification-reports/00-meta-setup.md
  - 08-qa-deployment/verification-reports/01-macro-consistency.md
  - 08-qa-deployment/verification-reports/02-structure-character.md
  - 06-engine/SCENE-FORMAT.md
  - 06-engine/STATE-SCHEMA.md
  - src/engine/toneMatrix.ts
  - src/engine/types.ts
  - scripts/verifyToneMatrix.ts
  - 03-story/BRANCH-GRAPH.md
outputs:
  - 톤 매트릭스 코드 5×5 정확성 검증
  - SCENE-FORMAT 신·옛 표기 분리 + JUMP 타겟 정합성
  - 명명 일관성 (types.ts ↔ STATE-SCHEMA ↔ BRANCH-GRAPH)
status: done
---

# 검증 보고 — 배치 4: 게임 시스템 + 엔진 포맷 + 씬 연출 (L6·L10·L4)

> 검증일: 2026-04-30
> 범위: L6 게임 시스템(톤 매트릭스 코드 + 명명) + L10 엔진·포맷(JUMP 타겟 + 신·옛 표기) + L4 씬·연출(SCENE-FORMAT)
> 의존: 배치 1·2·3 보고서 — Critical 8 / Major 8 / Minor 7 누계

---

## L6 게임 시스템

### L6.1 toneMatrix.ts 5×5 매트릭스 정확성 — Pass ✓

#### 매트릭스 ↔ CONVENTIONS §3.7 #3 표 1:1 정합

| 톤 | H1 (시트) | H1 (코드) | H2 | H3 (낮) | H4 (보정 후) | H5 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `mature_serious` | +10 KEY | **+10 KEY ✓** | -1 ✓ | +5 / +1(밤) ✓ | +1 ✓ | -2 ✓ |
| `warm_supportive` | +5 | **+5 ✓** | +3 ✓ | +10 KEY (낮) ✓ | +1 (보정 +3→+1) ✓ | +1 ✓ |
| `direct_friendly` | +1 | **+1 ✓** | +10 KEY ✓ | +1 ✓ | +3 (보정 +5→+3) ✓ | +5 ✓ |
| `playful_casual` | -2 | **-2 ✓** | +5 ✓ | -1 / +3(밤) ✓ | +1 ✓ | +5 ✓ |
| `bright_forward` | -1 | **-1 ✓** | +1 ✓ | -1 ✓ | +1 ✓ | +10 KEY ✓ |

코드: `src/engine/toneMatrix.ts:27-64`. CONVENTIONS §3.7 #3 line 215~223 표와 정확 1:1 일치.

#### H3_NIGHT_DELTA 정합

| 톤 | 룰 | 코드 (line 77~83) |
|---|:---:|:---:|
| mature_serious | 낮 +5 → 밤 +1 (-4) | `-4 ✓` |
| warm_supportive | 낮 +10 → 밤 +5 (-5) | `-5 ✓` |
| direct_friendly | 변화 없음 | `0 ✓` |
| playful_casual | 낮 -1 → 밤 +3 (+4) | `+4 ✓` |
| bright_forward | 변화 없음 | `0 ✓` |

CONVENTIONS §3.7 #5 line 248과 정확 일치.

#### KEY_HEROINE_TONE 매핑 정합

`toneMatrix.ts:86-92`:
- H1: 'mature_serious' ✓
- H2: 'direct_friendly' ✓
- H3: 'warm_supportive' (line 89 주석 stale — ↓ L6.5 발견)
- H4: null (미니게임 메커니즘) ✓
- H5: 'bright_forward' ✓

#### computeToneDeltas 분기 정합

코드 검증 (line 114~164):
- ✅ 베이스 매트릭스 룩업 (line 124)
- ✅ H3 NIGHT_DELTA 시간대 보정 (line 127~129)
- ✅ KEY 묘사 보너스 +5 (시간대 무관, line 135~140)
- ✅ H4 미니게임 통과/타임아웃 (line 147~153)
- ✅ H4 대면 KEY 묘사 +5 (warm_supportive + isKey + mechanism 없음, line 154~157)

#### toneToFlagIncs / toneToKeyChoice 정합

- ✅ FLAG_INC 5명 모두 변동값 0 아닌 경우만 발행 (line 179~183)
- ✅ H4 미니게임 타임아웃 → late_reply_count++ (line 186~192)
- ✅ H4 미니게임 통과 시 KEY_CHOICE 발행 (line 209~221)
- ✅ H4 대면 KEY 자리 (warm_supportive + isKey + mechanism 없음) KEY_CHOICE 발행 (line 230~237)
- ✅ H3 KEY 시간대 무관 등록 (Step 4 PM 결정, line 225 주석 명시)

### L6.2 verifyToneMatrix.ts 13개 자체 검증 — Pass ✓ (단 카운트 stale)

검증 항목 (expect 호출 카운트):

| 항목 | 카운트 | 검증 내용 |
|---|:---:|---|
| (a) 5명 KEY 톤 = 매트릭스 최고값 | 5 | H1 mature / H2 direct / H3 warm / H4 null / H5 bright |
| (b) H4 보정 | 2 | direct +3 / warm +1 |
| (c) H1↔H5 정반대 자리 | 2 | mature: H1 +10 vs H5 -2, bright: H5 +10 vs H1 -1 |
| (d) 묘사 보너스 +15 / 미라벨 +10 | 2 | KEY 라벨 효과 |
| (e) H3 KEY 시간대 | 2 | 낮 +15 / 밤 +10 (시간대 무관 변경) |
| (f) H4 대면 KEY | 1 | warm + isKey + mechanism 없음 → +6 (베이스 +1 + 묘사 +5) |
| (g) H4 미니게임 통과 + KEY | 1 | warm + isKey + mechanism + 통과 → +7 (+1+1+5) |

**총 15개 expect 호출** (코드 line 257~320 카운트).

### [Minor] L6.5 verifyToneMatrix.ts 코드 15개 expect vs CHANGELOG 명시 13개 mismatch
- **위치**: `scripts/verifyToneMatrix.ts:243~320` ↔ `00-master/CHANGELOG.md:181`
- **현재 상태**: CHANGELOG line 181 "verifyToneMatrix.ts 자체 검증 13개 항목 모두 통과 (시간대 무관 H3 / H4 대면 KEY 신규 항목 추가)". 실제 코드는 15개 expect 호출.
- **기대 상태**: 둘 중 하나 갱신. Step 4에서 H3 시간대 무관 + H4 대면 KEY 추가로 15개로 늘어났으면 CHANGELOG가 stale. 또는 실제 코드 (a) 항목을 5건 카운트 vs 1건 카운트(KEY 매핑 5명 묶음) 해석 차이일 수 있음.
- **수정 제안**: CHANGELOG 실제 카운트 갱신 또는 verifyToneMatrix 출력 라벨에 "13개 자체 검증" 메모 명시.
- **영향 범위**: 검증 추적 정확성. 외부 검증자가 13개로 알고 있는 경우 카운트 불일치.

### [Minor] L6.6 toneMatrix.ts line 89 주석 stale "낮 한정"
- **위치**: `src/engine/toneMatrix.ts:89`
- **현재 상태**: `H3: 'warm_supportive', // 낮 한정 — H3 KEY는 낮 시간대에서만 묘사 보너스`
- **기대 상태**: Step 4 PM 결정으로 H3 KEY 시간대 무관 변경. 코드 line 132~140 isKey 분기는 시간대 무관 가산. 주석만 stale.
- **수정 제안**: `H3: 'warm_supportive', // 시간대 무관 (Step 4, PM 결정) — KEY 자리는 낮/밤 모두 묘사 보너스 가산`
- **영향 범위**: 코드 정확성에는 영향 없음. 주석 읽는 후속 작업자 혼란.

### L6.3 명명 정합성 검사 — Critical 발견

#### types.ts ↔ STATE-SCHEMA.md
- ✅ types.ts `Affection { H1: number; H2~5 }` ↔ STATE-SCHEMA `flags: { H1, H2~5 }` 일치 (호감도 키 명명)
- ✅ types.ts `late_reply_count` ↔ STATE-SCHEMA `late_reply_count` 일치
- ✅ types.ts `last_increment_order: HeroineId[]` ↔ STATE-SCHEMA 동일 일치
- ✅ types.ts `key_choices: Record<HeroineId, string[]>` ↔ STATE-SCHEMA 동일

types.ts `GameFlags` 인터페이스 ↔ STATE-SCHEMA §2 정확 미러.

### [Minor] L6.7 types.ts `current_scene_id` 필드 STATE-SCHEMA 미반영
- **위치**: `src/engine/types.ts:45` ↔ `06-engine/STATE-SCHEMA.md:58~95`
- **현재 상태**: types.ts GameFlags에 `current_scene_id: string;` 필드. STATE-SCHEMA §2 GameFlags에는 본 필드 없음 (line 95 `// ...` 누락 영역).
- **기대 상태**: STATE-SCHEMA가 SSoT면 types.ts와 동기화. 또는 types.ts가 신규 필드 추가했으면 STATE-SCHEMA 갱신.
- **수정 제안**: STATE-SCHEMA §2 GameFlags에 `current_scene_id: string;` 추가 또는 types.ts에서 SaveSlot의 `currentSceneId`로 대체.
- **영향 범위**: 미사용 가능성. 단순 미동기화.

### [Critical] L6.8 BRANCH-GRAPH §4·§6 명명 stale (3건)
- **위치**: `03-story/BRANCH-GRAPH.md:281, 287, 174~204`
- **현재 상태**:
  - §4 line 281: `affection_H1: 0, // 차세린 호감도 0~100`
  - §4 line 287: `flag_seoyoon_late_reply_count: 0, // 거절 엔딩 트리거`
  - §6 line 174~178: `state.flags.affection_H1` ~ `affection_H5`
  - §6 line 189: `state.flags.lastIncrementOrder` (camelCase)
  - §6 line 202: `state.flags.flag_seoyoon_late_reply_count >= 2`
  - §6 line 226: `state.flags[\`affection_${branch}\` as const]`
- **기대 상태**: types.ts/STATE-SCHEMA 실제 명명:
  - `H1`, `H2`, `H3`, `H4`, `H5` (호감도, `affection_` prefix 없음)
  - `late_reply_count` (snake_case, `flag_seoyoon_` prefix 없음)
  - `last_increment_order` (snake_case, NOT camelCase)
- **수정 제안**: BRANCH-GRAPH §4 line 277~290 코드 블록 + §6 의사코드 라인 일괄 갱신:
  ```javascript
  flags: {
    H1: 0,
    H2: 0,
    H3: 0,
    H4: 0,
    H5: 0,
    last_increment_order: [],
    late_reply_count: 0,
    // ...
  }
  ```
- **영향 범위**: BRANCH-GRAPH status: done (톤 매트릭스 영향 모듈 19개 포함, CHANGELOG line 19 사인오프). 그러나 §4·§6 본문 stale. 외부 검증자가 BRANCH-GRAPH 의사코드를 SSoT로 보고 코드 작성 시 컴파일 에러 또는 런타임 undefined 참조. **types.ts가 동작하는 코드라 게임 작동에는 영향 없음** (BRANCH-GRAPH 의사코드는 명세 문서일 뿐) — 그러나 SSoT 표기 정합성 손상.

### L6.4 카톡 미니게임 15초 타이머 — Pass ✓ (배치 2 L8.5 회귀)

| 위치 | 룰 |
|---|---|
| toneMatrix.ts line 99~105 | `thresholdMs: 15_000`, passDelta +1, failDelta -3 |
| CONVENTIONS §3.7 #5 line 247~249 | mechanism=h4_reply_speed, 15초 |
| STORY-BIBLE §7.1 line 106 | "응답 시간: 나서윤 카톡 한정 15초 제한" |
| H4 시트 §11 line 161 | "15초 안에 답장하기 누르지 않거나 나중에 선택 시 late_reply_count++" |
| route-H4 line 156 | "토스트 15초 (H4 시트 §11 / STORY-BIBLE §7.1 확정값)" |
| BRANCH-GRAPH §4 line 128 | "늦장 답장 (H4 한정) -3 + late_reply_count++" |
| SCENE-FORMAT §1.3a line 127 | "통과(<15000ms) 시 H4 +1 추가 + KEY 통과 기록. 타임아웃 시 H4 -3 + late_reply_count++" |

7곳 일관 ✓.

---

## L10 엔진·포맷 호환성

### L10.1 SCENE-FORMAT 신·옛 표기 분리 — Pass ✓

- ✅ §1.3a 신표기법 (line 102~134): `[CHOICE: ... {tone:..., key:true, descriptor:..., mechanism:...}]`
- ✅ §1.3b 옛 표기법 (line 136~146): `[INC: H# +N]` / `KEY:H#:scene_id` 호환
- ✅ §5 line 251 검증 룰: "한 챕터 안 신표기법(`tone:`)과 옛 표기법(`[INC: H# +N]`)이 같은 선택지에서 공존 금지 (이중 가산 방지). 챕터 단위로 한 표기법만 유지."

### [Critical] L10.2 JUMP placeholder 5건 — 모든 챕터 간 흐름 끊김
- **위치**:
  - `prologue.md:319` `[JUMP: ch01_ot_first_day]` (실제 ch01 첫 씬: `ch01_01_ot_intro`)
  - `ch01_ot.md:460` `[JUMP: ch02_anatomy_first_day]` (실제 ch02 첫 씬: `ch02_01_anatomy_morning`)
  - `ch02_anatomy.md:523` `[JUMP: ch03_dongsan_visit]` (실제 ch03 첫 씬: `ch03_01_dongsan_lobby`)
  - `ch03_dongsan.md:584` `[JUMP: ch04_library_night]` (실제 ch04 첫 씬: `ch04_01_library_late`)
  - `ch04_library.md:788` `[JUMP: ch05_branch_decision]` (실제 ch05 첫 씬: `ch05_01_test_end`)
- **현재 상태**: 5/5 placeholder 잔존. 각 본문 작가 메모(prologue:342, ch01:509, ch02:569, ch03:640, ch04:938)에 "placeholder임" 자체 명시.
- **기대 상태**: SCENE-FORMAT §5 line 244 "모든 next: 또는 JUMP: 가 실제 존재하는 씬 가리킴". 실제 첫 씬 ID로 교체:
  | placeholder | 갱신 대상 |
  |---|---|
  | `ch01_ot_first_day` | `ch01_01_ot_intro` |
  | `ch02_anatomy_first_day` | `ch02_01_anatomy_morning` |
  | `ch03_dongsan_visit` | `ch03_01_dongsan_lobby` |
  | `ch04_library_night` | `ch04_01_library_late` |
  | `ch05_branch_decision` | `ch05_01_test_end` |
- **수정 제안**: 5건 일괄 갱신. 단순 텍스트 교체. 각 시나리오 작가 메모 placeholder 명시 라인도 함께 정리.
- **영향 범위**: 게임 작동 시 챕터 흐름 끊김 (PROD blocking). W5 .md→JSON 변환 단계 SCENE-FORMAT §5 검증 룰 자동 색출 — 본 발견은 정적 검증으로 사전 색출. **시나리오 본문 status: done이지만 본 placeholder 잔존은 done 사인오프 점검 누락**.

### [Major] L10.3 KEY:H#: 옛 표기 잔존 29건 (10개 시나리오)
- **위치**: 총 29건 (ch01: 3, ch02: 2, ch03: 2, ch04: 4, ch05: 2, ch06_h1: 4, ch06_h2: 3, ch06_h3: 3, ch06_h4: 3, ch06_h5: 3)
- **현재 상태**: 톤 매트릭스 Step 3 마이그레이션 후에도 옛 표기 `KEY:H#:scene_id` 잔존.
- **기대 상태**: SCENE-FORMAT §1.3a 신표기 `[CHOICE: ... {tone:..., key:true, descriptor:..., mechanism:...}]`로 변환. CHANGELOG line 89 명시 "자동 본문 INC 자리는 옛 표기 유지가 표준" — 그러나 KEY 라벨은 자동 자리가 아닌 의도 자리이므로 신표기 변환 대상.
- **수정 제안**: 29건 KEY:H#: 패턴이 자동 자리 보존(의도)인지 미변환(stale)인지 챕터별 검토. SCENE-FORMAT §5 line 251 "챕터 단위로 한 표기법만 유지" 룰 위반 가능성 확인.
- **영향 범위**: 컴파일러(W5 .md→JSON 변환)에서 옛 표기 `KEY:H#:` ↔ 신표기 `key:true` 둘 다 처리한다면 동작 영향 없음. 그러나 챕터 안 신·옛 공존 시 이중 가산 위험 (SCENE-FORMAT §5 line 251).

배치 2 L9.F에서 발견된 [INC: H#] 옛 표기 46건 + 본 KEY:H#: 29건 = **총 75건 옛 표기 잔존**.

### L10.4 자산 ID 명명 패턴 일관성 — 부분 검증

배치 2 L8.4.b에서 발견된 첫 만남 CG 5종 명명 비통일:
- cg_serin_first_meet ✓ 패턴 1
- cg_hajeong_anatomy (Ch.2 카데바) — 패턴 2 (장소 기반)
- cg_seol_lab_first (Ch.2 실험실) — 패턴 3 (`first` 위치 다름)
- cg_seoyoon_first_meet ✓ 패턴 1
- cg_yuna_booth (Ch.3 부스) — 패턴 2 (장소 기반)

비통일 명명은 의도된 패턴(장소 기반 ID)이거나 변환 누락 가능. **검증 한계**: cg-list.md 직접 정합 검증은 배치 5 또는 별도 자동화.

---

## L4 씬·연출

### L4.1 SCENE-FORMAT 디렉티브 일관 사용 — Pass ✓

SCENE-FORMAT §1.1 line 54~80 명시 디렉티브 30+ 종류:
- 씬 메타: `# Scene:`, `# Hint:` ✓
- 비주얼: `[BG:]`, `[CHARACTER:]`, `[CHARACTER_HIDE:]`, `[CG:]`, `[CG_HIDE]`, `[VIDEO:]` ✓
- 오디오: `[BGM:]`, `[BGM_STOP]`, `[SFX:]` ✓
- 대사: `[캐릭터명] 대사`, `[캐릭터명 모놀로그] 텍스트`, `[지문] 텍스트` ✓
- 카톡: `[KAKAO]...[/KAKAO]`, `[KAKAO_TIMER:]` ✓
- 분기: `[CHOICE]`, `[FLAG:]`, `[INC:]`, `[KEY:]`, `[JUMP:]`, `[IF:]`, `[EVALUATE_BRANCH]`, `[ENDING:]` ✓
- (2026-04-30 추가) `[CHOICE: ... {tone:..., key:true, descriptor:..., mechanism:...}]` ✓

### L4.2 씬 ID 명명 규칙 — Pass ✓

샘플 검증 (10/10 시나리오):
- `prologue_01_home`, `prologue_02_train`, `prologue_03_studio` ✓
- `ch01_01_ot_intro`, `ch01_02_meet_hajeong`, `ch01_03_kakao_evening` ✓
- `ch02_01_anatomy_morning`, `ch02_02_cadaver_first` ✓
- `ch03_01_dongsan_lobby`, `ch03_02_serin_meet` ✓
- `ch04_01_library_late`, `ch04_02_cafe_late`, `ch04_03_lab_late` ✓
- `ch05_01_test_end`, `ch05_02_pub_first` ✓
- `ch06_h?_NN_*` 분기별 ID 패턴 ✓
- `end_solo_summer_main` ✓

명명 규칙: `{chapter}_{NN}_{event}` + 분기는 `{chapter}_{NN}b_{branch}` (예: `ch01_02b_serious`).

### L4.3 영상 12개 분배 — 11/12 호출 (배치 2 L8.4.a 회귀)

| 영상 | 호출 위치 | 상태 |
|---|---|:---:|
| video_opening | (타이틀 화면 자동 재생, 시나리오 본문 호출 없음) | 검증 한계 |
| video_meet_hajeong | ch01_ot.md:88 | ✓ |
| video_meet_seol | **Ch.2 본문 호출 누락** (ch06_h3:1078 작가 메모는 "트리거됨"으로 표기) | ❌ |
| video_meet_serin | ch03_dongsan.md:157 | ✓ |
| video_meet_yuna | ch03_dongsan.md:339 | ✓ |
| video_meet_seoyoon | ch04_library.md:458 | ✓ |
| video_true_serin | ch06_h1_serin.md:667 | ✓ |
| video_true_hajeong | ch06_h2_hajeong.md:757 | ✓ |
| video_true_seol | ch06_h3_seol.md:709 | ✓ |
| video_true_seoyoon | ch06_h4_seoyoon.md:879 | ✓ |
| video_true_yuna | ch06_h5_yuna.md:867 | ✓ |
| video_reject_seoyoon | ch06_h4_seoyoon.md:1056 (skipable=false) | ✓ |

**11/12 호출 + video_meet_seol 누락** (배치 2 Critical 카운트 회귀).

### L4.4 BGM 큐 STORY-BIBLE §9 일관성 — 검증 한계

배치 5에서 본문 BGM 큐 grep으로 정밀 검증:
- 거절 엔딩 → bgm_sad ✓ (배치 2 L8.1.b 확인)
- 트루 엔딩 → bgm_climax ✓ (BRANCH-GRAPH §3 JSON 명시)
- 단독 엔딩 → bgm_daily (BRANCH-GRAPH §3)
- 카톡 모달 / 변태 망상은 본문 직접 검증 필요

### L4.5 H4 미니게임 4곳 + 대면 KEY 자리 마크업 일관성

ch06_h4_seoyoon 작가 메모 line 1090~1094 KEY 3개 (시험 응원 / 거리감 / 호감 명시) — 톤 매트릭스 신표기 변환 검증 필요. 옛 표기 `KEY:H4:ch6_h4_*` 잔존 가능성 (L10.3 발견 일부).

ch04 / ch05 H4 미니게임 자리 마크업 (mechanism:h4_reply_speed) 정합성은 본문 직접 grep 필요. 검증 한계 — 배치 5 또는 W5 컴파일러 자동 색출.

---

## 다음 배치(5)로 넘기는 의존성 / 미해결 질문

### 검증 결과 핸드오프

1. **JUMP placeholder 5건 즉시 처방 가능** (L10.2): 단순 텍스트 교체. 본문 placeholder 메모 라인도 함께 정리. 챕터 흐름 PROD blocking이라 우선순위 최상.

2. **BRANCH-GRAPH §4·§6 명명 stale** (L6.8): types.ts/STATE-SCHEMA 실제 명명으로 갱신. 명세 SSoT 정합. **이미 BRANCH-GRAPH는 status: done — 본문 stale 점검 사인오프 누락이 패턴**.

3. **KEY:H#: 옛 표기 29건** (L10.3): 챕터별 자동 자리 vs 미변환 분리 검토. SCENE-FORMAT §5 line 251 "챕터 단위로 한 표기법만 유지" 룰 회귀 검증.

4. **toneMatrix.ts 주석 stale + verifyToneMatrix.ts 카운트 mismatch** (L6.5·6.6): 단순 텍스트 갱신.

5. **types.ts `current_scene_id` 필드 STATE-SCHEMA 미반영** (L6.7): 단방향 동기화.

6. **자산 ID 매니페스트 ↔ 본문** + **BGM/SFX 큐 본문 검증**: 배치 5 또는 W5 컴파일러 자동.

### 우선순위 카운트

| 우선순위 | 카운트 | 항목 |
|:---:|:---:|---|
| Critical | 2 | L10.2 JUMP placeholder 5건 (챕터 흐름 끊김), L6.8 BRANCH-GRAPH §4·§6 명명 stale |
| Major | 1 | L10.3 KEY:H#: 옛 표기 29건 |
| Minor | 3 | L6.5 verifyToneMatrix 카운트 mismatch, L6.6 toneMatrix.ts line 89 주석 stale, L6.7 types.ts `current_scene_id` STATE-SCHEMA 미반영 |
| Nit | 0 | — |

**누계 (배치 1+2+3+4)**: Critical 10 / Major 9 / Minor 10 / Nit 0

### Pass-through (배치 4 검증 무결)

- L6.1 toneMatrix.ts 5×5 매트릭스 (CONVENTIONS §3.7 #3과 1:1 일치)
- L6.1 H3_NIGHT_DELTA (5종 시간대 보정 정합)
- L6.1 KEY_HEROINE_TONE (5/5 매핑, H4 null 정합)
- L6.1 H4_REPLY_SPEED (15000ms / +1 / -3 정합)
- L6.1 computeToneDeltas + toneToFlagIncs + toneToKeyChoice (Step 4 처방 모두 반영)
- L6.2 verifyToneMatrix.ts 자체 검증 항목 (a)~(g) 모든 expect 통과 보장
- L6.3 types.ts ↔ STATE-SCHEMA §2 명명 정합 (current_scene_id 외)
- L6.3 types.ts EndingId 16개 (BRANCH-GRAPH §2 미러)
- L6.3 types.ts ToneTag 5종 / SceneTime / ChoiceMechanism / SceneCommand 모든 타입 정합
- L6.3 types.ts Choice 신표기 필드 (tone/isKey/descriptor/mechanism/replyTimeMs)
- L6.4 카톡 미니게임 15초 타이머 7곳 일관
- L10.1 SCENE-FORMAT §1.3a 신표기 + §1.3b 옛 표기 분리 명확
- L10.1 SCENE-FORMAT §5 검증 룰 8개 명시 (Step 4 항목 3개 추가)
- L4.1 SCENE-FORMAT 디렉티브 일람 30+ 종류 정의 일관
- L4.2 씬 ID 명명 규칙 10/10 시나리오 일관

### 검증 한계 (배치 5에서 보완)

- L10.3 자동 [INC] vs 미변환 KEY: 챕터별 정밀 검토
- L4.4 BGM/SFX 큐 본문 grep
- L4.5 H4 미니게임 4곳 mechanism 마커 본문 grep
- L4.3 video_opening 호출 위치 (타이틀 화면 시스템 코드 직접 검증 필요)
- L10.4 자산 ID 매니페스트 ↔ 본문 정합 (`src/scenes/manifest.ts` 직접 검증 또는 W5 컴파일러)

### 배치 5 시작 권장

배치 5 (L5 대사·어휘 + L7 도메인 리얼리즘 + L11 등급·안전·민감도)로 진입. 본문 회피 어휘·욕설·AI 클리셰 grep + 의대 학사·실명·12세 등급 검증.
