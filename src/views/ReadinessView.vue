<script setup>
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { getDepositProgress, getRirDiagnosis } from '@/api/preparations'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import DepositProgressCard from '@/components/readiness/DepositProgressCard.vue'
import RirDiagnosisCard from '@/components/readiness/RirDiagnosisCard.vue'
import { AppHeader, EmptyState, ErrorState, LoadingState } from '@/shared/ui'

const router = useRouter()

const {
  data: rirDiagnosis,
  error: rirError,
  isError: isRirError,
  isPending: isRirPending,
  refetch: refetchRir,
} = useQuery({
  queryKey: ['preparations', 'rir'],
  queryFn: getRirDiagnosis,
  retry: 1,
})

const {
  data: depositProgress,
  error: depositError,
  isError: isDepositError,
  isPending: isDepositPending,
  refetch: refetchDeposit,
} = useQuery({
  queryKey: ['preparations', 'deposit'],
  queryFn: getDepositProgress,
  retry: 1,
})

const rirErrorDescription = computed(() => {
  const status = rirError.value?.response?.status

  if (status === 404) return 'RIR 계산에 필요한 사용자 정보를 찾지 못했어요.'
  if (status === 422) return '월 소득과 예상 월세를 확인한 뒤 다시 시도해 주세요.'
  return '잠시 후 다시 시도해 주세요.'
})

const depositErrorDescription = computed(() => {
  const status = depositError.value?.response?.status

  if (status === 404) return '보증금 마련 현황에 필요한 정보를 찾지 못했어요.'
  if (status === 422) return '목표 보증금과 현재 마련 금액을 확인한 뒤 다시 시도해 주세요.'
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
          <p class="whitespace-nowrap text-xs text-muted">
            <strong class="text-brand-primary">RIR</strong> {{ rirDiagnosis?.maxScore ?? 45 }}점 ·
            <strong class="text-brand-primary">보증금</strong>
            {{ depositProgress?.maxScore ?? 45 }}점
          </p>
        </header>

        <div class="space-y-4">
          <LoadingState v-if="isRirPending" message="RIR 진단 결과를 불러오는 중이에요." />
          <ErrorState
            v-else-if="isRirError"
            title="RIR 진단 결과를 불러오지 못했어요."
            :description="rirErrorDescription"
            @retry="refetchRir()"
          />
          <RirDiagnosisCard v-else-if="rirDiagnosis" :diagnosis="rirDiagnosis" />
          <EmptyState
            v-else
            title="RIR 진단 결과가 아직 없어요"
            description="월 소득과 예상 월세를 입력하면 RIR을 진단할 수 있어요."
          >
            <template #icon>📋</template>
          </EmptyState>

          <LoadingState v-if="isDepositPending" message="보증금 마련 현황을 불러오는 중이에요." />
          <ErrorState
            v-else-if="isDepositError"
            title="보증금 마련 현황을 불러오지 못했어요."
            :description="depositErrorDescription"
            @retry="refetchDeposit()"
          />
          <DepositProgressCard v-else-if="depositProgress" :progress="depositProgress" />
          <EmptyState
            v-else
            title="보증금 마련 현황이 아직 없어요"
            description="목표 보증금과 현재 마련 금액을 입력하면 진행률을 확인할 수 있어요."
          >
            <template #icon>💸</template>
          </EmptyState>
        </div>
      </main>
    </BottomTabLayout>
  </div>
</template>
