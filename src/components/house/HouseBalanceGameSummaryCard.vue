<script setup>
import { computed } from 'vue'
import { AppCard } from '@/shared/ui'
import trophyImage from '@/assets/trophy.png'
import { formatBalanceGameHeadline } from '@/utils/houseFormat'

const props = defineProps({
  result: { type: Object, required: true },
})

defineEmits(['open'])

const headline = computed(() => formatBalanceGameHeadline(props.result))
</script>

<template>
  <AppCard
    variant="gradient"
    padding="md"
    interactive
    class="flex w-full items-center gap-4 text-left"
    @click="$emit('open')"
  >
    <div class="grid size-14 shrink-0 place-items-center rounded-full bg-white shadow-card">
      <img :src="trophyImage" alt="" class="size-8 object-contain" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-base font-extrabold leading-snug text-ink">{{ headline.text }}</p>
      <p class="mt-1.5 text-sm font-bold text-brand-primary">결과 다시보기 →</p>
    </div>
  </AppCard>
</template>
