import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Plan } from '@/lib/constants'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan = (sub?.plan ?? 'free') as Plan
  if (plan === 'free') {
    return NextResponse.json({ error: '프로 플랜 이상에서 AI 진도 생성 기능을 사용할 수 있습니다' }, { status: 403 })
  }

  const { fileName, summary, unit, tags, schoolType, grade, subject, sessions } = await req.json()

  const schoolInfo = subject
    ? `${schoolType ?? ''} ${grade ? `${grade}학년` : ''} ${subject}`.trim()
    : '(과목 미지정)'

  const sessionCount = Math.min(Math.max(Number(sessions) || 5, 2), 20)

  const prompt = `당신은 ${schoolInfo} 선생님입니다.
아래 학습지를 분석하여 ${sessionCount}차시 진도 계획을 수립해주세요.

학습지 정보:
- 파일명: ${fileName ?? '(알 수 없음)'}
- 단원: ${unit ?? '미정'}
- 요약: ${summary ?? '없음'}
- 키워드: ${tags?.join(', ') ?? '없음'}

각 차시는 45분 기준이며, 학습자의 이해도를 고려한 단계적 구성을 해주세요.

JSON 형식으로만 응답하세요:
{
  "title": "진도 계획 제목 (예: 1~${sessionCount}차시 학습 진도)",
  "overview": "전체 학습 목표 및 방향 (2-3문장)",
  "sessions": [
    {
      "number": 1,
      "title": "차시 제목",
      "objectives": ["학습 목표1", "학습 목표2"],
      "activities": ["주요 활동1", "주요 활동2"],
      "duration": 45
    }
  ]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return NextResponse.json(JSON.parse(jsonText))
  } catch (err) {
    console.error('[generate-schedule]', err)
    return NextResponse.json({ error: 'AI 진도 생성 중 오류가 발생했습니다' }, { status: 500 })
  }
}
