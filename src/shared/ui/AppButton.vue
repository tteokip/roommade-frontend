<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  fullWidth: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const variantClass = computed(() => ({
  primary: 'bg-brand-primary text-white shadow-floating hover:bg-brand-primary-dark',
  secondary: 'bg-brand-primary-soft text-brand-primary hover:bg-brand-lavender',
  outline: 'border border-brand-primary bg-white text-brand-primary hover:bg-brand-primary-soft',
  soft: 'bg-slate-100 text-body hover:bg-slate-200',
  text: 'bg-transparent text-brand-primary hover:bg-brand-primary-soft',
}[props.variant] ?? 'bg-brand-primary text-white shadow-floating hover:bg-brand-primary-dark'))

const sizeClass = computed(() => ({
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-14 px-5 text-base',
  lg: 'min-h-16 px-6 text-lg',
}[props.size] ?? 'min-h-14 px-5 text-base'))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-pill font-bold transition-colors disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
    :class="[variantClass, sizeClass, fullWidth ? 'w-full' : '']"
  >
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
  </button>
</template>
