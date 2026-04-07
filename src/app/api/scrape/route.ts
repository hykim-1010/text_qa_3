import { NextRequest, NextResponse } from 'next/server'
import { load } from 'cheerio'

type CheerioRoot = ReturnType<typeof load>

// domhandler Element에서 필요한 필드만 추출
interface DomEl {
  tagName: string
}

// LEAF_TAGS: 내부 inline 요소(strong, em, span 등) 포함해 전체를 하나의 텍스트로 추출
const LEAF_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'figcaption', 'td', 'th', 'dt'])
// CONTAINER_TAGS: 블록 자식이 있으면 재귀, 없으면 전체 텍스트 추출
const CONTAINER_TAGS = new Set(['div', 'section', 'article', 'main', 'aside', 'ul', 'ol', 'dl', 'table', 'thead', 'tbody', 'tr', 'li', 'dd'])
// RICH_INLINE_TAGS: 재귀 중 만났을 때 .text() 전체를 하나로 추출 (br 등 자식이 있어도 텍스트 보존)
const RICH_INLINE_TAGS = new Set(['strong', 'em', 'b', 'i', 'label', 'button'])

function normalizeChunk(s: string): string {
  return s.replace(/[\s\n\r]+/g, ' ').trim()
}

// <br> 태그를 공백으로 대체한 뒤 텍스트 추출 (Cheerio .text()는 br을 무시하고 이어붙임)
function textWithBr($: CheerioRoot, $el: ReturnType<typeof $>): string {
  const $clone = $el.clone()
  $clone.find('br').replaceWith(' ')
  return normalizeChunk($clone.text())
}

function collectChunks($: CheerioRoot, el: DomEl, out: string[]): void {
  const $el = $(el as Parameters<typeof $>[0])
  const tag = (el.tagName ?? '').toLowerCase()

  if (LEAF_TAGS.has(tag)) {
    const text = textWithBr($, $el)
    if (text) out.push(text)
    return
  }

  if (tag === 'a') {
    const text = textWithBr($, $el)
    if (text) out.push(text)
    return
  }

  if (CONTAINER_TAGS.has(tag)) {
    const children = $el.children().toArray() as DomEl[]
    const hasBlockChild = children.some(
      (c: DomEl) => LEAF_TAGS.has(c.tagName?.toLowerCase()) || CONTAINER_TAGS.has(c.tagName?.toLowerCase()),
    )

    if (!hasBlockChild) {
      const $links = $el.find('a')
      if ($links.length > 1) {
        for (const a of $links.toArray() as DomEl[]) {
          const t = textWithBr($, $(a as Parameters<typeof $>[0]))
          if (t) out.push(t)
        }
        const $clone = $el.clone()
        $clone.find('a').remove()
        $clone.find('br').replaceWith(' ')
        const rest = normalizeChunk($clone.text())
        if (rest) out.push(rest)
      } else {
        const text = textWithBr($, $el)
        if (text) out.push(text)
      }
      return
    }

    for (const child of $el.children().toArray() as DomEl[]) {
      collectChunks($, child, out)
    }
    return
  }

  // RICH_INLINE_TAGS: br 등 자식이 있어도 텍스트 전체를 한 덩이로 추출
  if (RICH_INLINE_TAGS.has(tag)) {
    const text = textWithBr($, $el)
    if (text) out.push(text)
    return
  }

  // 그 외 (inline 등)
  const childEls = $el.children().toArray() as DomEl[]
  if (childEls.length > 0) {
    for (const child of childEls) collectChunks($, child, out)
  } else {
    const text = textWithBr($, $el)
    if (text) out.push(text)
  }
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

  const { url } = body as { url: string }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)

    let html: string
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TextQABot/1.0)' },
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        return NextResponse.json({ error: `HTTP ${res.status}: ${res.statusText}` }, { status: 502 })
      }

      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('text/html')) {
        return NextResponse.json(
          { error: `HTML 문서가 아닙니다 (content-type: ${contentType})` },
          { status: 422 },
        )
      }

      html = await res.text()
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId)
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
      if (msg.toLowerCase().includes('abort')) {
        return NextResponse.json({ error: '페이지 로드 시간이 초과되었습니다 (15초).' }, { status: 504 })
      }
      return NextResponse.json({ error: `페이지에 접근할 수 없습니다: ${msg}` }, { status: 502 })
    }

    const $ = load(html)

    // 비콘텐츠 제거
    $('script, style, noscript, iframe, object, embed, svg, template, [hidden]').remove()
    // 헤더/푸터/내비게이션
    $('header, footer, nav, aside').remove()
    $('[role="banner"], [role="contentinfo"], [role="navigation"]').remove()
    $('.header, .footer, #header, #footer').remove()
    $('.nav, .navbar, .navigation, .gnb, .lnb').remove()
    // 스크린리더 전용 / 시각적 숨김
    $('[aria-hidden="true"]').remove()
    $('.blind, .sr-only, .screen-reader-only, .visually-hidden, .visuallyhidden').remove()
    $('.a11y-hidden, .accessibility-hidden, .skip, .offscreen, .off-screen').remove()

    const texts: string[] = []
    const $main = $('main').first()
    const root = $main.length ? $main : $('body')

    ;(root.children().toArray() as DomEl[]).forEach((child: DomEl) => {
      collectChunks($, child, texts)
    })

    return NextResponse.json({ texts })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
