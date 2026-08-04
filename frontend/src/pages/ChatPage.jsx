import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import {
  fetchChannels,
  setCurrentChannel,
  clearError,
} from '../slices/channelsSlice';
import { setMessages, addMessage } from '../slices/messagesSlice';
import axios from '../api/axios';
import useSocket from '../hooks/useSocket';
import AddChannelModal from '../components/AddChannelModal';
import RenameChannelModal from '../components/RenameChannelModal';
import DeleteChannelModal from '../components/DeleteChannelModal';
import ChannelMenu from '../components/ChannelMenu';

function ChatPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const { channels, currentChannelId, isLoading, error } = useSelector(
    (state) => state.channels
  );
  const { messages } = useSelector((state) => state.messages);

  const [newMessage, setNewMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isConnected } = useSocket(token);

  const filteredMessages = useMemo(() => {
    return messages?.filter((msg) => msg.channelId === currentChannelId) || [];
  }, [messages, currentChannelId]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleChannelSwitch = useCallback((channelId) => {
    dispatch(setCurrentChannel(channelId));
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (token) {
      dispatch(fetchChannels());
    }
  }, [dispatch, token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChannelId) return;
      try {
        const response = await axios.get('/messages');
        const messagesData = response.data.data || [];
        dispatch(setMessages(messagesData));
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [dispatch, currentChannelId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentChannelId) return;

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

  const handleRename = (channel) => {
    setSelectedChannel(channel);
    setShowRenameModal(true);
  };

  const handleDelete = (channel) => {
    setSelectedChannel(channel);
    setShowDeleteModal(true);
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

  if (isLoading && channels.length === 0) {
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
        <button className="btn btn-primary" onClick={() => dispatch(clearError())}>
          Попробовать снова
        </button>
      </div>
    );
  }

  const currentChannel = channels.find((c) => c.id === currentChannelId);

  return (
    <div className={`container-fluid vh-100 d-flex flex-column ${isDark ? 'bg-dark text-white' : 'bg-light'}`}>
      {/* Хедер */}
      <nav className={`navbar ${isDark ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} border-bottom`}>
        <div className="container-fluid">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <span>Hexlet Chat</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleTheme}
              title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {user && (
              <span className={isDark ? 'text-light' : 'text-muted'}>{user.username}</span>
            )}
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <div className="row flex-grow-1">
        {/* Боковая панель */}
        <div className={`col-3 p-3 border-end ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className={isDark ? 'text-light' : 'text-dark'}>Каналы</h5>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              +
            </button>
          </div>
          <ul className="list-unstyled">
            {channels && channels.length > 0 ? (
              channels.map((channel) => (
                <li key={channel.id} className="d-flex align-items-center mb-1">
                  <button
                    className={`btn w-100 text-start ${
                      currentChannelId === channel.id
                        ? 'btn-primary'
                        : isDark
                        ? 'btn-outline-secondary text-light'
                        : 'btn-outline-secondary text-dark'
                    }`}
                    onClick={() => handleChannelSwitch(channel.id)}
                  >
                    # {channel.name}
                  </button>
                  {currentChannelId === channel.id && (
                    <ChannelMenu
                      channel={channel}
                      onRename={handleRename}
                      onDelete={handleDelete}
                    />
                  )}
                </li>
              ))
            ) : (
              <li className={isDark ? 'text-secondary' : 'text-muted'}>Нет каналов</li>
            )}
          </ul>
          <hr className={isDark ? 'border-secondary' : ''} />
          <div className="mb-2">
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
        </div>

        {/* Основная область чата */}
        <div className={`col-9 d-flex flex-column p-0 ${isDark ? 'bg-dark' : 'bg-light'}`}>
          {/* Заголовок канала */}
          <div className={`p-3 border-bottom ${isDark ? 'bg-dark border-secondary text-light' : 'bg-white text-dark'}`}>
            <h5 className="d-flex justify-content-between align-items-center">
              <span># {currentChannel?.name || 'Выберите канал'}</span>
              <span className={isDark ? 'text-secondary' : 'text-muted small'}>
                {filteredMessages.length} сообщений
              </span>
            </h5>
          </div>

          {/* Список сообщений */}
          <div className={`flex-grow-1 p-3 overflow-auto ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <strong>{msg.username}</strong>: {msg.content}
                </div>
              ))
            ) : (
              <p className={isDark ? 'text-secondary' : 'text-muted'}>Нет сообщений в этом канале</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода сообщения */}
          <div className={`p-3 border-top ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <form onSubmit={handleSendMessage} className="d-flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className={`form-control ${isDark ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border'}`}
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

      <AddChannelModal show={showAddModal} onHide={() => setShowAddModal(false)} />
      <RenameChannelModal
        show={showRenameModal}
        onHide={() => setShowRenameModal(false)}
        channel={selectedChannel}
      />
      <DeleteChannelModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        channel={selectedChannel}
      />
    </div>
  );
}

export default ChatPage;
