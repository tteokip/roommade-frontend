<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { AppButton, AppCard, AppHeader, AppInput, ErrorState, LoadingState } from '@/shared/ui'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import GiftBoxIllustration from '@/components/daily-life/GiftBoxIllustration.vue'
import PiggyBankIllustration from '@/components/daily-life/PiggyBankIllustration.vue'
import StarRow from '@/components/daily-life/StarRow.vue'
import CoinBadge from '@/components/daily-life/CoinBadge.vue'
import AccordionItem from '@/components/daily-life/AccordionItem.vue'
import SpendingSummaryCard from '@/components/daily-life/SpendingSummaryCard.vue'
import dailyChallengeGoalIcon from '@/assets/daily-challenge-goal.png'
import {
  fetchDailyChallenge,
  fetchDailyLivingCost,
  fetchEmergencyFund,
  fetchRirDiagnosis,
  updateEmergencyFundTarget,
  updateMonthlyRent,
} from '@/api/living'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const {
  data: livingCost,
  isLoading: isLivingCostLoading,
  isError: isLivingCostError,
  refetch: refetchLivingCost,
} = useQuery({ queryKey: ['livingCost'], queryFn: fetchDailyLivingCost })

const {
  data: emergencyFund,
  isLoading: isEmergencyFundLoading,
  isError: isEmergencyFundError,
  refetch: refetchEmergencyFund,
} = useQuery({ queryKey: ['emergencyFund'], queryFn: fetchEmergencyFund })

const {
  data: dailyChallenge,
  isLoading: isDailyChallengeLoading,
  isError: isDailyChallengeError,
  refetch: refetchDailyChallenge,
} = useQuery({ queryKey: ['dailyChallenge'], queryFn: fetchDailyChallenge })

const { data: rirDiagnosis, refetch: refetchRir } = useQuery({
  queryKey: ['rirDiagnosis'],
  queryFn: fetchRirDiagnosis,
})

const isPageLoading = computed(
  () => isLivingCostLoading.value || isEmergencyFundLoading.value || isDailyChallengeLoading.value,
)
const isPageError = computed(
  () => isLivingCostError.value || isEmergencyFundError.value || isDailyChallengeError.value,
)
function retryAll() {
  refetchLivingCost()
  refetchEmergencyFund()
  refetchDailyChallenge()
  refetchRir()
}

// 챌린지 레벨별 표시용 파생 값 (백엔드는 level/maxSpending/rewardCoin만 준다)
const LEVEL_ACCENTS = {
  1: { accentClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', barClass: 'bg-emerald-500' },
  2: { accentClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10', barClass: 'bg-cyan-500' },
  3: {
    accentClass: 'text-brand-primary',
    bgClass: 'bg-brand-primary/10',
    barClass: 'bg-brand-primary',
  },
}
const LEVEL_MAX_SPENDING = {
  1: 30000,
  2: 15000,
  3: 10000,
}
const challengeLevels = computed(() => {
  if (!dailyChallenge.value) return []
  const { currentLevel, levels } = dailyChallenge.value
  return levels
    .map((lv) => ({
      ...lv,
      maxSpending: LEVEL_MAX_SPENDING[lv.level] ?? lv.maxSpending,
      ...(LEVEL_ACCENTS[lv.level] ?? LEVEL_ACCENTS[1]),
      totalStars: levels.length,
      active: lv.level === currentLevel?.level,
    }))
    .sort((a, b) => b.level - a.level)
})
const hasActiveChallenge = computed(() => Boolean(dailyChallenge.value?.currentLevel))

// 오늘 사용 금액을 0~(가장 느슨한 단계 기준액) 구간의 슬라이더로 표시한다.
const challengeMaxAmount = computed(() => {
  if (!challengeLevels.value.length) return 0
  return Math.max(...challengeLevels.value.map((lv) => lv.maxSpending))
})
const challengeSpentPercent = computed(() => {
  if (!dailyChallenge.value || !challengeMaxAmount.value) return 0
  return Math.min(
    100,
    Math.round((dailyChallenge.value.todaySpending / challengeMaxAmount.value) * 100),
  )
})
const challengeThresholds = computed(() => {
  if (!challengeMaxAmount.value) return []
  return challengeLevels.value.map((lv, index, levels) => ({
    level: lv.level,
    maxSpending: lv.maxSpending,
    percent: ((index + 1) / levels.length) * 100,
  }))
})
// 자정까지 남은 시간 카운트다운 (매일 00:00 초기화 규칙과 맞춤)
const now = ref(new Date())
let clockTimer = null
const timeUntilMidnight = computed(() => {
  const midnight = new Date(now.value)
  midnight.setHours(24, 0, 0, 0)
  const diff = Math.max(0, midnight - now.value)
  const h = String(Math.floor(diff / 3_600_000)).padStart(2, '0')
  const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0')
  const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, '0')
  return `${h}:${m}:${s}`
})

// 비상금 목표 설정
const showEmergencyFundForm = ref(false)
const emergencyFundInput = ref('')
const setEmergencyFundTarget = useMutation({
  mutationFn: updateEmergencyFundTarget,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['emergencyFund'] })
    showEmergencyFundForm.value = false
    emergencyFundInput.value = ''
  },
})
function submitEmergencyFundTarget() {
  const amount = Number(emergencyFundInput.value)
  if (!amount || amount <= 0) return
  setEmergencyFundTarget.mutate(amount)
}
const emergencyFundPercent = computed(() => {
  if (!emergencyFund.value?.targetAmount) return 0
  return Math.min(
    100,
    Math.round((emergencyFund.value.currentAmount / emergencyFund.value.targetAmount) * 100),
  )
})

