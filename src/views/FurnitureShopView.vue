<script setup>
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { coinBalanceQueryKey, getCoinBalance } from '@/api/coin'
import {
  furnitureRewardsQueryKey,
  getFurnitureRewards,
  getRoom,
  getShopFurniture,
  purchaseFurniture,
  roomQueryKey,
  shopFurnitureQueryKey,
} from '@/api/room'
import CoinBalanceChip from '@/components/furniture/CoinBalanceChip.vue'
import CoinIcon from '@/components/furniture/CoinIcon.vue'
import FurnitureDesignCard from '@/components/furniture/FurnitureDesignCard.vue'
import FurnitureTicketChip from '@/components/furniture/FurnitureTicketChip.vue'
import FurnitureTicketIcon from '@/components/furniture/FurnitureTicketIcon.vue'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'
import { ROOM_LAYER_DEFINITIONS, resolveRoomLayer } from '@/constants/room'

const router = useRouter()
const queryClient = useQueryClient()

const {
  data: coinBalance,
  isPending: isCoinPending,
  isError: isCoinError,
} = useQuery({
  queryKey: coinBalanceQueryKey,
  queryFn: getCoinBalance,
})

// 선택권으로 카테고리를 해금하는 실제 연동은 다른 담당자가 작업 중이라 아직 없다.
// 그동안 화면이 비어 보이지 않도록 예전 목업과 같은 방식(로컬 상태만 변경)으로 해금 버튼/모달을 유지한다.
const { data: furnitureRewards } = useQuery({
  queryKey: furnitureRewardsQueryKey,
  queryFn: getFurnitureRewards,
})
const mockTicketsUsed = ref(0)
const ticketCount = computed(() =>
  Math.max((furnitureRewards.value?.length ?? 0) - mockTicketsUsed.value, 0),
)
const unlockedCategoryKeys = ref([])
const unlockedCategory = ref(null)
const purchasedItem = ref(null)
const purchaseErrorMessage = ref('')

const {
  data: shopFurniture,
  isPending: isShopPending,
  isError: isShopError,
  refetch: refetchShop,
} = useQuery({
  queryKey: shopFurnitureQueryKey(),
  queryFn: () => getShopFurniture(),
})

const { data: room } = useQuery({
  queryKey: roomQueryKey,
  queryFn: getRoom,
})

// 카테고리가 실제로 해금됐는지는 상점 API가 내려주는 unlocked 값(기본 가구 보유 여부)으로 판단한다.
const categoryUnlockedFlags = computed(() => {
  const flags = new Map()
  ;(shopFurniture.value ?? []).forEach((item) => {
    const layer = resolveRoomLayer(item)
    if (!layer) return
    flags.set(layer.key, flags.get(layer.key) || item.unlocked)
  })
  return flags
})

function isCategoryUnlocked(categoryKey) {
  return (
    Boolean(categoryUnlockedFlags.value.get(categoryKey)) ||
    unlockedCategoryKeys.value.includes(categoryKey)
  )
}

const purchaseMutation = useMutation({
  mutationFn: ({ furnitureId }) => purchaseFurniture(furnitureId),
  onMutate: () => {
    purchaseErrorMessage.value = ''
  },
  onSuccess: (purchased, variables) => {
    queryClient.invalidateQueries({ queryKey: shopFurnitureQueryKey() })
    queryClient.invalidateQueries({ queryKey: coinBalanceQueryKey })
    queryClient.invalidateQueries({ queryKey: roomQueryKey })
    const layer = resolveRoomLayer(purchased)
    purchasedItem.value = {
      ...purchased,
      name: layer?.name ?? purchased.name,
      thumbnail: layer?.thumbnailSrc,
      price: variables.coinPrice,
    }
  },
  onError: (error) => {
    const code = error.response?.data?.code
    purchaseErrorMessage.value =
      {
        COIN_005: '코인이 부족해요. 조금 더 모아서 구매해보세요.',
        ROOM_011: '이미 보유한 가구예요.',
        ROOM_013: '기본 가구를 먼저 획득해야 구매할 수 있어요.',
        ROOM_010: '구매할 수 없는 가구예요.',
      }[code] ?? '구매하지 못했어요. 잠시 후 다시 시도해 주세요.'
  },
})

const pendingFurnitureId = computed(() => purchaseMutation.variables.value?.furnitureId ?? null)

