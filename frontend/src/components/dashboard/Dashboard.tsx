/**
 * Dashboard Component
 *
 * Displays a personalized welcome message based on user's background
 * using the metaphor utility to make the kitchen feel personal.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getPersonalizedWelcomeMessage, getPersonalizedRecipeExplanation } from '../../utils/metaphorMapper';
import { RecipeSummary } from '../../services/recipeService';

interface DashboardProps {
  userName?: string;
  userBackground?: string | null;
  preferredVoice?: string;
  recipesMastered?: number;
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName = 'User',
  userBackground = null,
  preferredVoice = 'Kitchen Partner',
  recipesMastered = 0,
  className = ''
}) => {
  const { t } = useTranslation();

  // Mock data for the 5 Global Masterpieces to verify UI and RTL mirroring
  const mockRecipes: RecipeSummary[] = [
    {
      recipe_id: '1',
      name: 'Sajji',
      origin_country: 'Pakistan',
      difficulty: 'Absolute Beginner',
      prep_time: 15,
      cook_time: 30,
      total_time: 45,
      servings: 4,
      language: 'EN'
    },
    {
      recipe_id: '2',
      name: 'Pasta',
      origin_country: 'Italy',
      difficulty: 'Beginner',
      prep_time: 10,
      cook_time: 20,
      total_time: 30,
      servings: 4,
      language: 'EN'
    },
    {
      recipe_id: '3',
      name: 'Guacamole',
      origin_country: 'Mexico',
      difficulty: 'Absolute Beginner',
      prep_time: 10,
      cook_time: 0,
      total_time: 10,
      servings: 4,
      language: 'EN'
    },
    {
      recipe_id: '4',
      name: 'Shakshuka',
      origin_country: 'Middle East',
      difficulty: 'Beginner',
      prep_time: 10,
      cook_time: 15,
      total_time: 25,
      servings: 2,
      language: 'EN'
    },
    {
      recipe_id: '5',
      name: 'Gomen',
      origin_country: 'Ethiopia',
      difficulty: 'Beginner+',
      prep_time: 15,
      cook_time: 25,
      total_time: 40,
      servings: 4,
      language: 'EN'
    }
  ];

  const loading = false;

  // Get personalized welcome message based on user's background
  const backgroundType = userBackground && typeof userBackground === 'string' ?
    (userBackground.toLowerCase() as 'software' | 'hardware' | 'cooking' | 'other') : 'other';
  const backgroundLevel: 'beginner' | 'intermediate' | 'expert' = 'beginner';

  const welcomeMessage = getPersonalizedWelcomeMessage(backgroundType, backgroundLevel);
  const cookingTip = getPersonalizedRecipeExplanation(backgroundType, backgroundLevel);
  const progressMessage = `You have mastered ${recipesMastered} recipes so far. Keep up the great work!`;

  return (
    <div className={`dashboard-container ${className}`} dir="auto">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            {userName ? t('dashboard.welcomeUser', { name: userName }) : t('dashboard.welcome')}
          </h1>
          <p className="dashboard-subtitle">
            {welcomeMessage}
          </p>
        </header>

        <section className="dashboard-intro">
          <div className="welcome-card">
            <h2>{t('dashboard.kitchenPartnerReady', { voice: preferredVoice })}</h2>
            <p className="welcome-message">
              {welcomeMessage}
            </p>
            <div className="cooking-tip">
              <h3>{t('dashboard.todaysTip', "Today's Tip:")}</h3>
              <p>{cookingTip}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-recipes">
          <h2>{t('dashboard.availableRecipes', 'Available Global Recipes')}</h2>
          {loading ? (
            <p>Loading recipes...</p>
          ) : mockRecipes.length > 0 ? (
            <div className="recipe-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {mockRecipes.map(recipe => (
                <div key={recipe.recipe_id} className="recipe-card" style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                  <h3>{recipe.name}</h3>
                  <p><strong>{t('recipe.origin', 'Origin')}:</strong> {recipe.origin_country}</p>
                  <p><strong>{t('recipe.difficulty', 'Difficulty')}:</strong> {recipe.difficulty}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>{t('dashboard.noRecipesFound', 'No recipes found for the selected language.')}</p>
          )}
        </section>

        <section className="dashboard-progress">
          <h2>{t('dashboard.kitchenJourney', 'Your Kitchen Journey')}</h2>
          <p className="progress-message">
            {progressMessage}
          </p>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;