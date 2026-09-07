<script setup>
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { coinBalanceQueryKey, getCoinBalance } from '@/api/coin'
import CoinBalanceChip from '@/components/furniture/CoinBalanceChip.vue'
import FurnitureDesignCard from '@/components/furniture/FurnitureDesignCard.vue'
import RoomPreview from '@/components/room/RoomPreview.vue'
import { useRoomPlacement } from '@/composables/useRoomPlacement'
import { ROOM_LAYER_DEFINITIONS, resolveRoomLayer } from '@/constants/room'
import { AppHeader, EmptyState, ErrorState, LoadingState } from '@/shared/ui'

const router = useRouter()

const {
  data: coinBalance,
  isPending: isCoinBalancePending,
  isError: isCoinBalanceError,
} = useQuery({
  queryKey: coinBalanceQueryKey,
  queryFn: getCoinBalance,
})

const {
  furniture,
  placedFurniture,
  isPending,
  isError,
  refetch,
  isPlacementPending,
  placementErrorMessage,
  setPlacement,
} = useRoomPlacement()

const categories = ROOM_LAYER_DEFINITIONS.map((definition) => ({
  key: definition.key,
  categoryName: definition.categoryName,
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

const selectedCategory = computed(
  () => categories.find((category) => category.key === selectedCategoryKey.value) ?? categories[0],
)

const designOptions = computed(() => {
  if (!selectedCategory.value) return []

  return furniture.value
    .filter((item) => item.categoryName === selectedCategory.value.categoryName)
    .map((item) => {
      const presentation = resolveRoomLayer(item)

      return {
        ...item,
        name: presentation?.name ?? item.name,
        thumbnail: presentation?.thumbnailSrc,
        variant: presentation?.variant ?? 'default',
        active: item.placed,
      }
    })
})

const hasCustomization = computed(() =>
  placedFurniture.value.some((item) => resolveRoomLayer(item)?.variant !== 'default'),
)

function selectCategory(categoryKey) {
  selectedCategoryKey.value = categoryKey
}

async function selectDesign(option) {
  if (option.active || isPlacementPending.value) return
  await setPlacement(option, true)
}

async function resetToDefault() {
  if (isPlacementPending.value) return

  const defaultFurniture = categories
    .map((category) => {
      const placedItem = furniture.value.find(
        (item) => item.categoryName === category.categoryName && item.placed,
      )
      if (!placedItem || resolveRoomLayer(placedItem)?.variant === 'default') return null

      return furniture.value.find(
        (item) =>
          item.categoryName === category.categoryName &&
          resolveRoomLayer(item)?.variant === 'default',
      )
    })
    .filter(Boolean)

  for (const item of defaultFurniture) {
    const succeeded = await setPlacement(item, true)
    if (!succeeded) break
  }
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

      <LoadingState v-if="isPending" message="내 방 가구를 불러오는 중이에요." />

      <ErrorState v-else-if="isError" title="내 방 가구를 불러오지 못했어요." @retry="refetch" />

      <template v-else>
        <div class="relative">
          <RoomPreview :furniture="placedFurniture" />

          <button
            v-if="hasCustomization"
            type="button"
            class="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-2 text-xs font-extrabold text-body shadow-card disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isPlacementPending"
            @click="resetToDefault"
          >
            <span aria-hidden="true">↺</span>
            원래대로
          </button>
        </div>

        <p
          v-if="placementErrorMessage"
          class="mt-4 rounded-control bg-red-50 px-4 py-3 text-sm font-bold text-danger"
          role="alert"
        >
          {{ placementErrorMessage }}
        </p>

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
                  selectedCategoryKey === category.key
                    ? 'stroke-brand-primary-dark'
                    : 'stroke-muted'
                "
              >
                <path v-for="d in CATEGORY_ICON_PATHS[category.key]" :key="d" :d="d" />
              </svg>
            </span>
            <span
              class="text-xs font-bold"
              :class="
                selectedCategoryKey === category.key ? 'text-brand-primary-dark' : 'text-muted'
              "
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
              {{ designOptions.length }}
            </span>
          </div>

          <EmptyState
            v-if="!designOptions.length"
            class="mt-4"
            title="보유한 디자인이 없어요."
            description="이 카테고리에서 사용할 수 있는 가구가 없습니다."
          >
            <template #icon>🏠</template>
          </EmptyState>

          <div v-else class="mt-4 flex gap-3 overflow-x-auto pb-2">
            <FurnitureDesignCard
              v-for="option in designOptions"
              :key="option.furnitureId"
              :name="option.name"
              :thumbnail="option.thumbnail"
              :selected="option.active"
              :disabled="isPlacementPending"
              :status-text="option.active ? '현재 배치 중' : '구매 완료'"
              @select="selectDesign(option)"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
