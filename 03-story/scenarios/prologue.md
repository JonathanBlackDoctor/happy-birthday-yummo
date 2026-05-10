---
module: prologue
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 00-master/CONVENTIONS.md
  - 03-story/STORY-BIBLE.md
  - 03-story/route-common.md
  - 06-engine/SCENE-FORMAT.md
  - 02-characters/goo-yunmo.md
  - 02-characters/side-characters.md
outputs:
  - 프롤로그 풀 텍스트 시나리오 (3개 씬, 분당→KTX→대구 성서)
  - 본과 1학년 동기 단톡 첫 등장 (김규민/표경민/조나단)
  - 톤 셋업 선택지 2개 (호감도 영향 X)
status: review
---

# 03-story/scenarios/prologue.md

> 시간선: 2026.02.25(밤) ~ 02.28(낮~저녁). 약 10분 플레이타임.
> 히로인 등장 X. 변태 망상 페어 0회.
> 끝 → Ch.1 "OT의 봄" (`scenarios/ch01_ot_first_day.md` 등으로 연결 예정)

---

# Scene: prologue_01_home
# Hint: chapter=0, time="2026-02-25 night", active=mom

[BG: bg_bundang_home fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 2026년 2월 25일, 늦은 밤. 분당 본가 거실. 벽 한쪽에 반쯤 닫힌 캐리어 두 개가 비스듬히 기대어 서 있다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 본과 1학년이라.
[구윤모 모놀로그] 진짜 됐네 이게.
[구윤모 모놀로그] 예과 2년에 휴학 1년... 길긴 길었다.

[지문] 어머니가 거실로 들어와 윤모 옆 소파에 자리를 잡는다.

[어머니] 윤모야, 짐 다 챙겼어?
[구윤모] 어. 거의 다 했어.
[어머니] 본과 시작하면 또 한참 못 보겠다.
[구윤모] 그러게... 시험기간 되면 더 그럴 거고.
[어머니] (옅게 웃으며) 자취방에 컵라면만 쌓아두지 말고.
[구윤모] (살짝 부끄러운 듯) 어머니, 그건 좀.
[어머니] 이번엔 진짜 바빠질 텐데, 너무 무리는 마.
[구윤모] 알겠어. 본과가 좀 빡세긴 하겠지만, 무리는 안 할게.
[어머니] 그래도 너 잘 할 거야.
[구윤모] 응. 고마워.

[지문] 어머니가 자리에서 일어나려다 한 번 더 멈춘다. 한마디만 더 보태고 가려는 호흡.

[어머니] 윤모야. 본과 1년이 진짜 길다고 들었어. 한 학기 한 학기 천천히 챙겨가.

[CHOICE]
- "엄마, 진짜 잘 다녀올게요" {tone:warm_supportive}
- "어, 알겠어" {tone:direct_friendly}
- "야 뭐 별거 있겠어 ㅋㅋ" {tone:playful_casual}
[/CHOICE]

[지문] 어머니가 윤모의 어깨를 짧게 두드리고 다시 부엌 쪽으로 사라진다.

[구윤모 모놀로그] 엄마는 변함이 없다.
[구윤모 모놀로그] 학기 시작 전엔 늘 저렇게 챙겨준다.
[구윤모 모놀로그] 매번 같은 말인데, 듣고 나면 마음이 좀 놓인다.

[SFX: 카톡_알림]

[구윤모 모놀로그] 어, 카톡.

[KAKAO]
- {speaker:김규민} 야 윤모야
- {speaker:김규민} 너 언제 내려오냐
- {speaker:구윤모} 모레
- {speaker:김규민} ㄷㄷ 빡세네
- {speaker:김규민} 본과 시작 5일 전 ㅋㅋㅋㅋ
- {speaker:조나단} ㄹㅇㅋㅋ
- {speaker:조나단} 윤모 과대인데 ㄷㄷ
- {speaker:김규민} 야 과대가 마지막에 내려옴 ㅋㅋㅋㅋㅋㅋ
- {speaker:구윤모} ㅋㅋㅋㅋ
- {speaker:구윤모} ㅇㅇ
- {speaker:구윤모} 분당 좀 더 누리다 갈래
- {speaker:김규민} 아 그래 그래
- {speaker:김규민} 와도 어차피 술 ㄱㄱ
- {speaker:표경민} 김규민 너 짐 정리는 했냐
- {speaker:김규민} ㅇㅇ 거의
- {speaker:표경민} 거의를 어떻게 믿냐
- {speaker:조나단} ㅋㅋㅋㅋㅋㅋㅋ
- {speaker:조나단} 표경민 칼같음
- {speaker:김규민} 야 표경민 너무함
- {speaker:김규민} 윤모야 너 먼저 내려와서 나 좀 챙겨줘
- {speaker:구윤모} ㄴㄴ
- {speaker:구윤모} 너부터 내려와
- {speaker:조나단} 와ㅋㅋㅋㅋ
- {speaker:김규민} 배신감ㅋㅋㅋ
[/KAKAO]

[구윤모 모놀로그] 다들 똑같다.
[구윤모 모놀로그] 한 학기 쉬었다고 변할 애들 아니지.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 근데 솔직히 좀 좋다.
[구윤모 모놀로그] 다시 다 같이 모인다고 생각하면.

[BGM_STOP fade=2]

[JUMP: prologue_02_train]

---

# Scene: prologue_02_train
# Hint: chapter=0, time="2026-02-28 day", active=mom

[BG: bg_ktx_window fade]
[BGM: 일상 fade=3 volume=0.4]
[SFX: ktx_주행음 volume=0.6 loop]

[지문] 2월 28일 낮. 동대구행 KTX 창가 좌석. 창밖으로 들판과 산이 빠르게 지나간다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 분당에서 동대구. 두 시간이면 끝난다.
[구윤모 모놀로그] (창밖) 이 길도 슬슬 익숙해지려나.

[구윤모 모놀로그] 휴학 1년. 예과 끝내고 한 번 쉬어봤다.
[구윤모 모놀로그] 그때 쉰 거, 잘한 건가.
[구윤모 모놀로그] ...모르겠다.

[CHOICE]
- "본과는 빡세겠지만 재밌을 거다" {tone:bright_forward} → next: prologue_02b_positive
- "솔직히 좀 두렵다" {tone:warm_supportive} → next: prologue_02b_serious
- "어떻게든 되겠지 ㅋ" {tone:playful_casual} → next: prologue_02b_chill
[/CHOICE]

---

# Scene: prologue_02b_positive

[FLAG: flag_prologue_tone=positive]

[구윤모 모놀로그] 본과는 빡세겠지만 재밌을 거다.
[구윤모 모놀로그] 그렇게 생각하기로 했다.
[구윤모 모놀로그] 어차피 시작했고, 어차피 가야 할 길이고.

[JUMP: prologue_02_after_choice]

---

# Scene: prologue_02b_serious

[FLAG: flag_prologue_tone=serious]

[구윤모 모놀로그] 솔직히 좀 두렵다.
[구윤모 모놀로그] 본과 1학년이 갈리는 학년이라던데.
[구윤모 모놀로그] 잘 해낼 수 있을지.

[JUMP: prologue_02_after_choice]

---

# Scene: prologue_02b_chill

[FLAG: flag_prologue_tone=chill]

[구윤모 모놀로그] 어떻게든 되겠지 ㅋ
[구윤모 모놀로그] 미리 걱정해봤자 안 풀린다.
[구윤모 모놀로그] 가서 부딪혀 보자.

[JUMP: prologue_02_after_choice]

---

# Scene: prologue_02_after_choice

[SFX: 카톡_알림]

[KAKAO]
- {speaker:표경민} 윤모 KTX임?
- {speaker:구윤모} ㅇㅇ
- {speaker:구윤모} 동대구 한 시간 남음
- {speaker:표경민} 도착하면 알려줘
- {speaker:표경민} 자취방 정리 도와줄까
- {speaker:구윤모} ㅇㅋ
- {speaker:구윤모} 짐 그렇게 많진 않은데
- {speaker:표경민} 그래도
- {speaker:김규민} 야 윤모 도착 전에 한잔 ㄱ?
- {speaker:구윤모} 오늘?
- {speaker:김규민} ㅇㅇ ㄱㄱ
- {speaker:김규민} 환영회 ㅋㅋㅋ
- {speaker:구윤모} 짐 정리 좀
- {speaker:구윤모} 내일 ㄱ
- {speaker:김규민} 에이~
- {speaker:조나단} 김규민 좀 봐줘 ㅋㅋㅋㅋ
- {speaker:조나단} 윤모 짐 풀고 OT 준비해야지
- {speaker:김규민} 알겠다고~
- {speaker:김규민} 근데 진짜 OT 신난다
- {speaker:조나단} ㄹㅇㅋㅋ
- {speaker:구윤모} ㄷㄷ
- {speaker:구윤모} 본과 1학년 OT
- {speaker:구윤모} 실감 안 남
- {speaker:표경민} 내일이면 실감 날걸
[/KAKAO]

[구윤모 모놀로그] 표경민은 한결같다.
[구윤모 모놀로그] 챙길 건 다 챙기면서 티는 안 내려고 한다, 늘.
[구윤모 모놀로그] (창밖) 들판이 도시로 바뀐다. 다 왔나 보네.

[BGM_STOP fade=2]

[JUMP: prologue_03_studio]

---

# Scene: prologue_03_studio
# Hint: chapter=0, time="2026-02-28 evening", active=friend

[BG: bg_studio_room fade]
[BGM: 일상 fade=3 volume=0.5]

[지문] 같은 날 저녁. 대구 성서 자취방. 윤모가 캐리어 두 개를 끌고 들어와 형광등을 켠다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 한 달 비웠더니 먼지 좀 쌓였네.
[구윤모 모놀로그] 청소부터 가야겠다.

[지문] 윤모가 옷가지를 옷장에 차곡차곡 넣고, 책상 위에 의대 교과서를 한 권씩 올려놓는다.

[구윤모 모놀로그] 해부학... 생화학... 생리학...
[구윤모 모놀로그] 표지만 봐도 무게가 다르다.
[구윤모 모놀로그] (책 한 권 들어 올리며) 이걸 한 학기 안에.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 뭐 어때. 다들 하잖아.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:김규민} 윤모 도착?
- {speaker:구윤모} ㅇㅇ
- {speaker:구윤모} 짐 풀고 있음
- {speaker:김규민} 자취방 컨디션 ㅇㄸ
- {speaker:구윤모} 먼지 쌓임
- {speaker:김규민} ㅋㅋㅋㅋㅋ
- {speaker:김규민} 청소 ㄱㄱ
- {speaker:조나단} 윤모 OT 자료 봤냐
- {speaker:구윤모} 어 봤음
- {speaker:구윤모} 내일 9시 본관
- {speaker:표경민} 9시 정각이야
- {speaker:표경민} 8시 50분엔 가 있어야 함
- {speaker:김규민} ㅇㅇ 표경민 PM
- {speaker:조나단} ㅋㅋㅋㅋㅋ
- {speaker:김규민} 야 윤모 과대 인사말 준비됐냐
- {speaker:구윤모} ㄴㄴ
- {speaker:구윤모} 즉흥
- {speaker:김규민} ㄷㄷㄷ
- {speaker:조나단} 그게 멋이지 ㅋㅋㅋ
- {speaker:표경민} 너무 즉흥은 곤란
- {speaker:구윤모} 알아서 함
- {speaker:김규민} 아 ㅋㅋㅋ 윤모 답변 짧음
- {speaker:구윤모} ㅇㅇ
- {speaker:조나단} ㅋㅋㅋㅋ 자기다움
- {speaker:김규민} 내일 보자
- {speaker:구윤모} ㅇㅋ
- {speaker:표경민} 내일 봐
- {speaker:조나단} ㄱㄱ
[/KAKAO]

