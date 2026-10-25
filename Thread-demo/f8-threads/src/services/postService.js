import { http } from '@/lib/http'

function buildBody({ media = [], ...fields }) {
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null && v !== ''))
  if (media.length === 0) return clean
  const form = new FormData()
  Object.entries(clean).forEach(([key, value]) => form.append(key, value))
  media.forEach((file) => form.append('media[]', file))
  return form
}

const body = (r) => r.data

export const postService = {
  getFeed: ({ type = 'for_you', page = 1, perPage = 10 } = {}) =>
    http.get('/api/posts/feed', { params: { type, page, per_page: perPage } }).then(body),

  getPost: (id) => http.get(`/api/posts/${id}`).then(body),

  getReplies: (id, { page = 1, perPage = 20 } = {}) =>
    http.get(`/api/posts/${id}/replies`, { params: { page, per_page: perPage } }).then(body),

  createPost: (fields) => http.post('/api/posts', buildBody(fields)).then(body),

  updatePost: (id, fields) => http.post(`/api/posts/${id}`, buildBody({ ...fields, _method: 'PUT' })).then(body),

  deletePost: (id) => http.post(`/api/posts/${id}`, { _method: 'DELETE' }).then(body),

  reply: (id, fields) => http.post(`/api/posts/${id}/reply`, buildBody(fields)).then(body),

  quote: (id, fields) => http.post(`/api/posts/${id}/quote`, buildBody(fields)).then(body),

  toggleLike: (id) => http.post(`/api/posts/${id}/like`).then(body),

  toggleRepost: (id) => http.post(`/api/posts/${id}/repost`).then(body),

  toggleSave: (id) => http.post(`/api/posts/${id}/save`).then(body),

  hide: (id) => http.post(`/api/posts/${id}/hide`).then(body),

  report: (id, { reason, description }) => http.post(`/api/posts/${id}/report`, { reason, description }).then(body),
}