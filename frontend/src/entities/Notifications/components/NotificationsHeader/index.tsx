import React from 'react';
import styles from './NotificationsHeader.module.css';

interface NotificationsHeaderProps {
  title: string;
}

export default function NotificationsHeader({ 
  title, 
}: NotificationsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
        
      </div>
      
    
    </div>
  );
}
