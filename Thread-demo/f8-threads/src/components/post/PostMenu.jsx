import {
  Bookmark,
  BookmarkCheck,
  CircleSlash,
  EyeOff,
  Flag,
  Link2,
  Ellipsis,
  Pencil,
  ShieldAlert,
  Trash2,
  VolumeX,
} from 'lucide-react'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { postUrl } from '@/lib/post'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { hidePost, moderateUser, toggleSave } from '@/store/slices/postsSlice'
import { modalOpened } from '@/store/slices/uiSlice'

export function PostMenu({ post }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const requireAuth = useRequireAuth()
  const me = useSelector(selectCurrentUser)
  const isMine = me && post.user?.id === me.id

  const open = (type) => requireAuth(() => dispatch(modalOpened({ type, postId: post.id })))
  const run = (fn) => () => requireAuth(fn)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t('post.more')}
        onClick={(e) => e.stopPropagation()}
        className="-my-1.5 -mr-2 grid size-8 place-items-center rounded-full text-foreground/70 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Ellipsis className="size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[250px]" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={run(() => dispatch(toggleSave(post.id)))}>
          {t(post.is_saved ? 'post.unsave' : 'post.save')}
          {post.is_saved ? <BookmarkCheck /> : <Bookmark />}
        </DropdownMenuItem>

        {!isMine && (
          <DropdownMenuItem onSelect={run(() => dispatch(hidePost(post.id)))}>
            {t('post.notInterested')}
            <EyeOff />
          </DropdownMenuItem>
        )}

        {isMine && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => open('edit')}>
              {t('post.edit')}
              <Pencil />
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => open('confirmDelete')}>
              {t('post.delete')}
              <Trash2 />
            </DropdownMenuItem>
          </>
        )}

        {!isMine && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={run(() => dispatch(moderateUser({ user: post.user, action: 'mute' })))}>
              {t('post.mute')}
              <VolumeX />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={run(() => dispatch(moderateUser({ user: post.user, action: 'restrict' })))}>
              {t('post.restrict')}
              <ShieldAlert />
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => open('confirmBlock')}>
              {t('post.block')}
              <CircleSlash />
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => open('report')}>
              {t('post.report')}
              <Flag />
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            copy(postUrl(post))
            toast(t('toast.linkCopied'))
          }}
        >
          {t('post.copyLink')}
          <Link2 />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}