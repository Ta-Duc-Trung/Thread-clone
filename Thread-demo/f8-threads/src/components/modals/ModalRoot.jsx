import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { selectIsAuthenticated } from '@/store/slices/authSlice'
import { deletePost, moderateUser, selectPostById } from '@/store/slices/postsSlice'
import { modalClosed, selectModal } from '@/store/slices/uiSlice'
import ConfirmModal from './ConfirmModal'
import CopyImageModal from './CopyImageModal'
import EmbedModal from './EmbedModal'
import QuoteModal from './QuoteModal'
import ReplyModal from './ReplyModal'
import ReportModal from './ReportModal'

export function ModalRoot() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const modal = useSelector(selectModal)
  const post = useSelector((state) => (modal?.postId != null ? selectPostById(state, modal.postId) : null))
  const isAuthenticated = useSelector(selectIsAuthenticated)

  
  const orphaned = modal?.postId != null && !post
  useEffect(() => {
    if (orphaned) dispatch(modalClosed())
  }, [orphaned, dispatch])

  if (!modal || orphaned) return null
  const close = () => dispatch(modalClosed())

  const needsAuth = ['reply', 'quote', 'create', 'edit', 'report', 'confirmBlock', 'confirmDelete']
  if (needsAuth.includes(modal.type) && !isAuthenticated) return null

  switch (modal.type) {
    case 'reply':
      return <ReplyModal key={modal.postId} mode="reply" post={post} onClose={close} />
    case 'quote':
      return <QuoteModal post={post} onClose={close} />
    case 'create':
      return <ReplyModal mode="create" onClose={close} />
    case 'edit':
      return <ReplyModal mode="edit" post={post} onClose={close} />
    case 'embed':
      return <EmbedModal post={post} onClose={close} />
    case 'copyImage':
      return <CopyImageModal post={post} onClose={close} />
    case 'report':
      return <ReportModal post={post} onClose={close} />
    case 'confirmBlock':
      return (
        <ConfirmModal
          title={t('confirm.blockTitle', { username: post.user?.username })}
          description={t('confirm.blockDescription')}
          confirmLabel={t('post.block')}
          onConfirm={() => dispatch(moderateUser({ user: post.user, action: 'block' })).unwrap()}
          onClose={close}
        />
      )
    case 'confirmDelete':
      return (
        <ConfirmModal
          title={t('confirm.deleteTitle')}
          description={t('confirm.deleteDescription')}
          confirmLabel={t('post.delete')}
          onConfirm={async () => {
            await dispatch(deletePost(post)).unwrap()
            // đang xem trang chi tiết của chính bài vừa xóa thì quay về trang chủ
            if (window.location.pathname.endsWith(`/post/${post.id}`)) navigate('/', { replace: true })
          }}
          onClose={close}
        />
      )
    default:
      return null
  }
}