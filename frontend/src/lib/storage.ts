export const STORAGE_KEYS = {
  WALLET_ADDRESS: "walletAddress",
  CONNECTION_STEP: "connectionStep",
  USERNAME: "username",
} as const;

export const storage = {
  setWalletAddress: (address: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
    }
  },

  getWalletAddress: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
    }
    return null;
  },

  clearWalletAddress: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    }
  },

  setConnectionStep: (step: 'initial' | 'connected') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONNECTION_STEP, step);
    }
  },

  getConnectionStep: (): 'initial' | 'connected' => {
    if (typeof window !== 'undefined') {
      const step = localStorage.getItem(STORAGE_KEYS.CONNECTION_STEP);
      return (step === 'connected') ? 'connected' : 'initial';
    }
    return 'initial';
  },

  clearConnectionStep: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CONNECTION_STEP);
    }
  },

  setUsername: (username: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    }
  },

  getUsername: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
    }
    return '';
  },

  clearUsername: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
    }
  },

  clearAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.CONNECTION_STEP);
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
    }
  },
};
