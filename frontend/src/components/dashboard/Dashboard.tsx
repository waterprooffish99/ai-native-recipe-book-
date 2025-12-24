/**
 * Dashboard Component
 *
 * Displays a personalized welcome message based on user's background
 * using the metaphor utility to make the kitchen feel personal.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getWelcomeMessage, getCookingTip, getProgressMessage } from '../../utils/metaphorMapper';

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

  // Get personalized welcome message based on user's background
  const welcomeMessage = getWelcomeMessage(userBackground);
  const cookingTip = getCookingTip(userBackground);
  const progressMessage = getProgressMessage(recipesMastered, userBackground);

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