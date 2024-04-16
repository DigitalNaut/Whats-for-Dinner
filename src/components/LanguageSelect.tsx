import { type ChangeEventHandler, useEffect } from "react";

import { useLanguageContext } from "src/contexts/LanguageContext";
import { useUserSettingsContext } from "src/contexts/UserSettingsContext";

export default function LanguageSelect() {
  const { languages, i18n } = useLanguageContext();
  const { userSettings, setUserSetting } = useUserSettingsContext();

  useEffect(() => {
    i18n.changeLanguage(userSettings.preferredLanguage);
  }, [i18n, userSettings.preferredLanguage]);

  const onClickLanguageChange: ChangeEventHandler<HTMLSelectElement> = (
    event,
  ) => {
    const language = event.target.value;
    i18n.changeLanguage(language); //change the language
    setUserSetting({ preferredLanguage: language });
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
