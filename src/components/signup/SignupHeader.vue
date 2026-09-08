<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  fallback: { type: String, default: '/' },
})

const router = useRouter()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push(props.fallback)
}
</script>

<template>
  <header class="signup-header">
    <button type="button" class="back-button" aria-label="이전 화면" @click="goBack">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
    <h1>회원가입</h1>
  </header>
</template>

<style scoped>
.signup-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 59px;
  padding: 0 14px;
}

.signup-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.back-button {
  position: absolute;
  left: 14px;
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: #f4f4f6;
  color: #353744;
}

.back-button svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
