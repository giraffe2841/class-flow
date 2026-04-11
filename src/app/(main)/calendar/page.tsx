'use client'

import { useState, useEffect, useCallback } from 'react'
import TopNav from '@/components/TopNav'
import { createClient } from '@/lib/supabase/client'

interface CalendarEvent {
  id?: string
  type: 'lesson' | 'event' | 'exam' | 'admin'
  title: string
  subjectId?: string
  isSchedule?: boolean // true = schedules 테이블, false = lessons 테이블
}

interface Subject {
  id: string
  name: string
}

const DB_TYPE_MAP: Record<string, CalendarEvent['type']> = {
  '시험': 'exam',
  '행사': 'event',
  '공휴일': 'admin',
}

const UI_TYPE_TO_DB: Record<string, string> = {
  exam: '시험',
  event: '행사',
  admin: '공휴일',
}

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  lesson: { bg: 'bg-[#005394]/10', text: 'text-[#005394]', dot: 'bg-[#005394]' },
  event: { bg: 'bg-[#006d3c]/10', text: 'text-[#006d3c]', dot: 'bg-[#006d3c]' },
  exam: { bg: 'bg-[#ba1a1a]/10', text: 'text-[#ba1a1a]', dot: 'bg-[#ba1a1a]' },
  admin: { bg: 'bg-[#7c5800]/10', text: 'text-[#7c5800]', dot: 'bg-[#7c5800]' },
}

const LEGEND = [
  { type: 'lesson', label: '수업' },
  { type: 'event', label: '행사' },
  { type: 'exam', label: '시험' },
  { type: 'admin', label: '행정' },
]

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const VIEW_TABS = [
  { key: 'month' as const, label: '월' },
  { key: 'week' as const, label: '주' },
  { key: 'day' as const, label: '일' },
]

const SCHEDULE_TYPES = [
  { value: 'exam', label: '시험' },
  { value: 'event', label: '행사' },
  { value: 'admin', label: '공휴일/행정' },
]

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (Date | null)[] = []

  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthDays - i))
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d))
  }

  const totalCells = days.length <= 35 ? 35 : 42
  while (days.length < totalCells) {
    const nextDay = days.length - startDow - daysInMonth + 1
    days.push(new Date(year, month + 1, nextDay))
  }

  return days
}

