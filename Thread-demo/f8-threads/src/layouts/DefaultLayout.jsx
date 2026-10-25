import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link, Outlet } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { ModalRoot } from '@/components/modals/ModalRoot'
import { LoginPanel } from '@/components/post/LoginPanel'
import { Button } from '@/components/ui/button'
import { selectAuthStatus } from '@/store/slices/authSlice'
import { NavButton, Sidebar, useNavItems } from './Sidebar'
import { SettingsMenu } from './SettingsMenu'

export default function DefaultLayout() {
  const { t } = useTranslation()
  const status = useSelector(selectAuthStatus)
  const isGuest = status === 'guest'
  const items = useNavItems()

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />

      {/* Thanh trên cùng trên điện thoại */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-background/90 px-3 backdrop-blur-md md:hidden">
        <span className="w-10" />
        <Link to="/" aria-label={t('nav.home')}>
          <Logo className="size-8" />
        </Link>
        <SettingsMenu
          side="bottom"
          align="end"
          trigger={
            <button
              type="button"
              aria-label={t('nav.settings')}
              className="grid size-10 place-items-center rounded-lg text-muted-foreground"
            >
              <Menu className="size-6" />
            </button>
          }
        />
      </header>

      <div className="flex justify-center gap-6 pb-24 md:pb-0 md:pl-[76px]">
        <main className="w-full max-w-[640px] min-w-0 md:px-3">
          <Outlet />
        </main>

        {/* LoginPanel bên phải khi chưa đăng nhập */}
        {isGuest && (
          <aside className="sticky top-0 hidden h-dvh w-[340px] shrink-0 flex-col justify-center lg:flex">
            <LoginPanel />
          </aside>
        )}
      </div>

      {/* Chưa đăng nhập, màn hình nhỏ: dải nhắc đăng nhập phía trên thanh điều hướng */}
      {isGuest && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex items-center justify-between gap-3 border-t bg-card px-4 py-3 md:bottom-0 lg:hidden">
          <p className="text-sm font-semibold">{t('loginPanel.title')}</p>
          <Button asChild size="sm" className="rounded-lg">
            <Link to="/login">{t('auth.login.submit')}</Link>
          </Button>
        </div>
      )}

      {/* Thanh điều hướng dưới đáy trên điện thoại */}
      <nav
        aria-label={t('nav.main')}
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        {items.map((item) => (
          <NavButton key={item.key} item={item} compact />
        ))}
      </nav>

      <ModalRoot />
    </div>
  )
}