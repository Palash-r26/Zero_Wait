import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en.json';
import hiTranslation from './hi.json';
import taTranslation from './ta.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  ta: { translation: taTranslation }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
