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

[지문] 2026년 6월 1일 월요일 저녁 8시. 자취방. MT 다녀온 지 두 주가 지났다.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] MT 끝난 지 두 주. 다섯 명 다 떠올렸는데, 자꾸 한 사람한테 시선이 머문다. 시크하고 정중한데, 메시지 끝에 🥺 하나 붙이고 닫는 사람.

[SFX: 카톡_알림]

[지문] 1:1 카톡방. "나서윤".

[KAKAO]
- {speaker:나서윤} 안녕하세요
- {speaker:나서윤} 오랜만이에요
[/KAKAO]

[KAKAO]
- {speaker:나서윤} MT에서 부엌 같이 정리하신 거 한 번 더 고마웠어요
- {speaker:나서윤} 답장 늦은 건 시험 직전이라 양해 부탁드려요
- {speaker:나서윤} 🥺
[/KAKAO]

[KAKAO]
- {speaker:구윤모} 네 안녕하세요
- {speaker:구윤모} 양해는 전혀 필요 없어요
- {speaker:구윤모} 시험기간이 빡센 거지 답장이 빡센 게 아니니까요
- {speaker:구윤모} 약대 시험 마지막 주가 다음 주죠?
- {speaker:나서윤} 네
- {speaker:나서윤} 다음 주 화요일부터 금요일까지요
- {speaker:나서윤} 의대는 시험 끝나서 좀 풀린 거죠?
- {speaker:구윤모} 네 그렇긴 해요
- {speaker:구윤모} 다음 주가 의대 축제 주간이라 부스 준비 중이에요
- {speaker:나서윤} 축제 한다고 들었어요
- {speaker:나서윤} 본과 1학년이 부스 운영 메인이라고
- {speaker:구윤모} 네 메인은 아니고 한 부스 정도예요
- {speaker:구윤모} 동아리 부스도 있고
- {speaker:나서윤} 그러시구나
[/KAKAO]

[INC: H4 +1]

[KAKAO]
- {speaker:나서윤} 시험 끝나고 나면 정식으로 인사할 시간 있다고 했었죠
- {speaker:나서윤} 6월 둘째 주 금요일 끝나면 한 번 시간 내볼 수 있을 것 같아요
- {speaker:나서윤} 부담은 아니시면요
[/KAKAO]

[구윤모 모놀로그] 시험 끝나고 보자는 말, 먼저 꺼내셨네.

[CHOICE]
- "시험 끝나고 시간 봐요, 응원할게요" (자연스러운 호응) → next: ch06_h4_01b_warm  {tone:warm_supportive}
- "부담 없어요, 시험 끝나고 메시지 받을게요" (시크 호응) → next: ch06_h4_01b_neutral  {tone:direct_friendly}
[/CHOICE]


---

# Scene: ch06_h4_01b_warm


[FLAG: flag_h4_open=warm]

[KAKAO]
- {speaker:구윤모} 네 시험 끝나고 나면 시간 봐요
- {speaker:구윤모} 그때까지 시험기간 응원할게요
- {speaker:구윤모} 무리 마시고요
- {speaker:나서윤} 네
- {speaker:나서윤} 응원 잘 받았어요
- {speaker:나서윤} 🥺
[/KAKAO]

[구윤모 모놀로그] 🥺 하나 더. 약속도 먼저 잡으시고, 응하실 때도 자연스럽고.

[JUMP: ch06_h4_01_close]

---

# Scene: ch06_h4_01b_neutral


[FLAG: flag_h4_open=neutral]

[KAKAO]
- {speaker:구윤모} 부담은 전혀 없어요
- {speaker:구윤모} 시험 끝나고 나면 보내주신 메시지 한 번 더 받을게요
- {speaker:나서윤} 네
- {speaker:나서윤} 알겠어요
[/KAKAO]

[구윤모 모놀로그] 짧게 닫혔다.

[JUMP: ch06_h4_01_close]

---

# Scene: ch06_h4_01_close

[BGM_STOP fade=2]

