---
module: bg-list
hierarchy: 3
depends-on:
  - 04-image-prompts/PROMPT-GUIDE.md
  - 03-story/STORY-BIBLE.md
outputs:
  - 배경 18장 전체 프롬프트 (15장 + 신규 3장)
status: review
---

# 04-image-prompts/backgrounds/bg-list.md

> 모든 배경: **16:9 (1920×1080), 인물 없음, 풍경/실내만**.
> 하단 28%는 텍스트박스로 가려지므로 **상단 72%에 시각 정보 집중**.

## 변형(variant) 룰 (W2-prep 라운드 추가)

**ID는 장소 단위, 시간/조명/맥락 변형은 variant 메타로 처리한다.** MASTER-PLAN §6.2의 배경 15장 카운트를 유지하면서 라우트가 다양한 컨텍스트에서 같은 장소를 재활용할 수 있도록 한다.

라우트 표기: `bg_xxx (variant: yyy)` 또는 `[BG: bg_xxx variant=yyy]` (SCENE-FORMAT 추후 확장).

### 라우트→bg-list 매핑 (W2-prep 동기화 결과)

| 라우트가 참조하던 ID | 본 ID | variant |
|---|---|---|
| `bg_anatomy_lab_entrance` | `bg_anatomy_lab` | `entrance` |
| `bg_biochem_lab` | `bg_anatomy_lab` | `biochem` |
| `bg_phd_office` | `bg_anatomy_lab` | `phd_office` |
| `bg_uikuk_corridor` | `bg_dongsan_hallway` | — |
| `bg_library_evening` | `bg_library_night` | `evening` |
| `bg_library_rooftop` | `bg_library_night` | `rooftop` |
| `bg_classroom_test` | `bg_lecture_day` | `test_time` |
| `bg_pub_party` | `bg_dongseong_street` | `pub_night` |
| `bg_dongseongno`, `bg_dongseongno_night` | `bg_dongseong_street` | (default / `night`) |
| `bg_pension_evening` | `bg_mt_pension` | (default — 이미 evening) |
| `bg_pension_room_night` | `bg_mt_pension` | `room_night` |
| `bg_sports_field` | `bg_festival` | `sports_outdoor` |
| `bg_campus_cherry_path` | `bg_campus_night_blossom` | `day` |
| `bg_campus_night` | `bg_campus_night_blossom` | `post_blossom` |
| ~~`bg_bundang_cafe_window`~~ | ~~`bg_bundang_home`~~ | ~~`cafe_window`~~ — **2026-05-09 폐기**: H1 트루 카페 자리는 전용 자산 `bg_cafe_serin`으로 정식 분리 (§10-1 참조). `bg_bundang_home`은 분당 본가 거실(밤) SOLO 회상 자리 한정. |
| `bg_festival_day` | `bg_festival` | `day` |

> 자산 생성 (W3 라운드): variant 별 별도 자산 생성 여부는 사용자가 W3 라운드에서 결정. 시각적 구분이 클 경우 별도 webp 파일 생성, 작을 경우 변형 메타만으로 처리.

## 공통 STYLE 라인

```
soft anime / K-drama background art, gentle pastel palette,
warm natural lighting unless specified, painterly style with crisp details,
no people, no text, no signature, no watermark,
empty space at the bottom for visual UI overlay
```

---

## 1. `bg_kmu_main.webp` — 계명대 의대 본관 외경 (낮)

```
SUBJECT: Korean university medical school main building exterior
SETTING: spring afternoon, sunny clear sky with light clouds, blooming cherry blossom trees in foreground, modern brick + glass academic building, wide pedestrian path, no people visible
STYLE: soft K-drama campus aesthetic, warm golden-hour leaning daylight, painterly with sharp architectural lines, gentle pastel palette, peaceful atmosphere
NEGATIVE: people, students, characters, text, signage detail, blurry, watermark
```

## 2. `bg_lecture_day.webp` — 본과1 강의실 (낮)

