import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

// Initialize i18next
const initI18n = () => {
  return i18next
    .use(LanguageDetector)
    .init({
      fallbackLng: 'es',
      debug: true, // Enable debug to see initialization issues
      
      // Language detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      
      // Resources
      resources: {
        es: {
          translation: esTranslations
        },
        en: {
          translation: enTranslations
        }
      },
      
      // Interpolation options
      interpolation: {
        escapeValue: false // React already does escaping
      }
    })
    .then(() => {
      console.log('i18next initialized successfully');
    })
    .catch((error) => {
      console.error('i18next initialization failed:', error);
    });
};

// Export the translation function
export const t = (key, options = {}) => {
  return i18next.t(key, options);
};

// Export language change function
export const changeLanguage = (lng) => {
  return i18next.changeLanguage(lng);
};

// Export current language getter
export const getCurrentLanguage = () => {
  return i18next.language;
};

// Export initialization function
export default initI18n;
