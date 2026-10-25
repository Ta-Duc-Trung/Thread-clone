import { memo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { UserAvatar } from '@/components/common/UserAvatar'
import { postPath } from '@/lib/post'
import { cn } from '@/lib/utils'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { selectPostById } from '@/store/slices/postsSlice'
import { InteractionBar } from './InteractionBar'
import { MediaGallery, PostMeta, PostText } from './PostContent'
import { PostMenu } from './PostMenu'
import { QuotedPost } from './QuotedPost'

export const PostCard = memo(function PostCard({ postId, post: postProp, variant = 'feed', onComment, className }) {
  const stored = useSelector((state) => (postId != null ? selectPostById(state, postId) : null))
  const me = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const post = stored ?? postProp
  if (!post) return null

  const isMine = me && post.user?.id === me.id
  const clickable = variant === 'feed'
  const showMenu = variant === 'feed' || variant === 'detail'

  const open = (e) => {
    if (!clickable) return
    if (window.getSelection()?.toString()) return 
    if (e.target.closest('a, button, video, [role="menu"], [role="link"]')) return
    navigate(postPath(post))
  }

  if (variant === 'detail') {
    return (
      <article className={cn('px-4 pt-4 pb-1 sm:px-6', className)}>
        <div className="flex items-center gap-3">
          <UserAvatar user={post.user} showFollow isMe={isMine} />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <PostMeta post={post} linkTime={false} />
            <PostMenu post={post} />
          </div>
        </div>
        <PostText text={post.content} className="mt-3" />
        <MediaGallery urls={post.media_urls} />
        {post.is_quote && <QuotedPost post={post.original_post} />}
        <InteractionBar post={post} onComment={onComment} className="mt-1.5" />
      </article>
    )
  }

  return (
    <article
      onClick={open}
      className={cn('flex gap-3 border-b px-4 py-3 sm:px-6', clickable && 'cursor-pointer', className)}
    >
      <UserAvatar user={post.user} showFollow={variant === 'feed'} isMe={isMine} className="mt-1" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <PostMeta post={post} linkTime={variant === 'feed'} />
          {showMenu && <PostMenu post={post} />}
        </div>
        <PostText text={post.content} className="mt-0.5" />
        <MediaGallery urls={post.media_urls} />
        {post.is_quote && <QuotedPost post={post.original_post} interactive={variant === 'feed'} />}
        <InteractionBar
          post={post}
          readOnly={variant === 'snapshot' || variant === 'embed'}
          onComment={onComment}
          className="mt-1.5"
        />
      </div>
    </article>
  )
})