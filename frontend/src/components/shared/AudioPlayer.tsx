import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AudioPlayerProps {
  src: string;
  voiceName: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, voiceName, className = '' }) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

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
        onEnded={handleEnded}
        onError={handleError}
      />
      <button
        onClick={handlePlay}
        disabled={isPlaying}
        className="audio-play-button"
      >
        {error ? t('voices.retry') : isPlaying ? t('voices.playing') : t('voices.playSample')}
      </button>
    </div>
  );
};
