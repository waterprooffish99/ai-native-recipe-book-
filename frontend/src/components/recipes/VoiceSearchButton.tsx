/**
 * T109: VoiceSearchButton Component
 * Reusable voice search button with Web Speech API integration
 * Provides visual feedback during listening state with accessibility support
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface VoiceSearchButtonProps {
  onVoiceSearch: (transcript: string) => void;
  language?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onVoiceSearch,
  language = 'en-US',
  disabled = false,
  size = 'md'
}) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    // Check for browser support (Web Speech API)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onVoiceSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        
        // Map error codes to user-friendly messages
        const errorMessages: { [key: string]: string } = {
          'no-speech': t('voice.error.noSpeech', 'No speech detected. Please try again.'),
          'audio-capture': t('voice.error.noMicrophone', 'No microphone found. Please check your microphone.'),
          'not-allowed': t('voice.error.permissionDenied', 'Microphone permission denied. Please enable microphone access.'),
          'network': t('voice.error.network', 'Network error. Please check your connection.'),
        };
        
        setError(errorMessages[event.error] || t('voice.error.generic', 'Voice recognition error'));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError(t('voice.error.notSupported', 'Voice search is not supported in this browser'));
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [language, onVoiceSearch, t]);

  const handleClick = () => {
    if (disabled) {
      return;
    }

    if (!recognitionRef.current) {
      setError(t('voice.error.notSupported', 'Voice search not supported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setIsListening(false);
        setError(t('voice.error.startFailed', 'Failed to start voice recognition'));
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'min-w-[36px] min-h-[36px] p-2',
    md: 'min-w-[44px] min-h-[44px] p-3',
    lg: 'min-w-[56px] min-h-[56px] p-4'
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-2
          flex
          items-center
          justify-center
          transition-all
          duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:ring-offset-2
          ${disabled
            ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
            : isListening
              ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-400 dark:text-red-200 animate-pulse'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
          }
        `}
        aria-label={isListening ? t('voice.listening', 'Listening...') : t('voice.search', 'Voice search')}
        aria-pressed={isListening}
        title={isListening ? t('voice.listening', 'Listening...') : t('voice.search', 'Voice search')}
      >
        {/* Microphone icon */}
        {isListening ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
            {/* Sound waves animation */}
            <line x1="4" y1="10" x2="2" y2="10" className="animate-ping" />
            <line x1="22" y1="10" x2="20" y2="10" className="animate-ping" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {/* Error tooltip */}
      {error && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded shadow-lg whitespace-nowrap z-50"
          role="alert"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:text-red-200"
            aria-label={t('common.dismiss', 'Dismiss')}
          >
            ×
          </button>
        </div>
      )}

      {/* Listening indicator text */}
      {isListening && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-sm text-red-600 dark:text-red-400 whitespace-nowrap">
          {t('voice.listening', 'Listening...')}
        </div>
      )}
    </div>
  );
};

export default VoiceSearchButton;
