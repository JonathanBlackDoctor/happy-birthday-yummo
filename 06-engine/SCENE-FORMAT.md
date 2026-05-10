---
module: SCENE-FORMAT
hierarchy: 4
depends-on:
  - 06-engine/ARCHITECTURE.md
  - 00-master/CONVENTIONS.md
outputs:
  - 시나리오 .md → 씬 JSON 변환 스펙
  - 시나리오 작가 + Claude Code가 따를 정확한 문법
status: review
# 2026-05-08 자산 통합 검증 라운드 후속 ④a + 대규모 동선 재설계 1차로 status done→review:
# - VIDEO 디렉티브 skipable 옵션 정식 제거 (자산 통합 검증 후속, 2026-05-08)
# - CHARACTER 디렉티브 6슬롯 모델 (앞줄 left/center/right + 뒷줄 left_back/center_back/right_back) (대규모 동선 재설계 1차, 2026-05-08)
---

# 06-engine/SCENE-FORMAT.md

> 시나리오 .md (사람이 쓰기 쉬운 형식) → 씬 JSON (엔진이 실행하는 형식) 변환 명세.
> 변환 도구: `scripts/compile-scene.ts` (Claude Code가 작성).

## 1. 시나리오 .md 문법

CONVENTIONS.md §3 표기를 그대로 사용. 추가 디렉티브:

```markdown
# Scene: ch01_intro
# Hint: chapter=1, time="2026-03-02 morning"

[BG: 캠퍼스_낮 fade]
[BGM: 일상]

[지문] 본과 1학년 첫 등교날 아침. 캠퍼스에 봄볕이 가득하다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 진짜로... 본과 1학년이 됐네.
[구윤모 모놀로그] 분당에서 KTX 타고 내려온 게 어제 같은데.

[SFX: 카톡_알림]

[구윤모] 어 카톡.

[KAKAO]
- {speaker:김규민} 야 윤모 어디?
- {speaker:구윤모} 본관 앞ㅇㅇ
- {speaker:김규민} ㄱㄱ 강의실
[/KAKAO]

[CHOICE]
- "재훈한테 빨리 갈게"  → +2 H_friend → next: ch01_classroom_a
- "주변 더 둘러본다"     → next: ch01_courtyard
[/CHOICE]
```

### 1.1 디렉티브 일람

| 디렉티브 | 형식 | 설명 |
|---|---|---|
| `# Scene:` | `# Scene: scene_id` | 씬 ID (필수, 첫 줄) |
| `# Hint:` | `# Hint: chapter=N, time="..."` | 메타 (선택) |
| `[BG: 이름 transition]` | `fade`, `cut` | 배경 |
| `[BGM: 트랙]` | trackName + optional `volume=0.7 fade=2` | 음악 |
| `[BGM_STOP fade]` | optional fade | 음악 정지 |
| `[SFX: 사운드]` | | 효과음 |
| `[CHARACTER: 이름 위치 표정 transition]` | 위치 6슬롯: 앞줄 `left`/`center`/`right` (z=2, max-h 90%, X 25/50/75%) + 뒷줄 `left_back`/`center_back`/`right_back` (z=1, max-h 75%, X 30/50/70%). transition: fade/slide. 4명+ 동시 등장 시 뒷줄에 군중 배치 (자산 통합 검증 후속 대규모 동선 재설계 2026-05-08). | 캐릭터 등장 |
| `[CHARACTER_HIDE: 이름 transition]` | | 캐릭터 퇴장 |
| `[CG: 이미지 cgId]` | | 이벤트 CG 풀스크린 |
| `[CG_HIDE]` | | CG 닫기 |
| `[VIDEO: 파일]` | | VEO 영상 재생 (모든 영상 끝까지 재생, 자산 통합 검증 라운드 후속 ④a 2026-05-08 — `skipable` 옵션 제거. VideoLayer.tsx가 PM 결정으로 무시) |
| `[캐릭터명] 대사` | `(감정)` 가능 | 일반 대사 |
| `[캐릭터명 모놀로그] 텍스트` | `(망상 시작)` 등 subtype | 모놀로그 |
| `[지문] 텍스트` | | 3인칭 서술 |
| `[KAKAO] ... [/KAKAO]` | 안에 메시지 리스트 | 카톡 모달 |
| `[KAKAO_TIMER: 15] ... [/KAKAO]` | 답장 타이머 활성 | H4 거절 핵심 |
| `[CHOICE] ... [/CHOICE]` | 리스트로 선택지 | 분기 |
| `[FLAG: key=value]` | 플래그 설정 | |
| `[INC: H1 +5]` | 호감도 변동 | |
| `[KEY: H1 ch3_first]` | 키 선택지 통과 기록 | |
| `[JUMP: scene_id]` | 다른 씬으로 점프 | |
| `[IF: condition] ... [ELSE] ... [/IF]` | 조건 분기 | |
| `[EVALUATE_BRANCH]` | Ch.5 종료 자동 분기 | |
| `[ENDING: END_H1_TRUE]` | 엔딩 호출 | |
| `[SCENE_CUE: 라벨]` | 비기능 메타 (연출 단계 명시 레이블) | UI 미표시, 즉시 advance. DEV 빌드만 콘솔 노출. 거절 8단계 등 단계별 연출 가이드 |

