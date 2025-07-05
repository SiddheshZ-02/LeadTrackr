// authSlice.ts
// This file manages authentication state using Redux Toolkit. It handles user login, registration, token loading, and logout.
// Uses async thunks for API calls and SecureStore for token persistence.
//
// Workflow:
// 1. loginUser: Authenticates user, fetches profile, and stores token.
// 2. registerUser: Registers a new user and returns user data.
// 3. loadToken: Loads token from SecureStore on app start.
// 4. logoutUser: Deletes token and clears user state.
// 5. Reducers handle loading, error, and user/token state.

import * as SecureStore from "expo-secure-store";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types for registration and login
// Register user data type
// (gender is optional)
type RegisterUserData = {
  name: string;
  email: string;
  password: string;
  gender?: string;
};
// Login credentials type
type LoginCredentials = {
  email: string;
  password: string;
};

const API_BASE = "https://api.escuelajs.co/api/v1";

// Thunk: Login user
// 1. Sends login request to API
// 2. Stores token in SecureStore
// 3. Fetches user profile
// 4. Returns token and user data
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (Credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Credentials),
      });

      const data = await response.json();
      if (response.status !== 201)
        throw new Error(data.message || "login Failed");

      await SecureStore.setItemAsync("token", data.access_token);

      // Fetch user profile using the token
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          "Authorization": `Bearer ${data.access_token}`,
        },
      });
      const user = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(user.message || "Failed to fetch user profile");

      return { access_token: data.access_token, user };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

// Helper: Get avatar URL based on gender
const getAvatarUrl = (gender: string | undefined) => {
  if (gender === "male") return "https://img.freepik.com/premium-vector/man-with-shirt-that-says-he-is-character_1230457-33052.jpg";
  if (gender === "female") return "https://img.freepik.com/free-vector/woman-with-long-dark-hair_1308-176524.jpg?t=st=1751516235~exp=1751519835~hmac=b3eff4bd3939a08a32605c7432621f9893d904a8b42df487c3fb388c497599ab&w=2000";
  return "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
};

// Thunk: Register user
// 1. Sends registration request to API with avatar
// 2. Returns user data
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterUserData, { rejectWithValue }) => {
    try {
      const avatar = getAvatarUrl(userData.gender);
      const response = await fetch(`${API_BASE}/users/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ ...userData, avatar }),
      });

      const data = await response.json();
      if (response.status !== 201)
        throw new Error(data.message || "Registration failed");
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

// Thunk: Load token from SecureStore on app start
export const loadToken = createAsyncThunk("auth/loadToken", async () => {
  const token = await SecureStore.getItemAsync("token");
  return token;
});

// Thunk: Logout user
// 1. Deletes token from SecureStore
// 2. Dispatches logout reducer to clear state
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    await SecureStore.deleteItemAsync("token");
    // Optionally, you can dispatch logout here if needed
    dispatch(logout());
  }
);

// Auth slice definition
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    // Reducer: Clear user and token (used for logout)
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    // Reducer: Clear error message
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login async thunk
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "An error occurred";
      })

      // Handle register async thunk
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "An error occurred";
      })

      // Handle loadToken async thunk
      .addCase(loadToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      // Handle logoutUser async thunk
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
