import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })

  const body = await req.json()
  const { schoolType, grade } = body

  const VALID_SCHOOL_TYPES = ['middle', 'high'] as const
  const VALID_GRADES = [1, 2, 3]

  if (!(VALID_SCHOOL_TYPES as readonly string[]).includes(schoolType)) {
    return NextResponse.json({ error: '잘못된 학교급입니다' }, { status: 400 })
  }
  if (!VALID_GRADES.includes(grade)) {
    return NextResponse.json({ error: '잘못된 학년입니다' }, { status: 400 })
  }

  const schoolLabel = schoolType === 'middle' ? '중학교' : '고등학교'

  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `2022 개정 교육과정 기준으로 ${schoolLabel} ${grade}학년에서 가르치는 과목 목록을 JSON 배열로 반환해줘. 각 항목은 { "name": string, "category": string, "isRequired": boolean } 형태로. category는 "국어", "수학", "영어", "사회", "과학", "체육", "예술", "기술·가정", "제2외국어", "교양", "선택" 등 교과 영역이야. JSON 배열만 반환하고 다른 텍스트는 포함하지 마.`,
      },
    ],
  })

  const text = response.choices[0].message.content ?? ''
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    const subjects = Array.isArray(parsed)
      ? parsed.filter((s: unknown) => typeof s === 'object' && s !== null && 'name' in s)
      : []
    return NextResponse.json({ subjects })
  } catch {
    return NextResponse.json({ error: 'AI 응답을 처리할 수 없습니다' }, { status: 500 })
  }
}
