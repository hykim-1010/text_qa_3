import { NextRequest, NextResponse } from 'next/server'
import type { TextNode } from '@/types'
import { sortByVisualFlow } from '@/lib/sort'
import { compareNodes } from '@/lib/compare'

interface CompareRequestBody {
  source: TextNode[]
  target: TextNode[]
}

function isTextNodeArray(value: unknown): value is TextNode[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as TextNode).id === 'string' &&
      typeof (item as TextNode).text === 'string' &&
      typeof (item as TextNode).x === 'number' &&
      typeof (item as TextNode).y === 'number' &&
      typeof (item as TextNode).width === 'number' &&
      typeof (item as TextNode).height === 'number' &&
      ((item as TextNode).source === 'figma' || (item as TextNode).source === 'web')
  )
}

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

  const { source, target } = body as CompareRequestBody

  if (!isTextNodeArray(source)) {
    return NextResponse.json({ error: 'source 필드가 유효한 TextNode 배열이어야 합니다.' }, { status: 400 })
  }

  if (!isTextNodeArray(target)) {
    return NextResponse.json({ error: 'target 필드가 유효한 TextNode 배열이어야 합니다.' }, { status: 400 })
  }

  try {
    const sortedSource = sortByVisualFlow(source)
    const sortedTarget = sortByVisualFlow(target)
    const results = compareNodes(sortedSource, sortedTarget)

    const summary = {
      total: results.length,
      match: results.filter((r) => r.status === 'match').length,
      mismatch: results.filter((r) => r.status === 'mismatch').length,
      missing: results.filter((r) => r.status === 'missing').length,
      added: results.filter((r) => r.status === 'added').length,
    }

    return NextResponse.json({ results, summary })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
