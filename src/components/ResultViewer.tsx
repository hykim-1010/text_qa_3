import type { ComparePair, PairStatus } from '@/lib/compare'
import StatusBadge from './StatusBadge'
import CopyableText from './CopyableText'
import DiffHighlight from './DiffHighlight'

interface Summary {
  total: number
  pass: number
  needs_edit: number
  figma_only: number
  web_only: number
}

interface ResultViewerProps {
  pairs: ComparePair[]
  summary: Summary
  sourceLabel: string
  targetLabel: string
  mode?: 'A' | 'B'
}

const ROW_BG: Record<PairStatus, string> = {
  pass:       'border-gray-100   bg-white',
  needs_edit: 'border-orange-200 bg-orange-50',
  figma_only: 'border-red-200    bg-red-50',
  web_only:   'border-blue-200   bg-blue-50',
}

const SumCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`flex flex-col gap-0.5 px-4 py-3 rounded-lg border ${color}`}>
    <span className="font-mono text-[22px] font-semibold">{value}</span>
    <span className="text-sm">{label}</span>
  </div>
)

const ResultViewer = ({ pairs, summary, sourceLabel, targetLabel, mode }: ResultViewerProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SumCard label="일치"    value={summary.pass}       color="border-green-200  bg-green-50  text-green-700"  />
        <SumCard label="불일치"  value={summary.needs_edit} color="border-orange-200 bg-orange-50 text-orange-700" />
        <SumCard label="Figma1만" value={summary.figma_only} color="border-red-200    bg-red-50    text-red-700"    />
        <SumCard label={mode === 'A' ? 'Figma2만' : 'Web만'} value={summary.web_only} color="border-blue-200 bg-blue-50 text-blue-700" />
      </div>

      {/* 결과 테이블 헤더 */}
      <div className="grid grid-cols-[1fr_90px_1fr] gap-3 px-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-400">
          {sourceLabel}
        </span>
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">
          상태
        </span>
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-400">
          {targetLabel}
        </span>
      </div>

      {/* 결과 행 */}
      <div className="flex flex-col gap-1.5">
        {pairs.map((pair, i) => (
          <div
            key={i}
            className={[
              'grid grid-cols-[1fr_90px_1fr] gap-3 items-center',
              'px-3 py-3.5 rounded-lg border',
              ROW_BG[pair.status],
            ].join(' ')}
          >
            {/* Figma 텍스트 */}
            <div className="min-w-0">
              {pair.figmaText ? (
                pair.status === 'needs_edit' && pair.diffs ? (
                  <DiffHighlight
                    diffs={pair.diffs}
                    side="source"
                    copyText={pair.figmaText}
                    toastLabel={mode === 'A' ? 'Figma1 텍스트 복사완료' : 'Figma 텍스트 복사완료'}
                  />
                ) : (
                  <CopyableText text={pair.figmaText} source={mode === 'A' ? 'figma1' : 'figma'} />
                )
              ) : (
                <span className="text-base text-gray-300 italic">—</span>
              )}
            </div>

            {/* 상태 뱃지 */}
            <div className="flex justify-center">
              <StatusBadge status={pair.status} mode={mode} />
            </div>

            {/* Web / Figma2 텍스트 */}
            <div className="min-w-0">
              {pair.webText ? (
                pair.status === 'needs_edit' && pair.diffs ? (
                  <DiffHighlight
                    diffs={pair.diffs}
                    side="target"
                    copyText={pair.webText}
                    toastLabel={mode === 'A' ? 'Figma2 텍스트 복사완료' : 'WEB 텍스트 복사완료'}
                  />
                ) : (
                  <CopyableText text={pair.webText} source={mode === 'A' ? 'figma2' : 'web'} />
                )
              ) : (
                <span className="text-base text-gray-300 italic">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultViewer
