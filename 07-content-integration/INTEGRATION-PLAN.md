---
module: INTEGRATION-PLAN
hierarchy: 5
depends-on:
  - 03-story/* (전부 완료 시점)
  - 04-image-prompts/* (이미지 자산 생성 완료)
  - 06-engine/* (엔진 코어 완성 시점)
outputs:
  - 시나리오 .md → 씬 JSON 자동 변환 도구
  - 자산 매니페스트 빌드
  - 풀 플레이 검증 절차
status: review
---

# 07-content-integration/INTEGRATION-PLAN.md

> 위계 5 모듈. 위계 1~4가 모두 완료된 후 진입. 모든 자산을 게임에 끼워넣는 단계.

## 1. 단계 개요

```
[입력]
  - 03-story/route-*.md (시나리오 텍스트)
  - public/img/ (사용자 생성 이미지)
  - public/snd/ (BGM/SFX)
  - public/video/ (VEO 영상)
  - 06-engine/SCENE-FORMAT.md (변환 스펙)

[출력]
  - src/scenes/*.json (씬 파일)
  - public/manifest.json (자산 매니페스트)
  - 빌드 가능한 게임 빌드
```

## 2. 시나리오 → 씬 JSON 변환

### 2.1 변환 도구

`scripts/md-to-scene.ts` (Claude Code가 작성)

- 입력: `03-story/route-*.md` 비트 시트
- 파싱: `[화자]`, `(감정/행동)`, `[CHOICE]...[/CHOICE]`, `[BG: ...]`, `[CG: ...]`, `[BGM: ...]`, `[SFX: ...]`
- 출력: `06-engine/SCENE-FORMAT.md`에 정의된 JSON 구조

### 2.2 변환 룰 요약 (SCENE-FORMAT.md 별도 참조)

```
[차세린] (미소) 안녕? → { type: "dialogue", speaker: "serin", emotion: "smile", text: "안녕?" }
[CG: cg_serin_first_meet] → { type: "cg", id: "cg_serin_first_meet" }
[CHOICE] - A → +5 H1 [/CHOICE] → { type: "choice", options: [...] }
```

### 2.3 검증

변환 후 자동 실행:
- 모든 화자 ID가 `02-characters/*.md`에 존재하는지
- 모든 CG/BG/BGM/SFX 참조가 `public/`에 존재하는지
- 모든 호감도 변동의 변수명이 `STATE-SCHEMA.md`와 일치하는지

## 3. 자산 매니페스트

`public/manifest.json` 자동 생성:

```json
{
  "sprites": {
    "yunmo": ["default", "smile", "blush", "panic", "serious", "sad", "perv", "recover"],
    "serin": ["default", "smile", "blush", "tired", "serious", "surprised", "concerned", "smile_warm"],
    ...
  },
  "backgrounds": ["bg_kmu_main", "bg_lecture_day", "bg_anatomy_lab", "bg_library_day", "bg_library_night", "bg_dongsan_lobby", "bg_dongsan_hallway", "bg_campus_cafe", "bg_campus_night_blossom", "bg_bundang_home", "bg_studio_room", "bg_yeungnam_pharm", "bg_dongseong_street", "bg_festival", "bg_mt_pension"],  // 본 15장 (MASTER-PLAN §6.2). variant는 bg-list.md §변형 룰 참조
  "cgs": ["cg_serin_first_meet", "cg_serin_first_meet_full", ...],
  "bgms": ["bgm_main_theme", "bgm_daily", ...],
  "sfx": [...],
  "videos": [...]
}
```

엔진은 이 매니페스트로 프리로드 큐를 구성.

## 4. 자산 압축 / 최적화

- 이미지: WebP 변환 + AVIF 폴백 + PNG 폴백 (`scripts/optimize-images.ts`)
- 사운드: MP3 128kbps 단일 (Howler.js 호환)
- 영상: MP4 H.264 + WebM VP9 폴백, 720p (모바일 절약)

## 5. 통합 후 풀 플레이 검증

### 5.1 자동 검증 (CI)
- Playwright E2E 1개 엔딩 자동 플레이 (랜덤)
- 모든 씬 로드 없이 통과
- 호감도 변수 끝까지 추적 (예상 값 vs 실제 값 비교)

### 5.2 수동 검증
사용자(개발자)가 직접 플레이:
- [ ] 프롤로그 ~ 엔딩 1회 풀 플레이
- [ ] 거절 카톡 엔딩 도달 (의도적 답장 늦장)
- [ ] 트루 엔딩 1개 도달
- [ ] 모바일 가로 모드 풀 플레이
- [ ] 저장 슬롯 동작
- [ ] CG/BGM/엔딩 갤러리 해금 동작

## 6. 통합 일정

| 일차 | 작업 |
|---|---|
| D1 | 변환 도구 작성 + 모든 시나리오 변환 |
| D2 | 자산 폴더 정리 + 매니페스트 생성 |
| D3 | 엔진에 통합, 첫 풀 플레이 |
| D4 | 버그 수정 + 풀 플레이 1회 더 |
| D5 | QA 단계로 진입 (08-) |

## 7. 사용자 검증

- [ ] 변환 도구 자동화 OK?
- [ ] 매니페스트 구조 OK?
- [ ] 풀 플레이 검증 항목 추가 필요한지?