// 월세 입력 → RIR 진단
const showRentForm = ref(false)
const rentInput = ref('')
const setMonthlyRent = useMutation({
  mutationFn: updateMonthlyRent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['rirDiagnosis'] })
    showRentForm.value = false
    rentInput.value = ''
  },
})
function submitMonthlyRent() {
  const amount = Number(rentInput.value)
  if (!amount || amount <= 0) return
  setMonthlyRent.mutate(amount)
}
const RIR_STATUS = {
  NORMAL: { label: '양호', badgeClass: 'bg-emerald-100 text-emerald-700' },
  EXCESSIVE: { label: '주의', badgeClass: 'bg-amber-100 text-amber-700' },
  SEVERE: { label: '위험', badgeClass: 'bg-red-100 text-red-700' },
}
const rirStatusLabel = computed(() => {
  const status = rirDiagnosis.value?.diagnosis?.status
  return status ? (RIR_STATUS[status]?.label ?? status) : ''
})
const rirBadgeClass = computed(() => {
  const status = rirDiagnosis.value?.diagnosis?.status
  return RIR_STATUS[status]?.badgeClass ?? 'bg-gray-100 text-muted'
})
const showRirDetail = ref(false)

function toManwon(amount) {
  return Math.round(amount / 10000).toLocaleString()
}
const rirExpectedRentManwon = computed(() =>
  toManwon(rirDiagnosis.value?.diagnosis?.expectedMonthlyRent ?? 0),
)
const rirRequiredReductionManwon = computed(() =>
  toManwon(rirDiagnosis.value?.diagnosis?.requiredRentReduction ?? 0),
)
const rirMonthlyIncomeManwon = computed(() =>
  toManwon(rirDiagnosis.value?.diagnosis?.monthlyIncome ?? 0),
)

// 독립진단(readiness) 페이지에서 "독립 전 → 독립 후"로 넘어올 때 ?intro=1 로 진입하면
// 스포트라이트 2단계 소개를 보여준다. 그 외에는 바로 일반 화면으로 보여준다.
const spendingCardEl = ref(null)
const restSectionEl = ref(null)
const introTargets = [spendingCardEl, restSectionEl]
const introCopy = [
  { title: '생활비 현황', desc: '이번 달 지출과 예산을 한눈에 확인할 수 있어요.' },
  {
    title: '일간 챌린지 · 비상금 · 월세 RIR',
    desc: '목표를 채우며 코인을 모으고, 독립생활에 필요한 정보를 관리해요.',
  },
]
const introStep = ref(route.query.intro === '1' ? 0 : null)
const spotlightRect = ref(null)

