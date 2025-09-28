#!/bin/bash

# Script para build e deploy do frontend Next.js

echo "🚀 Iniciando build do frontend Next.js..."

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Navega para o diretório do frontend
cd frontend

# Build da imagem Docker
echo "📦 Construindo imagem Docker..."
docker build -t devrank-frontend:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "🐳 Para executar o container:"
    echo "   docker run -p 3000:3000 devrank-frontend:latest"
    echo ""
    echo "🌐 A aplicação estará disponível em: http://localhost:3000"
else
    echo "❌ Erro no build da imagem Docker"
    exit 1
fi
