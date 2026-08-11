import { useState } from 'react';
import { useRollbar } from '@rollbar/react';

function TestRollbar() {
  const rollbar = useRollbar();
  const [shouldThrow, setShouldThrow] = useState(false);

  const sendTestMessage = () => {
    rollbar.info('Тестовое сообщение из React');
    alert('✅ Info отправлено в Rollbar!');
  };

  const triggerError = () => {
    try {
      throw new Error('Тестовая ошибка из React!');
    } catch (error) {
      rollbar.error('Ошибка поймана в catch', error);
      alert('✅ Ошибка отправлена в Rollbar!');
    }
  };

  const triggerErrorBoundary = () => {
    setShouldThrow(true);
  };

  if (shouldThrow) {
    throw new Error('Тестовая ошибка для ErrorBoundary!');
  }

  return (
    <div className="d-flex gap-2">
      <button className="btn btn-info" onClick={sendTestMessage}>
        📝 Тест Info
      </button>
      <button className="btn btn-warning" onClick={triggerError}>
        🧪 Тест Error (catch)
      </button>
      <button className="btn btn-danger" onClick={triggerErrorBoundary}>
        💥 Тест ErrorBoundary
      </button>
    </div>
  );
}

export default TestRollbar;
