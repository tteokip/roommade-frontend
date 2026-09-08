<script setup>
import CoinIcon from '@/components/furniture/CoinIcon.vue'

defineProps({
  notification: { type: Object, default: null },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition
      appear
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-y-3 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="-translate-y-3 opacity-0"
    >
      <aside
        v-if="notification"
        class="fixed inset-x-4 top-[calc(1rem+env(safe-area-inset-top))] z-[70] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-brand-primary/20 bg-white p-4 shadow-xl"
        role="status"
        aria-live="polite"
      >
        <span
          class="grid size-11 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-xl"
          aria-hidden="true"
        >
          <CoinIcon :size="24" />
        </span>
        <span class="min-w-0 flex-1">
          <strong class="block text-sm font-extrabold text-ink">매일 챌린지 보상 도착!</strong>
          <span class="mt-0.5 block text-sm text-muted">
            Lv.{{ notification.achievedLevel }} 달성으로
            <b class="text-brand-primary">{{ notification.rewardCoin.toLocaleString() }}P</b>를
            받았어요.
          </span>
        </span>
        <button
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded-full text-lg text-muted hover:bg-slate-100"
          aria-label="보상 알림 닫기"
          @click="$emit('close')"
        >
          ×
        </button>
      </aside>
    </Transition>
  </Teleport>
</template>
