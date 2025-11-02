# Sistema de Atualização Automática de Usuários

## 📋 Resumo

O backend foi atualizado para **atualizar automaticamente os dados de todos os usuários a cada 12 horas**, conforme solicitado.

## 🔄 Mudanças Implementadas

### 1. Cron Job Atualizado (a cada 12 horas)

**Arquivo:** `src/config/cron.ts`

- **Antes:** Executava 1x por dia (às 02:00 UTC)
- **Agora:** Executa 2x por dia (00:00 e 12:00 UTC)

**Padrão Cron:** `'0 */12 * * *'`

#### Melhorias Adicionadas:

- ✅ Logging detalhado com contadores de sucesso/falha
- ✅ Medição de tempo de execução
- ✅ Tratamento de erros individual por usuário
- ✅ Indicação do próximo horário de atualização

### 2. Novo Endpoint de Admin

**Rota:** `POST /api/admin/update-all-users`

Permite forçar a atualização manual de todos os usuários, útil para:
- Testes
- Atualizações imediatas
- Debug

**Resposta de exemplo:**
```json
{
  "success": true,
  "message": "Batch update completed",
  "stats": {
    "total": 10,
    "success": 8,
    "failed": 2,
    "duration": "15.3s",
    "startTime": "2025-11-02T12:00:00.000Z",
    "endTime": "2025-11-02T12:00:15.300Z"
  },
  "results": [
    {
      "userId": 1,
      "username": "joao123",
      "status": "success",
      "totalXp": 45230
    },
    {
      "userId": 2,
      "username": "maria456",
      "status": "no_stats",
      "message": "No stats found"
    }
  ]
}
```

### 3. Correções de Segurança

- ✅ Validação de `user.id` antes de usar (evita erros de undefined)
- ✅ Tratamento de erros individual por usuário (um erro não para toda a atualização)
- ✅ Logs detalhados para debugging

## 📅 Cronograma de Atualizações

| Horário (UTC) | Ação |
|---------------|------|
| 00:00 | Atualização automática |
| 12:00 | Atualização automática |
| A qualquer momento | Atualização manual via API |

## 🚀 Como Usar

### Executar o Backend

```bash
cd backend
npm run build
npm start
```

### Forçar Atualização Manual

```bash
curl -X POST http://localhost:3000/api/admin/update-all-users
```

## 📊 Logs Esperados

Quando o cron job executar, você verá logs como:

```
🔄 Starting data update at 2025-11-02T12:00:00.000Z
📊 Found 10 active users to update
✅ Successfully updated joao123 - XP: 45230
✅ Successfully updated maria456 - XP: 38120
⚠️  No stats found for pedro789
✅ Successfully updated ana321 - XP: 52400
❌ Error updating carlos654: Network timeout

✨ Update completed in 12.5s
   Success: 8 | Failed: 2 | Total: 10
   Next update: 2025-11-03T00:00:00.000Z
```

## 🔧 Configurações

### Alterar Frequência do Cron

Edite `src/config/cron.ts`:

```typescript
// A cada 12 horas (padrão atual)
cron.schedule('0 */12 * * *', ...)

// A cada 6 horas
cron.schedule('0 */6 * * *', ...)

// A cada 24 horas (1x por dia)
cron.schedule('0 0 * * *', ...)

// A cada 1 hora
cron.schedule('0 * * * *', ...)
```

## 📝 Arquivos Modificados

1. ✅ `backend/src/config/cron.ts` - Atualizado de 24h para 12h
2. ✅ `backend/src/controllers/UserController.ts` - Novo método `updateAllUsersStats`
3. ✅ `backend/src/routes/userRoutes.ts` - Nova rota de admin
4. ✅ `backend/src/index.ts` - Logs atualizados

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar autenticação no endpoint de admin
- [ ] Implementar rate limiting
- [ ] Adicionar notificações quando a atualização completar
- [ ] Dashboard para visualizar histórico de atualizações
- [ ] Webhook para notificar sobre falhas

## ⚠️ Nota Importante

Os endpoints de competições foram temporariamente comentados pois os métodos correspondentes ainda não foram implementados no `SmartContractService`. Para reativá-los, implemente os seguintes métodos:

- `createCompetition()`
- `getActiveCompetitions()`
- `getCompetition()`
- `getParticipants()`
- `endCompetition()`
- `getContractInfo()`
- `getLeaderboard()`

## 🐛 Debug

Se as atualizações não estiverem acontecendo:

1. Verifique se o cron job foi inicializado (veja os logs de startup)
2. Verifique o timezone do servidor
3. Execute a atualização manual para testar: `POST /api/admin/update-all-users`
4. Verifique os logs do aplicativo para erros

## 📞 Suporte

Para problemas ou dúvidas sobre o sistema de atualização automática, verifique:
- Logs do servidor
- Status do cron job
- Conexão com a API do Code::Stats

