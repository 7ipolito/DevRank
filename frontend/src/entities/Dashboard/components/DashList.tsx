// components/DashInfo.tsx
import styles from "./DashList.module.css";

interface DashInfoProps {
  totalXp?: number;
  newXp?: number;
  loading?: boolean;
}

export default function DashInfo({ totalXp = 0, newXp = 0, loading = false }: DashInfoProps) {
  const maxScore = 5000; // Score máximo possível (ajustável)
  const progressPercentage = totalXp > 0 ? Math.min((totalXp / maxScore) * 100, 100) : 0;

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
            {loading ? (
              "Loading..."
            ) : (
              <>
                {totalXp.toLocaleString()} / {maxScore.toLocaleString()} XP
                {newXp > 0 && (
                  <span className={styles.newXpBadge}> +{newXp}</span>
                )}
              </>
            )}
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className={styles.scorePercentage}>
          {loading ? (
            "Calculating..."
          ) : totalXp > 0 ? (
            `${Math.round(progressPercentage)}% progress`
          ) : (
            "No data available"
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
