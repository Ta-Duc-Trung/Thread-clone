import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

export default function ConfirmModal({ title, description, confirmLabel, onConfirm, onClose }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      setBusy(false) 
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-w-[340px] overflow-hidden p-0 text-center">
        <div className="px-6 pt-6 pb-5">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="mt-2 text-[15px]">{description}</DialogDescription>}
        </div>
        <div className="grid grid-cols-2 border-t text-[15px]">
          <button type="button" onClick={onClose} disabled={busy} className="border-r py-4 hover:bg-muted">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="flex items-center justify-center py-4 font-bold text-destructive hover:bg-muted"
          >
            {busy ? <Spinner className="size-4" /> : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}