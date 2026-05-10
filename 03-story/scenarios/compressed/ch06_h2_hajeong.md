---
module: ch06_h2_hajeong (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/ch06_h2_hajeong.md
outputs:
  - Ch.6 "윤하정 분기" 압축본 (5개 메인 씬 + 13개 분기 씬 + 4종 엔딩 — 분기 그래프 풀과 동일)
  - KEY 3개 + IF 체인 평가 + 4종 엔딩 100% 보존
  - CG cg_hajeong_drunk(HAPPY 재활용) + cg_hajeong_true + VIDEO video_true_hajeong 보존
status: review
---

# 03-story/scenarios/compressed/ch06_h2_hajeong.md

> 풀 `scenarios/ch06_h2_hajeong.md`의 압축 버전. NARRATION/MONOLOGUE 50% 삭감, DIALOGUE 약 20% 가볍게 합치기, KAKAO/CHOICE/IF/FLAG/INC/JUMP/ENDING/BG/BGM/SFX/CHARACTER/CG/VIDEO 100% 보존.
> 변태 망상 페어 0회 (Ch.6 0회 PM 결정 동일).
> 씬 ID·CHOICE next 그래프·IF 평가 체인 풀과 동일.

---

# Scene: ch06_h2_01_festival_booth
# Hint: chapter=6, heroine=H2, time="2026-06-01 afternoon"

[BG: bg_kmu_main fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 2026년 6월 1일 월요일 오후 3시. 의대 본관 앞 광장. 축제 주간 첫날. 5조가 부스 운영 메인.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 의대 축제 주간 첫날. 본과 1학년이 부스 메인을 맡는다고 했을 때 좀 의외였는데, 결국 우리 5조가 운영을 맡게 됐다.

[CHARACTER: 윤하정 right default fade]

[윤하정] (시선 들며) 야, 윤모. 늦었네.
[구윤모] 5분 전인데?
[윤하정] 5분 전 = 늦은 거. 부스 시작 시간이 3시야.
[구윤모] 알겠어. 다음부턴 10분 전.
[윤하정] (시선 박스로) 그래 그게 맞지.

[CHARACTER: 오준혁 right_back default fade]

[오준혁] 윤모 형, 안녕하세요!
[이문규] 윤하정 또 시작ㅋㅋ
[윤하정] (시선 흘기며) 시작이 아니라 정시야 정시.
[오준혁] (큭큭) 5조 부스 운영 빡세겠다.
[구윤모] (피식) 빡세긴 한데 재밌네.

[정욱] 풍선 받아왔어.
[구윤모] 어, 정욱 수고했어. 둘이 같이 다는 게 빠르지. 같이 하자.
[윤하정] (옆에서 박스 정리하며) ...풍선 다는 건 구도가 중요해. 부스 들어오는 사람 시선이 위로 가는 각도. 너무 위에 있으면 안 보이고, 너무 아래면 시야 가린다.
[정욱] 와 윤하정 정확하네ㅋㅋ
[윤하정] 그건 정확히는 정확한 게 아니라 부스 운영 기본이지. 학생회 부스 운영 매뉴얼 봤거든?
[구윤모] (피식) 알겠어. 시야 안 가리는 높이로.

[구윤모 모놀로그] 윤하정 그대로네. "그건 정확히는"도 그대로고.

[INC: H2 +5]

[CHARACTER: 윤하정 right serious fade]

[윤하정] 윤모. 부스 운영 첫날인데 5조 다섯 명 다 시간 내준 거, 잘 챙겨야 해.
[윤하정] 정욱 풍선 가져오느라 어제 1시간 늦게 잤다고 단톡에 흘렸더라.
[구윤모] (살짝 놀라며) 어, 그래?
[윤하정] (시선 비스듬) ...뭐, 너 과대니까 그 정도는 알아두라고.
[구윤모] 정작 본인은 챙기는 모습을 단답으로만 흘리시고.

[윤하정] ...뭐, 알면 됐어.
[구윤모] (피식) 알겠어. 5조 다섯 명 챙겨가면서 부스 굴려볼게.

[CHOICE]
- "5조 든든해, 디테일 챙겨줘서 고마워" (5조 + H2 진심) → next: ch06_h2_01b_thanks  {tone:direct_friendly, key:true, descriptor:ch6_h2_booth_team}
- "어, 부스 잘 굴리자" (담담히) → next: ch06_h2_01b_quick  {tone:direct_friendly}
- "윤하정 너 너무 빡세게 안 가도 돼ㅋㅋ" (가볍게) → next: ch06_h2_01b_light  {tone:playful_casual}
[/CHOICE]


---

# Scene: ch06_h2_01b_thanks

[FLAG: flag_h2_booth=thanks]

[구윤모] 윤하정.
[윤하정] (시선 들며) 어.
[구윤모] 5조 같이 부스 굴리는 거, 든든하다. 정욱 어제 늦게 잔 것까지 네가 챙겨준 디테일. 너 아니었으면 그거 못 잡았을 거고. 진짜 고마워.

[CHARACTER: 윤하정 right blush fade]

[윤하정] ...야. (시선 비스듬) 그렇게 정색하고 고맙다고 하는 거, 너 답지 않잖아.
[구윤모] 너 답지 않은 모습도 가끔 보여야 분위기가 돌아오지.
[윤하정] ...뭐, 됐어. ...너도 5조에서 챙기는 거, 잘 보고 있거든?
[구윤모] (피식) 그건 처음 듣는다.
[윤하정] (시선 박스 쪽) ...오늘 처음 한 말이니까.

[구윤모 모놀로그] 무뚝뚝한 척 다 해놓고 마지막에 저런 말 흘리시네. "오늘 처음 한 말"이라는 거. 저게 진심이고.


[JUMP: ch06_h2_01_close]

---

# Scene: ch06_h2_01b_quick


[FLAG: flag_h2_booth=quick]

[구윤모] (담담히) 어, 부스 잘 굴리자.
[윤하정] 어.

[구윤모 모놀로그] 무난하게 끝났다. 한마디만 더 붙였어도 좋았을 텐데.

[JUMP: ch06_h2_01_close]

---

# Scene: ch06_h2_01b_light


[FLAG: flag_h2_booth=light]

[구윤모] (가볍게) 윤하정 너 너무 빡세게 안 가도 돼.

[CHARACTER: 윤하정 right pout fade]

[윤하정] (시선 비스듬) 빡세게 가는 게 아니라 부스 운영 기본이거든? ...뭐, 됐어.
[구윤모] (살짝 흠칫) 어, 미안. 가볍게 가려다 분위기 못 맞췄네.
[윤하정] 알면 됐어.

[구윤모 모놀로그] 분위기 못 맞췄다.

[JUMP: ch06_h2_01_close]

---

# Scene: ch06_h2_01_close

[지문] 부스가 본격 굴러간다.

[구윤모 모놀로그] 두 시간이 한 호흡으로 흘러갔다.

[CHARACTER_HIDE: 정욱 fade]
[CHARACTER_HIDE: 오준혁 fade]
[CHARACTER_HIDE: 이문규 fade]
[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 윤모 fade]

[BGM_STOP fade=2]

[JUMP: ch06_h2_02_dongseong]

---

# Scene: ch06_h2_02_dongseong
# Hint: chapter=6, heroine=H2, time="2026-06-01 evening"

[BG: bg_dongseong_street fade]
[BGM: 일상 fade=2 volume=0.6]
[SFX: 술집_왁자지껄 volume=0.4]

[지문] 같은 날 저녁 8시. 동성로 술집. 부스 운영 끝나고 본과 1학년 + 의예과 후배 + 약대 합석.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 부스 끝나고 단체 합석 자리. 5월 회식 때랑 비슷한데 좀 더 풀어진 분위기다.

[CHARACTER: 윤하정 right outfit_party fade]

[윤하정] (시선 들며) 어, 윤모. 옆자리 비었어.
[구윤모] 어, 그래.
[윤하정] 부스 운영 진짜 빡셌다.
[구윤모] (피식) 정욱 풍선 다섯 개 더 가져온다고 한 번 더 갔다 왔잖아.
[윤하정] 그래서 정욱 다음 주 부스는 풍선 안 시키기로 했어.
[구윤모] 그것도 챙긴 거고.

[김규민] (단체 자리) 야 윤모! 5조 부스 폼 미쳤다고 단톡에 풀렸다!
[구윤모] 김규민 폼 미쳤네.
[조나단] (단체 자리) 5조 굿즈 매출 본과 1학년 부스 1위라네!
[윤하정] 매출 1위는 정확히는 굿즈 라인업 짠 거 + 풍선 디테일 합쳐진 거지.
[구윤모] (피식) 그것도 맞고.

[윤하정] 야, 윤모. 단체 자리 한 시간이면 충분하지 않아? ...나는 한 시간이 한계야. 단체 분위기 빡세서.
[구윤모] 그래?
[윤하정] (시선 비스듬) ...뭐, 너랑 잠깐 갈라져서 더 걸어도 될 것 같고.
[구윤모] (피식) 윤하정이 그런 말 꺼내는 거 의외다.
[윤하정] ...뭐, 단체 분위기 빡세서 그런 거지 다른 의미 없어.

[INC: H2 +3]

[구윤모 모놀로그] "다른 의미 없어"라니. 다른 의미 있다는 걸 본인이 직접 알려주는 셈이잖아.

[이문규] (옆 자리) 윤하정 한 잔 더!
[윤하정] (잔 살짝 들며) 한 잔만 더 받을게.
[이문규] (옆 자리) 오늘 풀어진 윤하정 이문규가 처음 봐ㅋㅋ
[윤하정] 풀어진 거 아니야. 한 잔만 더 받을 뿐이지.

[CHOICE]
- "단체 한 시간 정도면 충분하지. 잠깐 같이 나가자" (산책 응답) → next: ch06_h2_02b_walk  {tone:direct_friendly}
- "윤하정 한 잔 더 받는 거 받아주자" (단체 더 머무름) → next: ch06_h2_02b_stay  {tone:warm_supportive}
[/CHOICE]


---

# Scene: ch06_h2_02b_walk

[FLAG: flag_h2_dongseong=walk]

[구윤모] 단체 한 시간이면 충분하지. 잠깐 같이 나가자.
[윤하정] 어.

[김규민] (작게) 야 윤모 윤하정 잠깐 나간다.
[조나단] (작게) 어, 알겠어. 천천히 와.

[CHARACTER_HIDE: 윤모 fade]
[CHARACTER_HIDE: 윤하정 fade]

[BGM_STOP fade=2]

[JUMP: ch06_h2_03_walk]

---

# Scene: ch06_h2_02b_stay

[FLAG: flag_h2_dongseong=stay]

[구윤모] 윤하정 한 잔 더 받는 거, 같이 받아주자.
[윤하정] 어, 알겠어.

[지문] 30분 후. 윤하정이 잠깐 자리에서 일어선다.

[윤하정] 윤모, 이제 진짜 갈래?
[구윤모] 어, 가자.

[CHARACTER_HIDE: 윤모 fade]
[CHARACTER_HIDE: 윤하정 fade]

[BGM_STOP fade=2]

[JUMP: ch06_h2_03_walk]

---

# Scene: ch06_h2_03_walk
# Hint: chapter=6, heroine=H2, time="2026-06-01 night"

[BG: bg_dongseong_street fade]
[BGM: 로맨틱 fade=3 volume=0.4]

[지문] 같은 날 밤 10시. 동성로 거리 한쪽. 6월 밤공기가 조금 시원하다.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 윤하정 right default fade]

[윤하정] 야.
[구윤모] (시선 옆으로) 어.
[윤하정] (시선 거리 끝) 본과 1학년 한 학기 끝났네.
[구윤모] 그러게. 학기가 평소보다 두 배는 길었던 것 같다.
[윤하정] 도서관 밤샘 5일이 한 학기에 다 들어갔으니까.

[구윤모 모놀로그] 도서관 밤샘 5일. 윤하정이 그 얘기로 먼저 꺼내는 거 의외다.

[윤하정] ...너 도서관에서 새벽 4시까지 옆자리 있어 준 거. (시선 비스듬) 그거 두 번 고맙다고 했는데, 두 번째는 아직 답 못 받았어.
[구윤모] 답이 뭐였더라.
[윤하정] (시선 거리) ...뭐, 됐어. 그냥 잊어.

[CHOICE]
- "잊을 수 없지, 네 옆에서 한 페이지씩 넘긴 시간" (시험기간 회상 진심) → next: ch06_h2_03b_recall  {tone:direct_friendly}
- "그런 답 한 줄로 정리할 게 아니지" (담담히) → next: ch06_h2_03b_neutral  {tone:warm_supportive}
[/CHOICE]


---

# Scene: ch06_h2_03b_recall


[FLAG: flag_h2_recall=warm]

[구윤모] 잊을 수 없지. 너 도서관에서 잠든 모습 보면서, 옆에서 한 페이지 한 페이지 더 넘긴 시간이라.
[구윤모] 옆자리 책장 넘어가는 소리 한 번씩 들리는 게 새벽의 핵심이고. 그 소리가 한 학기 시험 자료의 절반이었어.

[CHARACTER: 윤하정 right smile_small fade]

[윤하정] ...야. (시선 비스듬) 그렇게 정색하고 말하는 거 너 답지 않잖아.
[구윤모] 너 답지 않은 모습도 가끔 보여야지.
[윤하정] ...뭐, 알겠어. (시선 거리) ...너만 페이지 넘긴 거 아니거든? 나도 너 옆자리 있는 거 보면서 한 페이지 더 넘긴 거야.

[구윤모 모놀로그] "나도 너 옆자리 있는 거 보면서 한 페이지 더 넘긴 거야." 윤하정 입에서 이런 말 처음 듣는다.

[JUMP: ch06_h2_03_extend]

---

# Scene: ch06_h2_03b_neutral


[FLAG: flag_h2_recall=neutral]

[구윤모] (담담히) 그런 답 한 줄로 정리할 게 아니지.
[윤하정] ...어, 그래.

[구윤모 모놀로그] 무난하게 넘어갔다.

[JUMP: ch06_h2_03_extend]

---

# Scene: ch06_h2_03_extend

[윤하정] 야, 윤모. 도서관 옥상 알아?
[구윤모] 알지. 본관 4층 옥상.
[윤하정] (시선 비스듬) ...밤에 한 번도 안 가봤어. 시험기간엔 도서관 안에만 있었으니까.
[구윤모] 옥상 야경 본 적 없다는 거?
[윤하정] 어. (시선 거리 끝) ...뭐, 됐어. 다음에.

[구윤모 모놀로그] "다음에"라니. 윤하정 입에서 저렇게 나오면 가고 싶다는 뜻이지. 받아주는 게 맞다.

[CHOICE]
- "잠깐 더 걸을까, 옥상 같이 가자" (산책 연장 + 옥상 권유) → next: ch06_h2_03b_extend_warm  {tone:direct_friendly, key:true, descriptor:ch6_h2_walk_extend}
- "어, 다음에 가자" (담담 응답) → next: ch06_h2_03b_extend_quick  {tone:warm_supportive}
- "너 술 한 잔 더 한 거 같은데 옥상은 좀 그렇지 않냐" (가볍게 거절) → next: ch06_h2_03b_extend_light  {tone:playful_casual}
[/CHOICE]


---

# Scene: ch06_h2_03b_extend_warm


[FLAG: flag_h2_walk=extend]

[구윤모] 잠깐 더 걸을까. 도서관 옥상 같이 가자. 본관 4층, 5분이면 도착이고. 첫 야경 옆에 누구 있는 게 의미 있지.

[CHARACTER: 윤하정 right blush fade]

[윤하정] ...야. (시선 거리) 그렇게 챙겨주는 거 너 답지 않다고 했잖아.
[구윤모] (옅게 웃으며) 그러게. 오늘 한 번 더 너 답지 않은 모습으로 가는 셈.
[윤하정] ...뭐, 알겠어. 같이 가자. ...어차피 부산 본가 가기 전에 야경 한 번은 봐야 하니까.

[구윤모 모놀로그] 부산 본가 가기 전에 야경 한 번. 가볍게 한 말 같지만 그게 아니다.


[JUMP: ch06_h2_03_close]

---

# Scene: ch06_h2_03b_extend_quick


[FLAG: flag_h2_walk=quick]

[구윤모] (담담히) 어, 다음에 가자.
[윤하정] 어. ...뭐, 그래도 잠깐 더 걷긴 하자. 자취방 방향 같으니까.
[구윤모] 그래.

[구윤모 모놀로그] 살짝 늦게 받았는데 윤하정이 자기 쪽에서 한 번 더 끌어줬다.

[JUMP: ch06_h2_03_close]

---

# Scene: ch06_h2_03b_extend_light


[FLAG: flag_h2_walk=light]

[구윤모] (가볍게) 야 너 술 한 잔 더 한 거 같은데 옥상은 좀 그렇지 않냐.

[CHARACTER: 윤하정 right pout fade]

[윤하정] (시선 비스듬) ...뭐 그래. 한 잔 더 한 게 그렇게 보였어?
[구윤모] (살짝 흠칫) 아니, 그게 아니라.
[윤하정] (시선 거리) ...됐어. 자취방 방향이라 같이 걸어는 갈게.

[구윤모 모놀로그] 분위기 못 맞춘 거 두 번째.

[JUMP: ch06_h2_03_close]

---

# Scene: ch06_h2_03_close

[CHARACTER_HIDE: 윤모 fade]
[CHARACTER_HIDE: 윤하정 fade]

[BGM_STOP fade=2]

[JUMP: ch06_h2_04_rooftop]

---

# Scene: ch06_h2_04_rooftop
# Hint: chapter=6, heroine=H2, time="2026-06-01 night, 11pm"

[BG: bg_library_night fade]
[BGM: 로맨틱 fade=3 volume=0.5]

[지문] 같은 날 밤 11시. 본관 4층 도서관 옥상. 옥상 난간 너머로 캠퍼스 야경 + 멀리 동성로 빛.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 윤하정 right default fade]

