<script setup>
import CoinIcon from './CoinIcon.vue'
import FurnitureTicketIcon from './FurnitureTicketIcon.vue'

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
  fluid: {
    type: Boolean,
    default: false,
  },
  ticketCost: {
    type: Number,
    default: null,
  },
})

defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    class="rounded-control border p-3 text-center transition-colors disabled:cursor-not-allowed"
    :class="[
      fluid ? 'w-full min-w-0' : 'w-28 shrink-0',
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
    <span
      v-if="ticketCost != null"
      class="mt-1.5 flex min-h-7 items-center justify-center gap-1 rounded-lg bg-brand-primary px-1.5 text-[11px] font-extrabold text-white"
    >
      해금하기
      <span class="grid size-5 place-items-center rounded bg-white">
        <FurnitureTicketIcon :size="18" />
      </span>
      {{ ticketCost }}
    </span>
    <p
      v-else-if="price != null"
      class="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600"
    >
      <CoinIcon :size="12" />
      {{ price.toLocaleString() }}P
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
