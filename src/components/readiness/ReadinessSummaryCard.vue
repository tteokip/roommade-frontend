<script setup>
import { computed } from 'vue'

import furnitureCouponTicketIcon from '@/assets/furniture-coupon-ticket-icon.png'
import { FURNITURE_REWARD_STAGES } from '@/constants/furnitureRewards'
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

const readinessScore = computed(() => Number(props.diagnosis.readinessScore))
const displayScore = computed(() => Math.round(readinessScore.value))
const displayMaxScore = computed(() => Math.round(props.diagnosis.maxScore))
const progress = computed(() => {
  if (displayMaxScore.value <= 0) return 0

  return Math.min(Math.max((readinessScore.value / displayMaxScore.value) * 100, 0), 100)
})

const progressStyle = computed(() => ({
  width: `${progress.value}%`,
}))

const rewardMilestones = computed(() => {
  const achievedStages = FURNITURE_REWARD_STAGES.filter((stage) => readinessScore.value >= stage)
  const latestAchievedStage = achievedStages.at(-1)

  return FURNITURE_REWARD_STAGES.map((stage) => ({
    stage,
    achieved: readinessScore.value >= stage,
    latest: stage === latestAchievedStage,
    position: `${Math.min((stage / displayMaxScore.value) * 100, 100)}%`,
  }))
})

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

      <div class="mt-6 pb-10">
        <div class="relative">
          <div
            class="h-2 rounded-pill bg-white/80"
            role="progressbar"
            aria-label="자립 준비도"
            aria-valuemin="0"
            :aria-valuemax="displayMaxScore"
            :aria-valuenow="readinessScore"
          >
            <span
              class="block h-full rounded-pill bg-gradient-to-r from-brand-primary-dark to-violet-400 transition-[width] duration-500"
              :style="progressStyle"
            />
          </div>

          <ol class="absolute inset-0" aria-label="가구 선택권 보상 단계">
            <li
              v-for="milestone in rewardMilestones"
              :key="milestone.stage"
              class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              :style="{ left: milestone.position }"
            >
              <span
                class="relative grid size-5 place-items-center rounded-full border bg-white transition-colors"
                :class="[
                  milestone.achieved ? 'border-brand-primary' : 'border-white',
                  milestone.latest && 'shadow-[0_0_0_4px_rgb(139_92_246/0.12)]',
                ]"
              >
                <img
                  :src="furnitureCouponTicketIcon"
                  alt=""
                  class="h-3 w-[15px] object-contain"
                  :class="milestone.achieved ? 'opacity-100' : 'opacity-40 grayscale'"
                  aria-hidden="true"
                />
              </span>
              <span
                class="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap text-xs font-extrabold"
                :class="milestone.achieved ? 'text-body' : 'text-muted'"
              >
                {{ milestone.stage }}%
              </span>
              <span class="sr-only">
                {{ milestone.stage }}% 보상 {{ milestone.achieved ? '획득' : '미획득' }}
              </span>
            </li>
          </ol>
        </div>
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
