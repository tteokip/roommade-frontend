import { z } from 'zod'

import apiClient from './client'

export const coinBalanceQueryKey = ['coinBalance']

const coinBalanceResponseSchema = z.object({
  success: z.literal(true),
  code: z.literal('COIN_001'),
  message: z.string(),
  data: z.object({
    balance: z.number().int().nonnegative(),
  }),
})

export async function getCoinBalance() {
  const response = await apiClient.get('/coins/balance')
  return coinBalanceResponseSchema.parse(response.data).data.balance
}
