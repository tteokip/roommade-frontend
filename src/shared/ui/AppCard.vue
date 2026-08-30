<script setup>
defineProps({
  padding: { type: String, default: 'md' },
  interactive: { type: Boolean, default: false },
})
</script>

<template>
  <section
    class="rounded-card border border-line bg-surface shadow-card"
    :class="[
      { sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding] ?? 'p-6',
      interactive ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : '',
    ]"
  >
    <slot />
  </section>
</template>
