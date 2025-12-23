import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'fa', label: 'فارسی (Persian)' },
];

export const TranslateButton: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    setIsOpen(false);

    // Save preference to backend (will be implemented in User Story 4)
    // await userService.updateProfile({ preferred_language: languageCode });
  };

  return (
    <div className="translate-button-container">
      <button
        className="translate-button-floating"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.translateNow')}
      >
        🌐 {t('language.translateNow')}
      </button>

      {isOpen && (
        <div className="language-picker-modal">
          <div className="language-picker-overlay" onClick={() => setIsOpen(false)} />
          <div className="language-picker-content">
            <h3>{t('language.title')}</h3>
            <div className="language-options">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
