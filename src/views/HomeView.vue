<script setup>
import { ref } from 'vue'
import { getTodayQuiz, submitTodayQuizAnswer } from '@/api/quiz'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import DailyQuizCard from '@/components/quiz/DailyQuizCard.vue'
import DailyQuizSheet from '@/components/quiz/DailyQuizSheet.vue'
import RoomPreview from '@/components/room/RoomPreview.vue'

const homeFurniture = ['window', 'closet', 'bed', 'desk', 'chair', 'lamp', 'plant']

const isQuizOpen = ref(false)
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
</script>

<template>
  <div class="min-h-screen bg-page">
    <BottomTabLayout>
      <main class="mx-auto flex min-h-[calc(100vh-75px)] max-w-md flex-col gap-5 px-4 pb-6 pt-6">
        <header class="py-2 text-center">
          <h1 class="text-4xl font-black tracking-[-0.06em] text-ink">룸메이드</h1>
        </header>

        <section aria-label="나의 방" class="relative">
          <RoomPreview :furniture="homeFurniture" />

          <button
            type="button"
            class="absolute right-3 top-3 z-20 flex size-12 items-center justify-center rounded-full border border-line bg-white text-brand-primary shadow-card transition-transform active:scale-95"
            aria-label="내 방 공유하기"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="size-6 fill-none stroke-current"
              stroke-width="2.2"
            >
              <circle cx="18" cy="5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
            </svg>
          </button>

          <div class="mt-4 grid grid-cols-[1.35fr_1fr] gap-3 px-2">
            <button
              type="button"
              class="flex min-h-14 items-center justify-center gap-3 rounded-pill bg-gradient-to-r from-[#8b3cff] to-brand-primary-dark px-5 text-base font-extrabold text-white shadow-floating transition-transform active:scale-[0.98]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="size-6 fill-none stroke-current"
                stroke-width="2"
              >
                <path d="M7 4v16M17 4v16M7 7h10v7H7M9 14v6M15 14v6" />
              </svg>
              <span>내 방 꾸미기</span>
            </button>

            <button
              type="button"
              class="flex min-h-14 items-center justify-center gap-2 rounded-pill border border-line bg-white px-4 text-base font-extrabold text-body shadow-card transition-transform active:scale-[0.98]"
            >
              <span class="text-2xl" aria-hidden="true">🛍️</span>
              <span>상점</span>
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
  </div>
</template>
