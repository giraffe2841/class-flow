'use client'

import { useEffect, useState, useCallback } from 'react'
import TopNav from '@/components/TopNav'
import { createClient } from '@/lib/supabase/client'

interface Subject {
  id: string
  name: string
  year: number
  class_id: string
  class_name: string
}

interface Lesson {
  id: string
  order: number
  title: string
  planned_date: string | null
  completed: boolean
  completed_at: string | null
}

interface Unit {
  id: string
  order: number
  title: string
  lessons: Lesson[]
}

export default function ProgressPage() {
  const supabase = createClient()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  // 과목 + 반 목록 로드
  useEffect(() => {
    async function loadSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('id, name, year, classes(id, name)')
        .order('created_at', { ascending: false })

      if (data) {
        const list: Subject[] = []
        for (const s of data as { id: string; name: string; year: number; classes: { id: string; name: string }[] }[]) {
          if (s.classes?.length) {
            for (const c of s.classes) {
              list.push({ id: s.id, name: s.name, year: s.year, class_id: c.id, class_name: c.name })
            }
          }
        }
        setSubjects(list)
      }
      setLoading(false)
    }
    loadSubjects()
  }, [])

  // 선택한 과목의 단원·차시·진도 로드
  const loadUnits = useCallback(async (subjectId: string, classId: string) => {
    setLoading(true)
    const { data: unitData } = await supabase
      .from('units')
      .select('id, order, title, lessons(id, order, title, planned_date)')
      .eq('subject_id', subjectId)
      .order('order')

    if (!unitData) { setLoading(false); return }

    // 해당 반의 progress 일괄 조회
    const lessonIds = (unitData as { lessons: { id: string }[] }[]).flatMap(u => u.lessons?.map((l: { id: string }) => l.id) ?? [])
    const { data: progressData } = lessonIds.length
      ? await supabase.from('progress').select('lesson_id, completed, completed_at').eq('class_id', classId).in('lesson_id', lessonIds)
      : { data: [] }

    const progressMap = new Map((progressData ?? []).map((p: { lesson_id: string; completed: boolean; completed_at: string | null }) => [p.lesson_id, p]))

    setUnits(
      (unitData as { id: string; order: number; title: string; lessons: { id: string; order: number; title: string; planned_date: string | null }[] }[]).map(u => ({
        id: u.id,
        order: u.order,
        title: u.title,
        lessons: (u.lessons ?? [])
          .sort((a, b) => a.order - b.order)
          .map(l => {
            const p = progressMap.get(l.id)
            return {
              id: l.id,
              order: l.order,
              title: l.title,
              planned_date: l.planned_date,
              completed: p?.completed ?? false,
              completed_at: p?.completed_at ?? null,
            }
          }),
      }))
    )
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (subjects.length === 0) return
    const s = subjects[selectedSubjectIdx]
    loadUnits(s.id, s.class_id)
  }, [subjects, selectedSubjectIdx, loadUnits])

  // 체크박스 토글
  const toggle = async (lesson: Lesson) => {
    if (toggling) return
    const subject = subjects[selectedSubjectIdx]
    setToggling(lesson.id)

    const newCompleted = !lesson.completed

    // 낙관적 업데이트
    setUnits(prev => prev.map(u => ({
      ...u,
      lessons: u.lessons.map(l =>
        l.id === lesson.id
          ? { ...l, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : l
      ),
    })))

    const { error } = await supabase.from('progress').upsert(
      { lesson_id: lesson.id, class_id: subject.class_id, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null },
      { onConflict: 'lesson_id,class_id' }
    )

    if (error) {
      // 실패 시 롤백
      setUnits(prev => prev.map(u => ({
        ...u,
        lessons: u.lessons.map(l => l.id === lesson.id ? lesson : l),
      })))
    }

    setToggling(null)
  }

  const selectedSubject = subjects[selectedSubjectIdx]

  const totalLessons = units.flatMap(u => u.lessons).length
  const completedLessons = units.flatMap(u => u.lessons).filter(l => l.completed).length
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <>
      <TopNav title="진도 체크" />

      <div className="p-4 lg:p-8 space-y-6">
        {/* 과목/반 탭 */}
        {subjects.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {subjects.map((s, i) => (
              <button
                key={s.class_id}
                onClick={() => setSelectedSubjectIdx(i)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  i === selectedSubjectIdx
                    ? 'bg-[#005394] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#005394]/40'
                }`}
              >
                {s.name}
                <span className="ml-1.5 text-xs opacity-70">{s.class_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 수업계획 없음 */}
        {!loading && subjects.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>checklist</span>
            <p className="font-semibold text-slate-700 mb-1">수업계획이 없어요</p>
            <p className="text-sm text-slate-400">수업계획을 먼저 만들면 진도를 체크할 수 있어요.</p>
          </div>
        )}

        {/* 전체 진도 바 */}
        {selectedSubject && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-slate-900">{selectedSubject.name} — {selectedSubject.class_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedSubject.year}학년도 · {completedLessons}/{totalLessons} 차시 완료</p>
              </div>
              <span className="text-3xl font-extrabold text-[#005394]">{overallPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallPct}%`,
                  background: overallPct < 80
                    ? 'linear-gradient(90deg, #ba1a1a, #e05555)'
                    : 'linear-gradient(90deg, #005394, #0088cc)',
                }}
              />
            </div>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined text-3xl text-slate-300 animate-spin">progress_activity</span>
          </div>
        )}

        {/* 단원 & 차시 목록 */}
        {!loading && units.map(unit => {
          const unitCompleted = unit.lessons.filter(l => l.completed).length
          const unitTotal = unit.lessons.length
          const unitPct = unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0

          return (
            <div key={unit.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* 단원 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#005394]/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#005394]">{unit.order}</span>
                  </div>
                  <h3 className="font-bold text-slate-800">{unit.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{unitCompleted}/{unitTotal}</span>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${unitPct}%`,
                        background: unitPct === 100 ? '#22c55e' : 'linear-gradient(90deg, #005394, #0088cc)',
                      }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${unitPct === 100 ? 'text-green-600' : 'text-[#005394]'}`}>{unitPct}%</span>
                </div>
              </div>

              {/* 차시 목록 */}
              <div className="divide-y divide-slate-50">
                {unit.lessons.length === 0 && (
                  <p className="px-5 py-4 text-sm text-slate-400">차시가 없습니다.</p>
                )}
                {unit.lessons.map(lesson => (
                  <label
                    key={lesson.id}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors select-none ${
                      lesson.completed ? 'bg-green-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* 체크박스 */}
                    <button
                      onClick={() => toggle(lesson)}
                      disabled={toggling === lesson.id}
                      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        lesson.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-300 hover:border-[#005394]'
                      } ${toggling === lesson.id ? 'opacity-50' : ''}`}
                    >
                      {lesson.completed && (
                        <span className="material-symbols-outlined text-white text-xs" style={{ fontSize: '14px' }}>check</span>
                      )}
                    </button>

                    {/* 차시 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${lesson.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        <span className="text-slate-400 mr-1.5">{lesson.order}차시</span>
                        {lesson.title}
                      </p>
                      {lesson.planned_date && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          예정일 {new Date(lesson.planned_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </p>
              )}
                    </div>

                    {/* 완료 날짜 */}
                    {lesson.completed && lesson.completed_at && (
                      <span className="shrink-0 text-xs text-green-600 font-medium">
                        {new Date(lesson.completed_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} 완료
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
