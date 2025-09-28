import { formatEther } from 'viem';

interface MatchCreated {
  matchId: string;
  name: string;
  stake: string;
  durationDays: string;
}

interface ChallengeData {
  id: number;
  title: string;
  stake: string;
  participants: number;
  icon: string;
  borderColor: "blue" | "green";
  status: "active" | "completed" | "upcoming";
  duration: string;
  showResults: boolean;
}

// Função para determinar a cor da borda baseada no matchId
const getBorderColor = (matchId: string): ChallengeData['borderColor'] => {
  const colors: ChallengeData['borderColor'][] = ['blue', 'green'];
  const index = parseInt(matchId) % colors.length;
  return colors[index];
};

// Função para determinar o ícone baseado no nome
const getIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('algorithm') || lowerName.includes('algo')) return '⚡';
  if (lowerName.includes('python')) return '🐍';
  if (lowerName.includes('javascript') || lowerName.includes('js')) return '🟨';
  if (lowerName.includes('react')) return '⚛️';
  if (lowerName.includes('data')) return '📊';
  if (lowerName.includes('ai') || lowerName.includes('ml')) return '🤖';
  return '🏆'; // ícone padrão
};


// Função para simular participantes baseado no matchId
const getParticipants = (matchId: string): number => {
  const base = parseInt(matchId) * 17; // Multiplicador para variar
  return Math.max(20, base % 200 + 50); // Entre 50 e 250 participantes
};


// Função para determinar o status (simulado por enquanto)
const getStatus = (matchId: string): ChallengeData['status'] => {
  const id = parseInt(matchId);
  if (id % 3 === 0) return 'completed';
  if (id % 5 === 0) return 'upcoming';
  return 'active';
};

// Função principal para transformar os dados do subgraph
export const transformMatchesToChallenges = (matches: MatchCreated[]): ChallengeData[] => {
  return matches.map((match) => {
    const participants = getParticipants(match.matchId);
    const status = getStatus(match.matchId);
    
    return {
      id: parseInt(match.matchId),
      title: match.name,
      stake: `${formatEther(BigInt(match.stake))}WLD`,
      participants,
      icon: getIcon(match.name),
      borderColor: getBorderColor(match.matchId),
      status,
      duration: `${match.durationDays} days`,
      showResults: status === 'completed',
    };
  });
};
