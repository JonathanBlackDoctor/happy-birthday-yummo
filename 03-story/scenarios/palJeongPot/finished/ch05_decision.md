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

[지문] 5월 11일 오후. 첫 시험 마지막 과목 끝.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 김규민 right default fade]
[CHARACTER: 표경민 left_back default fade]

[김규민] 아오 야마를 어떻게단한명도 안태우냐 이게 말이되나진짜 감염 ㄹㅇ 레전드시험이네 ㅋㅋ
[구윤모] 와 진짜 엄지형 믿었는데 이게 맞냐?

[CHARACTER: 조나단 center_back laugh fade]

[조나단] 지금 다른 애들 있는 단톡에서 첫 시험 끝난 김에 한 잔 하자던데?
[김규민] ㅇㅇ 7시에 동성로에서 본다더라. 약대쪽이랑 같이 보자던데? 장윤영도 온대

[KAKAO]
- {speaker:조나단} 7시 동성로 ㄱㄱ
- {speaker:김규민} 예아 조치
- {speaker:김규민} 예과애들 없나? 걔네 담주 셤이잖음 ㅋㅋ 불러서 데꼬가자
- {speaker:윤하정} 다 모이게?
- {speaker:구윤모} ㅇㅇ 자취방 들렀다 ㄱ
[/KAKAO]

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

[지문] 동성로 술집. 다섯 명이 한 자리에 다 있다.

[CHARACTER: 윤모 center default fade]

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

[구윤모] 선생님, 옆자리 괜찮을까요?
[차세린] 네, 앉아요. 시험 끝났죠?
[구윤모] 네. 선생님은 동산병원 회식 끝나고 오신 거예요?
[차세린] 잠깐 들렀어요. 끝낸 거 자체가 의미예요.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h2

[FLAG: flag_ch5_seat=h2]
[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 윤하정 pair_right default fade]

[IF: H2 affection >= 30]
[CG: cg_hajeong_drunk show]
[지문] 윤하정이 잔을 감싸고 있다. 발그레한 볼.
[CG_HIDE]
[/IF]

[윤하정] 어, 윤모.
[구윤모] 한 잔 했네.
[윤하정] 시험 끝나서 풀어진 거지.
[구윤모] 풀어진 윤하정 처음 본다.
[윤하정] ...자주 보는 거 아니야.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h3

[FLAG: flag_ch5_seat=h3]
[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 한설 pair_right default fade]

[구윤모] 선생님, 옆자리 괜찮을까요?
[한설] 앉아요. 한 잔 따라주러 왔어요.
[구윤모] 선생님이 직접 따라주시면 그게 어디예요.
[한설] 잘 봤어요?
[구윤모] 자료 주신 거 보면서 든든했어요.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h4

[FLAG: flag_ch5_seat=h4]
[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 나서윤 pair_right default fade]

[약대 동기] 윤모, 이리 와.
[구윤모] 시험 끝나셨어요?
[나서윤] 네. 끝나서 다행이에요. 서로.

[JUMP: ch05_02_close]

---

# Scene: ch05_02b_h5

[FLAG: flag_ch5_seat=h5]
[CHARACTER: 윤모 pair_left default fade]
[CHARACTER: 장윤영 pair_right smile_big fade]

[장윤영] 선배~~! 일부러 자리 비워뒀어요!
[장윤영] (잔 따르며) 응원했으니까 한 잔은 받으셔야 해요!
[구윤모] 어, 고마워.
[장윤영] 선배 진짜 다정하시네요.

[JUMP: ch05_02_close]

---

# Scene: ch05_02_close

[BG: bg_dongseong_street]

[지문] 한 시간 정도 지난다.

[차세린] 저는 이만 들어갈게요. 학생도 무리 마요.
[구윤모] 네, 살펴 가세요.

[CHARACTER_HIDE: 차세린 fade]

[김규민] (저쪽) 다음주 토요일에 MT 간다던데?
[표경민] 펜션 잡혔대.

[BG: bg_studio_room fade]
[BGM_STOP fade=2]

[JUMP: ch05_03_kakao_dawn]

---

# Scene: ch05_03_kakao_dawn
# Hint: chapter=5, time="2026-05-12 dawn", active=H5

[BG: bg_studio_room]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 5월 12일 새벽 1시 30분. 자취방.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[지문] 1:1 카톡방. "장윤영".

[KAKAO]
- {speaker:장윤영} 선배~~~~~ 자요?
- {speaker:장윤영} 오늘 회식 진짜 신났어요 ✨
- {speaker:장윤영} 잔 받아주신 것두 정말 감사했어요 🥹
- {speaker:장윤영} 선배 진짜 다정하시더라구요 🫶
- {speaker:장윤영} 에이... 안 자고 있으면 답장 한 번만 해주면 안돼요? 오빠?
[/KAKAO]

[CHOICE]
- "지금 자야 돼, 너도 자" (다정하게 단호) → next: ch05_03b_kind  {tone:bright_forward, key:true, descriptor:ch5_late_kakao}
- "응원 잘 받았어, 잘 자" (부드럽게) → next: ch05_03b_warm  {tone:warm_supportive}
- "...내일 답장할게" (짧게) → next: ch05_03b_cold  {tone:mature_serious}
[/CHOICE]

