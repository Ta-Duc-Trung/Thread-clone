import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import i18n from '@/i18n'
import { authService } from '@/services/authService'
import { getApiError } from '@/lib/http'
import { normalizeUser, pickData } from '@/lib/post'
import { pickTokens, tokenStorage } from '@/lib/tokenStorage'

const initialState = {
  user: null,
  status: tokenStorage.getAccessToken() ? 'checking' : 'guest',
}

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const body = await authService.getUser()
    const data = pickData(body)
    return normalizeUser(data?.user ?? data)
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const login = createAsyncThunk('auth/login', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const body = await authService.login(credentials)
    const tokens = pickTokens(body)
    if (!tokens.access_token) throw new Error('Không nhận được access_token')
    tokenStorage.setTokens(tokens)
    const user = await dispatch(fetchCurrentUser()).unwrap()
    return user
  } catch (error) {
    tokenStorage.clear()
    if (error?.isAxiosError) return rejectWithValue(getApiError(error))
    if (error?.fieldErrors) return rejectWithValue(error)
    return rejectWithValue({ status: 0, message: i18n.t('errors.generic'), fieldErrors: {} })
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout()
  } catch {
  } finally {
    tokenStorage.clear()
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.user = null
      state.status = 'guest'
    },
    userUpdated: (state, action) => {
      if (state.user) state.user = { ...state.user, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        if (action.payload?.status === 401) tokenStorage.clear()
        state.user = null
        state.status = 'guest'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = 'guest'
      })
  },
})

export const { sessionExpired, userUpdated } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated'