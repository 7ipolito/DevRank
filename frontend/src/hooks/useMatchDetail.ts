import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

// Query para buscar uma competição específica
const GET_MATCH_DETAIL = gql`
  query GetMatchDetail($matchId: ID!) {
    match(id: $matchId) {
      id
      matchId
      name
      stake
      durationDays
      startTime
      active
      participantCount
      createdAt
      participants {
        id
        player {
          id
        }
        joinedAt
      }
    }
  }
`;

interface Match {
  id: string;
  matchId: string;
  name: string;
  stake: string;
  durationDays: string;
  startTime: string;
  active: boolean;
  participantCount: string;
  createdAt: string;
  participants: Array<{
    id: string;
    player: {
      id: string;
    };
    joinedAt: string;
  }>;
}

interface MatchDetailData {
  match: Match | null;
}

interface UseMatchDetailReturn {
  match: Match | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SUBGRAPH_URL =
  'https://subgraph.satsuma-prod.com/6597691a01e2/allans-team--951313/competitions/api';

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

/**
 * Hook para buscar detalhes de uma competição específica
 * @param matchId - ID da competição (pode ser string numérica como "1" ou hex)
 */
export const useMatchDetail = (matchId: string | null): UseMatchDetailReturn => {
  const [match, setMatch] = useState<Match | null>(null);
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

      // O ID no subgraph é simplesmente o matchId como string
      // Se receber "1", usar "1"
      // Se receber "0x1", converter para "1"
      let normalizedId = matchId;
      
      // Se começar com 0x, é hex, converter para decimal
      if (matchId.startsWith('0x')) {
        normalizedId = parseInt(matchId, 16).toString();
      }

      console.log('🔍 Fetching match detail for ID:', normalizedId);
      
      const { data } = await client.query<MatchDetailData>({
        query: GET_MATCH_DETAIL,
        variables: {
          matchId: normalizedId,
        },
        fetchPolicy: 'network-only',
      });

      if (data?.match) {
        setMatch(data.match);
        console.log('✅ Match found:', data.match);
      } else {
        setError('Match not found');
        console.warn('⚠️ Match not found for ID:', normalizedId);
      }
    } catch (err) {
      console.error('❌ Error fetching match detail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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
