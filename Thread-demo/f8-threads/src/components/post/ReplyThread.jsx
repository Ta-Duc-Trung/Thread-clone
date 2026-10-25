import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Spinner } from '@/components/ui/spinner'
import { postPath } from '@/lib/post'
import { cn } from '@/lib/utils'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { selectPostById } from '@/store/slices/postsSlice'
import { fetchReplies, selectReplies } from '@/store/slices/repliesSlice'
import { InteractionBar } from './InteractionBar'
import { MediaGallery, PostMeta, PostText } from './PostContent'
import { PostMenu } from './PostMenu'

const MAX_DEPTH = 2
const ROOT_AVATAR = 36
const CHILD_AVATAR = 28
const ROW_GAP = 12

export function ReplyThread({ postId, depth = 0 }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const post = useSelector((state) => selectPostById(state, postId))
  const me = useSelector(selectCurrentUser)
  const children = useSelector(selectReplies(postId))
  const [opened, setOpened] = useState(false)
  if (!post) return null

  const expanded = opened || (children?.status === 'succeeded' && children.ids.length > 0)

  const canNest = depth < MAX_DEPTH
  const childIds = expanded ? (children?.ids ?? []) : []
  const loading = expanded && children?.status === 'loading'
  const failed = expanded && children?.status === 'failed'
  const hasMore = expanded ? Boolean(children?.hasMore) : post.replies_count > 0
  const avatarSize = depth === 0 ? ROOT_AVATAR : CHILD_AVATAR

  const showReplies = () => {
      dispatch(fetchReplies({ postId, refresh: !opened }))
    setOpened(true)
  }

  const rows = childIds.map((id) => ({ key: id, node: <ReplyThread postId={id} depth={depth + 1} /> }))
  if (loading) {
    rows.push({
      key: 'loading',
      node: (
        <div className="flex h-7 items-center gap-2 text-sm text-muted-foreground" style={{ marginTop: ROW_GAP }}>
          <Spinner className="size-4" /> {t('replies.loading')}
        </div>
      ),
    })
  } else if (failed) {
    rows.push({
      key: 'error',
      node: (
        <button
          type="button"
          onClick={showReplies}
          className="h-7 text-sm text-destructive"
          style={{ marginTop: ROW_GAP }}
        >
          {t('replies.retry')}
        </button>
      ),
    })
  } else if (hasMore && post.replies_count > 0) {
    const label = childIds.length > 0 ? t('replies.showMore') : t('replies.show', { count: post.replies_count })
    rows.push({
      key: 'more',
      node: (
        <div style={{ paddingTop: ROW_GAP }}>
          {canNest ? (
            <button
              type="button"
              onClick={showReplies}
              className="h-7 text-[15px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </button>
          ) : (
            <Link to={postPath(post)} className="text-[15px] text-muted-foreground hover:text-foreground">
              {label}
            </Link>
          )}
        </div>
      ),
    })
  }

  const hasThread = rows.length > 0

  return (
    <div
      className={cn(depth === 0 && 'border-b px-4 py-3 sm:px-6')}
      style={depth > 0 ? { paddingTop: ROW_GAP } : undefined}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <UserAvatar user={post.user} size={avatarSize} showFollow={depth === 0} isMe={me?.id === post.user?.id} />
          {hasThread && <span className="mt-1.5 w-0.5 flex-1 rounded-full bg-line" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <PostMeta post={post} />
            <PostMenu post={post} />
          </div>
          <Link to={postPath(post)} className="block">
            <PostText text={post.content} className="mt-0.5" />
          </Link>
          <MediaGallery urls={post.media_urls} />
          <InteractionBar post={post} className="mt-0.5" />
        </div>
      </div>

      {hasThread && (
        <div style={{ marginLeft: avatarSize / 2 - 1 }}>
          {rows.map((row, i) => (
            <div key={row.key} className="relative pl-[18px]">
              {/* đường dọc chạy tiếp cho tới hàng cuối */}
              {i < rows.length - 1 && <span className="absolute top-0 bottom-0 left-0 w-0.5 bg-line" />}
              {/* khuỷu cong nối vào hàng */}
              <span
                className="absolute top-0 left-0 w-4 rounded-bl-[14px] border-b-2 border-l-2 border-line"
                style={{ height: ROW_GAP + CHILD_AVATAR / 2 + 1 }}
              />
              {row.node}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}