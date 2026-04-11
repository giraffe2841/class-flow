'use client'

import { useState } from 'react'

type Subject = { name: string; category: string; isRequired: boolean }

interface SchoolGradeSelectorProps {
  onComplete: (data: { schoolType: string; grade: number; selectedSubjects: string[]; year: number; classes: string[] }) => void
  maxClasses?: number
}

const SCHOOL_TYPES = [
  { value: 'middle' as const, label: '중학교', icon: 'school', desc: '1~3학년' },
  { value: 'high' as const, label: '고등학교', icon: 'account_balance', desc: '1~3학년' },
]

const CATEGORY_COLORS: Record<string, string> = {
  국어: 'bg-rose-50 border-rose-200 text-rose-700',
  수학: 'bg-blue-50 border-blue-200 text-blue-700',
  영어: 'bg-violet-50 border-violet-200 text-violet-700',
  사회: 'bg-amber-50 border-amber-200 text-amber-700',
  과학: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  체육: 'bg-orange-50 border-orange-200 text-orange-700',
  예술: 'bg-pink-50 border-pink-200 text-pink-700',
  '기술·가정': 'bg-cyan-50 border-cyan-200 text-cyan-700',
  교양: 'bg-slate-50 border-slate-200 text-slate-700',
  선택: 'bg-purple-50 border-purple-200 text-purple-700',
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? 'bg-slate-50 border-slate-200 text-slate-700'
}

const MIDDLE_SUBJECTS: Record<number, Subject[]> = {
  1: [
    { name: '국어', category: '국어', isRequired: true },
    { name: '사회', category: '사회', isRequired: true },
    { name: '도덕', category: '사회', isRequired: true },
    { name: '수학', category: '수학', isRequired: true },
    { name: '과학', category: '과학', isRequired: true },
    { name: '기술·가정', category: '기술·가정', isRequired: true },
    { name: '정보', category: '기술·가정', isRequired: true },
    { name: '체육', category: '체육', isRequired: true },
    { name: '음악', category: '예술', isRequired: true },
    { name: '미술', category: '예술', isRequired: true },
    { name: '영어', category: '영어', isRequired: true },
    { name: '진로와 직업', category: '교양', isRequired: true },
  ],
  2: [
    { name: '국어', category: '국어', isRequired: true },
    { name: '사회', category: '사회', isRequired: true },
    { name: '도덕', category: '사회', isRequired: true },
    { name: '수학', category: '수학', isRequired: true },
    { name: '과학', category: '과학', isRequired: true },
    { name: '기술·가정', category: '기술·가정', isRequired: true },
    { name: '정보', category: '기술·가정', isRequired: true },
    { name: '체육', category: '체육', isRequired: true },
    { name: '음악', category: '예술', isRequired: true },
    { name: '미술', category: '예술', isRequired: true },
    { name: '영어', category: '영어', isRequired: true },
    { name: '진로와 직업', category: '교양', isRequired: true },
  ],
  3: [
    { name: '국어', category: '국어', isRequired: true },
    { name: '사회', category: '사회', isRequired: true },
    { name: '역사', category: '사회', isRequired: true },
    { name: '도덕', category: '사회', isRequired: true },
    { name: '수학', category: '수학', isRequired: true },
    { name: '과학', category: '과학', isRequired: true },
    { name: '기술·가정', category: '기술·가정', isRequired: true },
    { name: '체육', category: '체육', isRequired: true },
    { name: '음악', category: '예술', isRequired: true },
    { name: '미술', category: '예술', isRequired: true },
    { name: '영어', category: '영어', isRequired: true },
    { name: '한문', category: '선택', isRequired: false },
    { name: '피지컬 컴퓨팅', category: '선택', isRequired: false },
  ],
}

const HIGH_SUBJECTS: Record<number, Subject[]> = {
  1: [
    { name: '공통국어1', category: '국어', isRequired: true },
    { name: '공통국어2', category: '국어', isRequired: true },
    { name: '공통수학1', category: '수학', isRequired: true },
    { name: '공통수학2', category: '수학', isRequired: true },
    { name: '공통영어1', category: '영어', isRequired: true },
    { name: '공통영어2', category: '영어', isRequired: true },
    { name: '한국사1', category: '사회', isRequired: true },
    { name: '한국사2', category: '사회', isRequired: true },
    { name: '통합사회1', category: '사회', isRequired: true },
    { name: '통합사회2', category: '사회', isRequired: true },
    { name: '통합과학1', category: '과학', isRequired: true },
    { name: '통합과학2', category: '과학', isRequired: true },
    { name: '체육1', category: '체육', isRequired: true },
    { name: '음악', category: '예술', isRequired: true },
    { name: '미술', category: '예술', isRequired: true },
    { name: '기술·가정', category: '기술·가정', isRequired: true },
  ],
  2: [
    { name: '문학', category: '국어', isRequired: false },
    { name: '독서와 작문', category: '국어', isRequired: false },
    { name: '화법과 언어', category: '국어', isRequired: false },
    { name: '대수', category: '수학', isRequired: false },
    { name: '미적분Ⅰ', category: '수학', isRequired: false },
    { name: '확률과 통계', category: '수학', isRequired: false },
    { name: '영어Ⅰ', category: '영어', isRequired: false },
    { name: '영어Ⅱ', category: '영어', isRequired: false },
    { name: '사회와 문화', category: '사회', isRequired: false },
    { name: '현대사회와 윤리', category: '사회', isRequired: false },
    { name: '물리학', category: '과학', isRequired: false },
    { name: '화학', category: '과학', isRequired: false },
    { name: '생명과학', category: '과학', isRequired: false },
    { name: '지구과학', category: '과학', isRequired: false },
    { name: '체육2', category: '체육', isRequired: false },
    { name: '정보', category: '기술·가정', isRequired: false },
  ],
  3: [
    { name: '심화국어', category: '국어', isRequired: false },
    { name: '미적분Ⅱ', category: '수학', isRequired: false },
    { name: '기하', category: '수학', isRequired: false },
    { name: '영어 독해와 작문', category: '영어', isRequired: false },
    { name: '심화영어', category: '영어', isRequired: false },
    { name: '세계사', category: '사회', isRequired: false },
    { name: '경제', category: '사회', isRequired: false },
    { name: '정치와 법', category: '사회', isRequired: false },
    { name: '물리학 실험', category: '과학', isRequired: false },
    { name: '화학 실험', category: '과학', isRequired: false },
    { name: '생명과학 실험', category: '과학', isRequired: false },
    { name: '인공지능 기초', category: '기술·가정', isRequired: false },
    { name: '체육3', category: '체육', isRequired: false },
  ],
}

