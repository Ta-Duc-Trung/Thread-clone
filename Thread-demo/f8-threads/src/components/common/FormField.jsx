import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function FormField({ label, error, hint, checking, type = 'text', registration, className, ...props }) {
  const id = useId()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn((isPassword || checking) && 'pr-12')}
          {...registration}
          {...props}
        />
        <div className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
          {checking ? (
            <Spinner className="size-4" />
          ) : isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              className="grid size-8 place-items-center rounded-full hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          ) : null}
        </div>
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn('px-1 text-[13px]', error ? 'text-destructive' : 'text-repost')}>
          {error || hint}
        </p>
      )}
    </div>
  )
}