import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container mt-5 text-center">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Извините, такой страницы не существует.</p>
      <Link to="/" className="btn btn-primary">Вернуться в чат</Link>
    </div>
  );
}

export default NotFoundPage;
