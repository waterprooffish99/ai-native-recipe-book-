import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import styles from './TranslateButton.module.css';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', isRTL: false },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', isRTL: true },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', isRTL: true },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', isRTL: false },
  { code: 'fr', label: 'French', nativeLabel: 'Français', isRTL: false },
  { code: 'fa', label: 'Persian', nativeLabel: 'فارسی', isRTL: true },
];

export const TranslateButton: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setSaving(true);

      // Change language in i18next (instant UI update)
      await i18n.changeLanguage(languageCode);

      // Update HTML dir attribute for RTL languages
      const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);
      if (language) {
        document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = languageCode;
      }

      // Save preference to backend
      await userService.updateLanguagePreference(languageCode);

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setSaving(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={styles.translateButtonContainer}>
      <button
        className={styles.translateButtonFloating}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.translateNow') || 'Translate Now'}
        aria-expanded={isOpen}
      >
        <span className={styles.icon}>🌐</span>
        <span className={styles.label}>{t('language.translateNow') || 'Translate'}</span>
      </button>

      {isOpen && (
        <div className={styles.languagePickerModal}>
          <div
            className={styles.languagePickerOverlay}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.languagePickerContent}>
            <div className={styles.modalHeader}>
              <h3>{t('language.selectLanguage') || 'Select Language'}</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label={t('common.close') || 'Close'}
              >
                ✕
              </button>
            </div>
            <div className={styles.languageOptions}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`${styles.languageOption} ${
                    i18n.language === lang.code ? styles.active : ''
                  }`}
                  disabled={saving}
                  dir={lang.isRTL ? 'rtl' : 'ltr'}
                >
                  <span className={styles.nativeLabel}>{lang.nativeLabel}</span>
                  <span className={styles.englishLabel}>({lang.label})</span>
                  {i18n.language === lang.code && (
                    <span className={styles.checkmark} aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
            {saving && (
              <div className={styles.savingIndicator}>
                <div className={styles.spinner}></div>
                <span>{t('common.saving') || 'Saving...'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
