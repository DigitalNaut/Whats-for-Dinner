import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import { useLanguageContext } from "src/contexts/LanguageContext";
import { twMerge } from "tailwind-merge";

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
      <FontAwesomeIcon icon={faChevronLeft} /> <span>{t("Back")}</span>
    </button>
  );
}
