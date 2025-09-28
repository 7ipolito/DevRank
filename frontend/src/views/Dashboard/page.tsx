"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import DashInfo from "@/entities/Dashboard/components/DashList";
import { useConnection } from "@/contexts/ConnectionContext";
import styles from "./Dashboard.module.css";
import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";

interface UserStats {
  id: number;
  user_id: number;
  fetch_date: string;
  total_xp: number;
  new_xp: number;
  created_at: string;
  languages: Record<string, { xps: number; new_xps: number }>;
  machines: Record<string, { xps: number; new_xps: number }>;
  daily_xp: Record<string, number>;
}

interface ApiResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    wallet_address: string;
    created_at: string;
    last_fetch: string;
  };
  stats: UserStats[];
}

// Mapeamento de linguagens para badges do shields.io
const languageBadges: Record<string, { color: string; logo?: string }> = {
  'JavaScript': { color: 'F7DF1E', logo: 'javascript' },
  'TypeScript': { color: '3178C6', logo: 'typescript' },
  'Python': { color: '3776AB', logo: 'python' },
  'Java': { color: 'ED8B00', logo: 'openjdk' },
  'Rust': { color: '000000', logo: 'rust' },
  'Go': { color: '00ADD8', logo: 'go' },
  'C++': { color: '00599C', logo: 'cplusplus' },
  'C': { color: 'A8B9CC', logo: 'c' },
  'C#': { color: '239120', logo: 'csharp' },
  'PHP': { color: '777BB4', logo: 'php' },
  'Ruby': { color: 'CC342D', logo: 'ruby' },
  'Swift': { color: 'FA7343', logo: 'swift' },
  'Kotlin': { color: '7F52FF', logo: 'kotlin' },
  'Dart': { color: '0175C2', logo: 'dart' },
  'HTML': { color: 'E34F26', logo: 'html5' },
  'CSS': { color: '1572B6', logo: 'css' },
  'SCSS': { color: 'CF649A', logo: 'sass' },
  'Vue': { color: '4FC08D', logo: 'vuedotjs' },
  'React': { color: '61DAFB', logo: 'react' },
  'Angular': { color: 'DD0031', logo: 'angular' },
  'Node.js': { color: '339933', logo: 'nodedotjs' },
  'Docker': { color: '2496ED', logo: 'docker' },
  'Kubernetes': { color: '326CE5', logo: 'kubernetes' },
  'JSON': { color: '000000', logo: 'json' },
  'YAML': { color: 'CB171E', logo: 'yaml' },
  'Shell': { color: '89E051', logo: 'gnubash' },
  'Bash': { color: '4EAA25', logo: 'gnubash' },
  'PowerShell': { color: '5391FE', logo: 'powershell' },
  'SQL': { color: '336791', logo: 'postgresql' },
  'MongoDB': { color: '47A248', logo: 'mongodb' },
  'Redis': { color: 'DC382D', logo: 'redis' },
  'GraphQL': { color: 'E10098', logo: 'graphql' },
  'Markdown': { color: '000000', logo: 'markdown' },
  'Git': { color: 'F05032', logo: 'git' },
  'Linux': { color: 'FCC624', logo: 'linux' },
  'Ubuntu': { color: 'E95420', logo: 'ubuntu' },
  'Windows': { color: '0078D6', logo: 'windows' },
  'macOS': { color: '000000', logo: 'apple' },
};

