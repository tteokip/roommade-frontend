<script setup>
import { AppChip } from '@/shared/ui'

const thumbnailModules = import.meta.glob('@/assets/room-layer/thumbnails/*/*.png', {
  eager: true,
  import: 'default',
})

function thumbnailSrc(variant, key) {
  const entry = Object.entries(thumbnailModules).find(([path]) =>
    path.endsWith(`/thumbnails/${variant}/${key}.png`),
  )
  return entry?.[1]
}

const categories = [
  { key: 'bed', label: '침대' },
  { key: 'desk', label: '책상' },
  { key: 'chair', label: '의자' },
  { key: 'closet', label: '옷장' },
  { key: 'lamp', label: '조명' },
  { key: 'plant', label: '화분' },
  { key: 'window', label: '창문' },
]

const variants = [
  { key: 'default', label: '기본' },
  { key: 'warm-oak', label: '웜 오크' },
  { key: 'cozy-cottage', label: '코지 코티지' },
]
</script>

<template>
  <main class="min-h-screen bg-page px-4 py-8 text-body sm:px-6 sm:py-10">
    <div class="mx-auto w-full max-w-md">
      <header class="mb-6">
        <AppChip selected>Development test</AppChip>
        <h1 class="mt-4 text-2xl font-extrabold text-ink">상점 썸네일 미리보기</h1>
        <p class="mt-2 text-sm leading-6 text-muted">
          가구 종류별로 디자인 세트 썸네일을 모아 봅니다. 실제 잠금/가격 상태는 아직 없습니다.
        </p>
      </header>

      <section v-for="category in categories" :key="category.key" class="mb-8">
        <h2 class="mb-3 text-base font-extrabold text-ink">{{ category.label }}</h2>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="variant in variants"
            :key="variant.key"
            class="rounded-control border border-line bg-white p-2 text-center"
          >
            <div class="aspect-square overflow-hidden rounded-control bg-slate-50">
              <img
                :src="thumbnailSrc(variant.key, category.key)"
                :alt="`${variant.label} ${category.label}`"
                class="h-full w-full object-contain"
              />
            </div>
            <p class="mt-2 truncate text-xs font-bold text-body">{{ variant.label }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
