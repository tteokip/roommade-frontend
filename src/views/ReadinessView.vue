<script setup>
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { getRirDiagnosis } from '@/api/preparations'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import RirDiagnosisCard from '@/components/readiness/RirDiagnosisCard.vue'
import { AppHeader, EmptyState, ErrorState, LoadingState } from '@/shared/ui'

const router = useRouter()

const { data, error, isError, isPending, refetch } = useQuery({
  queryKey: ['preparations', 'rir'],
  queryFn: getRirDiagnosis,
  retry: 1,
})

const errorDescription = computed(() => {
  const status = error.value?.response?.status

  if (status === 404) return 'RIR 계산에 필요한 사용자 정보를 찾지 못했어요.'
  if (status === 422) return '월 소득과 예상 월세를 확인한 뒤 다시 시도해 주세요.'
  return '잠시 후 다시 시도해 주세요.'
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7fc]">
    <AppHeader title="독립진단" mode="back" @back="router.back()" />

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pb-10 pt-6">
        <header class="mb-5 flex items-end justify-between gap-3">
          <div>
            <p class="text-sm font-bold text-brand-primary">내 자립 준비도</p>
            <h2 class="mt-1 text-2xl font-extrabold tracking-tight text-ink">항목별 진단</h2>
          </div>
          <p class="text-sm text-muted">
            <strong class="text-brand-primary">RIR</strong> 최대 {{ data?.maxScore ?? 45 }}점
          </p>
        </header>

        <LoadingState v-if="isPending" message="RIR 진단 결과를 불러오는 중이에요." />
        <ErrorState
          v-else-if="isError"
          title="RIR 진단 결과를 불러오지 못했어요."
          :description="errorDescription"
          @retry="refetch()"
        />
        <RirDiagnosisCard v-else-if="data" :diagnosis="data" />
        <EmptyState
          v-else
          title="진단 결과가 아직 없어요"
          description="월 소득과 예상 월세를 입력하면 RIR을 진단할 수 있어요."
        >
          <template #icon>📋</template>
        </EmptyState>
      </main>
    </BottomTabLayout>
  </div>
</template>
