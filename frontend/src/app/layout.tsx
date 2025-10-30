import { Sora } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@/components/MiniKitProvider";
import { SwipeNavigationProvider } from "@/components/SwipeNavigationProvider";
import ClientProviders from "@/components/ClientProviders";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { ErudaProvider } from "@/providers/Eruda";
import { ViewportHeight } from "@/components/ViewportHeight";

const sora = Sora({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital@0;1&family=Rubik:ital,wght@0,300..900;1,300..900&family=Sora:wght@600&display=swap"
          rel="stylesheet"
        />
    
      </head>
      <body className={sora.className}>
            <ViewportHeight />
            <ClientProviders>
              <MiniKitProvider>
                <ErudaProvider>
                
                  <ConnectionProvider>
                    <div
                      className="app-container"
                      style={{
                        height: "100%",
                        position: "relative",
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      {children}
                    </div>
                  </ConnectionProvider>
                </ErudaProvider>
              </MiniKitProvider>
            </ClientProviders>
      </body>
    </html>
  );
}
