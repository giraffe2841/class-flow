'use client'

import { useEffect, useState, Suspense } from 'react'
import TopNav from '@/components/TopNav'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

interface Profile {
  full_name: string
  email: string
  school: string
  subject: string
  grade: string
}

const GRADE_OPTIONS = ['초등학교', '중학교', '고등학교', '대학교']
const SUBJECT_OPTIONS = ['국어', '영어', '수학', '과학', '사회', '역사', '도덕', '체육', '음악', '미술', '기술·가정', '정보', '기타']

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <><TopNav title="설정" /><div className="flex items-center justify-center flex-1 py-32"><span className="material-symbols-outlined text-[#005394] text-4xl">progress_activity</span></div></>
    }>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    school: '',
    subject: '',
    grade: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [notifications, setNotifications] = useState({
    progress_alert: true,
    schedule_remind: true,
    ai_complete: false,
  })
  const validTabs = ['profile', 'password', 'notification', 'danger'] as const
  type Tab = typeof validTabs[number]
  const initialTab = validTabs.find(t => t === searchParams.get('tab')) ?? 'profile'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const meta = user.user_metadata ?? {}
      setProfile({
        full_name: meta.full_name ?? '',
        email: user.email ?? '',
        school: meta.school ?? '',
        subject: meta.subject ?? '',
        grade: meta.grade ?? '',
      })
      if (meta.notifications) {
        setNotifications(meta.notifications)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile() {
    setSaving(true)
    setSaveSuccess(false)
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profile.full_name,
        school: profile.school,
        subject: profile.subject,
        grade: profile.grade,
      },
    })
    setSaving(false)
    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  async function handleSaveNotifications() {
    setSaving(true)
    await supabase.auth.updateUser({ data: { notifications } })
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleChangePassword() {
    setPwError('')
    setPwSuccess(false)
    if (pwForm.next !== pwForm.confirm) {
      setPwError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    if (pwForm.next.length < 8) {
      setPwError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    setPwSaving(false)
    if (error) {
      setPwError(error.message)
    } else {
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwSuccess(false), 3000)
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== '삭제') return
    setDeleting(true)
    // 계정 삭제는 서버 측 처리가 필요합니다 (supabase admin API)
    await fetch('/api/account/delete', { method: 'DELETE' })
    await supabase.auth.signOut()
    router.push('/')
  }

  const tabs = [
    { id: 'profile', label: '프로필', icon: 'person' },
    { id: 'password', label: '비밀번호', icon: 'lock' },
    { id: 'notification', label: '알림', icon: 'notifications' },
    { id: 'danger', label: '계정 관리', icon: 'warning' },
  ] as const

  if (loading) {
    return (
      <>
        <TopNav title="설정" />
        <div className="flex items-center justify-center flex-1 py-32">
          <span className="material-symbols-outlined animate-spin text-[#005394] text-4xl">progress_activity</span>
        </div>
      </>
    )
  }

  return (
    <>
      <TopNav title="설정" />
      <div className="p-4 lg:p-8 max-w-3xl mx-auto w-full">

        {/* 탭 */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              } ${tab.id === 'danger' && activeTab !== 'danger' ? 'hover:text-red-500' : ''}`}
            >
              <span className={`material-symbols-outlined text-base ${tab.id === 'danger' ? (activeTab === 'danger' ? 'text-red-500' : 'text-slate-400') : ''}`}>
                {tab.icon}
              </span>
              <span className={tab.id === 'danger' && activeTab === 'danger' ? 'text-red-600' : ''}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* 프로필 탭 */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-[#005394] flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name?.[0] ?? 'T'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{profile.full_name || '이름 없음'}</p>
                <p className="text-sm text-slate-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">이름</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="홍길동"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">학교명</label>
                <input
                  type="text"
                  value={profile.school}
                  onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  placeholder="예) 서울중학교"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">학교 급</label>
                <select
                  value={profile.grade}
                  onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30 transition-all bg-white"
                >
                  <option value="">선택하세요</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">담당 과목</label>
                <select
                  value={profile.subject}
                  onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30 transition-all bg-white"
                >
                  <option value="">선택하세요</option>
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#005394] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : saveSuccess ? (
                  <span className="material-symbols-outlined text-base">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-base">save</span>
                )}
                {saveSuccess ? '저장됨' : '저장'}
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 탭 */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">비밀번호 변경</h3>
              <p className="text-sm text-slate-500">보안을 위해 주기적으로 비밀번호를 변경해 주세요.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">새 비밀번호</label>
                <input
                  type="password"
                  value={pwForm.next}
                  onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                  placeholder="8자 이상"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="비밀번호 재입력"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005394]/30 transition-all"
                />
              </div>
            </div>

            {pwError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                <span className="material-symbols-outlined text-base">error</span>
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl">
                <span className="material-symbols-outlined text-base">check_circle</span>
                비밀번호가 변경되었습니다.
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !pwForm.next || !pwForm.confirm}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#005394] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
              >
                {pwSaving ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">lock_reset</span>
                )}
                비밀번호 변경
              </button>
            </div>
          </div>
        )}

        {/* 알림 탭 */}
        {activeTab === 'notification' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">알림 설정</h3>
              <p className="text-sm text-slate-500">수업 관련 알림을 개인화하세요.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'progress_alert' as const,
                  icon: 'warning',
                  label: '진도 지연 알림',
                  desc: '반 진도가 80% 미만으로 떨어질 때 알림',
                },
                {
                  key: 'schedule_remind' as const,
                  icon: 'event',
                  label: '학사 일정 알림',
                  desc: '중요 학사 일정 하루 전 알림',
                },
                {
                  key: 'ai_complete' as const,
                  icon: 'smart_toy',
                  label: 'AI 작업 완료 알림',
                  desc: 'AI 수업계획 생성 완료 시 알림',
                },
              ].map(({ key, icon, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#005394]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#005394] text-xl">{icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[key] ? 'bg-[#005394]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                        notifications[key] ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#005394] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : saveSuccess ? (
                  <span className="material-symbols-outlined text-base">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-base">save</span>
                )}
                {saveSuccess ? '저장됨' : '저장'}
              </button>
            </div>
          </div>
        )}

        {/* 계정 관리 탭 */}
        {activeTab === 'danger' && (
          <div className="space-y-4">
            {/* 로그아웃 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">로그아웃</p>
                  <p className="text-sm text-slate-500 mt-0.5">현재 기기에서 로그아웃합니다.</p>
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/')
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  로그아웃
                </button>
              </div>
            </div>

            {/* 계정 삭제 */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
                <p className="font-bold text-red-700">계정 삭제</p>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                계정을 삭제하면 모든 수업계획, 진도 기록, 자료가 <strong>영구적으로 삭제</strong>되며 복구할 수 없습니다.
              </p>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all"
                >
                  계정 삭제하기
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">
                    계속하려면 아래에 <strong className="text-red-600">삭제</strong>를 입력하세요.
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="삭제"
                    className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== '삭제' || deleting}
                      className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-base">delete_forever</span>
                      )}
                      영구 삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
// end SettingsContent
