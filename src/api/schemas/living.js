import { z } from 'zod'

// 백엔드가 LocalDate/LocalDateTime을 ISO 문자열이 아니라 Jackson 기본 배열 형식
// (예: [2026, 8, 30] / [2026, 8, 30, 16, 46, 55])으로 내려준다. 둘 다 받아들인다.
const backendDateSchema = z.union([z.string(), z.array(z.number())])

export const dailyLivingCostItemSchema = z.object({
  spendingDate: backendDateSchema,
  totalAmount: z.number(),
})

export const dailyLivingCostOverviewSchema = z.object({
  thisMonthTotal: z.number(),
  sameDayLastMonthTotal: z.number(),
  differenceFromLastMonth: z.number(),
  dailyBreakdown: z.array(dailyLivingCostItemSchema),
  lastMonthDailyBreakdown: z.array(dailyLivingCostItemSchema),
})

export const emergencyFundSchema = z.object({
  targetAmount: z.number(),
  currentAmount: z.number(),
  achieved: z.boolean(),
  achievedAt: backendDateSchema.nullable(),
})

export const challengeLevelSchema = z.object({
  level: z.number(),
  maxSpending: z.number(),
  rewardCoin: z.number(),
})

export const dailyChallengeSchema = z.object({
  todaySpending: z.number(),
  currentLevel: challengeLevelSchema,
  levels: z.array(challengeLevelSchema),
})

export const rirDiagnosisSchema = z.object({
  monthlyIncome: z.number(),
  expectedMonthlyRent: z.number(),
  rirPercent: z.number(),
  achievementRate: z.number(),
  score: z.number(),
  maxScore: z.number(),
  targetRirPercent: z.number(),
  status: z.enum(['NORMAL', 'EXCESSIVE', 'SEVERE']),
  targetMonthlyRent: z.number(),
  requiredRentReduction: z.number(),
})

export const livingRentSchema = z.object({
  monthlyRent: z.number(),
})
