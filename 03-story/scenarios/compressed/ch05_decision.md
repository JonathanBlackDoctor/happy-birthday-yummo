---
module: ch05_decision (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/ch05_decision.md
outputs:
  - Ch.5 "5월의 분기" 압축본 (7개 메인 씬 + 12개 분기 — 분기 그래프 풀과 동일)
  - 회식 5지선다 + 모닥불 5지선다 보존
  - H5 새벽 술 카톡 + H4 KAKAO_TIMER 미니게임 보존
  - 변태 망상 페어 #4 (마지막 1회) 보존
  - cg_hajeong_drunk IF 조건부 트리거 보존
  - EVALUATE_BRANCH 보존
status: review
---

# 03-story/scenarios/compressed/ch05_decision.md

> 풀 `scenarios/ch05_decision.md`의 압축 버전. NARRATION/MONOLOGUE 50% 삭감, DIALOGUE 약 20% 가볍게 합치기, KAKAO/CHOICE/CHOICE_KAKAO/KAKAO_TIMER/IF/FLAG/INC/EVALUATE_BRANCH/BG/BGM/SFX/CHARACTER/CG/JUMP 100% 보존.
> 변태 망상 페어 #4 (Scene 06_pair_pause) 한 줄도 손대지 않음.
> 씬 ID·CHOICE next 그래프 풀과 동일.

---

# Scene: ch05_01_test_end
# Hint: chapter=5, time="2026-05-11 afternoon", active=H2

[BG: bg_lecture_day fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 2026년 5월 11일 월요일 오후 5시. 본과 1학년 첫 시험, 마지막 과목이 막 끝났다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 끝났다. 5일 동안 도서관, 자취방, 카페. 그게 전부였던 한 주.

[CHARACTER: 김규민 right default fade]
[CHARACTER: 표경민 left_back default fade]

[김규민] 끝났다 윤모.
[구윤모] 끝났네.
[표경민] (책 정리하며) 다들 어떻게 봤어.
[김규민] 망함.
[구윤모] (피식) 김규민 항상 망함이지.

[CHARACTER: 조나단 center_back laugh fade]

[조나단] 단톡 폭주 중이다. 회식 가는 분위기.
[김규민] 동성로 가자. 7시.
[표경민] 약대 쪽도 부른대?
[조나단] 승보 형이 합석 콜.
[김규민] 의예과 후배 장윤영도 온다더라.
[구윤모] (잠시 멈춤) 다 모이는 자리네.
[김규민] 종강 회식이라 다 모이지.

[KAKAO]
- {speaker:조나단} 동성로 7시 ㄱㄱ
- {speaker:김규민} ㅇㅇ ㄱ
- {speaker:오준혁} ㄱ
- {speaker:이문규} ㅇㅋ
- {speaker:정욱} 약대 승보 형도 같이 ㄱ?
- {speaker:김규민} ㅇㅇ 부르자
- {speaker:김규민} 의예과 후배도 ㄱ
- {speaker:조나단} 풍년이네
- {speaker:윤하정} 다 모이게?
- {speaker:김규민} ㅇㅇ ㄱㄱ
- {speaker:구윤모} ㅇㅇ
- {speaker:구윤모} 자취방 들렀다 ㄱ
[/KAKAO]

[구윤모 모놀로그] 종강 회식이라. 벌써 5월 둘째 주네.

[CHARACTER: 윤모 center smile fade]

[BGM_STOP fade=2]
[CHARACTER_HIDE: 김규민 fade]
[CHARACTER_HIDE: 표경민 fade]
[CHARACTER_HIDE: 조나단 fade]

[JUMP: ch05_02_pub_first]

---

# Scene: ch05_02_pub_first
# Hint: chapter=5, time="2026-05-11 evening"

[BG: bg_dongseong_street fade]
[BGM: 일상 fade=2 volume=0.6]
[SFX: 술집_왁자지껄 volume=0.4]

[지문] 같은 날 저녁 7시 30분. 동성로 술집. 본과 1학년 동기들이 빼곡하게 앉아 있다. 약대 쪽엔 승보와 나서윤. 의예과 후배 장윤영. 박사과정 조교 한설이 격려차 잠깐 합석. 동산병원 회식이 끝나고 들른 차세린은 끝쪽 자리에서 한설과 인사를 나누는 중이다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 진짜 다 모였네. 학교 안에서 따로따로 마주쳤던 다섯 명이 한 자리에 다 있다는 게 좀 신기하다.

[지문] 빈자리는 다섯 군데. 다섯 명이 각각 다른 자리에 앉아 있다.

[CHOICE]
- "차세린 선생님 쪽으로" → next: ch05_02b_h1 → +25 H1 → KEY:H1:ch5_join
- "윤하정 옆으로" → next: ch05_02b_h2 → +25 H2 → KEY:H2:ch5_join
- "한설 선생님 쪽으로" → next: ch05_02b_h3 → +25 H3 → KEY:H3:ch5_join
- "나서윤씨 옆으로" → next: ch05_02b_h4 → +25 H4 → KEY:H4:ch5_join
- "장윤영 옆으로" → next: ch05_02b_h5 → +25 H5 → KEY:H5:ch5_join
[/CHOICE]


---

# Scene: ch05_02b_h1


[FLAG: flag_ch5_seat=h1]

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 차세린 pair_right default fade]

[구윤모] (정중히) 선생님, 옆자리 괜찮을까요?
[차세린] (옅은 미소) 네, 앉아요. 학생 시험 끝났죠?
[구윤모] 네, 오늘 끝났어요. 선생님은 동산병원 회식 끝나고 오신 거예요?
[차세린] (잔 들며) 네, 잠깐 들렀어요. 한설 선생이 본과 회식이라길래 인사라도 하려고요. 학생 시험은 잘 봤어요?
[구윤모] (살짝 웃으며) 채점이 나와봐야 알겠지만, 일단 끝낸 게 어디인가 싶어요.
[차세린] 그 마음 알아요. 본과 1학년 첫 시험은 결과보다 끝낸 거 자체가 의미예요.

[구윤모 모놀로그] 역시 어른은 어른이시네. 옆에 계신 것만으로도 알 것 같다.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h2


[FLAG: flag_ch5_seat=h2]

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 윤하정 pair_right default fade]