```
SUBJECT: empty modern Korean medical school lecture hall, tiered seating, large whiteboard at front, projector screen
SETTING: bright daylight through large windows on the right side, empty wooden desks with notebooks left behind, peaceful empty atmosphere
STYLE: clean architectural anime background, soft natural light, warm cream + soft blue palette
NEGATIVE: people, characters, text on board, watermark
```

## 3. `bg_anatomy_lab.webp` — 해부학 실습실 입구 (분위기만)

```
SUBJECT: clinical anatomy lab corridor entrance, frosted glass double doors with simple sign, tile floor, sterile fluorescent lighting
SETTING: empty corridor, no actual lab interior visible (door closed), serious quiet atmosphere, lab coats hanging on hooks at side
STYLE: muted cool palette, slight melancholy, painterly anime style, NO graphic medical content visible
NEGATIVE: cadaver, body, blood, organs, people, characters, graphic medical imagery
```
> ⚠️ 12세 가드레일: 카데바 직접 묘사 X. **문 닫힌 복도까지만**.

## 3-1. `bg_biochem_lab_night.webp` — 생화학 실험실 (밤/새벽)

> 사용 씬: Ch.4 한설 야간 실험실 (`ch04_03_lab_late`, 4/28 밤 11시 첫 만남) / Ch.6 H3 새벽 1시 실험실 (`ch06_h3_03_late_night_lab`, 6/3 새벽 1시 케이크 야식) / Ch.6 H3 HAPPY 엔딩 (`ch06_h3_happy`, 6/14 밤 11시).
> 라운드 2026-05-08에서 `bg_anatomy_lab`의 alias(해부학 자산 재사용 + variant=biochem_night)였던 것을 사용자가 제공한 별도 PNG로 정식 자산 분리. NORMAL 엔딩(`ch06_h3_normal`, 오후 3시)·TRUE 엔딩(`ch06_h3_true`, 저녁 7시 박사 논문실 별도 공간)·Ch.2 낮 3종은 `bg_anatomy_lab` 그대로 유지.

```
SUBJECT: biochemistry research lab interior at late night / past midnight, lab benches with glassware and pipettes, fume hood in background, computer monitor showing data, lab coat on chair
SETTING: deep night through windows, only desk lamp + scattered fluorescent ceiling tubes lit, quiet hum of ventilation, slight reflection on glass instruments
STYLE: cool blue-green night palette with warm desk lamp accent, painterly anime, contemplative quiet atmosphere, scientific precision
NEGATIVE: cadaver, body, blood, organs, people, characters, graphic medical imagery, daylight, bright sunlight
```

## 4. `bg_library_day.webp` — 도서관 자습실 (낮)

```
SUBJECT: large university library reading room, long study tables with desk lamps, tall bookshelves in background
SETTING: quiet afternoon, soft daylight through tall windows, empty seats with textbooks and laptops left, scholarly atmosphere
STYLE: warm wooden tones, painterly anime background, soft beige + brown palette, cozy study mood
NEGATIVE: people, characters, watermark
```

## 5. `bg_library_night.webp` — 도서관 자습실 (저녁/밤)

```
SUBJECT: same library reading room as bg_library_day but at night
SETTING: late evening / midnight, individual desk lamps glowing warm yellow, dark windows, only a few lamps lit suggesting late-night studying, empty seats but feeling of recent occupation (open books, coffee cups)
STYLE: warm low-light atmosphere, painterly anime background, deep amber + brown palette, intimate quiet study mood
NEGATIVE: people, characters, watermark
```

## 6. `bg_dongsan_lobby.webp` — 동산병원 로비

```
SUBJECT: modern Korean university hospital lobby, polished floor, reception desk in distance, indoor plants, large windows
SETTING: midday, bright clean sterile light, sparse people in distance (silhouettes only, blurred), professional medical atmosphere
STYLE: clean architectural anime, cool blue + white palette, slight sterile feel softened by warm wood accents
NEGATIVE: clear faces of people, text on signs, watermark
```

## 7. `bg_dongsan_hallway.webp` — 동산병원 내과 의국 복도

