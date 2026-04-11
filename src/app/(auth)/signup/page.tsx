'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SUBJECTS = ['국어', '수학', '영어', '과학', '사회', '역사', '도덕', '음악', '미술', '체육', '기술·가정', '정보']

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [school, setSchool] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, school, subject },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다'
      if (msg.includes('User already registered')) setError('이미 가입된 이메일입니다.')
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
      <main className="flex-grow flex flex-col md:flex-row min-h-screen overflow-hidden">

        {/* 왼쪽 에디토리얼 패널 */}
        <div className="hidden md:flex md:w-5/12 lg:w-4/12 p-12 flex-col justify-between relative overflow-hidden" style={{ background: '#f2f3fa' }}>
          <div className="z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>ClassFlow</span>
            </div>

            <div className="space-y-8">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                선생님의<br />
                <span style={{ color: '#005394' }}>워크스페이스</span>를<br />
                만들어보세요.
              </h1>
              <p className="text-lg leading-relaxed max-w-md" style={{ color: '#414750' }}>
                AI와 함께 진도를 설계하고, 수업을 더 스마트하게 관리하세요.
              </p>
            </div>
          </div>

         

          {/* 배경 장식 */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: '#005394', opacity: 0.05 }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: '#006d3c', opacity: 0.05 }} />
        </div>

        {/* 오른쪽 폼 영역 */}
        <div className="flex-grow flex items-center justify-center p-6 md:p-12 lg:p-24" style={{ background: '#f8f9ff' }}>
          <div className="w-full max-w-xl">
            {/* 모바일 로고 */}
            <div className="flex items-center gap-3 mb-10 md:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>ClassFlow</span>
            </div>

            {done ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(0,83,148,0.1)' }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#005394', fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>이메일을 확인해주세요</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#414750' }}>
                  <strong>{email}</strong>로 인증 링크를 보냈습니다.<br />
                  링크를 클릭하면 바로 시작할 수 있어요.
                </p>
                <Link href="/login" className="text-sm font-bold hover:underline" style={{ color: '#005394' }}>
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>워크스페이스 만들기</h2>
                  <p style={{ color: '#414750' }}>무료로 시작하세요. 카드 정보 불필요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 이름 + 이메일 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold ml-1" style={{ color: '#414750' }}>이름</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="홍길동"
                        className="w-full px-5 py-4 rounded-xl border-none focus:outline-none focus:ring-2 transition-all"
                        style={{ background: '#f2f3fa', color: '#191c20' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold ml-1" style={{ color: '#414750' }}>이메일</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="teacher@school.ac.kr"
                        className="w-full px-5 py-4 rounded-xl border-none focus:outline-none focus:ring-2 transition-all"
                        style={{ background: '#f2f3fa', color: '#191c20' }}
                      />
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold ml-1" style={{ color: '#414750' }}>비밀번호</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="8자 이상"
                      className="w-full px-5 py-4 rounded-xl border-none focus:outline-none focus:ring-2 transition-all"
                      style={{ background: '#f2f3fa', color: '#191c20' }}
                    />
                  </div>

                  {/* 학교명 + 담당 교과 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold ml-1" style={{ color: '#414750' }}>학교명</label>
                      <input
                        type="text"
                        value={school}
                        onChange={e => setSchool(e.target.value)}
                        placeholder="○○고등학교"
                        className="w-full px-5 py-4 rounded-xl border-none focus:outline-none focus:ring-2 transition-all"
                        style={{ background: '#f2f3fa', color: '#191c20' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold ml-1" style={{ color: '#414750' }}>담당 교과</label>
                      <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border-none focus:outline-none focus:ring-2 transition-all appearance-none"
                        style={{ background: '#f2f3fa', color: subject ? '#191c20' : '#727782' }}
                      >
                        <option value="">교과 선택</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#ffdad6' }}>
                      <span className="material-symbols-outlined text-sm" style={{ color: '#ba1a1a' }}>error</span>
                      <p className="text-sm" style={{ color: '#93000a' }}>{error}</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-8 rounded-full font-bold text-lg text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(90deg, #005394, #2b6cb0)', boxShadow: '0 8px 32px rgba(0,83,148,0.2)' }}
                    >
                      {loading ? '계정 생성 중...' : (
                        <>
                          계정 만들기
                          <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: '#c1c7d2' }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-xs font-bold uppercase tracking-widest" style={{ background: '#f8f9ff', color: '#727782' }}>또는</span>
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
                    Google로 계속하기
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-6" style={{ color: '#414750' }}>
                    <span className="text-sm">이미 계정이 있으신가요?</span>
                    <Link href="/login" className="text-sm font-bold hover:underline" style={{ color: '#005394' }}>로그인</Link>
                  </div>
                </form>

                <div className="mt-16 flex items-center gap-8" style={{ opacity: 0.4 }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#414750' }}>함께하는 학교</span>
                  <div className="flex gap-6 items-center" style={{ color: '#414750' }}>
                    <span className="material-symbols-outlined text-3xl">school</span>
                    <span className="material-symbols-outlined text-3xl">account_balance</span>
                    <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                  </div>
                </div>
              </>
            )}
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
