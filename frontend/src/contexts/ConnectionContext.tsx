"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConnectionContextType {
  isConnected: boolean;
  connectionStep: 'initial' | 'form' | 'connected';
  username: string;
  setConnectionStep: (step: 'initial' | 'form' | 'connected') => void;
  setUsername: (username: string) => void;
  connect: (username: string) => void;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [connectionStep, setConnectionStep] = useState<'initial' | 'form' | 'connected'>('initial');
  const [username, setUsername] = useState('');

  const isConnected = connectionStep === 'connected';

  const connect = (newUsername: string) => {
    setUsername(newUsername);
    setConnectionStep('connected');
  };

  const disconnect = () => {
    setUsername('');
    setConnectionStep('initial');
  };

  const value: ConnectionContextType = {
    isConnected,
    connectionStep,
    username,
    setConnectionStep,
    setUsername,
    connect,
    disconnect,
  };

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
