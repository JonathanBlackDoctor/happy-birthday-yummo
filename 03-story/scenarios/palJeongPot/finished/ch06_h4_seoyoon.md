---
module: ch06_h4_seoyoon (compressed)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/ch06_h4_seoyoon.md
outputs:
  - Ch.6 "나서윤 분기" 압축본 (6개 메인 씬 + 11개 분기 + 3종 엔딩 — H4는 BAD 없음, REJECT 흡수)
  - KEY 3개 + KAKAO_TIMER 미니게임 2회 + IF 체인 평가 + 3종 엔딩 100% 보존
  - CG cg_seoyoon_date/true/reject + VIDEO video_true_seoyoon/reject_seoyoon 보존
  - REJECT 엔딩 8단계 카톡은 RejectEnding 컴포넌트 자체 처리 (텍스트 변경 금지)
status: review
---

# 03-story/scenarios/compressed/ch06_h4_seoyoon.md

> 풀 `scenarios/ch06_h4_seoyoon.md`의 압축 버전. NARRATION/MONOLOGUE 50% 삭감, DIALOGUE 약 20% 가볍게 합치기, KAKAO/CHOICE/CHOICE_KAKAO/KAKAO_TIMER/IF/FLAG/INC/JUMP/ENDING/BG/BGM/SFX/CHARACTER/CG/VIDEO 100% 보존.
> 변태 망상 페어 0회 (Ch.6 0회 PM 결정 동일).
> 씬 ID·CHOICE next 그래프·IF 평가 체인·KAKAO 메시지 풀과 동일.

---

# Scene: ch06_h4_01_open
# Hint: chapter=6, heroine=H4, time="2026-06-01 evening"

[BG: bg_studio_room fade]
[BGM: 일상 fade=2 volume=0.4]

[지문] 6월 1일 저녁. 자취방.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 안녕하세요
- {speaker:나서윤} 츄파츕스 뽑고 연락드려요
- {speaker:나서윤} 🥺
[/KAKAO]

[KAKAO]
- {speaker:구윤모} 드디어!!!!!!!!!!1
- {speaker:구윤모} why 구윤모? 100가지 구윤모이어야만 하는 이유.
- {speaker:나서윤} 아…. 전에 소개팅 하신 분 약대에 있다고 들었어요.
- {speaker:구윤모} 하하, 그런 넝~담 재밌네요.
- {speaker:나서윤} 그러시구나
[/KAKAO]

[INC: H4 +1]

[KAKAO]
- {speaker:나서윤} 아뇨, 그 다나에서 소개팅 하셨다고.
- {speaker:나서윤} 후배들한테도 딱 걸리셨다고.
[/KAKAO]

[CHOICE]
- "열심이십니다. 참." (자연스러운 호응) → next: ch06_h4_01b_warm  {tone:warm_supportive}
- "부담 없어요, 시험 끝나고 메시지 받을게요" → next: ch06_h4_01b_neutral  {tone:direct_friendly}
[/CHOICE]

---

# Scene: ch06_h4_01b_warm

[FLAG: flag_h4_open=warm]

[KAKAO]
- {speaker:구윤모} 네 시험 끝나고 시간 봐요
- {speaker:구윤모} 응원할게요. 무리 마시고요
- {speaker:나서윤} 응원 잘 받았어요
- {speaker:나서윤} 🥺
[/KAKAO]

[JUMP: ch06_h4_01_close]

---

# Scene: ch06_h4_01b_neutral

[FLAG: flag_h4_open=neutral]

[KAKAO]
- {speaker:구윤모} 부담은 전혀 없어요
- {speaker:나서윤} 네. 알겠어요
[/KAKAO]

[JUMP: ch06_h4_01_close]

---

# Scene: ch06_h4_01_close

[BGM_STOP fade=2]
[BG: black fade=3]

[JUMP: ch06_h4_02_campus_lunch]

---

# Scene: ch06_h4_02_campus_lunch
# Hint: chapter=6, heroine=H4, time="2026-06-03 lunch"

[BG: bg_kmu_main fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 6월 3일 점심. 다나 앞.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 나서윤 right default fade]

[나서윤] 베이크드 리조또가 맛있다죠?

[CHOICE]
“이미 드셔보셨겠지만.”
"LP바 가는 길이라 시간 안 뺏을게요. 시험 잘 보세요"
“애프터 잡아줘요. 제발.”
[/CHOICE]

---

# Scene: ch06_h4_02b_cheer

[FLAG: flag_h4_lunch=cheer]

[구윤모] 시험 마지막 주 직전이라 빡빡하실 텐데요. 약대 4년, 끝자락이니까 잘 마무리하실 거예요.

[CHARACTER: 나서윤 right smile_slight fade]

