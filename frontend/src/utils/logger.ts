/**
 * Logging utility for frontend applications
 *
 * Provides structured logging for different environments
 */

interface LogOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: string;
  error?: Error | unknown;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatMessage(message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    const level = options?.level?.toUpperCase() || 'INFO';

    return `${timestamp} ${level} ${context} ${message}`;
  }

  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(message, { ...options, level: 'debug' });
      console.debug(formattedMessage, options?.data || options?.error);
    }
  }

  info(message: string, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(message, { ...options, level: 'info' });
    console.info(formattedMessage, options?.data || options?.error);
  }

  warn(message: string, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(message, { ...options, level: 'warn' });
    console.warn(formattedMessage, options?.data || options?.error);
  }

  error(message: string, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(message, { ...options, level: 'error' });

    // In development, always log to console
    if (this.isDevelopment) {
      console.error(formattedMessage, options?.error, options?.data);
    } else {
      // In production, log to console for debugging but also potentially send to logging service
      console.error(formattedMessage, options?.error, options?.data);

      // In a real production app, you might want to send errors to a service like Sentry
      // this.sendToErrorReportingService(message, options);
    }
  }

  private sendToErrorReportingService(message: string, options?: LogOptions): void {
    // This is a placeholder for sending errors to an external service like Sentry
    // Example: Sentry.captureException(options?.error, { message, contexts: options?.data });
    console.log('Error reported to external service:', { message, options });
  }
}

// Create a singleton logger instance
const logger = new Logger();

export default logger;
export type { LogOptions };