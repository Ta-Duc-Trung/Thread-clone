import { appOrigin } from './appUrl'

/**
 * Chuẩn hóa dữ liệu bài viết từ API.
 *
 * API trả về dạng:
 * {
 *   id, user_id, content, parent_id, original_post_id, is_quote, is_ghost,
 *   reply_permission, created_at, likes_count, replies_count, reposts_and_quotes_count,
 *   media_urls: string[], user: { id, name, username, avatar_url, verified, ... },
 *   original_post: { ...bài được quote } | null
 * }
 * Khi đã đăng nhập, server có thể trả thêm trạng thái của người dùng hiện tại
 * (is_liked / is_reposted / is_saved...). Tên trường có thể khác nhau nên đọc theo nhiều tên.
 */
const firstDefined = (...values) => values.find((v) => v !== undefined && v !== null)

export function normalizeUser(user) {
  if (!user) return null
  return {
    ...user,
    is_following: Boolean(firstDefined(user.is_following, user.is_followed_by_auth, user.followed, false)),
  }
}

export function normalizePost(raw) {
  if (!raw) return null
  return {
    ...raw,
    content: raw.content ?? '',
    media_urls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
    likes_count: Number(raw.likes_count ?? 0),
    replies_count: Number(raw.replies_count ?? 0),
    reposts_count: Number(firstDefined(raw.reposts_and_quotes_count, raw.reposts_count, 0)),
    is_liked: Boolean(firstDefined(raw.is_liked, raw.is_liked_by_auth, raw.liked, false)),
    is_reposted: Boolean(firstDefined(raw.is_reposted, raw.is_reposted_by_auth, raw.reposted, false)),
    is_saved: Boolean(firstDefined(raw.is_saved, raw.is_saved_by_auth, raw.saved, false)),
    user: normalizeUser(raw.user),
    original_post: raw.original_post ? normalizePost(raw.original_post) : null,
  }
}

/**
 * Đọc trạng thái mới từ response của like/repost/save.
 * Server có thể trả { data: { is_liked, likes_count } } hoặc chỉ { success, message }.
 */
export function pickToggleResult(body, flag, countKey) {
  const data = body?.data && typeof body.data === 'object' ? body.data : (body ?? {})
  const result = {}
  const flagValue = firstDefined(data[flag], data[`${flag}_by_auth`], data[flag.replace('is_', '')])
  if (typeof flagValue === 'boolean') result[flag] = flagValue
  if (countKey) {
    const count = firstDefined(data[countKey], countKey === 'reposts_count' ? data.reposts_and_quotes_count : undefined)
    if (typeof count === 'number') result[countKey] = count
  }
  return result
}

/** Đường dẫn trang chi tiết: /username/post/123 */
export const postPath = (post) => `/${post.user?.username ?? 'user'}/post/${post.id}`
export const postUrl = (post) => `${appOrigin()}${postPath(post)}`
export const embedUrl = (post) => `${appOrigin()}${postPath(post)}/embed`

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i
export const isVideo = (url) => VIDEO_EXT.test(url)

export function pickPage(body) {
  const list = Array.isArray(body?.data) ? body.data : Array.isArray(body?.data?.data) ? body.data.data : []
  const p = body?.pagination ?? body?.meta ?? body?.data?.pagination ?? {}
  const current = Number(p.current_page ?? 1)
  const last = Number(p.last_page ?? current)
  return { items: list.map(normalizePost), page: current, hasMore: current < last, total: p.total }
}

export const pickData = (body) => (body?.data && typeof body.data === 'object' ? body.data : body)