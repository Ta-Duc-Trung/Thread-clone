import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import feedReducer from './slices/feedSlice'
import postsReducer from './slices/postsSlice'
import repliesReducer from './slices/repliesSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    feed: feedReducer,
    replies: repliesReducer,
    ui: uiReducer,
  },
})

let lastTheme = store.getState().ui.theme
store.subscribe(() => {
  const theme = store.getState().ui.theme
  if (theme === lastTheme) return
  lastTheme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
  }
})