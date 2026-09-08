<script setup>
import CoinIcon from '@/components/furniture/CoinIcon.vue'
import { BottomSheet } from '@/shared/ui'

defineProps({
  modelValue: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])

function formatDate(value) {
  const [year, month, day] = value.split('-')
  return `${year}.${month}.${day}`
}
</script>

<template>
  <BottomSheet
    title="알림"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="notifications.length" class="space-y-3 pb-2">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="flex gap-3 rounded-2xl border border-brand-primary/15 bg-brand-lavender/60 p-4"
      >
        <span
          class="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm"
          aria-hidden="true"
        >
          <CoinIcon :size="24" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <strong class="text-sm font-extrabold text-ink">매일 챌린지 보상 지급</strong>
            <time class="shrink-0 text-xs text-muted" :datetime="notification.challengeDate">
              {{ formatDate(notification.challengeDate) }}
            </time>
          </div>
          <p class="mt-1 text-sm leading-6 text-body">
            Lv.{{ notification.achievedLevel }} 달성 보상으로
            <b class="text-brand-primary">{{ notification.rewardCoin.toLocaleString() }}P</b>가
            지급됐어요.
          </p>
        </div>
      </article>
    </div>

    <div v-else class="py-14 text-center">
      <span class="text-4xl" aria-hidden="true">🔔</span>
      <p class="mt-4 font-extrabold text-ink">아직 도착한 알림이 없어요.</p>
      <p class="mt-1 text-sm text-muted">챌린지 보상이 지급되면 여기에서 알려드릴게요.</p>
    </div>
  </BottomSheet>
</template>
