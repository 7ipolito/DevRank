"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/storage';

interface ConnectionContextType {
  isConnected: boolean;
  connectionStep: 'initial' | 'connected';
  username: string;
  walletAddress: string;
  setConnectionStep: (step: 'initial' | 'connected') => void;
  setUsername: (username: string) => void;
  setWalletAddress: (address: string) => void;
  connect: (username: string, walletAddress?: string) => void;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [connectionStep, setConnectionStep] = useState<'initial' | 'connected'>('initial');
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Carrega o estado do localStorage quando o componente monta
  useEffect(() => {
    const savedConnectionStep = storage.getConnectionStep();
    const savedUsername = storage.getUsername();
    const savedWalletAddress = storage.getWalletAddress() || '';
    
    // Se não há walletAddress salvo, força o estado para 'initial'
    if (!savedWalletAddress && savedConnectionStep === 'connected') {
      setConnectionStep('initial');
      setUsername('');
      setWalletAddress('');
      // Limpa o localStorage inconsistente
      storage.clearAll();
    } else {
      setConnectionStep(savedConnectionStep);
      setUsername(savedUsername);
      setWalletAddress(savedWalletAddress);
    }
    
    setIsInitialized(true);
  }, []);

  const isConnected = connectionStep === 'connected' && !!walletAddress;

  const connect = (newUsername: string, newWalletAddress?: string) => {
    setUsername(newUsername);
    setConnectionStep('connected');
    if (newWalletAddress) {
      setWalletAddress(newWalletAddress);
      storage.setWalletAddress(newWalletAddress);
    }
    // Persiste no localStorage
    storage.setUsername(newUsername);
    storage.setConnectionStep('connected');
  };

  const disconnect = () => {
    setUsername('');
    setWalletAddress('');
    setConnectionStep('initial');
    // Limpa o localStorage
    storage.clearAll();
  };

  // Função para atualizar o connectionStep e persistir
  const updateConnectionStep = (step: 'initial' | 'connected') => {
    setConnectionStep(step);
    storage.setConnectionStep(step);
  };

  // Função para atualizar o username e persistir
  const updateUsername = (newUsername: string) => {
    setUsername(newUsername);
    storage.setUsername(newUsername);
  };

  // Função para atualizar o walletAddress e persistir
  const updateWalletAddress = (address: string) => {
    setWalletAddress(address);
    storage.setWalletAddress(address);
  };

  const value: ConnectionContextType = {
    isConnected,
    connectionStep,
    username,
    walletAddress,
    setConnectionStep: updateConnectionStep,
    setUsername: updateUsername,
    setWalletAddress: updateWalletAddress,
    connect,
    disconnect,
  };

  // Renderiza os children mesmo antes de inicializar para evitar hydration mismatch
  // O conteúdo será atualizado assim que isInitialized for true
  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