[IF: H2 affection >= 30]
[CG: cg_hajeong_drunk show]

[지문] 회식 자리. 윤하정이 잔을 두 손으로 감싸고 있다. 살짝 발그레한 볼, 평소의 무뚝뚝한 표정이 조금 풀어져 있다.

[CG_HIDE]
[/IF]

[윤하정] (시선 들며) 어, 윤모.
[구윤모] 옆자리 비었네.
[윤하정] 앉아.
[구윤모] (앉으며) 너 한 잔 했네.
[윤하정] (살짝 웃으며) 한 잔 정도. 시험 끝나서 풀어진 거지.
[구윤모] 풀어진 윤하정 처음 본다.
[윤하정] (시선 비스듬) ...자주 보는 거 아니야.
[구윤모] (피식) 알겠어. 오늘만 보는 걸로 할게.
[윤하정] (잔 한 모금) 너 도서관에서 새벽까지 같이 있어 준 거. 그거 갚아야 하는데.
[구윤모] 그런 게 어디 있어. 같은 5조잖아.
[윤하정] ...그래도.

[구윤모 모놀로그] 풀어진 윤하정이 더 솔직하네.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h3


[FLAG: flag_ch5_seat=h3]

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 한설 pair_right default fade]

[구윤모] (정중히) 선생님들, 옆자리 괜찮을까요?
[한설] (옅게) 윤모 학생, 앉아요.
[구윤모] 선생님 격려차 오셨다고 들었어요.
[한설] (잔 들며) 네, 잠깐만요. 다들 시험 끝났으니까 한 잔 따라주러 왔어요.
[구윤모] 선생님이 직접 따라주시면 그게 어디예요.
[한설] (작게 웃으며) 학생, 표현이 늘었네요. 도서관 5일이 사람을 바꾸는구나.
[구윤모] (피식) 책 보면서 표현 가다듬을 시간이 많았어요.
[한설] 잘 봤어요?
[구윤모] 채점 전이라 모르겠지만, 자료 주신 거 보면서 든든했어요.
[한설] (옅은 미소) 그 자료가 도움 됐다니 다행이에요.

