import apiClient from './client'
import {
  dailyChallengeSchema,
  dailyLivingCostOverviewSchema,
  emergencyFundSchema,
  livingRentSchema,
  rirDiagnosisSchema,
} from './schemas/living'

export async function fetchDailyLivingCost() {
  const { data } = await apiClient.get('/living/daily-living-costs')
  return dailyLivingCostOverviewSchema.parse(data.data)
}

export async function fetchEmergencyFund() {
  const { data } = await apiClient.get('/living/emergency-funds')
  return emergencyFundSchema.parse(data.data)
}

export async function updateEmergencyFundTarget(targetAmount) {
  const { data } = await apiClient.put('/living/emergency-funds/target', { targetAmount })
  return emergencyFundSchema.parse(data.data)
}

export async function fetchDailyChallenge() {
  const { data } = await apiClient.get('/living/daily-challenges')
  return dailyChallengeSchema.parse(data.data)
}

// 월세 미입력(LIVING_009, 404)과 월 소득 미입력(PREPARATION_003, 422)은 에러가 아니라
// 화면에서 서로 다른 안내를 보여줘야 하는 정상 상태라서, 구분된 결과 객체로 반환한다.
export async function fetchRirDiagnosis() {
  try {
    const { data } = await apiClient.get('/living/rir')
    return { state: 'ready', diagnosis: rirDiagnosisSchema.parse(data.data) }
  } catch (error) {
    const code = error.response?.data?.code
    if (code === 'LIVING_009') return { state: 'rent_not_set' }
    if (code === 'PREPARATION_003') return { state: 'income_missing' }
    throw error
  }
}

export async function updateMonthlyRent(monthlyRent) {
  const { data } = await apiClient.put('/living/rent', { monthlyRent })
  return livingRentSchema.parse(data.data)
}
