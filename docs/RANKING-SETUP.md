# 온라인 랭킹 셋업 (PM용 3분 가이드)

Pantry (https://getpantry.cloud) 무료 백엔드를 쓴다. 컴퓨터 지식 없어도 됨.
키 1개(Pantry ID, UUID 형식)만 복사하면 끝. JSONBin 같은 헷갈림 없음.

## 1. Pantry ID 발급 (1분)

1. https://getpantry.cloud 접속
2. 화면 가운데 "Get a New Pantry" 섹션 → **이메일 주소** 입력 → "Submit" 버튼
3. **이메일 확인** — Pantry에서 보낸 메일에 본인 **Pantry ID** 가 적혀 있음.
   - 형식: UUID (예: `1234abcd-5678-90ef-abcd-1234567890ab`, 36자, 영숫자+하이픈)
4. ID 복사.

## 2. 게임 측 환경변수 설정 (1분)

1. `game-project/.env.local` 파일 열기 (없으면 새로 만들기, `.env.example` 옆).
   ⚠️ **위치 주의** — `game-project/` 폴더 안. 그 한 단계 위가 아님.
2. 다음 한 줄을 붙이고 값만 본인 것으로 교체:
   ```
   VITE_PANTRY_ID='1234abcd-5678-90ef-abcd-1234567890ab'
   ```
3. 저장.

> Pantry ID는 UUID라 `$` 등 특수문자 없어 따옴표 없이도 동작하지만, 일관성·실수 방지 위해 따옴표 권장.

## 3. 게임 재기동 (30초)

기존 dev 서버 끄고 (`Ctrl+C`) 다시 켜기:
```
npm run dev
```

## 4. 검증 (1분)

1. 게임 진행해 아무 엔딩 도달
2. 화면 아래 "ONLINE RANKING" 섹션 → 닉네임 입력 → "랭킹 등록" 클릭
3. 잠시 후 본인 닉네임이 노란 배경으로 Top 10에 보이면 성공
4. 시크릿 창에서 다른 닉네임으로 한 번 더 → 둘 다 보이면 OK

## 보안 주의

- Pantry ID가 게임 코드에 들어감 → 누가 보면 데이터 조작·삭제 가능.
- 친구·동기 캐주얼 랭킹용으로 OK. 누가 장난 치면:
  - https://getpantry.cloud 에서 새 Pantry ID 발급 (다른 이메일 또는 같은 이메일로 또)
  - `.env.local` 값 교체
  - `npm run dev` 재기동
- 무료, 가입 즉시 사용 가능.

## 비활성 주의

Pantry는 **30일 동안 한 번도 접근 안 되면 아카이브**됨 (자동 삭제 아님, 복구 가능하나 번거로움).
한 달에 한 번이라도 누가 게임 엔딩 봐서 랭킹 호출하면 무관.

## 문제 해결

- **랭킹 섹션이 아예 안 보임** → `.env.local` 값 채웠는지 확인. dev 서버 재기동 필수.
- **"등록 실패: load 4xx" 또는 "save 4xx"** → Pantry ID 오타. 이메일에서 다시 복사. 36자 UUID 형식 맞는지 (8-4-4-4-12 패턴) 확인.
- **느려짐** → 일시적 Pantry 부하. 잠시 후 재시도.

## 왜 JSONBin 안 쓰는지

JSONBin도 무료 옵션이지만 X-Master-Key + X-Access-Key 2종 키 + Bin ID 까지 셋업할 게 많아 PM 비기술자가 헷갈림 발견됨 (2026-05-11 PM 셋업 시도 중 401 반복). Pantry는 ID 1개로 단순.
