'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다'
      if (msg.includes('Invalid login credentials')) setError('이메일 또는 비밀번호가 올바르지 않습니다')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9ff', color: '#191c20', fontFamily: "'Public Sans', sans-serif" }}>
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: '#d3e4ff', opacity: 0.3 }} />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl" style={{ background: '#88f9b0', opacity: 0.2 }} />
        </div>

        <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 10px 32px -4px rgba(25,28,32,0.10)' }}>

          {/* 왼쪽 브랜딩 패널 */}
          <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden" style={{ background: '#f2f3fa' }}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
                <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>ClassFlow</span>
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                수업 진도 관리의<br />
                <span style={{ color: '#005394' }}>새로운 기준.</span>
              </h2>
              <p className="text-lg leading-relaxed max-w-sm" style={{ color: '#414750' }}>
                AI와 함께 진도를 설계하고, 반별 현황을 한눈에 파악하세요.
              </p>
            </div>

     
           

            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,83,148,0.04), transparent)' }} />
          </div>

          {/* 오른쪽 폼 */}
          <div className="flex flex-col justify-center p-8 md:p-16">
            {/* 모바일 로고 */}
            <div className="flex items-center gap-2 mb-8 md:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>ClassFlow</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>다시 오셨군요, 선생님</h1>
              <p style={{ color: '#414750' }}>계정에 로그인하세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 이메일 */}
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

              {/* 비밀번호 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold" style={{ color: '#414750' }}>비밀번호</label>
                  <Link href="/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: '#005394' }}>비밀번호 찾기</Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-xl" style={{ color: '#727782' }}>lock</span>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              {/* 로그인 유지 */}
              <div className="flex items-center gap-3">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: '#005394' }}
                />
                <label htmlFor="remember" className="text-sm cursor-pointer select-none" style={{ color: '#414750' }}>
                  30일 동안 로그인 유지
                </label>
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
                className="w-full py-4 font-bold rounded-xl text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)', boxShadow: '0 8px 24px rgba(0,83,148,0.25)' }}
              >
                {loading ? '로그인 중...' : '워크스페이스 입장'}
              </button>
            </form>

            <div className="my-7 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#c1c7d2' }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs font-bold uppercase tracking-widest" style={{ background: '#ffffff', color: '#727782' }}>또는</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 font-semibold rounded-xl transition-all hover:opacity-90"
              style={{ background: '#e7e8ee', color: '#191c20' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>

            <p className="mt-8 text-center text-sm" style={{ color: '#414750' }}>
              계정이 없으신가요?{' '}
              <Link href="/signup" className="font-bold hover:underline" style={{ color: '#005394' }}>
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4" style={{ background: '#f8f9ff', borderColor: 'rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#727782' }}>© 2026 ClassFlow. Designed for Educators.</p>
        <div className="flex gap-6">
          {['개인정보처리방침', '이용약관', '고객지원'].map(t => (
            <a key={t} href="#" className="text-xs font-semibold uppercase tracking-wide hover:text-blue-800 transition-colors" style={{ color: '#727782' }}>{t}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
