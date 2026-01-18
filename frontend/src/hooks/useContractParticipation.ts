import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { worldchain, COMPETITION_CONTRACT_ADDRESS } from '@/config/contracts';
import competitionAbi from '@/abi/smartcontract-competitions.json';

// Create a singleton public client for reading contract data
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});

/**
 * Hook to check if a user is participating in a specific match
 * Uses the contract's isParticipant function
 * 
 * @param matchId - The match ID (numeric, not hex)
 * @param playerAddress - The player's wallet address
 */
export const useIsParticipating = (
  matchId: string | null | undefined,
  playerAddress: string | null | undefined
) => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkParticipation = async () => {
      if (!matchId || !playerAddress) {
        setLoading(false);
        setIsParticipating(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Normalize address
        let normalizedAddress = playerAddress.toLowerCase();
        if (!normalizedAddress.startsWith('0x')) {
          normalizedAddress = '0x' + normalizedAddress;
        }

        // Convert matchId to BigInt
        let matchIdBigInt: bigint;
        if (matchId.startsWith('0x')) {
          matchIdBigInt = BigInt(matchId);
        } else {
          matchIdBigInt = BigInt(matchId);
        }

        console.log('🔍 Checking participation:', {
          matchId: matchIdBigInt.toString(),
          playerAddress: normalizedAddress,
        });

        // Try to check participation, but handle errors gracefully
        try {
          const participating = await publicClient.readContract({
            address: COMPETITION_CONTRACT_ADDRESS,
            abi: competitionAbi,
            functionName: 'isParticipant',
            args: [matchIdBigInt, normalizedAddress as Address],
          }) as boolean;

          console.log(participating ? '✅ User is participating' : '❌ User is not participating');
          setIsParticipating(participating);
        } catch (contractErr) {
          // If contract call fails (e.g., invalid match ID), assume not participating
          console.warn('⚠️ Could not check participation (match may not exist yet):', contractErr);
          setIsParticipating(false);
        }
      } catch (err) {
        console.error('❌ Error checking participation:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsParticipating(false);
      } finally {
        setLoading(false);
      }
    };

    checkParticipation();
  }, [matchId, playerAddress]);

  return { isParticipating, loading, error };
};

/**
 * Hook to fetch all participants of a specific match
 * 
 * @param matchId - The match ID to fetch participants for
 */
export const useMatchParticipants = (matchId: string | null | undefined) => {
  const [participants, setParticipants] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    if (!matchId) {
      setLoading(false);
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

      console.log('👥 Fetching participants for match:', matchIdBigInt.toString());

      // Call the contract's getParticipants function
      const participantsList = await publicClient.readContract({
        address: COMPETITION_CONTRACT_ADDRESS,
        abi: competitionAbi,
        functionName: 'getParticipants',
        args: [matchIdBigInt],
      }) as Address[];

      console.log('✅ Fetched participants:', participantsList);
      setParticipants(participantsList);
    } catch (err) {
      console.error('❌ Error fetching participants:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [matchId]);

  return {
    participants,
    loading,
    error,
    refetch: fetchParticipants,
  };
};

/**
 * Hook to fetch all matches that a user is participating in
 * Note: This requires iterating through all matches and checking participation
 * 
 * @param playerAddress - The player's wallet address
 */
export const useUserParticipations = (playerAddress: string | undefined) => {
  const [participatingMatchIds, setParticipatingMatchIds] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipations = async () => {
    if (!playerAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Normalize address
      let normalizedAddress = playerAddress.toLowerCase();
      if (!normalizedAddress.startsWith('0x')) {
        normalizedAddress = '0x' + normalizedAddress;
      }

      console.log('🔍 Fetching participations for:', normalizedAddress);

      // Step 1: Get total match count
      const matchCount = await publicClient.readContract({
        address: COMPETITION_CONTRACT_ADDRESS,
        abi: competitionAbi,
        functionName: 'matchCount',
      }) as bigint;

      // Step 2: Check participation in each match
      const participationChecks: Promise<{ matchId: bigint; isParticipating: boolean }>[] = [];

      for (let i = 0n; i < matchCount; i++) {
        const checkPromise = (async () => {
          try {
            // First get the match to get its actual ID
            const matchData = await publicClient.readContract({
              address: COMPETITION_CONTRACT_ADDRESS,
              abi: competitionAbi,
              functionName: 'matches',
              args: [i],
            }) as [bigint, string, bigint, bigint, bigint, boolean];

            const actualMatchId = matchData[0];

            // Then check participation with the actual match ID
            const participating = await publicClient.readContract({
              address: COMPETITION_CONTRACT_ADDRESS,
              abi: competitionAbi,
              functionName: 'isParticipant',
              args: [actualMatchId, normalizedAddress as Address],
            }) as boolean;

            return { matchId: actualMatchId, isParticipating: participating };
          } catch (err) {
            console.warn(`⚠️ Could not check participation for match ${i}:`, err);
            return { matchId: i, isParticipating: false };
          }
        })();

        participationChecks.push(checkPromise);
      }

      const results = await Promise.all(participationChecks);
      const participatingIds = results
        .filter(r => r.isParticipating)
        .map(r => r.matchId);

      console.log('✅ User is participating in matches:', participatingIds.map(id => id.toString()));
      setParticipatingMatchIds(participatingIds);
    } catch (err) {
      console.error('❌ Error fetching user participations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setParticipatingMatchIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
  }, [playerAddress]);

  return {
    participatingMatchIds,
    totalMatches: participatingMatchIds.length,
    loading,
    error,
    refetch: fetchParticipations,
  };
};
