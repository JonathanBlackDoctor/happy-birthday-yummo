---
module: RELEASE-RUNBOOK
hierarchy: 6
depends-on:
  - 08-qa-deployment/DEPLOYMENT.md
  - 08-qa-deployment/QA-PLAN.md
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - vite.config.ts
outputs:
  - 베타·정식 출시 푸시 절차 사전 점검 + 푸시 후 검증 + 알려진 회귀 함정
status: review
---

# 08-qa-deployment/RELEASE-RUNBOOK.md

> 베타·정식 출시 푸시 전 **사전 점검** + 푸시 후 **검증 절차** + **알려진 회귀 함정** 모음.
>
> 2026-05-11 베타 첫 푸시 라운드에서 발견한 4종 함정 회고 후 작성. 다음 베타 push·정식 출시 push 때 본 체크리스트를 반드시 1회 통과하고 진행한다.

---

## 0. SSoT 위치 (먼저 확인)

| 항목 | 위치 |
|---|---|
| Vite base 설정 | [`vite.config.ts`](../vite.config.ts) `base: './'` |
| CI 워크플로우 | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Deploy 워크플로우 | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |
| E2E 헬퍼 | [`tests/e2e/helpers.ts`](../tests/e2e/helpers.ts) |
| Playwright 설정 | [`playwright.config.ts`](../playwright.config.ts) |
| 자산 매니페스트 빌더 | [`scripts/build-manifest.ts`](../scripts/build-manifest.ts) |
| 시나리오 컴파일러 | [`scripts/compile-scene.ts`](../scripts/compile-scene.ts) |
| .gitignore | [`.gitignore`](../.gitignore) |

---

## 1. 첫 푸시 직전 사전 점검 (필수, 순서대로 8단계)

`game-project/` 안에서 차례로 실행. 한 단계라도 실패 시 처방 후 재시작.

### 1.1 자산 경로 절대→상대 점검 (출시 차단급)

```bash
grep -rE "['\"\`]/(img|snd|video|vid)/" src/ 03-story/scenarios/
# 기대: 출력 0줄
```

**잔존 시**: 함정 §4.1 처방. **GitHub Pages 서브패스(`/Cuyeonsi-beta/`)에서 자산 미로드의 단일 원인**.

### 1.2 워크플로우 레이아웃 점검

```bash
grep -E "working-directory:|game-project/" .github/workflows/*.yml
# 기대: working-directory 0건 / "game-project/" 경로 참조 0건
```

**잔존 시**: 함정 §4.4 처방. **옵션 A(`game-project/` = repo 루트) 위반**.

### 1.3 TypeScript / Vitest / Lint 그린

```bash
npm run typecheck   # 기대: 0 errors
npm run lint        # 기대: 0 errors (warnings은 비차단, OK)
npm test            # 기대: all passed
```

**lint 잔존 시**: 함정 §4.3 처방 (대부분 `scripts/` 빌드 도구의 미사용 변수/imports).

### 1.4 시나리오 컴파일 + 검증

```bash
npm run compile:all  # 풀(212 씬) + 압축(212 씬) 양 모드
npm run validate     # 16 엔딩 도달성 + BG/CG/VIDEO/BGM/SFX 화이트리스트
```

**기대**: 풀·압축 양 모드 212 씬 / `✓ 빌드 검증 통과` / 사전 경고 일부는 무관.

### 1.5 자산 매니페스트 정합

```bash
npm run manifest
git status --short public/manifest.json
# 기대: 변동 없거나 합리적 변동(자산 추가 시)
```

### 1.6 Vite 빌드

```bash
npm run build
# 기대: ✓ built in ~3-4s / dist/ 생성 / chunks 경고는 OK
```

### 1.7 로컬 preview 자산 응답 확인

```bash
npm run preview &  # 백그라운드
sleep 3
curl -sI http://localhost:4173/img/bg/bg_studio_room.webp | head -1
curl -sI http://localhost:4173/snd/bgm/bgm_main_theme.mp3 | head -1
curl -sI http://localhost:4173/video/video_opening.mp4 | head -1
# 기대: 3건 모두 HTTP/1.1 200 OK
```

**404 잔존 시**: 자산이 `public/` 안에 실제로 있는지 확인. 매니페스트와 실제 파일 불일치 가능성.

