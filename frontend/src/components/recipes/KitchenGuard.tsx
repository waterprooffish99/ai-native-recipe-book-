/**
 * T088: KitchenGuard Component
 * Displays safety warnings prominently with accessibility features and logging
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface KitchenGuardProps {
  safetyTip: string;
  className?: string;
  recipeId?: string;
  recipeName?: string;
}

const KitchenGuard: React.FC<KitchenGuardProps> = ({
  safetyTip,
  className = '',
  recipeId,
  recipeName
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  // Log when Kitchen Guard is displayed
  useEffect(() => {
    if (safetyTip) {
      // In a real application, this would log to a centralized logging service
      console.log('[KitchenGuard] Displayed safety tip', {
        recipeId,
        recipeName,
        language: i18n.language,
        timestamp: new Date().toISOString(),
        safetyTip: safetyTip.substring(0, 50) + '...' // Truncate for privacy
      });

      // Optional: Send analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'display_kitchen_guard', {
          recipe_id: recipeId,
          recipe_name: recipeName,
          language: i18n.language
        });
      }
    }
  }, [safetyTip, recipeId, recipeName, i18n.language]);

  if (!safetyTip) {
    return null;
  }

  return (
    <div
      className={`
        kitchen-guard
        p-4
        md:p-6
        bg-yellow-50
        dark:bg-yellow-900
        border-l-4
        border-yellow-500
        dark:border-yellow-400
        rounded
        shadow-sm
        ${className}
        ${isRtl ? 'rtl-kitchen-guard' : 'ltr-kitchen-guard'}
      `}
      dir={isRtl ? 'rtl' : 'ltr'}
      role="alert"
      aria-label={t('recipe.kitchenGuard.ariaLabel', 'Safety warning')}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className={`ml-3 ${isRtl ? 'mr-3 ml-0' : 'ml-3'}`}>
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
            {t('recipe.kitchenGuard.title', 'Kitchen Guard')}
          </h3>
          <div className={`mt-2 text-yellow-700 dark:text-yellow-300 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p>{safetyTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenGuard;