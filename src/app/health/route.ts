import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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