[구윤모 모놀로그] 시험 끝나는 게 6월 12일 금요일. 그럼 그다음 토요일쯤이 자연스럽겠다.

[BG: black fade=3]

[JUMP: ch06_h4_02_campus_lunch]

---

# Scene: ch06_h4_02_campus_lunch
# Hint: chapter=6, heroine=H4, time="2026-06-03 lunch"

[BG: bg_kmu_main fade]
[BGM: 일상 fade=2 volume=0.5]

[지문] 6월 3일 수요일 12시 30분. 의대 본관 앞 광장. 점심 시간.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 의대 축제 부스 회의 끝나고 점심.

[CHARACTER: 나서윤 right default fade]

[구윤모 모놀로그] 어. 서윤씨다. 4월에 처음 마주쳤던 그 본관 앞 화단. 또 같은 자리에서 만나네.

[나서윤] (시선 들며) ...아.
[구윤모] 안녕하세요. 시험 마지막 주 직전이시죠?
[나서윤] 네, 자료 정리하러 도서관 가는 길이에요. 윤모씨는 학식 가시는 거예요?
[구윤모] 네, 부스 회의 끝나고 점심 늦게 먹으러요.
[나서윤] (작게 끄덕) 그러시구나.

[구윤모 모놀로그] 점심 같이 가자고 하기엔, 도서관 가신다고 하셨고. 짧게 응원만 하고 보내드려야겠다.

[CHOICE]
- "잠깐 멈춰주셔서 감사해요, 시험 잘 보세요" (진심 응원) → next: ch06_h4_02b_cheer  {tone:warm_supportive, key:true, mechanism:h4_facing_key, descriptor:ch6_h4_exam_cheer}
- "학식 가는 길이라 시간 안 뺏을게요. 시험 잘 보세요" (담담 응원) → next: ch06_h4_02b_quick  {tone:direct_friendly}
- "한 끼 같이 가요, 굶으면 안 되니까" (강하게 권유) → next: ch06_h4_02b_push  {tone:bright_forward}
[/CHOICE]

---

# Scene: ch06_h4_02b_cheer


[FLAG: flag_h4_lunch=cheer]

[구윤모] 도서관 가시는 길에 잠깐 멈춰주셔서 감사해요.
[구윤모] 시험 마지막 주 직전이라 누구 만날 여유도 빡빡하실 텐데요. 시험 진짜 잘 보세요. 약대 4학년 마지막 주, 4년 견뎌오신 끝자락이니까 잘 마무리하실 거예요.

[CHARACTER: 나서윤 right smile_slight fade]

[나서윤] (옅은 미소) ...윤모씨 그렇게 말해주시네요. 4년이라는 거. 그걸 챙겨주신 게 의외였어요.
[나서윤] 약대 4학년 시험기간이라고만 적었는데, 그걸 4년 견뎌온 자리로 들어주셨네요.
[구윤모] 약대 6년제는 또 다르다는 얘기, 승보 형이 짧게 짚어주셨거든요.
[나서윤] (작게 끄덕) 잘 받았어요. 진짜로. 시험 끝나고 나면 잘 마무리됐다고 카톡 한 번 보낼게요.
[구윤모] 네. 기다릴게요.

[구윤모 모놀로그] "잘 받았어요. 진짜로." 시크한 와중에도 진심은 꺼낼 줄 아시는구나.

[JUMP: ch06_h4_02_close]

---

# Scene: ch06_h4_02b_quick


[FLAG: flag_h4_lunch=quick]

[구윤모] 학식 가는 길이라 시간 안 뺏을게요. 시험 잘 보세요.
[나서윤] 네, 윤모씨도 점심 잘 드세요.

[구윤모 모놀로그] 무난하게 끝났다.

[JUMP: ch06_h4_02_close]

---

# Scene: ch06_h4_02b_push


[FLAG: flag_h4_lunch=push]

[구윤모] 한 끼라도 같이 가요. 시험 마지막 주에 굶으면 안 되니까. 도서관 가는 길에 학식 들렀다 가도 멀지 않잖아요.

