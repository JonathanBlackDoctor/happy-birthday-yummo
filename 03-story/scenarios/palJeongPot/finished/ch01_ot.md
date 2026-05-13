---
module: ch01_ot (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/ch01_ot.md
outputs:
  - Ch.1 "OT의 봄" 압축본 (5개 메인 씬 + 2개 분기 — 분기 그래프 풀과 동일)
  - 변태 망상 페어 #1 보존 (Scene 04)
status: review
---

# 03-story/scenarios/compressed/ch01_ot.md

> 풀 `scenarios/ch01_ot.md`의 압축 버전. NARRATION/MONOLOGUE 50~60% 삭감, DIALOGUE/KAKAO/CHOICE/FLAG/BG/BGM/SFX/CHARACTER/VIDEO/JUMP 100% 보존.
> 변태 망상 페어 (Scene 04, `(망상 시작)` × 3 → `(자기자각)` × 3 → `(정상복귀)` × 2) 한 줄도 손대지 않음.
> 씬 ID·CHOICE next 그래프 풀과 동일.

---

# Scene: ch01_01_ot_intro
# Hint: chapter=1, time="2026-03-02 morning"

[BG: bg_lecture_day fade]
[BGM: 일상 fade=2 volume=0.6]

[지문] 3월 2일 오전. 본과 1학년 OT. 강의실 50명.

[CHARACTER: 윤모 center default fade]

[학생회 임원] 과대 짧게 인사 한번 부탁할게요.
[구윤모] (마이크 받으며) 안녕하세요. 과대 구윤모입니다. 길게는 안 끌게요. 저 구윤모 여러분들의 개가 되겠습니다 멍멍 잘 부탁드리겠습니다.

[학생회 임원] 해부조 배정 발표하겠습니다.

[구윤모 모놀로그] 5조... 윤하정, 오준혁, 이문규, 정욱.

[CHARACTER: 윤모 center smile fade]

[JUMP: ch01_02_meet_hajeong]

---

# Scene: ch01_02_meet_hajeong
# Hint: chapter=1, time="2026-03-02 morning, after 조 배정", active=H2

[BG: bg_lecture_day]
[BGM: 일상]

[지문] 5조 자리. 긴 생머리의 여학생이 노트북을 정리 중.

[CHARACTER: 윤하정 right default fade]
[VIDEO: video_meet_hajeong]

[구윤모] 어, 5조? 나도 5조야.
[윤하정] (얼굴 들며) ...어. 너 과대지?
[구윤모] 응. 구윤모.
[윤하정] 윤하정.

[CHOICE]
- "어. 앞으로 잘 부탁할게" (진중하게) → next: ch01_02b_serious  {tone:direct_friendly, key:true, descriptor:ch1_first_intro}
- "어, 조 잘 부탁~" (가볍게) → next: ch01_02b_casual  {tone:playful_casual}
[/CHOICE]

---

# Scene: ch01_02b_serious

[FLAG: flag_h2_first_tone=serious]

[구윤모] 어. 앞으로 잘 부탁할게.
[CHARACTER: 윤하정 right smile_small fade]
[윤하정] ...어. 잘 부탁해.
[구윤모] 같은 조잖아. 1년 갈 사이인데.
[윤하정] ...그건 그렇네.

[JUMP: ch01_02_after_meet]

---

# Scene: ch01_02b_casual

[FLAG: flag_h2_first_tone=casual]

[구윤모] (가볍게) 어, 조 잘 부탁~
[CHARACTER: 윤하정 right default fade]
[윤하정] ...어. 그래.

[JUMP: ch01_02_after_meet]

---

# Scene: ch01_02_after_meet

[CHARACTER: 오준혁 left default fade]

[오준혁] 5조? 오준혁.
[윤하정] (피식) 5조 단톡 만들자. 번호 줘.

[지문] 셋이 "본과 1학년 해부 5조" 단톡을 만든다.

[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 오준혁 fade]
[BGM_STOP fade=2]

[JUMP: ch01_03_kakao_evening]

---

# Scene: ch01_03_kakao_evening
# Hint: chapter=1, time="2026-03-02 evening", active=H2+friend

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 같은 날 저녁. 자취방.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[KAKAO]
- {speaker:김규민} 윤모 임마는 무슨 오티에서 짖고있냐
- {speaker:조나단} 너답더라
- {speaker:구윤모} 즉흥이라 했잖아
- {speaker:표경민} 잘 짖긴하더라
- {speaker:김규민} 5조 누구누구임?
- {speaker:구윤모} 윤하정 오준혁 이문규 정욱
- {speaker:김규민} 오준혁? 남자 같은데
- {speaker:구윤모} 여자임
- {speaker:표경민} 너네 진짜 실례임
- {speaker:김규민} 윤하정은?
- {speaker:구윤모} 부산이라던데. 얌전함.  좀 이쁘긴하던데
[/KAKAO]

[SFX: 카톡_알림]

[지문] 1:1 카톡방. "윤하정".

[KAKAO]
- {speaker:윤하정} 야 내일 강의 자료 받았어?
- {speaker:구윤모} 어. 내가 포워딩 할까?
- {speaker:윤하정} 어, 부탁
- {speaker:구윤모} 보냈어
- {speaker:윤하정} 고마워. 내일 봐
- {speaker:구윤모} 어 잘 자
[/KAKAO]

[CHARACTER: 윤모 center smile fade]
[BGM_STOP fade=2]

[JUMP: ch01_04_first_lecture]

---

# Scene: ch01_04_first_lecture
# Hint: chapter=1, time="2026-03-03 morning", active=H2

[BG: bg_lecture_day fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 다음 날 오전. 첫 정식 강의.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 윤하정 right default fade]

[윤하정] 어, 옆자리.

[교수] 해부학 실습은 3월 16일. 묵념하고 시작합니다. 흰 가운, 마스크 필수.

[교수] 오늘은 안내까지.

[지문] 윤하정이 노트북 닫으려다 앞머리가 흘러내린다.

[BGM: 코믹 fade=1 volume=0.4]
[CHARACTER: 윤모 center perv fade]

[구윤모 모놀로그] (망상 시작) ...어. 앞머리.
[구윤모 모놀로그] (망상 시작) 저 머리가 흘러내리고, 손으로 쓸어 올리는 순간 시선이 마주친다면...
[구윤모 모놀로그] (망상 시작) 무뚝뚝하던 표정이 살짝 풀어지는 모습이 보일지도.

[CHARACTER: 윤모 center recover fade]

[구윤모 모놀로그] (자기자각) 아 진짜. 둘째 날부터 뭐 하냐.
[구윤모 모놀로그] (자기자각) 옆자리 사람한테 무슨 짓이야.
[구윤모 모놀로그] (자기자각) 정신 차려라 구윤모. 너 이정도로 정신나간 여미새는 아니잖아.

[CHARACTER: 윤모 center default fade]
[BGM: 일상 fade=1 volume=0.5]

[구윤모 모놀로그] (정상복귀) 노트북만 보자.
[구윤모 모놀로그] (정상복귀) 카데바 안내 다시 정리.

[CHARACTER: 윤하정 right smile_small fade]

[윤하정] 야. 표정 굳었던데. 카데바 들어서 그래?
[구윤모] (속으로 식은땀) 어 뭐... 좀.
[윤하정] 다들 그래. 첫날엔.

[CHARACTER_HIDE: 윤하정 fade]
[BGM_STOP fade=2]

[JUMP: ch01_05_cafe]

---

# Scene: ch01_05_cafe
# Hint: chapter=1, time="2026-03-03 afternoon", active=gyumin,gyeongmin,nathan,junhyuk

[BG: bg_campus_cafe fade]
[BGM: 일상 fade=3 volume=0.5]

[지문] 같은 날 오후. 캠퍼스 카페.

[CHARACTER: 윤모 left default fade]
[CHARACTER: 김규민 center smirk fade]
[CHARACTER: 조나단 right laugh fade]

[김규민] 야 윤모. 5조에 윤하정 어떻게 생겼어.
[표경민] 첫날부터 그러지 마.
[구윤모] 평범하지. 긴 머리에, 무뚝뚝한 편.
[표경민] 단답이 단답을 만나면 침묵이야.

[CHARACTER: 오준혁 right_back default fade]

[오준혁] 어, 너네 여기 있었네.
[조나단] (큭큭) 오준혁이라며. 진짜 여자.
[오준혁] 맨날 그러면 짜증 난다.
[표경민] 김규민 사과해.
[김규민] 미안미안.
[오준혁] 됐고. 윤모 너 5조 단톡 답장 좀.

[김규민] (작게) 야 윤모. 솔직히 누가 더 마음에 드냐.

[CHOICE]
- "그런 거 아냐. 같은 조원일 뿐" (진지) {tone:mature_serious, coFire:gyeongmin+junhyuk} → next: ch01_05b_serious
- "야 첫날부터 뭔 소리야" (받아침) {tone:playful_casual, coFire:gyumin+junhyuk} → +30 gyumin → next: ch01_05b_playful
- "...글쎄" (애매) {tone:warm_supportive, coFire:gyumin+junhyuk} → next: ch01_05b_vague
[/CHOICE]

---

# Scene: ch01_05b_serious

[FLAG: flag_friend_joke=serious]

[구윤모] 그런 거 아냐. 같은 조원일 뿐.
[김규민] 에이~ 재미없네.
[표경민] (끄덕) 옳은 답.

[JUMP: ch01_05_close]

---

# Scene: ch01_05b_playful

[FLAG: flag_friend_joke=playful]

[구윤모] (피식) 야 첫날부터 뭔 소리야. 너부터 챙겨라.
[조나단] (큭큭) 카운터 펀치.

[JUMP: ch01_05_close]

---

# Scene: ch01_05b_vague

[FLAG: flag_friend_joke=vague]

[구윤모] ...글쎄.
[김규민] 글쎄 뭐 글쎄.
[표경민] 글쎄가 답이면 글쎄지.

[JUMP: ch01_05_close]

---

# Scene: ch01_05_close

[오준혁] 뭐 얘기 중이었어.
[김규민] (능청) 본과 1학년 각오.
[오준혁] 거짓말이지?
[표경민] 거짓말이야.
[오준혁] 됐고. 5조 첫 모임 언제 잡자.

[CHARACTER: 윤모 center smile fade]

[BG: bg_campus_cafe]
[BGM: 메인_테마 fade=4 volume=0.5]

[지문] 캠퍼스에 봄볕이 내려앉는다. — 끝 → Ch.2 "카데바"

[JUMP: ch02_01_anatomy_morning]

---

## 압축 메모

- 풀 대비 NARRATION/MONOLOGUE 약 55% 삭감, 그 외 100% 보존.
- **변태 망상 페어 (Scene 04) 한 줄도 안 건드림** — 시그니처 보존.
- 톤 매트릭스 메타(`{tone:direct_friendly, key:true, descriptor:ch1_first_intro}`) 풀과 1:1 동일.
- 분기 그래프: 02b 2분기 / 05b 3분기 동일.
- DIALOGUE 100% 보존 — 학생회 임원/교수/윤하정/오준혁/김규민/표경민/조나단/윤모 모두.
