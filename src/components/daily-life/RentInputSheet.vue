<script setup>
import { computed } from 'vue'
import { AppButton, BottomSheet } from '@/shared/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  amount: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  title: { type: String, default: '월세 입력하기' },
  description: { type: String, default: '실제 월세 금액을 입력해주세요.' },
  presets: {
    type: Array,
    default: () => [
      { label: '1만원', amount: 10000 },
      { label: '10만원', amount: 100000 },
      { label: '50만원', amount: 500000 },
    ],
  },
})

const emit = defineEmits(['update:modelValue', 'update:amount', 'confirm'])

const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const numericAmount = computed(() => Number(props.amount) || 0)
const formattedAmount = computed(() => numericAmount.value.toLocaleString())

function setAmount(value) {
  emit('update:amount', String(value))
}

function addAmount(value) {
  setAmount(numericAmount.value + value)
}

function appendDigit(digit) {
  const next = `${props.amount || ''}${digit}`.replace(/^0+(?=\d)/, '')
  if (next.length <= 10) emit('update:amount', next)
}

function deleteDigit() {
  emit('update:amount', props.amount.slice(0, -1))
}
</script>

<template>
  <BottomSheet
    :title="title"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="mb-4 text-sm text-muted">{{ description }}</p>

    <div
      class="flex min-h-14 items-center rounded-control border border-line bg-white px-4 text-ink"
    >
      <span class="min-w-0 flex-1 text-xl font-extrabold tabular-nums">
        {{ formattedAmount }}
      </span>
      <span class="text-sm font-bold text-muted">원</span>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-2">
      <button
        v-for="preset in presets"
        :key="preset.amount"
        type="button"
        class="min-h-10 rounded-control bg-brand-primary-soft text-sm font-bold text-brand-primary"
        @click="addAmount(preset.amount)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-2">
      <button
        v-for="key in numberKeys"
        :key="key"
        type="button"
        class="min-h-12 rounded-control border border-line bg-white text-lg font-bold text-ink"
        @click="appendDigit(key)"
      >
        {{ key }}
      </button>
      <button
        type="button"
        class="min-h-12 rounded-control border border-line bg-white text-sm font-bold text-muted"
        @click="setAmount(0)"
      >
        전체 삭제
      </button>
      <button
        type="button"
        class="min-h-12 rounded-control border border-line bg-white text-lg font-bold text-ink"
        @click="appendDigit('0')"
      >
        0
      </button>
      <button
        type="button"
        aria-label="한 자리 지우기"
        class="min-h-12 rounded-control border border-line bg-white text-lg font-bold text-muted"
        @click="deleteDigit"
      >
        ⌫
      </button>
    </div>

    <AppButton
      class="mt-5"
      full-width
      :disabled="!numericAmount || loading"
      @click="$emit('confirm')"
    >
      {{ loading ? '입력 중' : '확인' }}
    </AppButton>
  </BottomSheet>
</template>
