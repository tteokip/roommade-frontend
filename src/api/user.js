import { z } from 'zod'

import apiClient from './client'

export const userLoginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해주세요.')
    .max(255, '이메일은 255자 이하로 입력해주세요.')
    .email('올바른 이메일 주소를 입력해주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 8자 이상 입력해주세요.')
    .max(64, '비밀번호는 64자 이하로 입력해주세요.'),
})

export async function login(payload) {
  const validatedPayload = userLoginRequestSchema.parse(payload)
  const response = await apiClient.post('/users/login', validatedPayload)
  return response.data
}
