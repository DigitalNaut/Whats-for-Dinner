import { createContext, useContext } from "react";

import type { Languages, LanguageContext } from "./types";

export const languages: Languages = {
  en: { nativeName: "English" },
  es: { nativeName: "Español" },
};

const LanguageContext = createContext<LanguageContext | null>(null);

export const LanguageContextProvider = LanguageContext.Provider;

export function useLanguageContext() {
  const context = useContext(LanguageContext);

  if (!context)
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider",
    );

  return context;
}
