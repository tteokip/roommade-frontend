<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  selected: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  statusText: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    class="w-28 shrink-0 rounded-control border p-3 text-center transition-colors disabled:cursor-not-allowed"
    :class="[
      selected ? 'border-brand-primary-dark bg-brand-primary-soft' : 'border-line bg-white',
      locked && 'opacity-60',
    ]"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <div class="relative aspect-square overflow-hidden rounded-control bg-slate-50">
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="name"
        class="h-full w-full object-contain"
        :class="locked && 'grayscale'"
      />
      <span
        v-if="selected"
        class="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-brand-primary-dark text-[11px] text-white"
        aria-label="선택됨"
      >
        ✓
      </span>
      <span
        v-else-if="locked"
        class="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-slate-500 text-[11px] text-white"
        aria-label="잠김"
      >
        🔒
      </span>
    </div>

    <p class="mt-2 truncate text-xs font-extrabold text-ink">{{ name }}</p>
    <p v-if="price != null" class="mt-0.5 text-[11px] font-bold text-amber-600">
      🪙 {{ price.toLocaleString() }}P
    </p>
    <p
      v-else-if="statusText"
      class="mt-0.5 text-[11px] font-bold"
      :class="selected ? 'text-brand-primary' : 'text-muted'"
    >
      {{ statusText }}
    </p>
  </button>
</template>
