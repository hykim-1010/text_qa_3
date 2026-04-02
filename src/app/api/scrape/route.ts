import { NextRequest, NextResponse } from 'next/server'
import type { TextNode } from '@/types'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 본문이 유효한 JSON이 아닙니다.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || !('url' in body) || typeof (body as { url: unknown }).url !== 'string') {
    return NextResponse.json({ error: 'url 필드가 필요합니다.' }, { status: 400 })
  }

  const url = (body as { url: string }).url

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 })
  }

  try {
    const { chromium } = await import('playwright')

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })

    const nodes: TextNode[] = await page.evaluate(() => {
      const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK'])
      const results: TextNode[] = []
      let counter = 0

      function collectTextNodes(node: Node): void {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          if (EXCLUDED_TAGS.has(el.tagName)) return

          const style = window.getComputedStyle(el)
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim()
          if (!text) return

          const parent = node.parentElement
          if (!parent) return

          const parentTag = parent.tagName
          if (EXCLUDED_TAGS.has(parentTag)) return

          const parentStyle = window.getComputedStyle(parent)
          if (
            parentStyle.display === 'none' ||
            parentStyle.visibility === 'hidden' ||
            parentStyle.opacity === '0'
          ) return

          const rect = parent.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) return

          results.push({
            id: `web-${counter++}`,
            text,
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            source: 'web',
          })
          return
        }

        for (const child of Array.from(node.childNodes)) {
          collectTextNodes(child)
        }
      }

      collectTextNodes(document.body)
      return results
    })

    await browser.close()

    return NextResponse.json({ nodes })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'

    if (message.includes('net::ERR') || message.includes('ERR_NAME_NOT_RESOLVED')) {
      return NextResponse.json({ error: `페이지에 접근할 수 없습니다: ${message}` }, { status: 502 })
    }

    if (message.includes('Timeout') || message.includes('timeout')) {
      return NextResponse.json({ error: '페이지 로드 시간이 초과되었습니다 (30초).' }, { status: 504 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
