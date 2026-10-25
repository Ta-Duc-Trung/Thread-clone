import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import AuthLayout from '@/layouts/AuthLayout'
import { authService } from '@/services/authService'

export default function VerifyEmail() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.verify.title'))
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const [status, setStatus] = useState(token ? 'loading' : 'error')

  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    authService
      .verifyEmail(token)
      .then(() => navigate('/login', { replace: true, state: { verified: true } }))
      .catch(() => setStatus('error'))
  }, [token, navigate])

  return (
    <AuthLayout title={t('auth.verify.title')}>
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground" role="status">
          <Spinner className="size-7" />
          <p>{t('auth.verify.loading')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert variant="error">{t('auth.invalidLink')}</Alert>
          <Button asChild className="h-14 w-full rounded-xl text-[15px]">
            <Link to="/login">{t('auth.goToLogin')}</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}