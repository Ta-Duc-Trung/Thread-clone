import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiError } from '@/lib/http'
import { pickPage } from '@/lib/post'
import { postService } from '@/services/postService'
import { logout, login, sessionExpired } from './authSlice'
import { createPost, deletePost, hidePost, moderateUser, postsReceived, quotePost } from './postsSlice'

export const FEED_TYPES = ['for_you', 'following', 'ghost']
const PER_PAGE = 10

const emptyTab = () => ({ ids: [], page: 0, hasMore: true, status: 'idle', error: null })
export const fetchFeed = createAsyncThunk(
  'feed/fetch',
  async ({ type, refresh = false }, { getState, dispatch, rejectWithValue }) => {
    const tab = getState().feed.tabs[type]
    const page = refresh ? 1 : tab.page + 1
    try {
      const body = await postService.getFeed({ type, page, perPage: PER_PAGE })
      const { items, hasMore } = pickPage(body)
      dispatch(postsReceived(items))
      return { type, page, ids: items.map((p) => p.id), hasMore, refresh }
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
  {
    condition: ({ type, refresh }, { getState }) => {
      const tab = getState().feed.tabs[type]
      if (tab.status === 'loading') return false
      if (!refresh && !tab.hasMore) return false
    },
  },
)

const removeIds = (state, shouldRemove) => {
  for (const tab of Object.values(state.tabs)) tab.ids = tab.ids.filter((id) => !shouldRemove(id))
}

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    tabs: Object.fromEntries(FEED_TYPES.map((type) => [type, emptyTab()])),
    hiddenAuthorIds: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        const tab = state.tabs[action.meta.arg.type]
        tab.status = 'loading'
        tab.error = null
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { type, page, ids, hasMore, refresh } = action.payload
        const tab = state.tabs[type]
        tab.ids = refresh ? ids : [...tab.ids, ...ids.filter((id) => !tab.ids.includes(id))]
        tab.page = page
        tab.hasMore = hasMore && ids.length > 0
        tab.status = 'succeeded'
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        if (action.meta.condition) return
        const tab = state.tabs[action.meta.arg.type]
        tab.status = 'failed'
        tab.error = action.payload?.message ?? null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        if (action.payload?.id) state.tabs.for_you.ids.unshift(action.payload.id)
      })
      .addCase(quotePost.fulfilled, (state, action) => {
        if (action.payload?.post?.id) state.tabs.for_you.ids.unshift(action.payload.post.id)
      })
      .addCase(deletePost.fulfilled, (state, action) => removeIds(state, (id) => id === action.payload.id))
      .addCase(hidePost.fulfilled, (state, action) => removeIds(state, (id) => id === action.payload))
      .addCase(moderateUser.fulfilled, (state, action) => {
        const { action: kind, userId } = action.payload
        if (kind === 'restrict') return
        if (!state.hiddenAuthorIds.includes(userId)) state.hiddenAuthorIds.push(userId)
      })
      .addCase(login.fulfilled, () => feedSlice.getInitialState())
      .addCase(logout.fulfilled, () => feedSlice.getInitialState())
      .addCase(sessionExpired, () => feedSlice.getInitialState())
  },
})

export default feedSlice.reducer

export const selectFeedTab = (type) => (state) => state.feed.tabs[type]
export const selectHiddenAuthorIds = (state) => state.feed.hiddenAuthorIds