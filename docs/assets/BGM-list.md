---
module: BGM-list
hierarchy: 4
depends-on:
  - 00-master/MASTER-PLAN.md
  - 00-master/CONVENTIONS.md
  - 03-story/STORY-BIBLE.md
  - 05-ui-design/ANIMATION-SPEC.md
  - 06-engine/SCENE-FORMAT.md
outputs:
  - BGM 8트랙 큐레이션 명세
  - 트랙별 라이선스/크레딧 추적표
  - 사용자 다운로드 워크플로 체크리스트
status: done
---

# docs/assets/BGM-list.md

> BGM 8트랙 큐레이션 명세. 사용자(PM)가 DOVA-Syndrome / Free Music Archive / Freesound CC0를 돌며 트랙당 후보 2~3개 → 1개 선정 → `public/snd/bgm/`에 배치하는 워크플로.
>
> **SSoT 출처:** MASTER-PLAN §6.1 (8트랙 정의, frozen) + CONVENTIONS §5.2 (영문 파일명) + STORY-BIBLE §9 (분위기) + ANIMATION-SPEC §12 (거절 엔딩 페이드 타이밍) + 시나리오 7개 한글 BGM 큐 58개.
>
> **분담:** Claude는 본 명세만. 후보 다운로드·라이선스 확인·후처리·최종 선정은 PM 직접 작업 (MASTER-PLAN §10.1).

---

## 0. 큐레이션 완료 요약 (2026-04-29 → W5 통합 2026-05-06)

8개 트랙 후처리 완료, `public/snd/bgm/`에 배치 (W4·W5 후속 클린업 라운드 W5 통합 시 `docs/assets/bgm/`에서 이동 — 2026-05-06).

| 트랙 | 곡명 | 작곡자 | 라이선스 | 길이(실측) | 비고 |
|---|---|---|---|---|---|
| `bgm_main_theme` | 春よ、強く美しく | 龍崎一 | DOVA-Syndrome | 134.1s | — |
| `bgm_daily` | カフェBGM | H★ | DOVA-Syndrome | 318.1s | 25회 빈도 → 긴 트랙 의도적 |
| `bgm_comic` | コミカルな時間 | 田中芳典 | DOVA-Syndrome | 113.1s | — |
| `bgm_tension` | 焦燥 | マニーラ | DOVA-Syndrome | 167.1s | — |
| `bgm_romantic` | Is This Love | gooset | DOVA-Syndrome | 153.2s | — |
| `bgm_sad` | あの日の僕たちへ(Dear Our Past Days) | 蒲鉾さちこ | DOVA-Syndrome | 136.1s | — |
| `bgm_climax` | 感動をあなたに #2 | Kyaai | DOVA-Syndrome | 176.1s | **도입부 10초 crop 적용** |
| `bgm_katalk` | Ambient Pads Loop 04 | DRAGON-STUDIO | Pixabay License | 19.2s | 짧은 루프, 19초 |

**ffprobe 검증:** 8트랙 모두 192 kbps CBR + ID3(Artist / Album="kmu-vn BGM" / Comment="<URL> / <라이선스>") 정확히 태깅됨 (2026-04-29 ffprobe 자동 검증 통과).

**큐레이션 라운드:** Phase 1(후보 수집) → Phase 2(시나리오 정합 시청) → Phase 3(최종 선정 + 후처리) → Phase 4(라이선스 추적표 + ID3 태깅) 모두 완료. 본 .md `status: done`.

**마일스톤 #3 게이트 유지:** H1/H2/H3/H5 트루엔딩 + END_SOLO_SUMMER 시나리오 작성 후 `bgm_sad` / `bgm_climax` 1회 재정합 라운드 (PROGRESS-TRACKER 참조). 트랙 자체는 그대로 유지될 가능성 높음, 큐 위치·페이드 타이밍만 점검.

---

## 1. 개요 — 8트랙 한 줄 요약

시나리오는 한글 명칭(`[BGM: 일상]`)으로 큐를 박고, 빌드 시 컴파일러가 영문 ID(`bgm_daily`)로 변환한다. 한글↔영문 매핑은 본 §1 표가 SSoT.

### 1.1 시나리오 큐 빈도 (`grep "\[BGM: <한글>\]"` 실측, 2026-04-29 기준)

