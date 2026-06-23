/**
 * T082: PersonalizedDashboard Component
 * Displays a personalized dashboard with welcome message based on user background
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';
import {
  getPersonalizedWelcomeMessage,
  getPersonalizedRecipeExplanation,
  getPersonalizedSafetyTips,
  BackgroundType,
  BackgroundLevel
} from '../../utils/metaphorMapper';

interface UserBackground {
  user_id: string;
  software_background?: string;
  hardware_background?: string;
  cooking_level?: string;
  dietary_restrictions?: string;
  preferred_language?: string;
  preferred_voice?: string;
}

interface PersonalizedDashboardProps {
  userBackground?: UserBackground;
  onBackgroundUpdate?: (background: UserBackground) => void;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  userBackground,
  onBackgroundUpdate
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  // Determine user's background type and level
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('other');
  const [backgroundLevel, setBackgroundLevel] = useState<BackgroundLevel>('beginner');

  useEffect(() => {
    if (userBackground) {
      // Determine background type based on user's background
      if (userBackground.software_background) {
        setBackgroundType('software');
      } else if (userBackground.hardware_background) {
        setBackgroundType('hardware');
      } else if (userBackground.cooking_level) {
        setBackgroundType('cooking');
      } else {
        setBackgroundType('other');
      }

      // Determine background level based on user's background
      if (userBackground.software_background?.toLowerCase().includes('beginner') ||
          userBackground.hardware_background?.toLowerCase().includes('beginner') ||
          userBackground.cooking_level === 'Absolute Beginner') {
        setBackgroundLevel('beginner');
      } else if (userBackground.software_background?.toLowerCase().includes('intermediate') ||
                 userBackground.hardware_background?.toLowerCase().includes('intermediate') ||
                 userBackground.cooking_level === 'Beginner') {
        setBackgroundLevel('intermediate');
      } else {
        setBackgroundLevel('expert');
      }
    }
  }, [userBackground]);

  // Get personalized messages based on user's background
  const welcomeMessage = getPersonalizedWelcomeMessage(backgroundType, backgroundLevel);
  const recipeExplanation = getPersonalizedRecipeExplanation(backgroundType, backgroundLevel);
  const safetyTips = getPersonalizedSafetyTips(backgroundType, backgroundLevel);

  return (
    <div
      className={`personalized-dashboard-container ${isRtl ? 'rtl-dashboard' : 'ltr-dashboard'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Welcome section with personalized message */}
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('dashboard.welcome', 'Welcome to Your Kitchen')}
        </h1>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
            {welcomeMessage}
          </p>
        </div>
      </div>

      {/* Personalization info card */}
      <div className="mb-8">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 ${isRtl ? 'rtl-info-card' : 'ltr-info-card'}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.personalization', 'Your Personalization')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.backgroundType', 'Background Type')}
              </h3>
              <p className="text-gray-900 dark:text-white capitalize">
                {backgroundType}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.backgroundLevel', 'Background Level')}
              </h3>
              <p className="text-gray-900 dark:text-white capitalize">
                {backgroundLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized recipe explanation */}
      <div className="mb-8">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 ${isRtl ? 'rtl-recipe-explanation' : 'ltr-recipe-explanation'}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.recipeExplanation', 'Recipe Explanation')}
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200">
              {recipeExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* Personalized safety tips */}
      <div className="mb-8">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 ${isRtl ? 'rtl-safety-tips' : 'ltr-safety-tips'}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.safetyTips', 'Safety Tips')}
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded p-4">
            <p className="text-gray-800 dark:text-gray-200">
              {safetyTips}
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className={`text-center ${isRtl ? 'rtl-cta' : 'ltr-cta'}`}>
        <button
          className={`
            px-6
            py-3
            bg-blue-600
            text-white
            rounded-lg
            hover:bg-blue-700
            focus:ring-2
            focus:ring-blue-500
            focus:ring-offset-2
            transition-colors
            font-medium
            ${isRtl ? 'rtl-cta-button' : 'ltr-cta-button'}
          `}
        >
          {t('dashboard.startCooking', 'Start Cooking')}
        </button>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;