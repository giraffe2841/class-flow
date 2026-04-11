import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { transactionId } = await req.json()
  if (!transactionId) {
    return NextResponse.json({ error: 'transactionId required' }, { status: 400 })
  }

  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Paddle API key not configured' }, { status: 500 })
  }

  const isProd = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
  const baseUrl = isProd ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com'

  // 트랜잭션 조회
  const txRes = await fetch(`${baseUrl}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!txRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 502 })
  }

  const tx = (await txRes.json()).data
  if (!tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  // 보안: customData의 userId가 현재 유저와 일치하는지 확인
  const customData = tx.custom_data as Record<string, string> | null
  const txUserId = customData?.user_id || customData?.userId
  if (txUserId && txUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 트랜잭션의 price_id로 플랜 결정 (subscription 조회보다 신뢰도 높음)
  // — 업그레이드 시 subscription은 아직 이전 플랜을 가리킬 수 있음
  const txPriceId = (tx.items as Array<{ price?: { id?: string } }>)?.[0]?.price?.id
  const plan = resolvePlan(txPriceId)

  if (!plan) {
    return NextResponse.json({ error: 'Could not determine plan from transaction' }, { status: 400 })
  }

  // subscription_id가 있으면 billing 날짜 가져오기 (옵션)
  let currentPeriodEnd: string | null = null
  let paddleSubscriptionId: string | null = tx.subscription_id ?? null

  if (paddleSubscriptionId) {
    const subRes = await fetch(`${baseUrl}/subscriptions/${paddleSubscriptionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (subRes.ok) {
      const sub = (await subRes.json()).data
      currentPeriodEnd = sub?.current_billing_period?.ends_at ?? null
    }
  }

  // 결제 금액 추출 (KRW 기준 minor unit = 1원)
  const totals = (tx.details as Record<string, Record<string, number>> | null)?.totals
  const amount = totals?.grand_total ?? totals?.total ?? 0

  const serviceSupabase = getServiceSupabase()

  await Promise.all([
    // 구독 정보 업데이트
    serviceSupabase.from('subscriptions').upsert({
      user_id: user.id,
      plan,
      status: 'active',
      current_period_end: currentPeriodEnd,
      paddle_customer_id: tx.customer_id as string,
      paddle_subscription_id: paddleSubscriptionId,
    }, { onConflict: 'user_id' }),

    // 결제 내역 추가 (동일 트랜잭션 중복 방지)
    serviceSupabase.from('payments').upsert({
      user_id: user.id,
      plan,
      amount: Number(amount),
      status: 'completed',
      paddle_transaction_id: tx.id as string,
    }, { onConflict: 'paddle_transaction_id', ignoreDuplicates: true }),
  ])

  return NextResponse.json({ plan })
}
