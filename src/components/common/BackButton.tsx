import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { useLanguageContext } from "src/hooks/useLanguageContext";

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
      onClick={() => void navigate(-1)}
    >
      <FontAwesomeIcon icon={faChevronLeft} /> <span>{t("Back")}</span>
    </button>
  );
}
