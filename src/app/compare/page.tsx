'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { CompareResult, TextNode } from '@/types'
import ResultViewer from '@/components/ResultViewer'

interface Summary {
  total: number
  match: number
  mismatch: number
  missing: number
  added: number
}

type State =
  | { phase: 'loading'; message: string }
  | { phase: 'error'; message: string }
  | { phase: 'done'; results: CompareResult[]; summary: Summary }

function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/')
    // /file/{fileKey}/... or /design/{fileKey}/...
    const fileKey = parts[2]
    const rawNodeId = u.searchParams.get('node-id')
    if (!fileKey || !rawNodeId) return null
    // node-id may be '1-2' (new format) or '1:2'
    const nodeId = rawNodeId.includes(':') ? rawNodeId : rawNodeId.replace('-', ':')
    return { fileKey, nodeId }
  } catch {
    return null
  }
}

async function fetchFigmaNodes(figmaUrl: string): Promise<TextNode[]> {
  const parsed = parseFigmaUrl(figmaUrl)
  if (!parsed) throw new Error(`Figma URL을 파싱할 수 없습니다: ${figmaUrl}`)

  const res = await fetch(`/api/figma?fileKey=${encodeURIComponent(parsed.fileKey)}&nodeId=${encodeURIComponent(parsed.nodeId)}`)
  const data: unknown = await res.json()
  if (!res.ok) {
    const msg = typeof data === 'object' && data !== null && 'error' in data
      ? String((data as { error: unknown }).error)
      : 'Figma 노드를 가져오는 데 실패했습니다.'
    throw new Error(msg)
  }
  return (data as { nodes: TextNode[] }).nodes
}

async function fetchWebNodes(webUrl: string): Promise<TextNode[]> {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webUrl }),
  })
  const data: unknown = await res.json()
  if (!res.ok) {
    const msg = typeof data === 'object' && data !== null && 'error' in data
      ? String((data as { error: unknown }).error)
      : '웹 페이지 스크래핑에 실패했습니다.'
    throw new Error(msg)
  }
  return (data as { nodes: TextNode[] }).nodes
}

async function runCompare(source: TextNode[], target: TextNode[]): Promise<{ results: CompareResult[]; summary: Summary }> {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target }),
  })
  const data: unknown = await res.json()
  if (!res.ok) {
    const msg = typeof data === 'object' && data !== null && 'error' in data
      ? String((data as { error: unknown }).error)
      : '비교에 실패했습니다.'
    throw new Error(msg)
  }
  return data as { results: CompareResult[]; summary: Summary }
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<State>({ phase: 'loading', message: '초기화 중…' })

  const mode = searchParams.get('mode') as 'A' | 'B' | null
  const src = searchParams.get('src') ?? ''
  const tgt = searchParams.get('tgt') ?? ''
  const web = searchParams.get('web') ?? ''

  const sourceLabel = mode === 'A' ? 'Figma 기획서' : 'Figma 디자인 시안'
  const targetLabel = mode === 'A' ? 'Figma 디자인 시안' : '실서비스 Web'

  useEffect(() => {
    if (!mode || !src) {
      setState({ phase: 'error', message: '잘못된 접근입니다. 홈으로 돌아가 다시 시도해주세요.' })
      return
    }

    const run = async () => {
      try {
        setState({ phase: 'loading', message: 'Figma 소스 노드 추출 중…' })
        const sourceNodes = await fetchFigmaNodes(src)

        let targetNodes: TextNode[]
        if (mode === 'A') {
          setState({ phase: 'loading', message: 'Figma 타겟 노드 추출 중…' })
          targetNodes = await fetchFigmaNodes(tgt)
        } else {
          setState({ phase: 'loading', message: '웹 페이지 스크래핑 중…' })
          targetNodes = await fetchWebNodes(web)
        }

        setState({ phase: 'loading', message: '텍스트 비교 중…' })
        const { results, summary } = await runCompare(sourceNodes, targetNodes)

        setState({ phase: 'done', results, summary })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        setState({ phase: 'error', message: msg })
      }
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-6 h-12 border-b border-white/[0.07] flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors duration-100 focus:outline-none"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2.5 4.5 6.5 8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[13px]">홈</span>
        </button>

        <div className="mx-3 h-4 w-px bg-white/[0.08]" />

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[5px] bg-[#5e6ad2] flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="1" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.9" />
              <rect x="6.5" y="1" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.9" />
              <rect x="1" y="6.5" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.5" />
              <rect x="6.5" y="6.5" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-[15px] font-medium text-white/70 tracking-tight">
            Visual Text Auditor
          </span>
        </div>

        {state.phase === 'done' && (
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[12px] text-white/30">
              총 {state.summary.total}개
            </span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/20">
              Mode {mode}
            </span>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        {state.phase === 'loading' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <svg
              width="20" height="20" viewBox="0 0 20 20"
              className="animate-spin text-[#5e6ad2]"
              fill="none"
            >
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
              <path d="M10 2a8 8 0 0 1 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-[14px] text-white/40">{state.message}</p>
          </div>
        )}

        {state.phase === 'error' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 max-w-lg text-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0 text-red-400">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7.5 4.5v4M7.5 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-[14px] text-red-400">{state.message}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-[13px] text-white/30 hover:text-white/60 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}

        {state.phase === 'done' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] font-semibold text-white/90 tracking-tight">
                비교 결과
              </h1>
              <p className="text-[14px] text-white/35">
                {sourceLabel} → {targetLabel}
              </p>
            </div>
            <ResultViewer
              results={state.results}
              summary={state.summary}
              sourceLabel={sourceLabel}
              targetLabel={targetLabel}
            />
          </div>
        )}
      </main>
    </div>
  )
}
