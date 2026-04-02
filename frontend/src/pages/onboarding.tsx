import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import surveyService from '../services/surveyService';
import KitchenSurvey from '../components/onboarding/KitchenSurvey';
import OnboardingProgress from '../components/onboarding/OnboardingProgress';
import { VoiceSelector } from '../components/onboarding/VoiceSelector';
import { LanguagePicker } from '../components/onboarding/LanguagePicker';

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Survey, 2: Voice Selection, 3: Language Selection, 4: Complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // Check if user is authenticated and if onboarding is already completed
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      history.push('/login');
      return;
    }

    const user = authService.getCurrentUser();
    if (user && user.onboarding_completed) {
      history.push('/dashboard');
    }
  }, [history]);

  // Check if survey was already submitted
  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        await surveyService.getSurvey();
        // If we get here, the survey was submitted
        setSurveySubmitted(true);
        setCurrentStep(2); // Move to voice selection
      } catch (error: any) {
        // Survey not found, user needs to complete it
        setSurveySubmitted(false);
        setCurrentStep(1); // Stay on survey step
      }
    };

    if (authService.isAuthenticated()) {
      checkSurveyStatus();
    }
  }, []);

  // Prevent navigation away from onboarding unless completing it
  useEffect(() => {
    const preventNavigation = (e: BeforeUnloadEvent) => {
      if (currentStep < 4) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', preventNavigation);

    return () => {
      window.removeEventListener('beforeunload', preventNavigation);
    };
  }, [currentStep]);

  const handleSurveySubmit = async (surveyData: any) => {
    setLoading(true);
    setError(null);

    try {
      await surveyService.submitSurvey(surveyData);
      setSurveySubmitted(true);
      setCurrentStep(2); // Move to voice selection step
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the survey');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    // Voice preference is saved by VoiceSelector component
    // Automatically proceed to language selection after voice is selected
    setCurrentStep(3);
  };

  const handleLanguageSelect = (languageCode: string) => {
    // Language preference is saved by LanguagePicker component
    // Complete onboarding and redirect to dashboard
    setCurrentStep(4);
    setTimeout(() => {
      history.push('/dashboard');
    }, 1500);
  };

  const handleNavigationAttempt = () => {
    if (currentStep < 4) {
      setShowSkipWarning(true);
    }
  };

  const confirmSkip = () => {
    // User confirmed they want to skip, but we'll keep them on the page
    // In a real app, you might have different logic here
    setShowSkipWarning(false);
  };

  const cancelSkip = () => {
    setShowSkipWarning(false);
  };

  const stepLabels = [
    'Kitchen Intelligence Survey',
    'AI Voice Companion Selection',
    'Language Preference Selection',
    'Onboarding Complete'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Welcome to Global Plate!
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Let's personalize your cooking experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <OnboardingProgress
                currentStep={currentStep}
                totalSteps={4}
                stepLabels={stepLabels}
              />
            </div>

            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {showSkipWarning && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                  <div className="flex justify-between">
                    <span className="block sm:inline">
                      <strong>Important:</strong> Completing the onboarding process helps us personalize your cooking experience.
                      Are you sure you want to skip?
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={confirmSkip}
                        className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                      >
                        Yes, skip for now
                      </button>
                      <button
                        onClick={cancelSkip}
                        className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                      >
                        Continue onboarding
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Kitchen Intelligence Survey
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 mb-6">
                      Help us understand your background and preferences to provide the best cooking experience.
                    </p>
                    <KitchenSurvey onSubmit={handleSurveySubmit} loading={loading} />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <VoiceSelector onVoiceSelect={handleVoiceSelect} />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <LanguagePicker onLanguageSelect={handleLanguageSelect} />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Onboarding Complete!
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 mb-6">
                      Your profile is set up. You're ready to start your personalized cooking journey.
                    </p>
                    <button
                      onClick={() => history.push('/dashboard')}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;