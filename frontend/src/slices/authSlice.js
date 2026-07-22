import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');

const initialState = {
  token: token || null,
  user: null,
  error: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      state.isLoading = false;
      localStorage.setItem('token', action.payload.token);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      state.isLoading = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setAuthData, setError, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
