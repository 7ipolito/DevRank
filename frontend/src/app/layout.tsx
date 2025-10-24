import { Sora } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@/components/MiniKitProvider";
import { SwipeNavigationProvider } from "@/components/SwipeNavigationProvider";
import ClientProviders from "@/components/ClientProviders";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { ErudaProvider } from "@/providers/Eruda";

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
        <style>
          {`
            :root {
              --vh: 1vh;
            }
            html, body {
              height: 100%;
              height: calc(var(--vh, 1vh) * 100);
              overflow: hidden;
              position: fixed;
              width: 100%;
              touch-action: manipulation;
            }
            /* Garante que os elementos fixos fiquem realmente fixos */
            .fixed-bottom {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              z-index: 1000;
            }
          `}
        </style>
      </head>
      <body className={sora.className}>
            <ClientProviders>
              <MiniKitProvider>
                <ErudaProvider>
                <SwipeNavigationProvider>
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
                </SwipeNavigationProvider>
                </ErudaProvider>
              </MiniKitProvider>
            </ClientProviders>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Fix para altura em dispositivos móveis
            function setVh() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            window.addEventListener('resize', setVh);
            window.addEventListener('orientationchange', setVh);
            setVh();
          `,
          }}
        />
      </body>
    </html>
  );
}
