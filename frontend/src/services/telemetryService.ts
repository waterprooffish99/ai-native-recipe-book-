import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

// Environment variable retrieval with fallbacks
const SENTRY_DSN = typeof process !== 'undefined' && process.env
  ? process.env.VITE_SENTRY_DSN || process.env.REACT_APP_SENTRY_DSN || ''
  : '';

const POSTHOG_KEY = typeof process !== 'undefined' && process.env
  ? process.env.VITE_POSTHOG_KEY || process.env.REACT_APP_POSTHOG_KEY || ''
  : '';

const POSTHOG_HOST = typeof process !== 'undefined' && process.env
  ? process.env.VITE_POSTHOG_HOST || process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com'
  : 'https://app.posthog.com';

/**
 * Initializes Sentry & PostHog in a non-blocking client-side context (SSR-Safe)
 */
export const initTelemetry = (): void => {
  if (typeof window === 'undefined') return;

  // Initialize Sentry Browser SDK
  if (SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0, // Capture 100% of transaction paths in staging
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      console.log('📊 Sentry Telemetry initialized successfully');
    } catch (err) {
      console.error('Failed to initialize Sentry:', err);
    }
  }

  // Initialize PostHog Product Analytics SDK
  if (POSTHOG_KEY) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        loaded: (ph) => {
          if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
            ph.opt_out_capturing(); // Skip capture in local dev
          }
          console.log('🚀 PostHog Analytics initialized successfully');
        },
        autocapture: true,
        capture_pageview: true,
      });
    } catch (err) {
      console.error('Failed to initialize PostHog:', err);
    }
  }
};

/**
 * Capture custom analytics event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  if (typeof window !== 'undefined' && posthog) {
    try {
      posthog.capture(eventName, properties);
    } catch (err) {
      console.error(`Failed to track event ${eventName}:`, err);
    }
  }
};

/**
 * Log manually captured errors to Sentry
 */
export const logError = (error: any, context?: string): void => {
  if (typeof window !== 'undefined' && Sentry) {
    try {
      Sentry.captureException(error, {
        extra: { context },
      });
    } catch (err) {
      console.error('Failed to log error to Sentry:', err);
    }
  }
};
