import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { worldchain, COMPETITION_CONTRACT_ADDRESS } from '@/config/contracts';
import competitionAbi from '@/abi/smartcontract-competitions.json';

// Interface for Match data returned from contract
export interface ContractMatch {
  id: bigint;
  name: string;
  stake: bigint;
  startTime: bigint;
  durationDays: bigint;
  active: boolean;
  participantCount: number;
}

interface UseContractMatchesReturn {
  matches: ContractMatch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Create a singleton public client for reading contract data
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});

/**
 * Hook to fetch all matches directly from the Competition contract using viem
 * Replaces the subgraph implementation with direct blockchain reads
 */
export const useContractMatches = (): UseContractMatchesReturn => {
  const [matches, setMatches] = useState<ContractMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔗 Fetching matches from contract:', COMPETITION_CONTRACT_ADDRESS);

      // Step 1: Get the total number of matches from the contract
      const matchCount = await publicClient.readContract({
        address: COMPETITION_CONTRACT_ADDRESS,
        abi: competitionAbi,
        functionName: 'matchCount',
      }) as bigint;

      console.log('📊 Total matches in contract:', matchCount.toString());

      if (matchCount === 0n) {
        setMatches([]);
        return;
      }

      // Step 2: Fetch each match data
      const matchPromises: Promise<ContractMatch>[] = [];
      
      for (let i = 0n; i < matchCount; i++) {
        const matchPromise = (async () => {
          // Fetch match basic data
          const matchData = await publicClient.readContract({
            address: COMPETITION_CONTRACT_ADDRESS,
            abi: competitionAbi,
            functionName: 'matches',
            args: [i],
          }) as [bigint, string, bigint, bigint, bigint, boolean];

          // Try to fetch participant count, but don't fail if it reverts
          let participantCount = 0;
          try {
            const participants = await publicClient.readContract({
              address: COMPETITION_CONTRACT_ADDRESS,
              abi: competitionAbi,
              functionName: 'getParticipants',
              args: [matchData[0]], // Use the match ID from the match data
            }) as Address[];
            participantCount = participants.length;
          } catch (err) {
            console.warn(`⚠️ Could not fetch participants for match ${i}:`, err);
            // Keep participantCount as 0 if fetching fails
          }

          return {
            id: matchData[0],
            name: matchData[1],
            stake: matchData[2],
            startTime: matchData[3],
            durationDays: matchData[4],
            active: matchData[5],
            participantCount,
          };
        })();

        matchPromises.push(matchPromise);
      }

      // Wait for all matches to be fetched
      const fetchedMatches = await Promise.all(matchPromises);

      console.log('✅ Fetched matches:', fetchedMatches);
      setMatches(fetchedMatches);
    } catch (err) {
      console.error('❌ Error fetching matches from contract:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
};
