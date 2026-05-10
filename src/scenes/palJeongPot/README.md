# palJeongPot — 팔정팟 각색본 씬 폴더

> 친구 6명(정욱·표경민·오준혁·김규민·남희석·이문규)이 분량을 나누어 각색한 시나리오 씬 폴더.
> ModeSelect의 "팔정팟 각색" 카드는 metaStore.has_cleared_once === true 일 때 해금된다.

## 동작 방식

- `manifest.ts`의 Proxy가 `storyMode === 'palJeongPot'`일 때 이 폴더의 `<sceneId>.scene.json`을 우선 룩업.
- 없는 씬은 `src/scenes/<sceneId>.scene.json` (풀)로 자동 폴백.
- 따라서 본 폴더가 비어 있어도 게임은 풀 시나리오로 정상 진행 — 각색본은 점진 교체 가능.

## 채워 넣는 방법

각 친구가 맡은 구간(03-story/scenarios/palJeongPot/{NAME}.md 초안 참고)의 `.md`를
컴파일러로 `.scene.json`으로 변환해 본 폴더에 떨어뜨리면 즉시 반영된다.
씬 ID는 풀(`prologue_01_home`, `ch01_01_ot_intro`, …)과 1:1 동일하게 맞춰야 polylink 분기가 안 깨진다.

## 분담 (초안)

| 담당 | 구간 | 주요 씬 ID |
|------|------|-----------|
| 정욱 | 프롤로그 + Ch.1 | `prologue_*`, `ch01_*` |
| 표경민 | Ch.2 + Ch.3 전반 | `ch02_*`, `ch03_01~03_*` |
| 오준혁 | Ch.3 후반 + Ch.4 | `ch03_04~06_*`, `ch04_*` |
| 김규민 | Ch.5 | `ch05_*` |
| 남희석 | Ch.6 H1·H2·H3 | `ch06_h1_*`, `ch06_h2_*`, `ch06_h3_*` |
| 이문규 | Ch.6 H4·H5 + 단독 엔딩 | `ch06_h4_*`, `ch06_h5_*`, `end_solo_summer_main` |
