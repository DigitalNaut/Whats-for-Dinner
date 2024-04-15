import { useLanguageContext } from "src/contexts/LanguageContext";

export default function LanguageSelect() {
  const { languages, onClickLanguageChange, i18n } = useLanguageContext();

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
