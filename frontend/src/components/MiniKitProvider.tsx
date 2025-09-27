"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { ReactNode, useEffect } from "react";

const appId = "app_b193c6ebbba556c51297918a98a282bf";

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    MiniKit.install(appId);
  }, []);

  return <>{children}</>;
};
