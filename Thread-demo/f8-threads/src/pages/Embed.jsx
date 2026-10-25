import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { PostCard } from '@/components/post/PostCard'
import { PostSkeleton } from '@/components/post/PostSkeleton'
import { getApiError } from '@/lib/http'
import { normalizePost, pickData, postUrl } from '@/lib/post'
import { postService } from '@/services/postService'

export default function Embed() {
  const { t } = useTranslation()
  const { postId } = useParams()
  const [state, setState] = useState({ status: 'loading', post: null, error: null })

  useEffect(() => {
    let active = true
    postService
      .getPost(postId)
      .then((body) => active && setState({ status: 'succeeded', post: normalizePost(pickData(body)), error: null }))
      .catch((error) => active && setState({ status: 'failed', post: null, error: getApiError(error) }))
    return () => {
      active = false
    }
  }, [postId])

  return (
    <div className="mx-auto w-full max-w-[550px] p-2">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {state.status === 'loading' && <PostSkeleton lines={3} />}

        {state.status === 'failed' && (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            {state.error?.status === 404 ? t('post.notFound') : t('post.loadFailed')}
          </p>
        )}

        {state.post && (
          <>
            <PostCard post={state.post} variant="embed" className="border-b-0" />
            <a
              href={postUrl(state.post)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm font-semibold hover:bg-neutral-50 sm:px-6"
            >
              {t('embed.viewOnThreads')}
              <Logo className="size-5" />
            </a>
          </>
        )}
      </div>
    </div>
  )
}