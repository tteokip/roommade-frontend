<script setup>
import { computed } from 'vue'
import { BottomSheet, ErrorState, LoadingState } from '@/shared/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  policy: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'retry'])

const ageCondition = computed(() => {
  if (!props.policy) return ''
  if (props.policy.minAge === null && props.policy.maxAge === null) return '연령 제한 없음'
  if (props.policy.minAge === null) return `만 ${props.policy.maxAge}세 이하`
  if (props.policy.maxAge === null) return `만 ${props.policy.minAge}세 이상`
  return `만 ${props.policy.minAge}세 ~ ${props.policy.maxAge}세`
})
</script>

<template>
  <BottomSheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <LoadingState v-if="isLoading" message="정책 상세 정보를 불러오는 중이에요" />
    <ErrorState v-else-if="isError" @retry="$emit('retry')" />
    <article v-else-if="policy" class="pb-3">
      <p class="text-sm font-bold text-brand-primary">{{ policy.providerInstitutionName }}</p>
      <h2 class="mt-2 text-2xl font-extrabold leading-snug text-ink">{{ policy.policyName }}</h2>

      <section class="mt-6 rounded-control bg-brand-lavender p-4">
        <h3 class="text-sm font-extrabold text-ink">지원 내용</h3>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-body">
          {{ policy.supportContent || '지원 내용이 등록되지 않았어요.' }}
        </p>
      </section>

      <dl class="mt-6 divide-y divide-line border-y border-line text-sm">
        <div class="flex gap-4 py-4">
          <dt class="w-20 shrink-0 font-bold text-muted">신청 기간</dt>
          <dd class="font-medium text-body">{{ policy.applicationPeriod || '상시 신청' }}</dd>
        </div>
        <div class="flex gap-4 py-4">
          <dt class="w-20 shrink-0 font-bold text-muted">지원 연령</dt>
          <dd class="font-medium text-body">{{ ageCondition }}</dd>
        </div>
        <div class="flex gap-4 py-4">
          <dt class="w-20 shrink-0 font-bold text-muted">소득 조건</dt>
          <dd class="font-medium text-body">
            {{ policy.incomeConditionText || '소득 조건 확인 필요' }}
          </dd>
        </div>
      </dl>

      <section v-if="policy.qualification" class="mt-6">
        <h3 class="text-sm font-extrabold text-ink">신청 자격</h3>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-body">
          {{ policy.qualification }}
        </p>
      </section>
      <section v-if="policy.applicationMethod" class="mt-6">
        <h3 class="text-sm font-extrabold text-ink">신청 방법</h3>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-body">
          {{ policy.applicationMethod }}
        </p>
      </section>
      <a
        v-if="policy.applicationUrl"
        :href="policy.applicationUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-7 flex min-h-13 items-center justify-center rounded-pill bg-brand-primary px-5 text-base font-bold text-white shadow-floating"
      >
        신청 페이지로 이동
      </a>
    </article>
  </BottomSheet>
</template>
