import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { UserAvatar } from '@/components/common/UserAvatar'
import { postPath } from '@/lib/post'
import { cn } from '@/lib/utils'
import { selectPostById } from '@/store/slices/postsSlice'
import { MediaGallery, PostMeta, PostText } from './PostContent'

export function QuotedPost({ post: nested, interactive = true, className }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const stored = useSelector((state) => (nested?.id ? selectPostById(state, nested.id) : null))
  const post = stored ?? nested

  if (!post) {
    return (
      <div className={cn('mt-2.5 rounded-xl border px-4 py-3 text-sm text-muted-foreground', className)}>
        {t('post.quotedUnavailable')}
      </div>
    )
  }

  return (
    <div
      role={interactive ? 'link' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={(e) => {
        if (!interactive) return
        e.stopPropagation()
        navigate(postPath(post))
      }}
      onKeyDown={(e) => {
        if (interactive && e.key === 'Enter') navigate(postPath(post))
      }}
      className={cn('mt-2.5 rounded-xl border px-4 py-3', interactive && 'cursor-pointer hover:bg-muted/40', className)}
    >
      <div className="flex items-center gap-2">
        <UserAvatar user={post.user} size={22} />
        <PostMeta post={post} linkTime={false} />
      </div>
      <PostText text={post.content} className="mt-1.5" />
      <MediaGallery urls={post.media_urls} />
    </div>
  )
}