// store.ts
// This file sets up the Redux store for the app using Redux Toolkit.
// Combines the authentication and leads reducers into a single store.
// Exports types for RootState and AppDispatch for use throughout the app.
//
// Workflow:
// 1. Imports reducers for authentication and leads.
// 2. Configures the Redux store with these reducers.
// 3. Exports the store and types for use in components and hooks.

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import leadsReducer from './leadsSlice';

// Configure the Redux store with auth and leads reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
  },
});
export default store;

// RootState type: represents the entire Redux state tree
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch type: represents the store's dispatch function
export type AppDispatch = typeof store.dispatch;