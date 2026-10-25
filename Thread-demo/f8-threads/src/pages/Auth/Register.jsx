import { useCallback, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FormField } from '@/components/common/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAvailabilityCheck } from '@/hooks/useAvailabilityCheck'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import AuthLayout from '@/layouts/AuthLayout'
import { getApiError } from '@/lib/http'
import { emailSchema, registerSchema, usernameSchema } from '@/schemas/authSchemas'
import { authService } from '@/services/authService'

export default function Register() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.register.title'))
  const schema = useMemo(() => registerSchema(t), [t])
  const [serverError, setServerError] = useState(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    defaultValues: { username: '', email: '', password: '', password_confirmation: '' },
  })

  const username = watch('username')
  const email = watch('email')

  const isUsernameFormat = useCallback((v) => usernameSchema(t).safeParse(v).success, [t])
  const isEmailFormat = useCallback((v) => emailSchema(t).safeParse(v).success, [t])

  const usernameCheck = useAvailabilityCheck({
    value: username.trim(),
    isValidFormat: isUsernameFormat,
    request: authService.validateUsername,
  })
  const emailCheck = useAvailabilityCheck({
    value: email.trim(),
    isValidFormat: isEmailFormat,
    request: authService.validateEmail,
  })

  const fieldError = (field, check, takenKey) =>
    errors[field]?.message ?? (check.status === 'taken' ? check.message || t(takenKey) : undefined)

  const checking = usernameCheck.status === 'checking' || emailCheck.status === 'checking'
  const taken = usernameCheck.status === 'taken' || emailCheck.status === 'taken'

  const onSubmit = async (values) => {
    if (taken) return
    setServerError(null)
    setSuccess(false)
    try {
      await authService.register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      setSuccess(true)
      reset()
    } catch (error) {
      const { message, fieldErrors } = getApiError(error)
      const known = ['username', 'email', 'password', 'password_confirmation']
      let shown = false
      for (const [field, msg] of Object.entries(fieldErrors)) {
        if (known.includes(field)) {
          setError(field, { type: 'server', message: msg })
          shown = true
        }
      }
      if (!shown) setServerError(message)
    }
  }

  return (
    <AuthLayout
      title={t('auth.register.title')}
      footer={
        <>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-foreground hover:underline">
            {t('auth.login.submit')}
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Thông báo nằm giữa tiêu đề và ô Tên hiển thị */}
        {success && <Alert className="mb-3">{t('auth.register.success')}</Alert>}
        {serverError && (
          <Alert variant="error" className="mb-3">
            {serverError}
          </Alert>
        )}

        <FormField
          label={t('auth.fields.displayName')}
          autoComplete="username"
          registration={register('username')}
          error={fieldError('username', usernameCheck, 'auth.register.usernameTaken')}
          checking={usernameCheck.status === 'checking'}
          hint={usernameCheck.status === 'available' && !errors.username ? t('auth.register.usernameOk') : null}
        />
        <FormField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={fieldError('email', emailCheck, 'auth.register.emailTaken')}
          checking={emailCheck.status === 'checking'}
          hint={emailCheck.status === 'available' && !errors.email ? t('auth.register.emailOk') : null}
        />
        <FormField
          label={t('auth.fields.password')}
          type="password"
          autoComplete="new-password"
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

        <Button
          type="submit"
          disabled={isSubmitting || checking || taken}
          className="mt-2 h-14 w-full rounded-xl text-[15px]"
        >
          {isSubmitting ? <Spinner /> : t('auth.register.submit')}
        </Button>
      </form>
    </AuthLayout>
  )
}