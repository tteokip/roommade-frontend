<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getYouthPolicies, getYouthPolicyDetail } from '@/api/benefits'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import PolicyCard from '@/components/benefit/PolicyCard.vue'
import PolicyDetailSheet from '@/components/benefit/PolicyDetailSheet.vue'
import { AppButton, AppHeader, EmptyState, ErrorState, LoadingState } from '@/shared/ui'

const route = useRoute()
const router = useRouter()

const regionOptions = [
  { value: '', label: '전국' },
  { value: '11', label: '서울특별시' },
  { value: '26', label: '부산광역시' },
  { value: '27', label: '대구광역시' },
  { value: '28', label: '인천광역시' },
  { value: '29', label: '광주광역시' },
  { value: '30', label: '대전광역시' },
  { value: '31', label: '울산광역시' },
  { value: '36', label: '세종특별자치시' },
  { value: '41', label: '경기도' },
  { value: '42', label: '강원특별자치도' },
  { value: '43', label: '충청북도' },
  { value: '44', label: '충청남도' },
  { value: '45', label: '전북특별자치도' },
  { value: '46', label: '전라남도' },
  { value: '47', label: '경상북도' },
  { value: '48', label: '경상남도' },
  { value: '50', label: '제주특별자치도' },
]

const selectedRegion = ref(String(route.query.region ?? '11'))
const isRegionOptionsOpen = ref(false)
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

const regionLabel = computed(
  () => regionOptions.find((option) => option.value === selectedRegion.value)?.label ?? '전국',
)
const hasMore = computed(() => policies.value.length < totalElements.value)

function buildParams(page) {
  return {
    region: selectedRegion.value || undefined,
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
    policies.value = append
      ? [...policies.value, ...(result.content ?? [])]
      : (result.content ?? [])
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

function selectRegion(region) {
  selectedRegion.value = region
  isRegionOptionsOpen.value = false
  router.replace({
    query: {
      ...(selectedRegion.value && { region: selectedRegion.value }),
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
        <div class="relative">
          <button
            type="button"
            class="text-sm font-extrabold text-brand-primary"
            :aria-expanded="isRegionOptionsOpen"
            aria-haspopup="listbox"
            @click="isRegionOptionsOpen = !isRegionOptionsOpen"
          >
            지역 선택
          </button>
          <div
            v-if="isRegionOptionsOpen"
            class="absolute right-0 top-full z-20 mt-3 max-h-85 w-52 overflow-x-hidden overflow-y-auto overscroll-contain rounded-card bg-white p-2 shadow-floating"
            role="listbox"
            aria-label="지역 선택"
          >
            <button
              v-for="option in regionOptions"
              :key="option.value"
              type="button"
              class="flex w-full items-center rounded-control px-4 py-3 text-left text-sm font-bold text-ink hover:bg-brand-lavender"
              :class="{ 'bg-brand-lavender text-brand-primary': selectedRegion === option.value }"
              role="option"
              :aria-selected="selectedRegion === option.value"
              @click="selectRegion(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </template>
    </AppHeader>

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pt-4">
        <p class="text-sm text-muted">{{ regionLabel }} · 회원님의 나이와 소득 기준</p>
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
          <AppButton
            v-if="hasMore"
            full-width
            variant="outline"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            {{
              isLoadingMore
                ? '정책을 불러오는 중...'
                : `정책 더 보기 (${policies.length}/${totalElements})`
            }}
          </AppButton>
        </div>
      </main>
    </BottomTabLayout>

    <PolicyDetailSheet
      v-model="isPolicyDetailOpen"
      :policy="policyDetail"
      :is-loading="isPolicyDetailLoading"
      :is-error="isPolicyDetailError"
      @retry="openPolicyDetail(selectedPolicyId)"
    />
  </div>
</template>
