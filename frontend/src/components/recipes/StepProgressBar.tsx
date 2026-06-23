import React from 'react';

interface StepStatus {
  step_number: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number;
  stepStatusList?: StepStatus[];
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  totalSteps,
  currentStep,
  stepStatusList = [],
}) => {
  // Generate steps mapping from totalSteps
  const steps = Array.from({ length: totalSteps }, (_, i) => {
    const stepNumber = i + 1;
    const statusObj = stepStatusList.find(s => s.step_number === stepNumber);
    let status: 'pending' | 'in_progress' | 'completed' = 'pending';

    if (statusObj) {
      status = statusObj.status;
    } else if (stepNumber < currentStep) {
      status = 'completed';
    } else if (stepNumber === currentStep) {
      status = 'in_progress';
    }

    return { stepNumber, status };
  });

  return (
    <div className="w-full bg-globalplate-bg-surface rounded-lg p-6 my-4">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-bold text-globalplate-text-primary">
          Cooking Progress
        </h4>
        <span className="text-sm text-globalplate-text-secondary">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress Dots with Connecting Lines */}
      <div className="flex items-center justify-between relative w-full px-4">
        {/* Connecting Background Line */}
        <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 h-1 bg-gray-300 dark:bg-gray-700 z-0" />

        {/* Connecting Active Line */}
        <div
          className="absolute left-6 top-1/2 transform -translate-y-1/2 h-1 bg-globalplate-accent transition-all duration-500 z-0"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            maxWidth: '100%'
          }}
        />

        {steps.map((step) => {
          let dotStyle = 'bg-gray-300 dark:bg-gray-700 text-gray-500';
          let borderStyle = 'border-transparent';

          if (step.status === 'completed') {
            dotStyle = 'bg-globalplate-accent text-white';
          } else if (step.status === 'in_progress') {
            dotStyle = 'bg-globalplate-bg-surface text-globalplate-accent border-2 border-globalplate-accent animate-pulse';
          }

          return (
            <div key={step.stepNumber} className="flex flex-col items-center z-10">
              <div
                className={`
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                  transition-all
                  duration-300
                  ${dotStyle}
                `}
              >
                {step.status === 'completed' ? '✓' : step.stepNumber}
              </div>
              <span className="text-xs text-globalplate-text-secondary mt-2 font-medium">
                {step.status === 'completed'
                  ? 'Done'
                  : step.status === 'in_progress'
                  ? 'Cooking'
                  : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
