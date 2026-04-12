'use client'

import { useEffect, useRef } from 'react'
import DashboardMockup from '@/components/DashboardMockup'

export default function LandingPage() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!stageRef.current) return
      const x = (window.innerWidth / 2 - e.pageX) / 50
      const y = (window.innerHeight / 2 - e.pageY) / 50
      stageRef.current.style.transform = `rotateX(${15 + y}deg) rotateY(${-10 + x}deg)`
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <style>{`
        body { background-color: white; letter-spacing: -0.02em; }
        .perspective-stage { perspective: 2000px; }
        .m-3d-card {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform: rotateX(15deg) rotateY(-10deg);
        }
        .m-3d-layer {
          position: absolute;
          backface-visibility: hidden;
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1);
        }
        .float-3d { animation: float3d 6s ease-in-out infinite; }
        @keyframes float3d {
          0%, 100% { transform: translateZ(80px) translateY(0); }
          50% { transform: translateZ(80px) translateY(-10px); }
        }
        .float-3d-delayed {
          animation: float3d-delayed 6s ease-in-out infinite;
          animation-delay: -3s;
        }
        @keyframes float3d-delayed {
          0%, 100% { transform: translateZ(120px) translateY(0); }
          50% { transform: translateZ(120px) translateY(-10px); }
        }
        .glass-ui {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <div className="text-xl font-bold tracking-tighter">ClassFlow</div>
            <div className="hidden md:flex gap-8 text-[13px] font-medium text-[#6B7280]">
              <a href="#features" className="hover:text-[#0052FF] transition-colors">기능 소개</a>
              <a href="#pricing" className="hover:text-[#0052FF] transition-colors">요금제</a>
              <a href="#" className="hover:text-[#0052FF] transition-colors">리소스</a>
              <a href="#pricing" className="hover:text-[#0052FF] transition-colors">가격</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-[13px] font-medium px-4 hover:text-[#0052FF] transition-colors">로그인</a>
            <a href="/signup" className="bg-[#0052FF] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-all">시작하기</a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-6 overflow-hidden bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8">
              Powerful planning.<br /><span className="text-[#6B7280] opacity-40">Simplified classes.</span>
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto mb-10">
              선생님의 시간을 가치 있게. AI 진도관리 클래스플로우와 함께 10분 만에 한 학기 학업 계획을 디자인하세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <input
                type="email"
                placeholder="업무용 이메일을 입력하세요"
                className="px-5 py-3 w-80 rounded-lg border border-[#E5E7EB] focus:ring-1 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none transition-all"
              />
              <a href="/signup" className="bg-[#0052FF] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all">무료로 시작하기</a>
            </div>
          </div>

          {/* 3D Mockup Stage */}
          <div className="max-w-6xl mx-auto perspective-stage relative h-[500px] md:h-[700px]">
            <div className="m-3d-card relative w-full h-full" ref={stageRef}>
              {/* Main App Window */}
              <div className="m-3d-layer w-full h-full bg-white rounded-xl border border-[#E5E7EB] p-2 overflow-hidden shadow-2xl">
                <DashboardMockup />
              </div>

              {/* Floating Card - Right */}
              <div className="m-3d-layer float-3d top-20 -right-12 w-64 glass-ui p-6 rounded-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">AI Success</p>
                    <p className="text-sm font-bold">진도율 98.4%</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-green-500" />
                </div>
              </div>

              {/* Floating Card - Left */}
              <div className="m-3d-layer float-3d-delayed bottom-20 -left-12 w-72 glass-ui p-6 rounded-xl shadow-2xl">
                <div className="flex gap-3 mb-2 text-[#0052FF]">
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <span className="text-sm font-bold">AI 최적화 완료</span>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed">"수요일 2교시 수업을 위해 15분 복습 세션이 자동으로 배정되었습니다."</p>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Bar */}
        <section className="py-20 border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[12px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-12 opacity-50">Trusted by Leading Educators</p>
            <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-10 grayscale opacity-40 font-bold italic text-2xl">
              <span>SEOUL UNIV.</span>
              <span>EDU-KOREA</span>
              <span>TEACHERS LAB</span>
              <span>GLOBAL ACADEMY</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-8 leading-tight">AI 지능형 재계획.<br />수업의 유연함을 더하다.</h2>
              <div className="space-y-8">
                <p className="text-lg text-[#6B7280] leading-relaxed">
                  갑작스러운 학교 행사나 휴업일 때문에 당황하지 마세요. 클래스플로우 AI가 누락된 수업을 즉시 재배치하여 전체 일정을 최적화합니다.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0052FF]">arrow_forward</span>
                    <span className="text-sm font-medium">시험범위 역산 로드맵 도구</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0052FF]">arrow_forward</span>
                    <span className="text-sm font-medium">단원별 난이도 가중치 시스템</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0052FF]">arrow_forward</span>
                    <span className="text-sm font-medium">구글 클래스룸 연동 자동 동기화</span>
                  </li>
                </ul>
                <button className="text-[#0052FF] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Explore Re-planning <span className="material-symbols-outlined">east</span>
                </button>
              </div>
            </div>
            <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-[#E5E7EB] shadow-sm group hover:shadow-xl transition-all">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-inner">
                <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB] mb-4">
                  <span className="font-bold">2학기 수학 II 커리큘럼</span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">AI 최적화 완료</span>
                </div>
                <div className="space-y-3 opacity-60">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] flex justify-between text-sm">
                    <span>1단원: 함수의 극한</span>
                    <span className="font-bold text-[#0052FF]">완료</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border-2 border-[#0052FF] flex justify-between text-sm shadow-lg -translate-y-1">
                    <span>2단원: 다항함수의 미분</span>
                    <span className="font-bold text-[#0052FF]">진행 중</span>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] flex justify-between text-sm">
                    <span>3단원: 다항함수의 적분</span>
                    <span className="font-bold">D-12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <p className="text-[12px] font-bold text-[#0052FF] uppercase tracking-widest mb-3">Pricing</p>
                <h2 className="text-4xl font-bold tracking-tight">선생님을 위한 합리적인 요금제</h2>
                <p className="text-[#6B7280] mt-2">개인 교사부터 학교 단위까지, 규모에 맞게 시작하세요</p>
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-[#E5E7EB]">
                <button className="px-4 py-2 text-[12px] font-bold bg-[#F9FAFB] rounded-md">월간 결제</button>
                <button className="px-4 py-2 text-[12px] font-bold text-[#6B7280]">연간 결제 <span className="text-[#0052FF]">15% 할인</span></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="bg-white p-10 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between hover:shadow-xl transition-all">
                <div>
                  <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Free</p>
                  <div className="mb-2">
                    <h3 className="text-4xl font-bold">₩0</h3>
                    <span className="text-sm text-[#6B7280]">영원히 무료</span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-8 leading-relaxed">ClassFlow를 처음 시작하는 선생님을 위한 플랜</p>
                  <ul className="space-y-3 mb-12">
                    {[
                      '반 1개',
                      '교과 1개',
                      '학습지 3개',
                      'AI 채팅 월 10,000 토큰',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#6B7280]">
                        <span className="material-symbols-outlined text-[16px] text-[#D1D5DB]">check</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="/signup" className="block w-full py-3 text-center border border-[#E5E7EB] rounded-lg font-bold text-sm hover:bg-[#F9FAFB] transition-colors">무료로 시작하기</a>
              </div>

              {/* Pro */}
              <div className="bg-white p-10 rounded-2xl border-2 border-[#0052FF] flex flex-col justify-between shadow-2xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0052FF] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Most Popular</div>
                <div>
                  <p className="text-[12px] font-bold text-[#0052FF] uppercase tracking-widest mb-4">Pro</p>
                  <div className="mb-2">
                    <h3 className="text-4xl font-bold">₩3,900</h3>
                    <span className="text-sm text-[#6B7280]">/월</span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-8 leading-relaxed">AI 기능을 풀로 활용하는 교사를 위한 핵심 플랜</p>
                  <ul className="space-y-3 mb-12">
                    {[
                      '반 5개',
                      '교과 3개',
                      'AI 재계획 월 20회',
                      '시험범위 역산',
                      '학습지 50개',
                      '진도 미달 알림',
                      'AI 채팅 월 50,000 토큰',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-[16px] text-[#0052FF]">check</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="/signup" className="block w-full py-3 text-center bg-[#0052FF] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all">무료로 시작하기</a>
              </div>

              {/* Premium */}
              <div className="bg-white p-10 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between hover:shadow-xl transition-all">
                <div>
                  <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Premium</p>
                  <div className="mb-2">
                    <h3 className="text-4xl font-bold">₩7,900</h3>
                    <span className="text-sm text-[#6B7280]">/월</span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-8 leading-relaxed">제한 없이 모든 기능을 사용하는 파워 유저 플랜</p>
                  <ul className="space-y-3 mb-12">
                    {[
                      '반 · 교과 무제한',
                      'AI 재계획 무제한',
                      '학습지 무제한',
                      'AI 채팅 월 100,000 토큰',
                      '우선 고객지원',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#6B7280]">
                        <span className="material-symbols-outlined text-[16px] text-green-500">check</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="/signup" className="block w-full py-3 text-center border border-black text-black rounded-lg font-bold text-sm hover:bg-black hover:text-white transition-all">시작하기</a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-10">
            Design your class with<br />complete confidence.
          </h2>
          <a href="/signup" className="inline-block bg-[#0052FF] text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-[#0052FF]/20">무료로 시작하기</a>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-bold mb-6">ClassFlow</div>
            <p className="text-[#6B7280] text-xs leading-relaxed">선생님의 시간을 가치 있게.<br />AI 진도관리 플랫폼</p>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest">서비스</h5>
            <div className="flex flex-col gap-4 text-[#6B7280] text-xs">
              <a href="#features" className="hover:text-white transition-colors">기능 소개</a>
              <a href="#pricing" className="hover:text-white transition-colors">요금제</a>
              <a href="/dashboard" className="hover:text-white transition-colors">대시보드</a>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest">계정</h5>
            <div className="flex flex-col gap-4 text-[#6B7280] text-xs">
              <a href="/login" className="hover:text-white transition-colors">로그인</a>
              <a href="/signup" className="hover:text-white transition-colors">회원가입</a>
              <a href="/dashboard/subscription" className="hover:text-white transition-colors">구독 관리</a>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest">회사</h5>
            <div className="flex flex-col gap-4 text-[#6B7280] text-xs">
              <a href="#" className="hover:text-white transition-colors">서비스 소개</a>
              <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between gap-8 items-center text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
          <span>© 2026 ClassFlow. All rights reserved.</span>
          <div className="flex gap-10">
            <a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a>
            <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
          </div>
        </div>
      </footer>
    </>
  )
}