| 영문 ID | 한글 명칭 | prologue | ch01_ot | ch02_anatomy | ch03_dongsan | ch04_library | ch05_decision | ch06_h4_seoyoon | **총 큐** |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `bgm_daily` | 일상 | 3 | 5 | 2 | 3 | 4 | 4 | 4 | **25** |
| `bgm_katalk` | 카톡 | 0 | 1 | 1 | 1 | 2 | 2 | 3 | **10** |
| `bgm_main_theme` | 메인_테마 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | **7** |
| `bgm_romantic` | 로맨틱 | 0 | 0 | 0 | 0 | 0 | 3 | 3 | **6** |
| `bgm_comic` | 코믹 | 0 | 1 | 1 | 1 | 0 | 1 | 1 | **5** |
| `bgm_tension` | 긴장 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | **2** |
| `bgm_climax` | 클라이맥스 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | **2** |
| `bgm_sad` | 슬픔 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | **1** |
| **합계** | | 4 | 8 | 7 | 6 | 7 | 11 | 15 | **58** |

> **풋노트 (grep 정합)**: `grep "\[BGM: 슬픔"` 은 ch06_h4_seoyoon에서 2건을 잡지만 L1188 1건은 거절 엔딩 8단계 명세 **표 안의 코드 인용**이라 실행 큐가 아님. 본 표는 실행 큐만 카운트(L1021의 1회).
>
> 추가로 `[BGM_STOP]` 큐 30회 (prologue 2 + ch01 3 + ch02 3 + ch03 3 + ch04 6 + ch05 5 + ch06 8). fade=2 기본·fade=3·fade=4 일부.

### 1.2 큐레이션 우선순위

