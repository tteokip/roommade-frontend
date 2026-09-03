<script setup>
import { computed, ref, watch } from 'vue'

import { AppButton, BottomSheet } from '@/shared/ui'
import { formatWon } from '@/utils/houseFormat'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  houses: { type: Array, default: () => [] },
  isConfirming: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selectedValue = ref('')
const moveInDate = ref('')

const minimumMoveInDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())

const selectedHouse = computed(() => {
  if (!selectedValue.value || selectedValue.value === 'other') return null

  const houseId = Number(selectedValue.value.replace('house-', ''))
  return props.houses.find((house) => house.id === houseId) ?? null
})

const canSubmit = computed(
  () => Boolean(selectedValue.value && moveInDate.value) && !props.isConfirming,
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return
    selectedValue.value = ''
    moveInDate.value = ''
  },
  { immediate: true },
)

function updateOpen(isOpen) {
  if (props.isConfirming) return
  emit('update:modelValue', isOpen)
}

function openDatePicker(event) {
  event.currentTarget.showPicker?.()
}

function submitConfirmation() {
  if (!canSubmit.value) return

  if (selectedHouse.value) {
    emit('confirm', {
      confirmationType: 'COMPARISON',
      houseId: selectedHouse.value.id,
      moveInDate: moveInDate.value,
    })
    return
  }

  emit('confirm', {
    confirmationType: 'OTHER',
    moveInDate: moveInDate.value,
  })
}
</script>

<template>
  <BottomSheet
    :model-value="modelValue"
    :close-on-backdrop="!isConfirming"
    @update:model-value="updateOpen"
  >
    <div class="max-h-[calc(100dvh-5rem)] overflow-y-auto px-0.5 pb-1">
      <header class="flex items-center justify-between gap-4">
        <h2 class="flex items-center gap-2 text-lg font-extrabold text-ink">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-full bg-brand-primary text-sm text-white"
            aria-hidden="true"
            >✓</span
          >
          등록된 매물로 입주 확정하기
        </h2>
        <button
          type="button"
          class="grid size-10 shrink-0 place-items-center rounded-full text-3xl font-light text-muted disabled:opacity-40"
          :disabled="isConfirming"
          aria-label="입주 확정 창 닫기"
          @click="updateOpen(false)"
        >
          ×
        </button>
      </header>

      <fieldset class="mt-5 space-y-3">
        <legend class="sr-only">입주할 집 선택</legend>

        <div
          v-for="house in houses"
          :key="house.id"
          class="rounded-control border bg-white p-4 transition-colors focus-within:ring-4 focus-within:ring-brand-primary/20"
          :class="
            selectedValue === `house-${house.id}`
              ? 'border-brand-primary bg-brand-lavender/50 ring-1 ring-brand-primary'
              : 'border-line'
          "
        >
          <label class="block cursor-pointer">
            <input
              v-model="selectedValue"
              type="radio"
              name="confirmed-house"
              class="sr-only"
              :value="`house-${house.id}`"
              :disabled="isConfirming"
              @change="moveInDate = ''"
            />
            <span class="flex items-start justify-between gap-3">
              <span class="min-w-0 flex-1">
                <span
                  class="inline-flex rounded-md bg-brand-primary-soft px-2 py-1 text-xs font-extrabold text-brand-primary"
                >
                  등록 매물 {{ house.houseType }}
                </span>
                <strong class="mt-2 block truncate text-base font-extrabold text-ink">
                  {{ house.location }}
                </strong>
              </span>
              <span
                class="mt-6 grid size-6 shrink-0 place-items-center rounded-full border-2"
                :class="
                  selectedValue === `house-${house.id}` ? 'border-brand-primary' : 'border-muted'
                "
                aria-hidden="true"
              >
                <span
                  v-if="selectedValue === `house-${house.id}`"
                  class="size-3 rounded-full bg-brand-primary"
                />
              </span>
            </span>
            <span class="mt-3 grid grid-cols-2 gap-4 border-t border-dashed border-line pt-3">
              <span>
                <span class="block text-xs text-muted">보증금</span>
                <strong class="mt-1 block text-sm font-extrabold text-ink">
                  {{ formatWon(house.deposit) }}
                </strong>
              </span>
              <span>
                <span class="block text-xs text-muted">월세</span>
                <strong class="mt-1 block text-sm font-extrabold text-ink">
                  {{ formatWon(house.monthlyRent) }}
                </strong>
              </span>
            </span>
          </label>

          <label
            v-if="selectedValue === `house-${house.id}`"
            class="mt-4 block text-xs font-medium text-body"
          >
            입주 예정일
            <input
              v-model="moveInDate"
              type="date"
              :min="minimumMoveInDate"
              :disabled="isConfirming"
              class="mt-2 h-12 w-full cursor-pointer rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
              @click="openDatePicker"
            />
          </label>
        </div>

        <div
          class="rounded-control border bg-white px-4 py-4 transition-colors focus-within:ring-4 focus-within:ring-brand-primary/20"
          :class="
            selectedValue === 'other'
              ? 'border-brand-primary bg-brand-lavender/50 ring-1 ring-brand-primary'
              : 'border-line'
          "
        >
          <label class="flex cursor-pointer items-center gap-3">
            <input
              v-model="selectedValue"
              type="radio"
              name="confirmed-house"
              class="sr-only"
              value="other"
              :disabled="isConfirming"
              @change="moveInDate = ''"
            />
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full border-2"
              :class="selectedValue === 'other' ? 'border-brand-primary' : 'border-muted'"
              aria-hidden="true"
            >
              <span v-if="selectedValue === 'other'" class="size-3 rounded-full bg-brand-primary" />
            </span>
            <strong class="text-sm font-extrabold text-ink"
              >직접 찾아본 다른 집으로 입주 확정하기</strong
            >
          </label>

          <label v-if="selectedValue === 'other'" class="mt-4 block text-xs font-medium text-body">
            입주 예정일
            <input
              v-model="moveInDate"
              type="date"
              :min="minimumMoveInDate"
              :disabled="isConfirming"
              class="mt-2 h-12 w-full cursor-pointer rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
              @click="openDatePicker"
            />
          </label>
        </div>
      </fieldset>

      <div class="mt-5 flex items-center gap-4 rounded-control bg-brand-lavender p-4">
        <span class="shrink-0 text-4xl" aria-hidden="true">🏡</span>
        <div class="min-w-0">
          <h3 class="text-base font-extrabold text-ink">입주를 확정할까요?</h3>
          <p class="mt-1 text-xs leading-5 text-body">
            입주가 확정되어 독립 준비를 마쳤어요!
            <strong class="block text-sm font-extrabold text-brand-primary">
              자립 준비도 100% 달성, 가구 모두 획득
            </strong>
          </p>
        </div>
      </div>

      <p v-if="errorMessage" role="alert" class="mt-3 text-center text-xs font-bold text-danger">
        {{ errorMessage }}
      </p>

      <div class="mt-5 space-y-3">
        <AppButton
          variant="gradient"
          size="md"
          class="!font-extrabold"
          full-width
          :disabled="!canSubmit"
          @click="submitConfirmation"
        >
          {{ isConfirming ? '입주를 확정하는 중이에요…' : '입주 확정' }}
        </AppButton>
        <AppButton
          variant="outline"
          size="md"
          class="!font-extrabold"
          full-width
          :disabled="isConfirming"
          @click="updateOpen(false)"
        >
          취소
        </AppButton>
      </div>
    </div>
  </BottomSheet>
</template>
