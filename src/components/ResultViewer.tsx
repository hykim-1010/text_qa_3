import type { ComparePair, PairStatus } from '@/lib/compare'
import StatusBadge from './StatusBadge'
import CopyableText from './CopyableText'

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
}

const ROW_BG: Record<PairStatus, string> = {
  pass:       'border-white/[0.05]',
  needs_edit: 'border-orange-500/20 bg-orange-500/[0.03]',
  figma_only: 'border-red-500/20    bg-red-500/[0.03]',
  web_only:   'border-blue-500/20   bg-blue-500/[0.03]',
}

const SumCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`flex flex-col gap-0.5 px-4 py-3 rounded-lg border ${color}`}>
    <span className="font-mono text-[22px] font-semibold text-white/80">{value}</span>
    <span className="text-[12px] text-white/35">{label}</span>
  </div>
)

const ResultViewer = ({ pairs, summary, sourceLabel, targetLabel }: ResultViewerProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SumCard label="일치"    value={summary.pass}       color="border-green-500/20  bg-green-500/[0.04]"  />
        <SumCard label="불일치"  value={summary.needs_edit} color="border-orange-500/20 bg-orange-500/[0.04]" />
        <SumCard label="Figma만" value={summary.figma_only} color="border-red-500/20    bg-red-500/[0.04]"    />
        <SumCard label="Web만"   value={summary.web_only}   color="border-blue-500/20   bg-blue-500/[0.04]"   />
      </div>

      {/* 결과 테이블 헤더 */}
      <div className="grid grid-cols-[1fr_80px_1fr] gap-3 px-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
          {sourceLabel}
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 text-center">
          상태
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
          {targetLabel}
        </span>
      </div>

      {/* 결과 행 */}
      <div className="flex flex-col gap-1">
        {pairs.map((pair, i) => (
          <div
            key={i}
            className={[
              'grid grid-cols-[1fr_80px_1fr] gap-3 items-center',
              'px-3 py-3 rounded-lg border',
              ROW_BG[pair.status],
            ].join(' ')}
          >
            {/* Figma 텍스트 */}
            <div className="min-w-0">
              {pair.figmaText ? (
                <CopyableText text={pair.figmaText} source="figma" />
              ) : (
                <span className="text-[12px] text-white/20 italic">—</span>
              )}
            </div>

            {/* 상태 뱃지 */}
            <div className="flex justify-center">
              <StatusBadge status={pair.status} />
            </div>

            {/* Web 텍스트 */}
            <div className="min-w-0">
              {pair.webText ? (
                <CopyableText text={pair.webText} source="web" />
              ) : (
                <span className="text-[12px] text-white/20 italic">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultViewer
