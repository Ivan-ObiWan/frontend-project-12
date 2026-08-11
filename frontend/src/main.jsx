import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import App from './App.jsx';
import { store } from './store.js';
import i18n from './i18n.js';
import rollbarConfig from './rollbar.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const FallbackUI = () => (
  <div className="container mt-5 text-center">
    <h1>Что-то пошло не так</h1>
    <p className="text-muted">Мы уже работаем над исправлением</p>
    <button className="btn btn-primary" onClick={() => window.location.reload()}>
      Обновить страницу
    </button>
  </div>
);

function Root() {
  return (
    <StrictMode>
      <ReduxProvider store={store}>
        <I18nextProvider i18n={i18n}>
          <RollbarProvider config={rollbarConfig}>
            <ErrorBoundary fallbackUI={FallbackUI}>
              <BrowserRouter>
                <App />
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme={localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'}
                />
              </BrowserRouter>
            </ErrorBoundary>
          </RollbarProvider>
        </I18nextProvider>
      </ReduxProvider>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Root />);

export default Root;
