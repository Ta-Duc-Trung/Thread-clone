import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FormField } from '@/components/common/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import AuthLayout from '@/layouts/AuthLayout'
import { getApiError } from '@/lib/http'
import { forgotPasswordSchema } from '@/schemas/authSchemas'
import { authService } from '@/services/authService'

export default function ForgotPassword() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.forgot.title'))
  const schema = useMemo(() => forgotPasswordSchema(t), [t])
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }) => {
    setServerError(null)
    setSent(false)
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch (error) {
      const { message, fieldErrors } = getApiError(error)
      if (fieldErrors.email) setError('email', { type: 'server', message: fieldErrors.email })
      else setServerError(message)
    }
  }

  return (
    <AuthLayout
      title={t('auth.forgot.title')}
      description={t('auth.forgot.description')}
      footer={
        <Link to="/login" className="font-semibold text-foreground hover:underline">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {sent && <Alert className="mb-3">{t('auth.forgot.sent')}</Alert>}
        {serverError && (
          <Alert variant="error" className="mb-3">
            {serverError}
          </Alert>
        )}
        <FormField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          autoFocus
          registration={register('email')}
          error={errors.email?.message}
        />
        <Button type="submit" disabled={isSubmitting} className="mt-2 h-14 w-full rounded-xl text-[15px]">
          {isSubmitting ? <Spinner /> : t('auth.forgot.submit')}
        </Button>
      </form>
    </AuthLayout>
  )
}