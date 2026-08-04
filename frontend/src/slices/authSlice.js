import { createSlice } from '@reduxjs/toolkit';

// Безопасное получение данных из localStorage
const getToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    return JSON.parse(user);
  } catch {
    return null;
  }
};

const initialState = {
  token: getToken(),
  user: getUser(),
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
      try {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } catch (e) {
        console.error('❌ Error saving to localStorage:', e);
      }
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
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.error('❌ Error removing from localStorage:', e);
      }
    },
  },
});

export const { setAuthData, setError, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
