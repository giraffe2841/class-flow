'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TopNav from '@/components/TopNav'
import { createClient } from '@/lib/supabase/client'

interface SubjectPlan {
  id: string
  name: string
  year: number
  created_at: string
  unitCount: number
  lessonCount: number
}

interface ClassProgress {
  class_id: string
  class_name: string
  subject_name: string
  total_lessons: number
  completed_lessons: number
  progress: number
}

interface Schedule {
  id: string
  date: string
  type: string
  title: string
}

interface Material {
  id: string
  name: string | null
  type: string | null
  created_at: string
}

const MATERIAL_ICON: Record<string, string> = {
  '워크시트': 'description',
  '퀴즈': 'quiz',
  '양식': 'draft',
  '슬라이드': 'slideshow',
  '영상': 'smart_display',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return '좋은 아침입니다'
  if (h < 18) return '안녕하세요'
  return '수고하셨습니다'
}

export default function DashboardPage() {
  const supabase = createClient()
  const [userName, setUserName] = useState('')
  const [plans, setPlans] = useState<SubjectPlan[]>([])
  const [classes, setClasses] = useState<ClassProgress[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] ?? '선생님')
      }

      // 저장된 수업계획 목록
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('id, name, year, created_at, units(id, lessons(id))')
        .order('created_at', { ascending: false })

      if (subjectData) {
        setPlans(
          subjectData.map((s: { id: string; name: string; year: number; created_at: string; units: { id: string; lessons: { id: string }[] }[] }) => {
            const unitCount = s.units?.length ?? 0
            const lessonCount = s.units?.reduce((sum: number, u: { lessons: { id: string }[] }) => sum + (u.lessons?.length ?? 0), 0) ?? 0
            return { id: s.id, name: s.name, year: s.year, created_at: s.created_at, unitCount, lessonCount }
          })
        )
      }

      // 반별 진도
      const { data: progressData } = await supabase.rpc('get_class_progress')
      if (progressData) {
        setClasses(
          progressData.map((r: Omit<ClassProgress, 'progress'>) => ({
            ...r,
            progress:
              r.total_lessons > 0
                ? Math.round((r.completed_lessons / r.total_lessons) * 100)
                : 0,
          }))
        )
      }

      // 다가오는 학사 일정 (오늘 이후 5건)
      const today = new Date().toISOString().slice(0, 10)
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('id, date, type, title')
        .gte('date', today)
        .order('date')
        .limit(5)
      if (scheduleData) setSchedules(scheduleData)

      // 최근 수업 자료 3건
      const { data: materialData } = await supabase
        .from('materials')
        .select('id, name, type, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      if (materialData) setMaterials(materialData)

      setLoading(false)
    }
    load()
  }, [])

  const handleDeletePlan = async (subjectId: string) => {
    setDeletingId(subjectId)
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId)
      if (error) throw error
      setPlans((prev) => prev.filter((p) => p.id !== subjectId))
      setClasses((prev) => prev.filter((c) => c.class_id !== subjectId))
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const overallProgress =
    classes.length > 0
      ? Math.round(classes.reduce((sum, c) => sum + c.progress, 0) / classes.length)
      : 0

  const behindClasses = classes.filter(c => c.progress < 80)
  const hasData = plans.length > 0

  return (
    <>
      <TopNav />

      <div className="p-4 lg:p-8 space-y-6">
        {/* 상단 인사말 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {getGreeting()}{userName ? `, ${userName} 선생님` : ', 선생님'}.
            </h1>
            <p className="text-sm text-slate-500 mt-1">오늘도 효율적인 수업 준비를 도와드릴게요.</p>
          </div>
          {behindClasses.length > 0 && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-full text-xs font-semibold w-fit">
              <span className="material-symbols-outlined text-sm">warning</span>
              진도 지연 {behindClasses.length}개 반
            </span>
          )}
        </div>

        {/* 진도 지연 알림 배너 */}
        {behindClasses.length > 0 && (
          <div className="flex items-center gap-3 bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
            <p className="flex-1 text-sm text-[#ba1a1a] font-medium">
              <strong>{behindClasses.map(c => c.class_name).join(', ')}</strong>{' '}
              진도가 80% 미만입니다.
            </p>
            <Link
              href="/plan"
              className="shrink-0 px-4 py-1.5 bg-[#ba1a1a] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all"
            >
              보강안 보기
            </Link>
          </div>
        )}

        {/* 데이터 없을 때 온보딩 안내 */}
        {!loading && !hasData && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            <p className="font-semibold text-slate-700 mb-1">아직 수업계획이 없어요</p>
            <p className="text-sm text-slate-400 mb-4">수업계획을 먼저 만들어보세요.</p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #005394, #2b6cb0)' }}
            >
              <span className="material-symbols-outlined text-lg">add</span>
              수업계획 만들기
            </Link>
          </div>
        )}

        {/* 메인 그리드 */}
        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 좌측 2열 영역 */}
            <div className="lg:col-span-2 space-y-6">

              {/* 수업계획 목록 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005394]">menu_book</span>
                    <h2 className="text-lg font-bold text-slate-900">수업계획</h2>
                  </div>
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#005394] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    새 계획
                  </Link>
                </div>

                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div key={plan.id} className="group">
                      {confirmId === plan.id ? (
                        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          <p className="text-sm text-red-700 font-medium">
                            <strong>{plan.name}</strong> 계획을 삭제할까요? 단원·차시 기록도 모두 삭제됩니다.
                          </p>
                          <div className="flex gap-2 ml-3 shrink-0">
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              disabled={deletingId === plan.id}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 flex items-center gap-1"
                            >
                              {deletingId === plan.id ? (
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                              ) : (
                                <span className="material-symbols-outlined text-sm">delete</span>
                              )}
                              삭제
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-100 hover:border-[#005394]/20 hover:bg-[#005394]/3 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-[#005394]/10 flex items-center justify-center flex-none">
                            <span className="material-symbols-outlined text-[#005394] text-xl">menu_book</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{plan.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{plan.year}학년도 · 단원 {plan.unitCount}개 · {plan.lessonCount}차시</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-slate-300">
                              {new Date(plan.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            </span>
                            <button
                              onClick={() => setConfirmId(plan.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 ml-1"
                              title="계획 삭제"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 반별 진도 현황 (반이 있을 때만) */}
              {classes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#005394]">trending_up</span>
                      <h2 className="text-lg font-bold text-slate-900">반별 진도 현황</h2>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-[#005394]">{overallProgress}%</span>
                      <p className="text-xs text-slate-400 font-semibold">전체 평균</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {classes.map((cls) => (
                      <div key={cls.class_id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-slate-700">
                            {cls.class_name} <span className="text-slate-400">({cls.subject_name})</span>
                          </span>
                          <span className={`text-sm font-bold ${cls.progress < 80 ? 'text-[#ba1a1a]' : 'text-[#005394]'}`}>
                            {cls.progress}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cls.progress}%`,
                              background:
                                cls.progress < 80
                                  ? 'linear-gradient(90deg, #ba1a1a, #e05555)'
                                  : 'linear-gradient(90deg, #005394, #0088cc)',
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {cls.completed_lessons}/{cls.total_lessons} 차시 완료
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 최근 수업 자료 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005394]">folder_open</span>
                    <h3 className="font-bold text-slate-900">최근 수업 자료</h3>
                  </div>
                  <Link href="/materials" className="text-xs text-[#005394] font-semibold hover:underline">
                    전체 보기
                  </Link>
                </div>

                {materials.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">등록된 자료가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#005394]/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#005394] text-xl">
                            {MATERIAL_ICON[mat.type ?? ''] ?? 'description'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{mat.name ?? '(이름 없음)'}</p>
                          <p className="text-xs text-slate-400">{mat.type ?? '-'}</p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          {new Date(mat.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 우측: 학사 일정 */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#005394]">event_note</span>
                  <h3 className="font-bold text-slate-900">학사 일정</h3>
                </div>

                {schedules.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">예정된 일정이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((sch) => {
                      const d = new Date(sch.date)
                      const isExam = sch.type === '시험'
                      return (
                        <div
                          key={sch.id}
                          className={`flex gap-3 p-3 rounded-xl border ${
                            isExam
                              ? 'border-[#ba1a1a]/20 bg-[#ba1a1a]/5'
                              : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center min-w-[3rem]">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {d.getMonth() + 1}월
                            </span>
                            <span className="text-xl font-extrabold text-slate-800">{d.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{sch.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{sch.type}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <Link
                  href="/calendar"
                  className="mt-4 flex items-center justify-center gap-1 text-xs text-[#005394] font-semibold hover:underline"
                >
                  달력에서 전체 보기
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
