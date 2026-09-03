<script setup>
import { computed } from 'vue'

import dailyChallengeGoalImage from '@/assets/daily-challenge-goal.png'
import piggyBankImage from '@/assets/piggy-bank.svg'
import MoveInCalendarIllustration from '@/components/readiness/MoveInCalendarIllustration.vue'
import { AppCard } from '@/shared/ui'

const props = defineProps({
  moveInDate: { type: String, required: true },
})

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function parseDate(date) {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

function getKoreanToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())

  return Object.fromEntries(
    parts
      .filter(({ type }) => type === 'year' || type === 'month' || type === 'day')
      .map(({ type, value }) => [type, Number(value)]),
  )
}

const moveInDateParts = computed(() => parseDate(props.moveInDate))

const remainingDays = computed(() => {
  const target = moveInDateParts.value
  const today = getKoreanToday()
  const targetTime = Date.UTC(target.year, target.month - 1, target.day)
  const todayTime = Date.UTC(today.year, today.month - 1, today.day)

  return Math.max(Math.round((targetTime - todayTime) / DAY_IN_MILLISECONDS), 0)
})

const dDayLabel = computed(() => (remainingDays.value === 0 ? 'D-Day' : `D-${remainingDays.value}`))

const formattedMoveInDate = computed(() => {
  const { year, month, day } = moveInDateParts.value
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${weekday})`
})

const services = [
  {
    iconType: 'spending',
    title: '생활비 비교',
    descriptionLines: ['지난달과 이번 달', '지출을 비교해요'],
    iconClass: 'bg-violet-100',
  },
  {
    image: piggyBankImage,
    title: '비상금 목표',
    descriptionLines: ['독립 후 비상금을', '모아보세요'],
    iconClass: 'bg-emerald-50',
  },
  {
    image: dailyChallengeGoalImage,
    title: '일일 챌린지',
    descriptionLines: ['하루 소비 목표에', '도전해요'],
    iconClass: 'bg-orange-50',
  },
]
</script>

<template>
  <div class="space-y-5">
    <AppCard padding="none" variant="gradient" class="overflow-hidden">
      <div class="px-6 py-7 sm:px-8 sm:py-9">
        <p class="text-2xl font-extrabold tracking-tight text-brand-primary">🎉 독립 준비 완료!</p>
        <p class="mt-2 text-sm font-medium text-body">이제 입주만 기다리면 돼요.</p>

        <div class="mt-8 flex items-center justify-between gap-2">
          <div class="min-w-0 shrink-0">
            <p class="text-sm font-medium text-body">입주까지 남은 시간</p>
            <strong
              class="mt-1 block bg-gradient-to-r from-brand-primary-dark to-violet-500 bg-clip-text text-[clamp(2.75rem,14vw,3.75rem)] font-black tracking-tight text-transparent"
            >
              {{ dDayLabel }}
            </strong>
            <p class="mt-2 whitespace-nowrap text-[clamp(0.75rem,3.5vw,1rem)] font-bold text-body">
              {{ formattedMoveInDate }} 입주 예정
            </p>
          </div>

          <MoveInCalendarIllustration
            class="h-32 w-[42%] max-w-40 shrink-0 overflow-visible sm:h-36"
          />
        </div>
      </div>
    </AppCard>

    <AppCard padding="none" variant="surface">
      <div class="px-5 py-6">
        <div class="flex items-start gap-3">
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full bg-brand-lavender text-xl"
            aria-hidden="true"
          >
            🗓️
          </span>
          <div class="min-w-0">
            <h2 class="text-lg font-extrabold text-ink">입주 후 시작되는 서비스</h2>
            <p class="mt-1 text-xs leading-5 text-body">
              입주일부터 더 편리한 독립 생활을 시작할 수 있어요.
            </p>
          </div>
        </div>

        <ul class="mt-7 grid grid-cols-3 divide-x divide-line">
          <li
            v-for="service in services"
            :key="service.title"
            class="min-w-0 px-2 text-center first:pl-0 last:pr-0"
          >
            <span
              class="mx-auto grid size-11 place-items-center rounded-full text-xl"
              :class="service.iconClass"
              aria-hidden="true"
            >
              <svg
                v-if="service.iconType === 'spending'"
                viewBox="0 0 24 24"
                class="size-7 text-brand-primary"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <circle cx="17" cy="14.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <img v-else :src="service.image" alt="" class="size-8 object-contain" />
            </span>
            <strong class="mt-3 block text-xs font-extrabold text-ink sm:text-sm">
              {{ service.title }}
            </strong>
            <span class="mt-1 block text-[10px] leading-4 text-body sm:text-xs sm:leading-5">
              <span v-for="line in service.descriptionLines" :key="line" class="block">
                {{ line }}
              </span>
            </span>
          </li>
        </ul>

        <div
          class="mt-7 flex items-center justify-center gap-2 rounded-control bg-[#f8f7fc] px-3 py-4 text-xs font-bold text-body sm:text-sm"
        >
          <span aria-hidden="true">🔒</span>
          <span>{{ formattedMoveInDate }}부터 이용 가능해요</span>
        </div>
      </div>
    </AppCard>
  </div>
</template>
