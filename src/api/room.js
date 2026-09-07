import { z } from 'zod'

import apiClient from './client'

export const roomQueryKey = ['room']
export const furnitureRewardsQueryKey = ['room', 'furniture-rewards']
export const shopFurnitureQueryKey = (categoryId) => ['room', 'shop-furniture', categoryId ?? null]

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

const furnitureRewardOptionSchema = z.object({
  furnitureId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  categoryName: z.string().min(1),
  name: z.string().min(1),
  assetUrl: z.string().nullable(),
})

const furnitureRewardsResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('ROOM_002'),
  message: z.string(),
  data: z.object({
    rewards: z.array(
      z.object({
        rewardId: z.number().int().positive(),
        rewardStage: z.number().int().nonnegative(),
        grantedAt: z.string(),
        choices: z.array(furnitureRewardOptionSchema),
      }),
    ),
  }),
})

const furnitureRewardClaimResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('ROOM_003'),
  message: z.string(),
  data: roomFurnitureSchema,
})

const shopFurnitureItemSchema = z.object({
  furnitureId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  categoryName: z.string().min(1),
  name: z.string().min(1),
  assetUrl: z.string().nullable(),
  coinPrice: z.number().int().nonnegative(),
  owned: z.boolean(),
  unlocked: z.boolean(),
})

const shopFurnitureResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('ROOM_012'),
  message: z.string(),
  data: z.object({
    furniture: z.array(shopFurnitureItemSchema),
  }),
})

const furniturePurchaseResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('ROOM_009'),
  message: z.string(),
  data: roomFurnitureSchema,
})

export async function getRoom() {
  const response = await apiClient.get('/rooms')
  return roomResponseSchema.parse(response.data).data
}

export async function getFurnitureRewards() {
  const response = await apiClient.get('/rooms/furniture-rewards')
  return furnitureRewardsResponseSchema.parse(response.data).data.rewards
}

export async function claimFurnitureReward(rewardId, furnitureId) {
  const validatedRewardId = z.number().int().positive().parse(rewardId)
  const validatedFurnitureId = z.number().int().positive().parse(furnitureId)
  const response = await apiClient.post(`/rooms/furniture-rewards/${validatedRewardId}/claim`, {
    furnitureId: validatedFurnitureId,
  })

  return furnitureRewardClaimResponseSchema.parse(response.data).data
}

export async function updateFurniturePlacement(furnitureId, placed) {
  const validatedFurnitureId = z.number().int().positive().parse(furnitureId)
  const validatedPlaced = z.boolean().parse(placed)
  const response = await apiClient.patch(`/rooms/furniture/${validatedFurnitureId}/placement`, {
    placed: validatedPlaced,
  })

  return furniturePlacementResponseSchema.parse(response.data).data
}

export async function getShopFurniture(categoryId) {
  const response = await apiClient.get('/rooms/shop/furniture', {
    params: categoryId ? { categoryId } : undefined,
  })
  return shopFurnitureResponseSchema.parse(response.data).data.furniture
}

export async function purchaseFurniture(furnitureId) {
  const validatedFurnitureId = z.number().int().positive().parse(furnitureId)
  const response = await apiClient.post(`/rooms/furniture/${validatedFurnitureId}/purchase`)

  return furniturePurchaseResponseSchema.parse(response.data).data
}
