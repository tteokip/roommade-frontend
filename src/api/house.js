import apiClient from './client'

export async function getCurrentComparison() {
  const { data } = await apiClient.get('/house-comparisons/current')
  return data.data
}