---

# Scene: ch05_03b_kind

[FLAG: flag_h5_late_kakao=kind]

[KAKAO]
- {speaker:구윤모} 윤영아 지금 자야 돼. 너도 자
- {speaker:구윤모} 술 한 잔 더 한 거 내일 후회한다
- {speaker:장윤영} 헉 선배 진짜 챙기시네요 🥹
- {speaker:장윤영} 알겠어요 잘게요. 답장 감사해요
[/KAKAO]

[JUMP: ch05_03_close]

---

# Scene: ch05_03b_warm

[FLAG: flag_h5_late_kakao=warm]

[KAKAO]
- {speaker:구윤모} 응원 잘 받았어. 잘 자
- {speaker:장윤영} 헉 답장 ✨ 선배도 잘 자요!!
[/KAKAO]

[JUMP: ch05_03_close]

---

# Scene: ch05_03b_cold

[FLAG: flag_h5_late_kakao=cold]

[KAKAO]
- {speaker:구윤모} 윤영아. 내일 답장할게
[/KAKAO]

[JUMP: ch05_03_close]

---

# Scene: ch05_03_close

[BGM_STOP fade=2]
[CHARACTER: 윤모 center default fade]
[BG: black fade=3]

[JUMP: ch05_04_mt_decision]

---

# Scene: ch05_04_mt_decision
# Hint: chapter=5, time="2026-05-13 evening", active=H2

[BG: bg_studio_room fade]
[BGM: 일상 fade=2 volume=0.4]

[지문] 5월 13일 저녁.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:김규민} MT 5월 16일 토요일 ㄱㄱ 펜션 가창
- {speaker:김규민} 본과 + 의예과 애들 일부 + 약대에 승보 형
- {speaker:표경민} ㄱㄱㄱ
- {speaker:윤하정} ㄱ
- {speaker:김규민} 윤모 ㄱ?
[/KAKAO]

[CHOICE]
- "ㄱ" (간다) → KEY:flag_mt=go → next: ch05_04b_go
- "고민해볼게" (보류) → next: ch05_04b_skip
[/CHOICE]

---

# Scene: ch05_04b_go

[FLAG: flag_mt=go]

[KAKAO]
- {speaker:구윤모} ㄱ
- {speaker:김규민} 승보 형 + 서윤 누나 합류. 윤영도 ㄱ. 한설 선생님 잠깐. 차세린 선생님 미정
[/KAKAO]

[JUMP: ch05_05_mt_pension]

---

# Scene: ch05_04b_skip

[FLAG: flag_mt=skip]

[KAKAO]
- {speaker:구윤모} 고민해볼게
- {speaker:표경민} 시험 끝나고 쉬는 것도 맞지
[/KAKAO]

[지문] 다음 날 새벽, 결국 가기로 결정.

[KAKAO]
- {speaker:구윤모} 가는 걸로
- {speaker:김규민} ㅇㅋ
[/KAKAO]

[JUMP: ch05_05_mt_pension]

---

# Scene: ch05_05_mt_pension
# Hint: chapter=5, time="2026-05-16 evening", active=H1+H3+H4+H5

[BG: bg_mt_pension fade]
[BGM: 일상 fade=3 volume=0.5]

[지문] 5월 16일 저녁. 가창 펜션.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 김규민 right default fade]

[김규민] 짐 풀고 모닥불 쪽으로 와. 그쪽으로 다섯 명 다 데꼬올게

[CHARACTER_HIDE: 김규민 fade]

[BG: bg_mt_pension fade]
[BGM: 로맨틱 fade=2 volume=0.5]

[지문] 마당. 모닥불. 차세린이 도착. 한설도 함께.

[CHARACTER: 차세린 left default fade]
[CHARACTER: 한설 right default fade]

[차세린] 학생들 잘 도착했어요?
[김규민] (마당에서) 선생님들 왔다!

[JUMP: ch05_06_bonfire]

---

# Scene: ch05_06_bonfire
# Hint: chapter=5, time="2026-05-16 night", active=all

[BG: bg_mt_pension fade]
[BGM: 로맨틱 fade=3 volume=0.5]

[지문] 모닥불. 사람들이 둥글게 앉아 한 잔씩. 한 시간 후 1:1 시간이 생긴다.

[CHARACTER: 윤모 center default fade]

[CHOICE]
- "차세린 선생님이 마당 끝에서 머그잔 들고 계심" → next: ch05_06b_h1 → +25 H1 → KEY:H1:ch5_bonfire  {tone:mature_serious}
- "윤하정이 모닥불 옆에서 한 잔 더 채우는 중" → next: ch05_06b_h2 → +25 H2 → KEY:H2:ch5_bonfire  {tone:direct_friendly}
- "한설 선생님이 펜션 입구에서 바람 쐬는 중" → next: ch05_06b_h3 → +25 H3 → KEY:H3:ch5_bonfire  {tone:warm_supportive}
- "나서윤씨가 펜션 안 부엌에서 잔 정리 중" → next: ch05_06b_h4 → +25 H4 → KEY:H4:ch5_bonfire  {tone:warm_supportive}
- "장윤영이 모닥불 너머에서 윤모 쪽 봄" → next: ch05_06b_h5 → +25 H5 → KEY:H5:ch5_bonfire  {tone:bright_forward}
[/CHOICE]

