---
module: QA-PLAN
hierarchy: 6
depends-on:
  - 07-content-integration/INTEGRATION-PLAN.md
  - 03-story/BRANCH-GRAPH.md
  - 06-engine/STATE-SCHEMA.md
outputs:
  - Playwright E2E 테스트 작성 (16개 엔딩 자동 플레이)
  - 빌드 검증 스크립트 (자산/분기/변수)
  - 모바일 반응형 QA 체크리스트
  - 성능 검증 절차
status: review
---

# 08-qa-deployment/QA-PLAN.md

> 위계 6. 모든 콘텐츠 통합 후 최종 검증 단계.

## 1. 테스트 카테고리

### 1.1 E2E 자동 플레이 (Playwright)

각 엔딩 도달 경로를 자동 플레이하는 테스트 스크립트.

```typescript
// tests/e2e/end_h1_true.spec.ts
test('차세린 트루 엔딩 도달', async ({ page }) => {
  await page.goto('/');
  await selectMode(page, '구윤모로 플레이');
  await advanceProlouge(page);
  // Ch.1~5 진행 + H1 호감도 최대화 선택지
  await chooseAlwaysFor(page, 'H1');
  // Ch.6 H1 키 선택지 통과
  await selectKeyChoice(page, 'A'); // "누나" 호칭
  // 엔딩 도달 확인
  await expect(page.locator('[data-ending="END_H1_TRUE"]')).toBeVisible();
});
```

**필수 테스트 케이스 16개** (모든 엔딩):
- `END_H1_TRUE`, `END_H1_HAPPY`, `END_H1_NORMAL`, `END_H1_BAD`
- `END_H2_TRUE`, `END_H2_HAPPY`, `END_H2_NORMAL`, `END_H2_BAD`
- `END_H3_TRUE`, `END_H3_HAPPY`, `END_H3_NORMAL`
- `END_H4_TRUE`, `END_H4_NORMAL`, **`END_H4_REJECT`** ⚠️
- `END_H5_TRUE`
- **`END_SOLO_SUMMER`** ⚠️ "혼자 여름방학" (모든 호감도 <30 경로)

각 테스트는 GitHub Actions에서 PR/푸시마다 자동 실행.

### 1.2 빌드 검증 (자산/분기/변수)

`scripts/verify-build.ts`:
- 모든 시나리오 .md에서 참조한 자산이 `public/`에 존재
- 모든 분기가 엔딩에 도달 가능 (BRANCH-GRAPH.md의 그래프 도달성 검사)
- 모든 호감도/플래그 변수가 `STATE-SCHEMA.md`와 일치
- 파싱 실패한 라인 0개

빌드 실패 시 CI 실패 → 배포 차단.

### 1.3 모바일 반응형 QA

| 기기 | 해상도 | 체크 |
|---|---|---|
| 갤럭시 S22 (가로) | 2340×1080 | 텍스트박스, 스프라이트, 카톡 모달 |
| iPhone 14 (가로) | 2532×1170 | 위와 동일 |
| iPad (가로) | 2160×1620 | UI 스케일링 |
| 갤럭시 Tab (세로) | 1600×2560 | 회전 안내 토스트 표시 |

체크리스트:
- [ ] 텍스트 가독성 (18px 이상)
- [ ] 버튼 터치 영역 (≥ 44pt)
- [ ] 카톡 모달 가로/세로 동작
- [ ] 영상 재생 (특히 거절 엔딩)
- [ ] 저장/불러오기 동작
- [ ] 가로모드 강제 안내 (세로면)

### 1.4 성능 검증

목표 (마스터 플랜 §8.2):
- 초기 로드 < 3초 (3G 시뮬레이션)
- 씬 전환 < 200ms
- 메모리 < 200MB (모바일)
- 빌드 < 50MB

도구:
- Lighthouse CI (자동)
- Chrome DevTools Performance (수동)
- WebPageTest (선택)

### 1.5 접근성 (옵션)

- 키보드 전용 플레이 가능 (스페이스/엔터로 진행, 화살표로 선택)
- 색맹 고려 (호감도 등 색만으로 정보 전달 X)

## 2. 회귀 테스트 (Regression)

각 PR이 다음 사항을 깨뜨리지 않는지 확인:
- 기존 테스트 15개 모두 통과
- 빌드 검증 통과
- 빌드 크기 +10% 이내

## 3. 알려진 이슈 / 위험 영역

- ⚠️ Gemini 워터마크: 디자인 단계에서 가렸지만 일부 CG에서 노출 가능 → CG 단위 시각 검수
- ⚠️ 거절 카톡 연출: 8단계 정확 동작 (BGM 전환 타이밍, 타이핑 효과) — 별도 수동 QA 1회
- ⚠️ 카톡 답장 미니게임: 모바일에서 알림 토스트 누르기 정확성 — 수동 QA 1회

## 4. QA 일정

| 일차 | 작업 |
|---|---|
| D1 | E2E 테스트 15개 작성 (Claude Code) |
| D2 | 빌드 검증 스크립트 작성 |
| D3 | 모바일 수동 QA (사용자) |
| D4 | 성능 최적화 + Lighthouse |
| D5 | 최종 풀 플레이 + 사인오프 |

## 5. 사용자(QA자) 사인오프 체크리스트

- [ ] 16개 엔딩 모두 자동 플레이 통과 (END_SOLO_SUMMER 포함)
- [ ] 거절 카톡 엔딩 수동 도달 + 8단계 연출 정상
- [ ] 모바일 가로 풀 플레이 (1회)
- [ ] CG/BGM/엔딩 갤러리 동작
- [ ] 저장/불러오기 6슬롯 + 자동저장
- [ ] 빌드 크기 < 50MB
- [ ] Lighthouse Performance ≥ 80
- [ ] 카톡 모달 동작
- [ ] 변태 망상 페어가 챕터당 1~2회 한정
- [ ] 12세 등급 가드레일 준수 (시각/텍스트)
- [ ] **욕설 0건** (모든 등장인물·채널, 2026-04-28 갱신 룰)
