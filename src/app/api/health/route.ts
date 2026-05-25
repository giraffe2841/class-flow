import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: false, error: 'Service Unavailable' }, { status: 503 })

  const simulate = req.nextUrl.searchParams.get('simulate')

  if (simulate === 'timeout') {
    await new Promise((r) => setTimeout(r, 15000))
    return NextResponse.json({ ok: false, error: 'timeout' }, { status: 503 })
  }
  if (simulate === '500') return NextResponse.json({ ok: false, error: 'Internal Server Error (simulated)' }, { status: 500 })
  if (simulate === '502') return NextResponse.json({ ok: false, error: 'Bad Gateway (simulated)' }, { status: 502 })
  if (simulate === '503') return NextResponse.json({ ok: false, error: 'Service Unavailable (simulated)' }, { status: 503 })
  if (simulate === '504') return NextResponse.json({ ok: false, error: 'Gateway Timeout (simulated)' }, { status: 504 })
  if (simulate === 'ok') return NextResponse.json({ ok: true })

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('subscriptions').select('id').limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB connection failed'
    return NextResponse.json({ ok: false, error: message }, { status: 503 })
  }
}
