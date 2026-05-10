---
module: sprite-list
hierarchy: 3
depends-on:
  - 04-image-prompts/PROMPT-GUIDE.md
  - 02-characters/goo-yunmo.md
  - 02-characters/heroines/H1~H5
outputs:
  - 캐릭터 스프라이트 48종 + 의상 변형 ~15 = 약 63장 프롬프트
status: review
---

# 04-image-prompts/sprites/sprite-list.md

> 모든 스프라이트는 **9:16 (1080×1920), 단일 캐릭터, 투명 또는 단색 배경**.
> 캐릭터 락은 PROMPT-GUIDE.md §4 참조. **첫 default 결과물을 reference로 후속 프롬프트에 첨부.**

## 캐릭터 0. 구윤모 (PROTAGONIST)

### 공통 캐릭터 락
```
[CHARACTER LOCK: GU YUNMO]
- Korean male university student, age 22
- short clean black dandy haircut, slightly tousled on top
- average build, lean, height suggestion 175cm
- single eyelid eyes, warm dark brown iris
- soft jawline, kind face
- clear pale skin
- white short medical school gown over plain navy t-shirt and dark jeans
- always: same face, same hairstyle, same outfit unless specified
```

### 8종 스프라이트

#### 1. `yunmo_default.webp`
```
SUBJECT: Korean male medical student in his early 20s, [CHARACTER LOCK: GU YUNMO]
POSE/EXPRESSION: standing relaxed, slight neutral smile, looking forward, hands by sides
CLOTHING: short white medical school gown over navy t-shirt, dark jeans
SETTING: isolated against soft pastel pink #FFE4EC background, full upper body to mid-thigh visible, centered composition
STYLE: soft anime illustration, K-drama poster aesthetic, gentle pastel palette, clean linework, painterly skin tones, natural daylight, high detail, sharp focus, no text or logos, no signature
NEGATIVE: extra fingers, deformed hands, wonky eyes, asymmetric face, blurry, watermark, multiple characters
```

#### 2. `yunmo_smile.webp`
같은 캐릭터 락, **EXPRESSION만 변경**: warm genuine smile, eyes slightly crinkled, friendly look

#### 3. `yunmo_blush.webp`
EXPRESSION: soft blush across cheeks, slightly bashful smile, looking down a little, embarrassed warmth

#### 4. `yunmo_panic.webp`
EXPRESSION: panicked, sweat drop on forehead, eyes wide, mouth slightly open, hand near face

#### 5. `yunmo_serious.webp`
EXPRESSION: serious focused expression, slightly furrowed brow, mouth firm, eyes determined

#### 6. `yunmo_sad.webp`
EXPRESSION: sad downcast expression, eyes lowered, soft frown, hand near chest

#### 7. `yunmo_perv.webp` (변태 망상 시작)
EXPRESSION: glazed dreamy eyes (NOT lewd, just unfocused-daydreaming), slight smirk, eyebrows raised, lost in thought
> ⚠️ 12세 등급: 눈빛만 풀린 정도, 음란한 표정 X. "공상에 빠진 코믹한 표정"으로 명시.

#### 8. `yunmo_recover.webp` (자기자각)
EXPRESSION: shocked self-awareness, wide alert eyes, hand slapping own forehead, comedic "snap out of it" face

---

## 캐릭터 1. 차세린 (H1)

### 공통 캐릭터 락
```
[CHARACTER LOCK: CHA SERIN]
- Korean female resident doctor, age 29
- medium-length dark brown hair to shoulder, side parting, slightly wavy
- height suggestion 167cm, slim
- almond-shaped eyes, slight tired-looking eyelids, warm brown iris
- elegant nose, soft lip line
- pale clean skin, hint of fatigue under eyes
- white doctor's coat over teal scrubs (default)
- mature elegant aura
```

### 8종 + 의상 2종 = 10장
- `serin_default.webp` — 평소, 살짝 피곤한 부드러운 표정
- `serin_smile.webp` — 부드러운 미소
- `serin_blush.webp` — 살짝 홍조 (드뭄)
- `serin_tired.webp` — 피곤 (눈 반쯤 감김, 입꼬리 살짝 올라감)
- `serin_serious.webp` — 진지 (학술 모드, 눈빛 또렷)
- `serin_surprised.webp` — 놀람 (눈 약간 커짐)
- `serin_concerned.webp` — 걱정스러운 표정
- `serin_smile_warm.webp` — 따뜻한 미소 (트루 한정)
- `serin_outfit_casual.webp` — 의상 변형: beige shirt dress, casual setting, default expression
- `serin_outfit_winter_coat.webp` — 의상 변형: beige trench coat over white blouse, outdoor setting

각 프롬프트 본체는 위 yunmo와 같은 형식. STYLE/NEGATIVE는 PROMPT-GUIDE.md 공통 라인 사용.

---

## 캐릭터 2. 윤하정 (H2)

### 공통 캐릭터 락
```
[CHARACTER LOCK: YOON HAJEONG]
- Korean female medical student, age 22
- long straight black hair to mid-back, simple center parting, slight retro vibe
- height suggestion 165cm, slim build
- double eyelid almond eyes, dark brown iris, sharp gaze
- delicate nose, neutral lip line
- pale clean skin
- casual: cream knit sweater + blue jeans (default)
- reserved tsundere aura, often blank expression
```