| 순위 | 트랙 | 사유 |
|---|---|---|
| **A (최우선)** | `bgm_daily`, `bgm_main_theme`, `bgm_katalk` | 빈도 최고(25/7/10회). 7개 시나리오 전체에 등장. 잘못 고르면 게임 첫인상 + 반복 노출로 피로감. |
| **B (중간)** | `bgm_romantic`, `bgm_comic`, `bgm_tension` | 시그니처 모먼트(호감도 상승 / 변태 망상 페어 / 카데바·시험). 변별력 중요. |
| **C (마일스톤 #3 게이트)** | `bgm_sad`, `bgm_climax` | 엔딩 시나리오에서만 사용. 거절 엔딩(ch06_h4_seoyoon) 외 H1/H2/H3/H5 트루엔딩 + END_SOLO_SUMMER 라우트 미작성 → **마일스톤 #3 직후 1회 검증 라운드 필수** (PROGRESS-TRACKER 게이트 참조). |

**마일스톤 #3 정의:** `03-story/scenarios/` 산하 H1/H2/H3/H5 트루엔딩 라우트 + END_SOLO_SUMMER 시나리오 풀 텍스트 작성 완료 시점. 이때 `bgm_climax` 큐 추가, `bgm_sad`도 다른 BAD/거절 분기 큐 추가 가능 — 큐 위치·페이드 타이밍을 본 §3.7~3.8과 재정합.

---

## 2. 공통 규칙

### 2.1 파일

| 항목 | 값 |
|---|---|
| 폴더 (현재 — W5 통합 완료, 2026-05-06) | `public/snd/bgm/` (CONVENTIONS §5.2 SSoT) |
| 폴더 (이력) | `docs/assets/bgm/`은 mp3 8개 이동 후 비어 있음 (2026-04-29 큐레이션 산출물 → 2026-05-06 W5 통합 이동) |
| 파일명 | `bgm_<id>.mp3` (CONVENTIONS §5.2 SSoT — 변경 금지) |
| 형식 | MP3 / CBR 192 kbps (Howler.js 호환, 모바일 디코딩 부담 적음) |
| 음량 정규화 | **-16 LUFS Integrated** (모바일·데스크톱 통일, 마스터 게인 안정) |
| 길이 권장 | 60~120초 (트랙별 §3 참조) |
| 끝 처리 | 끝 50ms 무음 페이드 (클릭 노이즈 방지). 단 루프 시 시작점과 자연 연결 필수 |
| ID3 태그 | `Artist` = 작곡자, `Album` = "kmu-vn BGM", `Comment` = 출처 URL + 라이선스 (예: "DOVA-Syndrome / CC BY") |

### 2.2 페이드 토큰 매핑 (SCENE-FORMAT §1.1 + ANIMATION-SPEC)

`[BGM: <트랙> fade=N volume=V]` 의 `fade=N` 정의:

| `fade=` | 시간(ms) | 용도 |
|---|---|---|
| `1` | 150 | 빠른 전환 (코믹 페어 시작·종료, 가벼운 분위기 변환) |
| `2` | 600 | 기본값 (일반 씬 전환) |
| `3` | ~900 | 차분한 전환 (카톡 모달 진입, 호감 상승 직전) |
| `4` | 2000~ | 감정 고조 (메인_테마, 클라이맥스, 거절 엔딩 슬픔 페이드 인) |

볼륨 기본값 0.5. 씬에서 `volume=` 지정 시 우선. 카톡 모달 동시 재생 시 BGM volume 0.3 이하 또는 stop.

### 2.3 12세 등급 + 욕설 금지 가드레일 (CONVENTIONS §8)

- **인스트루멘털 전용.** 가사/보컬 있는 트랙은 무조건 폐기. 의도와 무관한 가사 노출 위험.
- 호러·공포·과도한 슬픔 톤 금지 (12세). 긴장은 "두근거림"까지, 슬픔은 "잔잔한 미련"까지.
- 가사 없는 허밍/스캣도 일관성 위해 폐기.

---

## 3. 트랙별 상세

각 트랙 상단 표 = 명세 SSoT. 하단 "현장 시트" 박스 = DOVA/FMA/Freesound에서 바로 복붙해 검색·체크할 압축 시트.

---

### 3.1 `bgm_main_theme` — 메인_테마

**용도:** 타이틀 화면 루프, 오프닝 무비 배경, 각 챕터 종료 직전 여운, 트루엔딩 크레딧.
**시나리오 매핑:** prologue:L310, ch01_ot:L457, ch02_anatomy:L513, ch03_dongsan:L573, ch04_library:L761, ch05_decision:L845, ch06_h4_seoyoon:L757 — 7회 (모든 챕터 마무리 컷에 등장).
**무드:** 봄·청춘·따뜻함·희망. 게임 정체성. STORY-BIBLE §9 "봄, 청춘, 따뜻함".
**BPM:** 90~110.
**악기 톤:** 어쿠스틱 기타 + 스트링 + 부드러운 피아노. 드럼은 가벼운 브러시 정도, 강한 비트 X.
**길이 / 루프:** 90~120초, 자연 루프 필수 (타이틀 화면 무한 반복).
**볼륨 기본:** 0.5~0.6.
**페이드 권장:** 진입 `fade=4` (시나리오 7회 모두 fade=4), 정지 `fade=2`.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "春" "青春" "アコースティック" "希望" "爽やか"
  Free Music Archive: spring, acoustic, hopeful, youth, cinematic
  Freesound (CC0): acoustic guitar, hopeful, spring, ambient pop
선정 체크 (4):
  [ ] 인트로 4초 이내 안정 (페이드 인 자연)
  [ ] 90~120초 루프 자연 (DAW에서 끝-시작 매끄러움)
  [ ] 가사·보컬 0
  [ ] 12세 등급 톤 (지나친 비장감 X, K-드라마 OST급 따뜻함)
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.2 `bgm_daily` — 일상

**용도:** 강의실, 캠퍼스, 자취방, 카페, 일상 대화. 게임 내 기본 루프.
**시나리오 매핑:** prologue:L31/L109/L213, ch01_ot:L36/L80/L263/L310/L341, ch02_anatomy:L253/L406, ch03_dongsan:L45/L186/L297, ch04_library:L48/L311/L441/L687, ch05_decision:L51/L115/L440/L526, ch06_h4_seoyoon:L53/L185/L952/L997 — **25회 (최다)**.
**무드:** 잔잔하고 따뜻. 일상의 평온. 밝지만 들뜨지 않음.
**BPM:** 80~95.
**악기 톤:** 피아노 + 어쿠스틱 기타 + 가벼운 마림바 또는 글로켄슈필. 멜로디 강하지 않게(반복 노출 시 피로 X).
**길이 / 루프:** 100~120초 권장. 25회 반복 노출 → 짧은 루프는 빠르게 질림.
**볼륨 기본:** 0.4~0.6 (씬마다 fade=2 + volume=0.4~0.6 다양).
**페이드 권장:** 진입 `fade=2~3`, 정지 `fade=2`.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "日常" "ほのぼの" "穏やか" "ピアノ" "カフェ"
  Free Music Archive: slice of life, calm, piano, easy listening, gentle
  Freesound (CC0): calm piano loop, daily life, ambient, light
선정 체크 (4):
  [ ] 멜로디 약함 (귀에 박히지 않음 — 반복 25회 노출 OK)
  [ ] 100~120초 루프 자연
  [ ] 가사·보컬 0
  [ ] 12세 톤 (너무 처지지도 들뜨지도 않음)
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.3 `bgm_comic` — 코믹

**용도:** 변태 망상 페어 시그니처 컷, 김규민·조나단 가벼운 농담, 동기 단톡 폭주. 챕터당 1~2회.
**시나리오 매핑:** ch01_ot:L296, ch02_anatomy:L392, ch03_dongsan:L172, ch05_decision:L707, ch06_h4_seoyoon:L344 — 5회.
**무드:** 가벼운 활기, 장난스러움. 분주하지만 귀엽게.
**BPM:** 110~130.
**악기 톤:** 우쿨렐레 / 마림바 / 피치카토 스트링 / 핸드클랩. 무게감 있는 베이스 X.
**길이 / 루프:** 40~60초 OK (변태 망상 페어가 짧음 — 망상→자기자각→정상복귀 한 사이클 ~30초). 길어도 80초.
**볼륨 기본:** 0.4 (시나리오 5회 모두 0.4).
**페이드 권장:** 진입 `fade=1~2` (가벼운 전환), 정지 `fade=1~2`.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "コミカル" "ほのぼの" "ウクレレ" "おどけ" "可愛い"
  Free Music Archive: ukulele, comedy, playful, marimba, quirky
  Freesound (CC0): ukulele loop, pizzicato, comedic, light bouncy
선정 체크 (4):
  [ ] 짧은 루프(40~60초) 자연
  [ ] 가벼움 — 변태 망상의 "장난스러움"이지 진지한 코미디 X
  [ ] 가사·보컬 0
  [ ] 12세 톤 (천박함 X, 오글거림 X)
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.4 `bgm_tension` — 긴장

**용도:** 카데바 첫 대면, 시험 직전, 고백 직전 정적. 호러 X, 진지한 두근거림.
**시나리오 매핑:** ch02_anatomy:L42/L118 — 2회 (현재는 해부학 첫 대면만). 향후 시험 챕터·고백 직전에 추가 예정.
**무드:** 두근거림, 무게감, 진지함. 12세 등급 안에서 무겁지만 공포 X.
**BPM:** 70~90.
**악기 톤:** 스트링 트레몰로 + 낮은 피아노 + 미묘한 첼로 드론. 타악기 강한 비트 X (게임 호러 톤 회피).
**길이 / 루프:** 70~90초.
**볼륨 기본:** 0.4~0.5.
**페이드 권장:** 진입 `fade=2`, 정지 `fade=2~3`.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "緊張" "シリアス" "ストリングス" "厳粛" "鼓動"
  Free Music Archive: tension, suspense, strings, serious, contemplative
  Freesound (CC0): string tremolo, suspense ambient, slow piano dark
선정 체크 (4):
  [ ] 호러 X (드론·고음 비명 X, 12세 등급)
  [ ] 70~90초 루프 자연
  [ ] 가사·보컬 0
  [ ] 카데바 첫 대면 — 무겁되 진중한 톤 (학생의 첫 의례)
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.5 `bgm_romantic` — 로맨틱

**용도:** 호감도 상승 이벤트 CG, 단둘이 있는 정적, 트루엔딩 직전 잔잔한 구간.
**시나리오 매핑:** ch05_decision:L552/L576/L724, ch06_h4_seoyoon:L468/L500/L623 — 6회. 마일스톤 #3 후 H1/H2/H3/H5에서 추가 예상.
**무드:** 잔잔한 설렘. 너무 달달하지 않게(과도하면 오글거림). K-드라마 잔잔한 OST.
**BPM:** 70~85.
**악기 톤:** 피아노 위주 + 가벼운 스트링 패드. 솔로 바이올린/첼로 1개 추가 OK. 드럼 X.
**길이 / 루프:** 80~100초.
**볼륨 기본:** 0.4~0.5.
**페이드 권장:** 진입 `fade=2~3`, 정지 `fade=2`.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "ロマンチック" "ピアノソロ" "切ない" "恋" "夜景"
  Free Music Archive: romantic piano, gentle strings, love theme, intimate
  Freesound (CC0): solo piano romantic, strings romantic, soft ambient
선정 체크 (4):
  [ ] 80~100초 루프 자연
  [ ] 오글거림 X (지나친 비브라토·강렬한 멜로디 X)
  [ ] 가사·보컬 0
  [ ] 12세 톤 (성적 분위기 X, 잔잔한 설렘까지)
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.6 `bgm_sad` — 슬픔 ⚠️ 마일스톤 #3 게이트

**용도:** 거절 엔딩(H4), 배드 엔딩, END_SOLO_SUMMER 일부. **거절 엔딩 핵심 — ANIMATION-SPEC §12 정합 필수.**
**시나리오 매핑:** ch06_h4_seoyoon:L1021 — 1회 (거절 엔딩 풀스크린 카톡 직후). 마일스톤 #3 후 다른 BAD 분기·END_SOLO_SUMMER에서 추가 예상.
**무드:** 잔잔한 미련, 한숨. 비극·울음 X (12세). "답장이 늦어서 미안해" 카톡 직후 들리는 어쿠스틱 한숨 한 줌.
**BPM:** 60~75.
**악기 톤:** 미니멀 피아노 솔로 + 어쿠스틱 기타 1개. 스트링 추가 시 패드 정도. 첼로 솔로 OK 단 비통 X.
**길이 / 루프:** 60~90초 (거절 엔딩 전체 17.5초 시퀀스 + 크레딧까지 커버).
**볼륨 기본:** 0.5.
**페이드 권장:** 진입 `fade=4` (시나리오 L1021 fade=4 정합 / ANIMATION-SPEC §12 페이드 인 500~2500ms = 2초 내 안정 도달 필수).

**⚠️ ANIMATION-SPEC §12 거절 엔딩 정합 룰 (절대):**
- 인트로 0~2초 안에 메인 멜로디 안정 도달. 갑자기 시작되거나 인트로 4초+ 트랙은 부적합.
- 카톡 메시지 4줄 등장(1500~4500ms) 동안 BGM이 메시지를 가리지 않음 — 보컬·강한 멜로디 구간 회피.
- 거절 엔딩 17.5초 전체 + 크레딧 30초 + 갤러리 해금 토스트까지 자연 전개.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "切ない" "悲しい" "別れ" "ピアノソロ" "雨"
  Free Music Archive: melancholic piano, sad acoustic, bittersweet, farewell
  Freesound (CC0): minimal piano sad, melancholy guitar, soft cello
선정 체크 (4):
  [ ] 인트로 0~2초 안에 안정 (ANIMATION-SPEC §12 페이드 인 정합)
  [ ] 60~90초, 크레딧 30초까지 자연 (트랙 끝나도 어색하지 않게 페이드 가능)
  [ ] 가사·보컬 0
  [ ] 12세 톤 — 비극·울음 X, 잔잔한 미련까지
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.7 `bgm_climax` — 클라이맥스 ⚠️ 마일스톤 #3 게이트

**용도:** 트루엔딩 직전 30초+ 고조 + 트루엔딩 절정 컷. ANIMATION-SPEC §12 트루엔딩 공통 구조에서 영상 페이드 인과 동시 진행.
**시나리오 매핑:** ch06_h4_seoyoon:L867(fade=4 volume=0.6, 트루 직전), L931(fade=2 volume=0.7, 트루 절정) — 2회. 마일스톤 #3 후 H1/H2/H3/H5 트루엔딩 라우트에서 +4회 예상 → 총 6회.
**무드:** 감정 고조, 결정의 순간, 봄의 절정. 메인_테마와 같은 정체성이되 어레인지 풀파워.
**BPM:** 100~120.
**악기 톤:** 풀 어레인지 — 피아노 + 스트링 섹션 + 어쿠스틱 기타 + 가벼운 드럼 + 호른 가능. 메인_테마 변주여도 OK (별도 트랙으로 큐레이션).
**길이 / 루프:** 80~120초. 트루엔딩 7초 영상 + 엔딩 타이틀 + 크레딧 30초 커버.
**볼륨 기본:** 0.6~0.7 (시나리오 L867 0.6, L931 0.7 — 절정에서 0.7).
**페이드 권장:** 진입 `fade=4` (감정 고조), 정지 `fade=2~4`.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "感動" "クライマックス" "オーケストラ" "希望" "壮大"
  Free Music Archive: cinematic uplifting, orchestral hopeful, climax, triumphant
  Freesound (CC0): orchestral climax, full orchestra hopeful, cinematic uplift
선정 체크 (4):
  [ ] 30초+ 고조 자연 (영상 페이드 인 + 엔딩 타이틀까지 텐션 유지)
  [ ] 80~120초 길이 (트루엔딩 시퀀스 전체 커버)
  [ ] 가사·보컬 0
  [ ] 메인_테마와 톤 일관 (같은 작곡자 또는 같은 무드)
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.8 `bgm_katalk` — 카톡

**용도:** 카톡 모달 표시 중 잔잔히. 일상 BGM 위에 덮이거나, 일상 BGM stop 후 단독.
**시나리오 매핑:** ch01_ot:L179, ch02_anatomy:L433, ch03_dongsan:L462, ch04_library:L187/L553, ch05_decision:L325/L741, ch06_h4_seoyoon:L316/L358/L649 — 10회.
**무드:** 미니멀 앰비언트, 부드러운 알림감. 카톡 알림음(SFX `sfx_katalk_notify`)과 어울리되 겹치지 않음.
**BPM:** 60~75 (느린 호흡).
**악기 톤:** 신스 패드 + 가벼운 글로켄슈필 / 셀레스타. 멜로디 거의 없는 앰비언트.
**길이 / 루프:** 30~50초 (카톡 1세션 30초~2분, 짧은 루프 OK).
**볼륨 기본:** 0.3~0.4 (다른 BGM과 동시 재생 가능, 앰비언트 깔개 역할).
**페이드 권장:** 진입 `fade=3`, 정지 `fade=1~3`.

**주의:** H4 답장 타이머 미니게임(15초) 중에는 `bgm_katalk`이 톤 다운 또는 stop. 타이머 SFX(`sfx_timer_out` 등)가 들려야 함.

```
━━━━━━━━ 현장 시트 (복붙) ━━━━━━━━
검색 키워드:
  DOVA-Syndrome:  "アンビエント" "穏やか" "通知" "シンセパッド" "静か"
  Free Music Archive: ambient pad, minimal chillout, soft synth, lo-fi calm
  Freesound (CC0): ambient pad loop, minimal synth, soft glockenspiel
선정 체크 (4):
  [ ] 30~50초 짧은 루프 자연
  [ ] 멜로디 거의 없음 (다른 BGM과 동시 재생 OK, 알림 SFX와 겹침 X)
  [ ] 가사·보컬 0
  [ ] 카톡 알림음 + 타이머 SFX 위로 들리도록 음역대 중·고역 비움
크레딧:
  곡명:           ___________________________
  작곡자:         ___________________________
  출처 URL:       ___________________________
  라이선스:       □ CC0  □ CC BY  □ 무료 상업 OK
  표기 의무:      □ 있음  □ 없음   다운로드일: ____-__-__
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4. 라이선스 우선순위

### 4.1 우선순위 (위→아래)

| 등급 | 라이선스 | 표기 의무 | 추천 사이트 |
|---|---|---|---|
| **A** | **CC0 1.0 (Public Domain)** | 없음 (선택적 크레딧) | Freesound CC0 |
| **A+** | **Pixabay Content License** | 없음 (권장) — 상업 OK, NFT/재배포 X | Pixabay Music / Pixabay SFX |
| **B** | **CC BY 4.0** | 있음 (작곡자명 + 출처 URL) | Free Music Archive, Bensound |
| **C** | **DOVA-Syndrome 무료 상업** | 사이트 정책 따름 (대부분 표기 권장) | DOVA-Syndrome (일본 사이트) |
| **D** | **CC BY-SA / CC BY-NC** | 표기 + 동일 라이선스 / **상업 X** | ⚠️ NC는 게임 배포 시 위험 — 회피 |
| ⛔ | 폐기 | 라이선스 불명 / "free for personal" / 가사 있음 | — |

**현재 채택 라이선스 분포:** 7곡 DOVA-Syndrome (C), 1곡 Pixabay (A+). 모두 게임 상업 배포(GitHub Pages 무료 공개) 가능. 표기 권장이라 §4.2 크레딧 화면에 8곡 모두 등재.

### 4.2 게임 내 크레딧 화면 양식

`src/scenes/credits.scene.json`에 다음 양식으로 자동 등재 (W5 통합 시):

```
[음악]
bgm_main_theme — 春よ、強く美しく by 龍崎一 (DOVA-Syndrome)
                 https://www.youtube.com/watch?v=mIxcW60TkmE
bgm_daily      — カフェBGM by H★ (DOVA-Syndrome)
                 https://www.youtube.com/watch?v=1TnsDT9tvwg
bgm_comic      — コミカルな時間 by 田中芳典 (DOVA-Syndrome)
                 https://youtu.be/RjsVLdf20bM
bgm_tension    — 焦燥 by マニーラ (DOVA-Syndrome)
                 https://youtu.be/kKySFiBUiZY
bgm_romantic   — Is This Love by gooset (DOVA-Syndrome)
                 https://youtu.be/MBEakI1pcNU
bgm_sad        — あの日の僕たちへ(Dear Our Past Days) by 蒲鉾さちこ (DOVA-Syndrome)
                 https://youtu.be/2YfL2azCDHQ
bgm_climax     — 感動をあなたに #2 by Kyaai (DOVA-Syndrome)
                 https://youtu.be/sq7r4eUGjgI
bgm_katalk     — Ambient Pads Loop 04 by DRAGON-STUDIO (Pixabay License)
                 https://pixabay.com/sound-effects/ambient-pads-loop-296968/
```

위 양식은 ffprobe 검증한 ID3 메타(Artist / Comment="URL / 라이선스")와 정합. W5 통합 시 자동 추출 가능.

### 4.3 라이선스 추적표 (최종 확정 — 2026-04-29)

| ID | 곡명 | 작곡자 | 출처 URL | 라이선스 | 표기 | 다운로드일 |
|---|---|---|---|---|---|---|
| `bgm_main_theme` | 春よ、強く美しく | 龍崎一 | [YouTube](https://www.youtube.com/watch?v=mIxcW60TkmE) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_daily` | カフェBGM | H★ | [YouTube](https://www.youtube.com/watch?v=1TnsDT9tvwg) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_comic` | コミカルな時間 | 田中芳典 | [YouTube](https://youtu.be/RjsVLdf20bM) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_tension` | 焦燥 | マニーラ | [YouTube](https://youtu.be/kKySFiBUiZY) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_romantic` | Is This Love | gooset | [YouTube](https://youtu.be/MBEakI1pcNU) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_sad` | あの日の僕たちへ(Dear Our Past Days) | 蒲鉾さちこ | [YouTube](https://youtu.be/2YfL2azCDHQ) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_climax` | 感動をあなたに #2 | Kyaai | [YouTube](https://youtu.be/sq7r4eUGjgI) | DOVA-Syndrome | 권장 | 2026-04-29 |
| `bgm_katalk` | Ambient Pads Loop 04 | DRAGON-STUDIO | [Pixabay](https://pixabay.com/sound-effects/ambient-pads-loop-296968/) | Pixabay License | 권장 | 2026-04-29 |

---

## 5. 사용자 다운로드 워크플로 (완료 — 2026-04-29)

### Phase 1 — 후보 수집 ✅
- [x] 각 트랙당 후보 2~3개 §3 검색 키워드로 다운로드 완료
- [x] 곡명·출처 URL·라이선스 §4.3 표 채움 완료

### Phase 2 — 시나리오 정합 시청 ✅
- [x] 변태 망상 페어 컷 ↔ `bgm_comic` 매칭 청취
- [x] ch06_h4_seoyoon 거절 엔딩 시퀀스 ↔ `bgm_sad` 매칭 — 페이드 인 안정 도달 검증
- [x] 카톡 모달 + 알림 SFX ↔ `bgm_katalk` 동시 재생 음역대 검증

### Phase 3 — 최종 1트랙 선정 + 후처리 ✅
- [x] 8개 BGM 최종 확정 (§4.3 표)
- [x] §6 후처리 룰 적용 (ffmpeg 일괄 자동화, -16 LUFS, 끝 50ms 페이드, 192 kbps CBR)
  - **특이사항: `bgm_climax` 도입부 10초 crop 적용 완료** (실측 176.1초)
- [x] 최종 파일 → `docs/assets/bgm/bgm_<id>.mp3` 배치 (W5 통합 시 `public/snd/bgm/`로 이동)

### Phase 4 — 라이선스 추적표 + 크레딧 화면 ✅
- [x] §4.3 라이선스 추적표 8행 채움
- [x] §4.2 크레딧 화면 양식 — 실 데이터 박힘
- [x] ID3 태그(Artist / Album / Comment) 8트랙 모두 적용 (ffprobe 자동 검증 통과)
- [x] 본 .md status: `draft` → **`done`**

### Phase 5 — 후속 (W5 / W6 / 마일스톤 #3)
- [x] **W5 콘텐츠 통합 (2026-05-06):** `docs/assets/bgm/` 8개 mp3 → `public/snd/bgm/` 이동 + `npm run manifest` 재생성 → `public/manifest.json` `"bgms"` 8건 등재. `npm run build` + dist 자산 정상 복사 + vitest 72/72 통과.
- [ ] **W6 QA:** 거절 엔딩 BGM 페이드 타이밍 수동 청취 (QA-PLAN §3) + 카톡 BGM ↔ SFX 음역대 충돌 청취
- [ ] **마일스톤 #3 게이트:** H1/H2/H3/H5 트루엔딩 + END_SOLO_SUMMER 시나리오 작성 후 `bgm_sad` / `bgm_climax` 큐 위치·페이드 1회 재정합

---

## 6. 후처리 룰 (Audacity + ffmpeg, DAW 없는 환경 전제)

### 6.0 적용 내역 (2026-04-29 완료)

ffmpeg를 통한 일괄 처리로 다음이 적용됨:

1. **음량 정규화 → -16 LUFS Integrated** (8트랙 일괄)
2. **길이 자르기 — `bgm_climax` 도입부 10초 crop** (다른 7트랙은 원본 길이 유지, ffprobe 실측 §0 표 참조)
3. **끝 50ms 페이드 아웃** (8트랙 일괄, 클릭 노이즈 방지)
4. **MP3 변환 192 kbps CBR + ID3 태깅** — Artist / Album="kmu-vn BGM" / Comment="<출처 URL> / <라이선스>" (ffprobe 자동 검증 통과: bitrate 192,038 ~ 192,776 — CBR 192k 허용 편차 안)

가이드(§6.1·§6.2)는 향후 트랙 교체·SFX 큐레이션·재후처리 시 재사용을 위해 유지.

### 6.1 Audacity 워크플로 (정규화 + 루프 검증, 무료)

1. **음량 정규화 — Loudness Normalization → -16 LUFS Integrated**
   - 메뉴: `Effect > Volume and Compression > Loudness Normalization`
   - Target: `Perceived loudness`, `-16 LUFS`
2. **길이 자르기 (트랙별 §3 권장 길이)**
   - 자연 페이드 아웃 구간이 있으면 그 직전에서 컷, 없으면 마디 경계에서 컷
3. **끝 50ms 페이드 아웃**
   - 끝 50ms 선택 → `Effect > Fading > Fade Out`
   - 클릭 노이즈 방지 + 다음 BGM 진입 시 자연
4. **루프 검증**
   - `Selection > Region > End` → 트랙 시작 부분과 끝 부분을 이어붙여 청취
   - 끝 50ms 페이드 OUT + 시작 50ms 페이드 IN 시 자연 연결되는지 확인
   - 부자연하면 길이 재조정 또는 다른 후보로
5. **WAV로 export** (MP3 변환은 ffmpeg에서)
   - `File > Export > Export as WAV`, 16-bit PCM, 44.1 kHz

### 6.2 ffmpeg 변환 (192 kbps CBR MP3)

```bash
ffmpeg -i bgm_main_theme.wav -codec:a libmp3lame -b:a 192k -joint_stereo 1 \
  -metadata artist="<작곡자>" \
  -metadata album="kmu-vn BGM" \
  -metadata comment="<출처 URL> / <라이선스>" \
  bgm_main_theme.mp3
```

배치 처리 (8트랙 일괄, bash):

```bash
for f in _candidates/final/*.wav; do
  base=$(basename "$f" .wav)
  ffmpeg -i "$f" -codec:a libmp3lame -b:a 192k -joint_stereo 1 \
    -metadata album="kmu-vn BGM" \
    "public/snd/bgm/${base}.mp3"
done
```

### 6.3 자체 검증

- 변환 후 파일 재생 → Audacity로 다시 열어 LUFS 미터 (`Analyze > EBU R128 Loudness`) -16 LUFS ±0.5 확인
- 8개 파일 LUFS 편차 < 1 LUFS (트랙간 음량 일관성)
- ID3 태그 확인: VLC 또는 `ffprobe bgm_main_theme.mp3`로 metadata 출력 확인

---

## 7. QA 체크리스트

### 7.1 큐레이션 라운드 자체 검증 (2026-04-29 완료)

- [x] 8개 BGM 파일 모두 존재 (현재 `docs/assets/bgm/`, 파일명 CONVENTIONS §5.2 정확)
- [x] 각 파일 ID3 태그 — Artist / Album / Comment(URL+라이선스) 채워짐 (ffprobe 자동 검증)
- [x] 192 kbps CBR — 8트랙 모두 정합 (실측 192,038 ~ 192,776, CBR 192k 허용 편차 안)
- [x] -16 LUFS 정규화 적용 (사용자 ffmpeg 일괄 처리)
- [x] 가사·보컬 0건 (사용자 전체 청취 검증)
- [x] 12세 등급 톤 (호러·과도한 슬픔 X — 사용자 검증)
- [x] 라이선스 추적표(§4.3) 8행 채워짐
- [x] 라이선스 모두 게임 상업 배포 가능 (DOVA-Syndrome 7 + Pixabay 1)

### 7.2 W5 콘텐츠 통합 검증 (2026-05-06 완료, 일부 잔여)

- [x] 8개 BGM 파일 `docs/assets/bgm/` → `public/snd/bgm/` 이동 + 매니페스트 등록 (`public/manifest.json` `"bgms"` 8건, 2026-05-06)
- [x] 시나리오 한글 BGM 큐 영문 ID 매핑 (validate-build v0.3 BGM 화이트리스트 통과, 2026-05-06)
- [ ] 게임 내 크레딧 화면(§4.2) 8트랙 모두 등재 — `src/scenes/credits.scene.json` 자동 생성 (별도 라운드)

### 7.3 W6 배포 전 수동 QA (대기, QA-PLAN §3·§5 정합)

- [ ] **거절 엔딩 BGM(`bgm_sad`) 페이드 인 타이밍 ANIMATION-SPEC §12와 일치** — 수동 QA 1회 (QA-PLAN §3 명시)
- [ ] 카톡 BGM(`bgm_katalk`)이 `sfx_katalk_notify` + `sfx_timer_out`과 음역대 충돌 없음 — 수동 청취
- [ ] LUFS 편차 < 1 (8트랙 음량 일관성, 게임 내 BGM 전환 시 청감 점프 X)
- [ ] 모바일 + 데스크톱 양쪽 청취 — 음량 밸런스 OK

---

## 8. 사용자 검증 (큐레이션 라운드 완료 — 2026-04-29)

- [x] 8트랙 명세 우선순위(A/B/C) 및 마일스톤 #3 게이트 OK
- [x] 현장 시트 박스 형식 OK — 검색·시청에 활용
- [x] -16 LUFS / 192 kbps CBR / 끝 50ms 페이드 표준 채택
- [x] ffmpeg 일괄 워크플로 채택 (DAW 미사용)
- [x] 라이선스 우선순위 A/A+/B/C/D 채택 (Pixabay A+ 신규 추가)
- [x] 8트랙 모두 후처리 완료, ID3 태깅 통과, status: done
