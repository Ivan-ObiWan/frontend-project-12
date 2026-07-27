import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessage } from '../slices/messagesSlice';

const useSocket = (token) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (!token) {
      console.log('❌ No token, skipping socket connection');
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    console.log('🔌 Connecting to socket...');

    const socket = io('http://localhost:5001', {
      path: '/socket.io',
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      setIsConnected(true);

      console.log('📡 Subscribing to channels...');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('newMessage', (message) => {
      console.log('📨 New message via WebSocket:', message);
      dispatch(addMessage(message));
    });

    return () => {
      if (socketRef.current && !socketRef.current.connected) {
        console.log('🔌 Disconnecting socket...');
        socketRef.current.disconnect();
      }
    };
  }, [token, dispatch]);

  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
    }
  }, [isConnected]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  }, []);

  return { socket: socketRef.current, isConnected, emit, reconnect };
};

export default useSocket;