[나서윤] 4년이라는 거. 그걸 챙겨주신 게 의외였어요. 잘 받았어요. 진짜로.

[JUMP: ch06_h4_02_close]

---

# Scene: ch06_h4_02b_quick

[FLAG: flag_h4_lunch=quick]

[구윤모] 시간 안 뺏을게요. 시험 잘 보세요.
[나서윤] 네, 점심 잘 드세요.

[JUMP: ch06_h4_02_close]

---

# Scene: ch06_h4_02b_push

[FLAG: flag_h4_lunch=push]

[구윤모] 한 끼 같이 가요. 굶으면 안 되니까.

[CHARACTER: 나서윤 right distant fade]

[나서윤] 지금은 자료 한 챕터라도 더 돌리는 게 우선이에요.
[구윤모] 죄송합니다. 분위기를 못 맞췄네요.

[JUMP: ch06_h4_02_close]

---

# Scene: ch06_h4_02_close

[CHARACTER_HIDE: 나서윤 fade]
[CHARACTER_HIDE: 윤모 fade]
[BGM_STOP fade=2]

[JUMP: ch06_h4_03_perv_pair]

---

# Scene: ch06_h4_03_perv_pair
# Hint: chapter=6, heroine=H4, time="2026-06-04 evening"

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 6월 4일 저녁. 자취방.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 어제 응원 잘 받았다는 말 한 번 더 적어요
- {speaker:나서윤} 🥺
- {speaker:나서윤} 약대 가운 사진 한 장 첨부해요
- {speaker:나서윤} (사진 첨부)
[/KAKAO]

[지문] 카톡 사진. 약대 가운 + 안경 + 미니 가방.

[KAKAO_TIMER: 10]
- {speaker:나서윤} 답장 짧게라도 부탁드려요
[CHOICE_KAKAO]
“눈나!!!!!!!!!!!!!!!!!!!!!!!!”
- "잘 어울리세요. 시험 잘 보세요" → next: ch06_h4_03b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]
[/KAKAO_TIMER]

---

# Scene: ch06_h4_03b_replied

[FLAG: flag_h4_perv_kakao=on_time]

[KAKAO]
- {speaker:구윤모} 약대 가운 처음 봤어요. 어른스러운 분위기가 짙어지시네요
- {speaker:구윤모} 시험 잘 보세요
- {speaker:나서윤} 어른스러운 분위기라는 거 신기하게 들으시네요
- {speaker:나서윤} 다음 주 끝나고 시간 잡아둘게요
- {speaker:나서윤} 🫶
[/KAKAO]

[JUMP: ch06_h4_03_close]

---

# Scene: ch06_h4_03b_short

[FLAG: flag_h4_perv_kakao=short]

[KAKAO]
- {speaker:구윤모} 잘 어울리세요. 시험 잘 보세요
- {speaker:나서윤} 네. 감사해요
[/KAKAO]

[JUMP: ch06_h4_03_close]

---

# Scene: ch06_h4_03_close

[BGM_STOP fade=2]
[BG: black fade=3]

[JUMP: ch06_h4_04_date]

---

# Scene: ch06_h4_04_date
# Hint: chapter=6, heroine=H4, time="2026-06-13 saturday afternoon"

[BG: bg_dongseong_street fade]
[BGM: 로맨틱 fade=3 volume=0.5]

[지문] 6월 13일 토요일 오후. 동성로.

[CHARACTER: 윤모 center default fade]
[CHARACTER: 나서윤 right outfit_date fade]

[CG: cg_seoyoon_date show]
[지문] 동성로 나빌레라 앞. 나서윤. 베이지 코트에 미니 원피스. 언젠가 겪어본 듯 한 분위기.
[CG_HIDE]

[나서윤] 윤모씨, 안녕하세요. 답장 빠르게 받아주셨던 거 고마웠어요.

[INC: H4 +5]

[BG: bg_campus_cafe fade]

[나서윤] 나빌레라 고르신 거 무난하네요.
[구윤모] 첫 데이트 자리에선 안전한 게 맞다고요.
[나서윤] 누구한테요?
[구윤모] 비통한 솔로 자칭하는 동기요.
[나서윤] (작게 웃으며) 표현 신선하네요.

[나서윤] 윤모씨, 본과 1학년 한 학기 어떠세요?
[구윤모] 한 사람씩 만나면서 길게 느껴졌어요. 학기 단위로 나누면 견딜 만한 흐름이고요.
[나서윤] 저도 4년 끝나가니까 학기 단위로 나눈 게 맞았다고 새기는 중이에요.

[CHOICE]
- "시간 내주셔서 감사해요, 무리 안 할 자리로 잡았어요" → next: ch06_h4_04b_distance  {tone:warm_supportive, key:true, mechanism:h4_facing_key, descriptor:ch6_h4_distance}
“제발 저와 애프터를 해주세요”
“강의실에서 울부짖을 것 같아요”
[/CHOICE]

