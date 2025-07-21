import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/hooks/useLanguageContext";

export default function Spinner({
  text,
  cover,
}: {
  text?: string;
  cover?: true;
}) {
  const { t } = useLanguageContext();

  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-2",
        cover && "flex h-full items-center justify-center",
      )}
    >
      <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      {text ?? t("Loading...")}
    </div>
  );
}
