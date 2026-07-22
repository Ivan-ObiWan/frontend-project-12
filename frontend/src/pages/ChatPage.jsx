import React, { useEffect } from 'react';
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
import { setMessages } from '../slices/messagesSlice';
import axios from '../api/axios';

function ChatPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { channels, currentChannelId, isLoading, error } = useSelector(
    (state) => state.channels
  );
  const { messages } = useSelector((state) => state.messages);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading());
      
      try {
        const channelsResponse = await axios.get('/channels');
        console.log('📡 Channels response:', channelsResponse.data);
        

        const channelsData = channelsResponse.data.data || [];
        dispatch(setChannels(channelsData));
        

        if (channelsData.length > 0) {
          dispatch(setCurrentChannel(channelsData[0].id));
        }

        const messagesResponse = await axios.get('/messages');
        console.log('📡 Messages response:', messagesResponse.data);
        
        const messagesData = messagesResponse.data.data || [];
        dispatch(setMessages(messagesData));

        dispatch(setLoaded());
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

  const handleLogout = () => {
    dispatch(logout());
  };

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
        {/* Боковая панель с каналами */}
        <div className="col-3 bg-light p-3 border-end">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Каналы</h5>
            <button className="btn btn-primary btn-sm">+</button>
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
                    onClick={() => dispatch(setCurrentChannel(channel.id))}
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
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Выйти
          </button>
        </div>

        {/* Основная область с сообщениями */}
        <div className="col-9 d-flex flex-column p-0">
          <div className="p-3 border-bottom bg-white">
            <h5>
              # {channels?.find((c) => c.id === currentChannelId)?.name || 'Выберите канал'}
            </h5>
          </div>

          <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {messages && messages.length > 0 ? (
              messages
                .filter((msg) => msg.channelId === currentChannelId)
                .map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <strong>{msg.username}</strong>: {msg.content}
                  </div>
                ))
            ) : (
              <p className="text-muted">Нет сообщений в этом канале</p>
            )}
          </div>

          {/* Форма отправки сообщения */}
          <div className="p-3 border-top bg-white">
            <form>
              <input
                type="text"
                className="form-control"
                placeholder="Введите сообщение..."
                disabled
              />
              <small className="text-muted">WebSocket будет подключен позже</small>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
