import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import { setMessages, addMessage } from '../slices/messagesSlice';
import axios from '../api/axios';
import useSocket from '../hooks/useSocket';
import rollbar from '../rollbar.js';
import AddChannelModal from '../components/AddChannelModal';
import RenameChannelModal from '../components/RenameChannelModal';
import DeleteChannelModal from '../components/DeleteChannelModal';
import ChannelMenu from '../components/ChannelMenu';
import TestRollbar from '../components/TestRollbar.jsx';
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
      const response = await axios.post('/messages', messageData);
      console.log('📤 Message sent:', response.data);
      setNewMessage('');
      toast.success(t('messages.sendSuccess'));
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
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleTheme}
              title={t('header.themeToggle')}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <TestRollbar />
            {user && (
              <span className={isDark ? 'text-light' : 'text-muted'}>{user.username}</span>
            )}
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              {t('header.logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="row flex-grow-1">
        <div className={`col-3 p-3 border-end ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className={isDark ? 'text-light' : 'text-dark'}>{t('channels.title')}</h5>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
              aria-label={t('channels.add')}
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
              <li className={isDark ? 'text-secondary' : 'text-muted'}>{t('channels.noChannels')}</li>
            )}
          </ul>
          <hr className={isDark ? 'border-secondary' : ''} />
          <div className="mb-2">
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? `🟢 ${t('header.online')}` : `🔴 ${t('header.offline')}`}
            </span>
          </div>
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
                className="btn btn-primary"
                disabled={!newMessage.trim() || !currentChannelId}
              >
                {t('messages.send')}
              </button>
            </form>
            {!isConnected && (
              <small className="text-warning">{t('messages.offline')}</small>
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
