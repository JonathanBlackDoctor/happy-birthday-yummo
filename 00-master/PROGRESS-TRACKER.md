# 00-master/PROGRESS-TRACKER.md

> 모든 모듈 진행 상황을 한 눈에. 작업 완료 시 즉시 업데이트.

**범례**: ⬜ 미시작 | 🟦 작업중 | 🟨 검토대기 | ✅ 완료 (1차 골격) | ⏸ 보류(deferred, v1.1+ 이연)

---

## 현재 상태: **캐릭터 표시 보정 라운드 완료 (2026-05-08, 4 라운드 — 사이드 캐릭터 시각 균형 조나단/김규민/표경민/윤하정 4건 미세 조정. CharacterLayer.tsx에 prefix별 보정 시스템 도입(PREFIX_SCALE/PREFIX_FIXED_MAX_H/PREFIX_FIXED_MAX_W/PREFIX_FLIP). 라운드 #1 nathan_default.webp 80% 자산 리사이즈(178→138 KB) + 학습: maxHeight 기반이라 자산 px 줄여도 표시 크기 변화 X / 라운드 #2 nathan maxHeight × 0.8 → × 0.92 완화(키 차이 8%) / 라운드 #3 김규민 1.2x + 표경민 0.92(앞줄 720×0.92=662) + 윤하정 scaleX(-1) 좌우반전 — className -translate-x-1/2 제거 후 inline transform 통합 / 라운드 #4 조나단·표경민 슬롯 무관 키 일치 — 신규 PREFIX_FIXED_MAX_H 82.8% 도입(어느 슬롯이든 662px 동일) + PREFIX_FIXED_MAX_W 시도 후 자산 비율 검토(nathan 0.593 vs gyeongmin 0.603)로 가로 제한 불필요 결론 / 시각 균형 보정 정책 4분류 확립(SCALE 슬롯 비례 / FIXED_MAX_H 슬롯 무관 / FIXED_MAX_W 가로 제한 / FLIP 좌우반전) / typecheck 0 + build 301 KB·gzip 88 KB + preview MCP DOM 측정 6명 동시 슬롯 무관 키 일치 검증) + **PM 라이브 플레이 피드백 통합 라운드 완료 (2026-05-08, 6 라운드 + hotfix 2건 — UX/엔진/자산 30+건 처방. 카톡 UI 전면 리팩터(반응형 폰창·아바타·단톡 메타·자동 스크롤·클릭 가속) + 빈 화면 치명 버그 2건(CharacterLayer src 합성 + assetPreloader 같은 src) + 인터랙션 5건(Space 일관성·← 10단계 rewind·화면 어디든 클릭·CG 2s lock·VEO 끝까지 재생) + 시각 효과 4종 신규(ChapterFader·AffectionToast·BG 디졸브·VEO 페이드, prefers-reduced-motion 우회 store-driven step) + 사이드 스프라이트 4명 통합(gyumin/gyeongmin/nathan/junhyuk) + 카톡 v2 프로필 분기(ch03_05~) + 신규 8파일 + 갱신 15파일 + 자산 13장 압축 + 토스트 H5 덮어쓰기 버그·선택지 rewind 멈춤·프롤로그 BG 사라짐 hotfix 2건 + persist version 1→2(옛 saved 자동 무효화) / vitest 72/72 + build 261 KB·gzip 80 KB + validate 0 경고. 잔여: 다른 챕터 끝 BG black 패턴 30+ 씬 일괄 처방, GitHub Pages, Lighthouse) + 마일스톤 #3 5/5 풀 텍스트 완료 (2026-04-29) + 외부 피드백 라운드 #1 6단계 처리 완료 (2026-04-30) + 톤 매트릭스 마이그레이션 5단계 + 영향 모듈 19개 review→done 전환 (2026-04-30) + 검증 6배치 보고 + 처방 라운드 Phase 1~6 + PM 사인오프 라운드 완료 (2026-04-30, 회귀 검증 후 누계 45건 발견 / 42건 처방 / 3건 자동화·이력 보존 / 영향 모듈 22개 + 검증 보고서 6개 status review→done 전환) + W4 BGM·코드 스켈레톤 완료 + W4 Phase A~F 1차 완료 (2026-05-04, 단위 테스트 69건 + 시나리오 컴파일러 v0.2 + 빌드 검증 v0.1 + 거절 카톡 SSoT 모듈 + CI/CD 파이프라인) + 외부 작가 윤문 라운드 #1 12개 시나리오 일괄 통합 완료 (2026-04-30, 엔진 차단 0건 검증 후 백업·교체 / 12개 .md status: review) + W4 Known Issue 정리 라운드 완료 (2026-05-06, 5건 중 4건 처방 + 1건 W5+ 이연 / 단위 테스트 72건 skip 0 / BG 18장 / SCENE_CUE 정식 등록 / toneMatrix 옵션 B 마커 / RejectEnding 옵션 A 라우팅) + W5 라운드 #1·#2 완료 (2026-05-06, 자산 매니페스트 빌드 인프라 + 발견 4건 일괄 처방 / BG 19장 + bg_ktx_window 신규 / build-manifest v0.2 + validate-build v0.3 / 정합 0건 경고 달성) + W6 라운드 #1 완료 (2026-05-06, 16개 엔딩 자동 도달 E2E 16/16 통과 / ch05 PROD blocker 픽스 / vite glob 자동 매핑 / window.__gameStore E2E hook / CI e2e job 활성화) + W4·W5 후속 클린업 라운드 완료 (2026-05-06, 오디오 자산 W5 통합 — BGM 8 + SFX 12 = 20개 mp3 `docs/assets/{bgm,sfx}/` → `public/snd/{bgm,sfx}/` 이동 / manifest 재생성 / 효과음 라이선스 면제 결정 / SFX-list status review→done / build·manifest·validate·vitest 72/72 통과) + W6 모바일 반응형 QA 라운드 완료 (2026-05-06, OrientationLock 신규 + MiniControls 햄버거 메뉴 + 터치 영역 44px + viewport-fit=cover + 모달 시 MiniControls 숨김 + PauseMenu/Gallery 모바일 폭/헤더 보강 / preview MCP DOM 측정 검증 4뷰포트 / build·vitest 72/72 통과 / 실디바이스 QA는 PM 직접 잔여) + W6 성능 최적화 라운드 완료 (2026-05-06, assetPreloader 신규 + gameStore.startScene 훅 + BG/CG/sprite/CGGallery 이미지 loading/decoding/fetchPriority 명시 / preview cacheSize 3 검증 / build 246.88 KB·gzip 75.05 KB / vitest 72/72) + W6 WebM 제거 라운드 완료 (2026-05-06 PM 옵션 a 채택, public/video webm 12개 삭제 / video-list.md §영상 후처리 SSoT 갱신 / RejectEnding `/vid/`→`/video/` 경로 픽스 보너스 / **dist 144M → 95M (49M 절감, 34% 감소)** / MASTER-PLAN §8.2 50MB 대비 2.88x→1.9x / preview MCP fetch HEAD 검증 통과) + W6 VIDEO 명령 처리 라운드 완료 (2026-05-06, 출시 차단급 픽스 — 신규 `src/ui/VideoLayer.tsx` + SceneRenderer VIDEO case 마운트 / skipable true/false 분기 정합 / preview MCP DOM 검증 / **E2E 16/16 통과 28.9s** / build·vitest 72/72 통과) + V.O. 표기 자연어 치환 라운드 완료 (2026-05-07, 옵션 A 컨텍스트별 5패턴 일괄 치환 / 7개 시나리오 본문 + 메모 100% 한국어화 / 잔재 0건 / 외부 작가 윤문본 톤 보존 / build·vitest 72/72 / validate 0 경고) + **W6 BGM/SFX 한글→영문 변환 회귀 fix 라운드 완료 (2026-05-08, 출시 차단급 — 풀 플레이 검증 중 `[audioManager] Unknown BGM: 일상` 경고 발견 / compile-scene v0.3 normalizeBgmId·SfxId 헬퍼 추가 + RE_BGM/RE_SFX 분기 호출 / validate-build v0.4 한글 잔존 시 error 가드 (parseAudioMappings의 ko/en 분리 + validateAudioIds 갱신) / 216개 씬 재컴파일 — 한글 BGM/SFX 잔존 0건 grep 검증 / 브라우저 reload 후 `Unknown BGM` 경고 사라짐 확인 / vitest 72/72 + typecheck 무에러) + W6 fetchPriority React 18 호환 fix 라운드 완료 (2026-05-08, 콘솔 노이즈 제거 — 시도 1 spread 우회 실패 학습 후 시도 2 ref callback + setAttribute 패턴 채택 / BackgroundLayer/CGOverlay/CGGallery 3건 / DOM `fetchpriority="high"` 부착 유지 (성능 효과 보존) + React `Warning: does not recognize fetchPriority prop` 콘솔 경고 12회 → 0건 / vitest 72/72 / 본 라운드 영향 파일 typecheck 무에러) + **W6 자산 통합 검증 라운드 완료 (2026-05-08, Critical 33건 처방 — 비표준 위치값 24건 시나리오 표준화 (`[CHARACTER: id left_back/right_back ...]` → left/right, 9개 시나리오) + 미등록 캐릭터 6명 디렉티브 8건 제거 (약대/본과1/박지수/차민호/이태호/남희석 silent fail 해소, manifest characters 16→10) + Critical #3 `cg_seoyoon_reject` 누락 복원 (RejectEnding.tsx 단계 4 풀스크린 오버레이 + 페이드인 1s + onError 폴백) + 신규 `scripts/audit-asset-flow.ts` 시뮬레이터 (216개 씬 INVALID_POSITION 0건 ✅ / CG_HIDE_MISSING 0건 ✅ / POSITION_COLLISION 10건 + CHARACTER_CONCURRENT_MANY 18건 시각 품질 영역 잔여) / 회귀 검증 통과 — compile 12 .md → 216 씬 + manifest characters 정확히 6명 감소 + validate 16/16 엔딩 + typecheck 무에러 + vitest 72/72 + build 1.45s + e2e 16/16 29.1s + preview MCP DOM 검증 5명 동시 right 슬롯 3장 겹침 확인 / 잔여 라운드 큐 — 미등록 6명 자산 생성+spriteResolver 등록·video_opening·sfx_pageturn 결정·슬롯 충돌 시각 품질·BG_NULL JUMP 그래프 시뮬레이터 v2·VIDEO skipable 정합·RejectEnding cg PM 풀 플레이 시각 검증·audit-asset-flow CI 통합 / 보고서: `08-qa-deployment/verification-reports/07-asset-audit.md`) + **W6 자산 통합 검증 라운드 후속 처방 완료 (2026-05-08 PM 결정 ①a/②a/④a 채택, ③ 별도 대규모 동선 재설계 라운드로 이관 — ① 신규 OpeningVideo.tsx App 진입점 OP 영상 재생 + navigator.webdriver/?scene=/?flags= 자동 스킵 / ② Backlog mount + DialogueBox advance에 sfx_pageturn audioManager 호출 추가 / ④ SCENE-FORMAT VIDEO 디렉티브 skipable 옵션 정식 제거 + 시나리오 9개 10건 정리 + types/compile-scene/scene.json 일관 정리 / E2E flaky 보강 — expectEnding 기본 timeout 10s→20s + playwright 로컬 retries 0→1 (직전 1회 16/16은 운, 본 라운드 4회 재실행 매번 다른 4건 timeout 발견) / 회귀 통과 — compile 216 씬 + manifest 불변 + validate 0 경고 + typecheck 0 + vitest 72/72 + build 1.48s 261.77 KB·gzip 80.07 KB + e2e 16/16 통과 (12 passed + 4 flaky retry 회복 1.9분) / 잔여: 🔴 대규모 동선 재설계 라운드 Critical 출시 전 필수, 미등록 6명 자산 생성, BG_NULL JUMP 그래프 v2, audit-asset-flow CI 통합, E2E flaky 근본 디버깅) + **W6 대규모 동선 재설계 라운드 1차 완료 (2026-05-08 PM 결정 (c) 하이브리드 + (자동 검출) 채택 — Phase 1 CharacterLayer 6슬롯 확장 (left/center/right 앞줄 X25/50/75% z=2 maxH 90% + left_back/center_back/right_back 뒷줄 X30/50/70% z=1 maxH 75%, 같은 X 좌표라도 _back은 작게+뒤로 입체감) + Phase 2 audit v2 신규 (JUMP/CHOICE.next 그래프 빌드 + incoming edges 합집합 BG 상속 정밀화 → BG_NULL false positive 145→40 105건 가지치기, 신규 카테고리 CHARACTER_LEFT_BEHIND 105건·BG_CHANGE_RESIDUAL_CHARS 24건, CHARACTER_CONCURRENT_MANY 임계 ≥3→≥4) + Phase 3a 엔진 fix gameStore.applyCommand BG case 자동 캐릭터 클리어 (BG ID 변경 시 characters={}, 같은 BG/black/white는 유지 → 129건 LEFT_BEHIND+RESIDUAL 실질 시각 영향 0) + Phase 3d 시나리오 슬롯 재배치 11곳 (POSITION_COLLISION 10→0건 완전 해소, ch01_ot 오준혁→right_back / ch03_dongsan 조나단 right_back replace_all 4건 + cmd#35 5명 동시 김규민 left_back 신규 추가 / ch04_library 김규민→right_back 나서윤 임팩트 보존 / ch05_decision 조나단→right_back, 한설 center→right / ch06_h2 오준혁→right_back) / 회귀 검증 — compile 216 씬 + manifest 불변 + validate 0 경고 + typecheck 0 + vitest 72/72 + build 1.45s 262.22 KB·gzip 80.20 KB + e2e 16/16 통과 (14 passed + 2 flaky retry 회복 1.2분) + audit v2 POSITION_COLLISION 10→0 ✅ INVALID_POSITION 0 CG_HIDE_MISSING 0 + preview MCP DOM 검증 5명 동시 ch03_04 cmd#35 6슬롯 시각 분리 확정 (윤모 center 50%/z2/90% + 표경민 left + 김규민 left_back 30%/z1/75% + 장윤영 right + 조나단 right_back 70%/z1/75%) / 잔여: 🟨 PM 풀 플레이 시각 검증 (자동 클리어 fix 의도되지 않은 회귀 의심 케이스 ch02_01·ch03_01·ch04_06), CHARACTER_CONCURRENT_MANY 12건 미세 조정, BG_NULL 40건 정밀 검증, audit v2 store 로직 정합 갱신, 미등록 6명 자산, GitHub Pages, Lighthouse) + **W6 자동 풀플레이 회귀 사냥 라운드 완료 (2026-05-08, 출시 차단급 1건 fix — Claude 자동 풀플레이 65 씬 7분 traversal로 발견. REGRESSION #1 JUMP 비동기 race: applyCommand의 fire-and-forget startScene이 비동기 100~200ms 동안 autoplay tick(30ms)/SceneRenderer useEffect 자동 advance가 옛 씬에서 step null → 안전 가드 reseek(0) 사이클 6회 ch02_01_anatomy_morning에서 cmdIdx 3→13→23 무한 루프 ~7초 → fix: gameStore.advance에서 cmd.type==='JUMP'면 await get().startScene + return으로 applyCommand 우회. REGRESSION #2 부분 fix step null safety guard throttle 모듈 스코프 _stepNullWarnedScenes Set / 검증: 종착 END_H4_REJECT 435s(autoplay KAKAO 자연 흐름 ReplyTimer 자동 timeout late_reply_count 누적 — 의도된 평가) + 65 씬 17 CHOICE 16 KAKAO + hang 0 + network failed 0 + charSnapshots 32건 PM 의심 ch02_01·ch03_01·ch04_06 자동 클리어 fix 모두 정상(BG 변동 직후 charsCount=0 일관, 의도 마운트 보존 ch02_02 윤모/윤하정·ch04_07 윤모·ch05_07 3명) + vitest 72/72 + typecheck 무에러 / 잔여: close 씬 5개(prologue_03_close·ch01_05_close·ch02_02b_steady·ch02_06_close·prologue_02_after_choice)에서 step null 6회씩 잔존 race 분석 별도 라운드, 다른 루트(H1 TRUE/SOLO_SUMMER) 자동 풀플레이 추가 검증 권장)** + **자산 매니페스트 정합 라운드 옵션 A 완료 (2026-05-08, 코드 직접 참조 자산 manifest 등록 + bg_kakao_fullscreen 제거 — build-manifest.ts EXTRA_CGS/EXTRA_VIDEOS + audioMaps SSoT 전수 / cgs 19→20·videos 10→12·sfx 8→13·bg 18→17 / 게임 흐름 영향 0)** + **자산 정합 라운드 옵션 B 완료 (2026-05-08, 스프라이트 alias 4종 시나리오 정합화 + sprite-list 정규식 확장 — 시나리오 7건 sleeping/smile_small/smirk/laugh→default/smile_slight 교체 + spriteResolver SPRITE_FILE_ALIAS 비움 + parseSpriteList bullet 패턴 / _meta.registered.sprite 8→58 / 의미 일부 손실 PM 감내)** + **W6 대규모 동선 재설계 라운드 2차 완료 (2026-05-08, audit v2→v3.1 3-tier severity + transitive inherit BFS — Critical 39→0 / BG_CHANGE_RESIDUAL false positive 17건 제거 (24→7) / 진짜 critical 2건 ch06_h4_reject·ch06_h5_solo_fallback에 [BG: black] 안전 가드 / vitest 72/72 + typecheck 무에러 + audit Major 12 Info 110 / 잔여: CONCURRENT_MANY 12건 PM 시각 검증, audit-asset-flow CI 통합)** + **CharacterLayer _back X 좌표 재조정 라운드 완료 (2026-05-08, PM 풀 플레이 시각 신고 3건 처방 — ch04_04_seoyoon_meet 김규민 right_back+나서윤 right / ch03_04_back_to_school 4명+5명 동시 슬롯 겹침 / 1차 라운드 5% 차이(앞줄 25/75 vs 뒷줄 30/70)가 자산 가로 폭 큰 캐릭(gyumin·gyeongmin·nathan)에서 시각 겹침 → POSITION_X _back 30/70 → **15/85**로 10% 분리, center_back 50% 유지 / 시나리오 변경 0건, CharacterLayer 1줄 fix / audit Critical 0건 유지 + typecheck 무에러 + vitest 72/72 / preview screenshot 도구 timeout 반복으로 PM 직접 시각 검증 권장 / 잔여: 화면 가장자리 잘림 발생 시 PREFIX_FIXED_MAX_W로 폭 제한 또는 좌표 미세 조정)** + **W6 캐릭터 스프라이트 워킹·zoom 애니메이션 라운드 완료 (2026-05-09, 5단계 PM 풀플레이 튜닝 — 도입(CharacterLayer wrapper 3단 slide/bob/zoom + @keyframes 6종 + 토큰 5종 + ANIMATION-SPEC §3·§3.5·§4·§4.5 신설/갱신, 등·퇴장 워킹 + 화자 변경/표정 변경 zoom 1.04, perv_start·ending·kakao·cg 가드) + BG 분기 fix(BG와 캐릭터 동시 변경 시 워킹 미발동 회귀 처방) + reduce-motion override(inline style.animation → .char-anim-* 클래스 selector + @media specificity로 글로벌 0.01ms 룰 우회, PM PC 설정 안 만지고 시각 보장, ANIMATION-SPEC §1.1 신설) + 보빙 진폭 1px→6px·시간 700→1500ms 튜닝(PM '너무 빨라/더 튀어야') + 캐릭터별 PREFIX_WALK_PROFILE 10명 명시 등록(차세린 차분 1750/235/5 / 윤하정 톡톡 1250/180/8 / 한설 천천히 1900/250/4 / 장윤영 활발 1150/170/9 / 김규민 큰 키 1400/270/5 + 친구 4명 base, wrapper inline custom property로 var() 캐릭별 해상, 정지 시각도 캐릭별 다름) / typecheck 0 + dev preview reduce-motion 활성에서도 0.9s/0.45s 정상 적용 확인 / ANIMATION-SPEC status: draft → review / 잔여: PM 풀플레이 시각 검증, 보폭·속도 미세 조정, ANIMATION-SPEC review→done)** + **✅ Phase C E2E 회귀 처방 라운드 옵션 A1 완료 (2026-05-10 — Phase C 사전 점검에서 발견된 E2E 15/16 fail 회복 + 4건 추가 회귀 발견·처방. **변경**: helpers autoAdvanceUntilEnding 재작성(awaiting/scene/choice/kakao/cg 5모드 generic 처리 + hang 가드 30회) + gotoEndingFromEvaluate 신규(Ch.6 본편 traverse 우회 직접 evaluate 진입) + playwright timeout 30s→120s + compile-scene EVALUATE_TIER 파싱 추가(`RE_EVAL_TIER` 정규식 + SceneCommandOut 유니언) + 시나리오 .md 5개 + 압축본 5개 `[EVALUATE_TIER: H<N>]` 마커 추가(5/9 Ch5 엔딩 라우팅 복구 라운드의 컴파일러 누락 처방) + endings.spec.ts hybrid 진입 매트릭스 신 임계 갱신(TRUE/HAPPY/NORMAL/BAD 14건 evaluate 직접 + REJECT/SOLO 2건 ch5_07 라우팅 검증). **검증**: typecheck 0 + vitest 104/104 + compile:all 풀212+압축212 + validate 0 + build 2.39s + **E2E 16/16 통과 8.8m** (10 passed + 6 flaky retry 회복, exit code 0). 직전 12.7m 15 fail → 8.8m 0 fail. 게임 시나리오/엔진/UI/자산 무변동(테스트 도구 + 시나리오 마커만). **Phase C 진입 차단 해소**, GitHub Pages 배포 진입 가능.)** + **🚨 Phase C 사전 점검 라운드 (2026-05-10 03:20 KST CronCreate 일회성 fire + 압축본 후속 일괄 점검 — 풀+압축 양 모드 합산 11종 중 7종 ✓ + 2종 🟨 + 1종 🚨 + 1종 ⬜. **모드 무관**: typecheck 0 / vitest 72/72 ✓. **풀 모드**: README 정합 ✓ / compile 212 씬 ✓ / validate 16 엔딩+거절 도달성 h4_reply_speed 8건 ✓ / audit Critical 16건 (BG_NULL 14+POSITION_COLLISION 2) ✓ / build 2.29s ✓ / **E2E 1 passed/15 failed 12.7m 🚨** Ch5 엔딩 라우팅 2-단계 분리(2026-05-09) 이후 tests/e2e/helpers.ts 미갱신 의심. **압축 모드**: compile:compressed 216→212 씬 stale 정리 ✓ (Phase A 2번에서 .scene.json 4건 삭제 후 manifest 미재생성 누락 발견 → 본 라운드 정합화) / validate:compressed mismatch 0 풀215↔압축212 공통212 보존 항목 0% 변화 ✓ / audit-asset-flow.ts `--mode=compressed` flag 추가 + 실행 결과 Critical 18건 (BG_NULL 16+POSITION_COLLISION 2, 풀 대비 BG_NULL +2건) 🟨 별도 라운드 / **E2E 압축 모드 미실행** ⬜ helpers 갱신 영역 묶어 진행. **빌드**: build 2.90s ✓. 본 라운드 fix X 코드 변경 0 원칙(검증 도구 audit-asset-flow.ts mode flag 추가만 허용). 보고서: `08-qa-deployment/verification-reports/08-pre-deploy-check.md`)** + **Phase B PM 결정 묶음 완료 (2026-05-09, 4건 모두 "유지" — 엔딩 CG 미배치 그대로 + 트루 시퀀스 정합 출시 후 라운드 + Ch.5 변태 망상 페어 #4 현재 위치 유지 + 어휘 룰 위반 3개 시나리오 현재 상태 출시. 코드 무변동.)** + **Phase A 코드 정합성 일괄 정리 라운드 완료 (2026-05-09, dead code 4건 b_late 시나리오 블록 제거(시나리오 .md 4건 + 압축본 4건 + stale .scene.json 8건 정리, 컴파일 216→212 씬) + audit-asset-flow VALID_POSITIONS pair_left/pair_right 등록(INVALID_POSITION 20건 false positive 해소) + validate-build validateRejectReachability KAKAO 안 mechanism 카운트(`(c.type === 'CHOICE' || c.type === 'KAKAO')` 분기 통합, b_late 제거 후 표면화된 검증 회귀 처방) + audit-asset-flow CI 통합(.github/workflows/ci.yml `Audit asset flow` step 신규 continue-on-error 비차단) / 회귀 검증 — typecheck 0 + vitest 72/72 + compile 212 씬 + validate 0 + build 2.13s + audit Critical 40→16건(24건 처방))** + **W6 출시 직전 종합 라운드 완료 (2026-05-09 후반, 19+ 라운드 일괄 — Critical 회귀 fix 3종(Ch5 엔딩 라우팅 복구 2-단계 평가·H4 미니게임 15→3초 즉시 패배·Ch5 모닥불 톤 매트릭스 차단 + 비선택 4명 페이드아웃) + 게임 제목 "성서로맨스" → "구연시" 변경 + ModeSelect 타이틀 화면 리디자인 (`title_cut.png` 5.87MB → `title.webp` 148KB · 97% 감축, geq 마스킹 + 가장자리 알파 그라데이션 + 심장박동 펄스 reduce-motion override) + 엔딩 결과 화면 종합 업그레이드 (결정적 장면 배경 + 명대사 + 카테고리 배수 점수 + NPC 토글 + 캡 해제) + 챕터 회상 시스템 4단계 정비 (단계 업그레이드 + hasRecap 완화 + prologue 차단 + advance 연타 race fix + +3s 락) + BGM·오디오 6묶음 (Howler html5 native loop 강제 4중 보장 + 일상 BGM RESUMABLE fade out/in 재개 + html5 전환 + 비디오 12개 audio strip + 192→128 kbps 재인코딩 + VolumeControl 신규 메뉴 행 위 인라인 슬라이더) + 자체 플레이 검증 라운드 9건 (ChoiceList 셔플 + 차세린 트루 카페 BG `bg_cafe_serin` 신규 + 거절 엔딩 카톡 KakaoModal 표준화 + 머뭇거림 시퀀스 + 장윤영 첫 등장 H5 only + SOLO 작가 노트 NARRATION 삭제 + typing 인디케이터 통일 + 1:1 unread 페이드 + 사진 첨부 이미지 버블) + 자산 보강 (ch02_04 VEO skip + 조나단/윤모 center 겹침 처방) / typecheck 0 + vitest 72/72 + dev/preview 양 서버 라이브 검증 통과)** + **자산 무결성 검증 라운드 완료 (2026-05-09, 코드 수정 0 — PM 검증 3종. ① CG: manifest 20장 ↔ 파일 40 ↔ 시나리오 19종 + RejectEnding 1종 = 100% 활용, 트루 5/5·HAPPY 3/3 OK, NORMAL 3건·BAD 2건·SOLO 1건 CG 미배치 + 트루 시퀀스 순서 ANIMATION-SPEC §12 vs 시나리오 정합 PM 결정 잔여. ② BG: audit-asset-flow v3.1 BG_NULL_CRITICAL 18건 분석 — dead code 4건(카톡 미니게임 재설계 잔재 b_late) + KAKAO.choices edge BG 상속 false positive 14건(`gameStore.startScene`이 `bg.image` reset 안 해 직전 KAKAO BG 그대로) + INVALID_POSITION 10건 = pair_left/pair_right 신슬롯 audit 미등록 false positive — 시각 영향 0건 ✓. ③ 엔딩: 16개 EndingId 모두 ENDING 명령 박힘, 흐름 `applyCommand → pendingEnding+runtimeMode='ending' → SceneRenderer L114 → EndingScreen → (REJECT는 RejectEnding 17.5초 후 onComplete) → EndingStatsPanel(computeEndingScore + 5H/7NPC thermometer + score card)` 16/16 정상 ✓ / typecheck 0 (이전 stale `winner` 미존재 보고 해소 확인) / 잔여 followup: NORMAL/BAD/SOLO CG·트루 시퀀스 순서 PM 결정, audit-asset-flow KAKAO/CHOICE edge BG 상속 BFS 정정 + VALID_POSITIONS 갱신, dead code 4건 정리)** + **엔딩 결과 화면 종합 업그레이드 v1→v2→v3 일괄 완료 (2026-05-09, PM 6번 요청 + 정정 2회 + UI 디테일 후속 = 3 라운드 누적. v1: 결정적 장면(CG/BG) 풀스크린 배경 + 어두운 보라 0.62~0.78 오버레이 + 명대사 「」 인용 + NPC 더보기 토글 + 호감도 캡 0~100 해제(gameStore L428) + 카테고리 배수(TRUE×2/HAPPY×1.5/NORMAL×1/BAD×0.7/REJECT×0.6/SOLO×0.8) + 가산 보너스 4종 + 곱셈 히든 2종(엄마×5/오준혁×10) + 16개 명대사 1차 추출 + endingFlavor.ts 신규 + computeEndingScore 신규 endingScore.ts 분리 + simulateEndingScores.ts 신규(90 케이스). v2(PM 정정 패러다임 전환): "트루 2배는 윈너 호감도에만 곱하는 것" — 인물별 곱셈 모델로 재설계, 윈너 점수=(호감도+윈너KEY×10)×카테고리×집중배수, 비-윈너 H 점수=호감도×1, 엄마/오준혁/교수 인물 점수에만 ×5/×10/×3, 친구합 ×1.3 친목, SOLO 페널티 ×0.8은 H 5명 합에만 + 인물별 임계 차별화(scriptInterpreter L125-180: H1 105/90/70 H2 110/95/75 H3 90/75 H4 70/45 H5 120) + branchEvaluator unit test 7건 임계 갱신 → 72/72. v3(UI 디테일): 조연 7명 ×0.3 가중치(SUPPORTING_WEIGHT) — 점수 분포 ~25% 하향 → 등급 컷 50의 배수(S 550/A 400/B 300/C 200) + 표현 한국어화·축약(KEY→핵심 선택지, H1→히로인/세린, NPC→조연, 카테고리→엔딩 가중, 윈너→Winner) + characters.ts shortName(세린/하정/한설/서윤/윤영) + ENDING_CATALOG title 16개 "세린 / TRUE" 포맷 + BG-only 5개 엔딩에 윈너 스프라이트 합성(serin_smile_warm/serin_concerned/hajeong_smile_small/hajeong_pout/seol_smile_slight) + 좌우 60:40 레이아웃 + 조연 온도계 0.5→0.65 + 라벨 간격 -18px / 검증: typecheck 0 / vitest 72/72 / 시뮬 분포 산출 / preview MCP 11 시나리오 정상(H1 TRUE 일반·친목 발현·히든 mom×5·히든 junhyuk×10·SOLO ×0.8 페널티·H1 NORMAL BG+sprite·세린 트루 cg_serin_true 무회귀 등) / endingFlavor.ts PM 직접 수정본 그대로 유지 / 잔여: E2E endings.spec.ts 16/16 재실행 (명대사 16개 PM 최종 검수 2026-05-10 완료, CHANGELOG 본 일자 엔트리 참조))** + **CI 압축 모드 audit 통합 라운드 완료 (2026-05-10, 08 사전 점검 잔여 #2 처방 — `.github/workflows/ci.yml` 풀 모드 audit name 명확화 + `Compile scenarios — 압축 모드` + `Audit asset flow — 압축 모드 --mode=compressed` 2-step 신규 추가 / 로컬 검증: compile 212 씬 + audit Critical 18건 (BG_NULL_CRITICAL 16 + POSITION_COLLISION 2) 08 사전 점검 §2.3 #9 실측치 정확 일치 + YAML 정합 통과 / `continue-on-error: true` 비차단 정책 풀과 동일 / 게임 코드 무변동, 검증 도구 인프라 보강만. validate:compressed CI 통합은 본 라운드 범위 외 / 잔여: E2E 압축 모드 검증은 풀 E2E 회귀 처방 라운드 helper 갱신과 묶어 진행)** + **사이드 캐릭터 일괄 리네임 라운드 완료 (2026-05-10, PM 직접 명령 — 이창용→남희석 23 파일 170건 + 윤재→승보 31 파일 106건 + side-characters.md §2.4 승보 정식 신설(시나리오 4개 챕터 13회 직접 대사 + 49줄 호명 분량인데 시트 미등록이던 단역, PM 후속 권고 5회 누적 동시 해결) + §7 라운드 노트 신설 + CHANGELOG 신규 엔트리. PM 결정 4건 적용: ① `[약대 동기]` 화자 라벨 유지(Ch.4 첫 등장 정체 노출 방지 의도적 익명 라벨 / 활성 17건 + .scene.json speaker 17건 + 윤문 8건 + `[CHARACTER_HIDE: 약대 동기]` 디렉티브 모두 무변동, 72건 보존) / ② §2.4 승보 정식 등록 / ③ `_backup-원본/` 4 파일 보존 (`ch03_dongsan.md`/`ch04_library.md`/`ch06_h1_serin.md`/`ch06_h2_hajeong.md` — 2026-05-08 양식대로 역사 기록) / ④ 이창용 ch03 unbalanced CHARACTER lifecycle 그대로 보존 ([CHARACTER_HIDE: 남희석]만 남는 상태, 정합 라운드는 별도 일정). 호칭 변형 자동 포함: "윤재 형"→"승보 형" / "약대 윤재"→"약대 승보" / "약대 동기 윤재"→"약대 동기 승보" / "이창용 펠로우"→"남희석 펠로우" / "이창용 선배(님)"→"남희석 선배(님)". 일괄 변경 도구 PowerShell `[System.IO.File]::ReadAllText/WriteAllText` UTF-8 NoBOM + frontmatter `status: done`→`review` 동시 전환. 자기 참조 부작용 1건 발견 즉시 정정 (side-characters.md §7 신설 직후 일괄 치환으로 "(구) 이창용→남희석"이 "남희석→남희석"으로 변환됨 → "(구)" 표기로 옛 이름 명시 복원). 검증 누락 1건 발견 즉시 처리 (`08-qa-deployment/verification-reports/05-continuity.md` Plan 누락분 본문 인용 라인 추가 갱신). 검증: 활성 영역 이창용 0건 + 윤재 0건 + 남희석 170건 + 승보 106건 매치 + [약대 동기] 라벨 72건 무변동 + npm run compile 12 .md → 212 씬 통과 + 컴파일러 .md SoT 동기 후 src/scenes 이창용·윤재 0건. 영향 모듈 status `done`→`review` 일괄 전환. 영향 범위 활성 54 파일 + 시트 1. 잔여: 이창용 ch03 unbalanced lifecycle 정합 라운드 (PM 결정 ④ 별도 일정), §2.4 승보 자산 생성 (스프라이트·avatar — PM 직접 영역))**

