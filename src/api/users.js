import apiClient from '@/api/client'

export async function signupUser(payload) {
  const response = await apiClient.post('/users/signup', payload)
  return response.data.data
}
