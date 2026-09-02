<script setup>
import { computed } from 'vue'
import { AppCard, AppButton } from '@/shared/ui'
import { formatComparisonFactor } from '@/utils/houseFormat'

const props = defineProps({
  question: { type: Object, required: true },
  questionNumber: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answeredCount: { type: Number, required: true },
  selected: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selected', 'next'])

const optionA = computed(() => formatComparisonFactor(props.question.optionAFactor))
const optionB = computed(() => formatComparisonFactor(props.question.optionBFactor))
const progressPercent = computed(() =>
  props.totalQuestions === 0 ? 0 : (props.answeredCount / props.totalQuestions) * 100,
)

function select(side) {
  if (props.disabled) return
  emit('update:selected', side)
}
</script>

<template>
  <div>
    <h2 class="text-center text-lg font-extrabold text-ink">⚖️ 밸런스게임</h2>

    <div class="mt-6 h-1.5 w-full overflow-hidden rounded-pill bg-slate-200">
      <div
        class="h-full rounded-pill bg-brand-primary transition-all"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <p class="mt-6 text-sm font-bold text-brand-primary">
      QUESTION {{ questionNumber }} / {{ totalQuestions }}
    </p>
    <h2 class="mt-2 text-2xl font-extrabold text-ink">더 마음에 드는 조건은?</h2>
    <p class="mt-2 text-base text-muted">정답은 없어요 · 더 끌리는 쪽을 골라주세요</p>

    <AppCard
      class="mt-7 flex w-full items-center gap-4 text-left"
      interactive
      :selected="selected === 'A'"
      :disabled="disabled"
      @click="select('A')"
    >
      <span class="text-3xl" aria-hidden="true">{{ optionA.icon }}</span>
      <div class="min-w-0 flex-1">
        <p class="text-lg font-extrabold text-ink">{{ question.optionAText }}</p>
        <p v-if="optionA.example" class="mt-1 text-sm text-muted">{{ optionA.example }}</p>
      </div>
      <span
        class="grid size-5 shrink-0 place-items-center rounded-full border-2"
        :class="selected === 'A' ? 'border-brand-primary bg-brand-primary' : 'border-line'"
      >
        <span v-if="selected === 'A'" class="pop-in size-2 rounded-full bg-white" />
      </span>
    </AppCard>

    <div class="relative my-5 flex items-center justify-center">
      <span
        class="grid size-8 place-items-center rounded-full border-2 border-brand-lavender bg-white text-[11px] font-extrabold text-brand-primary shadow-card"
      >
        VS
      </span>
    </div>

    <AppCard
      class="flex w-full items-center gap-4 text-left"
      interactive
      :selected="selected === 'B'"
      :disabled="disabled"
      @click="select('B')"
    >
      <span class="text-3xl" aria-hidden="true">{{ optionB.icon }}</span>
      <div class="min-w-0 flex-1">
        <p class="text-lg font-extrabold text-ink">{{ question.optionBText }}</p>
        <p v-if="optionB.example" class="mt-1 text-sm text-muted">{{ optionB.example }}</p>
      </div>
      <span
        class="grid size-5 shrink-0 place-items-center rounded-full border-2"
        :class="selected === 'B' ? 'border-brand-primary bg-brand-primary' : 'border-line'"
      >
        <span v-if="selected === 'B'" class="pop-in size-2 rounded-full bg-white" />
      </span>
    </AppCard>

    <p class="mt-4 text-center text-sm text-muted">💡 선택은 취향 분석에만 쓰여요</p>

    <AppButton
      class="mt-3 shadow-none"
      full-width
      :disabled="!selected || disabled"
      @click="$emit('next')"
    >
      {{ submitting ? '저장하는 중이에요...' : '다음 질문 →' }}
    </AppButton>
  </div>
</template>

<style scoped>
.pop-in {
  animation: pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