### 1.8 E2E 로컬 1회 (선택, 시간 여유 시)

```bash
npm run test:e2e
# 기대: 16/16 passed, 8-12분 (idle 가드 정착 후)
```

---

## 2. 푸시 절차

### 2.1 정상 푸시

```bash
git -C "<repo-path>" status -sb
# 기대: ## main...origin/main (no ahead/behind) 또는 ahead가 의도한 수
git -C "<repo-path>" add <changed files>  # add -A 금지: .env 등 위험
git -C "<repo-path>" commit -m "..."
git -C "<repo-path>" push
```

### 2.2 푸시 hang 처방 (Windows + Korean path 환경 특이)

증상: `git push`가 60초+ 동안 출력 없이 hang.

원인 추정:
- Git Credential Manager(GCM) GUI 프롬프트가 invisible 상태로 떠 있음
- Windows credential cache가 corrupted
- 직전 push 시도가 비정상 종료되어 lock 미해제

처방 순서:
1. **연결 자체는 확인**: `git ls-remote origin HEAD` — 정상 응답이면 인증 OK
2. **hang 종료 후 재시도**: Ctrl+C 또는 process kill, 그 후 `git push` 재시도
3. **GIT_TRACE 진단**: `GIT_TRACE_PACKET=1 GIT_CURL_VERBOSE=1 git push` — 어디서 멈췄는지 출력
4. **GCM 재인증**: Windows 자격 증명 관리자 → `git:https://github.com` 항목 삭제 → 다음 push에서 재인증

> **본 라운드 사례 (2026-05-11)**: 첫 3개 push(`6289d4d`/`b70f5a7`/`e802495`)는 정상. 4번째 시도 직후 `84e1c9a` push 1회 hang (background task로는 결국 완료). 그 후 push 시도 다수 hang. 마지막 `bdf665d`는 한 번에 통과. 패턴: 짧은 시간 안에 다수 push 시도 시 GCM 토큰 race 의심.

### 2.3 인증 실패 처방

증상: `remote: Invalid username or token. Password authentication is not supported for Git operations.`

처방:
1. **GitHub Personal Access Token 발급**: https://github.com/settings/tokens → Generate new token (classic) → `repo` 스코프
2. `git push` 시 Username = GitHub ID, Password = **방금 발급한 토큰** (실제 비밀번호 X)
3. 또는 GitHub CLI: `winget install GitHub.cli` 후 `gh auth login`

---

## 3. 푸시 후 검증

### 3.1 Actions 워크플로우 확인 (필수)

```bash
# gh CLI 있으면:
gh run list --repo JonathanBlackDoctor/Cuyeonsi-beta --limit 3

# 없으면 REST API:
curl -s "https://api.github.com/repos/JonathanBlackDoctor/Cuyeonsi-beta/actions/runs?per_page=3" \
  | grep -E '"name"|"status"|"conclusion"|"display_title"'
```

**기대**:
- `CI`: status=completed, conclusion=success (build + e2e 모두)
- `Deploy to GitHub Pages`: status=completed, conclusion=success

**e2e 실패 시**: 함정 §4.2 처방. **build/deploy는 독립이라 e2e fail해도 라이브는 뜸**.

### 3.2 라이브 자산 응답 확인

```bash
URL="https://jonathanblackdoctor.github.io/Cuyeonsi-beta"

curl -sI "${URL}/" | head -1                                     # 게임 entry
curl -sI "${URL}/img/title.webp" | head -1                       # 타이틀
curl -sI "${URL}/img/bg/bg_studio_room.webp" | head -1           # BG
curl -sI "${URL}/img/sprites/serin_smile_warm.webp" | head -1    # Sprite
curl -sI "${URL}/img/cg/cg_serin_true.webp" | head -1            # CG
curl -sI "${URL}/snd/bgm/bgm_main_theme.mp3" | head -1           # BGM
curl -sI "${URL}/snd/sfx/sfx_click.mp3" | head -1                # SFX
curl -sI "${URL}/video/video_opening.mp4" | head -1              # Video
# 기대: 8건 모두 HTTP/1.1 200 OK
```

**404 잔존 시**: 함정 §4.1 처방. **자산 미로드의 단일 원인**.

### 3.3 PM 실기 검증 게이트

