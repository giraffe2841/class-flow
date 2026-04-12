'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

interface UserInfo {
  full_name: string
  email: string
  school: string
  subject: string
  grade: string
  initials: string
}

interface Notification {
  id: string
  type: 'warning' | 'info' | 'success'
  icon: string
  title: string
  body: string
  href: string
  time: string
}

const STORAGE_KEY = 'classflow_read_notifs'

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export default function TopNav({ title }: { title?: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [notifLoading, setNotifLoading] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // 유저 정보 로드
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const meta = user.user_metadata ?? {}
      const name: string = meta.full_name ?? ''
      setUser({
        full_name: name,
        email: user.email ?? '',
        school: meta.school ?? '',
        subject: meta.subject ?? '',
        grade: meta.grade ?? '',
        initials: name ? name.slice(0, 1) : (user.email?.[0]?.toUpperCase() ?? 'T'),
      })
    }
    loadUser()
    setReadIds(getReadIds())
  }, [])

  // 알림 생성 (진도 지연 + 다가오는 학사일정)
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true)
    const items: Notification[] = []

    // 진도 지연 반 (80% 미만)
    const { data: progress } = await supabase.rpc('get_class_progress')
    if (progress) {
      const behind = progress.filter(
        (r: { total_lessons: number; completed_lessons: number; class_name: string; subject_name: string; class_id: string }) =>
          r.total_lessons > 0 && r.completed_lessons / r.total_lessons < 0.8
      )
      for (const cls of behind) {
        const pct = Math.round((cls.completed_lessons / cls.total_lessons) * 100)
        items.push({
          id: `progress-${cls.class_id}`,
          type: 'warning',
          icon: 'warning',
          title: '진도 지연',
          body: `${cls.class_name}(${cls.subject_name}) 진도가 ${pct}%입니다.`,
          href: '/progress',
          time: '방금',
        })
      }
    }

    // 3일 이내 학사 일정
    const today = new Date()
    const in3days = new Date(today)
    in3days.setDate(today.getDate() + 3)
    const { data: schedules } = await supabase
      .from('schedules')
      .select('id, date, type, title')
      .gte('date', today.toISOString().slice(0, 10))
      .lte('date', in3days.toISOString().slice(0, 10))
      .order('date')
    if (schedules) {
      for (const sch of schedules) {
        const d = new Date(sch.date)
        const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
        const when = diff === 0 ? '오늘' : diff === 1 ? '내일' : `${diff}일 후`
        items.push({
          id: `schedule-${sch.id}`,
          type: sch.type === '시험' ? 'warning' : 'info',
          icon: sch.type === '시험' ? 'quiz' : 'event',
          title: `${sch.type} · ${when}`,
          body: sch.title,
          href: '/calendar',
          time: when,
        })
      }
    }

    setNotifications(items)
    setNotifLoading(false)
  }, [supabase])

  // 알림 패널 열릴 때 로드
  useEffect(() => {
    if (notifOpen) loadNotifications()
  }, [notifOpen, loadNotifications])

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markAllRead() {
    const next = new Set([...readIds, ...notifications.map(n => n.id)])
    setReadIds(next)
    saveReadIds(next)
  }

  function markRead(id: string) {
    const next = new Set([...readIds, id])
    setReadIds(next)
    saveReadIds(next)
  }

  async function handleLogout() {
    setProfileOpen(false)
    await supabase.auth.signOut()
    router.push('/')
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  const typeStyle = {
    warning: { bg: 'bg-amber-50', icon: 'text-amber-500', dot: 'bg-amber-400' },
    info: { bg: 'bg-[#005394]/5', icon: 'text-[#005394]', dot: 'bg-[#005394]' },
    success: { bg: 'bg-emerald-50', icon: 'text-emerald-500', dot: 'bg-emerald-400' },
  }

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm shadow-slate-200/50">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0052FF, #2b6cb0)' }}>
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <path d="M5 9C5 7.89543 5.89543 7 7 7H25C26.1046 7 27 7.89543 27 9V11H5V9Z" fill="white" opacity="0.95"/>
              <rect x="5" y="14" width="22" height="3" rx="1.5" fill="white" opacity="0.75"/>
              <rect x="5" y="20" width="15" height="3" rx="1.5" fill="white" opacity="0.55"/>
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-slate-800">ClassFlow</span>
        </Link>
        {title && <h2 className="text-lg font-bold text-slate-800 shrink-0">{title}</h2>}
        <div className="relative max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 transition-all"
            placeholder="수업계획, 학급 검색..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* 알림 버튼 */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
            className={`relative p-1.5 rounded-xl transition-colors ${notifOpen ? 'text-[#005394] bg-[#005394]/10' : 'text-slate-400 hover:text-[#005394] hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">알림</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#005394] font-semibold hover:underline"
                  >
                    모두 읽음
                  </button>
                )}
              </div>

              {/* 알림 목록 */}
              <div className="max-h-96 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <span className="material-symbols-outlined animate-spin text-slate-300 text-3xl">progress_activity</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                      notifications_off
                    </span>
                    <p className="text-sm font-semibold text-slate-400">새 알림이 없습니다</p>
                    <p className="text-xs text-slate-300 mt-1">진도 지연이나 학사 일정이 있으면 여기서 알려드려요.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => {
                      const isRead = readIds.has(notif.id)
                      const style = typeStyle[notif.type]
                      return (
                        <Link
                          key={notif.id}
                          href={notif.href}
                          onClick={() => { markRead(notif.id); setNotifOpen(false) }}
                          className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors ${isRead ? 'opacity-60' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <span className={`material-symbols-outlined text-lg ${style.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                              {notif.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-500">{notif.title}</p>
                              {!isRead && (
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                              )}
                            </div>
                            <p className="text-sm text-slate-800 font-medium mt-0.5 leading-snug">{notif.body}</p>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 mt-1">{notif.time}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 하단 */}
              <div className="border-t border-slate-100 px-4 py-2.5">
                <Link
                  href="/settings?tab=notification"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-[#005394] transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  알림 설정
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* 프로필 드롭다운 */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-full bg-[#005394] flex items-center justify-center text-white text-sm font-bold ring-2 ring-transparent group-hover:ring-[#005394]/30 transition-all">
              {user?.initials ?? 'T'}
            </div>
            <span
              className="material-symbols-outlined text-slate-400 text-base transition-transform"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50">
              <div className="px-4 py-4 bg-gradient-to-br from-[#005394]/5 to-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#005394] flex items-center justify-center text-white font-bold text-base shrink-0">
                    {user?.initials ?? 'T'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {user?.full_name || '선생님'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    {(user?.school || user?.subject) && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {[user.school, user.subject].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
                  프로필 설정
                </Link>
                <Link
                  href="/settings?tab=notification"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-xl">notifications</span>
                  알림 설정
                </Link>
                <Link
                  href="/subscription"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-xl">workspace_premium</span>
                  구독 관리
                </Link>

                <div className="my-1 h-px bg-slate-100" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
