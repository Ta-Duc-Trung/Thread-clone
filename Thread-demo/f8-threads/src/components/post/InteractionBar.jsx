import { Code, Heart, Image as ImageIcon, Link2, MessageCircle, Quote, Repeat2, Send } from 'lucide-react'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatCount } from '@/lib/format'
import { postUrl } from '@/lib/post'
import { cn } from '@/lib/utils'
import { toggleLike, toggleRepost } from '@/store/slices/postsSlice'
import { modalOpened } from '@/store/slices/uiSlice'

export function InteractionBar({ post, readOnly = false, onComment, className }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const requireAuth = useRequireAuth()

  const openModal = (type) => dispatch(modalOpened({ type, postId: post.id }))
  const comment = onComment ?? (() => requireAuth(() => openModal('reply')))

  if (readOnly) {
    return (
      <div className={cn('-ml-2 flex items-center text-[13px] text-foreground/80', className)}>
        <Count
          icon={<Heart className={cn('size-[19px]', post.is_liked && 'fill-like text-like')} />}
          value={post.likes_count}
        />
        <Count icon={<MessageCircle className="size-[19px] -scale-x-100" />} value={post.replies_count} />
        <Count icon={<Repeat2 className="size-[19px]" />} value={post.reposts_count} />
      </div>
    )
  }

  return (
    <div
      className={cn('-ml-2.5 flex items-center gap-0.5 text-[13px]', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Like: đổi màu và số ngay, gọi API sau, lỗi thì hoàn tác (xem toggleLike trong postsSlice) */}
      <ActionButton
        label={t(post.is_liked ? 'post.unlike' : 'post.like')}
        active={post.is_liked}
        activeClass="text-like"
        count={post.likes_count}
        onClick={() => requireAuth(() => dispatch(toggleLike(post.id)))}
        icon={
          <Heart
            key={String(post.is_liked)}
            className={cn('size-[19px]', post.is_liked && 'animate-[like-pop_.35s_ease-out] fill-like')}
          />
        }
      />

      <ActionButton
        label={t('post.comment')}
        count={post.replies_count}
        onClick={comment}
        icon={<MessageCircle className="size-[19px] -scale-x-100" />}
      />

      {/* Repost: menu gồm Repost / Quote */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <ActionButton
            label={t('post.repostMenu')}
            active={post.is_reposted}
            activeClass="text-repost"
            count={post.reposts_count}
            icon={<Repeat2 className="size-[19px]" />}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[240px]">
          <DropdownMenuItem
            onSelect={() => requireAuth(() => dispatch(toggleRepost(post.id)))}
            className={cn(post.is_reposted && 'text-destructive')}
          >
            {t(post.is_reposted ? 'post.undoRepost' : 'post.repost')}
            <Repeat2 />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => requireAuth(() => openModal('quote'))}>
            {t('post.quote')}
            <Quote />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share: Copy link / Copy as image / Get embed code */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <ActionButton label={t('post.share')} icon={<Send className="size-[18px]" />} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[240px]">
          <DropdownMenuItem
            onSelect={() => {
              copy(postUrl(post))
              toast(t('toast.linkCopied'))
            }}
          >
            {t('post.copyLink')}
            <Link2 />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openModal('copyImage')}>
            {t('post.copyAsImage')}
            <ImageIcon />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openModal('embed')}>
            {t('post.embedCode')}
            <Code />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function ActionButton({ icon, count, label, active, activeClass, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-9 items-center gap-1 rounded-full px-2.5 text-foreground/80 transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        active && activeClass,
        className,
      )}
      {...props}
    >
      {icon}
      {count > 0 && <span className="tabular-nums">{formatCount(count)}</span>}
    </button>
  )
}

function Count({ icon, value }) {
  return (
    <span className="flex h-9 items-center gap-1 px-2.5">
      {icon}
      {value > 0 && <span className="tabular-nums">{formatCount(value)}</span>}
    </span>
  )
}