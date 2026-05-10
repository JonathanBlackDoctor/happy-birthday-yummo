---
module: palJeongPot (각색본 시놉시스 + 분담)
hierarchy: 2
depends-on:
  - 00-master/MASTER-PLAN.md
  - 03-story/scenarios/compressed/*.md
outputs:
  - 친구 6명 분담 초안(이중 압축 시놉시스)
  - 출시 후 각자 채워서 src/scenes/palJeongPot/<id>.scene.json 으로 컴파일
status: draft
---

# 팔정팟 각색본 — 분담 시놉시스

> 압축본을 한 번 더 압축한 ~6,000자 단권 초안. 6명이 ~1,000자씩 맡아 풀 분기 그래프(씬 ID·CHOICE next·KAKAO·FLAG·ENDING)를 그대로 복원하면서 자기 톤으로 각색.
> 게임 내 ModeSelect "팔정팟 각색" 카드는 metaStore.has_cleared_once === true (엔딩 1개 도달) 시 해금된다.
> 컴파일 산출물은 `src/scenes/palJeongPot/<sceneId>.scene.json`에 떨어뜨린다 — 없는 씬은 풀로 자동 폴백.

| 담당 | 구간 | 시놉시스 | 풀 씬 ID 범위 |
|------|------|---------|--------------|
| **정욱** | 프롤로그 + Ch.1 OT | [01-jeongwook.md](01-jeongwook.md) | `prologue_*`, `ch01_*` |
| **표경민** | Ch.2 카데바 + Ch.3 전반 | [02-pyo-gyeongmin.md](02-pyo-gyeongmin.md) | `ch02_*`, `ch03_01~03_*` |
| **오준혁** | Ch.3 후반 + Ch.4 도서관 | [03-oh-junhyuk.md](03-oh-junhyuk.md) | `ch03_04~06_*`, `ch04_*` |
| **김규민** | Ch.5 5월의 분기 | [04-kim-gyumin.md](04-kim-gyumin.md) | `ch05_*` |
| **남희석** | Ch.6 H1·H2·H3 | [05-nam-heeseok.md](05-nam-heeseok.md) | `ch06_h1_*`, `ch06_h2_*`, `ch06_h3_*` |
| **이문규** | Ch.6 H4·H5 + 단독 엔딩 | [06-lee-mungyu.md](06-lee-mungyu.md) | `ch06_h4_*`, `ch06_h5_*`, `end_solo_summer_main` |

## 작업 룰
1. 씬 ID·CHOICE next·KAKAO·FLAG·ENDING은 풀(`scenarios/*.md`)과 1:1 동일하게 유지.
2. 각자 구간 안에서만 NARRATION/MONOLOGUE/DIALOGUE 결만 자유 각색.
3. 변태 망상 페어 (Ch.1·Ch.2·Ch.3·Ch.5 모닥불 = 총 4회)는 **한 줄도 손대지 않는다** (CONVENTIONS §3.3).
4. 욕설 절대 금지 (CONVENTIONS §8) — 12세 등급 + 친구 톤이라도 동일.
5. 컴파일 후 `npm run dev` → ModeSelect에서 "팔정팟 각색" 선택 → 자기 구간만 빠르게 검수.
