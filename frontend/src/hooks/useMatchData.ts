import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

// GraphQL query para buscar os dados das competições (entidade Match, não MatchCreated)
const GET_MATCHES = gql`
  query GetMatches {
    matches(orderBy: createdAt, orderDirection: desc) {
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

// Interface para os dados retornados do subgraph
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

interface MatchData {
  matches: Match[];
}

interface UseMatchDataReturn {
  matches: Match[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Configuração do link HTTP para o subgraph
// Para configurar a URL, adicione NEXT_PUBLIC_SUBGRAPH_URL no seu .env.local
const SUBGRAPH_URL =
  'https://subgraph.satsuma-prod.com/6597691a01e2/allans-team--951313/competitions/api';

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

// Cliente Apollo configurado para o subgraph
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const useMatchData = (): UseMatchDataReturn => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await client.query<MatchData>({
        query: GET_MATCHES,
        fetchPolicy: 'network-only', // Sempre busca dados atualizados da rede
      });

      console.log('data', data);
      setMatches(data?.matches || []);
    } catch (err) {
      console.error('Erro ao buscar dados do subgraph:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
