---
module: video-list
hierarchy: 3
depends-on:
  - 04-image-prompts/PROMPT-GUIDE.md
  - 04-image-prompts/event-cgs/cg-list.md
  - 02-characters/heroines/H1~H5
outputs:
  - VEO 3.1 Fast 영상 12개 프롬프트
status: review
---

# 04-image-prompts/veo-videos/video-list.md

> VEO 3.1 Fast: 5~7초 영상, 16:9, 음성 X (BGM은 게임에서 별도).
> **이미지 → 영상 워크플로 권장**: 해당 CG 또는 스프라이트를 reference로 첨부 + "make this still image come to life" 형태.

## 공통 STYLE 라인

```
soft anime / K-drama cinematic style, gentle cinematic camera movement,
natural facial micro-movements, subtle hair / clothing motion,
warm cinematic color grade, no audio, smooth 24fps motion,
no text appears, no watermark visible
```

## 카메라 무빙 가이드

- 빠른 줌 X, 빠른 팬 X, 흔들림 X (12세 + 멀미 방지)
- OK: slow zoom in / static + subject motion / slow pan / soft parallax
- 시작 0~1초: subject's stillness or initial pose
- 1~5초: micro motion (눈 깜빡임, 고개 살짝 움직임, 머리 흩날림)
- 5~7초: 결정적 표정 변화 (e.g., 시선 들어 미소)

---

## 1. `video_opening.mp4` — 오프닝 (7초)

```
SCENE: Title sequence opening.
0–2 sec: silhouettes of 5 female heroines fade in one by one against pastel pink background, each in a distinct pose (left to right: Cha Serin in lab coat, Yoon Hajeong with arms crossed, Han Seol with glasses, Na Seoyoon with handbag, Jang Yuna with energetic wave). Silhouettes only, faces obscured by pink light glow.
2–5 sec: soft white camera flash dissolves silhouettes; in their place stands Goo Yunmo (protagonist) in his medical gown, slight smile, looking directly at camera, cherry blossom petals drifting from above
5–7 sec: slow zoom in on Yunmo's face as title text would appear (engine renders title text — leave space)
COLOR: pastel pink dominant, warm cherry blossom mood
PACING: dreamy, slightly stylized, K-drama opening sequence vibe
```

---

## 2. `video_meet_serin.mp4` — H1 첫 만남 (5초)

```
REFERENCE IMAGE: cg_serin_first_meet.webp
SCENE: hospital corridor, late afternoon
0–1 sec: Cha Serin walking toward camera, holding clipboard, slight surprised expression as she nearly bumps into someone (POV)
1–3 sec: she stops, takes half-step back, blinks twice, slight tired-but-kind smile forms
3–5 sec: subtle hair movement, she gives a small "are you alright?" tilt of head, then slow zoom in on her warm soft smile
ACTION: gentle facial micro-motion, no large body motion, hair slight sway
LIGHTING: warm golden hour through window at end of hall
```

---

## 3. `video_meet_hajeong.mp4` — H2 첫 만남 (5초)

```
REFERENCE IMAGE: hajeong_default.webp + bg_lecture_day.webp
SCENE: lecture hall, anatomy team assignment announcement
0–2 sec: Yoon Hajeong sitting at desk, glances up from notebook with mild expression, eye contact with viewer
2–4 sec: she tilts her head slightly, brief faint nod ("oh, you"), barely-there acknowledgment
4–5 sec: she returns gaze to notebook, but corner of mouth twitches in suppressed smile (very subtle tsundere moment)
ACTION: minimal motion, head tilt + facial micro-expressions
LIGHTING: bright daylight from windows
```

---

## 4. `video_meet_seol.mp4` — H3 첫 만남 (5초)

```
REFERENCE IMAGE: seol_default.webp + bg_anatomy_lab.webp (or biochem lab variant)
SCENE: biochemistry lab, first practical class
0–1 sec: Han Seol standing at lab counter, glasses on, hands organizing equipment
1–2 sec: SOUND BREAK — visible reaction to glass dropping somewhere (out of frame), slight startled lift of head
2–4 sec: she sets down clipboard with composed expression, walks gently a step toward camera
4–5 sec: gives a calm reassuring slight smile, small nod ("it's fine, don't worry")
ACTION: subtle calm professional motion, controlled
LIGHTING: clean fluorescent + warm desk lamp
```

