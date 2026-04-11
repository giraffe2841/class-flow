'use client'

import { useState } from 'react'

type SubjectItem = { name: string; category: string }

interface SubjectPickerProps {
  onSelect: (info: { schoolType: 'middle' | 'high'; grade: number; subject: string }) => void
}

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

const MIDDLE: Record<number, SubjectItem[]> = {
  1: [
    { name: '국어', category: '국어' },
    { name: '사회', category: '사회' },
    { name: '도덕', category: '사회' },
    { name: '수학', category: '수학' },
    { name: '과학', category: '과학' },
    { name: '기술·가정', category: '기술·가정' },
    { name: '정보', category: '기술·가정' },
    { name: '체육', category: '체육' },
    { name: '음악', category: '예술' },
    { name: '미술', category: '예술' },
    { name: '영어', category: '영어' },
    { name: '진로와 직업', category: '교양' },
  ],
  2: [
    { name: '국어', category: '국어' },
    { name: '사회', category: '사회' },
    { name: '도덕', category: '사회' },
    { name: '수학', category: '수학' },
    { name: '과학', category: '과학' },
    { name: '기술·가정', category: '기술·가정' },
    { name: '정보', category: '기술·가정' },
    { name: '체육', category: '체육' },
    { name: '음악', category: '예술' },
    { name: '미술', category: '예술' },
    { name: '영어', category: '영어' },
    { name: '진로와 직업', category: '교양' },
  ],
  3: [
    { name: '국어', category: '국어' },
    { name: '사회', category: '사회' },
    { name: '역사', category: '사회' },
    { name: '도덕', category: '사회' },
    { name: '수학', category: '수학' },
    { name: '과학', category: '과학' },
    { name: '기술·가정', category: '기술·가정' },
    { name: '체육', category: '체육' },
    { name: '음악', category: '예술' },
    { name: '미술', category: '예술' },
    { name: '영어', category: '영어' },
    { name: '한문', category: '선택' },
    { name: '피지컬 컴퓨팅', category: '선택' },
  ],
}

const HIGH: Record<number, SubjectItem[]> = {
  1: [
    { name: '공통국어1', category: '국어' },
    { name: '공통국어2', category: '국어' },
    { name: '공통수학1', category: '수학' },
    { name: '공통수학2', category: '수학' },
    { name: '공통영어1', category: '영어' },
    { name: '공통영어2', category: '영어' },
    { name: '한국사1', category: '사회' },
    { name: '한국사2', category: '사회' },
    { name: '통합사회1', category: '사회' },
    { name: '통합사회2', category: '사회' },
    { name: '통합과학1', category: '과학' },
    { name: '통합과학2', category: '과학' },
    { name: '체육1', category: '체육' },
    { name: '음악', category: '예술' },
    { name: '미술', category: '예술' },
    { name: '기술·가정', category: '기술·가정' },
  ],
  2: [
    { name: '문학', category: '국어' },
    { name: '독서와 작문', category: '국어' },
    { name: '화법과 언어', category: '국어' },
    { name: '대수', category: '수학' },
    { name: '미적분Ⅰ', category: '수학' },
    { name: '확률과 통계', category: '수학' },
    { name: '영어Ⅰ', category: '영어' },
    { name: '영어Ⅱ', category: '영어' },
    { name: '사회와 문화', category: '사회' },
    { name: '현대사회와 윤리', category: '사회' },
    { name: '물리학', category: '과학' },
    { name: '화학', category: '과학' },
    { name: '생명과학', category: '과학' },
    { name: '지구과학', category: '과학' },
    { name: '체육2', category: '체육' },
    { name: '정보', category: '기술·가정' },
  ],
  3: [
    { name: '심화국어', category: '국어' },
    { name: '미적분Ⅱ', category: '수학' },
    { name: '기하', category: '수학' },
    { name: '영어 독해와 작문', category: '영어' },
    { name: '심화영어', category: '영어' },
    { name: '세계사', category: '사회' },
    { name: '경제', category: '사회' },
    { name: '정치와 법', category: '사회' },
    { name: '물리학 실험', category: '과학' },
    { name: '화학 실험', category: '과학' },
    { name: '생명과학 실험', category: '과학' },
    { name: '인공지능 기초', category: '기술·가정' },
    { name: '체육3', category: '체육' },
  ],
}

export default function SubjectPicker({ onSelect }: SubjectPickerProps) {
  const [schoolType, setSchoolType] = useState<'middle' | 'high' | null>(null)
  const [grade, setGrade] = useState<number | null>(null)
  const [subject, setSubject] = useState<string | null>(null)

  const subjects = schoolType && grade
    ? (schoolType === 'middle' ? MIDDLE[grade] : HIGH[grade]) ?? []
    : []

  const grouped = subjects.reduce<Record<string, SubjectItem[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(s)
    return acc
  }, {})

  const handleSchoolType = (type: 'middle' | 'high') => {
    setSchoolType(type)
    setGrade(null)
    setSubject(null)
  }

  const handleGrade = (g: number) => {
    setGrade(g)
    setSubject(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* 학교급 */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">학교급</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'middle' as const, label: '중학교', icon: 'school' },
            { value: 'high' as const, label: '고등학교', icon: 'account_balance' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => handleSchoolType(s.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                schoolType === s.value
                  ? 'border-[#005394] bg-[#005394]/5 text-[#005394]'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-base">{s.icon}</span>
              {s.label}
              {schoolType === s.value && (
                <span className="ml-auto material-symbols-outlined text-sm text-[#005394]">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 학년 */}
      {schoolType && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">학년</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => handleGrade(g)}
                className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                  grade === g
                    ? 'border-[#005394] bg-[#005394] text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {g}학년
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 과목 */}
      {grade && subjects.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">과목 선택</p>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-slate-400 mb-1.5">{category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSubject(s.name)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        subject === s.name
                          ? 'border-[#005394] bg-[#005394] text-white shadow-sm'
                          : `${CATEGORY_COLORS[category] ?? 'bg-slate-50 border-slate-200 text-slate-600'} hover:brightness-95`
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 생성 버튼 */}
      <button
        onClick={() => {
          if (schoolType && grade && subject)
            onSelect({ schoolType, grade, subject })
        }}
        disabled={!schoolType || !grade || !subject}
        className="w-full py-3 bg-[#005394] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-base">auto_awesome</span>
        {subject ? `${subject} 수업 계획 생성` : '과목을 선택하세요'}
      </button>
    </div>
  )
}
