---
module: BRANCH-GRAPH
hierarchy: 1
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/STORY-BIBLE.md
  - 02-characters/heroines/H1~H5
outputs:
  - 전체 분기 그래프 (machine-readable)
  - 16개 엔딩 도달 조건
  - 빌드 검증 스크립트의 입력 데이터
status: review
---

# 03-story/BRANCH-GRAPH.md

## 1. 분기 그래프 구조

```
[Title] → [Mode Select]
              ├─ "구윤모로 플레이" → [Prologue]
              └─ "구윤모와 플레이" → [Female PC Route]

[Prologue] → [Ch.1 공통] → [Ch.2 공통] → [Ch.3 공통] → [Ch.4 공통] → [Ch.5 평가]
                                                                          ├─ H1 1위 → [Ch.6 H1 분기] → 엔딩 (TRUE/HAPPY/NORMAL/BAD)
                                                                          ├─ H2 1위 → [Ch.6 H2 분기] → 엔딩 (TRUE/HAPPY/NORMAL/BAD)
                                                                          ├─ H3 1위 → [Ch.6 H3 분기] → 엔딩 (TRUE/HAPPY/NORMAL)
                                                                          ├─ H4 1위 → [Ch.6 H4 분기] → 엔딩 ⚠️ (TRUE/NORMAL/REJECT)
                                                                          ├─ H5 1위 → [Ch.6 H5 분기] → 엔딩 (TRUE)
                                                                          └─ 모든 호감도 <30 → [혼자 여름방학] → END_SOLO_SUMMER (16번째 엔딩, 2026-04-28 확정)
```

## 2. 엔딩 목록 (16개)

| 코드 | 엔딩명 | 분류 | 조건 |
|---|---|---|---|
| `END_H1_TRUE` | 차세린 트루 | TRUE | H1 1위 + ≥80 + 키 3개 통과 |
| `END_H1_HAPPY` | 차세린 해피 | HAPPY | H1 1위 + ≥60 + 키 2개 |
| `END_H1_NORMAL` | 차세린 노멀 | NORMAL | H1 1위 + ≥40 |
| `END_H1_BAD` | 차세린 배드 | BAD | H1 1위 + <40 |
| `END_H2_TRUE` | 윤하정 트루 | TRUE | H2 1위 + ≥80 + 키 3개 |
| `END_H2_HAPPY` | 윤하정 해피 | HAPPY | H2 1위 + ≥60 + 키 2개 |
| `END_H2_NORMAL` | 윤하정 노멀 | NORMAL | H2 1위 + ≥40 |
| `END_H2_BAD` | 윤하정 배드 | BAD | H2 1위 + <40 |
| `END_H3_TRUE` | 한설 트루 | TRUE | H3 1위 + ≥80 + 키 3개 |
| `END_H3_HAPPY` | 한설 해피 | HAPPY | H3 1위 + ≥60 + 키 2개 |
| `END_H3_NORMAL` | 한설 노멀 | NORMAL | H3 1위 + ≥40 |
| `END_H4_TRUE` | 나서윤 트루 | TRUE | H4 1위 + ≥70 + 키 3개 + late_reply ===0 ※ 2026-04-30 Step 4: 80→70 완화 |
| `END_H4_NORMAL` | 나서윤 노멀 | NORMAL | H4 1위 + 60~69 + late_reply ===0 ※ 2026-04-30 Step 4: 60~79→60~69 |
| `END_H4_REJECT` | **나서윤 거절 카톡** ⚠️ | REJECT | **H4 1위 + (late_reply ≥1 OR aff <60) — 호감도 무관 트리거 우선** ※ 2026-05-09: 미니게임 3초 단축에 맞춰 ≥2 → ≥1 강화 |
| `END_H5_TRUE` | 장윤영 트루 | TRUE | H5 1위 + ≥80 + 키 3개 |
| `END_SOLO_SUMMER` | **혼자 여름방학** | NORMAL | **모든 호감도 <30 (단독 엔딩, 16번째)** |

