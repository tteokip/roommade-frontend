import { z } from 'zod'
import apiClient from './client'

export async function getCurrentComparison() {
  const { data } = await apiClient.get('/house-comparisons/current')
  return data.data
}

export async function analyzeHouseImages(images) {
  const formData = new FormData()
  images.forEach((image) => formData.append('images', image))

  const { data } = await apiClient.post('/house-analyses', formData)
  return data.data
}

export async function estimateCommute(location) {
  const { data } = await apiClient.get('/houses/commute-estimate', { params: { location } })
  return data.data
}

export const houseRegisterRequestSchema = z
  .object({
    location: z
      .string({ error: '주소를 입력해 주세요.' })
      .trim()
      .min(1, '주소를 입력해 주세요.')
      .max(255, '주소는 255자 이내로 입력해 주세요.'),
    deposit: z
      .number({ error: '보증금을 숫자로 입력해 주세요.' })
      .int('보증금은 정수로 입력해 주세요.')
      .min(0, '보증금은 0 이상이어야 해요.'),
    monthlyRent: z
      .number({ error: '월세를 숫자로 입력해 주세요.' })
      .int('월세는 정수로 입력해 주세요.')
      .min(0, '월세는 0 이상이어야 해요.'),
    maintenanceFee: z
      .number({ error: '관리비는 숫자로 입력해 주세요.' })
      .int('관리비는 정수로 입력해 주세요.')
      .min(0, '관리비는 0 이상이어야 해요.')
      .nullable(),
    area: z
      .number({ error: '면적은 숫자로 입력해 주세요.' })
      .positive('면적은 0보다 커야 해요.')
      .max(999999.99, '면적 값이 너무 커요.')
      .refine(
        (value) => Number.isInteger(Math.round(value * 100)),
        '면적은 소수 둘째 자리까지 입력해 주세요.',
      )
      .nullable(),
    stationWalkMinutes: z
      .number({ error: '역까지 도보 시간은 숫자로 입력해 주세요.' })
      .int('역까지 도보 시간은 정수로 입력해 주세요.')
      .min(0, '역까지 도보 시간은 0 이상이어야 해요.')
      .nullable(),
    commuteMinMinutes: z.number().int().min(0).nullable(),
    commuteMaxMinutes: z.number().int().min(0).nullable(),
    floorType: z.string().max(30, '층 정보는 30자 이내로 입력해 주세요.').nullable(),
    roomStructure: z.string().max(30, '구조는 30자 이내로 입력해 주세요.').nullable(),
    optionType: z.string().max(30, '옵션은 30자 이내로 입력해 주세요.').nullable(),
  })
  .refine((value) => (value.commuteMinMinutes == null) === (value.commuteMaxMinutes == null), {
    message: '통근시간을 다시 계산해 주세요.',
    path: ['commuteMinMinutes'],
  })
  .refine(
    (value) =>
      value.commuteMinMinutes == null || value.commuteMinMinutes <= value.commuteMaxMinutes,
    { message: '통근시간 계산 값이 올바르지 않아요.', path: ['commuteMinMinutes'] },
  )

export async function registerHouse(houseType, payload) {
  const validatedPayload = houseRegisterRequestSchema.parse(payload)
  const { data } = await apiClient.post(
    `/house-comparisons/current/houses/${houseType}`,
    validatedPayload,
  )
  return data.data
}

const comparisonFactorSchema = z.enum([
  'DEPOSIT',
  'MONTHLY_COST',
  'COMMUTE',
  'STATION',
  'AREA',
  'OPTION',
])

const balanceGameQuestionSchema = z.object({
  questionId: z.number(),
  optionAText: z.string(),
  optionAFactor: comparisonFactorSchema,
  optionBText: z.string(),
  optionBFactor: comparisonFactorSchema,
  selectedSide: z.enum(['A', 'B']).nullable(),
})

const balanceGameQuestionsResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: z.object({
    totalQuestions: z.number(),
    answeredQuestions: z.number(),
    completed: z.boolean(),
    questions: z.array(balanceGameQuestionSchema),
  }),
})

export async function getBalanceGameQuestions() {
  const response = await apiClient.get('/house-comparisons/current/balance-game/questions')
  return balanceGameQuestionsResponseSchema.parse(response.data).data
}

const balanceGameProgressResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: z.object({
    totalQuestions: z.number(),
    answeredQuestions: z.number(),
    completed: z.boolean(),
  }),
})

export async function submitBalanceGameAnswer(questionId, selectedSide) {
  const response = await apiClient.put(
    `/house-comparisons/current/balance-game/answers/${questionId}`,
    { selectedSide },
  )
  return balanceGameProgressResponseSchema.parse(response.data).data
}

const balanceGameResultResponseSchema = z.object({
  success: z.literal(true),
  code: z.string(),
  message: z.string(),
  data: z.object({
    result: z.enum(['A', 'B', 'TIE']),
    houseAScore: z.number(),
    houseBScore: z.number(),
    selectedFactors: z.record(z.string(), z.number()),
    matchedFactors: z.record(z.string(), z.number()),
    excludedFactors: z.array(comparisonFactorSchema),
  }),
})

export async function getBalanceGameResult() {
  const response = await apiClient.get('/house-comparisons/current/balance-game/result')
  return balanceGameResultResponseSchema.parse(response.data).data
}
