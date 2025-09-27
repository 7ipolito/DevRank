"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type ScreenCache = {
  [path: string]: {
    component: ReactNode;
    timestamp: number;
  };
};

interface NavigationContextType {
  previousScreen: ReactNode | null;
  currentScreen: ReactNode | null;
  registerScreen: (path: string, component: ReactNode) => void;
  navigateBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [screenHistory, setScreenHistory] = useState<string[]>([]);
  const [screenCache, setScreenCache] = useState<ScreenCache>({});
  const [currentScreen, setCurrentScreen] = useState<ReactNode | null>(null);
  const [previousScreen, setPreviousScreen] = useState<ReactNode | null>(null);

  // Rastreia o histórico de navegação
  useEffect(() => {
    if (!pathname) return;

    setScreenHistory((prev) => {
      // Evita duplicar a mesma tela no histórico
      if (prev[prev.length - 1] === pathname) return prev;
      return [...prev, pathname];
    });

    // Atualiza a tela atual e anterior baseado no histórico
    const currentCached = screenCache[pathname]?.component || null;
    setCurrentScreen(currentCached || children);

    // Encontra a tela anterior no histórico
    if (screenHistory.length > 1) {
      const prevPath = screenHistory[screenHistory.length - 2];
      const prevCached = screenCache[prevPath]?.component || null;
      setPreviousScreen(prevCached);
    }
  }, [pathname, children, screenCache, screenHistory]);

  // Limpa o cache antigo para economizar memória
  useEffect(() => {
    const now = Date.now();
    const MAX_AGE = 5 * 60 * 1000; // 5 minutos

    setScreenCache((prev) => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach((path) => {
        if (now - newCache[path].timestamp > MAX_AGE) {
          delete newCache[path];
        }
      });
      return newCache;
    });
  }, [pathname]);

  const registerScreen = (path: string, component: ReactNode) => {
    setScreenCache((prev) => ({
      ...prev,
      [path]: {
        component,
        timestamp: Date.now(),
      },
    }));
  };

  const navigateBack = () => {
    if (screenHistory.length > 1) {
      router.back();
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        previousScreen,
        currentScreen,
        registerScreen,
        navigateBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
