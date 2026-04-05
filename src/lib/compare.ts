import { diffChars } from 'diff'
import type { TextNode, CompareResult, DiffChar } from '@/types'

/**
 * source와 target TextNode 배열을 순서 기반으로 1:1 매칭하여 비교 결과를 반환한다.
 * - source 길이 > target 길이: 남는 source 노드는 'missing'
 * - source 길이 < target 길이: 남는 target 노드는 'added'
 * - 텍스트 완전 일치: 'match'
 * - 텍스트 불일치: 'mismatch' + diff 정보 포함
 */
export const compareNodes = (
  source: TextNode[],
  target: TextNode[]
): CompareResult[] => {
  const results: CompareResult[] = []
  const maxLen = Math.max(source.length, target.length)

  for (let i = 0; i < maxLen; i++) {
    const src = source[i] ?? null
    const tgt = target[i] ?? null

    if (src === null) {
      // target에만 존재
      results.push({
        id: `added-${i}`,
        sourceNode: null,
        targetNode: tgt,
        status: 'added',
      })
    } else if (tgt === null) {
      // source에만 존재
      results.push({
        id: `missing-${i}`,
        sourceNode: src,
        targetNode: null,
        status: 'missing',
      })
    } else if (src.text === tgt.text) {
      results.push({
        id: `match-${i}`,
        sourceNode: src,
        targetNode: tgt,
        status: 'match',
      })
    } else {
      const rawDiff = diffChars(src.text, tgt.text)
      const diff: DiffChar[] = rawDiff.map((part) => ({
        value: part.value,
        ...(part.added ? { added: true } : {}),
        ...(part.removed ? { removed: true } : {}),
      }))

      results.push({
        id: `mismatch-${i}`,
        sourceNode: src,
        targetNode: tgt,
        status: 'mismatch',
        diff,
      })
    }
  }

  return results
}