export default function SchoolGradeSelector({ onComplete, maxClasses }: SchoolGradeSelectorProps) {
  const [schoolType, setSchoolType] = useState<'middle' | 'high' | null>(null)
  const [grade, setGrade] = useState<number | null>(null)
  const [year, setYear] = useState(2026)
  const [classesLocal, setClassesLocal] = useState<string[]>([])
  const [classInputLocal, setClassInputLocal] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const addClassLocal = () => {
    const name = classInputLocal.trim()
    if (!name) return
    if (maxClasses !== undefined && classesLocal.length >= maxClasses) return
    if (!classesLocal.includes(name)) setClassesLocal([...classesLocal, name])
    setClassInputLocal('')
  }

  const loadSubjects = (st: 'middle' | 'high', g: number) => {
    const list = st === 'middle' ? MIDDLE_SUBJECTS[g] : HIGH_SUBJECTS[g]
    setSubjects(list ?? [])
    setSelected(null)
  }

  const handleSchoolType = (type: 'middle' | 'high') => {
    setSchoolType(type)
    setGrade(null)
    setSubjects([])
    setSelected(null)
  }

  const handleGrade = (g: number) => {
    setGrade(g)
    if (schoolType) loadSubjects(schoolType, g)
  }

  const toggleSubject = (name: string) => {
    setSelected((prev) => prev === name ? null : name)
  }

  const handleComplete = () => {
    if (!schoolType || !grade || !selected) return
    onComplete({ schoolType, grade, selectedSubjects: [selected], year, classes: classesLocal })
  }

  const grouped = subjects.reduce<Record<string, Subject[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Step 1: 학교급 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#005394]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#005394] text-base">domain</span>
          </span>
          학교급 선택
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {SCHOOL_TYPES.map((st) => (
            <button
              key={st.value}
              onClick={() => handleSchoolType(st.value)}
              className="school-card step-fade-in"
              data-selected={schoolType === st.value ? 'true' : undefined}
            >
              <span className="material-symbols-outlined school-card__icon">{st.icon}</span>
              <p className="school-card__label">{st.label}</p>
              <p className="text-xs text-slate-400 mt-1">{st.desc}</p>
              {schoolType === st.value && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: 학년 */}
      {schoolType && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#005394]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#005394] text-base">school</span>
            </span>
            학년 선택
          </h2>
          <div className="flex gap-3">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => handleGrade(g)}
                className="grade-btn flex-1"
                data-selected={grade === g ? 'true' : undefined}
              >
                {g}학년
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">학년도</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all bg-white"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}학년도</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">담당 반</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={classInputLocal}
                  onChange={(e) => setClassInputLocal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addClassLocal()}
                  placeholder="반 이름 후 Enter"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/20 focus:border-[#005394] transition-all placeholder:text-slate-300"
                />
                <button
                  onClick={addClassLocal}
                  className="px-4 py-3 bg-[#005394] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
                >
                  추가
                </button>
              </div>
              {classesLocal.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {classesLocal.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-[#005394]/8 text-[#005394] px-3 py-1.5 rounded-full text-sm font-semibold border border-[#005394]/15"
                    >
                      <span className="material-symbols-outlined text-sm">group</span>
                      {c}
                      <button onClick={() => setClassesLocal(classesLocal.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors ml-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 과목 목록 */}
      {grade && subjects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#005394]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#005394] text-base">menu_book</span>
            </span>
            {grade}학년 과목
            {selected && (
              <span className="text-xs font-normal text-slate-400 ml-1">
                {selected} 선택됨
              </span>
            )}
          </h2>

          <div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{category}</p>
                <div className="subject-grid">
                  {items.map((s) => {
                    const isSelected = selected === s.name
                    return (
                      <button
                        key={s.name}
                        onClick={() => toggleSubject(s.name)}
                        className={`subject-card ${getCategoryColor(category)}`}
                        data-selected={isSelected ? 'true' : undefined}
                      >
                        <span className="subject-card__name">{s.name}</span>
                        <span className="subject-card__category">{s.category}</span>
                        {!s.isRequired && (
                          <span className="subject-card__required" style={{ background: 'rgb(147 51 234 / 0.1)', color: 'rgb(126 34 206)' }}>선택</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleComplete}
            disabled={!selected}
            className="w-full py-3.5 bg-[color:var(--color-primary)] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            이 과목으로 시작하기
          </button>
        </div>
      )}
    </div>
  )
}
