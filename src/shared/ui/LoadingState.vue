<script setup>
defineProps({ message: { type: String, default: '정보를 불러오는 중이에요.' } })
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-center" role="status">
    <span class="size-9 animate-spin rounded-full border-4 border-brand-primary-soft border-t-brand-primary" />
    <p class="text-sm font-medium text-muted">{{ message }}</p>
  </div>
</template>
