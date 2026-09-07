<script setup>
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { getRoom, roomQueryKey, updateFurniturePlacement } from '@/api/room'
import RoomPreview from '@/components/room/RoomPreview.vue'
import { getRoomLayerDefinition } from '@/constants/room'
import { AppButton, AppCard, AppHeader, EmptyState, ErrorState, LoadingState } from '@/shared/ui'

const router = useRouter()
const queryClient = useQueryClient()
const placementErrorMessage = ref('')

const {
  data: room,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: roomQueryKey,
  queryFn: getRoom,
})

const furniture = computed(() => room.value?.furniture ?? [])
const placedFurniture = computed(() => furniture.value.filter((item) => item.placed))
const isPlacementPending = computed(() => placementMutation.isPending.value)
const pendingFurnitureId = computed(() => placementMutation.variables.value?.furnitureId ?? null)

const placementMutation = useMutation({
  mutationFn: ({ furnitureId, placed }) => updateFurniturePlacement(furnitureId, placed),
  onMutate: () => {
    placementErrorMessage.value = ''
  },
  onSuccess: (updatedFurniture) => {
    queryClient.setQueryData(roomQueryKey, (currentRoom) => {
      if (!currentRoom) return currentRoom

      return {
        ...currentRoom,
        furniture: currentRoom.furniture.map((item) => {
          if (item.categoryId !== updatedFurniture.categoryId) return item
          if (item.furnitureId === updatedFurniture.furnitureId) return updatedFurniture
          return updatedFurniture.placed ? { ...item, placed: false } : item
        }),
      }
    })
    queryClient.invalidateQueries({ queryKey: roomQueryKey })
  },
  onError: (error) => {
    const code = error.response?.data?.code
    placementErrorMessage.value =
      code === 'ROOM_008'
        ? '보유하지 않은 가구예요. 방 정보를 다시 불러와 주세요.'
        : '가구 배치를 변경하지 못했어요. 잠시 후 다시 시도해 주세요.'
  },
})

function togglePlacement(item) {
  if (isPlacementPending.value) return

  placementMutation.mutate({
    furnitureId: item.furnitureId,
    placed: !item.placed,
  })
}

function layerInfo(item) {
  return getRoomLayerDefinition(item.categoryName)
}
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader title="내 방 꾸미기" mode="back" @back="router.back()" />

    <main class="mx-auto max-w-md px-4 pb-10">
      <LoadingState v-if="isPending" message="내 방 가구를 불러오는 중이에요." />

      <ErrorState v-else-if="isError" title="내 방 가구를 불러오지 못했어요." @retry="refetch" />

      <template v-else>
        <AppCard padding="sm">
          <RoomPreview :furniture="placedFurniture" />
          <p class="mt-4 text-center text-sm font-bold text-muted" aria-live="polite">
            가구를 배치하거나 방에서 빼보세요.
          </p>
        </AppCard>

        <p
          v-if="placementErrorMessage"
          class="mt-4 rounded-control bg-red-50 px-4 py-3 text-sm font-bold text-danger"
          role="alert"
        >
          {{ placementErrorMessage }}
        </p>

        <section class="mt-6" aria-labelledby="owned-furniture-title">
          <div class="flex items-end justify-between gap-4 px-1">
            <div>
              <h2 id="owned-furniture-title" class="text-xl font-extrabold text-ink">보유 가구</h2>
              <p class="mt-1 text-sm text-muted">
                {{ furniture.length }}개의 가구를 보유하고 있어요.
              </p>
            </div>
            <span class="text-sm font-bold text-brand-primary">
              {{ placedFurniture.length }}개 배치 중
            </span>
          </div>

          <EmptyState
            v-if="!furniture.length"
            class="mt-4"
            title="보유한 가구가 없어요."
            description="자립 준비도를 높이면 가구를 받을 수 있어요."
          >
            <template #icon>🏠</template>
          </EmptyState>

          <div v-else class="mt-4 grid grid-cols-2 gap-3">
            <AppCard
              v-for="item in furniture"
              :key="item.furnitureId"
              padding="sm"
              :selected="item.placed"
              class="flex min-w-0 flex-col"
            >
              <div class="flex items-start justify-between gap-2">
                <span
                  class="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-lavender text-2xl"
                  aria-hidden="true"
                >
                  {{ layerInfo(item)?.icon ?? '🪑' }}
                </span>
                <span
                  class="rounded-pill px-2.5 py-1 text-[11px] font-extrabold"
                  :class="
                    item.placed
                      ? 'bg-brand-primary-soft text-brand-primary'
                      : 'bg-slate-100 text-muted'
                  "
                >
                  {{ item.placed ? '배치 중' : '보관 중' }}
                </span>
              </div>

              <p class="mt-3 truncate text-sm font-extrabold text-ink">{{ item.name }}</p>
              <p class="mt-1 text-xs text-muted">{{ item.categoryName }}</p>

              <AppButton
                class="mt-4"
                size="xs"
                full-width
                :variant="item.placed ? 'soft' : 'primary'"
                :disabled="isPlacementPending"
                @click="togglePlacement(item)"
              >
                <template v-if="pendingFurnitureId === item.furnitureId">변경 중...</template>
                <template v-else>{{ item.placed ? '방에서 빼기' : '배치하기' }}</template>
              </AppButton>
            </AppCard>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
