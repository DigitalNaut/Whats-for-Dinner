import { type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { LanguageContextProvider, languages } from ".";

export function LanguageProvider({ children }: PropsWithChildren) {
  const { t, i18n } = useTranslation();

  return (
    <LanguageContextProvider value={{ t, i18n, languages }}>
      {children}
    </LanguageContextProvider>
  );
}
