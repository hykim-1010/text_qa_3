'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface UrlInputFormProps {
  mode: 'A' | 'B'
}

const UrlInputForm = ({ mode }: UrlInputFormProps) => {
  const router = useRouter()
  const [figmaSourceUrl, setFigmaSourceUrl] = useState('')
  const [figmaTargetUrl, setFigmaTargetUrl] = useState('')
  const [webUrl, setWebUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'A') {
      if (!figmaSourceUrl.trim() || !figmaTargetUrl.trim()) {
        setError('Figma URL 두 개를 모두 입력해주세요.')
        return
      }
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
      const params = new URLSearchParams({
        mode: 'B',
        src: figmaSourceUrl.trim(),
        web: webUrl.trim(),
      })
      router.push(`/compare?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-lg">
      {mode === 'A' ? (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Figma 기획서 URL
            </label>
            <Input
              placeholder="https://www.figma.com/file/..."
              value={figmaSourceUrl}
              onChange={(e) => setFigmaSourceUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Figma 디자인 시안 URL
            </label>
            <Input
              placeholder="https://www.figma.com/file/..."
              value={figmaTargetUrl}
              onChange={(e) => setFigmaTargetUrl(e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Figma 디자인 시안 URL
            </label>
            <Input
              placeholder="https://www.figma.com/file/..."
              value={figmaSourceUrl}
              onChange={(e) => setFigmaSourceUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">
              실서비스 Web URL
            </label>
            <Input
              placeholder="https://example.com/page"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
            />
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" className="w-full">
        비교 시작
      </Button>
    </form>
  )
}

export default UrlInputForm
