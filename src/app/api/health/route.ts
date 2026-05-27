import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  void req
  return NextResponse.json({ ok: false, error: 'simulated 503 for OBSTACLE test' }, { status: 503 })
}
