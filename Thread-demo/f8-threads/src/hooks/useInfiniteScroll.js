import { useEffect, useRef } from 'react'

export function useInfiniteScroll({ onLoadMore, hasMore, loading, rootMargin = '600px' }) {
  const sentinelRef = useRef(null)
  const callbackRef = useRef(onLoadMore)

  useEffect(() => {
    callbackRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore || loading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current?.()
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, rootMargin])

  return sentinelRef
}