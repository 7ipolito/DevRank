import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/queryClient";
import { MiniKit } from "@worldcoin/minikit-js";

interface UserStatusResponse {
  whoami: {
    _id: string;
    activeCollaborator: boolean;
  };
}

const GET_USER_STATUS = `
  query GetUserStatus($walletAddress: String!) {
    whoami(whoamiInput: { walletAdddress: $walletAddress }) {
      _id
      activeCollaborator
    }
  }
`;

export function useUserStatus() {
  return useQuery({
    queryKey: ["userStatus", MiniKit.user?.walletAddress],
    queryFn: async () => {
      if (!MiniKit.user?.walletAddress) {
        throw new Error("Wallet address not found");
      }

      const data = await graphqlClient.request<UserStatusResponse>(
        GET_USER_STATUS,
        {
          walletAddress: MiniKit.user.walletAddress,
        }
      );

      return data.whoami;
    },
    enabled: !!MiniKit.user?.walletAddress,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}
