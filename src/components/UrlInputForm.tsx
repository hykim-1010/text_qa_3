'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UrlInputFormProps {
  mode: 'A' | 'B'
}

interface FieldProps {
  label: string
  hint?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  index: number
}

const Field = ({ label, hint, placeholder, value, onChange, index }: FieldProps) => (
  <div
    className="flex flex-col gap-2"
    style={{ animation: `fadeSlideIn 200ms ${index * 60}ms ease both` }}
  >
    <div className="flex items-baseline justify-between gap-2">
      <label className="text-[15px] font-medium text-white/60">{label}</label>
      {hint && (
        <span className="font-mono text-[12px] text-white/25">{hint}</span>
      )}
    </div>
    <div className="relative">
      <input
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={[
          'w-full h-11 rounded-md px-3.5 text-[15px] font-mono',
          'bg-white/[0.04] border border-white/[0.09] text-white/80',
          'placeholder:text-white/20',
          'transition-all duration-150',
          'focus:outline-none focus:border-[#5e6ad2]/60 focus:bg-[#5e6ad2]/[0.04]',
          'focus:ring-1 focus:ring-[#5e6ad2]/30',
        ].join(' ')}
      />
    </div>
  </div>
)

const UrlInputForm = ({ mode }: UrlInputFormProps) => {
  const router = useRouter()
  const [figmaSourceUrl, setFigmaSourceUrl] = useState('')
  const [figmaTargetUrl, setFigmaTargetUrl] = useState('')
  const [webUrl, setWebUrl] = useState('')
  const [excludeHeaderFooter, setExcludeHeaderFooter] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'A') {
      if (!figmaSourceUrl.trim() || !figmaTargetUrl.trim()) {
        setError('Figma URL 두 개를 모두 입력해주세요.')
        return
      }
      setLoading(true)
      const params = new URLSearchParams({
        mode: 'A',
        src: figmaSourceUrl.trim(),
        tgt: figmaTargetUrl.trim(),
      })
      router.push(`/compare?${params.toString()}`)
    } else {
      if (!figmaSourceUrl.trim() || !webUrl.trim()) {
        setError('Figma URL과 Web URL을 모두 입력해주세요.')
        return
      }
      setLoading(true)
      const params = new URLSearchParams({
        mode: 'B',
        src: figmaSourceUrl.trim(),
        web: webUrl.trim(),
        ehf: excludeHeaderFooter ? 'true' : 'false',
      })
      router.push(`/compare?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'A' ? (
        <>
          <Field
            index={0}
            label="Figma 기획서 URL"
            hint="Source"
            placeholder="https://www.figma.com/file/..."
            value={figmaSourceUrl}
            onChange={setFigmaSourceUrl}
          />
          <Field
            index={1}
            label="Figma 디자인 시안 URL"
            hint="Target"
            placeholder="https://www.figma.com/file/..."
            value={figmaTargetUrl}
            onChange={setFigmaTargetUrl}
          />
        </>
      ) : (
        <>
          <Field
            index={0}
            label="Figma 디자인 시안 URL"
            hint="Source"
            placeholder="https://www.figma.com/file/..."
            value={figmaSourceUrl}
            onChange={setFigmaSourceUrl}
          />
          <Field
            index={1}
            label="실서비스 Web URL"
            hint="Target"
            placeholder="https://example.com/page"
            value={webUrl}
            onChange={setWebUrl}
          />
        </>
      )}

      {mode === 'B' && (
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={excludeHeaderFooter}
              onChange={(e) => setExcludeHeaderFooter(e.target.checked)}
              className="sr-only"
            />
            <div
              className={[
                'w-4 h-4 rounded flex items-center justify-center border transition-all duration-150',
                excludeHeaderFooter
                  ? 'bg-[#5e6ad2] border-[#5e6ad2]'
                  : 'bg-white/[0.04] border-white/[0.15] group-hover:border-white/30',
              ].join(' ')}
            >
              {excludeHeaderFooter && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5 3.5 6 8 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[14px] text-white/50 group-hover:text-white/70 transition-colors duration-150">
            헤더/푸터/내비게이션 제외
          </span>
        </label>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 text-red-400">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <p className="text-[14px] text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={[
          'h-11 rounded-md px-5 text-[15px] font-medium transition-all duration-150',
          'flex items-center justify-center gap-2',
          loading
            ? 'bg-[#5e6ad2]/50 text-white/40 cursor-not-allowed'
            : 'bg-[#5e6ad2] text-white hover:bg-[#6b77d9] active:bg-[#5360c4]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]',
        ].join(' ')}
      >
        {loading ? (
          <>
            <svg
              width="13" height="13" viewBox="0 0 13 13"
              className="animate-spin"
              fill="none"
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
              <path d="M6.5 1.5A5 5 0 0 1 11.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            분석 중…
          </>
        ) : (
          <>
            비교 시작
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5h8M7.5 4 10 6.5 7.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </form>
  )
}

export default UrlInputForm
