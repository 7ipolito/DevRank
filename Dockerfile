# Use uma imagem base do Node.js LTS
FROM node:20-alpine

# Instala dependências do sistema necessárias para compilação
RUN apk add --no-cache python3 make g++

# Cria um usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Cria o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependências do backend primeiro (para cache do Docker)
COPY backend/package*.json ./backend/

# Define o diretório de trabalho para o backend
WORKDIR /app/backend

# Instala as dependências
RUN npm ci --only=production && npm cache clean --force

# Instala dependências de desenvolvimento para o build
RUN npm install --only=dev

# Copia o código fonte do backend
COPY backend/ .

# Compila a aplicação TypeScript
RUN npm run build

# Remove dependências de desenvolvimento após o build
RUN npm prune --production

# Verifica se o build foi gerado corretamente
RUN ls -la dist/

# Muda a propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente
ENV NODE_ENV=development
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
