# World ID Pay Command Setup

Este projeto foi adaptado para usar o comando Pay do World ID Mini Apps, seguindo as melhores práticas de segurança com endpoints no servidor.

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na pasta `frontend` com as seguintes variáveis:

```env
# Your World ID Mini App ID (get this from the Developer Portal)
APP_ID=your_app_id_here

# Your Developer Portal API Key (get this from the Developer Portal)
DEV_PORTAL_API_KEY=your_api_key_here
```

## Como Obter as Credenciais

1. **APP_ID**: Acesse o [Developer Portal](https://developer.worldcoin.org/) e encontre seu Mini App ID
2. **DEV_PORTAL_API_KEY**: Gere uma API Key no Developer Portal para verificar transações

## Configuração no Developer Portal

1. **Whitelist de Endereços**: Adicione o endereço do seu contrato na whitelist do Developer Portal para segurança
2. **Configuração de Pagamentos**: Certifique-se de que os pagamentos estão habilitados para seu Mini App

## Fluxo de Pagamento Implementado

1. **Iniciar Pagamento** (`/api/initiate-payment`): Gera um UUID único para referência
2. **Executar Pagamento**: Usa o comando `MiniKit.commandsAsync.pay()` no frontend
3. **Confirmar Pagamento** (`/api/confirm-payment`): Verifica a transação via API do Developer Portal

## Segurança

- ✅ Pagamentos são verificados no servidor
- ✅ Referências únicas previnem ataques de replay
- ✅ Verificação via API oficial do World ID
- ✅ Whitelist de endereços para prevenir pagamentos não autorizados

## Próximos Passos

1. Configure as variáveis de ambiente
2. Adicione o endereço do contrato na whitelist
3. Implemente persistência no banco de dados para as referências de pagamento
4. Teste o fluxo completo de pagamento
