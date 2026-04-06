import { NextRequest, NextResponse } from 'next/server'
import { buildComparePairs } from '@/lib/compare'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 본문이 유효한 JSON이 아닙니다.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: '요청 본문이 객체여야 합니다.' }, { status: 400 })
  }

  const { figmaTexts, webTexts } = body as { figmaTexts?: unknown; webTexts?: unknown }

  if (!Array.isArray(figmaTexts) || !figmaTexts.every((t) => typeof t === 'string')) {
    return NextResponse.json({ error: 'figmaTexts 필드가 string[] 이어야 합니다.' }, { status: 400 })
  }

  if (!Array.isArray(webTexts) || !webTexts.every((t) => typeof t === 'string')) {
    return NextResponse.json({ error: 'webTexts 필드가 string[] 이어야 합니다.' }, { status: 400 })
  }

  try {
    const pairs = buildComparePairs(figmaTexts as string[], webTexts as string[])

    const summary = {
      total:      pairs.length,
      pass:       pairs.filter((p) => p.status === 'pass').length,
      needs_edit: pairs.filter((p) => p.status === 'needs_edit').length,
      figma_only: pairs.filter((p) => p.status === 'figma_only').length,
      web_only:   pairs.filter((p) => p.status === 'web_only').length,
    }

    return NextResponse.json({ pairs, summary })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