[윤하정] ...야경이 이런 거구나.
[구윤모] 첫 야경?
[윤하정] (시선 야경) 어. 도서관 안에만 있었으니까. 본관 4층인데 한 단계 더 넓게 보이네.

[BGM: 로맨틱 fade=2 volume=0.5]

[구윤모 모놀로그] 야경 분위기부터 같이 받아주는 게 먼저다.

[윤하정] 야.
[구윤모] (시선 옆으로) 어.
[윤하정] (시선 비스듬) 한 가지 할 말 있는데, 해도 돼?
[구윤모] 해.
[윤하정] ...OT 때 너 처음 봤을 때부터, 신경 쓰였거든?
[윤하정] (시선 야경) 5조 같이 배정 받은 거 듣고 잠깐 멈췄던 게, 그게 신경 쓰여서였고. ...뭐, 그게 한 학기의 시작이었어.

[구윤모 모놀로그] OT 때부터. 한 학기 동안 한 번도 꺼내지 않았던 진심을, 옥상 야경 앞에서 처음 흘렸다.

[CHOICE]
- "너랑 있으면 머리가 멍해져" (솔직 호감 표현) → next: ch06_h2_04b_honest  {tone:direct_friendly, key:true, descriptor:ch6_h2_rooftop_honest}
- "나도 너 좋아해" (직설 호감) → next: ch06_h2_04b_direct  {tone:direct_friendly}
- "친구로 좋은데?" (회피) → next: ch06_h2_04b_friend  {tone:warm_supportive}
[/CHOICE]


