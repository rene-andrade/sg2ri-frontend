import React from 'react';

export function Stepper({ steps, currentStep }) {
  return (
    <div className="nr-stepper">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div className="nr-step" key={label}>
            <div className={`nr-step-line ${isDone ? 'nr-step-line--done' : ''}`}></div>
            <div
              className={`nr-step-circle ${
                isDone ? 'nr-step-circle--done' : isActive ? 'nr-step-circle--active' : ''
              }`}
            >
              {isDone ? <i className="bi bi-check-lg"></i> : stepNumber}
            </div>
            <span
              className={`nr-step-label ${
                isDone ? 'nr-step-label--done' : isActive ? 'nr-step-label--active' : ''
              }`}
            >
              {stepNumber}. {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
