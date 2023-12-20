import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice";
import settingReducer from "./settingsSlice";

/* Exporting the store. */
export default configureStore({
  reducer: {
    user: userReducer,
    setting: settingReducer
  }
})