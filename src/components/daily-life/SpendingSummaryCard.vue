<script setup>
import { computed } from 'vue'
import { AppCard } from '@/shared/ui'
import AccordionItem from './AccordionItem.vue'

const props = defineProps({
  thisMonthTotal: { type: Number, required: true },
  sameDayLastMonthTotal: { type: Number, required: true },
  differenceFromLastMonth: { type: Number, required: true },
  dailyBreakdown: { type: Array, required: true },
  lastMonthDailyBreakdown: { type: Array, required: true },
  month: { type: String, default: `${new Date().getMonth() + 1}월` },
  previousMonth: {
    type: String,
    default: `${((new Date().getMonth() + 11) % 12) + 1}월`,
  },
})

const trendPercent = computed(() => {
  if (!props.sameDayLastMonthTotal) return null
  return Math.round((Math.abs(props.differenceFromLastMonth) / props.sameDayLastMonthTotal) * 100)
})

// 백엔드가 날짜를 ISO 문자열("2026-08-30") 또는 Jackson 배열([2026, 8, 30])로 내려줄 수 있어
// 둘 다 다룰 수 있게 통일한다.
function toDayOfMonth(value) {
  if (Array.isArray(value)) return value[2]
  return new Date(value).getDate()
}
function toComparableDate(value) {
  if (Array.isArray(value)) {
    const [year, month, day] = value
    return new Date(year, month - 1, day).getTime()
  }
  return new Date(value).getTime()
}

// 하루 지출 배열을 "일자별 누적 합계" 배열로 바꾼다.
function toCumulative(breakdown, endDay) {
  const sorted = [...breakdown].sort(
    (a, b) => toComparableDate(a.spendingDate) - toComparableDate(b.spendingDate),
  )
  let running = 0
  const cumulative = sorted
    .filter((item) => toDayOfMonth(item.spendingDate) <= endDay)
    .map((item) => {
      running += item.totalAmount
      return { day: toDayOfMonth(item.spendingDate), value: running }
    })

  const lastPoint = cumulative.at(-1)
  if (lastPoint && lastPoint.day < endDay) {
    cumulative.push({ day: endDay, value: lastPoint.value })
  }

  return cumulative
}

const currentDay = new Date().getDate()
const daysInMonth = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
})
const daysInLastMonth = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 0).getDate()
})
// 저번달이 이번달보다 길 수 있어(예: 8월→9월), 저번달 그래프가 잘리지 않도록
// 두 달 중 더 긴 쪽을 기준으로 x축을 잡는다.
const xAxisDayCount = computed(() => Math.max(daysInMonth.value, daysInLastMonth.value))

const thisMonthCumulative = computed(() => toCumulative(props.dailyBreakdown, currentDay))
const lastMonthCumulative = computed(() =>
  toCumulative(props.lastMonthDailyBreakdown, daysInLastMonth.value),
)

const sharedMax = computed(() =>
  Math.max(
    thisMonthCumulative.value.at(-1)?.value ?? 0,
    lastMonthCumulative.value.at(-1)?.value ?? 0,
    1,
  ),
)

const CHART_WIDTH = 140
const CHART_HEIGHT = 90

function toPolyline(points) {
  if (points.length < 2) return ''
  return points
    .map((p) => {
      const x = ((p.day - 1) / (xAxisDayCount.value - 1)) * CHART_WIDTH
      const y = CHART_HEIGHT - 4 - (p.value / sharedMax.value) * (CHART_HEIGHT - 8)
      return `${x},${y}`
    })
    .join(' ')
}

const thisMonthPolyline = computed(() => toPolyline(thisMonthCumulative.value))
const lastMonthPolyline = computed(() => toPolyline(lastMonthCumulative.value))
const lastMonthAreaPoints = computed(() => {
  if (!lastMonthPolyline.value) return ''
  return `${lastMonthPolyline.value} ${CHART_WIDTH},${CHART_HEIGHT} 0,${CHART_HEIGHT}`
})
const hasChartData = computed(
  () => thisMonthCumulative.value.length >= 2 || lastMonthCumulative.value.length >= 2,
)

const markerPosition = computed(() => {
  const last = thisMonthCumulative.value.at(-1)
  if (!last) return null
  return {
    x: ((last.day - 1) / (xAxisDayCount.value - 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - 4 - (last.value / sharedMax.value) * (CHART_HEIGHT - 8),
  }
})
</script>

<template>
  <AppCard padding="sm">
    <AccordionItem default-open>
      <template #trigger="{ open }">
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
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="2.5"
          class="shrink-0 transition-transform"
          :class="open ? 'rotate-180' : ''"
        >
          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>

      <div class="mt-4 flex gap-4">
        <div class="flex w-1/2 flex-col justify-between gap-4">
          <div class="flex flex-1 flex-col justify-center pt-1">
            <p class="mb-1.5 text-[15px] font-medium text-muted">이번 달 총 지출</p>
            <p class="text-[28px] font-black leading-none text-brand-primary">
              {{ thisMonthTotal.toLocaleString() }}원
            </p>
          </div>
          <div
            class="-translate-x-2 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-3.5 py-1"
          >
            <div class="flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-red-50">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                stroke-width="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-medium text-muted">지난달 대비</p>
              <p class="text-[17px] font-extrabold leading-tight text-red-500">
                {{ differenceFromLastMonth.toLocaleString() }}원
              </p>
              <p v-if="trendPercent !== null" class="text-[13px] text-muted">
                {{ differenceFromLastMonth > 0 ? '↑' : '↓' }} {{ trendPercent }}%
              </p>
            </div>
          </div>
        </div>

        <div class="flex w-1/2 flex-col">
          <template v-if="hasChartData">
            <div class="mb-1 flex items-center justify-end gap-2.5 text-[10px]">
              <span class="flex items-center gap-1 font-bold text-rose-500"
                ><span class="h-0.5 w-3 bg-rose-500" />{{ month }}</span
              >
              <span class="flex items-center gap-1 text-muted"
                ><span class="h-0.5 w-3 bg-gray-300" />{{ previousMonth }}</span
              >
            </div>
            <svg
              :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
              class="h-24 w-full flex-1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="last-month-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#e5e7eb" stop-opacity="0.55" />
                  <stop offset="100%" stop-color="#f9fafb" stop-opacity="0.12" />
                </linearGradient>
              </defs>
              <polygon
                v-if="lastMonthAreaPoints"
                :points="lastMonthAreaPoints"
                fill="url(#last-month-area)"
              />
              <polyline
                v-if="lastMonthPolyline"
                :points="lastMonthPolyline"
                fill="none"
                stroke="#d1d5db"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                v-if="thisMonthPolyline"
                :points="thisMonthPolyline"
                fill="none"
                stroke="#f43f5e"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                v-if="markerPosition"
                :cx="markerPosition.x"
                :cy="markerPosition.y"
                r="4"
                fill="#f43f5e"
                fill-opacity="0.35"
              />
              <circle
                v-if="markerPosition"
                :cx="markerPosition.x"
                :cy="markerPosition.y"
                r="2.5"
                fill="#f43f5e"
              />
            </svg>
            <div class="mt-1 flex justify-between text-[10px] text-muted">
              <span>{{ month }}.1</span>
              <span>{{ month }}.{{ daysInMonth }}</span>
            </div>
          </template>
          <p v-else class="flex flex-1 items-center text-xs text-muted">아직 지출 내역이 없어요.</p>
        </div>
      </div>
    </AccordionItem>
  </AppCard>
</template>
