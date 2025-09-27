import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import router from "next/router";
import { MiniKit } from "@worldcoin/minikit-js";

export async function handleLogout() {
  try {
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Tenta limpar o storage mesmo se o logout na API falhar
    // try {
    //   storage.clearWalletAddress();
    //   return { success: true };
    // } catch (finalError) {
    //   console.error("Critical error during logout:", finalError);
    //   return { success: false, error: "Failed to logout" };
    // }
  }
}
