---
module: prologue (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/prologue.md
outputs:
  - 프롤로그 압축본 (3개 씬, 분당→KTX→대구 성서 — 분기 그래프 풀과 동일)
status: review
---

# 03-story/scenarios/compressed/prologue.md

> 풀 `scenarios/prologue.md`의 압축 버전. NARRATION/MONOLOGUE 50~60% 삭감, DIALOGUE/KAKAO/CHOICE/FLAG/BG/BGM/SFX/CHARACTER/JUMP 100% 보존.
> 씬 ID·CHOICE next 그래프 풀과 동일.

---

# Scene: prologue_01_home
# Hint: chapter=0, time="2026-02-25 night", active=mom

[BG: bg_bundang_home fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 2026년 2월 25일, 늦은 밤. 분당 본가 거실. 반쯤 닫힌 캐리어 두 개가 비스듬히 기대어 있다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 본과 1학년이라. 진짜 됐네 이게.

[어머니] 윤모야, 짐 다 챙겼어?
[구윤모] 어. 거의 다 했어.
[어머니] 본과 시작하면 또 한참 못 보겠다.
[어머니] (옅게 웃으며) 자취방에 컵라면만 쌓아두지 말고.
[구윤모] (살짝 부끄러운 듯) 어머니, 그건 좀.
[어머니] 너무 무리는 마. 그래도 너 잘 할 거야.
[구윤모] 응. 고마워.

[어머니] 윤모야. 본과 1년 길다고 들었어. 한 학기 한 학기 챙겨가.

[CHOICE]
- "엄마, 진짜 잘 다녀올게요" {tone:warm_supportive}
- "어, 알겠어" {tone:direct_friendly}
- "야 뭐 별거 있겠어 ㅋㅋ" {tone:playful_casual}
[/CHOICE]

[구윤모 모놀로그] 엄마는 변함이 없다.

[SFX: 카톡_알림]

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

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 다들 똑같다. 한 학기 쉬었다고 변할 애들 아니지.

[BGM_STOP fade=2]

[JUMP: prologue_02_train]

---

# Scene: prologue_02_train
# Hint: chapter=0, time="2026-02-28 day", active=mom

[BG: bg_ktx_window fade]
[BGM: 일상 fade=3 volume=0.4]
[SFX: ktx_주행음 volume=0.6 loop]

[지문] 2월 28일 낮. 동대구행 KTX 창가 좌석.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 분당에서 동대구. 두 시간이면 끝난다.
[구윤모 모놀로그] 휴학 1년. 그때 쉰 거, 잘한 건가. ...모르겠다.

[CHOICE]
- "본과는 빡세겠지만 재밌을 거다" {tone:bright_forward} → next: prologue_02b_positive
- "솔직히 좀 두렵다" {tone:warm_supportive} → next: prologue_02b_serious
- "어떻게든 되겠지 ㅋ" {tone:playful_casual} → next: prologue_02b_chill
[/CHOICE]

---

# Scene: prologue_02b_positive

[FLAG: flag_prologue_tone=positive]

[구윤모 모놀로그] 본과는 빡세겠지만 재밌을 거다. 어차피 시작했고, 어차피 가야 할 길이고.

[JUMP: prologue_02_after_choice]

---

# Scene: prologue_02b_serious

[FLAG: flag_prologue_tone=serious]

[구윤모 모놀로그] 솔직히 좀 두렵다. 본과 1학년이 갈리는 학년이라던데.

[JUMP: prologue_02_after_choice]

---

# Scene: prologue_02b_chill

[FLAG: flag_prologue_tone=chill]

[구윤모 모놀로그] 어떻게든 되겠지 ㅋ 가서 부딪혀 보자.

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

[구윤모 모놀로그] 표경민은 한결같다. 챙길 건 다 챙기면서 티는 안 내려고 한다.

[BGM_STOP fade=2]

[JUMP: prologue_03_studio]

---

# Scene: prologue_03_studio
# Hint: chapter=0, time="2026-02-28 evening", active=friend

[BG: bg_studio_room fade]
[BGM: 일상 fade=3 volume=0.5]

[지문] 같은 날 저녁. 대구 성서 자취방. 윤모가 캐리어를 끌고 들어와 형광등을 켠다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 한 달 비웠더니 먼지 좀 쌓였네.

[지문] 윤모가 책상 위에 의대 교과서를 한 권씩 올려놓는다.

[구윤모 모놀로그] 해부학... 생화학... 생리학... 표지만 봐도 무게가 다르다.

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

[구윤모 모놀로그] 다들 내일 본다. 익숙한 애들인데, 새 학기는 또 새 학기지.

[CHOICE]
- "내일 잘 해보자" {tone:direct_friendly, coFire:gyumin} → next: prologue_03b_steady
- "일찍 자야겠다" {tone:mature_serious} → next: prologue_03b_practical
[/CHOICE]

---

# Scene: prologue_03b_steady

[FLAG: flag_prologue_close=steady]

[구윤모 모놀로그] 내일 잘 해보자. 본과 1학년. 첫 단추는 잘 끼워야지.

[JUMP: prologue_03_close]

---

# Scene: prologue_03b_practical

[FLAG: flag_prologue_close=practical]

[구윤모 모놀로그] 일찍 자야겠다. 첫날부터 졸린 채로 가면 좀 그렇잖아.

[JUMP: prologue_03_close]

---

# Scene: prologue_03_close

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 본과 1학년. 진짜 시작이다.
[구윤모 모놀로그] 어떤 학기가 될지는 모르겠고. 시작은 시작이지.

[BGM: 메인_테마 fade=4 volume=0.6]
[SFX: 불_끄는_소리]

[지문] 윤모가 책상 등을 끄고 침대 쪽으로 걸음을 옮긴다.

[JUMP: ch01_01_ot_intro]

---

## 압축 메모

- 풀 대비 NARRATION/MONOLOGUE 약 55% 삭감, 그 외 100% 보존.
- 씬 ID·CHOICE next 그래프·KAKAO 메시지·FLAG·BGM/SFX/BG 큐 풀과 1:1 동일.
- 어머니 대사 10개 100% 보존(가족 톤이 짧으면 무뚝뚝해 보임).
- 분기 그래프: 02b 3분기 → after_choice / 03b 2분기 → 03_close 동일.
