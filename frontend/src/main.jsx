import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './store.js';
import 'bootstrap/dist/css/bootstrap.min.css';

// Добавляем глобальные стили
const globalStyles = `
  body {
    background: #0a0a0f !important;
    margin: 0;
    padding: 0;
  }
  .form-control:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
  }
  .card {
    background: rgba(15, 15, 25, 0.9) !important;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
