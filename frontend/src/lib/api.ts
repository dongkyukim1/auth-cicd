import axios from 'axios'

function resolveBaseUrl(): string {
  const envUrl = (import.meta as any)?.env?.VITE_API_URL
  if (envUrl) return envUrl

  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location
    // 개발 서버는 vite 프록시 사용
    if (port === '5173') return '/api'
    // 로컬(nginx 포함)에서는 백엔드 4000으로 직접 호출
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/api'
    }
  }
  // 기타 환경은 상대경로 유지(클러스터/배포 환경)
  return '/api'
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' }
})

// 공개 엔드포인트 전용 인스턴스 (Authorization 헤더 비첨부)
export const publicApi = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' }
})

export function setAuth(token?: string) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}
