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
            Dashboard
          </h1>
          <p className={styles.subtitle}>Register your stats and earn tokens!</p>
        
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
                      {t("username_label", { defaultValue: "CodeStats Username" })} *
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t("username_placeholder", { defaultValue: "Enter your username" })}
                      className={styles.input}
                      required
                    />
                  </div>

            

                  <div className={styles.apiHint}>
                    <p className={styles.hintText}>
                      {t("api_hint", {
                        defaultValue: "You can find your API key in your CodeStats account settings."
                      })}
                    </p>
                  </div>

              <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={styles.cancelButton}
                    >
                      {t("cancel", { defaultValue: "Cancel" })}
                    </button>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={!username.trim()}
                    >
                      {t("connect", { defaultValue: "Connect" })}
                    </button>
              </div>
            </form>

                  <footer className={styles.formFooter}>
                    <p className={styles.securityNote}>
                      {t("security_note", {
                        defaultValue: "Your credentials are stored securely and used only to access your public statistics."
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
                    {t("languages_title", { defaultValue: "Most Used Languages" })}
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
              Once connected, your account will be linked to your CodeStats user.
          </footer>
        )}
      </div>
    </main>
  );
}

export default DashboardView;