[CHARACTER: 나서윤 right distant fade]

[나서윤] 윤모씨, 죄송한데 지금은 자료 한 챕터라도 더 돌리는 게 우선이에요. 시험 직전 페이스를 권유로 흔드는 건 좀 어려워요.
[구윤모] (살짝 멈칫) ...죄송합니다. 분위기를 못 맞췄네요.
[나서윤] 네, 다음에 시험 끝나고 봬요.

[구윤모 모놀로그] 시크한 분에게 권유는 호의가 아니라 부담일 수도 있구나.

[JUMP: ch06_h4_02_close]

---

# Scene: ch06_h4_02_close

[CHARACTER_HIDE: 나서윤 fade]

[구윤모 모놀로그] 같은 23학번이지만 한 살 위, 약대 4학년. 그 부분 잊지 말고, 거리감 흔들지 말자.

[CHARACTER_HIDE: 윤모 fade]
[BGM_STOP fade=2]

[JUMP: ch06_h4_03_perv_pair]

---

# Scene: ch06_h4_03_perv_pair
# Hint: chapter=6, heroine=H4, time="2026-06-04 evening"

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 6월 4일 목요일 저녁 9시. 자취방.

[CHARACTER: 윤모 center default fade]

[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 윤모씨
- {speaker:나서윤} 시험 자료 정리하다 잠깐 쉬는 시간이라
- {speaker:나서윤} 어제 점심 응원 잘 받았다는 말 한 번 더 적어요
- {speaker:나서윤} 🥺
[/KAKAO]

[구윤모 모놀로그] 또 먼저 보내셨네.

[KAKAO]
- {speaker:나서윤} 약대 가운 입고 도서관 가는 길이라 사진 한 장 첨부해요
- {speaker:나서윤} 윤모씨가 의대 가운 한 번 보여주셨으니까 저도 약대 가운 보내는 거예요
- {speaker:나서윤, image:/img/sprites/seoyoon_outfit_school.webp}
[/KAKAO]

[지문] 카톡 모달에 사진 한 장. 약대 학생회관 앞. 약대 가운 + 안경 + 미니 가방.

[BGM: 카톡 fade=1 volume=0.4]

[구윤모 모놀로그] 답장은 자연스럽게. 분위기에 맞춰드리면 된다.

[KAKAO_TIMER: 15]
- {speaker:나서윤} 답장 짧게라도 부탁드려요
[CHOICE_KAKAO]
- "약대 가운 어른스러우시네요, 시험 잘 보세요" (정중·풀어서·빠르게) → next: ch06_h4_03b_replied  {tone:warm_supportive, key:true, mechanism:h4_reply_speed, descriptor:ch6_h4_uniform_reply}
- "잘 어울리세요. 시험 잘 보세요" (짧게 빠르게) → next: ch06_h4_03b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]

[/KAKAO_TIMER]

---

# Scene: ch06_h4_03b_replied


[FLAG: flag_h4_perv_kakao=on_time]

[KAKAO]
- {speaker:구윤모} 약대 가운 처음 봤어요
- {speaker:구윤모} 어른스러운 분위기가 짙어지시네요
- {speaker:구윤모} 시험 마지막 주 잘 보세요
- {speaker:구윤모} 도서관 가시는 길 무리 마시고요
- {speaker:나서윤} 네
- {speaker:나서윤} 어른스러운 분위기라는 거 신기하게 들으시네요
- {speaker:나서윤} 의대생이 약대 가운 처음 보는 게 일상인데, 그걸 짚어주시는 게 자연스럽고
- {speaker:나서윤} 다음 주 끝나고 인사할 시간 잡아둘게요
- {speaker:나서윤} 🫶
[/KAKAO]

[구윤모 모놀로그] 🥺였다가 🫶가 됐네. 시크하긴 한데, 이모지 바뀐 자리에서 마음이 살짝 보인다.


[JUMP: ch06_h4_03_close]

---

# Scene: ch06_h4_03b_short


