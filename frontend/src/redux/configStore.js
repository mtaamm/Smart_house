import { configureStore } from "@reduxjs/toolkit";
import switchReducer from "./slices/switchSlice";

export const store = configureStore({
  reducer: {
    switch: switchReducer,
  },
});
