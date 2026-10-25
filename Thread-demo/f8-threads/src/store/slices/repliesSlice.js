import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiError } from '@/lib/http'
import { pickPage } from '@/lib/post'
import { postService } from '@/services/postService'
import { logout, sessionExpired } from './authSlice'
import { createReply, deletePost, hidePost, postsReceived } from './postsSlice'

const PER_PAGE = 15

export const fetchReplies = createAsyncThunk(
  'replies/fetch',
  async ({ postId, refresh = false }, { getState, dispatch, rejectWithValue }) => {
    const current = getState().replies.byParent[postId]
    const page = refresh || !current ? 1 : current.page + 1
    try {
      const body = await postService.getReplies(postId, { page, perPage: PER_PAGE })
      const { items, hasMore } = pickPage(body)
      dispatch(postsReceived(items))
      return { postId, page, ids: items.map((p) => p.id), hasMore, refresh: page === 1 }
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
  {
    condition: ({ postId, refresh }, { getState }) => {
      const current = getState().replies.byParent[postId]
      if (current?.status === 'loading') return false
      if (current && !refresh && !current.hasMore) return false
    },
  },
)

const repliesSlice = createSlice({
  name: 'replies',
  initialState: { byParent: {} },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReplies.pending, (state, action) => {
        const { postId } = action.meta.arg
        state.byParent[postId] ??= { ids: [], page: 0, hasMore: true, status: 'idle', error: null }
        state.byParent[postId].status = 'loading'
        state.byParent[postId].error = null
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { postId, page, ids, hasMore, refresh } = action.payload
        const entry = state.byParent[postId]
        entry.ids = refresh ? ids : [...entry.ids, ...ids.filter((id) => !entry.ids.includes(id))]
        entry.page = page
        entry.hasMore = hasMore && ids.length > 0
        entry.status = 'succeeded'
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        if (action.meta.condition) return
        const entry = state.byParent[action.meta.arg.postId]
        if (!entry) return
        entry.status = 'failed'
        entry.error = action.payload?.message ?? null
      })
  
      .addCase(createReply.fulfilled, (state, action) => {
        const { parentId, post } = action.payload
        if (!post?.id) return
        state.byParent[parentId] ??= { ids: [], page: 1, hasMore: false, status: 'succeeded', error: null }
        state.byParent[parentId].ids.unshift(post.id)
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { id, parentId } = action.payload
        const entry = parentId && state.byParent[parentId]
        if (entry) entry.ids = entry.ids.filter((x) => x !== id)
      })
      .addCase(hidePost.fulfilled, (state, action) => {
        for (const entry of Object.values(state.byParent)) entry.ids = entry.ids.filter((x) => x !== action.payload)
      })
      .addCase(logout.fulfilled, () => ({ byParent: {} }))
      .addCase(sessionExpired, () => ({ byParent: {} }))
  },
})

export default repliesSlice.reducer

export const selectReplies = (postId) => (state) => state.replies.byParent[postId]