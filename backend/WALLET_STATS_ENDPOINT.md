# Novo Endpoint: Buscar Estatísticas por Wallet Address

## 📍 Endpoint

```
GET /api/users/wallet/:walletAddress/stats
```

## 📝 Descrição

Este endpoint permite buscar as estatísticas de um usuário usando o endereço da wallet em vez do ID do usuário.

## 📋 Parâmetros

### URL Parameters
- `walletAddress` (string, obrigatório): Endereço da wallet do usuário

### Exemplo de URL
```
GET /api/users/wallet/0x1234567890abcdef1234567890abcdef12345678/stats
```

## ✅ Resposta de Sucesso (200)

```json
{
  "success": true,
  "user": {
    "id": 123,
    "username": "meu_usuario_codestats",
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_fetch": "2024-01-15T12:00:00.000Z"
  },
  "stats": [
    {
      "id": 456,
      "user_id": 123,
      "fetch_date": "2024-01-15",
      "total_xp": 50000,
      "new_xp": 1200,
      "created_at": "2024-01-15T12:00:00.000Z",
      "languages": {
        "TypeScript": { "xps": 25000, "new_xps": 500 },
        "Python": { "xps": 15000, "new_xps": 300 },
        "JavaScript": { "xps": 10000, "new_xps": 400 }
      },
      "machines": {
        "Main Workstation": { "xps": 40000, "new_xps": 1000 },
        "Laptop": { "xps": 10000, "new_xps": 200 }
      },
      "daily_xp": {
        "2024-01-15": 1200,
        "2024-01-14": 800,
        "2024-01-13": 1500
      }
    }
  ]
}
```

## ❌ Respostas de Erro

### Wallet address não fornecido (400)
```json
{
  "error": "Wallet address is required"
}
```

### Usuário não encontrado (404)
```json
{
  "error": "User not found with this wallet address"
}
```

### Erro interno (500)
```json
{
  "error": "Failed to fetch stats"
}
```

## 🔧 Exemplo de Uso

### cURL
```bash
curl -X GET "https://devrank-production.up.railway.app/api/users/wallet/0x1234567890abcdef1234567890abcdef12345678/stats"
```

### JavaScript/Fetch
```javascript
const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

const response = await fetch(`https://devrank-production.up.railway.app/api/users/wallet/${walletAddress}/stats`);

if (response.ok) {
  const data = await response.json();
  console.log('User:', data.user);
  console.log('Stats:', data.stats);
} else {
  const error = await response.json();
  console.error('Error:', error);
}
```

### Axios
```javascript
const axios = require('axios');

const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

try {
  const response = await axios.get(`https://devrank-production.up.railway.app/api/users/wallet/${walletAddress}/stats`);
  
  console.log('User:', response.data.user);
  console.log('Stats:', response.data.stats);
} catch (error) {
  console.error('Error:', error.response.data);
}
```

## 🔍 Query SQL Utilizada

O endpoint utiliza um JOIN entre as tabelas `users` e `coding_stats`:

```sql
SELECT cs.* FROM coding_stats cs
INNER JOIN users u ON cs.user_id = u.id
WHERE u.wallet_address = $1 
ORDER BY cs.created_at DESC 
LIMIT 30
```

## 📊 Diferenças dos Endpoints

| Endpoint | Parâmetro | Uso |
|----------|-----------|-----|
| `GET /api/users/:userId/stats` | `userId` (number) | Busca por ID do usuário |
| `GET /api/users/wallet/:walletAddress/stats` | `walletAddress` (string) | Busca por wallet address |

## 🚀 Vantagens do Novo Endpoint

1. **✅ Mais Conveniente**: Frontend pode usar diretamente o wallet address do MiniKit
2. **✅ Sem Necessidade de Lookup**: Não precisa buscar o userId primeiro
3. **✅ Melhor UX**: Uma única chamada para obter dados do usuário e estatísticas
4. **✅ Segurança**: Wallet address é único e identificador natural

## 🔄 Fluxo de Uso no Frontend

```javascript
// No frontend, após login com MiniKit
const walletAddress = MiniKit.user?.walletAddress;

if (walletAddress) {
  // Buscar estatísticas diretamente
  const response = await fetch(`/api/users/wallet/${walletAddress}/stats`);
  
  if (response.ok) {
    const { user, stats } = await response.json();
    // Exibir dados do usuário e estatísticas
  }
}
```

## 🧪 Como Testar

### 1. Criar um usuário com wallet
```bash
curl -X POST https://devrank-production.up.railway.app/api/users/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

### 2. Buscar estatísticas pelo wallet
```bash
curl -X GET "https://devrank-production.up.railway.app/api/users/wallet/0x1234567890abcdef1234567890abcdef12345678/stats"
```

## 📈 Retorno das Estatísticas

- **Últimas 30 entradas** ordenadas por data de criação (mais recente primeiro)
- **Dados do usuário** incluídos na resposta
- **Linguagens de programação** com XP total e novo XP
- **Máquinas utilizadas** com estatísticas
- **XP diário** dos últimos dias

O endpoint está **pronto para uso** e otimizado para integração com wallets! 🎉
