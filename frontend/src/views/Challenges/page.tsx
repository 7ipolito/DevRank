"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useConnection } from "@/contexts/ConnectionContext";
import ChallengesHeader from "@/entities/Challenges/components/ChallengesHeader";
import ChallengeCard from "@/entities/Challenges/components/ChallengeCard";
import styles from "./Challenges.module.css";

export default function ChallengesView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isConnected, disconnect } = useConnection();

  const challenges = [
    {
      id: 1,
      title: "Weekly Algorithm Challenge",
      stake: "0.01WLD",
      participants: 127,
      prizePool: "12.7WLD",
      icon: "⚡",
      borderColor: "blue" as const,
      status: "active" as const,
      difficulty: "Hard" as const,
      duration: "7 days",
      progress: 65,
      showResults: false,
    },
    {
      id: 2,
      title: "Python Data Structures",
      stake: "0.005WLD",
      participants: 89,
      prizePool: "8.9WLD",
      icon: "🐍",
      borderColor: "green" as const,
      status: "completed" as const,
      difficulty: "Medium" as const,
      duration: "5 days",
      progress: 42,
      showResults: true,
    },
  ];

  const handleJoin = (challengeId: number) => {
    router.push(`/challenges/${challengeId}`);
  };

  const handleSeeResults = (challengeId: number) => {
    console.log(`Viewing results for challenge ${challengeId}`);
    // TODO: Implement see results logic - could navigate to results page
    router.push(`/challenges/${challengeId}/results`);
  };

  // Se não estiver conectado, redireciona para o dashboard
  if (!isConnected) {
    router.push('/dashboard');
    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <ChallengesHeader
          title={t("challenges_title", { defaultValue: "Challenges" })}
          subtitle={t("challenges_subtitle", { defaultValue: "Stack WLD and earn tokens!" })}
        />
        
        <div className={styles.challengesList}>
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              title={challenge.title}
              stake={challenge.stake}
              participants={challenge.participants}
              prizePool={challenge.prizePool}
              icon={challenge.icon}
              borderColor={challenge.borderColor}
              status={challenge.status}
              difficulty={challenge.difficulty}
              duration={challenge.duration}
              progress={challenge.progress}
              showResults={challenge.showResults}
              onJoin={() => handleJoin(challenge.id)}
              onSeeResults={() => handleSeeResults(challenge.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
