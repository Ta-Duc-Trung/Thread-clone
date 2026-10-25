import { createSlice } from '@reduxjs/toolkit'

function savedTheme() {
  try {
    return localStorage.getItem('theme') || 'system'
  } catch {
    return 'system'
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: savedTheme(), modal: null },
  reducers: {
    themeChanged: (state, action) => {
      state.theme = action.payload
    },
    modalOpened: (state, action) => {
      state.modal = action.payload
    },
    modalClosed: (state) => {
      state.modal = null
    },
  },
})

export const { themeChanged, modalOpened, modalClosed } = uiSlice.actions
export default uiSlice.reducer

export const selectTheme = (state) => state.ui.theme
export const selectModal = (state) => state.ui.modal