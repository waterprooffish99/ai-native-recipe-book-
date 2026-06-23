/**
 * T054: RecipeCard Component
 * Displays a recipe summary card with mobile-friendly design and RTL support
 */

import React from 'react';
import { RecipeSummary } from '../../services/recipeService';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';
import Link from '@docusaurus/Link';

interface RecipeCardProps {
  recipe: RecipeSummary;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

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
    <Link
      to={`/recipes/${recipe.recipe_id}`}
      className="no-underline hover:no-underline text-inherit block"
    >
      <div
        className={`
          recipe-card
          bg-white dark:bg-gray-800
          rounded-xl
          shadow-md
          overflow-hidden
          transform
          transition-all
          duration-200
          hover:-translate-y-1
          hover:shadow-xl
          cursor-pointer
          border
          border-gray-200
          dark:border-gray-700
          ${isRtl ? 'rtl-recipe-card' : 'ltr-recipe-card'}
        `}
        onClick={onClick}
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-label={`${recipe.name} - ${recipe.origin_country}`}
      >
        {/* Card content container with proper padding */}
        <div className="p-4 md:p-6 min-h-[180px] flex flex-col justify-between">
          {/* Recipe name and origin */}
          <div className={`mb-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h3
              className={`
                text-lg md:text-xl
                font-bold
                text-gray-900
                dark:text-white
                mb-1
                line-clamp-2
                ${isRtl ? 'text-right' : 'text-left'}
              `}
            >
              {recipe.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {recipe.origin_country}
            </p>
          </div>

          {/* Recipe details */}
          <div className={`mt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
              {/* Difficulty */}
              <div className="flex items-center">
                <span className="font-medium mr-1">{t('recipe.difficulty', 'Difficulty:')}</span>
                <span className="capitalize">{formatDifficulty(recipe.difficulty)}</span>
              </div>

              {/* Time info */}
              <div className="flex items-center">
                <span className="font-medium mr-1">{t('recipe.totalTime', 'Time:')}</span>
                <span>
                  {recipe.total_time ? `${recipe.total_time} ${t('common.minutes', 'min')}` : t('common.notSpecified', 'N/A')}
                </span>
              </div>

              {/* Servings */}
              <div className="flex items-center">
                <span className="font-medium mr-1">{t('recipe.servings', 'Servings:')}</span>
                <span>
                  {recipe.servings ? recipe.servings : t('common.notSpecified', 'N/A')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Large tap target area - ensure minimum 44px touch target */}
        <div
          className="absolute inset-0"
          style={{ minHeight: '44px', minWidth: '44px' }}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
};

export default RecipeCard;