---

## 5. `video_meet_seoyoon.mp4` — H4 첫 만남 (5초)

```
REFERENCE IMAGE: cg_seoyoon_first_meet.webp
SCENE: Keimyung University Seongseo campus, late spring afternoon, chance encounter near the pharmacy school entrance / library walkway (the same shared campus as the medical school)
0–2 sec: Na Seoyoon in profile, glancing elsewhere along the campus path, slim takeaway coffee cup held loosely in one hand, distant cool expression, soft cherry blossom petals drifting around her
2–4 sec: she slowly turns her gaze toward camera (POV — Yunmo passing by on the same campus), expression unchanged for a beat, then very subtle softening — corner of lip lifts faintly (1mm smile)
4–5 sec: she lifts her cup a little as if in casual recognition, holds eye contact, then breaks gaze back toward the campus walkway
ACTION: minimal, deliberate slow motion — channeling chic distance with a hint of "oh, you're on the same campus"
LIGHTING: late-afternoon golden hour through campus trees + soft warm bokeh of the academic building behind her
```

---

## 6. `video_meet_yuna.mp4` — H5 첫 만남 (5초)

```
REFERENCE IMAGE: cg_yuna_booth.webp
SCENE: outdoor club recruiting booth, sunny afternoon
0–1 sec: Jang Yuna standing at booth, mid-conversation with someone offscreen
1–3 sec: she spots viewer, eyes light up, breaks into wide bright smile, both hands raise in waving motion, hops a little in place
3–5 sec: she calls out "선배님!" (mouth shape only — no audio), bright excited expression with both hands cupped near mouth in calling gesture
ACTION: high energy, spring-in-step motion, very animated
LIGHTING: bright sunny afternoon, warm direct sunlight
```

---

## 7. `video_true_serin.mp4` — H1 트루엔딩 (7초)

```
REFERENCE IMAGE: cg_serin_true.webp
SCENE: bright morning cafe in Bundang
0–2 sec: Cha Serin sitting at cafe window seat, hands holding tea cup, gaze on cup with soft thoughtful expression
2–4 sec: she slowly lifts her gaze to camera, eyes meet, slow warm smile begins
4–6 sec: smile fully forms — softer, more relaxed than ever before, slight head tilt, gentle wind ripples her hair
6–7 sec: she mouths something soft (no audio, lip read suggests "왔구나" / "you came") and slow zoom in on her warm face
ACTION: gentle, intimate, slow build of emotion
LIGHTING: bright morning sun streaming from left, warm golden tones
```

---

## 8. `video_true_hajeong.mp4` — H2 트루엔딩 (7초)

```
REFERENCE IMAGE: cg_hajeong_true.webp
SCENE: KTX station platform, spring morning
0–2 sec: Yoon Hajeong standing with carry-on, looking down at her feet, neutral expression
2–4 sec: hears something offscreen, lifts head, eyes widen briefly, then full warm genuine smile breaks through her usual composure
4–6 sec: she lifts hand to wave, hair flowing in wind, cherry blossom petals drift past
6–7 sec: she mouths "안녕" (lip read), slow zoom in on her radiant smile
ACTION: emotional crescendo from reserved to fully open
LIGHTING: bright morning, blossom petals creating soft bokeh
```

---

## 9. `video_true_seol.mp4` — H3 트루엔딩 (7초)

```
REFERENCE IMAGE: cg_seol_true.webp
SCENE: PhD office, late afternoon golden hour
0–2 sec: Han Seol sitting at desk holding finished thesis, glasses on top of head, gazing at it with quiet emotion
2–4 sec: she places thesis down gently, takes deep breath, hand wipes a single tear at corner of eye
4–6 sec: she lifts head toward camera, gives the most relaxed warm smile yet, then tilts head with a small laugh
6–7 sec: slow zoom in on her smile, golden hour light intensifies
ACTION: triumph + emotional release, controlled but deeply felt
LIGHTING: rich golden hour through window
```

---

## 10. `video_true_seoyoon.mp4` — H4 트루엔딩 (7초)

