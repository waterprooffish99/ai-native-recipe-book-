import React from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL, setDocumentDirection } from '../../i18n/config';

export const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').toUpperCase();

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value.toLowerCase();
    await i18n.changeLanguage(selectedLang);
    setDocumentDirection(selectedLang);
    localStorage.setItem('i18nextLng', selectedLang);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-md backdrop-blur-sm min-h-[44px]">
      <span className="text-slate-300 text-sm" role="img" aria-label="Language">🌐</span>
      <select
        id="global-language-select"
        value={currentLang}
        onChange={handleLanguageChange}
        className="bg-transparent text-white border-none text-sm font-semibold focus:ring-0 focus:outline-none cursor-pointer pr-8"
        dir="ltr" // Keep English options LTR
      >
        <option value="EN" className="bg-slate-800 text-white font-medium">English (EN)</option>
        <option value="UR" className="bg-slate-800 text-white font-medium">Urdu (UR)</option>
        <option value="AR" className="bg-slate-800 text-white font-medium">Arabic (AR)</option>
        <option value="ES" className="bg-slate-800 text-white font-medium">Spanish (ES)</option>
        <option value="FR" className="bg-slate-800 text-white font-medium">French (FR)</option>
        <option value="FA" className="bg-slate-800 text-white font-medium">Persian (FA)</option>
      </select>
    </div>
  );
};
