import { type PropsWithChildren, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";

type Languages = Record<string, { nativeName: string }>;

const languages: Languages = {
  en: { nativeName: "English" },
  es: { nativeName: "Español" },
};

type LanguageContext = {
  t: (key: string) => string;
  i18n: ReturnType<typeof useTranslation>["i18n"];
  languages: typeof languages;
};

export const LanguageContext = createContext<LanguageContext | null>(null);

export function LanguageContextProvider({ children }: PropsWithChildren) {
  const { t, i18n } = useTranslation();

  return (
    <LanguageContext.Provider value={{ t, i18n, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);

  if (!context)
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider",
    );

  return context;
}
