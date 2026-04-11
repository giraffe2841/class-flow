'use client'

import { useEffect, useState } from 'react'
import { AnimatedAIChat } from '@/components/AnimatedAIChat'
import { createClient } from '@/lib/supabase/client'
import { getRemainingTokens, getTokenUsagePercent } from '@/lib/plan'
import type { Plan } from '@/lib/constants'
import { AI_TOKEN_LIMITS } from '@/lib/constants'
import { Zap, Crown, BookOpen, FileUp, MessageSquare } from 'lucide-react'
import Link from 'next/link'

function planLabel(plan: Plan) {
  if (plan === 'premium') return '프리미엄'
  if (plan === 'pro') return '프로'
  return '무료'
}

function planBadgeClass(plan: Plan) {
  if (plan === 'premium') return 'bg-amber-100 text-amber-700 border border-amber-200'
  if (plan === 'pro') return 'bg-[#d3e4ff] text-[#004881] border border-[#a2c9ff]'
  return 'bg-[#e1e2e8] text-[#42474c] border border-[#c1c7d2]'
}

export default function AIPage() {
  const [plan, setPlan] = useState<Plan>('free')
  const [tokensUsed, setTokensUsed] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, ai_tokens_used')
        .eq('user_id', user.id)
        .single()
      if (sub) {
        setPlan(sub.plan as Plan)
        setTokensUsed(sub.ai_tokens_used ?? 0)
      }
    }
    load()
  }, [])

  const remaining = getRemainingTokens(plan, tokensUsed)
  const percent = getTokenUsagePercent(plan, tokensUsed)
  const limit = AI_TOKEN_LIMITS[plan]

  return (
    <div className="flex flex-col h-screen bg-[#f8f9ff] overflow-hidden">
      {/* 상단 헤더 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[#e1e2e8] bg-white">
        <div className="flex items-center justify-between">
          {/* 좌측: 타이틀 */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#005394] flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#191c20]">AI 어시스턴트</h1>
              <p className="text-[11px] text-[#727782]">수업계획 · 진도관리 · 학습자료 분석</p>
            </div>
          </div>

          {/* 우측: 플랜 정보 + 토큰 */}
          <div className="flex items-center gap-4">
            {/* 토큰 현황 */}
            {plan !== 'free' && (
              <div className="hidden md:flex items-center gap-3 bg-[#f2f3fa] rounded-xl px-4 py-2 border border-[#e1e2e8]">
                <Zap className="w-3.5 h-3.5 text-[#005394] flex-shrink-0" />
                {limit === Infinity ? (
                  <span className="text-xs text-[#727782]">무제한</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#e1e2e8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-[#005394]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#727782] tabular-nums whitespace-nowrap">
                      {remaining.toLocaleString()} 남음
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 플랜 뱃지 */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${planBadgeClass(plan)}`}>
              {plan !== 'free' && <Crown className="w-3 h-3" />}
              <span>{planLabel(plan)}</span>
            </div>

            {plan === 'free' && (
              <Link
                href="/subscription"
                className="text-xs font-bold text-[#005394] hover:text-[#004881] border border-[#a2c9ff] px-3 py-1.5 rounded-full hover:bg-[#d3e4ff] transition-all"
              >
                업그레이드 →
              </Link>
            )}
          </div>
        </div>

        {/* 기능 안내 칩 (무료 플랜) */}
        {plan === 'free' && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {[
              { icon: <MessageSquare className="w-3 h-3" />, text: 'AI 채팅' },
              { icon: <FileUp className="w-3 h-3" />, text: '파일 분석' },
              { icon: <BookOpen className="w-3 h-3" />, text: '수업계획 생성' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f2f3fa] rounded-full border border-[#e1e2e8] text-xs text-[#727782]">
                {item.icon}
                {item.text}
              </div>
            ))}
            <span className="text-xs text-[#c1c7d2] self-center ml-1">— 프로 플랜에서 사용 가능</span>
          </div>
        )}
      </div>

      {/* AI 채팅 본문 (풀 화면) */}
      <div className="flex-1 overflow-hidden">
        <AnimatedAIChat />
      </div>
    </div>
  )
}
