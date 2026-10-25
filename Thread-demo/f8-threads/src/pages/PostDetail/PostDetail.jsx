import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CornerLeftUp, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router'
import { UserAvatar } from '@/components/common/UserAvatar'
import { PostCard } from '@/components/post/PostCard'
import { PostListSkeleton, PostSkeleton } from '@/components/post/PostSkeleton'
import { ReplyThread } from '@/components/post/ReplyThread'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getApiError } from '@/lib/http'
import { normalizePost, pickData, postPath } from '@/lib/post'
import { postService } from '@/services/postService'
import { selectAuthStatus, selectCurrentUser } from '@/store/slices/authSlice'
import { postsReceived, selectPostById } from '@/store/slices/postsSlice'
import { fetchReplies, selectReplies } from '@/store/slices/repliesSlice'
import { modalOpened } from '@/store/slices/uiSlice'

export default function PostDetail() {
  const { t } = useTranslation()
  const { postId, username } = useParams()
  const id = Number(postId) || postId
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const requireAuth = useRequireAuth()
  const authStatus = useSelector(selectAuthStatus)
  const me = useSelector(selectCurrentUser)
  const post = useSelector((state) => selectPostById(state, id))
  const replies = useSelector(selectReplies(id))
  const [loadState, setLoadState] = useState({ status: 'idle', error: null })
  useDocumentTitle(post ? `${post.user?.username}: ${post.content.slice(0, 40)}` : t('post.thread'))

  const loadPost = useCallback(async () => {
    setLoadState({ status: 'loading', error: null })
    try {
      const body = await postService.getPost(id)
      dispatch(postsReceived([normalizePost(pickData(body))]))
      setLoadState({ status: 'succeeded', error: null })
    } catch (error) {
      setLoadState({ status: 'failed', error: getApiError(error) })
    }
  }, [dispatch, id])

  useEffect(() => {
    if (authStatus === 'checking') return
    loadPost()
    dispatch(fetchReplies({ postId: id, refresh: true }))
  }, [authStatus, id, loadPost, dispatch])

  useEffect(() => {
    if (post?.user?.username && username !== post.user.username) navigate(postPath(post), { replace: true })
  }, [post, username, navigate])

  const loadMore = useCallback(() => dispatch(fetchReplies({ postId: id })), [dispatch, id])
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: Boolean(replies?.hasMore) && replies?.status === 'succeeded',
    loading: replies?.status === 'loading',
  })

  const openReply = () => requireAuth(() => dispatch(modalOpened({ type: 'reply', postId: id })))

  return (
    <div className="md:pt-3">
      <div className="sticky top-14 z-20 flex h-12 items-center justify-center bg-background/90 backdrop-blur-md md:top-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          aria-label={t('common.back')}
          className="absolute left-1 grid size-9 place-items-center rounded-full border bg-card shadow-sm hover:bg-muted"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <h1 className="text-[15px] font-bold">{t('post.thread')}</h1>
      </div>

      <section className="min-h-[calc(100dvh-7rem)] bg-card md:mt-1 md:rounded-t-[28px] md:border md:border-b-0">
        {!post && loadState.status !== 'failed' ? (
          <PostSkeleton lines={4} />
        ) : !post ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-semibold">
              {loadState.error?.status === 404 ? t('post.notFound') : t('post.loadFailed')}
            </p>
            {loadState.error?.status !== 404 && (
              <p className="text-sm text-muted-foreground">{loadState.error?.message}</p>
            )}
            <div className="flex gap-2">
              {loadState.error?.status !== 404 && (
                <Button variant="outline" onClick={loadPost} className="rounded-xl">
                  <RotateCw className="size-4" /> {t('common.retry')}
                </Button>
              )}
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/">{t('nav.home')}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {post.parent_id && (
              <Link
                to={`/${post.user?.username}/post/${post.parent_id}`}
                className="flex items-center gap-2 border-b px-4 py-3 text-sm text-muted-foreground hover:text-foreground sm:px-6"
              >
                <CornerLeftUp className="size-4" /> {t('post.viewParent')}
              </Link>
            )}

            <PostCard postId={post.id} variant="detail" onComment={openReply} />

            {/* Ô "Trả lời ..." mở ReplyModal */}
            <div className="flex items-center gap-3 border-t px-4 py-3 sm:px-6">
              <UserAvatar user={me ?? { id: 0, username: '?' }} size={32} />
              <button
                type="button"
                onClick={openReply}
                className="h-10 flex-1 rounded-full bg-muted px-4 text-left text-[15px] text-muted-foreground"
              >
                {t('composer.replyPlaceholder', { username: post.user?.username })}
              </button>
            </div>

            <div className="border-t">
              {!replies || (replies.status === 'loading' && replies.ids.length === 0) ? (
                <PostListSkeleton count={3} />
              ) : replies.status === 'failed' && replies.ids.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-muted-foreground">
                  <p>{replies.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(fetchReplies({ postId: id, refresh: true }))}
                  >
                    {t('common.retry')}
                  </Button>
                </div>
              ) : replies.ids.length === 0 ? (
                <p className="px-6 py-12 text-center text-muted-foreground">{t('replies.empty')}</p>
              ) : (
                <>
                  {replies.ids.map((replyId) => (
                    <ReplyThread key={replyId} postId={replyId} />
                  ))}
                  <div ref={sentinelRef} className="h-px" />
                  {replies.status === 'loading' && (
                    <div className="flex justify-center py-6 text-muted-foreground">
                      <Spinner />
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}