import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";

type Props = {
  className?: string;
};

export default function BackButton({ className }: Props) {
  const navigate = useNavigate();
  const { t } = useLanguageContext();

  return (
    <button
      className={twMerge(
        "flex items-center gap-2 text-left hover:underline",
        className,
      )}
      aria-label={t("Back")}
      onClick={() => navigate(-1)}
    >
      <FontAwesomeIcon className="fa-chevron-left" /> <span>{t("Back")}</span>
    </button>
  );
}
