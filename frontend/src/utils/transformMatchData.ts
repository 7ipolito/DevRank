import { formatEther } from 'viem';

interface MatchCreated {
  id: string;
  name: string;
  stake: string;
  durationDays: string;
}

interface ChallengeData {
  id: number; // ID numérico para uso interno
  originalId: string; // ID original da blockchain para navegação
  title: string;
  stake: string;
  participants: number;
  icon: string;
  borderColor: "blue" | "green";
  status: "active" | "completed" | "upcoming";
  duration: string;
  showResults: boolean;
}

// Função para determinar a cor da borda baseada no id
const getBorderColor = (id: string): ChallengeData['borderColor'] => {
  const colors: ChallengeData['borderColor'][] = ['blue', 'green'];
  // Usar hash do ID para gerar um índice mais consistente
  const hash = id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const index = Math.abs(hash) % colors.length;
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


// Função para simular participantes baseado no id
const getParticipants = (id: string): number => {
  // Usar hash do ID para gerar número consistente de participantes
  const hash = id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.max(20, Math.abs(hash) % 200 + 50); // Entre 50 e 250 participantes
};


// Função para determinar o status (simulado por enquanto)
const getStatus = (id: string): ChallengeData['status'] => {
  // Usar hash do ID para determinar status consistente
  const hash = id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const absHash = Math.abs(hash);
  if (absHash % 3 === 0) return 'completed';
  if (absHash % 5 === 0) return 'upcoming';
  return 'active';
};

// Função principal para transformar os dados do subgraph
export const transformMatchesToChallenges = (matches: MatchCreated[]): ChallengeData[] => {
  return matches.map((match) => {
    const participants = getParticipants(match.id);
    const status = getStatus(match.id);
    
    // Usar hash do ID para gerar um número inteiro consistente
    const hash = match.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return {
      id: Math.abs(hash), // Usar hash como ID numérico
      originalId: match.id, // ID original da blockchain
      title: match.name,
      stake: `${formatEther(BigInt(match.stake))}WLD`,
      participants,
      icon: getIcon(match.name),
      borderColor: getBorderColor(match.id),
      status,
      duration: `${match.durationDays} days`,
      showResults: status === 'completed',
    };
  });
};
