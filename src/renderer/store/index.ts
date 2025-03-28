import { configureStore } from '@reduxjs/toolkit';
import jobApplicationsReducer from './slices/jobApplicationsSlice';

export const store = configureStore({
  reducer: {
    jobApplications: jobApplicationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 