[구윤모 모놀로그] 한설 선생님 회식 자리에서 뵙는 건 또 다르네. 실험실에서 봤던 무방비 모습이 잠깐 떠오르긴 했다.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h4


[FLAG: flag_ch5_seat=h4]

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 나서윤 pair_right default fade]

[약대 동기] 윤모, 이리 와. 자리 있어.
[구윤모] (정중히) 네, 감사합니다. (나서윤 보며) 시험 끝나셨어요?
[나서윤] (옅게) 네, 오늘 마지막이었어요.
[구윤모] 약대 본과 4학년 시험기간도 빡세다고 들었는데.
[나서윤] (잔 한 모금) 의대 본과 1학년이 더 빡세다던데요. 5일 도서관이라고 하셨었잖아요.
[구윤모] (살짝 웃으며) 기억하시네요.
[나서윤] (옅게) 카톡으로 들었으니까요. 끝나서 다행이에요. 서로.

[구윤모 모놀로그] 카톡에서나 직접 뵐 때나 비슷하시구나. 정중하시면서 살짝 거리가 있는 게 한결같으시다.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h5


[FLAG: flag_ch5_seat=h5]

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 장윤영 pair_right smile_big fade]

[장윤영] 선배~~! 오셨어요!
[구윤모] (피식) 옆자리 비었네.
[장윤영] 일부러 비워뒀어요!
[구윤모] (앉으며) 또 일부러였어?
[장윤영] (해사하게) 후배 특권이거든요!
[장윤영] (잔 따르며) 선배 시험 일주일 응원했으니까 한 잔은 받으셔야 해요!
[구윤모] (잔 받으며) 어, 고마워.
[장윤영] (들떠) 헉 받아주셨다!
[구윤모] (살짝 웃으며) 일주일 응원해줬으니, 한 잔쯤은 마셔야지.
[장윤영] 선배 진짜 다정하시네요. 도서관 앞에선 그냥 시크하셨는데!

[구윤모 모놀로그] 도서관 앞에서 봤을 때보다 텐션이 한 단계 위로 올라가 있다.

[JUMP: ch05_02_close]

---

# Scene: ch05_02_close

[BG: bg_dongseong_street]

[지문] 한 시간 정도 지난다. 자리가 한 번 섞이고, 다들 한 잔씩 더 따라준다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 다섯 명이 한자리에 다 있는 회식이 또 있을까 싶기도 하다.

[차세린] 저는 이만 들어갈게요. 다음 당직 준비도 있고.
[한설] 네, 살펴 가세요.
[차세린] (윤모 보며) 학생도 무리 마요.
[구윤모] (정중히) 네, 살펴 가세요. 짧은 시간이었지만 감사했습니다.

[CHARACTER_HIDE: 차세린 fade]

[김규민] (저쪽 자리) 야 윤모, MT 얘기 나왔다.
[조나단] (저쪽 자리) 다음 주 토요일.
[표경민] (저쪽 자리) 펜션 잡혔대.

[구윤모 모놀로그] MT라. 다음 주 토요일이면 5월 16일이네.

[BG: bg_studio_room fade]
[BGM_STOP fade=2]

[JUMP: ch05_03_kakao_dawn]

---

# Scene: ch05_03_kakao_dawn
# Hint: chapter=5, time="2026-05-12 dawn", active=H5

[BG: bg_studio_room]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 5월 12일 화요일 새벽 1시 30분. 자취방.

[CHARACTER: 윤모 center default fade]

[SFX: 카톡_알림]

[지문] 1:1 카톡방. "장윤영".

