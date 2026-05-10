---
module: verification-00-meta-setup
hierarchy: 6
depends-on:
  - 00-master/MASTER-PLAN.md
  - 00-master/CONVENTIONS.md
  - 00-master/CHANGELOG.md
  - 00-master/PROGRESS-TRACKER.md
  - 03-story/STORY-BIBLE.md
  - 03-story/BRANCH-GRAPH.md
outputs:
  - SSoT 우선순위 표
  - CHANGELOG 반영 현황
  - 모듈 의존성 그래프
  - 톤 매트릭스 영향 모듈 status 점검
status: done
---

# 검증 보고 — 배치 1: 메타·셋업 (L0)

> 검증일: 2026-04-30
> 범위: L0.1 SSoT 우선순위 매핑 + L0.2 CHANGELOG 반영 현황 + L0.3 모듈 의존성 그래프 + L0.4 톤 매트릭스 영향 모듈 status 점검
> 검증 방침: SSoT 워크플로우 준수 — 본 보고는 발견·제안까지만, 실제 수정은 PM 승인 + CHANGELOG 기록 후 별도 단계.

---

## L0.1 SSoT 우선순위 매핑

### 1.1 hierarchy 분포

| Hierarchy | 모듈 (개수) |
|---:|---|
| 1 (SSoT 최상위) | MASTER-PLAN, CONVENTIONS, STORY-BIBLE, BRANCH-GRAPH, goo-yunmo, side-characters, H1~H5 (10개) + research 3개 |
| 2 (서사) | route-common, route-H1~H5, route-female-pc(deferred), prologue, ch01~ch06, end_solo_summer (18개) |
| 3 (자산) | PROMPT-GUIDE, sprite-list, bg-list, cg-list, video-list (5개) |
| 4 (엔진/UI) | COLOR-TOKENS, ANIMATION-SPEC, UI-SPEC, ARCHITECTURE, SCENE-FORMAT, STATE-SCHEMA, BGM-list, SFX-list (8개) |
| 5 (통합) | INTEGRATION-PLAN (1개) |
| 6 (QA/배포) | QA-PLAN, DEPLOYMENT (2개) |

### 1.2 항목별 결정권 표

