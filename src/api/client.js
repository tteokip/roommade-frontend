import axios from 'axios'

// 개발 서버는 vite proxy 가 /api → http://localhost:8080 (로컬 백엔드) 으로 넘긴다.
// 값이 없어도 기본값 '/api' 를 쓰므로 .env 가 없어도 동작한다.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

// TODO: 인증이 아직 없어 백엔드가 X-User-Id 헤더로 사용자를 식별한다(house/living 도메인 공통).
// 940009 는 로컬 DB의 seed 데모 계정(demo@roommade.com)이다 — 생활비·비상금·월세·소득이
// 전부 채워져 있어 화면 확인에 적합하다. 실제 인증이 붙으면 이 인터셉터를 로그인 토큰
// 기반으로 교체한다.
apiClient.interceptors.request.use((config) => {
  config.headers['X-User-Id'] = 940009
  return config
})

export default apiClient
