import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { FormField } from '@/components/common/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import AuthLayout from '@/layouts/AuthLayout'
import { getApiError } from '@/lib/http'
import { resetPasswordSchema } from '@/schemas/authSchemas'
import { authService } from '@/services/authService'

export default function ResetPassword() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.reset.title'))
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const schema = useMemo(() => resetPasswordSchema(t), [t])

 
  const [tokenStatus, setTokenStatus] = useState(token ? 'checking' : 'invalid')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [serverError, setServerError] = useState(null)
  const checked = useRef(false)

  useEffect(() => {
    if (!token || checked.current) return
    checked.current = true
    authService
      .validateResetToken(token)
      .then((body) => {
        const data = body?.data ?? body ?? {}
        if (data.valid === false) return setTokenStatus('invalid')
        if (data.email) setEmail(data.email)
        setTokenStatus('valid')
      })
      .catch(() => setTokenStatus('invalid'))
  }, [token])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    defaultValues: { password: '', password_confirmation: '' },
  })

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      await authService.resetPassword({ token, ...(email ? { email } : {}), ...values })
      navigate('/login', { replace: true, state: { resetSuccess: true } })
    } catch (error) {
      const { message, fieldErrors } = getApiError(error)
      let shown = false
      for (const field of ['password', 'password_confirmation']) {
        if (fieldErrors[field]) {
          setError(field, { type: 'server', message: fieldErrors[field] })
          shown = true
        }
      }
      if (fieldErrors.token) setTokenStatus('invalid')
      else if (!shown) setServerError(message)
    }
  }

  return (
    <AuthLayout title={t('auth.reset.title')}>
      {tokenStatus === 'checking' && (
        <div className="flex justify-center py-8 text-muted-foreground" role="status">
          <Spinner className="size-7" />
        </div>
      )}

      {tokenStatus === 'invalid' && (
        <div className="space-y-4">
          <Alert variant="error">{t('auth.invalidLink')}</Alert>
          <Button asChild variant="outline" className="h-14 w-full rounded-xl text-[15px]">
            <Link to="/forgot-password">{t('auth.reset.requestNew')}</Link>
          </Button>
        </div>
      )}

      {tokenStatus === 'valid' && (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {serverError && (
            <Alert variant="error" className="mb-3">
              {serverError}
            </Alert>
          )}
          <FormField
            label={t('auth.fields.newPassword')}
            type="password"
            autoComplete="new-password"
            autoFocus
            registration={register('password')}
            error={errors.password?.message}
          />
          <FormField
            label={t('auth.fields.passwordConfirmation')}
            type="password"
            autoComplete="new-password"
            registration={register('password_confirmation')}
            error={errors.password_confirmation?.message}
          />
          <Button type="submit" disabled={isSubmitting} className="mt-2 h-14 w-full rounded-xl text-[15px]">
            {isSubmitting ? <Spinner /> : t('auth.reset.submit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}