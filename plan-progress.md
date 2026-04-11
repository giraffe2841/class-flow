# ClassFlow — 계획 및 진행 현황

> 마지막 업데이트: 2026-04-10 (세션 7)

## 프로젝트 개요

**ClassFlow**는 선생님을 위한 AI 수업 진도 관리 SaaS입니다.
- 스택: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- 인증: Supabase Auth (이메일/비밀번호 + Google OAuth)
- DB: Supabase (PostgreSQL) — 프로젝트 ID: `prtnpfigonyocgiivzqo`
- AI: Anthropic Claude API (`claude-sonnet-4-5-20251001`)
- 결제: Paddle (구독 관리)

---

## 완료된 작업

### 결제 테스트 (2026-04-09)
- Paddle Sandbox 계정 생성 및 환경 설정 완료 (`.env.local`)
  - Pro: ₩3,900/월 (`pri_01knpwx16a7d0cke16p06mvqpe`)
  - Premium: ₩7,900/월 (`pri_01knpwh4pyde915pm12bxqw0rv`)
- 테스트 카드(`4242 4242 4242 4242`)로 체크아웃 성공 확인

### 구독 플랜 UI 및 동기화 (2026-04-09)
- `/api/paddle/sync-subscription` 엔드포인트 구현
  - Paddle `eventCallback` (`checkout.completed`)으로 결제 완료 즉시 감지
  - 트랜잭션의 price_id 기준으로 플랜 결정 (subscription보다 신뢰도 높음, 업그레이드 시 subscription이 아직 이전 플랜을 가리키는 문제 해결)
  - `subscriptions` + `payments` 테이블 동시 업데이트
  - `paddle_transaction_id` 기준 중복 결제 내역 방지
- 프리미엄 플랜 시 프로 카드 업그레이드 버튼 숨김 처리
- 결제 내역 (`payments` 테이블) 실시간 반영

### 결제 내역 & 포털 버그 수정 (2026-04-09 세션 2)
- `payments.paddle_transaction_id`에 UNIQUE 제약 추가 — 없어서 upsert가 동작하지 않아 결제 내역이 DB에 저장되지 않던 문제 수정
- `paddle.ts` 포털 URL sandbox 환경 지원 — 항상 production URL(`api.paddle.com`) 사용해 sandbox에서 포털 열기 실패하던 문제 수정
- `/api/paddle/sync-history` 신규 엔드포인트 — 구독 페이지 첫 로드 시 Paddle에서 기존 트랜잭션을 불러와 누락된 결제 내역 자동 복구

### 수업계획 입력 UI 개선 (2026-04-09)
- `plan/page.tsx` 전면 재설계 — 참고 디자인(Material Design 스타일) 반영
- 차시 입력 방식 변경: 개별 input 클릭 → textarea 줄바꿈 입력/붙여넣기 (핵심 UX 개선)
- 단원 추가: 이름 입력 후 Enter 즉시 추가
- 2컬럼 레이아웃 도입 — 좌측 입력 / 우측 요약 패널
- Step 2 실시간 구성 요약 (단원 수 · 총 차시 수 표시)
- Step 3 최종 확인 패널 — 저장 전 전체 내용 한눈에 확인
- 스텝 헤더를 별도 상단 바로 분리

### 반 삭제 기능 추가 (2026-04-09)
- 대시보드 "전체 진도 현황" 각 반 행에 삭제 버튼 추가 (hover 시 표시)
- 인라인 확인 UI — 별도 모달 없이 행 자리에서 바로 확인/취소
- Supabase `classes` 테이블 삭제 후 목록 즉시 반영

### 학교급/학년/AI 과목 추천 기능 (2026-04-10)
- `src/app/api/ai/suggest-subjects/route.ts` 신규 구현
  - POST `/api/ai/suggest-subjects` — schoolType + grade 기반 Claude API 호출
  - 화이트리스트 검증 (VALID_SCHOOL_TYPES, VALID_GRADES), 응답 스키마 검증 적용
  - 박서연 보안 리뷰 Approved
- `src/components/SchoolGradeSelector.tsx` 신규 구현
  - 학교급(중/고) → 학년(1~3) → AI 추천 과목 3단계 UI
  - 필수 과목 자동 선택, 다중 선택/해제, 로딩 스피너, 에러 표시
  - 최지우 CSS 클래스 적용 (school-card, grade-btn, subject-card 등)
