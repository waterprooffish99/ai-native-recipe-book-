import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// RTL languages list
const RTL_LANGUAGES = ['ar', 'ur', 'fa'];

// Configure i18next with dynamic loading
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Initialize with empty resources to load them dynamically
    resources: {},
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
    // Load resources lazily
    lng: undefined, // Will be detected by LanguageDetector
    load: 'languageOnly', // Only load language, not namespaces
  });

// Function to load translation resources dynamically
const loadTranslation = async (lng: string) => {
  if (i18n.hasResourceBundle(lng, 'translation')) {
    // Already loaded
    return;
  }

  try {
    let translation;
    switch (lng) {
      case 'en':
        translation = await import('../locales/en.json');
        break;
      case 'ur':
        translation = await import('../locales/ur.json');
        break;
      case 'ar':
        translation = await import('../locales/ar.json');
        break;
      case 'es':
        translation = await import('../locales/es.json');
        break;
      case 'fr':
        translation = await import('../locales/fr.json');
        break;
      case 'fa':
        translation = await import('../locales/fa.json');
        break;
      default:
        translation = await import('../locales/en.json'); // fallback to English
        lng = 'en';
    }

    // Add the loaded translation to i18next
    i18n.addResourceBundle(lng, 'translation', translation.default, true, true);
  } catch (error) {
    console.error(`Failed to load translation for language: ${lng}`, error);
    // Fallback to English if the language fails to load
    if (lng !== 'en') {
      const fallbackTranslation = await import('../locales/en.json');
      i18n.addResourceBundle('en', 'translation', fallbackTranslation.default, true, true);
    }
  }
};

// Load translation when language changes
i18n.on('languageChanged', async (lng) => {
  await loadTranslation(lng);

  const isRTL = RTL_LANGUAGES.includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Load initial translation if needed
if (i18n.language && !i18n.hasResourceBundle(i18n.language, 'translation')) {
  loadTranslation(i18n.language).then(() => {
    const isRTL = RTL_LANGUAGES.includes(i18n.language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  });
} else {
  // Set initial dir attribute for already detected language
  const initialLang = i18n.language;
  const isInitialRTL = RTL_LANGUAGES.includes(initialLang);
  document.documentElement.dir = isInitialRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;
}

export default i18n;
