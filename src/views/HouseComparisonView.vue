<script setup>
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { AppHeader, AppButton, AppCard, LoadingState, ErrorState } from '@/shared/ui'
import { HomeFilledIcon } from '@/shared/ui/icons'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import HouseMiniCard from '@/components/house/HouseMiniCard.vue'
import HouseComparisonTable from '@/components/house/HouseComparisonTable.vue'
import HouseBalanceGameBottomSheet from '@/components/house/HouseBalanceGameBottomSheet.vue'
import HouseBalanceGameSheet from '@/components/house/HouseBalanceGameSheet.vue'
import HouseBalanceGameSummaryCard from '@/components/house/HouseBalanceGameSummaryCard.vue'
import { getBalanceGameQuestions, getBalanceGameResult, getCurrentComparison } from '@/api/house'

const router = useRouter()

// 재시도 대기 중에도 빈 화면이 보이지 않도록 isPending을 로딩 상태로 사용한다.
const { data, isPending, isError, refetch } = useQuery({
  queryKey: ['houseComparisonCurrent'],
  queryFn: getCurrentComparison,
})

const houseA = computed(() => data.value?.houseA ?? null)
const houseB = computed(() => data.value?.houseB ?? null)
const balanceGameAvailable = computed(() => data.value?.balanceGameAvailable ?? false)
const hasAnyRegistered = computed(() => Boolean(houseA.value || houseB.value))

// 밸런스게임을 이미 완료했다면, 완료 여부와 결과를 미리 조회해 CTA 버튼 대신 결과 요약을 보여준다.
const { data: balanceGameQuestionsData } = useQuery({
  queryKey: ['balanceGameQuestions'],
  queryFn: getBalanceGameQuestions,
  enabled: balanceGameAvailable,
  retry: false,
})
const isBalanceGameCompleted = computed(() => balanceGameQuestionsData.value?.completed ?? false)

const { data: balanceGameResultData } = useQuery({
  queryKey: ['balanceGameResult'],
  queryFn: getBalanceGameResult,
  enabled: isBalanceGameCompleted,
  retry: false,
})

const isBalanceGameOpen = ref(false)

function goToFirstRegister() {
  router.push({ name: 'house-register', params: { houseType: 'A' } })
}
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader title="집 비교" mode="back" @back="router.back()" />

    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pt-2">
        <LoadingState v-if="isPending" message="집 비교 정보를 불러오는 중이에요." />

        <ErrorState
          v-else-if="isError"
          title="집 비교 정보를 불러오지 못했어요."
          @retry="refetch"
        />

        <template v-else>
          <template v-if="hasAnyRegistered">
            <div class="grid min-w-0 grid-cols-2 gap-3">
              <HouseMiniCard house-type="A" :house="houseA" />
              <HouseMiniCard house-type="B" :house="houseB" />
            </div>
            <HouseComparisonTable class="mt-6" :house-a="houseA" :house-b="houseB" />
          </template>

          <template v-else>
            <AppCard variant="soft" padding="sm" class="mb-4 flex items-center gap-3">
              <div class="flex-1">
                <p class="text-sm font-extrabold leading-snug text-ink">
                  스크린샷에서 AI가 핵심 정보를 찾아드려요
                </p>
                <p class="mt-1 text-xs text-muted">보증금·월세·면적을 한눈에 정리해요</p>
              </div>
              <span class="text-2xl" aria-hidden="true">🏡</span>
            </AppCard>

            <AppCard variant="gradient" class="flex flex-col items-center gap-3 py-12 text-center">
              <div class="grid size-16 place-items-center rounded-full bg-white shadow-card">
                <HomeFilledIcon class="size-8 text-brand-primary" />
              </div>
              <p class="text-xl font-extrabold text-ink">비교할 첫 번째 집을 등록해보세요</p>
              <div class="flex gap-2">
                <span
                  class="rounded-pill bg-white px-3 py-1.5 text-xs font-bold text-brand-primary shadow-card"
                >
                  ✨ AI 자동 정리
                </span>
                <span
                  class="rounded-pill bg-white px-3 py-1.5 text-xs font-bold text-brand-primary shadow-card"
                >
                  ⚖️ 두 집 한눈에 비교
                </span>
              </div>
              <p class="text-sm text-muted">사진은 최대 3장까지 올릴 수 있어요</p>
              <AppButton
                variant="primary"
                size="xs"
                class="mt-2 w-full max-w-[160px]"
                @click="goToFirstRegister"
              >
                매물 등록하기
              </AppButton>
            </AppCard>
          </template>

          <HouseBalanceGameSummaryCard
            v-if="balanceGameAvailable && balanceGameResultData"
            class="mb-6 mt-6"
            :result="balanceGameResultData"
            @open="isBalanceGameOpen = true"
          />
          <AppButton
            v-else-if="balanceGameAvailable"
            class="mt-6"
            full-width
            @click="isBalanceGameOpen = true"
          >
            고민된다면 밸런스게임 해보기
          </AppButton>
        </template>
      </main>
    </BottomTabLayout>

    <HouseBalanceGameBottomSheet v-model="isBalanceGameOpen">
      <HouseBalanceGameSheet
        :house-a="houseA"
        :house-b="houseB"
        @close="isBalanceGameOpen = false"
      />
    </HouseBalanceGameBottomSheet>
  </div>
</template>
