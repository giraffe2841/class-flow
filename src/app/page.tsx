import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface font-body antialiased">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 py-4">
          <div className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            클래스플로우
          </div>
          <div className="hidden md:flex items-center space-x-8 font-headline text-sm font-semibold tracking-tight">
            <a className="text-primary border-b-2 border-primary pb-1" href="#">대시보드</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-300" href="#">기능소개</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-300" href="#">요금제</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-300" href="#">커뮤니티</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="px-5 py-2 text-sm font-semibold text-primary hover:opacity-80 transition-all">
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-8 pt-16 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              
              <h1 className="text-5xl md:text-6xl font-bold font-headline text-on-surface leading-[1.2] mb-6 tracking-tight">
                AI로 정교해지는 학업 계획의 미학,{' '}
                <span className="text-primary italic">클래스플로우</span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-xl">
                선생님의 수업 흐름을 이해하는 인공지능 배정 캘린더. 학기 일정을 입력하면 AI가 최적의 진도표를 실시간으로 설계합니다. 번거로운 관리는 AI에 맡기고 학생들에게 더 집중하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all duration-200 text-center"
                >
                  지금 무료로 체험하기
                </Link>
                <button className="bg-surface-container-high text-primary px-8 py-4 rounded-2xl font-bold text-lg hover:bg-surface-container-highest transition-all">
                  데모 영상 보기
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/15" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}>
                <img
                  alt="대시보드 미리보기"
                  className="w-full object-cover aspect-[4/3]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDH9_w-i6Jm9_QiglqQJD83kOjbnzYpULV-kCIv9t2J6bN2baaHDmi105_4Ebpzy7kk00jMENcoVhaWwdeyOJw1BuLhFgjwYkQZXxal9H_xgoMCccH-nmIpJsEEPoLzerLYugRlli36C3m9iRjBNvieW_Uy3ziaTCMsZ1veLi6L7-P3qD9UaTl8r2pMCowriWmPksCtnAGNzk9wiPiQ-NdOjXe3iCeGIfkg5m0hWtmewFzYM0zmiGFfF1Q2Oa2lzR4d0oCQGdcBBuQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-4">교육자를 위한 지능형 인프라</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">복잡한 교육과정 관리를 AI가 자동화하고 고도화합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 스마트 대시보드 */}
              <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined">dashboard</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-4">스마트 대시보드</h3>
                  <p className="text-on-surface-variant leading-relaxed max-w-md">
                    한 학기 전체의 흐름을 한눈에 파악하세요. 실시간 진도 대시보드가 각 학급별 진도 차이를 분석하고 보완이 필요한 부분을 즉시 알려드립니다.
                  </p>
                </div>
                <div className="mt-8 rounded-xl overflow-hidden bg-surface-container h-48 relative">
                  <img
                    alt="스마트 대시보드 데이터"
                    className="w-full h-full object-cover mix-blend-multiply opacity-50"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFmQC6Y6Yicchv1A-WOGaqn8WQwTj-oidYLpZpR9PTlax1i_vJXs_8sT3YAIrhj6Rww_TMmABGXhZCz6TnwXDBa04xE7ZjJBvllkKtN7AcKem989ZDBTp24zq6KiY7-DsPwJiLUS4VoMlOlBZqMq9_gG2oQGMSLqJ3KXxFEgijkIqZ45odxYI-zcgxYiOFvvHiZCyRL_ubYcnt1qgP8erW88iUHNYKQo35FIX7-fD8Ezrn0NgBEZBFWuizhBLUgZ1clNOYABVJj_A"
                  />
                </div>
              </div>

              {/* AI 재계획 */}
              <div className="bg-gradient-to-br from-secondary to-secondary-container/80 p-8 rounded-2xl text-on-secondary flex flex-col justify-between transition-all hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-6">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>autorenew</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-4">AI 지능형 재계획</h3>
                  <p className="text-white/90 leading-relaxed">
                    갑작스러운 학교 행사나 휴업일 때문에 당황하지 마세요. AI가 누락된 수업을 즉시 재배치하여 수동 입력 없이도 전체 일정을 최적화합니다.
                  </p>
                </div>
                <div className="mt-8 flex justify-end opacity-20">
                  <span className="material-symbols-outlined text-[120px] text-white">calendar_month</span>
                </div>
              </div>

              {/* 시험범위 역산 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined">event_repeat</span>
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4">시험범위 역산 로드맵</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  시험 날짜만 입력하세요. 클래스플로우가 교육과정을 역산하여 자동으로 복습 기간과 예비일을 할당합니다.
                </p>
                <div className="mt-auto bg-surface p-4 rounded-xl border border-outline-variant/15">
                  <div className="flex items-center gap-3 text-xs font-bold text-primary tracking-widest uppercase">
                    <span className="material-symbols-outlined text-sm">flag</span> 목표 시험일
                  </div>
                  <div className="text-lg font-bold text-on-surface mt-1">2026년 6월 14일</div>
                </div>
              </div>

              {/* 교과 전문가 섹션 */}
              <div className="md:col-span-2 bg-surface-container p-8 rounded-2xl flex items-center gap-8 overflow-hidden relative">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-headline mb-4 text-on-surface">교과 전문가를 위한 맞춤 설계</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    중·고등학교 선생님들은 여러 학급의 복잡한 진도를 관리해야 합니다. 클래스플로우는 교과별 전문성을 고려하여 중등 교육 현장의 특수한 과제들을 해결하도록 최적화되었습니다.
                  </p>
                </div>
                <div className="hidden sm:block w-1/3">
                  <img
                    alt="선생님 협업"
                    className="rounded-xl object-cover aspect-square shadow-lg"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbaEuMW5Pu9HePLvKybN4VlBTy9QYh_a049KIUtIycbqoSkvvq9we48-vvFCnqOD_jvX1ikpfgtzeKEu3-B2dUfsqYfteLp5HbmtxsITtrxEBncuNS1dPMf0t5Gh6XA7uUNChFV4mvdR35gWWvJEoEulHrsJj-RBIbZ3r_DfDXWcLRIN-7xqqwgYqdjqqcFvWB3Wq5tXv8dxqhJGjs8AjIj2BJo4DABpoHJUrpOwUudVobuIIwvH1kUD3D_pMXbl1GdnjykNhv68g"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-surface-container-lowest p-12 rounded-2xl text-center shadow-sm">
              <span className="material-symbols-outlined text-primary/20 text-7xl absolute top-8 left-8">format_quote</span>
              <p className="text-xl md:text-2xl font-headline italic font-semibold text-on-surface leading-snug mb-8 relative z-10">
                &ldquo;클래스플로우는 제 생물 수업 진도 관리를 완전히 바꿔놓았습니다. 예전에는 수동으로 달력을 수정하는 데 몇 시간씩 걸렸는데, 이제는 AI 재계획 기능으로 몇 초면 충분합니다. 선생님들에게 꼭 필요한 안식처 같은 도구입니다.&rdquo;
              </p>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary-fixed mb-4 overflow-hidden">
                  <img
                    alt="선생님 프로필"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBLFoPeloO2dhr7OBLaD9vos-ZD7KTHTBrNb5B7BrhOvCzHaih3YxepYydMJQGtxZtbj7mLswrF3r5x5uMHe72K0QrXBtRMhADaPO6cxJwjpqy3KQ_-Q6090pM_bg1aeMoveON6xJeVQil7OXOrIa3iL5VeZXZqCMeiVPUSU_BdWI11kxFFx4rw3YVwcyjl8hc_6U290p2Mbm3QEF9B8Ym2V3H2KDX2CsutRsR2DkrpD6yEHn0i5HGxSLuSdglm2sdfsqWBfq0vPmUw"
                  />
                </div>
                <h4 className="font-bold text-on-surface">김지혜 선생님</h4>
                <p className="text-sm text-on-surface-variant">현직 고등학교 과학 교사, 교육청 선도 교사</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / CTA Section */}
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold font-headline mb-6">완벽한 수업의 흐름을 찾으셨나요?</h2>
            <p className="text-on-surface-variant mb-16 max-w-xl mx-auto">
              수천 명의 선생님들과 함께 계획 업무 시간을 단축해 보세요. 필요에 맞는 요금제를 선택하세요.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              {/* 베이직 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col">
                <div className="text-sm font-bold text-primary tracking-widest uppercase mb-4">베이직</div>
                <div className="text-3xl font-bold mb-6">₩0 <span className="text-sm text-on-surface-variant font-normal">/ 월</span></div>
                <ul className="text-left space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 1개 활성 학급 관리
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 수동 진도 조정
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 기본 교과 템플릿 제공
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-xl border border-outline-variant/30 font-bold hover:bg-surface-container transition-all text-center block"
                >
                  무료로 가입하기
                </Link>
              </div>

              {/* 프로 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col relative ring-2 ring-primary shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full">
                  가장 인기
                </div>
                <div className="text-sm font-bold text-primary tracking-widest uppercase mb-4">프로페셔널</div>
                <div className="text-3xl font-bold mb-6">₩3,900 <span className="text-sm text-on-surface-variant font-normal">/ 월</span></div>
                <ul className="text-left space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 무제한 학급 관리
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> AI 자동 재계획 시스템
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 시험범위 역산 도구
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 구글 클래스룸 연동
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-md hover:opacity-90 transition-all text-center block"
                >
                  프로 무료 체험하기
                </Link>
              </div>

              {/* 프리미엄 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col">
                <div className="text-sm font-bold text-primary tracking-widest uppercase mb-4">프리미엄</div>
                <div className="text-3xl font-bold mb-6">₩7,900 <span className="text-sm text-on-surface-variant font-normal">/ 월</span></div>
                <ul className="text-left space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 프로 기능 모두 포함
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 교과 협의회 공동 협업 허브
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span> 고급 분석 및 통계 리포트
                  </li>
                </ul>
                <Link href="/signup" className="w-full py-3 rounded-xl border border-outline-variant/30 font-bold hover:bg-surface-container transition-all" >
                  업그레이드 하세요
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-outline-variant/15 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="text-lg font-bold text-on-surface font-headline mb-4">클래스플로우</div>
              <p className="text-on-surface-variant text-sm max-w-xs mb-6">
                현대적인 교육자를 위해 설계된 지능형 학업 계획 도구입니다. 교육과정 관리는 단순하게, 교육의 영향력은 더 크게.
              </p>
            </div>
            <div className="flex flex-col gap-3 font-label text-xs uppercase tracking-widest font-semibold">
              <div className="text-on-surface mb-2">제품</div>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">기능소개</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">요금제</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">커뮤니티</a>
            </div>
            <div className="flex flex-col gap-3 font-label text-xs uppercase tracking-widest font-semibold">
              <div className="text-on-surface mb-2">고객지원</div>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">고객센터</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">접근성 안내</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">이용약관</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-outline-variant/10">
            <p className="text-on-surface-variant font-label text-xs uppercase tracking-widest font-semibold">
              © 2026 클래스플로우. 교육자를 위해 제작되었습니다.
            </p>
            <div className="flex gap-6 font-label text-xs uppercase tracking-widest font-semibold">
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">트위터</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">링크드인</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