[KAKAO]
- {speaker:장윤영} 선배~~~~~ 자요?
- {speaker:장윤영} 저 아직 안 자요!!
- {speaker:장윤영} 오늘 회식 진짜 신났어요 ✨✨
- {speaker:장윤영} 선배 잔 받아주신 거 진짜 진짜 좋았어요 🥹
- {speaker:장윤영} 저 술 한 잔 더 했거든요 친구네서요
- {speaker:장윤영} 선배 진짜 다정하시구나 오늘 알았어요 🫶
- {speaker:장윤영} 헉 너무 많이 보냈나
- {speaker:장윤영} 선배 안 자고 있으면 답장 한 번만요
[/KAKAO]

[구윤모 모놀로그] 술 한 잔 더 했네. 답장은 짧고 따뜻하게. 그리고 자라고 한마디.

[CHOICE]
- "지금 자야 돼, 너도 자" (다정하게 단호) → next: ch05_03b_kind  {tone:bright_forward, key:true, descriptor:ch5_late_kakao}
- "응원 잘 받았어, 잘 자" (부드럽게) → next: ch05_03b_warm  {tone:warm_supportive}
- "...내일 답장할게" (짧게) → next: ch05_03b_cold  {tone:mature_serious}
[/CHOICE]


---

# Scene: ch05_03b_kind

[FLAG: flag_h5_late_kakao=kind]

[KAKAO]
- {speaker:구윤모} 윤영아
- {speaker:구윤모} 지금 자야 돼
- {speaker:구윤모} 너도 자
- {speaker:구윤모} 술 한 잔 더 한 거 내일 후회한다
- {speaker:장윤영} 헉
- {speaker:장윤영} 선배 진짜 챙기시네요 🥹
- {speaker:장윤영} 알겠어요 잘게요
- {speaker:장윤영} 선배도 잘 자요!
- {speaker:장윤영} 답장 받은 거 진짜 감사해요
[/KAKAO]

[구윤모 모놀로그] 다정하게 단호한 게 맞긴 했지.

[JUMP: ch05_03_close]

---

# Scene: ch05_03b_warm


[FLAG: flag_h5_late_kakao=warm]

[KAKAO]
- {speaker:구윤모} 응원 잘 받았어
- {speaker:구윤모} 잘 자
- {speaker:장윤영} 헉 답장 ✨
- {speaker:장윤영} 선배도 잘 자요!!
[/KAKAO]

[구윤모 모놀로그] 짧게 부드럽게.

[JUMP: ch05_03_close]

---

# Scene: ch05_03b_cold


[FLAG: flag_h5_late_kakao=cold]

[KAKAO]
- {speaker:구윤모} 윤영아
- {speaker:구윤모} 내일 답장할게
[/KAKAO]

[구윤모 모놀로그] 짧게 잘랐다.

[JUMP: ch05_03_close]

---

# Scene: ch05_03_close

[BGM_STOP fade=2]

[구윤모 모놀로그] 회식 한 번에 다섯 명 다 만나고, 술 카톡까지. 한 학기가 한 번에 정리되는 주간이다.

[CHARACTER: 윤모 center default fade]

[BG: black fade=3]

[JUMP: ch05_04_mt_decision]

---

# Scene: ch05_04_mt_decision
# Hint: chapter=5, time="2026-05-13 evening", active=H2

[BG: bg_studio_room fade]
[BGM: 일상 fade=2 volume=0.4]

[지문] 5월 13일 수요일 저녁. 자취방.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:김규민} 야 MT 5월 16일 토요일 ㄱㄱ
- {speaker:김규민} 펜션 가창 쪽 잡았음
- {speaker:김규민} 본과 1학년 + 의예과 2 일부 + 약대 승보 형
- {speaker:조나단} 풍년 시즌2 ㄱㄱ
- {speaker:표경민} 인원 정리 좀
- {speaker:오준혁} ㅇㅇ ㄱ
- {speaker:이문규} ㄱ
- {speaker:정욱} ㄱ
- {speaker:윤하정} ㄱ
- {speaker:김규민} 윤모 ㄱ?
[/KAKAO]

