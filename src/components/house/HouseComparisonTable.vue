<script setup>
import { computed } from 'vue'
import { AppCard } from '@/shared/ui'
import {
  formatWon,
  formatArea,
  formatStationWalk,
  formatCommuteRange,
  formatOrFallback,
} from '@/utils/houseFormat'

const props = defineProps({
  houseA: { type: Object, default: null },
  houseB: { type: Object, default: null },
})

function cell(house, formatter) {
  return house ? formatter(house) : '-'
}

function commuteAverage(house) {
  if (!house || house.commuteMinMinutes == null || house.commuteMaxMinutes == null) return null
  return (house.commuteMinMinutes + house.commuteMaxMinutes) / 2
}

// direction: 'asc'면 값이 작을수록, 'desc'면 값이 클수록 더 좋은 항목이다.
function winner(aValue, bValue, direction) {
  if (aValue == null || bValue == null || aValue === bValue) return null
  const aIsBetter = direction === 'asc' ? aValue < bValue : aValue > bValue
  return aIsBetter ? 'a' : 'b'
}

const OPTION_RANK = { 풀옵션: 2, 부분옵션: 1, '옵션 없음': 0 }

function optionRank(house) {
  if (!house) return null
  return OPTION_RANK[house.optionType] ?? null
}

function optionWinner(houseA, houseB) {
  return winner(optionRank(houseA), optionRank(houseB), 'desc')
}

const rows = computed(() => [
  {
    icon: '💰',
    label: '월세',
    a: cell(props.houseA, (h) => formatWon(h.monthlyRent)),
    b: cell(props.houseB, (h) => formatWon(h.monthlyRent)),
    winner: winner(props.houseA?.monthlyRent, props.houseB?.monthlyRent, 'asc'),
  },
  {
    icon: '🏦',
    label: '보증금',
    a: cell(props.houseA, (h) => formatWon(h.deposit)),
    b: cell(props.houseB, (h) => formatWon(h.deposit)),
    winner: winner(props.houseA?.deposit, props.houseB?.deposit, 'asc'),
  },
  {
    icon: '🏢',
    label: '관리비',
    a: cell(props.houseA, (h) => formatWon(h.maintenanceFee)),
    b: cell(props.houseB, (h) => formatWon(h.maintenanceFee)),
    winner: winner(props.houseA?.maintenanceFee, props.houseB?.maintenanceFee, 'asc'),
  },
  {
    icon: '📐',
    label: '면적',
    a: cell(props.houseA, (h) => formatArea(h.area)),
    b: cell(props.houseB, (h) => formatArea(h.area)),
    winner: winner(props.houseA?.area, props.houseB?.area, 'desc'),
  },
  {
    icon: '🚶',
    label: '역까지',
    a: cell(props.houseA, (h) => formatStationWalk(h.stationWalkMinutes)),
    b: cell(props.houseB, (h) => formatStationWalk(h.stationWalkMinutes)),
    winner: winner(props.houseA?.stationWalkMinutes, props.houseB?.stationWalkMinutes, 'asc'),
  },
  {
    icon: '🚌',
    label: '통근시간',
    a: cell(props.houseA, (h) => formatCommuteRange(h.commuteMinMinutes, h.commuteMaxMinutes)),
    b: cell(props.houseB, (h) => formatCommuteRange(h.commuteMinMinutes, h.commuteMaxMinutes)),
    winner: winner(commuteAverage(props.houseA), commuteAverage(props.houseB), 'asc'),
  },
  {
    icon: '🛁',
    label: '옵션',
    a: cell(props.houseA, (h) => formatOrFallback(h.optionType)),
    b: cell(props.houseB, (h) => formatOrFallback(h.optionType)),
    winner: optionWinner(props.houseA, props.houseB),
  },
  {
    icon: '🚪',
    label: '구조',
    a: cell(props.houseA, (h) => formatOrFallback(h.roomStructure)),
    b: cell(props.houseB, (h) => formatOrFallback(h.roomStructure)),
    winner: null,
  },
])
</script>

<template>
  <div>
    <AppCard padding="none" class="overflow-hidden">
      <div
        class="grid grid-cols-3 items-center border-b border-line px-2 py-3 text-center text-sm font-extrabold"
      >
        <span class="rounded-pill bg-amber-100 px-3 py-1 text-amber-700">A집</span>
        <span class="text-muted">항목</span>
        <span class="rounded-pill bg-blue-100 px-3 py-1 text-blue-500">B집</span>
      </div>
      <div
        v-for="row in rows"
        :key="row.label"
        class="grid grid-cols-3 items-center gap-1 border-b border-line px-2 py-2.5 text-center text-sm last:border-b-0"
      >
        <span class="font-bold" :class="row.winner === 'a' ? 'text-brand-primary' : 'text-ink'">{{
          row.a
        }}</span>
        <span class="flex items-center justify-center gap-1 text-sm font-bold text-muted">
          <span aria-hidden="true">{{ row.icon }}</span
          >{{ row.label }}
        </span>
        <span class="font-bold" :class="row.winner === 'b' ? 'text-brand-primary' : 'text-ink'">{{
          row.b
        }}</span>
      </div>
    </AppCard>

    <p class="mt-2 px-1 text-xs leading-relaxed text-muted">
      ※ 통근시간은 등록한 위치를 기준으로 계산한 예상 시간이에요. 상세 주소를 입력하면 더 정확하게
      계산할 수 있어요.<br />
      ※ '정보 없음' 항목은 매물 수정에서 추가할 수 있어요.
    </p>
  </div>
</template>
