<script setup>
import FurnitureTicketIcon from './FurnitureTicketIcon.vue'

defineProps({
  count: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span
    class="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-pill bg-brand-primary-soft px-3 text-xs font-extrabold text-brand-primary-dark"
    aria-label="보유 가구 선택권"
  >
    <FurnitureTicketIcon :size="32" />
    <span v-if="label">{{ label }}</span>
    <span>{{ count }}장</span>
  </span>
</template>
