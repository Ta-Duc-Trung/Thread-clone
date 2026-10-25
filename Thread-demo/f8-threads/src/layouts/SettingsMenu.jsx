import { Check, Languages, LogIn, LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LANGUAGES } from '@/i18n'
import { logout, selectIsAuthenticated } from '@/store/slices/authSlice'
import { selectTheme, themeChanged } from '@/store/slices/uiSlice'

const THEMES = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

export function SettingsMenu({ trigger, align = 'start', side = 'top' }) {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector(selectTheme)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="min-w-[240px]">
        <DropdownMenuLabel>{t('settings.appearance')}</DropdownMenuLabel>
        {THEMES.map(({ value, icon: Icon }) => (
          <DropdownMenuItem key={value} onSelect={() => dispatch(themeChanged(value))}>
            <span className="flex items-center gap-3">
              <Icon />
              {t(`settings.theme.${value}`)}
            </span>
            {theme === value && <Check />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5">
          <Languages className="size-3.5" /> {t('settings.language')}
        </DropdownMenuLabel>
        {LANGUAGES.map(({ code, label }) => (
          <DropdownMenuItem key={code} onSelect={() => i18n.changeLanguage(code)}>
            {label}
            {i18n.language === code && <Check />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        {isAuthenticated ? (
          <DropdownMenuItem
            variant="destructive"
            onSelect={async () => {
              await dispatch(logout())
              navigate('/login')
            }}
          >
            {t('settings.logout')}
            <LogOut />
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => navigate('/login')}>
            {t('auth.login.submit')}
            <LogIn />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}