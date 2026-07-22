import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  token: token || null,
  user: user || null,
  error: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      console.log('🔐 Setting auth data:', action.payload);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      state.isLoading = false;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      console.log('💾 Token saved to localStorage:', localStorage.getItem('token'));
    },
    setError: (state, action) => {
      console.log('❌ Setting error:', action.payload);
      state.error = action.payload;
      state.isLoading = false;
    },
    setLoading: (state) => {
      console.log('⏳ Loading...');
      state.isLoading = true;
      state.error = null;
    },
    logout: (state) => {
      console.log('🚪 Logging out');
      state.token = null;
      state.user = null;
      state.error = null;
      state.isLoading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setAuthData, setError, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
