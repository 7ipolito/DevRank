"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { formatEther, parseEther } from "viem";
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js';
import { useMatchDetail } from "@/hooks/useMatchDetail";
import { useConnection } from "@/contexts/ConnectionContext";
import StepProgress from "@/entities/Challenges/components/StepProgress";
import ChallengeInfoCard from "@/entities/Challenges/components/ChallengeInfoCard";
import CountdownTimer from "@/entities/Challenges/components/CountdownTimer";
import StakeSelection from "@/entities/Challenges/components/StakeSelection";
import { WLD_TOKEN_ADDRESS, COMPETITION_CONTRACT_ADDRESS } from "@/config/contracts";
import styles from "./ChallengeDetails.module.css";

interface ChallengeDetailsViewProps {
  challengeId?: string;
}

export const COMPETITION_ABI = [
  {
    type: 'function',
    name: 'challengeCounter',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getChallengeDetails',
    inputs: [{ name: '_challengeId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'entryFee', type: 'uint256' },
      { name: 'totalPool', type: 'uint256' },
      { name: 'participantCount', type: 'uint256' },
      { name: 'winnerCount', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'isCompleted', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'joinChallenge',
    inputs: [{ name: '_challengeId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'joinChallengeWithPermit2',
    inputs: [
      { name: '_challengeId', type: 'uint256' },
      { 
        name: 'permit', 
        type: 'tuple',
        components: [
          {
            name: 'permitted',
            type: 'tuple',
            components: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ]
          },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      },
      {
        name: 'transferDetails',
        type: 'tuple',
        components: [
          { name: 'to', type: 'address' },
          { name: 'requestedAmount', type: 'uint256' }
        ]
      },
      { name: 'signature', type: 'bytes' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createChallenge',
    inputs: [{ name: '_entryFee', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'completeChallenge',
    inputs: [
      { name: '_challengeId', type: 'uint256' },
      { name: '_winners', type: 'address[]' },
      { name: '_signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelChallenge',
    inputs: [{ name: '_challengeId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getChallengeParticipants',
    inputs: [{ name: '_challengeId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getChallengeWinners',
    inputs: [{ name: '_challengeId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isParticipant',
    inputs: [
      { name: '_challengeId', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isWinner',
    inputs: [
      { name: '_challengeId', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserChallenges',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateBackendSigner',
    inputs: [{ name: '_newSigner', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'backendSigner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  // Events
  {
    type: 'event',
    name: 'ChallengeCreated',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'entryFee', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'UserJoinedChallenge',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ChallengeCompleted',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'winnerCount', type: 'uint256', indexed: false },
      { name: 'prizePerWinner', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WinnerVerified',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'prize', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const WLD_TOKEN_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const; 

export default function ChallengeDetailsView({ challengeId }: ChallengeDetailsViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { walletAddress, isConnected } = useConnection();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStake, setSelectedStake] = useState(0.1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar dados reais da competição do subgraph
  const { match, loading, error: matchError, refetch } = useMatchDetail(challengeId || null);

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

  const handleNext = async () => {
    if (currentStep === 1) {
      // Avança para o step 2 (Apostar & Entrar)
      setCurrentStep(2);
    } else {
      console.log('🚀 Joining challenge with MiniKit using Permit2...');
      
      // Step 2 - Entrar no desafio enviando WLD para o contrato
      // Pega o walletAddress do localStorage via ConnectionContext
      const userWalletAddress = walletAddress || MiniKit.user?.walletAddress;
      
      if (!userWalletAddress) {
        setError('Wallet not connected. Please connect your wallet first.');
        return;
      }

      if (!isConnected) {
        setError('Please connect your wallet to join the challenge.');
        return;
      }
  
      try {
        setIsLoading(true);
        setError(null);
        console.log('🚀 Joining challenge with wallet:', userWalletAddress);
  
        // Convert stake amount to wei
        const stakeAmountWei = (parseFloat(selectedStake.toString()) * 10**18).toString();
        
        // Create permit2 transfer for WLD tokens
        const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(); // 30 minutes from now
        
        const permitTransfer = {
          permitted: {
            token: WLD_TOKEN_ADDRESS,
            amount: stakeAmountWei,
          },
          nonce: Date.now().toString(),
          deadline,
        };
  
        // Transfer details - send to our health challenge contract
        const transferDetails = {
          to: COMPETITION_CONTRACT_ADDRESS,
          requestedAmount: stakeAmountWei,
        };
  
        // Call the new joinChallengeWithPermit2 function
        const joinTransaction = {
          address: COMPETITION_CONTRACT_ADDRESS,
          abi: COMPETITION_ABI,
          functionName: 'joinChallengeWithPermit2',
          args: [
            '1',
            permitTransfer,
            transferDetails,
            'PERMIT2_SIGNATURE_PLACEHOLDER_0'
          ],
        };
  
        // Send transaction with permit2
        const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
          transaction: [joinTransaction],
          permit2: [
            {
              ...permitTransfer,
              spender: COMPETITION_CONTRACT_ADDRESS,
            },
          ],
        });
  
        if (finalPayload.status === 'error') {
          console.error('❌ Transaction failed:', finalPayload);
          
          // Check if it's a permission error
          if (finalPayload.error_code === 'disallowed_operation') {
            return { 
              success: false, 
              error: 'Transaction contains disallowed operations. Make sure WLD token and contract are configured in World Developer Portal.' 
            };
          }
          
          return { success: false, error: 'Transaction failed' };
        }
  
        console.log('✅ Transaction sent:', finalPayload.transaction_id);
  
        // // Record participation in database after successful transaction
        // try {
        //   await recordChallengeParticipation(challengeId, address, finalPayload.transaction_id);
        //   console.log('✅ Participation recorded in database');
        // } catch (dbError) {
        //   console.warn('⚠️ Failed to record participation in database:', dbError);
        //   // Don't fail the whole operation if database recording fails
        // }
  
        return { success: true, txId: finalPayload.transaction_id };
  
      } catch (error) {
        console.error('❌ Failed to join challenge:', error);
        
        // Check for specific permission errors
        if (error instanceof Error && error.message.includes('disallowed_operation')) {
          return { 
            success: false, 
            error: 'Transaction contains disallowed operations. Make sure contracts and tokens are configured in World Developer Portal.' 
          };
        }
        
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      } finally {
        setIsLoading(false);
      }
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
  if (matchError) {
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
            <p className={styles.errorMessage}>Error loading challenge: {matchError}</p>
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
          disabled={isLoading || loading}
        >
          {isLoading 
            ? "Processing..." 
            : currentStep === 1 
              ? t("next", { defaultValue: "Next" })
              : t("enter", { defaultValue: "Enter" })
          }
        </button>

        {/* Mostrar erro se houver */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              Error: {error}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
