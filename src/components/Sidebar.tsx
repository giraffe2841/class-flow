'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: '대시보드' },
  { href: '/ai', icon: 'smart_toy', label: 'AI 어시스턴트', highlight: true },
  { href: '/plan', icon: 'auto_stories', label: '수업계획' },
  { href: '/progress', icon: 'checklist', label: '진도 체크' },
  { href: '/calendar', icon: 'calendar_month', label: '캘린더' },
  { href: '/materials', icon: 'description', label: '학습자료' },
  { href: '/subscription', icon: 'workspace_premium', label: '구독 관리' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-screen sticky top-0 left-0 bg-slate-50 w-64 z-50 border-r border-slate-100">
      <div className="p-6">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#005394] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">ClassFlow</h1>
              <p className="text-[10px] text-slate-400 font-medium">AI 진도관리</p>
            </div>
          </div>
        </Link>

        <Link href="/plan">
          <button className="w-full py-3 px-4 bg-[#005394] text-white rounded-xl font-bold flex items-center justify-center gap-2 mb-8 shadow-lg hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            새 수업계획
          </button>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-500/20'
                      : 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 hover:from-violet-500/20 hover:to-indigo-500/20 font-semibold'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  <span className="ml-auto text-[10px] bg-violet-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                </Link>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[#005394] font-semibold bg-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100 space-y-1">
        <Link href="#" className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl">
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="text-sm">설정</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl">
          <span className="material-symbols-outlined text-xl">help</span>
          <span className="text-sm">고객지원</span>
        </Link>
      </div>
    </aside>
  )
}
