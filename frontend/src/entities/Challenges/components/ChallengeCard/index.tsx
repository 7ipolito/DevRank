import React from 'react';
import styles from './ChallengeCard.module.css';

interface ChallengeCardProps {
  title: string;
  stake: string;
  participants: number;
  prizePool: string;
  icon: React.ReactNode | string;
  borderColor?: 'blue' | 'green';
  status?: 'active' | 'completed' | 'upcoming';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: string;
  progress?: number;
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
  status = 'active',
  difficulty = 'Medium',
  duration = '7 days',
  progress = 0,
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
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
            <span className={styles.difficulty} style={{ color: getDifficultyColor(difficulty) }}>
              {difficulty}
            </span>
            <span className={styles.duration}>• {duration}</span>
          </div>
        </div>
       
      </div>

      {/* Progress Bar */}
      {status === 'active' && progress > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>{progress}% complete</span>
        </div>
      )}

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

