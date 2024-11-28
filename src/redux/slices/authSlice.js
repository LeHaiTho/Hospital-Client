import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");
const initialState = {
  user: null,
  token: token ? token : null,
  isError: false,
  message: "",
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
    },
    setUserInfo: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setError: (state, action) => {
      state.isError = true;
      state.message = action.payload;
    },
    clearError: (state) => {
      state.isError = false;
      state.message = "";
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { login, logout, setError, clearError, setLoading, setUserInfo } =
  authSlice.actions;
export default authSlice.reducer;