---

# Scene: ch06_h4_04b_distance

[FLAG: flag_h4_date=distance]

[구윤모] 시험 끝난 다음 날인데 무리 안 하실 자리로 잡았어요. 그 속도 안 흔드는 게 같이 가는 거지 싶었어요.

[CHARACTER: 나서윤 right smile_slight fade]

[나서윤] 그 마음 받을게요.

[JUMP: ch06_h4_04_close]

---

# Scene: ch06_h4_04b_direct

[FLAG: flag_h4_date=direct]

[구윤모] 한 번 더 봬도 될까요.
[나서윤] 직진은 직진이네요. 천천히 할게요.

[JUMP: ch06_h4_04_close]

---

# Scene: ch06_h4_04b_push

[FLAG: flag_h4_date=push]

[구윤모] 한 잔 더 하고 저녁까지 같이 가요.

[CHARACTER: 나서윤 right distant fade]

[나서윤] 한 학기 인사 자리는 인사 자리로 끝내는 게 맞아요.

[JUMP: ch06_h4_04_close]

---

# Scene: ch06_h4_04_close

[BG: bg_dongseong_street fade]
[BGM: 로맨틱 fade=2 volume=0.4]

[나서윤] 오늘 시간 잘 보냈어요.

[CHARACTER_HIDE: 나서윤 fade]
[CHARACTER_HIDE: 윤모 fade]
[BGM_STOP fade=2]

[JUMP: ch06_h4_05_late_kakao]

---

# Scene: ch06_h4_05_late_kakao
# Hint: chapter=6, heroine=H4, time="2026-06-14 dawn"

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 6월 14일 새벽 1시 30분.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 안 자세요?
- {speaker:나서윤} 오늘 분위기 맞춰주신 게 의외였어요
[/KAKAO]

[KAKAO_TIMER: 10]
- {speaker:나서윤} 잠깐 답장 가능하시면요
[CHOICE_KAKAO]
- "안 잤어요, 오늘 자리 의미 있었어요" → next: ch06_h4_05b_replied  {tone:warm_supportive, key:true, mechanism:h4_reply_speed, descriptor:ch6_h4_late_kakao}
- "안 잤어요. 잘 들어가셨죠?" → next: ch06_h4_05b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]
[/KAKAO_TIMER]

---

# Scene: ch06_h4_05b_replied

[FLAG: flag_h4_dawn=on_time]

[KAKAO]
- {speaker:구윤모} 안 잤어요. 한 학기 인사 자리가 의미 있었어요
- {speaker:나서윤} 답장 빠른 사람 진짜 드물어요
- {speaker:나서윤} 윤모씨는 둘 다 같이 가는 분이라 잠깐 무겁게 들었어요
- {speaker:나서윤} 🥺
[/KAKAO]

[JUMP: ch06_h4_06_close_decision]

---

# Scene: ch06_h4_05b_short

[FLAG: flag_h4_dawn=short]

[KAKAO]
- {speaker:구윤모} 안 잤어요. 잘 들어가셨죠?
- {speaker:나서윤} 네. 잘 들어왔어요
[/KAKAO]

[JUMP: ch06_h4_06_close_decision]

---

# Scene: ch06_h4_06_close_decision
# Hint: chapter=6, heroine=H4, time="2026-06-14 dawn"

