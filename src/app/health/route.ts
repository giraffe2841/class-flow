import { NextResponse } from 'next/server'

// 장애 테스트: DB 연결 실패 시뮬레이션
export async function GET() {
  return NextResponse.json({ ok: false, error: 'DB connection failed' }, { status: 503 })
}
