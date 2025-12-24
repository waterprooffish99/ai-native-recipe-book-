import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
      await audioRef.current?.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio playback failed:', err);
      setError(true);
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setError(true);
    setIsPlaying(false);
  };

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
      />
      <button
        onClick={handlePlay}
        disabled={isPlaying || isLoading}
        className="audio-play-button"
      >
        {isLoading
          ? t('voices.loading') || 'Loading...'
          : error
          ? t('voices.retry') || 'Retry'
          : isPlaying
          ? t('voices.playing') || 'Playing...'
          : t('voices.playSample') || 'Play Sample'}
      </button>
    </div>
  );
};
