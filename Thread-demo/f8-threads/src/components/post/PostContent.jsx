import { Fragment, useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { fullDate, timeAgo } from '@/lib/format'
import { isVideo, postPath } from '@/lib/post'
import { cn } from '@/lib/utils'

export function PostMeta({ post, linkTime = true, className }) {
  const { t } = useTranslation()
  const time = (
    <time dateTime={post.created_at} title={fullDate(post.created_at)} className="shrink-0 text-muted-foreground">
      {timeAgo(post.created_at)}
    </time>
  )
  return (
    <div className={cn('flex min-w-0 items-center gap-1.5 text-[15px]', className)}>
      <span className="truncate font-semibold">{post.user?.username}</span>
      {post.user?.verified && (
        <BadgeCheck aria-label={t('post.verified')} className="size-4 shrink-0 fill-sky-500 text-card" />
      )}
      {post.is_ghost && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {t('feed.ghostBadge')}
        </span>
      )}
      {linkTime ? (
        <Link to={postPath(post)} onClick={(e) => e.stopPropagation()} className="hover:underline">
          {time}
        </Link>
      ) : (
        time
      )}
    </div>
  )
}

const TOKEN = /(https?:\/\/[^\s]+|@[\w.]+|#[\p{L}\p{N}_]+)/gu

export function PostText({ text, className }) {
  if (!text) return null
  const parts = text.split(TOKEN)
  return (
    <p className={cn('text-[15px] leading-[1.45] break-words whitespace-pre-wrap', className)}>
      {parts.map((part, i) => {
        if (!part) return null
        if (/^https?:\/\//.test(part))
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()}
              className="text-sky-600 hover:underline dark:text-sky-400"
            >
              {part.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}
              {part.length > 48 ? '…' : ''}
            </a>
          )
        if (part.startsWith('@') || part.startsWith('#'))
          return (
            <span key={i} className="text-sky-600 dark:text-sky-400">
              {part}
            </span>
          )
        return <Fragment key={i}>{part}</Fragment>
      })}
    </p>
  )
}

export function MediaGallery({ urls, className }) {
  if (!urls?.length) return null
  const single = urls.length === 1
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn('mt-2.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]', className)}
    >
      {urls.map((url) => (
        <MediaItem key={url} url={url} single={single} />
      ))}
    </div>
  )
}

function MediaItem({ url, single }) {
  const [failed, setFailed] = useState(false)
  const size = single ? 'max-h-[430px] max-w-full' : 'h-[260px] w-auto max-w-[80%]'
  if (failed) return <div className="aspect-[3/4] h-[260px] shrink-0 rounded-lg border bg-muted" />
  if (isVideo(url))
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className={cn('shrink-0 rounded-lg border bg-black', size)}
      />
    )
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('rounded-lg border object-cover', size)}
      />
    </a>
  )
}