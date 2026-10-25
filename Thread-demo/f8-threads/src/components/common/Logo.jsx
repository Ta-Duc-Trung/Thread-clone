import { cn } from '@/lib/utils'

const LOGO_URL = 'https://images.seeklogo.com/logo-png/48/2/threads-logo-png_seeklogo-489791.png'

export function Logo({ className }) {
  return (
    <img
      src={LOGO_URL}
      alt=""
      aria-hidden="true"
      draggable="false"
      className={cn('size-8 object-contain dark:invert', className)}
    />
  )
}