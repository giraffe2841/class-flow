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
    return NextResponse.json({ error: '프로 플랜 이상에서 사용할 수 있습니다' }, { status: 403 })
  }

  const { fileName, summary, unit, tags, schoolType, grade, subject } = await req.json()

  const prompt = `다음 학습 자료를 기반으로 1차시(45분) 수업 계획을 작성해주세요.

학교급: ${schoolType ?? ''}${grade ? ` ${grade}학년` : ''}
과목: ${subject ?? ''}
단원: ${unit ?? ''}
파일명: ${fileName ?? ''}
요약: ${summary ?? ''}
태그: ${(tags ?? []).join(', ')}

JSON 형식으로만 응답하세요:
{
  "objectives": ["수업 목표 1", "수업 목표 2"],
  "intro": "도입(5-10분) 활동 설명",
  "main": "전개(25-30분) 활동 설명",
  "wrap": "정리(5-10분) 활동 설명",
  "homework": "과제 제안 (없으면 null)",
  "tips": "수업 팁 또는 주의사항"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return NextResponse.json(JSON.parse(jsonText))

  } catch (err) {
    console.error('[lesson-plan-from-material]', err)
    return NextResponse.json({ error: 'AI 응답을 파싱할 수 없습니다' }, { status: 500 })
  }
}
