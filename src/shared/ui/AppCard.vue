<script setup>
defineProps({
  variant: { type: String, default: 'surface' },
  padding: { type: String, default: 'md' },
  interactive: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <section
    class="rounded-card border"
    :aria-disabled="disabled || undefined"
    :inert="disabled || undefined"
    :class="[
      {
        surface: 'border-line bg-surface shadow-card',
        soft: 'border-transparent bg-brand-lavender shadow-none',
        outlined: 'border-brand-primary bg-surface shadow-none',
        gradient:
          'border-brand-primary/10 bg-gradient-to-br from-brand-lavender to-white shadow-card',
        flat: 'border-line bg-surface shadow-none',
      }[variant] ?? 'border-line bg-surface shadow-card',
      { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding] ?? 'p-6',
      interactive && !disabled ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : '',
      selected ? 'border-2 !border-brand-primary-dark' : '',
      disabled ? 'cursor-not-allowed opacity-45 grayscale' : '',
    ]"
  >
    <slot />
  </section>
</template>
