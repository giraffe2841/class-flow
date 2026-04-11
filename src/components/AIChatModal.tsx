'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedAIChat } from './AnimatedAIChat'
import { XIcon, BotMessageSquare } from 'lucide-react'

interface AIChatModalProps {
  open: boolean
  onClose: () => void
}

export default function AIChatModal({ open, onClose }: AIChatModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-28 right-8 z-50 w-[420px] h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111127 100%)' }}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <BotMessageSquare className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">ClassFlow AI</p>
              <p className="text-[10px] text-white/30">수업계획 · 진도관리 · 학습자료 분석</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-1.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* 채팅 본문 */}
          <div className="flex-1 overflow-hidden">
            <AnimatedAIChat />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
