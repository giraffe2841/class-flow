import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function getServiceSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function resolvePlan(priceId: string | undefined): 'pro' | 'premium' | null {
  if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM) return 'premium'
  if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO) return 'pro'
  return null
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('paddle_customer_id, paddle_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.paddle_subscription_id) {
    return NextResponse.json({ synced: 0 })
  }

  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Paddle API key not configured' }, { status: 500 })

  const isProd = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
  const baseUrl = isProd ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com'

  // 해당 구독의 트랜잭션 목록 조회
  const txRes = await fetch(
    `${baseUrl}/transactions?subscription_id=${sub.paddle_subscription_id}&status=completed&per_page=50`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )
  if (!txRes.ok) return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 502 })

  const { data: transactions } = await txRes.json()
  if (!transactions?.length) return NextResponse.json({ synced: 0 })

  const serviceSupabase = getServiceSupabase()
  let synced = 0

  for (const tx of transactions) {
    const priceId = (tx.items as Array<{ price?: { id?: string } }>)?.[0]?.price?.id
    const plan = resolvePlan(priceId)
    if (!plan) continue

    const totals = (tx.details as Record<string, Record<string, number>> | null)?.totals
    const amount = totals?.grand_total ?? totals?.total ?? 0

    const { error } = await serviceSupabase.from('payments').upsert({
      user_id: user.id,
      plan,
      amount: Number(amount),
      status: 'completed',
      paddle_transaction_id: tx.id as string,
      created_at: tx.created_at,
    }, { onConflict: 'paddle_transaction_id', ignoreDuplicates: true })

    if (!error) synced++
  }

  return NextResponse.json({ synced })
}
