/**
 * T054: RecipeList Component
 * Displays a list of recipe cards with filtering and mobile-friendly design
 */

import React, { useState, useEffect } from 'react';
import { RecipeSummary, RecipeService } from '../../services/recipeService';
import RecipeCard from './RecipeCard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface RecipeListProps {
  language?: string;
  difficulty?: string;
  onRecipeSelect: (recipeId: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ language, difficulty, onRecipeSelect }) => {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isRtl = isRTL(i18n.language);
  const queryLanguage = language || (i18n.language || 'en').toUpperCase();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const fetchedRecipes = await RecipeService.listRecipes(queryLanguage, difficulty);
        setRecipes(fetchedRecipes);
        setError(null);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(t('recipe.errors.fetchFailed', 'Failed to fetch recipes'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [queryLanguage, difficulty, t]);

  if (loading) {
    return (
      <div className={`recipe-list-container ${isRtl ? 'rtl-recipe-list' : 'ltr-recipe-list'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('recipe.listTitle', 'Recipes')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('recipe.listSubtitle', 'Select a recipe to get started')}
          </p>
        </div>

        {/* Cold Start Backend Wake Up Warning */}
        <div className="mb-8 p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-3 shadow-sm backdrop-blur-sm">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 flex-shrink-0"></div>
          <span className="text-sm text-blue-700 dark:text-blue-200">
            Waking up the Hugging Face AI kitchen. The server may take 10-30 seconds to respond on cold starts...
          </span>
        </div>

        {/* Shimmer/Skeleton Recipe Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800/50 rounded-xl p-4 md:p-6 min-h-[180px] border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700/80 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700/80 rounded w-1/2"></div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700/80 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700/80 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700/80 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${isRtl ? 'rtl-recipe-list' : 'ltr-recipe-list'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`recipe-list-container ${isRtl ? 'rtl-recipe-list' : 'ltr-recipe-list'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('recipe.listTitle', 'Recipes')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('recipe.listSubtitle', 'Select a recipe to get started')}
        </p>
      </div>

      {/* Recipe grid */}
      {recipes.length > 0 ? (
        <div
          className={`
            recipe-grid
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
            md:gap-6
          `}
          style={{
            // Ensure proper spacing for mobile touch targets
            '--grid-gap': '1rem',
          } as React.CSSProperties}
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipe_id}
              recipe={recipe}
              onClick={() => onRecipeSelect(recipe.recipe_id)}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('recipe.noRecipesTitle', 'No recipes found')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('recipe.noRecipesMessage', 'There are no recipes matching your criteria.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;