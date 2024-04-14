import { useLanguageContext } from "src/contexts/LanguageContext";

export default function LanguageSelect() {
  const { languages, onClickLanguageChange, i18n } = useLanguageContext();

  return (
    <select
      className="absolute left-2 top-2 h-10 w-max text-slate-900"
      onChange={onClickLanguageChange}
    >
      {Object.entries(languages).map(([lang, { nativeName }]) => (
        <option key={nativeName} value={lang} selected={i18n.language === lang}>
          {nativeName}
        </option>
      ))}
    </select>
  );
}
