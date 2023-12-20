import { createSlice } from '@reduxjs/toolkit'

/* Creating a slice of the state. */
export const supervisorSlice = createSlice({
  name: 'supervisor',
  initialState: {
    id: 0,
    isLoggedIn: false,
    isLoading: true,
    firstName: "",
    email: "",
    role: 0,
    tag: ""
  },
  reducers: {
    login: (state, action) => {
      state.id = action.payload.id,
        state.tag = action.payload.tag,
        state.firstName = action.payload.firstName,
        state.email = action.payload.email,
        state.role = action.payload.role,
        state.isLoggedIn = true
    },
    logout: (state) => {
      state.id = 0,
        state.tag = "",
        state.firstName = "",
        state.role = 0,
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

/* Exporting the actions from the slice. */

export const { login, logout, loading, updateProfile } = supervisorSlice.actions
/* Exporting the reducer function. */

export default supervisorSlice.reducer
