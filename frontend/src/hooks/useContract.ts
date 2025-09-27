// hooks/useContract.ts
import { useState, useEffect } from "react";
import { ethers, BrowserProvider, Contract } from "ethers"; // Importação atualizada
import ForwardABI from "../abi/Forward.json";

export const useContract = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          throw new Error("Por favor, instale o MetaMask");
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Nova sintaxe para provider e signer
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const forwardContract = new Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          ForwardABI,
          signer
        );

        setContract(forwardContract);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao inicializar contrato"
        );
        setContract(null);
      } finally {
        setLoading(false);
      }
    };

    initContract();

    const handleAccountsChanged = () => {
      initContract();
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const makePayment = async (recipient: string, amount: string) => {
    if (!contract) throw new Error("Contrato não inicializado");

    try {
      // Nova sintaxe para parseEther
      const tx = await contract.pay(recipient, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Erro ao fazer pagamento:", err);
      throw err;
    }
  };

  return {
    contract,
    error,
    loading,
    makePayment,
  };
};

// Tipos para TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
