# Configuração de Variáveis de Ambiente

## 📝 Instruções

Este projeto utiliza variáveis de ambiente para proteger informações sensíveis como endereços de contratos e chaves de API.

### 1️⃣ Criar o arquivo `.env.local`

Crie um arquivo `.env.local` na raiz da pasta `frontend/` com o seguinte conteúdo:

```bash
# World ID & MiniKit Configuration
NEXT_PUBLIC_APP_ID=app_08b208f4cb48f7b8aec270d4e444367b
NEXT_PUBLIC_WLD_CLIENT_ID=app_08b208f4cb48f7b8aec270d4e444367b

# Contract Addresses (Worldchain Mainnet)
NEXT_PUBLIC_WLD_TOKEN_ADDRESS=0x2cFc85d8E48F8EAB294be644d9E25C3030863003
NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS=0x9c809e623fFf92a11bB328Ed76aD2865dDCE9c48

# API Configuration
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-subgraph-id

# JWT Secret (Server-side only - Change this in production!)
JWT_SECRET=your_secure_jwt_secret_change_in_production

# Node Environment
NODE_ENV=development
```

### 2️⃣ Atualizar os Valores

**⚠️ IMPORTANTE:** Substitua os valores de exemplo pelos seus valores reais:

- `NEXT_PUBLIC_APP_ID`: Seu App ID do World ID (obtido no [World Developer Portal](https://developer.worldcoin.org/))
- `NEXT_PUBLIC_WLD_CLIENT_ID`: Mesmo valor do APP_ID
- `NEXT_PUBLIC_WLD_TOKEN_ADDRESS`: Endereço do token WLD na Worldchain
- `NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS`: Endereço do seu contrato de competição
- `NEXT_PUBLIC_SUBGRAPH_URL`: URL do seu subgraph no The Graph
- `JWT_SECRET`: Uma string secreta forte e aleatória (use apenas em produção)

### 3️⃣ Reiniciar o Servidor

Após criar/atualizar o `.env.local`, reinicie o servidor de desenvolvimento:

```bash
# Parar o servidor atual (Ctrl+C)
# Limpar o cache (opcional mas recomendado)
rm -rf .next

# Iniciar novamente
npm run dev
# ou
pnpm dev
```

## 🔒 Segurança

### ✅ O que está protegido:

- ✅ `.env.local` está no `.gitignore` e **NÃO** será commitado
- ✅ Endereços de contratos não estão mais hardcoded no código
- ✅ Validação automática das variáveis de ambiente
- ✅ Mensagens de erro claras se alguma variável estiver faltando

### ⚠️ Atenção:

- **NUNCA** commite arquivos `.env.local` ou `.env` no Git
- Use `.env.example` para documentar as variáveis necessárias (sem valores reais)
- Em produção, use variáveis de ambiente do seu provedor de hosting (Vercel, Railway, etc.)

## 📦 Arquivo de Configuração Centralizado

Todas as configurações de contratos estão centralizadas em:
```
frontend/src/config/contracts.ts
```

Este arquivo:
- ✅ Carrega as variáveis de ambiente
- ✅ Valida se todas as variáveis necessárias estão definidas
- ✅ Exporta constantes tipadas para uso em toda a aplicação
- ✅ Fornece mensagens de erro claras se algo estiver faltando

## 🔍 Como Usar no Código

```typescript
// ❌ Não faça isso (hardcoded):
const tokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

// ✅ Faça isso (usando a configuração):
import { WLD_TOKEN_ADDRESS } from "@/config/contracts";
const tokenAddress = WLD_TOKEN_ADDRESS;
```

## 🐛 Troubleshooting

### Erro: "Missing required environment variable"

**Causa:** Uma ou mais variáveis de ambiente não estão definidas no `.env.local`

**Solução:**
1. Verifique se o arquivo `.env.local` existe na pasta `frontend/`
2. Verifique se todas as variáveis estão definidas
3. Reinicie o servidor de desenvolvimento

### Variáveis não estão sendo reconhecidas

**Causa:** O servidor não foi reiniciado após criar/atualizar o `.env.local`

**Solução:**
1. Pare o servidor (Ctrl+C)
2. Limpe o cache: `rm -rf .next`
3. Inicie novamente: `npm run dev`

## 📚 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [World ID Documentation](https://docs.worldcoin.org/)
- [Worldchain Documentation](https://world.org/world-chain)

