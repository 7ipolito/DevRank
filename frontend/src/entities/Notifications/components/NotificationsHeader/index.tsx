import React from 'react';
import styles from './NotificationsHeader.module.css';

interface NotificationsHeaderProps {
  title: string;
  unreadCount: number;
  onMarkAllAsRead?: () => void;
}

export default function NotificationsHeader({ 
  title, 
  unreadCount, 
  onMarkAllAsRead 
}: NotificationsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
        
      </div>
      
    
    </div>
  );
}
