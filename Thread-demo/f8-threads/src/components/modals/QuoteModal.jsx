import ReplyModal from './ReplyModal'

export default function QuoteModal({ post, onClose }) {
  return <ReplyModal mode="quote" post={post} onClose={onClose} />
}