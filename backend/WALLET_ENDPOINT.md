# Novo Endpoint: Criar Usuário com Wallet Address

## 📍 Endpoint

```
POST /api/users/wallet
```

## 📝 Descrição

Este endpoint permite criar um novo usuário fornecendo o username do Code::Stats e o endereço da wallet.

## 📋 Parâmetros

### Body (JSON)
```json
{
  "username": "string",      // Username do Code::Stats (obrigatório)
  "wallet_address": "string" // Endereço da wallet (obrigatório)
}
```

## ✅ Resposta de Sucesso

```json
{
  "success": true,
  "message": "User with wallet added successfully",
  "userId": 123,
  "wallet_address": "0x1234567890abcdef...",
  "note": "Initial stats fetch scheduled"
}
```

## ❌ Respostas de Erro

### Username não fornecido
```json
{
  "error": "Username is required"
}
```

### Wallet address não fornecido
```json
{
  "error": "Wallet address is required"
}
```

### Erro interno
```json
{
  "error": "Failed to add user with wallet"
}
```

## 🔧 Exemplo de Uso

### cURL
```bash
curl -X POST http://localhost:3000/api/users/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "username": "meu_usuario_codestats",
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/users/wallet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'meu_usuario_codestats',
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
  })
});

const data = await response.json();
console.log(data);
```

### Axios
```javascript
const axios = require('axios');

try {
  const response = await axios.post('http://localhost:3000/api/users/wallet', {
    username: 'meu_usuario_codestats',
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
  });
  
  console.log(response.data);
} catch (error) {
  console.error('Error:', error.response.data);
}
```

## 🔄 Comportamento

1. **Validação**: Verifica se username e wallet_address foram fornecidos
2. **Criação**: Cria o usuário no banco de dados com:
   - `username`: Username fornecido
   - `github_username`: Mesmo valor do username (usado para buscar stats)
   - `wallet_address`: Endereço da wallet fornecido
3. **Stats**: Agenda automaticamente a busca das estatísticas do Code::Stats
4. **Resposta**: Retorna o ID do usuário criado e o endereço da wallet

## 🗄️ Estrutura no Banco

O usuário será salvo na tabela `users` com os seguintes campos:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  github_username TEXT,
  wallet_address TEXT,           -- NOVO CAMPO
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_fetch DATETIME,
  is_active BOOLEAN DEFAULT 1
);
```

## 📊 Diferenças dos Endpoints

| Endpoint | Campos Obrigatórios | Campos Opcionais | Uso |
|----------|-------------------|------------------|-----|
| `POST /api/users` | `username` | `github_username` | Usuário tradicional |
| `POST /api/users/wallet` | `username`, `wallet_address` | - | Usuário com wallet |