[구윤모 모놀로그] 다들 내일 본다.
[구윤모 모놀로그] 분명 익숙한 애들인데, 새 학기는 또 새 학기지.

[지문] 윤모가 책상 앞 의자에 앉는다. 창밖으로 자취방 골목이 어둑하게 가라앉아 있다.

[CHOICE]
- "내일 잘 해보자" {tone:direct_friendly} → next: prologue_03b_steady
- "일찍 자야겠다" {tone:mature_serious} → next: prologue_03b_practical
[/CHOICE]

---

# Scene: prologue_03b_steady

[FLAG: flag_prologue_close=steady]

[구윤모 모놀로그] 내일 잘 해보자.
[구윤모 모놀로그] 본과 1학년. 첫 단추다.
[구윤모 모놀로그] 첫 단추는 잘 끼워야지.

[JUMP: prologue_03_close]

---

# Scene: prologue_03b_practical

[FLAG: flag_prologue_close=practical]

[구윤모 모놀로그] 일찍 자야겠다.
[구윤모 모놀로그] 첫날부터 졸린 채로 가면 좀 그렇잖아.

[JUMP: prologue_03_close]

---

# Scene: prologue_03_close

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 본과 1학년. 진짜 시작이다.
[구윤모 모놀로그] 솔직히 두근거리긴 한다.
[구윤모 모놀로그] 어떤 학기가 될지는 모르겠고.
[구윤모 모놀로그] 시작은 시작이지.