[FLAG: flag_h4_perv_kakao=short]

[KAKAO]
- {speaker:구윤모} 잘 어울리세요
- {speaker:구윤모} 시험 잘 보세요
- {speaker:나서윤} 네
- {speaker:나서윤} 감사해요
[/KAKAO]

[구윤모 모놀로그] 짧게 닫혔다.

[JUMP: ch06_h4_03_close]

---

# Scene: ch06_h4_03_close

[BGM_STOP fade=2]

[구윤모 모놀로그] 약대 가운 사진 한 장. 시험 마지막 주 끝나면 직접 뵐 수 있겠지.

[CHARACTER: 윤모 center default fade]

[BG: black fade=3]

[JUMP: ch06_h4_04_date]

---

# Scene: ch06_h4_04_date
# Hint: chapter=6, heroine=H4, time="2026-06-13 saturday afternoon"

[BG: bg_dongseong_street fade]
[BGM: 로맨틱 fade=3 volume=0.5]

[지문] 6월 13일 토요일 오후 3시. 동성로. 약대 시험 마지막 주가 끝나고 다음 날.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 약속 시간 5분 전. 시크한 분이니까 정시에 정확히 오시겠지.

[CHARACTER: 나서윤 right outfit_date fade]

[CG: cg_seoyoon_date show]

[지문] 동성로 카페 앞. 나서윤이 베이지 코트에 미니 원피스 차림으로 한 손엔 미니 가방. 햇살이 옆모습에 닿아 어른스러운 분위기와 미세한 따뜻함이 같이 얹혀 있다.

[CG_HIDE]

[나서윤] (시선 들며) 윤모씨, 안녕하세요.
[구윤모] 안녕하세요. 시험 마지막 주 잘 끝내셨어요?
[나서윤] 네, 어제 마지막 과목 끝났어요. 답장 빠르게 받아주셨던 거 한 번 더 고마웠어요. 시험기간에 카톡 답장 빠른 사람이 진짜 드물거든요.

[구윤모 모놀로그] "답장 빠르게 받아주셨던 거." 카톡 답장이 그쪽한테도 무겁게 보였구나.

[INC: H4 +5]

[BG: bg_campus_cafe fade]
[BGM: 로맨틱]

[CHARACTER: 나서윤 right outfit_date fade]
[CHARACTER: 윤모 left default fade]

[나서윤] (한 모금) 카페 고르신 거 무난하네요.
[구윤모] (피식) 무난한 게 안전하니까요.
[나서윤] (옅은 미소) 안전한 거 좋아하는 분이세요?
[구윤모] 첫 데이트 자리에선 안전한 게 맞다고 들었어요.
[나서윤] 누구한테요?
[구윤모] 김규민이라는 동기인데, 본인은 안전한 것만 골라서 항상 비통한 솔로라고 자칭하는 친구예요.
[나서윤] (작게 웃으며) 비통한 솔로. 표현 신선하네요.

[나서윤] 시험 끝나고 한 학기 마무리하는 자리가 처음이에요. 약대는 학년별 분위기가 단단해서 본격 만남 잘 안 가요.
[구윤모] 그러시구나. 그럼 오늘은.
[나서윤] (작게 끄덕) 오늘은 한 학기 끝낸 인사 자리.

[구윤모 모놀로그] 한 학기 끝낸 인사 자리. 정식 연인 직전 단계 같은 자리.

[나서윤] (시선 비스듬) 윤모씨, 한 가지 묻고 싶은 게 있는데요.
[구윤모] 네, 말씀하세요.
[나서윤] 본과 1학년 한 학기 끝낸 입장으로, 6년 의대 본격 들어간 게 어떠세요?
[나서윤] 약대 4학년이 다 끝나가는 시점이라, 6년 끝낸 입장에서 본과 1학년 마음 한 번 들어보고 싶어서요.
[구윤모] 저는... 한 학기 동안 한 사람씩 만나면서 그 한 학기가 한 학기 같지 않게 길게 느껴졌어요.
[구윤모] 6년이라는 게 길긴 긴데, 학기 단위로 나눠 보면 견딜 만한 흐름이지 싶고요.
[나서윤] (작게 끄덕) 그 마음 잘 받아요. 저도 4년 끝나가니까 학기 단위로 나눈 게 맞았다고 한 번씩 새기는 중이에요.

