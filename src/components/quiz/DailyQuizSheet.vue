<script setup>
import { computed, ref, watch } from 'vue'
import { AppButton, BottomSheet, ErrorState, LoadingState } from '@/shared/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  quiz: { type: Object, default: null },
  result: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'retry', 'submit'])
const selectedChoiceId = ref(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isOxQuiz = computed(() => props.quiz?.quizType === 'OX')

watch(() => props.quiz?.quizQuestionId, () => {
  selectedChoiceId.value = null
})

function submit() {
  if (selectedChoiceId.value === null || props.isSubmitting) return
  emit('submit', selectedChoiceId.value)
}

function choiceClass(choice) {
  const isSelected = selectedChoiceId.value === choice.choiceId

  if (!isOxQuiz.value) {
    return isSelected
      ? 'border-brand-primary bg-brand-primary-soft'
      : 'border-line bg-white'
  }

  const isO = choice.content?.trim().toUpperCase() === 'O'
  if (isO) {
    return isSelected
      ? 'border-brand-primary bg-brand-primary text-white shadow-lg shadow-violet-200'
      : 'border-transparent bg-[#f3efff] text-brand-primary hover:bg-[#e9dcff]'
  }

  return isSelected
    ? 'border-[#ba3e9e] bg-[#ba3e9e] text-white shadow-lg shadow-fuchsia-200'
    : 'border-transparent bg-[#fff0fb] text-[#ba3e9e] hover:bg-[#ffe2f5]'
}

function isOChoice(choice) {
  return choice.content?.trim().toUpperCase() === 'O'
}
</script>

<template>
  <BottomSheet v-model="isOpen" title="금융 퀴즈">
    <LoadingState v-if="isLoading" message="오늘의 퀴즈를 불러오는 중이에요" />
    <ErrorState v-else-if="isError" @retry="$emit('retry')" />

    <section v-else-if="result" class="pb-3 pt-4 text-center">
      <span class="text-7xl" aria-hidden="true">{{ result.correct ? '🏆' : '💡' }}</span>
      <p class="mt-5 text-sm font-extrabold tracking-wide text-brand-primary">QUIZ COMPLETE</p>
      <h3 class="mt-3 text-3xl font-black tracking-tight text-ink">
        {{ result.correct ? '정답이에요!' : `정답은 ${result.correctChoiceContent}예요!` }}
      </h3>
      <p class="mt-3 text-base text-muted">
        {{ result.correct ? '완벽해요! 금융 지식이 훌륭해요 🎉' : '아쉽지만, 해설을 보고 다음 퀴즈도 도전해봐요.' }}
      </p>

      <div class="mt-7 rounded-[1.75rem] bg-brand-lavender px-5 py-6">
        <p class="text-base font-extrabold text-brand-primary">획득 포인트</p>
        <p class="mt-2 text-5xl font-black tracking-tight text-brand-primary">{{ result.earnedPoint }}P</p>
      </div>

      <div class="mt-4 rounded-card border border-violet-100 bg-white p-4 text-left">
        <p class="text-sm font-extrabold text-brand-primary">💡 퀴즈 해설</p>
        <p class="mt-2 text-sm leading-6 text-muted">{{ result.explanation }}</p>
      </div>

      <AppButton class="mt-6" full-width @click="isOpen = false">홈으로 돌아가기</AppButton>
    </section>

    <section v-else-if="quiz" class="pb-3">
      <div
        :class="isOxQuiz
          ? 'rounded-[2rem] border border-violet-100 bg-[radial-gradient(circle_at_top_right,_#e9dcff,_#f8f6ff_55%,_#ffffff)] p-6'
          : ''"
      >
        <p
          :class="isOxQuiz
            ? 'inline-flex rounded-pill bg-brand-primary px-3 py-1.5 text-sm font-extrabold text-white shadow-sm'
            : 'text-center text-sm font-extrabold tracking-wide text-brand-primary'"
        >
          {{ isOxQuiz ? '💰 O/X 퀴즈' : '금융 퀴즈' }}
        </p>
        <h3
          :class="isOxQuiz
            ? 'mt-5 text-left text-2xl font-black leading-snug text-ink'
            : 'mt-4 text-center text-2xl font-black leading-snug text-ink'"
        >
          {{ quiz.question }}
        </h3>
      </div>

      <div v-if="quiz.attempted" class="mt-7 rounded-card bg-brand-lavender p-5 text-center">
        <p class="font-extrabold text-ink">오늘의 퀴즈를 이미 완료했어요.</p>
        <p class="mt-2 text-sm text-muted">내일 새로운 퀴즈로 다시 만나요!</p>
      </div>

      <div v-else :class="isOxQuiz ? 'mt-7 grid grid-cols-2 gap-4' : 'mt-7 space-y-3'">
        <button
          v-for="choice in quiz.choices"
          :key="choice.choiceId"
          type="button"
          :aria-label="`${choice.content} 선택`"
          :class="[
            isOxQuiz
              ? 'flex min-h-40 flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 transition-all duration-200 hover:-translate-y-0.5'
              : 'w-full rounded-card border-2 p-5 text-left text-base font-bold text-ink transition-colors',
            choiceClass(choice),
          ]"
          @click="selectedChoiceId = choice.choiceId"
        >
          <template v-if="isOxQuiz">
            <span
              v-if="isOChoice(choice)"
              class="size-20 rounded-full border-[0.65rem] border-current"
              aria-hidden="true"
            />
            <span v-else class="relative size-20" aria-hidden="true">
              <span class="absolute left-1/2 top-0 h-full w-[0.65rem] -translate-x-1/2 rotate-45 rounded-full bg-current" />
              <span class="absolute left-1/2 top-0 h-full w-[0.65rem] -translate-x-1/2 -rotate-45 rounded-full bg-current" />
            </span>
            <span class="text-base font-extrabold tracking-tight">
              {{ isOChoice(choice) ? '그렇다' : '아니다' }}
            </span>
          </template>
          <template v-else>{{ choice.content }}</template>
        </button>
      </div>

      <AppButton
        v-if="!quiz.attempted"
        class="mt-6"
        full-width
        :disabled="selectedChoiceId === null || isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? '정답을 확인하는 중...' : '결과 보기' }}
      </AppButton>
      <AppButton v-else class="mt-6" full-width @click="isOpen = false">닫기</AppButton>
    </section>
  </BottomSheet>
</template>
