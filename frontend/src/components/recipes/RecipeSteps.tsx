/**
 * T056: RecipeSteps Component
 * Displays numbered recipe steps with mobile-friendly design and RTL support
 */

import React from 'react';
import { RecipeStep } from '../services/recipeService';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../i18n/config';

interface RecipeStepsProps {
  steps: RecipeStep[];
}

const RecipeSteps: React.FC<RecipeStepsProps> = ({ steps }) => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  // Sort steps by step number to ensure proper order
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <div className={`recipe-steps-container ${isRtl ? 'rtl-recipe-steps' : 'ltr-recipe-steps'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <h3 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
        {t('recipe.steps.title', 'Steps')}
      </h3>

      <div className="space-y-4">
        {sortedSteps.length > 0 ? (
          sortedSteps.map((step) => (
            <div
              key={step.step_number}
              className={`
                step-item
                p-4
                md:p-5
                bg-white
                dark:bg-gray-800
                rounded-lg
                border
                border-gray-200
                dark:border-gray-700
                shadow-sm
                transition-all
                duration-200
                hover:shadow-md
                ${isRtl ? 'rtl-step-item' : 'ltr-step-item'}
              `}
            >
              <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
                {/* Step number with large tap target */}
                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    min-w-[44px]
                    min-h-[44px]
                    w-11
                    h-11
                    rounded-full
                    bg-blue-100
                    dark:bg-blue-900
                    text-blue-800
                    dark:text-blue-200
                    font-bold
                    text-lg
                    flex-shrink-0
                    ${isRtl ? 'order-1' : 'order-0'}
                  `}
                  aria-hidden="true"
                >
                  {step.step_number}
                </div>

                {/* Step instruction */}
                <div className={`flex-1 ${isRtl ? 'order-0' : 'order-1'}`}>
                  <p
                    className={`
                      text-base
                      text-gray-800
                      dark:text-gray-200
                      leading-relaxed
                      ${isRtl ? 'text-right' : 'text-left'}
                    `}
                  >
                    {step.instruction}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('recipe.steps.noStepsTitle', 'No steps available')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('recipe.steps.noStepsMessage', 'This recipe does not have any steps defined.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeSteps;