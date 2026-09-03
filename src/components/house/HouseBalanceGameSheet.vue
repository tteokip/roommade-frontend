<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { AppButton, EmptyState, ErrorState, LoadingState } from '@/shared/ui'
import HouseBalanceGameQuestion from './HouseBalanceGameQuestion.vue'
import HouseBalanceGameResult from './HouseBalanceGameResult.vue'
import { getBalanceGameQuestions, getBalanceGameResult, submitBalanceGameAnswer } from '@/api/house'

defineProps({
  houseA: { type: Object, default: null },
  houseB: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const queryClient = useQueryClient()

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback
}

// 질문 목록 — 두 집 데이터에 따라 서버가 동적으로 골라 내려준다.
const {
  data: questionsData,
  isPending: isQuestionsPending,
  isError: isQuestionsError,
  error: questionsError,
  refetch: refetchQuestions,
} = useQuery({
  queryKey: ['balanceGameQuestions'],
  queryFn: getBalanceGameQuestions,
  retry: false,
})

const questionsErrorCode = computed(() => questionsError.value?.response?.data?.code)
const orderedQuestions = computed(() => questionsData.value?.questions ?? [])

// 서버는 답변 저장 시 갱신된 질문 목록을 다시 내려주지 않으므로, 진행 상태는 화면에서 직접 관리한다.
const localAnswers = reactive({})
const currentSelection = ref(null)
const submitError = ref('')

watch(
  orderedQuestions,
  (questions) => {
    Object.keys(localAnswers).forEach((key) => delete localAnswers[key])
    questions.forEach((question) => {
      if (question.selectedSide) localAnswers[question.questionId] = question.selectedSide
    })
  },
  { immediate: true },
)

const answeredCount = computed(
  () => orderedQuestions.value.filter((question) => localAnswers[question.questionId]).length,
)
const currentQuestion = computed(
  () => orderedQuestions.value.find((question) => !localAnswers[question.questionId]) ?? null,
)
const isAllAnswered = computed(
  () => orderedQuestions.value.length > 0 && currentQuestion.value === null,
)

watch(currentQuestion, () => {
  currentSelection.value = null
})

const { mutate: submitAnswer, isPending: isSubmitting } = useMutation({
  mutationFn: ({ questionId, selectedSide }) => submitBalanceGameAnswer(questionId, selectedSide),
  onSuccess: (_result, variables) => {
    localAnswers[variables.questionId] = variables.selectedSide
    currentSelection.value = null
    // 매 답변마다 갱신하면 "다시 하기" 중 아직 새로 안 고른 문항의 예전 서버 답변이
    // watch(orderedQuestions)로 되살아나 버린다. 로컬 진행이 실제로 다 끝났을 때만 갱신한다.
    if (isAllAnswered.value) {
      queryClient.removeQueries({ queryKey: ['balanceGameResult'] })
      queryClient.invalidateQueries({ queryKey: ['balanceGameQuestions'] })
    }
  },
  onError: (error) => {
    if (error?.response?.data?.code === 'HOUSE_015') {
      submitError.value = extractErrorMessage(error, '질문 정보가 바뀌었어요. 다시 불러올게요.')
      refetchQuestions()
      return
    }
    submitError.value = extractErrorMessage(error, '답변을 저장하지 못했어요. 다시 시도해 주세요.')
  },
})

function handleNext() {
  if (!currentQuestion.value || !currentSelection.value || isSubmitting.value) return
  submitError.value = ''
  submitAnswer({
    questionId: currentQuestion.value.questionId,
    selectedSide: currentSelection.value,
  })
}

// 답변은 문항별 PUT으로 덮어쓸 수 있으므로, 별도 초기화 API 없이 로컬 진행 상태만 되돌리면 재도전할 수 있다.
function restart() {
  Object.keys(localAnswers).forEach((key) => delete localAnswers[key])
  currentSelection.value = null
  submitError.value = ''
}

// 모든 질문에 답하면 결과를 계산한다.
const {
  data: resultData,
  isPending: isResultPending,
  isError: isResultError,
  error: resultError,
  refetch: refetchResult,
} = useQuery({
  queryKey: ['balanceGameResult'],
  queryFn: getBalanceGameResult,
  enabled: isAllAnswered,
  retry: false,
})

const resultErrorCode = computed(() => resultError.value?.response?.data?.code)

// 로컬 진행 상태와 서버 상태가 어긋나 "미완료" 오류가 나면 질문을 다시 불러와 맞춘다.
watch(resultErrorCode, (code) => {
  if (code === 'HOUSE_016') refetchQuestions()
})
</script>

<template>
  <div>
    <LoadingState v-if="isQuestionsPending" message="질문을 불러오는 중이에요." />

    <EmptyState
      v-else-if="isQuestionsError && questionsErrorCode === 'HOUSE_014'"
      title="지금은 밸런스게임을 할 수 없어요"
      description="두 집의 조건이 너무 비슷해서 비교할 질문이 없어요."
    >
      <template #icon>🤔</template>
      <template #action>
        <AppButton size="sm" @click="emit('close')">닫기</AppButton>
      </template>
    </EmptyState>

    <ErrorState
      v-else-if="isQuestionsError"
      title="질문을 불러오지 못했어요."
      @retry="refetchQuestions"
    />

    <template v-else-if="isAllAnswered">
      <LoadingState
        v-if="isResultPending || (isResultError && resultErrorCode === 'HOUSE_016')"
        message="결과를 계산하는 중이에요."
      />
      <ErrorState
        v-else-if="isResultError"
        title="결과를 불러오지 못했어요."
        @retry="refetchResult"
      />
      <HouseBalanceGameResult
        v-else-if="resultData"
        :result="resultData"
        :house-a="houseA"
        :house-b="houseB"
        @restart="restart"
      />
    </template>

    <HouseBalanceGameQuestion
      v-else-if="currentQuestion"
      :question="currentQuestion"
      :question-number="answeredCount + 1"
      :total-questions="orderedQuestions.length"
      :answered-count="answeredCount"
      :selected="currentSelection"
      :disabled="isSubmitting"
      :submitting="isSubmitting"
      @update:selected="(value) => (currentSelection = value)"
      @next="handleNext"
    />

    <p v-if="submitError" class="mt-4 text-sm font-medium text-danger">{{ submitError }}</p>
  </div>
</template>
