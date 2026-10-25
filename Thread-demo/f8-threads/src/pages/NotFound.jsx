import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFound() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Logo className="size-12" />
      <h1 className="text-xl font-bold">{t('notFound.title')}</h1>
      <p className="max-w-sm text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild className="rounded-xl">
        <Link to="/">{t('nav.home')}</Link>
      </Button>
    </div>
  )
}