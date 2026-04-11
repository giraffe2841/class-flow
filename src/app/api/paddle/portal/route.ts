import { NextRequest, NextResponse } from 'next/server'
import { getPaddleCustomerPortalUrl } from '@/lib/paddle'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { customerId } = await req.json()
  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })

  try {
    const url = await getPaddleCustomerPortalUrl(customerId)
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'Failed to get portal URL' }, { status: 500 })
  }
}
