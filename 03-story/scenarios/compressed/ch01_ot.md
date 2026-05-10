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

[지문] 2026년 3월 2일 오전 9시. 본과 1학년 OT 첫날. 강의실에 50명이 자리 잡고 있다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 진짜 시작이네. 50명이 한자리에 모이니까 그제야 실감 난다.

[학생회 임원] 그럼 과대 짧게 인사 한번 부탁할게요.
[구윤모] (마이크 받으며) 네, 안녕하세요. 본과 1학년 1학기 과대 맡은 구윤모입니다.
[구윤모] 길게는 안 끌게요. 한 학기 잘 부탁드리겠습니다.

[구윤모 모놀로그] 됐다. 짧고 깔끔하게.

[학생회 임원] 그럼 해부조 배정 발표하겠습니다. 본인 조 확인하고 조원들 얼굴 익혀두세요.

[구윤모 모놀로그] 5조... 윤하정, 오준혁, 이문규, 정욱. 윤하정. 처음 듣는 이름이네.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 과대니까 미리 얼굴이라도 익혀둬야겠다.

[JUMP: ch01_02_meet_hajeong]

---

# Scene: ch01_02_meet_hajeong
# Hint: chapter=1, time="2026-03-02 morning, after 조 배정", active=H2

[BG: bg_lecture_day]
[BGM: 일상]

[지문] 발표 직후. 윤모가 5조 자리로 이동하니, 옆에 긴 생머리의 여학생이 노트북을 정리하고 있다.

[CHARACTER: 윤하정 right default fade]

[VIDEO: video_meet_hajeong]

[구윤모] 어, 5조? 나도 5조야.
[윤하정] (얼굴 들며) ...어. 너 과대지?
[구윤모] 응, 맞아. 구윤모.
[윤하정] 윤하정.

[구윤모 모놀로그] 무뚝뚝하네 첫인상. 근데 차가운 건 또 아니다.

[CHOICE]
- "어. 앞으로 잘 부탁할게" (진중하게) → next: ch01_02b_serious  {tone:direct_friendly, key:true, descriptor:ch1_first_intro}
- "어, 조 잘 부탁~" (가볍게) → next: ch01_02b_casual  {tone:playful_casual}
[/CHOICE]


---

# Scene: ch01_02b_serious

[FLAG: flag_h2_first_tone=serious]

[구윤모] 어. 앞으로 잘 부탁할게.

[CHARACTER: 윤하정 right smile_small fade]

[윤하정] (옅은 미소) ...어. 잘 부탁해. 무슨 과대가 첫 인사부터 그리 진중해.
[구윤모] 어차피 같은 조잖아. 1년 갈 사이인데.
[윤하정] (시선 돌리며) ...그건 그렇네.

[JUMP: ch01_02_after_meet]

---

# Scene: ch01_02b_casual

[FLAG: flag_h2_first_tone=casual]

[구윤모] (가볍게) 어, 조 잘 부탁~

[CHARACTER: 윤하정 right default fade]

[윤하정] ...어.
[윤하정] (시선 돌리며) 그래.

[구윤모 모놀로그] 무뚝뚝해도 답은 해주네. 차갑진 않다.

[JUMP: ch01_02_after_meet]

---

# Scene: ch01_02_after_meet

[CHARACTER: 오준혁 left default fade]

[오준혁] 윤하정. 여기 5조?
[윤하정] 어, 5조. 너도?
[오준혁] 어. 오준혁. (살짝 웃으며) 이름 때문에 자주 오해받아. 됐어, 익숙해.
[구윤모] (당황 가볍게 누르며) 아, 응. 안녕, 준혁아.
[윤하정] (피식) 5조 단톡 만들자. 번호 줘.

[지문] 셋이 "본과 1학년 해부 5조" 단톡을 만든다.

[구윤모 모놀로그] 5조 시작이다. 윤하정. 무뚝뚝한데, 그래도 정 없진 않다.

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

[구윤모 모놀로그] OT 끝나고 누우니까 진짜 피곤하네.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:김규민} 윤모 OT 인사 ㄷㄷ
- {speaker:김규민} "길게 안 끌고요" ㅋㅋㅋㅋㅋㅋ
- {speaker:조나단} ㄹㅇㅋㅋ 너답더라
- {speaker:구윤모} ㅇㅇ
- {speaker:구윤모} 즉흥이라 했잖아
- {speaker:김규민} 학생회 누나 표정이 "이게 뭐야" 였음
- {speaker:조나단} ㅋㅋㅋㅋㅋ 진짜?
- {speaker:구윤모} ㄷㄷ
- {speaker:구윤모} 몰랐네
- {speaker:표경민} 짧은 게 나아
- {speaker:표경민} 길어지면 사고남
- {speaker:김규민} 표경민 또 옳은 말
- {speaker:조나단} ㅋㅋㅋㅋ
- {speaker:김규민} 윤모 5조 누구누구임?
- {speaker:구윤모} 윤하정 오준혁 이문규 정욱
- {speaker:김규민} 오준혁?
- {speaker:김규민} 그 이름 남자 같은데
- {speaker:구윤모} 여자임
- {speaker:김규민} ㄷㄷㄷ
- {speaker:조나단} 와ㅋㅋㅋㅋ 다들 헷갈리는듯
- {speaker:표경민} 너네 진짜 실례임
- {speaker:김규민} 미안ㅋㅋ
- {speaker:김규민} 윤하정은?
- {speaker:김규민} 들어본 적 없는데
- {speaker:구윤모} 부산이라던데
- {speaker:구윤모} 얌전함
- {speaker:조나단} 윤모 벌써 파악
- {speaker:김규민} 과대모드 ㅋㅋㅋㅋ
- {speaker:구윤모} ㄴㄴ
- {speaker:구윤모} 그냥 첫인사
[/KAKAO]

