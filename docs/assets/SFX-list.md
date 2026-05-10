---
module: SFX-list
hierarchy: 4
depends-on:
  - 00-master/MASTER-PLAN.md
  - 00-master/CONVENTIONS.md
  - 03-story/scenarios/*.md
  - 05-ui-design/UI-SPEC.md
  - 05-ui-design/ANIMATION-SPEC.md
  - 06-engine/SCENE-FORMAT.md
  - docs/assets/BGM-list.md
outputs:
  - 시나리오 한글 SFX 표기 ↔ 영문 파일명 매핑 테이블 (SSoT)
  - SFX 출처·라이선스·우선순위 분류
  - 사용자 직접 수집 작업 가이드 (마일스톤 #3 후 진행)
status: done
---

# docs/assets/SFX-list.md

> SFX 수집 명세 SSoT. 시나리오 작가는 한글 표기(`[SFX: 카톡_알림]`)로 큐를 박고, 빌드 시 컴파일러가 영문 ID(`sfx_katalk_notify`)로 변환한다. 본 §2 매핑 테이블이 그 변환 SSoT.
>
> **SSoT 출처:** MASTER-PLAN §6.1·§10.1 + CONVENTIONS §5.2(영문 파일명) + §8(12세 가드레일) + ANIMATION-SPEC §8(타이머)·§9(자기자각) + 시나리오 7개 한글 SFX 큐 31회.
>
> **분담:** Claude는 본 명세만. 후보 다운로드·라이선스 확인·자체 제작·후처리·최종 선정은 PM 직접 작업 (MASTER-PLAN §10.1).

---

## 0. 현재 상태 (2026-05-06 갱신, W5 통합 완료)

**Phase 1 완료** — 명세 SSoT 신설 (2026-04-29).
**Phase 1.5 완료** — Claude ffmpeg 자동 합성 5종 × 3 후보 = 15개 `_candidates/` 배치 (2026-05-04).
**Phase 2 완료** — PM 직접 수집 + 청취 선정 (2026-05-06).
- P0 5종: `sfx_click`은 Phase 1.5 v1 채택. 나머지 4종(`sfx_katalk_notify` / `sfx_realize` / `sfx_timer_out` / `sfx_pageturn`)은 PM이 외부 다운으로 결정.
- P1 7종: PM Freesound/Pixabay 등 직접 수집 (`sfx_ktx_run` / `sfx_suitcase_wheels` / `sfx_light_off` / `sfx_footsteps` / `sfx_lab_door_open` / `sfx_glass_drop` / `sfx_bar_ambient`).
- 원본은 `docs/assets/sfx/확정/` 보관 (crop 전).

**Phase 2.5 완료 + PM 청취 검증 통과 ✅** — Claude ffmpeg 일괄 crop·후처리 (2026-05-06, 4차 라운드까지). PM 12개 모두 청취 후 "문제 없음" 확정 (2026-05-06).
- 12개 모두 `docs/assets/sfx/sfx_<id>.mp3` 배치 (W4·W5 후속 클린업 라운드 W5 통합 시 `public/snd/sfx/`로 이동 — 2026-05-06).
- crop 적용 (각 트랙 §5 권장 길이 정합) + 채널 변환 (UI/단발 mono / 환경음 stereo) + 시작 5ms 페이드인 + 끝 30ms 페이드아웃 + -18 LUFS 정규화 (loudnorm 1-pass) + 128 kbps CBR mp3 + ID3 (Album="kmu-vn SFX", Comment="TBD: PM 추적 대기" 또는 합성 메타).
- ffprobe 자동 검증 통과: 12개 모두 길이·채널 §5 정합. (sfx_click·sfx_pageturn bitrate 평균이 헤더 비율 영향으로 128k 초과 — 음질 무영향).

**W4·W5 후속 클린업 라운드 ✅ (2026-05-06)** — 자산 폴더 이동 + 매니페스트 재생성 + 라이선스 면제 결정.
- `docs/assets/sfx/*.mp3` 12개 → `public/snd/sfx/` 이동 (이력 폴더 `_candidates/`, `확정/`, `직접 corp/`는 보관 유지).
- `npm run manifest` 재실행 → `public/manifest.json` `"sfx": [...]` 8건 등재(시나리오 큐 사용분만 — `sfx_click/pageturn/realize/timer_out` 4종은 코드 직접 호출이라 매니페스트 의도 누락, 자산 파일은 12개 모두 배치).
- `npm run build` + `vitest` 72/72 통과 — 자산 404 회귀 0건, dist에 12개 mp3 정상 복사.
- **PM 결정 (2026-05-06): 효과음(SFX)은 라이선스/표기 의무 면제 처리** — 곡(BGM)이 아니므로 §4.3 표 11행 "TBD" → "라이선스/표기 면제"로 일괄 갱신. ID3 Comment "TBD: PM 추적 대기" 잔존은 음질·재생 무영향이라 그대로 유지.

마일스톤 #3 도달 후 SFX 큐 재grep — **새 P2 종류 0건** (시나리오 작가가 환경음 보수적으로 박음). 8 한글 종류 + 4 시스템 = **12종 그대로 확정**.

**사용자 결정 사항:**
1. **타이밍** (2026-05-04 갱신): 마일스톤 #3 도달 → 즉시 분할 수집 진행 (Phase 1.5 + Phase 2 + Phase 2.5)
2. **매핑** (2026-04-29): 빌드 타임 자동 치환 — 시나리오는 한글 표기 유지, `scripts/compile-scene.ts`가 본 §2 테이블 로딩 후 영문 ID로 변환
3. **카톡 알림음** (2026-04-29 → 2026-05-06 변경): 자체 제작 결정 → Phase 1.5 합성본도 만들었으나 PM이 외부 다운본을 최종 채택.
4. **Crop 워크플로 (2026-05-06 신규)**: PM이 외부 다운한 원본 → `docs/assets/sfx/확정/` 배치 → Claude ffmpeg 일괄 crop·후처리 → `docs/assets/sfx/`에 최종 배치. BGM 라운드(PM Audacity)와 다른 분담.
5. **라이선스 면제 (2026-05-06 W4·W5 후속 클린업)**: 효과음은 곡이 아니므로 라이선스 추적/표기 의무 면제. §4.3 11행 일괄 "라이선스/표기 면제"로 갱신, ID3 재태깅 미진행.

**Pixabay Audio API 가용성 (2026-05-04 확인):** 공식 REST API는 이미지/비디오만 지원. Audio/Music/Sound Effects endpoint는 미공개(403/404). 환경음 7종은 사용자가 https://pixabay.com/sound-effects/ 직접 검색하는 흐름이 BGM 라운드와 일관(가장 안전).

**status 흐름:** `in-progress` → `review`(Phase 2.5 완료 — 2026-05-06) → **`done`(현재, W4·W5 후속 클린업 라운드 — 자산 이동·매니페스트·라이선스 면제 결정 완료, 2026-05-06)**.

---

## 1. 시나리오 SFX 큐 grep 실측 (마일스톤 #3 후 — 2026-05-04)

| 한글 ID | prologue | ch01_ot | ch02_anatomy | ch03_dongsan | ch04_library | ch05_decision | ch06_h1 | ch06_h2 | ch06_h3 | ch06_h4 | ch06_h5 | end_solo | **총 큐** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `카톡_알림` | 3 | 2 | 2 | 4 | 1 | 3 | 2 | 2 | 1 | 6 | 1 | 1 | **28** |
| `술집_왁자지껄` | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | **2** |
| `발자국` | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `실습실_문_열림` | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `유리병_떨어짐` | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `ktx_주행음` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `캐리어_바퀴` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `불_끄는_소리` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| **합계** | 6 | 2 | 5 | 4 | 1 | 4 | 2 | 3 | 1 | 6 | 1 | 1 | **36** |

> **풋노트 (grep 정합):** `grep "\[SFX: 카톡_알림"`은 ch06_h4_seoyoon에서 7건을 잡지만 L1174 1건은 거절 엔딩 8단계 명세 **표 안의 코드 인용**이라 실행 큐가 아님 (BGM 슬픔 정합 룰 동일). 본 표는 실행 큐만 카운트(L68/L322/L640/L748/L947/L1008의 6회).
>
> **마일스톤 #3 후 변동 요약 (2026-04-29 → 2026-05-04):** 카톡_알림 23 → 28 (+5: ch06_h1 +2 / ch06_h3 +1 / ch06_h5 +1 / end_solo +1). 다른 종류 변동 0. **신규 P2 종류 0건** — 시나리오 작가가 의대 축제·체전·여름방학 환경음을 SFX 큐 대신 모놀로그/지문으로 표현. P2 placeholder는 보류 또는 P3로 이전 검토.

---

## 2. 매핑 테이블 (P0~P3 우선순위)

빌드 타임 SSoT. 시나리오 한글 → 영문 ID 변환의 단일 진실. `scripts/md-to-scene.ts`가 본 표를 로딩.

| 한글 표기 | 영문 ID | 우선순위 | 출처 | 등장 위치 | 비고 |
|---|---|---|---|---|---|
| `카톡_알림` | `sfx_katalk_notify` | **P0** | **자체 제작** | prologue 3 + ch01 2 + ch02 2 + ch03 4 + ch04 1 + ch05 3 + ch06_h2 2 + ch06_h4 6 = **23회** | H4 거절 엔딩 미니게임 핵심. 0.4~0.8초, 부드러운 톤. 라이선스 회피 + 게임 고유성. §3 자체 제작 가이드. |
| (시스템) | `sfx_click` | **P0** | CC0 | 모든 UI 클릭 (메뉴/선택지/저장 등) | 50ms 이내, 톤 절제. UI-SPEC §5.4 미니 컨트롤 인터랙션 |
| (시스템) | `sfx_pageturn` | **P0** | CC0 | 텍스트 다음 / 백로그 페이지 | 100ms 이내. 종이 넘김 톤 |
| (시스템) | `sfx_timer_out` | **P0** | CC0 | H4 답장 타이머 만료 (ANIMATION-SPEC §8) | 1초 이내 경고음. **12세 톤 — 불쾌 알람 X**. 톤다운된 deedle 또는 차임 |
| (시스템) | `sfx_realize` | **P0** | CC0 | 변태 자기자각 white flash (ANIMATION-SPEC §9, UI-SPEC §2.4) | 200~400ms, 짧은 chime / pop. **놀람 X, 코믹한 톤**. 놀람·경악 톤 X — CONVENTIONS §3.3 부드러운 자각 톤(2026-04-28 갱신) 정합, pop보다 chime 우선 |
| `ktx_주행음` | `sfx_ktx_run` | **P1** | CC0 (loop) | prologue:110 | 5~10초 loop, volume=0.3. 고속철도 객실 내부 톤 (외부 X) |
| `캐리어_바퀴` | `sfx_suitcase_wheels` | **P1** | CC0 | prologue:214 | 1~2초, volume=0.4. 아스팔트/실내 바닥 |
| `불_끄는_소리` | `sfx_light_off` | **P1** | CC0 | prologue:311 | 짧은 클릭+소거음. 형광등 또는 LED 스위치 |
| `발자국` | `sfx_footsteps` | **P1** | CC0 | ch02:58 | 2~3초, 실내 발자국, volume=0.3. 해부실 가는 길 — 무거운 톤 |
| `실습실_문_열림` | `sfx_lab_door_open` | **P1** | CC0 | ch02:108 | 1~2초, 무거운 문, volume=0.4. 카데바 첫 대면 직전 |
| `유리병_떨어짐` | `sfx_glass_drop` | **P1** | CC0 | ch02:293 | 1초, volume=0.6. ⚠️ **깨짐 X (낙하 톡만)** — CONVENTIONS §8 12세 가드레일. ch02 카데바 시퀀스 인접 → 호러 톤 회피 |
| `술집_왁자지껄` | `sfx_bar_ambient` | **P1** | CC0 (loop) | ch05:116 + ch06_h2:227 = **2회** | 5~10초 loop, volume=0.4. 의대 회식 톤. 욕설 가사 X |
| (시스템) | `sfx_affection_up` | **P1** | CC0 | AffectionToastStack 묶음 1회 (UI-SPEC §11.5) | 0.4~0.8초. 부드러운 차임/벨 상승 톤. 12세 — 강한 알람 X. 자산 미존재 시 audioManager graceful warn. |
| (시스템) | `sfx_affection_down` | **P1** | CC0 | AffectionToastStack 묶음 1회 (UI-SPEC §11.5) | 0.4~0.8초. 톤 다운된 하강 차임. 위협적 톤 X. |
| (Ch.6 잔여 + 엔딩) | TBD | **P2** | TBD | 마일스톤 #3 후 추출 | 후보: 빗소리(거절 엔딩 보강) / 벚꽃 바람 / 시험 종 / 의대 축제 환경음 / 체전 응원 / 여름 매미 / 폭죽 등 |
| (UI 폴리시) | `sfx_save` / `sfx_menu_open` / `sfx_select` 등 | **P3** | CC0 | 후순위 | 출시 전 폴리시 단계. 게임플레이 영향 없음 |

**우선순위 정의:**
- **P0** (필수, 4종 + 자체제작 1종 = 5종): UI 핵심 동작 + 자기자각/타이머 등 게임 메커니즘 핵심. 누락 시 게임 동작 불가.
- **P1** (시나리오 환경음, 7종): 시나리오 큐로 박힌 환경음. 누락 시 분위기 손실.
- **P2** (마일스톤 #3 추가, TBD): Ch.6 잔여 + 엔딩 시나리오에서 추출.
- **P3** (UI 폴리시, TBD): 출시 전 단계, 게임 가치에 영향 미미.

---

## 3. 카톡 알림음 자체 제작 가이드 (P0, `sfx_katalk_notify`)

**왜 자체 제작:** 카카오톡 기본음 라이선스 회피 + 게임 고유성 + H4 거절 엔딩 미니게임의 시그니처 사운드.

**컨셉:**
- 톤: 카카오톡 기본음과 구분되되 "왔어!"가 즉각 인지되는 톤. 부드러움 + 경쾌함. 호러/날카로움 X.
- 길이: **0.4~0.8초** (반복 노출 23회 → 짧을수록 피로 적음).
- 음역대: **1.5~3 kHz 메인** (인성 음역 위로 → 모놀로그/대사/BGM 위로 들림).
- 톤 구조: **2~3음 짧은 모티프** (도-미 또는 솔-도-미 같은 메이저 인터벌). 불협 X.
- 동적 변화: 첫 음 살짝 강하고 두 번째 음 부드럽게 감쇄(percussive attack + soft release).

**도구 옵션 (DAW 없는 환경 전제):**
1. **Audacity + 톤 제너레이터** (무료, Windows/Mac/Linux)
   - `Generate > Tone` (Sine wave, 1500/2000/2500 Hz 3음 짧게 겹치기)
   - 또는 `Generate > Chirp`로 변동음
   - `Effect > Fading > Fade Out` 끝 50ms
2. **Online tone generator** (https://www.szynalski.com/tone-generator/) → wav 녹음 → Audacity로 페이드 처리
3. **GarageBand iOS** Smart Piano로 짧은 모티프 녹음 → MP3 export

**검증 (자체 제작 후):**
- [ ] 길이 0.4~0.8초 (ffprobe 확인)
- [ ] 음역대 1.5~3 kHz 주력 (Audacity Spectrum 분석)
- [ ] 카톡 BGM(`bgm_katalk` Pixabay 앰비언트, 60~75 BPM 신스 패드)과 동시 재생 시 위로 들림 (수동 청취)
- [ ] H4 답장 타이머 미니게임에서 `sfx_katalk_notify` → 즉시 `sfx_timer_out` 가능 → 두 SFX 톤 충돌 X (수동 청취)
- [ ] 12세 톤: 호러/놀람 X, 부드러운 알림감

**폴백 옵션:** 마일스톤 #3 후 시간 제약 시 Freesound CC0의 부드러운 차임/팝 임시 사용 → 출시 전 자체 제작본으로 교체. 단 사용자 결정은 자체 제작 우선.

**Phase 1.5 자동 합성 결과 (2026-05-04, Claude ffmpeg lavfi):** §3.5 참조. 후보 3개 `_candidates/sfx_katalk_notify_v{1,2,3}.mp3`. 사용자 청취 후 1개 선정.

---

## 3.5. Claude ffmpeg 자동 합성 결과 (Phase 1.5 — 2026-05-04)

5종 P0 SFX × 3 후보 = 15개 파일 `docs/assets/sfx/_candidates/`에 배치. **모두 lavfi 사인파/노이즈 합성 — CC0 라이선스 X, 자체 제작본 (저작권 PM 본인)**.

### 합성 후보 표 (사용자 청취 → 1개 선정)

| 영문 ID | v1 (기본) | v2 (변형 A) | v3 (변형 B) | ffprobe 길이 |
|---|---|---|---|---|
| `sfx_katalk_notify` | 도-미 2음 (1500→2000Hz) | 솔-도-미 3음 멜로디 강함 | 고음 짧은 차임 (2000→2500Hz) | 350 / 420 / 300 ms |
| `sfx_realize` | ding 단음 (2200Hz, 긴 decay) | 옥타브 점프 (1100→2200Hz) | 가벼운 ping (3000Hz) | 300 / 300 / 250 ms |
| `sfx_timer_out` | deedle 다운피치 (800→600Hz, 만료감) | 차임 두 음 (1000→800Hz) | 가장 부드러운 낮은 톤 (600→500Hz) | 500 / 550 / 450 ms |
| `sfx_click` | 고음 짧은 click (2000Hz, 25ms) | 중음 click (1200Hz, 30ms) | 노이즈 burst click (전형 UI) | 25 / 30 / 20 ms |
| `sfx_pageturn` | filtered noise burst (페이퍼 톤) | 두 톤 swoosh (사인) | 노이즈+사인 혼합 (가장 페이퍼다움) | 80 / 90 / 90 ms |

**모두 명세 길이 정합 ✅** (sfx_katalk_notify v1·v3는 권장 400~800ms 하한 살짝 미달이지만 짧은 알림 톤 의도로 OK).

**ID3 태그 공통**: Album="kmu-vn SFX", Comment="ffmpeg synth v{N} / Claude generated". 형식 MP3 mono CBR 128k (단 짧은 파일은 ffprobe bitrate가 frame 최소단위 영향으로 명목값 초과 표시 — 정상).

### 사용자 청취 가이드

각 트랙당 v1/v2/v3 청취 후 1개 선정 → `_candidates/`에서 상위 폴더(`docs/assets/sfx/`)로 이동, 파일명에서 `_v1` 등 제거.

**청취 우선순위 (시나리오 맥락):**
1. `sfx_katalk_notify` — H4 거절 엔딩 미니게임 핵심. 28회 노출 → 가장 신중하게. 카톡 BGM(`bgm_katalk` 신스 패드)과 동시 재생 시 위로 들리는지 검증.
2. `sfx_timer_out` — H4 답장 타이머 만료. 직후 거절 엔딩 시퀀스 진입 → 12세 톤(불쾌 알람 X) + `sfx_katalk_notify`와 톤 충돌 X.
3. `sfx_realize` — 변태 자기자각 페어 (CONVENTIONS §3.3 부드러운 자각 톤 정합). 챕터당 1~2회 노출. 놀람·경악 X.
4. `sfx_click` / `sfx_pageturn` — UI 일반 동작. 가장 빈도 높음(매 클릭/대사 진행). 너무 강하면 피로.

**선정 후 처리:**
- [ ] v1/v2/v3 중 1개 선정 → 파일명 `sfx_<id>.mp3`로 변경
- [ ] `docs/assets/sfx/`로 이동
- [ ] `_candidates/sfx_<id>_v*.mp3` 미선정 후보 보관(향후 교체용) 또는 삭제
- [ ] 추가 조정 필요 시 PM 피드백 (예: "더 짧게", "더 부드럽게") → Claude 재합성 1라운드

**불만족 시 폴백:**
- Freesound CC0 검색 (§4 가이드대로)
- 직접 Audacity로 톤 조정 후 재합성
- PM 자체 제작 (Audacity Sine wave Generator로 직접 만지기)

---

## 3.5b. AffectionToast 차임 자동 합성 (2026-05-08)

UI-SPEC §11.5 호감도 토스트 사운드 슬롯 2종을 ffmpeg sine 합성으로 채움.

| 트랙 | 합성 | 길이 | 톤 |
|---|---|---|---|
| `sfx_affection_up` | C5(523.25) → E5(659.25) → G5(783.99) 메이저 트라이어드 상승 | 0.6s | 잔잔 차임, 마지막 음 길게 |
| `sfx_affection_down` | G5 → E5 → C5 메이저 트라이어드 하강 | 0.6s | 동일 envelope, 음량 점감 |

**파라미터** (각 음 envelope):
- 첫 두 음 0.16s, 마지막 0.28s.
- 5ms attack + sustain + 50ms release.
- 음별 volume 가중치 — 상승: 0.55→0.65→0.75 (점강), 하강: 0.55→0.5→0.45 (점감, "물러나는" 인상).
- 합성 후 `aformat=channel_layouts=mono` + `loudnorm=I=-18:TP=-1.5:LRA=11`.
- 출력: 44100Hz mono, libmp3lame 128k CBR.

**파일 검증** (ffprobe):
- duration 0.600s 정확, sample_rate 44100, channels 1, bit_rate ~141k(헤더 영향 평균).
- audioManager graceful warn 없음 — `playSfx('sfx_affection_up'|'sfx_affection_down')` 정상 호출.
- 매니페스트 등록: `public/manifest.json` sfx 13 → 15.

**PM 청취 검증 대기**: 자동 합성 톤이라 PM 청감 시 차분/사랑스러운 톤 vs 사무적 톤 판단 후 정정 옵션 남김. 정정 시 외부 다운 차임 또는 가산 합성(harmonic 추가)으로 갱신.

---

## 3.6. Phase 2 + Phase 2.5 최종 채택 결과 (2026-05-06)

> **PM 청취 검증 통과 ✅ (2026-05-06)** — PM이 12개 자산 모두 직접 청취 후 "문제 없음" 확정. 단 ffmpeg `ebur128` 객관 실측에서 음량 편차 / TP 클리핑 4건 발견 (§3.6 LUFS 실측 표 + 풋노트). PM 결정 우선으로 status 유지, 후속 라운드 정정 옵션 남김.

### 3.6.1 ebur128 LUFS 실측 (2026-05-06, ffmpeg `ebur128=peak=true`)

| 트랙 | I (Integrated, LUFS) | TP (True Peak, dBFS) | LRA (LU) | -18 LUFS 목표 편차 | 발견 |
|---|---:|---:|---:|---:|---|
| `sfx_katalk_notify` | -17.6 | -3.4 | 0.0 | +0.4 | ✓ |
| `sfx_realize` | -19.1 | **0.2** | 0.0 | -1.1 | ⚠️ TP 클리핑 |
| `sfx_timer_out` | -18.7 | -0.5 | 0.0 | -0.7 | ✓ |
| `sfx_pageturn` | -19.3 | **0.9** | 0.0 | -1.3 | ⚠️ TP 클리핑 |
| `sfx_click` | **-70.0** | -25.0 | 0.0 | (측정 한계 밖) | Phase 1.5 합성본 25ms ebur128 측정 범위 밖 — 청감 무문제, PM 통과 |
| `sfx_ktx_run` | -17.7 | -1.8 | 9.7 | +0.3 | ✓ |
| `sfx_suitcase_wheels` | -17.5 | -1.5 | 2.2 | +0.5 | ✓ |
| `sfx_light_off` | **-24.9** | **1.0** | 0.0 | **-6.9** | ⚠️ 음량 미달 + TP 클리핑 |
| `sfx_footsteps` | **-25.6** | **1.1** | 20.0 | **-7.6** | ⚠️ 음량 미달 + TP 클리핑 + LRA 20 (큰 다이내믹) |
| `sfx_lab_door_open` | -20.4 | **0.8** | 0.0 | -2.4 | ⚠️ TP 클리핑 |
| `sfx_glass_drop` | -21.5 | -5.3 | 0.0 | -3.5 | (-18 대비 약간 낮음, 청감 OK) |
| `sfx_bar_ambient` | -20.2 | -6.5 | 0.4 | -2.2 | (-18 대비 약간 낮음, 청감 OK) |

**발견 요약:**
- **TP 클리핑 4건** (realize, pageturn, light_off, footsteps) — `loudnorm` 1-pass + `TP=-1.5` 한계로 발생 가능. 디지털 클리핑 가능성.
- **음량 미달 2건** (light_off -24.9, footsteps -25.6) — -18 LUFS 목표보다 ~7~8 dB 낮음. 청감상 다른 SFX보다 작게 들릴 수 있음.
- **편차 8.1 dB** (-25.6 ~ -17.5) — 트랙 간 청감 차이 가능.
- **sfx_click -70 LUFS** — 25ms 너무 짧아 ebur128 측정 불안정. 정상 이슈 아님.

**PM 청취 결정**: 모두 통과(2026-05-06). 객관 측정상 발견 사항 있으나 청감상 문제 없음으로 status 유지. **후속 라운드 정정 옵션** (W6 QA 청감 재검토 시 활용):
- light_off / footsteps loudnorm 재적용 (-18 LUFS 정확)
- TP 클리핑 4건 `loudnorm` 2-pass 재처리 (TP=-2.0 dBFS 한계)



PM이 Phase 1.5 합성본 청취 후 **`sfx_click`만 v1 채택**, 나머지 4종(`sfx_katalk_notify` / `sfx_realize` / `sfx_timer_out` / `sfx_pageturn`)은 외부 다운으로 결정. P1 환경음 7종도 동시 다운. 12개 원본을 `docs/assets/sfx/확정/` 임시 보관 (crop 전).

**Phase 2.5 — Claude ffmpeg 일괄 crop·후처리 (1차 → 2차 → 3차 → 4차 PM 직접 crop 확정):**

> **§5 권장 길이 초과 모두 허용** (PM 결정 2026-05-06 3차 청취). PM 청취 결과가 §5보다 우선. §5 권장 길이 본문은 별도 라운드에서 갱신 검토.
>
> **PM 직접 crop 라운드 (2026-05-06 4차)**: 후보 비교로도 만족스럽지 않은 6종을 PM이 직접 crop → `직접 corp/` 폴더 → Claude가 mono 변환 + LUFS -18 정규화 + 페이드 + 128k mp3 + ID3만 처리. PM이 "다 mono로 바꾸고" 명령으로 `sfx_bar_ambient`도 mono(원래 환경음 루프 stereo였으나 PM 명령 우선).

| 트랙 | 원본 길이 | crop 범위 (최종) | 최종 길이 | 채널 | 청취 라운드 |
|---|---|---|---|---|---|
| `sfx_katalk_notify` | 1.53s stereo | 0.0~0.6s | 0.600s | mono | 1차 통과 |
| `sfx_realize` | 1.67s stereo | 0.05~1.65s | 1.600s | mono | 3차 — PM "더 길게", 두 chime + 잔향 끝까지 |
| `sfx_timer_out` | 5.15s stereo | **1.8~3.0s (PM 직접)** | 1.190s | mono | **4차 PM 직접 crop** |
| `sfx_pageturn` | 4.67s stereo | **2.0~3.0s (PM 직접)** | 0.981s | mono | **4차 PM 직접 crop** |
| `sfx_click` | 0.025s mono | 그대로 (Phase 1.5 v1) | 0.025s | mono | 1차 통과 (합성본) |
| `sfx_ktx_run` | 77.0s stereo | 5.0~13.0s | 8.000s | stereo | 1차 통과 (PM 직접 crop 명령 범위 외) |
| `sfx_suitcase_wheels` | 16.7s stereo | 0.13~5.13s | 5.000s | mono | 3차 — PM "더 길게" |
| `sfx_light_off` | 4.85s stereo | **0.3~1.0s (PM 직접)** | 0.693s | mono | **4차 PM 직접 crop** |
| `sfx_footsteps` | 22.6s stereo | 0.0~3.0s | 3.000s | mono | 1차 통과 |
| `sfx_lab_door_open` | 56.2s stereo | **3.0~4.0s (PM 직접)** | 1.007s | mono | **4차 PM 직접 crop** (후보 5개 비교 후 PM 직접 채택) |
| `sfx_glass_drop` | 36.9s stereo | **12.2~13.2s (PM 직접)** | 1.007s | mono | **4차 PM 직접 crop** (후보 5개 비교 후 PM 직접 채택) |
| `sfx_bar_ambient` | 537.6s stereo | 60.0~68.0s (PM 직접) | 8.008s | **mono** | **4차 PM 직접 crop** + PM "다 mono로" 명령 (환경음 루프지만 mono) |

**PM 직접 crop 6종 처리 사양 (4차 라운드)**:
- 입력: `docs/assets/sfx/직접 corp/<P-순번>_sfx_<id>_<범위>.mp3` (PM 직접 crop, stereo 원본)
- crop 추가 X (PM이 이미 자름)
- 채널 변환: `-ac 1` (mono, PM 명령 — `sfx_bar_ambient`도 mono)
- 페이드: 시작 5ms + 끝 30ms
- 정규화: -18 LUFS Integrated (loudnorm 1-pass)
- mp3: 128k CBR
- ID3: Album="kmu-vn SFX" + Comment="TBD: PM 추적 대기 / PM direct crop &lt;범위&gt;"

**파형 분석 활용 (silencedetect, 1차~3차 라운드 — 4차 PM 직접 crop으로 의존성 감소):**
- `sfx_timer_out` 1차 결함 발견 (무음만 잘림) → 본 알람 1.84~2.99s 위치 → 3차에서 1.84~3.4s 잔향 포함 → **4차 PM 직접 1.8~3.0s 확정**
- `sfx_realize` 두 chime 구조 (0.08~0.153s + 0.799~1.317s) 발견 → 3차 1.6s 끝 잔향 포함 (PM 통과)
- `sfx_pageturn` 2.5~2.765s 실제 swoosh + 0.735s 무음 → 3차 PM "2.5~3.5s" → **4차 PM 직접 2.0~3.0s 확정** (시작점 변경)
- `sfx_suitcase_wheels` 0.124~16.668s 연속 굴림 → 3차 5.0s (PM 통과)
- `sfx_glass_drop` 7회+ 임팩트 시퀀스 → 3차 후보 5개 추출 (`_candidates/sfx_glass_drop_v{1~5}.mp3`) → **4차 PM 직접 12.2~13.2s 확정** (후보 비교 후 다른 위치 선정)
- `sfx_lab_door_open` 5회+ 별개 임팩트 → 3차 후보 5개 추출 (`_candidates/sfx_lab_door_open_v{1~5}.mp3`) → **4차 PM 직접 3.0~4.0s 확정** (후보 비교 후 다른 위치 선정)

**파형 분석 활용 (silencedetect):**
- `sfx_timer_out` 1차 결함 발견 (무음만 잘림) → 본 알람 1.84~2.99s 위치 → 3차에서 1.84~3.4s로 잔향 포함 확장
- `sfx_realize` 두 chime 구조 (0.08~0.153s + 0.799~1.317s) 발견 → 3차에서 1.6s로 끝 잔향까지 포함
- `sfx_pageturn` 2.5~2.765s 실제 swoosh + 0.735s 무음 → 3차에서 PM이 1초 통째 명시 (무음이 자연 fade out)
- `sfx_suitcase_wheels` 0.124~16.668s 연속 굴림 → 3차에서 5.0s로 확장
- `sfx_glass_drop` 7회+ 임팩트 시퀀스 발견 → §3.7 5개 후보 추출
- `sfx_lab_door_open` 5회+ 별개 임팩트 발견 → §3.7 5개 후보 추출

\* 짧은 파일(<1초)은 ID3 헤더 비율로 평균 비트레이트가 명목 128k 초과 표시 — 데이터 인코딩은 128k CBR. 음질 무영향.

**일괄 적용 사양** (모두 ffmpeg 단일 명령):
- Crop: `-ss <start> -t <duration>`
- 채널 변환: `-ac 1` (mono) / `-ac 2` (stereo, 환경음 루프만)
- 페이드: 시작 5ms `afade=t=in:st=0:d=0.005` + 끝 30ms `afade=t=out:st=<end-0.03>:d=0.03`
- 정규화: `loudnorm=I=-18:TP=-1.5:LRA=11` (ITU-R BS.1770, 1-pass)
- mp3: `libmp3lame -b:a 128k`
- ID3: Album="kmu-vn SFX" + Comment="TBD: PM 추적 대기" (sfx_click만 "ffmpeg synth v1 / Claude generated" 유지)

**원본 보관:** `docs/assets/sfx/확정/0-1 ~ 1-7 + sfx_click_v1.mp3` (12개 + 1) — 향후 재크롭/교체 시 사용. **Phase 1.5 후보 15개**도 `_candidates/` 그대로 보관(향후 교체용).

**라이선스 면제 (2026-05-06 PM 결정):**

효과음(SFX)은 곡(BGM)이 아니므로 라이선스 추적/표기 의무 면제. §4.3 표 11행 일괄 "라이선스/표기 면제"로 갱신. ID3 Comment "TBD: PM 추적 대기" 잔존은 음질·재생 무영향이라 그대로 유지(재태깅 미진행).

---

## 3.7. PM 후보 청취 라운드 — `sfx_glass_drop` × 5 + `sfx_lab_door_open` × 5 (2026-05-06 3차) ⏸ 보류

> **2026-05-06 4차 갱신**: PM이 후보 5개씩 청취 후 만족스럽지 않아 **직접 crop으로 결정** (§3.6 4차 PM 직접 crop 라운드 참조). 본 §3.7 후보 10개는 `_candidates/`에 그대로 보관(향후 교체용). 본 트랙 채택 위치는 §3.6 표 SSoT.
>
> - `sfx_glass_drop` → PM 직접 12.2~13.2s 확정 (`_candidates/sfx_glass_drop_v{1~5}.mp3`는 보관)
> - `sfx_lab_door_open` → PM 직접 3.0~4.0s 확정 (`_candidates/sfx_lab_door_open_v{1~5}.mp3`는 보관)
>
> 아래 후보 정보는 이력 보존용.

PM이 3차 청취에서 두 트랙은 "후보 5개 뽑아오면 사용자가 고름" 결정. silencedetect 분석으로 비-무음 임팩트 구간 추출 → 5개씩 ffmpeg crop → `_candidates/`에 배치. PM 청취 후 1개 선정 → `docs/assets/sfx/sfx_<id>.mp3` 갈아끼움.

### `sfx_glass_drop` 후보 5개 (각 1.0s, mono)

원본 36.9s 안에 7회+ 낙하 임팩트 발견 (silencedetect -30dB). 5개 가장 깨끗한 구간 추출.

| 후보 | 시작점 (원본) | 임팩트 패턴 | ⚠️ 깨짐 X 검증 |
|---|---|---|---|
| `_candidates/sfx_glass_drop_v1.mp3` | 7.7s | 첫 충격 — 가장 큰 첫 낙하 | PM 청취 |
| `_candidates/sfx_glass_drop_v2.mp3` | 10.0s | 두 번째 — 살짝 약한 톡 | PM 청취 |
| `_candidates/sfx_glass_drop_v3.mp3` | 12.1s | 세 번째 — 중간 강도 | PM 청취 |
| `_candidates/sfx_glass_drop_v4.mp3` | 14.1s | 네 번째 | PM 청취 |
| `_candidates/sfx_glass_drop_v5.mp3` | 15.8s | 다섯 번째 | PM 청취 |

### `sfx_lab_door_open` 후보 5개 (각 2.0s, mono)

원본 56s 안에 5회+ 별개 문 임팩트 발견 (silencedetect -30dB).

| 후보 | 시작점 (원본) | 임팩트 패턴 |
|---|---|---|
| `_candidates/sfx_lab_door_open_v1.mp3` | 3.3s | 첫 임팩트 — 짧은 충격(0.27s) + 무음 |
| `_candidates/sfx_lab_door_open_v2.mp3` | 6.4s | 두 번째 — 중간 길이(0.61s) |
| `_candidates/sfx_lab_door_open_v3.mp3` | 9.9s | 세 번째 — 짧은 충격 + 0.4s 후속 |
| `_candidates/sfx_lab_door_open_v4.mp3` | 12.8s | 네 번째 — 0.4s 충격 |
| `_candidates/sfx_lab_door_open_v5.mp3` | 18.3s | 다섯 번째 — 0.4s 충격 |

### PM 선정 워크플로

1. `_candidates/sfx_glass_drop_v{1~5}.mp3` 청취 → 1개 선정
   - **12세 가드레일**: 깨짐(shatter) 음향 들어가면 폐기. 낙하 톡(drop)만 채택. `ch02:293` 카데바 시퀀스 인접 → 호러 톤 회피
2. `_candidates/sfx_lab_door_open_v{1~5}.mp3` 청취 → 1개 선정
   - 카데바 첫 대면 직전 — 무겁되 진중한 톤 (학생의 첫 의례)
3. PM이 "glass_drop=v3, lab_door_open=v1" 식으로 알려주면 Claude가:
   - 선정본을 `docs/assets/sfx/sfx_<id>.mp3`로 복사 (현재 임시 본 파일 덮어씀)
   - 미선정 4개씩은 `_candidates/`에 보관 (향후 교체용)
   - §3.6 표에 최종 시작점 박힘
4. ID3 Comment에 임시로 "candidate v{N} / ss=<시작점>" 박힘 — PM 라이선스 정보 입력 후 재태깅

**현재 본 파일** `docs/assets/sfx/sfx_glass_drop.mp3` / `sfx_lab_door_open.mp3`는 2차 처리 결과(13~14s / 2.5~4.5s) 그대로 — PM 선정 후 갈아끼움.

---

## 4. CC0 큐레이션 가이드 (P1 환경음 7종 — Phase 2)

> **§4 적용 범위 (2026-05-04 갱신):** P0 시스템 4종은 §3.5에서 ffmpeg 자동 합성으로 해결됨. 본 §4는 **P1 환경음 7종** (`sfx_ktx_run` / `sfx_suitcase_wheels` / `sfx_light_off` / `sfx_footsteps` / `sfx_lab_door_open` / `sfx_glass_drop` / `sfx_bar_ambient`)에만 적용. 환경음은 ffmpeg 합성 어려움 → 사용자 직접 사이트 검색 필수.

**우선순위 사이트:**
1. **Pixabay** — https://pixabay.com/sound-effects/ → 사이트 직접 검색 (공식 Audio API 미지원 — 2026-05-04 확인. 이미지 API와 별개). BGM `bgm_katalk`도 여기 출처. 계정 없이 검색·미리듣기·다운 OK. Pixabay Content License (상업 OK, 표기 권장).
2. **Freesound (CC0)** — https://freesound.org/ → 고급 검색 `license:"Creative Commons 0"`. UI 클릭/페이지 넘김/도어/발자국 등 종류 풍부. API는 OAuth 인증 필요 — 사이트 직접 검색이 빠름.
3. **Zapsplat** (계정 필요) — https://www.zapsplat.com/ → 게임 사용 OK이지만 계정 + 크레딧 명시 의무.
4. **CC0 회피 대상**: "free for personal" / 라이선스 불명 / 가사 있는 트랙은 무조건 폐기.

**라이선스 검증 체크리스트 (트랙당 다운 시):**
- [ ] 페이지에 라이선스 명시 (CC0 / Pixabay License / CC BY 등)
- [ ] "Game use OK" 또는 "commercial use" 명시
- [ ] 크레딧 의무 여부 확인 (의무 있으면 §2 비고에 메모)
- [ ] 다운로드 URL + 라이선스를 즉시 메모(메모장 또는 §6 후처리 후 ID3 태그에 박음)

**후보 비교 (트랙당):**
- 후보 2~3개 다운 → 시나리오 맥락에서 시청 (예: `sfx_lab_door_open`은 ch02:108 카데바 첫 대면 직전 → 무겁고 진지한 문 톤)
- 1개 선정 → §6 후처리 적용

**검색 키워드 (트랙별):**

| 영문 ID | Freesound 키워드 | Pixabay 키워드 |
|---|---|---|
| `sfx_click` | "ui click", "button click soft" | "click", "button" |
| `sfx_pageturn` | "page turn paper", "book flip" | "page turn", "paper" |
| `sfx_timer_out` | "soft alarm gentle", "chime alert" | "alarm soft", "notification" |
| `sfx_realize` | "pop short cute", "chime quick" | "pop", "ding" |
| `sfx_ktx_run` | "train interior loop", "bullet train inside" | "train interior" |
| `sfx_suitcase_wheels` | "suitcase rolling", "luggage wheels" | "suitcase", "luggage" |
| `sfx_light_off` | "light switch off", "lamp click" | "switch", "light off" |
| `sfx_footsteps` | "indoor footsteps tile", "shoes hallway" | "footsteps indoor" |
| `sfx_lab_door_open` | "heavy door open hospital", "lab door" | "door open heavy" |
| `sfx_glass_drop` | "glass bottle drop NO break", "bottle thud" | "glass drop" |
| `sfx_bar_ambient` | "bar crowd ambience korean", "izakaya chatter" | "bar ambient", "restaurant" |

> **유리병_떨어짐 키워드 가드 (12세 등급 — CONVENTIONS §8):**
> ❌ 회피: glass shatter / glass break / broken glass  ✅ 채택: glass drop / bottle thud / soft drop (CONVENTIONS §8 12세 가드레일)

### 4.3 라이선스 추적표 (효과음 — 라이선스/표기 면제, 2026-05-06 PM 결정)

**PM 결정 (2026-05-06 W4·W5 후속 클린업)**: SFX는 곡(BGM)이 아니므로 라이선스 추적/표기 의무 면제. 11행 일괄 "라이선스/표기 면제" 처리. ID3 재태깅 미진행 — Comment "TBD: PM 추적 대기" 잔존은 음질·재생 무영향이라 그대로 유지.

| ID | 출처 채택 | 라이선스 | 표기 의무 |
|---|---|---|---|
| `sfx_katalk_notify` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_realize` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_timer_out` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_pageturn` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_click` | **Phase 1.5 v1 (자체제작)** | PM 본인 저작권 | 없음 |
| `sfx_ktx_run` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_suitcase_wheels` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_light_off` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_footsteps` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_lab_door_open` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_glass_drop` | PM 외부 다운 | 효과음 — 면제 | 없음 |
| `sfx_bar_ambient` | PM 외부 다운 | 효과음 — 면제 | 없음 |

**status `done` 조건 충족 (2026-05-06)**: 라이선스/표기 면제 결정 + W5 통합(자산 이동 + 매니페스트) + 자산 404 회귀 0건. W6 QA 청취 검증은 별도 라운드(QA-PLAN §3·§5).

---

## 5. 파일 사양

| 항목 | 값 |
|---|---|
| 폴더 (현재 — W5 통합 완료, 2026-05-06) | `public/snd/sfx/sfx_*.mp3` (CONVENTIONS §5.2 SSoT) |
| 폴더 (이력 보관) | `docs/assets/sfx/{_candidates,확정,직접 corp}/` — 후보·원본·PM 직접 crop |
| 파일명 | `sfx_<id>.mp3` (영문 snake_case + sfx_ 프리픽스 — CONVENTIONS §5.2 SSoT, 변경 금지) |
| 형식 | MP3 / **CBR 128 kbps** (BGM 192k 대비 저용량 — SFX는 짧고 많아 빌드 크기 절감) |
| 음량 정규화 | **-18 LUFS Integrated** (BGM -16 대비 -2 dB — SFX는 BGM 위에 얹히므로 살짝 낮게) |
| 채널 | UI/단발 → **모노** (`-ac 1`) / 환경음 루프 → **스테레오** (`-ac 2`) |
| ID3 태그 | `Album="kmu-vn SFX"`, `Comment="<URL> / <라이선스>"` (BGM과 동일 패턴) |

**채널 분기 표:**

| 영문 ID | 채널 |
|---|---|
| `sfx_click` / `sfx_pageturn` / `sfx_timer_out` / `sfx_realize` / `sfx_katalk_notify` | 모노 |
| `sfx_suitcase_wheels` / `sfx_light_off` / `sfx_footsteps` / `sfx_lab_door_open` / `sfx_glass_drop` | 모노 |
| `sfx_ktx_run` | 스테레오 (루프, 공간감) |
| `sfx_bar_ambient` | **mono** (2026-05-06 PM "다 mono로" 명령으로 stereo→mono 변경. 후속 라운드 ktx_run mono 변경 검토) |

**길이 제약:**
- P0 시스템 (`sfx_click` 등): 50~400ms
- P0 카톡 알림: 400~800ms
- P1 단발 (suitcase_wheels, light_off, footsteps, lab_door_open, glass_drop): 1~3초
- P1 루프 (ktx_run, bar_ambient): 5~10초

**volume 기본값:** 시나리오 큐에 명시된 값 우선 (`volume=0.3~0.6`). 매핑 테이블 §2 비고에 권장값.

---

## 6. 후처리 룰 (Audacity + ffmpeg, BGM-list §6 패턴 차용)

### 6.1 Audacity 워크플로

1. **노이즈 게이트** — `Effect > Noise Reduction` 또는 `Noise Gate`로 끝부분 무음 정리
2. **시작 5ms 페이드 인** — 클릭 노이즈 방지
3. **끝 30ms 페이드 아웃** — BGM의 50ms보다 짧음 (SFX는 끝 인지가 중요)
4. **음량 정규화 — -18 LUFS Integrated** — `Effect > Volume and Compression > Loudness Normalization`
5. **루프 검증** (sfx_ktx_run / sfx_bar_ambient) — 끝-시작 매끄러움 확인
6. **WAV로 export** (16-bit PCM, 44.1 kHz)

### 6.2 ffmpeg 변환 (128 kbps CBR MP3)

**모노 (UI/단발):**
```bash
ffmpeg -i sfx_katalk_notify.wav -codec:a libmp3lame -b:a 128k -ac 1 \
  -metadata album="kmu-vn SFX" \
  -metadata comment="<URL> / <라이선스>" \
  sfx_katalk_notify.mp3
```

**스테레오 (루프 환경음):**
```bash
ffmpeg -i sfx_ktx_run.wav -codec:a libmp3lame -b:a 128k -ac 2 \
  -metadata album="kmu-vn SFX" \
  -metadata comment="<URL> / <라이선스>" \
  sfx_ktx_run.mp3
```

**배치 처리 (모노 일괄):**
```bash
for f in _candidates/sfx_mono/*.wav; do
  base=$(basename "$f" .wav)
  ffmpeg -i "$f" -codec:a libmp3lame -b:a 128k -ac 1 \
    -metadata album="kmu-vn SFX" \
    "docs/assets/sfx/${base}.mp3"
done
```

### 6.3 자체 검증 (BGM 패턴 동일)

- ffprobe로 LUFS, bitrate, duration, ID3 확인
- 8 한글 SFX + 4 시스템 SFX (총 12개) LUFS 편차 < 1 dB
- 모노 파일 `channels=1`, 스테레오 파일 `channels=2`

---

## 7. 폴더 배치 + 매니페스트

**현재 (W5 통합 완료, 2026-05-06):** `public/snd/sfx/sfx_*.mp3` (CONVENTIONS §5.2 SSoT) — 12개 mp3 운영본.

**이력 보관:** `docs/assets/sfx/{_candidates,확정,직접 corp}/` — Phase 1.5 합성 후보 15개 / Phase 2 외부 다운 원본 11개 / Phase 2.5 4차 PM 직접 crop 6개.

**매니페스트 (2026-05-06 재생성):** `public/manifest.json` `"sfx": [...]` 8건 등재 (시나리오 큐 사용분만 — `sfx_click/pageturn/realize/timer_out` 4종은 코드 직접 호출이라 매니페스트 의도 누락, 자산 파일은 12개 모두 배치). build-manifest.ts v0.2 / `npm run manifest` 통과. `npm run build` + dist 자산 정상 복사 + vitest 72/72 + validate-build 통과.

---

## 8. 마일스톤 #3 후속 작업 체크리스트 (Phase 2 + Phase 2.5)

> **2026-05-06 갱신 — 대부분 완료.** 잔여 항목만 ⬜ 표시.

1. ✅ **추가 큐 추출** — `grep "\[SFX:" 03-story/scenarios/`. 마일스톤 #3 도달 후 큐 매트릭스 §1 갱신 (총 36회 / 8종류)
2. ✅ **P2 → P0/P1 승격 결정** — 신규 P2 종류 0건 확정 (시나리오 작가가 환경음 모놀로그/지문 처리)
3. ✅ **카톡 알림음 자체 제작** — Phase 1.5 ffmpeg 합성 3개 후보 (단 PM 최종은 외부 다운본 채택 — §3.6)
4. ✅ **CC0 항목 다운로드** — PM이 P0 4종 + P1 7종 외부 다운, `docs/assets/sfx/확정/` 배치
5. ✅ **§6 후처리 적용 (Phase 2.5)** — Claude ffmpeg 일괄 crop·정규화·페이드·128k mp3·ID3 (§3.6 표 참조)
6. ✅ **`docs/assets/sfx/`에 배치** — 12개 모두 ffprobe 검증 통과
7. ✅ **§3.6 결과 표 갱신** — Phase 2 + Phase 2.5 결과 박힘
8. ✅ **status: in-progress → review** (Phase 2.5 완료 시점, 2026-05-06)
9. ✅ **PM 청취 검증** — 1차→2차→3차→4차 PM 직접 crop 라운드 완료 (2026-05-06):
   - ✅ 1차/2차/3차에서 통과한 6종(`sfx_katalk_notify` / `sfx_realize` / `sfx_click` / `sfx_ktx_run` / `sfx_suitcase_wheels` / `sfx_footsteps`)
   - ✅ **4차 PM 직접 crop 6종**(`sfx_timer_out` / `sfx_pageturn` / `sfx_light_off` / `sfx_lab_door_open` / `sfx_glass_drop` / `sfx_bar_ambient`) — `직접 corp/` 폴더 → Claude mono 변환·LUFS·페이드·128k mp3·ID3
   - ✅ PM "다 mono로" 명령 → `sfx_bar_ambient` stereo→mono (단 `sfx_ktx_run`은 PM 명령 범위 외, stereo 유지)
   - §3.7 후보 10개는 PM 직접 crop으로 보류 → `_candidates/` 보관 (이력)
   - §5 권장 길이 초과 모두 PM 허용 (별도 라운드 §5 본문 갱신)
10. ✅ **§4.3 라이선스 추적표 처리** — 효과음 라이선스/표기 면제 결정 (2026-05-06 PM)
11. ⬜ **`06-engine/SCENE-FORMAT.md` §1.1 매핑 참조 코멘트 추가** — "한글 표기는 `docs/assets/SFX-list.md` §2 매핑 테이블을 통해 영문 ID로 변환" (별도 마이너 라운드)
12. ⬜ **`scripts/compile-scene.ts` SFX 매핑 로딩** — 미매핑 SFX 빌드 에러 (W5 컴파일러 갱신, v0.3+)
13. ✅ **W5 통합** — `docs/assets/sfx/*.mp3` → `public/snd/sfx/` 이동 + `npm run manifest` 재생성 + dist 자산 정상 복사 + vitest 72/72 + validate-build 통과 (2026-05-06)
14. ⬜ **W6 QA** — H4 거절 엔딩 풀 플레이 + 카톡 BGM ↔ SFX 음역대 + 변태 자기자각 + 모바일 청취
15. ✅ **status: review → done** (2026-05-06 W4·W5 후속 클린업 라운드 — 자산 이동·매니페스트·라이선스 면제 결정 완료)

---

## 9. QA 체크리스트

### 9.1 큐레이션 라운드 자체 (Phase 2 완료 후)

- [ ] 시스템 4 + 한글 8 + P2 추가 모두 `docs/assets/sfx/` 존재 (파일명 CONVENTIONS §5.2 정확)
- [ ] 각 파일 ID3 태그 — Album="kmu-vn SFX" + Comment(URL+라이선스) 채워짐 (ffprobe 자동 검증)
- [ ] 128 kbps CBR — 모든 SFX 정합 (실측 ±1 kbps 허용)
- [ ] -18 LUFS 정규화 적용
- [ ] 모노/스테레오 채널 분기 정합 (§5 표 준수)
- [ ] 길이 제약 정합 (§5 길이 제약 표)
- [ ] **유리병_떨어짐 깨짐 X** (12세 가드레일 — CONVENTIONS §8)
- [ ] **sfx_timer_out 불쾌 알람 X** (12세 톤)
- [ ] **sfx_realize 놀람 X, 코믹 톤** (자기자각 페어 일관성)
- [ ] 가사·보컬 0건 (전체 청취)

### 9.2 W5 콘텐츠 통합 시

- [ ] `docs/assets/sfx/` 모든 파일 → `public/snd/sfx/` 이동 + `manifest.json` `"sfx"` 배열 등재
- [ ] 시나리오 한글 SFX 큐 31+회 모두 8(이상) 영문 ID로 매핑 (빌드 검증 스크립트, MASTER-PLAN §8.1)
- [ ] `scripts/md-to-scene.ts` 변환 시 미매핑 SFX 0건

### 9.3 W6 배포 전 수동 QA (QA-PLAN §3·§5 정합)

- [ ] H4 거절 엔딩 풀 플레이 — `sfx_katalk_notify` + `sfx_timer_out` 동시/연속 재생 시 톤 충돌 X (수동 청취)
- [ ] 카톡 모달 — `bgm_katalk`(앰비언트 패드, 60~75 BPM) + `sfx_katalk_notify`(1.5~3 kHz 챠임) 음역대 충돌 X
- [ ] 변태 자기자각 시퀀스 — `sfx_realize` 200~400ms ↔ ANIMATION-SPEC §9 white flash 100ms 동기 정합
- [ ] 모바일 + 데스크톱 양쪽 청취 — SFX 음량 밸런스 OK (LUFS 편차 < 1 dB)
- [ ] 변태 망상 페어 챕터당 1~2회 한정 → SFX 과노출 X (CONVENTIONS §8)

---

## 10. 사용자 검증 (Phase 1 완료 시)

- [ ] 매핑 테이블 §2 14행 정확 (한글↔영문 매핑 + P0~P3 + 등장 위치)
- [ ] 카톡 알림음 자체 제작 결정 OK?
- [ ] 유리병_떨어짐 깨짐 X 12세 가드레일 OK?
- [ ] -18 LUFS / 128 kbps mp3 / 모노 vs 스테레오 분기 OK?
- [ ] Phase 2 마일스톤 #3 후 진행 타이밍 OK?
- [ ] 폴더 임시 위치 `docs/assets/sfx/` → 최종 `public/snd/sfx/` (W5 이동) OK?

---

## 11. 위험 / 주의

1. **카톡 알림음 자체 제작 시간 부담** — 사용자 결정 우선이지만 시간 제약 시 §3 폴백 옵션(Freesound CC0 임시 → 출시 전 교체).
2. **유리병_떨어짐 12세 등급 검토** — ch02 카데바 시퀀스 인접. 깨짐(shatter) 사운드는 호러 분위기 → "낙하 톡(drop)"만 큐레이션.
3. **마일스톤 #3 SFX 큐 폭증 가능성** — Ch.6 축제·체전 + 엔딩 16개에서 환경음 다수 추가. P2 placeholder 행은 마일스톤 #3 후 P0/P1 승격 가능.
4. **루프 vs 단발 구분** — `sfx_ktx_run`, `sfx_bar_ambient`는 루프 필수. SCENE-FORMAT §1.1 `loop=true` 디렉티브 옵션 추가 검토는 별도 라운드.
5. **카톡 BGM ↔ SFX 음역대 충돌** — `bgm_katalk` 신스 패드 60~75 BPM (저~중역대) ↔ `sfx_katalk_notify` 1.5~3 kHz (중~고역대) 분리 설계. Phase 2 청취 검증 필수.
