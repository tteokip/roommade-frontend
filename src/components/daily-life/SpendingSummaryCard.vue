<script setup>
import { computed } from 'vue'

const props = defineProps({
  thisMonthTotal: { type: Number, required: true },
  sameDayLastMonthTotal: { type: Number, required: true },
  differenceFromLastMonth: { type: Number, required: true },
  dailyBreakdown: { type: Array, required: true },
})

const monthLabel = `${new Date().getMonth() + 1}월`

const trendLabel = computed(() => (props.differenceFromLastMonth > 0 ? '더 쓰는 중' : '덜 쓰는 중'))
const trendAmount = computed(
  () => `${Math.round(Math.abs(props.differenceFromLastMonth) / 10000)}만원`,
)
const trendPercent = computed(() => {
  if (!props.sameDayLastMonthTotal) return null
  return Math.round((Math.abs(props.differenceFromLastMonth) / props.sameDayLastMonthTotal) * 100)
})

// 백엔드가 날짜를 ISO 문자열("2026-08-30") 또는 Jackson 배열([2026, 8, 30])로 내려줄 수 있어
// 둘 다 비교 가능한 값으로 바꾼다.
function toComparableDate(value) {
  if (Array.isArray(value)) {
    const [year, month, day] = value
    return new Date(year, month - 1, day).getTime()
  }
  return new Date(value).getTime()
}

const cumulativePoints = computed(() => {
  const sorted = [...props.dailyBreakdown].sort(
    (a, b) => toComparableDate(a.spendingDate) - toComparableDate(b.spendingDate),
  )
  let running = 0
  return sorted.map((item) => {
    running += item.totalAmount
    return running
  })
})

const chartPolyline = computed(() => {
  const points = cumulativePoints.value
  if (points.length < 2) return ''
  const max = Math.max(...points, 1)
  return points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * 140
      const y = 46 - (value / max) * 40
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<template>
  <div class="rounded-3xl border border-gray-100 bg-white p-5 shadow-card">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="flex size-9 items-center justify-center rounded-[10px] bg-violet-100">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            stroke-width="2"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </div>
        <span class="text-[15px] font-extrabold text-ink">생활비 현황</span>
      </div>
      <span class="text-xs font-semibold text-muted">{{ monthLabel }}</span>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex-1">
        <p class="mb-1 text-xs font-medium text-muted">이번 달 총 지출</p>
        <p class="text-[26px] font-black leading-none text-brand-primary">
          {{ thisMonthTotal.toLocaleString() }}원
        </p>
      </div>
      <div class="flex-1">
        <template v-if="chartPolyline">
          <p class="mb-1 text-[11px] leading-tight text-body">
            지난달 같은 날보다 <strong class="font-bold text-rose-500">{{ trendAmount }}</strong
            ><br />{{ trendLabel }}
          </p>
          <svg viewBox="0 0 140 50" class="w-full" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              :points="chartPolyline"
              fill="none"
              stroke="#f43f5e"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </template>
        <p v-else class="text-xs text-muted">아직 이번 달 지출 내역이 없어요.</p>
      </div>
    </div>

    <div
      class="mt-4 flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-gray-50 px-3.5 py-3"
    >
      <div class="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-red-50">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          stroke-width="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <div>
        <p class="text-[11px] font-medium text-muted">지난달 같은 날 대비</p>
        <p class="text-[13px] font-extrabold text-red-500">
          {{ differenceFromLastMonth.toLocaleString() }}원
        </p>
        <p v-if="trendPercent !== null" class="text-[11px] text-muted">
          {{ differenceFromLastMonth > 0 ? '↑' : '↓' }} {{ trendPercent }}%
        </p>
      </div>
    </div>
  </div>
</template>
