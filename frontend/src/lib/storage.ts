export const STORAGE_KEYS = {
  WALLET_ADDRESS: "walletAddress",
  CONNECTION_STEP: "connectionStep",
  USERNAME: "username",
} as const;

export const storage = {
  setWalletAddress: (address: string) => {
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
  },

  getWalletAddress: () => {
    return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
  },

  clearWalletAddress: () => {
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
  },

  setConnectionStep: (step: 'initial' | 'connected') => {
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STEP, step);
  },

  getConnectionStep: (): 'initial' | 'connected' => {
    const step = localStorage.getItem(STORAGE_KEYS.CONNECTION_STEP);
    return (step === 'connected') ? 'connected' : 'initial';
  },

  clearConnectionStep: () => {
    localStorage.removeItem(STORAGE_KEYS.CONNECTION_STEP);
  },

  setUsername: (username: string) => {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  },

  getUsername: () => {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
  },

  clearUsername: () => {
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.CONNECTION_STEP);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
  },
};
