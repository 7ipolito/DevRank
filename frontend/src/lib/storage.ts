export const STORAGE_KEYS = {
  WALLET_ADDRESS: "walletAddress",
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
};
