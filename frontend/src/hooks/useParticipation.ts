import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';

// Query para verificar se um usuário está participando de uma competição
// O ID da participation é matchId-playerAddress (com 0x no endereço)
const CHECK_PARTICIPATION = gql`
  query CheckParticipation($participationId: ID!) {
    participation(id: $participationId) {
      id
      match {
        id
        matchId
        name
        active
      }
      player {
        id
      }
      joinedAt
    }
  }
`;

// Query alternativa que busca através do match e player
const CHECK_PARTICIPATION_BY_MATCH_AND_PLAYER = gql`
  query CheckParticipationByMatchAndPlayer($matchId: ID!, $playerAddress: Bytes!) {
    match(id: $matchId) {
      id
      participants(where: { player: $playerAddress }) {
        id
        player {
          id
        }
        joinedAt
      }
    }
  }
`;

// Query para buscar todas as participações de um usuário
const GET_USER_PARTICIPATIONS = gql`
  query GetUserParticipations($playerAddress: Bytes!) {
    player(id: $playerAddress) {
      id
      matchesJoined
      participations {
        id
        match {
          id
          matchId
          name
          active
          stake
          participantCount
          durationDays
          startTime
        }
        joinedAt
      }
    }
  }
`;

interface Participation {
  id: string;
  match: {
    id: string;
    name: string;
    active: boolean;
  };
  player: {
    id: string;
  };
  joinedAt: string;
}

interface ParticipationData {
  participation: Participation | null;
}

interface PlayerParticipation {
  id: string;
  match: {
    id: string;
    matchId: string;
    name: string;
    active: boolean;
    stake: string;
    participantCount: string;
    durationDays: string;
    startTime: string;
  };
  joinedAt: string;
}

interface PlayerData {
  player: {
    id: string;
    matchesJoined: string;
    participations: PlayerParticipation[];
  } | null;
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
 * Hook para verificar se um usuário está participando de uma competição específica
 * @param matchId - ID da competição (pode ser string numérica ou hex)
 * @param playerAddress - Endereço da carteira do jogador
 */
export const useIsParticipating = (matchId: string | null | undefined, playerAddress: string | null | undefined) => {
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

        // Normaliza o matchId (pode vir como "1" ou "0x1")
        let normalizedMatchId = matchId;
        if (matchId.startsWith('0x')) {
          normalizedMatchId = parseInt(matchId, 16).toString();
        }

        // Normaliza o endereço: garante que tem 0x e está em lowercase
        let normalizedAddress = playerAddress.toLowerCase();
        if (!normalizedAddress.startsWith('0x')) {
          normalizedAddress = '0x' + normalizedAddress;
        }

        // O ID da participation é matchId-playerAddress (matchId como string, address com 0x em lowercase)
        // Exemplo: "1-0xabc123..." (o subgraph usa toHexString() que retorna com 0x)
        const participationId = `${normalizedMatchId}-${normalizedAddress}`;

        console.log('🔍 Checking participation:', { 
          participationId, 
          matchId: normalizedMatchId, 
          playerAddress: normalizedAddress,
          originalPlayerAddress: playerAddress
        });

        // Primeira tentativa: buscar pelo participationId direto
        let participationData: ParticipationData | null = null;
        try {
          const { data } = await client.query<ParticipationData>({
            query: CHECK_PARTICIPATION,
            variables: {
              participationId: participationId,
            },
            fetchPolicy: 'network-only',
          });
          participationData = data || null;
        } catch (queryError) {
          console.warn('Query por participationId falhou, tentando método alternativo:', queryError);
        }

        // Se não encontrou, tenta método alternativo buscando pelo match e player
        if (!participationData?.participation) {
          try {
            const { data: altData } = await client.query<{
              match: {
                id: string;
                participants: Array<{
                  id: string;
                  player: { id: string };
                  joinedAt: string;
                }>;
              } | null;
            }>({
              query: CHECK_PARTICIPATION_BY_MATCH_AND_PLAYER,
              variables: {
                matchId: normalizedMatchId,
                playerAddress: normalizedAddress as `0x${string}`,
              },
              fetchPolicy: 'network-only',
            });

            if (altData?.match?.participants && altData.match.participants.length > 0) {
              // Se encontrou participação pelo método alternativo, cria objeto compatível
              const participant = altData.match.participants[0];
              participationData = {
                participation: {
                  id: participant.id,
                  match: {
                    id: altData.match.id,
                    name: '',
                    active: false,
                  },
                  player: participant.player,
                  joinedAt: participant.joinedAt,
                },
              };
            }
          } catch (altError) {
            console.warn('Método alternativo também falhou:', altError);
          }
        }

        console.log('🔍 Participation data:', participationData);

        const isParticipatingResult = participationData?.participation !== null && participationData?.participation !== undefined;

        setIsParticipating(isParticipatingResult);
        
        if (isParticipatingResult && participationData?.participation) {
          console.log('✅ User is participating:', participationData.participation);
        } else {
          console.log('❌ User is not participating');
        }
      } catch (err) {
        console.error('Erro ao verificar participação:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
 * Hook para buscar todas as competições que um usuário está participando
 * @param playerAddress - Endereço da carteira do jogador
 */
export const useUserParticipations = (playerAddress: string | undefined) => {
  const [participations, setParticipations] = useState<PlayerParticipation[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
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

      const { data } = await client.query<PlayerData>({
        query: GET_USER_PARTICIPATIONS,
        variables: {
          playerAddress: playerAddress.toLowerCase(),
        },
        fetchPolicy: 'network-only',
      });

      if (data?.player) {
        setParticipations(data.player.participations);
        setTotalMatches(parseInt(data.player.matchesJoined));
      } else {
        setParticipations([]);
        setTotalMatches(0);
      }
    } catch (err) {
      console.error('Erro ao buscar participações do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setParticipations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
  }, [playerAddress]);

  return {
    participations,
    totalMatches,
    loading,
    error,
    refetch: fetchParticipations,
  };
};