[구윤모 모놀로그] MT라. 다섯 명 다 거기 모이는 분위기일까.

[CHOICE]
- "ㄱ" (간다) → KEY:flag_mt=go → next: ch05_04b_go
- "고민해볼게" (보류) → next: ch05_04b_skip
[/CHOICE]

---

# Scene: ch05_04b_go

[FLAG: flag_mt=go]

[KAKAO]
- {speaker:구윤모} ㄱ
- {speaker:김규민} ㅇㅋ
- {speaker:조나단} ㄱㄱ
- {speaker:김규민} 승보 형 + 서윤 누나도 합류
- {speaker:김규민} 윤영도 의예과 라인 ㄱ
- {speaker:김규민} 한설 선생님 잠깐 들리신다 함
- {speaker:김규민} 차세린 선생님은 미정
- {speaker:조나단} 풍년이네 진짜
[/KAKAO]

[구윤모 모놀로그] 다섯 명 중 네 명은 확정. 차세린 선생님이 미정이라는 건, 동산병원 일정에 달렸다는 뜻이고.

[JUMP: ch05_05_mt_pension]

---

# Scene: ch05_04b_skip

[FLAG: flag_mt=skip]

[KAKAO]
- {speaker:구윤모} 고민해볼게
- {speaker:김규민} 에이~
- {speaker:조나단} 윤모 쉬고 싶구나
- {speaker:표경민} 시험 끝나고 한 번 쉬는 것도 맞지
[/KAKAO]

[구윤모 모놀로그] 회식 한 번으로도 충분히 봤다는 마음이 있긴 한데.

[지문] 다음 날 새벽까지 윤모가 한참 더 고민하다, 결국 가기로 결정한다.

[KAKAO]
- {speaker:구윤모} 김규민
- {speaker:구윤모} 가는 걸로
- {speaker:김규민} ㅇㅋ
- {speaker:김규민} 알았다
[/KAKAO]

[구윤모 모놀로그] 다섯 명이 다 모이는 자리는 흔치 않으니까.

[JUMP: ch05_05_mt_pension]

---

# Scene: ch05_05_mt_pension
# Hint: chapter=5, time="2026-05-16 evening", active=H1+H3+H4+H5

[BG: bg_mt_pension fade]
[BGM: 일상 fade=3 volume=0.5]

[지문] 5월 16일 토요일 저녁 7시. 가창 펜션. 본과 1학년 동기 12명, 의예과 후배 3명(장윤영 포함), 약대 승보와 나서윤. 한설은 늦게 합류 예정. 차세린은 동산병원 일정 후 합류 가능성.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 펜션 도착. 5월 저녁 공기. 대구 가창은 시내보다 조금 시원하다.

[CHARACTER: 김규민 right default fade]

[김규민] 윤모. 짐 풀고 모닥불 쪽으로 와.
[구윤모] 어, 알겠어. 짐만 잠깐.
[김규민] (옅게) 다섯 명 다 올 가능성 있는 자리야. 한 잔 천천히 가자.
[구윤모] 한 잔 천천히. 알겠어.

[CHARACTER_HIDE: 김규민 fade]

[구윤모 모놀로그] 한 학기에 한 번 있을까 말까 한 자리네. 결정 시간이 가까워지는 걸 모를 수가 없다.

[BG: bg_mt_pension fade]
[BGM: 로맨틱 fade=2 volume=0.5]

[지문] 마당. 모닥불이 한 단계 더 커져 있다. 펜션 마당 한쪽 차에서 차세린이 내린다. 한설도 함께 도착.

[CHARACTER: 차세린 left default fade]
[CHARACTER: 한설 right default fade]

[차세린] (멀리서 손 들며) 학생들 잘 도착했어요?
[김규민] (마당에서) 선생님들 오셨다!
[조나단] (마당에서) 풍년 시즌2 풀 풍년!

