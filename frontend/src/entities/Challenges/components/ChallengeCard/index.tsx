import React from 'react';
import styles from './ChallengeCard.module.css';

interface ChallengeCardProps {
  title: string;
  stake: string;
  participants: number;
  prizePool: string;
  icon: React.ReactNode;
  borderColor?: 'blue' | 'green';
  onJoin: () => void;
  onSeeResults?: () => void;
  showResults?: boolean;
}

export default function ChallengeCard({
  title,
  stake,
  participants,
  prizePool,
  icon,
  borderColor = 'blue',
  onJoin,
  onSeeResults,
  showResults = false,
}: ChallengeCardProps) {
  return (
    <div className={`${styles.card} ${styles[borderColor]}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.icon}>
          {icon}
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.label}>Stake:</span>
          <span className={styles.value}>{stake}</span>
        </div>
        
        <div className={styles.detailItem}>
          <span className={styles.label}>Participants:</span>
          <span className={styles.value}>{participants}</span>
        </div>
        
        <div className={styles.detailItem}>
          <span className={styles.label}>Prize pool:</span>
          <span className={styles.prizePool}>{prizePool}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.joinButton}
          onClick={onJoin}
        >
          Join
        </button>
        
        {showResults && onSeeResults && (
          <button 
            className={styles.resultsButton}
            onClick={onSeeResults}
          >
            See results
          </button>
        )}
      </div>
    </div>
  );
}
