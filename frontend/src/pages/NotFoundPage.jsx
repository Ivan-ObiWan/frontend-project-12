import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="container mt-5 text-center">
      <h1>{t('notFound.title')}</h1>
      <h2>{t('notFound.subtitle')}</h2>
      <p>{t('notFound.message')}</p>
      <Link to="/" className="btn btn-primary">{t('notFound.back')}</Link>
    </div>
  );
}

export default NotFoundPage;