[구윤모 모놀로그] 다들 너무 일찍 들이댄다. 본과 시작 첫날인데.

[SFX: 카톡_알림]

[지문] 1:1 카톡방. "윤하정"에게서.

[KAKAO]
- {speaker:윤하정} 야 내일 강의 자료 받았어?
- {speaker:구윤모} 어 받았어
- {speaker:구윤모} 학교 메일로 옴
- {speaker:윤하정} 나는 안 옴
- {speaker:윤하정} 다시 보내달라 해야 하나
- {speaker:구윤모} 내가 포워딩 할까?
- {speaker:윤하정} 어, 부탁
- {speaker:구윤모} 보냈어
- {speaker:윤하정} 고마워
- {speaker:윤하정} 내일 봐
- {speaker:구윤모} 어 잘 자
[/KAKAO]

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 윤하정. 카톡도 길게 안 끄네. 단톡에선 좀 풀어졌고, 1:1은 더 짧아졌고. 뭐, 그게 또 좋다.


[BGM_STOP fade=2]

[JUMP: ch01_04_first_lecture]

---

# Scene: ch01_04_first_lecture
# Hint: chapter=1, time="2026-03-03 morning", active=H2

[BG: bg_lecture_day fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 다음 날 오전. 본과 1학년 첫 정식 강의.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 윤하정 right default fade]

[윤하정] 어, 옆자리.
[구윤모] 어, 5조라고 했잖아.
[윤하정] ...그러네.

[교수] 자, 본과 1학년 시작 안내합니다. 핵심부터 갑시다.
[교수] 해부학 실습은 3월 중순. 정확히 3월 16일부터, 첫날엔 묵념하고 시작합니다. 흰 가운, 마스크 필수.

[구윤모 모놀로그] 카데바 실습. 듣기만 해도 공기가 무거워진다.

[교수] 오늘은 안내까지. 다음 시간부터 본격 강의. 질문 있으면 끝나고.

[지문] 윤하정이 노트북을 닫으려는 순간 살짝 고개를 숙이며 앞머리가 흘러내린다.

[BGM: 코믹 fade=1 volume=0.4]
[CHARACTER: 윤모 center perv fade]

[구윤모 모놀로그] (망상 시작) ...어. 앞머리.
[구윤모 모놀로그] (망상 시작) 만약에 저 머리가 더 길어서 노트북 위로 흘러내리고, 윤하정이 무심코 손으로 쓸어 올리는 그 순간에, 마침 옆자리에 있는 게 나라서 시선이 자연스럽게 마주친다면...
[구윤모 모놀로그] (망상 시작) 평소 무뚝뚝하던 표정이 살짝 풀어지면서, 입꼬리 끝이 슬며시 올라가는 모습이 보일지도 모르고...

[CHARACTER: 윤모 center recover fade]

[구윤모 모놀로그] (자기자각) 아 진짜. 본과 1학년 둘째 날부터 뭐 하냐 너.
[구윤모 모놀로그] (자기자각) 옆자리 사람한테 무슨 짓이야.
[구윤모 모놀로그] (자기자각) 정신 차려라 구윤모.

[CHARACTER: 윤모 center default fade]
[BGM: 일상 fade=1 volume=0.5]

[구윤모 모놀로그] (정상복귀) 노트북. 노트북만 보자.
[구윤모 모놀로그] (정상복귀) 카데바 안내 머릿속에 다시 정리.

[CHARACTER: 윤하정 right smile_small fade]

[윤하정] (옆에서) 야.
[구윤모] (살짝 흠칫) ...어?
[윤하정] 너 표정 좀 굳었던데. 카데바 들어서 그래?
[구윤모] (속으로 식은땀) 어 뭐... 좀.
[윤하정] (가볍게) 다들 그래. 첫날엔.
[구윤모] (애써 평정) 너도 표정 굳었던데.
[윤하정] (눈썹 살짝) 그건 정확히는 집중한 거였거든?
[구윤모] (피식) 응, 알겠어.

[CHARACTER_HIDE: 윤하정 fade]

[구윤모 모놀로그] 살았다. 윤하정한텐 이렇게 받아쳐 주면 되네.

[BGM_STOP fade=2]

[JUMP: ch01_05_cafe]

---

# Scene: ch01_05_cafe
# Hint: chapter=1, time="2026-03-03 afternoon", active=gyumin,gyeongmin,nathan,junhyuk

[BG: bg_campus_cafe fade]
[BGM: 일상 fade=3 volume=0.5]

