# Contract Hooks - Guia de Uso

Este diretório contém hooks React para interagir diretamente com o smart contract de competições na Worldchain usando viem.

## Hooks Disponíveis

### 1. `useContractMatches` - Buscar todas as competições

Busca todas as competições disponíveis diretamente do contrato na blockchain.

```typescript
import { useContractMatches } from '@/hooks';

function ChallengesPage() {
  const { matches, loading, error, refetch } = useContractMatches();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {matches.map((match) => (
        <div key={match.id}>
          <h3>{match.name}</h3>
          <p>Stake Total: {match.stake}</p>
          <p>Participantes: {match.participantCount}</p>
          <p>Status: {match.active ? 'Ativo' : 'Encerrado'}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. `useMatchDetail` - Buscar detalhes de uma competição específica

Busca os detalhes completos de uma competição pelo ID diretamente do contrato.

```typescript
import { useMatchDetail } from '@/hooks';

function ChallengeDetailsPage({ challengeId }: { challengeId: string }) {
  const { match, loading, error, refetch } = useMatchDetail(challengeId);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!match) return <div>Competição não encontrada</div>;

  return (
    <div>
      <h1>{match.name}</h1>
      <p>Participantes: {match.participantCount}</p>
      <p>Stake Total: {match.stake} WLD</p>
      <p>Duração: {match.durationDays} dias</p>
      <p>Status: {match.active ? 'Ativo' : 'Encerrado'}</p>
      
      <h3>Participantes:</h3>
      <ul>
        {match.participants.map(p => (
          <li key={p.id}>{p.player.id}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Nota:** O hook aceita IDs tanto em formato decimal (`"1"`) quanto hexadecimal (`"0x1"`).

### 3. `useIsParticipating` - Verificar se usuário está participando

```typescript
import { useIsParticipating } from '@/hooks';
import { useAccount } from 'wagmi';

function ChallengeDetails({ matchId }: { matchId: string }) {
  const { address } = useAccount();
  const { isParticipating, loading } = useIsParticipating(matchId, address || '');

  return (
    <div>
      {loading ? (
        <p>Verificando...</p>
      ) : isParticipating ? (
        <button disabled>Já está participando</button>
      ) : (
        <button>Participar da Competição</button>
      )}
    </div>
  );
}
```

### 4. `useUserParticipations` - Buscar todas as participações do usuário

```typescript
import { useUserParticipations } from '@/hooks';
import { useAccount } from 'wagmi';

function MyParticipations() {
  const { address } = useAccount();
  const { participations, totalMatches, loading, error, refetch } = 
    useUserParticipations(address);

  if (loading) return <div>Carregando suas participações...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Minhas Participações ({totalMatches})</h2>
      {participations.map((participation) => (
        <div key={participation.id}>
          <h3>{participation.match.name}</h3>
          <p>Status: {participation.match.active ? 'Ativo' : 'Encerrado'}</p>
          <p>Participantes: {participation.match.participantCount}</p>
          <p>Entrou em: {new Date(parseInt(participation.joinedAt) * 1000).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## Tipos Disponíveis

### Match
```typescript
interface Match {
  id: string;
  matchId: string;
  name: string;
  stake: string;  // Total acumulado em Wei
  durationDays: string;
  startTime: string;  // Unix timestamp
  active: boolean;
  participantCount: string;
  createdAt: string;  // Unix timestamp
  participants: Array<{
    id: string;
    player: { id: string };
    joinedAt: string;
  }>;
}
```

## Funções do Contrato Utilizadas

### Leitura de Matches
```solidity
function matchCount() public view returns (uint256);
function matches(uint256 index) public view returns (Match);
function getParticipantCount(uint256 matchId) public view returns (uint256);
```

### Verificação de Participação
```solidity
function isParticipant(uint256 matchId, address user) public view returns (bool);
function getParticipants(uint256 matchId) public view returns (address[]);
```

## Dicas de Uso

1. **Formatação de valores**: Os valores `stake` vêm como BigInt em Wei. Use `formatEther()` do viem para converter.

2. **Timestamps**: Os campos de tempo são BigInt Unix timestamps. Use `Number(timestamp) * 1000` com `Date()`.

3. **Endereços**: Os endereços são retornados como tipo `Address` do viem.

4. **BigInt**: A maioria dos valores numéricos são BigInt. Converta com `Number()` ou `toString()` quando necessário.

5. **Refetch**: Todos os hooks incluem uma função `refetch()` para atualizar os dados diretamente da blockchain.

## Configuração

Configure o RPC endpoint no arquivo `.env.local`:

```bash
NEXT_PUBLIC_WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS=0x...
```

Para mais detalhes, veja `WORLDCHAIN_CONTRACT_INTEGRATION.md`.