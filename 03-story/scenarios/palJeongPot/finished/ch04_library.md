---
module: ch04_library (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/ch04_library.md
outputs:
  - Ch.4 "도서관" 압축본 (7개 메인 씬 + 9개 분기 — 분기 그래프 풀과 동일)
  - H4 답장 시간 제한 미니게임 KAKAO_TIMER 10초 100% 보존
  - CG 트리거 5개 + VIDEO 1개 보존
status: review
---

# 03-story/scenarios/compressed/ch04_library.md

> 풀 `scenarios/ch04_library.md`의 압축 버전. NARRATION/MONOLOGUE 50% 삭감, DIALOGUE 약 20% 가볍게 합치기, KAKAO/CHOICE/CHOICE_KAKAO/KAKAO_TIMER/FLAG/INC/BG/BGM/SFX/CHARACTER/CG/VIDEO/JUMP 100% 보존.
> 변태 망상 페어 0회 (Ch.4 spec 동일).
> 씬 ID·CHOICE next 그래프 풀과 동일.

---

# Scene: ch04_01_library_late
# Hint: chapter=4, time="2026-04-27 night", active=H2

[BG: bg_library_night fade]
[BGM: 일상 fade=2 volume=0.4]

[지문] 4월 27일 밤 11시. 의대 도서관 자습실. 시험 일주일 전.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 표경민 right default fade]

[표경민] 윤모. 해부학 어디까지 왔어?
[구윤모] 당연히 하나도 안했지 나 출국의 신 구윤모야

[CHARACTER: 윤하정 left sleeping fade]

[CG: cg_hajeong_library show]
[지문] 윤하정이 해부학 교과서 위에 팔 베고 잠들어 있다. 빈 커피 컵 두 개.
[CG_HIDE]

[표경민] 너 22학번 선배한테 받은 해부 족보 있지? 윤하정이 부산 출신이라 선배 라인이 약하다고 했어. 과대니까 챙기는 게 자연스럽지 않냐.

[CHOICE]
- "지금 5조 단톡에 올린다" (족보 공유) → next: ch04_01b_share  {tone:direct_friendly, key:true, descriptor:ch4_share}
- "내일 깨면 직접 준다" (보류) → next: ch04_01b_later  {tone:mature_serious}
[/CHOICE]

---

# Scene: ch04_01b_share

[FLAG: flag_h2_share=now]

[KAKAO]
- {speaker:구윤모} 5조 족보 정리한 거 올림
- {speaker:구윤모} [해부학_족보_23~25.pdf]
- {speaker:구윤모} 신경계 부분 형광펜 박았음
- {speaker:오준혁} 윤모 굿
- {speaker:이문규} ㅠㅠ 감사
- {speaker:정욱} 과대 폼 미쳤네
[/KAKAO]

[CHARACTER: 윤하정 left smile_small fade]

[윤하정] (잠긴 목소리) ...자기가 정리한 거잖아. 통째로 올려도 돼?
[구윤모] 시험인데 뭐. 못 줄 이유 없잖아.
[윤하정] ...됐다. 고맙다, 진짜로.

[표경민] 윤하정이 고맙다 한 거 처음 듣는다.

[JUMP: ch04_01_close]

---

# Scene: ch04_01b_later

[FLAG: flag_h2_share=later]

[구윤모] 깨면 직접 줄게.
[표경민] 그것도 맞는 말이긴 하네.

[JUMP: ch04_01_close]

---

# Scene: ch04_01_close

[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 표경민 fade]
[BGM_STOP fade=2]

[JUMP: ch04_02_cafe_late]

---

# Scene: ch04_02_cafe_late
# Hint: chapter=4, time="2026-04-28 dawn", active=H1