[지문] 같은 날 오후. 캠퍼스 카페. 윤모, 김규민, 표경민, 조나단이 창가 자리에 앉아 있다.

[CHARACTER: 윤모 left default fade]
[CHARACTER: 김규민 center smirk fade]
[CHARACTER: 표경민 center default fade]
[CHARACTER: 조나단 right laugh fade]

[김규민] 야 윤모. 5조에 윤하정 어떻게 생겼어.
[조나단] (큭큭) 김규민 본격 시동.
[표경민] (커피 잔 내려놓으며) 김규민, 첫날부터 그러지 마.
[김규민] 정보 공유잖아. 솔로의 권리야.
[조나단] (웃으며) 권리는 또 무슨.
[구윤모] 그냥 평범하지. 긴 머리에, 무뚝뚝한 편.
[김규민] 와, 무뚝뚝. 윤모 너랑 스타일 비슷한 거 아니냐.
[조나단] (웃으며) 둘 다 단답형.
[표경민] 단답이 단답을 만나면 침묵이야.
[구윤모] (피식) 그건 또 그렇네.

[CHARACTER: 오준혁 right_back default fade]

[오준혁] 어, 너네 여기 있었네.
[김규민] (눈 동그랗게) 어... 어.
[오준혁] (눈치채고) 또 그 표정.
[조나단] (큭큭) 오준혁이라며. 진짜 여자.
[오준혁] (자리 끌어당기며) 너네 정말. 맨날 그러면 진짜 짜증 난다.
[표경민] 김규민 사과해.
[김규민] (빠르게) 미안미안.
[오준혁] 됐고. 윤모 너 5조 단톡 답장 좀.
[구윤모] 어, 금방 할게.

[지문] 오준혁이 음료 주문하러 카운터로 향한다.

[김규민] (작게) 야 윤모. 너 5조에 여자 두 명이잖아. 윤하정, 오준혁.
[김규민] 솔직히 누가 더 마음에 드냐.

[CHOICE]
- "그런 거 아냐. 같은 조원일 뿐" (진지) {tone:mature_serious, coFire:gyeongmin+junhyuk} → next: ch01_05b_serious
- "야 첫날부터 뭔 소리야" (받아침) {tone:playful_casual, coFire:junhyuk} → -30 gyumin → next: ch01_05b_playful
- "...글쎄" (애매) {tone:warm_supportive, coFire:junhyuk} → next: ch01_05b_vague
[/CHOICE]

---

# Scene: ch01_05b_serious

[FLAG: flag_friend_joke=serious]

[구윤모] 그런 거 아냐.
[구윤모] 같은 조원일 뿐.
[김규민] (실망한 척) 에이~ 재미없네.
[조나단] (웃으며) 윤모 또 정색.
[표경민] (조용히 끄덕) 옳은 답.

[JUMP: ch01_05_close]

---

# Scene: ch01_05b_playful

[FLAG: flag_friend_joke=playful]

[구윤모] (피식) 야 첫날부터 뭔 소리야.
[구윤모] 너부터 챙겨라 김규민.
[김규민] (정색) 아 진짜.
[조나단] (큭큭) 카운터 펀치.
[표경민] (피식) 정확하긴 하네.

[JUMP: ch01_05_close]

---

# Scene: ch01_05b_vague

[FLAG: flag_friend_joke=vague]

[구윤모] ...글쎄.
[김규민] 와.
[김규민] 글쎄 뭐 글쎄.
[조나단] (웃으며) 또 글쎄.
[조나단] 윤모 답변 항상 짧음.
[표경민] (조용히) 글쎄가 답이면 글쎄지.

[JUMP: ch01_05_close]

---

# Scene: ch01_05_close

[오준혁] 뭐 얘기 중이었어.
[김규민] (능청) 본과 1학년 각오.
[오준혁] (반쯤 웃으며) 거짓말이지?
[표경민] 거짓말이야.
[조나단] (큭큭)
[오준혁] 됐고. 5조 첫 모임 언제 잡을지나 정하자.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 본과 1학년 둘째 날. 익숙한 얼굴이 벌써 몇 생겼다.
[구윤모 모놀로그] 카데바는 2주 뒤. 일단 천천히 가자.

[BG: bg_campus_cafe]
[BGM: 메인_테마 fade=4 volume=0.5]

[지문] 창 밖으로 캠퍼스에 연한 봄볕이 내려앉는다. — 끝 → Ch.2 "카데바"

[JUMP: ch02_01_anatomy_morning]

---

## 압축 메모

- 풀 대비 NARRATION/MONOLOGUE 약 55% 삭감, 그 외 100% 보존.
- **변태 망상 페어 (Scene 04) 한 줄도 안 건드림** — 시그니처 보존.
- 톤 매트릭스 메타(`{tone:direct_friendly, key:true, descriptor:ch1_first_intro}`) 풀과 1:1 동일.
- 분기 그래프: 02b 2분기 / 05b 3분기 동일.
- DIALOGUE 100% 보존 — 학생회 임원/교수/윤하정/오준혁/김규민/표경민/조나단/윤모 모두.
