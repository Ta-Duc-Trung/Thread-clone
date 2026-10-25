import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { Toaster } from 'sonner'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { BASE_PATH } from '@/lib/appUrl'
import { setSessionExpiredHandler } from '@/lib/http'
import { fetchCurrentUser, selectAuthStatus, sessionExpired } from '@/store/slices/authSlice'
import { modalClosed, selectTheme } from '@/store/slices/uiSlice'

export default function RootLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useSelector(selectAuthStatus)
  const theme = useSelector(selectTheme)
  const isEmbed = location.pathname.endsWith('/embed')

  useApplyTheme({ forceLight: isEmbed })
  useEffect(() => {
    if (status === 'checking') dispatch(fetchCurrentUser())
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(() => {
      dispatch(sessionExpired())
      dispatch(modalClosed())
      if (!window.location.pathname.endsWith('/embed')) {
        navigate('/login', {
          replace: true,
          state: { sessionExpired: true, from: window.location.pathname.slice(BASE_PATH.length) || '/' },
        })
      }
    })
  }, [dispatch, navigate])

  useEffect(() => {
    dispatch(modalClosed())
  }, [location.pathname, dispatch])

  return (
    <>
      <Outlet />
      <ScrollRestoration />
      {!isEmbed && (
        <Toaster
          position="bottom-center"
          theme={theme}
          offset={88}
          mobileOffset={88}
          toastOptions={{ className: 'rounded-xl! font-semibold!' }}
        />
      )}
    </>
  )
}