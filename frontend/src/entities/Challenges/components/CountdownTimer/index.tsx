"use client";

import React, { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  title: string;
  targetDate: Date;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ title, targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.timeDisplay}>
        <div className={styles.timeUnit}>
          <span className={styles.timeValue}>{formatTime(timeLeft.hours)}</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.timeUnit}>
          <span className={styles.timeValue}>{formatTime(timeLeft.minutes)}</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.timeUnit}>
          <span className={styles.timeValue}>{formatTime(timeLeft.seconds)}</span>
        </div>
      </div>
    </div>
  );
}
