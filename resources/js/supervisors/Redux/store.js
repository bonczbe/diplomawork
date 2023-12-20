import { configureStore } from '@reduxjs/toolkit'
import supervisorReducer from "./userSlice";
import settingReducer from "./settingsSlice";

/* Exporting the store. */
export default configureStore({
  reducer: {
    supervisor: supervisorReducer,
    setting: settingReducer
  }
})
