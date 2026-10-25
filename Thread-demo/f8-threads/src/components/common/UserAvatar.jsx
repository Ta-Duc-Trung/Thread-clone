import { Check, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { avatarColor, initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toggleFollow } from '@/store/slices/postsSlice'

export function UserAvatar({ user, size = 36, showFollow = false, isMe = false, className }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const requireAuth = useRequireAuth()
  if (!user) return null
  const name = user.name || user.username

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <Avatar className="size-full">
        {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
        <AvatarFallback
          className="font-semibold text-white"
          style={{ backgroundColor: avatarColor(user.id), fontSize: Math.round(size * 0.38) }}
        >
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      {showFollow && !isMe && (
        <button
          type="button"
          aria-label={t(user.is_following ? 'post.unfollowUser' : 'post.followUser', { username: user.username })}
          onClick={(e) => {
            e.stopPropagation()
            requireAuth(() => dispatch(toggleFollow(user)))
          }}
          className={cn(
            'absolute -right-1 -bottom-1 grid size-[18px] place-items-center rounded-full ring-2 ring-card transition-transform hover:scale-110',
            user.is_following ? 'bg-card text-foreground' : 'bg-foreground text-background',
          )}
        >
          {user.is_following ? (
            <Check className="size-2.5" strokeWidth={3.5} />
          ) : (
            <Plus className="size-2.5" strokeWidth={3.5} />
          )}
        </button>
      )}
    </div>
  )
}