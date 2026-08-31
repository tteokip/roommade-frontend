<script setup>
defineProps({
  title: { type: String, default: '' },
  mode: { type: String, default: 'title' },
})

defineEmits(['back', 'menu'])
</script>

<template>
  <header class="relative flex min-h-20 items-center justify-between bg-surface px-5">
    <button
      v-if="mode === 'back'"
      type="button"
      aria-label="이전 화면"
      class="grid size-11 place-items-center rounded-xl bg-slate-100 text-body"
      @click="$emit('back')"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div v-else class="min-w-11"><slot name="leading" /></div>

    <h1
      v-if="title"
      class="absolute left-1/2 -translate-x-1/2 text-xl font-extrabold tracking-tight text-ink"
    >
      {{ title }}
    </h1>
    <slot v-else name="title" />

    <button
      v-if="mode === 'menu'"
      type="button"
      aria-label="메뉴 열기"
      class="grid size-11 place-items-center rounded-xl bg-slate-100 text-body"
      @click="$emit('menu')"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        aria-hidden="true"
      >
        <path d="M5 7h14M5 12h14M5 17h14" stroke-linecap="round" />
      </svg>
    </button>
    <div v-else class="min-w-11"><slot name="trailing" /></div>
  </header>
</template>
