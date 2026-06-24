/**
 * Dashboard Page - Emergency UI Fix
 * Directly displays RecipeList with seeded recipes
 * No authentication, no "Coming Soon" blocks
 */

import React from 'react';
import RecipeList from '../components/recipes/RecipeList';

const DashboardPage: React.FC = () => {
  const handleRecipeSelect = (recipeId: string) => {
    console.log('Recipe selected:', recipeId);
    // TODO: Navigate to recipe detail page
  };

  return (
    <div className="min-h-screen bg-globalplate-bg-dark text-globalplate-text-primary p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Personal Kitchen</h1>
          <p className="text-globalplate-text-secondary">Browse and cook your favorite recipes</p>
        </header>

        <main>
          <RecipeList onRecipeSelect={handleRecipeSelect} />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
