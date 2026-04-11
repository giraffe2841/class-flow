'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import TopNav from '@/components/TopNav'
import UpgradeModal from '@/components/UpgradeModal'
import { createClient } from '@/lib/supabase/client'
import { canUploadMaterial } from '@/lib/plan'
import type { Plan } from '@/lib/constants'
import SubjectPicker from '@/components/SubjectPicker'

interface Unit {
  id: string
  title: string
  subject_name: string
}

interface Material {
  id: string
  name: string | null
  type: string | null
  file_url: string
  ai_summary: string | null
  tags: string[] | null
  created_at: string
  units: { title: string; subjects: { name: string } } | null
}

interface LessonPlan {
  objectives: string[]
  intro: string
  main: string
  wrap: string
  homework: string | null
  tips: string
}

interface ScheduleSession {
  number: number
  title: string
  objectives: string[]
  activities: string[]
  duration: number
}

interface Schedule {
  title: string
  overview: string
  sessions: ScheduleSession[]
}

function getScheduleOverview(aiSummary: string | null): string | null {
  if (!aiSummary) return null
  try {
    const data = JSON.parse(aiSummary)
    return data.overview ?? aiSummary
  } catch {
    return aiSummary
  }
}

function parseScheduleSessions(aiSummary: string | null): ScheduleSession[] | null {
  if (!aiSummary) return null
  try {
    const data = JSON.parse(aiSummary)
    return Array.isArray(data.sessions) ? data.sessions : null
  } catch {
    return null
  }
}

function guessIcon(name: string) {
  if (name?.endsWith('.pdf')) return 'picture_as_pdf'
  if (name?.endsWith('.ppt') || name?.endsWith('.pptx')) return 'slideshow'
  if (name?.endsWith('.doc') || name?.endsWith('.docx')) return 'description'
  if (name?.endsWith('.txt')) return 'article'
  return 'attachment'
}

function guessTypeFromMime(mime: string): string {
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return '슬라이드'
  if (mime.includes('word') || mime.includes('msword')) return '문서'
  if (mime.startsWith('image/')) return '이미지'
  return '기타'
}

function formatScheduleAsText(
  schedule: Schedule,
  materialName: string | null,
  subjectInfo?: { schoolType: 'middle' | 'high'; grade: number; subject: string }
): string {
  const schoolLabel = subjectInfo
    ? `${subjectInfo.schoolType === 'middle' ? '중학교' : '고등학교'} ${subjectInfo.grade}학년 ${subjectInfo.subject}`
    : ''
  const lines: string[] = [
    `# ${schedule.title}`,
    '',
    ...(schoolLabel ? [`대상: ${schoolLabel}`, ''] : []),
    ...(materialName ? [`학습지: ${materialName}`, ''] : []),
    `## 전체 개요`,
    schedule.overview,
    '',
    `## 차시별 진도 계획`,
    '',
  ]
  for (const s of schedule.sessions) {
    lines.push(`### ${s.number}차시: ${s.title} (${s.duration}분)`)
    lines.push('')
    lines.push('**학습 목표**')
    for (const obj of s.objectives) lines.push(`- ${obj}`)
    lines.push('')
    lines.push('**주요 활동**')
    for (const act of s.activities) lines.push(`- ${act}`)
    lines.push('')
  }
  return lines.join('\n')
}