---

# Scene: ch06_h2_04b_honest


[FLAG: flag_h2_rooftop=honest]

[구윤모] 윤하정.
[윤하정] (시선 야경에서 옆으로) 어.
[구윤모] 너랑 있으면... 머리가 멍해져.

[CHARACTER: 윤하정 right blush fade]

[윤하정] ...야. (시선 비스듬) 그게 무슨 답이야.
[구윤모] (살짝 부드럽게) 진심의 답이지.
[구윤모] 너 도서관 새벽에 옆자리 있는 거 보면서 책장 한 페이지씩 더 넘기던 게, 머리가 살짝 멍해지는 거였고. 5조 같이 배정 받았다는 거 OT 때 들었을 때부터 그랬어.
[구윤모] 직설이 맞을 때도 있고, 이런 식이 맞을 때도 있고. 너한테는 후자가 맞을 거 같았어.
[윤하정] ...윤모. (시선 야경) ...너 그렇게 말하는 거 진짜 너 답지 않다.
[구윤모] (옅게 웃으며) 너 답지 않은 모습도 한 번씩 보여야지.
[윤하정] ...뭐, 그 말. 진짜로. (시선 한 번 더 옆으로) ...나도 그래.

[구윤모 모놀로그] "나도 그래." 한 학기 통틀어 가장 풀린 모습.

