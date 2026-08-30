<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'purple' },
  selected: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
})

const colorClass = computed(() => ({
  purple: props.selected ? 'bg-brand-primary text-white' : 'bg-brand-primary-soft text-brand-primary',
  mint: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-500',
  coral: 'bg-red-100 text-red-400',
  neutral: 'bg-slate-100 text-slate-500',
}[props.variant] ?? 'bg-brand-primary-soft text-brand-primary'))
</script>

<template>
  <button
    v-if="clickable"
    type="button"
    class="inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-sm font-bold transition-opacity hover:opacity-80"
    :class="colorClass"
  >
    <slot />
  </button>
  <span v-else class="inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-sm font-bold" :class="colorClass">
    <slot />
  </span>
</template>