= 16개 엔딩 정확히.

> 참고:
> - H3 BAD, H5 HAPPY/NORMAL/BAD는 의도적으로 제외 (분량 조절).
> - H4의 BAD 자리를 거절 엔딩이 흡수 (별도 `END_H4_BAD` 없음). aff <60도 거절로 라우팅.
> - H4 REJECT 트리거는 답장 지연 ≥1회 우선 평가 (호감도 무관, 2026-05-09 강화). 그 다음에야 호감도 분기.
> - `END_SOLO_SUMMER` (혼자 여름방학)는 2026-04-28 추가 확정. STORY-BIBLE §10 참조.

## 3. 엔딩 데이터 (코드용 JSON)

```json
{
  "endings": [
    {
      "id": "END_H1_TRUE",
      "heroine": "H1",
      "type": "TRUE",
      "conditions": {
        "main_heroine": "H1",
        "affection_min": 80,
        "key_choices_required": 3
      },
      "video": "video_true_serin.mp4",
      "cg": "cg_serin_true",
      "bgm": "bgm_climax",
      "title": "차세린 트루 엔딩 — 분당의 봄"
    },
    {
      "id": "END_H4_REJECT",
      "heroine": "H4",
      "type": "REJECT",
      "conditions": {
        "main_heroine": "H4",
        "trigger": "OR",
        "any_of": [
          { "late_reply_count_min": 2 },
          { "affection_max": 59 }
        ]
      },
      "video": "video_reject_seoyoon.mp4",
      "cg": "cg_seoyoon_reject",
      "bgm": "bgm_sad",
      "title": "BAD ENDING — 답장이 늦어서",
      "special_dialogue": "REJECT_KAKAO_TEXT",
      "note": "2026-04-28 갱신: 답장 지연 ≥2회 (호감도 무관) 우선 평가, 그 외에 aff <60도 거절로 흡수 (H4 BAD 자리)"
    },
    {
      "id": "END_SOLO_SUMMER",
      "heroine": null,
      "type": "NORMAL",
      "conditions": {
        "main_heroine": "SOLO",
        "all_affections_max": 29
      },
      "video": null,
      "cg": null,
      "bgm": "bgm_daily",
      "title": "혼자 여름방학",
      "note": "2026-04-28 추가 확정 (16번째 엔딩). 모든 히로인 호감도 <30일 때 발동. STORY-BIBLE §10."
    }
    // ... 나머지 12개
  ]
}
```

## 4. 호감도 변동 표 (시나리오 작성 시 참조 — 2026-04-30 톤 매트릭스 Step 4 갱신)

> **변동값 SSoT**: 2026-04-30 톤 매트릭스 Step 1 후 CONVENTIONS §3.7 #3 5×5 매트릭스가 변동값 SSoT. 본 표는 옛 룰 요약(이력) — 정확한 변동값은 톤 매트릭스 룩업으로 계산 (`src/engine/toneMatrix.ts`). 옛 자동 본문 INC 자리(카톡 자동 +1, 도서관 합석 +5 등)는 SCENE-FORMAT §1.3b 옛 표기법 호환 룰로 보존.

