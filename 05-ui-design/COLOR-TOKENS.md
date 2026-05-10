---
module: COLOR-TOKENS
hierarchy: 4
depends-on:
  - 05-ui-design/UI-SPEC.md
outputs:
  - 게임 전체 컬러 시스템
status: draft
---

# 05-ui-design/COLOR-TOKENS.md

## 1. 메인 팔레트

| 역할 | 변수 | HEX | 용도 |
|---|---|---|---|
| 배경 메인 | `--color-bg` | `#FFE4EC` | 메뉴/모달 기본 배경 |
| 액센트 | `--color-accent` | `#FFB8D1` | 버튼, 강조 |
| 액센트 호버 | `--color-accent-hover` | `#FFA0BD` | 버튼 호버 |
| 텍스트 메인 | `--color-text` | `#3A2E3F` | 기본 텍스트 |
| 텍스트 라이트 | `--color-text-light` | `#6B5B70` | 보조 텍스트 |
| 민트 강조 | `--color-mint` | `#A8DADC` | 호감도 +, 본인 카톡 버블 |
| 민트 다크 | `--color-mint-dark` | `#7CC4C7` | 민트 호버 |

## 2. 시맨틱 컬러

| 의미 | 변수 | HEX |
|---|---|---|
| 성공 / 호감도 + | `--color-success` | `#A8DADC` (민트와 동일) |
| 경고 / 호감도 - | `--color-warning` | `#FFCC99` |
| 위험 / 거절 | `--color-danger` | `#D89090` |
| 정보 | `--color-info` | `#B8D4FF` |

## 3. 텍스트박스 전용

| 변수 | HEX | 용도 |
|---|---|---|
| `--color-textbox-bg` | `rgba(58, 46, 63, 0.85)` | 반투명 다크 |
| `--color-textbox-text` | `#FFF8FA` | 텍스트박스 내 본문 |
| `--color-textbox-name` | `#3A2E3F` | 화자명 텍스트 |
| `--color-textbox-name-bg` | `#A8DADC` | 화자명 박스 배경 |

## 4. 카톡 모달 전용

| 변수 | HEX | 용도 |
|---|---|---|
| `--kakao-bg` | `#FFE4EC` | 채팅방 배경 (핑크 — 카카오와 차별) |
| `--kakao-bubble-self` | `#A8DADC` | 본인 메시지 버블 (민트) |
| `--kakao-bubble-other` | `#FFFFFF` | 상대 메시지 버블 (화이트) |
| `--kakao-text-self` | `#3A2E3F` | 본인 버블 텍스트 |
| `--kakao-text-other` | `#3A2E3F` | 상대 버블 텍스트 |
| `--kakao-timestamp` | `#999999` | 시간 텍스트 (작게) |
| `--kakao-typing-dot` | `#666666` | "..." 타이핑 인디케이터 |

## 5. 다크 시퀀스 (거절 엔딩, 배드 엔딩)

| 변수 | HEX |
|---|---|
| `--color-dark-bg` | `#1F1822` |
| `--color-dark-text` | `#D8C8DC` |
| `--color-dark-accent` | `#A88B98` |

## 5.5 AffectionToast — 호감도 온도계 토스트

UI-SPEC §11 / ANIMATION-SPEC §13 정합. `src/styles/tokens.css`가 본 표를 미러.

| 변수 | 값 | 용도 |
|---|---|---|
| `--toast-card-bg` | `rgba(255, 248, 250, 0.94)` | 카드 배경 (미세 핑크 틴트) |
| `--toast-card-border` | `rgba(255, 184, 209, 0.6)` | 카드 테두리 |
| `--toast-shadow` | `0 12px 28px rgba(216, 80, 140, 0.22)` | 핑크 톤 드롭쉐도우 |
| `--toast-text` | `#3A2E3F` | 카드 본문 텍스트 |
| `--toast-text-muted` | `#6B5B70` | 현재값 N/100 등 보조 텍스트 |
| `--toast-delta-up` | `#E64178` | 양수 변화량 강조 |
| `--toast-delta-down` | `#8A6B7A` | 음수 변화량 강조 (회색 톤) |
| `--therm-fill-top` | `#FF6FA8` | 액체 그라디언트 상단 |
| `--therm-fill-mid` | `#FFB8D1` | 액체 그라디언트 중단 |
| `--therm-fill-bot` | `#FFD9E5` | 액체 그라디언트 하단 |
| `--therm-glass-stroke` | `rgba(255, 255, 255, 0.55)` | 유리관 외곽선 |
| `--therm-highlight` | `rgba(255, 255, 255, 0.45)` | 좌측 세로 광택 |
| `--therm-bulb-glow` | `rgba(255, 111, 168, 0.45)` | bulb 외곽 글로우 (filter blur) |
| `--therm-tick` | `rgba(58, 46, 63, 0.35)` | 눈금 색 |
| `--therm-scale` | `1` (PC) / `0.75` (≤768px) | 전체 스케일 |

## 6. 접근성

- 모든 텍스트 컬러 콤보는 WCAG AA 준수 (대비비 4.5:1 이상)
- `--color-textbox-text` (#FFF8FA) on `rgba(58, 46, 63, 0.85)` → 대비비 약 12:1 ✅
- `--color-text` (#3A2E3F) on `--color-bg` (#FFE4EC) → 대비비 약 11:1 ✅

## 7. 폴백 시스템 (시스템 다크모드 등)

```css
@media (prefers-color-scheme: dark) {
  /* 게임은 자체 디자인 유지, 다크모드 X (의도적) */
}
@media (prefers-reduced-motion: reduce) {
  /* ANIMATION-SPEC.md 참조 */
}
```