// Função para normalizar nomes de linguagens similares
const normalizeLanguageName = (language: string): string => {
  const normalized = language.toLowerCase().trim();
  
  // Mapeamento de variações para nomes padrão
  const languageVariations: Record<string, string> = {
    'typescript(jsx)': 'TypeScript',
    'typescript jsx': 'TypeScript',
    'tsx': 'TypeScript',
    'javascript(jsx)': 'JavaScript',
    'javascript jsx': 'JavaScript',
    'jsx': 'JavaScript',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'cpp': 'C++',
    'c++': 'C++',
    'csharp': 'C#',
    'c#': 'C#',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'node': 'Node.js',
    'reactjs': 'React',
    'react.js': 'React',
    'vuejs': 'Vue',
    'vue.js': 'Vue',
    'angularjs': 'Angular',
    'angular.js': 'Angular',
    'bash': 'Shell',
    'sh': 'Shell',
    'zsh': 'Shell',
    'powershell': 'PowerShell',
    'ps1': 'PowerShell',
    'dockerfile': 'Docker',
    'yaml': 'YAML',
    'yml': 'YAML',
    'json': 'JSON',
    'html5': 'HTML',
    'css3': 'CSS',
    'sass': 'SCSS',
    'scss': 'SCSS',
    'less': 'CSS',
    'stylus': 'CSS',
    'postgresql': 'SQL',
    'postgres': 'SQL',
    'mysql': 'SQL',
    'sqlite': 'SQL',
    'mongodb': 'MongoDB',
    'mongo': 'MongoDB',
    'redis': 'Redis',
    'graphql': 'GraphQL',
    'gql': 'GraphQL',
    'markdown': 'Markdown',
    'md': 'Markdown',
    'git': 'Git',
    'github': 'Git',
    'gitlab': 'Git',
    'linux': 'Linux',
    'ubuntu': 'Ubuntu',
    'debian': 'Linux',
    'centos': 'Linux',
    'fedora': 'Linux',
    'windows': 'Windows',
    'win': 'Windows',
    'macos': 'macOS',
    'mac': 'macOS',
    'osx': 'macOS',
    'ios': 'Swift',
    'android': 'Java',
    'kotlin': 'Kotlin',
    'dart': 'Dart',
    'flutter': 'Dart',
    'swift': 'Swift',
    'objective-c': 'Swift',
    'objc': 'Swift',
    'ruby': 'Ruby',
    'rb': 'Ruby',
    'php': 'PHP',
    'go': 'Go',
    'golang': 'Go',
    'rust': 'Rust',
    'rs': 'Rust',
    'java': 'Java',
    'scala': 'Java',
    'clojure': 'Java',
    'groovy': 'Java',
  };
  
  return languageVariations[normalized] || language;
};

// Função para verificar se uma linguagem tem ícone disponível
const hasIcon = (language: string): boolean => {
  const normalizedLanguage = normalizeLanguageName(language);
  const config = languageBadges[normalizedLanguage];
  return config && config.logo ? true : false;
};

// Função para gerar URL do badge (apenas se tiver ícone)
const generateBadgeUrl = (language: string): string | null => {
  const normalizedLanguage = normalizeLanguageName(language);
  const config = languageBadges[normalizedLanguage];
  
  // Só retorna URL se tiver ícone
  if (config && config.logo) {
    return `https://img.shields.io/badge/-${config.color}?style=flat-square&logo=${config.logo}&logoColor=white`;
  }
  
  // Retorna null se não tiver ícone
  return null;
};

