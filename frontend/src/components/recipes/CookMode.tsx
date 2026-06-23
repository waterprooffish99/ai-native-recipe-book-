/**
 * T115: Cook Mode Component
 * Implements fullscreen cooking mode with wake lock to prevent screen sleep
 * Uses NoSleep.js for cross-browser wake lock support
 */

import React, { useEffect, useState, useRef } from 'react';
import NoSleep from 'nosleep.js';

interface CookModeProps {
  recipeName: string;
  steps: Array<{
    step_number: number;
    instruction: string;
    kitchen_guard_warning?: string;
    ingredients?: Array<{ name: string }>;
  }>;
  currentStep: number;
  onStepComplete: (stepNumber: number) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onExit: () => void;
}

// Error Boundary to prevent total white-screen crashes in Cook Mode
class CookModeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('CookModeErrorBoundary caught rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-globalplate-bg-dark flex items-center justify-center p-8 z-50">
          <div className="bg-red-950 border-2 border-red-800 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-red-200 mb-4">🍳 Cook Mode Error</h2>
            <p className="text-red-300 mb-6 text-lg">
              {this.state.error?.message || 'An unexpected rendering error occurred while loading this step.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold min-h-[44px]"
            >
              Reset Step
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CookModeInner: React.FC<CookModeProps> = ({
  recipeName,
  steps,
  currentStep,
  onStepComplete,
  onNextStep,
  onPreviousStep,
  onExit,
}) => {
  const [noSleep] = useState(new NoSleep());
  const [wakeLockEnabled, setWakeLockEnabled] = useState(false);
  const rawSteps = Array.isArray(steps) ? steps : Object.values(steps || {});
  const parsedSteps = rawSteps.map((s: any, idx: number) => {
    if (typeof s === 'string') {
      return { step_number: idx + 1, instruction: s };
    }
    if (s && typeof s === 'object') {
      const instruction = s.instruction || s.step_text || s.text || '';
      return {
        ...s,
        step_number: s.step_number || idx + 1,
        instruction: typeof instruction === 'string' ? instruction : String(instruction || ''),
      };
    }
    return { step_number: idx + 1, instruction: String(s || '') };
  });
  const step = (parsedSteps && parsedSteps[currentStep - 1]) || { step_number: currentStep, instruction: 'No instruction' };

  // Enable wake lock on mount
  useEffect(() => {
    const enableWakeLock = async () => {
      try {
        await noSleep.enable();
        setWakeLockEnabled(true);
        console.log('✅ Cook Mode: Wake lock enabled');
      } catch (err) {
        console.error('❌ Cook Mode: Failed to enable wake lock:', err);
      }
    };

    enableWakeLock();

    // Cleanup on unmount
    return () => {
      noSleep.disable();
      setWakeLockEnabled(false);
    };
  }, [noSleep]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('❌ Cook Mode: Failed to enter fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const progressPercentage = parsedSteps && parsedSteps.length > 0 ? (currentStep / parsedSteps.length) * 100 : 0;

  if (!parsedSteps || parsedSteps.length === 0) {
    return (
      <div className="cook-mode-active flex flex-col items-center justify-center p-8">
        <div className="bg-globalplate-bg-card p-8 rounded-xl max-w-md w-full text-center shadow-lg">
          <h2 className="text-2xl font-bold text-globalplate-text-primary mb-4">{recipeName}</h2>
          <p className="text-globalplate-text-secondary mb-6">Instructions loading or unavailable</p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-globalplate-accent text-white rounded-lg hover:bg-red-600 w-full min-h-[44px]"
          >
            Exit Cook Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cook-mode-active">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-globalplate-bg-card">
        <div>
          <h2 className="text-2xl font-bold text-globalplate-text-primary">
            {recipeName}
          </h2>
          <p className="text-globalplate-text-secondary">
            Step {currentStep} of {parsedSteps.length}
          </p>
        </div>
        <div className="flex gap-2">
          {wakeLockEnabled && (
            <span className="px-3 py-1 bg-globalplate-success text-white text-sm rounded">
              🔒 Screen Awake
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-globalplate-bg-surface text-globalplate-text-primary rounded hover:bg-globalplate-bg-card"
          >
            {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-globalplate-accent text-white rounded hover:bg-red-600"
          >
            Exit Cook Mode
          </button>
        </div>
      </div>

      {/* Current Step - Large Text */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl">
          <p className="cook-mode-step">
            {typeof step.instruction === 'string' ? step.instruction : String(step.instruction || '')}
          </p>
        </div>
      </div>

      {/* Kitchen Guard Warning */}
      {step.kitchen_guard_warning && (
        <div className="bg-red-600 text-white p-6 text-2xl mx-8 rounded-lg">
          ⚠️ <strong>Safety Warning:</strong> {typeof step.kitchen_guard_warning === 'string' ? step.kitchen_guard_warning : String(step.kitchen_guard_warning)}
        </div>
      )}

      {/* Ingredient Checkboxes for this step */}
      {step.ingredients && step.ingredients.length > 0 && (
        <div className="p-4 bg-globalplate-bg-surface mx-8 rounded-lg">
          <h3 className="text-xl text-globalplate-text-primary mb-4">
            Ingredients for this step:
          </h3>
          <div className="ingredient-checklist">
            {step.ingredients.map((ingredient, idx) => {
              const name = typeof ingredient === 'string' ? ingredient : (ingredient?.name || '');
              return (
                <label key={idx} className="ingredient-item">
                  <input
                    type="checkbox"
                    className="ingredient-checkbox"
                  />
                  <span className="ingredient-name">{typeof name === 'string' ? name : String(name)}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="step-progress-bar mx-8">
        <div
          className="step-progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center p-4 bg-globalplate-bg-card">
        <button
          onClick={onPreviousStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-globalplate-bg-surface text-globalplate-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-globalplate-bg-card"
        >
          ← Previous
        </button>
        <button
          onClick={() => onStepComplete(currentStep)}
          className="px-8 py-3 bg-globalplate-accent text-white text-xl rounded-lg hover:bg-red-600"
        >
          {currentStep < parsedSteps.length ? 'Mark Complete →' : '✓ Recipe Complete!'}
        </button>
        <button
          onClick={onNextStep}
          disabled={currentStep === parsedSteps.length}
          className="px-6 py-3 bg-globalplate-bg-surface text-globalplate-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-globalplate-bg-card"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export const CookMode: React.FC<CookModeProps> = (props) => {
  return (
    <CookModeErrorBoundary>
      <CookModeInner {...props} />
    </CookModeErrorBoundary>
  );
};
