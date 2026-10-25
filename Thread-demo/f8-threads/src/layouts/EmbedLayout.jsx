import { useEffect } from 'react'
import { Outlet } from 'react-router'

export default function EmbedLayout() {
  useEffect(() => {
    document.body.style.background = '#ffffff'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <main className="w-full bg-white text-black">
      <Outlet />
    </main>
  )
}