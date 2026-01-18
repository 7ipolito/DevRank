import { formatEther } from 'viem';
import type { ContractMatch } from '@/hooks/useContractMatches';

interface ChallengeData {
  id: number; // ID numérico para uso interno
  originalId: string; // ID original da blockchain para navegação (match.id as string)
  matchId: string; // matchId numérico para verificação de participação
  title: string;
  participants: number;
  stake: string; // Stake formatado (ex: "0.5 WLD")
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

// Função para formatar o stake
const formatStake = (stakeWei: string): string => {
  try {
    const stakeEther = formatEther(BigInt(stakeWei));
    const stakeNumber = parseFloat(stakeEther);
    
    // Formatar com até 4 casas decimais, removendo zeros desnecessários
    if (stakeNumber === 0) return '0 WLD';
    if (stakeNumber < 0.0001) return '< 0.0001 WLD';
    
    return `${stakeNumber.toFixed(4).replace(/\.?0+$/, '')} WLD`;
  } catch (error) {
    console.error('Error formatting stake:', error);
    return '0 WLD';
  }
};

// Função para determinar o status baseado no campo active
const getStatus = (active: boolean): ChallengeData['status'] => {
  return active ? 'active' : 'completed';
};

// Função principal para transformar os dados do contrato
export const transformMatchesToChallenges = (matches: ContractMatch[]): ChallengeData[] => {
  return matches.map((match) => {
    const participants = match.participantCount || 0;
    const status = getStatus(match.active);
    
    // Use the match ID directly as a number
    const matchIdString = match.id.toString();
    
    return {
      id: Number(match.id), // Convert BigInt to number for internal use
      originalId: matchIdString, // Match ID as string for navigation
      matchId: matchIdString, // Match ID for participation checks
      title: match.name,
      participants,
      stake: formatStake(match.stake.toString()),
      icon: getIcon(match.name),
      borderColor: getBorderColor(matchIdString),
      status,
      duration: `${match.durationDays.toString()} days`,
      showResults: status === 'completed',
    };
  });
};