[CHOICE]
- "시간 내주셔서 감사해요, 무리 안 할 자리로 잡았어요" (자연스러운 거리감 존중) → next: ch06_h4_04b_distance  {tone:warm_supportive, key:true, mechanism:h4_facing_key, descriptor:ch6_h4_distance}
- "한 번 더 봬도 될까요" (직진 호감 표현) → next: ch06_h4_04b_direct  {tone:direct_friendly}
- "한 잔 더 하고 저녁까지 같이 가요" (강하게 권유) → next: ch06_h4_04b_push  {tone:bright_forward}
[/CHOICE]


---

# Scene: ch06_h4_04b_distance


[FLAG: flag_h4_date=distance]

[구윤모] 오늘 시간 내주신 거 감사해요. 시험 끝난 다음 날인데 무리 안 하실 자리로 안전한 카페 잡았어요. 한 학기 끝낸 인사 자리니까 가벼운 분위기가 맞다 싶었거든요.

[CHARACTER: 나서윤 right smile_slight fade]

[나서윤] (옅은 미소) 윤모씨, 그렇게 분위기 맞춰주시네요.
[나서윤] 시험 끝낸 다음 날 무리 안 할 자리. 그렇게 챙겨주신 게 의외예요. 보통 첫 데이트 자리는 분위기 무겁게 가져가려고들 하잖아요.
[구윤모] 그러기엔 서윤씨가 좀 천천히 가시는 분이라. 그 속도 안 흔드는 게, 같이 가는 거지 싶었어요.
[나서윤] (옅은 미소) ...윤모씨. 그 마음 받을게요.

[구윤모 모놀로그] 두 번째 "잘 받았어요. 진짜로."

[JUMP: ch06_h4_04_close]

---

# Scene: ch06_h4_04b_direct


[FLAG: flag_h4_date=direct]

[구윤모] 한 번 더 봬도 될까요. 오늘 한 학기 인사 자리라고 하셨는데, 저는 인사 자리로 끝내고 싶진 않아서요.

[나서윤] 윤모씨, 직진은 직진이네요. 답장은 한 번 더 보면서 천천히 할게요.
[구윤모] (작게 끄덕) 네. 속도 맞춰서 가요.

[구윤모 모놀로그] 직진 받아주셨다.

[JUMP: ch06_h4_04_close]

---

# Scene: ch06_h4_04b_push


[FLAG: flag_h4_date=push]

[구윤모] 오늘 한 잔 더 하시고 나서 저녁까지 같이 가요. 시험 끝난 다음 날인데 풀어드리고 싶고요.

[CHARACTER: 나서윤 right distant fade]

[나서윤] 윤모씨, 시험 끝난 다음 날 마음을 풀어드린다는 식으로 받기엔 좀 무거워요. 한 학기 인사 자리는 인사 자리로 끝내는 게 저한텐 맞는 거라.
[구윤모] ...죄송해요. 분위기 못 맞췄네요.
[나서윤] 네, 다음에 보시죠.

[구윤모 모놀로그] 분위기 못 맞췄다. 두 번째.

[JUMP: ch06_h4_04_close]

---

# Scene: ch06_h4_04_close

[BG: bg_dongseong_street fade]
[BGM: 로맨틱 fade=2 volume=0.4]

[나서윤] 오늘 시간 잘 보냈어요.
[구윤모] 저도요. 다음에 한 번 더 자리 잡아봐요.
[나서윤] (작게 끄덕) 네.

[CHARACTER_HIDE: 나서윤 fade]

[구윤모 모놀로그] 한 학기 인사 자리, 끝. 본인 속도대로 천천히 가시는 분이고. 그 속도 흔들지 말자.

