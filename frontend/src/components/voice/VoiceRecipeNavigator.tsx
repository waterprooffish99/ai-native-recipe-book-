/**
 * T059: VoiceRecipeNavigator Component
 * Provides voice navigation support for recipes with accessibility features
 */

import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../../services/recipeService';
import { useTranslation } from 'react-i18next';

interface VoiceRecipeNavigatorProps {
  recipe: Recipe;
  onStepChange?: (stepIndex: number) => void;
}

const VoiceRecipeNavigator: React.FC<VoiceRecipeNavigatorProps> = ({ recipe, onStepChange }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // Will be updated based on recipe language

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();

        // Handle voice commands
        if (transcript.includes('next') || transcript.includes('next step')) {
          goToNextStep();
        } else if (transcript.includes('previous') || transcript.includes('last step')) {
          goToPreviousStep();
        } else if (transcript.includes('repeat') || transcript.includes('again')) {
          speakCurrentStep();
        }

        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakCurrentStep = () => {
    if (recipe.steps && recipe.steps[currentStep]) {
      // Speak Kitchen Guard first if available and it's the first step
      if (currentStep === 0 && recipe.kitchen_guard) {
        speakText(`${t('recipe.kitchenGuard.title', 'Kitchen Guard')}! ${recipe.kitchen_guard}`);
      } else {
        const step = recipe.steps[currentStep];
        speakText(`${t('recipe.steps.step', 'Step')} ${step.step_number}: ${step.instruction}`);
      }
    }
  };

  const goToNextStep = () => {
    if (recipe.steps && currentStep < recipe.steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (onStepChange) onStepChange(newStep);

      // Speak the next step
      setTimeout(() => speakCurrentStep(), 100);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (onStepChange) onStepChange(newStep);

      // Speak the previous step
      setTimeout(() => speakCurrentStep(), 100);
    }
  };

  const startVoiceNavigation = () => {
    // Announce the recipe and start with Kitchen Guard if available
    let introText = `${recipe.name} from ${recipe.origin_country}. `;

    if (recipe.kitchen_guard) {
      introText += `${t('recipe.kitchenGuard.title', 'Kitchen Guard')}! ${recipe.kitchen_guard}. `;
    }

    introText += `Starting recipe navigation. ${t('recipe.steps.step', 'Step')} 1: ${recipe.steps && recipe.steps[0] ? recipe.steps[0].instruction : ''}`;

    speakText(introText);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(t('recipe.voice.notSupported', 'Voice commands are not supported in this browser'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Update language based on recipe
      if (recognitionRef.current) {
        recognitionRef.current.lang = recipe.language || 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  return (
    <div className="voice-navigator-container bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('recipe.voice.navigation', 'Voice Navigation')}
      </h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={startVoiceNavigation}
          disabled={isSpeaking}
          className={`
            px-4
            py-2
            rounded-lg
            flex
            items-center
            gap-2
            transition-colors
            min-w-[44px]
            min-h-[44px]
            ${isSpeaking
              ? 'bg-blue-400 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
            disabled:opacity-50
          `}
          aria-label={isSpeaking
            ? t('recipe.voice.speaking', 'Currently speaking')
            : t('recipe.voice.startNavigation', 'Start voice navigation')
          }
        >
          {isSpeaking ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              {t('recipe.voice.speaking', 'Speaking...')}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {t('recipe.voice.start', 'Start')}
            </>
          )}
        </button>

        <button
          onClick={toggleListening}
          disabled={!recognitionRef.current || isListening}
          className={`
            px-4
            py-2
            rounded-lg
            flex
            items-center
            gap-2
            transition-colors
            min-w-[44px]
            min-h-[44px]
            ${isListening
              ? 'bg-red-600 text-white'
              : 'bg-gray-600 text-white hover:bg-gray-700'
            }
            disabled:opacity-50
          `}
          aria-label={isListening
            ? t('recipe.voice.listening', 'Listening for commands')
            : t('recipe.voice.listen', 'Listen for voice commands')
          }
        >
          {isListening ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              {t('recipe.voice.listening', 'Listening...')}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              {t('recipe.voice.listen', 'Listen')}
            </>
          )}
        </button>

        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className={`
            px-4
            py-2
            rounded-lg
            flex
            items-center
            gap-2
            transition-colors
            min-w-[44px]
            min-h-[44px]
            bg-gray-200
            text-gray-800
            hover:bg-gray-300
            dark:bg-gray-700
            dark:text-gray-200
            dark:hover:bg-gray-600
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
          aria-label={t('recipe.voice.previousStep', 'Previous step')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {t('recipe.voice.previous', 'Prev')}
        </button>

        <button
          onClick={goToNextStep}
          disabled={recipe.steps ? currentStep >= recipe.steps.length - 1 : true}
          className={`
            px-4
            py-2
            rounded-lg
            flex
            items-center
            gap-2
            transition-colors
            min-w-[44px]
            min-h-[44px]
            bg-gray-200
            text-gray-800
            hover:bg-gray-300
            dark:bg-gray-700
            dark:text-gray-200
            dark:hover:bg-gray-600
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
          aria-label={t('recipe.voice.nextStep', 'Next step')}
        >
          {t('recipe.voice.next', 'Next')}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {recipe.kitchen_guard && currentStep === 0 && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded border-l-4 border-yellow-500 dark:border-yellow-400">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                {t('recipe.kitchenGuard.title', 'Kitchen Guard')}
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                {recipe.kitchen_guard}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {t('recipe.voice.instructions', 'Voice commands: Say "next", "previous", or "repeat" to navigate steps.')}
      </div>
    </div>
  );
};

export default VoiceRecipeNavigator;