import { useState } from 'react'
import copy from 'copy-to-clipboard'
import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { embedUrl } from '@/lib/post'

export function buildEmbedCode(post) {
  return `<iframe src="${embedUrl(post)}" width="550" height="560" style="max-width:100%;border:0;border-radius:16px" loading="lazy" title="Threads post by ${post.user?.username ?? ''}"></iframe>`
}

export default function EmbedModal({ post, onClose }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const code = buildEmbedCode(post)

  const handleCopy = () => {
    copy(code)
    setCopied(true)
    toast(t('toast.embedCopied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[620px] p-0">
        <div className="border-b px-5 py-4 text-center">
          <DialogTitle>{t('embed.title')}</DialogTitle>
          <DialogDescription className="mt-1">{t('embed.description')}</DialogDescription>
        </div>

        <div className="space-y-4 p-5">
          {/* Xem trước: chính là trang /embed, hiển thị qua iframe */}
          <div className="overflow-hidden rounded-2xl border bg-white">
            <iframe src={embedUrl(post)} title={t('embed.preview')} className="block h-[360px] w-full border-0" />
          </div>

          <div className="relative">
            <label htmlFor="embed-code" className="sr-only">
              {t('embed.code')}
            </label>
            <textarea
              id="embed-code"
              readOnly
              value={code}
              rows={4}
              onFocus={(e) => e.target.select()}
              className="w-full resize-none rounded-xl bg-muted p-3 font-mono text-[13px] leading-relaxed text-muted-foreground outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className="rounded-xl">
              {t('common.close')}
            </Button>
            <Button onClick={handleCopy} className="rounded-xl">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? t('common.copied') : t('common.copy')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}