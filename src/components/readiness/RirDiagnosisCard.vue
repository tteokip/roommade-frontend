<script setup>
import { computed, ref } from 'vue'

import { AppCard } from '@/shared/ui'
import { InfoIcon } from '@/shared/ui/icons'

const props = defineProps({
  diagnosis: { type: Object, required: true },
})

const isExpanded = ref(true)
const isInfoVisible = ref(false)

const statusLabel = computed(
  () =>
    ({
      NORMAL: '적정',
      EXCESSIVE: '주의',
      SEVERE: '심각',
    })[props.diagnosis.status] ?? '진단',
)

const statusClass = computed(
  () =>
    ({
      NORMAL: 'bg-emerald-50 text-emerald-600',
      EXCESSIVE: 'bg-amber-50 text-amber-600',
      SEVERE: 'bg-red-50 text-danger',
    })[props.diagnosis.status] ?? 'bg-slate-100 text-muted',
)

const targetGap = computed(() =>
  Math.max(props.diagnosis.rirPercent - props.diagnosis.targetRirPercent, 0),
)

const displayTargetGap = computed(() => Math.ceil(targetGap.value))
const displayRirPercent = computed(() => Math.round(props.diagnosis.rirPercent))

const headline = computed(() => {
  const targetPercent = `${formatNumber(props.diagnosis.targetRirPercent)}%`

  if (props.diagnosis.status === 'NORMAL') {
    return {
      targetPercent,
      middleText: '이하를 달성했어요!',
      gapPercent: null,
      endText: '',
    }
  }

  return {
    targetPercent,
    middleText: '이하까지',
    gapPercent: `${formatNumber(displayTargetGap.value)}%`,
    endText: '남았어요!',
  }
})

const markerPercent = computed(() => Math.min(Math.max(props.diagnosis.achievementRate, 0), 88))
const markerStyle = computed(() => ({
  left: `${markerPercent.value}%`,
}))
const markerLabelClass = computed(() => {
  if (markerPercent.value >= 80) return '-translate-x-full'
  if (markerPercent.value <= 20) return 'translate-x-0'
  return '-translate-x-1/2'
})

const guidance = computed(() => {
  if (props.diagnosis.requiredRentReduction === 0) {
    return {
      message: '현재 월세 수준이면 목표 RIR을 달성할 수 있어요!',
      reductionAmount: null,
      targetPercent: null,
    }
  }

  return {
    message: null,
    reductionAmount: formatAmount(props.diagnosis.requiredRentReduction),
    targetPercent: `${formatNumber(props.diagnosis.targetRirPercent)}%`,
  }
})

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(value)
}