### 1.2 카톡 메시지 문법

```
[KAKAO]
- {speaker:차세린, delay:500} 학생, 길 잃었나요?
- {speaker:구윤모, typing:true} 아... 견학생인데요
- {speaker:차세린, delay:1500} 아하, 이쪽 아니에요. 따라오세요
[/KAKAO]
```

답장 타이머:
```
[KAKAO_TIMER: 15]
- {speaker:나서윤} 오늘 잘 들어가셨어요?
[CHOICE_KAKAO]
- "잘 들어왔어요!" → +3 H4 → next: continue
- (타임아웃) → +late_reply_count → -3 H4 → next: continue
[/CHOICE_KAKAO]
[/KAKAO_TIMER]
```

### 1.3 선택지 문법 [Δ 2026-04-30 톤 매트릭스 도입 — 신표기법 권장, 옛 표기법은 Step 3 마이그레이션 동안 한시적 공존]

#### 1.3a 신표기법 (권장, CONVENTIONS §3.7)

```
[CHOICE]
- "선배님, 무리 마시고 천천히 하세요" {tone:mature_serious, key:true, descriptor:quiet_care} → next: scene_id_a
- "한 잔 더 가요!" {tone:playful_casual} → next: scene_id_b
- "야 너 이번 시험 족보 알아?" {tone:direct_friendly, key:true} → next: scene_id_c
[/CHOICE]
```

선택지마다 톤 태그(5종) 1개를 박는다. 점수는 히로인×톤 매트릭스 룩업이 5명에게 자동 적용. KEY 라벨이 본 히로인 KEY 톤과 매치되면 묘사 보너스 +5 가산.

H4 미니게임 자리:
```
[KAKAO_TIMER: 15]
- {speaker:나서윤} 오늘 잘 들어가셨어요?
[CHOICE_KAKAO]
- "잘 들어왔어요!" {tone:warm_supportive, mechanism:h4_reply_speed} → next: continue
- (타임아웃) {mechanism:h4_reply_speed, replyTimeMs:timeout} → next: continue
[/CHOICE_KAKAO]
[/KAKAO_TIMER]
```

`replyTimeMs`는 런타임에 채워짐. 통과(<15000ms) 시 H4 +1 추가 + KEY 통과 기록. 타임아웃 시 H4 -3 + `late_reply_count++`.

H3 시간대 갭 자리:
```
# Scene: ch04_lab_late
# Hint: chapter=4, time="2026-04-29 23:30", toneTime=night
```
씬 헤더에 `toneTime=night` 마커 시 H3 매트릭스에 밤 보정 적용. 기본은 `day`.

#### 1.3c activeHeroines — 호감도 변동 적용 명단 (2026-05-08 추가)

씬 헤더에 `active=H1,H2` 마커로 본 씬의 호감도 변동을 적용할 H 목록을 박는다.
미박이거나 빈 배열이면 기존 5명 톤 매트릭스 결과 그대로 적용(점진 마이그레이션 — 기존 12개 챕터 무영향).

```
# Scene: ch01_05_serin_cafe
# Hint: chapter=1, active=H1
```

`active=H1` → 본 씬의 모든 선택지 톤 매트릭스 결과 중 H1만 적용. H2~H5 점수 변동 X. KEY 자리도 H1만 인정.

회식·펜션처럼 5명 모두 등장하는 씬:
```
# Scene: ch05_02_dinner
# Hint: chapter=5, active=H1+H2+H3+H4+H5
```

H4 미니게임(`mechanism:h4_reply_speed`)과 `late_reply_count`는 active 필터 무관 — H4 거절 엔딩 시스템 결과라 항상 적용.

UI 영향: AffectionToastStack은 active 필터로 적용된 H만 토스트로 표시. "한 H 단독 씬에 다른 H 토스트가 뜨는 어색함"이 사라짐. (UI-SPEC §11)

#### 1.3b 옛 표기법 (Step 3 마이그레이션 동안 한시적 호환)

```
[CHOICE]
- "선택지 텍스트 1" → +5 H1 → +1 H2 → next: scene_id_a
- "선택지 텍스트 2 (키 선택지)" → +10 H1 → KEY:H1:ch3_first → next: scene_id_a
- "선택지 텍스트 3"  → -2 H1 → next: scene_id_b
[/CHOICE]
```

기존 `[INC: H# +N]` / `KEY:H#:scene_id` 표기는 신표기법과 같은 `Choice.effects`로 컴파일됨. Step 3 챕터별 마이그레이션 후 본 단락은 §1.3a로 일원화 예정. 두 표기법 공존 시 신표기법이 우선(엔진 룩업이 톤 점수 + 옛 effects 둘 다 적용 → 의도치 않은 이중 가산 방지를 위해 마이그레이션 중인 챕터는 한 종류만 유지).

`→ next:`가 같으면 후속 분기는 같지만 호감도만 다른 경우.

## 2. 컴파일된 씬 JSON 형식

