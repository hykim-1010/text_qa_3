'use client'

import { useState } from 'react'
import UrlInputForm from './UrlInputForm'

type Mode = 'A' | 'B'

interface ModeCardProps {
  mode: Mode
  selected: boolean
  onClick: () => void
  title: string
  source: string
  target: string
  description: string
}

const ModeCard = ({ mode, selected, onClick, title, source, target, description }: ModeCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'group relative w-full text-left rounded-lg border px-5 py-4 transition-all duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]',
      selected
        ? 'border-[#5e6ad2]/60 bg-[#5e6ad2]/[0.07]'
        : 'border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.15]',
    ].join(' ')}
  >
    {selected && (
      <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-[#5e6ad2]" />
    )}

    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={[
              'font-mono text-[12px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded',
              selected
                ? 'bg-[#5e6ad2]/20 text-[#8b95e8]'
                : 'bg-white/[0.06] text-white/40',
            ].join(' ')}
          >
            Mode {mode}
          </span>
        </div>

        <div>
          <p className="text-[18px] font-semibold text-white/90 leading-snug">{title}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="font-mono text-[13px] text-white/35 bg-white/[0.05] px-1.5 py-0.5 rounded">
              {source}
            </span>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-white/20 flex-shrink-0">
              <path d="M2.5 6h7M6.5 3.5 9 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-[13px] text-white/35 bg-white/[0.05] px-1.5 py-0.5 rounded">
              {target}
            </span>
          </div>
        </div>

        <p className="text-[15px] text-white/40 leading-relaxed">{description}</p>
      </div>

      <div
        className={[
          'mt-0.5 w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all duration-150',
          selected
            ? 'border-[#5e6ad2] bg-[#5e6ad2]'
            : 'border-white/20 group-hover:border-white/35',
        ].join(' ')}
      >
        {selected && (
          <svg viewBox="0 0 16 16" fill="none" className="w-full h-full p-[3px]">
            <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  </button>
)

const ModeSelector = () => {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)

  const handleModeClick = (mode: Mode) => {
    setSelectedMode((prev) => (prev === mode ? null : mode))
  }

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Top nav */}
      <header className="flex items-center gap-3 px-6 h-12 border-b border-white/[0.07] flex-shrink-0">
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
        <div className="ml-auto flex items-center gap-1">
          <span className="font-mono text-[11px] text-white/20 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
            v0.1.0
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
        <div className="w-full max-w-[520px] flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[40px] font-semibold text-white/90 tracking-tight leading-[1.15]">
              텍스트 검수 시작
            </h1>
            <p className="text-[17px] text-white/40 leading-relaxed">
              Figma 기획서와 실서비스 텍스트를 자동으로 비교합니다.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.07]" />

          {/* Mode selection */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 font-mono">
              비교 모드 선택
            </p>
            <div className="flex flex-col gap-2">
              <ModeCard
                mode="A"
                selected={selectedMode === 'A'}
                onClick={() => handleModeClick('A')}
                title="Figma → Figma"
                source="기획서 프레임"
                target="디자인 시안"
                description="두 Figma 프레임의 텍스트를 비교합니다."
              />
              <ModeCard
                mode="B"
                selected={selectedMode === 'B'}
                onClick={() => handleModeClick('B')}
                title="Figma → Web"
                source="디자인 시안"
                target="실서비스 URL"
                description="Figma 시안과 배포된 웹페이지의 텍스트를 비교합니다."
              />
            </div>
          </div>

          {/* URL Input — animated reveal */}
          {selectedMode && (
            <div
              className="flex flex-col gap-4"
              style={{ animation: 'fadeSlideIn 180ms ease both' }}
            >
              <div className="h-px bg-white/[0.07]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 font-mono">
                URL 입력
              </p>
              <UrlInputForm mode={selectedMode} />
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default ModeSelector
