import { createSlice } from '@reduxjs/toolkit'

/* Creating a slice of the Redux store. */
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

/* Exporting the actions from the slice. */

export const { setMode, cookieSaving } = usettingSlice.actions
/* Exporting the reducer function from the slice. */

export default usettingSlice.reducer