```
SUBJECT: modern hospital ward hallway, doors with name plates (text not readable), nursing station in distance
SETTING: late afternoon, fluorescent lighting, slightly worn but clean professional atmosphere, empty hallway
STYLE: muted clinical palette, slight golden hour softening through window at end of hall, painterly anime
NEGATIVE: people, readable text, watermark
```

## 8. `bg_campus_cafe.webp` — 캠퍼스 카페 실내 (낮)

```
SUBJECT: cozy university campus cafe interior, wooden tables, espresso machine in background, chalk menu board (text not readable), large windows
SETTING: late afternoon golden hour light, empty seats, warm yellow lighting, plants on counter
STYLE: cozy K-drama cafe aesthetic, warm beige + caramel palette, soft anime background
NEGATIVE: people, readable text, watermark
```

## 8-1. `bg_campus_cafe_night.webp` — 캠퍼스 카페 실내 (새벽)

> 사용 씬: Ch.4 새벽 카페 (`ch04_02_cafe_late`, 차세린 첫 새벽 만남) / Ch.6 H1 새벽 1시 카페 (`ch06_h1_02_late_cafe`).
> 라운드 2026-05-08에서 `bg_campus_cafe`의 alias(낮 자산 재사용)였던 것을 사용자가 제공한 별도 PNG로 정식 자산 분리. NORMAL 엔딩(`ch06_h1_normal`, 오후 4시)·Ch.1 카페·H4 데이트 카페·H2 HAPPY 카페는 낮 그대로 `bg_campus_cafe` 사용.

```
SUBJECT: cozy university campus cafe interior at late night / past midnight, wooden tables, espresso machine in background, chalk menu board (text not readable), large windows
SETTING: deep night through large windows, scattered street lamps outside casting cool blue tint, warm interior lighting from pendant lamps, near-empty seats, plants on counter
STYLE: cozy K-drama cafe at night aesthetic, warm amber interior + cool blue exterior palette, soft anime background, contemplative quiet atmosphere
NEGATIVE: people, readable text, watermark, daylight, bright sunlight
```

## 9. `bg_campus_night_blossom.webp` — 캠퍼스 야경 (벚꽃)

```
SUBJECT: empty Korean university campus walkway lined with cherry blossom trees at night
SETTING: spring evening, blossoms in soft pink, scattered street lamps casting warm yellow glow, blossom petals drifting in air
STYLE: dreamy K-drama romance aesthetic, soft pink + warm yellow palette, painterly anime, slight bokeh from light sources
NEGATIVE: people, characters, watermark
```

## 10. `bg_bundang_home.webp` — 분당 본가 거실 (밤)

```
SUBJECT: cozy Korean upper-middle-class apartment living room, modern furniture, family photos on wall (faces not visible / abstract), large window showing Bundang city night view
SETTING: late evening, warm interior lighting, empty sofa with throw blanket, hint of recent presence, peaceful homey atmosphere
STYLE: warm interior palette, K-drama family home aesthetic, soft browns + creams + warm yellow, painterly anime
NEGATIVE: people, characters, readable text, watermark
```

> 사용 씬 (한정): `end_solo_summer_main` (분당 본가 거실 회상 자리, 밤). **H1 트루 엔딩 카페 자리에는 사용 금지** — 그 자리는 §10-1 `bg_cafe_serin` 전용 자산이다.

## 10-1. `bg_cafe_serin.webp` — 분당 본가 근처 카페 창가 (낮, H1 트루 엔딩 전용)

> 사용 씬 (한정): `ch06_h1_true` (메인 + compressed). **2026-05-09 PM 자산 등록**으로 옛 `bg_bundang_home (variant: cafe_window)` 별칭에서 정식 분리. 자산 경로: `public/img/bg/bg_cafe_serin.webp` (127KB).

```
SUBJECT: warm cozy Korean neighborhood cafe interior, window seat with sunlit table, single mug on the table, soft fabric chair, indoor plants near the window, suburban street visible through the glass
SETTING: early July late morning, bright natural sunlight streaming through the window, peaceful midday calm, relaxed atmosphere
STYLE: K-drama cafe aesthetic, soft cream + warm beige + gentle gold, painterly anime, intimate empty seat
NEGATIVE: people, characters, readable text, watermark
```

