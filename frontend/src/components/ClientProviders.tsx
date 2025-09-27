"use client";

import dynamic from "next/dynamic";

const ErudaProvider = dynamic(
  () => import("../providers/Eruda").then((c) => c.ErudaProvider),
  {
    ssr: false,
  }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErudaProvider>{children}</ErudaProvider>;
}
