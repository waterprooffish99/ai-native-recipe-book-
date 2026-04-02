import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

// The Root component wraps the entire Docusaurus site.
// This is where we should put global providers like I18nextProvider.
export default function Root({children}) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
