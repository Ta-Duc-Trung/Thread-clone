import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/store/slices/uiSlice'

export function useApplyTheme({ forceLight = false } = {}) {
  const theme = useSelector(selectTheme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = !forceLight && (theme === 'dark' || (theme === 'system' && media.matches))
      root.classList.toggle('dark', dark)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme, forceLight])
}