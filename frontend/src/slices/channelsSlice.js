import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

export const fetchChannels = createAsyncThunk(
  'channels/fetchChannels',
  async () => {
    const response = await axios.get('/channels');
    console.log('📡 fetchChannels response:', response.data);
    // Проверяем структуру ответа
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }
);

export const addChannel = createAsyncThunk(
  'channels/addChannel',
  async (channelData) => {
    const response = await axios.post('/channels', channelData);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }
);

export const removeChannel = createAsyncThunk(
  'channels/removeChannel',
  async (channelId) => {
    await axios.delete(`/channels/${channelId}`);
    return channelId;
  }
);

export const renameChannel = createAsyncThunk(
  'channels/renameChannel',
  async ({ id, name }) => {
    const response = await axios.patch(`/channels/${id}`, { name });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }
);

const initialState = {
  channels: [],
  currentChannelId: null,
  isLoading: false,
  error: null,
};

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannelId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('✅ fetchChannels fulfilled, payload:', action.payload);
        // Убедимся, что это массив
        state.channels = Array.isArray(action.payload) ? action.payload : [];
        if (state.channels.length > 0 && !state.currentChannelId) {
          state.currentChannelId = state.channels[0].id;
        }
        console.log('✅ Channels set in store:', state.channels.length);
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.isLoading = false;
        console.error('❌ fetchChannels rejected:', action.error);
        state.error = action.error.message || 'Ошибка загрузки каналов';
      })
      .addCase(addChannel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('✅ addChannel fulfilled, payload:', action.payload);
        if (action.payload) {
          state.channels.push(action.payload);
          state.currentChannelId = action.payload.id;
        }
      })
      .addCase(addChannel.rejected, (state, action) => {
        state.isLoading = false;
        console.error('❌ addChannel rejected:', action.error);
        state.error = action.error.message || 'Ошибка создания канала';
      })
      .addCase(removeChannel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.channels = state.channels.filter(
          (channel) => channel.id !== action.payload
        );
        if (state.currentChannelId === action.payload) {
          const defaultChannel = state.channels.find((c) => c.name === 'general');
          state.currentChannelId = defaultChannel?.id || state.channels[0]?.id || null;
        }
      })
      .addCase(removeChannel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка удаления канала';
      })
      .addCase(renameChannel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(renameChannel.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.channels.findIndex((c) => c.id === action.payload.id);
          if (index !== -1) {
            state.channels[index] = action.payload;
          }
        }
      })
      .addCase(renameChannel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка переименования канала';
      });
  },
});

export const { setCurrentChannel, clearError } = channelsSlice.actions;
export default channelsSlice.reducer;
