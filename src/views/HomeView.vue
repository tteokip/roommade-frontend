<script setup>
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { furnitureRewardsQueryKey, getFurnitureRewards, getRoom, roomQueryKey } from '@/api/room'
import shareIcon from '@/assets/share-icon.png'
import { getTodayQuiz, submitTodayQuizAnswer } from '@/api/quiz'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import DailyQuizCard from '@/components/quiz/DailyQuizCard.vue'
import DailyQuizSheet from '@/components/quiz/DailyQuizSheet.vue'
import FurnitureRewardBanner from '@/components/readiness/FurnitureRewardBanner.vue'
import RoomPreview from '@/components/room/RoomPreview.vue'
import RoomShareSheet from '@/components/room/RoomShareSheet.vue'

const router = useRouter()

const {
  data: room,
  isPending: isRoomPending,
  isError: isRoomError,
  refetch: refetchRoom,
} = useQuery({
  queryKey: roomQueryKey,
  queryFn: getRoom,
})

const placedFurniture = computed(() =>
  (room.value?.furniture ?? []).filter((furniture) => furniture.placed),
)

const {
  data: furnitureRewards,
  isError: isFurnitureRewardsError,
  isPending: isFurnitureRewardsPending,
  refetch: refetchFurnitureRewards,
} = useQuery({
  queryKey: furnitureRewardsQueryKey,
  queryFn: getFurnitureRewards,
  retry: 1,
})

const pendingFurnitureRewardCount = computed(() => furnitureRewards.value?.length ?? 0)

const isQuizOpen = ref(false)
const isRoomShareOpen = ref(false)
const todayQuiz = ref(null)
const quizResult = ref(null)
const isQuizLoading = ref(false)
const isQuizSubmitting = ref(false)
const isQuizError = ref(false)

async function openQuiz() {
  isQuizOpen.value = true
  quizResult.value = null
  isQuizLoading.value = true
  isQuizError.value = false

  try {
    todayQuiz.value = await getTodayQuiz()
  } catch {
    isQuizError.value = true
  } finally {
    isQuizLoading.value = false
  }
}

async function submitQuiz(selectedChoiceId) {
  isQuizSubmitting.value = true

  try {
    quizResult.value = await submitTodayQuizAnswer(selectedChoiceId)
    if (todayQuiz.value) todayQuiz.value = { ...todayQuiz.value, attempted: true }
  } catch {
    isQuizError.value = true
  } finally {
    isQuizSubmitting.value = false
  }
}

function openRoomDecorate() {
  router.push({ name: 'room-decorate' })
}

function openShop() {
  router.push({ name: 'furniture-shop' })
}

function openRoomShare() {
  isRoomShareOpen.value = true
}

const shareIconStyle = {
  maskImage: `url(${shareIcon})`,
  WebkitMaskImage: `url(${shareIcon})`,
}
</script>

<template>
  <div class="min-h-screen bg-page">
    <BottomTabLayout>
      <main class="mx-auto flex min-h-[calc(100vh-75px)] max-w-md flex-col gap-5 px-4 pb-6 pt-6">
        <header class="py-2 pl-[5.2%] text-left">
          <h1 class="text-4xl font-black tracking-[-0.06em] text-ink">룸메이드</h1>
        </header>

        <div v-if="isFurnitureRewardsPending" role="status">
          <span class="sr-only">가구 선택권을 확인하는 중이에요.</span>
          <span
            class="block h-[4rem] animate-pulse rounded-control bg-brand-primary-soft/70"
            aria-hidden="true"
          />
        </div>

        <div
          v-else-if="isFurnitureRewardsError"
          class="flex items-center justify-between gap-3 rounded-control bg-red-50 px-4 py-3"
          role="alert"
        >
          <span class="text-sm font-bold text-danger">가구 선택권을 확인하지 못했어요.</span>
          <button
            type="button"
            class="shrink-0 text-sm font-extrabold text-danger underline underline-offset-2"
            @click="refetchFurnitureRewards()"
          >
            다시 시도
          </button>
        </div>

        <FurnitureRewardBanner
          v-else-if="pendingFurnitureRewardCount > 0"
          :count="pendingFurnitureRewardCount"
        />

        <section aria-label="나의 방" class="relative">
          <div class="relative">
            <RoomPreview :furniture="placedFurniture" />

            <div
              v-if="isRoomPending"
              class="absolute inset-0 z-10 grid place-items-center rounded-card bg-white/75"
              role="status"
            >
              <div class="flex flex-col items-center gap-3">
                <span
                  class="size-9 animate-spin rounded-full border-4 border-brand-primary-soft border-t-brand-primary"
                />
                <span class="text-sm font-bold text-muted">내 방을 불러오는 중이에요.</span>
              </div>
            </div>

            <div
              v-else-if="isRoomError"
              class="absolute inset-0 z-10 grid place-items-center rounded-card bg-white/90 px-6 text-center"
            >
              <div>
                <p class="font-extrabold text-ink">내 방을 불러오지 못했어요.</p>
                <button
                  type="button"
                  class="mt-3 rounded-pill bg-brand-primary-soft px-4 py-2 text-sm font-bold text-brand-primary"
                  @click="refetchRoom"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            :disabled="isRoomPending || isRoomError"
            class="absolute right-3 top-3 z-20 flex size-12 items-center justify-center rounded-full border border-line bg-white text-brand-primary shadow-card transition-transform active:scale-95"
            aria-label="내 방 공유하기"
            @click="openRoomShare"
          >
            <span
              aria-hidden="true"
              class="block size-6 bg-brand-primary [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
              :style="shareIconStyle"
            />
          </button>

          <div class="mt-4 grid grid-cols-2 gap-3 px-2">
            <button
              type="button"
              :disabled="isRoomPending || isRoomError"
              class="flex min-h-14 items-center justify-center gap-2 rounded-pill border border-line bg-white px-4 text-base font-extrabold text-body shadow-card transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
              @click="openRoomDecorate"
            >
              <span class="text-2xl" aria-hidden="true">🎨</span>
              <span>방 꾸미기</span>
            </button>

            <button
              type="button"
              class="relative flex min-h-14 items-center justify-center gap-2 rounded-pill border border-line bg-white px-4 text-base font-extrabold text-body shadow-card transition-transform active:scale-[0.98]"
              @click="openShop"
            >
              <span class="text-2xl" aria-hidden="true">🛍️</span>
              <span>상점</span>
              <span
                v-if="pendingFurnitureRewardCount > 0"
                class="absolute -right-1 -top-2 grid min-h-6 min-w-6 place-items-center rounded-full bg-brand-primary px-1.5 text-xs font-extrabold text-white shadow-sm"
                :aria-label="`사용 가능한 가구 선택권 ${pendingFurnitureRewardCount}장`"
              >
                {{ pendingFurnitureRewardCount }}
              </span>
            </button>
          </div>
        </section>

        <DailyQuizCard @start="openQuiz" />
      </main>
    </BottomTabLayout>

    <DailyQuizSheet
      v-model="isQuizOpen"
      :quiz="todayQuiz"
      :result="quizResult"
      :is-loading="isQuizLoading"
      :is-submitting="isQuizSubmitting"
      :is-error="isQuizError"
      @retry="openQuiz"
      @submit="submitQuiz"
    />

    <RoomShareSheet
      v-model="isRoomShareOpen"
      :furniture="placedFurniture"
      :readiness-score="room?.readinessScore ?? 0"
    />
  </div>
</template>
