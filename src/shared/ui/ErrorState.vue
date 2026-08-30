<script setup>
import AppButton from './AppButton.vue'

defineProps({
  title: { type: String, default: '정보를 불러오지 못했어요.' },
  description: { type: String, default: '잠시 후 다시 시도해 주세요.' },
  retryLabel: { type: String, default: '다시 시도' },
})

defineEmits(['retry'])
</script>

<template>
  <section class="flex flex-col items-center px-6 py-12 text-center">
    <div class="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-xl" aria-hidden="true">!</div>
    <h2 class="text-lg font-bold text-ink">{{ title }}</h2>
    <p class="mt-2 text-sm text-muted">{{ description }}</p>
    <AppButton class="mt-5" size="sm" @click="$emit('retry')">{{ retryLabel }}</AppButton>
  </section>
</template>