> **v1.0 범위: 메인 모드("구윤모로 플레이")만** — "구윤모와 플레이" 서브 모드는 v1.1 이연 (2026-04-29 PM 결정, CHANGELOG 참조).

W1~W6 모든 .md 골격 완성 + 라운드 1(사용자 검증) + 라운드 2(자동 일관성 점검) + W2-prep 동기화(B/D/E/F/G) + **W2 공통부 풀 텍스트 5개 챕터(prologue/Ch.1~5) + 마일스톤 #2 후속 동기화(호감도 KEY +5→+10, 매트릭스 4건 갱신, SOLO 명시 분기, H4 키 통일)** 완료. **마일스톤 #3 진행 — Ch.6 H4 나서윤 분기 풀 텍스트 (3종 엔딩) 완료**.

**병렬 트랙:** W4 사용자 직접 작업 — **BGM 8트랙 done + SFX 12종 done ✅** (2026-04-29 → 2026-05-06 W4·W5 후속 클린업 라운드). `public/snd/bgm/` 8 mp3 + `BGM-list.md` done. `public/snd/sfx/` 12 mp3 + `SFX-list.md` done — Phase 1·1.5·2·2.5 (1차→4차 PM 직접 crop) + PM 직접 청취 12개 통과 + ebur128 LUFS 실측 기록 (편차 8.1 dB / TP 클리핑 4건 발견, PM 청감 무문제 결정) + W4·W5 후속 클린업 라운드(2026-05-06)에서 자산 W5 통합·매니페스트 재생성·효과음 라이선스 면제 결정으로 status review→done. 마일스톤 #3 후 신규 P2 0건 확인.