[JUMP: ch06_h2_04_close]

---

# Scene: ch06_h2_04b_direct


[FLAG: flag_h2_rooftop=direct]

[구윤모] 윤하정. 나도 너 좋아해.

[CHARACTER: 윤하정 right blush fade]

[윤하정] ...야. (시선 야경) 직설은 직설이네.
[구윤모] 직설로 가는 게 맞다고 봤어.
[윤하정] ...뭐, 알겠어. 직설은 직설로 받을게.

[구윤모 모놀로그] 직설로 받았다. 윤하정 같은 사람한테는 직설보다 좀 풀어서 가는 게 더 깊을 수도 있었는데.

[JUMP: ch06_h2_04_close]

---

# Scene: ch06_h2_04b_friend


[FLAG: flag_h2_rooftop=friend]

[구윤모] 친구로 좋은데?

[CHARACTER: 윤하정 right pout fade]

[윤하정] ...어, 그래. (시선 야경) 친구. 그래 친구로.
[구윤모] (살짝 흠칫) 어, 그게 아니라.
[윤하정] 됐어. 친구가 맞다면 친구로.

[구윤모 모놀로그] 윤하정이 진심을 꺼내줬는데, 나는 회피로 받았다.

[JUMP: ch06_h2_04_close]

---

# Scene: ch06_h2_04_close

