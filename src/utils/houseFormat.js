const FALLBACK = '정보 없음'

export function formatWon(amountWon) {
  if (amountWon === null || amountWon === undefined) return FALLBACK

  const man = Math.round(amountWon / 10000)
  const eok = Math.floor(man / 10000)
  const remainder = man % 10000

  if (eok > 0) {
    return remainder > 0 ? `${eok}억 ${remainder.toLocaleString()}만원` : `${eok}억원`
  }
  return `${man.toLocaleString()}만원`
}

export function formatArea(area) {
  if (area === null || area === undefined) return FALLBACK
  return `${Number(area)}㎡`
}

export function formatStationWalk(minutes) {
  if (minutes === null || minutes === undefined) return FALLBACK
  return `도보 ${minutes}분`
}

export function formatCommuteRange(minMinutes, maxMinutes) {
  if (
    minMinutes === null ||
    minMinutes === undefined ||
    maxMinutes === null ||
    maxMinutes === undefined
  ) {
    return FALLBACK
  }
  return minMinutes === maxMinutes ? `약 ${minMinutes}분` : `${minMinutes}~${maxMinutes}분`
}

export function formatOrFallback(value) {
  return value === null || value === undefined || value === '' ? FALLBACK : value
}

export function wonToManwonInput(amountWon) {
  if (amountWon === null || amountWon === undefined) return ''
  return String(amountWon / 10000)
}

export function manwonInputToWon(manwonText) {
  const trimmed = String(manwonText ?? '').trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? Math.round(parsed * 10000) : NaN
}

// 집 비교 표·매물 등록 폼과 동일한 아이콘/라벨을 밸런스게임에서도 그대로 사용한다.
// example은 밸런스게임 질문에서 해당 조건을 고르면 실생활에서 어떤 점이 좋은지 보여주는 문구다.
const COMPARISON_FACTOR_META = {
  DEPOSIT: { icon: '🏦', label: '보증금', example: '처음 마련할 목돈 부담이 줄어요' },
  MONTHLY_COST: {
    icon: '💰',
    label: '월세·관리비',
    example: '매달 생활비에 쓸 돈을 더 남길 수 있어요',
  },
  COMMUTE: { icon: '🚌', label: '통근시간', example: '출퇴근 시간을 아낄 수 있어요' },
  STATION: { icon: '🚶', label: '역까지 거리', example: '약속이나 외출이 편해져요' },
  AREA: { icon: '📐', label: '면적', example: '수납과 생활 공간에 여유가 생겨요' },
  OPTION: { icon: '🛁', label: '옵션', example: '가전·가구를 따로 준비할 일이 줄어요' },
}

export function formatComparisonFactor(factor) {
  return COMPARISON_FACTOR_META[factor] ?? { icon: '❔', label: factor }
}

// 점수 차이에 따라 취향에 가까운 정도를 과장 없이 다르게 표현한다.
export function formatBalanceGameHeadline({ result, houseAScore, houseBScore }) {
  if (result === 'TIE') return { text: '두 집 모두 취향에 잘 맞아요!' }

  const winnerScore = result === 'A' ? houseAScore : houseBScore
  const loserScore = result === 'A' ? houseBScore : houseAScore
  const total = winnerScore + loserScore
  const margin = total === 0 ? 0 : (winnerScore - loserScore) / total
  const houseLabel = `${result}집`

  if (margin >= 0.6) return { text: `${houseLabel}이 취향에 훨씬 더 가까워요!` }
  if (margin <= 0.2) return { text: `${houseLabel}이 취향에 조금 더 가까워요!` }
  return { text: `${houseLabel}이 취향에 더 가까워요!` }
}
