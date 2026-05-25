import { NextResponse } from 'next/server'

// TEST_503: OBSTACLE 헬스체크 감지 테스트용 — 테스트 완료 후 이 파일 전체를 원래 버전으로 교체
export async function GET() {
  return NextResponse.json({ ok: false, error: 'simulated 503 for OBSTACLE test' }, { status: 503 })
}
