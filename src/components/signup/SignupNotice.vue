<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<template>
  <section class="notice">
    <span class="notice-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M4 10.5 12 4l8 6.5V20H4Z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    </span>
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 12px 13px;
  border-radius: 13px;
  background: #f5f1ff;
}

.notice-icon {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #ece3ff;
  color: #7a31f1;
}

.notice-icon svg {
  width: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.notice strong {
  display: block;
  margin-bottom: 2px;
  font-size: 14px;
}

.notice p {
  margin: 0;
  color: #858895;
  font-size: 12px;
  line-height: 1.45;
}
</style>
