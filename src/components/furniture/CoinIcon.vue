<script setup>
import coinImage from '@/assets/coin-icon.png'

defineProps({
  size: {
    type: Number,
    default: 16,
  },
})
</script>

<template>
  <img
    :src="coinImage"
    alt=""
    aria-hidden="true"
    class="inline-block shrink-0 object-contain"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>