| 영역 | 1차 SSoT | 2차 참조 | 충돌 시 우선 |
|---|---|---|---|
| 게임 정체성 (제목/등급/모드/엔딩 수) | MASTER-PLAN §1 | STORY-BIBLE §10 | MASTER-PLAN |
| 엔딩 16개 ID·조건·코드명 | BRANCH-GRAPH §2 | STORY-BIBLE §6.3 | BRANCH-GRAPH |
| H4 거절 평가 순서 | BRANCH-GRAPH §6.1 | route-H4-na-seoyoon §분기, H4 시트 §6 | BRANCH-GRAPH (STORY-BIBLE §6.3 line 94 명시 위임) |
| H4 트루 aff 임계 (≥70 완화) | BRANCH-GRAPH §2 + scriptInterpreter.ts L96 | H4 시트 §6 | BRANCH-GRAPH (CHANGELOG 2026-04-30 Step 4) |
| 호감도 변동 룰 (톤 매트릭스 페널티 -2/-3 포함) | CONVENTIONS §3.7 + toneMatrix.ts | BRANCH-GRAPH §4 | CONVENTIONS §3.7 (Step 1 신설 후 SSoT 격상) |
| KEY 톤 매핑 (H1=mature_serious 등) | CONVENTIONS §3.7 #4 + toneMatrix.ts | BRANCH-GRAPH §5, H1~H5 시트 §6 | CONVENTIONS §3.7 |
| 시간선 (4.5개월 / 7월 초 확장) | STORY-BIBLE §3 | route-common, ch06 본문 | STORY-BIBLE |
| 캐릭터 시그니처 (외모/말투/나이/학번) | H1~H5 / goo-yunmo / side-characters | 시나리오 본문 | 캐릭터 시트 |
| 거절 카톡 4줄 텍스트 | MASTER-PLAN §4.3 | route-H4 §6, ch06_h4_seoyoon 1025~1068 | MASTER-PLAN (변경 금지 명시) |
| 변태 망상 페어 룰 | STORY-BIBLE §7.2 + CONVENTIONS §3.3·§8 | route-common, 시나리오 본문 | STORY-BIBLE §7.2 |
| 회피 어휘 가드레일 (§3.6 #1~#8) | CONVENTIONS §3.6 | 작가 메모 자체점검 | CONVENTIONS |
| 욕설 절대 금지 (2026-04-28) | CONVENTIONS §8 | 모든 채널·등장인물 | CONVENTIONS |
| 씬 태그 / 신·옛 표기법 | SCENE-FORMAT §1.3 | 시나리오 본문 | SCENE-FORMAT |
| 호감도/플래그 상태 스키마 | STATE-SCHEMA | gameStore.ts | STATE-SCHEMA |
| 자산 ID (bg/cg/video/sfx/bgm) | bg-list / cg-list / video-list / SFX-list / BGM-list | 시나리오 본문 호출 | 각 자산 리스트 |

### 1.3 발견 사항

### [Major] L0.1.a 마스터 폴더 4개 파일 모두 YAML frontmatter 누락
- **위치**: `00-master/MASTER-PLAN.md:1`, `00-master/CONVENTIONS.md:1`, `00-master/CHANGELOG.md:1`, `00-master/PROGRESS-TRACKER.md:1`
- **현재 상태**: 4개 파일 모두 첫 줄이 `# 00-master/...` 마크다운 헤더로 시작. YAML frontmatter(`---` 블록) 없음. `module:`, `hierarchy:`, `depends-on:`, `status:` 메타데이터 0건.
- **기대 상태**: CONVENTIONS §1 line 8 — "모든 모듈 .md 최상단에 다음 YAML 프론트매터를 둔다"고 명시. CONVENTIONS 자체가 이 룰을 위반.
- **수정 제안**: 4개 마스터 파일 상단에 frontmatter 추가. `hierarchy: 0` (SSoT 최상위 제로 위계) 또는 `hierarchy: 1`. status는 MASTER-PLAN/CONVENTIONS는 `done` (frozen), CHANGELOG/PROGRESS-TRACKER는 `living` 같은 새 상태값 도입. 또는 CONVENTIONS §1에 "00-master/ 폴더 self-exempt" 예외 명시.
- **영향 범위**: 모든 모듈의 `depends-on: 00-master/MASTER-PLAN.md` 참조가 frontmatter 없는 파일을 가리킴. 의존성 그래프 자동 빌드 시 정합성 오류 가능.

### [Critical] L0.1.b MASTER-PLAN 엔딩 수 표기 stale (15개 + α)
- **위치**: `00-master/MASTER-PLAN.md:20`
- **현재 상태**: `엔딩 수 | **15개** (히로인 5명 × {해피·노멀·배드}) + α(공통 트루엔딩 1개 검토)`
- **기대 상태**: 16개 (히로인 5명 × 4단계 - H4 BAD 거절 흡수 + 단독 노멀 1). STORY-BIBLE §6.3 line 93 명시. CHANGELOG 2026-04-28 단독 엔딩 추가, 2026-04-29 키 매트릭스 동기화로 16개 확정. README도 16개 표기.
- **수정 제안**: `엔딩 수 | **16개** (히로인 5명 × {트루·해피·노멀·배드 — H4 BAD 거절 흡수} + 단독 "혼자 여름방학")`. 다만 MASTER-PLAN line 5 "수정 금지 - 변경이 필요하면 별도 CHANGELOG.md에 기록하고 PM(개발자)의 명시적 승인을 받는다" frozen 정책 + PROGRESS-TRACKER line 51 "MASTER-PLAN frozen 항목 (다음 unfreeze 시점에 일괄 반영)" 명시 → **PM unfreeze 라운드에 일괄 처리 권장**.
- **영향 범위**: MASTER-PLAN frozen 정책이 다른 stale 항목도 누적시키고 있을 가능성 (배치 2 L9 cross-doc 검증에서 추가 색출). 신규 작업자가 MASTER-PLAN을 SSoT로 신뢰 시 16개 엔딩 시스템과 충돌.

### [Major] L0.1.c MASTER-PLAN line 17 "구윤모와 플레이" 서브 모드 stale
- **위치**: `00-master/MASTER-PLAN.md:17`
- **현재 상태**: `모드 | "구윤모로 플레이"(메인) + "구윤모와 플레이"(서브, 20분)`
- **기대 상태**: CHANGELOG 2026-04-29 (line 561) "구윤모와 플레이 서브 모드 v1.0 범위 제외 (v1.1+ 이연)" 결정. README §핵심 결정사항도 v1.0 메인만 명시. PROGRESS-TRACKER line 11 "v1.0 범위: 메인 모드만"으로 명시.
- **수정 제안**: `모드 | "구윤모로 플레이"(메인, v1.0) + "구윤모와 플레이"(서브, v1.1 이연)` — frozen 풀릴 때 일괄.
- **영향 범위**: B와 동일 — frozen unfreeze 라운드 묶음.

---

## L0.2 CHANGELOG 반영 현황

### 2.1 검증 항목 grep 결과 (전수 일치)

| 갱신 항목 | CHANGELOG 라인 | 모듈 명시 | 결과 |
|---|---:|---|:---:|
| 2026-04-28 욕설 절대 금지 룰 | 1131 | CONVENTIONS §8 | ✅ |
| 2026-04-28 단독 엔딩 추가 | 870 외 | STORY-BIBLE §6.3, BRANCH-GRAPH | ✅ |
| 2026-04-28 자기자각 톤 부드럽게 | (욕설 룰과 동일 라운드) | CONVENTIONS §3.3 | ✅ |
| 2026-04-29 키 매트릭스 동기화 | 810 | BRANCH-GRAPH §5 | ✅ |
| 2026-04-29 v1.1 후속 모드 분리 | 561 | route-female-pc deferred | ✅ |
| 2026-04-29 §3.6 가드레일 신규 | 661 | CONVENTIONS §3.6 | ✅ |
| 2026-04-30 엔딩 시기 7.10 확장 | 450 (외부 피드백 라운드 #1 #2) | STORY-BIBLE §3 | ✅ |
| 2026-04-30 외부 피드백 라운드 #1 6단계 | 450 | 다수 모듈 | ✅ |
| 2026-04-30 §3.6 #8 사후 점검 | 365 | 11개 시나리오 | ✅ |
| 2026-04-30 톤 매트릭스 Step 1 (룰+CHANGELOG) | 304 | CONVENTIONS §3.7, MASTER-PLAN §3.5 | ✅ |
| 2026-04-30 톤 매트릭스 Step 3 (Ch.1 시범) | 257 | ch01_ot, toneMatrix.ts | ✅ |
| 2026-04-30 톤 매트릭스 Step 3 일괄 (ch02-ch06) | 197 | 9개 시나리오, ch01_02b_casual 본문 픽스 | ✅ |
| 2026-04-30 톤 매트릭스 Step 4 (트루 도달 + 처방) | 122 | toneMatrix.ts, scriptInterpreter.ts, BRANCH-GRAPH §2, H4 시트 §6, ch05 자리4 | ✅ |
| 2026-04-30 톤 매트릭스 Step 5 (legacy 코멘트 제거) | 66 | 10개 시나리오 (136→0건) | ✅ |
| 2026-04-30 톤 매트릭스 마이그레이션 종합 | 97 | Step 1-5 종합, 19개 status 전환 | ✅ |
| 2026-04-30 review→done PM 사인오프 | 19 (최신) | 19개 모듈 + 11개 마커 제거 | ✅ |

### 2.2 발견 사항

### [Critical] L0.2.a PROGRESS-TRACKER가 톤 매트릭스 마이그레이션 5단계 미반영
- **위치**: `00-master/PROGRESS-TRACKER.md:9` (현재 상태 줄)
- **현재 상태**: "마일스톤 #3 5/5 풀 텍스트 완료 (2026-04-29) + 외부 피드백 라운드 #1 6단계 처리 완료 (2026-04-30) + W4 BGM·코드 스켈레톤 완료" — 톤 매트릭스 마이그레이션 5단계 + 영향 모듈 19개 status 전환 / 5명 트루 도달 가능 / H4 임계 80→70 완화 등 핵심 변경 사실이 PROGRESS-TRACKER 어디에도 보이지 않음.
- **기대 상태**: CHANGELOG line 19, 66, 97, 122, 197, 257, 304에 5단계 + 종합 + 사인오프 모두 기록. PROGRESS-TRACKER 현재 상태 줄에 "톤 매트릭스 마이그레이션 5단계 완료 + 영향 모듈 19개 review→done 전환 (2026-04-30)" 추가 필요.
- **수정 제안**:
  ```
  ## 현재 상태: **마일스톤 #3 5/5 풀 텍스트 완료 (2026-04-29) + 외부 피드백 라운드 #1 6단계 처리 완료 (2026-04-30) + 톤 매트릭스 마이그레이션 5단계 + status 전환 완료 (2026-04-30) + W4 BGM·코드 스켈레톤 완료**
  ```
  + 별도 §"톤 매트릭스 마이그레이션 ✅" 절 신설 (마일스톤 #3 다음, 외부 피드백 라운드 #1 다음 위치). 5단계 요약 + 5명 트루 도달 가능 시뮬 결과 + 19개 status 전환 결과 명시.
- **영향 범위**: PROGRESS-TRACKER line 70 "다음 단계: 사용자 검증 (모든 시나리오 status: review → done) + 마일스톤 #4 (.md→JSON 변환)" — 이미 시나리오 done 전환됐으나 표기는 review→done 미수행처럼 남음. 마일스톤 #3 ✅ 표기와 함께 수정 필요.

### [Minor] L0.2.b PROGRESS-TRACKER §사용자 검증 대기 항목 (line 200~) 갱신 필요
- **위치**: `00-master/PROGRESS-TRACKER.md:200~208`
- **현재 상태**: 사용자 검증 대기 항목으로 "STORY-BIBLE §10 게임 제목 확정 등 / BRANCH-GRAPH §8 16개 엔딩 분포" 명시.
- **기대 상태**: STORY-BIBLE §10 line 168 "사용자 검증 결과 (2026-04-28)" — 게임 제목·단독 엔딩·영상 12개 분배 모두 [x] 체크 완료. BRANCH-GRAPH는 status: done 전환됨 (톤 매트릭스 영향 모듈 19개에 포함). 사용자 검증 대기로 남겨둘 항목이 없음.
- **수정 제안**: §사용자 검증 대기 항목 절을 "사용자 검증 완료 (2026-04-28)"로 갱신 또는 새로운 검증 대기 항목(예: 본 검증 보고서 6개 배치)으로 전환.
- **영향 범위**: 진행 추적 정확성. 외부 검증자가 "현재 사용자 검증 대기 중"이라 오해할 가능성.

---

## L0.3 모듈 의존성 그래프

### 3.1 의존성 트리 (hierarchy 1·2 핵심)

```
MASTER-PLAN (frozen, frontmatter 없음, hierarchy 미표기)
  ↑
  ├── CONVENTIONS (frontmatter 없음)
  │     ↑
  │     └── (모든 hierarchy 1·2 모듈이 의존)
  │
  ├── goo-yunmo (review)
  │     ↑
  │     ├── side-characters (review)
  │     ├── H1~H5 5개 (done)
  │     └── STORY-BIBLE (review)
  │           ↑
  │           ├── BRANCH-GRAPH (done) — H1~H5 시트도 의존
  │           │     ↑
  │           │     ├── route-common (done) — 02-characters/* 전체 의존
  │           │     │     ↑
  │           │     │     └── route-H1~H5 5개 (review) — 시나리오 의존
  │           │     │           ↑
  │           │     │           └── ch01~ch06_*, prologue, end_solo_summer 12개
  │           │     └── route-female-pc (deferred, v1.1)
```

### 3.2 의존성 일관성 검사

- ✅ 모든 hierarchy 1 캐릭터 시트(H1~H5)가 동일 의존성: MASTER-PLAN + CONVENTIONS + goo-yunmo + STORY-BIBLE
- ✅ STORY-BIBLE → goo-yunmo 의존, goo-yunmo는 STORY-BIBLE 미의존 → **순환 없음**
- ✅ BRANCH-GRAPH → STORY-BIBLE → goo-yunmo / BRANCH-GRAPH → H1~H5 (H1~H5도 STORY-BIBLE 의존) → **트리 구조 일관**
- ✅ route-common → BRANCH-GRAPH + STORY-BIBLE + 02-characters/* — 정합
- ✅ side-characters → MASTER-PLAN + goo-yunmo (CONVENTIONS 미의존) — 다른 캐릭터 시트와 비대칭이나 의도 가능

### 3.3 발견 사항

### [Minor] L0.3.a side-characters depends-on에 CONVENTIONS 누락
- **위치**: `02-characters/side-characters.md:5-6`
- **현재 상태**: `depends-on: - 00-master/MASTER-PLAN.md - 02-characters/goo-yunmo.md` — CONVENTIONS 없음
- **기대 상태**: H1~H5 + goo-yunmo는 모두 CONVENTIONS 명시. 사이드 캐릭터도 화자 표기·말투 룰을 따르므로 CONVENTIONS 의존 필요.
- **수정 제안**: depends-on에 `- 00-master/CONVENTIONS.md` 추가.
- **영향 범위**: 의존성 그래프 자동 검사 시 누락 경고. 실제 콘텐츠 영향 없음.

### [Pass-through] L0.3.b 순환 의존성 0건 (Pass)
모든 hierarchy 1·2 모듈 트리 구조 무결. 자기참조·역참조 없음.

---

## L0.4 톤 매트릭스 영향 모듈 status 점검

### 4.1 CHANGELOG line 19 명시 19개 모듈 status 전수 검사

| 영역 | 파일 | 기대 status | 실제 status | 결과 |
|---|---|:---:|:---:|:---:|
| 룰/명세 | `03-story/BRANCH-GRAPH.md` | done | done | ✅ |
| 룰/명세 | `03-story/route-common.md` | done | done | ✅ |
| 룰/명세 | `06-engine/ARCHITECTURE.md` | done | done | ✅ |
| 룰/명세 | `06-engine/SCENE-FORMAT.md` | done | done | ✅ |
| 캐릭터 | `02-characters/heroines/H1-cha-serin.md` | done | done | ✅ |
| 캐릭터 | `02-characters/heroines/H2-yoon-hajeong.md` | done | done | ✅ |
| 캐릭터 | `02-characters/heroines/H3-han-seol.md` | done | done | ✅ |
| 캐릭터 | `02-characters/heroines/H4-na-seoyoon.md` | done | done | ✅ |
| 캐릭터 | `02-characters/heroines/H5-jang-yuna.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch01_ot.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch02_anatomy.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch03_dongsan.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch04_library.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch05_decision.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch06_h1_serin.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch06_h2_hajeong.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch06_h3_seol.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch06_h4_seoyoon.md` | done | done | ✅ |
| 시나리오 | `03-story/scenarios/ch06_h5_yuna.md` | done | done | ✅ |

**19/19 모두 일치** ✅

### 4.2 [Δ pending review] 마커 제거 검사

CHANGELOG line 31~36 명시 11개 마커 제거 대상에 대해 grep `pending review` 잔존 검사:
- ✅ 0건 잔존 (CHANGELOG line 41 명시 "본문 안의 [Δ pending review] 텍스트는 작업 이력의 일부로 의도적 보존" 제외).
- ✅ 보존 항목 [Δ 2026-04-30 ...] 변경 기록 마커는 SCENE-FORMAT line 102, CONVENTIONS line 235에서 발견 → 의도적 보존 (CHANGELOG line 41 명시).

### 4.3 review 유지 모듈 점검 (CHANGELOG line 45~50 명시)

| 모듈 | status | 기대 | 결과 |
|---|:---:|:---:|:---:|
| `03-story/scenarios/prologue.md` | review | review (INC 0개, 마이그레이션 영향 없음) | ✅ |
| `03-story/scenarios/end_solo_summer.md` | review | review (INC 0개) | ✅ |
| `03-story/STORY-BIBLE.md` | review | review (Ch.6 분기 비트 시드 외) | ✅ |
| `03-story/route-H1~H5.md` 5개 | review | review (Ch.6 분기 비트 시드, 본 작업 외) | ✅ |
| `02-characters/goo-yunmo.md` | review | review | ✅ |
| `02-characters/side-characters.md` | review | review | ✅ |
| `04-image-prompts/backgrounds/bg-list.md` | review | review | ✅ |
| `04-image-prompts/sprites/sprite-list.md` | review | review | ✅ |
| `05-ui-design/UI-SPEC.md` | review | review | ✅ |
| `07-content-integration/INTEGRATION-PLAN.md` | review | review | ✅ |
| `08-qa-deployment/QA-PLAN.md` | review | review | ✅ |

**11/11 모두 일치** ✅

### 4.4 그 외 status 점검

| 모듈 | status | 비고 |
|---|:---:|---|
| `06-engine/STATE-SCHEMA.md` | draft | 톤 매트릭스 메모만 명시, GameFlags 스키마 변경 없음. W4 코드 스켈레톤 작업 후 review/done 전환 미수행. **별도 검증 가능 (Minor)** |
| `04-image-prompts/event-cgs/cg-list.md` | draft | W3 자산 생성 대기 (정상) |
| `04-image-prompts/veo-videos/video-list.md` | draft | W3 자산 생성 대기 (정상) |
| `05-ui-design/COLOR-TOKENS.md`, `ANIMATION-SPEC.md` | draft | W4 작업 진행 중 (정상) |
| `08-qa-deployment/DEPLOYMENT.md` | draft | W6 미시작 (정상) |
| `01-research/*` 3개 | draft | "Claude Code가 채울 영역" 명시 (정상) |
| `04-image-prompts/PROMPT-GUIDE.md` | draft | 초기 가이드 (정상) |
| `docs/assets/SFX-list.md` | in-progress | Phase 1 명세 완료, Phase 2 수집 대기 (정상) |
| `docs/assets/BGM-list.md` | done | 8트랙 큐레이션 완료 (정상) |
| `03-story/route-female-pc.md` | deferred | v1.1 이연 (정상) |

### 4.5 발견 사항

### [Minor] L0.4.a STATE-SCHEMA.md 가 draft인 채로 W4 코드 스켈레톤 시점을 지나 톤 매트릭스 마이그레이션까지 거침
- **위치**: `06-engine/STATE-SCHEMA.md:10`
- **현재 상태**: `status: draft`. PROGRESS-TRACKER line 142 "✅ 06-engine/STATE-SCHEMA.md" 표기, line 145 W4 코드 스켈레톤 완료 명시. CHANGELOG 톤 매트릭스 종합 line 103에 STATE-SCHEMA 포함됨 (GameFlags 스키마 변경 없음 명시).
- **기대 상태**: ARCHITECTURE.md, SCENE-FORMAT.md는 모두 done. STATE-SCHEMA만 draft. W4 코드 스켈레톤 완료 + 톤 매트릭스 마이그레이션 영향 검토(변경 없음 결론) 거쳤으므로 review 또는 done이 자연스러움.
- **수정 제안**: PM 확인 후 review 또는 done 전환. CHANGELOG 신규 엔트리 기록.
- **영향 범위**: 진행 추적 정확성. 본 모듈을 의존하는 코드(types.ts, gameStore.ts) 안정성 메시지.

### [Pass-through] L0.4.b 톤 매트릭스 마이그레이션 정합성 (Pass)
19개 모듈 status 전환 + 11개 마커 제거 + legacy 코멘트 0건 + TypeScript 빌드 통과 (CHANGELOG line 52, 93 명시) — 마이그레이션 사이클 정확히 종료.

---

## 다음 배치(2)로 넘기는 의존성 / 미해결 질문

### 검증 결과 핸드오프
1. **MASTER-PLAN frozen 항목 누적 우려**: 본 배치에서 line 17(서브 모드), line 20(엔딩 수) 2건의 stale 발견. 배치 2 L9 cross-doc 검증에서 MASTER-PLAN 다른 절(§3.2 분기 시스템, §4.3 거절 엔딩 등)도 톤 매트릭스 변경 사항 반영 여부 추가 색출 필요.
2. **STORY-BIBLE 톤 매트릭스 §3.7 미반영 의심**: STORY-BIBLE §6.1 호감도 시스템(line 70~74)이 기존 "+1~+5 또는 -1~-5" 표기만, 톤 매트릭스 페널티 -2/-3 / KEY 톤 매핑 / H3 시간대 무관 / H4 임계 70 완화 등 누락 의심. 배치 2 L1.4·L1.5·L9에서 상세 검증.
3. **PROGRESS-TRACKER 갱신 미반영**: 톤 매트릭스 5단계가 PROGRESS-TRACKER 본문에 한 줄도 안 보임. 배치 6 종합 보고 시 PROGRESS-TRACKER 일괄 갱신 권장.
4. **STATE-SCHEMA draft 잔존**: 배치 4(L6 게임 시스템) 검증 시 GameFlags 스키마 ↔ toneMatrix.ts·gameStore.ts 코드 정합 1차 검사 후 status 전환 가능 여부 결정.
5. **MASTER-PLAN/CONVENTIONS frontmatter 누락**: CONVENTIONS §1 룰 자체 위반. PM 결정으로 (a) 4개 마스터 파일에 frontmatter 추가 vs (b) §1에 "00-master/ self-exempt" 예외 명시 중 택일.

### 우선순위 카운트

| 우선순위 | 카운트 | 항목 |
|:---:|:---:|---|
| Critical | 2 | L0.1.b MASTER-PLAN 엔딩 15→16 stale, L0.2.a PROGRESS-TRACKER 톤 매트릭스 미반영 |
| Major | 2 | L0.1.a 마스터 폴더 frontmatter 누락, L0.1.c 서브 모드 stale |
| Minor | 3 | L0.2.b 사용자 검증 대기 항목 stale, L0.3.a side-characters CONVENTIONS 누락, L0.4.a STATE-SCHEMA draft 잔존 |
| Nit | 0 | — |

### Pass-through (검증 무결)
- L0.1 SSoT 우선순위 표 — 결정권 명확, 충돌 해결 룰 BRANCH-GRAPH 위임 정합 (MASTER-PLAN frozen 잔재 제외)
- L0.2 CHANGELOG 16개 갱신 항목 모두 모듈 명시 + 라운드 종합 정확
- L0.3 의존성 트리 순환 없음, hierarchy 1·2 일관
- L0.4 톤 매트릭스 영향 모듈 19개 status + 마커 제거 + legacy 코멘트 정합 (19/19, 11/11, 0건)

### 배치 2 시작 권장 사전 작업
- (선택) Critical 2건은 PM 일괄 unfreeze 라운드 묶음으로 처리 후 배치 2 진입 → 배치 2 결과 안정성 향상.
- (또는) Critical 2건 발견만 기록 후 배치 2 즉시 진입 → 6개 배치 완료 후 종합 보고에서 일괄 처방.

**권장**: 후자. 6개 배치 모두 완료 후 종합 우선순위 큐로 PM 의사결정 효율 ↑.
