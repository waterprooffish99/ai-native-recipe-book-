/**
 * T055: RecipeDetail Component
 * Displays full recipe details with steps and ingredients, mobile-friendly and RTL support
 */

import React, { useState, useEffect } from 'react';
import { Recipe, RecipeService } from '../../services/recipeService';
import RecipeSteps from './RecipeSteps';
import KitchenGuard from './KitchenGuard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface RecipeDetailProps {
  recipeId: string;
  language?: string;
  onBack?: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId, language = 'EN', onBack }) => {
  const { t, i18n } = useTranslation();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const isRtl = isRTL(i18n.language);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get recipe in selected language first, fall back to default
        try {
          const recipeData = await RecipeService.getRecipeTranslation(recipeId, selectedLanguage);
          setRecipe(recipeData);
        } catch {
          // If translation not found, get default recipe
          const recipeData = await RecipeService.getRecipeById(recipeId, selectedLanguage);
          setRecipe(recipeData);
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  if (loading) {
    return (
      <div className={`text-center py-12 ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
          {t('common.loading', 'Loading...')}
        </p>
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

  return (
    <div className={`recipe-detail-container ${isRtl ? 'rtl-recipe-detail' : 'ltr-recipe-detail'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header with back button and language selector */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ${isRtl ? 'rtl-header' : 'ltr-header'}`}>
        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
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

        {/* Language selector */}
        <div className={`w-full sm:w-auto ${isRtl ? 'text-right' : 'text-left'}`}>
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('common.language', 'Language')}
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className={`
              w-full
              sm:w-auto
              px-3
              py-2
              border
              border-gray-300
              dark:border-gray-600
              rounded-lg
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
              dark:bg-gray-700
              dark:text-white
              ${isRtl ? 'rtl-language-select' : 'ltr-language-select'}
            `}
            dir="ltr" // Always LTR for language codes
          >
            <option value="EN">{t('languages.english', 'English')}</option>
            <option value="UR">{t('languages.urdu', 'Urdu')}</option>
            <option value="AR">{t('languages.arabic', 'Arabic')}</option>
            <option value="ES">{t('languages.spanish', 'Spanish')}</option>
            <option value="FR">{t('languages.french', 'French')}</option>
            <option value="FA">{t('languages.persian', 'Persian')}</option>
          </select>
        </div>
      </div>

      {/* Kitchen Guard - Safety warnings */}
      {recipe.kitchen_guard && (
        <div className="mb-6">
          <KitchenGuard safetyTip={recipe.kitchen_guard} />
        </div>
      )}

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

      {/* Ingredients section */}
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('recipe.ingredients.title', 'Ingredients')}
        </h2>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient: any, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-2 mt-1">•</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {typeof ingredient === 'string' ? ingredient :
                   ingredient.quantity ? `${ingredient.quantity} ${ingredient.name || ingredient}` : ingredient.name || ingredient}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 italic">
            {t('recipe.ingredients.none', 'No ingredients specified')}
          </p>
        )}
      </div>

      {/* Steps section */}
      {recipe.steps && recipe.steps.length > 0 && (
        <div className="mb-8">
          <RecipeSteps steps={recipe.steps} />
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;