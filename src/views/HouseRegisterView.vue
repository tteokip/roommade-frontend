<script setup>
import { computed, reactive, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppHeader, ErrorState, LoadingState } from '@/shared/ui'
import HouseImageUploadPanel from '@/components/house/HouseImageUploadPanel.vue'
import HouseRegisterForm from '@/components/house/HouseRegisterForm.vue'
import {
  analyzeHouseImages,
  estimateCommute,
  getCurrentComparison,
  houseRegisterRequestSchema,
  registerHouse,
} from '@/api/house'
import { manwonInputToWon, wonToManwonInput } from '@/utils/houseFormat'

const props = defineProps({
  houseType: { type: String, required: true },
})

const router = useRouter()
const queryClient = useQueryClient()

const isValidHouseType = computed(() => ['A', 'B'].includes(props.houseType))
const houseLabel = computed(() => `${props.houseType}집`)

const {
  data: comparisonData,
  isPending: isComparisonPending,
  isFetching: isComparisonFetching,
  isError: isComparisonError,
  refetch: refetchComparison,
} = useQuery({
  queryKey: ['houseComparisonCurrent'],
  queryFn: getCurrentComparison,
  enabled: isValidHouseType,
})

const existingHouse = computed(() =>
  props.houseType === 'A' ? comparisonData.value?.houseA : comparisonData.value?.houseB,
)
const isSlotOccupied = computed(() => Boolean(existingHouse.value))

const images = ref([])
const step = ref('photo')

const form = reactive({
  baseAddress: '',
  detailAddress: '',
  deposit: '',
  monthlyRent: '',
  maintenanceFee: '',
  area: '',
  stationWalkMinutes: '',
  floorType: '',
  roomStructure: '',
  optionType: '',
})

const fieldErrors = reactive({})
const analysisNotice = ref('')
const submitError = ref('')

const commute = reactive({ status: 'idle', minMinutes: null, maxMinutes: null, message: '' })
let lastEstimatedAddress = ''

const resolvedLocation = computed(() => form.detailAddress.trim() || form.baseAddress.trim())

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback
}

async function recalculateCommute() {
  const location = resolvedLocation.value
  if (!location) {
    commute.status = 'idle'
    commute.minMinutes = null
    commute.maxMinutes = null
    commute.message = ''
    lastEstimatedAddress = ''
    return
  }
  if (location === lastEstimatedAddress && commute.status === 'success') return

  lastEstimatedAddress = location
  commute.status = 'loading'
  commute.message = ''
  try {
    const result = await estimateCommute(location)
    if (result.commuteMinMinutes == null || result.commuteMaxMinutes == null) {
      commute.status = 'error'
      commute.minMinutes = null
      commute.maxMinutes = null
      commute.message =
        '입력한 주소로는 통근시간을 계산할 수 없어요. 시/구를 포함해서 다시 확인해 주세요.'
      return
    }
    commute.status = 'success'
    commute.minMinutes = result.commuteMinMinutes
    commute.maxMinutes = result.commuteMaxMinutes
  } catch (error) {
    commute.status = 'error'
    commute.minMinutes = null
    commute.maxMinutes = null
    commute.message = extractErrorMessage(error, '통근시간을 계산하지 못했어요.')
  }
}

function applyAnalysisResult(house) {
  form.baseAddress = house.location ?? ''
  form.detailAddress = ''
  form.deposit = wonToManwonInput(house.deposit)
  form.monthlyRent = wonToManwonInput(house.monthlyRent)
  form.maintenanceFee = wonToManwonInput(house.maintenanceFee)
  form.area = house.area != null ? String(house.area) : ''
  form.stationWalkMinutes = house.stationWalkMinutes != null ? String(house.stationWalkMinutes) : ''
  form.floorType = house.floorType ?? ''
  form.roomStructure = house.roomStructure ?? ''
  form.optionType = house.optionType ?? ''

  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key])
  recalculateCommute()
}

const { mutate: analyzeImages, isPending: isAnalyzing } = useMutation({
  mutationFn: () => analyzeHouseImages(images.value),
  onSuccess: (result) => {
    submitError.value = ''
    analysisNotice.value =
      result.analysisStatus === 'PARTIAL'
        ? '일부 정보만 인식됐어요. 나머지 항목은 직접 입력해 주세요.'
        : '사진에서 매물 정보를 정리했어요. 내용을 확인해 주세요.'
    applyAnalysisResult(result.house)
    step.value = 'review'
  },
  onError: (error) => {
    analysisNotice.value = ''
    submitError.value = extractErrorMessage(
      error,
      '이미지 분석에 실패했어요. 잠시 후 다시 시도해 주세요.',
    )
  },
})

function toIntOrNull(rawValue) {
  const trimmed = String(rawValue ?? '').trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isInteger(parsed) ? parsed : NaN
}

function toFloatOrNull(rawValue) {
  const trimmed = String(rawValue ?? '').trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : NaN
}

function buildPayload() {
  return {
    location: resolvedLocation.value,
    deposit: manwonInputToWon(form.deposit),
    monthlyRent: manwonInputToWon(form.monthlyRent),
    maintenanceFee: manwonInputToWon(form.maintenanceFee),
    area: toFloatOrNull(form.area),
    stationWalkMinutes: toIntOrNull(form.stationWalkMinutes),
    commuteMinMinutes: commute.status === 'success' ? commute.minMinutes : null,
    commuteMaxMinutes: commute.status === 'success' ? commute.maxMinutes : null,
    floorType: form.floorType.trim() || null,
    roomStructure: form.roomStructure.trim() || null,
    optionType: form.optionType || null,
  }
}

