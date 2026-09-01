<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppButton, AppCard, AppHeader } from '@/shared/ui'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import GiftBoxIllustration from '@/components/daily-life/GiftBoxIllustration.vue'
import PiggyBankIllustration from '@/components/daily-life/PiggyBankIllustration.vue'
import StarRow from '@/components/daily-life/StarRow.vue'
import CoinBadge from '@/components/daily-life/CoinBadge.vue'
import SpendingSummaryCard from '@/components/daily-life/SpendingSummaryCard.vue'

const route = useRoute()
const router = useRouter()

const levels = [
  {
    level: 1,
    title: '하루 2만원 목표',
    stars: 1,
    desc: '식비·교통비 포함 하루 지출 20,000원 이하',
    used: '16,300원 사용',
    pct: 81,
    reward: 20,
    accentClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    barClass: 'bg-emerald-500',
    active: false,
  },
  {
    level: 2,
    title: '하루 1.5만원 목표',
    stars: 2,
    desc: '식비·교통비 포함 하루 지출 15,000원 이하',
    used: '13,200원 사용',
    pct: 88,
    reward: 35,
    accentClass: 'text-cyan-500',
    bgClass: 'bg-cyan-500/10',
    barClass: 'bg-cyan-500',
    active: true,
  },
  {
    level: 3,
    title: '하루 1만원 목표',
    stars: 3,
    desc: '식비·교통비 포함 하루 지출 10,000원 이하',
    used: '8,700원 사용',
    pct: 87,
    reward: 50,
    accentClass: 'text-brand-primary',
    bgClass: 'bg-brand-primary/10',
    barClass: 'bg-brand-primary',
    active: false,
  },
]

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

onMounted(() => {
  if (introStep.value !== null) {
    nextTick(updateSpotlightRect)
    window.addEventListener('resize', updateSpotlightRect)
  }
})

onBeforeUnmount(() => window.removeEventListener('resize', updateSpotlightRect))
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader title="독립생활" mode="back" @back="router.back()" />

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pb-6 pt-4">
        <div
          class="mb-4 flex items-center justify-between overflow-hidden rounded-[20px] border border-violet-200 bg-gradient-to-br from-violet-100 to-violet-200 px-5 py-4.5"
        >
          <div class="flex flex-1 items-center gap-3.5">
            <div
              class="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 shadow-[0_4px_14px_rgba(245,158,11,0.35)]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
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
                오늘도 꾸준히 잘하고 있어요!
              </p>
              <p class="text-[15px] font-black leading-snug text-ink">
                이번 일간 챌린지 마감 시<br />
                코인 <span class="text-brand-primary">35P</span>를 받을 수 있어요!
              </p>
            </div>
          </div>
          <div class="-mb-4.5 -mr-2 shrink-0">
            <GiftBoxIllustration />
          </div>
        </div>

        <div ref="spendingCardEl" class="mb-4">
          <SpendingSummaryCard
            :total-spent="540000"
            :budget="800000"
            :days-left="21"
            :daily-budget="13000"
            :vs-last-month="-80000"
            :vs-last-month-percent="6"
          />
        </div>

        <div ref="restSectionEl" class="flex flex-col gap-4">
          <AppCard>
            <div class="mb-1.5 flex items-center">
              <div
                class="mr-2.5 flex size-9 items-center justify-center rounded-[10px] bg-violet-100"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="22" y1="12" x2="19" y2="12" />
                  <line x1="5" y1="12" x2="2" y2="12" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
              <span class="text-[15px] font-extrabold text-ink">일간 챌린지</span>
              <div
                class="ml-auto flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" stroke-linecap="round" />
                </svg>
                <span class="text-xs font-bold text-blue-600">남은 시간 03:24:15</span>
              </div>
            </div>

            <p class="mb-4 text-xs leading-relaxed text-muted">
              3단계 목표에 도전 중이에요! 시간이 되면 현재 달성한 단계에 따라 코인을 지급해요.
            </p>

            <div class="-mx-6 flex gap-2.5 overflow-x-auto px-6">
              <div
                class="flex w-32 shrink-0 flex-col gap-1.5 rounded-2xl border-[1.5px] border-violet-200 bg-violet-50 p-3.5"
              >
                <p
                  class="self-start rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-brand-primary"
                >
                  현재 나의 단계
                </p>
                <p class="text-[30px] font-black leading-none text-brand-primary">Lv.2</p>
                <StarRow :count="1" :total="2" color="#7c3aed" />
                <div class="my-1 flex items-center gap-1">
                  <div class="flex-1 border-t-[1.5px] border-dashed border-violet-300" />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c4b5fd"
                    stroke-width="2.5"
                  >
                    <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <p class="text-xs font-extrabold leading-snug text-ink">1.5만원 목표 달성 중!</p>
                <p class="text-[11px] leading-snug text-muted">더 높은 단계에 도전해보세요!</p>
              </div>

              <div
                v-for="lv in levels"
                :key="lv.level"
                class="flex w-[146px] shrink-0 flex-col gap-2 rounded-2xl p-3.5"
                :class="
                  lv.active
                    ? [lv.bgClass, 'border-2', 'border-brand-primary']
                    : 'border-[1.5px] border-gray-100 bg-white'
                "
              >
                <span
                  class="self-start rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                  :class="[lv.bgClass, lv.accentClass]"
                >
                  Lv.{{ lv.level }}
                </span>
                <p class="text-sm font-black leading-snug text-ink">{{ lv.title }}</p>
                <StarRow :count="lv.stars" :total="3" color="#7c3aed" size="16" />
                <p class="text-[11px] leading-relaxed text-muted">{{ lv.desc }}</p>
                <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full"
                    :class="lv.barClass"
                    :style="{ width: `${lv.pct}%` }"
                  />
                </div>
                <p class="text-[11px] font-bold" :class="lv.accentClass">
                  {{ lv.used }} <span class="font-medium text-muted">({{ lv.pct }}% 달성)</span>
                </p>
                <CoinBadge :amount="lv.reward" />
              </div>
            </div>

            <div
              class="mt-3.5 flex items-start gap-1.5 rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-2.5"
            >
              <span class="text-[13px]">💡</span>
              <p class="text-[11px] font-medium leading-relaxed text-amber-800">
                매일 00:00에 챌린지가 초기화돼요. 지출 내역은 자정 기준으로 집계돼요.
              </p>
            </div>
          </AppCard>

          <AppCard>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="mb-3 flex items-center gap-2.5">
                  <div class="flex size-9 items-center justify-center rounded-[10px] bg-emerald-50">
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
                <p class="mb-1 text-base font-black text-emerald-500">아직 비상금 목표가 없어요.</p>
                <p class="mb-4.5 text-[13px] text-muted">독립생활을 위한 목표를 정해보세요.</p>
                <AppButton variant="info" size="sm">비상금 목표 설정하기</AppButton>
              </div>
              <div class="-mr-3 -mt-2 shrink-0">
                <PiggyBankIllustration />
              </div>
            </div>
          </AppCard>

          <AppCard>
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
                <p class="mb-1 text-base font-black text-ink">아직 없어요.</p>
                <p class="mb-4.5 text-[13px] text-muted">
                  RIR 확인해보고 싶으면 월세를 입력하시오.
                </p>
                <AppButton variant="info" size="sm">월세 입력하기</AppButton>
              </div>
              <div class="-mr-1 shrink-0">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
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
        </div>
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
