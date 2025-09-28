"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { formatEther } from "viem";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import StepProgress from "@/entities/Challenges/components/StepProgress";
import ChallengeInfoCard from "@/entities/Challenges/components/ChallengeInfoCard";
import CountdownTimer from "@/entities/Challenges/components/CountdownTimer";
import StakeSelection from "@/entities/Challenges/components/StakeSelection";
import styles from "./ChallengeDetails.module.css";

interface ChallengeDetailsViewProps {
  challengeId?: string;
}

export default function ChallengeDetailsView({ challengeId }: ChallengeDetailsViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStake, setSelectedStake] = useState(0.1);
  
  
  // Buscar dados reais da competição do subgraph
  const { match, loading, error, refetch } = useMatchDetail(challengeId || null);

  // Dados processados da competição
  const challengeData = match ? {
    title: match.name,
    currentStep: currentStep,
    totalSteps: 2,
    details: {
      frequency: "At least ?XP/ 1.5h per day", // Valor padrão por enquanto
      duration: `${match.durationDays} days`,
      participants: 2, // Valor simulado por enquanto
      totalDeposited: `${formatEther(BigInt(match.stake))} WLD`,
      endDate: new Date(Date.now() + parseInt(match.durationDays) * 24 * 60 * 60 * 1000),
    }
  } : null;

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Avança para o step 2 (Apostar & Entrar)
      setCurrentStep(2);
    } else {
      // Step 2 - Entrar no desafio e ir para resultados
      console.log("Entrar no desafio com stake:", selectedStake);
      // TODO: Implementar lógica de entrada no desafio (smart contract call)
      
      // Redirecionar para a tela de resultados
      router.push(`/challenges/${challengeId}/results`);
    }
  };

  // Estado de loading
  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
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
            <h1 className={styles.title}>Loading...</h1>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading challenge details...</p>
          </div>
        </div>
      </main>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
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
            <h1 className={styles.title}>Error</h1>
          </div>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>Error loading challenge: {error}</p>
            <button onClick={refetch} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Se não encontrou a competição
  if (!challengeData) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
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
            <h1 className={styles.title}>Challenge Not Found</h1>
          </div>
          <div className={styles.errorContainer}>
            <p>Challenge not found or does not exist.</p>
            <button onClick={() => router.push('/challenges')} className={styles.retryButton}>
              Back to Challenges
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleStakeSelect = (amount: number) => {
    setSelectedStake(amount);
  };

  // Ícone de informação
  const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  );

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
          <h1 className={styles.title}>Join Challenge</h1>
        </div>

        {/* Progresso das etapas */}
        <StepProgress 
          currentStep={currentStep} 
          totalSteps={challengeData.totalSteps} 
        />

        {/* Conteúdo baseado no step atual */}
        {currentStep === 1 ? (
          <>
            {/* Título da seção */}
            <h2 className={styles.sectionTitle}>
              {t("challenge_details", { defaultValue: "Challenge Details" })}
            </h2>


            {/* Grid de informações */}
            <div className={styles.infoGrid}>
              <ChallengeInfoCard
                title="Challenge"
                value={challengeData.title}
                highlight={true}
              />
              
              <ChallengeInfoCard
                title="Daily"
                value={challengeData.details.frequency}
                icon={<InfoIcon />}
              />
              
              <ChallengeInfoCard
                title="Duration"
                value={challengeData.details.duration}
              />
              
              <ChallengeInfoCard
                title="Participants"
                value={challengeData.details.participants.toString()}
              />
              
              <ChallengeInfoCard
                title="Stake Required"
                value={challengeData.details.totalDeposited}
                highlight={true}
              />
              
              <CountdownTimer
                title="First day ends"
                targetDate={challengeData.details.endDate}
              />
            </div>
          </>
        ) : (
          /* Step 2 - Stake Selection */
          <StakeSelection 
            onStakeSelect={handleStakeSelect}
            selectedStake={selectedStake}
          />
        )}

        {/* Botão de ação */}
        <button 
          className={styles.nextButton}
          onClick={handleNext}
        >
          {currentStep === 1 
            ? t("next", { defaultValue: "Next" })
            : t("enter", { defaultValue: "Enter" })
          }
        </button>
      </div>
    </main>
  );
}
