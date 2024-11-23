import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface AuthState {
    role: string | null;
    token: string | null;
    userId: string | null;
  }
  
  const initialState: AuthState = {
    role: null,
    token: null,
    userId: null,
  };
  
  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      setAuth: (
        state,
        action: PayloadAction<{ token: string; userId: string; role: string }>  
      ) => {
        const { token, userId, role } = action.payload;
        state.token = token;
        state.userId = userId;
        state.role = role;  
      },
      logout: (state) => {
        state.token = null;
        state.role = null;
        state.userId = null;
      },
    },
  });
  
  export const { setAuth, logout } = authSlice.actions;
  export default authSlice.reducer;
