// components/DashInfo.tsx
import Image from "next/image";

import styles from "./DashList.module.css";

export default function DashInfo() {
  const currentScore = 7500; // Score atual do usuário
  const maxScore = 10000; // Score máximo possível
  const progressPercentage = (currentScore / maxScore) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <Image
          src="https://avatars.githubusercontent.com/u/45522944?v=4" // foto do usuário
          alt="User profile"
          width={72}
          height={72}
          className={styles.avatar}
        />

        <div className={styles.headerInfo}>
          <span className={styles.pullRequests}>
            34 Pull Requests
          </span>
          <span className={styles.commits}>
            800 Commits 🚀
          </span>
        </div>
      </div> */}

      {/* <p className={styles.progressText}>
        🔥 13% better than yesterday
      </p> */}

      <div className={styles.scoreSection}>
        <div className={styles.scoreTitleRow}>
          <p className={styles.scoreTitle}>
            Code Score
          </p>
          <span className={styles.scoreValue}>
            {currentScore.toLocaleString()} / {maxScore.toLocaleString()}
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
            <div className={styles.scorePercentage}>
              {Math.round(progressPercentage)}% of maximum
            </div>
      </div>
    </div>
    </div>
  );
}