export default function CalendarPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  // 일정 추가 모달
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    date: '',
    type: 'event' as 'exam' | 'event' | 'admin',
    title: '',
    subjectId: '',
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  // 삭제 확인
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 교과 목록 fetch
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user.id)

      setSubjects(subjectsData || [])

      if (!subjectsData || subjectsData.length === 0) {
        setLoading(false)
        return
      }

      const subjectIds = subjectsData.map((s: Subject) => s.id)

      // schedules fetch
      const { data: schedulesData } = await supabase
        .from('schedules')
        .select('id, subject_id, date, type, title')
        .in('subject_id', subjectIds)

      // lessons with planned_date fetch
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, subject_id, planned_date, title')
        .in('subject_id', subjectIds)
        .not('planned_date', 'is', null)

      const newEvents: Record<string, CalendarEvent[]> = {}

      // schedules 이벤트 추가
      for (const s of schedulesData || []) {
        const key = s.date
        if (!newEvents[key]) newEvents[key] = []
        newEvents[key].push({
          id: s.id,
          type: DB_TYPE_MAP[s.type] || 'event',
          title: s.title,
          subjectId: s.subject_id,
          isSchedule: true,
        })
      }

      // lessons 이벤트 추가
      for (const l of lessonsData || []) {
        const key = l.planned_date
        if (!newEvents[key]) newEvents[key] = []
        newEvents[key].push({
          id: l.id,
          type: 'lesson',
          title: l.title,
          subjectId: l.subject_id,
          isSchedule: false,
        })
      }

      setEvents(newEvents)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const days = getCalendarDays(year, month)

  const todayKey = formatDateKey(today)
  const todayEvents = events[todayKey] || []
  const todaySummary = {
    lessons: todayEvents.filter(e => e.type === 'lesson').length,
    events: todayEvents.filter(e => e.type !== 'lesson').length,
  }

  const selectedKey = selectedDate ? formatDateKey(selectedDate) : ''
  const selectedEvents = selectedDate ? events[selectedKey] || [] : []

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  function goToday() {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(now)
  }

  function openAddModal() {
    setAddForm({
      date: selectedDate ? formatDateKey(selectedDate) : formatDateKey(today),
      type: 'event',
      title: '',
      subjectId: subjects[0]?.id || '',
    })
    setAddError('')
    setShowAddModal(true)
  }

  async function handleAddSchedule() {
    if (!addForm.title.trim()) { setAddError('제목을 입력하세요'); return }
    if (!addForm.subjectId) { setAddError('교과를 선택하세요'); return }
    setAddLoading(true)
    setAddError('')
    try {
      const { error } = await supabase.from('schedules').insert({
        subject_id: addForm.subjectId,
        date: addForm.date,
        type: UI_TYPE_TO_DB[addForm.type],
        title: addForm.title.trim(),
      })
      if (error) throw error
      setShowAddModal(false)
      await fetchData()
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : '저장에 실패했습니다')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleDeleteSchedule(id: string) {
    setDeletingId(id)
    try {
      await supabase.from('schedules').delete().eq('id', id)
      await fetchData()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <TopNav title="학사 일정" />
      <div className="flex-1 p-6 bg-[#f8f9ff] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">학사 일정</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? (
                <span className="text-slate-400">불러오는 중...</span>
              ) : (
                <>
                  오늘 수업 <span className="font-semibold text-[#005394]">{todaySummary.lessons}</span>건
                  {' / '}행사 <span className="font-semibold text-[#006d3c]">{todaySummary.events}</span>건
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              disabled={subjects.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#005394] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">add</span>
              일정 추가
            </button>
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              {VIEW_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    view === tab.key
                      ? 'bg-[#005394] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid - col-span-9 */}
          <div className="lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">
                  {year}년 {month + 1}월
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-sm font-medium text-[#005394] bg-[#005394]/5 hover:bg-[#005394]/10 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((name, i) => (
                <div
                  key={name}
                  className={`text-center text-xs font-semibold py-2 ${
                    i === 0 ? 'text-[#ba1a1a]' : i === 6 ? 'text-[#005394]' : 'text-slate-400'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Date Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                  <p className="text-sm">일정을 불러오는 중...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden">
                {days.map((date, idx) => {
                  if (!date) return <div key={idx} className="bg-white p-2 min-h-[80px]" />

                  const key = formatDateKey(date)
                  const dayEvents = events[key] || []
                  const isCurrentMonth = date.getMonth() === month
                  const isToday = isSameDay(date, today)
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                  const dow = date.getDay()

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`bg-white p-2 min-h-[80px] text-left transition-all hover:bg-slate-50 flex flex-col ${
                        !isCurrentMonth ? 'opacity-40' : ''
                      } ${isSelected ? 'ring-2 ring-[#005394] ring-inset z-10' : ''}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1 ${
                          isToday
                            ? 'bg-[#005394] text-white font-bold'
                            : dow === 0
                              ? 'text-[#ba1a1a]'
                              : dow === 6
                                ? 'text-[#005394]'
                                : 'text-slate-700'
                        } ${!isToday ? 'font-medium' : ''}`}
                      >
                        {date.getDate()}
                      </span>
                      <div className="flex flex-col gap-0.5 mt-auto">
                        {dayEvents.slice(0, 2).map((evt, ei) => (
                          <span
                            key={ei}
                            className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${EVENT_COLORS[evt.type].bg} ${EVENT_COLORS[evt.type].text} font-medium`}
                          >
                            {evt.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-slate-400 px-1">+{dayEvents.length - 2}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Panel - col-span-3 */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Selected Date Detail */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedDate
                    ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${DAY_NAMES[selectedDate.getDay()]})`
                    : '날짜를 선택하세요'}
                </h3>
                {selectedDate && (
                  <button
                    onClick={openAddModal}
                    disabled={subjects.length === 0}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#005394] transition-colors disabled:opacity-40"
                    title="일정 추가"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                )}
              </div>
              {selectedEvents.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedEvents.map((evt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl ${EVENT_COLORS[evt.type].bg}`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${EVENT_COLORS[evt.type].dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${EVENT_COLORS[evt.type].text}`}>{evt.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {evt.type === 'lesson' && '수업 진도'}
                          {evt.type === 'exam' && '시험'}
                          {evt.type === 'event' && '학교 행사'}
                          {evt.type === 'admin' && '행정 업무'}
                        </p>
                      </div>
                      {evt.isSchedule && evt.id && (
                        <button
                          onClick={() => handleDeleteSchedule(evt.id!)}
                          disabled={deletingId === evt.id}
                          className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          {deletingId === evt.id
                            ? <span className="material-symbols-outlined text-xs">progress_activity</span>
                            : <span className="material-symbols-outlined text-xs">close</span>
                          }
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">등록된 일정이 없습니다.</p>
              )}
            </div>

           

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">범례</h3>
              <div className="flex flex-col gap-2">
                {LEGEND.map(item => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${EVENT_COLORS[item.type].dot}`} />
                    <span className="text-xs text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">일정 추가</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* 날짜 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">날짜</label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30"
                />
              </div>

              {/* 유형 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">유형</label>
                <div className="flex gap-2">
                  {SCHEDULE_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setAddForm(f => ({ ...f, type: t.value as typeof addForm.type }))}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                        addForm.type === t.value
                          ? `${EVENT_COLORS[t.value].bg} ${EVENT_COLORS[t.value].text} ring-1 ring-current`
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">제목</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="예) 중간고사, 체육대회"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30"
                />
              </div>

              {/* 교과 선택 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">교과</label>
                <select
                  value={addForm.subjectId}
                  onChange={e => setAddForm(f => ({ ...f, subjectId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {addError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={addLoading}
                className="flex-1 py-3 rounded-xl bg-[#005394] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {addLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
