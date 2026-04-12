'use client'

export default function DashboardMockup() {
  const subjects = [
    { name: '수학 II', unit: '다항함수의 미분', progress: 72, status: '진행 중', color: '#0052FF' },
    { name: '영어', unit: 'Reading Comprehension', progress: 88, status: '완료 임박', color: '#10B981' },
    { name: '물리학 I', unit: '전자기력', progress: 45, status: '진행 중', color: '#F59E0B' },
    { name: '한국사', unit: '근현대사 단원', progress: 91, status: '완료', color: '#10B981' },
    { name: '생명과학 I', unit: '세포의 구조', progress: 30, status: '시작 전', color: '#6B7280' },
  ]

  return (
    <div className="w-full h-full bg-[#0F1117] rounded-xl overflow-hidden flex flex-col text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#161820]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] font-bold text-white/40 ml-2">ClassFlow — 2학기 대시보드</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center text-[9px] font-bold">K</div>
          <span className="text-[11px] text-white/50">김선생</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 bg-[#13151A] border-r border-white/10 flex flex-col py-4 px-3 gap-1 shrink-0">
          {[
            { icon: 'grid_view', label: '대시보드', active: true },
            { icon: 'calendar_month', label: '수업 일정' },
            { icon: 'auto_awesome', label: 'AI 재계획' },
            { icon: 'bar_chart', label: '진도 분석' },
            { icon: 'school', label: '학급 관리' },
            { icon: 'settings', label: '설정' },
          ].map(({ icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                active
                  ? 'bg-[#0052FF]/20 text-[#4D8BFF]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 bg-[#0F1117]">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '전체 진도율', value: '72.4%', sub: '목표 대비 +3.2%', icon: 'trending_up', color: '#10B981' },
              { label: '남은 수업일', value: '38일', sub: '중간고사까지 D-22', icon: 'event', color: '#0052FF' },
              { label: 'AI 재계획 횟수', value: '3회', sub: '이번 달 기준', icon: 'auto_awesome', color: '#F59E0B' },
            ].map(({ label, value, sub, icon, color }) => (
              <div key={label} className="bg-[#161820] rounded-xl p-3.5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/40 font-medium">{label}</span>
                  <span className="material-symbols-outlined text-[14px]" style={{ color }}>{icon}</span>
                </div>
                <div className="text-xl font-bold mb-0.5">{value}</div>
                <div className="text-[10px]" style={{ color }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Subject Progress Table */}
          <div className="bg-[#161820] rounded-xl border border-white/5 overflow-hidden flex-1">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-[12px] font-bold">과목별 진도 현황</span>
              <span className="text-[10px] text-white/30 bg-[#0052FF]/10 text-[#4D8BFF] px-2 py-1 rounded-full font-medium">2026년 1학기</span>
            </div>
            <div className="divide-y divide-white/5">
              {subjects.map(({ name, unit, progress, status, color }) => (
                <div key={name} className="flex items-center gap-4 px-4 py-2.5">
                  <div className="w-16 text-[11px] font-bold text-white/80 shrink-0">{name}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/40 mb-1 truncate">{unit}</div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold w-8 text-right shrink-0" style={{ color }}>{progress}%</div>
                  <div
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Alert */}
          <div className="bg-[#0052FF]/10 border border-[#0052FF]/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4D8BFF] text-[18px]">auto_awesome</span>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#4D8BFF] mb-0.5">AI 재계획 제안</p>
              <p className="text-[10px] text-white/50">다음 주 수요일 공휴일로 인해 물리학 I 수업 2차시가 재배치되었습니다.</p>
            </div>
            <button className="text-[10px] font-bold text-[#4D8BFF] border border-[#0052FF]/40 px-3 py-1.5 rounded-lg hover:bg-[#0052FF]/20 shrink-0">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
