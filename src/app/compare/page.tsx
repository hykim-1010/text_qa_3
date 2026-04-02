export default function ComparePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0a0a' }}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.3" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.3" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.12" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.12" />
          </svg>
        </div>
        <p className="text-[13px] text-white/30 font-mono">결과 뷰어 — Phase 5에서 구현 예정</p>
      </div>
    </main>
  )
}
