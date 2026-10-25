import { Heart, House, Menu, Plus, Search, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import { selectIsAuthenticated } from '@/store/slices/authSlice'
import { modalOpened } from '@/store/slices/uiSlice'
import { SettingsMenu } from './SettingsMenu'

export function useNavItems() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const requireLogin = (fn) => () =>
    isAuthenticated ? fn() : navigate('/login', { state: { from: location.pathname } })

  return [
    { key: 'home', label: t('nav.home'), icon: House, to: '/' },
    { key: 'search', label: t('nav.search'), icon: Search, to: '/search' },
    {
      key: 'create',
      label: t('nav.create'),
      icon: Plus,
      onClick: requireLogin(() => dispatch(modalOpened({ type: 'create' }))),
      boxed: true,
    },
    { key: 'activity', label: t('nav.activity'), icon: Heart, to: '/activity' },
    { key: 'profile', label: t('nav.profile'), icon: User, to: '/profile' },
  ]
}

export function Sidebar() {
  const { t } = useTranslation()
  const items = useNavItems()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center justify-between py-5 md:flex">
      <NavLink to="/" aria-label={t('nav.home')} className="transition-transform hover:scale-105">
        <Logo className="size-9" />
      </NavLink>

      <nav className="flex flex-col items-center gap-1.5" aria-label={t('nav.main')}>
        {items.map((item) => (
          <NavButton key={item.key} item={item} />
        ))}
      </nav>

      <SettingsMenu
        trigger={
          <button
            type="button"
            aria-label={t('nav.settings')}
            className="grid size-12 place-items-center rounded-xl text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
          >
            <Menu className="size-6" />
          </button>
        }
      />
    </aside>
  )
}

export function NavButton({ item, compact = false }) {
  const Icon = item.icon
  const base = cn(
    'grid place-items-center rounded-xl text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
    compact ? 'h-12 w-full max-w-16' : 'h-[54px] w-[60px]',
  )

  if (item.onClick) {
    return (
      <button type="button" aria-label={item.label} title={item.label} onClick={item.onClick} className={base}>
        <span className={cn(item.boxed && 'grid size-10 place-items-center rounded-lg bg-muted text-foreground/70')}>
          <Icon className="size-[26px]" strokeWidth={1.9} />
        </span>
      </button>
    )
  }

  return (
    <NavLink
      to={item.to}
      end
      aria-label={item.label}
      title={item.label}
      className={({ isActive }) => cn(base, isActive && 'text-foreground')}
    >
      {({ isActive }) => (
        <Icon className={cn('size-[26px]', isActive && 'fill-current')} strokeWidth={isActive ? 2.3 : 1.9} />
      )}
    </NavLink>
  )
}