[BG: bg_campus_cafe_night fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 4월 28일 새벽 0시 30분. 24시간 카페.

[CHARACTER: 윤모 center default fade]

[지문] 구석 창가에 흰 가운 안 청록 스크럽 차림인 사람이 머그잔을 두 손으로 감싸고 있다.

[CHARACTER: 차세린 left default fade]

[CG: cg_serin_cafe_late show]
[지문] 새벽 카페. 차세린이 창가에 앉아 머그잔을 감싸고 있다. 옅은 피로.
[CG_HIDE]

[구윤모] 선생님, 안녕하세요.
[차세린] ...아. 저번에 의국 복도에서 길 잃었던 학생.
[구윤모] 네, 구윤모입니다. 시험 전이라 카페인 좀 떨구러 왔습니다.
[차세린] 당직 끝나고 잠깐 들렀어요. 새벽엔 30분 머그잔 비우고 가는 게 서로 편해요.

[CHOICE]
- "괜찮으세요? 좀 쉬세요" (케어) → next: ch04_02b_care  {tone:warm_supportive, key:true, descriptor:ch4_care}
- "오늘도 수고 많으셨네요" (담담히) → next: ch04_02b_neutral  {tone:warm_supportive}
[/CHOICE]

---

# Scene: ch04_02b_care

[FLAG: flag_h1_care=yes]

[구윤모] 선생님, 괜찮으세요? 좀 더 쉬다 가세요. 서두르지 마시고요.

[CHARACTER: 차세린 left smile fade]

[차세린] ...학생이 그런 말 해주는 거 처음이에요. 의국에선 서로 그런 말 잘 안 하거든요.
[구윤모] 죄송해요, 주제 넘었으면 흘리시고요.
[차세린] 아니에요. 잘 받았어요. 진짜로.

[JUMP: ch04_02_close]

---

# Scene: ch04_02b_neutral

[FLAG: flag_h1_care=neutral]

[구윤모] 오늘도 수고 많으셨네요.
[차세린] 네, 학생도 시험 잘 보세요.

[JUMP: ch04_02_close]

---

# Scene: ch04_02_close

[차세린] 저는 의국 들어갈게요. 화이팅.
[구윤모] 네, 살펴 가세요.

[CHARACTER_HIDE: 차세린 fade]
[CHARACTER: 윤모 center default fade]
[BGM_STOP fade=2]

[JUMP: ch04_03_lab_late]

---

# Scene: ch04_03_lab_late
# Hint: chapter=4, time="2026-04-28 night", active=H3

[BG: bg_biochem_lab_night fade]
[BGM: 일상 fade=2 volume=0.4]

[지문] 4월 28일 밤 11시. 생화학 실험실.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 한설 right outfit_lab_late fade]

[CG: cg_seol_late_night show]
[지문] 한설이 안경 벗고 눈 감고 있다. 가운 단추 하나 풀림. 무방비 표정.
[CG_HIDE]

[지문] 윤모가 노크. 한설이 안경 끼고 자세 잡는다.

[CHARACTER: 한설 right outfit_lab_late fade]

[한설] 들어와요. 시험 자료 빌리러 온 거예요?
[구윤모] 네. 도서관 자료실에선 안 빌려준다고 해서요.
[한설] (서랍 열며) 여러 부 복사해놨어요.
[구윤모] (양손으로 받으며) 감사합니다.

[지문] 책상 위 식어버린 컵라면.

[CHOICE]
- "선생님, 식사하셨어요?" (챙김) → next: ch04_03b_meal  {tone:warm_supportive, key:true, descriptor:ch4_meal}
- "조용히 자료만 챙기고 갈게요" (담담) → next: ch04_03b_quiet  {tone:direct_friendly}
[/CHOICE]

---

# Scene: ch04_03b_meal

[FLAG: flag_h3_meal=yes]

[구윤모] 선생님, 컵라면 식어 있는 것 같은데요. 편의점 들렀다가 올까요?

[CHARACTER: 한설 right smile_small fade]

[한설] 끓이고 한 시간 됐네요. 깜빡했어요.
[구윤모] 도서관 가는 길이라 멀리 가는 것도 아니에요.
[한설] ...그럼 김밥 한 줄만 부탁할게요.

[지문] 윤모가 갔다가 비닐봉지 들고 돌아온다.

[구윤모] 김밥 두 줄, 캔커피, 컵라면 같이 가져왔어요.
[한설] 김밥 한 줄이라 했는데요.
[구윤모] 한 줄이 부족해 보였어요.
[한설] ...정말 고마워요. 시험 잘 보고요.

[JUMP: ch04_03_close]

---

# Scene: ch04_03b_quiet

[FLAG: flag_h3_meal=no]

[구윤모] 자료 받았으니까 조용히 가볼게요.
[한설] 네, 시험 잘 봐요.

[JUMP: ch04_03_close]

---

# Scene: ch04_03_close

[CHARACTER_HIDE: 한설 fade]
[BGM_STOP fade=2]

[JUMP: ch04_04_seoyoon_meet]

---

# Scene: ch04_04_seoyoon_meet
# Hint: chapter=4, time="2026-04-29 lunch", active=H4

[BG: bg_kmu_main fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 4월 29일 점심. 본관 앞 광장.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 김규민 right_back default fade]

[김규민] 어, 윤모. 표경민은 먼저 학식 갔어.

[지문] 약대 건물 쪽에서 두 사람이 온다.

[CHARACTER: 나서윤 right default fade]

[VIDEO: video_meet_seoyoon]

[약대 동기] 김규민, 우연이네. (윤모 보며) 본과 1학년 구윤모지?
[구윤모] 네, 안녕하세요.

[CG: cg_seoyoon_first_meet show]
[지문] 봄볕 속 나서윤. 긴 갈색 웨이브 머리, 옅은 피로와 도도함.
[CG_HIDE]

[약대 동기] 이쪽은 약대 4학년 나서윤. 같은 23학번.
[나서윤] 23학번이세요?
[구윤모] 네, 휴학 1년 해서 본과 1학년입니다.
[나서윤] 그럼 학번 동기네요. 저는 03년생이라 한 살 위긴 한데.

