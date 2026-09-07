<script setup>
import furnitureCouponIcon from '@/assets/furniture-coupon-icon.png'

defineProps({
  count: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <section
    class="flex items-center gap-3 rounded-control bg-gradient-to-r from-[#f4efff] to-[#eee7ff] px-4 py-3 shadow-card"
    role="status"
    aria-live="polite"
  >
    <img
      :src="furnitureCouponIcon"
      alt=""
      class="h-9 w-12 shrink-0 object-contain"
      aria-hidden="true"
    />

    <span class="min-w-0 flex-1">
      <strong class="block text-sm font-extrabold text-ink">
        가구 선택권 {{ count }}장 도착!
      </strong>
      <span class="mt-0.5 block text-xs text-muted">상점에서 기본 가구를 해금할 수 있어요.</span>
    </span>

    <span
      class="shrink-0 rounded-pill bg-brand-primary px-3 py-2 text-xs font-extrabold text-white"
    >
      상점으로
    </span>
  </section>
</template>
