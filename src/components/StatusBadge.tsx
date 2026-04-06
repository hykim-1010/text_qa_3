import type { MatchStatus } from '@/types'

interface StatusBadgeProps {
  status: MatchStatus
}

const CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  match:    { label: '일치',   className: 'bg-green-500/10  border-green-500/20  text-green-400'  },
  mismatch: { label: '불일치', className: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
  missing:  { label: '누락',   className: 'bg-red-500/10    border-red-500/20    text-red-400'    },
  added:    { label: '추가',   className: 'bg-blue-500/10   border-blue-500/20   text-blue-400'   },
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { label, className } = CONFIG[status]
  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'font-mono text-[11px] font-semibold tracking-wider uppercase',
        'px-2 py-0.5 rounded border',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}

export default StatusBadge
