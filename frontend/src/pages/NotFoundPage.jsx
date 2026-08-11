import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="container mt-5 text-center">
      <Link to="/" className="text-decoration-none">
        <h1 className="mb-4" style={{ color: '#0d6efd' }}>{t('app.title')}</h1>
      </Link>
      <h1>{t('notFound.title')}</h1>
      <h2>{t('notFound.subtitle')}</h2>
      <p>{t('notFound.message')}</p>
      <Link to="/" className="btn btn-primary">{t('notFound.back')}</Link>
    </div>
  );
}

export default NotFoundPage;
