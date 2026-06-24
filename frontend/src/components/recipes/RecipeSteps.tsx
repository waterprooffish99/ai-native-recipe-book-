/**
 * T056: RecipeSteps Component
 * Displays numbered recipe steps with mobile-friendly design and RTL support
 */

import React from 'react';
import { RecipeStep } from '../../services/recipeService';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface RecipeStepsProps {
  steps: RecipeStep[];
  stepProgressList?: { step_number: number; status: string }[];
  onStepToggle?: (stepNumber: number, isCompleted: boolean) => void;
}

const RecipeSteps: React.FC<RecipeStepsProps> = ({ steps, stepProgressList = [], onStepToggle }) => {
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
          sortedSteps.map((step) => {
            const progress = stepProgressList.find(p => p.step_number === step.step_number);
            const isCompleted = progress ? progress.status === 'completed' : false;

            return (
              <div
                key={step.step_number}
                onClick={() => onStepToggle?.(step.step_number, !isCompleted)}
                className={`
                  step-item
                  p-4
                  md:p-5
                  bg-white
                  dark:bg-gray-800
                  rounded-lg
                  border
                  ${isCompleted ? 'border-green-500/80 dark:border-green-500/80 bg-green-50/10' : 'border-gray-200 dark:border-gray-700/60'}
                  shadow-sm
                  transition-all
                  duration-200
                  hover:shadow-md
                  cursor-pointer
                  ${isRtl ? 'rtl-step-item' : 'ltr-step-item'}
                `}
              >
                <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-4`}>
                  {/* Checkbox and Step Number */}
                  <div className={`flex items-center gap-3 ${isRtl ? 'order-1' : 'order-0'}`}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStepToggle?.(step.step_number, e.target.checked);
                      }}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className={`
                        flex
                        items-center
                        justify-center
                        min-w-[36px]
                        min-h-[36px]
                        w-9
                        h-9
                        rounded-full
                        ${isCompleted ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'}
                        font-bold
                        text-base
                        flex-shrink-0
                      `}
                      aria-hidden="true"
                    >
                      {step.step_number}
                    </div>
                  </div>

                  {/* Step instruction */}
                  <div className={`flex-1 ${isRtl ? 'order-0' : 'order-1'}`}>
                    <p
                      className={`
                        text-base
                        leading-relaxed
                        ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400 font-normal' : 'text-gray-800 dark:text-gray-200'}
                        ${isRtl ? 'text-right' : 'text-left'}
                      `}
                    >
                      {step.instruction}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
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