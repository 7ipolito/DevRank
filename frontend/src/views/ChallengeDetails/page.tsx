"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { formatEther, parseEther } from "viem";
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js';
import { useMatchDetail } from "@/hooks/useContractMatchDetail";
import { useConnection } from "@/contexts/ConnectionContext";
import StepProgress from "@/entities/Challenges/components/StepProgress";
import ChallengeInfoCard from "@/entities/Challenges/components/ChallengeInfoCard";
import CountdownTimer from "@/entities/Challenges/components/CountdownTimer";
import StakeSelection from "@/entities/Challenges/components/StakeSelection";
import { WLD_TOKEN_ADDRESS, COMPETITION_CONTRACT_ADDRESS } from "@/config/contracts";
import styles from "./ChallengeDetails.module.css";

interface ChallengeDetailsViewProps {
  challengeId: string;
}

export const COMPETITION_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "PERMIT2_ADDRESS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createMatch",
    "inputs": [
      {
        "name": "_name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_durationDays",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getParticipantCount",
    "inputs": [
      {
        "name": "_matchId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getParticipants",
    "inputs": [
      {
        "name": "_matchId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isParticipant",
    "inputs": [
      {
        "name": "_matchId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinChallenge",
    "inputs": [
      {
        "name": "_challengeId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_stake",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "joinChallengeWithPermit2",
    "inputs": [
      {
        "name": "_challengeId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "permit",
        "type": "tuple",
        "internalType": "struct ISignatureTransfer.PermitTransferFrom",
        "components": [
          {
            "name": "permitted",
            "type": "tuple",
            "internalType": "struct ISignatureTransfer.TokenPermissions",
            "components": [
              {
                "name": "token",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "nonce",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "transferDetails",
        "type": "tuple",
        "internalType": "struct ISignatureTransfer.SignatureTransferDetails",
        "components": [
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "requestedAmount",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "signature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "matchCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "matches",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "stake",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "durationDays",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "active",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "platform",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "wldToken",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "MatchClosed",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "reward",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "platformFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchCreated",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "name",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "durationDays",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PlayerJoined",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "stakeAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  }
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
  const { match, loading, error: matchError, refetch } = useMatchDetail(challengeId);

  // Dados processados da competição
  const challengeData = match ? {
    title: match.name,
    currentStep: currentStep,
    totalSteps: 2,
    details: {
      frequency: "At least ?XP/ 1.5h per day", // Valor padrão por enquanto
      duration: `${match.durationDays.toString()} days`,
      participants: match.participantCount, // Use actual participant count
      totalDeposited: `${formatEther(match.stake)} WLD`,
      endDate: new Date(Date.now() + Number(match.durationDays) * 24 * 60 * 60 * 1000),
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
        console.log('🆔 Challenge ID:', challengeId);
        console.log('💰 Selected stake:', selectedStake);

        // Validate match exists
        if (!match) {
          setError('Challenge not found. Please try again.');
          setIsLoading(false);
          return;
        }
  
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
        // Use the actual match ID from the contract (not the challengeId string)
        const joinTransaction = {
          address: COMPETITION_CONTRACT_ADDRESS,
          abi: COMPETITION_ABI,
          functionName: 'joinChallengeWithPermit2',
          args: [
            match.id.toString(), // Use the actual match ID from the contract
            permitTransfer,
            transferDetails,
            'PERMIT2_SIGNATURE_PLACEHOLDER_0'
          ],
        };
        
        console.log('📋 Transaction details:', {
          matchId: match.id.toString(),
          stakeAmount: stakeAmountWei,
          contract: COMPETITION_CONTRACT_ADDRESS
        });
  
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
          
          // Check for specific error types
          if (finalPayload.error_code === 'disallowed_operation') {
            setError('Transaction contains disallowed operations. Make sure WLD token and contract are configured in World Developer Portal.');
            return { 
              success: false, 
              error: 'Transaction contains disallowed operations. Make sure WLD token and contract are configured in World Developer Portal.' 
            };
          }
          
          if (finalPayload.error_code === 'simulation_failed') {
            setError('Transaction simulation failed. The match may not exist or you may have already joined.');
            return { 
              success: false, 
              error: 'Transaction simulation failed. Please check if the match is still active and you have not already joined.' 
            };
          }
          
          setError(`Transaction failed: ${finalPayload.error_code || 'Unknown error'}`);
          return { success: false, error: `Transaction failed: ${finalPayload.error_code || 'Unknown error'}` };
        }
  
        console.log('✅ Transaction sent:', finalPayload.transaction_id);

        router.push('/challenges');
  
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
        
        // Check for specific errors
        if (error instanceof Error) {
          if (error.message.includes('disallowed_operation')) {
            setError('Transaction contains disallowed operations. Make sure contracts and tokens are configured in World Developer Portal.');
            return { 
              success: false, 
              error: 'Transaction contains disallowed operations. Make sure contracts and tokens are configured in World Developer Portal.' 
            };
          }
          
          if (error.message.includes('simulation') || error.message.includes('Invalid match')) {
            setError('Unable to join challenge. The match may not exist or you may have already joined.');
            return { 
              success: false, 
              error: 'Transaction simulation failed. Please verify the match exists and is active.' 
            };
          }
          
          setError(error.message);
          return { success: false, error: error.message };
        }
        
        setError('Unknown error occurred');
        return { success: false, error: 'Unknown error' };
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
