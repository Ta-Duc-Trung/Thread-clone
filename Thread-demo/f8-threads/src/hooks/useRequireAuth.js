import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { selectIsAuthenticated } from '@/store/slices/authSlice'

export function useRequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (action) => {
      if (isAuthenticated) return action?.()
      navigate('/login', { state: { from: location.pathname } })
    },
    [isAuthenticated, navigate, location.pathname],
  )
}