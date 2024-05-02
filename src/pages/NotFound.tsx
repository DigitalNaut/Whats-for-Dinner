import { Link } from "react-router-dom";

import { useLanguageContext } from "src/contexts/LanguageContext";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";

export default function NotFound() {
  const { t } = useLanguageContext();

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-6xl">404</h2>
      <h3 className="text-2xl">{t("Page not found")}</h3>
      <Link className="m-auto flex items-center gap-1 underline" to="/">
        <FontAwesomeIcon className="fa-chevron-left" />
        {t("Back to home")}
      </Link>
    </div>
  );
}
