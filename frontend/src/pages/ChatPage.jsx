import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { logout } from '../slices/authSlice';
import {
  fetchChannels,
  setCurrentChannel,
  clearError,
} from '../slices/channelsSlice';
import { setMessages } from '../slices/messagesSlice';
import axios from '../api/axios';
import useSocket from '../hooks/useSocket';
import rollbar from '../rollbar.js';
import AddChannelModal from '../components/AddChannelModal';
import RenameChannelModal from '../components/RenameChannelModal';
import DeleteChannelModal from '../components/DeleteChannelModal';
import ChannelMenu from '../components/ChannelMenu';
import { filterText, hasProfanity } from '../utils/filter';

function ChatPage() {
  const { t } = useTranslation();
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

  const prevConnectedRef = useRef(isConnected);

  useEffect(() => {
    if (prevConnectedRef.current !== isConnected) {
      if (!isConnected) {
        toast.warning(t('messages.offline'));
      } else {
        toast.success('🟢 Соединение восстановлено!');
      }
      prevConnectedRef.current = isConnected;
    }
  }, [isConnected, t]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    toast.info(t('header.logout'));
  }, [dispatch, t]);

  const handleChannelSwitch = useCallback((channelId) => {
    dispatch(setCurrentChannel(channelId));
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const isNetworkError = (err) => {
    return !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const loadChannels = async () => {
      if (!token) return;
      
      try {
        await dispatch(fetchChannels()).unwrap();
      } catch (err) {
        console.error('❌ Error fetching channels:', err);
        rollbar.error('Error fetching channels', err);
        if (isNetworkError(err)) {
          toast.error(t('errors.networkError'));
        } else {
          toast.error(t('errors.loadChannels'));
        }
      }
    };
    
    loadChannels();
  }, [dispatch, token, t]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChannelId) return;
      try {
        const response = await axios.get('/messages');
        const messagesData = response.data.data || [];
        const filteredMessagesData = messagesData.map((msg) => ({
          ...msg,
          content: filterText(msg.content),
        }));
        dispatch(setMessages(filteredMessagesData));
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
        rollbar.error('Error fetching messages', err);
        if (isNetworkError(err)) {
          toast.error(t('errors.networkError'));
        } else {
          toast.error(t('errors.loadMessages'));
        }
      }
    };
    fetchMessages();
  }, [dispatch, currentChannelId, t]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentChannelId) return;

    if (hasProfanity(newMessage)) {
      toast.warning('Сообщение содержит нецензурные слова и было отфильтровано');
      rollbar.info('Profanity blocked', { message: newMessage });
      setNewMessage('');
      return;
    }

    const messageData = {
      channelId: currentChannelId,
      content: newMessage.trim(),
    };

    try {
      // Отправляем сообщение на сервер
      await axios.post('/messages', messageData);
      // Очищаем поле ввода
      setNewMessage('');
      // Показываем уведомление об успешной отправке
      toast.success(t('messages.sendSuccess'));
      // НЕ ДОБАВЛЯЕМ сообщение локально — оно придёт через WebSocket
    } catch (err) {
      console.error('❌ Error sending message:', err);
      rollbar.error('Error sending message', err);
      if (isNetworkError(err)) {
        toast.error(t('errors.networkError'));
      } else {
        toast.error(t('errors.sendMessage'));
      }
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
        <h3>{t('auth.loading')}</h3>
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
          {t('errors.retry')}
        </button>
      </div>
    );
  }

  const currentChannel = channels.find((c) => c.id === currentChannelId);

  return (
    <div className={`container-fluid vh-100 d-flex flex-column ${isDark ? 'bg-dark text-white' : 'bg-light'}`}>
      <nav className={`navbar ${isDark ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} border-bottom`}>
        <div className="container-fluid">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <span>{t('app.title')}</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center rounded-circle"
              onClick={toggleTheme}
              title={t('header.themeToggle')}
              style={{ width: '36px', height: '36px', padding: 0, border: '1px solid #6c757d' }}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 8 13zM2.343 1.343a.5.5 0 0 1 .707 0l.707.707a.5.5 0 0 1-.707.707l-.707-.707a.5.5 0 0 1 0-.707zm10.607 10.607a.5.5 0 0 1 .707 0l.707.707a.5.5 0 0 1-.707.707l-.707-.707a.5.5 0 0 1 0-.707zM0 8a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 0 8zm13 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 13 8zM1.343 13.657a.5.5 0 0 1 0-.707l.707-.707a.5.5 0 0 1 .707.707l-.707.707a.5.5 0 0 1-.707 0zm10.607-10.607a.5.5 0 0 1 0-.707l.707-.707a.5.5 0 0 1 .707.707l-.707.707a.5.5 0 0 1-.707 0z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/>
                </svg>
              )}
            </button>
            {user && (
              <span className={isDark ? 'text-light' : 'text-muted'}>{user.username}</span>
            )}
            <button 
              className="btn btn-outline-danger d-flex align-items-center justify-content-center rounded-circle"
              onClick={handleLogout}
              style={{ width: '36px', height: '36px', padding: 0 }}
              title={t('header.logout')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 1.5h-8A1.5 1.5 0 0 0 0 3v9a1.5 1.5 0 0 0 1.5 1.5h8A1.5 1.5 0 0 0 11 12.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="row flex-grow-1">
        <div 
          className={`col-3 p-3 border-end ${
            isDark 
              ? 'bg-secondary bg-opacity-25 border-secondary' 
              : 'bg-secondary bg-opacity-10'
          }`}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className={`mb-0 ${isDark ? 'text-secondary' : 'text-muted'}`}>{t('channels.title')}</h6>
            <button 
              className="btn btn-link p-0 text-secondary"
              onClick={() => setShowAddModal(true)}
              aria-label={t('channels.add')}
              style={{ textDecoration: 'none', fontSize: '18px' }}
            >
              +
            </button>
          </div>
          <ul className="list-unstyled">
            {channels && channels.length > 0 ? (
              channels.map((channel) => (
                <li key={channel.id} className="d-flex align-items-center mb-1">
                  <button
                    className={`btn w-100 text-start d-flex justify-content-between align-items-center ${
                      currentChannelId === channel.id
                        ? isDark ? 'bg-secondary text-light' : 'bg-secondary bg-opacity-25 text-dark'
                        : isDark ? 'text-light' : 'text-dark'
                    }`}
                    onClick={() => handleChannelSwitch(channel.id)}
                    style={{
                      backgroundColor: currentChannelId === channel.id 
                        ? (isDark ? '#3a3a4a' : '#e9ecef')
                        : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: currentChannelId === channel.id ? '500' : '400',
                    }}
                  >
                    <span># {channel.name}</span>
                    {currentChannelId === channel.id && (
                      <ChannelMenu
                        channel={channel}
                        onRename={handleRename}
                        onDelete={handleDelete}
                      />
                    )}
                  </button>
                </li>
              ))
            ) : (
              <li className={isDark ? 'text-secondary' : 'text-muted'}>{t('channels.noChannels')}</li>
            )}
          </ul>
          <hr className={isDark ? 'border-secondary' : ''} />
        </div>

        <div className={`col-9 d-flex flex-column p-0 ${isDark ? 'bg-dark' : 'bg-light'}`}>
          <div className={`p-3 border-bottom ${isDark ? 'bg-dark border-secondary text-light' : 'bg-white text-dark'}`}>
            <h5 className="d-flex justify-content-between align-items-center">
              <span># {currentChannel?.name || t('channels.defaultChannel')}</span>
              <span className={isDark ? 'text-secondary' : 'text-muted small'}>
                {t('channels.messagesCount', { count: filteredMessages.length })}
              </span>
            </h5>
          </div>

          <div className={`flex-grow-1 p-3 overflow-auto ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <strong>{msg.username}</strong>: {msg.content}
                </div>
              ))
            ) : (
              <p className={isDark ? 'text-secondary' : 'text-muted'}>{t('messages.noMessages')}</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-3 border-top ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <form onSubmit={handleSendMessage} className="d-flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className={`form-control ${isDark ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border'}`}
                placeholder={t('messages.placeholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!currentChannelId}
              />
              <button 
                type="submit" 
                className="btn btn-primary d-flex align-items-center justify-content-center rounded-circle"
                disabled={!newMessage.trim() || !currentChannelId}
                style={{ width: '38px', height: '38px', padding: 0, flexShrink: 0 }}
                title={t('messages.send')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
              </button>
            </form>
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
