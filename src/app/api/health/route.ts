import { NextRequest, NextResponse } from 'next/server'

// OBSTACLE 테스트용: 서비스 점검 중 시뮬레이션
export async function GET(req: NextRequest) {
  void req
  return NextResponse.json(
    { ok: false, error: 'Service temporarily unavailable' },
    { status: 503 }
  )
}