[BGM: 메인_테마 fade=4 volume=0.6]
[SFX: 불_끄는_소리]

[지문] 윤모가 책상 등을 끄고 침대 쪽으로 걸음을 옮긴다. 화면이 천천히 어두워진다.

[JUMP: ch01_01_ot_intro]

---

## 작가 메모

### 화자 등장 일람
- **구윤모** (대사 + 모놀로그)
- **어머니** (Scene 1 한정, 대사만, 따뜻한 가족 톤)
- **김규민 / 표경민 / 조나단** (카톡만, 본과 1학년 동기 단톡)
- 히로인 등장 X (룰: 프롤로그엔 변태 망상 페어 0회)

### 톤 셋업 선택지
- Scene 2: 본과 진학 마음가짐 (긍정 / 진중 / 가벼움) — `flag_prologue_tone`
- Scene 3: 첫날 결의 (다짐 / 실용) — `flag_prologue_close`
- 둘 다 호감도 영향 X. Ch.1 이후 가벼운 모놀로그 톤 변주에만 활용.

### 단톡 멤버 톤 차별화 자체점검
- **김규민**: "야 윤모야~", "에이~", 까불 + 솔로의 한 ("환영회 ㅋㅋㅋ", "윤모야 너 먼저 내려와서 나 좀 챙겨줘")
- **표경민**: "거의를 어떻게 믿냐", "9시 정각이야", "너무 즉흥은 곤란" — 짧고 칼같이 챙김
- **조나단**: "ㄹㅇㅋㅋ", "ㅋㅋㅋㅋㅋㅋㅋ", "그게 멋이지 ㅋㅋㅋ", "자기다움" — 분위기 메이커, 갈등 무마

