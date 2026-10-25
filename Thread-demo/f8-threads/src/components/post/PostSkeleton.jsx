import { Skeleton } from '@/components/ui/skeleton'

export function PostSkeleton({ lines = 2 }) {
  return (
    <div className="flex gap-3 border-b px-4 py-4 sm:px-6" aria-hidden="true">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3.5 w-32" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={i === lines - 1 ? 'h-3.5 w-2/3' : 'h-3.5 w-full'} />
        ))}
        <div className="flex gap-5 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PostListSkeleton({ count = 4 }) {
  return (
    <div role="status" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <PostSkeleton key={i} lines={(i % 3) + 1} />
      ))}
    </div>
  )
}