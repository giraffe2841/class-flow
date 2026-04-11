import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Plan } from '@/lib/constants'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const PDF_EXTS = ['.pdf']

function isImage(fileName: string, fileType?: string): boolean {
  if (fileType && IMAGE_TYPES.includes(fileType.toLowerCase())) return true
  const lower = fileName?.toLowerCase() ?? ''
  return IMAGE_EXTS.some(ext => lower.endsWith(ext))
}

function isPdf(fileName: string, fileType?: string): boolean {
  if (fileType === 'application/pdf') return true
  return PDF_EXTS.some(ext => (fileName?.toLowerCase() ?? '').endsWith(ext))
}

function getImageMediaType(fileName: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
  const lower = fileName?.toLowerCase() ?? ''
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

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
    return NextResponse.json({ error: '프로 플랜 이상에서 AI 분석 기능을 사용할 수 있습니다' }, { status: 403 })
  }

  const { fileUrl, fileName, fileType, fileText, units } = await req.json()

  const unitList = (units as string[]).map((u: string) => `- ${u}`).join('\n')
  const instruction = `이 학습지 자료를 분석하고, 아래 단원 목록에서 가장 관련 있는 단원을 찾아 요약과 태그를 생성하세요.

단원 목록:
${unitList}

규칙:
- "unit" 값은 반드시 단원 목록에 있는 이름 그대로 사용하세요. 없으면 null.
- "summary"는 2-3문장으로 학습 내용을 요약하세요.
- "tags"는 핵심 키워드 3-5개를 배열로 제공하세요.

JSON 형식으로만 응답하세요:
{ "unit": "단원명 또는 null", "summary": "요약 내용", "tags": ["태그1", "태그2", "태그3"] }`

  try {
    let responseText: string

    if (fileUrl && isImage(fileName, fileType)) {
      // 이미지: Claude 비전으로 직접 분석
      const base64 = await fetchAsBase64(fileUrl)
      const mediaType = getImageMediaType(fileName)

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: instruction },
          ],
        }],
      })
      responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'

    } else if (fileUrl && isPdf(fileName, fileType)) {
      // PDF: Claude 네이티브 PDF 지원 (beta)
      const base64 = await fetchAsBase64(fileUrl)

      const message = await anthropic.beta.messages.create({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 512,
        betas: ['pdfs-2024-09-25'],
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            } as Anthropic.Beta.BetaRequestDocumentBlock,
            { type: 'text', text: instruction },
          ],
        }],
      })
      responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'

    } else {
      // 기타 파일 (DOCX, PPT 등): 파일명 + 텍스트(있으면) 기반 분석
      const textSnippet = fileText ? `\n학습 자료 내용 (일부):\n${String(fileText).slice(0, 3000)}` : ''
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `파일명: ${fileName ?? '(알 수 없음)'}${textSnippet}\n\n${instruction}`,
        }],
      })
      responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    }

    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return NextResponse.json(JSON.parse(jsonText))

  } catch (err) {
    console.error('[analyze-material]', err)
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다' }, { status: 500 })
  }
}
