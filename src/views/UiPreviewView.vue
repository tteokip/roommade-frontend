<script setup>
import { ref } from 'vue'

import { AppButton, AppCard, AppChip } from '@/shared/ui'

const selectedCard = ref('outlined')

const buttonVariants = [
  { name: 'primary', description: '기본 주요 동작' },
  { name: 'gradient', description: '강조 CTA' },
  { name: 'secondary', description: '보조 동작' },
  { name: 'info', description: '정보성 동작' },
  { name: 'selected', description: '선택 완료 상태' },
  { name: 'outline', description: '테두리 동작' },
  { name: 'soft', description: '낮은 강조' },
  { name: 'text', description: '텍스트 동작' },
]

const cardVariants = [
  { name: 'surface', description: '기본 배경과 그림자' },
  { name: 'soft', description: '연한 브랜드 배경' },
  { name: 'outlined', description: '브랜드 테두리' },
  { name: 'gradient', description: '그라데이션 배경' },
  { name: 'flat', description: '그림자 없는 기본 표면' },
]
</script>

<template>
  <main class="min-h-screen bg-page px-5 py-10 text-body">
    <div class="mx-auto max-w-5xl">
      <header class="mb-10">
        <AppChip selected>Development preview</AppChip>
        <h1 class="mt-4 text-3xl font-extrabold text-ink">Button & Card variants</h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-muted">
          이슈 #9에서 확장한 공통 버튼과 카드의 variant, 크기, 선택 및 비활성 상태를 비교합니다.
        </p>
      </header>

      <div class="space-y-12">
        <section aria-labelledby="button-variants-title">
          <h2 id="button-variants-title" class="text-xl font-extrabold text-ink">버튼 Variant</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AppCard
              v-for="button in buttonVariants"
              :key="button.name"
              padding="sm"
              variant="flat"
            >
              <p class="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {{ button.description }}
              </p>
              <AppButton :variant="button.name" full-width>{{ button.name }}</AppButton>
            </AppCard>
          </div>
        </section>

        <section aria-labelledby="button-sizes-title">
          <h2 id="button-sizes-title" class="text-xl font-extrabold text-ink">크기와 상태</h2>
          <AppCard class="mt-5">
            <div class="flex flex-wrap items-center gap-3">
              <AppButton
                v-for="size in ['xs', 'sm', 'md', 'lg']"
                :key="size"
                variant="gradient"
                :size="size"
              >
                {{ size }} button
              </AppButton>
              <AppButton icon-only size="xs" aria-label="작은 즐겨찾기">★</AppButton>
              <AppButton icon-only aria-label="즐겨찾기">★</AppButton>
              <AppButton icon-only size="lg" variant="outline" aria-label="큰 즐겨찾기"
                >★</AppButton
              >
              <AppButton disabled>disabled</AppButton>
              <AppButton variant="selected" disabled>selected disabled</AppButton>
            </div>
            <div class="mt-5 max-w-lg">
              <AppButton variant="gradient" full-width>전체 너비 CTA</AppButton>
            </div>
          </AppCard>
        </section>

        <section aria-labelledby="card-variants-title">
          <h2 id="card-variants-title" class="text-xl font-extrabold text-ink">카드 Variant</h2>
          <p class="mt-2 text-sm text-muted">카드를 눌러 선택 상태를 이동해 보세요.</p>
          <div class="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AppCard
              v-for="card in cardVariants"
              :key="card.name"
              :variant="card.name"
              interactive
              :selected="selectedCard === card.name"
              role="button"
              tabindex="0"
              @click="selectedCard = card.name"
              @keydown.enter="selectedCard = card.name"
              @keydown.space.prevent="selectedCard = card.name"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <AppChip>{{ card.name }}</AppChip>
                  <h3 class="mt-4 text-lg font-extrabold text-ink">{{ card.name }} 카드</h3>
                  <p class="mt-2 text-sm text-muted">{{ card.description }}</p>
                </div>
              </div>
            </AppCard>

            <AppCard disabled>
              <AppChip variant="neutral">disabled</AppChip>
              <h3 class="mt-4 text-lg font-extrabold text-ink">비활성 카드</h3>
              <p class="mt-2 text-sm text-muted">`inert`와 비활성 스타일이 적용된 상태입니다.</p>
              <AppButton class="mt-5" size="sm" disabled>사용할 수 없음</AppButton>
            </AppCard>
          </div>
        </section>

        <section aria-labelledby="padding-title">
          <h2 id="padding-title" class="text-xl font-extrabold text-ink">Padding</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AppCard
              v-for="padding in ['none', 'sm', 'md', 'lg']"
              :key="padding"
              :padding="padding"
              variant="outlined"
            >
              <div :class="padding === 'none' ? 'p-3' : ''">
                <p class="font-extrabold text-ink">padding: {{ padding }}</p>
              </div>
            </AppCard>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
