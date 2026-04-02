/**
 * T020: i18next Configuration for 6 Languages
 * Configures internationalization for Global Plate Recipe System
 * Supported languages: EN, UR, AR, ES, FR, FA
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files for each supported language
// These will be populated in Phase 3 (US1 tasks T046-T051) for recipes
import enTranslations from '../locales/recipes/en.json';
import urTranslations from '../locales/recipes/ur.json';
import arTranslations from '../locales/recipes/ar.json';
import esTranslations from '../locales/recipes/es.json';
import frTranslations from '../locales/recipes/fr.json';
import faTranslations from '../locales/recipes/fa.json';

// Import metaphor translation files for personalization
// These will be populated in Phase 4 (US2 tasks T075-T080) for metaphors
import enMetaphorTranslations from '../locales/metaphors/en.json';
import urMetaphorTranslations from '../locales/metaphors/ur.json';
import arMetaphorTranslations from '../locales/metaphors/ar.json';
import esMetaphorTranslations from '../locales/metaphors/es.json';
import frMetaphorTranslations from '../locales/metaphors/fr.json';
import faMetaphorTranslations from '../locales/metaphors/fa.json';

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Initialize react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    supportedLngs: ['en', 'ur', 'ar', 'es', 'fr', 'fa'],
    fallbackLng: 'en',
    debug: (typeof process !== 'undefined' && process.env) ? process.env.NODE_ENV === 'development' : false,
    nsSeparator: false,
    keySeparator: false,
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: { ...enTranslations, metaphors: enMetaphorTranslations }
      },
      ur: {
        translation: { ...urTranslations, metaphors: urMetaphorTranslations }
      },
      ar: {
        translation: { ...arTranslations, metaphors: arMetaphorTranslations }
      },
      es: {
        translation: { ...esTranslations, metaphors: esMetaphorTranslations }
      },
      fr: {
        translation: { ...frTranslations, metaphors: frMetaphorTranslations }
      },
      fa: {
        translation: { ...faTranslations, metaphors: faMetaphorTranslations }
      },
    },
    react: {
      useSuspense: false, // Recommended for some SSR/Static environments like Docusaurus
    },
  });

// Debug: ensure translations are loaded
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  console.log('i18n initialized with languages:', i18n.languages);
}

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