- `src/app/globals.css` — `/* School Grade Selector */` 스타일 섹션 추가 (테마 토큰 기반)
- `src/app/(main)/plan/page.tsx` — Step 0(학교·학년) 추가, 총 4단계로 확장
- dev-team (김민준·박서연·최지우·정하은) 에이전트팀으로 병렬 구현

### 커스텀 슬래시 커맨드 정비 (2026-04-09)
- `/bring` 커맨드 생성 (`/bring.md`) — 세션 시작 시 `plan-progress.md` 불러와 현황 요약 및 다음 작업 제안
- `/reduce` 커맨드 기존 존재 확인 — 완료 작업 기록 및 남은 작업 정리용

### 학사 일정 캘린더 (2026-04-10)
- `src/app/(main)/calendar/page.tsx` 구현
  - 월/주/일 뷰 전환 (탭 UI)
  - `schedules` 테이블 일정(시험·행사·행정) + `lessons.planned_date` 수업 진도 통합 표시
  - 날짜 클릭 시 우측 패널에 당일 일정 상세 표시
  - 일정 추가 모달 (날짜·유형·제목·교과 선택) → `schedules` insert
  - 일정 삭제 (schedule 타입만, 수업 진도는 읽기 전용)
  - AI 인사이트 카드 + 범례 패널

### 학습 자료 관리 (2026-04-10)
- `src/app/(main)/materials/page.tsx` 구현
  - 파일 업로드 (드래그&드롭 + 클릭) — Supabase Storage
  - AI 자동 분석: `POST /api/ai/analyze-material` — 파일 텍스트 추출 → Claude로 단원 태그·요약 생성 (Pro 이상)
  - 단원별 필터, 자료 목록/상세 UI
  - 플랜 제한: free 플랜 업로드 시 UpgradeModal 표시
- `src/app/api/ai/analyze-material/route.ts` 신규 구현
  - Pro 이상 플랜 체크
  - 파일 텍스트 + 단원 목록 기반 Claude API 호출 → 태그·요약 반환

### AI 채팅 (2026-04-10)
- `src/components/AIChatModal.tsx` — SSE 스트리밍 채팅 UI (메시지 목록, 입력창, 로딩)
- `src/components/AIChatButton.tsx` — 플로팅 버튼으로 AIChatModal 토글
- `src/app/api/ai/chat/route.ts` — Claude API 스트리밍 엔드포인트
- `src/app/api/ai/replan/route.ts` — 진도 재계획 AI 엔드포인트

---

## 남은 작업

- [ ] **반별 리포트** 생성/출력 (Pro 이상) — 진도 달성률, 단원별 현황, PDF/인쇄 지원  
- [ ] **알림 시스템** — 진도 지연 알림 (Pro 이상)
- [ ] **시험 범위 자동 조정** (Pro 이상)
- [ ] **모바일 반응형** 최적화
- [ ] **에러 페이지** (`not-found.tsx`, `error.tsx`)
- [ ] **로딩 상태** (`loading.tsx`)

---

## 기술 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| AI 모델 | `claude-sonnet-4-5-20251001` | 분석/채팅/재계획 모두 동일 모델 |
| 인증 | Supabase Auth | Google OAuth 포함 간편 설정 |
| 결제 | Paddle | 한국 원화 지원, 구독 관리 내장 |
| 스타일 | Tailwind v4 + `@theme` 컬러 토큰 | 시맨틱 컬러 클래스 전역 사용 |
| AI 채팅 | SSE 스트리밍 | 실시간 응답감 |
| 플랜 제한 | 서버사이드 체크 | API 라우트에서 Supabase 구독 조회 |
| 결제 동기화 | Paddle `eventCallback` | 웹훅 대신 클라이언트 이벤트로 즉시 동기화 (localhost 호환) |
| 비밀번호 재설정 | `/auth/callback?next=/reset-password` | 기존 PKCE 콜백 재사용 |
| 웹훅 서명 검증 | HMAC-SHA256 (`ts:body`) | Paddle Billing 표준 방식 |
