import { z } from 'zod'

import apiClient from './client'

export const roomQueryKey = ['room']

export const roomFurnitureSchema = z.object({
  furnitureId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  categoryName: z.string().min(1),
  name: z.string().min(1),
  assetUrl: z.string().nullable(),
  placed: z.boolean(),
  acquiredAt: z.string(),
})

const roomResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('ROOM_001'),
  message: z.string(),
  data: z.object({
    readinessScore: z.number().nonnegative(),
    furniture: z.array(roomFurnitureSchema),
  }),
})

const furniturePlacementResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('ROOM_004'),
  message: z.string(),
  data: roomFurnitureSchema,
})

export async function getRoom() {
  const response = await apiClient.get('/rooms')
  return roomResponseSchema.parse(response.data).data
}

export async function updateFurniturePlacement(furnitureId, placed) {
  const validatedFurnitureId = z.number().int().positive().parse(furnitureId)
  const validatedPlaced = z.boolean().parse(placed)
  const response = await apiClient.patch(`/rooms/furniture/${validatedFurnitureId}/placement`, {
    placed: validatedPlaced,
  })

  return furniturePlacementResponseSchema.parse(response.data).data
}
