import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import styles from './LanguagePicker.module.css';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', isRTL: true },
];

interface LanguagePickerProps {
  onLanguageSelect?: (languageCode: string) => void;
  selectedLanguage?: string;
  className?: string;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  onLanguageSelect,
  selectedLanguage,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string>(
    selectedLanguage || i18n.language || 'en'
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setSaving(true);
      setError(null);
      setSelectedLang(languageCode);

      // Change language in i18next (instant UI update)
      await i18n.changeLanguage(languageCode);

      // Update HTML dir attribute for RTL languages
      const language = LANGUAGES.find((lang) => lang.code === languageCode);
      if (language) {
        document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = languageCode;
      }

      // Save language preference to backend
      await userService.updateLanguagePreference(languageCode);

      // Call parent callback if provided
      onLanguageSelect?.(languageCode);
    } catch (err) {
      console.error('Error saving language preference:', err);
      setError(t('language.saveError') || 'Failed to save language preference');
      // Revert selection on error
      setSelectedLang(selectedLanguage || i18n.language);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${styles.languagePickerContainer} ${className}`}>
      <h2 className={styles.title}>
        {t('language.selectTitle') || 'Choose Your Language'}
      </h2>
      <p className={styles.subtitle}>
        {t('language.selectSubtitle') || 'Select your preferred language for the cooking experience'}
      </p>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.languageGrid}>
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            className={`${styles.languageButton} ${
              selectedLang === language.code ? styles.selected : ''
            }`}
            disabled={saving}
            aria-label={`${t('language.select') || 'Select'} ${language.name}`}
            dir={language.isRTL ? 'rtl' : 'ltr'}
          >
            <span className={styles.nativeName}>{language.nativeName}</span>
            <span className={styles.englishName}>{language.name}</span>
            {selectedLang === language.code && (
              <span className={styles.checkmark} aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {saving && (
        <div className={styles.savingIndicator}>
          <div className={styles.spinner}></div>
          <span>{t('language.saving') || 'Saving...'}</span>
        </div>
      )}
    </div>
  );
};
