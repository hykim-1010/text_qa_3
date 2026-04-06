import type { CompareResult } from '@/types'
import StatusBadge from './StatusBadge'
import DiffHighlight from './DiffHighlight'

interface Summary {
  total: number
  match: number
  mismatch: number
  missing: number
  added: number
}

interface ResultViewerProps {
  results: CompareResult[]
  summary: Summary
  sourceLabel: string
  targetLabel: string
}

const ROW_BG: Record<string, string> = {
  match:    'border-white/[0.05]',
  mismatch: 'border-orange-500/20 bg-orange-500/[0.03]',
  missing:  'border-red-500/20    bg-red-500/[0.03]',
  added:    'border-blue-500/20   bg-blue-500/[0.03]',
}

const SumCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`flex flex-col gap-0.5 px-4 py-3 rounded-lg border ${color}`}>
    <span className="font-mono text-[22px] font-semibold text-white/80">{value}</span>
    <span className="text-[12px] text-white/35">{label}</span>
  </div>
)

const ResultViewer = ({ results, summary, sourceLabel, targetLabel }: ResultViewerProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SumCard label="일치"   value={summary.match}    color="border-green-500/20  bg-green-500/[0.04]"  />
        <SumCard label="불일치" value={summary.mismatch} color="border-orange-500/20 bg-orange-500/[0.04]" />
        <SumCard label="누락"   value={summary.missing}  color="border-red-500/20    bg-red-500/[0.04]"    />
        <SumCard label="추가"   value={summary.added}    color="border-blue-500/20   bg-blue-500/[0.04]"   />
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
        {results.map((result) => (
          <div
            key={result.id}
            className={[
              'grid grid-cols-[1fr_80px_1fr] gap-3 items-center',
              'px-3 py-3 rounded-lg border',
              ROW_BG[result.status] ?? 'border-white/[0.05]',
            ].join(' ')}
          >
            {/* Source 텍스트 */}
            <div className="min-w-0">
              {result.sourceNode ? (
                result.status === 'mismatch' && result.diff ? (
                  <DiffHighlight diffs={result.diff} side="source" />
                ) : (
                  <span className="font-mono text-[13px] text-white/60 break-all whitespace-pre-wrap leading-relaxed">
                    {result.sourceNode.text}
                  </span>
                )
              ) : (
                <span className="text-[12px] text-white/20 italic">—</span>
              )}
            </div>

            {/* 상태 뱃지 */}
            <div className="flex justify-center">
              <StatusBadge status={result.status} />
            </div>

            {/* Target 텍스트 */}
            <div className="min-w-0">
              {result.targetNode ? (
                result.status === 'mismatch' && result.diff ? (
                  <DiffHighlight diffs={result.diff} side="target" />
                ) : (
                  <span className="font-mono text-[13px] text-white/60 break-all whitespace-pre-wrap leading-relaxed">
                    {result.targetNode.text}
                  </span>
                )
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
