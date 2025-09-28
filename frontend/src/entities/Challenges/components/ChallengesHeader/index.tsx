import React from 'react';
import styles from './ChallengesHeader.module.css';

interface ChallengesHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ChallengesHeader({
  title = "Challenges",
  subtitle = "Stack WLD and earn tokens!"
}: ChallengesHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
