import { useState, useEffect, useCallback } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

// GraphQL query para buscar detalhes de uma competição específica
const GET_MATCH_DETAIL = gql`
  query MatchCreated($id: ID!) {
    matchCreated(id: $id) {
      id
      name
      stake
      durationDays
    }
  }
`;

// Interface para os dados retornados do subgraph
interface MatchDetail {
  id: string;
  name: string;
  stake: string;
  durationDays: string;
}

interface MatchDetailData {
  matchCreated: MatchDetail | null;
}

interface UseMatchDetailReturn {
  match: MatchDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Configuração do link HTTP para o subgraph
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 
  'https://subgraph.satsuma-prod.com/6597691a01e2/allans-team--951313/worldchain-competition/version/v1.0.0-worldchain/api';

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

// Cliente Apollo configurado para o subgraph
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const useMatchDetail = (matchId: string | null): UseMatchDetailReturn => {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchDetail = useCallback(async () => {
    if (!matchId) {
      setMatch(null);
      setLoading(false);
      return;
    }

    // Validar e formatar o ID
    let formattedId = matchId.trim();
    
    // Remover prefixo 0x se existir e adicionar novamente para garantir consistência
    if (formattedId.startsWith('0x')) {
      formattedId = formattedId.slice(2);
    }
    
    // Verificar se tem número par de dígitos hexadecimais
    if (formattedId.length % 2 !== 0) {
      setError(`Invalid ID format: odd number of hex digits (${formattedId.length} digits)`);
      setLoading(false);
      return;
    }
    
    // Verificar se contém apenas caracteres hexadecimais válidos
    if (!/^[0-9a-fA-F]+$/.test(formattedId)) {
      setError('Invalid ID format: contains non-hexadecimal characters');
      setLoading(false);
      return;
    }
    
    // Adicionar prefixo 0x de volta
    const finalId = '0x' + formattedId;

    try {
      setLoading(true);
      setError(null);
      
      const { data } = await client.query<MatchDetailData>({
        query: GET_MATCH_DETAIL,
        variables: { id: finalId },
        fetchPolicy: 'network-only', // Sempre busca dados atualizados da rede
      });

      setMatch(data?.matchCreated || null);
    } catch (err) {
      console.error('Erro ao buscar detalhes da competição:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatchDetail();
  }, [fetchMatchDetail]);

  return {
    match,
    loading,
    error,
    refetch: fetchMatchDetail,
  };
};
