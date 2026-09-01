<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalSpent: { type: Number, required: true },
  budget: { type: Number, required: true },
  daysLeft: { type: Number, required: true },
  dailyBudget: { type: Number, required: true },
  vsLastMonth: { type: Number, required: true },
  vsLastMonthPercent: { type: Number, required: true },
})

const spentPercent = computed(() => Math.round((props.totalSpent / props.budget) * 100))
const remainingBudget = computed(() => props.budget - props.totalSpent)
</script>

<template>
  <div class="rounded-3xl border border-gray-100 bg-white p-5 shadow-card">
    <div class="mb-4.5 flex items-center gap-2.5">
      <div class="flex size-9 items-center justify-center rounded-[10px] bg-violet-100">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7c3aed"
          stroke-width="2"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      </div>
      <span class="text-[15px] font-extrabold text-ink">생활비 현황</span>
    </div>

    <div class="mb-4 flex gap-3">
      <div class="flex-1">
        <p class="mb-1 text-xs font-medium text-muted">이번 달 총 지출</p>
        <p class="text-[30px] font-black leading-none text-brand-primary">
          {{ totalSpent.toLocaleString() }}원
        </p>
        <p class="mt-1 text-xs text-gray-300">예산 {{ budget.toLocaleString() }}원</p>
      </div>
      <div class="w-px bg-line" />
      <div class="flex-1 pl-3">
        <p class="mb-1 text-xs font-medium text-muted">예산 대비</p>
        <p class="text-[26px] font-black text-brand-primary">{{ spentPercent }}%</p>
        <p class="mt-1 text-xs font-semibold text-body">
          남은 예산 {{ remainingBudget.toLocaleString() }}원
        </p>
      </div>
    </div>

    <div class="mb-3.5 h-2 overflow-hidden rounded-full bg-violet-100">
      <div
        class="h-full rounded-full bg-gradient-to-r from-brand-primary to-violet-400"
        :style="{ width: `${spentPercent}%` }"
      />
    </div>

    <div class="flex gap-2.5">
      <div
        class="flex flex-1 items-center gap-2.5 rounded-2xl border border-gray-100 bg-gray-50 px-3.5 py-3"
      >
        <div
          class="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-violet-100"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-medium text-muted">이번 달은</p>
          <p class="text-[13px] font-extrabold text-ink">{{ daysLeft }}일이 남았어요</p>
          <p class="text-[11px] text-muted">하루 예산 {{ dailyBudget.toLocaleString() }}원</p>
        </div>
      </div>
      <div
        class="flex flex-1 items-center gap-2.5 rounded-2xl border border-gray-100 bg-gray-50 px-3.5 py-3"
      >
        <div class="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-red-50">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            stroke-width="2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-medium text-muted">지난달 대비</p>
          <p class="text-[13px] font-extrabold text-red-500">
            {{ vsLastMonth.toLocaleString() }}원
          </p>
          <p class="text-[11px] text-muted">↓ {{ vsLastMonthPercent }}% 절약 중</p>
        </div>
      </div>
    </div>
  </div>
</template>
