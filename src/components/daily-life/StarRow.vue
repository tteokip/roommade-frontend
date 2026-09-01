<script setup>
defineProps({
  count: { type: Number, required: true },
  total: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: Number, default: 16 },
})
</script>

<template>
  <div class="flex justify-center gap-[3px]">
    <svg
      v-for="i in total"
      :key="i"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      :fill="i <= count ? color : 'none'"
      :stroke="i <= count ? color : '#d1d5db'"
      stroke-width="1.8"
    >
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      />
    </svg>
  </div>
</template>