[윤하정] ...이제 가자.
[구윤모] 어.

[CHARACTER_HIDE: 윤모 fade]
[CHARACTER_HIDE: 윤하정 fade]

[BGM_STOP fade=2]

[BG: black fade=3]

[JUMP: ch06_h2_05_evaluate]

---

# Scene: ch06_h2_05_evaluate
# Hint: chapter=6, heroine=H2, time="branch evaluation"

[지문] — 본과 1학년 봄 + 의대 축제 주간 + 도서관 옥상 첫 야경. 5조 동기 + 한 학기 결정.

[EVALUATE_TIER: H2]

[IF: H2 < 40]
[JUMP: ch06_h2_bad]
[ELSE]
  [IF: H2 < 60]
  [JUMP: ch06_h2_normal]
  [ELSE]
    [IF: H2 < 80]
      [IF: key_count_H2 >= 2]
      [JUMP: ch06_h2_happy]
      [ELSE]
      [JUMP: ch06_h2_normal]
      [/IF]
    [ELSE]
      [IF: key_count_H2 >= 3]
      [JUMP: ch06_h2_true]
      [ELSE]
      [JUMP: ch06_h2_happy]
      [/IF]
    [/IF]
  [/IF]
[/IF]

---

# Scene: ch06_h2_true
# Hint: chapter=6, heroine=H2, ending=TRUE, time="2026-06-27 morning"

