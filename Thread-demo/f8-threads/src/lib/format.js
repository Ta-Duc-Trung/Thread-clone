import i18n from '@/i18n'

export function formatCount(n) {
  const num = Number(n) || 0
  if (num < 1000) return String(num)
  const [value, suffix] = num < 1_000_000 ? [num / 1000, 'K'] : [num / 1_000_000, 'M']
  const text = value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '')
  return (i18n.language === 'vi' ? text.replace('.', ',') : text) + suffix
}
export function timeAgo(iso) {
  const date = new Date(iso)
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000)
  const t = i18n.t.bind(i18n)
  if (seconds < 60) return t('time.now')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('time.m', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('time.h', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('time.d', { count: days })
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: sameYear ? 'short' : 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}

export function fullDate(iso) {
  return new Date(iso).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

export function initials(name = '') {
  return (
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '?'
  )
}

const AVATAR_COLORS = ['#e4572e', '#17bebb', '#76b041', '#e0a100', '#2e86ab', '#a23b72', '#f18f01', '#0f4c5c', '#9a031e', '#386641']
export const avatarColor = (id) => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length]