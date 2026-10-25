import { appOrigin } from '@/lib/appUrl'
import { http } from '@/lib/http'

const withOrigin = () => ({ headers: { 'x-origin': appOrigin() } })

export const authService = {
  register: (payload) => http.post('/api/auth/register', payload, withOrigin()).then((r) => r.data),

  login: ({ login, password }) => http.post('/api/auth/login', { login, password }).then((r) => r.data),

  getUser: () => http.get('/api/auth/user').then((r) => r.data),

  logout: () => http.post('/api/auth/logout').then((r) => r.data),

  validateUsername: (username, config) =>
    http.post('/api/auth/validate/username', { username }, config).then((r) => r.data),

  validateEmail: (email, config) => http.post('/api/auth/validate/email', { email }, config).then((r) => r.data),

  verifyEmail: (token) => http.post('/api/auth/verify-email', { token }).then((r) => r.data),

  resendVerificationEmail: () =>
    http.post('/api/auth/resend-verification-email', null, withOrigin()).then((r) => r.data),

  forgotPassword: (email) => http.post('/api/auth/forgot-password', { email }, withOrigin()).then((r) => r.data),

  validateResetToken: (token) =>
    http.get('/api/auth/reset-password/validate', { params: { token } }).then((r) => r.data),

  resetPassword: (payload) => http.post('/api/auth/reset-password', payload).then((r) => r.data),
}