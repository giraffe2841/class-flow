'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BotMessageSquare, Zap } from 'lucide-react'
import AIChatModal from './AIChatModal'
import { createClient } from '@/lib/supabase/client'
import { getRemainingTokens } from '@/lib/plan'
import type { Plan } from '@/lib/constants'
import { AI_TOKEN_LIMITS } from '@/lib/constants'

export default function AIChatButton() {
  const [open, setOpen] = useState(false)
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
  }, [open]) // 모달 열릴 때마다 갱신

  const remaining = getRemainingTokens(plan, tokensUsed)
  const limit = AI_TOKEN_LIMITS[plan]
  const isLow = limit !== Infinity && limit > 0 && remaining < limit * 0.1

  return (
    <>
      <AIChatModal open={open} onClose={() => setOpen(false)} />

      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-2">
        {/* 토큰 부족 경고 */}
        <AnimatePresence>
          {isLow && !open && (
            <motion.div
              className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
            >
              토큰 {remaining.toLocaleString()}개 남음
            </motion.div>
          )}
        </AnimatePresence>

       
      </div>
    </>
  )
}
