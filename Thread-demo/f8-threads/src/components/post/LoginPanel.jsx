import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'

export function LoginPanel() {
  const { t } = useTranslation()
  return (
    <Link
      to="/login"
      className="block rounded-[28px] border bg-card px-6 py-8 text-center transition-colors hover:bg-muted/40"
    >
      <Logo className="mx-auto size-9" />
      <h2 className="mt-4 text-xl font-bold text-balance">{t('loginPanel.title')}</h2>
      <p className="mt-2 text-[15px] text-muted-foreground">{t('loginPanel.description')}</p>
      <Button asChild className="mt-6 h-12 w-full rounded-xl">
        <span>{t('auth.login.submit')}</span>
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        {t('auth.login.noAccount')} <span className="font-semibold text-foreground">{t('auth.register.submit')}</span>
      </p>
    </Link>
  )
}