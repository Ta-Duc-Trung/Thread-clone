import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva('rounded-xl px-4 py-3 text-sm leading-relaxed', {
  variants: {
    variant: {
      info: 'bg-info text-info-foreground',
      success: 'bg-repost/10 text-repost',
      error: 'bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: { variant: 'info' },
})

function Alert({ className, variant, ...props }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Alert }