const FIELD_NAME_MAP = {
  location: 'baseAddress',
  commuteRangeValid: 'commuteMinMinutes',
}

function applyFieldErrors(rawErrors) {
  const mapped = {}
  for (const [rawField, message] of rawErrors) {
    const field = FIELD_NAME_MAP[rawField] ?? rawField
    if (field && !mapped[field]) mapped[field] = message
  }

  if (mapped.commuteMinMinutes) {
    commute.status = 'error'
    commute.message = mapped.commuteMinMinutes
    delete mapped.commuteMinMinutes
  }

  Object.assign(fieldErrors, mapped)
}

function clearErrors() {
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key])
  submitError.value = ''
}

const { mutate: submitRegistration, isPending: isSubmitting } = useMutation({
  mutationFn: (payload) => registerHouse(props.houseType, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['houseComparisonCurrent'] })
    router.push({ name: 'house-comparison' })
  },
  onError: (error) => {
    const code = error?.response?.data?.code
    if (code === 'HOUSE_004') {
      submitError.value = extractErrorMessage(error, '이미 등록된 매물 슬롯이에요.')
      refetchComparison()
      return
    }
    if (code === 'COMMON_002') {
      const serverErrors = (error.response?.data?.data?.errors ?? []).map(({ field, reason }) => [
        field,
        reason,
      ])
      applyFieldErrors(serverErrors)
      submitError.value = extractErrorMessage(error, '입력값을 다시 확인해 주세요.')
      return
    }
    submitError.value = extractErrorMessage(
      error,
      '매물 등록에 실패했어요. 잠시 후 다시 시도해 주세요.',
    )
  },
})

function handleSubmit() {
  if (isSubmitting.value) return
  clearErrors()

  const payload = buildPayload()
  const validation = houseRegisterRequestSchema.safeParse(payload)
  if (!validation.success) {
    applyFieldErrors(validation.error.issues.map((issue) => [issue.path[0], issue.message]))
    submitError.value = '입력값을 다시 확인해 주세요.'
    return
  }

  submitRegistration(validation.data)
}
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader :title="`${houseLabel} 등록`" mode="back" @back="router.back()" />

    <main class="mx-auto max-w-md px-4 pb-12 pt-4">
      <ErrorState
        v-if="!isValidHouseType"
        title="잘못된 접근이에요."
        description="집 비교 화면에서 다시 시도해 주세요."
        retry-label="집 비교로 돌아가기"
        @retry="router.push({ name: 'house-comparison' })"
      />

      <LoadingState
        v-else-if="isComparisonPending || isComparisonFetching"
        message="정보를 불러오는 중이에요."
      />

      <ErrorState
        v-else-if="isComparisonError"
        title="정보를 불러오지 못했어요."
        @retry="refetchComparison"
      />

      <AppCard
        v-else-if="isSlotOccupied"
        variant="soft"
        class="flex flex-col items-center gap-3 py-10 text-center"
      >
        <span class="text-2xl" aria-hidden="true">✅</span>
        <p class="text-base font-extrabold text-ink">이미 등록된 매물이에요</p>
        <p class="text-sm text-muted">{{ houseLabel }}은 이미 등록되어 있어요.</p>
        <AppButton size="sm" @click="router.push({ name: 'house-comparison' })"
          >집 비교로 돌아가기</AppButton
        >
      </AppCard>

      <template v-else-if="step === 'photo'">
        <section class="flex flex-col items-center gap-1 py-4 text-center">
          <span class="text-3xl" aria-hidden="true">📸</span>
          <h2 class="text-lg font-extrabold text-ink">매물 사진을 올려주세요</h2>
          <p class="text-sm text-muted">
            사진 1~3장이면 AI가 매물 정보와 통근시간을 자동으로 정리해요.
          </p>
        </section>

        <HouseImageUploadPanel v-model="images" :disabled="isAnalyzing" />

        <AppButton
          class="mt-4"
          full-width
          :disabled="images.length === 0 || isAnalyzing"
          @click="analyzeImages()"
        >
          {{ isAnalyzing ? 'AI가 분석하고 있어요...' : '✨ AI로 분석하기' }}
        </AppButton>

        <p v-if="submitError" class="mt-4 text-sm font-medium text-danger">{{ submitError }}</p>
      </template>

      <template v-else>
        <p
          v-if="analysisNotice"
          class="mb-4 rounded-control bg-brand-lavender px-3 py-2 text-sm font-bold text-brand-primary"
        >
          {{ analysisNotice }}
        </p>

        <HouseRegisterForm
          :model-value="form"
          :errors="fieldErrors"
          :commute="commute"
          :disabled="isSubmitting"
          @update:field="(key, value) => (form[key] = value)"
          @recalculate-commute="recalculateCommute"
        />

        <p v-if="submitError" class="mt-4 text-sm font-medium text-danger">{{ submitError }}</p>

        <AppButton class="mt-6" full-width :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '등록하는 중이에요...' : `${houseLabel}으로 등록하기` }}
        </AppButton>
      </template>
    </main>
  </div>
</template>
