/**
 * Contract addresses and configuration
 * These values are loaded from environment variables for security
 */

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
);

export const COMPETITION_CONTRACT_ADDRESS = validateEnvVar(
  process.env.NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS,
  'NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS'
);

// API Configuration
export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

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

