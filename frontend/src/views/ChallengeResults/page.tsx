"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ResultsHeader from "@/entities/Challenges/components/ResultsHeader";
import RankingList from "@/entities/Challenges/components/RankingList";
import styles from "./ChallengeResults.module.css";

interface ChallengeResultsViewProps {
  challengeId?: string;
}

export default function ChallengeResultsView({ challengeId }: ChallengeResultsViewProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Mock data - em produção viria de uma API baseada no challengeId
  const resultsData = {
    title: "MiniApp(Results)",
    challengeName: "Weekly Challenge",
    rankings: [
      { 
        position: 1, 
        name: "Allan Hipolito", 
        id: "user1",
        score: 8750,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "TypeScript",
        languageIcon: "⚡"
      },
      { 
        position: 2, 
        name: "Neymar Jr", 
        id: "user2",
        score: 7200,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "Python",
        languageIcon: "🐍"
      },
      { 
        position: 3, 
        name: "Coutinho", 
        id: "user3",
        score: 6800,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "JavaScript",
        languageIcon: "🚀"
      },
      { 
        position: 4, 
        name: "Dorival Junior", 
        id: "user4",
        score: 5900,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "Java",
        languageIcon: "☕"
      },
      { 
        position: 5, 
        name: "Maria Silva", 
        id: "user5",
        score: 5400,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "React",
        languageIcon: "⚛️"
      },
      { 
        position: 6, 
        name: "João Santos", 
        id: "user6",
        score: 4800,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "Go",
        languageIcon: "🔥"
      },
      { 
        position: 7, 
        name: "Ana Costa", 
        id: "user7",
        score: 4200,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "Rust",
        languageIcon: "🦀"
      },
      { 
        position: 8, 
        name: "Pedro Lima", 
        id: "user8",
        score: 3600,
        maxScore: 10000,
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
        primaryLanguage: "C++",
        languageIcon: "⚙️"
      },
    ]
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header com botão voltar */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
            aria-label="Voltar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M15 18L9 12L15 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Header dos resultados */}
        <ResultsHeader 
          title={resultsData.title}
          challengeName={resultsData.challengeName}
        />

        {/* Lista de ranking */}
        <RankingList 
          rankings={resultsData.rankings}
          title={t("ranking", { defaultValue: "Ranking" })}
        />
      </div>
    </main>
  );
}
