'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) throw error
      setSent(true)
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

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#d3e4ff' }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: '#005394' }}>mark_email_read</span>
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>이메일을 확인하세요</h1>
              <p className="text-sm mb-6" style={{ color: '#414750' }}>
                <span className="font-semibold">{email}</span>으로<br />비밀번호 재설정 링크를 발송했습니다.
              </p>
              <p className="text-xs mb-6" style={{ color: '#727782' }}>
                메일이 오지 않는다면 스팸함을 확인하거나, 잠시 후 다시 시도해주세요.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 rounded-xl text-center font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>비밀번호 찾기</h1>
                <p style={{ color: '#414750', fontSize: '0.9rem' }}>
                  가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: '#414750' }}>이메일</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-xl" style={{ color: '#727782' }}>mail</span>
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="teacher@school.ac.kr"
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
                  {loading ? '전송 중...' : '재설정 링크 보내기'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: '#414750' }}>
                <Link href="/login" className="font-bold hover:underline" style={{ color: '#005394' }}>
                  ← 로그인으로 돌아가기
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="border-t flex justify-center items-center px-8 py-6" style={{ background: '#f8f9ff', borderColor: 'rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#727782' }}>© 2026 ClassFlow. Designed for Educators.</p>
      </footer>
    </div>
  )
}
