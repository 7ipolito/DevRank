"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { ReactNode, useEffect } from "react";
import { APP_ID } from "@/config/contracts";

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    MiniKit.install(APP_ID);
  }, []);

  return <>{children}</>;
};
