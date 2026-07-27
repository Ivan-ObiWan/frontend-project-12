import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import {
  setChannels,
  setCurrentChannel,
  setLoading,
  setError,
  setLoaded,
} from '../slices/channelsSlice';
import { setMessages, addMessage } from '../slices/messagesSlice';
import axios from '../api/axios';
import useSocket from '../hooks/useSocket';

function ChatPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { channels, currentChannelId, isLoading, error } = useSelector(
    (state) => state.channels
  );
  const { messages } = useSelector((state) => state.messages);

  console.log('🔍 CHANNELS:', channels);
  console.log('🔍 CURRENT_CHANNEL_ID:', currentChannelId);
  console.log('🔍 MESSAGES:', messages);

  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isConnected, emit } = useSocket(token);

  const filteredMessages = useMemo(() => {
    return messages?.filter((msg) => msg.channelId === currentChannelId) || [];
  }, [messages, currentChannelId]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleChannelSwitch = useCallback((channelId) => {
    console.log('🔄 Switching to channel:', channelId);
    dispatch(setCurrentChannel(channelId));
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 Fetching data...');
      dispatch(setLoading());
      
      try {
        console.log('📡 Requesting channels...');
        const channelsResponse = await axios.get('/channels');
        console.log('📡 Channels response:', channelsResponse.data);
        
        const channelsData = channelsResponse.data.data || [];
        dispatch(setChannels(channelsData));
        
        if (channelsData.length > 0) {
          dispatch(setCurrentChannel(channelsData[0].id));
          console.log('✅ Current channel set to:', channelsData[0].id);
        }

        const messagesResponse = await axios.get('/messages');
        console.log('📨 Messages response:', messagesResponse.data);
        
        const messagesData = messagesResponse.data.data || [];
        dispatch(setMessages(messagesData));

        dispatch(setLoaded());
        console.log('✅ Data loaded successfully');
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        const errorMessage = err.response?.data?.message || 'Ошибка загрузки данных';
        dispatch(setError(errorMessage));
      }
    };

    if (token) {
      fetchData();
    }
  }, [dispatch, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('📤 Sending message...');
    
    if (!newMessage.trim() || !currentChannelId) {
      console.log('❌ No message or channel:', { newMessage, currentChannelId });
      return;
    }

    const messageData = {
      channelId: currentChannelId,
      content: newMessage.trim(),
    };

    try {
      const response = await axios.post('/messages', messageData);
      console.log('📤 Message sent:', response.data);
      setNewMessage('');
    } catch (err) {
      console.error('❌ Error sending message:', err);
      alert('Не удалось отправить сообщение. Попробуйте снова.');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentChannelId]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <h3>Загрузка...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-3 bg-light p-3 border-end">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Каналы</h5>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              +
            </button>
          </div>
          <ul className="list-unstyled">
            {channels && channels.length > 0 ? (
              channels.map((channel) => (
                <li key={channel.id}>
                  <button
                    className={`btn w-100 text-start ${
                      currentChannelId === channel.id
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => handleChannelSwitch(channel.id)}
                  >
                    # {channel.name}
                  </button>
                </li>
              ))
            ) : (
              <li className="text-muted">Нет каналов</li>
            )}
          </ul>
          <hr />
          <div className="mb-2">
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Выйти
          </button>
        </div>

        <div className="col-9 d-flex flex-column p-0">
          <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
            <h5>
              # {channels?.find((c) => c.id === currentChannelId)?.name || 'Выберите канал'}
            </h5>
            <span className="text-muted small">{filteredMessages.length} сообщений</span>
          </div>

          <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <strong>{msg.username}</strong>: {msg.content}
                </div>
              ))
            ) : (
              <p className="text-muted">Нет сообщений в этом канале</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-top bg-white">
            <form onSubmit={handleSendMessage} className="d-flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!currentChannelId}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!newMessage.trim() || !currentChannelId}
              >
                Отправить
              </button>
            </form>
            {!isConnected && (
              <small className="text-warning">⚠️ Режим офлайн — сообщения могут задерживаться</small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
