import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronRight } from 'lucide-react';
import Button from './Button';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  onComplete?: (data: any) => void;
  onCancel?: () => void;
  initialStep?: number;
  className?: string;
}

const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  initialStep = 0,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<any>({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const isStepComplete = (stepIndex: number) => completedSteps.has(stepIndex);
  const isStepActive = (stepIndex: number) => currentStep === stepIndex;
  const isStepAccessible = (stepIndex: number) => 
    stepIndex <= currentStep || completedSteps.has(stepIndex);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Step indicator */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isComplete = isStepComplete(index);
            const isActive = isStepActive(index);
            const isAccessible = isStepAccessible(index);

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`flex flex-col items-center gap-2 flex-1 group ${
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {/* Step circle */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      isComplete
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                        : isActive
                        ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] text-[var(--color-primary)]'
                        : isAccessible
                        ? 'border-[var(--border-medium)] text-[var(--text-secondary)] group-hover:border-[var(--color-primary)]'
                        : 'border-[var(--border-default)] text-[var(--text-tertiary)]'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5" />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)]"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>

                  {/* Step label */}
                  <div className="text-center">
                    <p
                      className={`text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[var(--color-primary)]'
                          : isAccessible
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 hidden sm:block">
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-8">
                    <div
                      className={`h-full transition-colors duration-300 ${
                        isStepComplete(index)
                          ? 'bg-[var(--color-primary)]'
                          : 'bg-[var(--border-default)]'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-6"
      >
        {React.cloneElement(steps[currentStep].content as React.ReactElement, {
          formData,
          updateFormData,
        })}
      </motion.div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
        </div>

        <Button
          variant="primary"
          onClick={handleNext}
          rightIcon={currentStep < steps.length - 1 ? <ChevronRight className="h-4 w-4" /> : undefined}
        >
          {currentStep < steps.length - 1 ? 'Continue' : 'Complete'}
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <div className="w-32 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-primary)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export default StepWizard;

