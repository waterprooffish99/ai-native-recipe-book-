import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

export const OfflineBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] py-2 px-4 bg-amber-500/95 text-slate-950 text-center text-xs font-semibold backdrop-blur-sm border-b border-amber-600/30 flex items-center justify-center gap-2 shadow-md transition-all duration-300 animate-fadeIn"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="alert"
    >
      <span className="text-sm">⚠️</span>
      <span>
        {t('system.offline_message', "You are currently offline. Recipes and pages are loaded from cached PWA state.")}
      </span>
    </div>
  );
};

export default OfflineBanner;
