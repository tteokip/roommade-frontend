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

export async function getRirDiagnosis() {
  const response = await apiClient.get('/preparations/rir')

  return rirDiagnosisResponseSchema.parse(response.data).data
}

export async function getDepositProgress() {
  const response = await apiClient.get('/preparations/deposit')

  return depositProgressResponseSchema.parse(response.data).data
}