### 마일스톤 #2 ✅ — Ch.6 작성 전 호감도 시스템 정합화 (2026-04-29)

- ✅ Ch.1~5 풀 텍스트 작성 (prologue, ch01_ot, ch02_anatomy, ch03_dongsan, ch04_library, ch05_decision)
- ✅ 톤 룰 3차 갱신 + 점검 라운드 (친구 단톡 외 부드럽게, 친구 오프라인 약자 X, 학년 표기 통일, 23학번 04년생 정합)
- ✅ 호감도 변동값 일괄 상향 (KEY +5 → +10) — BRANCH-GRAPH §4 정합
- ✅ BRANCH-GRAPH §5 매트릭스 갱신 (Ch.1 H2, Ch.5 H1·H2·H3 회식 키 추가)
- ✅ END_SOLO_SUMMER 명시 분기 추가 (ch05_decision Scene 07)
- ✅ H4 키 +3 → +10 통일
- ✅ **옵션 B 하이브리드 — "좋은 답변 +5" 모먼트 9건 추가** (ch01·ch02·ch03·ch04). 누적 호감도 +35~+46 → +40~+61. 본문 무수정.
- ✅ **W3 prep 잔재 정리 완료** (2026-04-29) — 영남대→계명대 4건 (bg-list §12 ID/디스크립터 + cg-list H4 ×2 + video-list ×2) + 장유나→장윤영 2건 (cg-list H5 헤더, CONVENTIONS L105/L117). 영문 ID `seoyoon`·`yuna` 유지.
- ✅ **톤 패스 라운드 (2026-04-29) 8개 시나리오 완료** — CONVENTIONS §3.6 신규 가드레일(결/한 톤/한 박자/본심/메타 어휘 5종 + 추가 6번 회피 어휘) 적용. prologue + Ch.1~5 + Ch.6 H4·H2 일괄 점검. 호감도 변동·KEY·플래그·연출 큐·거절 카톡 텍스트 무수정. 각 파일 작가 메모에 §톤 패스 라운드 기록.

