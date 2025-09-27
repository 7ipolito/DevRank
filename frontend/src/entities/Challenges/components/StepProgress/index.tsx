import React from 'react';
import styles from './StepProgress.module.css';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  return (
    <div className={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div 
              className={`${styles.step} ${
                isActive ? styles.active : 
                isCompleted ? styles.completed : styles.inactive
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div className={`${styles.connector} ${
                isCompleted ? styles.connectorCompleted : styles.connectorInactive
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
