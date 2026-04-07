import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'

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

  let browser = null
  try {
    browser = await chromium.launch()
    const page = await browser.newPage()

    try {
      await page.goto(url, { timeout: 15_000, waitUntil: 'domcontentloaded' })
      // JS 렌더링 완료 대기 (SPA 등)
      await page.waitForTimeout(1_500)
    } catch (navErr: unknown) {
      const msg = navErr instanceof Error ? navErr.message : String(navErr)
      if (msg.toLowerCase().includes('timeout')) {
        return NextResponse.json({ error: '페이지 로드 시간이 초과되었습니다 (15초).' }, { status: 504 })
      }
      return NextResponse.json({ error: `페이지에 접근할 수 없습니다: ${msg}` }, { status: 502 })
    }

    const nodes = await page.evaluate(() => {
      // noise 요소 제거
      document.querySelectorAll(
        'script, style, noscript, iframe, object, embed, svg, template, [hidden],' +
        'header, footer, nav, aside,' +
        '[role="banner"], [role="contentinfo"], [role="navigation"],' +
        '[aria-hidden="true"],' +
        '.blind, .sr-only, .screen-reader-only, .visually-hidden, .visuallyhidden,' +
        '.a11y-hidden, .accessibility-hidden, .skip, .offscreen, .off-screen,' +
        '.header, .footer, #header, #footer,' +
        '.nav, .navbar, .navigation, .gnb, .lnb'
      ).forEach(el => el.remove())

      // a, button, label, strong 포함: 아래에서 부모 캡처 여부를 체크해 중복 방지
      const SELECTORS = 'p, h1, h2, h3, h4, h5, h6, li, td, th, dt, dd, figcaption, blockquote, button, a[href], label, strong'
      const elements = Array.from(document.querySelectorAll(SELECTORS))

      // dl 추가: li 안에 dl이 있을 때 outer li가 통째로 잡히는 것을 막음
      const BLOCK_TAGS = new Set(['p','h1','h2','h3','h4','h5','h6','li','td','th','dt','dd','div','section','article','ul','ol','dl','table'])

      // 셀렉터에 포함된 모든 태그 (부모가 이 중 하나이고 블록 자식이 없으면 부모가 캡처)
      const ALL_SELECTOR_TAGS = new Set(['p','h1','h2','h3','h4','h5','h6','li','td','th','dt','dd','figcaption','blockquote','button','a','label','strong'])

      const result: Array<{
        id: string; text: string
        x: number; y: number; width: number; height: number
        source: 'web'
      }> = []

      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        const tag = htmlEl.tagName.toLowerCase()
        const style = window.getComputedStyle(htmlEl)

        if (style.display === 'none' || style.visibility === 'hidden') return

        const rect = htmlEl.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return

        const text = htmlEl.innerText?.trim() ?? ''
        if (!text) return

        // 블록 자식이 있는 컨테이너는 중복 방지를 위해 제외
        const hasBlockChild = Array.from(htmlEl.children).some(child =>
          BLOCK_TAGS.has(child.tagName.toLowerCase())
        )
        if (hasBlockChild) return

        // a, button, label, strong 등 인라인 셀렉터:
        // 부모도 셀렉터에 속하고 블록 자식이 없으면(→ 부모가 캡처 예정) 중복 방지를 위해 스킵.
        // 단, 부모가 블록 자식을 가져 스킵될 경우에는 이 요소가 독립 캡처되어야 하므로 유지.
        // 예) <li><a>text</a></li>         → li 캡처, a 스킵
        //     <li><strong>t</strong><dl/></li> → li 스킵, strong 캡처
        const INLINE_SELECTOR_TAGS = new Set(['a','button','label','strong'])
        if (INLINE_SELECTOR_TAGS.has(tag)) {
          const parentEl = htmlEl.parentElement
          if (parentEl) {
            const parentTag = parentEl.tagName.toLowerCase()
            if (ALL_SELECTOR_TAGS.has(parentTag)) {
              const parentHasBlock = Array.from(parentEl.children).some(c =>
                BLOCK_TAGS.has(c.tagName.toLowerCase())
              )
              if (!parentHasBlock) return  // 부모가 캡처 → 이 요소는 스킵
            }
          }
        }

        result.push({
          id: `web-${index}`,
          text,
          x: Math.round(rect.left),
          // scrollY를 더해 절대 페이지 좌표로 변환 (정렬 시 일관성 확보)
          y: Math.round(rect.top + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          source: 'web',
        })
      })

      return result
    })

    return NextResponse.json({ nodes })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (browser) await browser.close()
  }
}
