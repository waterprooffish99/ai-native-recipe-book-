import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import urTranslations from '../locales/ur.json';
import arTranslations from '../locales/ar.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import faTranslations from '../locales/fa.json';

// RTL languages list
const RTL_LANGUAGES = ['ar', 'ur', 'fa'];

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ur: { translation: urTranslations },
      ar: { translation: arTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
      fa: { translation: faTranslations },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ur', 'ar', 'es', 'fr', 'fa'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'global_plate_language',
    },
  });

// Update HTML dir attribute for RTL languages
i18n.on('languageChanged', (lng) => {
  const isRTL = RTL_LANGUAGES.includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial dir attribute
const initialLang = i18n.language;
const isInitialRTL = RTL_LANGUAGES.includes(initialLang);
document.documentElement.dir = isInitialRTL ? 'rtl' : 'ltr';
document.documentElement.lang = initialLang;

export default i18n;