function updateSpotlightRect() {
  if (introStep.value === null) return
  const target = introTargets[introStep.value].value
  if (!target) return
  const rect = target.getBoundingClientRect()
  spotlightRect.value = {
    top: rect.top - 8,
    left: rect.left - 8,
    width: rect.width + 16,
    height: rect.height + 16,
  }
}

function advanceIntro() {
  if (introStep.value === null) return
  if (introStep.value < introTargets.length - 1) {
    introStep.value += 1
    nextTick(updateSpotlightRect)
  } else {
    introStep.value = null
  }
}

watch(isPageLoading, (loading) => {
  if (!loading && introStep.value !== null) {
    nextTick(updateSpotlightRect)
  }
})

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  if (introStep.value !== null) {
    nextTick(updateSpotlightRect)
    window.addEventListener('resize', updateSpotlightRect)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSpotlightRect)
  clearInterval(clockTimer)
})
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader title="독립생활" mode="back" @back="router.back()" />

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pb-6 pt-4">
        <LoadingState v-if="isPageLoading" message="독립생활 정보를 불러오는 중이에요." />
        <ErrorState v-else-if="isPageError" @retry="retryAll" />

        <template v-else>
          <div
            class="mb-4 flex items-center justify-between overflow-hidden rounded-[20px] border border-violet-200 bg-gradient-to-br from-violet-100 to-violet-200 px-5 py-4.5"
          >
            <div class="flex flex-1 items-center gap-3.5">
              <div
                class="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 shadow-[0_4px_14px_rgba(245,158,11,0.35)]"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="#f59e0b"
                    stroke="#d97706"
                    stroke-width="1.5"
                  />
                  <text
                    x="12"
                    y="16"
                    text-anchor="middle"
                    font-size="12"
                    font-weight="900"
                    fill="white"
                  >
                    P
                  </text>
                </svg>
              </div>
              <div>
                <p class="mb-0.5 text-xs font-bold text-brand-primary">
                  {{
                    hasActiveChallenge
                      ? '오늘도 꾸준히 잘하고 있어요!'
                      : '오늘은 기준 금액을 넘었어요!'
                  }}
                </p>
                <p v-if="hasActiveChallenge" class="text-[15px] font-black leading-snug text-ink">
                  이번 일간 챌린지 마감 시<br />
                  코인
                  <span class="text-brand-primary"
                    >{{ dailyChallenge.currentLevel.rewardCoin }}P</span
                  >를 받을 수 있어요!
                </p>
                <p v-else class="text-[15px] font-black leading-snug text-ink">
                  오늘 챌린지는 종료됐어요.<br />
                  내일 다시 도전해 보세요!
                </p>
              </div>
            </div>
            <div class="-mb-4.5 -mr-2 shrink-0">
              <GiftBoxIllustration />
            </div>
          </div>

          <div ref="spendingCardEl" class="mb-4">
            <SpendingSummaryCard
              :this-month-total="livingCost.thisMonthTotal"
              :same-day-last-month-total="livingCost.sameDayLastMonthTotal"
              :difference-from-last-month="livingCost.differenceFromLastMonth"
              :daily-breakdown="livingCost.dailyBreakdown"
              :last-month-daily-breakdown="livingCost.lastMonthDailyBreakdown"
            />
          </div>

          <div ref="restSectionEl" class="flex flex-col gap-4">
            <AppCard padding="sm">
              <AccordionItem default-open>
                <template #trigger="{ open }">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="flex size-9 items-center justify-center rounded-[10px] bg-violet-100"
                    >
                      <img
                        :src="dailyChallengeGoalIcon"
                        alt=""
                        class="size-6 object-contain"
                        aria-hidden="true"
                      />
                    </div>
                    <span class="text-[15px] font-extrabold text-ink">매일 챌린지</span>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    stroke-width="2.5"
                    class="shrink-0 transition-transform"
                    :class="open ? 'rotate-180' : ''"
                  >
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </template>

                <div class="mt-4">
                  <div class="mb-4 flex items-center justify-between gap-3">
                    <p class="min-w-0 text-xs font-medium leading-relaxed text-ink">
                      매일 챌린지에 참여해 코인을 획득하세요!
                    </p>
                    <div
                      class="flex shrink-0 items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-1"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7c3aed"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" stroke-linecap="round" />
                      </svg>
                      <span class="text-[11px] font-bold text-brand-primary"
                        >남은 시간 {{ timeUntilMidnight }}</span
                      >
                    </div>
                  </div>

                  <div class="mb-4 flex items-center gap-4">
                    <div class="w-[132px] shrink-0">
                      <p class="mb-2 text-[13px] font-medium text-muted">오늘 사용 금액</p>
                      <p
                        class="whitespace-nowrap text-[clamp(22px,6vw,28px)] font-black leading-tight tracking-[-0.04em] text-brand-primary tabular-nums"
                      >
                        {{ dailyChallenge.todaySpending.toLocaleString() }}원
                      </p>
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex gap-2.5">
                        <div
                          v-for="lv in challengeLevels"
                          :key="lv.level"
                          class="relative flex min-h-[108px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl px-1 py-2.5"
                          :class="
                            lv.active
                              ? 'border-[1.5px] border-brand-primary bg-violet-50'
                              : 'border-[1.5px] border-gray-100 bg-gray-50'
                          "
                        >
                          <span
                            v-if="lv.active"
                            class="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-brand-primary px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm"
                          >
                            현재 단계
                          </span>
                          <span
                            class="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                            :class="[lv.bgClass, lv.accentClass]"
                          >
                            Lv.{{ lv.level }}
                          </span>
                          <StarRow
                            :count="lv.level"
                            :total="lv.totalStars"
                            :color="lv.active ? '#7c3aed' : '#9ca3af'"
                            :size="13"
                          />
                          <CoinBadge :amount="lv.rewardCoin" :bordered="false" />
                        </div>
                      </div>

                      <div class="mt-5">
                        <div class="relative h-1.5 rounded-full bg-gray-200">
                          <div
                            class="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-300 to-brand-primary"
                            :style="{ width: `${challengeSpentPercent}%` }"
                          />
                          <div
                            v-for="threshold in challengeThresholds"
                            :key="threshold.level"
                            class="absolute top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-gray-300"
                            :style="{ left: `${threshold.percent}%` }"
                          />
                          <div
                            class="absolute top-1/2 z-10 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-primary shadow-[0_2px_6px_rgba(124,58,237,0.45)]"
                            :style="{ left: `${challengeSpentPercent}%` }"
                          />
                        </div>
                        <div class="relative mt-2.5 h-4">
                          <span class="absolute left-0 text-[10px] font-medium text-muted"
                            >0원</span
                          >
                          <span
                            v-for="threshold in challengeThresholds"
                            :key="threshold.level"
                            class="absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-muted"
                            :style="{ left: `${threshold.percent}%` }"
                          >
                            {{ threshold.maxSpending.toLocaleString() }}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="mt-3.5 flex items-center justify-center gap-1.5 rounded-[10px] border border-violet-100 bg-violet-50 px-3.5 py-2.5 text-center"
                  >
                    <span class="text-[13px]">💡</span>
                    <p class="text-[11px] font-medium leading-relaxed text-muted">
                      매일 00:00에 챌린지가 초기화돼요.<br />
                      지출 내역은 자정 기준으로 집계돼요.
                    </p>
                  </div>
                </div>
              </AccordionItem>
            </AppCard>

            <AppCard padding="sm">
              <AccordionItem default-open>
                <template #trigger="{ open }">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="flex size-9 items-center justify-center rounded-[10px] bg-emerald-50"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22c55e"
                        stroke-width="2"
                      >
                        <path
                          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <span class="text-[15px] font-extrabold text-ink">비상금</span>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    stroke-width="2.5"
                    class="shrink-0 transition-transform"
                    :class="open ? 'rotate-180' : ''"
                  >
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </template>

                <div class="mt-4 flex items-start justify-between">
                  <div class="flex-1">
                    <template v-if="!emergencyFund.targetAmount">
                      <p class="mb-1 text-base font-black text-emerald-500">
                        아직 비상금 목표가 없어요.
                      </p>
                      <p class="mb-4.5 text-[13px] text-muted">
                        독립생활을 위한 목표를 정해보세요.
                      </p>
                      <AppButton
                        v-if="!showEmergencyFundForm"
                        variant="info"
                        size="sm"
                        @click="showEmergencyFundForm = true"
                      >
                        비상금 목표 설정하기
                      </AppButton>
                      <div v-else class="flex max-w-xs items-end gap-2">
                        <AppInput
                          v-model="emergencyFundInput"
                          type="number"
                          min="1"
                          placeholder="예: 1000000"
                          hint="목표 금액을 원 단위로 입력해주세요"
                        />
                        <AppButton
                          size="sm"
                          :disabled="setEmergencyFundTarget.isPending.value"
                          @click="submitEmergencyFundTarget"
                        >
                          저장
                        </AppButton>
                      </div>
                    </template>
                    <template v-else>
                      <p class="mb-1 text-base font-black text-emerald-500">
                        {{ emergencyFund.currentAmount.toLocaleString() }}원 /
                        {{ emergencyFund.targetAmount.toLocaleString() }}원
                      </p>
                      <p class="mb-3 text-[13px] text-muted">
                        {{
                          emergencyFund.achieved
                            ? '목표를 달성했어요! 🎉'
                            : '목표를 향해 모으는 중이에요.'
                        }}
                      </p>
                      <div class="h-2 w-full max-w-xs overflow-hidden rounded-full bg-emerald-100">
                        <div
                          class="h-full rounded-full bg-emerald-500"
                          :style="{ width: `${emergencyFundPercent}%` }"
                        />
                      </div>
                    </template>
                  </div>
                  <div class="shrink-0">
                    <PiggyBankIllustration />
                  </div>
                </div>
              </AccordionItem>
            </AppCard>

            <AppCard v-if="!rirDiagnosis || rirDiagnosis.state !== 'ready'">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="mb-3 flex items-center gap-2.5">
                    <div class="flex size-9 items-center justify-center rounded-[10px] bg-cyan-50">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#06b6d4"
                        stroke-width="2"
                      >
                        <path
                          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <span class="text-[15px] font-extrabold text-ink">월세 RIR</span>
                  </div>

                  <p v-if="!rirDiagnosis" class="text-sm text-muted">불러오는 중...</p>
                  <template v-else-if="rirDiagnosis.state === 'rent_not_set'">
                    <p class="mb-1 text-base font-black text-ink">아직 없어요.</p>
                    <p class="mb-4.5 text-[13px] text-muted">
                      내 수준에 맞는 RIR 확인해보고 싶으면 월세를 입력하세요.
                    </p>
                    <AppButton
                      v-if="!showRentForm"
                      variant="info"
                      size="sm"
                      @click="showRentForm = true"
                    >
                      월세 입력하기
                    </AppButton>
                    <div v-else class="flex max-w-xs items-end gap-2">
                      <AppInput
                        v-model="rentInput"
                        type="number"
                        min="1"
                        placeholder="예: 500000"
                        hint="월세를 원 단위로 입력해주세요"
                      />
                      <AppButton
                        size="sm"
                        :disabled="setMonthlyRent.isPending.value"
                        @click="submitMonthlyRent"
                        >저장</AppButton
                      >
                    </div>
                  </template>
                  <template v-else-if="rirDiagnosis.state === 'income_missing'">
                    <p class="mb-1 text-base font-black text-ink">월 소득 정보가 필요해요.</p>
                    <p class="text-[13px] text-muted">
                      독립진단에서 월 소득을 먼저 입력하면 RIR을 계산해드려요.
                    </p>
                  </template>
                </div>
                <div class="shrink-0">
                  <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
                    <path
                      d="M22 30c0-8 6-14 14-14s14 6 14 14v2c8 1 12 8 12 18 0 12-10 18-26 18S10 62 10 50c0-10 4-17 12-18z"
                      fill="#6ee7b7"
                    />
                    <path
                      d="M22 32c0-8 6-14 14-14s14 6 14 14"
                      stroke="#059669"
                      stroke-width="2"
                      fill="none"
                      stroke-linecap="round"
                    />
                    <circle
                      cx="36"
                      cy="42"
                      r="11"
                      fill="#34d399"
                      stroke="#059669"
                      stroke-width="1.5"
                    />
                    <text
                      x="36"
                      y="47"
                      text-anchor="middle"
                      font-size="13"
                      font-weight="900"
                      fill="white"
                    >
                      ₩
                    </text>
                  </svg>
                </div>
              </div>
            </AppCard>

            <!-- RIR 계산이 끝나면 독립진단 페이지 스타일(접기/펼치기)로 보여준다 -->
            <AppCard v-else padding="sm">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 text-left"
                @click="showRirDetail = !showRirDetail"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-100"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="5.5" />
                      <circle cx="12" cy="12" r="2" fill="#7c3aed" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-1">
                      <span class="text-[15px] font-extrabold text-ink">월세 부담 RIR</span>
                      <span
                        class="flex size-4 items-center justify-center rounded-full border border-line text-[10px] text-muted"
                        >ⓘ</span
                      >
                    </div>
                    <p class="text-[11px] text-muted">
                      월세 {{ rirExpectedRentManwon }}만원 · 소득 대비
                      {{ rirDiagnosis.diagnosis.rirPercent }}%
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    :class="rirBadgeClass"
                    >{{ rirStatusLabel }}</span
                  >
                  <span class="text-sm font-black text-ink">
                    {{ rirDiagnosis.diagnosis.score
                    }}<span class="text-xs font-normal text-muted"
                      >/{{ rirDiagnosis.diagnosis.maxScore }}점</span
                    >
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    stroke-width="2.5"
                    class="shrink-0 transition-transform"
                    :class="showRirDetail ? 'rotate-180' : ''"
                  >
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </button>

              <div
                v-if="showRirDetail"
                class="mt-3 border-t border-gray-100 pt-3 text-[13px] leading-relaxed text-body"
              >
                <p v-if="rirDiagnosis.diagnosis.requiredRentReduction > 0">
                  목표 RIR {{ rirDiagnosis.diagnosis.targetRirPercent }}% 이하까지 월세를
                  <strong class="text-brand-primary">{{ rirRequiredReductionManwon }}만원</strong>
                  낮추면 만점이에요.
                </p>
                <p v-else class="font-bold text-brand-primary">
                  목표 RIR {{ rirDiagnosis.diagnosis.targetRirPercent }}% 이하를 달성했어요!
                </p>
                <p class="mt-1 text-muted">
                  월 소득 {{ rirMonthlyIncomeManwon }}만원 기준으로 계산했어요.
                </p>
              </div>
            </AppCard>
          </div>
        </template>
      </main>
    </BottomTabLayout>

    <div
      v-if="introStep !== null && spotlightRect"
      class="fixed inset-0 z-50"
      @click="advanceIntro"
    >
      <div
        class="pointer-events-none absolute rounded-2xl transition-all duration-300"
        :style="{
          top: `${spotlightRect.top}px`,
          left: `${spotlightRect.left}px`,
          width: `${spotlightRect.width}px`,
          height: `${spotlightRect.height}px`,
          boxShadow: '0 0 0 9999px rgba(10,5,30,0.75)',
        }"
      />
      <div
        class="absolute left-1/2 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2 rounded-2xl bg-white p-5 text-center shadow-floating"
        :style="{ top: `${spotlightRect.top + spotlightRect.height + 16}px` }"
      >
        <p class="mb-1 text-sm font-extrabold text-brand-primary">
          {{ introCopy[introStep].title }}
        </p>
        <p class="mb-4 text-sm text-body">{{ introCopy[introStep].desc }}</p>
        <AppButton size="sm" full-width @click.stop="advanceIntro">
          {{ introStep < introTargets.length - 1 ? '다음' : '확인' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
