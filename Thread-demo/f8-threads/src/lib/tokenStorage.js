const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
  }
}

export const tokenStorage = {
  getAccessToken: () => read(ACCESS_KEY),
  getRefreshToken: () => read(REFRESH_KEY),
  setTokens: ({ access_token, refresh_token }) => {
    if (access_token) write(ACCESS_KEY, access_token)
    if (refresh_token) write(REFRESH_KEY, refresh_token)
  },
  clear: () => {
    write(ACCESS_KEY, null)
    write(REFRESH_KEY, null)
  },
}

export function pickTokens(body) {
  const data = body?.data ?? body ?? {}
  const source = data.tokens ?? data
  return {
    access_token: source.access_token ?? source.accessToken ?? source.token ?? null,
    refresh_token: source.refresh_token ?? source.refreshToken ?? null,
  }
}