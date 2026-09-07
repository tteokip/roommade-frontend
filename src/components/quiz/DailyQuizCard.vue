<script setup>
defineEmits(['start'])
</script>

<template>
  <section class="rounded-card bg-white p-5 shadow-card">
    <div class="flex items-center gap-2">
      <p class="text-lg font-extrabold text-ink">오늘의 퀘스트</p>
      <span class="rounded-pill bg-brand-primary-soft px-2 py-0.5 text-xs font-extrabold text-brand-primary">진행중</span>
    </div>

    <h2 class="mt-3 text-2xl font-black leading-tight text-ink">신용 관리 퀴즈를 풀어보세요!</h2>
    <p class="mt-2 text-base text-muted">퀴즈를 맞히면 포인트를 획득해요 ✨</p>

    <div class="mt-5 flex items-end justify-between gap-4">
      <button
        type="button"
        class="inline-flex min-h-12 items-center gap-2 rounded-pill bg-brand-primary px-5 text-base font-extrabold text-white shadow-floating"
        @click="$emit('start')"
      >
        퀘스트 시작하기
        <span class="text-2xl leading-none" aria-hidden="true">›</span>
      </button>

      <div class="flex size-22 shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-brand-primary-soft">
        <span class="text-2xl" aria-hidden="true">💰</span>
        <span class="text-xl font-black text-ink">0/1</span>
      </div>
    </div>
  </section>
</template>
