import { useState, useEffect, useRef } from 'react';

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasSupport: boolean;
  permissionError: string | null;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const hasSupport = typeof window !== 'undefined' && 
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (!hasSupport) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setPermissionError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone permission denied.');
      } else if (event.error === 'no-speech') {
        // Suppress no-speech error state since the user might just be pausing
      } else {
        setPermissionError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const currentTranscript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      setTranscript(currentTranscript);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [hasSupport]);

  const startListening = () => {
    if (!hasSupport) return;
    setTranscript('');
    setPermissionError(null);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  const stopListening = () => {
    if (!hasSupport) return;
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error('Failed to stop recognition:', e);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasSupport,
    permissionError,
  };
};
