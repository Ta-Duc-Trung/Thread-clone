import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { getApiError } from '@/lib/http'
import { cn } from '@/lib/utils'
import { postService } from '@/services/postService'

export const REPORT_REASONS = [
  'spam',
  'harassment',
  'hate_speech',
  'violence',
  'nudity',
  'false_information',
  'scam',
  'other',
]

export default function ReportModal({ post, onClose }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!reason) return
    setSubmitting(true)
    setError(null)
    try {
      await postService.report(post.id, { reason, description: description.trim() })
      toast(t('toast.reported'))
      onClose()
    } catch (err) {
      setError(getApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="max-w-[440px] p-0">
        <form onSubmit={submit}>
          <div className="border-b px-5 py-4 text-center">
            <DialogTitle>{t('report.title')}</DialogTitle>
            <DialogDescription className="mt-1">{t('report.description')}</DialogDescription>
          </div>

          <fieldset className="px-2 py-2">
            <legend className="sr-only">{t('report.reason')}</legend>
            {REPORT_REASONS.map((value) => (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-[15px] hover:bg-muted',
                  reason === value && 'font-semibold',
                )}
              >
                {t(`report.reasons.${value}`)}
                <input
                  type="radio"
                  name="reason"
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  className="size-[18px] accent-foreground"
                />
              </label>
            ))}
          </fieldset>

          <div className="px-5">
            <label htmlFor="report-description" className="sr-only">
              {t('report.details')}
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t('report.details')}
              className="w-full resize-none rounded-xl bg-muted p-3 text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {error && (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 px-5 py-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting} className="rounded-xl">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!reason || submitting} className="rounded-xl bg-destructive text-white">
              {submitting ? <Spinner className="size-4" /> : t('report.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}