[나서윤] 죄송해요. 오후에 시험이 있어서 따로 가는 게 나을 것 같아요. 시험기간 끝나고 정식으로 인사할 시간 있겠죠.
[나서윤] (윤모 보며) 만나서 반가웠어요. 구윤모씨.
[구윤모] 네, 저도요. 시험 잘 보세요.

[CHARACTER_HIDE: 나서윤 fade]

[약대 동기] 윤모, 카톡 친추 하자. 서윤이한테 인사할 일 생기면 다리 놔줄게.

[지문] 카톡 친추. "나서윤" 친구 추가됨.

[CHARACTER_HIDE: 약대 동기 fade]
[CHARACTER_HIDE: 김규민 fade]
[BGM_STOP fade=2]

[JUMP: ch04_05_seoyoon_kakao]

---

# Scene: ch04_05_seoyoon_kakao
# Hint: chapter=4, time="2026-04-29 night", active=H4

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 같은 날 밤 11시. 자취방.

[CHARACTER: 윤모 center default fade]

[SFX: 카톡_알림]

[지문] "나서윤" 1:1 카톡방.

[KAKAO]
- {speaker:나서윤} 안녕하세요. 낮에 승보한테 친추 받으셨다고 들었어요
[/KAKAO]

[KAKAO_TIMER: 10]
- {speaker:나서윤} 본과 1학년 시험기간 힘들다고 들었어요
- {speaker:나서윤} 시험 잘 보세요
[CHOICE_KAKAO]
- "정중 인사 + 시험 응원" (정중·풀어서·빠르게) → next: ch04_05b_replied  {tone:warm_supportive, key:true, mechanism:h4_reply_speed, descriptor:ch4_first_reply}
- "ㅇㅇ 감사" (짧게 빠르게) → next: ch04_05b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]
[/KAKAO_TIMER]

---

# Scene: ch04_05b_replied

[FLAG: flag_h4_first_reply=on_time]

[KAKAO]
- {speaker:구윤모} 네 안녕하세요. 친추 감사해요
- {speaker:구윤모} 시험기간 방해는 안 됐길 바라요. 시험 잘 보세요
- {speaker:나서윤} 방해 아니었어요
- {speaker:나서윤} 시험 끝나고 나면 정식으로 인사할 시간 있겠죠
- {speaker:구윤모} 네 시험 잘 보시고 무리 마세요
- {speaker:나서윤} 네. 시험 잘 보고요 🥺
[/KAKAO]

[JUMP: ch04_05_close]

---

# Scene: ch04_05b_short

[FLAG: flag_h4_first_reply=short]

[KAKAO]
- {speaker:구윤모} ㅇㅇ 감사
- {speaker:나서윤} ...
- {speaker:나서윤} 네. 시험 잘 보세요
[/KAKAO]

[JUMP: ch04_05_close]

---

# Scene: ch04_05_close

[BGM_STOP fade=2]

[JUMP: ch04_06_yuna_morning]

---

# Scene: ch04_06_yuna_morning
# Hint: chapter=4, time="2026-04-30 morning", active=H5

[BG: bg_kmu_main fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 4월 30일 오전 9시. 도서관 앞 광장.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 장윤영 right smile_big fade]

[장윤영] 선배~~!
[구윤모] 어, 또 마주쳤네.
[장윤영] 마주친 게 아니라 시간 맞춰서요! 응원 한 번 하고 가려고요!
[구윤모] 응원이라.
[장윤영] (해사하게) 화이팅! 라고 외쳐드리는 거예요!

[구윤모] 어, 고마워. 잘 봐야겠다.
[장윤영] (방방 뜨며) 헉 받아주셨어요! 카톡으로도 매일 짧게 보낼게요!

[INC: H5 +5]

[장윤영] (멀어지며) 선배 자기 관리 잘 하시고요~~!

[CHARACTER_HIDE: 장윤영 fade]

[BG: bg_campus_cafe fade]

[CG: cg_yuna_cafe show]
[지문] 카페. 장윤영이 동기들과 신나서 대화 중. 봄볕이 갈색 머리에 비친다.
[CG_HIDE]

[CHARACTER_HIDE: 윤모 fade]
[BGM_STOP fade=2]

[JUMP: ch04_07_close]

---

# Scene: ch04_07_close
# Hint: chapter=4, time="2026-05-03 night", active=all

[BG: bg_studio_room fade]
[BGM: 메인_테마 fade=4 volume=0.5]

[지문] 5월 3일 밤. 시험 내일 모레.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 한 주에 다섯 명 다 만났네. 한설 선생님 컵라면, 차세린 선생님 새벽 카페, 윤하정 도서관, 나서윤 본관 봄볕, 장윤영 9시 5분 응원.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 일단 오늘은 자야겠다.

[BG: black fade=3]

[지문] — 끝 → Ch.5 "5월의 분기"

[JUMP: ch05_01_test_end]
