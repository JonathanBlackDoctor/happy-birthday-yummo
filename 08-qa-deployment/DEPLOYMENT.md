---
module: DEPLOYMENT
hierarchy: 6
depends-on:
  - 08-qa-deployment/QA-PLAN.md
  - 06-engine/ARCHITECTURE.md
outputs:
  - GitHub Actions 워크플로우 (.github/workflows/deploy.yml)
  - GitHub Pages 활성화 절차
  - 도메인 / SEO 설정
status: review
---

# 08-qa-deployment/DEPLOYMENT.md

> **운영 절차**: 푸시 전 사전 점검 + 푸시 후 검증 + 알려진 회귀 함정은 [`RELEASE-RUNBOOK.md`](./RELEASE-RUNBOOK.md) 참조 (2026-05-11 베타 첫 푸시 회고 결과 정착). 본 문서는 인프라 스펙, RUNBOOK은 운영 체크리스트로 역할 분리.

## 1. 배포 환경

- **호스팅**: GitHub Pages (무료, 정적 호스팅)
- **저장소**: [`JonathanBlackDoctor/Cuyeonsi-beta`](https://github.com/JonathanBlackDoctor/Cuyeonsi-beta) (2026-05-10 PM 활성화 / 베타 릴리스 전용)
- **배포 URL (확정)**: `https://jonathanblackdoctor.github.io/Cuyeonsi-beta/` (PM 2026-05-11 확정 — 정식 출시 전 베타 버전 배포 채널)
- **빌드 출력**: `dist/` → `actions/upload-pages-artifact@v3` 업로드 → `actions/deploy-pages@v4`
- **SSL**: 자동 (GitHub 기본 제공)

## 2. GitHub Actions 워크플로우

실제 워크플로우는 [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) 단일 파일. CI 검증은 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)이 별도 처리(typecheck/lint/vitest/compile/validate/audit/build/E2E). deploy.yml은 main 푸시 + workflow_dispatch에서 `npm ci → npm run compile → npm run validate → npm run build` 후 `dist/`를 Pages 아티팩트로 업로드.

> **레이아웃 전제 (옵션 A, 2026-05-11 PM 결정)**: `game-project/` 자체를 repo 루트로 사용. 워크플로우는 `working-directory` 무지정(repo 루트 = 프로젝트 루트). `cache-dependency-path: package-lock.json` + 아티팩트 `path: dist`. 0501test/worker/veo_frame_*.png 등 비-게임 작업물은 repo에 미포함.

## 3. Pages 활성화 절차

1. GitHub repo → Settings → Pages
2. Source: GitHub Actions 선택
3. 첫 push 후 자동 배포 시작
4. 배포 URL 확인: Settings → Pages → "Your site is live at..."

## 4. Vite 설정 (정적 호스팅)

실제 [`vite.config.ts`](../vite.config.ts)는 `base: './'` 상대경로 채택. 어떤 서브패스(`/Cuyeonsi-beta/`, `/kmu-vn/`, `/`) 위에서도 자산이 정상 로드되어 repo 이름이 바뀌어도 빌드 무수정. 커스텀 도메인 전환 시에도 동일.

> 내부 식별자 `kmu-vn`은 npm name·localStorage 키에서 보존(2026-05-09 게임 제목 변경 PM 결정, 세이브 호환). 외부 노출 경로는 모두 상대로 통일됨.

## 5. SEO / 메타데이터

`index.html`:

```html
<meta name="description" content="구윤모로 플레이 — 본과 1학년의 봄. 한국 의대 청춘 미연시.">
<meta property="og:title" content="구연시 (가제)">
<meta property="og:description" content="...">
<meta property="og:image" content="/og.png">
<link rel="icon" href="/favicon.ico">
```

## 6. 정적 호스팅 제약 / 회피

| 제약 | 대응 |
|---|---|
| 서버 사이드 처리 X | 모든 게임 로직 클라이언트 (이미 그렇게 설계됨) |
| 파일 크기 1GB 제한 | 빌드 < 50MB 목표 — 충분 |
| 대역폭 100GB/월 | 일반 사용 충분, 영상은 720p로 제한 |
| 비공개 데이터 X | 모든 자산 공개 (저작권/사생활 가드레일 준수) |

## 7. 도메인 (선택)

커스텀 도메인 사용 시:
1. DNS A 레코드 → GitHub Pages IP
2. CNAME 파일 추가
3. Vite `base: '/'`로 변경
4. SSL 자동 적용

## 8. 모니터링 / 로그

GitHub Pages는 기본 분석 X.
원할 시:
- Plausible (privacy-friendly, 무료 self-host 가능)
- 또는 단순 페이지뷰 카운터 (정적, 외부 서비스)

⚠️ Google Analytics는 사생활 우려, 설정 시 동의 배너 필요.

## 9. 출시 후 운영

- 버그 리포트: GitHub Issues
- 핫픽스: `main` 브랜치 푸시 → 자동 재배포
- 마이너 업데이트: 버전 태그 (`v1.0.1`) → CHANGELOG.md 갱신

## 10. 출시 체크리스트

- [ ] QA-PLAN.md §5 사인오프 완료
- [ ] `vite.config.ts` base 경로 정확
- [ ] `package.json` build/test 스크립트 정확
- [ ] `.github/workflows/deploy.yml` 작성
- [ ] GitHub Pages 활성화 (Settings)
- [ ] 첫 자동 배포 성공 확인
- [ ] 모바일 + PC에서 라이브 URL 접속 확인
- [ ] 거절 카톡 엔딩 라이브에서 도달 확인
- [ ] README.md 작성 (사용자가 친구한테 공유할 수 있게)
- [ ] **출시 🎉**
