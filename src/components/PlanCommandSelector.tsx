'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { School, GraduationCap, BookOpen, ChevronRight, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── 2022 개정 교육과정 과목 데이터 ──────────────────────────────────────────

interface Subject {
  name: string
  category: string
  type: 'required' | 'optional'
}

const MIDDLE_SUBJECTS: Record<number, Subject[]> = {
  1: [
    { name: '국어', category: '국어', type: 'required' },
    { name: '수학', category: '수학', type: 'required' },
    { name: '영어', category: '영어', type: 'required' },
    { name: '사회', category: '사회', type: 'required' },
    { name: '역사', category: '사회', type: 'required' },
    { name: '도덕', category: '사회', type: 'required' },
    { name: '과학', category: '과학', type: 'required' },
    { name: '기술·가정', category: '기술·가정', type: 'required' },
    { name: '정보', category: '기술·가정', type: 'required' },
    { name: '체육', category: '체육', type: 'required' },
    { name: '음악', category: '예술', type: 'required' },
    { name: '미술', category: '예술', type: 'required' },
    { name: '한문', category: '선택', type: 'optional' },
    { name: '생활외국어', category: '선택', type: 'optional' },
  ],
  2: [
    { name: '국어', category: '국어', type: 'required' },
    { name: '수학', category: '수학', type: 'required' },
    { name: '영어', category: '영어', type: 'required' },
    { name: '사회', category: '사회', type: 'required' },
    { name: '역사', category: '사회', type: 'required' },
    { name: '도덕', category: '사회', type: 'required' },
    { name: '과학', category: '과학', type: 'required' },
    { name: '기술·가정', category: '기술·가정', type: 'required' },
    { name: '정보', category: '기술·가정', type: 'required' },
    { name: '체육', category: '체육', type: 'required' },
    { name: '음악', category: '예술', type: 'required' },
    { name: '미술', category: '예술', type: 'required' },
    { name: '한문', category: '선택', type: 'optional' },
    { name: '생활외국어', category: '선택', type: 'optional' },
    { name: '환경', category: '선택', type: 'optional' },
  ],
  3: [
    { name: '국어', category: '국어', type: 'required' },
    { name: '수학', category: '수학', type: 'required' },
    { name: '영어', category: '영어', type: 'required' },
    { name: '사회', category: '사회', type: 'required' },
    { name: '역사', category: '사회', type: 'required' },
    { name: '도덕', category: '사회', type: 'required' },
    { name: '과학', category: '과학', type: 'required' },
    { name: '기술·가정', category: '기술·가정', type: 'required' },
    { name: '체육', category: '체육', type: 'required' },
    { name: '음악', category: '예술', type: 'required' },
    { name: '미술', category: '예술', type: 'required' },
    { name: '진로와 직업', category: '교양', type: 'required' },
    { name: '한문', category: '선택', type: 'optional' },
    { name: '생활외국어', category: '선택', type: 'optional' },
    { name: '보건', category: '선택', type: 'optional' },
  ],
}

