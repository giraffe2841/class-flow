import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Paddle 웹훅 서명 검증 (HMAC-SHA256)
// Header: "ts=1234567890;h1=abc..."
async function verifyPaddleSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  try {
    const parts = Object.fromEntries(signature.split(';').map(p => p.split('=')))
    const ts = parts['ts']
    const h1 = parts['h1']
    if (!ts || !h1) return false

    const signingPayload = `${ts}:${rawBody}`
    const expected = createHmac('sha256', secret).update(signingPayload).digest('hex')

    return timingSafeEqual(Buffer.from(expected), Buffer.from(h1))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  const signature = req.headers.get('paddle-signature')

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawBody = await req.text()

  const isValid = await verifyPaddleSignature(rawBody, signature, secret)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = getSupabase()
  const eventType = body.event_type as string
  const data = body.data as Record<string, unknown>

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const customData = (data.custom_data as Record<string, string>) ?? {}
        const userId = customData.user_id || customData.userId
        if (!userId) break

        const priceId = ((data.items as Array<Record<string, unknown>>)?.[0]?.price as Record<string, string>)?.id
        const plan =
          priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM ? 'premium'
          : priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO ? 'pro'
          : 'free'

        const currentPeriodEnd = (data.current_billing_period as Record<string, string>)?.ends_at ?? null

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan,
          status: data.status as string,
          current_period_end: currentPeriodEnd,
          paddle_customer_id: data.customer_id as string,
          paddle_subscription_id: data.id as string,
        }, { onConflict: 'user_id' })
        break
      }

      case 'subscription.canceled': {
        const customData = (data.custom_data as Record<string, string>) ?? {}
        const userId = customData.user_id || customData.userId
        if (!userId) break

        await supabase.from('subscriptions').update({
          plan: 'free',
          status: 'canceled',
        }).eq('user_id', userId)
        break
      }

      case 'transaction.completed': {
        const customData = (data.custom_data as Record<string, string>) ?? {}
        const userId = customData.user_id || customData.userId
        if (!userId) break

        const amount = (data.details as Record<string, Record<string, number>>)?.totals?.grand_total
          ?? (data.details as Record<string, Record<string, number>>)?.totals?.total
          ?? 0

        const priceId = ((data.items as Array<Record<string, unknown>>)?.[0]?.price as Record<string, string>)?.id
        const plan =
          priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM ? 'premium'
          : priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO ? 'pro'
          : 'free'

        await supabase.from('payments').insert({
          user_id: userId,
          plan,
          amount: Number(amount),
          status: 'completed',
          paddle_transaction_id: data.id as string,
        })
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
