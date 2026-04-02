/**
 * Dashboard Page
 *
 * Main dashboard page that displays personalized welcome message,
 * progress ring, and quick access cards.
 * The layout handles both English and RTL languages perfectly.
 */

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { QuickAccessCard } from '../components/dashboard/QuickAccessCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import authService from '../services/authService';
import userService from '../services/userService';
import logger from '../utils/logger';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // TEMPORARY: Bypass login requirement for recipe verification during development
        // This allows us to verify the 5 global recipes (Sajji, Pasta, Guacamole, Shakshuka, Gomen) are visible
        // TODO: Remove this bypass and restore proper authentication after verification
        const BYPASS_LOGIN_FOR_DEV = true;

        if (!BYPASS_LOGIN_FOR_DEV && !authService.isAuthenticated()) {
          history.push('/login');
          return;
        }

        // Fetch user profile
        // For development, use mock data if not authenticated
        let profile;
        if (authService.isAuthenticated()) {
          profile = await userService.getProfile();
        } else {
          // Mock user data for development (since BYPASS_LOGIN_FOR_DEV is true)
          profile = {
            id: 'dev-user-id',
            email: 'dev@example.com',
            name: 'Development User',
            software_background: 'beginner',
            hardware_background: 'beginner',
            cooking_level: 'Absolute Beginner',
            preferred_voice: 'Kitchen Partner',
            preferred_language: 'en',
            recipes_mastered: 3,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_beginner_recipes: 50
          };
        }

        setUser(profile);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        logger.error('Error loading dashboard:', {
          context: 'DashboardPage.fetchUserProfile',
          error: err
        });
      }
    };

    fetchUserProfile();
  }, [history]);

  // Handle loading state
  if (loading) {
    return (
      <div className="dashboard-page" dir="auto" role="status" aria-live="polite">
        <div className="loading-container">
          <LoadingSpinner size="lg" label="Loading your kitchen..." />
          <p className="sr-only">Loading your kitchen...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="dashboard-page" dir="auto">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={() => history.push('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  // Handle no user data
  if (!user) {
    return (
      <div className="dashboard-page" dir="auto">
        <div className="error-container">
          <p>User data not available</p>
          <button onClick={() => history.push('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  // Check if onboarding is completed
  // TEMPORARY: Bypass onboarding check for recipe verification during development
  if (!user.onboarding_completed && !BYPASS_LOGIN_FOR_DEV) {
    history.push('/onboarding');
    return null;
  }

  // Quick access card click handlers
  const handleBrowseRecipes = () => {
    // Placeholder navigation - would go to actual recipes page in future
    alert('Browse Recipes feature coming soon!');
  };

  const handleContinueLastRecipe = () => {
    // Placeholder navigation - would go to last viewed recipe in future
    alert('Continue Last Recipe feature coming soon!');
  };

  const handleFavorites = () => {
    // Placeholder navigation - would go to favorites page in future
    alert('Favorites feature coming soon!');
  };

  return (
    <div className="dashboard-page" dir={user.preferred_language === 'ar' || user.preferred_language === 'ur' || user.preferred_language === 'fa' ? 'rtl' : 'auto'}>
      <div className="dashboard-layout">
        <header className="dashboard-header">
          <h1>Your Personal Kitchen</h1>
        </header>

        <main className="dashboard-main">
          {/* Personalized Dashboard Component */}
          <Dashboard
            userName={user.name}
            userBackground={user.software_background}
            preferredVoice={user.preferred_voice || 'Kitchen Partner'}
            recipesMastered={user.recipes_mastered}
          />

          {/* Progress Ring Visualization */}
          <section className="progress-section">
            <h2>Your Progress</h2>
            <ProgressRing
              recipesMastered={user.recipes_mastered}
              totalRecipes={user.total_beginner_recipes || 50} // Default to 50 as placeholder
            />
          </section>

          {/* Quick Access Cards */}
          <section className="quick-access-section">
            <h2>Quick Access</h2>
            <div className="quick-access-grid">
              <QuickAccessCard
                icon="🍳"
                title="Browse Recipes"
                description="Explore all available recipes for your skill level"
                onClick={handleBrowseRecipes}
                color="blue"
              />
              <QuickAccessCard
                icon="⏱️"
                title="Continue Last Recipe"
                description="Pick up where you left off with your last recipe"
                onClick={handleContinueLastRecipe}
                color="green"
              />
              <QuickAccessCard
                icon="❤️"
                title="Favorites"
                description="View and manage your favorite recipes"
                onClick={handleFavorites}
                color="purple"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;