---
module: PROMPT-GUIDE
hierarchy: 3
depends-on:
  - 00-master/MASTER-PLAN.md
  - 02-characters/heroines/*
  - 05-ui-design/UI-SPEC.md
outputs:
  - 모든 이미지/영상 프롬프트의 공통 규칙
  - 워터마크 가림 영역 명세
  - 캐릭터 일관성 유지 규칙
status: draft
---

# 04-image-prompts/PROMPT-GUIDE.md

> Gemini Nano Banana 2 (이미지) + VEO 3.1 Fast (영상) 프롬프트 작성 시 따라야 할 공통 규칙.
> 이 문서가 모든 04-image-prompts/ 하위 .md의 부모 규칙이다.

## 1. 이미지 종류별 비율·치수

| 종류 | 비율 | 권장 입력 치수 | 게임 내 사용 치수 |
|---|---|---|---|
| 캐릭터 스프라이트 | 9:16 | 1080×1920 | 540×960 (모바일) / 1080×1920 (PC) |
| 배경 (BG) | 16:9 | 1920×1080 | 1920×1080 (그대로) |
| 이벤트 CG | 16:9 | 1920×1080 | 1920×1080 |
| VEO 영상 | 16:9 | 1920×1080 5~7초 | mp4/webm |
| 카톡 모달 배경 | 9:16 | 540×960 | 모바일 우선 |

## 2. 워터마크 가림 영역 (확정)

Gemini 워터마크는 보통 **이미지 우측 하단 90×90 ~ 120×120 픽셀** 영역에 위치.
게임 텍스트박스가 이를 가린다 (UI-SPEC.md §5.2).

### 2.1 BG / 이벤트 CG (16:9, 1920×1080)
- **하단 28% (height: 302px)는 텍스트박스로 가려짐**
- 즉, **상단 1920×778 영역에만 시각 정보 집중**
- 워터마크는 자연스럽게 텍스트박스 뒤에 들어감

### 2.2 캐릭터 스프라이트 (9:16, 1080×1920)
- 캐릭터의 **상반신·얼굴**이 상단 60% (1080×1152)에 위치하도록
- 워터마크는 하단에 들어가는데, 캐릭터 다리 부분에 겹치므로 시각적 영향 최소
- 게임 내 스프라이트는 **보통 화면 좌·우에 60~80% 스케일로 배치**되어 워터마크가 화면 밖으로 나감

### 2.3 CG 갤러리용 풀스크린 버전
- 게임 본편에서는 워터마크 무시 (텍스트박스가 가림)
- CG 갤러리에서 풀스크린 보기 시: **별도로 자른(crop) 버전 사용**
- 파일명: `cg_xxx_full.webp` (워터마크 영역 제외하고 자른 버전)
- 예: 1920×1080 원본 → 1920×950 정도로 하단을 잘라 갤러리에 사용

## 3. 프롬프트 구조 (공통)

모든 프롬프트는 다음 5개 섹션으로 구성:

```
1. SUBJECT (피사체 / 캐릭터)
2. POSE / EXPRESSION (포즈·표정)
3. CLOTHING (의상)
4. SETTING (배경/조명)
5. STYLE (화풍/품질)
```

### 3.1 STYLE 공통 라인 (모든 프롬프트에 포함)

```
soft anime illustration, K-drama poster aesthetic, gentle pastel palette,
clean linework, painterly skin tones, natural daylight unless specified,
high detail, sharp focus, no text or logos, no signature, professional artwork,
muted background to keep subject clear
```

> ⚠️ "no text or logos, no signature" 명시 — Gemini가 추가 텍스트 안 그리게 유도.
> (워터마크는 이걸로도 100% 막을 수 없음 → §2 가림 전략 병행)

### 3.2 NEGATIVE PROMPT (모든 캐릭터 프롬프트에 포함)

```
NOT: extra fingers, deformed hands, wonky eyes, asymmetric face,
blurry, low quality, watermark, signature, text, ugly, distorted,
plastic skin, oversharp, NSFW, exposed cleavage beyond casual,
photorealistic uncanny, multiple characters unless specified
```

## 4. 캐릭터 일관성 규칙

같은 캐릭터의 8종 스프라이트 + 의상 변형 + 이벤트 CG에서 **얼굴 일관성**이 핵심.

### 4.1 캐릭터 시드 락 (Seed Lock)

각 히로인마다 **첫 스프라이트(default)를 시드로 설정**하고, 이후 모든 프롬프트에 다음을 명시:

```
[CHARACTER LOCK: HEROINE_NAME]
- exact same face as previous renders
- exact same hair: [정확한 묘사 from heroine .md]
- exact same eye color: [색]
- exact same skin tone: [색]
- exact same nose/lip/jaw shape
- ONLY change: expression, pose, lighting per this prompt
```

### 4.2 Gemini 워크플로 (사용자 작업)

1. H1 default부터 생성 → 마음에 들 때까지 N회 재생성
2. 마음에 든 결과물의 **이미지 자체를 다음 프롬프트의 reference로 첨부**
3. "use this character's exact face, change only [표정/의상]" 형태로 변형
4. 8종 표정 + 의상 변형 모두 같은 face reference 사용

→ Gemini Nano Banana 2의 멀티모달 입력 활용 (이미지 + 텍스트)

## 5. 캐릭터 단일성 (스프라이트는 1인)

스프라이트는 반드시 **단일 캐릭터, 투명 배경에 가까운 단색**.
프롬프트에 명시:
```
single character only, isolated against soft pastel pink background,
full upper body to mid-thigh visible, centered composition
```

> ⚠️ 투명 PNG는 Gemini가 직접 못 만들 수 있음 → 단색 배경으로 받은 뒤 사용자가 후처리 (remove.bg, Photoshop 등) 권장.

## 6. 이벤트 CG는 "서사 한 장면"

이벤트 CG는 단순 인물 사진이 아니라 **스토리 한 컷**.
프롬프트에 다음 포함:
- 시간대 (낮/저녁/밤)
- 빛 방향 (창가 햇살, 형광등 등)
- 작은 소품 (커피잔, 책, 가운, 카톡 화면 등)
- 인물 감정 (단순 미소가 아니라 "피곤하지만 안도하는 미소" 같은 결합)

## 7. VEO 영상 프롬프트 추가 규칙

영상 5~7초 한정. 카메라 무빙 명시:
- `slow zoom in` (천천히 줌인)
- `static shot, subject motion only` (고정, 인물만 움직임)
- `slow pan left to right`
- 절대 빠른 줌·플리커·과한 카메라 흔들림 X (12세 등급, 멀미 방지)

음성/대사 X (BGM은 게임에서 따로). 입 모양 자연스럽게.

## 8. 12세 등급 가드레일

모든 프롬프트에 다음 단어 절대 포함 X:
- nude, naked, exposed, topless, lingerie, bikini (수영장 시퀀스 없으므로)
- bedroom intimate, sensual, seductive, sexy
- blood, gore, violence (해부학 시퀀스도 카데바는 묘사 X)

대신:
- "modest casual outfit", "school uniform-style", "warm wholesome smile",
  "subtle blush", "innocent atmosphere"

## 9. 한국적 디테일 명시

이건 **한국 의대생 로맨스**다. 프롬프트에 자주 포함:
- "Korean university student"
- "Korean campus aesthetic"
- "soft K-drama lighting"
- "modern Korean fashion"
- 한국적 배경 디테일 (캠퍼스, 카페, 동성로 거리 등)

## 10. 파일명 규칙

```
sprites/{character}_{expression}_{outfit?}.webp
  예: serin_smile.webp, serin_smile_casual.webp

bg/{location}_{time}_{weather?}.webp
  예: bg_lecture_day.webp, bg_dongsan_evening.webp

cg/{character}_{event}.webp
  + cg/{character}_{event}_full.webp (갤러리용 워터마크 잘라낸 버전)
  예: cg_serin_first_meet.webp, cg_serin_first_meet_full.webp

video/{event}_{character?}.mp4
  예: video_meet_serin.mp4, video_reject_seoyoon.mp4
```

## 11. 작업 순서 (사용자 워크플로 권장)

1. **W3-Day 1~2**: 5명 히로인 + 구윤모 default 스프라이트 6장 → 캐릭터 락 결정
2. **W3-Day 3~4**: 6명 × 7종 표정 변형 = 42장 (default 6장 포함하면 48장)
3. **W3-Day 5**: 의상 변형 ~15장
4. **W3-Day 6~7**: 배경 15장
5. **W4-Day 1~3**: 이벤트 CG 20장
6. **W6-Day 1~3**: VEO 영상 12개 (마지막 주차)

## 12. 재생성 기준

다음 중 하나라도 해당 시 재생성:
- 손가락 6개 등 신체 변형
- 같은 캐릭터인데 얼굴이 달라 보임
- 워터마크가 텍스트박스 영역 밖으로 나옴
- 12세 등급 위배 묘사
- 표정이 의도와 다름

## 13. 사용자 검증 (W3 시작 시)

- [ ] 첫 캐릭터 락 (default 6장) 모두 OK?
- [ ] 워터마크가 §2 가림 영역에 들어가는지 확인?
- [ ] 화풍이 K-드라마 + 소프트 애니 톤 일관?
