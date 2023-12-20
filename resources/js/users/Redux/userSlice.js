import { createSlice } from '@reduxjs/toolkit'
/* Creating a slice of the state. */

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: 0,
    isLoggedIn: false,
    isLoading: true,
    firstName: "",
    email: "",
    tag: ""
  },
  reducers: {
    login: (state, action) => {
      state.id = action.payload.id,
        state.tag = action.payload.tag,
        state.firstName = action.payload.firstName,
        state.email = action.payload.email,
        state.isLoggedIn = true
    },
    logout: (state) => {
      state.id = 0,
        state.tag = "",
        state.firstName = "",
        state.isLoggedIn = false
    },
    loading: (state, action) => {
      state.isLoading = action.payload.isLoading
    },
    updateProfile: (state, action) => {
      state.tag = action.payload.tag
    }
  }
})

/* Exporting the actions from the reducer. */

export const { login, logout, loading, updateProfile } = userSlice.actions
/* Exporting the reducer. */

export default userSlice.reducer
