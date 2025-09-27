"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SwipeTransition } from "@/components/SwipeTransition";
import { NavigationProvider } from "@/contexts/NavigationContext";

interface SwipeNavigationProviderProps {
  children: ReactNode;
}

export function SwipeNavigationProvider({
  children,
}: SwipeNavigationProviderProps) {
  const pathname = usePathname();

  // Componente interno que decide se aplica a transição ou não
  function TransitionWrapper({ children }: { children: ReactNode }) {
    // Não aplicar a transição na tela de dashboard
    if (pathname === "/dashboard") {
      return <>{children}</>;
    }

    return <SwipeTransition>{children}</SwipeTransition>;
  }

  return (
    <NavigationProvider>
      <TransitionWrapper>{children}</TransitionWrapper>
    </NavigationProvider>
  );
}