[CHARACTER_HIDE: 윤모 fade]
[BGM_STOP fade=2]

[JUMP: ch06_h4_05_late_kakao]

---

# Scene: ch06_h4_05_late_kakao
# Hint: chapter=6, heroine=H4, time="2026-06-14 dawn"

[BG: bg_studio_room fade]
[BGM: 카톡 fade=3 volume=0.4]

[지문] 6월 14일 일요일 새벽 1시 30분. 자취방.

[CHARACTER: 윤모 center default fade]

[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 안 자세요?
- {speaker:나서윤} 오늘 시간 같이 보낸 거 한 번 더 고맙다는 말 적으려고요
- {speaker:나서윤} 시험 끝난 다음 날에 분위기 맞춰주신 게 의외였어요
[/KAKAO]

[KAKAO_TIMER: 15]
- {speaker:나서윤} 잠깐 답장 가능하시면요
[CHOICE_KAKAO]
- "안 잤어요, 오늘 자리 의미 있었어요" (정중·풀어서·빠르게) → next: ch06_h4_05b_replied  {tone:warm_supportive, key:true, mechanism:h4_reply_speed, descriptor:ch6_h4_late_kakao}
- "안 잤어요. 잘 들어가셨죠?" (짧게 빠르게) → next: ch06_h4_05b_short  {tone:direct_friendly, mechanism:h4_reply_speed}
[/CHOICE_KAKAO]

[/KAKAO_TIMER]

---

# Scene: ch06_h4_05b_replied


[FLAG: flag_h4_dawn=on_time]

[KAKAO]
- {speaker:구윤모} 안 잤어요
- {speaker:구윤모} 오늘 분위기 맞춰주셔서 감사해요
- {speaker:구윤모} 한 학기 인사 자리가 한 번 더 의미 있었어요
- {speaker:구윤모} 이렇게 또 보내주셔서 마음 가벼워졌어요
- {speaker:나서윤} 네
- {speaker:나서윤} 답장 빠른 사람 진짜 드물어요
- {speaker:나서윤} 약대 4년 동안 답장 빠른 사람 한두 명 있었는데, 다들 자기 속도만 빠르고 분위기 맞춰주는 사람은 따로였거든요
- {speaker:나서윤} 윤모씨는 둘 다 같이 가는 분이라 잠깐 무겁게 들었어요
- {speaker:나서윤} 🥺
[/KAKAO]

[구윤모 모놀로그] "답장 빠른 사람"이랑 "분위기 맞춰주는 사람"이 따로였다는 말. 시크한 분이 잠깐 풀어서 마음 한 자락 보여주셨네.


[JUMP: ch06_h4_06_close_decision]

---

# Scene: ch06_h4_05b_short

[FLAG: flag_h4_dawn=short]

[KAKAO]
- {speaker:구윤모} 안 잤어요
- {speaker:구윤모} 잘 들어가셨죠?
- {speaker:나서윤} 네
- {speaker:나서윤} 잘 들어왔어요
[/KAKAO]

[구윤모 모놀로그] 짧게 닫혔다.

[JUMP: ch06_h4_06_close_decision]

---

# Scene: ch06_h4_06_close_decision
# Hint: chapter=6, heroine=H4, time="2026-06-14 dawn"

[BGM_STOP fade=2]

[CHARACTER: 윤모 center default fade]
[BGM: 메인_테마 fade=4 volume=0.5]

[구윤모 모놀로그] 한 학기 끝. 카톡 답장 하나로 무게가 갈리는 분이라, 그 부분이 무겁다.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 윤모씨
- {speaker:나서윤} 한 학기 인사 자리 끝났는데 한 마디 더 적을게요
[/KAKAO]

[구윤모 모놀로그] 한 마디 더. 결정 직전인데, 그쪽이 먼저 꺼내신 셈이다.

[CHOICE]
- "또 봐요, 한 학기 가지고 갈게요" (호감 명시 + 마무리 좋게) → next: ch06_h4_06b_close_warm  {tone:warm_supportive, key:true, mechanism:h4_facing_key, descriptor:ch6_h4_close_reply}
- "네 잘 자요" (담담히) → next: ch06_h4_06b_close_neutral  {tone:direct_friendly}
[/CHOICE]


---

# Scene: ch06_h4_06b_close_warm


[FLAG: flag_h4_close=warm]

[KAKAO]
- {speaker:구윤모} 다음에 또 봐요
- {speaker:구윤모} 분위기 맞춰주신 거 한 학기 가지고 갈게요
- {speaker:구윤모} 시험 끝나고 한 마디 더 적어주신 마음도 같이요
- {speaker:나서윤} 네
- {speaker:나서윤} 다음에 또 봐요 윤모씨
- {speaker:나서윤} 🫶🫶
[/KAKAO]

[구윤모 모놀로그] 🫶 두 개. 평소 🥺 하나였는데, 🫶 두 개. 마무리에 호감 한 마디 보탠 게 맞았다.

[JUMP: ch06_h4_07_evaluate]

---

# Scene: ch06_h4_06b_close_neutral


[FLAG: flag_h4_close=neutral]

[KAKAO]
- {speaker:구윤모} 네
- {speaker:구윤모} 잘 자요
- {speaker:나서윤} 네
- {speaker:나서윤} 잘 자요
[/KAKAO]

[구윤모 모놀로그] 짧게 닫았다.

[JUMP: ch06_h4_07_evaluate]

---

# Scene: ch06_h4_07_evaluate
# Hint: chapter=6, heroine=H4, time="2026-06-14 dawn — branch evaluation"

[BG: black fade=3]
[BGM_STOP fade=2]

[지문] — 본과 1학년 봄, 약대 4학년 마지막. 학번 동기에 한 살 위. 한 학기 인사 자리.

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

[지문] 2026년 6월 27일 토요일 오후 2시. 계명대 성서 캠퍼스. 약대 마지막 보강 종료 직후.

[CHARACTER: 윤모 center smile fade]

[구윤모 모놀로그] 6월 말 토요일. 약대 마지막 보강이 오늘 끝났다고 어제 카톡으로 들었다.

[CHARACTER: 나서윤 right warm fade]

[VIDEO: video_true_seoyoon]

[CG: cg_seoyoon_true show]

[지문] 계명대 성서 캠퍼스 학생회관 앞 벚꽃길. 나서윤이 약대 가운 차림으로 가방을 어깨에 메고 한 손엔 교재 한 권. 햇살에 긴 갈색 웨이브 머리가 한층 빛나고, 평소 시크함 안에선 본 적 없던 환한 미소가 입가에 닿아 있다.

[CG_HIDE]

[나서윤] (시선 들며 옅은 미소) 윤모씨.
[구윤모] 안녕하세요. 약대 마지막 보강 끝나신 거 축하드려요.
[나서윤] 네. 4년 마무리예요.

[나서윤] 윤모씨. 한 학기 카톡 하면서 한 가지 깨달은 게 있어서 적으려고요.
[구윤모] (시선 옆으로) 네, 들을게요.
[나서윤] (살짝 미소) 답장 빠르게 해줘서 고마워, 윤모야.

[CHARACTER: 윤모 center blush fade]

[구윤모] (살짝 흠칫) ...어. 이름 부르신 거 처음이에요.
[나서윤] 한 학기 같이 견딘 사이니까 한 번쯤은 해도 될 거라 봤어요.
[나서윤] 답장 빠른 사람 진짜 드물어요. 4년 동안 한 명도 없었거든요. 분위기 맞춰주는 사람도 드물고. 둘이 같이 가는 사람은 윤모씨가 처음이었어요.

[구윤모 모놀로그] 이름을 부른다는 게... 이렇게 무겁고 또 가벼울 수 있구나. 봄 내내 정중한 거리에 계셨던 분이, 처음으로 그 선을 넘어주셨다.

[구윤모] 서윤씨.
[나서윤] (작게) 응.
[구윤모] 한 학기 분위기 맞춰주신 거 진짜 감사했어요. 봄 끝에 떠올린 사람들 중에, 서윤씨가 제일 천천히 가는 분이었어요. 그 속도 같이 가는 게 맞다 싶었어요.
[나서윤] (옅은 미소) 그 마음 받을게요. 다음 학기엔 답장 좀 더 빨리 보내볼게요.
[구윤모] (피식) 그건 본인 속도대로 가셔도 돼요. 속도 흔들지 말자고 했잖아요.
[나서윤] (짧게 웃으며) 그 말도 잘 받았어요.

[나서윤] 한 학기 더 가요. 윤모야.
[구윤모] 네. 한 학기 더 가요. 서윤씨.

[BGM: 클라이맥스 fade=2 volume=0.7]

[CHARACTER: 윤모 center smile fade]
[CHARACTER: 나서윤 right smile_full fade]

[BG: black fade=4]

[지문] — 끝.

[지문] **나서윤 트루 엔딩 — 성서의 봄**

[ENDING: END_H4_TRUE]

---

# Scene: ch06_h4_normal
# Hint: chapter=6, heroine=H4, ending=NORMAL, time="2026-06-21 afternoon"

[BG: bg_kmu_main fade=3]
[BGM: 일상 fade=3 volume=0.4]

[지문] 2026년 6월 21일 일요일 오후. 데이트 후 한 주 지난 시점.

[CHARACTER: 윤모 center default fade]

[구윤모 모놀로그] 6월 둘째 주가 끝나고 한 주 지났다. 카톡 빈도가 조금씩 줄어들었다. 본인 속도 그대로.

[SFX: 카톡_알림]

[KAKAO]
- {speaker:나서윤} 윤모씨
- {speaker:나서윤} 약대 마지막 보강 다음 주에 끝나요
- {speaker:나서윤} 그 다음 시험 끝나고 한 번 더 봬요
- {speaker:나서윤} 🥺
[/KAKAO]

[구윤모 모놀로그] "다음 시험 끝나고 봬요." 한 학기 안에 결정짓는 게 아니라, 다음 학기로 미루는 분위기다.

[KAKAO]
- {speaker:구윤모} 네 다음 시험 끝나고 봬요
- {speaker:구윤모} 무리 마시고요
- {speaker:나서윤} 네
[/KAKAO]

[CHARACTER: 윤모 center default fade]

[CG: cg_seoyoon_date show]

[지문] 캠퍼스 카페 창가. 데이트 자리에서 봤던 옆모습이 살짝 어두워진 채로 다시 떠오른다.

[CG_HIDE]

[구윤모 모놀로그] 느리게 가는 인연도 있는 거니까. 한 학기 안에 결정 못 하는 사람도 있고.
[구윤모 모놀로그] 다음 학기에 한 번 더 봤을 때 같이 갈 수 있을지는, 그때 가서 정할 일이고.

[BGM: 일상 fade=3 volume=0.5]

[BG: black fade=3]

[지문] — 끝.

[지문] **나서윤 노멀 엔딩 — 느린 답장**

[ENDING: END_H4_NORMAL]

---

# Scene: ch06_h4_reject
# Hint: chapter=6, heroine=H4, ending=REJECT, time="2026-06-14 morning"

[BG: black]
[BGM: 슬픔 fade=4 volume=0.6]
[SFX: 카톡_알림]

[KAKAO mode=dm heroine=H4 unreadFadeMs=400]
- {speaker:나서윤, preTyping1:1000, prePause:600, preTyping2:800} 답장이 너무 늦어서 미안해ㅠㅠ
- {speaker:나서윤, preTyping1:600} 그날 만나서 얘기하고 시간 잘 보냈는데
- {speaker:나서윤, prePause:600, preTyping2:500} 더 진행하기엔 무리가 있을거 같아..
- {speaker:나서윤, preTyping1:800, prePause:1000, preTyping2:3000} 좋은 인연 만나길 바랄게 🥺🥺
[/KAKAO]

[ENDING: END_H4_REJECT]
