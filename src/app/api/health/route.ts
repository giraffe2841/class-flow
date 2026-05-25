import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // TEST_503: OBSTACLE 헬스체크 감지 테스트용 — 테스트 완료 후 아래 블록 제거
  return NextResponse.json({ ok: false, error: 'simulated 503 for OBSTACLE test' }, { status: 503 })

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 })
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 503 }
    )
  }
}
