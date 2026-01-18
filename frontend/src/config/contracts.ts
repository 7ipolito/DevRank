/**
 * Contract addresses and configuration
 * These values are loaded from environment variables for security
 */

import { defineChain } from 'viem';

// Validate that required environment variables are set
const validateEnvVar = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Please check your .env.local file.`
    );
  }
  return value;
};

// World ID & MiniKit
export const APP_ID = validateEnvVar(
  process.env.NEXT_PUBLIC_APP_ID,
  'NEXT_PUBLIC_APP_ID'
);

// Contract Addresses
export const WLD_TOKEN_ADDRESS = validateEnvVar(
  process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS,
  'NEXT_PUBLIC_WLD_TOKEN_ADDRESS'
) as `0x${string}`;

export const COMPETITION_CONTRACT_ADDRESS = validateEnvVar(
  process.env.NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS,
  'NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS'
) as `0x${string}`;

// Worldchain Mainnet Configuration
export const worldchain = defineChain({
  id: 480,
  name: 'World Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_WORLDCHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/v2/YOUR_KEY'],
    },
    public: {
      http: ['https://worldchain-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Worldscan', 
      url: 'https://worldscan.org' 
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
});

// API Configuration (deprecated - keeping for backwards compatibility)
export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

// RPC Configuration
export const WORLDCHAIN_RPC_URL = 
  process.env.NEXT_PUBLIC_WORLDCHAIN_RPC_URL || 
  'https://worldchain-mainnet.g.alchemy.com/public';

// Helper function to check if all contracts are configured
export const areContractsConfigured = (): boolean => {
  try {
    return !!(
      APP_ID &&
      WLD_TOKEN_ADDRESS &&
      COMPETITION_CONTRACT_ADDRESS
    );
  } catch {
    return false;
  }
};

