/**
 * T020: i18next Configuration for 6 Languages
 * Configures internationalization for Global Plate Recipe System
 * Supported languages: EN, UR, AR, ES, FR, FA
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files for each supported language
// These will be populated in Phase 3 (US1 tasks T046-T051)
import enTranslations from '../locales/en.json';
import urTranslations from '../locales/ur.json';
import arTranslations from '../locales/ar.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import faTranslations from '../locales/fa.json';

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Available languages
    supportedLngs: ['en', 'ur', 'ar', 'es', 'fr', 'fa'],

    // Fallback language if detected language is not available
    fallbackLng: 'en',

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',

    // Allow keys to be phrases having `:`, `.`
    nsSeparator: false,
    keySeparator: false,

    // Language detection options
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Translation resources
    resources: {
      en: {
        translation: enTranslations,
      },
      ur: {
        translation: urTranslations,
      },
      ar: {
        translation: arTranslations,
      },
      es: {
        translation: esTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      fa: {
        translation: faTranslations,
      },
    },

    // React options
    react: {
      useSuspense: true,
    },
  });

// RTL (Right-to-Left) language support
const RTL_LANGUAGES = ['ar', 'fa', 'ur'];

/**
 * Check if a language is RTL
 */
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

/**
 * Set document direction based on current language
 */
export const setDocumentDirection = (language: string): void => {
  const dir = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

// Set initial document direction
setDocumentDirection(i18n.language);

// Update document direction on language change
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

export default i18n;
