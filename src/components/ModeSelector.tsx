'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import UrlInputForm from './UrlInputForm'

type Mode = 'A' | 'B'

interface ModeCardProps {
  mode: Mode
  selected: boolean
  onClick: () => void
  title: string
  subtitle: string
  description: string
}

const ModeCard = ({ mode, selected, onClick, title, subtitle, description }: ModeCardProps) => (
  <Card
    onClick={onClick}
    className={`cursor-pointer transition-all border-2 ${
      selected
        ? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-2'
        : 'border-zinc-200 hover:border-zinc-400'
    }`}
  >
    <CardContent className="p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
          Mode {mode}
        </span>
      </div>
      <div>
        <p className="text-base font-semibold text-zinc-900">{title}</p>
        <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
      <p className="text-sm text-zinc-600 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
)

const ModeSelector = () => {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)

  const handleModeClick = (mode: Mode) => {
    setSelectedMode((prev) => (prev === mode ? null : mode))
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl mx-auto py-16 px-4">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Visual Text Auditor
        </h1>
        <p className="text-sm text-zinc-500">
          비교할 모드를 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <ModeCard
          mode="A"
          selected={selectedMode === 'A'}
          onClick={() => handleModeClick('A')}
          title="Figma → Figma"
          subtitle="기획서 vs 디자인 시안"
          description="Figma 기획서 프레임과 디자인 시안 프레임의 텍스트를 비교합니다."
        />
        <ModeCard
          mode="B"
          selected={selectedMode === 'B'}
          onClick={() => handleModeClick('B')}
          title="Figma → Web"
          subtitle="디자인 시안 vs 실서비스"
          description="Figma 디자인 시안과 실제 배포된 웹페이지의 텍스트를 비교합니다."
        />
      </div>

      {selectedMode && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-full border-t border-zinc-100" />
          <p className="text-sm font-medium text-zinc-600">
            Mode {selectedMode} — URL 입력
          </p>
          <UrlInputForm mode={selectedMode} />
        </div>
      )}
    </div>
  )
}

export default ModeSelector
