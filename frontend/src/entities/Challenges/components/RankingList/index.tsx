import React from 'react';
import Image from 'next/image';
import styles from './RankingList.module.css';

interface RankingItem {
  position: number;
  name: string;
  id: string;
  score: number;
  maxScore: number;
  avatar: string;
  primaryLanguage: string;
  languageIcon: string;
}

interface RankingListProps {
  rankings: RankingItem[];
  title: string;
}

export default function RankingList({ rankings, title }: RankingListProps) {
  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return styles.first;
      case 2:
        return styles.second;
      case 3:
        return styles.third;
      default:
        return styles.default;
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${position}`;
    }
  };

  const getProgressPercentage = (score: number, maxScore: number) => {
    return Math.min((score / maxScore) * 100, 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      
      <div className={styles.rankingCard}>
        <div className={styles.rankingList}>
          {rankings.map((item) => {
            const progressPercentage = getProgressPercentage(item.score, item.maxScore);
            
            return (
              <div 
                key={`${item.position}-${item.id}`}
                className={`${styles.rankingItem} ${getPositionStyle(item.position)}`}
              >
                {/* Position Badge */}
                <div className={styles.positionBadge}>
                  <span className={styles.positionIcon}>
                    {getPositionIcon(item.position)}
                  </span>
                </div>

                {/* Avatar */}
                <div className={styles.avatarContainer}>
                  <Image
                    src={item.avatar}
                    alt={`${item.name} avatar`}
                    width={40}
                    height={40}
                    className={styles.avatar}
                  />
                </div>

                {/* User Info */}
                <div className={styles.userInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{item.name}</span>
                    <div className={styles.languageTag}>
                      <span className={styles.languageIcon}>{item.languageIcon}</span>
                      <span className={styles.languageName}>{item.primaryLanguage}</span>
                    </div>
                  </div>
                  
                  <div className={styles.scoreRow}>
                    <span className={styles.scoreText}>
                      {item.score.toLocaleString()} / {item.maxScore.toLocaleString()} XP
                    </span>
                    <span className={styles.percentage}>
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
