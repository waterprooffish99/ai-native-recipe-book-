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

const RecipeList: React.FC<RecipeListProps> = ({ language = 'EN', difficulty, onRecipeSelect }) => {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isRtl = isRTL(i18n.language);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const fetchedRecipes = await RecipeService.listRecipes(language, difficulty);
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
  }, [language, difficulty, t]);

  if (loading) {
    return (
      <div className={`text-center py-8 ${isRtl ? 'rtl-recipe-list' : 'ltr-recipe-list'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('common.loading', 'Loading...')}
        </p>
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