[구윤모 모놀로그] 다섯 명이 같은 펜션에. 4월에 따로따로 만났던 사람들이 학기 끝에 결국 같은 자리에 다 모인 셈이다.

[JUMP: ch05_06_bonfire]

---

# Scene: ch05_06_bonfire
# Hint: chapter=5, time="2026-05-16 night", active=all

[BG: bg_mt_pension fade]
[BGM: 로맨틱 fade=3 volume=0.5]

[지문] 모닥불 시퀀스. 사람들이 둥글게 앉아 한 잔씩 천천히 비운다. 5월 밤공기가 살짝 차고, 모닥불 빛이 한 번씩 사람들 얼굴에 닿았다 흘러간다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 모닥불 빛은 신기하단 말이지. 평소 무뚝뚝한 사람도 표정이 풀려 보인다.

[지문] 한 시간 정도 단체 시간이 흐른다. 한 명씩 마당 끝, 펜션 안, 다른 모닥불 쪽으로 흩어지면서 잠깐씩 1:1 시간이 생겨난다.

[CHOICE]
- "차세린 선생님이 마당 끝에서 머그잔 들고 계심" → next: ch05_06b_h1 → +25 H1 → KEY:H1:ch5_bonfire
- "윤하정이 모닥불 옆에서 한 잔 더 채우는 중" → next: ch05_06b_h2 → +25 H2 → KEY:H2:ch5_bonfire
- "한설 선생님이 펜션 입구에서 잠깐 바람 쐬는 중" → next: ch05_06b_h3 → +25 H3 → KEY:H3:ch5_bonfire
- "나서윤씨가 펜션 안 부엌에서 잔 정리 중" → next: ch05_06b_h4 → +25 H4 → KEY:H4:ch5_bonfire
- "장윤영이 모닥불 너머에서 후배들이랑 떠들다 윤모 쪽 봄" → next: ch05_06b_h5 → +25 H5 → KEY:H5:ch5_bonfire
[/CHOICE]


---

# Scene: ch05_06b_h1

[FLAG: flag_ch5_bonfire=h1]

[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 한설 fade]
[CHARACTER_HIDE: 나서윤 fade]
[CHARACTER_HIDE: 장윤영 fade]

[지문] 다른 일행이 슬쩍 자리를 비켜준다.

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 차세린 pair_right default fade]

[구윤모] 선생님, 머그잔만 드시는 거예요?
[차세린] (옅게) 동산병원에서 회식 한 번 끝낸 다음이라.
[구윤모] 무리 마세요.
[차세린] (작게 끄덕) 학생도 한 잔 천천히 드세요. (모닥불 보며) 5월 밤공기 좋네요. 의대 생활 중에 이런 시간이 흔하진 않아요.
[구윤모] 선생님이 같이 계셔주신 게 학생들한텐 의미가 더 커요.
[차세린] (잠시 침묵) ...학생, 그 말 잘 받았어요.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h2


[FLAG: flag_ch5_bonfire=h2]

[CHARACTER_HIDE: 차세린 fade]
[CHARACTER_HIDE: 한설 fade]
[CHARACTER_HIDE: 나서윤 fade]
[CHARACTER_HIDE: 장윤영 fade]

[지문] 다른 일행이 슬쩍 자리를 비켜준다.

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 윤하정 pair_right default fade]

[윤하정] (시선 들며) 어, 윤모.
[구윤모] 한 잔 더?
[윤하정] 한 잔만 더. 오늘은 좀 더 풀어도 되는 날이라.
[구윤모] (피식) 네 입에서 그런 말 듣는 거 처음이야.
[윤하정] (모닥불 한 번 보며) 시험 끝났잖아. ...너도 같이 좀 풀어.
[구윤모] (잔 받으며) 알겠어. 한 잔만.
[윤하정] 도서관에서 옆에 있어 준 거, 한 번 더 갚는 거야.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h3


[FLAG: flag_ch5_bonfire=h3]