**옛 룰 (마일스톤 #2 동기화 — 톤 매트릭스 적용 전)**:

| 선택지 강도 | 변동값 | 빈도 |
|---|---|---|
| 매우 좋은 답변 (키 선택지) | **+10** ✓ 정합 | 챕터당 1~2회 |
| 좋은 답변 | +5 또는 +3 | 챕터당 0~1회 |
| 평범한 답변 | +1~+2 | 일반 |
| 부적절한 답변 | -1~-2 | 일반 |
| 매우 부적절 | -3 ~ -5 | 챕터당 0~1회 |
| 늦장 답장 (H4 한정) | -3 + late_reply_count++ | 일반 |

**신 룰 (2026-04-30 톤 매트릭스 — CONVENTIONS §3.7 #3 5×5 매트릭스 우선)**:

- KEY 톤 +10 + 묘사 보너스 +5 = +15 (KEY 자리 분할 누적 패턴, Ch.1~4)
- 톤 매치 +1~+5 (히로인×톤 룩업)
- 톤 미스매치 -2 (예: H1에 `playful_casual`)
- 톤 정반대 + 어색 강조 -3 (예: H1에 이모지 남발 `bright_forward`)
- H4 보정: 톤 매치 베이스 -2 (warm_supportive +3→+1, direct_friendly +5→+3)
- H4 미니게임: 통과(<15s) +1 / 타임아웃 -3 + late_reply_count++
- H4 대면 KEY (warm_supportive + isKey + mechanism 없음): 묘사 보너스 +5 자동
- H3 시간대 갭(밤): mature_serious -4 / warm_supportive -5 / playful_casual +4 (KEY 자리는 시간대 무관)

**한 히로인에게 올인 시 Ch.1~5 누적 (2026-04-30 Step 4 시뮬 + 처방 적용 후)**:

| 히로인 | Ch.1~5 누적 | 트루 임계 | KEY 등록 |
|---|---:|---:|---:|
| H1 | **+113** | ≥80 | 5개 |
| H2 | **+117** | ≥80 | 7개 |
| H3 | **+98** | ≥80 | 6개 |
| H4 | **+93** | ≥70 (Step 4 완화) | 8개 |
| H5 | **+125** | ≥80 | 5개 |

**5명 모두 트루 진입 가능** ✓ (Step 4 처방 후 — `scripts/verifyToneMatrix.ts` 자체 검증 통과).

> Ch.6에서 키 1개 +10 + 좋은 답변 2~3개 + 깊은 모먼트 추가 변동 가능. H4는 의도적으로 가장 어려운 결 — 미니게임 타임아웃 엄격(답장 지연 ≥2 즉시 거절)이라 트루 임계 80→70 완화로 균형 (Step 4 PM 결정).
>
> 옛 시뮬값(2026-04-29 마일스톤 #2: H1+50 / H2+56 / H3+50 / H4+35 / H5+36)은 톤 매트릭스 적용 전 추정. 신 시뮬은 5×5 매트릭스 + 페널티 + H4 보정 + 묘사 보너스 적용 후. 자세한 라운드 이력은 `00-master/CHANGELOG.md` 2026-04-30 톤 매트릭스 Step 4 엔트리 참조.

## 5. 키 선택지 매트릭스 (2026-04-29 마일스톤 #2 동기화 갱신)

> 2026-04-30 메모: 본 매트릭스의 텍스트 라벨은 그대로 두되, 신표기법에서는 [INC: H# +N] [KEY: H# scene_id] 대신 `[CHOICE: tone=..., key=true]` 형태로 변환. KEY 톤 매핑은 CONVENTIONS §3.7 #4 참조 (H1 mature_serious / H2 direct_friendly / H3 warm_supportive **시간대 무관, Step 4 PM 결정** / H5 bright_forward / H4는 미니게임 메커니즘 + 대면 KEY 묘사 분기 둘 다). Step 3 챕터별 마이그레이션에서 일괄 변환.

| 챕터 | H1 키 | H2 키 | H3 키 | H4 키 | H5 키 |
|---|---|---|---|---|---|
| Ch.1 | - | **"잘 부탁할게" (진중)** ← 신규 | - | - | - |
| Ch.2 | - | "괜찮아? 천천히 해" | "정말 죄송합니다" | - | - |
| Ch.3 | "공부 열심히 할게요" | (자동 +1, 키 아님) | - | - | "활기차네, 너" |
| Ch.4 | "괜찮으세요? 좀 쉬세요" | 족보 공유 | "선생님, 식사하셨어요?" | "정중·풀어 답장" (미니게임 1차) | (자동 +1, 키 아님) |
| Ch.5 | **회식 5지선다 (H1)** ← 신규 | **회식 5지선다 (H2)** ← 신규 | **회식 5지선다 (H3)** ← 신규 | 회식 5지선다 (H4) + "정중 답장" (미니게임 2차) | 회식 5지선다 (H5) + "지금 자야 돼, 너도 자" |
| Ch.6 | "누나" 호칭 | "너랑 있으면 멍해져" | "와… 다른 분 같으세요" | (3개 키 통과) | "오빠라고 불러" |

**키 카운트 (Ch.1~5)**:
- H1: 3개 (ch3_first_intro, ch4_care, ch5_join)
- H2: **4개** (ch1_first_intro, ch2_cadaver_calm, ch4_share, ch5_join) — 트루 조건 "key_count ≥ 3" 그대로 유지 (4개 중 3개 통과면 OK)
- H3: 3개 (ch2_apology, ch4_meal, ch5_join)
- H4: 3개 (ch4_first_reply, ch5_join, ch5_dawn_reply)
- H5: 3개 (ch3_first_intro, ch5_join, ch5_late_kakao)
- + Ch.6에서 각 +1 키씩 추가 (총 4~5개 / 히로인)

**Ch.5 회식 5지선다 메모**: 5명 모두에 KEY 부여하되 5지선다 중 1명만 활성화 (선택 1명 +10 + KEY 통과, 나머지 4명 0). 회식 + 모닥불 5지선다 두 개를 같은 히로인에게 집중하면 단일 챕터 +15. **H4는 회식 + 카톡 미니게임 2개로 키 +20 가능 — 거절 트리거 캐릭터의 트루 도달 균형 차원**.

## 6. 분기 결정 알고리즘 (Ch.5 종료 시)

```typescript
type MainBranch = "H1" | "H2" | "H3" | "H4" | "H5" | "SOLO";

function determineMainHeroine(state: GameState): MainBranch {
  const aff = {
    H1: state.flags.H1,
    H2: state.flags.H2,
    H3: state.flags.H3,
    H4: state.flags.H4,
    H5: state.flags.H5,
  };

  const max = Math.max(...Object.values(aff));

  // 모든 호감도 <30 → 단독 엔딩 (16번째, 2026-04-28 확정)
  if (max < 30) {
    return "SOLO";
  }

  // 1위 결정 (동률 시 마지막에 +값 받은 히로인)
  const winner = findWinnerByLastIncrement(aff, state.flags.last_increment_order);
  return winner; // "H1" ~ "H5"
}

function determineEnding(branch: MainBranch, state: GameState): EndingId {
  // 단독 엔딩 (16번째)
  if (branch === "SOLO") {
    return "END_SOLO_SUMMER";
  }

  // H4 전용: 거절 트리거 우선 (2026-04-28 갱신, 2026-05-09 ≥2→≥1 강화)
  if (branch === "H4") {
    // 1) 답장 지연 ≥1회면 호감도 무관 거절 (2026-05-09 미니게임 3초 단축에 맞춰 강화)
    if (state.flags.late_reply_count >= 1) {
      return "END_H4_REJECT";
    }
    // 2) H4 BAD 자리는 거절이 흡수: aff <60도 거절로 라우팅
    if (state.flags.H4 < 60) {
      return "END_H4_REJECT";
    }
    // 3) 일반 분기 (H4는 HAPPY 없음, NORMAL/TRUE만, 임계 ≥70 — 2026-04-30 Step 4 완화)
    if (state.flags.H4 < 70) return "END_H4_NORMAL";
    if (countKeyChoices(state, "H4") >= 3) return "END_H4_TRUE";
    return "END_H4_NORMAL"; // ≥70인데 키 부족 시 fallback
  }

  // H5 전용: TRUE만 존재 (HAPPY/NORMAL/BAD 의도적 제외)
  if (branch === "H5") {
    if (state.flags.H5 >= 80 && countKeyChoices(state, "H5") >= 3) {
      return "END_H5_TRUE";
    }
    // H5는 다른 엔딩이 없으므로 SOLO로 폴백 (1위인데 트루 미달 = 전체 분량 부족)
    // 또는 빌드 검증에서 H5 1위 시 항상 키 3개 + ≥80 도달 가능한지 확인
    return "END_SOLO_SUMMER";
  }

  // H1, H2, H3 일반 분기
  const aff = state.flags[branch] as number;
  const keys = countKeyChoices(state, branch);

  if (aff >= 80 && keys >= 3) return `END_${branch}_TRUE` as EndingId;
  if (aff >= 60 && keys >= 2) return `END_${branch}_HAPPY` as EndingId;
  if (aff >= 40) return `END_${branch}_NORMAL` as EndingId;

  // H3는 BAD 없음 → NORMAL로 폴백
  if (branch === "H3") return "END_H3_NORMAL";
  return `END_${branch}_BAD` as EndingId;
}
```

### 6.1 H4 분기 평가 순서 (사람용 요약)

1. **`late_reply_count >= 1`** → `END_H4_REJECT` (호감도 무관 — 2026-04-28 핵심 변경, 2026-05-09 ≥2→≥1 강화)
2. **`H4 < 60`** → `END_H4_REJECT` (H4 BAD 자리, REJECT가 흡수)
3. **`60 ≤ H4 < 70`** → `END_H4_NORMAL` (Step 4 임계 80→70 완화)
4. **`H4 ≥ 70` + 키 3개** → `END_H4_TRUE` (Step 4 임계 80→70 완화)
5. **`H4 ≥ 70` + 키 부족** → `END_H4_NORMAL` (fallback)

> ⚠️ H4 §6 시트의 의사코드는 "elif aff <60 → 배드 엔딩"으로 표기되어 있으나, BRANCH-GRAPH §2에 별도 `END_H4_BAD` 자리가 없으므로(거절이 흡수) 실제 라우팅은 REJECT다.

### 6.2 H5 도달성 주의

H5는 `END_H5_TRUE`만 존재. H5 1위인데 호감도 <80 또는 키 <3이면 폴백으로 `END_SOLO_SUMMER` 라우팅. 빌드 검증 스크립트에서 "H5 1위 시 키 3개 + ≥80 도달 가능한 경로가 적어도 1개 존재"를 확인해야 함.

## 7. 도달성 검증 (CI 빌드 시 실행)

빌드 시 자동 실행되는 검증:
1. 모든 16개 엔딩이 적어도 1개 경로로 도달 가능한지 확인
2. 모든 분기 노드가 어떤 엔딩으로든 종착하는지 확인 (고립 노드 없음)
3. 호감도 변수가 모든 경로에서 정의되어 있는지 확인
4. **H4 REJECT 도달성**: `late_reply_count ≥ 1`로 도달 가능한 경로 ≥1개 (호감도 무관 트리거 검증, 2026-05-09 ≥2→≥1)
5. **END_SOLO_SUMMER 도달성**: 모든 호감도 <30으로 끝나는 경로 ≥1개
6. **H5 TRUE 도달성**: H5 1위 + ≥80 + 키 3개 통과 경로 ≥1개 (없으면 H5 1위 시 SOLO 폴백 발생)

## 8. 사용자 검증 결과 (2026-04-28)

- [x] **16개 엔딩 분포** — 확정 (단독 엔딩 추가)
- [x] H4의 BAD 자리를 거절 엔딩이 흡수하는 구조 — 확정
- [x] **H4 REJECT 트리거 강화**: 호감도 <50 + 지연 ≥3 → **답장 지연 ≥2 (호감도 무관)** + aff <60 흡수
- [x] **`END_SOLO_SUMMER` (혼자 여름방학) 활성화** — 16번째 엔딩으로 정식 채택
- [ ] 키 선택지 매트릭스 적정성 — 시나리오 풀 텍스트 라운드(W2)에서 재검토

세부 변경 이력은 `00-master/CHANGELOG.md` 2026-04-28 엔트리 참조.