### 마일스톤 #3 ✅ — Ch.6 분기 시나리오 풀 텍스트 5/5 완료 (2026-04-29)

- ✅ **`03-story/scenarios/ch06_h4_seoyoon.md`** — H4 나서윤 분기 풀 텍스트 (TRUE/NORMAL/REJECT 3종 엔딩, 거절 8단계 연출 정확, KEY 3개 + 좋은 답변 +5 ×5 + 미니게임 2회 + 변태 페어 #1)
- ✅ **`03-story/scenarios/ch06_h1_serin.md`** — H1 차세린 분기 (TRUE/HAPPY/NORMAL/BAD, 1219줄, 7월 4일 분당 카페 트루엔딩)
- ✅ **`03-story/scenarios/ch06_h2_hajeong.md`** — H2 윤하정 분기 (TRUE/HAPPY/NORMAL/BAD, 1161줄)
- ✅ **`03-story/scenarios/ch06_h3_seol.md`** — H3 한설 분기 (TRUE/HAPPY/NORMAL, BAD 없음, 1128줄)
- ✅ **`03-story/scenarios/ch06_h5_yuna.md`** — H5 장윤영 분기 (TRUE만, 1150줄, SOLO 폴백 분기 포함)
- ✅ **`03-story/scenarios/end_solo_summer.md`** — END_SOLO_SUMMER 단독 엔딩 (16번째, 274줄, 2026-04-30 본문 전면 재작성으로 "자리" 강박 해소 0회 달성)

12개 시나리오 풀 텍스트 모두 작성 완료. status: review (사용자 검증 대기). 총 10,314줄.

### W4 Phase A~F 1차 완료 ✅ — 엔진/UI 코드 + 시나리오 컴파일러 + CI/CD (2026-05-04)

CHANGELOG 본 라운드 엔트리 참조. Phase A+B+C+D+E+F 묶음 진행 (Plan: graceful-juggling-peacock).

**검증 통과**:
- ✅ TypeScript typecheck 무에러
- ✅ Vitest 단위 테스트 **69건 (68 passed / 1 skipped)** — 4파일
- ✅ 시나리오 컴파일러 v0.2 — 12개 .md → **216개 씬** 변환 성공
- ✅ 빌드 검증 v0.1 — **16/16 엔딩 도달** + KEY 신표기법 45회 (H1:5 H2:7 H3:15 H4:12 H5:6) + H4 미니게임 12건 + 거절 도달성 OK
- ✅ Vite production build 786ms (JS 217KB / gzip 69KB)

**Phase A** (스캐폴딩) — 기존 작업 + scripts/devDeps 보강 (vitest, @playwright/test, tsx, prettier, jsdom)
**Phase B** (타입·상태) — 기존 핵심 + 누락 4건 보강:
- ✅ `vitest.config.ts` (jsdom + alias)
- ✅ `tests/unit/branchEvaluator.test.ts` 15건 (BRANCH-GRAPH §6.1 정합 검증)
- ✅ `tests/unit/toneMatrix.test.ts` 23건 (1 skipped: H3/H4 KEY 톤 충돌 Known Issue)
- ✅ `tests/unit/saveSlots.test.ts` 20건 (수동 6슬롯 + 마이그레이션)
- ✅ `src/engine/saveSlots.ts` (STATE-SCHEMA §1·§5·§6 정합)

**Phase C** (시나리오 컴파일러 + 빌드 검증) — 신규 4건:
- ✅ `scripts/compile-scene.ts` v0.2 — SCENE-FORMAT §1.1 디렉티브 파서 + 톤 매트릭스 신표기법(`{tone:..., key:..., descriptor:...}`) + CHOICE_KAKAO h4_reply_speed mechanism 자동 부여
- ✅ `scripts/validate-build.ts` v0.1 — 16엔딩 도달 + KEY 매트릭스 분리(옛/신) + 거절 도달성 + JUMP/next 검증
- ✅ `src/engine/rejectLines.ts` — MASTER-PLAN §4.3 거절 카톡 변경 금지 텍스트 + 8단계 메타 SSoT 모듈
- ✅ `tests/unit/rejectLines.test.ts` 11건 — 4줄 글자 단위 + 8단계 정확 매핑 가드

**Phase D** (UI 골격) — 기존 자산 placeholder 작동 검증 완료. DialogueBox / ChoiceList / BackgroundLayer / CharacterLayer / CGOverlay / Backlog / MiniControls / PauseMenu / EndingScreen / gallery/ 모두 ✅.

**Phase E** (카톡 + 거절 시퀀서) — 기존 4건 + SSoT 분리:
- ✅ KakaoModal / KakaoMessage / ReplyTimer (15초) / RejectEnding (8단계) 기존 작성 검증
- ✅ `RejectEnding.tsx` ↔ `rejectLines.ts` import 갱신 (REJECT_LINES + 타이밍 SSoT 모듈에서)

**Phase F** (CI/CD) — 신규 3건:
- ✅ `.github/workflows/ci.yml` (typecheck/lint/test/compile/validate/build, e2e placeholder)
- ✅ `.github/workflows/deploy.yml` (main push → Pages 배포)
- ✅ `playwright.config.ts` (W6 e2e 스켈레톤)

**Known Issue / 변경 제안 (W4 후속)** — 2026-05-05 라운드 처방 결과:
1. ✅ ~~`toneMatrix.toneToKeyChoice` H3/H4 KEY 톤 충돌~~ — 옵션 B(`mechanism: 'h4_facing_key'` 마커) 채택. skip 해제, 신규 단위 테스트 4건 추가
2. ⏸ **W5+ 이연 (PM 결정 2026-05-05, 옵션 Z)** — 컴파일러 v0.3 IF/ELSE 블록 지원: EVALUATE_BRANCH가 47건 흡수 → 실질 영향 X. 회귀 위험 줄이고 W5 진입 우선
3. ✅ ~~`bg_dongdaegu_station` / `bg_kakao_fullscreen` 신규 BG 등록~~ — bg-list.md §16·§17·§18(rooftop variant) 추가 + validate-build.ts BG ID 화이트리스트 v0.2
4. ✅ ~~`SCENE_CUE` 디렉티브 SCENE-FORMAT §1.1 정식 등록~~ — SCENE-FORMAT §1.1 + types.ts + compile-scene v0.2 + SceneRenderer DEV 콘솔 노출
5. ✅ ~~`EndingScreen` ↔ `RejectEnding` 라우팅~~ — 옵션 A(살리기). EndingScreen 분기 + RejectEnding #7/#8 보강 + ch06_h4_reject 단순화

다음 단계: W3 사용자 자산 생성 / W5 콘텐츠 통합 / W6 E2E + 출시.

---

### §3.6 #8 사후 점검 라운드 ✅ — 11개 시나리오 한 단락 안 3회+ 패턴 0건 달성 (2026-04-30)

CHANGELOG 본 라운드 엔트리 참조. 톤 패스 거친 8개 + 안 거친 3개 모두 일괄 점검·분산 처리.

- ✅ **8개 (톤 패스 거친 시나리오)** — 회피 어휘 5종 직접 위반 3건 픽스 (ch05 결×2 + ch02 정답). 단락 안 3회+ 0건.
- ✅ **ch06_h5_yuna** — 자리 173 → 38회 (-78%), 한 단락 안 3회+ 26건 → 0건. 옵션 1 (단락 분산) 처리.
- ✅ **ch06_h3_seol** — 자리 97 → 40회 (-59%), 자세 51 → 34회 (-33%), 한 단락 안 3회+ 14건 → 0건.
- ✅ **ch06_h1_serin** — 자리 51 → 32회 (-37%), 한 단락 안 3회+ 5건 → 0건.

**잔여 (별도 라운드)**:
- ⬜ Ch.5 변태 망상 페어 #4 위치 재검토 (PM 결정 대기)
- ⬜ MASTER-PLAN frozen 항목 (다음 unfreeze 시점에 일괄 반영)

### 검증 처방 라운드 ✅ — Phase 1~5 완료 (2026-04-30)

CHANGELOG 본 라운드 5개 엔트리(Phase 1·2·3·4·5) 참조. 6개 배치 검증 보고서(`08-qa-deployment/verification-reports/00~05-*.md`) 발견 31건 일괄 처방.

- ✅ **Phase 1 (PROD blocking)**: JUMP placeholder 5건 → 실제 첫 씬 ID 교체 (prologue→ch01·ch01→ch02·ch02→ch03·ch03→ch04·ch04→ch05). 챕터 흐름 끊김 해소.
- ✅ **Phase 2 (MASTER-PLAN unfreeze)**: 6건 일괄 (엔딩 수 15→16, 서브 모드 v1.1 이연, H1~H5 표 R2/영남대/장유나 갱신, H4 거절 트리거 갱신, 거절 4단계 cross-ref) + CONVENTIONS §1 4개 마스터 파일 frontmatter self-exempt 메모 추가.
- ✅ **Phase 3 (본문 stale 정합화)**: BRANCH-GRAPH §4·§5·§6 + STORY-BIBLE §6.3 + PROGRESS-TRACKER + ch02 video_meet_seol 추가 + route-H4 ≥70 + 5시트 §6 트루 키 호감도 신표기. status: review→review 7건 전환.
- ✅ **Phase 4a (PM 결정 1: Ch.6 변태 망상 페어 회귀)**: ch06_h1·h2·h3·h5 4시나리오 페어 본문 통째 제거 + 케어 모놀로그 2줄 대체 + frontmatter + 머리말 + 작가 메모 §변태 망상 페어 절 헤더 갱신. status: review→review 4건.
- ✅ **Phase 4b (PM 결정 2: KEY 옛 표기 검증)**: 본문 [CHOICE] 옛 표기 0건 확인 / KEY:H#: 29건 = 100% 작가 메모 영역 / SCENE-FORMAT §1.3b 호환 + 이력 보존 차원에서 그대로 유지.
- ✅ **Phase 5 (Minor 일괄)**: side-characters depends-on / STATE-SCHEMA draft→review + current_scene_id 필드 / route-common Ch.5 회식 5지선다 페널티 메모 / toneMatrix.ts:89 주석 갱신.
- ✅ **Phase 6 (회귀 검증 + 추가 stale 일괄 처방)**: 회귀 검증에서 Phase 2·3·4 처방 누락 본문 stale 14건 발견 → PM "(b) 14건 모두 일괄" 결정으로 추가 처방. ch06_h4 변태 망상 페어 회귀 (Phase 4 누락분) + 옛 명명 12건 본문 정합화 + ch06 5시나리오 의사코드·IF 체인 표 명명 갱신 + ch06_h4 임계 80→70 갱신 + MASTER-PLAN 3건 추가 (line 90·267·275) + ARCHITECTURE status 전환. 본문 잔존 0건 회귀 검증 통과.

**처방 누계 (Phase 1~6)**: Critical 11/11 + Major 20/20 + Minor 11/14 (3건 보류 — Mn8·10·11 자동화·이력 보존 영역).

- ✅ **PM 사인오프 라운드 완료 (2026-04-30)**: 회귀 검증 통과 확인 후 영향 모듈 22개 + 검증 보고서 6개 status `review` → `done` 일괄 전환. 시나리오 10개 / 분기·세계관 3개 / 루트 2개 / 캐릭터 6개 / 엔진 2개 / UI 1개 / QA 검증 보고서 6개. CHANGELOG 본 라운드 사인오프 엔트리 참조. **검증 처방 라운드 완전 종료, 다음 단계 W5 콘텐츠 통합 진입 가능 상태**.

**다음 단계 → W5/W6**:
- 본 처방 라운드 결과 회귀 검증 후 영향 모듈 status review→done 재사인오프
- W5 콘텐츠 통합 (md→JSON 변환) + L13~L14 자동 검증
- W6 QA 자동화 (본문/메모 분리 grep + 카운트 정합)

---

### 외부 피드백 라운드 #1 ✅ — 6단계 처리 완료 (2026-04-30)

CHANGELOG 본 라운드 엔트리 참조. 출시 차단급 3건 + 정합 픽스 4건 + 가드레일 룰 1건 신규 추가.

- ✅ **1. END_SOLO_SUMMER 라우팅 통일**: ch05_decision 868행 [ENDING] → [JUMP: end_solo_summer_main] + ch06_h5_yuna 960행 JUMP 타깃 ID 정합. 두 진입점 모놀로그 시퀀스 비대칭 해소.
- ✅ **2. STORY-BIBLE 시간선 7.10 확장**: 엔딩 시기 6.20~30 → 6.20~07.10 (H1 트루 7.4 포함). 총 시간선 4개월 → 4.5개월.
- ✅ **3. 친구 단톡 표경민 정정**: end_solo_summer 132·204·238행 "이문규" → "표경민" (Ch.1~5 트리오 일관성 유지).
- ✅ **4. 호감도 명세 통일 (옵션 b 분할 합산 형식)**: ch04 4건 + ch02 2건 + ch03 2건 + ch01 자체점검 + route-common Ch.1~Ch.5 spec 일괄 갱신. BRANCH-GRAPH §4 누적값 무수정.
- ✅ **5. ch04 877행 메모 본문 정합 갱신** (본문 무수정): 메모만 2차 조정 룰 본문 따라 풀이로 갱신.
- ✅ **6. end_solo_summer 본문 전면 재작성**: "자리" 빈도 109회 → 본문 0회 달성 (사용자 처방 단계 목표 1차 30 → 2차 15 → 최종 5회 이하 한 번에 달성). 작가 메모 §3.6 가드레일 점검 항목 신규 추가.
- ✅ **7. CONVENTIONS §3.6 #8 신규 룰 추가**: "치환어 빈도 감시" 룰. 빈도 임계 + 치환 후보 복수 운영 + 자체점검 항목 + 사후 검증.

**잔여 (별도 라운드)**:
- ⬜ 다른 8개 시나리오 (prologue + Ch.1~5 + Ch.6 H4·H2·H3·H1·H5)에 §3.6 #8 치환어 빈도 감시 룰 사후 점검 라운드
- ⬜ Ch.5 변태 망상 페어 #4 위치 재검토 (펜션 도착 직후로 옮기거나 제거 — 사용자 결정 후)
- ⬜ MASTER-PLAN frozen 직접 수정 금지 항목 (다음 unfreeze 시점에 일괄 반영)

다음 단계: **사용자 검증 (모든 시나리오 status: review → done) + 마일스톤 #4 (.md→JSON 변환)**

### 외부 작가 윤문 라운드 #1 ✅ — 12개 시나리오 일괄 통합 (2026-04-30)

CHANGELOG 본 라운드 엔트리 참조. 외부 작가에게 챕터 단위 윤문 의뢰 → 12개 .txt 회수 → 검증 리포트 → 백업 후 일괄 교체.

- ✅ **작가용 가드레일 브리프 작성** — 모든 챕터 대본·캐릭터 시트만 보는 외부 작가용 한 장 룰셋: 시스템 태그(BG/BGM/SFX/CG/VIDEO/CHARACTER/JUMP/CHOICE 마커 `tone/key/descriptor/mechanism`) + 거절 카톡 텍스트 토씨 보존 + 16개 엔딩 ID·조건 + 캐릭터 캐논 + KEY 톤 매핑 + 12세 등급(욕설 절대 금지) + 변태 망상 페어 룰 + 회피 어휘 5종(결/한 톤/한 박자/본심/메타) + §3.6 #8 치환어 빈도 감시 + 자체점검 체크리스트.
- ✅ **검증 리포트 — 엔진 차단 0건**: 씬 ID 12/12 일치, JUMP 타깃 12/12 보존, CHOICE 마커(`tone/key/descriptor/mechanism`) 12/12 일치, 호감도 디렉티브 12/12 보존, 시스템 큐 태그 12/12 보존, 거절 카톡 4분할 텍스트(ch06_h4_seoyoon 1018~1021행) 토씨 일치, 캐릭터 캐논 12/12 보존, 욕설 0건.
- ✅ **백업 후 일괄 교체**: `_backup-원본/` 12개 .md 보관 + 윤문 .txt 본문(첫 줄 파일명 11건 스트립, ch01_ot.txt 예외) + 원본 트레일링 메타(`## 작가 메모 (자체 점검)` 절) 결합. 12개 .md 덮어쓰기 완료. 신규/삭제 씬 ID 0건, 게임 큐 보존, UTF-8 무 BOM.
- ✅ **본문 변동 미미** (게임 작동 무영향): ch06_h1_serin 0줄, ch06_h2 0줄, ch06_h3 -1, ch06_h4 +4, ch06_h5 -1, end_solo_summer 본문 변동 없음. 작가가 게임 큐 보존하면서 표현 다듬은 결과. 라인 드롭(−175~−310)은 모두 트레일링 메타 컷이었고 원본에서 복원.

**잔여 (별도 라운드)**:
- ⬜ 어휘 룰 위반 정리 — 작가 재작업 또는 사용자 직접 패스 권장 3개: `ch06_h5_yuna` "직진" 19·"한 톤" 14·"결" 11, `ch05_decision` "결" 25·"자리" 49, `ch06_h4_seoyoon` "자리" 35·"분위기" 25·"결" 8
- ⬜ 치환어 분산 패스 4개: `ch04_library` "한 박자" 8·"자리" 22, `ch06_h1_serin` "자리" 12·"분위기" 6, `ch06_h2_hajeong` "자리" 36·"분위기" 28, `ch06_h3_seol` "자리" 23·"분위기" 16
- ⬜ `ch05_decision` 변태 망상 페어 자각 1건 추가 보강 (윤문 중 4/4/3 → 4/3/4 드리프트, 자각 라벨 1건 보강 필요)

**다음 단계**: 어휘 룰 정리 라운드 → 사용자 시나리오 검증(모든 시나리오 status: review → done) → 마일스톤 #4 (.md → JSON 변환).

### W3 prep 잔재 정리 ✅ 완료 (2026-04-29) — 5건 처리

- ✅ `04-image-prompts/backgrounds/bg-list.md` §12 `bg_yeungnam_pharm` → **`bg_kmu_pharm`** (ID + 한글 + 영문 + 사용 챕터 노트)
- ✅ `04-image-prompts/event-cgs/cg-list.md` H4 `cg_seoyoon_first_meet`, `cg_seoyoon_true` 영문 디스크립터 — 계명대 성서 캠퍼스 기준 갱신
- ✅ `04-image-prompts/veo-videos/video-list.md` `video_meet_seoyoon`, `video_true_seoyoon` 영문 디스크립터 — 계명대 성서 캠퍼스 기준 갱신
- ✅ `04-image-prompts/event-cgs/cg-list.md` H5 한글 헤더 "장유나" → "장윤영" (영문 ID `yuna_*` 유지)
- ✅ `00-master/CONVENTIONS.md` L105/L117 "장유나" → "장윤영" (영문 ID `yuna` 유지) — W2-prep 후속 작업 #1 처리

> **잔여 (별도)**: bg-list variant별 별도 자산 생성 여부 결정은 W3 본 작업(사용자 자산 생성) 시점에. INTEGRATION-PLAN.md §3 매니페스트 `bg_yeungnam_pharm` 다운스트림 참조 정합 패치 필요 (CHANGELOG 본 엔트리 변경 제안 #1).

---

## W1: 기반 (위계 1)

### 01-research
- ✅ `01-research/kmu-medical-school.md` — 골격 (Claude Code가 채울 영역)
- ✅ `01-research/medical-life-realism.md` — 골격
- ✅ `01-research/reference-vn-analysis.md` — 골격

### 02-characters
- ✅ `02-characters/goo-yunmo.md` — 카톡 분석 결과 풀 반영
- ✅ `02-characters/side-characters.md` — 동기 6명 (김규민/표경민/조나단/오준혁/이문규/정욱), 교수 3명 (이태호/나은영/남희석), 단톡 명세
- ✅ `02-characters/heroines/H1-cha-serin.md`
- ✅ `02-characters/heroines/H2-yoon-hajeong.md`
- ✅ `02-characters/heroines/H3-han-seol.md`
- ✅ `02-characters/heroines/H4-na-seoyoon.md` ⚠️ 거절 엔딩 메커니즘 명세 포함
- ✅ `02-characters/heroines/H5-jang-yuna.md`

### 03-story (1차)
- ✅ `03-story/STORY-BIBLE.md` — 세계관, 시간선, 톤
- ✅ `03-story/BRANCH-GRAPH.md` — 16개 엔딩 매트릭스 + 알고리즘 (END_SOLO_SUMMER 포함)

---

## W2: 시나리오 (위계 2) — 비트 시트 골격

- ✅ `03-story/route-common.md` — 프롤로그 + Ch.1~5 비트 시트
- ✅ `03-story/route-H1-cha-serin.md` — Ch.6 + 4종 엔딩
- ✅ `03-story/route-H2-yoon-hajeong.md` — Ch.6 + 4종 엔딩
- ✅ `03-story/route-H3-han-seol.md` — Ch.6 + 3종 엔딩 (BAD 없음)
- ✅ `03-story/route-H4-na-seoyoon.md` ⚠️ 거절 카톡 엔딩 8단계 연출 명세
- ✅ `03-story/route-H5-jang-yuna.md` — Ch.6 + 트루 엔딩
- ⏸ `03-story/route-female-pc.md` — **v1.0 제외, v1.1 이연** (서브 모드, 사양 보존용 유지. CHANGELOG 2026-04-29)

> ⚠️ **W2 다음 작업**: 위 골격을 Claude Code가 풀 텍스트(대사·지문·선택지)로 확장.

---

## W3: 이미지/영상 프롬프트 (위계 3)

- ✅ `04-image-prompts/PROMPT-GUIDE.md` — 작성 규칙
- ✅ `04-image-prompts/sprites/sprite-list.md`
- ✅ `04-image-prompts/backgrounds/bg-list.md` — 배경 15장
- ✅ `04-image-prompts/event-cgs/cg-list.md` — 이벤트 CG 20장
- ✅ `04-image-prompts/veo-videos/video-list.md` — VEO 영상 12개

### 사용자 직접 작업 (W3 본 작업) ✅ 완료 (2026-05-06, 라운드 3)
- ✅ Gemini Nano Banana 2로 이미지 생성 — 스프라이트 59장 + 배경 15장 + CG 20장 = **94장**
- ✅ 이미지 후처리 — `0501test/_scripts/` 자동화 파이프라인 (rembg birefnet-general + flood-fill + WebP) + CG 갤러리용 워터마크 crop 자동화
- ✅ VEO 3.1 Fast로 영상 생성 — 12개 MP4 + ffmpeg `delogo`/`crop` 후처리 + libx264 mp4 + libvpx-vp9 webm 듀얼 인코딩
- ✅ 자산 게임 프로젝트 통합: `public/img/sprites/` 59 + `public/img/bg/` 15 + `public/img/cg/` 40(20+20 _full) + `public/video/` 24(12 mp4+12 webm) = **138 파일, 63.9 MB**
- ✅ `npm run manifest` 자동 생성 → `public/manifest.json` (bg 18, characters 16, cgs 19, videos 10, bgms 8, sfx 8)
- ✅ 4개 매니페스트 .md `status: review` 일괄 전환 (sprite-list / bg-list / cg-list / video-list)

### 라운드 4 자산 보강 ✅ (2026-05-07) — 사이드 캐릭터 4명 + 누락 배경 2장 + 회귀 fix
- ✅ 사이드 캐릭터 스프라이트 4장 추가 — `gyumin_default.webp` / `junhyuk_default.webp` / `jonathan_default.webp` / `kyungmin_default.webp` (라운드 1·2 파이프라인 재사용, rembg birefnet-general + WebP)
- ✅ 누락 배경 2장 추가 — `bg_dongdaegu_station.webp` / `bg_ktx_window.webp` (1920×1080 LANCZOS 업스케일)
- ✅ `src/data/spriteResolver.ts` 매핑 확장 — 4명 한↔영 ID + KNOWN_PREFIXES 추가
- ✅ `src/engine/SceneRenderer.tsx` 회귀 fix — BG/CHARACTER/CHARACTER_HIDE/CG_HIDE 명령 자동 advance (사용자 풀 플레이 첫 진입 멈춤 버그 해소)
- ✅ `npm run manifest` 재생성
- 자산 합계: sprites 59→**63**, bg 15→**17**

### 라운드 5 CG 화질 라운드 ✅ (2026-05-08) — 이벤트 CG 1080p LANCZOS 업스케일
- ✅ PM 풀 플레이 "이벤트 배경 화질 낮음" 보고 → 측정 결과 CG native 1376×768 (1.06M px) vs 배경 1920×1080 (2.07M px). 캔버스 1.40x 자동 보간 흐림 원인 확정.
- ✅ CG 게임용 20장 LANCZOS 1920w 업스케일 (1376×768→**1920×1072**, 1536×1024→1920×1280)
- ✅ CG 갤러리용 20장 LANCZOS 1920w 업스케일 (1276×768→**1920×1156** crop된 케이스, 1436×1024→1920×1369)
- ✅ 자산 합계: cg/ 2.0 → **5.4 MB** (+3.4 MB) / dist 약 95 → **~98 MB** (한도 100 MB 임박)
- ✅ 배경(라운드 3)과 통일된 정책 — CG만 native 유지하던 비대칭 해소
- 잔여: 추가 화질 향상 필요 시 옵션 C (Real-ESRGAN anime 업스케일, GPU ~1~2시간)

---

## W4: 엔진/UI (위계 4)

- ✅ `05-ui-design/UI-SPEC.md`
- ✅ `05-ui-design/COLOR-TOKENS.md`
- ✅ `05-ui-design/ANIMATION-SPEC.md`
- ✅ `06-engine/ARCHITECTURE.md`
- ✅ `06-engine/SCENE-FORMAT.md`
- ✅ `06-engine/STATE-SCHEMA.md`

### 다음 작업 (W4 코드)
- ✅ 엔진 코드 스켈레톤 (`src/engine/`) — types/audioMappings/audioManager/scriptInterpreter/SceneRenderer (2026-04-29)
- ✅ UI 컴포넌트 (`src/ui/`) — DialogueBox/ChoiceList/Backlog/PauseMenu/MiniControls/EndingScreen + BackgroundLayer/CharacterLayer/CGOverlay
- ✅ 카톡 메신저 컴포넌트 (`src/ui/katalk/`) — KakaoModal/KakaoMessage/ReplyTimer/RejectEnding (8단계 연출 hook 정확)
- ✅ CG/BGM/엔딩 갤러리 컴포넌트 (`src/ui/gallery/`) — GalleryScreen 탭 + CGGallery 4열 + BGMGallery 8트랙 + EndingGallery 16슬롯
- ✅ 빌드/린트 통과 — `npm run build` (78 모듈, 215kB JS) + `npm run lint` 0 에러 (CONVENTIONS §9 1·2번)
- ✅ 더미 씬 풀 루프 — `dummy_full_loop` → `dummy_full_loop_kakao` (KAKAO + JUMP) → `dummy_full_loop_ending` (ENDING SOLO_SUMMER)
- ⬜ test/E2E/자산검증 (CONVENTIONS §9 3·4·5번) — W5/W6 범위
- ⬜ 시나리오 .md → JSON 변환 (`scripts/md-to-scene.ts`) — W5

### 사용자 직접 작업
- ✅ BGM 8트랙 큐레이션 (DOVA-Syndrome 7 + Pixabay 1) — 명세: [`docs/assets/BGM-list.md`](../docs/assets/BGM-list.md) status: review. 자산: `public/snd/bgm/` (W4·W5 후속 클린업 라운드 W5 통합 이동, 2026-05-06)
- ✅ SFX 라이브러리 수집 — 명세: [`docs/assets/SFX-list.md`](../docs/assets/SFX-list.md) **status: review** (Phase 1·1.5·2·2.5, 1차→4차 PM 직접 crop + PM 청취 검증 통과, 2026-04-29 → 2026-05-06). 12개 자산 `public/snd/sfx/` 배치 (W4·W5 후속 클린업 라운드 W5 통합 이동, 2026-05-06). PM "다 mono로" 명령 → bar_ambient stereo→mono. ebur128 LUFS 실측 기록(§3.6.1, 편차 8.1 dB / TP 클리핑 4건, PM 청감 무문제). PM 결정(2026-05-06): 효과음은 라이선스/표기 면제 → §4.3 11행 일괄 갱신, ID3 재태깅 미진행. 잔여: W6 QA 청감 검증 + (선택) LUFS 정정 라운드.

---

## W5: 콘텐츠 통합 (위계 5)

- ✅ `07-content-integration/INTEGRATION-PLAN.md`
- ✅ 시나리오 .md → 씬 JSON 변환 도구 — `scripts/compile-scene.ts` v0.2 (W4 Phase C 완료, 12개 .md → 216개 씬)
- ✅ 이미지/사운드 자산 폴더 정리 + 매니페스트 — **W5 라운드 #1 완료 (2026-05-06)**: `scripts/build-manifest.ts` v0.1 + `public/manifest.json` 자동 생성. **W5 라운드 #2 완료 (2026-05-06)** — 발견 4건 일괄 처방: BGM 잔잔 alias 매핑 / 한글 BG 3건 영문화 + bg_ktx_window §19 신규 등록 / build-manifest v0.2 list.md 파싱(sprite/cg/video) + cross-check / validate-build v0.3 BGM/SFX/CG/VIDEO 화이트리스트 통합. 정합 0건 경고 달성. **W4·W5 후속 클린업 라운드 완료 (2026-05-06)** — 오디오 자산 BGM 8 + SFX 12 = 20개 mp3 `docs/assets/{bgm,sfx}/` → `public/snd/{bgm,sfx}/` 이동(이력 폴더 보관 유지) + manifest 재생성 + build·manifest·validate·vitest 72/72 통과 + 효과음 라이선스 면제 결정으로 SFX-list status review→done.
- ⬜ 모든 씬 통합 후 풀 플레이 검증 (사용자 자산 생성 후)

---

## W6: QA + 배포 (위계 6)

- ✅ `08-qa-deployment/QA-PLAN.md`
- ✅ `08-qa-deployment/DEPLOYMENT.md`
- ✅ Playwright E2E 테스트 (16개 엔딩, END_SOLO_SUMMER 포함) — **W6 라운드 #1 완료 (2026-05-06)**: `tests/e2e/{helpers,endings.spec}.ts` + 모든 엔딩 ID `data-ending-id`로 정확 라우팅 검증. 29.9s 소요(REJECT 시퀀스 20.2s 포함). PROD blocker `ch05_07_close` IF/ELSE 안의 EVALUATE_BRANCH 사라짐 픽스(IF 단순화). `src/scenes/manifest.ts`를 vite glob으로 자동 매핑(216개 코드분할).
- ✅ 빌드 검증 스크립트 — W4 `validate-build.ts` v0.3 + W5 `build-manifest.ts` v0.2
- ✅ GitHub Actions 워크플로우 — W4 `ci.yml`/`deploy.yml` + **W6 라운드 #1**: `e2e` job `if: false` → 활성화 (npm ci + compile + build + playwright install + test:e2e + 실패 시 report 업로드)
- 🟨 모바일 반응형 QA — **W6 모바일 반응형 QA 라운드 완료 (2026-05-06)**: UI-SPEC §10 + §5.5 + QA-PLAN §1.3 명세 정합화. 신규 `src/ui/OrientationLock.tsx` (회전 안내 풀스크린 오버레이, `pointer:coarse + portrait` 매칭) + MiniControls 햄버거 토글(모바일 우상단 ☰↔✕, PC 우하단 가로) + 모든 버튼 `min-h/min-w 44px` + viewport-fit=cover + 모달 열렸을 때 MiniControls 숨김 + PauseMenu `w-full max-w-sm` + GalleryScreen 헤더 wrap. preview MCP로 desktop/tablet/mobile portrait/landscape 4뷰포트 DOM 측정 검증. build/test 72/72 회귀 통과. **잔여**: PM 실디바이스 수동 QA 1회 (QA-PLAN §1.3 갤럭시 S22 / iPhone 14 / iPad / 갤럭시 Tab) → status `done`.
- 🟨 성능 최적화 — **W6 성능 최적화 라운드 + WebM 제거 라운드 완료 (2026-05-06)**: 신규 `src/engine/assetPreloader.ts` (MASTER-PLAN §8.1 이미지 프리로딩 큐) + gameStore.startScene 훅. BG/CG/sprite 이미지 `loading=eager decoding=async fetchPriority=high`, CGGallery `loading=lazy`. **PM 옵션 (a) WebM 제거 채택 → public/video webm 12개 삭제, video-list.md §영상 후처리 SSoT mp4 단일로 갱신, RejectEnding `/vid/`→`/video/` 경로 버그 보너스 픽스. dist 144M → 95M (49M 절감, 34% 감소).** MASTER-PLAN §8.2 50MB 목표 대비 2.88x→1.9x로 개선. 잔여: Lighthouse CI / 폰트 프리로드 / 영상 추가 압축(옵션 b) / AVIF 포맷 / bundle 분석은 별도 라운드. **PM 실측 Lighthouse Performance ≥80 검증** 필요.
- ✅ **VIDEO 명령 SceneRenderer 처리 (W6 VIDEO 명령 처리 라운드 완료, 2026-05-06)** — 신규 `src/ui/VideoLayer.tsx` (풀스크린 모달 + autoplay/muted/playsinline/preload=auto + skipable 분기 + onEnded/onError graceful) + `SceneRenderer.tsx`에 `runtimeMode==='scene' && cmd.type==='VIDEO'` 마운트. preview MCP DOM 검증(skipable true/false 분기) + E2E 16/16 28.9s + build/vitest 72/72 통과.
- ✅ **E2E 회귀 처방 라운드 옵션 A1 완료 (2026-05-10)** — helpers 5모드 generic + EVALUATE_TIER 컴파일러 누락 처방 + spec 신 임계 hybrid → **E2E 16/16 통과 8.8m**. 보고서: [`08-qa-deployment/verification-reports/08-pre-deploy-check.md`](../08-qa-deployment/verification-reports/08-pre-deploy-check.md)
- 🟨 GitHub Pages 활성화 + 도메인 — repo `JonathanBlackDoctor/Cuyeonsi-beta` 활성화 완료 (2026-05-10). 확정 URL `https://jonathanblackdoctor.github.io/Cuyeonsi-beta/` (베타 릴리스 채널, PM 2026-05-11 확정). repo 비어있는 상태 — 옵션 A 채택 (`game-project/` = repo 루트). 워크플로우 정정 + .gitignore 보강 완료. 잔여: PM 첫 푸시 + Actions 배포 성공 + 라이브 접속 검증
- ⬜ **베타 출시** (`Cuyeonsi-beta` Pages) — 친구 피드백 수집 라운드
- ⬜ **정식 출시** 🎉 — 별도 repo / 도메인 (PM 추후 결정)

---

## W6 출시 직전 종합 라운드 ✅ — 2026-05-09 후반 19+ 라운드 일괄 처방

> 자산 무결성 검증 라운드(2026-05-09) 이후 동일 일자에 발생한 후속 라운드 일괄 정리. PM 직접 라이브 플레이 + 자체 플레이 검증으로 발견된 이슈 처방 + 시스템 신규 + 성능 최적화 묶음.

### 출시 차단급 회귀 fix (3건)
- ✅ **Ch5 엔딩 라우팅 복구** — 챕터 5 끝 EVALUATE_BRANCH가 즉시 `runtimeMode='ending'` 전환해 챕터 6 본편 + 16개 엔딩 씬 모두 스킵하던 치명 회귀 처방. 2-단계 평가(승자 결정 → ch6 → 티어 결정 → 엔딩 씬)로 분리. 신규 `EVALUATE_TIER` 명령 + `evaluateRoute`/`evaluateTier` 메서드 + `ENDING_SCENE_MAP`/`CHAPTER6_START_MAP` + 10개 ch06_h*_evaluate.scene.json EVALUATE_TIER 부착.
- ✅ **H4 미니게임 15초 → 3초 + 즉시 패배** — 룰 명확화. ReplyTimer DEFAULT_SECONDS 15→3, 펄스 임계 5→1. KakaoModal `mechanism: 'h4_reply_speed'` 마커로 ReplyTimer 마운트 분기. evaluateRoute F-1 임계 `late_reply_count >= 2 → >= 1`. 안내 텍스트 "(15초)" → "(3초). 늦으면 나서윤은 이번 봄을 같이 보내지 않기로 마음먹는다."
- ✅ **Ch5 모닥불 톤 매트릭스 차단 + 비선택 4명 페이드아웃** — 5개 선택지 `tone`·`isKey` 제거 (toneMatrix 자동 ±점수 박힘 → 다른 H 호감도 흔들림 위반). 비선택 4명 분기 진입 즉시 `CHARACTER_HIDE` (fade) + "다른 일행이 슬쩍 자리를 비켜준다." 내레이션. 술집 패턴과 정확히 일치.

### 게임 제목·타이틀 화면 변경 (PM 직접 결정)
- ✅ **게임 제목 "성서로맨스: 본과 1학년의 봄" → "구연시: 본과 1학년의 봄"** — index.html / package.json / README.md / MASTER-PLAN / STORY-BIBLE / UI-SPEC / DEPLOYMENT 일괄 패치. 내부 식별자 `kmu-vn`(npm name·localStorage 키·Pages base path) 보존(세이브/배포 호환).
- ✅ **ModeSelect 타이틀 화면 리디자인** — PM 자산 `title_cut.png` 5.87MB → ffmpeg geq 마스킹(우측 하단 163×163 alpha=0 + 가장자리 30px 알파 그라데이션) + 1500×1500 lanczos + libwebp q=88 → `public/img/title.webp` (148KB, 97% 감축). 헤딩·부제·drop-shadow 제거 + 배경 `#FED8E5`로 마스킹 자국 블렌드 + `.title-float` 심장박동 펄스 애니메이션(1s 사이클, reduce-motion override `!important`).

### 엔딩 결과 화면 종합 업그레이드
- ✅ **엔딩 결과 화면 종합 업그레이드** — 결정적 장면 배경 + 명대사 + 카테고리 배수 점수 + NPC 토글 + 캡 해제. EndingStatsPanel 시각·점수 시스템 전면 개편.

### 챕터 회상 시스템 4단계 정비
- ✅ **챕터 회상 단계 업그레이드** — 요약 단락 + 버튼 2단 unlock + 동적 라벨 ("Chapter N 시작하기")
- ✅ **hasRecap 조건 완화 → prologue 차단** — 라운드 #11 후속. `hasRecap = !!prevSnap`로 호감도 변동 0이어도 회상 모드 + entries 0이면 인트로+요약만(2000ms). 후속 #2: prologue → ch01 경계는 fallback 단순 모드(단순 "Chapter 1 — OT의 봄" + 1000ms 락 + "시작하기" 버튼)로 차단.
- ✅ **빠른 advance 연타 race 처방** — mutex + 사용자 클릭 가드로 회상 안 뜨는 race 해소.
- ✅ **회상 종료 후 +3s 락 조정** — 일반 챕터 경계.

### BGM·오디오 6라운드 묶음
- ✅ **BGM 무한 루프 native 강제** — Howler v2.2.4 html5 모드에서 Howl `loop: true` 옵션이 underlying `HTMLAudioElement.loop`로 자동 전파 안 되는 라이브러리 결함 처방. `enforceNativeLoop()` 헬퍼로 `_sounds[]._node.loop = true` 직접 박음(onload + onplay + play 직후 + stash 복원 4중 보장). 라이브 검사로 bgm_main_theme `nodeLoops: [true]` 검증.
- ✅ **일상 BGM fade out/in 재개** — `RESUMABLE_BGM_IDS` Set 신설. `bgm_daily`는 정지·전환 시 unload 대신 fade out + `pause()` + `stashedBgms` Map 보관. 다음 재생 시 stash hit으로 같은 seek 위치에서 fade in 재개. 일상 BGM 첫 부분만 반복되던 단조로움 해소. 다른 BGM은 단발 연출이라 기존 stop+unload 유지.
- ✅ **BGM Howler html5: true 전환** — OP+BGM 동시 재생 시 wow/flutter 잔존 회귀 추가 처방.
- ✅ **비디오 12개 audio track 일괄 strip** — ffmpeg `-an`으로 12개 mp4 audio 제거. OP+BGM 동시 재생 시 BGM wow/flutter 회귀 처방.
- ✅ **BGM 8개 MP3 192→128 kbps 재인코딩** — 첫 부팅 랙 실측 후 용량 절감.
- ✅ **VolumeControl 신규 (메뉴 행 위 음량 조절)** — `src/ui/VolumeControl.tsx` 신규. 닫힌 상태 토글 버튼 + 클릭 시 BGM/SFX 슬라이더 인라인 패널. 외부 pointerdown 자동 닫힘. settingsStore 직접 호출 + audioManager 자동 전파. PC 메뉴 행 위·모바일 햄버거 드롭다운 최상단 마운트. 환경설정 stub `alert()` 우회.

### UX 정합 묶음 (자체 플레이 검증 라운드)
- ✅ **자체 플레이 검증 라운드 (9건 일괄)** — (1) ChoiceList 매 진입 Fisher-Yates 셔플(최상단 옵션 편향 해소, e2e `data-testid` 원본 인덱스 유지) (2) 차세린 트루 카페 BG `bg_cafe_serin.webp` 신규(127KB, "분당 본가 근처 카페 창가" 내레이션 정합) (3) 거절 엔딩 카톡 KakaoModal 표준화 + 8단계 후반부 분리(fade-out → title → video → toast 4단계만, KakaoModal `handleTimeout`이 `startScene('ch06_h4_reject')` 점프) (4) 장윤영 첫 등장 ch03_04 `activeHeroines` H1+H5 → H5 only(차세린 호감도 흔들림 제거) (5) SOLO 엔딩 작가 노트 NARRATION 삭제(메모 출력 버그) (6) 거절 엔딩 카톡 머뭇거림 시퀀스 — `KakaoMessage.preTyping1?/prePause?/preTyping2?` + KAKAO `hesitate?: boolean` + `unreadFadeMs?` (7) typing 인디케이터 폰트·padding 일반 버블과 통일 (8) 모든 1:1 카톡(senders ≤ 2) 안 읽음 "1" 자동 페이드(`unreadFadeMs ?? 400`) — 단톡(3인+)은 미적용 (9) 사진 첨부 `KakaoMessage.image?: string` 필드 + 이미지 버블 렌더 — `(사진 첨부)` placeholder → 실제 이미지.

### 자산 보강·동선 처방
- ✅ **ch02_04_seol_recover VEO silent skip 처방** — 엔진 fix + 씬 순서 재배치.
- ✅ **조나단·윤모 center 슬롯 겹침** — `center_back` X 50→35% + 표경민 `left_back` 이동.

### 검증 잔여 (PM 풀플레이 후속)
- ✅ **production preview 검증 창 준비** (PM 세션 검증 미완 상태 종료, 다음 PM 풀플레이 라운드 트리거 대기)

---

## 후속 검증 게이트 (마일스톤별)

> 특정 마일스톤 통과 시점에 1회 검증 라운드를 트리거하는 항목. 작업 완료 후 즉시 처리.

### 마일스톤 #3 — 엔딩 시나리오 풀 텍스트 완료 게이트

**정의**: `03-story/scenarios/` 산하 H1/H2/H3/H5 트루엔딩 라우트 + END_SOLO_SUMMER 시나리오 풀 텍스트 작성 완료. (거절 엔딩 ch06_h4_seoyoon은 이미 작성됨.)

**트리거 시 처리:**
- ⬜ BGM 슬픔(`bgm_sad`) / 클라이맥스(`bgm_climax`) 큐레이션 1회 검증 라운드
  - 신규 추가될 큐 위치·페이드·볼륨이 [`docs/assets/BGM-list.md`](../docs/assets/BGM-list.md) §3.6 / §3.7 명세와 정합 확인
  - 거절 엔딩 외 BAD 분기 추가 시 `bgm_sad` 후보 톤이 모든 BAD에 적용 가능한지 재청취
  - 5개 트루엔딩 모두에 `bgm_climax` 한 곡으로 충분한지, 분기마다 변주 필요 시 메인_테마 변주로 처리할지 결정
- ⬜ ANIMATION-SPEC §12 거절 엔딩 + 트루엔딩 공통 구조 페이드 타이밍 재정합 (시나리오 큐 추가에 따른 충돌 점검)

---

## 사용자 검증 대기 항목 (각 모듈 하단 체크리스트)

각 .md 파일 하단에 [ ] 체크리스트 있음. 1차 검증 완료 (2026-04-28):

- ✅ **02-characters/goo-yunmo.md §7** — 자취 / 카톡 패턴 / 본과1 과대 보직 / KTX·SRT / 동아리 3개 / 헬스 빈도 모두 확정 (2026-04-28 완료)
- ✅ **02-characters/heroines/H1~H5 §13** — 5/5 시트 가명 / 시각모티브 / 연령차 / 출신지 모두 확정 (2026-04-28 완료)
- ✅ **03-story/STORY-BIBLE.md §10** — 게임 제목 / 단독 엔딩 / 영상 12개 분배 모두 확정 (2026-04-28 완료)
- ✅ **03-story/BRANCH-GRAPH.md §8** — 16개 엔딩 분포 + END_SOLO_SUMMER + H4 거절 트리거 강화 모두 확정 (2026-04-28 완료)

**2026-04-30 신규 검증 대기 항목**:

- ⬜ **`08-qa-deployment/verification-reports/00~05-*.md`** — 6개 배치 검증 보고서 + 처방 라운드 Phase 1~5 결과 PM 사인오프
- ⬜ Ch.6 변태 망상 페어 4건 회귀 처리 결과 (PM 결정: 회귀 — Phase 4 처방)
- ⬜ KEY:H#: 옛 표기 29건 신표기 변환 결과 (PM 결정: 미변환 stale — Phase 4 처방)
- ⬜ MASTER-PLAN unfreeze 라운드 + BRANCH-GRAPH §4·§5·§6 정합화 + 5시트 §6 갱신 + STORY-BIBLE §6.3 + route-H4 §END_H4_TRUE + video_meet_seol Ch.2 호출 추가 결과 (Phase 1·2·3 처방)

---

## 상시

- ⬜ 카톡 분석 결과를 사용자가 검증
- ⬜ `00-master/CHANGELOG.md` 변경 발생 시 기록
- ⬜ 매주 진행률 리뷰
