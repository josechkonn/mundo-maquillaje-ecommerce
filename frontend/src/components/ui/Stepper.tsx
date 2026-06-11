interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="flex items-center justify-center mb-8 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-0 min-w-0 shrink-0">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? "bg-success-500 text-white"
                      : isActive
                      ? "bg-brand-400 text-white shadow-lg shadow-brand-200"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs font-semibold mt-1.5 whitespace-nowrap transition-colors ${
                    isActive ? "text-text-base" : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-12 md:w-24 h-0.5 mx-1 sm:mx-2 mt-[-1.25rem] transition-colors shrink-0 ${
                    isCompleted ? "bg-success-500" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
