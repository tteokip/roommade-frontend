import axios from 'axios'

// 개발 서버는 vite proxy 가 /api → http://localhost:8080 (로컬 백엔드) 으로 넘긴다.
// 값이 없어도 기본값 '/api' 를 쓰므로 .env 가 없어도 동작한다.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

// 백엔드에 정식 인증(JWT 등)이 아직 없어, 모든 API가 X-User-Id 헤더로 사용자를 임시 식별한다.
// 인증이 도입되면 이 인터셉터를 인증 컨텍스트에서 토큰을 붙이는 방식으로 교체해야 한다.
apiClient.interceptors.request.use((config) => {
  config.headers['X-User-Id'] = import.meta.env.VITE_DEV_USER_ID || '1'
  return config
})

export default apiClient
