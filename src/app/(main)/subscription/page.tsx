'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import TopNav from '@/components/TopNav'
import { PLAN_PRICE, PADDLE_PRICE_ID } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'

type PlanType = 'free' | 'pro' | 'premium'

interface PaymentRecord {
  date: string
  plan: string
  amount: number
  status: string
}

interface Subscription {
  plan: PlanType
  current_period_end: string | null
  paddle_customer_id: string | null
  paddle_subscription_id: string | null
}

const FEATURES = {
  free: ['반 1개', '교과 1개', '학습지 3개', 'AI 채팅 월 10,000 토큰'],
  pro: ['반 5개', '교과 3개', 'AI 재계획 월 20회', '시험범위 역산', '학습지 50개', '진도 미달 알림', 'AI 채팅 월 50,000 토큰 (5배)'],
  premium: ['반·교과 무제한', 'AI 재계획 무제한', '학습지 무제한', 'AI 채팅 월 100,000 토큰 (10배)', '우선 고객지원'],
}

function planLabel(plan: PlanType) {
  if (plan === 'free') return '무료'
  if (plan === 'pro') return '프로'
  return '프리미엄'
}

function SubscriptionContent() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [paddle, setPaddle] = useState<Paddle | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async (syncHistory = false) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, current_period_end, paddle_customer_id, paddle_subscription_id')
      .eq('user_id', user.id)
      .single()

    setSubscription(sub as Subscription | null)

    // 유료 구독이 있는데 결제 내역 동기화 요청인 경우 Paddle에서 히스토리 불러오기
    if (syncHistory && sub?.paddle_subscription_id) {
      await fetch('/api/paddle/sync-history', { method: 'POST' })
    }

    const { data: pays } = await supabase
      .from('payments')
      .select('created_at, plan, amount, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (pays) {
      setPayments((pays as { created_at: string; plan: string; amount: number; status: string }[]).map((p) => ({
        date: p.created_at.slice(0, 10),
        plan: planLabel(p.plan as PlanType),
        amount: p.amount,
        status: p.status === 'completed' ? '완료' : p.status,
      })))
    }

    setLoading(false)
  }, [supabase])

  // Paddle 초기화 — eventCallback으로 checkout.completed 감지
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    if (!token) return
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox',
      token,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          const transactionId = (event.data as Record<string, string> | undefined)?.transaction_id
          if (!transactionId) return
          setSyncing(true)
          fetch('/api/paddle/sync-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId }),
          })
            .then(() => fetchData(false))
            .finally(() => setSyncing(false))
        }
      },
    }).then(p => { if (p) setPaddle(p) })
  }, [fetchData])

  // 초기 구독 정보 로드 (첫 로드 시 히스토리 동기화 포함)
  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  const currentPlan = subscription?.plan || 'free'

  async function handleUpgrade(plan: 'pro' | 'premium') {
    setUpgradeLoading(true)
    try {
      if (!paddle) {
        alert('결제 시스템이 초기화되지 않았습니다.\nNEXT_PUBLIC_PADDLE_CLIENT_TOKEN 환경변수를 설정해주세요.')
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const priceId = PADDLE_PRICE_ID[plan]
      if (!priceId) {
        alert(`NEXT_PUBLIC_PADDLE_PRICE_ID_${plan.toUpperCase()} 환경변수를 설정해주세요.`)
        return
      }

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email! },
        customData: { userId: user.id },
        settings: {
          displayMode: 'overlay',
        },
      })
    } finally {
      setUpgradeLoading(false)
    }
  }

  async function handlePortal() {
    if (!subscription?.paddle_customer_id) return
    try {
      const res = await fetch('/api/paddle/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: subscription.paddle_customer_id }),
      })
      const { url } = await res.json()
      if (url) window.open(url, '_blank')
    } catch {
      alert('포털 URL을 가져오는데 실패했습니다.')
    }
  }

  return (
    <>
      <TopNav title="구독 관리" />
      <div className="p-8 space-y-8 max-w-4xl">

        {/* 결제 처리 중 배너 */}
        {syncing && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <svg className="animate-spin h-5 w-5 text-[#005394]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm font-semibold text-[#005394]">결제를 확인하고 플랜을 업데이트하는 중입니다...</p>
          </div>
        )}

        {/* 현재 플랜 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">현재 플랜</h2>
          {loading ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-3 w-40 bg-slate-100 rounded" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#005394]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#005394] text-2xl">workspace_premium</span>
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">{planLabel(currentPlan)} 플랜</p>
                {currentPlan === 'free' && (
                  <p className="text-sm text-slate-400">업그레이드하여 더 많은 기능을 사용하세요</p>
                )}
                {currentPlan !== 'free' && subscription?.current_period_end && (
                  <p className="text-sm text-slate-400">다음 결제일: {subscription.current_period_end.slice(0, 10)}</p>
                )}
              </div>
              {currentPlan !== 'free' && (
                <button
                  onClick={handlePortal}
                  className="ml-auto text-sm text-slate-400 hover:text-red-500 transition-colors"
                >
                  구독 취소
                </button>
              )}
            </div>
          )}
        </div>

        {/* 플랜 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* 무료 */}
          <div className={`flex flex-col bg-white rounded-2xl p-6 shadow-sm border-2 ${currentPlan === 'free' ? 'border-[#005394]' : 'border-transparent'}`}>
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">무료</p>
              <p className="text-3xl font-extrabold text-slate-900">₩0<span className="text-base font-normal text-slate-400">/월</span></p>
            </div>
            <ul className="space-y-2 flex-1">
              {FEATURES.free.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-sm text-slate-300">check</span>{f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {currentPlan === 'free' ? (
                <div className="w-full py-3 text-center text-sm font-bold text-[#005394] bg-blue-50 rounded-xl">현재 플랜</div>
              ) : (
                <div className="w-full py-3" />
              )}
            </div>
          </div>

          {/* 프로 */}
          <div className={`flex flex-col bg-white rounded-2xl p-6 shadow-sm border-2 ${currentPlan === 'pro' ? 'border-[#005394]' : 'border-slate-200'} relative`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#005394] text-white text-xs font-bold px-3 py-1 rounded-full">인기</span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">프로</p>
              <p className="text-3xl font-extrabold text-slate-900">₩{PLAN_PRICE.pro.toLocaleString()}<span className="text-base font-normal text-slate-400">/월</span></p>
            </div>
            <ul className="space-y-2 flex-1">
              {FEATURES.pro.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-sm text-[#006d3c]">check</span>{f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {currentPlan === 'pro' ? (
                <div className="w-full py-3 text-center text-sm font-bold text-[#005394] bg-blue-50 rounded-xl">현재 플랜</div>
              ) : currentPlan === 'premium' ? (
                <div className="w-full py-3" />
              ) : (
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgradeLoading || loading}
                  className="w-full py-3 bg-[#005394] text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  업그레이드
                </button>
              )}
            </div>
          </div>

          {/* 프리미엄 */}
          <div className={`flex flex-col bg-gradient-to-br from-[#005394] to-[#2b6cb0] rounded-2xl p-6 shadow-lg border-2 ${currentPlan === 'premium' ? 'border-white/50' : 'border-transparent'} text-white`}>
            <div className="mb-4">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">프리미엄</p>
              <p className="text-3xl font-extrabold">₩{PLAN_PRICE.premium.toLocaleString()}<span className="text-base font-normal text-blue-200">/월</span></p>
            </div>
            <ul className="space-y-2 flex-1">
              {FEATURES.premium.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-blue-100">
                  <span className="material-symbols-outlined text-sm text-green-300">check</span>{f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {currentPlan === 'premium' ? (
                <div className="w-full py-3 text-center text-sm font-bold text-white bg-white/20 rounded-xl">현재 플랜</div>
              ) : (
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={upgradeLoading || loading}
                  className="w-full py-3 bg-white text-[#005394] rounded-xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  업그레이드
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 결제 내역 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">결제 내역</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between py-3 border-b border-slate-100 animate-pulse">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 bg-slate-100 rounded" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </div>
                  <div className="h-3.5 w-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">결제 내역이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.plan} 플랜</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₩{p.amount.toLocaleString()}</p>
                    <span className="text-xs text-[#006d3c] font-semibold">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paddle Customer Portal */}
        {currentPlan !== 'free' && subscription?.paddle_customer_id && (
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">결제 수단 변경 / 구독 취소</p>
              <p className="text-xs text-slate-400">Paddle 고객 포털에서 관리할 수 있어요</p>
            </div>
            <button
              onClick={handlePortal}
              className="text-sm font-bold text-[#005394] hover:underline flex items-center gap-1"
            >
              포털 열기 <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  )
}
