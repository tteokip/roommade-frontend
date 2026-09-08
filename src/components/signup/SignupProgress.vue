<script setup>
defineProps({
  step: { type: Number, required: true },
})

const labels = ['정보 입력', '약관 동의', '가입 완료']
</script>

<template>
  <ol class="progress" :aria-label="`회원가입 ${step}단계`">
    <li v-for="(label, index) in labels" :key="label" :class="{ active: index + 1 <= step }">
      <div class="step-row">
        <span class="circle">
          <svg v-if="index + 1 < step" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 12 3.2 3.2L17.5 8" />
          </svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span v-if="index < 2" class="line"></span>
      </div>
      <span class="label">{{ label }}</span>
    </li>
  </ol>
</template>

<style scoped>
.progress {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 12px 0 0;
  padding: 0 18px 17px;
  list-style: none;
}

.progress li {
  min-width: 0;
  color: #b1b4c0;
  font-size: 11px;
  text-align: center;
}

.step-row {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.circle {
  z-index: 1;
  display: grid;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  margin-left: calc(50% - 11px);
  place-items: center;
  border-radius: 50%;
  background: #e9eaf0;
  font-weight: 700;
}

.circle svg {
  width: 15px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.line {
  position: absolute;
  left: calc(50% + 16px);
  width: calc(100% - 32px);
  height: 1px;
  background: #e1e2e8;
}

.active {
  color: #7529ef !important;
}

.active .circle {
  color: #fff;
  background: #7b32f2;
}

.active .line {
  background: #7b32f2;
}

.label {
  white-space: nowrap;
}
</style>
