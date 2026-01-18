"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useConnection } from "@/contexts/ConnectionContext";
import { useContractMatches } from "@/hooks/useContractMatches";
import { useIsParticipating } from "@/hooks/useContractParticipation";
import { transformMatchesToChallenges } from "@/utils/transformMatchData";
import ChallengesHeader from "@/entities/Challenges/components/ChallengesHeader";
import ChallengeCard from "@/entities/Challenges/components/ChallengeCard";
import styles from "./Challenges.module.css";

export default function ChallengesView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isConnected, walletAddress } = useConnection();
  const { matches, loading, error, refetch } = useContractMatches();

  // Transforma os dados do contrato no formato esperado pelos componentes
  const challenges = transformMatchesToChallenges(matches);

  const handleJoin = (originalId: string) => {
    router.push(`/challenges/${originalId}`);
  };

  const handleSeeResults = (originalId: string) => {
    // TODO: Implement see results logic - could navigate to results page
    router.push(`/challenges/${originalId}/results`);
  };

  // Componente interno para verificar participação de cada challenge
  function ChallengeCardWithParticipation({ 
    challenge, 
    walletAddress, 
    onJoin, 
    onSeeResults 
  }: { 
    challenge: ReturnType<typeof transformMatchesToChallenges>[0];
    walletAddress: string | undefined;
    onJoin: () => void;
    onSeeResults: () => void;
  }) {
    // Não verifica participação se o desafio estiver completo
    const shouldCheckParticipation = challenge.status !== 'completed' && walletAddress;
    
    // Usa o matchId numérico para verificar a participação diretamente no contrato
    const { isParticipating, loading: participationLoading } = useIsParticipating(
      shouldCheckParticipation ? challenge.matchId : null,
      shouldCheckParticipation ? walletAddress : null
    );

    return (
      <ChallengeCard
        title={challenge.title}
        participants={challenge.participants}
        stake={challenge.stake}
        icon={challenge.icon}
        borderColor={challenge.borderColor}
        status={challenge.status}
        duration={challenge.duration}
        showResults={challenge.showResults}
        isParticipating={isParticipating}
        participationLoading={participationLoading}
        onJoin={challenge.status === 'completed' ? undefined : onJoin}
        onSeeResults={onSeeResults}
      />
    );
  }

  // Se não estiver conectado, redireciona para o dashboard (usando useEffect para evitar hydration error)
  // React.useEffect(() => {
  //   if (!isConnected) {
  //     router.push('/dashboard');
  //   }
  // }, [isConnected, router]);

  // Estado de loading
  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.content}>
          <ChallengesHeader
            title={t("challenges_title", { defaultValue: "Challenges" })}
            subtitle={t("challenges_subtitle", { defaultValue: "Stack WLD and earn tokens!" })}
          />
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>{t("loading_challenges", { defaultValue: "Loading challenges from Worldchain..." })}</p>
          </div>
        </div>
      </main>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.content}>
          <ChallengesHeader
            title={t("challenges_title", { defaultValue: "Challenges" })}
            subtitle={t("challenges_subtitle", { defaultValue: "Stack WLD and earn tokens!" })}
          />
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              {t("error_loading_challenges", { defaultValue: "Error loading challenges:" })} {error}
            </p>
            <button 
              onClick={refetch}
              className={styles.retryButton}
            >
              {t("retry", { defaultValue: "Try Again" })}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Estado sem dados
  if (challenges.length === 0) {
    return (
      <main className={styles.main}>
        <div className={styles.content}>
          <ChallengesHeader
            title={t("challenges_title", { defaultValue: "Challenges" })}
            subtitle={t("challenges_subtitle", { defaultValue: "Stack WLD and earn tokens!" })}
          />
          <div className={styles.emptyState}>
            <p>{t("no_challenges", { defaultValue: "No challenges available at the moment." })}</p>
            <button 
              onClick={refetch}
              className={styles.refreshButton}
            >
              {t("refresh", { defaultValue: "Refresh" })}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <ChallengesHeader
          title={t("challenges_title", { defaultValue: "Challenges" })}
          subtitle={t("challenges_subtitle", { defaultValue: "Stack WLD and earn tokens!" })}
        />
        
        <div className={styles.challengesList}>
          {challenges.map((challenge) => {
            // Componente interno para cada challenge que verifica a participação
            return <ChallengeCardWithParticipation
              key={challenge.id}
              challenge={challenge}
              walletAddress={walletAddress}
              onJoin={() => handleJoin(challenge.originalId)}
              onSeeResults={() => handleSeeResults(challenge.originalId)}
            />;
          })}
        </div>
      </div>
    </main>
  );
}
