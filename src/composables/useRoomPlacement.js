import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { getRoom, roomQueryKey, updateFurniturePlacement } from '@/api/room'

export function useRoomPlacement() {
  const queryClient = useQueryClient()
  const placementErrorMessage = ref('')

  const roomQuery = useQuery({
    queryKey: roomQueryKey,
    queryFn: getRoom,
  })

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

  const furniture = computed(() => roomQuery.data.value?.furniture ?? [])
  const placedFurniture = computed(() => furniture.value.filter((item) => item.placed))
  const pendingFurnitureId = computed(() => placementMutation.variables.value?.furnitureId ?? null)

  async function setPlacement(item, placed) {
    if (placementMutation.isPending.value) return false

    try {
      await placementMutation.mutateAsync({
        furnitureId: item.furnitureId,
        placed,
      })
      return true
    } catch {
      return false
    }
  }

  function togglePlacement(item) {
    return setPlacement(item, !item.placed)
  }

  return {
    room: roomQuery.data,
    furniture,
    placedFurniture,
    isPending: roomQuery.isPending,
    isError: roomQuery.isError,
    refetch: roomQuery.refetch,
    isPlacementPending: placementMutation.isPending,
    pendingFurnitureId,
    placementErrorMessage,
    setPlacement,
    togglePlacement,
  }
}
