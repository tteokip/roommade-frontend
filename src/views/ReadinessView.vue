<script setup>
import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { getCurrentComparison } from '@/api/house'
import {
  confirmHouse,
  getDepositProgress,
  getHouseComparisonProgress,
  getReadinessDiagnosis,
  getRirDiagnosis,
} from '@/api/preparations'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import DepositProgressCard from '@/components/readiness/DepositProgressCard.vue'
import HouseConfirmationCard from '@/components/readiness/HouseConfirmationCard.vue'
import MoveInScheduledPanel from '@/components/readiness/MoveInScheduledPanel.vue'
import RirDiagnosisCard from '@/components/readiness/RirDiagnosisCard.vue'
import { AppHeader, EmptyState, ErrorState, LoadingState } from '@/shared/ui'

const router = useRouter()
const queryClient = useQueryClient()
const confirmationError = ref('')
const confirmationVersion = ref(0)

const {
  data: readinessDiagnosis,
  error: readinessError,
  isError: isReadinessError,
  isPending: isReadinessPending,
  refetch: refetchReadiness,
} = useQuery({
  queryKey: ['preparations', 'readiness'],
  queryFn: getReadinessDiagnosis,
  retry: 1,
})

const isPreparing = computed(() => readinessDiagnosis.value?.independenceStatus === 'PREPARING')
const isMoveInScheduled = computed(
  () => readinessDiagnosis.value?.independenceStatus === 'MOVE_IN_SCHEDULED',
)

watch(
  () => readinessDiagnosis.value?.independenceStatus,
  (status) => {
    if (status === 'MOVED_IN') {
      router.replace({ name: 'dailyLife' })
    }
  },
  { immediate: true },
)

const {
  data: rirDiagnosis,
  error: rirError,
  isError: isRirError,
  isPending: isRirPending,
  refetch: refetchRir,
} = useQuery({
  queryKey: ['preparations', 'rir'],
  queryFn: getRirDiagnosis,
  enabled: isPreparing,
  retry: 1,
})

const {
  data: houseComparisonProgress,
  error: houseComparisonError,
  isError: isHouseComparisonError,
  isPending: isHouseComparisonPending,
  refetch: refetchHouseComparisonProgress,
} = useQuery({
  queryKey: ['preparations', 'house-comparison'],
  queryFn: getHouseComparisonProgress,
  enabled: isPreparing,
  retry: 1,
})

const {
  data: currentComparison,
  error: currentComparisonError,
  isError: isCurrentComparisonError,
  isPending: isCurrentComparisonPending,
  refetch: refetchCurrentComparison,
} = useQuery({
  queryKey: ['houseComparisonCurrent'],
  queryFn: getCurrentComparison,
  enabled: isPreparing,
  retry: 1,
})

const registeredHouses = computed(() =>
  [
    currentComparison.value?.houseA ? { ...currentComparison.value.houseA, houseType: 'A' } : null,
    currentComparison.value?.houseB ? { ...currentComparison.value.houseB, houseType: 'B' } : null,
  ].filter(Boolean),
)

const confirmHouseMutation = useMutation({
  mutationFn: confirmHouse,
  onMutate: () => {
    confirmationError.value = ''
  },
  onSuccess: async (confirmation) => {
    const refreshQueries = Promise.all([
      queryClient.invalidateQueries({ queryKey: ['preparations'] }),
      queryClient.invalidateQueries({ queryKey: ['houseComparisonCurrent'] }),
    ])

    if (confirmation.independenceStatus === 'MOVED_IN') {
      router.push({ name: 'dailyLife', query: { intro: '1' } })
      await refreshQueries
      return
    }

    await refreshQueries
    confirmationVersion.value += 1
  },
  onError: (error) => {
    const code = error.response?.data?.code

    if (code === 'HOUSE_019') {
      refetchCurrentComparison()
      confirmationError.value = '등록된 매물 정보를 찾지 못했어요. 다시 불러온 뒤 선택해 주세요.'
      return
    }
    if (code === 'PREPARATION_012') {
      confirmationError.value = '입주할 집을 다시 선택해 주세요.'
      return
    }
    if (code === 'PREPARATION_013') {
      confirmationError.value = '입주일은 오늘 또는 미래 날짜로 선택해 주세요.'
      return
    }
    if (code === 'PREPARATION_010') {
      confirmationError.value = '이미 입주를 확정했어요.'
      return
    }
    if (code === 'PREPARATION_009') {
      confirmationError.value = '자립 준비 정보를 찾지 못했어요.'
      return
    }

    confirmationError.value = '입주를 확정하지 못했어요. 잠시 후 다시 시도해 주세요.'
  },
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
  enabled: isPreparing,
  retry: 1,
})