```json
{
  "id": "ch01_intro",
  "meta": {
    "chapter": 1,
    "time": "2026-03-02 morning"
  },
  "commands": [
    { "type": "BG", "image": "bg_kmu_main", "transition": "fade" },
    { "type": "BGM", "track": "bgm_daily" },
    { "type": "NARRATION", "text": "본과 1학년 첫 등교날 아침. 캠퍼스에 봄볕이 가득하다." },
    { "type": "CHARACTER", "id": "yunmo", "sprite": "yunmo_default", "position": "center", "transition": "fade" },
    { "type": "MONOLOGUE", "speaker": "구윤모", "text": "진짜로... 본과 1학년이 됐네." },
    { "type": "MONOLOGUE", "speaker": "구윤모", "text": "분당에서 KTX 타고 내려온 게 어제 같은데." },
    { "type": "SFX", "sound": "sfx_katalk_notify" },
    { "type": "DIALOGUE", "speaker": "구윤모", "speakerId": "yunmo", "text": "어 카톡." },
    {
      "type": "KAKAO",
      "messages": [
        { "sender": "side_kyumin", "text": "야 윤모 어디?" },
        { "sender": "yunmo", "text": "본관 앞ㅇㅇ" },
        { "sender": "side_kyumin", "text": "ㄱㄱ 강의실" }
      ]
    },
    {
      "type": "CHOICE",
      "choices": [
        {
          "text": "선배님, 무리 마시고 천천히 하세요",
          "tone": "mature_serious",
          "isKey": true,
          "descriptor": "quiet_care",
          "next": "ch05_h1_route"
        },
        {
          "text": "한 잔 더 가요!",
          "tone": "playful_casual",
          "next": "ch05_drunk_path"
        }
      ]
    }
  ]
}
```

## 3. 컴파일러 (`scripts/compile-scene.ts`)

```typescript
// 사용: npx tsx scripts/compile-scene.ts docs-internal/03-story/scenes/*.md → src/scenes/*.scene.json

interface CompilerOptions {
  inputDir: string;     // .md 시나리오 폴더
  outputDir: string;    // .scene.json 출력 폴더
  validateOnly?: boolean;
}

function compileScene(mdContent: string): SceneJSON {
  const lines = mdContent.split('\n');
  const commands: SceneCommand[] = [];
  let id = '';
  let meta: any = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# Scene:')) { id = line.replace('# Scene:', '').trim(); continue; }
    if (line.startsWith('# Hint:')) { meta = parseMetaHint(line); continue; }
    
    const cmd = parseLine(line, lines, i);
    if (cmd) commands.push(cmd);
  }
  
  return { id, meta, commands };
}
```

## 4. 변수 표현식 (조건 분기)

`[IF:]`에서 사용 가능한 표현식:

```
[IF: H1 >= 60]
[IF: H1 >= 60 AND key_choices.H1 includes 'ch4_care']
[IF: late_reply_count >= 3]
[IF: visited_scenes includes 'ch04_seoyoon_meet']
```

파서는 안전한 평가만 (eval 금지). 화이트리스트 연산자.

## 5. 검증 룰 (컴파일 시 체크)

- 씬 ID 중복 없음
- 모든 `next:` 또는 `JUMP:` 가 실제 존재하는 씬 가리킴
- 모든 자산 (`BG`, `BGM`, `SFX`, `CHARACTER` 스프라이트, `CG`, `VIDEO`)이 매니페스트에 존재
- 모든 `KEY:` 가 BRANCH-GRAPH.md 키 매트릭스에 존재
- `[CHOICE]`의 모든 분기가 `next:` 가짐
- `[KAKAO_TIMER:]` 안에는 반드시 `[CHOICE_KAKAO]`로 분기 닫힘
- `[ENDING:]` 호출이 BRANCH-GRAPH.md 16개 ID 중 하나 (END_SOLO_SUMMER 포함)
- **(2026-04-30 톤 매트릭스)** `tone` 필드는 `ToneTag` 5종 중 하나 (mature_serious / warm_supportive / direct_friendly / playful_casual / bright_forward)
- **(2026-04-30)** `mechanism: 'h4_reply_speed'` 마커는 `[KAKAO_TIMER:]` 안 선택지에만 허용
- **(2026-04-30)** 한 챕터 안 신표기법(`tone:`)과 옛 표기법(`[INC: H# +N]`)이 같은 선택지에서 공존 금지 (이중 가산 방지). 챕터 단위로 한 표기법만 유지.

## 6. 작가용 헬퍼 매크로 (선택)

자주 쓰는 패턴 단축:

```
[PERV_PAIR_START]
... 망상 모놀로그 ...
[PERV_PAIR_AWARE]
... 자기자각 ...
[PERV_PAIR_RECOVER]
... 정상복귀 ...
[/PERV_PAIR]
```

→ 컴파일러가 `MONOLOGUE` 명령 3개로 변환 + subtype 자동 부여.

## 7. 사용자 검증

- [ ] .md 문법 직관적인가?
- [ ] 컴파일 워크플로 (Claude Code가 .md → JSON 변환) OK?
- [ ] 답장 타이머 카톡 문법 OK?
