---
module: palJeongPot/06-lee-mungyu (시놉시스 초안)
hierarchy: 3
depends-on:
  - 03-story/scenarios/compressed/ch06_h4_seoyoon.md
  - 03-story/scenarios/compressed/ch06_h5_yuna.md
  - 03-story/scenarios/compressed/end_solo_summer.md
outputs:
  - 이문규 분담: Ch.6 H4·H5 + 단독 엔딩 (~1,000자)
status: draft
---

# ⑥ 이문규 — Ch.6 H4 나서윤 + H5 장윤영 + 단독 엔딩

**구간**: `ch06_h4_*` + `ch06_h5_*` + `end_solo_summer_main`
**보존 의무**: H4 KAKAO_TIMER 10초 (4_03·4_05 등) + late_reply_count 평가 체인, REJECT 8단계 카톡(텍스트 변경 금지), H5 SOLO 폴백, ENDING ID(END_H4_TRUE/NORMAL/REJECT, END_H5_TRUE, END_SOLO_SUMMER), CG `cg_seoyoon_date/true/reject`, VIDEO `video_true_seoyoon/reject_seoyoon`, KAKAO/CHOICE/FLAG/JUMP

---

**H4 나서윤 (TRUE/NORMAL/REJECT 3종, BAD 자리 REJECT 흡수)**. 6월 1일 자취방 1:1 카톡, "MT 부엌 정리 한 번 더 고마웠어요 🥺." 6월 둘째 주 금요일 축제 자리 약속. **선택지**: "시험 끝나고 시간 봐요, 응원할게요" (warm) / "부담 없어요, 메시지 받을게요" (neutral). 약대 가운 사진 카톡 후 어른스러운 분위기 반응 **10초 타이머**. 동성로 카페 데이트(**CG: cg_seoyoon_date**): "한 학기 인사 자리." **선택지**: "시간 내주셔서 감사해요" (distance, +5) / "한 번 더 봬도 될까요" (direct) / "한 잔 더 하시고 저녁까지" (push). 새벽 카톡 10초 타이머 2회. 마지막 카톡 "다음에 또 봐요 🫶🫶." **평가 체인**: `late_reply_count >= 2 → REJECT` 우선, 그 다음 `H4 < 60 → REJECT` / `< 70 → NORMAL` / `≥70 + key≥3 + late=0 → TRUE`. **TRUE**: 6월 27일 성서 캠퍼스 벚꽃길, 호칭 "서윤이." **NORMAL**: 6월 21일 카톡, "다음 시험 끝나고 봬요." **REJECT**: 8단계 카톡 자동 루틴(텍스트 변경 금지) "답장이 너무 늦어서 미안해ㅠㅠ ... 좋은 인연 만나길 바랄게 🥺🥺."

**H5 장윤영 (TRUE 1종, 미달 시 SOLO 폴백)**. 6월 1일 축제 응원 막대 두 개 "정중히 받을게" (take, +5) → 동아리 행사 30분 동행 → 도서관 앞 9시 5분 → 자정 카톡 "자야 돼 너도 자" (sleep, 두 번째, +5) 🥹🥹 → 6월 7일 벚꽃길 호칭 "선배 → 오빠"로 풀이 (full, +5). **TRUE**: 인천 본가 일주일 다녀와 캠퍼스 벚꽃길, 호칭 "오빠" 자리 잡음, "다음 학기도 가요 여름에도." 호감도<70 또는 키<3: SOLO 폴백.

**단독 엔딩 — 혼자 여름방학 (END_SOLO_SUMMER, 16번째)**. 6월 27일 토요일 저녁 9시 자취방. 다섯 명 한 줄씩 회상: 차세린(ㅎ 한 번, 7살 차이), 윤하정("그건 정확히는," 도서관 옆자리), 한설(컵라면 식어감, 5살 차이), 나서윤(🥺, 답장 속도 못 맞춤), 장윤영(✨🥹, 9시 5분, 한 발짝 미뤄짐). 분당 본가 회상. "다섯 명 모두 거기서 더는 가까워지지 못했다." 친구 단톡 "한판 ㄱ?" "ㅇㅋ 본가 갔다 와서 ㄱ." "그래도 본과 1학년 봄, 좋은 봄이었지. 여름방학 두 달 천천히 정리하고, 본과 2학년 가서 다시 만나 보자." → 끝.
