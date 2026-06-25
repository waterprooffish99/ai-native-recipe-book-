import React, { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { ClerkProvider } from '@clerk/clerk-react'; // Import Clerk Provider
import i18n from '../i18n/config';
import { ChefAiFab } from '../components/ai/ChefAiFab';
import { ChefAiDrawer } from '../components/ai/ChefAiDrawer';
import { CommandMenu } from '../components/search/CommandMenu';
import { OfflineBanner } from '../components/system/OfflineBanner';
import { LanguageSelector } from '../components/shared/LanguageSelector';
import { initTelemetry } from '../services/telemetryService';

// Safely retrieve Clerk Publishable Key from environment configurations
const CLERK_PUBLISHABLE_KEY = typeof process !== 'undefined' && process.env
  ? process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || ''
  : '';

// Custom dark-mode fallback crash screen matching Global Plate theme
const FallbackComponent = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4">
        <div className="w-12 h-12 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25 flex items-center justify-center text-xl font-bold">
          ⚠️
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-200 leading-none">Something went wrong</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            An unexpected application error occurred. Telemetry has been notified.
          </p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-950 text-[11px] font-mono text-rose-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
          {error?.message || String(error)}
        </div>
        <button
          onClick={resetError}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

// Clerk Auth wrapper with fallback stability when publishable keys are missing
const ClerkAuthProvider = ({ children }: { children: React.ReactNode }) => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SafeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafeErrorBoundary caught an error:', error, errorInfo);
    try {
      Sentry.captureException(error, { extra: { errorInfo } });
    } catch (e) {
      console.warn('Failed to capture exception in Sentry:', e);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <FallbackComponent
          error={this.state.error || new Error('Unknown rendering error')}
          resetError={this.resetError}
        />
      );
    }
    return this.props.children;
  }
}

export default function Root({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize Sentry and PostHog on client mount
    initTelemetry();
  }, []);

  return (
    <SafeErrorBoundary>
      <ClerkAuthProvider>
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
      </ClerkAuthProvider>
    </SafeErrorBoundary>
  );
}



