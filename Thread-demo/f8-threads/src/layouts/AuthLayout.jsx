import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { Logo } from '@/components/common/Logo'

export default function AuthLayout({ title, description, children, footer }) {
  const { t } = useTranslation()
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-background px-4">
      {/* dải vân trang trí phía trên, giống trang đăng nhập Threads */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60 [background:repeating-radial-gradient(circle_at_50%_-40%,transparent_0_18px,var(--border)_19px_20px)] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <Link to="/" aria-label={t('nav.home')} className="relative mt-10 mb-8">
        <Logo className="size-11" />
      </Link>

      <main className="relative w-full max-w-[400px] flex-1">
        <h1 className="text-center text-base font-bold">{title}</h1>
        {description && <p className="mt-2 text-center text-[15px] text-muted-foreground">{description}</p>}
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 text-center text-[15px] text-muted-foreground">{footer}</div>}
      </main>

      <footer className="relative py-6">
        <LanguageSwitcher />
      </footer>
    </div>
  )
}