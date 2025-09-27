"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/contexts/NavigationContext";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  const pathname = usePathname();
  const { registerScreen } = useNavigation();

  useEffect(() => {
    // Registra esta tela no contexto de navegação
    registerScreen(pathname || "", children);
  }, [pathname, children, registerScreen]);

  return <>{children}</>;
}
