import { useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, value, ref: externalRef, ...props }) {
  const innerRef = useRef(null)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node
        if (typeof externalRef === 'function') externalRef(node)
        else if (externalRef) externalRef.current = node
      }}
      rows={1}
      value={value}
      className={cn(
        'w-full resize-none bg-transparent text-[15px] leading-snug outline-none placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }