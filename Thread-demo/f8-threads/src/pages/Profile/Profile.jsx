import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { UserAvatar } from '@/components/common/UserAvatar'
import { PostCard } from '@/components/post/PostCard'
import { PostListSkeleton } from '@/components/post/PostSkeleton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { getApiError } from '@/lib/http'
import { normalizePost, pickPage } from '@/lib/post'
import { userService } from '@/services/userService'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { postsReceived } from '@/store/slices/postsSlice'
import { modalOpened } from '@/store/slices/uiSlice'

export default function Profile() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const me = useSelector(selectCurrentUser)
  useDocumentTitle(me?.username)
  const [list, setList] = useState({ ids: [], page: 0, hasMore: true, status: 'idle', error: null })

  const load = useCallback(
    async (page) => {
      if (!me) return
      setList((l) => ({ ...l, status: 'loading', error: null }))
      try {
        const body = await userService.reposts(me.id, { page })
        const { items, hasMore } = pickPage(body)
     
        const posts = items.map((item) => (item.post ? normalizePost(item.post) : item)).filter((p) => p?.id)
        dispatch(postsReceived(posts))
        setList((l) => ({
          ids:
            page === 1
              ? posts.map((p) => p.id)
              : [...l.ids, ...posts.map((p) => p.id).filter((id) => !l.ids.includes(id))],
          page,
          hasMore: hasMore && posts.length > 0,
          status: 'succeeded',
          error: null,
        }))
      } catch (error) {
        setList((l) => ({ ...l, status: 'failed', error: getApiError(error).message }))
      }
    },
    [me, dispatch],
  )

  useEffect(() => {
    load(1)
  }, [load])

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => load(list.page + 1),
    hasMore: list.hasMore && list.status === 'succeeded',
    loading: list.status === 'loading',
  })

  if (!me) return null

  return (
    <div className="md:pt-3">
      <h1 className="flex h-12 items-center justify-center text-[15px] font-bold">{t('nav.profile')}</h1>
      <section className="min-h-[calc(100dvh-7rem)] bg-card md:rounded-t-[28px] md:border md:border-b-0">
        <div className="flex items-start justify-between gap-4 px-5 pt-6 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold">{me.name || me.username}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-[15px]">
              {me.username}
              {me.verified && <BadgeCheck className="size-4 fill-sky-500 text-card" />}
              {me.is_private && <Lock className="size-3.5 text-muted-foreground" aria-label={t('profile.private')} />}
            </p>
            {me.bio && <p className="mt-3 text-[15px] whitespace-pre-wrap">{me.bio}</p>}
            {me.email && <p className="mt-3 text-sm text-muted-foreground">{me.email}</p>}
          </div>
          <UserAvatar user={me} size={80} />
        </div>

        <div className="px-5 pt-5 pb-4 sm:px-6">
          <Button
            variant="outline"
            onClick={() => dispatch(modalOpened({ type: 'create' }))}
            className="w-full rounded-xl"
          >
            {t('nav.create')}
          </Button>
        </div>

        <div className="border-b px-5 pb-3 text-center text-[15px] font-semibold sm:px-6">{t('profile.reposts')}</div>

        {list.status === 'loading' && list.ids.length === 0 ? (
          <PostListSkeleton count={3} />
        ) : list.status === 'failed' && list.ids.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">{list.error}</p>
        ) : list.ids.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">{t('profile.noReposts')}</p>
        ) : (
          <>
            {list.ids.map((id) => (
              <PostCard key={id} postId={id} />
            ))}
            <div ref={sentinelRef} className="h-px" />
            {list.status === 'loading' && (
              <div className="flex justify-center py-6 text-muted-foreground">
                <Spinner />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}