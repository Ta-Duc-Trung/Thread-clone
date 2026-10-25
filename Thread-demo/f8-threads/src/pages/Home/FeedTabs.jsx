import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function FeedTabs({ value, onChange }) {
  const { t } = useTranslation()
  const tabs = [
    { value: 'for_you', label: t('feed.forYou') },
    { value: 'following', label: t('feed.following') },
    { value: 'ghost', label: t('feed.ghost') },
  ]
  return (
    <div role="tablist" aria-label={t('feed.tabsLabel')} className="grid grid-cols-3">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative h-12 text-[15px] font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:bg-muted',
            value === tab.value && 'text-foreground',
          )}
        >
          {tab.label}
          <span
            className={cn(
              'absolute inset-x-6 bottom-0 h-px bg-border transition-all',
              value === tab.value && 'h-[2px] bg-foreground',
            )}
          />
        </button>
      ))}
    </div>
  )
}