### 8종 + 의상 2종
- `hajeong_default.webp` — 평소, 살짝 무표정
- `hajeong_smile_small.webp` — 옅은 미소
- `hajeong_blush.webp` — 홍조
- `hajeong_pout.webp` — 삐짐 (입 살짝 내밂)
- `hajeong_serious.webp` — 진지 (시험 모드)
- `hajeong_panic.webp` — 당황
- `hajeong_drunk.webp` — 술 마신 직후 (발그레한 양 볼, 눈 풀린 듯)
- `hajeong_warm_smile.webp` — 따뜻한 미소 (트루 한정)
- `hajeong_outfit_lab_coat.webp` — 흰 가운 + 마스크 들고 있음 (해부 실습)
- `hajeong_outfit_party.webp` — 회식용 베이지 블라우스

---

## 캐릭터 3. 한설 (H3)

### 공통 캐릭터 락
```
[CHARACTER LOCK: HAN SEOL]
- Korean female PhD candidate / TA, age 27
- short bob hair to chin with side parting, jet black, neatly tucked
- height suggestion 162cm, slim
- single eyelid almond eyes behind black square frame glasses, dark brown iris
- delicate nose, calm lip line
- pale skin
- white lab coat over black turtleneck (default with glasses)
- quiet scholarly aura
```

### 8종 + 의상 2종
- `seol_default.webp` — 평소 (안경 + 무표정)
- `seol_smile_slight.webp` — 살짝 미소 (안경 유지)
- `seol_no_glasses.webp` — 안경 벗음 (갭 포인트, 더 부드러워 보임)
- `seol_tired.webp` — 피곤 (한숨 표정)
- `seol_serious.webp` — 진지 (실험 모드)
- `seol_blush.webp` — 홍조 (드뭄)
- `seol_concerned.webp` — 걱정
- `seol_warm_smile.webp` — 따뜻한 미소 (트루)
- `seol_outfit_casual.webp` — 베이지 카디건 + 슬랙스 (Ch.6)
- `seol_outfit_lab_late.webp` — 가운 살짝 흐트러진 야간 버전, 머리 살짝 풀림

---

## 캐릭터 4. 나서윤 (H4)

### 공통 캐릭터 락
```
[CHARACTER LOCK: NA SEOYOON]
- Korean female pharmacy student, age 23
- long wavy hair to upper back, dark brown with subtle highlights
- height suggestion 168cm, slim
- double eyelid sharp almond eyes, dark brown iris, slightly distant gaze
- well-defined nose, glossy neutral lip
- pale clean skin, modern urban makeup
- crisp white shirt + slim black slacks + small handbag (default)
- chic distant aura
```

### 8종 + 의상 2종
- `seoyoon_default.webp` — 평소 (도도)
- `seoyoon_smile_slight.webp` — 살짝 미소
- `seoyoon_smile_full.webp` — 환한 미소 (드뭄, 트루)
- `seoyoon_blush.webp` — 홍조
- `seoyoon_serious.webp` — 진지
- `seoyoon_distant.webp` — 거리감 (거절 분기, 눈빛 차가움)
- `seoyoon_thinking.webp` — 생각 잠김 (시선 비스듬히)
- `seoyoon_warm.webp` — 따뜻함 (트루)
- `seoyoon_outfit_date.webp` — 베이지 코트 + 미니 원피스 (데이트)
- `seoyoon_outfit_school.webp` — 약대 흰 가운 + 안경 (트루 분기)

---

## 캐릭터 5. 장윤영 (H5)

> 한글 표기: **장윤영**. 영문/자산 ID(`yuna_*`)는 호환성 위해 그대로 유지 (CHANGELOG 2026-04-28 라운드 1 §3 명시).

### 공통 캐릭터 락
```
[CHARACTER LOCK: JANG YUNA]
- Korean female pre-med sophomore, age 20
- long natural wavy brown hair to mid-back, soft layered
- height suggestion 170cm, slim taller build
- double eyelid bright almond eyes, light brown iris, sparkling gaze
- defined eyebrows, full lip with subtle gloss
- bright clear skin, fresh youthful makeup
- crop top + light blue jeans (default), casual girlish vibe
- bright energetic aura
```

### 8종 + 의상 2종
- `yuna_default.webp` — 평소 (밝음)
- `yuna_smile_big.webp` — 환한 미소
- `yuna_blush.webp` — 홍조
- `yuna_pout.webp` — 토라짐 (귀여움)
- `yuna_excited.webp` — 흥분/들뜸 (양손 모은 자세)
- `yuna_sad.webp` — 슬픔 (드뭄)
- `yuna_serious.webp` — 진지 (드뭄)
- `yuna_warm_smile.webp` — 따뜻한 미소 (트루)
- `yuna_outfit_dress.webp` — 미니 원피스 (Ch.5)
- `yuna_outfit_festival.webp` — 한복 또는 행사 유니폼 (Ch.6)

---

## 통계

- 캐릭터 6명 × 8 표정 = **48장**
- 의상 변형: 2 + 2 + 2 + 2 + 2 + 2 = **12장 + 구윤모 0** = 약 12장
- **총합 약 60장** (마스터 플랜 §6.2 = 약 63장 ≈ 일치)

## 사용자 작업 가이드

1. PROMPT-GUIDE.md §11 워크플로 따름
2. 각 캐릭터의 default 먼저 → 마음에 들 때까지 재생성
3. default 이미지 자체를 reference로 다음 7개 생성
4. 의상 변형도 마찬가지

## 사용자 검증

- [ ] 캐릭터 락 텍스트가 5명 모두 시각 모티브에 부합?
- [ ] 의상 변형 수량 OK (히로인당 2개 + 메인 1개)?
- [ ] 12세 등급 가드레일 어긋난 부분 없음?
