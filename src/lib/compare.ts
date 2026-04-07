import { compareTwoStrings } from 'string-similarity'

export type PairStatus = 'pass' | 'needs_edit' | 'figma_only' | 'web_only'

export interface ComparePair {
  figmaText: string | null
  webText: string | null
  status: PairStatus
  similarity?: number
}

// 짝 허용 최소 유사도 (이 값 미만이면 매칭 안 함)
const SIMILARITY_NEEDS_EDIT = 0.8

function normalizeForPairing(s: string): string {
  return s.replace(/[\u200B\u200C\u200D\uFEFF]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// Pass 판정용 — 제로폭 문자 제거 후 줄바꿈/연속 공백을 단일 공백으로 정규화
function normalizeForPass(s: string): string {
  return s
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/\s*[\n\r]+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildComparePairs(figmaTexts: string[], webTexts: string[]): ComparePair[] {
  const figmaForPairing = figmaTexts.map(normalizeForPairing)
  const webForPairing = webTexts.map(normalizeForPairing)

  // 각 Figma 항목에 대해 가장 유사한 Web 후보 수집
  const candidates: Array<{ fi: number; wi: number; sim: number }> = []
  for (let fi = 0; fi < figmaTexts.length; fi++) {
    if (!figmaForPairing[fi]) continue
    let bestWi = -1
    let bestSim = -1
    for (let wi = 0; wi < webTexts.length; wi++) {
      if (!webForPairing[wi]) continue
      const sim = compareTwoStrings(figmaForPairing[fi], webForPairing[wi])
      if (sim > bestSim) {
        bestSim = sim
        bestWi = wi
      }
    }
    if (bestWi >= 0) candidates.push({ fi, wi: bestWi, sim: bestSim })
  }

  // 유사도 내림차순 정렬 후 1:1 매칭 확정
  candidates.sort((a, b) => b.sim - a.sim)

  const figmaUsed = new Set<number>()
  const webUsed = new Set<number>()
  const pairs: ComparePair[] = []

  for (const { fi, wi, sim } of candidates) {
    if (figmaUsed.has(fi) || webUsed.has(wi)) continue
    if (sim < SIMILARITY_NEEDS_EDIT) continue

    figmaUsed.add(fi)
    webUsed.add(wi)

    const figmaOriginal = figmaTexts[fi]
    const webOriginal = webTexts[wi]
    const status = normalizeForPass(figmaOriginal) === normalizeForPass(webOriginal) ? 'pass' : 'needs_edit'

    pairs.push({ figmaText: figmaOriginal, webText: webOriginal, status, similarity: sim })
  }

  // 매칭 안 된 Figma → figma_only
  for (let fi = 0; fi < figmaTexts.length; fi++) {
    if (!figmaUsed.has(fi) && figmaForPairing[fi]) {
      pairs.push({ figmaText: figmaTexts[fi], webText: null, status: 'figma_only' })
    }
  }

  // 매칭 안 된 Web → web_only
  for (let wi = 0; wi < webTexts.length; wi++) {
    if (!webUsed.has(wi) && webForPairing[wi]) {
      pairs.push({ figmaText: null, webText: webTexts[wi], status: 'web_only' })
    }
  }

  return pairs
}
