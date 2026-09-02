<script setup>
import { computed } from 'vue'
import { AppChip } from '@/shared/ui'

const props = defineProps({
  policy: { type: Object, required: true },
})

defineEmits(['detail'])

const provider = computed(() => (
  props.policy.providerInstitutionName?.includes('서울') ? '서울시' : '정부'
))

const providerVariant = computed(() => (provider.value === '서울시' ? 'coral' : 'purple'))

const dDayLabel = computed(() => {
  if (props.policy.dDay === null || props.policy.dDay === undefined) return ''
  return props.policy.dDay === 0 ? '오늘 마감' : `D-${props.policy.dDay}`
})
</script>

<template>
  <article class="relative rounded-card bg-white p-5 shadow-card">
    <button
      type="button"
      class="absolute right-5 top-5 text-sm font-extrabold text-brand-primary"
      @click="$emit('detail', policy.youthPolicyId)"
    >
      상세 보기 ›
    </button>
    <div class="flex flex-wrap gap-2">
      <AppChip :variant="providerVariant">{{ provider }}</AppChip>
      <AppChip variant="mint">주거</AppChip>
    </div>
    <h3 class="mt-4 pr-14 text-xl font-extrabold leading-snug text-ink">{{ policy.policyName }}</h3>
    <p class="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted">
      {{ policy.cardSummary || '지원 조건은 상세 보기에서 확인할 수 있어요' }}
    </p>
    <p v-if="dDayLabel" class="mt-4 text-sm font-extrabold text-brand-mint">{{ dDayLabel }}</p>
  </article>
</template>
