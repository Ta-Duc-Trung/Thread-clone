import * as Popover from '@radix-ui/react-popover'
import { Smile } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤔', '🙄', '😴', '😭',
  '😡', '🥹', '😅', '🙃', '😉', '🤗', '🤩', '😇', '🤯', '😱', '🥳', '😬',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '👀', '✌️', '🤝', '👋', '🫶', '🤞',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '🔥', '✨', '⭐', '🎉',
  '☕', '🍜', '🍕', '🍺', '⚽', '🎮', '🎵', '📷', '💻', '📚', '✈️', '🌿',
]

export function EmojiPicker({ onPick, triggerClassName }) {
  const { t } = useTranslation()
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={t('composer.emoji')} className={triggerClassName}>
        <Smile className="size-5" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-[60] grid w-[288px] grid-cols-8 gap-0.5 rounded-2xl border bg-popover p-2 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onPick(emoji)}
              className="grid size-8 place-items-center rounded-lg text-xl hover:bg-muted"
            >
              {emoji}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}