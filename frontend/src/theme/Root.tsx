import React, { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { ChefAiFab } from '../components/ai/ChefAiFab';
import { ChefAiDrawer } from '../components/ai/ChefAiDrawer';
import { CommandMenu } from '../components/search/CommandMenu';
import { OfflineBanner } from '../components/system/OfflineBanner';
import { LanguageSelector } from '../components/shared/LanguageSelector';

// The Root component wraps the entire Docusaurus site.
// This is where we should put global providers like I18nextProvider.
export default function Root({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {isMounted && <OfflineBanner />}
      {isMounted && (
        <div className="fixed top-2 right-16 md:right-32 z-[100]">
          <LanguageSelector />
        </div>
      )}
      {children}
      {isMounted && (
        <>
          <ChefAiFab isOpen={isChatOpen} onClick={() => setIsChatOpen(prev => !prev)} />
          <ChefAiDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          <CommandMenu />
        </>
      )}
    </I18nextProvider>
  );
}

