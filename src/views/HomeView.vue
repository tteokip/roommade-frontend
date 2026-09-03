<script setup>
import { ref } from 'vue'
import { getTodayQuiz, submitTodayQuizAnswer } from '@/api/quiz'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import DailyQuizCard from '@/components/quiz/DailyQuizCard.vue'
import DailyQuizSheet from '@/components/quiz/DailyQuizSheet.vue'

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
      <main class="mx-auto flex min-h-[calc(100vh-75px)] max-w-md flex-col justify-end px-4 pb-6 pt-10">
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
