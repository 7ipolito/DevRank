"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
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

  // Mock data - em produção viria de uma API baseada no challengeId
  const challengeData = {
    title: "Join Challenge",
    currentStep: currentStep,
    totalSteps: 2,
    details: {
      frequency: "At least ?XP/ 1.5h per day",
      duration: "7 days",
      participants: 2,
      totalDeposited: "2 WLD",
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 21 days from now
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Avança para o step 2 (Apostar & Entrar)
      setCurrentStep(2);
    } else {
      console.log("Entrar no desafio com stake:", selectedStake);
      // TODO: Implementar lógica final de entrada no desafio
    }
  };

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
          <h1 className={styles.title}>{challengeData.title}</h1>
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
                title="Total Deposited"
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
