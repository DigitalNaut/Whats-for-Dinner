import { useTranslation } from "react-i18next";

import { languages } from ".";

export type Languages = Record<string, { nativeName: string }>;

export type LanguageContext = {
  t: (key: string) => string;
  i18n: ReturnType<typeof useTranslation>["i18n"];
  languages: typeof languages;
};
