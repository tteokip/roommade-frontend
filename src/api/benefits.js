import apiClient from './client'

function unwrap(response) {
  return response.data.data
}

export function getYouthPolicies(params) {
  return apiClient.get('/youth-policies', { params }).then(unwrap)
}

export function getYouthPolicyDetail(youthPolicyId) {
  return apiClient.get(`/youth-policies/${youthPolicyId}`).then(unwrap)
}

export function getFinancialProducts(type) {
  return apiClient.get(`/financial-products/${type}`).then(unwrap)
}

export function getFinancialProductDetail(type, productId) {
  return apiClient.get(`/financial-products/${type}/${productId}`).then(unwrap)
}
