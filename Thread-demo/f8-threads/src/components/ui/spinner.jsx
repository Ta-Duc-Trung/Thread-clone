import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function Spinner({ className }) {
  return <LoaderCircle aria-hidden="true" className={cn('size-5 animate-spin', className)} />
}

export { Spinner }