import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import { selectAuthStatus } from '@/store/slices/authSlice'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center text-muted-foreground" role="status">
      <Spinner className="size-7" />
    </div>
  )
}

export function RequireAuth() {
  const status = useSelector(selectAuthStatus)
  const location = useLocation()
  if (status === 'checking') return <FullScreenSpinner />
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function GuestOnly() {
  const status = useSelector(selectAuthStatus)
  if (status === 'checking') return <FullScreenSpinner />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}