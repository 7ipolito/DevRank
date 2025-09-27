import React from 'react';
import styles from './ResultsHeader.module.css';

interface ResultsHeaderProps {
  title: string;
  challengeName: string;
}

export default function ResultsHeader({ title, challengeName }: ResultsHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.challengeInfo}>
        <h2 className={styles.challengeName}>{challengeName}</h2>
      </div>
    </div>
  );
}
