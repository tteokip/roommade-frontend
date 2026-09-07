<script setup>
import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { coinBalanceQueryKey, getCoinBalance } from '@/api/coin'
import CoinBalanceChip from '@/components/furniture/CoinBalanceChip.vue'
import FurnitureDesignCard from '@/components/furniture/FurnitureDesignCard.vue'
import FurnitureTicketChip from '@/components/furniture/FurnitureTicketChip.vue'
import FurnitureTicketIcon from '@/components/furniture/FurnitureTicketIcon.vue'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import { ROOM_LAYER_DEFINITIONS, ROOM_VARIANTS } from '@/constants/room'

const router = useRouter()

const {
  data: coinBalance,
  isPending: isCoinPending,
  isError: isCoinError,
} = useQuery({
  queryKey: coinBalanceQueryKey,
  queryFn: getCoinBalance,
})

const thumbnailModules = import.meta.glob('@/assets/room-layer/thumbnails/*/*.png', {
  eager: true,
  import: 'default',
})

const categoryNames = {
  window: '창문',
  closet: '옷장',
  bed: '침대',
  desk: '책상',
  chair: '의자',
  lamp: '조명',
  plant: '화분',
}

const categoryIcons = {
  window: '🪟',
  closet: '🚪',
  bed: '🛏️',
  desk: '🖥️',
  chair: '🪑',
  lamp: '💡',
  plant: '🪴',
}

const variantNames = {
  default: '기본',
  'warm-oak': '포근한',
  'cozy-cottage': '모던',
}

const ticketCount = ref(ROOM_LAYER_DEFINITIONS.length)
const unlockedCategoryKeys = ref([])
const unlockedCategory = ref(null)
const purchasedItemKeys = ref([])
const purchasedItem = ref(null)

function thumbnailSrc(variant, key) {
  return Object.entries(thumbnailModules).find(([path]) =>
    path.endsWith(`/thumbnails/${variant}/${key}.png`),
  )?.[1]
}

const categories = ROOM_LAYER_DEFINITIONS.map((definition) => ({
  key: definition.key,
  name: categoryNames[definition.key] ?? definition.label,
  icon: categoryIcons[definition.key],
  items: ROOM_VARIANTS.map((variant, index) => ({
    key: `${definition.key}-${variant.key}`,
    variant: variant.key,
    name: `${variantNames[variant.key]} ${categoryNames[definition.key] ?? definition.label}`,
    thumbnail: thumbnailSrc(variant.key, definition.key),
    price: index === 1 ? 2000 : 3000,
  })),
}))

function isCategoryUnlocked(categoryKey) {
  return unlockedCategoryKeys.value.includes(categoryKey)
}

function isItemPurchased(itemKey) {
  return purchasedItemKeys.value.includes(itemKey)
}

function getOwnedItemCount(category) {
  const basicItemCount = isCategoryUnlocked(category.key) ? 1 : 0
  return basicItemCount + category.items.slice(1).filter((item) => isItemPurchased(item.key)).length
}

function getItemStatus(category, item, index) {
  if (index === 0 && isCategoryUnlocked(category.key)) return '해금 완료'
  if (index === 0) return '해금하기 🎟️ 1'
  if (!isCategoryUnlocked(category.key)) return '기본 가구 해금 후 구매'
  if (isItemPurchased(item.key)) return '구매 완료'
  return ''
}

function unlockCategory(category) {
  if (ticketCount.value < 1 || isCategoryUnlocked(category.key)) return

  ticketCount.value -= 1
  unlockedCategoryKeys.value = [...unlockedCategoryKeys.value, category.key]
  unlockedCategory.value = category
}

function purchaseItem(category, item, index) {
  if (index === 0) {
    unlockCategory(category)
    return
  }
  if (!isCategoryUnlocked(category.key) || isItemPurchased(item.key)) return

  purchasedItemKeys.value = [...purchasedItemKeys.value, item.key]
  purchasedItem.value = item
}
</script>

