import { useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getApiError } from '@/lib/http'
import { normalizeUser } from '@/lib/post'
import { userService } from '@/services/userService'
import { UserAvatar } from './UserAvatar'

export function UserRow({ user: raw, isMe = false }) {
  const { t } = useTranslation()
  const requireAuth = useRequireAuth()
  const [user, setUser] = useState(() => normalizeUser(raw))
  const [busy, setBusy] = useState(false)

  const toggle = () =>
    requireAuth(async () => {
      const next = !user.is_following
      setUser((u) => ({ ...u, is_following: next }))
      setBusy(true)
      try {
        await (next ? userService.follow(user.id) : userService.unfollow(user.id))
      } catch (error) {
        setUser((u) => ({ ...u, is_following: !next }))
        toast.error(t('toast.followFailed'), { description: getApiError(error).message })
      } finally {
        setBusy(false)
      }
    })

  const followers = user.followers_count ?? user.follower_count

  return (
    <div className="flex items-start gap-3 border-b px-4 py-3 sm:px-6">
      <UserAvatar user={user} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate font-semibold">{user.username}</span>
          {user.verified && <BadgeCheck className="size-4 shrink-0 fill-sky-500 text-card" />}
        </div>
        {user.name && user.name !== user.username && (
          <p className="truncate text-[15px] text-muted-foreground">{user.name}</p>
        )}
        {user.bio && <p className="mt-1 line-clamp-2 text-[15px]">{user.bio}</p>}
        {followers != null && (
          <p className="mt-1 text-sm text-muted-foreground">{t('search.followers', { count: followers })}</p>
        )}
      </div>
      {!isMe && (
        <Button
          variant={user.is_following ? 'outline' : 'default'}
          size="sm"
          disabled={busy}
          onClick={toggle}
          className="min-w-[96px] rounded-lg"
        >
          {t(user.is_following ? 'search.following' : 'search.follow')}
        </Button>
      )}
    </div>
  )
}