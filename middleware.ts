import { NextRequest, NextResponse } from 'next/server'

// OBSTACLE 테스트용: 전체 서비스 다운 시뮬레이션
export async function middleware(req: NextRequest) {
  void req
  return NextResponse.json(
    { ok: false, error: 'Service temporarily unavailable' },
    { status: 503 }
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
