import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import logger from '../../utils/logger';

interface AudioPlayerProps {
  src: string;
  voiceName: string;
  className?: string;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  voiceName,
  className = '',
  onLoadStart,
  onCanPlay
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Reset error state when src changes
    setError(false);
    setIsPlaying(false);
    setRetryCount(0);
  }, [src]);

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    onCanPlay?.();
  };

  const handlePlay = async () => {
    try {
      setError(false);
      setIsLoading(true);

      // Try to play the audio
      const playPromise = audioRef.current?.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (err) {
      logger.error('Audio playback failed:', {
        context: 'AudioPlayer.handlePlay',
        error: err,
        data: { voiceName, src }
      });
      setIsLoading(false);

      // Check if we should retry
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handlePlay(); // Try again after a short delay
        }, 1000); // 1 second delay before retry
      } else {
        setError(true);
        setIsPlaying(false);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setError(true);
    setIsPlaying(false);
  };

  const handleRetry = () => {
    setError(false);
    setRetryCount(0);
    handlePlay();
  };

  // Determine button text and functionality based on state
  let buttonText = '';
  let buttonAction = handlePlay;
  let buttonDisabled = isPlaying || isLoading;

  if (isLoading) {
    buttonText = t('voices.loading') || 'Loading...';
    buttonDisabled = true;
  } else if (error) {
    buttonText = t('voices.retry') || 'Retry';
    buttonAction = handleRetry;
    buttonDisabled = false;
  } else if (isPlaying) {
    buttonText = t('voices.playing') || 'Playing...';
    buttonDisabled = true;
  } else {
    buttonText = t('voices.playSample') || 'Play Sample';
  }

  return (
    <div className={`audio-player ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        aria-label={`${t('voices.playSample') || 'Play'} ${voiceName} sample`}
      />
      <button
        onClick={buttonAction}
        disabled={buttonDisabled}
        className="audio-play-button"
        aria-busy={isLoading ? 'true' : 'false'}
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="sr-only">{t('voices.loading') || 'Loading...'}</span>
          </>
        ) : (
          <>
            {buttonText}
            {error && retryCount > 0 && (
              <span className="retry-count" aria-label={`(${retryCount} of ${maxRetries} retries)`}>
                ({retryCount}/{maxRetries})
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
