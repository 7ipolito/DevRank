import { MiniKit } from "@worldcoin/minikit-js";

export const useWalletAddress = async () => {
  try {
    const address = MiniKit.user?.walletAddress;
    console.log("id minikit");

    console.log(address);
    return address;
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return null;
  }
};
