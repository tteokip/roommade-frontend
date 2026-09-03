import { z } from 'zod'

import apiClient from './client'

const rirDiagnosisSchema = z.object({
  monthlyIncome: z.number().positive(),
  expectedMonthlyRent: z.number().positive(),
  rirPercent: z.number().nonnegative(),
  achievementRate: z.number().min(0).max(100),
  score: z.number().min(0),
  maxScore: z.number().positive(),
  targetRirPercent: z.number().positive(),
  status: z.enum(['NORMAL', 'EXCESSIVE', 'SEVERE']),
  targetMonthlyRent: z.number().nonnegative(),
  requiredRentReduction: z.number().nonnegative(),
})

const rirDiagnosisResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: rirDiagnosisSchema,
})

const depositProgressSchema = z.object({
  targetDeposit: z.number().positive(),
  currentDeposit: z.number().nonnegative(),
  achievementRate: z.number().min(0).max(100),
  score: z.number().nonnegative(),
  maxScore: z.number().positive(),
  remainingDeposit: z.number().nonnegative(),
})

const depositProgressResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: depositProgressSchema,
})

const houseComparisonProgressSchema = z.object({
  houseComparisonScore: z.number().int().nonnegative(),
  maxScore: z.number().int().positive(),
  houseComparisonCompletedAt: z.string().nullable(),
})

const houseComparisonProgressResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: houseComparisonProgressSchema,
})

const houseConfirmationRequestSchema = z.discriminatedUnion('confirmationType', [
  z.object({
    confirmationType: z.literal('COMPARISON'),
    houseId: z.number().int().positive(),
    moveInDate: z.iso.date(),
  }),
  z.object({
    confirmationType: z.literal('OTHER'),
    moveInDate: z.iso.date(),
  }),
])

const houseConfirmationResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: z.object({
    confirmedHouseId: z.number().int().positive().nullable(),
    manualRentInputRequired: z.boolean(),
    moveInDate: z.iso.date(),
    movedInAt: z.string().nullable(),
    independenceStatus: z.enum(['MOVE_IN_SCHEDULED', 'MOVED_IN']),
  }),
})

export async function getRirDiagnosis() {
  const response = await apiClient.get('/preparations/rir')

  return rirDiagnosisResponseSchema.parse(response.data).data
}

export async function getDepositProgress() {
  const response = await apiClient.get('/preparations/deposit')

  return depositProgressResponseSchema.parse(response.data).data
}

export async function getHouseComparisonProgress() {
  const response = await apiClient.get('/preparations/house-comparison')

  return houseComparisonProgressResponseSchema.parse(response.data).data
}

export async function confirmHouse(payload) {
  const validatedPayload = houseConfirmationRequestSchema.parse(payload)
  const response = await apiClient.post('/move-ins', validatedPayload)

  return houseConfirmationResponseSchema.parse(response.data).data
}
