# Use uma imagem base do Node.js LTS
FROM node:20-alpine AS base

# Instala pnpm globalmente
RUN npm install -g pnpm

# Instala dependências do sistema necessárias para compilação
RUN apk add --no-cache libc6-compat

# Cria um usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Cria o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Instala as dependências usando pnpm
RUN pnpm install --frozen-lockfile

# Copia o código fonte do frontend
COPY frontend/ .

# Gera o build de produção
RUN pnpm run build

# Cria uma nova imagem para produção
FROM node:20-alpine AS runner
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Cria usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas os arquivos necessários para produção
COPY --from=base /app/public ./public

# Copia os arquivos de build do Next.js
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static

# Define o usuário
USER nextjs

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
