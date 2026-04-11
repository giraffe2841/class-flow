# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## Architecture

**Next.js 16 + React 19 App Router** 구조입니다. AGENTS.md의 경고대로, 기존 Next.js와 다른 부분이 있으므로 `node_modules/next/dist/docs/`를 참고하세요.

- `src/app/` — 라우트 및 레이아웃 (App Router)
- `src/app/layout.tsx` — 루트 레이아웃
- `src/app/page.tsx` — 홈 페이지 (`/`)
- `src/app/globals.css` — Tailwind 전역 스타일
- `public/` — 정적 파일

## Key Conventions

- **TypeScript** 필수, `@/*`는 `src/` 경로 별칭
- **Tailwind CSS v4** (PostCSS 기반, `@tailwindcss/postcss`)
- 서버/클라이언트 컴포넌트를 명시적으로 구분 (`"use client"` 지시어)
- 컴포넌트는 `src/components/`, 유틸은 `src/lib/` 에 추가 권장
