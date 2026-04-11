'use client'

import { PLAN_PRICE } from '@/lib/constants'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature: string
  requiredPlan?: 'pro' | 'premium'
}

export default function UpgradeModal({ open, onClose, feature, requiredPlan = 'pro' }: UpgradeModalProps) {
  if (!open) return null

  const price = PLAN_PRICE[requiredPlan]
  const planName = requiredPlan === 'pro' ? '프로' : '프리미엄'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 bg-[#005394] text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            <h3 className="text-lg font-bold">업그레이드 필요</h3>
          </div>
          <p className="text-sm text-blue-100">이 기능을 사용하려면 플랜 업그레이드가 필요해요</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-600 mb-1">잠긴 기능</p>
            <p className="font-bold text-slate-900">{feature}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#005394]">{planName} 플랜</span>
              <span className="text-lg font-extrabold text-[#005394]">
                월 {price.toLocaleString()}원
              </span>
            </div>
            <ul className="text-sm text-slate-600 space-y-1">
              {requiredPlan === 'pro' && (
                <>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-green-500">check</span> 반 5개, 교과 3개</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-green-500">check</span> AI 재계획 월 20회</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-green-500">check</span> 시험범위 역산, 진도 미달 알림</li>
                </>
              )}
              {requiredPlan === 'premium' && (
                <>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-green-500">check</span> 반·교과 무제한</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-green-500">check</span> AI 재계획 무제한</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-green-500">check</span> 우선 고객지원</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              나중에
            </button>
            <button
              onClick={() => { window.location.href = '/subscription' }}
              className="flex-1 py-3 bg-[#005394] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all"
            >
              업그레이드
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
