<script setup>
import { computed } from 'vue'

const props = defineProps({
  balance: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isError: {
    type: Boolean,
    default: false,
  },
})

const displayText = computed(() => {
  if (props.isLoading) return '조회 중'
  if (props.isError) return '조회 실패'
  return `${props.balance.toLocaleString()}P`
})
</script>

<template>
  <span
    class="flex items-center gap-1 whitespace-nowrap rounded-pill bg-amber-50 px-3 py-1.5 text-sm font-extrabold text-amber-600"
    :role="isError ? 'alert' : 'status'"
  >
    <span aria-hidden="true">🪙</span>
    {{ displayText }}
  </span>
</template>