```
REFERENCE IMAGE: cg_seoyoon_true.webp
SCENE: Keimyung University Seongseo campus, in front of the pharmacy school building (same shared campus as the medical school), spring afternoon
0–2 sec: Na Seoyoon standing in front of the pharmacy school building, glasses on, looking down at phone with faint smile, the student union / cherry blossom path suggested in soft focus behind her
2–4 sec: she puts phone in bag, looks up to find viewer, eyes brighten — full open smile (extremely rare for her)
4–6 sec: she takes a step forward, hand brushes hair behind ear, soft laugh, head shake
6–7 sec: cherry blossom petals drift past, slow zoom in on her unguarded warm face
ACTION: walls coming down, transformation from chic to vulnerable
LIGHTING: bright spring afternoon, soft pink-tinted light
```

---

## 11. `video_true_yuna.mp4` — H5 트루엔딩 (7초)

```
REFERENCE IMAGE: cg_yuna_true.webp
SCENE: cherry blossom path on campus
0–2 sec: Jang Yuna standing on path, blossoms drifting around her, surprised soft expression
2–4 sec: her face breaks into bright laughing smile, she begins to run a few steps toward camera
4–6 sec: she stops just short of viewer, both hands raised, then gentle hug motion (arms wrap around viewer-perspective in a wholesome G-rated embrace)
6–7 sec: pulls back slightly, looks up with sparkling eyes, mouth forms soft "선배" (lip read)
ACTION: full youthful joyful explosion of emotion
LIGHTING: dappled golden afternoon, blossoms creating dreamy snowfall effect
```
> ⚠️ 12세 등급: hug는 친근한 포옹까지만, 키스 X.

---

## 12. `video_reject_seoyoon.mp4` — 거절 엔딩 (7초) ⚠️ 핵심

```
SCENE: dim room at night, no character visible
0–2 sec: smartphone lying screen-up on a desk or pillow, KakaoTalk-style chat interface visible (no readable original Kakao branding), single notification light blink
2–5 sec: camera slowly pulls back to reveal raindrops streaking down a window in soft focus background, blue moonlight, cold tone
5–7 sec: camera continues pull-back, phone screen begins to dim/fade, raindrops continue, melancholy fade-out toward black
ACTION: pure environmental motion — rain, light, camera pull-back. NO character, NO text rendered (engine handles text).
LIGHTING: cold blue moonlight + single warm screen glow fading
COLOR: desaturated blue-grey palette, melancholy
```
> 게임 엔진이 카톡 텍스트(마스터 플랜 §4.3 정확한 카톡 문구)를 별도 모달로 렌더. 영상은 분위기만.

---

## 영상 후처리 (사용자 작업)

- VEO 출력: 보통 mp4
- **인코딩: H.264 mp4 단일** (2026-05-06 W6 성능 최적화 라운드 PM 결정 (a) 옵션). WebM(VP9) 폴백은 빌드 크기 문제(99MB → 50MB로 절감)로 제거 — H.264 mp4는 모든 모던 브라우저(Chrome/Edge/Safari/Firefox 모바일 포함) 지원하므로 폴백 불필요.
- 압축: ffmpeg로 비트레이트 2~4Mbps 정도로 다운스케일 (게임 빌드 크기 관리)

```bash
# 예시 ffmpeg 명령 (mp4 단일 인코딩)
ffmpeg -i video_meet_serin_raw.mp4 -c:v libx264 -crf 24 -preset slow \
  -c:a aac -b:a 128k -movflags +faststart \
  video_meet_serin.mp4
```

> **이력 (2026-05-06 W6 성능 최적화 라운드 이전)**: 라운드 3 자산 통합(2026-05-06)에서 mp4 + webm 듀얼 인코딩으로 24개 파일 배치(총 99MB). W6 성능 최적화에서 빌드 크기 144MB(MASTER-PLAN §8.2 < 50MB 목표 2.88x 초과) 분석 결과 webm 12개 50MB 제거로 결정. 듀얼 인코딩은 옛 권장(2010년대 IE/구형 모바일)으로 현 시점 mp4 단일이 표준.

## 사용자 검증

- [ ] 12개 영상 분배 (오프닝1 + 첫만남5 + 트루5 + 거절1) OK?
- [ ] 거절 영상 무인물 컨셉 적정?
- [ ] 12세 등급 가드레일 (포옹까지만, 키스 X) OK?
