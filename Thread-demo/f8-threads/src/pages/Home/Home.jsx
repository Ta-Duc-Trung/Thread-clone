import { useCallback, useEffect } from 'react'
import { RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router'
import { UserAvatar } from '@/components/common/UserAvatar'
import { PostCard } from '@/components/post/PostCard'
import { PostListSkeleton } from '@/components/post/PostSkeleton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { selectAuthStatus, selectCurrentUser } from '@/store/slices/authSlice'
import { FEED_TYPES, fetchFeed, selectFeedTab, selectHiddenAuthorIds } from '@/store/slices/feedSlice'
import { modalOpened } from '@/store/slices/uiSlice'
import { FeedTabs } from './FeedTabs'

export default function Home() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = useSelector(selectAuthStatus)
  const me = useSelector(selectCurrentUser)
  const isAuthenticated = status === 'authenticated'

  const requested = params.get('feed')
  const type = isAuthenticated && FEED_TYPES.includes(requested) ? requested : 'for_you'
  const tab = useSelector(selectFeedTab(type))
  const hiddenAuthors = useSelector(selectHiddenAuthorIds)
  const posts = useSelector((state) => state.posts.entities)
  useDocumentTitle(t('nav.home'))

   useEffect(() => {
    if (status !== 'checking' && tab.status === 'idle') dispatch(fetchFeed({ type }))
  }, [dispatch, type, tab.status, status])

  const loadMore = useCallback(() => dispatch(fetchFeed({ type })), [dispatch, type])
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: tab.hasMore && tab.status === 'succeeded',
    loading: tab.status === 'loading',
  })

  const changeTab = (value) => {
    if (value !== 'for_you' && !isAuthenticated) return navigate('/login', { state: { from: `/?feed=${value}` } })
    if (value === type) {
     
      window.scrollTo({ top: 0, behavior: 'smooth' })
      dispatch(fetchFeed({ type, refresh: true }))
      return
    }
    setParams(value === 'for_you' ? {} : { feed: value })
    window.scrollTo({ top: 0 })
  }

  const visibleIds = tab.ids.filter((id) => posts[id] && !hiddenAuthors.includes(posts[id].user?.id))
  const firstLoad = tab.status === 'idle' || (tab.status === 'loading' && tab.ids.length === 0)

  return (
    <div className="md:pt-3">
      <div className="sticky top-14 z-20 bg-background/90 backdrop-blur-md md:top-0">
        <h1 className="sr-only">{t('nav.home')}</h1>
        <FeedTabs value={type} onChange={changeTab} />
      </div>

      <section className="min-h-[calc(100dvh-7rem)] border-x-0 bg-card md:mt-1 md:rounded-t-[28px] md:border md:border-b-0">
        {isAuthenticated && (
          <div className="flex items-center gap-3 border-b px-4 py-4 sm:px-6">
            <UserAvatar user={me} />
            <button
              type="button"
              onClick={() => dispatch(modalOpened({ type: 'create' }))}
              className="flex-1 py-2 text-left text-[15px] text-muted-foreground"
            >
              {t('composer.whatsNew')}
            </button>
            <Button variant="outline" onClick={() => dispatch(modalOpened({ type: 'create' }))} className="rounded-xl">
              {t('composer.post')}
            </Button>
          </div>
        )}

        {type === 'ghost' && <p className="border-b px-6 py-3 text-sm text-muted-foreground">{t('feed.ghostHint')}</p>}

        {firstLoad ? (
          <PostListSkeleton count={5} />
        ) : tab.status === 'failed' && tab.ids.length === 0 ? (
          <ErrorState message={tab.error} onRetry={() => dispatch(fetchFeed({ type, refresh: true }))} />
        ) : visibleIds.length === 0 ? (
          <p className="px-6 py-16 text-center text-muted-foreground">{t(`feed.empty.${type}`)}</p>
        ) : (
          <>
            {visibleIds.map((id) => (
              <PostCard key={id} postId={id} />
            ))}

            {/* Phần tử canh đáy cho useInfiniteScroll */}
            <div ref={sentinelRef} className="h-px" />

            {tab.status === 'loading' && (
              <div className="flex justify-center py-6 text-muted-foreground">
                <Spinner className="size-6" />
              </div>
            )}
            {tab.status === 'failed' && (
              <div className="flex justify-center py-6">
                <Button variant="outline" size="sm" onClick={loadMore} className="rounded-lg">
                  <RotateCw className="size-4" /> {t('common.retry')}
                </Button>
              </div>
            )}
            {!tab.hasMore && tab.status === 'succeeded' && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('feed.end')}</p>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="font-semibold">{t('feed.loadFailed')}</p>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <Button variant="outline" onClick={onRetry} className="rounded-xl">
        <RotateCw className="size-4" /> {t('common.retry')}
      </Button>
    </div>
  )
}