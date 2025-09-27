"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { PaymentButton } from "@/entities/Event/components/PaymentButton";
import { motion, AnimatePresence } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  // { code: "ja", name: "Japanese", flag: "🇯🇵" },
  // { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
];

const itemVariants = {
  tap: {
    scale: 0.92,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

export function LanguageSettingsView() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { triggerImpact } = useHapticFeedback();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "pt"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [languageChanged, setLanguageChanged] = useState(false);

  // Update selected language when i18n language changes
  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = async (langCode: string) => {
    triggerImpact("light");
    setSelectedLanguage(langCode);
    setLanguageChanged(i18n.language !== langCode);

    // Aplica a tradução imediatamente
    await changeLanguage(langCode);

    // Salva no localStorage
    localStorage.setItem("i18nextLng", langCode);
  };

  const handleSave = async () => {
    // Simular um loading
    setIsLoading(true);
    triggerImpact("medium");

    try {
      // Esperar um pouco para simular uma ação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Go back to profile
      router.push("/profile");
    } catch (error) {
      console.error("Error saving language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-6 pb-24">
      <div className="flex items-center mb-2">
        <BackButton onClick={() => router.push("/profile")} />
      </div>
      <h1 className="text-2xl font-bold mb-4">{t("language.title")}</h1>

      <div className="space-y-4">
        <AnimatePresence>
          {languages.map((language) => (
            <motion.div
              key={language.code}
              variants={itemVariants}
              whileTap="tap"
              layout
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedLanguage === language.code
                  ? "border-primary bg-purple-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <motion.div className="flex items-center justify-between" layout>
                <span className="flex items-center">
                  <span className="text-2xl mr-3">{language.flag}</span>
                  <span className="text-lg">
                    {t(`language.${language.code}`, language.name)}
                  </span>
                </span>
                {selectedLanguage === language.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <PaymentButton
          onClick={handleSave}
          loading={isLoading}
          text={t("language.save")}
          bgColor="#8338EC"
        />
      </div>
    </div>
  );
}
