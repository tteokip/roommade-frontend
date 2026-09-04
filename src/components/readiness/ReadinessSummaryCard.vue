<script setup>
import { computed } from 'vue'

import { AppCard } from '@/shared/ui'

const props = defineProps({
  diagnosis: { type: Object, required: true },
})

const scoreBreakdown = computed(() => [
  {
    label: '월세',
    score: Math.round(props.diagnosis.rirScore),
  },
  {
    label: '보증금',
    score: Math.round(props.diagnosis.depositScore),
  },
  {
    label: '집 비교',
    score: Math.round(props.diagnosis.houseComparisonScore),
  },
])

const displayScore = computed(() =>
  scoreBreakdown.value.reduce((total, item) => total + item.score, 0),
)
const displayMaxScore = computed(() => Math.round(props.diagnosis.maxScore))
const progress = computed(() => {
  if (displayMaxScore.value <= 0) return 0

  return Math.min(Math.max((displayScore.value / displayMaxScore.value) * 100, 0), 100)
})

const progressStyle = computed(() => ({
  width: `${progress.value}%`,
}))

const scoreFormulaLabel = computed(
  () =>
    `${scoreBreakdown.value.map((item) => `${item.label} ${item.score}점`).join(' 더하기 ')}, 총 ${displayScore.value}점`,
)
</script>

<template>
  <AppCard variant="soft" padding="none" class="overflow-hidden !rounded-[1.75rem] !bg-[#eee7ff]">
    <div class="px-5 py-4 sm:px-6 sm:py-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-base font-bold text-muted">내 자립 준비도</p>
          <p class="mt-1.5 flex items-end leading-none">
            <strong class="text-5xl font-black tracking-tight text-[#241259]">
              {{ displayScore }}
            </strong>
            <span class="mb-1 ml-1 text-2xl font-extrabold text-[#a8adbc]">
              /{{ displayMaxScore }}
            </span>
          </p>
        </div>
        <span class="mt-1 text-5xl" aria-hidden="true">📋</span>
      </div>

      <div
        class="mt-4 h-2 overflow-hidden rounded-pill bg-white/80"
        role="progressbar"
        aria-label="자립 준비도"
        aria-valuemin="0"
        :aria-valuemax="displayMaxScore"
        :aria-valuenow="displayScore"
      >
        <span
          class="block h-full rounded-pill bg-gradient-to-r from-brand-primary-dark to-violet-400 transition-[width] duration-500"
          :style="progressStyle"
        />
      </div>

      <dl
        class="mt-4 grid grid-cols-3 rounded-control bg-white/65 py-3"
        :aria-label="scoreFormulaLabel"
      >
        <div
          v-for="(item, index) in scoreBreakdown"
          :key="item.label"
          class="relative px-2 text-center"
        >
          <span
            v-if="index > 0"
            class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-bold text-brand-primary/60"
            aria-hidden="true"
          >
            +
          </span>
          <dt class="text-xs font-bold text-muted">{{ item.label }}</dt>
          <dd class="mt-1 whitespace-nowrap text-sm font-extrabold text-brand-primary">
            {{ item.score }}점
          </dd>
        </div>
      </dl>

      <p class="mt-3 text-base font-extrabold text-ink">독립을 향해 잘 준비하고 있어요!</p>
      <p class="mt-0.5 text-sm text-muted">항목을 눌러 부족한 점수를 확인해보세요.</p>
    </div>
  </AppCard>
</template>
