"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { PaymentButton } from "@/entities/Event/components/PaymentButton";
import Image from "next/image";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];

export function LanguageSetupView() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "pt"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update selected language when i18n language changes
  useEffect(() => {
    setSelectedLanguage(i18n.language || "pt");
  }, [i18n.language]);

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);

    // Aplica a tradução imediatamente
    await changeLanguage(langCode);

    // Salva no localStorage
    localStorage.setItem("i18nextLng", langCode);
  };

  const handleContinue = async () => {
    // Simular um loading
    setIsLoading(true);

    try {
      // Esperar um pouco para simular uma ação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Go to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho com logo */}
      <div className="p-6 flex justify-center">
        <Image
          src="/retix-icon.png"
          alt="Retix Logo"
          width={120}
          height={40}
          priority
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-2 text-center">
          {t("languageSetup.welcome")}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {t("languageSetup.selectLanguage")}
        </p>

        <div className="space-y-4 mb-8 mt-6">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                selectedLanguage === language.code
                  ? "border-primary"
                  : "border-gray-200"
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-3">{language.flag}</span>
                  <span className="text-lg">
                    {t(`language.${language.code}`)}
                  </span>
                </span>
                {selectedLanguage === language.code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão fixo na parte inferior */}
      <div className="p-4 border-t bg-white">
        <PaymentButton
          onClick={handleContinue}
          loading={isLoading}
          text={t("languageSetup.continue")}
          bgColor="#8338EC"
          disabled={false}
        />
      </div>
    </div>
  );
}