function formatAmount(value) {
  if (value >= 10_000) {
    return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(value / 10_000)}만원`
  }

  return `${new Intl.NumberFormat('ko-KR').format(value)}원`
}
</script>

<template>
  <AppCard padding="sm" variant="outlined">
    <div>
      <div class="flex w-full items-center gap-3">
        <span class="shrink-0 text-2xl" aria-hidden="true">🎯</span>
        <span class="min-w-0 flex-1">
          <span class="flex flex-wrap items-center gap-1">
            <span class="font-extrabold text-ink">월세 부담 RIR</span>
            <span class="relative inline-flex">
              <button
                type="button"
                class="grid size-6 place-items-center rounded-full text-muted outline-none transition-colors hover:text-body focus-visible:ring-4 focus-visible:ring-brand-primary/20"
                aria-label="RIR 설명 보기"
                :aria-expanded="isInfoVisible"
                aria-controls="rir-info-tooltip"
                @click="isInfoVisible = !isInfoVisible"
              >
                <InfoIcon class="size-5" />
              </button>
              <span
                v-if="isInfoVisible"
                id="rir-info-tooltip"
                role="tooltip"
                class="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-control bg-white px-3 py-2 text-xs font-medium leading-5 text-muted shadow-card ring-1 ring-line"
              >
                <span class="block">
                  RIR은 월 소득에서 월세가 차지하는 비율이에요. 숫자가 낮을수록 월세 부담이 적어요.
                </span>
                <span class="mt-2 block border-t border-line pt-2">
                  RIR {{ formatNumber(diagnosis.targetRirPercent) }}% 이하는 적정 수준,<br />
                  {{ formatNumber(diagnosis.targetRirPercent) }}% 초과 50% 미만은 주의,<br />
                  50% 이상은 심각한 부담으로 봐요.
                </span>
              </span>
            </span>
            <span class="rounded-pill px-2 py-1 text-xs font-bold" :class="statusClass">
              {{ statusLabel }}
            </span>
          </span>
          <span class="mt-1 flex items-center">
            <span class="block whitespace-nowrap text-[clamp(0.6875rem,3vw,0.75rem)] text-muted">
              월세 {{ formatAmount(diagnosis.expectedMonthlyRent) }} · 소득 대비
              {{ formatNumber(displayRirPercent) }}%
            </span>
          </span>
        </span>
        <button
          type="button"
          class="flex shrink-0 items-center rounded-control text-right outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20"
          :aria-expanded="isExpanded"
          aria-controls="rir-diagnosis-details"
          :aria-label="isExpanded ? 'RIR 진단 접기' : 'RIR 진단 펼치기'"
          @click="isExpanded = !isExpanded"
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5 shrink-0 text-muted transition-transform"
            :class="isExpanded && 'rotate-180'"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <AppCard
        v-show="isExpanded"
        id="rir-diagnosis-details"
        padding="none"
        variant="flat"
        class="mt-6 !rounded-control !bg-[#f8f7fc]"
      >
        <div class="py-5">
          <div class="px-4">
            <div class="relative mt-14">
              <div
                class="h-3 rounded-pill bg-gradient-to-r from-red-500 via-fuchsia-500 to-violet-600"
              />
              <span
                class="absolute bottom-[calc(100%+2.25rem)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[clamp(0.6875rem,3vw,0.8125rem)] font-extrabold leading-5 text-ink"
              >
                목표 RIR
                <span>{{ headline.targetPercent }}</span>
                {{ headline.middleText }}
                <span v-if="headline.gapPercent" class="text-sm text-brand-primary">
                  {{ headline.gapPercent }}
                </span>
                {{ headline.endText }}
              </span>
              <span
                class="absolute bottom-[calc(100%+0.5rem)] whitespace-nowrap rounded-pill bg-white px-3 py-1 text-xs font-extrabold text-ink shadow-card ring-1 ring-line"
                :class="markerLabelClass"
                :style="markerStyle"
              >
                현재 {{ formatNumber(displayRirPercent) }}%
              </span>
              <span
                class="absolute top-1/2 block size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-primary shadow-floating"
                :style="markerStyle"
              />
            </div>

            <div class="mt-4 flex justify-between gap-4 text-xs font-extrabold sm:text-sm">
              <p class="text-danger">
                심각한 부담<br />
                50% 이상
              </p>
              <p class="text-right text-brand-primary">
                적정<br />
                {{ formatNumber(diagnosis.targetRirPercent) }}% 이하
              </p>
            </div>

            <div class="mt-6 flex items-center gap-2 rounded-control bg-brand-lavender px-3 py-4">
              <span class="text-base" aria-hidden="true">💡</span>
              <p class="text-[clamp(0.6875rem,3vw,0.8125rem)] leading-5 text-body">
                <template v-if="guidance.message">{{ guidance.message }}</template>
                <template v-else>
                  {{ '월세를 '
                  }}<span class="text-sm font-extrabold text-brand-primary">{{
                    guidance.reductionAmount
                  }}</span
                  >{{ ' 낮추면' }}<br />
                  {{ `RIR ${guidance.targetPercent} 이하로 달성할 수 있어요!` }}
                </template>
              </p>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </AppCard>
</template>