export default function MaterialsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [plan, setPlan] = useState<Plan>('free')
  const [units, setUnits] = useState<Unit[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>('전체')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzingFile, setAnalyzingFile] = useState<string | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [userId, setUserId] = useState<string>('')

  // 수업 계획 모달
  const [planModal, setPlanModal] = useState<{
    material: Material
    subjectInfo?: { schoolType: 'middle' | 'high'; grade: number; subject: string }
    plan?: LessonPlan
  } | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  // 진도 생성 모달
  const [scheduleModal, setScheduleModal] = useState<{
    material: Material
    subjectInfo?: { schoolType: 'middle' | 'high'; grade: number; subject: string }
    sessionCount: number
    schedule?: Schedule
  } | null>(null)
  const [generatingSchedule, setGeneratingSchedule] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [addingToPlan, setAddingToPlan] = useState(false)
  const [addedToPlan, setAddedToPlan] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single()
      if (sub) setPlan(sub.plan as Plan)

      const { data: unitData } = await supabase
        .from('units')
        .select('id, title, subjects!inner(name)')
        .order('order')
      if (unitData) {
        setUnits(
          unitData.map((u: { id: string; title: string; subjects: { name: string } | { name: string }[] }) => ({
            id: u.id,
            title: u.title,
            subject_name: Array.isArray(u.subjects) ? u.subjects[0]?.name : u.subjects?.name,
          }))
        )
      }

      await fetchMaterials()
    }
    load()
  }, [])

  const fetchMaterials = useCallback(async () => {
    const { data } = await supabase
      .from('materials')
      .select('id, name, type, file_url, ai_summary, tags, created_at, units(title, subjects(name))')
      .order('created_at', { ascending: false })
    if (data) setMaterials(data as unknown as Material[])
  }, [supabase])

  // 생성된 진도 계획을 학습자료로 저장
  async function saveScheduleAsMaterial(
    schedule: Schedule,
    originalMaterial: Material,
    subjectInfo?: { schoolType: 'middle' | 'high'; grade: number; subject: string }
  ) {
    const text = formatScheduleAsText(schedule, originalMaterial.name, subjectInfo)
    const blob = new Blob([text], { type: 'text/plain; charset=utf-8' })
    const safeName = (originalMaterial.name ?? '자료').replace(/\.[^.]+$/, '')
    const fileName = `진도계획_${safeName}.txt`
    const path = `${userId}/schedules/${Date.now()}_${fileName}`

    const { error: uploadError } = await supabase.storage.from('materials').upload(path, blob)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('materials').getPublicUrl(path)

    const sessionTag = schedule.sessions.length > 0 ? [`${schedule.sessions.length}차시`] : []
    await supabase.from('materials').insert({
      user_id: userId,
      name: fileName,
      type: '진도계획',
      file_url: urlData.publicUrl,
      // overview + sessions를 JSON으로 저장 → 카드에서 "수업계획 추가" 시 sessions 재사용
      ai_summary: JSON.stringify({ overview: schedule.overview, sessions: schedule.sessions }),
      tags: ['AI생성', '진도계획', ...sessionTag],
    })

    await fetchMaterials()
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    if (!canUploadMaterial(plan, materials.length)) {
      setUpgradeOpen(true)
      return
    }

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const path = `${userId}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('materials')
          .getPublicUrl(path)

        const { data: inserted, error: insertError } = await supabase
          .from('materials')
          .insert({
            user_id: userId,
            name: file.name,
            type: guessTypeFromMime(file.type),
            file_url: urlData.publicUrl,
          })
          .select('id')
          .single()
        if (insertError) throw insertError

        if (inserted && units.length > 0 && plan !== 'free') {
          // AI 분석: 단원 분류 + 요약 + 태그
          setAnalyzingFile(file.name)
          let analysis: { unit?: string; summary?: string; tags?: string[] } = {}
          try {
            const res = await fetch('/api/ai/analyze-material', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileUrl: urlData.publicUrl,
                fileName: file.name,
                fileType: file.type,
                units: units.map(u => u.title),
              }),
            })
            if (res.ok) {
              analysis = await res.json()
              const matchedUnit = units.find(u => u.title === analysis.unit)
              await supabase.from('materials').update({
                ...(matchedUnit ? { unit_id: matchedUnit.id } : {}),
                ai_summary: analysis.summary ?? null,
                tags: analysis.tags ?? null,
              }).eq('id', inserted.id)
            }
          } catch {
            // AI 분석 실패해도 업로드는 유지
          }

          // AI 진도 자동 생성 및 학습자료 저장
          try {
            setAnalyzingFile(`${file.name} (진도 생성 중...)`)
            const schedRes = await fetch('/api/ai/generate-schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                summary: analysis.summary,
                unit: analysis.unit,
                tags: analysis.tags,
                sessions: 5,
              }),
            })
            if (schedRes.ok) {
              const schedule: Schedule = await schedRes.json()
              const fakeMaterial: Material = {
                id: inserted.id,
                name: file.name,
                type: guessTypeFromMime(file.type),
                file_url: urlData.publicUrl,
                ai_summary: analysis.summary ?? null,
                tags: analysis.tags ?? null,
                created_at: new Date().toISOString(),
                units: null,
              }
              await saveScheduleAsMaterial(schedule, fakeMaterial)
            }
          } catch {
            // 진도 자동 생성 실패는 무시
          } finally {
            setAnalyzingFile(null)
          }
        } else if (inserted && units.length > 0 && plan === 'free') {
          // 무료 플랜: 파일명 기반 단원 매칭
          const lowerName = file.name.toLowerCase()
          const matchedUnit = units.find(u =>
            lowerName.includes(u.title.toLowerCase()) ||
            lowerName.includes(u.subject_name?.toLowerCase() ?? '')
          )
          if (matchedUnit) {
            await supabase.from('materials').update({ unit_id: matchedUnit.id }).eq('id', inserted.id)
          }
        }
      }
      await fetchMaterials()
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
      setAnalyzingFile(null)
    }
  }

  // 수업 계획 생성
  function handleOpenPlanModal(material: Material) {
    if (plan === 'free') { setUpgradeOpen(true); return }
    setPlanModal({ material })
  }

  async function handleGeneratePlan(
    material: Material,
    subjectInfo: { schoolType: 'middle' | 'high'; grade: number; subject: string }
  ) {
    setPlanModal({ material, subjectInfo })
    setGeneratingPlan(true)
    try {
      const unitTitle = Array.isArray(material.units) ? material.units[0]?.title : material.units?.title
      const res = await fetch('/api/ai/lesson-plan-from-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: material.name,
          summary: material.ai_summary,
          unit: unitTitle,
          tags: material.tags,
          schoolType: subjectInfo.schoolType === 'middle' ? '중학교' : '고등학교',
          grade: subjectInfo.grade,
          subject: subjectInfo.subject,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlanModal(prev => prev ? { ...prev, plan: data } : null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '계획 생성 중 오류가 발생했습니다')
      setPlanModal(null)
    } finally {
      setGeneratingPlan(false)
    }
  }

  // 진도 생성
  function handleOpenScheduleModal(material: Material) {
    if (plan === 'free') { setUpgradeOpen(true); return }
    setScheduleModal({ material, sessionCount: 5 })
  }

  async function handleGenerateSchedule(
    material: Material,
    subjectInfo: { schoolType: 'middle' | 'high'; grade: number; subject: string }
  ) {
    const sessionCount = scheduleModal?.sessionCount ?? 5
    setScheduleModal(prev => prev ? { ...prev, subjectInfo } : null)
    setGeneratingSchedule(true)
    try {
      const unitTitle = Array.isArray(material.units) ? material.units[0]?.title : material.units?.title
      const res = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: material.name,
          summary: material.ai_summary,
          unit: unitTitle,
          tags: material.tags,
          schoolType: subjectInfo.schoolType === 'middle' ? '중학교' : '고등학교',
          grade: subjectInfo.grade,
          subject: subjectInfo.subject,
          sessions: sessionCount,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScheduleModal(prev => prev ? { ...prev, schedule: data, subjectInfo } : null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '진도 생성 중 오류가 발생했습니다')
      setScheduleModal(null)
    } finally {
      setGeneratingSchedule(false)
    }
  }

  async function handleSaveSchedule() {
    if (!scheduleModal?.schedule || !scheduleModal.material) return
    setSavingSchedule(true)
    try {
      await saveScheduleAsMaterial(
        scheduleModal.schedule,
        scheduleModal.material,
        scheduleModal.subjectInfo
      )
      setScheduleModal(null)
      alert('진도 계획이 학습자료로 저장되었습니다!')
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다')
    } finally {
      setSavingSchedule(false)
    }
  }

  // schedule + subjectInfo → subjects/units/lessons 생성 → 대시보드에 노출
  async function handleAddToPlan(
    schedule: Schedule,
    subjectInfo?: { schoolType: 'middle' | 'high'; grade: number; subject: string }
  ) {
    setAddingToPlan(true)
    try {
      const year = new Date().getFullYear()
      const subjectName = subjectInfo
        ? `${subjectInfo.schoolType === 'middle' ? '중학교' : '고등학교'} ${subjectInfo.grade}학년 ${subjectInfo.subject}`
        : schedule.title

      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .insert({ user_id: userId, name: subjectName, year })
        .select('id')
        .single()
      if (subjectError) throw subjectError

      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .insert({ subject_id: subjectData.id, order: 1, title: schedule.title })
        .select('id')
        .single()
      if (unitError) throw unitError

      if (schedule.sessions.length > 0) {
        const { error: lessonsError } = await supabase.from('lessons').insert(
          schedule.sessions.map((s, i) => ({
            unit_id: unitData.id,
            order: i + 1,
            title: `${s.number}차시: ${s.title}`,
          }))
        )
        if (lessonsError) throw lessonsError
      }

      setAddedToPlan(true)
      setTimeout(() => setAddedToPlan(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : '수업계획 추가 중 오류가 발생했습니다')
    } finally {
      setAddingToPlan(false)
    }
  }

  async function handleDelete(id: string, fileUrl: string) {
    if (!confirm('이 자료를 삭제하시겠습니까?')) return
    const path = fileUrl.split('/materials/')[1]
    if (path) {
      await supabase.storage.from('materials').remove([path])
    }
    await supabase.from('materials').delete().eq('id', id)
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

  async function handleDownload(fileUrl: string, name: string | null) {
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = name ?? 'file'
    a.target = '_blank'
    a.click()
  }

  const filtered =
    selectedUnit === '전체'
      ? materials
      : materials.filter(m => {
          const unitTitle = Array.isArray(m.units) ? m.units[0]?.title : m.units?.title
          return unitTitle === selectedUnit
        })

  const uploadLimit = plan === 'free' ? 3 : plan === 'pro' ? 50 : Infinity

  return (
    <>
      <TopNav title="학습자료 관리" />

      {/* 대시보드 추가 완료 토스트 */}
      {addedToPlan && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          수업계획이 대시보드에 추가됐습니다!
          <a href="/dashboard" className="underline ml-1 text-white/80 hover:text-white">바로가기</a>
        </div>
      )}

      <div className="p-8 space-y-6">

        {/* 헤더 */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">학습자료 관리</h2>
            <p className="text-sm text-slate-500 mt-1">
              {plan === 'free'
                ? `무료 플랜: ${materials.length}/${uploadLimit}개 사용`
                : '학습지를 업로드하면 AI가 자동으로 진도를 생성합니다'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-3 bg-[#005394] text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              {uploading ? '업로드 중...' : '자료 업로드'}
            </button>
            {analyzingFile && (
              <p className="text-xs text-[#005394] flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI 분석 중: {analyzingFile}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {/* 무료 플랜 안내 */}
        {plan === 'free' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500">info</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">무료 플랜: 학습지 {uploadLimit}개까지 업로드 가능</p>
              <p className="text-xs text-amber-600">프로 플랜에서 AI 진도 자동 생성 기능을 사용할 수 있습니다</p>
            </div>
            <button onClick={() => setUpgradeOpen(true)} className="text-xs font-bold text-[#005394] hover:underline">
              업그레이드
            </button>
          </div>
        )}

        {/* Pro 이상: AI 자동 진도 생성 안내 */}
        {plan !== 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#005394]">auto_awesome</span>
            <p className="text-sm text-blue-800">
              학습지를 업로드하면 AI가 <strong>5차시 진도 계획</strong>을 자동으로 생성해 학습자료에 저장합니다.
              각 자료의 <strong>진도 생성</strong> 버튼으로 맞춤 진도를 만들 수도 있습니다.
            </p>
          </div>
        )}

        {/* 드래그 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-[#005394] bg-blue-50' : 'border-slate-200 bg-slate-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">cloud_upload</span>
          <p className="text-sm font-semibold text-slate-500">PDF, PPT, Word, 이미지를 드래그하거나</p>
          <span className="mt-2 text-sm text-[#005394] font-bold">파일 선택</span>
        </div>

        {/* 단원 필터 */}
        {units.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {['전체', ...units.map(u => u.title)].map(label => (
              <button
                key={label}
                onClick={() => setSelectedUnit(label)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedUnit === label
                    ? 'bg-[#005394] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#005394]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* 자료 목록 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(material => {
              const unitTitle = Array.isArray(material.units) ? material.units[0]?.title : material.units?.title
              const isSchedule = material.type === '진도계획'
              return (
                <div
                  key={material.id}
                  className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                    isSchedule ? 'border-l-4 border-[#005394]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSchedule ? 'bg-blue-100' : 'bg-blue-50'
                    }`}>
                      <span className="material-symbols-outlined text-[#005394]">
                        {isSchedule ? 'timeline' : guessIcon(material.name ?? '')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{material.name ?? '(이름 없음)'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isSchedule && (
                          <span className="text-xs bg-blue-100 text-[#005394] font-semibold px-1.5 py-0.5 rounded">AI 진도</span>
                        )}
                        <p className="text-xs text-slate-400">
                          {new Date(material.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {unitTitle && <p className="text-xs text-slate-500 mb-2">{unitTitle}</p>}

                  {material.ai_summary && (
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-2 line-clamp-2">
                      {getScheduleOverview(material.ai_summary)}
                    </p>
                  )}

                  {material.tags && material.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {material.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* 진도계획 카드: 수업계획 추가 버튼 */}
                  {isSchedule && (() => {
                    const sessions = parseScheduleSessions(material.ai_summary)
                    if (!sessions) return null
                    const fakeSchedule: Schedule = {
                      title: material.name?.replace(/^진도계획_/, '').replace(/\.txt$/, '') ?? '진도 계획',
                      overview: getScheduleOverview(material.ai_summary) ?? '',
                      sessions,
                    }
                    return (
                      <button
                        onClick={() => handleAddToPlan(fakeSchedule)}
                        disabled={addingToPlan}
                        className="w-full mb-2 py-2 bg-[#005394] text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        {addingToPlan ? '추가 중...' : '수업계획에 추가 → 대시보드'}
                      </button>
                    )
                  })()}

                  <div className="flex gap-1.5 pt-3 border-t border-slate-100">
                    {!isSchedule && (
                      <>
                        <button
                          onClick={() => handleOpenScheduleModal(material)}
                          className="flex-1 text-xs text-[#005394] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 font-semibold rounded-lg py-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">timeline</span>
                          진도 생성
                        </button>
                        <button
                          onClick={() => handleOpenPlanModal(material)}
                          className="flex-1 text-xs text-slate-500 hover:text-[#005394] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 rounded-lg py-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">auto_awesome</span>
                          수업 계획
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDownload(material.file_url, material.name)}
                      className="flex-1 text-xs text-slate-500 hover:text-[#005394] transition-colors flex items-center justify-center gap-1 rounded-lg py-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      다운로드
                    </button>
                    <button
                      onClick={() => handleDelete(material.id, material.file_url)}
                      className="flex-1 text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-1 rounded-lg py-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl block mb-2">folder_open</span>
            <p className="font-semibold">
              {selectedUnit === '전체' ? '업로드된 자료가 없습니다' : '이 단원에 자료가 없습니다'}
            </p>
            <p className="text-sm mt-1">자료를 업로드해보세요</p>
          </div>
        )}
      </div>

      {/* 수업 계획 모달 */}
      {planModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005394]">auto_awesome</span>
                  {planModal.subjectInfo ? 'AI 수업 계획' : '과목 선택'}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {planModal.subjectInfo
                    ? `${planModal.subjectInfo.schoolType === 'middle' ? '중학교' : '고등학교'} ${planModal.subjectInfo.grade}학년 · ${planModal.subjectInfo.subject}`
                    : planModal.material.name ?? ''}
                </p>
              </div>
              <button onClick={() => setPlanModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {!planModal.subjectInfo && !generatingPlan && (
              <SubjectPicker onSelect={(info) => handleGeneratePlan(planModal.material, info)} />
            )}

            {generatingPlan ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-5xl text-[#005394] animate-spin mb-4">refresh</span>
                <p className="text-slate-600 font-semibold">수업 계획 생성 중...</p>
              </div>
            ) : planModal.plan ? (
              <div className="p-6 space-y-5">
                <section>
                  <h4 className="text-sm font-bold text-[#005394] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">target</span> 수업 목표
                  </h4>
                  <ul className="space-y-1.5">
                    {planModal.plan.objectives.map((obj, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-[#005394] font-bold shrink-0">{i + 1}.</span> {obj}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-sm font-bold text-[#005394] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">menu_book</span> 수업 흐름
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 mb-1">도입 (5-10분)</p>
                      <p className="text-sm text-slate-700">{planModal.plan.intro}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-[#005394] mb-1">전개 (25-30분)</p>
                      <p className="text-sm text-slate-700">{planModal.plan.main}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 mb-1">정리 (5-10분)</p>
                      <p className="text-sm text-slate-700">{planModal.plan.wrap}</p>
                    </div>
                  </div>
                </section>
                {planModal.plan.homework && (
                  <section>
                    <h4 className="text-sm font-bold text-[#005394] mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">assignment</span> 과제
                    </h4>
                    <p className="text-sm text-slate-700 bg-amber-50 rounded-xl p-4">{planModal.plan.homework}</p>
                  </section>
                )}
                {planModal.plan.tips && (
                  <section>
                    <h4 className="text-sm font-bold text-[#005394] mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">lightbulb</span> 수업 팁
                    </h4>
                    <p className="text-sm text-slate-700 bg-green-50 rounded-xl p-4">{planModal.plan.tips}</p>
                  </section>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPlanModal(prev => prev ? { material: prev.material } : null)}
                    className="flex-1 py-2.5 border border-[#005394] text-[#005394] rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span> 다시 생성
                  </button>
                  <button
                    onClick={() => setPlanModal(null)}
                    className="flex-1 py-2.5 bg-[#005394] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 진도 생성 모달 */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005394]">timeline</span>
                  AI 진도 계획 생성
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {scheduleModal.subjectInfo
                    ? `${scheduleModal.subjectInfo.schoolType === 'middle' ? '중학교' : '고등학교'} ${scheduleModal.subjectInfo.grade}학년 · ${scheduleModal.subjectInfo.subject} · ${scheduleModal.sessionCount}차시`
                    : scheduleModal.material.name ?? ''}
                </p>
              </div>
              <button onClick={() => setScheduleModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 과목 선택 + 차시 수 */}
            {!scheduleModal.subjectInfo && !generatingSchedule && (
              <div>
                {/* 차시 수 선택 */}
                <div className="px-6 pt-5 pb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">총 차시 수</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={2}
                      max={20}
                      value={scheduleModal.sessionCount}
                      onChange={e => setScheduleModal(prev => prev ? { ...prev, sessionCount: Number(e.target.value) } : null)}
                      className="flex-1 accent-[#005394]"
                    />
                    <span className="text-2xl font-bold text-[#005394] w-16 text-center">
                      {scheduleModal.sessionCount}차시
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">각 차시는 45분 기준입니다</p>
                </div>
                <SubjectPicker
                  onSelect={(info) => handleGenerateSchedule(scheduleModal.material, info)}
                />
              </div>
            )}

            {generatingSchedule && (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-5xl text-[#005394] animate-spin mb-4">refresh</span>
                <p className="text-slate-600 font-semibold">
                  {scheduleModal.sessionCount}차시 진도 계획 생성 중...
                </p>
                <p className="text-xs text-slate-400 mt-1">AI가 학습지를 분석하고 있습니다</p>
              </div>
            )}

            {!generatingSchedule && scheduleModal.schedule && (
              <div className="p-6 space-y-5">
                {/* 개요 */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-[#005394] mb-1">{scheduleModal.schedule.title}</h4>
                  <p className="text-sm text-slate-700">{scheduleModal.schedule.overview}</p>
                </div>

                {/* 차시별 */}
                <div className="space-y-3">
                  {scheduleModal.schedule.sessions.map(s => (
                    <div key={s.number} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-full bg-[#005394] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {s.number}
                        </span>
                        <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                        <span className="ml-auto text-xs text-slate-400">{s.duration}분</span>
                      </div>
                      {s.objectives.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-slate-400 mb-1">학습 목표</p>
                          <ul className="space-y-0.5">
                            {s.objectives.map((obj, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <span className="text-[#005394] shrink-0">·</span>{obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {s.activities.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-1">주요 활동</p>
                          <ul className="space-y-0.5">
                            {s.activities.map((act, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <span className="text-emerald-500 shrink-0">✓</span>{act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="pt-2 sticky bottom-0 bg-white pb-1 space-y-2">
                  {/* 대시보드에 추가 — 메인 액션 */}
                  <button
                    onClick={() => handleAddToPlan(scheduleModal.schedule!, scheduleModal.subjectInfo)}
                    disabled={addingToPlan}
                    className="w-full py-3 bg-[#005394] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    {addingToPlan ? '추가 중...' : '수업계획에 추가 → 대시보드에 표시'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScheduleModal(prev => prev ? { material: prev.material, sessionCount: prev.sessionCount } : null)}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">refresh</span>
                      다시 생성
                    </button>
                    <button
                      onClick={handleSaveSchedule}
                      disabled={savingSchedule}
                      className="flex-1 py-2.5 border border-[#005394] text-[#005394] rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">save</span>
                      {savingSchedule ? '저장 중...' : '학습자료로만 저장'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={`학습지 업로드 (무료: ${uploadLimit}개 한도 초과)`}
      />
    </>
  )
}
