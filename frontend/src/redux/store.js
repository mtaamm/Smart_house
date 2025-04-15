import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import switchReducer from './slices/switchSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    switch: switchReducer
  }
}); 