import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ChatPage() {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mt-5">
      <h1>Hexlet Chat</h1>
      <p>Добро пожаловать в чат!</p>
      <p>Здесь будет список каналов и сообщений</p>
    </div>
  );
}

export default ChatPage;
