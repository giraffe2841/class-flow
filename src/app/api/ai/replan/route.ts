import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { canUseAiReplan } from '@/lib/plan'
import type { Plan } from '@/lib/constants'

const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, ai_usage_count, ai_usage_reset_at')
    .eq('user_id', user.id)
    .single()

  const plan = (sub?.plan ?? 'free') as Plan
  const usageCount = sub?.ai_usage_count ?? 0

  if (!canUseAiReplan(plan, usageCount)) {
    return NextResponse.json(
      { error: plan === 'free' ? '프로 플랜 이상에서 사용 가능합니다' : '이번 달 AI 재계획 횟수를 모두 사용했습니다' },
      { status: 403 }
    )
  }

  const { missedDates, subject, units, classes } = await req.json()

  const prompt = `당신은 수업 진도 재계획 전문가입니다.

교과: ${subject}
담당 반: ${classes.join(', ')}
전체 단원/차시:
${units.map((u: { title: string; lessons: string[] }) => `- ${u.title}: ${u.lessons.join(', ')}`).join('\n')}

못 나간 날짜/교시: ${missedDates.join(', ')}

위 정보를 바탕으로 남은 수업일에 차시를 재배분하는 새 진도표를 JSON 형식으로 생성해주세요.
형식: { "plan": [ { "date": "YYYY-MM-DD", "lesson": "단원 - 차시명", "class": "반 이름" } ] }
한국어로 답변하고, JSON 외 다른 텍스트는 포함하지 마세요.`

  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.choices[0].message.content ?? ''

  const now = new Date()
  const resetAt = sub?.ai_usage_reset_at ? new Date(sub.ai_usage_reset_at) : null
  const shouldReset = !resetAt || now.getMonth() !== resetAt.getMonth()

  await supabase.from('subscriptions').update({
    ai_usage_count: shouldReset ? 1 : usageCount + 1,
    ai_usage_reset_at: shouldReset ? now.toISOString() : sub?.ai_usage_reset_at,
  }).eq('user_id', user.id)

  const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json({ result: jsonText, usageCount: shouldReset ? 1 : usageCount + 1 })
}