// 2022 개정 고등학교 교육과정
const HIGH_SUBJECTS: Record<number, Subject[]> = {
  1: [
    // 공통과목
    { name: '공통국어1', category: '국어', type: 'required' },
    { name: '공통국어2', category: '국어', type: 'required' },
    { name: '공통수학1', category: '수학', type: 'required' },
    { name: '공통수학2', category: '수학', type: 'required' },
    { name: '공통영어1', category: '영어', type: 'required' },
    { name: '공통영어2', category: '영어', type: 'required' },
    { name: '한국사1', category: '사회', type: 'required' },
    { name: '한국사2', category: '사회', type: 'required' },
    { name: '통합사회1', category: '사회', type: 'required' },
    { name: '통합사회2', category: '사회', type: 'required' },
    { name: '통합과학1', category: '과학', type: 'required' },
    { name: '통합과학2', category: '과학', type: 'required' },
    { name: '과학탐구실험1', category: '과학', type: 'required' },
    { name: '과학탐구실험2', category: '과학', type: 'required' },
    { name: '체육', category: '체육', type: 'required' },
    { name: '음악', category: '예술', type: 'required' },
    { name: '미술', category: '예술', type: 'required' },
  ],
  2: [
    // 일반선택 과목
    { name: '화법과 언어', category: '국어', type: 'optional' },
    { name: '독서와 작문', category: '국어', type: 'optional' },
    { name: '문학', category: '국어', type: 'optional' },
    { name: '대수', category: '수학', type: 'optional' },
    { name: '미적분Ⅰ', category: '수학', type: 'optional' },
    { name: '확률과 통계', category: '수학', type: 'optional' },
    { name: '영어Ⅰ', category: '영어', type: 'optional' },
    { name: '영어Ⅱ', category: '영어', type: 'optional' },
    { name: '영어 독해와 작문', category: '영어', type: 'optional' },
    { name: '세계시민과 지리', category: '사회', type: 'optional' },
    { name: '세계사', category: '사회', type: 'optional' },
    { name: '사회와 문화', category: '사회', type: 'optional' },
    { name: '현대사회와 윤리', category: '사회', type: 'optional' },
    { name: '물리학', category: '과학', type: 'optional' },
    { name: '화학', category: '과학', type: 'optional' },
    { name: '생명과학', category: '과학', type: 'optional' },
    { name: '지구과학', category: '과학', type: 'optional' },
    { name: '운동과 건강', category: '체육', type: 'optional' },
    { name: '음악', category: '예술', type: 'optional' },
    { name: '미술', category: '예술', type: 'optional' },
    { name: '연극', category: '예술', type: 'optional' },
    { name: '기술·가정', category: '기술·가정', type: 'optional' },
    { name: '정보', category: '기술·가정', type: 'optional' },
  ],
  3: [
    // 진로선택 과목
    { name: '주제탐구 독서', category: '국어', type: 'optional' },
    { name: '문학과 영상', category: '국어', type: 'optional' },
    { name: '직무 의사소통', category: '국어', type: 'optional' },
    { name: '미적분Ⅱ', category: '수학', type: 'optional' },
    { name: '기하', category: '수학', type: 'optional' },
    { name: '경제 수학', category: '수학', type: 'optional' },
    { name: '인공지능 수학', category: '수학', type: 'optional' },
    { name: '직무 수학', category: '수학', type: 'optional' },
    { name: '심화 영어', category: '영어', type: 'optional' },
    { name: '영어 발표와 토론', category: '영어', type: 'optional' },
    { name: '영미 문학 읽기', category: '영어', type: 'optional' },
    { name: '한국지리 탐구', category: '사회', type: 'optional' },
    { name: '동아시아 역사 기행', category: '사회', type: 'optional' },
    { name: '정치', category: '사회', type: 'optional' },
    { name: '법과 사회', category: '사회', type: 'optional' },
    { name: '경제', category: '사회', type: 'optional' },
    { name: '윤리와 사상', category: '사회', type: 'optional' },
    { name: '역학과 에너지', category: '과학', type: 'optional' },
    { name: '전자기와 양자', category: '과학', type: 'optional' },
    { name: '물질과 에너지', category: '과학', type: 'optional' },
    { name: '화학 반응의 세계', category: '과학', type: 'optional' },
    { name: '세포와 물질대사', category: '과학', type: 'optional' },
    { name: '생물의 진화와 다양성', category: '과학', type: 'optional' },
    { name: '행성우주과학', category: '과학', type: 'optional' },
    { name: '지구시스템과학', category: '과학', type: 'optional' },
    { name: '스포츠 생활1', category: '체육', type: 'optional' },
    { name: '스포츠 생활2', category: '체육', type: 'optional' },
    { name: '음악 연주와 창작', category: '예술', type: 'optional' },
    { name: '미술 창작', category: '예술', type: 'optional' },
    { name: '창의 공학 설계', category: '기술·가정', type: 'optional' },
    { name: '인공지능 기초', category: '기술·가정', type: 'optional' },
    { name: '데이터 과학', category: '기술·가정', type: 'optional' },
    { name: '지식 재산 일반', category: '기술·가정', type: 'optional' },
  ],
}

