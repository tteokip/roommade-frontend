<script setup>
import { computed, ref } from 'vue'

import { AppCard } from '@/shared/ui'
import { formatWon } from '@/utils/houseFormat'

const props = defineProps({
  progress: { type: Object, required: true },
})

const isExpanded = ref(false)

const achievementRate = computed(() => Math.min(Math.max(props.progress.achievementRate, 0), 100))
const displayAchievementRate = computed(() => Math.round(achievementRate.value))
const displayScore = computed(() => Math.round(props.progress.score))
const isCompleted = computed(() => props.progress.remainingDeposit === 0)

const progressStyle = computed(() => ({
  width: `${achievementRate.value}%`,
}))

const markerStyle = computed(() => ({
  left: `${achievementRate.value}%`,
}))

const markerLabelClass = computed(() => {
  if (achievementRate.value <= 15) return ''
  if (achievementRate.value >= 85) return '-translate-x-full'
  return '-translate-x-1/2'
})

const headline = computed(() => ({
  message: isCompleted.value ? '목표 보증금을 달성했어요!' : null,
  achievementRate: isCompleted.value ? null : `${displayAchievementRate.value}%`,
}))

const guidance = computed(() => ({
  message: isCompleted.value ? '목표 보증금을 모두 마련했어요!' : null,
  remainingDeposit: isCompleted.value ? null : formatWon(props.progress.remainingDeposit),
}))
</script>

<template>
  <AppCard padding="sm" variant="outlined">
    <div class="flex w-full items-center gap-3">
      <span class="shrink-0 text-2xl" aria-hidden="true">💸</span>
      <span class="min-w-0 flex-1">
        <span class="font-extrabold text-ink">보증금 마련</span>
        <span
          class="mt-1 block whitespace-nowrap text-[clamp(0.625rem,2.55vw,0.6875rem)] text-muted"
        >
          {{ formatWon(progress.currentDeposit) }} / {{ formatWon(progress.targetDeposit) }} ·
          {{ formatWon(progress.remainingDeposit) }} 남음
        </span>
      </span>
      <button
        type="button"
        class="flex shrink-0 items-center gap-3 rounded-control text-right outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20"
        :aria-expanded="isExpanded"
        aria-controls="deposit-progress-details"
        :aria-label="isExpanded ? '보증금 마련 현황 접기' : '보증금 마련 현황 펼치기'"
        @click="isExpanded = !isExpanded"
      >
        <span>
          <span class="text-sm font-extrabold text-brand-primary">
            {{ displayScore }}
          </span>
          <span class="ml-1 text-sm font-medium text-muted">/{{ progress.maxScore }}점</span>
        </span>
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
      id="deposit-progress-details"
      padding="none"
      variant="flat"
      class="mt-6 !rounded-control !bg-[#f8f7fc]"
    >
      <div class="px-4 py-5">
        <div class="relative mt-14">
          <p
            class="absolute bottom-[calc(100%+2.25rem)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[clamp(0.6875rem,3vw,0.8125rem)] font-extrabold leading-5 text-ink"
          >
            <template v-if="headline.message">{{ headline.message }}</template>
            <template v-else>
              {{ '목표 보증금의 '
              }}<span class="text-sm text-brand-primary">{{ headline.achievementRate }}</span
              >{{ '를 마련했어요!' }}
            </template>
          </p>

          <div class="relative h-3 rounded-pill bg-brand-primary-soft">
            <span
              class="absolute inset-y-0 left-0 rounded-pill bg-gradient-to-r from-violet-400 to-brand-primary"
              :style="progressStyle"
            />
            <span
              class="absolute bottom-[calc(100%+0.5rem)] whitespace-nowrap rounded-pill bg-white px-3 py-1 text-xs font-extrabold text-ink shadow-card ring-1 ring-line"
              :class="markerLabelClass"
              :style="markerStyle"
            >
              현재 {{ formatWon(progress.currentDeposit) }}
            </span>
            <span
              class="absolute top-1/2 block size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-primary shadow-floating"
              :style="markerStyle"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-between gap-4 text-xs font-extrabold sm:text-sm">
          <p class="text-muted">0원</p>
          <p class="text-right text-brand-primary">목표 {{ formatWon(progress.targetDeposit) }}</p>
        </div>

        <div class="mt-6 flex items-center gap-2 rounded-control bg-brand-lavender px-3 py-4">
          <span class="text-base" aria-hidden="true">💡</span>
          <p class="whitespace-nowrap text-[clamp(0.625rem,2.7vw,0.75rem)] leading-5 text-body">
            <template v-if="guidance.message">{{ guidance.message }}</template>
            <template v-else>
              {{ '목표까지 '
              }}<span class="text-xs font-extrabold text-brand-primary">{{
                guidance.remainingDeposit
              }}</span
              >{{ ' 남았어요!' }}
            </template>
          </p>
        </div>
      </div>
    </AppCard>
  </AppCard>
</template>