[CHARACTER_HIDE: 차세린 fade]
[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 나서윤 fade]
[CHARACTER_HIDE: 장윤영 fade]

[지문] 다른 일행이 슬쩍 자리를 비켜준다.

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 한설 pair_right default fade]

[구윤모] 선생님, 바람 쐬세요?
[한설] (옅게) 윤모 학생. 한 시간쯤 있다 가야 해요. 다음 주 실험 일정이 있어서.
[구윤모] 짧게라도 와주신 게 의미가 커요.
[한설] (작게 웃으며) 학생들이 한 학기 같이 견딘 자리니까요.
[구윤모] 선생님 일정 빡센 거 압니다. 무리 마시고요.
[한설] (옅게) 학생도 무리 마요. 본과 1학년은 시작이고, 본과 2학년이 더 빡세다고들 하니까.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h4


[FLAG: flag_ch5_bonfire=h4]

[CHARACTER_HIDE: 차세린 fade]
[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 한설 fade]
[CHARACTER_HIDE: 장윤영 fade]

[지문] 다른 일행이 슬쩍 자리를 비켜준다.

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 나서윤 pair_right default fade]

[구윤모] 정리하시는 거예요?
[나서윤] (잠깐) 잔 몇 개만요. 손이 비어 있길래.
[구윤모] (소매 걷으며) 같이 할게요.
[나서윤] (옅게) 그러시구나.
[구윤모] 약대 본과 4학년 시험 끝난 뒤에 정리하시는 거 좀 의외네요.
[나서윤] 손이 비어 있는 게 더 어색해서요. (살짝 미소) ...회식이든 MT든 처음엔 적응이 좀.
[구윤모] (옅게) 그 마음 알아요. 저도 한 학기 처음이라.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h5


[FLAG: flag_ch5_bonfire=h5]

[CHARACTER_HIDE: 차세린 fade]
[CHARACTER_HIDE: 윤하정 fade]
[CHARACTER_HIDE: 한설 fade]
[CHARACTER_HIDE: 나서윤 fade]

[지문] 다른 일행이 슬쩍 자리를 비켜준다.

[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 장윤영 pair_right smile_big fade]

[장윤영] 선배~~! 이쪽으로 한 번 와요!
[구윤모] (옅게 웃으며) 너 시끄럽게 했지.
[장윤영] 후배들 다 첫 MT라 신난 거예요!
[구윤모] (피식) 너도 첫 MT면서.
[장윤영] 헉! 들켰다!
[장윤영] (잔 들며) 선배 한 잔 더 받으세요!
[구윤모] (잔 받으며) 한 잔만. 천천히.
[장윤영] (해사하게) 천천히 마셔주시는 게 더 좋아요!

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06_pair_pause

[BG: bg_mt_pension]
[BGM: 코믹 fade=2 volume=0.4]

[지문] 1:1 시간이 끝나고, 윤모가 마당 한쪽으로 다시 와서 모닥불을 바라본다. 다섯 명이 각각 다른 자리에서 잔을 들고 있다.

[CHARACTER: 윤모 center perv fade]

[구윤모 모놀로그] (망상 시작) ...어. 모닥불 빛이.
[구윤모 모놀로그] (망상 시작) 만약에 누군가의 풀어진 옆모습이, 평소엔 안 보이던 표정으로 잠깐 더 머물러 있다면. 머리카락이 살짝 흘러내리는 그 짧은 순간이.
[구윤모 모놀로그] (망상 시작) 그런 장면 하나가 한 학기를 통째로 정리해버릴 수도 있겠다 싶고.

[CHARACTER: 윤모 center recover fade]

[구윤모 모놀로그] (자기자각) 아 진짜. 결정 직전에 뭐 하냐.
[구윤모 모놀로그] (자기자각) 정신 차려라 구윤모.

[CHARACTER: 윤모 center default fade]
[BGM: 로맨틱 fade=2 volume=0.5]

[구윤모 모놀로그] (정상복귀) 한 잔 천천히 더.
[구윤모 모놀로그] (정상복귀) 결정은 마음이 알아서 정리할 거고.

