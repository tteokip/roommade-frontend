<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-card bg-brand-lavender px-6 py-12 text-center">
    <div class="text-3xl" aria-hidden="true"><slot name="icon">✨</slot></div>
    <h2 class="mt-3 text-lg font-extrabold text-ink">{{ title }}</h2>
    <p v-if="description" class="mt-2 text-sm text-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-5"><slot name="action" /></div>
  </div>
</template>