> ⚠️ 정합성 가드 (2026-05-10): 본 자산은 `ch06_h1_true` 트루 엔딩 내레이션("분당 본가 근처 카페 창가")과 1:1 대응. 컴파일러가 .md → .scene.json 으로 BG를 미러링하므로 **다음 자리들이 모두 `bg_cafe_serin`로 일치되어야 한다**:
> 1. `03-story/route-H1-cha-serin.md` §END_H1_TRUE 무대
> 2. `03-story/scenarios/ch06_h1_serin.md` Scene `ch06_h1_true` `[BG:]` 라인
> 3. `03-story/scenarios/compressed/ch06_h1_serin.md` Scene `ch06_h1_true` `[BG:]` 라인
> 4. `03-story/scenarios/윤문 완료/ch06_h1_serin.txt` Scene `ch06_h1_true` `[BG:]` 라인
> 5. `src/scenes/ch06_h1_true.scene.json` `BG.image`
> 6. `src/scenes/compressed/ch06_h1_true.scene.json` `BG.image`
>
> 한 자리라도 `bg_bundang_home`로 되돌아가면 다음 컴파일에서 카페가 본가 거실로 깨진다.

## 11. `bg_studio_room.webp` — 자취방 (책상 앞)

```
SUBJECT: small modern Korean studio apartment, desk by window with laptop and books, single bed visible in side, simple clean decor
SETTING: late evening, desk lamp glowing warm, soft city light through window, studious lonely vibe
STYLE: cozy single-room palette, soft beige + cream + warm yellow, painterly anime, intimate
NEGATIVE: people, characters, watermark
```

## 12. `bg_kmu_pharm.webp` — 계명대 약대 앞 (성서 캠퍼스, 의대와 같은 캠퍼스)

```
SUBJECT: Keimyung University pharmacy school building exterior on the Seongseo campus, the same shared campus as the medical school, modern brick + glass academic building with broad concrete pedestrian plaza
SETTING: late spring afternoon, soft golden-hour daylight, blooming cherry blossom and fresh greenery along the walkway, scattered students in far distance (silhouettes only), peaceful campus atmosphere with a hint of the medical-school side of the campus visible at the edge of frame
STYLE: clean K-drama campus architectural anime, soft blue + cream palette with warm golden accents, painterly with crisp architectural lines
NEGATIVE: clear faces, readable signage, watermark, "Yeungnam" or any other university branding
```
> 사용 챕터: Ch.4 (H4 나서윤 첫 만남 — 같은 성서 캠퍼스 우연 조우 / 약대 앞 또는 학생식당 근처), Ch.6 (H4 분기 토요일 데이트 입장·트루 엔딩 무대). H4 나서윤(계명대 약대 4학년, 23학번) 소속 정합. 영남대 약대(경산) 잔재 제거.

## 13. `bg_dongseong_street.webp` — 대구 동성로 데이트 거리

```
SUBJECT: bustling Korean modern shopping street at evening, neon signs (text not readable), cafes, street trees with fairy lights
SETTING: golden hour transitioning to evening, warm street lamps lit, scattered people in distance (silhouettes/bokeh), romantic urban vibe
STYLE: K-drama urban romance aesthetic, warm magenta + amber palette, slight bokeh, painterly anime
NEGATIVE: clear faces in foreground, readable text, watermark
```

## 14. `bg_festival.webp` — 의대 축제장 (낮)

```
SUBJECT: outdoor university festival booth area, white tents, decorative banners (text not readable), strung lights between trees, food stalls in distance
SETTING: bright sunny afternoon, lively festive atmosphere, no specific people in foreground (silhouettes far back)
STYLE: vibrant cheerful palette, bright pastel banners, painterly anime, warm sunny mood
NEGATIVE: clear faces in foreground, readable text on banners, watermark
```

## 15. `bg_mt_pension.webp` — MT 펜션 (저녁)