[BG: bg_dongdaegu_station fade=4]
[BGM: 클라이맥스 fade=4 volume=0.6]

[지문] 2026년 6월 27일 토요일 오전 11시. 동대구역 KTX 플랫폼. 부산행 KTX가 12시 정각 출발 예정.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 6월 말, 토요일 오전. 윤하정이 부산 본가로 가는 날이다.

[CHARACTER: 윤하정 right warm_smile fade]

[VIDEO: video_true_hajeong]

[CG: cg_hajeong_true show]

[지문] 동대구역 KTX 플랫폼. 윤하정이 캐리어 옆에 서서 한 손을 잠깐 들고 있다. 햇살에 머리가 한 번 흩날리고, 평소 무표정에서 본 적 없는 따뜻한 미소가 입가에 닿아 있다.

[CG_HIDE]

[윤하정] (시선 들며 옅은 미소) 야.
[구윤모] 도착했어. 11시 정각.
[윤하정] 5분 늦게 와도 됐는데.
[구윤모] (피식) 정시 도착이 맞지. 누가 나한테 정시 가르쳐 줬더라.
[윤하정] (옅게 웃으며) ...뭐, 잘 챙겼네.

[구윤모] 부산 본가 한 학기 만이지.
[윤하정] (시선 캐리어) 어. 작년 12월 이후 처음. 본가 가면 엄마 첫 마디가 뭐였더라. "딸 살이 좀 빠졌네" 그게 첫 마디일 거야.
[구윤모] 시험기간 도서관 5일에 좀 빠졌으니까.
[윤하정] 좀이 아니라 좀 많이 빠졌지. 정확히는.
[구윤모] (피식) 정확히는 또 나왔다.
[윤하정] (옅게 웃으며) ...그건 평생 안 빠질 거 같아.

