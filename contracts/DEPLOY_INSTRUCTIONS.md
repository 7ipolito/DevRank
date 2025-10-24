# Deploy para Worldchain Sepolia

## Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na pasta `contracts` com o seguinte conteúdo:

```bash
# Sua chave privada da carteira (com ou sem prefixo 0x)
PRIVATE_KEY=sua_chave_privada_aqui
# ou
PRIVATE_KEY=0xsua_chave_privada_aqui

# API Key do Worldscan (opcional, para verificação do contrato)
WORLDSCAN_API_KEY=sua_api_key_aqui
```

## Passos para Deploy

1. **Obter ETH de teste**: Acesse o [faucet da Worldchain Sepolia](https://www.alchemy.com/faucets/world-chain-sepolia)

2. **Configurar variáveis**: Edite o arquivo `.env` com suas credenciais

3. **Fazer o deploy**:
   ```bash
   forge script script/DeployWorldchain.s.sol:DeployWorldchainScript --rpc-url worldchain_sepolia --broadcast --verify
   ```

## Comandos Alternativos

### Deploy simples (sem verificação):
```bash
forge script script/DeployWorldchain.s.sol:DeployWorldchainScript --rpc-url worldchain_sepolia --broadcast
```

### Deploy usando forge create:
```bash
forge create src/Competition.sol:Competition --rpc-url worldchain_sepolia --private-key $PRIVATE_KEY --constructor-args $(cast wallet address --private-key $PRIVATE_KEY) 0x0000000000000000000000000000000000000000
```

## Verificação do Contrato

Após o deploy, verifique o contrato no Worldscan:
```bash
forge verify-contract <ENDERECO_DO_CONTRATO> src/Competition.sol:Competition --chain worldchain_sepolia --etherscan-api-key $WORLDSCAN_API_KEY
```

## Notas Importantes

- **Chave Privada**: Funciona com ou sem prefixo "0x" (o script adiciona automaticamente se necessário)
- **WLD Token**: Atualmente usando endereço mock `0x0000000000000000000000000000000000000000`
- **Segurança**: Nunca compartilhe sua chave privada
- **Gas**: Certifique-se de ter ETH suficiente para as taxas de gas