---

# Scene: ch05_06b_h1

[FLAG: flag_ch5_bonfire=h1]
[CHARACTER: 차세린 right default fade]

[구윤모] 선생님, 머그잔만 드시는 거예요?
[차세린] 회식 한 번 끝낸 다음이라. 5월 밤공기 좋네요.
[구윤모] 선생님이 같이 계셔주신 게 의미가 커요.
[차세린] ...학생, 그 말 잘 받았어요.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h2

[FLAG: flag_ch5_bonfire=h2]
[CHARACTER: 윤하정 right default fade]

[윤하정] 어, 윤모. 한 잔 더?
[구윤모] 풀어진 윤하정 처음 봤는데.
[윤하정] 오늘은 좀 더 풀어도 되는 날이라. ...너도 같이 좀 풀어.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h3

[FLAG: flag_ch5_bonfire=h3]
[CHARACTER: 한설 right default fade]

[구윤모] 선생님, 바람 쐬세요?
[한설] 한 시간쯤 있다 가야 해요. 다음 주 실험 일정.
[구윤모] 짧게라도 와주신 게 의미가 커요.
[한설] 학생들이 한 학기 같이 견딘 자리니까요.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h4

[FLAG: flag_ch5_bonfire=h4]
[CHARACTER: 나서윤 right default fade]

[구윤모] 정리하시는 거예요?
[나서윤] 손이 비어 있길래. 회식이든 MT든 처음엔 적응이 좀.
[구윤모] (소매 걷으며) 같이 할게요.

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06b_h5

[FLAG: flag_ch5_bonfire=h5]
[CHARACTER: 장윤영 right smile_big fade]

[장윤영] 선배~~! 이쪽으로 한 번 와요!
[장윤영] (잔 들며) 한 잔 더 받으세요!
[구윤모] (잔 받으며) 한 잔만. 천천히.
[장윤영] 천천히 마셔주시는 게 더 좋아요!

[JUMP: ch05_06_pair_pause]

---

# Scene: ch05_06_pair_pause

[BG: bg_mt_pension]
[BGM: 코믹 fade=2 volume=0.4]

[지문] 1:1 시간 끝. 윤모가 모닥불을 바라본다.

[CHARACTER: 윤모 center perv fade]

[구윤모 모놀로그] (망상 시작) ...어. 모닥불 빛이.
[구윤모 모놀로그] (망상 시작) 누군가의 풀어진 옆모습이 머리카락 흘러내리는 순간이.
[구윤모 모놀로그] (망상 시작) 한 학기를 통째로 정리해버릴 수도 있겠다 싶고.

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

[지문] 5월 17일 새벽 2시. MT 펜션.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[지문] 1:1 카톡방. "나서윤".

[KAKAO]
- {speaker:나서윤} 안 자요?
- {speaker:나서윤} 오늘 부엌에서 같이 정리해주신 거 고마웠어요
[/KAKAO]

[KAKAO_TIMER: 10]
- {speaker:나서윤} 잠깐.. 답장 가능하세요?
[CHOICE_KAKAO]
- "안 잤어요, 같이 정리하는게 당연한거죠 뭐," (정중·풀어서·빠르게) → next: ch05_07b_replied  {tone:warm_supportive, key:true, mechanism:h4_reply_speed, descriptor:ch5_dawn_reply}
- "안 잤어요. 별일 없죠?" (짧게 빠르게) → next: ch05_07b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]
[/KAKAO_TIMER]

---

# Scene: ch05_07b_replied

[FLAG: flag_h4_dawn_reply=on_time]

[KAKAO]
- {speaker:구윤모} 안 잤어요. 정리하시는 모습이 자연스러워서 같이 했어요
- {speaker:나서윤} 그래도요. MT 분위기 처음이라. 와본 거 다행이에요
- {speaker:나서윤} 잘 자요 🥺
[/KAKAO]

[JUMP: ch05_07_close]

---

# Scene: ch05_07b_short

[FLAG: flag_h4_dawn_reply=short]

[KAKAO]
- {speaker:구윤모} 안 잤어요. 별일 없죠?
- {speaker:나서윤} 네. 잘 자요
[/KAKAO]

[JUMP: ch05_07_close]

---

# Scene: ch05_07_close

[BGM_STOP fade=2]
[CHARACTER: 윤모 center default fade]
[BGM: 메인_테마 fade=4 volume=0.5]

[구윤모 모놀로그] 한 학기 동안 다섯 명. 마음이 향하는 곳이 있다. 누군지는 내 마음이 안다.

[CHARACTER: 윤모 center smile fade]

[BG: black fade=4]

[지문] — 본과 1학년 봄. 다섯 명과 한 학기. 결정의 시간.

[EVALUATE_BRANCH]