🟨 **반드시 PM 직접 1회**:
1. 모바일·PC 라이브 접속 → 타이틀 → ModeSelect → 프롤로그 → 자산 표시 확인
2. **거절 카톡 엔딩 도달**: ch04 나서윤 단톡 답장 3초 안에 늦게 → ch06_h4_reject 8단계 시퀀스 확인
3. **트루 엔딩 1회 도달**: H1~H5 중 하나 → 결과 화면 + CG + 명대사 + 점수 카드
4. **Lighthouse Performance ≥80** 실측

---

## 4. 알려진 회귀 함정 (2026-05-11 베타 후속 회고)

### 4.1 자산 절대경로 (출시 차단급)

**증상**: 라이브 사이트 UI/text 정상 / 자산(이미지·소리·영상) 전부 404.

**원인**: 코드 안 `'/img/'`, `'/snd/'`, `'/video/'` 절대경로가 GitHub Pages 서브패스(`/Cuyeonsi-beta/`)에서 root domain으로 잘못 해석.

```
<img src="/img/bg/foo.webp">
→ 해석: https://jonathanblackdoctor.github.io/img/bg/foo.webp ❌ 404
```

**처방**: 모든 자산 경로에서 leading `/` 제거 → 상대경로화.

```
<img src="img/bg/foo.webp">  (no leading slash)
→ 해석: https://jonathanblackdoctor.github.io/Cuyeonsi-beta/img/bg/foo.webp ✅
```

**일괄 치환 (PowerShell, UTF-8 NoBOM)**:

```powershell
$files = @(Get-ChildItem -Path "src","03-story/scenarios" -Recurse -Include "*.ts","*.tsx","*.md","*.json" |
           Where-Object { $_.FullName -notmatch "node_modules|dist|_backup" })
foreach ($f in $files) {
  $orig = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $new = $orig `
    -replace "(['""``])/img/", '$1img/' `
    -replace "(['""``])/snd/", '$1snd/' `
    -replace "(['""``])/video/", '$1video/' `
    -replace ":/img/", ":img/"
  if ($new -ne $orig) {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($f.FullName, $new, $utf8)
  }
}
```

치환 후: `npm run compile:all` 재실행 (scene.json 재생성).

> **본 라운드 사례 (2026-05-11)**: 24 파일 50건 일괄 치환. CHANGELOG 본 일자 "자산 경로 절대→상대 일괄 전환" 엔트리 참조.

### 4.2 E2E cold-cache idle race (출시 비차단, CI 차단)

**증상**: 16개 e2e 테스트 첫 시도 1.5분 timeout → retry 2-4초 성공. 16×(1.5m + 3s) ≈ 25분 job 한도 초과 cancel.

**원인**: `gameStore.ts` 초기 `runtimeMode: 'idle'` + `helpers.ts:autoAdvanceUntilEnding`의 `runtimeMode === 'idle' → return` 조기 종료. CI 러너 cold cache로 `startScene` async 완료 전 autoAdvance가 'idle' 상태로 읽고 즉시 return → expectEnding이 DOM 90s 대기 후 timeout.

**처방 (이미 정착)**: `tests/e2e/helpers.ts` `autoAdvanceUntilEnding` 진입 직후 idle 대기 가드 30s 폴링 추가.

```ts
// helpers.ts autoAdvanceUntilEnding 첫 부분
const idleWaitStart = Date.now();
while (Date.now() - idleWaitStart < 30_000) {
  const s = store.getState();
  if (s.runtimeMode !== 'idle') break;
  await new Promise((r) => setTimeout(r, 50));
}
```

**검증**: CI #4 `84e1c9a` 이후 E2E 16/16 ~2분 25초 완주. timeout 상향 옵션 C(30분)는 증상 가림이라 폐기.

### 4.3 ESLint scripts 에러 (CI 차단)

**증상**: `npm run lint` 8 errors 모두 `scripts/` 빌드 도구 (게임 코드 X).

**전형적 패턴**:
- 미사용 import → `_` prefix 또는 import 제거
- `let X` 단일 할당 → `const X`
- `[+\-]` regex → `[+-]` (불필요 escape)
- 미사용 args/vars → `_` prefix

**처방**: 본 회고 시점 8건 모두 처방됨. 다음 push 전 `npm run lint` 0 errors 확인 필수.