const readinessErrorDescription = computed(() => {
  const status = readinessError.value?.response?.status

  if (status === 404) return '자립 준비 정보를 찾지 못했어요.'
  if (status === 422) return '자립 준비 정보를 확인한 뒤 다시 시도해 주세요.'
  return '잠시 후 다시 시도해 주세요.'
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

const houseComparisonErrorDescription = computed(() => {
  const status =
    houseComparisonError.value?.response?.status ?? currentComparisonError.value?.response?.status

  if (status === 404) return '집 비교 정보를 찾지 못했어요.'
  return '잠시 후 다시 시도해 주세요.'
})

function retryHouseConfirmation() {
  refetchHouseComparisonProgress()
  refetchCurrentComparison()
}
</script>

<template>
  <div class="min-h-screen bg-[#f8f7fc]">
    <AppHeader title="독립진단" mode="back" @back="router.back()" />

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pb-10 pt-6">
        <LoadingState v-if="isReadinessPending" message="자립 준비 상태를 불러오는 중이에요." />
        <ErrorState
          v-else-if="isReadinessError"
          title="자립 준비 상태를 불러오지 못했어요."
          :description="readinessErrorDescription"
          @retry="refetchReadiness()"
        />
        <MoveInScheduledPanel
          v-else-if="isMoveInScheduled && readinessDiagnosis.moveInDate"
          :move-in-date="readinessDiagnosis.moveInDate"
        />

        <template v-else-if="isPreparing">
          <header class="mb-5 flex items-end justify-between gap-3">
            <div>
              <p class="text-sm font-bold text-brand-primary">내 자립 준비도</p>
              <h2 class="mt-1 text-2xl font-extrabold tracking-tight text-ink">항목별 진단</h2>
            </div>
            <p class="whitespace-nowrap text-xs text-muted">
              <strong class="text-brand-primary">RIR</strong>
              {{ rirDiagnosis?.maxScore ?? 45 }}점 ·
              <strong class="text-brand-primary">보증금</strong>
              {{ depositProgress?.maxScore ?? 45 }}점 ·
              <strong class="text-brand-primary">집 비교</strong>
              {{ houseComparisonProgress?.maxScore ?? 10 }}점
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

            <LoadingState
              v-if="isHouseComparisonPending || isCurrentComparisonPending"
              message="집 비교 및 입주 확정 정보를 불러오는 중이에요."
            />
            <ErrorState
              v-else-if="isHouseComparisonError || isCurrentComparisonError"
              title="집 비교 및 입주 확정 정보를 불러오지 못했어요."
              :description="houseComparisonErrorDescription"
              @retry="retryHouseConfirmation"
            />
            <HouseConfirmationCard
              v-else-if="houseComparisonProgress"
              :key="confirmationVersion"
              :progress="houseComparisonProgress"
              :houses="registeredHouses"
              :is-confirming="confirmHouseMutation.isPending.value"
              :confirmation-error="confirmationError"
              @open-confirmation="confirmationError = ''"
              @confirm="confirmHouseMutation.mutate"
            />
          </div>
        </template>

        <LoadingState v-else message="독립 후 생활 화면으로 이동하는 중이에요." />
      </main>
    </BottomTabLayout>
  </div>
</template>
