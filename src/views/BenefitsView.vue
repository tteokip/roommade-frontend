<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getFinancialProductDetail,
  getFinancialProducts,
  getYouthPolicyDetail,
  getYouthPolicies,
} from '@/api/benefits'
import {
  AppButton,
  AppCard,
  AppChip,
  AppHeader,
  AppInput,
  AppSelect,
  BottomSheet,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/ui'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import PolicyCard from '@/components/benefit/PolicyCard.vue'
import PolicyDetailSheet from '@/components/benefit/PolicyDetailSheet.vue'

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

const selectedRegion = ref('11')
const selectedAge = ref('')
const selectedIncome = ref('')
const draftRegion = ref(selectedRegion.value)
const draftAge = ref(selectedAge.value)
const draftIncome = ref(selectedIncome.value)
const isFilterOpen = ref(false)

const policies = ref([])
const policyTotal = ref(0)
const products = ref([])
const isPolicyLoading = ref(true)
const isProductLoading = ref(true)
const policyError = ref(false)
const productError = ref(false)
const isPolicyDetailOpen = ref(false)
const selectedPolicyId = ref(null)
const policyDetail = ref(null)
const isPolicyDetailLoading = ref(false)
const isPolicyDetailError = ref(false)
const isProductDetailOpen = ref(false)
const selectedProduct = ref(null)
const productDetail = ref(null)
const isProductDetailLoading = ref(false)
const isProductDetailError = ref(false)

const regionLabel = computed(() => regionOptions.find((option) => option.value === selectedRegion.value)?.label ?? '전국')

function buildPolicyParams() {
  return {
    region: selectedRegion.value || undefined,
    age: selectedAge.value || undefined,
    income: selectedIncome.value || undefined,
    page: 1,
    size: 3,
  }
}

async function fetchPolicies() {
  isPolicyLoading.value = true
  policyError.value = false

  try {
    const page = await getYouthPolicies(buildPolicyParams())
    policies.value = page.content ?? []
    policyTotal.value = page.totalElements ?? 0
  } catch {
    policyError.value = true
  } finally {
    isPolicyLoading.value = false
  }
}

async function fetchProducts() {
  isProductLoading.value = true
  productError.value = false

  try {
    const [deposits, savings] = await Promise.all([
      getFinancialProducts('deposits'),
      getFinancialProducts('savings'),
    ])
    products.value = [
      ...(deposits ?? []).map((product) => ({ ...product, type: '예금', apiType: 'deposits' })),
      ...(savings ?? []).map((product) => ({ ...product, type: '적금', apiType: 'savings' })),
    ].slice(0, 6)
  } catch {
    productError.value = true
  } finally {
    isProductLoading.value = false
  }
}

function openFilter() {
  draftRegion.value = selectedRegion.value
  draftAge.value = selectedAge.value
  draftIncome.value = selectedIncome.value
  isFilterOpen.value = true
}

function applyFilter() {
  selectedRegion.value = draftRegion.value
  selectedAge.value = draftAge.value
  selectedIncome.value = draftIncome.value
  isFilterOpen.value = false
  fetchPolicies()
}

function clearFilter() {
  draftRegion.value = ''
  draftAge.value = ''
  draftIncome.value = ''
}

function goToPolicyList() {
  router.push({
    name: 'benefit-policies',
    query: {
      ...(selectedRegion.value && { region: selectedRegion.value }),
      ...(selectedAge.value && { age: selectedAge.value }),
      ...(selectedIncome.value && { income: selectedIncome.value }),
    },
  })
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

async function openProductDetail(product) {
  selectedProduct.value = product
  isProductDetailOpen.value = true
  isProductDetailLoading.value = true
  isProductDetailError.value = false
  productDetail.value = null

  try {
    productDetail.value = await getFinancialProductDetail(product.apiType, product.productId)
  } catch {
    isProductDetailError.value = true
  } finally {
    isProductDetailLoading.value = false
  }
}

function formatRate(rate) {
  return rate ? `연 ${Number(rate).toFixed(1)}%` : '금리 확인 필요'
}

onMounted(() => {
  fetchPolicies()
  fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-brand-lavender">
    <AppHeader title="지원금" mode="back" @back="router.back()" />
    <BottomTabLayout>
      <main class="mx-auto max-w-md overflow-hidden bg-brand-lavender">

      <section class="px-4 pt-7">
        <button type="button" class="inline-flex items-center gap-2 rounded-pill bg-brand-primary px-5 py-4 text-base font-extrabold text-white shadow-floating" @click="openFilter">
          <span aria-hidden="true">📍</span>
          {{ regionLabel }}
          <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.8" aria-hidden="true">
            <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <AppCard class="mt-5" padding="lg">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xl font-extrabold leading-snug text-ink">지금 확인할 수 있는<br />주거 지원 정책을 찾았어요</p>
              <p class="mt-3 text-sm text-muted">내 조건에 맞는 혜택을 비교해 보세요</p>
            </div>
            <span class="text-5xl" aria-hidden="true">🎁</span>
          </div>
        </AppCard>
      </section>

      <section class="mt-10 px-4">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-ink">내 조건에 맞는 주거 정책</h2>
          <button type="button" class="text-sm font-extrabold text-brand-primary" @click="goToPolicyList">
            전체 보기 ({{ policyTotal }}건) ›
          </button>
        </div>

        <LoadingState v-if="isPolicyLoading" message="지원 정책을 불러오는 중이에요" />
        <ErrorState v-else-if="policyError" @retry="fetchPolicies" />
        <EmptyState v-else-if="policies.length === 0" title="조건에 맞는 정책이 없어요" description="지역 또는 조건을 바꿔 다시 찾아보세요." />
        <div v-else class="space-y-4">
          <PolicyCard
            v-for="policy in policies"
            :key="policy.youthPolicyId"
            :policy="policy"
            @detail="openPolicyDetail"
          />
        </div>
      </section>

      <section class="mt-11">
        <div class="mb-4 flex items-center justify-between px-4">
          <h2 class="text-xl font-extrabold text-ink">🏦 KB 맞춤 상품</h2>
          <span class="text-sm font-extrabold text-amber-500">추천</span>
        </div>

        <LoadingState v-if="isProductLoading" message="KB 상품을 불러오는 중이에요" />
        <ErrorState v-else-if="productError" @retry="fetchProducts" />
        <EmptyState v-else-if="products.length === 0" title="표시할 상품이 없어요" description="잠시 후 다시 확인해 주세요." />
        <div v-else class="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-4">
          <article v-for="product in products" :key="`${product.type}-${product.productId}`" class="w-65 shrink-0 rounded-card border-[3px] border-amber-400 bg-white p-5">
            <div class="flex size-14 items-center justify-center rounded-full bg-amber-300 text-3xl" aria-hidden="true">{{ product.type === '적금' ? '🐷' : '🏠' }}</div>
            <AppChip class="mt-5" :variant="product.type === '적금' ? 'purple' : 'blue'">{{ product.type }}</AppChip>
            <h3 class="mt-4 min-h-13 text-lg font-extrabold leading-snug text-ink">{{ product.productName }}</h3>
            <p class="mt-2 truncate text-sm text-muted">{{ product.joinMethod || product.institutionName }}</p>
            <p class="mt-7 text-2xl font-extrabold text-brand-primary">{{ formatRate(product.maxInterestRate) }}</p>
            <p class="mt-1 text-xs text-muted">최고</p>
            <button
              type="button"
              class="mt-4 w-full text-right text-sm font-extrabold text-brand-primary"
              @click="openProductDetail(product)"
            >
              상세 보기 ›
            </button>
          </article>
        </div>
      </section>
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
        <AppInput v-model="draftIncome" label="연 소득" type="number" placeholder="예: 36000000" hint="숫자만 입력해 주세요" />
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

    <BottomSheet v-model="isProductDetailOpen">
      <LoadingState v-if="isProductDetailLoading" message="상품 상세 정보를 불러오는 중이에요" />
      <ErrorState v-else-if="isProductDetailError" @retry="openProductDetail(selectedProduct)" />
      <article v-else-if="productDetail" class="pb-3">
        <p class="text-sm font-bold text-brand-primary">{{ productDetail.institutionName }}</p>
        <h2 class="mt-2 text-2xl font-extrabold leading-snug text-ink">{{ productDetail.productName }}</h2>
        <dl class="mt-6 divide-y divide-line border-y border-line text-sm">
          <div class="flex gap-4 py-4">
            <dt class="w-20 shrink-0 font-bold text-muted">가입 대상</dt>
            <dd class="font-medium text-body">{{ productDetail.joinTarget || '제한 없음' }}</dd>
          </div>
          <div class="flex gap-4 py-4">
            <dt class="w-20 shrink-0 font-bold text-muted">가입 방법</dt>
            <dd class="font-medium text-body">{{ productDetail.joinMethod || '상품 페이지에서 확인' }}</dd>
          </div>
          <div class="flex gap-4 py-4">
            <dt class="w-20 shrink-0 font-bold text-muted">최고 한도</dt>
            <dd class="font-medium text-body">{{ productDetail.maxLimit ? `${productDetail.maxLimit.toLocaleString()}원` : '한도 없음' }}</dd>
          </div>
        </dl>
        <section v-if="productDetail.specialCondition" class="mt-6">
          <h3 class="text-sm font-extrabold text-ink">우대 조건</h3>
          <p class="mt-2 whitespace-pre-line text-sm leading-6 text-body">{{ productDetail.specialCondition }}</p>
        </section>
        <section v-if="productDetail.options?.length" class="mt-6">
          <h3 class="text-sm font-extrabold text-ink">금리 정보</h3>
          <div v-for="option in productDetail.options" :key="option.optionId" class="mt-2 rounded-control bg-brand-lavender p-4 text-sm">
            <p class="font-bold text-ink">{{ option.saveTerm ? `${option.saveTerm}개월` : '기간 확인' }}</p>
            <p class="mt-1 text-body">기본 연 {{ option.baseInterestRate }}% · 최고 연 {{ option.maxInterestRate }}%</p>
          </div>
        </section>
        <a
          v-if="productDetail.productPageUrl"
          :href="productDetail.productPageUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-7 flex min-h-13 items-center justify-center rounded-pill bg-brand-primary px-5 text-base font-bold text-white shadow-floating"
        >
          상품 페이지로 이동
        </a>
      </article>
    </BottomSheet>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>
