import { cn } from '@/lib/utils'

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-14 w-full rounded-xl border border-transparent bg-muted px-4 text-[15px] outline-none transition-colors placeholder:text-muted-foreground',
        'focus:border-ring aria-[invalid=true]:border-destructive disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}

export { Input }