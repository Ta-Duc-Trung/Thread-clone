import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserRow } from '@/components/common/UserRow'
import { PostListSkeleton } from '@/components/post/PostSkeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getApiError } from '@/lib/http'
import { userService } from '@/services/userService'

export default function Activity() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.activity'))
  const [state, setState] = useState({ status: 'loading', users: [], error: null })

  useEffect(() => {
    let active = true
    userService
      .suggestions({ perPage: 20 })
      .then((body) => {
        const list = Array.isArray(body?.data) ? body.data : (body?.data?.data ?? [])
        if (active) setState({ status: 'succeeded', users: list, error: null })
      })
      .catch((error) => active && setState({ status: 'failed', users: [], error: getApiError(error) }))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="md:pt-3">
      <h1 className="flex h-12 items-center justify-center text-[15px] font-bold">{t('nav.activity')}</h1>
      <section className="min-h-[calc(100dvh-7rem)] bg-card md:rounded-t-[28px] md:border md:border-b-0">
        <p className="px-4 pt-5 pb-2 text-sm font-semibold text-muted-foreground sm:px-6">{t('activity.suggested')}</p>
        {state.status === 'loading' && <PostListSkeleton count={4} />}
        {state.status === 'failed' && (
          <p className="px-6 py-12 text-center text-muted-foreground">{state.error?.message}</p>
        )}
        {state.status === 'succeeded' &&
          (state.users.length ? (
            state.users.map((user) => <UserRow key={user.id} user={user} />)
          ) : (
            <p className="px-6 py-12 text-center text-muted-foreground">{t('activity.empty')}</p>
          ))}
      </section>
    </div>
  )
}