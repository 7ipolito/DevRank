import React from 'react';
import styles from './NotificationCard.module.css';

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'challenge' | 'achievement' | 'system' | 'social';
  isRead: boolean;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationCard({ 
  id, 
  title, 
  message, 
  time, 
  type, 
  isRead,
  onMarkAsRead 
}: NotificationCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'challenge':
        return '🏆';
      case 'achievement':
        return '🎉';
      case 'system':
        return '⚙️';
      case 'social':
        return '👥';
      default:
        return '📢';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'challenge':
        return styles.challenge;
      case 'achievement':
        return styles.achievement;
      case 'system':
        return styles.system;
      case 'social':
        return styles.social;
      default:
        return styles.default;
    }
  };

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  return (
    <div 
      className={`${styles.card} ${!isRead ? styles.unread : styles.read} ${getTypeColor()}`}
      onClick={handleClick}
    >
      <div className={styles.iconContainer}>
        <span className={styles.typeIcon}>{getTypeIcon()}</span>
        {!isRead && <div className={styles.unreadDot} />}
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.time}>{time}</span>
        </div>
        
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
