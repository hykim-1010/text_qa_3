import type { DiffChar } from '@/types'

interface DiffHighlightProps {
  /** 원본(source) 텍스트에서 제거된 부분을 강조해 표시 */
  diffs: DiffChar[]
  side: 'source' | 'target'
}

const DiffHighlight = ({ diffs, side }: DiffHighlightProps) => (
  <span className="font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap">
    {diffs.map((part, i) => {
      // source 쪽: removed 강조, added는 숨김
      // target 쪽: added 강조, removed는 숨김
      if (side === 'source') {
        if (part.added) return null
        if (part.removed) {
          return (
            <mark
              key={i}
              className="bg-red-500/20 text-red-300 rounded-[2px] px-[1px] not-italic"
            >
              {part.value}
            </mark>
          )
        }
      } else {
        if (part.removed) return null
        if (part.added) {
          return (
            <mark
              key={i}
              className="bg-green-500/20 text-green-300 rounded-[2px] px-[1px] not-italic"
            >
              {part.value}
            </mark>
          )
        }
      }
      return <span key={i} className="text-white/60">{part.value}</span>
    })}
  </span>
)

export default DiffHighlight
