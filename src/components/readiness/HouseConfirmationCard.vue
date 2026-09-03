<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import HouseConfirmationSheet from '@/components/readiness/HouseConfirmationSheet.vue'
import { AppButton, AppCard } from '@/shared/ui'

const props = defineProps({
  progress: { type: Object, required: true },
  houses: { type: Array, default: () => [] },
  isConfirming: { type: Boolean, default: false },
  confirmationError: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'open-confirmation'])
const router = useRouter()

const isExpanded = ref(true)
const isSheetOpen = ref(false)

const displayScore = computed(() => Math.round(props.progress.houseComparisonScore))

function openConfirmationSheet() {
  emit('open-confirmation')
  isSheetOpen.value = true
}

function confirmHouse(payload) {
  emit('confirm', payload)
}
</script>

<template>
  <AppCard padding="sm" variant="outlined">
    <div class="flex w-full items-center gap-3">
      <span class="shrink-0 text-2xl" aria-hidden="true">🏠</span>
      <span class="min-w-0 flex-1">
        <span class="font-extrabold text-ink">집 비교 &amp; 입주 확정</span>
      </span>
      <button
        type="button"
        class="flex shrink-0 items-center gap-3 rounded-control text-right outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20"
        :aria-expanded="isExpanded"
        aria-controls="house-confirmation-details"
        :aria-label="isExpanded ? '집 비교 및 입주 확정 접기' : '집 비교 및 입주 확정 펼치기'"
        @click="isExpanded = !isExpanded"
      >
        <span>
          <span class="text-sm font-extrabold text-brand-primary">{{ displayScore }}</span>
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
      id="house-confirmation-details"
      padding="none"
      variant="flat"
      class="mt-6 !rounded-control !bg-[#f8f7fc]"
    >
      <div class="space-y-4 px-4 py-5">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-control text-left outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20"
          @click="router.push({ name: 'house-comparison' })"
        >
          <span
            class="grid size-12 shrink-0 place-items-center rounded-control bg-brand-lavender text-xl"
            aria-hidden="true"
          >
            ⚖️
          </span>
          <span class="min-w-0 flex-1">
            <strong class="block text-[clamp(0.75rem,3.2vw,0.875rem)] font-extrabold text-ink"
              >집 비교</strong
            >
            <span class="mt-1 block text-[clamp(0.6875rem,3vw,0.75rem)] text-muted"
              >집을 비교하고 나에게 맞는 집을 선택해요.</span
            >
          </span>
          <strong class="shrink-0 text-sm font-extrabold text-brand-primary">
            {{ displayScore }}<span class="font-medium text-muted">/{{ progress.maxScore }}점</span>
          </strong>
        </button>

        <div class="flex items-center gap-3">
          <span
            class="grid size-12 shrink-0 place-items-center rounded-control bg-brand-lavender text-xl"
            aria-hidden="true"
          >
            🏡
          </span>
          <span class="min-w-0">
            <strong class="block text-[clamp(0.75rem,3.2vw,0.875rem)] font-extrabold text-ink">
              입주할 날짜가 정해졌나요?
            </strong>
            <span class="mt-1 block text-[clamp(0.6875rem,3vw,0.75rem)] leading-5 text-muted">
              실제 거주할 집의 입주가 확정됐다면 입주 확정 버튼을 눌러 독립 후 생활을 시작해보세요.
            </span>
          </span>
        </div>

        <AppButton
          variant="outline"
          size="sm"
          class="!text-base !font-extrabold"
          full-width
          @click="openConfirmationSheet"
        >
          입주 확정
        </AppButton>

        <div class="flex items-start gap-2 rounded-control bg-brand-lavender px-3 py-4">
          <span class="shrink-0 text-base" aria-hidden="true">💡</span>
          <div class="min-w-0">
            <strong class="block text-sm font-extrabold text-ink">입주가 확정되면</strong>
            <ul class="mt-1 space-y-1 text-[clamp(0.6875rem,3vw,0.8125rem)] leading-5 text-body">
              <li class="flex items-center gap-2">
                <span class="text-brand-primary" aria-hidden="true">✓</span>
                <span>
                  자립 준비도
                  <strong class="text-sm font-extrabold text-brand-primary">100%</strong>
                  달성
                </span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-brand-primary" aria-hidden="true">✓</span>
                <span>
                  남은
                  <strong class="text-sm font-extrabold text-brand-primary"
                    >기본 가구 모두 획득</strong
                  >
                </span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-brand-primary" aria-hidden="true">✓</span>
                <span>
                  <strong class="text-sm font-extrabold text-brand-primary">입주일부터</strong> 독립
                  후 생활 단계로 전환돼요
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppCard>
  </AppCard>

  <HouseConfirmationSheet
    v-model="isSheetOpen"
    :houses="houses"
    :is-confirming="isConfirming"
    :error-message="confirmationError"
    @confirm="confirmHouse"
  />
</template>