[윤하정] (시선 옆으로) 야.
[구윤모] (시선 옆으로) 어.
[윤하정] ...여름방학 끝나고 보자. (시선 플랫폼 끝) 본과 2학년 시작하면 한 학기 더 빡세다고 하더라. 같이 견디는 식으로 가자.
[구윤모] 어. 같이 가자.
[윤하정] ...그리고. 부산 한 번 와줘. 본가 아니라 그냥 부산. 여름방학 중간 즈음이면 좋겠고.
[구윤모] (살짝 부드럽게) 그래. 갈게.

[구윤모 모놀로그] 부산 한 번 와줘. 한 학기 동안 한 번도 꺼내지 않던 진심을 옥상에서 처음 흘렸고, KTX 플랫폼에서 한 마디 더 보탰다.
[구윤모 모놀로그] 카데바 앞에서 손 떨리던 거, 그때 옆에 있어 줬던 게 시작이었다.

[윤하정] (옅은 미소) 갈게. 윤모.
[구윤모] 어. 잘 다녀와.

[CHARACTER: 윤하정 right warm_smile fade]

[BGM: 클라이맥스 fade=2 volume=0.7]

[BG: black fade=4]

[지문] — 끝.

[지문] **윤하정 트루 엔딩 — 동기의 봄**

[ENDING: END_H2_TRUE]

---

# Scene: ch06_h2_happy
# Hint: chapter=6, heroine=H2, ending=HAPPY, time="2026-06-14 afternoon"

[BG: bg_campus_cafe fade=3]
[BGM: 일상 fade=3 volume=0.5]

[지문] 2026년 6월 14일 일요일 오후. 의대 본관 옆 24시간 카페.

[CHARACTER: 윤모 center smile fade]
[CHARACTER: 윤하정 right default fade]

[구윤모 모놀로그] 의대 축제 주간 끝나고 한 주 지났다. 5조 단톡에 윤하정이 카페 한 번 가자고 짧게 한 마디 보낸 게 시작이고.

[CG: cg_hajeong_drunk show]

[지문] 카페 창가 자리. 윤하정이 따뜻한 음료 한 잔을 두 손으로 감싸고 있다. 살짝 발그레한 모습이 5월 회식 자리 분위기를 떠올리게 한다.

[CG_HIDE]

[윤하정] (시선 들며) 어, 윤모. 늦었네.
[구윤모] (피식) 5분 전이라니까.
[윤하정] 5분 전 = 늦은 거. 너 좀 익혀라.
[구윤모] (옅게 웃으며) 알겠어. 다음부턴 10분 전.

