import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { worldchain, COMPETITION_CONTRACT_ADDRESS } from '@/config/contracts';
import competitionAbi from '@/abi/smartcontract-competitions.json';

// Create a singleton public client for reading contract data
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});

// Interface for detailed match data with participants
export interface ContractMatchDetail {
  id: bigint;
  name: string;
  stake: bigint;
  startTime: bigint;
  durationDays: bigint;
  active: boolean;
  participantCount: number;
  participants: Address[];
}

interface UseMatchDetailReturn {
  match: ContractMatchDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch detailed information about a specific match
 * including the full list of participants
 * 
 * @param matchId - The match ID to fetch (numeric string or bigint)
 */
export const useMatchDetail = (matchId: string | null): UseMatchDetailReturn => {
  const [match, setMatch] = useState<ContractMatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchDetail = async () => {
    if (!matchId) {
      setLoading(false);
      setError('No match ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert matchId to BigInt
      let matchIdBigInt: bigint;
      if (matchId.startsWith('0x')) {
        matchIdBigInt = BigInt(matchId);
      } else {
        matchIdBigInt = BigInt(matchId);
      }

      console.log('🔍 Fetching match detail for ID:', matchIdBigInt.toString());

      // Fetch match basic data
      const matchData = await publicClient.readContract({
        address: COMPETITION_CONTRACT_ADDRESS,
        abi: competitionAbi,
        functionName: 'matches',
        args: [matchIdBigInt],
      }) as [bigint, string, bigint, bigint, bigint, boolean];

      // Fetch full list of participants
      const participants = await publicClient.readContract({
        address: COMPETITION_CONTRACT_ADDRESS,
        abi: competitionAbi,
        functionName: 'getParticipants',
        args: [matchData[0]], // Use the match ID from matchData
      }) as Address[];

      const matchDetail: ContractMatchDetail = {
        id: matchData[0],
        name: matchData[1],
        stake: matchData[2],
        startTime: matchData[3],
        durationDays: matchData[4],
        active: matchData[5],
        participantCount: participants.length, // Get count from array length
        participants,
      };

      console.log('✅ Match detail fetched:', matchDetail);
      setMatch(matchDetail);
    } catch (err) {
      console.error('❌ Error fetching match detail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMatch(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetail();
  }, [matchId]);

  return {
    match,
    loading,
    error,
    refetch: fetchMatchDetail,
  };
};
