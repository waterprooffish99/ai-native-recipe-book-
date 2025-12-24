import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioPlayer } from '../shared/AudioPlayer';
import userService from '../../services/userService';
import styles from './VoiceSelector.module.css';

interface VoicePersonality {
  id: string;
  name: string;
  gender: string;
  personality_description: string;
  audio_sample_url: string;
  cultural_appropriateness?: string;
}

interface VoiceSelectorProps {
  onVoiceSelect?: (voiceId: string) => void;
  selectedVoice?: string;
  className?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  onVoiceSelect,
  selectedVoice,
  className = '',
}) => {
  const { t } = useTranslation();
  const [voices, setVoices] = useState<VoicePersonality[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>(selectedVoice);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use userService to fetch voices
      const data = await userService.getVoices();
      setVoices(data);
    } catch (err) {
      console.error('Error fetching voices:', err);
      setError(t('voices.fetchError') || 'Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = async (voiceId: string) => {
    try {
      setSaving(true);
      setSelectedVoiceId(voiceId);

      // Save voice preference to backend
      await userService.updateVoicePreference(voiceId);

      // Call parent callback if provided
      onVoiceSelect?.(voiceId);
    } catch (err) {
      console.error('Error saving voice preference:', err);
      setError(t('voices.saveError') || 'Failed to save voice preference');
      // Revert selection on error
      setSelectedVoiceId(selectedVoice);
    } finally {
      setSaving(false);
    }
  };

  const handleAudioLoadStart = (voiceId: string) => {
    setAudioLoading((prev) => ({ ...prev, [voiceId]: true }));
  };

  const handleAudioLoaded = (voiceId: string) => {
    setAudioLoading((prev) => ({ ...prev, [voiceId]: false }));
  };

  if (loading) {
    return (
      <div className={`${styles.voiceSelectorContainer} ${className}`}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>{t('voices.loading') || 'Loading voice personalities...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.voiceSelectorContainer} ${className}`}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchVoices} className={styles.retryButton}>
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.voiceSelectorContainer} ${className}`}>
      <h2 className={styles.title}>{t('voices.selectTitle') || 'Choose Your Kitchen Partner'}</h2>
      <p className={styles.subtitle}>
        {t('voices.selectSubtitle') || 'Select an AI voice that will guide you through recipes'}
      </p>

      <div className={styles.voiceGrid}>
        {voices.map((voice) => (
          <div
            key={voice.id}
            className={`${styles.voiceCard} ${
              selectedVoiceId === voice.id ? styles.selected : ''
            }`}
          >
            <div className={styles.voiceHeader}>
              <h3 className={styles.voiceName}>{voice.name}</h3>
              <span className={styles.voiceGender}>{voice.gender}</span>
            </div>

            <p className={styles.voiceDescription}>{voice.personality_description}</p>

            {voice.cultural_appropriateness && (
              <p className={styles.culturalNote}>{voice.cultural_appropriateness}</p>
            )}

            {/* Audio preview with loading spinner */}
            <div className={styles.audioSection}>
              {audioLoading[voice.id] && (
                <div className={styles.audioLoadingSpinner}>
                  <div className={styles.smallSpinner}></div>
                  <span>{t('voices.loadingAudio') || 'Loading...'}</span>
                </div>
              )}
              <AudioPlayer
                src={voice.audio_sample_url}
                voiceName={voice.name}
                className={styles.audioPlayer}
                onLoadStart={() => handleAudioLoadStart(voice.id)}
                onCanPlay={() => handleAudioLoaded(voice.id)}
              />
            </div>

            {/* Mobile-friendly large selection button */}
            <button
              onClick={() => handleVoiceSelect(voice.id)}
              className={`${styles.selectButton} ${
                selectedVoiceId === voice.id ? styles.selectedButton : ''
              }`}
              disabled={saving}
              aria-label={`${t('voices.selectVoice') || 'Choose'} ${voice.name}`}
            >
              {saving && selectedVoiceId === voice.id
                ? t('voices.saving') || 'Saving...'
                : selectedVoiceId === voice.id
                ? t('voices.selected') || '✓ Selected'
                : t('voices.chooseThisVoice') || 'Choose This Voice'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
