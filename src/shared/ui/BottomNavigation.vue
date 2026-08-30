<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
    <div class="mx-auto flex h-20 max-w-md items-center justify-around px-2">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="flex min-w-16 flex-col items-center gap-1 text-xs font-bold transition-colors"
        :class="modelValue === item.id ? 'text-brand-primary' : 'text-muted'"
        @click="$emit('update:modelValue', item.id)"
      >
        <span class="grid size-7 place-items-center"><component :is="item.icon" v-if="item.icon" /></span>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>
