import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PostCard } from '@/components/post/PostCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

export default function CopyImageModal({ post, onClose }) {
  const { t } = useTranslation()
  const nodeRef = useRef(null)
  const [dark, setDark] = useState(false)
  const [busy, setBusy] = useState(false)

  const download = async () => {
    if (!nodeRef.current) return
    setBusy(true)
    try {
      const dataUrl = await toPng(nodeRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        imagePlaceholder: PLACEHOLDER,
        backgroundColor: dark ? '#101010' : '#ffffff',
      })
      const link = document.createElement('a')
      link.download = `threads-${post.user?.username ?? 'post'}-${post.id}.png`
      link.href = dataUrl
      link.click()
      toast(t('toast.imageDownloaded'))
    } catch {
      toast.error(t('toast.imageFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[560px] p-0">
        <div className="border-b px-5 py-4 text-center">
          <DialogTitle>{t('copyImage.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('copyImage.description')}</DialogDescription>
        </div>

        <div className="bg-muted/60 p-5">
          {/* Phần tử này được chụp thành ảnh. Lớp "dark" chỉ áp dụng cho riêng thẻ này */}
          <div ref={nodeRef} className={cn(dark && 'dark', 'rounded-3xl')}>
            <div className="overflow-hidden rounded-3xl border bg-card text-foreground">
              <PostCard post={post} variant="snapshot" className="border-b-0 py-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div
            className="flex rounded-xl bg-muted p-1 text-sm"
            role="radiogroup"
            aria-label={t('copyImage.background')}
          >
            {[false, true].map((value) => (
              <button
                key={String(value)}
                type="button"
                role="radio"
                aria-checked={dark === value}
                onClick={() => setDark(value)}
                className={cn(
                  'rounded-lg px-3 py-1.5',
                  dark === value ? 'bg-card font-semibold shadow-sm' : 'text-muted-foreground',
                )}
              >
                {t(value ? 'copyImage.dark' : 'copyImage.light')}
              </button>
            ))}
          </div>
          <Button onClick={download} disabled={busy} className="rounded-xl">
            {busy ? <Spinner className="size-4" /> : <Download className="size-4" />}
            {t('copyImage.download')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}