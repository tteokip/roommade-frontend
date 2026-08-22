import axios from 'axios'

// 개발 서버는 vite proxy 가 /api → http://localhost:8080 (로컬 백엔드) 으로 넘긴다.
// 값이 없어도 기본값 '/api' 를 쓰므로 .env 가 없어도 동작한다.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

export default apiClient
