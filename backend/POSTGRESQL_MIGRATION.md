# Migração para PostgreSQL

## ✅ Migração Concluída

O backend foi migrado com sucesso de SQLite para PostgreSQL usando as credenciais fornecidas.

## 🔧 Alterações Realizadas

### 1. **Dependências**
- ✅ Removido: `sqlite3`
- ✅ Adicionado: `pg` e `@types/pg`

### 2. **Configuração do Banco** (`config/database.ts`)
- ✅ Substituído SQLite por PostgreSQL
- ✅ Configurado connection pool
- ✅ Adicionado suporte SSL para Railway
- ✅ Atualizado schema das tabelas para PostgreSQL

### 3. **UserService** (`services/UserService.ts`)
- ✅ Convertido de callbacks SQLite para async/await PostgreSQL
- ✅ Atualizado queries para sintaxe PostgreSQL ($1, $2, etc.)
- ✅ Implementado tratamento de erros adequado

### 4. **Arquivo Principal** (`index.ts`)
- ✅ Atualizado imports
- ✅ Modificado graceful shutdown para PostgreSQL
- ✅ Removido código específico do SQLite

## 🗄️ Schema do Banco

### Tabela `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  github_username VARCHAR(255),
  wallet_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_fetch TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### Tabela `coding_stats`
```sql
CREATE TABLE IF NOT EXISTS coding_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  fetch_date DATE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  new_xp INTEGER DEFAULT 0,
  languages TEXT,
  machines TEXT,
  daily_xp TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔗 String de Conexão

```
postgresql://postgres:mkcdhJHpEmiEApEKfekPjGrPFXuqTRNs@shinkansen.proxy.rlwy.net:47899/railway
```

## 🚀 Como Usar

### Variável de Ambiente (Opcional)
Você pode definir a string de conexão como variável de ambiente:

```bash
export DATABASE_URL="postgresql://postgres:mkcdhJHpEmiEApEKfekPjGrPFXuqTRNs@shinkansen.proxy.rlwy.net:47899/railway"
```

### Iniciar o Servidor
```bash
npm run build
npm start
```

## ✅ Testes Realizados

- ✅ Build funcionando
- ✅ Conexão com PostgreSQL estabelecida
- ✅ Tabelas criadas automaticamente
- ✅ Health check funcionando
- ✅ Graceful shutdown implementado

## 🔄 Principais Diferenças

| Aspecto | SQLite | PostgreSQL |
|---------|--------|------------|
| **Tipo** | Arquivo local | Servidor remoto |
| **Queries** | `?` placeholders | `$1, $2` placeholders |
| **Auto Increment** | `AUTOINCREMENT` | `SERIAL` |
| **Boolean** | `1/0` | `true/false` |
| **Conexão** | Arquivo | Connection Pool |
| **SSL** | N/A | Configurado |

## 🎯 Endpoints Disponíveis

Todos os endpoints continuam funcionando normalmente:

- `POST /api/users` - Criar usuário
- `POST /api/users/wallet` - Criar usuário com wallet
- `GET /api/users` - Listar usuários
- `GET /api/users/:userId/stats` - Estatísticas do usuário
- `POST /api/fetch-stats/:userId` - Buscar estatísticas
- `GET /api/health` - Health check

A migração foi concluída com sucesso! 🎉