// 상점 API는 SHOP 가구만 내려주고 기본(BASIC) 가구는 포함하지 않는다.
// 카테고리는 상점에 판매 중인 가구가 하나도 없어도 항상 보여야 하므로 정의를 먼저 채워두고,
// 상점 가구와 보유 중인 기본 가구를 각각 채워 넣는다.
const categories = computed(() => {
  const byCategoryKey = new Map(
    ROOM_LAYER_DEFINITIONS.map((definition) => [
      definition.key,
      {
        key: definition.key,
        name: definition.categoryName,
        icon: definition.icon,
        items: [],
      },
    ]),
  )

  const shopItems = shopFurniture.value ?? []
  shopItems.forEach((item) => {
    const layer = resolveRoomLayer(item)
    const bucket = layer && byCategoryKey.get(layer.key)
    if (!bucket) return

    bucket.items.push({
      ...item,
      key: `shop-${item.furnitureId}`,
      name: layer.name,
      thumbnail: layer.thumbnailSrc,
    })
  })

  const shopFurnitureIds = new Set(shopItems.map((item) => item.furnitureId))
  ;(room.value?.furniture ?? [])
    .filter((item) => !shopFurnitureIds.has(item.furnitureId))
    .forEach((basicItem) => {
      const layer = resolveRoomLayer(basicItem)
      const bucket = layer && byCategoryKey.get(layer.key)
      if (!bucket) return

      bucket.items.unshift({
        ...basicItem,
        key: `basic-${basicItem.furnitureId}`,
        name: layer.name,
        thumbnail: layer.thumbnailSrc,
        owned: true,
        isBasic: true,
      })
    })

  byCategoryKey.forEach((bucket, key) => {
    if (bucket.items.some((item) => item.owned) || isCategoryUnlocked(key)) return

    const layer = resolveRoomLayer(key)
    bucket.items.unshift({
      key: `unlock-${key}`,
      name: `기본 ${layer?.label ?? bucket.name}`,
      thumbnail: layer?.thumbnailSrc,
      isUnlockSlot: true,
    })
  })

  return Array.from(byCategoryKey.values()).filter((category) => category.items.length)
})

function getOwnedItemCount(category) {
  return category.items.filter((item) => item.owned).length
}

function getItemStatus(category, item) {
  if (item.isUnlockSlot) return '해금하기 🎟️ 1'
  if (item.isBasic) return '기본 가구'
  if (!isCategoryUnlocked(category.key)) return '기본 가구 해금 후 구매'
  if (item.owned) return '구매 완료'
  return ''
}

function unlockCategory(category) {
  if (ticketCount.value < 1 || isCategoryUnlocked(category.key)) return

  mockTicketsUsed.value += 1
  unlockedCategoryKeys.value = [...unlockedCategoryKeys.value, category.key]
  unlockedCategory.value = category
}

function purchaseItem(category, item) {
  if (item.isUnlockSlot) {
    unlockCategory(category)
    return
  }
  if (
    item.isBasic ||
    !isCategoryUnlocked(category.key) ||
    item.owned ||
    purchaseMutation.isPending.value
  )
    return

  purchaseMutation.mutate({ furnitureId: item.furnitureId, coinPrice: item.coinPrice })
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

        <p
          v-if="purchaseErrorMessage"
          class="mt-4 rounded-control bg-red-50 px-4 py-3 text-sm font-bold text-danger"
          role="alert"
        >
          {{ purchaseErrorMessage }}
        </p>

        <p v-if="isShopPending" class="mt-8 text-center text-sm text-muted">
          상점 가구를 불러오는 중이에요.
        </p>

        <div v-else-if="isShopError" class="mt-8 text-center">
          <p class="text-sm text-muted">상점 가구를 불러오지 못했어요.</p>
          <button
            type="button"
            class="mt-3 rounded-control border border-line px-4 py-2 text-sm font-extrabold text-body"
            @click="refetchShop"
          >
            다시 시도
          </button>
        </div>

        <template v-else>
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
              <span class="text-sm font-bold text-muted">
                {{ getOwnedItemCount(category) }}/{{ category.items.length }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <FurnitureDesignCard
                v-for="item in category.items"
                :key="item.key"
                fluid
                :name="item.name"
                :thumbnail="item.thumbnail"
                :selected="item.owned"
                :locked="!item.isBasic && !item.isUnlockSlot && !isCategoryUnlocked(category.key)"
                :ticket-cost="item.isUnlockSlot ? 1 : null"
                :price="
                  !item.isBasic && isCategoryUnlocked(category.key) && !item.owned
                    ? item.coinPrice
                    : null
                "
                :status-text="getItemStatus(category, item)"
                :disabled="
                  (item.isUnlockSlot && ticketCount === 0) ||
                  item.isBasic ||
                  (!item.isUnlockSlot &&
                    !item.isBasic &&
                    (!isCategoryUnlocked(category.key) || item.owned)) ||
                  pendingFurnitureId === item.furnitureId
                "
                @select="purchaseItem(category, item)"
              />
            </div>
          </section>
        </template>

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
          <p
            class="mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-amber-600"
          >
            <CoinIcon :size="16" />
            {{ purchasedItem.price.toLocaleString() }}P
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