[BGM_STOP fade=2]
[CHARACTER: 윤모 center default fade]
[BGM: 메인_테마 fade=4 volume=0.5]
[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 윤모씨
- {speaker:나서윤} 한 마디 더 적을게요
[/KAKAO]

[CHOICE]
- "또 봐요, 한 학기 가지고 갈게요" → next: ch06_h4_06b_close_warm  {tone:warm_supportive, key:true, mechanism:h4_facing_key, descriptor:ch6_h4_close_reply}
- "네 잘 자요" → next: ch06_h4_06b_close_neutral  {tone:direct_friendly}
[/CHOICE]

---

# Scene: ch06_h4_06b_close_warm

[FLAG: flag_h4_close=warm]

[KAKAO]
- {speaker:구윤모} 다음에 또 봐요. 한 학기 가지고 갈게요
- {speaker:나서윤} 다음에 또 봐요 윤모씨
- {speaker:나서윤} 🫶🫶
[/KAKAO]

[JUMP: ch06_h4_07_evaluate]

---

# Scene: ch06_h4_06b_close_neutral

[FLAG: flag_h4_close=neutral]

[KAKAO]
- {speaker:구윤모} 네. 잘 자요
- {speaker:나서윤} 네. 잘 자요
[/KAKAO]

[JUMP: ch06_h4_07_evaluate]

---

# Scene: ch06_h4_07_evaluate
# Hint: chapter=6, heroine=H4, time="2026-06-14 dawn — branch evaluation"

[BG: black fade=3]
[BGM_STOP fade=2]

[EVALUATE_TIER: H4]

[IF: late_reply_count >= 2]
[JUMP: ch06_h4_reject]
[ELSE]
  [IF: H4 < 60]
  [JUMP: ch06_h4_reject]
  [ELSE]
    [IF: H4 < 70]
    [JUMP: ch06_h4_normal]
    [ELSE]
      [IF: key_count_H4 >= 3 AND late_reply_count == 0]
      [JUMP: ch06_h4_true]
      [ELSE]
      [JUMP: ch06_h4_normal]
      [/IF]
    [/IF]
  [/IF]
[/IF]

---

# Scene: ch06_h4_true
# Hint: chapter=6, heroine=H4, ending=TRUE, time="2026-06-27 afternoon"

[BG: bg_kmu_main fade=4]
[BGM: 클라이맥스 fade=4 volume=0.6]

[지문] 6월 27일 토요일 오후. 계명대 성서 캠퍼스. 약대 마지막 보강 종료 직후.

[CHARACTER: 윤모 center smile fade]
[CHARACTER: 나서윤 right warm fade]

[VIDEO: video_true_seoyoon]

[CG: cg_seoyoon_true show]
[지문] 성서 캠퍼스 벚꽃길. 나서윤. 약대 가운. 환한 미소.
[CG_HIDE]

[나서윤] 윤모씨. 한 학기 카톡 하면서 깨달은 게 있어서요.
[나서윤] 답장 빠르게 해줘서 고마워, 윤모야.

[CHARACTER: 윤모 center blush fade]

[구윤모] 이름 부르신 거 처음이에요.
[나서윤] 답장 빠른 사람도 드물고, 분위기 맞춰주는 사람도 드물고. 둘이 같이 가는 사람은 윤모씨가 처음이었어요.

[구윤모] 서윤씨. 봄 끝에 서윤씨가 제일 천천히 가는 분이었어요. 그 속도 같이 가는 게 맞다 싶었어요.
[나서윤] 그 마음 받을게요. 다음 학기엔 답장 좀 더 빨리 보내볼게요.
[구윤모] 그건 본인 속도대로 가셔도 돼요.

[나서윤] 한 학기 더 가요. 윤모야.
[구윤모] 네. 한 학기 더 가요. 서윤씨.

[BGM: 클라이맥스 fade=2 volume=0.7]
[BG: black fade=4]

[지문] — 끝.
[지문] **나서윤 트루 엔딩 — 성서의 봄**

[ENDING: END_H4_TRUE]

---

# Scene: ch06_h4_normal
# Hint: chapter=6, heroine=H4, ending=NORMAL, time="2026-06-21 afternoon"

[BG: bg_kmu_main fade=3]
[BGM: 일상 fade=3 volume=0.4]

[지문] 6월 21일 오후. 데이트 후 한 주.

[CHARACTER: 윤모 center default fade]
[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 약대 마지막 보강 다음 주에 끝나요
- {speaker:나서윤} 그 다음 시험 끝나고 한 번 더 봬요
- {speaker:나서윤} 🥺
- {speaker:구윤모} 네 시험 끝나고 봬요. 무리 마시고요
[/KAKAO]

[CG: cg_seoyoon_date show]
[지문] 데이트 때 옆모습이 살짝 어두워진 채로 다시 떠오른다.
[CG_HIDE]

[BGM: 일상 fade=3 volume=0.5]
[BG: black fade=3]

[지문] — 끝.
[지문] **나서윤 노멀 엔딩 — 느린 답장**

[ENDING: END_H4_NORMAL]

---

# Scene: ch06_h4_reject
# Hint: chapter=6, heroine=H4, ending=REJECT, time="2026-06-14 morning, 8단계 거절 카톡 연출 (H4 §6 정확 1:1)"

[BG: black]
[BGM: 슬픔 fade=4 volume=0.6]
[SFX: 카톡_알림]

[KAKAO mode=dm heroine=H4 unreadFadeMs=400]
- {speaker:나서윤, preTyping1:1000, prePause:600, preTyping2:800} 답장이 너무 늦어서 미안해ㅠㅠ
- {speaker:나서윤, preTyping1:600} 그날 만나서 얘기하고 시간 잘 보냈는데
- {speaker:나서윤, prePause:600, preTyping2:500} 더 진행하기엔 무리가 있을거 같아..
- {speaker:나서윤, preTyping1:800, prePause:1000, preTyping2:3000} 좋은 인연 만나길 바랄게 🥺🥺
[/KAKAO]

[BG: black fade=3]
[VIDEO: video_reject_seoyoon skipable=false]
[ENDING: END_H4_REJECT]
