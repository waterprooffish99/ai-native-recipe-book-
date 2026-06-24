/**
 * T055: RecipeDetail Component
 * Displays full recipe details with steps and ingredients, mobile-friendly and RTL support
 */

import React, { useState, useEffect } from 'react';
import { Recipe, RecipeService } from '../../services/recipeService';
import RecipeSteps from './RecipeSteps';
import KitchenGuard from './KitchenGuard';
import { IngredientChecklist, scaleQuantity } from './IngredientChecklist';
import { CookMode } from './CookMode';
import { StepProgressBar } from './StepProgressBar';
import { ServingSizeController } from './ServingSizeController';
import { PdfDownloadButton } from './PdfDownloadButton';
import { useRecipeProgress } from '../../hooks/useRecipeProgress';
import authService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface RecipeDetailProps {
  recipeId: string;
  language?: string;
  onBack?: () => void;
}

// Pure helper function to handle different database seed ingredient formats (dict vs list vs string)
const parseIngredients = (ingredientsInput: any): { ingredient_id: string; name: string; quantity?: string; unit?: string }[] => {
  if (!ingredientsInput) return [];
  
  let raw: any = ingredientsInput;
  if (typeof ingredientsInput === 'string') {
    try {
      raw = JSON.parse(ingredientsInput);
    } catch {
      return [{ ingredient_id: 'ing-0', name: ingredientsInput }];
    }
  }

  const isIngredientObj = (obj: any) => obj && typeof obj === 'object' && ('name' in obj);

  const list: any[] = [];
  
  const processItem = (item: any) => {
    if (typeof item === 'string') {
      list.push({ name: item });
    } else if (typeof item === 'object' && item !== null) {
      if (isIngredientObj(item)) {
        list.push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit
        });
      } else {
        // It's a key-value dictionary, e.g. {"chicken": "1 whole chicken"}
        Object.entries(item).forEach(([key, val]) => {
          list.push({
            name: key,
            quantity: typeof val === 'string' || typeof val === 'number' ? String(val) : ''
          });
        });
      }
    }
  };

  if (Array.isArray(raw)) {
    raw.forEach(processItem);
  } else {
    processItem(raw);
  }

  return list.map((item, idx) => ({
    ingredient_id: `ing-${idx}`,
    name: item.name || '',
    quantity: item.quantity,
    unit: item.unit,
  }));
};

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId, language = 'EN', onBack }) => {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const selectedLanguage = (i18n.language || 'en').toUpperCase();
  const isRtl = isRTL(i18n.language);

  // Dynamic steps/instructions normalizer for both English and translated payloads
  const rawSteps = recipe?.steps || (recipe as any)?.instructions || [];
  const stepsArray = Array.isArray(rawSteps)
    ? rawSteps
    : (rawSteps && typeof rawSteps === 'object' ? Object.values(rawSteps) : []);
  const parsedSteps = stepsArray.map((step: any, idx: number) => {
    if (typeof step === 'string') {
      return {
        step_number: idx + 1,
        instruction: step,
      };
    }
    if (step && typeof step === 'object') {
      const text = step.instruction || step.step_text || step.text || '';
      return {
        ...step,
        step_number: step.step_number || idx + 1,
        instruction: typeof text === 'string' ? text : String(text || ''),
      };
    }
    return {
      step_number: idx + 1,
      instruction: String(step || ''),
    };
  });

  const isAuthenticated = authService.isAuthenticated();
  const {
    progress,
    updateProgress,
    toggleIngredient,
    toggleCookMode,
  } = useRecipeProgress(recipeId, isAuthenticated);

  const [cookModeActiveLocal, setCookModeActiveLocal] = useState<boolean>(false);
  const [currentCookStepLocal, setCurrentCookStepLocal] = useState<number>(1);

  const cookModeActive = isAuthenticated ? (progress?.cook_mode_active ?? false) : cookModeActiveLocal;
  const currentCookStep = isAuthenticated ? (progress?.current_step ?? 1) : currentCookStepLocal;

  const [guestStepProgress, setGuestStepProgress] = useState<Record<number, 'pending' | 'completed'>>({});

  const stepStatusList = isAuthenticated
    ? (progress?.step_progress.map(s => ({
        step_number: s.step_number,
        status: s.status as 'pending' | 'in_progress' | 'completed'
      })) || [])
    : parsedSteps.map(s => ({
        step_number: s.step_number,
        status: (guestStepProgress[s.step_number] || (s.step_number === currentCookStepLocal ? 'in_progress' : 'pending')) as 'pending' | 'in_progress' | 'completed'
      }));

  const completedStepsCount = stepStatusList.filter(s => s.status === 'completed').length;

  const handleStepToggle = (stepNumber: number, isCompleted: boolean) => {
    const nextStatus = isCompleted ? 'completed' : 'pending';
    if (isAuthenticated) {
      updateProgress(stepNumber, nextStatus, cookModeActive);
    } else {
      setGuestStepProgress(prev => ({
        ...prev,
        [stepNumber]: nextStatus
      }));
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        let recipeData;
        // Try to get recipe in selected language first, fall back to default
        try {
          recipeData = await RecipeService.getRecipeTranslation(recipeId, selectedLanguage);
          setRecipe(recipeData);
        } catch (err) {
          // If translation not found, get default recipe
          recipeData = await RecipeService.getRecipeById(recipeId, selectedLanguage);
          setRecipe(recipeData);
        }
        if (recipeData && recipeData.servings) {
          setServings(recipeData.servings);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(t('recipe.errors.detailFetchFailed', 'Failed to fetch recipe details'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, selectedLanguage, t]);


  if (!isMounted) {
    return (
      <div className={`text-center py-12 ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
          {t('common.loading', 'Loading...')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`recipe-detail-container ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Cold Start Backend Wake Up Warning */}
        <div className="mb-8 p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-3 shadow-sm backdrop-blur-sm">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 flex-shrink-0"></div>
          <span className="text-sm text-blue-700 dark:text-blue-200">
            Fetching recipe translation and details. Waking up the Hugging Face AI kitchen backend...
          </span>
        </div>

        {/* Back Button Skeleton */}
        {onBack && (
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 mb-6 animate-pulse"></div>
        )}

        {/* Title and Origin Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>

        {/* Metadata Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg h-20 border border-gray-200/50 dark:border-gray-700/50"></div>
          ))}
        </div>

        {/* Ingredients & Steps Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients Column */}
          <div className="lg:col-span-1 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"></div>
            ))}
          </div>

          {/* Steps Column */}
          <div className="lg:col-span-2 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className={`
              mt-6
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
              min-w-[44px]
              min-h-[44px]
              ${isRtl ? 'rtl-back-button' : 'ltr-back-button'}
            `}
          >
            {t('common.back', 'Back')}
          </button>
        )}
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className={`text-center py-12 ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('recipe.errors.notFoundTitle', 'Recipe not found')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {t('recipe.errors.notFoundMessage', 'The requested recipe could not be found.')}
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className={`
                mt-4
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
                min-w-[44px]
                min-h-[44px]
                ${isRtl ? 'rtl-back-button' : 'ltr-back-button'}
              `}
            >
              {t('common.back', 'Back')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Format difficulty for display
  const formatDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'Absolute Beginner':
        return t('difficulty.absoluteBeginner', 'Absolute Beginner');
      case 'Beginner':
        return t('difficulty.beginner', 'Beginner');
      case 'Beginner+':
        return t('difficulty.beginnerPlus', 'Beginner+');
      default:
        return difficulty;
    }
  };

  // Cook Mode handlers
  const handleStartCookMode = () => {
    if (isAuthenticated) {
      updateProgress(1, 'in_progress', true);
    } else {
      setCookModeActiveLocal(true);
      setCurrentCookStepLocal(1);
    }
  };

  const handleExitCookMode = () => {
    if (isAuthenticated) {
      updateProgress(currentCookStep, 'in_progress', false);
    } else {
      setCookModeActiveLocal(false);
      setCurrentCookStepLocal(1);
    }
  };

  const handleCookStepComplete = (stepNumber: number) => {
    console.log(`Step ${stepNumber} completed`);
    const totalSteps = parsedSteps.length;
    const isLast = totalSteps > 0 ? (stepNumber >= totalSteps) : false;

    if (isAuthenticated) {
      updateProgress(stepNumber, 'completed', true).then(() => {
        if (!isLast) {
          updateProgress(stepNumber + 1, 'in_progress', true);
        }
      });
    } else {
      if (totalSteps > 0 && stepNumber < totalSteps) {
        setCurrentCookStepLocal(stepNumber + 1);
      }
    }
  };

  const handleNextCookStep = () => {
    const totalSteps = parsedSteps.length;
    if (totalSteps > 0 && currentCookStep < totalSteps) {
      if (isAuthenticated) {
        const nextStatus = progress?.step_progress[currentCookStep]?.status || 'in_progress';
        updateProgress(currentCookStep + 1, nextStatus, true);
      } else {
        setCurrentCookStepLocal(currentCookStep + 1);
      }
    }
  };

  const handlePreviousCookStep = () => {
    if (currentCookStep > 1) {
      if (isAuthenticated) {
        const prevStatus = progress?.step_progress[currentCookStep - 2]?.status || 'in_progress';
        updateProgress(currentCookStep - 1, prevStatus, true);
      } else {
        setCurrentCookStepLocal(currentCookStep - 1);
      }
    }
  };

  // Render Cook Mode if active
  if (cookModeActive && recipe) {
    return (
      <CookMode
        recipeName={recipe.name}
        steps={parsedSteps}
        currentStep={currentCookStep}
        onStepComplete={handleCookStepComplete}
        onNextStep={handleNextCookStep}
        onPreviousStep={handlePreviousCookStep}
        onExit={handleExitCookMode}
      />
    );
  }

  return (
    <div className={`recipe-detail-container ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header with back button */}
      <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
        {onBack && (
          <button
            onClick={onBack}
            className={`
              mb-2
              px-4
              py-2
              bg-gray-200
              dark:bg-gray-700
              text-gray-800
              dark:text-gray-200
              rounded-lg
              hover:bg-gray-300
              dark:hover:bg-gray-600
              focus:ring-2
              focus:ring-gray-500
              focus:ring-offset-2
              transition-colors
              min-w-[44px]
              min-h-[44px]
              ${isRtl ? 'rtl-back-button' : 'ltr-back-button'}
            `}
            aria-label={t('common.back', 'Back')}
          >
            ← {t('common.back', 'Back')}
          </button>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {recipe.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {recipe.origin_country}
        </p>
      </div>

      {/* Kitchen Guard - Safety warnings */}
      {recipe.kitchen_guard && (
        <div className="mb-6">
          <KitchenGuard safetyTip={recipe.kitchen_guard} />
        </div>
      )}

      {/* T114: Step Progress Bar */}
      {parsedSteps.length > 0 && (
        <StepProgressBar
          totalSteps={parsedSteps.length}
          currentStep={completedStepsCount}
          stepStatusList={stepStatusList}
        />
      )}

      {/* Cook Mode Toggle Button */}
      <div className="mb-6">
        <button
          onClick={handleStartCookMode}
          className="w-full sm:w-auto px-8 py-4 bg-globalplate-accent text-white text-xl font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg"
        >
          🍳 Start Cook Mode
        </button>
        <p className="text-globalplate-text-secondary mt-2 text-sm">
          Fullscreen mode with large text and screen wake lock
        </p>
      </div>

      {/* Recipe metadata */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('recipe.difficulty', 'Difficulty')}</p>
          <p className="font-medium text-gray-900 dark:text-white capitalize">{formatDifficulty(recipe.difficulty)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('recipe.prepTime', 'Prep Time')}</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {recipe.prep_time ? `${recipe.prep_time} ${t('common.minutes', 'min')}` : t('common.notSpecified', 'N/A')}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('recipe.cookTime', 'Cook Time')}</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {recipe.cook_time ? `${recipe.cook_time} ${t('common.minutes', 'min')}` : t('common.notSpecified', 'N/A')}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('recipe.servings', 'Servings')}</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {recipe.servings ? recipe.servings : t('common.notSpecified', 'N/A')}
          </p>
        </div>
      </div>

      {/* Serving Size Controller & PDF Download Button */}
      {recipe.servings && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <ServingSizeController
            currentServings={servings}
            onServingsChange={setServings}
            baseServings={recipe.servings}
          />
          <PdfDownloadButton
            recipe={recipe}
            scalingFactor={servings / recipe.servings}
            language={selectedLanguage}
          />
        </div>
      )}

      {/* Ingredients section with Checklist */}
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('recipe.ingredients.title', 'Ingredients')}
        </h2>
        {(recipe.translated_ingredients || recipe.ingredients) && (recipe.translated_ingredients || recipe.ingredients)!.length > 0 ? (
          (() => {
            const rawIngredients = recipe.translated_ingredients || recipe.ingredients;
            const parsedIngredients = parseIngredients(rawIngredients);
            const scalingFactor = recipe.servings ? servings / recipe.servings : 1;
            return (
              <>
                {/* Interactive Ingredient Checklist */}
                <IngredientChecklist
                  ingredients={parsedIngredients}
                  checkedIngredientIds={progress?.ingredient_checkboxes.filter(cb => cb.is_checked).map(cb => cb.ingredient_id) || []}
                  onIngredientToggle={(ingredientId, isChecked) => {
                    if (isAuthenticated) {
                      toggleIngredient(ingredientId, isChecked);
                    }
                  }}
                  scalingFactor={scalingFactor}
                />
                
                {/* Fallback plain list */}
                <ul className="space-y-2 mt-4">
                  {parsedIngredients.map((ingredient) => (
                    <li key={ingredient.ingredient_id} className="flex items-start">
                      <span className="text-green-600 dark:text-green-400 mr-2 mt-1">•</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {ingredient.quantity ? `${scaleQuantity(ingredient.quantity, scalingFactor)} ${ingredient.name}` : ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            );
          })()
        ) : (
          <p className="text-gray-600 dark:text-gray-400 italic">
            {t('recipe.ingredients.none', 'No ingredients specified')}
          </p>
        )}
      </div>

      {/* Steps section */}
      {parsedSteps.length > 0 && (
        <div className="mb-8">
          <RecipeSteps
            steps={parsedSteps}
            stepProgressList={stepStatusList}
            onStepToggle={handleStepToggle}
          />
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;