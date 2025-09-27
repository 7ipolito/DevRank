"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ChallengesHeader from "@/entities/Challenges/components/ChallengesHeader";
import ChallengeCard from "@/entities/Challenges/components/ChallengeCard";
import { FireIcon } from "@/shared/icons/Fire";
import { PythonIcon } from "@/shared/icons/Python";
import styles from "./Challenges.module.css";

export default function ChallengesView() {
  const { t } = useTranslation();
  const router = useRouter();

  const challenges = [
    {
      id: 1,
      title: "Weekly Challenge",
      stake: "0.01WLD",
      participants: 5,
      prizePool: "5WLD",
      icon: <FireIcon size={40} />,
      borderColor: "blue" as const,
      showResults: false,
    },
    {
      id: 2,
      title: "Python Challenge",
      stake: "0.01WLD",
      participants: 5,
      prizePool: "5WLD",
      icon: <PythonIcon size={40} />,
      borderColor: "green" as const,
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

  return (
    <main className={styles.main}>
      <div className={styles.container}>
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
