"use client";

import React, { useState } from 'react';
import styles from './StakeSelection.module.css';

interface StakeSelectionProps {
  onStakeSelect: (amount: number) => void;
  selectedStake: number;
}

export default function StakeSelection({ onStakeSelect, selectedStake }: StakeSelectionProps) {
  const stakeOptions = [0.1, 1, 5, 10, 20];

  const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Bet & Enter</h2>
        <p className={styles.subtitle}>
          The more you bet, the more you can win!
        </p>
        <div className={styles.infoIcon}>
          <InfoIcon />
        </div>
      </div>

      <div className={styles.stakeSection}>
        <h3 className={styles.stakeTitle}>Deposit Amount (WLD)</h3>
        
        <div className={styles.stakeOptions}>
          {stakeOptions.map((amount) => (
            <button
              key={amount}
              className={`${styles.stakeButton} ${
                selectedStake === amount ? styles.selected : ''
              }`}
              onClick={() => onStakeSelect(amount)}
            >
              {amount}
            </button>
          ))}
        </div>

        <p className={styles.stakeRange}>
          Required deposit 0.1 - 20 WLD
        </p>

        <div className={styles.disclaimer}>
          <p className={styles.disclaimerText}>
            You can cancel your participation and withdraw the bet amount until the end of the first day of the challenge.
          </p>
        </div>
      </div>
    </div>
  );
}