### 다음 챕터 연결
`prologue_03_close` 끝 `[JUMP: ch01_01_ot_intro]` — Ch.1 첫 씬 정합 (2026-04-30 처방: placeholder `ch01_ot_first_day` → 실제 ID로 교체 완료).

### 톤 패스 라운드 (2026-04-29)
§3.6 가드레일 적용. 결/한 톤/한 박자/본심/메타 어휘 5종 + 추가 6번 회피 어휘 일괄 점검 완료. 호감도 변동·KEY·플래그·연출 큐·거절 카톡 텍스트 무수정.
(프롤로그는 히로인 등장 X + 윤모 모놀로그 짧고 일상어 위주라 패턴 위반 없음 — 작가 메모 라인만 기록.)

### 윤문 라운드 (2026-05-01)
문학 윤문 1차 적용. 변경 영역:
- **모놀로그 명사화 종결 → 동사 종결**: "저런 톤"·"그 느낌"·"하는 건데"·"두근거리는 건 사실이고" 등 비평조 명사 마무리를 22살 본과생의 즉각 반응 톤으로 교체.
- **지문 문학적 결 보강**: "세워져 있다" → "비스듬히 기대어 서 있다", "흘러간다" → "지나간다", "어둑하게 깔린다" → "어둑하게 가라앉아 있다" 등 정적 묘사에 결 추가.
- **시스템 무수정 보존**: [BG]/[BGM]/[SFX]/[CHARACTER]/[CHOICE]/[FLAG]/[JUMP]/[KAKAO] 모든 큐, 선택지 개수(2/3/2), 카톡 메시지 텍스트, 플래그명, 화자 라벨 100% 동일.

---

## 작가 메모

### 화자 등장 일람
- **구윤모** (대사 + 모놀로그)
- **어머니** (Scene 1 한정, 대사만, 따뜻한 가족 톤)
- **김규민 / 표경민 / 조나단** (카톡만, 본과 1학년 동기 단톡)
- 히로인 등장 X (룰: 프롤로그엔 변태 망상 페어 0회)

### 톤 셋업 선택지
- Scene 2: 본과 진학 마음가짐 (긍정 / 진중 / 가벼움) — `flag_prologue_tone`
- Scene 3: 첫날 결의 (다짐 / 실용) — `flag_prologue_close`
- 둘 다 호감도 영향 X. Ch.1 이후 가벼운 모놀로그 톤 변주에만 활용.

### 단톡 멤버 톤 차별화 자체점검
- **김규민**: "야 윤모야~", "에이~", 까불 + 솔로의 한 ("환영회 ㅋㅋㅋ", "윤모야 너 먼저 내려와서 나 좀 챙겨줘")
- **표경민**: "거의를 어떻게 믿냐", "9시 정각이야", "너무 즉흥은 곤란" — 짧고 칼같이 챙김
- **조나단**: "ㄹㅇㅋㅋ", "ㅋㅋㅋㅋㅋㅋㅋ", "그게 멋이지 ㅋㅋㅋ", "자기다움" — 분위기 메이커, 갈등 무마

### 다음 챕터 연결
`prologue_03_close` 끝 `[JUMP: ch01_01_ot_intro]` — Ch.1 첫 씬 정합 (2026-04-30 처방: placeholder `ch01_ot_first_day` → 실제 ID로 교체 완료).

### 톤 패스 라운드 (2026-04-29)
§3.6 가드레일 적용. 결/한 톤/한 박자/본심/메타 어휘 5종 + 추가 6번 회피 어휘 일괄 점검 완료. 호감도 변동·KEY·플래그·연출 큐·거절 카톡 텍스트 무수정.
(프롤로그는 히로인 등장 X + 윤모 모놀로그 짧고 일상어 위주라 패턴 위반 없음 — 작가 메모 라인만 기록.)