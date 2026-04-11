import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { canUseAiChat, canUseAiTokens } from '@/lib/plan'
import type { Plan } from '@/lib/constants'

const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })

const SYSTEM_PROMPT = `당신은 선생님의 수업 진도 관리와 수업 계획을 돕는 AI 어시스턴트입니다.
진도 계획 조언, 밀린 진도 따라잡기, 단원별 수업 전략, 시험 범위 조정, 수업 자료 분석에 대한 질문에 답변하세요.
한국어로 친절하고 전문적으로 답변하세요.`

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
      error: 'AI 채팅을 사용할 수 없는 플랜입니다',
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
      error: '이번 달 AI 토큰 한도를 초과했습니다. 다음 달에 초기화됩니다.',
      tokenExhausted: true,
    }, { status: 429 })
  }

  const { messages, context } = await req.json()

  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\n현재 선생님 현황:\n${context}`
    : SYSTEM_PROMPT

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  let inputTokens = 0
  let outputTokens = 0

  const stream = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: openaiMessages,
    stream: true,
    stream_options: { include_usage: true },
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens
          outputTokens = chunk.usage.completion_tokens
        }
      }

      const totalTokens = inputTokens + outputTokens
      if (totalTokens > 0) {
        await Promise.all([
          supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            feature: 'chat',
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: totalTokens,
          }),
          supabase
            .from('subscriptions')
            .update({ ai_tokens_used: currentTokensUsed + totalTokens })
            .eq('user_id', user.id),
        ])
      }

      controller.close()
    },
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Tokens-Used': String(currentTokensUsed),
    },
  })
}
