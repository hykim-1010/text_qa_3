import { NextRequest, NextResponse } from 'next/server'
import { fetchFigmaTextNodes } from '@/lib/figma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const fileKey = searchParams.get('fileKey')
  const nodeId = searchParams.get('nodeId')

  if (!fileKey || !nodeId) {
    return NextResponse.json(
      { error: 'fileKey와 nodeId 쿼리 파라미터가 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    const nodes = await fetchFigmaTextNodes(fileKey, nodeId)
    return NextResponse.json({ nodes })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'

    // Figma API 자체 오류 (4xx/5xx)
    if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as { response?: { status?: unknown } }).response?.status === 'number'
    ) {
      return NextResponse.json(
        { error: `Figma API 오류: ${message}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
