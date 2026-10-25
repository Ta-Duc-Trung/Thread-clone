import axios from 'axios'
import i18n from '@/i18n'
import { pickTokens, tokenStorage } from './tokenStorage'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://threads.f8team.dev').replace(/\/$/, '')

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 20_000,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 20_000,
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const NO_REFRESH = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

let onSessionExpired = () => {}
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn
}

let refreshPromise = null

async function refreshTokens() {
  const refresh_token = tokenStorage.getRefreshToken()
  if (!refresh_token) throw new Error('NO_REFRESH_TOKEN')
  const res = await refreshClient.post('/api/auth/refresh', { refresh_token })
  const tokens = pickTokens(res.data)
  if (!tokens.access_token) throw new Error('NO_ACCESS_TOKEN')
  tokenStorage.setTokens({ access_token: tokens.access_token, refresh_token: tokens.refresh_token ?? refresh_token })
  return tokens.access_token
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = NO_REFRESH.some((path) => original?.url?.includes(path))

    if (status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(error)
    }

    if (!tokenStorage.getRefreshToken()) return Promise.reject(error)

    original._retried = true
    try {
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return http(original) 
    } catch (refreshError) {
      tokenStorage.clear()
      onSessionExpired()
      return Promise.reject(refreshError?.response ? refreshError : error)
    }
  },
)

export function getApiError(error, fallback) {
  if (!error?.response) {
    return {
      status: 0,
      message: i18n.t(error?.code === 'ECONNABORTED' ? 'errors.timeout' : 'errors.network'),
      fieldErrors: {},
    }
  }
  const { data, status } = error.response
  const fieldErrors = {}
  if (data?.errors && typeof data.errors === 'object') {
    for (const [field, messages] of Object.entries(data.errors)) {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages)
    }
  }
  let message = data?.message || data?.error
  if (!message || typeof message !== 'string') message = fallback ?? i18n.t('errors.generic')
  if (status >= 500) message = i18n.t('errors.server')
  if (status === 429) message = i18n.t('errors.tooMany')
  return { status, message, fieldErrors }
}