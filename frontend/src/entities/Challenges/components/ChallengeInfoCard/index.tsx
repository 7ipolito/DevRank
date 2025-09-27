import React from 'react';
import styles from './ChallengeInfoCard.module.css';

interface ChallengeInfoCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function ChallengeInfoCard({ 
  title, 
  value, 
  icon, 
  highlight = false,
  size = 'medium'
}: ChallengeInfoCardProps) {
  return (
    <div className={`${styles.card} ${styles[size]} ${highlight ? styles.highlight : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
