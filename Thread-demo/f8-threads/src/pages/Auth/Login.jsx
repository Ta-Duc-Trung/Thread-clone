import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { FormField } from '@/components/common/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import AuthLayout from '@/layouts/AuthLayout'
import { loginSchema } from '@/schemas/authSchemas'
import { login } from '@/store/slices/authSlice'

export default function Login() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.login.title'))
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const schema = useMemo(() => loginSchema(t), [t])
  const [serverError, setServerError] = useState(null)

  const flash = location.state?.verified
    ? t('auth.login.verified')
    : location.state?.resetSuccess
      ? t('auth.login.resetSuccess')
      : location.state?.sessionExpired
        ? t('auth.login.sessionExpired')
        : null

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { login: '', password: '' },
  })

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      await dispatch(login({ login: values.login.trim(), password: values.password })).unwrap()
      navigate(location.state?.from || '/', { replace: true })
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? {}
      let shown = false
      for (const field of ['login', 'password']) {
        const msg = fieldErrors[field] ?? (field === 'login' ? (fieldErrors.email ?? fieldErrors.username) : null)
        if (msg) {
          setError(field, { type: 'server', message: msg })
          shown = true
        }
      }
      if (!shown) setServerError(error?.message || t('errors.generic'))
    }
  }

  return (
    <AuthLayout
      title={t('auth.login.title')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-foreground hover:underline">
            {t('auth.register.submit')}
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Thông báo nằm giữa tiêu đề và ô nhập đầu tiên */}
        {flash && !serverError && (
          <Alert variant="success" className="mb-3">
            {flash}
          </Alert>
        )}
        {serverError && (
          <Alert variant="error" className="mb-3">
            {serverError}
          </Alert>
        )}

        <FormField
          label={t('auth.fields.login')}
          autoComplete="username"
          autoFocus
          registration={register('login')}
          error={errors.login?.message}
        />
        <FormField
          label={t('auth.fields.password')}
          type="password"
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />

        <div className="flex justify-end px-1 pt-1">
          <Link
            to="/forgot-password"
            className="text-[15px] text-muted-foreground hover:text-foreground hover:underline"
          >
            {t('auth.login.forgot')}
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2 h-14 w-full rounded-xl text-[15px]">
          {isSubmitting ? <Spinner /> : t('auth.login.submit')}
        </Button>
      </form>
    </AuthLayout>
  )
}