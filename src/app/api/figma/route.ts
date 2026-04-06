import { NextRequest, NextResponse } from 'next/server'

interface FigmaNode {
  id: string
  type: string
  visible?: boolean
  characters?: string
  children?: FigmaNode[]
}

interface FigmaFileResponse {
  document: FigmaNode
}

function collectTextNodes(node: FigmaNode, out: string[], parentVisible = true): void {
  const visible = node.visible !== false && parentVisible
  if (!visible) return

  if (node.type === 'TEXT' && typeof node.characters === 'string') {
    const text = node.characters.trim()
    if (text) out.push(text)
  }

  if (node.children) {
    for (const child of node.children) {
      collectTextNodes(child, out, visible)
    }
  }
}

function findNode(root: FigmaNode, id: string): FigmaNode | null {
  if (root.id === id) return root
  for (const child of root.children ?? []) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 본문이 유효한 JSON이 아닙니다.' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('url' in body) ||
    typeof (body as { url: unknown }).url !== 'string'
  ) {
    return NextResponse.json({ error: 'url 필드가 필요합니다.' }, { status: 400 })
  }

  const figmaUrl = (body as { url: string }).url

  // fileKey 추출: /file/{key}/ 또는 /design/{key}/
  const fileKeyMatch = figmaUrl.match(/(?:figma\.com)\/(?:file|design)\/([a-zA-Z0-9]+)/i)
  if (!fileKeyMatch) {
    return NextResponse.json({ error: '유효한 Figma URL이 아닙니다.' }, { status: 400 })
  }
  const fileKey = fileKeyMatch[1]

  // node-id 추출 (선택), '-' → ':' 치환
  const nodeIdMatch = figmaUrl.match(/[?&]node-id=([\d\-]+)/i)
  const nodeId = nodeIdMatch ? nodeIdMatch[1].replace(/-/g, ':') : null

  const token = process.env.FIGMA_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'FIGMA_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': token },
    })

    if (res.status === 403) {
      return NextResponse.json({ error: 'Figma API 접근이 거부되었습니다. 토큰을 확인해주세요.' }, { status: 403 })
    }
    if (res.status === 404) {
      return NextResponse.json({ error: 'Figma 파일을 찾을 수 없습니다.' }, { status: 404 })
    }
    if (!res.ok) {
      return NextResponse.json({ error: `Figma API 오류: ${res.status}` }, { status: 502 })
    }

    const data = (await res.json()) as FigmaFileResponse
    let root: FigmaNode = data.document

    if (nodeId) {
      const found = findNode(data.document, nodeId)
      if (found) root = found
    }

    const texts: string[] = []
    collectTextNodes(root, texts)

    return NextResponse.json({ texts })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