// ─── 카테고리 색상 ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  국어:     { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-400' },
  수학:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400' },
  영어:     { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-400' },
  사회:     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400' },
  역사:     { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400' },
  과학:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  체육:     { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400' },
  예술:     { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200',    dot: 'bg-pink-400' },
  '기술·가정': { bg: 'bg-cyan-50', text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-400' },
  교양:     { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400' },
  선택:     { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-400' },
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' }
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PlanSelection {
  schoolType: 'middle' | 'high'
  grade: number
  subject: string
}

interface PlanCommandSelectorProps {
  onComplete: (selection: PlanSelection) => void
  onCancel: () => void
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function PlanCommandSelector({ onComplete, onCancel }: PlanCommandSelectorProps) {
  const [schoolType, setSchoolType] = useState<'middle' | 'high' | null>(null)
  const [grade, setGrade] = useState<number | null>(null)
  const [subject, setSubject] = useState<string | null>(null)

  const subjectList = schoolType && grade
    ? (schoolType === 'middle' ? MIDDLE_SUBJECTS[grade] : HIGH_SUBJECTS[grade]) ?? []
    : []

  const grouped = subjectList.reduce<Record<string, Subject[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(s)
    return acc
  }, {})

  const step = !schoolType ? 0 : !grade ? 1 : 2

  const handleSubjectSelect = (name: string) => {
    setSubject(name)
    onComplete({
      schoolType: schoolType!,
      grade: grade!,
      subject: name,
    })
  }

  return (
    <motion.div
      className="w-full max-w-lg bg-white rounded-2xl border border-[#e1e2e8] shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#005394] text-white">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-semibold">수업계획 생성</span>
          <span className="text-xs text-white/60">2022 개정 교육과정</span>
        </div>
        <button
          onClick={onCancel}
          className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 진행 표시 */}
      <div className="flex items-center px-4 py-2.5 bg-[#f2f3fa] border-b border-[#e1e2e8] gap-2">
        {[
          { label: '학교급', done: !!schoolType },
          { label: '학년', done: !!grade },
          { label: '과목', done: !!subject },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-[#c1c7d2]" />}
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              s.done
                ? 'bg-[#005394] text-white'
                : i === step
                  ? 'bg-[#d3e4ff] text-[#004881]'
                  : 'text-[#c1c7d2]'
            )}>
              {s.done && <Check className="w-2.5 h-2.5" />}
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* Step 0: 학교급 선택 */}
        <div>
          <p className="text-xs font-bold text-[#727782] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <School className="w-3 h-3" />
            학교급
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { value: 'middle' as const, label: '중학교', sub: '1~3학년 · 공통 교과' },
              { value: 'high' as const, label: '고등학교', sub: '1학년 공통 · 2~3학년 선택' },
            ].map((item) => (
              <motion.button
                key={item.value}
                onClick={() => { setSchoolType(item.value); setGrade(null); setSubject(null) }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex flex-col items-start gap-0.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all',
                  schoolType === item.value
                    ? 'border-[#005394] bg-[#d3e4ff] text-[#004881]'
                    : 'border-[#e1e2e8] bg-[#f8f9ff] text-[#414750] hover:border-[#a2c9ff] hover:bg-[#eef3ff]'
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-bold">{item.label}</span>
                  {schoolType === item.value && (
                    <Check className="w-3.5 h-3.5 ml-auto text-[#005394]" />
                  )}
                </div>
                <span className="text-[11px] text-current opacity-60 ml-6">{item.sub}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Step 1: 학년 선택 */}
        <AnimatePresence>
          {schoolType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs font-bold text-[#727782] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <School className="w-3 h-3" />
                학년
              </p>
              <div className="flex gap-2">
                {[1, 2, 3].map((g) => (
                  <motion.button
                    key={g}
                    onClick={() => { setGrade(g); setSubject(null) }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all',
                      grade === g
                        ? 'border-[#005394] bg-[#005394] text-white shadow-sm shadow-[#005394]/30'
                        : 'border-[#e1e2e8] bg-[#f8f9ff] text-[#414750] hover:border-[#a2c9ff] hover:bg-[#eef3ff]'
                    )}
                  >
                    {g}학년
                  </motion.button>
                ))}
              </div>
              {schoolType === 'high' && grade && (
                <p className="text-[11px] text-[#727782] mt-1.5 pl-1">
                  {grade === 1 ? '공통과목' : grade === 2 ? '일반선택 과목' : '진로선택 과목'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: 과목 선택 */}
        <AnimatePresence>
          {schoolType && grade && subjectList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-bold text-[#727782] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                과목 선택
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-0.5">
                {Object.entries(grouped).map(([category, items]) => {
                  const color = getCategoryColor(category)
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={cn('w-2 h-2 rounded-full', color.dot)} />
                        <span className="text-[10px] font-bold text-[#727782] uppercase tracking-wider">{category}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((s) => (
                          <motion.button
                            key={s.name}
                            onClick={() => handleSubjectSelect(s.name)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                              color.bg, color.text, color.border,
                              'hover:brightness-95 active:scale-95',
                              subject === s.name && 'ring-2 ring-[#005394] ring-offset-1'
                            )}
                          >
                            {s.name}
                            {s.type === 'optional' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/70 text-purple-600">선택</span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}
