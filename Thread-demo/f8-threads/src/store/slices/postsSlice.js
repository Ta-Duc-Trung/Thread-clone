import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { getApiError } from '@/lib/http'
import { normalizePost, pickData, pickToggleResult } from '@/lib/post'
import { postService } from '@/services/postService'
import { userService } from '@/services/userService'
import { logout, sessionExpired } from './authSlice'

const postsAdapter = createEntityAdapter()

const t = (key, options) => i18n.t(key, options)

const inFlight = new Set()

function createToggleThunk(type, { flag, countKey, request, errorKey, successToast }) {
  return createAsyncThunk(type, async (id, { getState, dispatch, rejectWithValue }) => {
    const key = `${type}:${id}`
    const post = getState().posts.entities[id]
    if (!post || inFlight.has(key)) return rejectWithValue(null)
    inFlight.add(key)

    const previous = { [flag]: post[flag], ...(countKey ? { [countKey]: post[countKey] } : {}) }
    const next = { [flag]: !post[flag] }
    if (countKey) next[countKey] = Math.max(0, post[countKey] + (post[flag] ? -1 : 1))
    dispatch(postPatched({ id, changes: next }))

    try {
      const body = await request(id)
      const synced = pickToggleResult(body, flag, countKey)
      if (Object.keys(synced).length) dispatch(postPatched({ id, changes: synced }))
      if (successToast) toast(t(successToast(next[flag])))
      return { id, ...next, ...synced }
    } catch (error) {
      dispatch(postPatched({ id, changes: previous })) 
      toast.error(t(errorKey), { description: getApiError(error).message })
      return rejectWithValue(getApiError(error))
    } finally {
      inFlight.delete(key)
    }
  })
}

export const toggleLike = createToggleThunk('posts/toggleLike', {
  flag: 'is_liked',
  countKey: 'likes_count',
  request: postService.toggleLike,
  errorKey: 'toast.likeFailed',
})

export const toggleRepost = createToggleThunk('posts/toggleRepost', {
  flag: 'is_reposted',
  countKey: 'reposts_count',
  request: postService.toggleRepost,
  errorKey: 'toast.repostFailed',
  successToast: (reposted) => (reposted ? 'toast.reposted' : 'toast.unreposted'),
})

export const toggleSave = createToggleThunk('posts/toggleSave', {
  flag: 'is_saved',
  request: postService.toggleSave,
  errorKey: 'toast.saveFailed',
  successToast: (saved) => (saved ? 'toast.saved' : 'toast.unsaved'),
})

export const toggleFollow = createAsyncThunk('posts/toggleFollow', async (user, { dispatch, rejectWithValue }) => {
  const following = !user.is_following
  dispatch(authorPatched({ userId: user.id, changes: { is_following: following } }))
  try {
    await (following ? userService.follow(user.id) : userService.unfollow(user.id))
    toast(t(following ? 'toast.followed' : 'toast.unfollowed', { username: user.username }))
    return { userId: user.id, following }
  } catch (error) {
    dispatch(authorPatched({ userId: user.id, changes: { is_following: !following } }))
    toast.error(t('toast.followFailed'), { description: getApiError(error).message })
    return rejectWithValue(getApiError(error))
  }
})

function withCurrentUser(post, getState) {
  if (post && !post.user) post.user = getState().auth.user
  return post
}