```
SUBJECT: Korean countryside vacation rental cabin / pension, wooden deck with lit lanterns, BBQ setup in foreground (no food shown), lush green forest behind
SETTING: dusk, warm string lights, cozy intimate retreat atmosphere, hint of evening sky in pink-orange gradient
STYLE: warm cabin aesthetic, soft amber + forest green palette, painterly anime, peaceful
NEGATIVE: people, characters, watermark
```

## 16. `bg_dongdaegu_station.webp` — 동대구역 KTX 플랫폼 (낮)

```
SUBJECT: Dongdaegu KTX railway station outdoor platform, sleek modern Korean high-speed train (KTX-Sancheon style) waiting at platform, glass-and-steel canopy roof overhead, electronic departure board (text not readable) showing schedule
SETTING: late spring late-morning around 11 AM, bright daylight filtering through the platform canopy, light bustle implied by distant blurred figures (silhouettes only), warm farewell atmosphere with a slight wistful quality
STYLE: clean K-drama travel aesthetic, soft blue + warm cream palette with subtle steel accents, painterly anime background with crisp architectural lines, cinematic depth
NEGATIVE: clear faces, readable signage, KTX logo readable, watermark
```
> 사용 챕터: Ch.6 H2 윤하정 TRUE 엔딩 (2026-06-27 토요일 부산행 KTX 12시 출발). H2와의 헤어짐·재회 장면 무대. **상단 72%에 KTX 차량과 캐노피 집중**, 하단 28%는 텍스트박스로 가려짐.

## 17. `bg_library_night.webp` (variant=rooftop) — 도서관 옥상 야경 (밤)

```
SUBJECT: rooftop terrace of the university library at night, low parapet wall, scattered concrete benches, view of the city beyond with distant building lights and signage (text not readable, bokeh)
SETTING: late evening / midnight, deep navy sky with a few stars, gentle warm rooftop lamp on a single post casting soft yellow pool of light, slight breeze suggested by leaves on a small rooftop planter, intimate quiet two-person atmosphere
STYLE: K-drama rooftop romance aesthetic, deep navy + warm amber palette with subtle magenta city bokeh, painterly anime background, slight bokeh on distant city
NEGATIVE: people, characters, readable signage, watermark
```
> 사용 챕터: Ch.6 H2 윤하정 분기 Scene 04 (`ch06_h2_04_rooftop`) — KEY #3 옥상 솔직 호감 표현 + 변태 망상 페어 #4(드뭄 톤 갭). 자습실(`bg_library_night.webp` 본체, #5)과 시각적 차이가 커서 별도 자산으로 분리. variant 메타로 라우팅: `[BG: bg_library_night variant=rooftop ...]` 또는 별도 ID `bg_library_rooftop` 매핑(line 33).

## 18. `bg_ktx_window.webp` — KTX 차내 창가 (낮)

```
SUBJECT: interior view of a Korean KTX high-speed train passenger car from a window seat, large glass window dominating the right side, distant fields and low mountains rushing past, blurred motion suggesting high speed, simple beige curtain pulled aside, the seat back of the row in front partially visible
SETTING: late winter early afternoon around 1-2 PM, soft daylight filtering through the window, calm reflective travel mood, no other passengers visible (or far back blurred)
STYLE: clean K-drama travel aesthetic, soft cream + sky-blue palette with warm light accents, painterly anime with crisp interior lines, slight motion blur on the outside scenery to imply speed
NEGATIVE: clear faces, readable signage, KTX/Korail logo readable, watermark
```
> 사용 챕터: Prologue Scene `prologue_02_train` — 분당→동대구 이동 중 KTX 창가 좌석에서 윤모 모놀로그. 외부 플랫폼(`bg_dongdaegu_station.webp`, §16)과 구분되는 차내 무대.

---

## 추가 (모달용 미니 배경)

- `bg_katalk_room.webp` — 카톡 모달용 빈 거실/방, 모바일 화면 비치는 분위기 (옵션, 카톡 모달이 자체 UI라면 불필요)

## 사용자 검증

- [ ] 15장 목록 OK?
- [ ] 카데바 묘사 회피 (bg_anatomy_lab) 적정?
- [ ] 텍스트 가독성 회피 (모든 간판/책 등) 명시 충분?
