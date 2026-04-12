import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { canUseAiChat, canUseAiTokens } from '@/lib/plan'
import type { Plan } from '@/lib/constants'

const LESSON_PLAN_SYSTEM = `당신은 대한민국 초·중·고등학교 선생님의 수업 계획을 전문적으로 작성하는 AI입니다.
업로드된 학습 자료(학습지, PDF, Word 문서 등)를 분석하여 체계적이고 실용적인 수업 계획을 작성하세요.
항상 한국어로 작성하고, 교육 현장에서 바로 활용할 수 있도록 구체적으로 작성하세요.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, ai_tokens_used, ai_tokens_reset_at')
    .eq('user_id', user.id)
    .single()

  const plan = (sub?.plan ?? 'free') as Plan

  if (!canUseAiChat(plan)) {
    return NextResponse.json({
      error: '수업계획 AI 생성은 프로 플랜 이상에서 사용 가능합니다',
      upgrade: true,
    }, { status: 403 })
  }

  const resetAt = sub?.ai_tokens_reset_at ? new Date(sub.ai_tokens_reset_at) : new Date()
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  let currentTokensUsed = sub?.ai_tokens_used ?? 0

  if (resetAt < currentMonthStart) {
    await supabase
      .from('subscriptions')
      .update({ ai_tokens_used: 0, ai_tokens_reset_at: currentMonthStart.toISOString() })
      .eq('user_id', user.id)
    currentTokensUsed = 0
  }

  if (!canUseAiTokens(plan, currentTokensUsed)) {
    return NextResponse.json({
      error: '이번 달 AI 토큰 한도를 초과했습니다.',
      tokenExhausted: true,
    }, { status: 429 })
  }

  const { fileText, fileName, subject, grade, totalSessions } = await req.json()

  const prompt = `다음 학습 자료를 분석하여 수업 계획을 작성해주세요.

파일명: ${fileName ?? '(알 수 없음)'}
교과목: ${subject ?? '(미지정)'}
학년: ${grade ?? '(미지정)'}
총 수업 차시: ${totalSessions ?? 4}차시

${fileText ? `학습 자료 내용:\n${fileText.slice(0, 4000)}` : '(파일 내용 없음 — 파일명과 교과목 정보로 추론)'}

다음 형식으로 JSON을 반환하세요:
{
  "title": "수업 제목",
  "subject": "교과목",
  "grade": "학년",
  "totalSessions": 차시수,
  "objectives": ["학습목표1", "학습목표2", "학습목표3"],
  "overview": "수업 개요 (2-3문장)",
  "sessions": [
    {
      "session": 1,
      "title": "차시 제목",
      "duration": "45분",
      "activities": ["활동1", "활동2"],
      "materials": ["준비물1", "준비물2"],
      "assessment": "평가 방법"
    }
  ],
  "notes": "선생님을 위한 추가 노트"
}`

  const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: LESSON_PLAN_SYSTEM },
      { role: 'user', content: prompt },
    ],
  })

  const content = response.choices[0].message.content ?? '{}'
  const inputTokens = response.usage?.prompt_tokens ?? 0
  const outputTokens = response.usage?.completion_tokens ?? 0
  const totalTokens = inputTokens + outputTokens

  await Promise.all([
    supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      feature: 'lesson_plan',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
    }),
    supabase
      .from('subscriptions')
      .update({ ai_tokens_used: currentTokensUsed + totalTokens })
      .eq('user_id', user.id),
  ])

  const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return NextResponse.json({ ...JSON.parse(jsonText), tokensUsed: totalTokens })
  } catch {
    return NextResponse.json({ error: 'AI 응답 파싱 실패', raw: content }, { status: 500 })
  }
}