export const createPost = createAsyncThunk('posts/create', async (fields, { getState, rejectWithValue }) => {
  try {
    const body = await postService.createPost(fields)
    return withCurrentUser(normalizePost(pickData(body)), getState)
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const createReply = createAsyncThunk(
  'posts/reply',
  async ({ parentId, ...fields }, { getState, rejectWithValue }) => {
    try {
      const body = await postService.reply(parentId, fields)
      const post = withCurrentUser(normalizePost(pickData(body)), getState)
      return { parentId, post: post ? { ...post, parent_id: post.parent_id ?? parentId } : null }
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const quotePost = createAsyncThunk(
  'posts/quote',
  async ({ postId, ...fields }, { getState, rejectWithValue }) => {
    try {
      const body = await postService.quote(postId, fields)
      const post = withCurrentUser(normalizePost(pickData(body)), getState)
      if (post && !post.original_post) post.original_post = getState().posts.entities[postId] ?? null
      return { quotedId: postId, post }
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const updatePost = createAsyncThunk('posts/update', async ({ id, ...fields }, { rejectWithValue }) => {
  try {
    const body = await postService.updatePost(id, fields)
    const data = pickData(body)
    return {
      id,
      changes: data && typeof data === 'object' && data.id ? normalizePost(data) : { content: fields.content },
    }
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const deletePost = createAsyncThunk('posts/delete', async (post, { rejectWithValue }) => {
  try {
    await postService.deletePost(post.id)
    toast(t('toast.deleted'))
    return { id: post.id, parentId: post.parent_id ?? null }
  } catch (error) {
    toast.error(t('toast.deleteFailed'), { description: getApiError(error).message })
    return rejectWithValue(getApiError(error))
  }
})

export const hidePost = createAsyncThunk('posts/hide', async (id, { rejectWithValue }) => {
  try {
    await postService.hide(id)
    toast(t('toast.hidden'))
    return id
  } catch (error) {
    toast.error(t('toast.actionFailed'), { description: getApiError(error).message })
    return rejectWithValue(getApiError(error))
  }
})

export const moderateUser = createAsyncThunk('posts/moderateUser', async ({ user, action }, { rejectWithValue }) => {
  try {
    await userService[action](user.id)
    const doneKey = { mute: 'toast.muted', restrict: 'toast.restricted', block: 'toast.blocked' }[action]
    toast(t(doneKey, { username: user.username }))
    return { userId: user.id, action }
  } catch (error) {
    toast.error(t('toast.actionFailed'), { description: getApiError(error).message })
    return rejectWithValue(getApiError(error))
  }
})

function upsertWithOriginals(state, posts) {
  const all = []
  for (const post of posts) {
    if (!post) continue
    all.push(post)
    if (post.original_post) all.push(post.original_post)
  }
  postsAdapter.upsertMany(state, all)
}

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    postsReceived: (state, action) => upsertWithOriginals(state, action.payload),
    postPatched: (state, action) => {
      postsAdapter.updateOne(state, { id: action.payload.id, changes: action.payload.changes })
    },
    authorPatched: (state, action) => {
      const { userId, changes } = action.payload
      for (const post of Object.values(state.entities)) {
        if (post.user?.id === userId) post.user = { ...post.user, ...changes }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.fulfilled, (state, action) => upsertWithOriginals(state, [action.payload]))
      .addCase(createReply.fulfilled, (state, action) => {
        const { parentId, post } = action.payload
        upsertWithOriginals(state, [post])
        const parent = state.entities[parentId]
        if (parent) parent.replies_count += 1
      })
      .addCase(quotePost.fulfilled, (state, action) => {
        const { quotedId, post } = action.payload
        upsertWithOriginals(state, [post])
        const quoted = state.entities[quotedId]
        if (quoted) quoted.reposts_count += 1
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const { id, changes } = action.payload
        const current = state.entities[id]
        if (current) state.entities[id] = { ...current, ...changes, user: changes.user ?? current.user }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { id, parentId } = action.payload
        postsAdapter.removeOne(state, id)
        const parent = parentId && state.entities[parentId]
        if (parent) parent.replies_count = Math.max(0, parent.replies_count - 1)
      })
      .addCase(logout.fulfilled, () => postsAdapter.getInitialState())
      .addCase(sessionExpired, () => postsAdapter.getInitialState())
  },
})

export const { postsReceived, postPatched, authorPatched } = postsSlice.actions
export default postsSlice.reducer

export const { selectById: selectPostById } = postsAdapter.getSelectors((state) => state.posts)