function DashboardView() {
  const { t } = useTranslation();
  const { 
    connectionStep, 
    setConnectionStep, 
    connect,
    username,
    setUsername,
    walletAddress,
    setWalletAddress,
    disconnect
  } = useConnection();

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar estatísticas do usuário
  const fetchUserStats = async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wallet/${walletAddress}/stats`);
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.success && data.stats.length > 0) {
          // Pega as estatísticas mais recentes (primeiro item)
          setUserStats(data.stats[0]);
        } else {
          setError('No stats found for this user');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user stats');
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to connect to the API');
    } finally {
      setLoading(false);
    }
  };

  // Effect para buscar estatísticas quando o usuário estiver conectado
  useEffect(() => {
    if (connectionStep === 'connected') {
      // Usa o walletAddress do MiniKit se disponível, senão usa o do contexto (localStorage)
      const addressToUse = MiniKit.user?.walletAddress || walletAddress;
      
      if (addressToUse) {
        fetchUserStats(addressToUse);
        
        // Se o MiniKit tem o walletAddress mas o contexto não, atualiza o contexto
        if (MiniKit.user?.walletAddress && !walletAddress) {
          setWalletAddress(MiniKit.user.walletAddress);
        }
      }
    }
  }, [connectionStep, walletAddress]);

  // Effect adicional para verificar se o MiniKit está pronto quando o app é reaberto
  useEffect(() => {
    if (connectionStep === 'connected' && walletAddress && !userStats && !loading) {
      // Se estamos conectados, temos walletAddress salvo, mas não temos dados e não estamos carregando
      // Isso pode indicar que o app foi reaberto e precisamos recarregar os dados
      const timer = setTimeout(() => {
        fetchUserStats(walletAddress);
      }, 1000); // Aguarda 1 segundo para o MiniKit inicializar

      return () => clearTimeout(timer);
    }
  }, [connectionStep, walletAddress, userStats, loading]);

  const walletAuthInput = (nonce: string): WalletAuthInput => {
    return {
      nonce,
      requestId: "0",
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      statement:
        "This is my statement and here is a link https://worldcoin.com/apps",
    };
  };

  const handleConnect = async () => {
  
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/nonce`);
      const { nonce } = await res.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
        walletAuthInput(nonce)
      );

      if (finalPayload.status === "error") {
        console.log("Wallet auth failed");
        setError("Wallet authentication failed");
        return;
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload,
            nonce,
          }),
        });

        if (response.status === 200) {
          if (!MiniKit.user?.walletAddress) {
            console.log("Wallet address is missing.");
            setError("Wallet address not available");
            return;
          }

          // SUCCESS - Criar usuário na API usando MiniKit.user.username
          try {
            const createUserResponse = await fetch(process.env.NEXT_PUBLIC_API_URL+"/users/wallet", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: MiniKit.user.username,
                wallet_address: MiniKit.user.walletAddress
              })
            });

            if (createUserResponse.ok) {
              const userData = await createUserResponse.json();
              console.log('User created successfully:', userData);
              
              // Atualizar o username e walletAddress no contexto e conectar
              const currentWalletAddress = MiniKit.user.walletAddress;
              connect("7ipolito", currentWalletAddress);
            } else {
              const errorData = await createUserResponse.json();
              console.error('Error creating user:', errorData);
              setError(errorData.error || 'Failed to create user');
            }
          } catch (apiError) {
            console.error('API call error:', apiError);
            setError('Failed to connect to the API');
          }
        } else {
          setError('Authentication failed');
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // TODO: Integrate share action (X/Twitter API or navigator.share)
    console.log("Shared on X!");
  };

  const handleLogout = () => {
    // Limpa todos os dados do localStorage e reseta o estado
    disconnect();
    setUserStats(null);
    setError(null);
  };

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>
                Dashboard
              </h1>
              <p className={styles.subtitle}>Register your stats and earn tokens!</p>
            </div>
            {connectionStep === 'connected' && walletAddress && (
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Logout"
              >
                ×
              </button>
            )}
          </div>
        </header>

        {(connectionStep === 'initial' || !walletAddress) && (
          <div>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleConnect}
              className={styles.connectButton}
              disabled={loading}
            >
              {loading 
                ? t("connecting", { defaultValue: "Connecting..." })
                : t("connect_codestats_cta", { defaultValue: "Connect CodeStats" })
              }
            </button>
          </div>
        )}

        {connectionStep === 'connected' && walletAddress && (
          <div className={styles.detailsWrapper}>
            <DashInfo 
              totalXp={userStats?.total_xp || 0}
              newXp={userStats?.new_xp || 0}
              loading={loading}
            />

            <div className={styles.languagesCard}>
              <h2 className={styles.languagesTitle}>
                {t("languages_title", { defaultValue: "Most Used Languages" })}
              </h2>

              {loading && (
                <div className={styles.loadingMessage}>
                  Loading your stats...
                </div>
              )}

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              {userStats && !loading && !error && (
                <>
                  <ul className={styles.languageList}>
                    {Object.entries(userStats.languages)
                      .sort(([,a], [,b]) => b.xps - a.xps) // Ordena por XP (maior primeiro)
                      .slice(0, 5) // Mostra apenas os top 5
                      .map(([language, data]) => (
                        <li key={language} className={styles.languageItem}>
                          <div className={styles.languageInfo}>
                            {hasIcon(language) && (
                              <img 
                                src={generateBadgeUrl(language)!}
                                alt={`${normalizeLanguageName(language)} badge`}
                                className={styles.languageBadge}
                                loading="lazy"
                              />
                            )}
                            <span className={styles.languageName}>{language}</span>
                          </div>
                          <span className={styles.languageValue}>
                            {data.xps.toLocaleString()} XP
                            {data.new_xps > 0 && (
                              <span className={styles.newXpSmall}> (+{data.new_xps})</span>
                            )}
                          </span>
                        </li>
                      ))}
                  </ul>

                  {Object.keys(userStats.languages).length === 0 && (
                    <div className={styles.noDataMessage}>
                      No language data available yet. Start coding to see your stats!
                    </div>
                  )}
                </>
              )}

              {!userStats && !loading && !error && (
                <div className={styles.noDataMessage}>
                  No stats available yet. Make sure you have Code::Stats data for your username.
                </div>
              )}

              <button
                type="button"
                onClick={handleShare}
                className={styles.shareButton}
                disabled={loading || !!error}
              >
                {t("share_on_x", { defaultValue: "Share it on X!" })}
              </button>
            </div> 
          </div>
        )}

        {(connectionStep === 'initial' || !walletAddress) && (
          <footer className={styles.footer}>
              Once connected, your account will be linked to your CodeStats user.
          </footer>
        )}
      </div>
    </main>
  );
}

export default DashboardView;
