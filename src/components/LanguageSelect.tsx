import { type ChangeEventHandler, useEffect, useCallback } from "react";

import { useLanguageContext } from "src/hooks/useLanguageContext";
import { useUserSettingsContext } from "src/hooks/useUserSettingsContext";

export default function LanguageSelect() {
  const { languages, i18n } = useLanguageContext();
  const { userSettings, setUserSetting } = useUserSettingsContext();

  const setLanguage = useCallback(
    (language: string) => {
      document.documentElement.lang = language;
      void i18n.changeLanguage(language);
    },
    [i18n],
  );

  useEffect(() => {
    setLanguage(userSettings.preferredLanguage);
  }, [i18n, setLanguage, userSettings.preferredLanguage]);

  const onClickLanguageChange: ChangeEventHandler<HTMLSelectElement> = (
    event,
  ) => {
    const preferredLanguage = event.target.value;
    setLanguage(preferredLanguage);
    setUserSetting({ preferredLanguage });
  };

  return (
    <select
      className="h-fit w-max rounded-md text-xs text-slate-900"
      onChange={onClickLanguageChange}
      defaultValue={i18n.language}
    >
      {Object.entries(languages).map(([lang, { nativeName }]) => (
        <option key={nativeName} value={lang}>
          {nativeName}
        </option>
      ))}
    </select>
  );
}
