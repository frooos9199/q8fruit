import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../public/locales/ar/common.json';
import en from '../public/locales/en/common.json';
import bn from '../public/locales/bn/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
      bn: { translation: bn },
    },
    fallbackLng: 'ar',
    lng: 'ar',
    supportedLngs: ['ar', 'en', 'bn'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
