import { http } from '@/lib/http'

const body = (r) => r.data
const UNDO = { _method: 'DELETE' }

export const userService = {
  follow: (id) => http.post(`/api/users/${id}/follow`).then(body),
  unfollow: (id) => http.post(`/api/users/${id}/follow`, UNDO).then(body),

  mute: (id) => http.post(`/api/users/${id}/mute`).then(body),
  unmute: (id) => http.post(`/api/users/${id}/mute`, UNDO).then(body),

  restrict: (id) => http.post(`/api/users/${id}/restrict`).then(body),

  block: (id) => http.post(`/api/users/${id}/block`).then(body),
  unblock: (id) => http.post(`/api/users/${id}/block`, UNDO).then(body),

  search: (q, { page = 1, perPageUsers = 20, perPageTopics = 5 } = {}) =>
    http
      .get('/api/search', { params: { q, page, per_page_users: perPageUsers, per_page_topics: perPageTopics } })
      .then(body),

  suggestions: ({ page = 1, perPage = 20 } = {}) =>
    http.get('/api/users/suggestions', { params: { page, per_page: perPage } }).then(body),

  reposts: (id, { page = 1, perPage = 20 } = {}) =>
    http.get(`/api/users/${id}/reposts`, { params: { page, per_page: perPage } }).then(body),
}