[윤하정] 야. (시선 잔으로) ...옥상에서 너 답한 거, 살짝 빨랐던 거 같아.
[구윤모] 어. 살짝 빨랐지.
[윤하정] 친구에서 시작하자. (시선 옆으로) 5조 동기로, 그리고 너 답지 않은 모습 가끔 보이는 친구로.
[구윤모] (옅게 웃으며) 그래. 친구에서 시작하자.

[구윤모 모놀로그] 친구에서 시작하자. 빨랐던 게 천천히 가는 시작으로 정리되는 거.

[BGM: 일상 fade=2 volume=0.6]

[BG: black fade=3]

[지문] — 끝.

[지문] **윤하정 해피 엔딩 — 해부 5조의 둘**

[ENDING: END_H2_HAPPY]

---

# Scene: ch06_h2_normal
# Hint: chapter=6, heroine=H2, ending=NORMAL, time="2026-06-08 evening"

[BG: bg_studio_room fade=3]
[BGM: 일상 fade=3 volume=0.4]

[지문] 2026년 6월 8일 월요일 저녁. 자취방.

[CHARACTER: 윤모 center default fade]

[SFX: 카톡_알림]

[KAKAO]
- {speaker:윤하정} 야 5조
- {speaker:윤하정} 다음 주 본과 1학년 단체 회식 있다
- {speaker:오준혁} ㅇㅇ ㄱㄱ
- {speaker:이문규} ㄱ
- {speaker:정욱} 가요
- {speaker:윤하정} 5조 다 모이는 자리니까 윤모도 와
- {speaker:구윤모} 어 갈게
- {speaker:윤하정} 어
[/KAKAO]

[구윤모 모놀로그] 5조 단톡에선 한 마디. 1:1엔 한 학기 통틀어 아무것도 없네.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:윤하정} 야
- {speaker:윤하정} 옥상 일은 그냥 5조 동기로 두자
- {speaker:윤하정} 너랑 친구잖아
- {speaker:윤하정} 5조 한 학기 더 가야 하니까
- {speaker:구윤모} 어 알겠어
- {speaker:윤하정} 어
[/KAKAO]

[구윤모 모놀로그] "너랑 친구잖아." 5조 한 학기는 더 길게 가야 하니까, 그게 맞는 선택이지.

[BGM: 일상 fade=2 volume=0.5]

[BG: black fade=3]

[지문] — 끝.

[지문] **윤하정 노멀 엔딩 — 동기로 남은 봄**

[ENDING: END_H2_NORMAL]

---

# Scene: ch06_h2_bad
# Hint: chapter=6, heroine=H2, ending=BAD, time="2026-06-03 evening"

[BG: bg_lecture_day fade=3]
[BGM: 슬픔 fade=4 volume=0.4]

[지문] 2026년 6월 3일 수요일 오후. 본과 1학년 강의실. 부스 운영 후속 회의 자리. 5조 분위기가 조금 굳어 있다.

[CHARACTER: 윤모 center sad fade]

[구윤모 모놀로그] 5조 부스 후속 회의에 윤하정이 좀 늦게 들어왔다. 분위기가 굳어 있다.

[CHARACTER: 윤하정 right pout fade]

[구윤모] 윤하정.
[윤하정] (시선 책상) 어.
[구윤모] 어제 옥상에서 내가 어설프게 한 게 좀 있었던 거 같아서.
[윤하정] ...뭐, 됐어. (시선 책상 그대로) 5조 후속 정리 끝내고 갈래.

[CHARACTER: 오준혁 left default fade]

[오준혁] (작게 윤모에게) 형, 윤하정 누나 오늘 컨디션 안 좋대요. 살살 가요.
[구윤모] 어. 알겠어.

[CHARACTER_HIDE: 윤하정 fade]

[구윤모 모놀로그] 어설프게 던진 한 마디가 5조 분위기까지 굳혀버렸다.
[구윤모 모놀로그] 한 학기 같이 가는 5조인데, 이 분위기로 다음 학기까지 가야 한다는 게.

[BG: black fade=3]

[지문] — 끝.

[지문] **윤하정 배드 엔딩 — 굳어버린 5조**

[ENDING: END_H2_BAD]
