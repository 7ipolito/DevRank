import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

// GraphQL query para buscar os dados das competições
const GET_MATCHES = gql`
  query GetMatches {
    matchCreateds {
      id
      name
      stake
      durationDays
    }
  }
`;

// Interface para os dados retornados do subgraph
interface MatchCreated {
  id: string;
  name: string;
  stake: string;
  durationDays: string;
}

interface MatchData {
  matchCreateds: MatchCreated[];
}

interface UseMatchDataReturn {
  matches: MatchCreated[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Configuração do link HTTP para o subgraph
// Para configurar a URL, adicione NEXT_PUBLIC_SUBGRAPH_URL no seu .env.local
const SUBGRAPH_URL =
  'https://subgraph.satsuma-prod.com/6597691a01e2/allans-team--951313/worldchain-competition/version/v1.0.0-worldchain/api';

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

// Cliente Apollo configurado para o subgraph
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const useMatchData = (): UseMatchDataReturn => {
  const [matches, setMatches] = useState<MatchCreated[]>([]);
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

      setMatches(data?.matchCreateds || []);
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