### 4.4 워크플로우 working-directory (옵션 A 위반)

**증상**: GitHub Actions에서 "package.json not found" 또는 cache miss.

**원인**: deploy.yml/ci.yml에 `working-directory: game-project` + `cache-dependency-path: game-project/package-lock.json` 박혀 있음. 이건 **레이아웃 옵션 B**(workspace 루트가 repo 루트, `game-project/`가 서브폴더)일 때만 유효.

**현행 옵션 A** 정합 워크플로우:
- `working-directory` 미지정 (repo 루트 = 프로젝트 루트)
- `cache-dependency-path: package-lock.json` (game-project/ prefix 없음)
- 아티팩트 `path: dist` (game-project/ prefix 없음)
- Playwright report `path: playwright-report/` (game-project/ prefix 없음)

> 정식 출시 시 별 repo로 옮길 때 동일 옵션 A 유지 권장. 옵션 B로 바꾸려면 다음을 일괄 반영:
> - 양 워크플로우에 `working-directory: game-project` 추가
> - `cache-dependency-path: game-project/package-lock.json`
> - 아티팩트 `path: game-project/{dist,playwright-report}`

---

## 5. 정식 출시 시 추가 점검

베타와 정식의 차이는 주로 **repo URL** + **base path**. 옵션 A 레이아웃·자산 상대경로 정책은 그대로 호환.

### 5.1 새 repo 셋업 (정식 출시 별 repo 결정 시)

1. **새 repo 생성** (PM 직접). 빈 상태로 시작.
2. **새 repo에 push**:
   ```bash
   git -C "<beta repo path>" remote add prod https://github.com/<USER>/<NEW-REPO>.git
   git -C "<beta repo path>" push -u prod main
   # 또는 별 클론으로 새로 시작
   ```
3. **새 Pages 활성화**: Settings → Pages → Source: GitHub Actions
4. **첫 푸시 후 라이브 URL**: `https://<USER>.github.io/<NEW-REPO>/`

### 5.2 자산 상대경로 호환성 (변경 불필요)

상대경로(`img/...`, `snd/...`, `video/...`)는 어떤 서브패스에서도 작동:
- `/Cuyeonsi-beta/` (베타) ✓
- `/<new-repo>/` (정식 별 repo) ✓
- `/` (커스텀 도메인 루트) ✓

본 정책은 §4.1 처방 결과 정착됨. 정식 출시 시 추가 자산 작업 0건.

### 5.3 localStorage 키 보존 결정

내부 식별자 `kmu-vn-*` 보존 (2026-05-09 게임 제목 변경 라운드 PM 결정). 베타·정식 간 세이브 호환 위함.

> 베타에서 만든 세이브 슬롯이 정식에서도 그대로 로드됨. 다만 **별 origin이라 자동 마이그레이션 X** (localStorage origin scoped). 정식 출시 시 PM이 별도 export/import 기능 고려할지 결정.

### 5.4 커스텀 도메인 사용 시 (선택)

1. DNS A 레코드 → GitHub Pages IP
2. `public/CNAME` 파일 추가 (도메인 한 줄)
3. Pages Settings → Custom domain 설정 + Enforce HTTPS
4. **자산 상대경로 정책 그대로** (변경 0)

---

## 6. 빠른 푸시 체크리스트 (1줄 요약)

다음 push 직전 이 8줄만 차례로 통과:

```bash
cd "D:/조나단/구연시/0428 스토리 검증/game-project"
grep -rE "['\"\`]/(img|snd|video|vid)/" src/ 03-story/scenarios/  # 0줄
grep -E "working-directory:|game-project/" .github/workflows/*.yml  # 0건
npm run typecheck && npm run lint && npm test                    # 0 errors all
npm run compile:all && npm run validate                          # 통과
npm run build                                                    # ✓ built
git add <files> && git commit -m "..." && git push               # 성공
curl -sI "https://jonathanblackdoctor.github.io/Cuyeonsi-beta/img/title.webp" | head -1  # 200
```

---

## 7. 변경 이력

| 일자 | 변경 | 사유 |
|---|---|---|
| 2026-05-11 | 본 문서 신설 | 베타 첫 푸시 라운드 4종 함정 회고 정리 (CHANGELOG 본 일자 "RELEASE-RUNBOOK 신설" 엔트리) |
