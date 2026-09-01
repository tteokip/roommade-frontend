<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getYouthPolicies, getYouthPolicyDetail } from '@/api/benefits'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import PolicyCard from '@/components/benefit/PolicyCard.vue'
import PolicyDetailSheet from '@/components/benefit/PolicyDetailSheet.vue'
import {
  AppButton,
  AppHeader,
  AppInput,
  AppSelect,
  BottomSheet,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/ui'

const route = useRoute()
const router = useRouter()

const regionOptions = [
  { value: '', label: '전국' },
  { value: '11', label: '서울특별시' },
  { value: '26', label: '부산광역시' },
  { value: '28', label: '인천광역시' },
  { value: '41', label: '경기도' },
  { value: '42', label: '강원특별자치도' },
  { value: '50', label: '제주특별자치도' },
]

const selectedRegion = ref(String(route.query.region ?? '11'))
const selectedAge = ref(String(route.query.age ?? ''))
const selectedIncome = ref(String(route.query.income ?? ''))
const draftRegion = ref(selectedRegion.value)
const draftAge = ref(selectedAge.value)
const draftIncome = ref(selectedIncome.value)
const isFilterOpen = ref(false)
const policies = ref([])
const totalElements = ref(0)
const currentPage = ref(1)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isError = ref(false)
const isPolicyDetailOpen = ref(false)
const selectedPolicyId = ref(null)
const policyDetail = ref(null)
const isPolicyDetailLoading = ref(false)
const isPolicyDetailError = ref(false)

const regionLabel = computed(() => (
  regionOptions.find((option) => option.value === selectedRegion.value)?.label ?? '전국'
))
const hasMore = computed(() => policies.value.length < totalElements.value)

function buildParams(page) {
  return {
    region: selectedRegion.value || undefined,
    age: selectedAge.value || undefined,
    income: selectedIncome.value || undefined,
    page,
    size: 10,
  }
}

async function fetchPolicies(page, append = false) {
  if (append) isLoadingMore.value = true
  else {
    isLoading.value = true
    isError.value = false
  }

  try {
    const result = await getYouthPolicies(buildParams(page))
    policies.value = append ? [...policies.value, ...(result.content ?? [])] : (result.content ?? [])
    totalElements.value = result.totalElements ?? 0
    currentPage.value = page
  } catch {
    isError.value = true
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

function reloadPolicies() {
  fetchPolicies(1)
}

function loadMore() {
  if (!hasMore.value || isLoadingMore.value) return
  fetchPolicies(currentPage.value + 1, true)
}

function openFilter() {
  draftRegion.value = selectedRegion.value
  draftAge.value = selectedAge.value
  draftIncome.value = selectedIncome.value
  isFilterOpen.value = true
}

function clearFilter() {
  draftRegion.value = ''
  draftAge.value = ''
  draftIncome.value = ''
}

function applyFilter() {
  selectedRegion.value = draftRegion.value
  selectedAge.value = draftAge.value
  selectedIncome.value = draftIncome.value
  isFilterOpen.value = false
  router.replace({
    query: {
      ...(selectedRegion.value && { region: selectedRegion.value }),
      ...(selectedAge.value && { age: selectedAge.value }),
      ...(selectedIncome.value && { income: selectedIncome.value }),
    },
  })
  reloadPolicies()
}

async function openPolicyDetail(youthPolicyId) {
  selectedPolicyId.value = youthPolicyId
  isPolicyDetailOpen.value = true
  isPolicyDetailLoading.value = true
  isPolicyDetailError.value = false
  policyDetail.value = null

  try {
    policyDetail.value = await getYouthPolicyDetail(youthPolicyId)
  } catch {
    isPolicyDetailError.value = true
  } finally {
    isPolicyDetailLoading.value = false
  }
}

onMounted(reloadPolicies)
</script>

<template>
  <div class="min-h-screen bg-brand-lavender">
    <AppHeader title="주거 정책" mode="back" @back="router.back()">
      <template #trailing>
        <button type="button" class="text-sm font-extrabold text-brand-primary" @click="openFilter">
          필터
        </button>
      </template>
    </AppHeader>

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pt-4">
        <p class="text-sm text-muted">{{ regionLabel }} · {{ selectedAge ? `만 ${selectedAge}세` : '전체 연령' }}</p>
        <div class="mt-2 flex items-end justify-between">
          <h2 class="text-2xl font-extrabold text-ink">내 조건에 맞는 주거 정책</h2>
          <span class="text-sm font-bold text-muted">{{ totalElements }}건</span>
        </div>

        <LoadingState v-if="isLoading" message="주거 정책을 불러오는 중이에요" />
        <ErrorState v-else-if="isError" @retry="reloadPolicies" />
        <EmptyState
          v-else-if="policies.length === 0"
          title="조건에 맞는 정책이 없어요"
          description="필터 조건을 바꿔 다시 찾아보세요."
        />
        <div v-else class="mt-6 space-y-4">
          <PolicyCard
            v-for="policy in policies"
            :key="policy.youthPolicyId"
            :policy="policy"
            @detail="openPolicyDetail"
          />
          <AppButton v-if="hasMore" full-width variant="outline" :disabled="isLoadingMore" @click="loadMore">
            {{ isLoadingMore ? '정책을 불러오는 중...' : `정책 더 보기 (${policies.length}/${totalElements})` }}
          </AppButton>
        </div>
      </main>
    </BottomTabLayout>

    <BottomSheet v-model="isFilterOpen" title="지원 정책 조건 설정">
      <div class="space-y-5">
        <AppSelect v-model="draftRegion" label="지역" :options="regionOptions" />
        <AppInput
          v-model="draftAge"
          label="만 나이"
          type="number"
          min="0"
          max="120"
          placeholder="예: 25"
          hint="입력하지 않으면 모든 연령의 정책을 조회해요"
        />
        <AppInput v-model="draftIncome" label="연 소득" type="number" placeholder="예: 36000000" />
        <div class="flex gap-3 pt-2">
          <AppButton class="flex-1" variant="outline" @click="clearFilter">초기화</AppButton>
          <AppButton class="flex-1" @click="applyFilter">적용하기</AppButton>
        </div>
      </div>
    </BottomSheet>

    <PolicyDetailSheet
      v-model="isPolicyDetailOpen"
      :policy="policyDetail"
      :is-loading="isPolicyDetailLoading"
      :is-error="isPolicyDetailError"
      @retry="openPolicyDetail(selectedPolicyId)"
    />
  </div>
</template>