[구윤모 모놀로그] (정상복귀) 망상은 끝났어도, 다섯 명은 아직 다 거기 있고.

[BGM_STOP fade=2]

[JUMP: ch05_07_close_evaluate]

---

# Scene: ch05_07_close_evaluate
# Hint: chapter=5, time="2026-05-17 dawn", active=H4

[BG: bg_mt_pension fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 5월 17일 일요일 새벽 2시. MT 펜션 한 방.

[CHARACTER: 윤모 center default fade]

[SFX: 카톡_알림]

[지문] 1:1 카톡방. "나서윤".

[KAKAO]
- {speaker:나서윤} 안 자세요?
- {speaker:나서윤} 오늘 부엌에서 같이 정리해주신 거 고마웠어요
[/KAKAO]

[KAKAO_TIMER: 10]
- {speaker:나서윤} 잠깐 답장 가능하시면요
[CHOICE_KAKAO]
- "안 잤어요, 같이 정리한 게 자연스러웠어요" (정중·풀어서·빠르게) → next: ch05_07b_replied  {tone:warm_supportive, key:true, mechanism:h4_reply_speed, descriptor:ch5_dawn_reply}
- "안 잤어요. 별일 없죠?" (짧게 빠르게) → next: ch05_07b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]
[/KAKAO_TIMER]


---

# Scene: ch05_07b_replied

[FLAG: flag_h4_dawn_reply=on_time]

[KAKAO]
- {speaker:구윤모} 안 잤어요
- {speaker:구윤모} 오늘 부엌에서 정리하시는 모습이 자연스러워서 같이 했어요
- {speaker:구윤모} 고맙다는 인사 받을 일 아니고요
- {speaker:나서윤} 그래도요
- {speaker:나서윤} MT 분위기 한 번 봤네요 처음이라
- {speaker:구윤모} 처음이세요?
- {speaker:나서윤} 약대는 학년별로 분위기가 단단해서 본격 MT는 잘 안 가요
- {speaker:나서윤} 오늘 와본 거 다행이에요
- {speaker:나서윤} 잘 자요 🥺
[/KAKAO]

[구윤모 모놀로그] 시크하시면서 끝에 🥺 하나. 평소가 정중한 분이라 그 이모지 하나가 묵직하게 다가온다.

[JUMP: ch05_07_close]

---

# Scene: ch05_07b_short

[FLAG: flag_h4_dawn_reply=short]

[KAKAO]
- {speaker:구윤모} 안 잤어요
- {speaker:구윤모} 별일 없죠?
- {speaker:나서윤} 네
- {speaker:나서윤} 잘 자요
[/KAKAO]

[구윤모 모놀로그] 짧게 받아쳤다.

[JUMP: ch05_07_close]

---

# Scene: ch05_07_close

[BGM_STOP fade=2]

[IF: late_reply_count >= 2]
[JUMP: ch06_h4_reject]
[/IF]

[CHARACTER: 윤모 center default fade]
[BGM: 메인_테마 fade=4 volume=0.5]

[구윤모 모놀로그] 본과 첫 시험. 끝났다. 그리고 다섯 명. 한 학기 동안 진짜 많이도 만났네.
[구윤모 모놀로그] 차세린 선생님, 새벽 카페에서 머그잔 들고 계셨던 모습.
[구윤모 모놀로그] 윤하정, 도서관 책상에 엎드려 잠들었던 옆모습.
[구윤모 모놀로그] 한설 선생님, 안경 벗으셨던 그 짧은 순간.
[구윤모 모놀로그] 나서윤씨, 본관 앞 봄볕 아래 옆모습.
[구윤모 모놀로그] 장윤영, 9시 5분에 보내준 응원.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 마음이 향하는 곳이 있는 것 같다. 누군지는... 내 마음이 안다.

[BG: black fade=4]

[지문] — 본과 1학년 봄. 다섯 명과 한 학기. 결정의 시간.

[EVALUATE_BRANCH]
