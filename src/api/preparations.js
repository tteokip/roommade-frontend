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

export async function getRirDiagnosis() {
  const response = await apiClient.get('/preparations/rir')

  return rirDiagnosisResponseSchema.parse(response.data).data
}
