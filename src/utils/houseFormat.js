const FALLBACK = '정보 없음'

// deposit/monthlyRent/maintenanceFee 는 원 단위 정수로 내려온다 (예: 500만원 → 5000000).
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
