import React from 'react';
import styles from './ChallengeCard.module.css';

interface ChallengeCardProps {
  title: string;
  stake: string;
  participants: number;
  icon: React.ReactNode | string;
  borderColor?: 'blue' | 'green';
  status?: 'active' | 'completed' | 'upcoming';
  duration?: string;
  onJoin: () => void;
  onSeeResults?: () => void;
  showResults?: boolean;
}

export default function ChallengeCard({
  title,
  stake,
  participants,
  icon,
  borderColor = 'blue',
  status = 'active',
  duration = '7 days',
  onJoin,
  onSeeResults,
  showResults = false,
}: ChallengeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'upcoming': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`${styles.card} ${styles[borderColor]} ${styles[status]}`}>
      {/* Status Badge */}
      <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(status) }}>
        {status === 'active' ? '●' : status === 'completed' ? '✓' : '○'} {status}
      </div>

      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.metaInfo}>
            <span className={styles.duration}>{duration}</span>
          </div>
        </div>
       
      </div>


      <div className={styles.details}>
        <div className={styles.detailRow}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Stake:</span>
            <span className={styles.value}>{stake}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.label}>Participants:</span>
            <span className={styles.value}>{participants}</span>
          </div>
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

