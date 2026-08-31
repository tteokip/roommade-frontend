<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"
  >
    <div class="mx-auto flex h-[75px] max-w-md items-center justify-around px-2">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        :aria-current="modelValue === item.id ? 'page' : undefined"
        class="flex min-w-14 flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors"
        :class="modelValue === item.id ? 'text-brand-primary' : 'text-muted'"
        @click="$emit('update:modelValue', item.id)"
      >
        <span
          class="grid size-9 place-items-center rounded-full transition-colors"
          :class="modelValue === item.id ? 'bg-brand-primary-soft' : ''"
        >
          <component :is="item.icon" v-if="item.icon" :class="item.iconSize ?? 'size-5'" />
        </span>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>
