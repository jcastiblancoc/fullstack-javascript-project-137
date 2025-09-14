import i18next from 'i18next';
import es from './locales/es.js';
import en from './locales/en.js';

export default () => {
  const i18n = i18next.createInstance();

  return i18n.init({
    lng: 'es',
    debug: false,
    resources: {
      es,
      en,
    },
  });
};
