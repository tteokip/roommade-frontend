<script setup>
defineProps({
  amount: { type: Number, required: true },
  bordered: { type: Boolean, default: true },
})
</script>

<template>
  <div
    class="inline-flex items-center gap-1"
    :class="
      bordered ? 'rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1' : 'justify-center'
    "
  >
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#f59e0b" />
      <circle cx="12" cy="12" r="8" fill="#fbbf24" />
      <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="900" fill="white">
        P
      </text>
    </svg>
    <span class="text-[13px] font-black text-amber-800">{{ amount }}P</span>
  </div>
</template>