<template>
  <div class="min-h-screen bg-page">
    <BottomTabLayout>
      <header class="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div class="mx-auto flex min-h-20 max-w-md items-center justify-between px-4">
          <button
            type="button"
            class="grid size-11 place-items-center rounded-xl bg-slate-100 text-body"
            aria-label="이전 화면"
            @click="router.back()"
          >
            <svg viewBox="0 0 24 24" class="size-5 fill-none stroke-current" stroke-width="2.6">
              <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <h1 class="absolute left-1/2 -translate-x-1/2 text-xl font-black text-ink">상점</h1>

          <div class="flex items-center gap-2" aria-label="보유 재화">
            <CoinBalanceChip
              :balance="coinBalance"
              :is-loading="isCoinPending"
              :is-error="isCoinError"
            />
            <FurnitureTicketChip :count="ticketCount" />
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-md px-4 pb-8 pt-4">
        <section
          class="relative overflow-hidden rounded-card bg-gradient-to-br from-[#f7f2ff] to-[#eee6ff] p-6 shadow-card"
          aria-labelledby="shop-guide-title"
        >
          <div class="relative z-10">
            <h2 id="shop-guide-title" class="text-lg font-black leading-7 text-ink">
              독립 전에 기본 아이템을 해금하세요!
            </h2>
            <p class="mt-2 text-sm leading-6 text-brand-primary-dark">
              카테고리의 기본 아이템을 선택권으로 해금하면 <br />다양한 가구를 코인으로 구매할 수
              있어요.
            </p>
          </div>
          <div class="mt-4 flex items-end justify-end gap-1 text-4xl" aria-hidden="true">
            <span class="text-3xl">💡</span><span class="text-2xl">🪴</span><span>🛋️</span>
          </div>
        </section>

        <section
          v-for="category in categories"
          :key="category.key"
          class="mt-7"
          :aria-labelledby="`category-${category.key}`"
        >
          <div class="mb-3 flex items-center gap-2 px-1">
            <span
              class="grid size-8 place-items-center rounded-lg bg-brand-primary-soft"
              aria-hidden="true"
            >
              {{ category.icon }}
            </span>
            <h2 :id="`category-${category.key}`" class="text-lg font-black text-ink">
              {{ category.name }}
            </h2>
            <span class="text-sm font-bold text-muted"> {{ getOwnedItemCount(category) }}/3 </span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <FurnitureDesignCard
              v-for="(item, index) in category.items"
              :key="item.key"
              fluid
              :name="item.name"
              :thumbnail="item.thumbnail"
              :selected="
                (index === 0 && isCategoryUnlocked(category.key)) || isItemPurchased(item.key)
              "
              :locked="index > 0 && !isCategoryUnlocked(category.key)"
              :ticket-cost="index === 0 && !isCategoryUnlocked(category.key) ? 1 : null"
              :price="
                index > 0 && isCategoryUnlocked(category.key) && !isItemPurchased(item.key)
                  ? item.price
                  : null
              "
              :status-text="getItemStatus(category, item, index)"
              :disabled="
                (index === 0 && (ticketCount === 0 || isCategoryUnlocked(category.key))) ||
                (index > 0 && (!isCategoryUnlocked(category.key) || isItemPurchased(item.key)))
              "
              @select="purchaseItem(category, item, index)"
            />
          </div>
        </section>

        <p
          class="mt-8 rounded-control bg-brand-primary-soft px-5 py-4 text-center text-sm font-bold text-brand-primary-dark"
        >
          새로운 가구 디자인이 계속 추가될 예정이에요.
        </p>
      </main>
    </BottomTabLayout>

    <div
      v-if="unlockedCategory"
      class="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-modal-title"
      @click.self="unlockedCategory = null"
    >
      <section class="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-xl">
        <button
          type="button"
          class="ml-auto grid size-9 place-items-center rounded-full bg-slate-100 text-muted"
          aria-label="알림 닫기"
          @click="unlockedCategory = null"
        >
          ×
        </button>
        <div class="mx-auto grid h-32 w-full place-items-center rounded-3xl bg-white">
          <FurnitureTicketIcon :size="180" />
        </div>
        <h2 id="unlock-modal-title" class="mt-5 text-xl font-black text-brand-primary-dark">
          {{ unlockedCategory.name }} 카테고리 해금 완료!
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          이제 다양한 {{ unlockedCategory.name }}을<br />코인으로 구매할 수 있어요.
        </p>
        <div class="mt-5 rounded-control bg-brand-primary-soft p-4">
          <img
            :src="unlockedCategory.items[0].thumbnail"
            :alt="unlockedCategory.items[0].name"
            class="mx-auto size-28 object-contain"
          />
          <p class="font-extrabold text-ink">{{ unlockedCategory.items[0].name }}</p>
          <p class="mt-1 text-xs font-bold text-brand-primary">이 카테고리의 기본 아이템이에요.</p>
        </div>
        <FurnitureTicketChip
          class="mx-auto mt-4 w-fit"
          label="보유 가구 선택권"
          :count="ticketCount"
        />
        <button
          type="button"
          class="mt-5 min-h-12 w-full rounded-control bg-brand-primary text-base font-extrabold text-white"
          @click="unlockedCategory = null"
        >
          확인
        </button>
      </section>
    </div>

    <div
      v-if="purchasedItem"
      class="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-modal-title"
      @click.self="purchasedItem = null"
    >
      <section class="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-xl">
        <button
          type="button"
          class="ml-auto grid size-9 place-items-center rounded-full bg-slate-100 text-muted"
          aria-label="구매 완료 알림 닫기"
          @click="purchasedItem = null"
        >
          ×
        </button>

        <div class="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100">
          <svg
            viewBox="0 0 24 24"
            class="size-9 fill-none stroke-emerald-500"
            stroke-width="2.8"
            aria-hidden="true"
          >
            <path d="m6 12 4 4 8-9" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h2 id="purchase-modal-title" class="mt-4 text-2xl font-black text-ink">구매 완료!</h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          {{ purchasedItem.name }}을(를) 구매했어요.<br />내 방에 배치해보세요!
        </p>

        <div
          class="mx-auto mt-5 max-w-48 rounded-control border border-line bg-white p-4 shadow-sm"
        >
          <img
            :src="purchasedItem.thumbnail"
            :alt="purchasedItem.name"
            class="mx-auto size-28 object-contain"
          />
          <p class="mt-2 font-extrabold text-ink">{{ purchasedItem.name }}</p>
          <p class="mt-1 text-sm font-extrabold text-amber-600">
            🪙 {{ purchasedItem.price.toLocaleString() }}P
          </p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="min-h-12 rounded-control border border-brand-primary bg-white px-2 text-sm font-extrabold text-brand-primary"
            @click="purchasedItem = null"
          >
            계속 쇼핑하기
          </button>
          <button
            type="button"
            class="min-h-12 rounded-control bg-brand-primary px-2 text-sm font-extrabold text-white"
            @click="router.push({ name: 'room-decorate' })"
          >
            내 방으로 가기
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
