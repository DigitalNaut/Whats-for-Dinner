import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";

type SpinnerProps = {
  text?: string;
  cover?: true;
};

export default function Spinner({ text, cover }: SpinnerProps) {
  const { t } = useLanguageContext();

  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-2",
        cover && "flex h-full items-center justify-center",
      )}
    >
      <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
      {text ?? t("Loading...")}
    </div>
  );
}
