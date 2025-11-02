# Correção de Rotas - Backend

## 🐛 Problema Identificado

**Erro:** `Cannot GET /api/users/wallet/0x414f9c8d7bb92d91c1d897fa0df4d5d5477593ed/stats`

### Causa Raiz

O arquivo `src/index.ts` estava **importando** o router de rotas mas **não estava usando** ele:

```typescript
import routes from './routes';  // ✅ Importado

// ... mas nunca chamava app.use('/', routes) ❌
```

Resultado: As rotas definidas em `src/routes/userRoutes.ts` (incluindo a rota wallet stats) **não estavam sendo registradas**.

## ✅ Solução Implementada

Adicionado o uso do router no `index.ts`:

```typescript
// Use routes from routes folder (includes all user management routes)
app.use('/', routes);
```

## 📋 Rotas Agora Disponíveis

### ✅ Rotas de Usuários (via UserController)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users` | Criar novo usuário |
| POST | `/api/users/wallet` | Criar usuário com carteira |
| GET | `/api/users` | Listar todos os usuários |
| GET | `/api/users/:userId/stats` | Obter estatísticas por ID |
| **GET** | **`/api/users/wallet/:walletAddress/stats`** | **Obter estatísticas por carteira** ✨ |
| POST | `/api/fetch-stats/:userId` | Forçar atualização de stats |
| POST | `/api/admin/update-all-users` | Atualizar todos os usuários |

### 🏥 Rotas de Sistema

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |

## ⚠️ Nota sobre Rotas Duplicadas

Atualmente existem **rotas duplicadas** no `index.ts`:
- Rotas inline definidas diretamente no `app`
- Rotas do `UserController` através do router

**Exemplo de duplicação:**
```typescript
// Rota inline no index.ts (antiga)
app.post('/api/users', async (req, res) => { ... });

// Rota no UserController (nova e correta)
router.post('/users', UserController.createUser);
```

### 🔧 Recomendação

As rotas inline devem ser **removidas** no futuro para evitar conflitos. Por enquanto, ambas funcionam, mas a prioridade é da primeira rota registrada.

## 🧪 Como Testar

### 1. Iniciar o servidor

```bash
cd backend
npm run build
npm start
```

### 2. Testar a rota de wallet stats

```bash
curl http://localhost:3000/api/users/wallet/0x414f9c8d7bb92d91c1d897fa0df4d5d5477593ed/stats
```

**Resposta esperada:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "joao123",
    "wallet_address": "0x414f9c8d7bb92d91c1d897fa0df4d5d5477593ed",
    "created_at": "2025-11-02T12:00:00.000Z",
    "last_fetch": "2025-11-02T13:00:00.000Z"
  },
  "stats": [
    {
      "user_id": 1,
      "total_xp": 45230,
      "new_xp": 120,
      "fetch_date": "2025-11-02",
      "languages": { ... },
      "machines": { ... }
    }
  ]
}
```

## 📊 Estrutura de Rotas

```
src/
├── index.ts                # Servidor principal - agora usa o router
├── routes/
│   ├── index.ts           # Router principal (/api prefix)
│   └── userRoutes.ts      # Rotas de usuários
└── controllers/
    └── UserController.ts   # Controllers com lógica de negócio
```

## 🔄 Próximos Passos (Refatoração Recomendada)

1. [ ] Remover rotas duplicadas do `index.ts`
2. [ ] Mover todas as rotas inline para controllers apropriados
3. [ ] Criar CompetitionController para rotas de competições
4. [ ] Implementar métodos no SmartContractService
5. [ ] Reativar endpoints de competições

## 🐛 Se o erro persistir

1. **Reinicie o servidor backend**
   ```bash
   # Parar o servidor (Ctrl+C)
   npm run build
   npm start
   ```

2. **Verifique se o servidor está rodando**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Verifique os logs do servidor**
   - Deve aparecer: "✅ Cron job scheduled: Stats fetch every 12 hours"
   - Deve listar todos os endpoints disponíveis

4. **Teste com outro wallet address**
   ```bash
   curl http://localhost:3000/api/users/wallet/SEU_WALLET_ADDRESS/stats
   ```

## 📝 Arquivos Modificados

- ✅ `backend/src/index.ts` - Adicionado `app.use('/', routes)`

## 💡 Dica

Se você criar novos endpoints no futuro, adicione-os em:
1. `src/controllers/UserController.ts` (ou crie novo controller)
2. `src/routes/userRoutes.ts` (ou crie novo arquivo de rotas)

**Não adicione rotas inline** no `index.ts` - use sempre o padrão de controllers e rotas separados!

