"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationsHeader from "@/entities/Notifications/components/NotificationsHeader";
import NotificationCard from "@/entities/Notifications/components/NotificationCard";
import styles from "./Notifications.module.css";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'challenge' | 'achievement' | 'system' | 'social';
  isRead: boolean;
}

export default function NotificationsView() {
  const { t } = useTranslation();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Challenge Completed!",
      message: "Congratulations! You've completed the Weekly Challenge and earned 50WLD.",
      time: "2m ago",
      type: "challenge",
      isRead: false,
    },
   
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <NotificationsHeader 
          title={t("notifications", { defaultValue: "Notifications" })}
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
        
        <div className={styles.notificationsList}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <h3 className={styles.emptyTitle}>
                {t("no_notifications", { defaultValue: "No notifications yet" })}
              </h3>
              <p className={styles.emptyMessage}>
                {t("no_notifications_message", { 
                  defaultValue: "When you have notifications, they'll appear here." 
                })}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                time={notification.time}
                type={notification.type}
                isRead={notification.isRead}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
