'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다'); return }
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9ff', color: '#191c20', fontFamily: "'Public Sans', sans-serif" }}>
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: '#d3e4ff', opacity: 0.3 }} />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl" style={{ background: '#88f9b0', opacity: 0.2 }} />
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl p-10" style={{ boxShadow: '0 10px 32px -4px rgba(25,28,32,0.10)' }}>
          {/* 로고 */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>ClassFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>새 비밀번호 설정</h1>
            <p style={{ color: '#414750', fontSize: '0.9rem' }}>
              새로운 비밀번호를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 새 비밀번호 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#414750' }}>새 비밀번호</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-xl" style={{ color: '#727782' }}>lock</span>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8자 이상"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border-none focus:outline-none focus:ring-2 transition-all"
                  style={{ background: '#f2f3fa', color: '#191c20' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  style={{ color: '#727782' }}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#414750' }}>비밀번호 확인</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-xl" style={{ color: '#727782' }}>lock_check</span>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-none focus:outline-none focus:ring-2 transition-all"
                  style={{ background: '#f2f3fa', color: '#191c20' }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#ffdad6' }}>
                <span className="material-symbols-outlined text-sm" style={{ color: '#ba1a1a' }}>error</span>
                <p className="text-sm" style={{ color: '#93000a' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-bold rounded-xl text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)', boxShadow: '0 8px 24px rgba(0,83,148,0.25)' }}
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t flex justify-center items-center px-8 py-6" style={{ background: '#f8f9ff', borderColor: 'rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#727782' }}>© 2026 ClassFlow. Designed for Educators.</p>
      </footer>
    </div>
  )
}
