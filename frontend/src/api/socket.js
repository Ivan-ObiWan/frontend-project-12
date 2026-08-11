import io from 'socket.io-client';

export const createSocket = (token) => {
  if (!token) return null;

  const socket = io('http://localhost:5001', {
    path: '/socket.io',
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export default createSocket;
