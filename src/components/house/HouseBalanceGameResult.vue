<script setup>
import { computed } from 'vue'
import { AppButton, AppCard } from '@/shared/ui'
import houseImage from '@/assets/house.png'
import trophyImage from '@/assets/trophy.png'
import {
  formatBalanceGameHeadline,
  formatComparisonFactor,
  formatOrFallback,
} from '@/utils/houseFormat'

const props = defineProps({
  result: { type: Object, required: true },
  houseA: { type: Object, default: null },
  houseB: { type: Object, default: null },
})

defineEmits(['restart'])

const headline = computed(() => formatBalanceGameHeadline(props.result))

const winnerHouse = computed(() => {
  if (props.result.result === 'A') return props.houseA
  if (props.result.result === 'B') return props.houseB
  return null
})

const factorChips = computed(() =>
  Object.entries(props.result.selectedFactors ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([factor]) => ({ factor, ...formatComparisonFactor(factor) })),
)

// matchedFactors = 내가 고른 조건 중, 실제로 승리한 집이 더 나았던 조건이다.
const matchedFactorLabels = computed(() =>
  Object.entries(props.result.matchedFactors ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([factor]) => formatComparisonFactor(factor).label),
)
</script>

<template>
  <div>
    <div class="pop-in flex flex-col items-center gap-6 pb-8 pt-3 text-center">
      <img :src="trophyImage" alt="" class="size-16 object-contain" />
      <h2 class="text-2xl font-extrabold leading-snug text-ink">{{ headline.text }}</h2>
    </div>

    <div v-if="factorChips.length" class="mt-7">
      <p class="text-sm font-bold text-muted">내가 고른 조건들이에요</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="chip in factorChips"
          :key="chip.factor"
          class="inline-flex items-center gap-1.5 rounded-pill bg-brand-lavender px-3 py-1.5 text-sm font-bold text-brand-primary"
        >
          <span aria-hidden="true">{{ chip.icon }}</span
          >{{ chip.label }}
        </span>
      </div>
    </div>

    <AppCard v-if="winnerHouse" padding="md" class="mt-7 flex items-center gap-4">
      <img :src="houseImage" alt="" class="size-10 shrink-0 object-contain" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <span
            class="rounded-pill px-2 py-0.5 text-xs font-bold"
            :class="
              result.result === 'A' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-500'
            "
          >
            {{ result.result }}집
          </span>
          <span class="truncate text-base font-extrabold text-ink">{{
            formatOrFallback(winnerHouse.location)
          }}</span>
        </div>
        <p v-if="matchedFactorLabels.length" class="mt-2 text-sm leading-relaxed text-muted">
          내 선택과 맞은 조건: {{ matchedFactorLabels.join(' · ') }}
        </p>
      </div>
    </AppCard>
    <AppCard
      v-else
      variant="soft"
      padding="md"
      class="mt-7 text-center text-sm font-bold text-body"
    >
      두 집 다 취향에 고르게 맞아요. 조건표를 다시 보고 골라보세요.
    </AppCard>

    <p class="mt-6 text-center text-sm leading-relaxed text-muted">
      취향 참고용이에요.<br />계약 전엔 보증금·위험요소도 꼭 확인해 주세요.
    </p>

    <AppButton variant="secondary" class="mt-8" full-width @click="$emit('restart')">
      다시 하기
    </AppButton>
  </div>
</template>

<style scoped>
.pop-in {
  animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
