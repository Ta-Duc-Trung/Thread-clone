import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation()
  return (
    <div className={cn('flex items-center gap-3 text-[13px] text-muted-foreground', className)}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={i18n.language === code}
          className={cn(
            'hover:text-foreground hover:underline',
            i18n.language === code && 'font-semibold text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}