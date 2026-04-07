import type { DiffChar } from '@/types'

interface DiffHighlightProps {
  diffs: DiffChar[]
  side: 'source' | 'target'
}

const DiffHighlight = ({ diffs, side }: DiffHighlightProps) => (
  <span className="font-mono text-base leading-[1.4] break-all whitespace-pre-wrap">
    {diffs.map((part, i) => {
      // source(Figma) 쪽: removed 강조, added는 숨김
      // target(Web) 쪽: added 강조, removed는 숨김
      if (side === 'source') {
        if (part.added) return null
        if (part.removed) {
          return (
            <mark key={i} className="bg-red-100 text-red-700 rounded-[2px] px-[1px] not-italic">
              {part.value}
            </mark>
          )
        }
      } else {
        if (part.removed) return null
        if (part.added) {
          return (
            <mark key={i} className="bg-green-100 text-green-700 rounded-[2px] px-[1px] not-italic">
              {part.value}
            </mark>
          )
        }
      }
      return <span key={i} className="text-gray-800">{part.value}</span>
    })}
  </span>
)

export default DiffHighlight
