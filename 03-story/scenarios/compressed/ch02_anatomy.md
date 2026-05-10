---
module: ch02_anatomy (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/ch02_anatomy.md
outputs:
  - Ch.2 "카데바" 압축본 (6개 메인 씬 + 4개 분기 — 분기 그래프 풀과 동일)
  - 변태 망상 페어 #2 보존 (Scene 04, 한설 안경 닦는 모먼트)
  - CG 트리거 cg_hajeong_anatomy / cg_seol_lab_first 보존
status: review
---

# 03-story/scenarios/compressed/ch02_anatomy.md

> 풀 `scenarios/ch02_anatomy.md`의 압축 버전. NARRATION/MONOLOGUE 50~60% 삭감, DIALOGUE/KAKAO/CHOICE/FLAG/BG/BGM/SFX/CHARACTER/CG/VIDEO/JUMP 100% 보존.
> 변태 망상 페어 (Scene 04, `(망상 시작)` × 3 → `(자기자각)` × 3 → `(정상복귀)` × 2) 한 줄도 손대지 않음.
> 12세 가드레일 동일: 카데바 시각 묘사 0건.
> 씬 ID·CHOICE next 그래프 풀과 동일.

---

# Scene: ch02_01_anatomy_morning
# Hint: chapter=2, time="2026-03-16 morning", active=H2

[BG: bg_studio_room fade]
[BGM: 긴장 fade=2 volume=0.4]

[지문] 2026년 3월 16일 월요일 오전 8시. 자취방. 윤모가 흰 가운을 꺼낸다.

[CHARACTER: 윤모 center serious fade]

[구윤모 모놀로그] 2주가 빠르네. 막상 오늘이 닥치니까... 다르긴 다르다.

[BG: bg_kmu_main fade]
[SFX: 발자국 volume=0.3]

[지문] 의대 본관 앞. 동기들이 오늘은 짧게 인사만 나누고 지나간다.

[CHARACTER: 김규민 right default fade]

[김규민] (작게) 윤모.
[구윤모] 어. 왔어?
[김규민] (작게) ...같이 가자.
[구윤모] 어. 가자.

[CHARACTER_HIDE: 김규민 fade]

[구윤모 모놀로그] 김규민이 농담 한 마디 안 던지고 인사만 하는 모습, 처음 본다.

[BG: bg_anatomy_lab variant=entrance fade]

[지문] 실습실 입구. 본과 1학년 50명이 흰 가운에 마스크를 쓰고 모여 있다.

[CHARACTER: 윤하정 left outfit_lab_coat fade]

[윤하정] 어. 왔어.
[구윤모] 어. 다들 일찍 왔네.
[윤하정] (시선 살짝 떨어짐) ...어차피 늦으면 안 되잖아.

[지문] 입구 옆문이 열리고, 흰 가운을 입은 40대 남자 교수가 나온다.

[이태호] 자, 모였죠? 시간 됐습니다. 들어가기 전에 한 번만 짧게.
[이태호] 오늘 만날 분들은 본인의 의지로 우리에게 몸을 내어주신 분들입니다. 우리는 그 의지에 답하기 위해 여기 모인 거고요.
[이태호] 들어가서 묵념 한 번 같이 합시다.
[이태호] 사진, 영상, 카톡 — 다 절대 안 됩니다. 가운 안 주머니에 폰 넣어두세요.

[구윤모 모놀로그] 평소 농담 잘 던지시던 교수님이 저렇게 진지하시니까... 더 무거워진다.

[이태호] 그럼 들어갑시다.

[CHARACTER_HIDE: 이태호 fade]
[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 윤모 fade]

[SFX: 실습실_문_열림 volume=0.4]

[JUMP: ch02_02_cadaver_first]

---

# Scene: ch02_02_cadaver_first
# Hint: chapter=2, time="2026-03-16 morning, anatomy lab", active=H2

[BG: bg_anatomy_lab variant=entrance]
[BGM: 긴장 volume=0.5]

[지문] 실습실 안. 5조가 실습대 옆에 자리 잡는다. 학생들의 눈빛, 깊은 숨, 마스크 위로 보이는 떨리는 속눈썹.

[CHARACTER: 윤모 center serious fade]

[이태호] (안내) 그럼 묵념하겠습니다.

[구윤모 모놀로그] (눈을 감으며) ...
[구윤모 모놀로그] 한 분 한 분에게 가족이 있었을 거고. 그분들이 어떤 마음으로 보내셨을지... 가늠이 안 된다.
[구윤모 모놀로그] 잘 배우겠습니다. 그 말밖에 안 떠오른다.

[이태호] (안내) 됐습니다. 시작합시다.

[CHARACTER: 윤하정 right outfit_lab_coat fade]

[지문] 윤하정의 손이 실습대 모서리를 잡고 있다. 그 손이 살짝 떨린다.

[구윤모 모놀로그] 손이 떨리고 있다. 카페에서 농담 치던 모습이 아니다, 지금은.

[CHOICE]
- "괜찮아? 천천히 해" 작게 말한다 {tone:direct_friendly, key:true, descriptor:ch2_cadaver_calm, coFire:junhyuk} → next: ch02_02b_steady
- 같이 침묵하며 옆에 선다 {tone:warm_supportive, coFire:taeho} → next: ch02_02b_silent

[/CHOICE]

---

# Scene: ch02_02b_steady

[FLAG: flag_h2_cadaver_response=calm]

[구윤모] (낮게, 거의 속삭이듯) ...괜찮아? 천천히 해.

[지문] 윤하정의 손 떨림이 살짝 멎는다.

[CHARACTER: 윤하정 right smile_small fade]

[윤하정] ...어. 어. 너야말로 괜찮아 보이네. 의외로.
[구윤모] 의외라니. 나도 떨려. 그냥... 같이 가면 되지.
[윤하정] ...그래. 같이.


[JUMP: ch02_02_after_choice]

---

# Scene: ch02_02b_silent

[FLAG: flag_h2_cadaver_response=silent]

[지문] 윤모는 말 없이 윤하정 옆으로 한 발짝 더 다가선다.

[구윤모 모놀로그] 같은 자리에 같이 서 있는 것만으로도 뭔가 전해진다고 믿어보자.

[지문] 윤하정의 손 떨림이 한참 뒤에야 천천히 멎는다.

[JUMP: ch02_02_after_choice]

---

# Scene: ch02_02_after_choice

[CG: cg_hajeong_anatomy show]

[지문] 마스크가 살짝 흘러내린 채로 윤하정이 옆을 흘끗 본다. 윤모와 시선이 잠시 마주친다.

[구윤모 모놀로그] 이 순간만큼은 잊지 말아야겠다.

[CG_HIDE]

[이태호] (안내) 자, 5조부터 차례로 봅시다.

[구윤모 모놀로그] 첫 대면.
[구윤모 모놀로그] (시선 떨굼) ...
[구윤모 모놀로그] (잠시 후) 됐다. 봤다. 마음에 새겼다.

[지문] 옆 조에서 누군가 작게 헛기침을 한다. 다른 조에서는 한 학생이 잠시 자리를 떠 화장실 쪽으로 빠진다.

[구윤모 모놀로그] 다들 자기 나름대로 견디는 중이다.

[지문] 한 시간 뒤. 첫 실습이 끝난다.

[이태호] (안내) 오늘은 여기까지. 다 같이 한 번 더 묵념하고 나갑시다.

[BGM_STOP fade=3]
[BG: bg_kmu_main fade=3]

[CHARACTER: 윤모 center serious fade]
[CHARACTER: 윤하정 right serious fade]

[지문] 본관 앞. 햇볕이 의외로 밝다.

[윤하정] 야.
[구윤모] 어?
[윤하정] (시선 안 마주치고) ...아까. 고마워. 됐고. 점심 먹자. 5조 다 같이.
[구윤모] (옅게 웃으며) 어. 그러자.

[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 윤모 fade]

[JUMP: ch02_03_biochem_lab]

---

# Scene: ch02_03_biochem_lab
# Hint: chapter=2, time="2026-03-17 afternoon", active=H2+H3, coFire=taeho

[BG: bg_anatomy_lab variant=biochem fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 다음 날 오후. 첫 생화학 실험. 한쪽엔 흰 가운에 안경을 쓴 조교가 자료를 정리하고 있다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 어제가 워낙 무거웠던 탓인지, 오늘 실험은 마음이 좀 가볍다.

[CHARACTER: 한설 right default fade]

[한설] (정면을 보며) 안녕하세요. 이번 학기 본과 1학년 생화학실험 조교 한설입니다. 박사과정 5년차고요.
[한설] 실험은 매주 한 번, 두 시간씩. 첫 실험은 간단한 단백질 정량부터 시작합니다.
[한설] 시약 다룰 때 라벨 두 번 확인하는 거 잊지 마세요.

[구윤모 모놀로그] 차분하시다. 본과 들어와서 처음 만나는 어른 같다.

[CHARACTER: 한설 right serious fade]

[한설] (5조 앞에서) 이 시약은 무게가 중요해요. 0.5g, 0.1g 단위까지. 그리고 시약병이 살짝 무거우니까 두 손으로 받쳐서 들어주세요.
[구윤모] 네, 알겠습니다.

[지문] 오준혁이 다른 시약을 윤모에게 건넨다. 받는 손이 살짝 헛돌고, 시약병 하나가 실험대 모서리에 부딪친다.

[SFX: 유리병_떨어짐 volume=0.6]

[지문] 시약병이 바닥에 떨어져 깨진다.

[구윤모 모놀로그] (식은땀) ...아.

[CHARACTER: 윤모 center panic fade]

[CHARACTER: 한설 right serious fade]

[지문] 한설이 빠른 걸음으로 5조 자리에 다가온다. 표정은 침착하다.

[한설] 다친 사람 없어요? 일단 둘 다 뒤로 한 발씩 물러서요. 유리 조각 밟지 말고.
[구윤모] 네... 죄송합니다.
[오준혁] 죄송합니다, 제가 건네면서 자세가 안 좋았어요.

[지문] 한설이 깨진 유리 처리 키트를 꺼내 정리하기 시작한다.

[CHOICE]
- "정말 죄송합니다. 청소도 도와드릴게요." (진심 사과 + 자처) → next: ch02_03b_apologize  {tone:warm_supportive, key:true, descriptor:ch2_apology}
- "죄송합니다." (간단 사과 후 물러남) → next: ch02_03b_quick  {tone:mature_serious}
[/CHOICE]


---

# Scene: ch02_03b_apologize

[FLAG: flag_h3_apology=sincere]

[구윤모] (한 발 앞으로 나서며) 정말 죄송합니다. 청소도 도와드릴게요.

[CHARACTER: 한설 right smile_slight fade]

[한설] ...아니에요. 유리 처리는 위험해서 제가 할게요. 학생은 가운 끝자락에 시약 묻은 거 화장실에서 닦고 와요.
[구윤모] 네, 알겠습니다. 정말 죄송합니다.
[한설] (옅게) ...괜찮아요. 첫 실험이라 그래요. 다음부터 시약병 건네받을 땐 두 손 다 비워두세요.
[구윤모] 네. 명심하겠습니다.


[JUMP: ch02_04_seol_recover]

---

# Scene: ch02_03b_quick

[FLAG: flag_h3_apology=quick]

[구윤모] 죄송합니다.

[CHARACTER: 한설 right serious fade]

[한설] (정리하며 짧게) ...괜찮아요. 첫 실험이니까.
[한설] 가운 끝자락 시약 묻은 거 화장실에서 닦아요.
[구윤모] 네... 감사합니다.

[JUMP: ch02_04_seol_recover]

---

# Scene: ch02_04_seol_recover

[CHARACTER: 한설 right smile_slight fade]

[VIDEO: video_meet_seol]

[CG: cg_seol_lab_first show]

[지문] 한설이 정리를 마치고 자리로 돌아간다. 가운 + 안경 + 옅은 미소.

[구윤모 모놀로그] 안경 너머로 살짝 미소가 비친다.

[CG_HIDE]

[CHARACTER: 윤하정 left pout fade]

[윤하정] 야 너 진짜 깬다.
[구윤모] (식은땀) 알겠다고.
[윤하정] (피식) 그래도 조교님 침착하시네.
[오준혁] 다른 분이었으면 명단 적어서 들어가셨을 거다.
[구윤모] ...그러게. 다음엔 조심해야지.

[지문] 한설이 자기 자리에서 안경을 벗어 가운 자락으로 천천히 닦는다.

[BGM: 코믹 fade=1 volume=0.4]
[CHARACTER: 윤모 center perv fade]

[구윤모 모놀로그] (망상 시작) ...어. 안경.
[구윤모 모놀로그] (망상 시작) 안경 벗으셨을 때 표정이 평소랑 살짝 다른데... 차분하시던 분이 저렇게 풀어지시기도 하는구나.
[구윤모 모놀로그] (망상 시작) 만약에 야간 실험 끝나고 똑같이 안경 닦으시는 순간을 옆에서 보게 되면, 그때는 또 다른 표정이 있을 것도 같고...

[CHARACTER: 윤모 center recover fade]

[구윤모 모놀로그] (자기자각) 아 진짜. 시약 깬 학생이 무슨 망상을.
[구윤모 모놀로그] (자기자각) 감싸주신 분께 무슨 짓이야.
[구윤모 모놀로그] (자기자각) 정신 차려라 구윤모.

[CHARACTER: 윤모 center default fade]
[BGM: 일상 fade=1 volume=0.5]

[구윤모 모놀로그] (정상복귀) 가방. 가방 챙기자.
[구윤모 모놀로그] (정상복귀) 다음 실험 때 잘하면 된다. 다음엔 안 깨먹는다.

[CHARACTER: 한설 right default fade]

[한설] (정중히) 다음 주에 봐요. 조심히 가요.
[구윤모] 네. 다음 주에 뵙겠습니다.
[윤하정] 감사합니다, 조교님.

[CHARACTER_HIDE: 한설 fade]
[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 윤모 fade]

[BGM_STOP fade=2]

[JUMP: ch02_05_kakao_night]

---

# Scene: ch02_05_kakao_night
# Hint: chapter=2, time="2026-03-17 night", active=H2+H3

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 같은 날 늦은 밤. 자취방.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 어제 카데바, 오늘 시약. 이제 본과 진짜 시작이다.

[SFX: 카톡_알림]

[지문] 5조 단톡방. "본과 1학년 해부 5조".

[KAKAO]
- {speaker:오준혁} 윤모 살아 있냐
- {speaker:구윤모} ㅇㅇ
- {speaker:구윤모} 살아는 있음
- {speaker:오준혁} 시약 좀 잘 잡고 다녀라 ㅋㅋ
- {speaker:이문규} 윤모 깬 거 옆 조도 봤던데
- {speaker:구윤모} ㄷㄷ
- {speaker:구윤모} 소문 빠름
- {speaker:정욱} 다음 실험 누구랑 자리 바꿔야 할 듯
- {speaker:오준혁} ㅋㅋㅋㅋ 정욱이 옆 가서 잡아주면 됨
- {speaker:정욱} ㄴㄴㄴ
- {speaker:윤하정} ㅋㅋ 됐고
- {speaker:윤하정} 조교님이 다 정리해주셨잖아
- {speaker:오준혁} 한설 조교님 진짜 침착하셨음
- {speaker:이문규} ㅇㅇ
- {speaker:구윤모} 다음엔 안 깸
- {speaker:구윤모} 약속함
- {speaker:정욱} 약속을 깨면 안 되지
- {speaker:오준혁} ㅋㅋㅋㅋㅋㅋㅋ 펀치
- {speaker:윤하정} 자라들 다
[/KAKAO]

[구윤모 모놀로그] 5조 분위기 좋다. 어제 같은 무게 함께 견딘 사이라 그런가.

[SFX: 카톡_알림]

[지문] 1:1 카톡방. "윤하정"에게서.

[KAKAO]
- {speaker:윤하정} 자?
- {speaker:구윤모} 깨어 있어
- {speaker:구윤모} 너도?
- {speaker:윤하정} 어
- {speaker:윤하정} 오늘 진짜 힘들었지
- {speaker:구윤모} 그러게
- {speaker:구윤모} 어제 + 오늘 두 콤보
- {speaker:윤하정} 어제 무거웠고 오늘 깨먹고
- {speaker:구윤모} 그건 좀 묻어줘라
- {speaker:윤하정} 못 묻어줌
- {speaker:윤하정} 근데 어제는 진짜
- {speaker:윤하정} ...너 옆에 있어줘서 덜 무서웠음
- {speaker:구윤모} 어
- {speaker:구윤모} 같이 가면 되는 거지
- {speaker:윤하정} 알겠어
- {speaker:윤하정} 자라
- {speaker:구윤모} 그래
- {speaker:구윤모} 너도
[/KAKAO]

[구윤모 모놀로그] 윤하정이 저 정도 말하기까지 쉽지 않았을 거다.
[구윤모 모놀로그] (작게 미소) ...됐다.

[CHARACTER: 윤모 center smile fade]

[BGM_STOP fade=2]

[JUMP: ch02_06_close]

---

# Scene: ch02_06_close

[BG: bg_studio_room]
[BGM: 메인_테마 fade=4 volume=0.5]

[지문] 침대에 누워 있는 윤모. 책상 등이 천천히 어두워진다.

[구윤모 모놀로그] 본과 1학년 3주 차. 카데바 첫 대면. 첫 실험. 첫 실수.
[구윤모 모놀로그] 다음 주는 동산병원 견학이라고 했나. 한 발씩 가면 되겠지.

[지문] — 끝 → Ch.3 "동산"

[JUMP: ch03_01_dongsan_lobby]

---

## 압축 메모

- 풀 대비 NARRATION/MONOLOGUE 약 55% 삭감, 그 외 100% 보존.
- **변태 망상 페어 (Scene 04, 한설 안경) 한 줄도 안 건드림** — 시그니처 보존.
- 톤 매트릭스 메타(`{tone:..., key:..., descriptor:...}`) 풀과 1:1 동일.
- CG 트리거 cg_hajeong_anatomy / cg_seol_lab_first 보존.
- 12세 가드레일: 카데바 시각 묘사 0건 그대로 (학생 표정/숨/지문만).
- 분기 그래프: 02b 2분기 / 03b 2분기 동일.
- DIALOGUE 100% 보존 — 이태호 교수/한설/윤하정/오준혁/김규민/윤모 모두.
