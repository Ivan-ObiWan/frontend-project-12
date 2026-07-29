import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
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
  const { channels, currentChannelId, isLoading, error } = useSelector(
    (state) => state.channels
  );
  const { messages } = useSelector((state) => state.messages);

  console.log('🔍 ChatPage render:');
  console.log('  🔑 token:', token ? token.substring(0, 20) + '...' : 'null');
  console.log('  📡 channels:', channels);
  console.log('  🆔 currentChannelId:', currentChannelId);

  const [newMessage, setNewMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  
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
    console.log('🔄 Switching to channel:', channelId);
    dispatch(setCurrentChannel(channelId));
  }, [dispatch]);

  // Загрузка каналов
  useEffect(() => {
    console.log('🔄 useEffect [fetchChannels] triggered');
    console.log('  🔑 token:', token ? 'exists' : 'null');
    if (token) {
      console.log('📡 Calling fetchChannels...');
      dispatch(fetchChannels())
        .unwrap()
        .then((result) => {
          console.log('✅ fetchChannels result:', result);
        })
        .catch((err) => {
          console.error('❌ fetchChannels error:', err);
        });
    } else {
      console.log('⏳ No token, skipping fetchChannels');
    }
  }, [dispatch, token]);

  // Загрузка сообщений при выборе канала
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChannelId) {
        console.log('⏳ No currentChannelId, skipping messages fetch');
        return;
      }
      console.log('📨 Fetching messages for channel:', currentChannelId);
      try {
        const response = await axios.get('/messages');
        const messagesData = response.data.data || [];
        console.log('📨 Messages loaded:', messagesData.length);
        dispatch(setMessages(messagesData));
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [dispatch, currentChannelId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentChannelId) {
      console.log('❌ Cannot send: no message or channel');
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

  const handleRename = (channel) => {
    console.log('✏️ Rename channel:', channel);
    setSelectedChannel(channel);
    setShowRenameModal(true);
  };

  const handleDelete = (channel) => {
    console.log('🗑️ Delete channel:', channel);
    setSelectedChannel(channel);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentChannelId]);

  // Если нет токена — редирект
  if (!token) {
    console.log('🚫 No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Если загрузка
  if (isLoading) {
    console.log('⏳ Loading...');
    return (
      <div className="container mt-5 text-center">
        <h3>Загрузка...</h3>
      </div>
    );
  }

  // Если ошибка
  if (error) {
    console.log('❌ Error:', error);
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

  // Если каналы не загрузились
  if (!channels || channels.length === 0) {
    console.log('📡 No channels loaded yet');
    return (
      <div className="container mt-5 text-center">
        <h3>Нет каналов</h3>
        <p className="text-muted">Попробуйте обновить страницу</p>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => {
            console.log('🔄 Manual reload clicked');
            dispatch(fetchChannels());
          }}
        >
          Загрузить каналы
        </button>
      </div>
    );
  }

  console.log('✅ Rendering chat with', channels.length, 'channels');

  const currentChannel = channels.find((c) => c.id === currentChannelId);

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-3 bg-light p-3 border-end">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Каналы</h5>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                console.log('➕ Add channel button clicked');
                setShowAddModal(true);
              }}
            >
              +
            </button>
          </div>
          <ul className="list-unstyled">
            {channels.map((channel) => (
              <li key={channel.id} className="d-flex align-items-center mb-1">
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
                {currentChannelId === channel.id && (
                  <ChannelMenu
                    channel={channel}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                )}
              </li>
            ))}
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
              # {currentChannel?.name || 'Выберите канал'}
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
