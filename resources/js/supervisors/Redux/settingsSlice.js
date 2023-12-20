import { createSlice } from '@reduxjs/toolkit'
/* Creating a slice of state. */

export const usettingSlice = createSlice({
  name: 'setting',
  initialState: {
    isDark: false,
    saveCookies: false
  },
  reducers: {
    setMode: (state, action) => {
      state.isDark = action.payload.isDark
    },
    cookieSaving: (state, action) => {
      state.saveCookies = action.payload.saveCookies
    }
  }
})

/* Exporting the actions from the reducer. */

export const { setMode, cookieSaving } = usettingSlice.actions

/* Exporting the reducer. */
export default usettingSlice.reducer