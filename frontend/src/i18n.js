import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.js';

const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: 'ru',
  fallbackLng: 'ru',
  debug: import.meta.env.DEV,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    ru,
  },
});

export default i18n;
