<script setup>
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { coinBalanceQueryKey, getCoinBalance } from '@/api/coin'
import CoinBalanceChip from '@/components/furniture/CoinBalanceChip.vue'
import FurnitureDesignCard from '@/components/furniture/FurnitureDesignCard.vue'
import RoomPreview from '@/components/room/RoomPreview.vue'
import { ROOM_LAYER_DEFINITIONS } from '@/constants/room'
import { AppHeader } from '@/shared/ui'

// 백엔드에 디자인 세트(가구 스킨) 개념이 아직 없어서, 지금은 이 화면 안에서만 쓰는
// 목업 데이터로 동작한다. 실제 보유/구매 정보가 생기면 이 배열을 API 응답으로 교체하면 된다.
const router = useRouter()

const {
  data: coinBalance,
  isPending: isCoinBalancePending,
  isError: isCoinBalanceError,
} = useQuery({
  queryKey: coinBalanceQueryKey,
  queryFn: getCoinBalance,
})

const DESIGN_SETS = [
  { key: 'default', label: '기본' },
  { key: 'warm-oak', label: '웜 오크' },
  { key: 'cozy-cottage', label: '코지 코티지' },
]

// 목업: 코지 코티지는 아직 구매하지 않은 상태로 둬서 잠금 카드도 확인할 수 있게 한다.
const LOCKED_DESIGN_SETS = new Set(['cozy-cottage'])

const thumbnailModules = import.meta.glob('@/assets/room-layer/thumbnails/*/*.png', {
  eager: true,
  import: 'default',
})

function thumbnailSrc(variantKey, categoryKey) {
  const entry = Object.entries(thumbnailModules).find(([path]) =>
    path.endsWith(`/thumbnails/${variantKey}/${categoryKey}.png`),
  )
  return entry?.[1]
}

const categories = ROOM_LAYER_DEFINITIONS.map((definition) => ({
  key: definition.key,
  label: definition.label,
}))

// 카테고리 아이콘은 상점/썸네일에 쓰는 컬러 이모지 대신, 회색 선형 아이콘으로 그린다.
// 선택된 카테고리만 보라색으로 바뀐다 (아이콘 색은 템플릿에서 currentColor로 처리).
const CATEGORY_ICON_PATHS = {
  window: ['M4 4h16v16H4V4Z', 'M12 4v16', 'M4 12h16'],
  closet: ['M5 3h14v18H5V3Z', 'M12 3v18', 'M9.5 12h0', 'M14.5 12h0'],
  bed: [
    'M3 19v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6',
    'M3 16h18',
    'M6 11V6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5',
  ],
  desk: ['M3 8h18', 'M6 8v11', 'M18 8v11', 'M9 8v3h4v-3'],
  chair: ['M7 4v8', 'M17 4v8', 'M7 5h10', 'M6 12h12v3H6V12Z', 'M8 15v5', 'M16 15v5'],
  lamp: ['M12 2 16 8H8L12 2Z', 'M12 8v10', 'M8 21h8'],
  plant: ['M8 10c0-3 2-5 4-5s4 2 4 5', 'M7 10h10l-1 9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L7 10Z'],
}

const selectedCategoryKey = ref(categories[0]?.key)

const selectedDesignByCategory = ref(
  Object.fromEntries(categories.map((category) => [category.key, 'default'])),
)

const roomFurniture = computed(() =>
  categories.map((category) => ({
    key: category.key,
    variant: selectedDesignByCategory.value[category.key],
  })),
)

const selectedCategory = computed(
  () => categories.find((category) => category.key === selectedCategoryKey.value) ?? categories[0],
)

const designOptions = computed(() =>
  DESIGN_SETS.map((set) => ({
    ...set,
    name: `${set.label} ${selectedCategory.value?.label ?? ''}`,
    thumbnail: thumbnailSrc(set.key, selectedCategory.value?.key),
    owned: !LOCKED_DESIGN_SETS.has(set.key),
    active: selectedDesignByCategory.value[selectedCategoryKey.value] === set.key,
  })),
)

const ownedCount = computed(() => designOptions.value.filter((option) => option.owned).length)

const hasCustomization = computed(() =>
  categories.some((category) => selectedDesignByCategory.value[category.key] !== 'default'),
)

function selectCategory(categoryKey) {
  selectedCategoryKey.value = categoryKey
}

function selectDesign(option) {
  if (!option.owned) return

  selectedDesignByCategory.value[selectedCategoryKey.value] = option.key
}

function resetToDefault() {
  categories.forEach((category) => {
    selectedDesignByCategory.value[category.key] = 'default'
  })
}
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader mode="back" @back="router.back()">
      <template #trailing>
        <CoinBalanceChip
          :balance="coinBalance"
          :is-loading="isCoinBalancePending"
          :is-error="isCoinBalanceError"
        />
      </template>
    </AppHeader>

    <main class="mx-auto max-w-md px-4 pb-10 pt-6">
      <h1 class="mb-8 pl-1 text-2xl font-black text-ink">방 꾸미기 모드</h1>

      <div class="relative">
        <RoomPreview :furniture="roomFurniture" />

        <button
          v-if="hasCustomization"
          type="button"
          class="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-2 text-xs font-extrabold text-body shadow-card"
          @click="resetToDefault"
        >
          <span aria-hidden="true">↺</span>
          원래대로
        </button>
      </div>

      <div class="mt-4 flex gap-3 overflow-x-auto pb-1">
        <button
          v-for="category in categories"
          :key="category.key"
          type="button"
          :aria-label="category.label"
          :aria-pressed="selectedCategoryKey === category.key"
          class="flex shrink-0 flex-col items-center gap-1"
          @click="selectCategory(category.key)"
        >
          <span
            class="grid size-12 place-items-center rounded-2xl shadow-card transition-colors"
            :class="selectedCategoryKey === category.key ? 'bg-brand-primary-soft' : 'bg-white'"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-6"
              fill="none"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="
                selectedCategoryKey === category.key ? 'stroke-brand-primary-dark' : 'stroke-muted'
              "
            >
              <path v-for="d in CATEGORY_ICON_PATHS[category.key]" :key="d" :d="d" />
            </svg>
          </span>
          <span
            class="text-xs font-bold"
            :class="selectedCategoryKey === category.key ? 'text-brand-primary-dark' : 'text-muted'"
          >
            {{ category.label }}
          </span>
        </button>
      </div>

      <section class="mt-6" aria-labelledby="owned-design-title">
        <div class="flex items-center gap-2 px-1">
          <h2 id="owned-design-title" class="whitespace-nowrap text-lg font-extrabold text-ink">
            보유 중인 {{ selectedCategory?.label }}
          </h2>
          <span class="whitespace-nowrap text-sm font-bold text-muted">
            {{ ownedCount }}/{{ designOptions.length }}
          </span>
        </div>

        <div class="mt-4 flex gap-3 overflow-x-auto pb-2">
          <FurnitureDesignCard
            v-for="option in designOptions"
            :key="option.key"
            :name="option.name"
            :thumbnail="option.thumbnail"
            :selected="option.active"
            :locked="!option.owned"
            :status-text="option.active ? '현재 배치 중' : option.owned ? '구매 완료' : '잠금'"
            @select="selectDesign(option)"
          />
        </div>

        <p v-if="designOptions.some((option) => !option.owned)" class="mt-2 text-xs text-muted">
          잠긴 디자인은 상점에서 구매할 수 있어요.
        </p>
      </section>
    </main>
  </div>
</template>
