"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import DashInfo from "@/entities/Dashboard/components/DashList";
import { useConnection } from "@/contexts/ConnectionContext";
import styles from "./Dashboard.module.css";

function DashboardView() {
  const { t } = useTranslation();
  const { 
    connectionStep, 
    setConnectionStep, 
    connect,
    username,
    setUsername 
  } = useConnection();

  const handleConnect = () => {
    setConnectionStep('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
    }
  };

  const handleCancel = () => {
    setConnectionStep('initial');
    setUsername('');
  };

  const handleShare = () => {
    // TODO: Integrate share action (X/Twitter API or navigator.share)
    console.log("Shared on X!");
  };

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            DevRank
          </h1>
        
        </header>

        {connectionStep === 'initial' && (
          <button
            type="button"
            onClick={handleConnect}
            className={styles.connectButton}
          >
            {t("connect_codestats_cta", { defaultValue: "Connect CodeStats" })}
          </button>
        )}

        {connectionStep === 'form' && (
          <div className={styles.connectionForm}>
            

            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>
                  {t("username_label", { defaultValue: "Nome de usuário CodeStats" })} *
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("username_placeholder", { defaultValue: "Digite seu nome de usuário" })}
                  className={styles.input}
                  required
                />
              </div>

            

              <div className={styles.apiHint}>
                <p className={styles.hintText}>
                  {t("api_hint", {
                    defaultValue: "Você pode encontrar sua chave da API nas configurações da sua conta CodeStats."
                  })}
                </p>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  {t("cancel", { defaultValue: "Cancelar" })}
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!username.trim()}
                >
                  {t("connect", { defaultValue: "Conectar" })}
                </button>
              </div>
            </form>

            <footer className={styles.formFooter}>
              <p className={styles.securityNote}>
                {t("security_note", {
                  defaultValue: "Suas credenciais são armazenadas de forma segura e usadas apenas para acessar suas estatísticas públicas."
                })}
              </p>
            </footer>
          </div>
        )}

        {connectionStep === 'connected' && (
          <div className={styles.detailsWrapper}>
            <DashInfo />
{/* 
            <div className={styles.languagesCard}>
              <h2 className={styles.languagesTitle}>
                {t("languages_title", { defaultValue: "Languages more useful" })}
              </h2>

              <ul className={styles.languageList}>
                <li className={styles.languageItem}>
                  <span className={styles.languageName}>Docker</span>
                  <span className={styles.languageValue}>345 XP</span>
                </li>
                <li className={styles.languageItem}>
                  <span className={styles.languageName}>Rust</span>
                  <span className={styles.languageValue}>200 XP</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={handleShare}
                className={styles.shareButton}
              >
                {t("share_on_x", { defaultValue: "Share it on X!" })}
              </button>
            </div> */}
          </div>
        )}

        {connectionStep !== 'form' && (
          <footer className={styles.footer}>
            {connectionStep === 'initial' 
              ? "*CodeStats é uma API open-source"
              : "*Uma vez conectado, sua conta será vinculada ao seu usuário do CodeStats."
            }
          </footer>
        )}
      </div>
    </main>
  );
}

export default DashboardView;
