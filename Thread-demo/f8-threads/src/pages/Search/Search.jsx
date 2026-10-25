import { useEffect, useState } from 'react'
import { Hash, Search as SearchIcon, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router'
import { UserRow } from '@/components/common/UserRow'
import { PostListSkeleton } from '@/components/post/PostSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getApiError } from '@/lib/http'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice'
import { userService } from '@/services/userService'

/** Lấy mảng từ nhiều dạng trả về: [..] | { data: [..] } */
const asList = (value) => (Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [])

export default function Search() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.search'))
  const me = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const debounced = useDebounce(query.trim(), 500)
  const [state, setState] = useState({ status: 'idle', users: [], topics: [], error: null })

  useEffect(() => {
    setParams(debounced ? { q: debounced } : {}, { replace: true })
    // chưa đăng nhập và chưa gõ đủ 2 ký tự: không có gì để tải
    if (debounced.length < 2 && !isAuthenticated) {
      setState({ status: 'idle', users: [], topics: [], error: null })
      return
    }
    // API yêu cầu ít nhất 2 ký tự: ít hơn thì hiện gợi ý theo dõi
    const controller = new AbortController()
    const request =
      debounced.length >= 2
        ? userService.search(debounced).then((body) => {
            const data = body?.data ?? {}
            return { users: asList(data.users ?? data), topics: asList(data.topics) }
          })
        : userService.suggestions().then((body) => ({ users: asList(body?.data ?? body), topics: [] }))

    setState((s) => ({ ...s, status: 'loading', error: null }))
    request
      .then((result) => !controller.signal.aborted && setState({ status: 'succeeded', ...result, error: null }))
      .catch(
        (error) =>
          !controller.signal.aborted &&
          setState({ status: 'failed', users: [], topics: [], error: getApiError(error) }),
      )
    return () => controller.abort()
  }, [debounced, setParams, isAuthenticated])

  const searching = debounced.length >= 2

  return (
    <div className="md:pt-3">
      <h1 className="flex h-12 items-center justify-center text-[15px] font-bold">{t('nav.search')}</h1>
      <section className="min-h-[calc(100dvh-7rem)] bg-card md:rounded-t-[28px] md:border md:border-b-0">
        <div className="px-4 pt-5 pb-3 sm:px-6">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="search-input" className="sr-only">
              {t('search.placeholder')}
            </label>
            <input
              id="search-input"
              type="search"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="h-12 w-full rounded-2xl border bg-background pr-11 pl-11 text-[15px] outline-none focus:border-ring [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('common.clear')}
                className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-muted-foreground/30 text-background"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <p className="px-4 pb-2 text-sm font-semibold text-muted-foreground sm:px-6">
          {searching ? t('search.results') : isAuthenticated ? t('search.suggestions') : null}
        </p>

        {state.status === 'idle' && <p className="px-6 py-12 text-center text-muted-foreground">{t('search.hint')}</p>}
        {state.status === 'loading' && <PostListSkeleton count={4} />}
        {state.status === 'failed' && (
          <p className="px-6 py-12 text-center text-muted-foreground">{state.error?.message}</p>
        )}
        {state.status === 'succeeded' && (
          <>
            {state.topics.map((topic) => (
              <div key={topic.id ?? topic.name} className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
                <span className="grid size-9 place-items-center rounded-full bg-muted">
                  <Hash className="size-4" />
                </span>
                <div>
                  <p className="font-semibold">{topic.name}</p>
                  {topic.posts_count != null && (
                    <p className="text-sm text-muted-foreground">
                      {t('search.topicPosts', { count: topic.posts_count })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {state.users.map((user) => (
              <UserRow key={user.id} user={user} isMe={me?.id === user.id} />
            ))}
            {state.users.length === 0 && state.topics.length === 0 && (
              <p className="px-6 py-12 text-center text-muted-foreground">
                {searching ? t('search.noResults', { query: debounced }) : t('search.noSuggestions')}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}