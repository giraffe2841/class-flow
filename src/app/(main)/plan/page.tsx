'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import UpgradeModal from '@/components/UpgradeModal'
import SchoolGradeSelector from '@/components/SchoolGradeSelector'
import { PLAN_LIMITS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

const CURRENT_PLAN = 'free' as keyof typeof PLAN_LIMITS

type Unit = { title: string; lessonText: string }

function parseLessons(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
}

const SCHEDULE_TYPES = ['시험', '행사', '공휴일', '재량휴업']
const TYPE_COLORS: Record<string, string> = {
  시험: 'bg-red-100 text-red-700',
  행사: 'bg-blue-100 text-blue-700',
  공휴일: 'bg-orange-100 text-orange-700',
  재량휴업: 'bg-slate-100 text-slate-700',
}

export default function PlanPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [schoolInfo, setSchoolInfo] = useState<{ schoolType: string; grade: number; selectedSubjects: string[]; year: number; classes: string[] } | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [unitTitleInput, setUnitTitleInput] = useState('')
  const [schedules, setSchedules] = useState<{ date: string; type: string; title: string }[]>([])
  const [scheduleInput, setScheduleInput] = useState({ date: '', type: '시험', title: '' })
  const [availableDays, setAvailableDays] = useState<number | null>(null)
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: '' })

  const limits = PLAN_LIMITS[CURRENT_PLAN]

  /* ── 단원 ── */
  const addUnit = () => {
    const title = unitTitleInput.trim()
    if (!title) return
    setUnits([...units, { title, lessonText: '' }])
    setUnitTitleInput('')
  }

  const updateUnitTitle = (i: number, title: string) =>
    setUnits(units.map((u, idx) => (idx === i ? { ...u, title } : u)))

  const updateLessonText = (i: number, lessonText: string) =>
    setUnits(units.map((u, idx) => (idx === i ? { ...u, lessonText } : u)))

  const removeUnit = (i: number) => setUnits(units.filter((_, idx) => idx !== i))

  /* ── 일정 ── */
  const addSchedule = () => {
    if (!scheduleInput.date || !scheduleInput.title.trim()) return
    setSchedules([...schedules, { ...scheduleInput, title: scheduleInput.title.trim() }])
    setScheduleInput({ date: '', type: '시험', title: '' })
  }
  const removeSchedule = (i: number) => setSchedules(schedules.filter((_, idx) => idx !== i))

  /* ── 수업 가능일 ── */
  const calcAvailableDays = () => {
    const yr = schoolInfo?.year ?? 2026
    const start = new Date(`${yr}-03-02`)
    const end = new Date(`${yr + 1}-02-28`)
    let count = 0
    const blocked = new Set(schedules.map((s) => s.date))
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay()
      if (day === 0 || day === 6) continue
      if (blocked.has(d.toISOString().slice(0, 10))) continue
      count++
    }
    setAvailableDays(count)
  }

  const totalLessons = units.reduce((sum, u) => sum + parseLessons(u.lessonText).length, 0)

  /* ── 저장 ── */
  const handleSave = async () => {
    if (!schoolInfo) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const subjectName = schoolInfo.selectedSubjects.join(', ')
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .insert({ user_id: user.id, name: subjectName, year: schoolInfo.year })
        .select('id')
        .single()
      if (subjectError) throw subjectError
      const subjectId = subjectData.id

      if (schoolInfo.classes.length > 0) {
        const { error } = await supabase.from('classes').insert(schoolInfo.classes.map((name) => ({ subject_id: subjectId, name })))
        if (error) throw error
      }

      for (let ui = 0; ui < units.length; ui++) {
        const unit = units[ui]
        if (!unit.title.trim()) continue
        const { data: unitData, error: unitError } = await supabase
          .from('units')
          .insert({ subject_id: subjectId, order: ui + 1, title: unit.title })
          .select('id')
          .single()
        if (unitError) throw unitError

        const lessons = parseLessons(unit.lessonText)
        if (lessons.length > 0) {
          const { error } = await supabase
            .from('lessons')
            .insert(lessons.map((title, li) => ({ unit_id: unitData.id, order: li + 1, title })))
          if (error) throw error
        }
      }

      if (schedules.length > 0) {
        const { error } = await supabase
          .from('schedules')
          .insert(schedules.map((s) => ({ subject_id: subjectId, date: s.date, type: s.type, title: s.title })))
        if (error) throw error
      }

      router.push('/dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleSchoolGradeComplete = (data: { schoolType: string; grade: number; selectedSubjects: string[]; year: number; classes: string[] }) => {
    setSchoolInfo(data)
    setStep(1)
  }

  const stepLabels = ['학교·학년', '단원 · 차시', '일정 등록']

  return (
    <>
      <TopNav title="새 수업계획" />

      <div className="flex-1 bg-[#f4f6fb] min-h-screen">
        {/* 스텝 헤더 */}
        <div className="bg-white border-b border-slate-100 px-8 py-5">
          <div className="max-w-5xl mx-auto flex items-center gap-0">
            {stepLabels.map((label, i) => {
              const num = i
              const active = step === num
              const done = step > num
              return (
                <div key={num} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => setStep(num)}
                    className={`flex items-center gap-2.5 group transition-all ${active ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        active
                          ? 'bg-[#005394] text-white shadow-lg shadow-[#005394]/25'
                          : done
                          ? 'bg-[#005394]/15 text-[#005394]'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {done ? (
                        <span className="material-symbols-outlined text-base">check</span>
                      ) : (
                        num + 1
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${
                        active ? 'text-[#005394]' : done ? 'text-[#005394]/70' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${done ? 'bg-[#005394]/30' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

          {/* ─── Step 0: 학교급·학년 선택 ─── */}
          {step === 0 && (
            <div className="max-w-3xl mx-auto">
              <SchoolGradeSelector onComplete={handleSchoolGradeComplete} maxClasses={limits.classes} />
            </div>
          )}

          {/* ─── Step 1: 단원·차시 입력 ─── */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 단원 목록 */}
              <div className="lg:col-span-2 space-y-4">
                {/* 단원 추가 입력 */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-[#005394]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#005394] text-base">format_list_numbered</span>
                    </span>
                    단원 추가
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={unitTitleInput}
                      onChange={(e) => setUnitTitleInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addUnit()}
                      placeholder="단원명 입력 후 Enter — 예: 문학의 본질과 가치"
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all placeholder:text-slate-300"
                    />
                    <button
                      onClick={addUnit}
                      disabled={!unitTitleInput.trim()}
                      className="px-5 py-3 bg-[#005394] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      추가
                    </button>
                  </div>
                </div>

                {/* 단원 카드 목록 */}
                {units.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">playlist_add</span>
                    <p className="text-slate-400 text-sm font-medium">위에서 단원을 추가해주세요</p>
                    <p className="text-slate-300 text-xs mt-1">단원명 입력 후 Enter 또는 추가 버튼</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {units.map((unit, ui) => {
                      const lessons = parseLessons(unit.lessonText)
                      return (
                        <div key={ui} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                          {/* 단원 헤더 */}
                          <div className="flex items-center gap-3">
                            <span className="flex-none text-xs font-bold text-[#005394] bg-[#005394]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                              {ui + 1}단원
                            </span>
                            <input
                              type="text"
                              value={unit.title}
                              onChange={(e) => updateUnitTitle(ui, e.target.value)}
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all"
                            />
                            <button
                              onClick={() => removeUnit(ui)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>

                          {/* 차시 입력 — textarea */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">subject</span>
                                차시 목록
                              </label>
                              {lessons.length > 0 && (
                                <span className="text-xs font-semibold text-[#005394] bg-[#005394]/10 px-2 py-0.5 rounded-full">
                                  {lessons.length}차시
                                </span>
                              )}
                            </div>
                            <textarea
                              value={unit.lessonText}
                              onChange={(e) => updateLessonText(ui, e.target.value)}
                              placeholder={`차시를 한 줄에 하나씩 입력하세요\n예:\n문학이란 무엇인가\n문학의 갈래와 특징\n문학 감상의 방법`}
                              rows={Math.max(4, lessons.length + 2)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all resize-none leading-relaxed placeholder:text-slate-300"
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">keyboard_return</span>
                              한 줄 = 1차시 · 붙여넣기도 가능해요
                            </p>
                          </div>

                          {/* 차시 미리보기 */}
                          {lessons.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap gap-1.5">
                              {lessons.map((lesson, li) => (
                                <span
                                  key={li}
                                  className="inline-flex items-center gap-1 bg-white text-slate-600 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                                >
                                  <span className="text-[#005394] font-bold">{li + 1}</span>
                                  {lesson}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(0)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    이전
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="px-7 py-3 bg-[#005394] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#005394]/20"
                  >
                    다음 단계
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* 요약 사이드패널 */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4 sticky top-24">
                  <h3 className="text-sm font-bold text-slate-700">구성 요약</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#005394]/5 rounded-xl p-3 text-center">
                      <p className="text-2xl font-extrabold text-[#005394]">{units.length}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">대단원</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-extrabold text-emerald-600">{totalLessons}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">총 차시</p>
                    </div>
                  </div>

                  {units.length > 0 && (
                    <div className="space-y-2">
                      {units.map((u, i) => {
                        const count = parseLessons(u.lessonText).length
                        return (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                            <span className="text-xs text-slate-600 font-medium truncate max-w-[140px]">
                              <span className="text-[#005394] font-bold mr-1">{i + 1}.</span>
                              {u.title || '(제목 없음)'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 flex-none">{count}차시</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {units.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">단원을 추가하면 여기에 표시됩니다</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: 일정 등록 ─── */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* 일정 입력 카드 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#005394]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#005394] text-base">event</span>
                    </span>
                    시험 · 행사 일정
                    <span className="text-xs font-normal text-slate-400 ml-1">수업 가능일 계산에 사용돼요</span>
                  </h2>

                  {/* 입력 폼 */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">날짜</label>
                        <input
                          type="date"
                          value={scheduleInput.date}
                          onChange={(e) => setScheduleInput({ ...scheduleInput, date: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">종류</label>
                        <select
                          value={scheduleInput.type}
                          onChange={(e) => setScheduleInput({ ...scheduleInput, type: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all bg-white"
                        >
                          {SCHEDULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">제목</label>
                        <input
                          type="text"
                          value={scheduleInput.title}
                          onChange={(e) => setScheduleInput({ ...scheduleInput, title: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && addSchedule()}
                          placeholder="예: 중간고사"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all bg-white placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addSchedule}
                      disabled={!scheduleInput.date || !scheduleInput.title.trim()}
                      className="w-full py-2.5 bg-[#005394] text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      일정 추가
                    </button>
                  </div>

                  {/* 일정 목록 */}
                  {schedules.length > 0 ? (
                    <div className="space-y-2">
                      {schedules.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-none ${TYPE_COLORS[s.type] ?? 'bg-slate-100 text-slate-700'}`}>
                            {s.type}
                          </span>
                          <span className="text-sm text-slate-400 flex-none">{s.date}</span>
                          <span className="text-sm font-semibold text-slate-800 flex-1">{s.title}</span>
                          <button onClick={() => removeSchedule(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">calendar_month</span>
                      <p className="text-sm text-slate-400">등록된 일정이 없어요 · 건너뛰어도 됩니다</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    이전
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-[#005394] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#005394]/20"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {saving ? '저장 중...' : '수업계획 저장'}
                  </button>
                </div>
              </div>

              {/* 우측 요약 */}
              <div className="space-y-4">
                {/* 수업 가능일 계산 */}
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005394] text-base">calculate</span>
                    수업 가능일 계산
                  </h3>
                  <button
                    onClick={calcAvailableDays}
                    className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    계산하기
                  </button>
                  {availableDays !== null && (
                    <div className="bg-[#005394]/5 border border-[#005394]/10 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">{schoolInfo?.year}학년도 (주말·등록 일정 제외)</p>
                      <p className="text-3xl font-extrabold text-[#005394]">{availableDays}<span className="text-base font-semibold ml-1">일</span></p>
                      {totalLessons > 0 && (
                        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-[#005394]/10">
                          등록된 차시 <strong className="text-slate-700">{totalLessons}차시</strong>
                          {availableDays >= totalLessons && (
                            <span className="ml-2 text-emerald-600 font-semibold">· 여유 {availableDays - totalLessons}일</span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 최종 확인 요약 */}
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700">최종 확인</h3>
                  {[
                    { label: '교과', value: schoolInfo?.selectedSubjects.join(', ') ?? '', icon: 'menu_book' },
                    { label: '학년도', value: `${schoolInfo?.year ?? ''}학년도`, icon: 'calendar_today' },
                    { label: '담당 반', value: (schoolInfo?.classes.length ?? 0) > 0 ? schoolInfo!.classes.join(', ') : '미입력', icon: 'group' },
                    { label: '단원 수', value: `${units.length}개`, icon: 'format_list_numbered' },
                    { label: '총 차시', value: `${totalLessons}차시`, icon: 'subject' },
                    { label: '일정', value: `${schedules.length}건`, icon: 'event' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                      <span className="material-symbols-outlined text-slate-400 text-base">{item.icon}</span>
                      <span className="text-xs text-slate-400 w-14">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: '' })}
        feature={upgradeModal.feature}
      />
    </>
  )
}
