<script setup>
import ticketImage from '@/assets/furniture-unlock-ticket.png'

defineProps({
  size: {
    type: Number,
    default: 48,
  },
})
</script>

<template>
  <img
    :src="ticketImage"
    alt=""
    aria-hidden="true"
    class="shrink-0 object-contain"
    :style="{ width: `${size}px`, height: `${Math.round(size * 0.67)}px` }"
  />
</template>
